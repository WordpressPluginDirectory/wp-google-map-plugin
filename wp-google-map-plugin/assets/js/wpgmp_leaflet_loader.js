(function () {
  // Get current script element (self)
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  // Parse query string from script src
  function getQueryParam(name, src) {
    const query = src.split('?')[1] || '';
    const params = new URLSearchParams(query);
    return params.get(name);
  }

  const callback = getQueryParam('callback', currentScript.src);

  // Wait until DOM is ready, then call the callback
  function runCallback() {
    if (callback && typeof window[callback] === 'function') {
      window[callback](); // Initialize Leaflet map
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runCallback);
  } else {
    runCallback();
  }
})();
