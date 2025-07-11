/*
 * This combined file was created by the DataTables downloader builder:
 *   https://datatables.net/download
 *
 * To rebuild or modify this file with the latest versions of the included
 * software please visit:
 *   https://datatables.net/download/#dt/dt-2.2.2
 *
 * Included libraries:
 *   DataTables 2.2.2
 */

/*! DataTables 2.2.2
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ) {
	"use strict";

	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		// jQuery's factory checks for a global window - if it isn't present then it
		// returns a factory function that expects the window object
		var jq = require('jquery');

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				return factory( $, root, root.document );
			};
		}
		else {
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		window.DataTable = factory( jQuery, window, document );
	}
}(function( $, window, document ) {
	"use strict";

	
	var DataTable = function ( selector, options )
	{
		// Check if called with a window or jQuery object for DOM less applications
		// This is for backwards compatibility
		if (DataTable.factory(selector, options)) {
			return DataTable;
		}
	
		// When creating with `new`, create a new DataTable, returning the API instance
		if (this instanceof DataTable) {
			return $(selector).DataTable(options);
		}
		else {
			// Argument switching
			options = selector;
		}
	
		var _that = this;
		var emptyInit = options === undefined;
		var len = this.length;
	
		if ( emptyInit ) {
			options = {};
		}
	
		// Method to get DT API instance from jQuery object
		this.api = function ()
		{
			return new _Api( this );
		};
	
		this.each(function() {
			// For each initialisation we want to give it a clean initialisation
			// object that can be bashed around
			var o = {};
			var oInit = len > 1 ? // optimisation for single table case
				_fnExtend( o, options, true ) :
				options;
	
			
			var i=0, iLen;
			var sId = this.getAttribute( 'id' );
			var defaults = DataTable.defaults;
			var $this = $(this);
			
			
			/* Sanity check */
			if ( this.nodeName.toLowerCase() != 'table' )
			{
				_fnLog( null, 0, 'Non-table node initialisation ('+this.nodeName+')', 2 );
				return;
			}
			
			$(this).trigger( 'options.dt', oInit );
			
			/* Backwards compatibility for the defaults */
			_fnCompatOpts( defaults );
			_fnCompatCols( defaults.column );
			
			/* Convert the camel-case defaults to Hungarian */
			_fnCamelToHungarian( defaults, defaults, true );
			_fnCamelToHungarian( defaults.column, defaults.column, true );
			
			/* Setting up the initialisation object */
			_fnCamelToHungarian( defaults, $.extend( oInit, $this.data() ), true );
			
			
			
			/* Check to see if we are re-initialising a table */
			var allSettings = DataTable.settings;
			for ( i=0, iLen=allSettings.length ; i<iLen ; i++ )
			{
				var s = allSettings[i];
			
				/* Base check on table node */
				if (
					s.nTable == this ||
					(s.nTHead && s.nTHead.parentNode == this) ||
					(s.nTFoot && s.nTFoot.parentNode == this)
				) {
					var bRetrieve = oInit.bRetrieve !== undefined ? oInit.bRetrieve : defaults.bRetrieve;
					var bDestroy = oInit.bDestroy !== undefined ? oInit.bDestroy : defaults.bDestroy;
			
					if ( emptyInit || bRetrieve )
					{
						return s.oInstance;
					}
					else if ( bDestroy )
					{
						new DataTable.Api(s).destroy();
						break;
					}
					else
					{
						_fnLog( s, 0, 'Cannot reinitialise DataTable', 3 );
						return;
					}
				}
			
				/* If the element we are initialising has the same ID as a table which was previously
				 * initialised, but the table nodes don't match (from before) then we destroy the old
				 * instance by simply deleting it. This is under the assumption that the table has been
				 * destroyed by other methods. Anyone using non-id selectors will need to do this manually
				 */
				if ( s.sTableId == this.id )
				{
					allSettings.splice( i, 1 );
					break;
				}
			}
			
			/* Ensure the table has an ID - required for accessibility */
			if ( sId === null || sId === "" )
			{
				sId = "DataTables_Table_"+(DataTable.ext._unique++);
				this.id = sId;
			}
			
			/* Create the settings object for this table and set some of the default parameters */
			var oSettings = $.extend( true, {}, DataTable.models.oSettings, {
				"sDestroyWidth": $this[0].style.width,
				"sInstance":     sId,
				"sTableId":      sId,
				colgroup: $('<colgroup>').prependTo(this),
				fastData: function (row, column, type) {
					return _fnGetCellData(oSettings, row, column, type);
				}
			} );
			oSettings.nTable = this;
			oSettings.oInit  = oInit;
			
			allSettings.push( oSettings );
			
			// Make a single API instance available for internal handling
			oSettings.api = new _Api( oSettings );
			
			// Need to add the instance after the instance after the settings object has been added
			// to the settings array, so we can self reference the table instance if more than one
			oSettings.oInstance = (_that.length===1) ? _that : $this.dataTable();
			
			// Backwards compatibility, before we apply all the defaults
			_fnCompatOpts( oInit );
			
			// If the length menu is given, but the init display length is not, use the length menu
			if ( oInit.aLengthMenu && ! oInit.iDisplayLength )
			{
				oInit.iDisplayLength = Array.isArray(oInit.aLengthMenu[0])
					? oInit.aLengthMenu[0][0]
					: $.isPlainObject( oInit.aLengthMenu[0] )
						? oInit.aLengthMenu[0].value
						: oInit.aLengthMenu[0];
			}
			
			// Apply the defaults and init options to make a single init object will all
			// options defined from defaults and instance options.
			oInit = _fnExtend( $.extend( true, {}, defaults ), oInit );
			
			
			// Map the initialisation options onto the settings object
			_fnMap( oSettings.oFeatures, oInit, [
				"bPaginate",
				"bLengthChange",
				"bFilter",
				"bSort",
				"bSortMulti",
				"bInfo",
				"bProcessing",
				"bAutoWidth",
				"bSortClasses",
				"bServerSide",
				"bDeferRender"
			] );
			_fnMap( oSettings, oInit, [
				"ajax",
				"fnFormatNumber",
				"sServerMethod",
				"aaSorting",
				"aaSortingFixed",
				"aLengthMenu",
				"sPaginationType",
				"iStateDuration",
				"bSortCellsTop",
				"iTabIndex",
				"sDom",
				"fnStateLoadCallback",
				"fnStateSaveCallback",
				"renderer",
				"searchDelay",
				"rowId",
				"caption",
				"layout",
				"orderDescReverse",
				"typeDetect",
				[ "iCookieDuration", "iStateDuration" ], // backwards compat
				[ "oSearch", "oPreviousSearch" ],
				[ "aoSearchCols", "aoPreSearchCols" ],
				[ "iDisplayLength", "_iDisplayLength" ]
			] );
			_fnMap( oSettings.oScroll, oInit, [
				[ "sScrollX", "sX" ],
				[ "sScrollXInner", "sXInner" ],
				[ "sScrollY", "sY" ],
				[ "bScrollCollapse", "bCollapse" ]
			] );
			_fnMap( oSettings.oLanguage, oInit, "fnInfoCallback" );
			
			/* Callback functions which are array driven */
			_fnCallbackReg( oSettings, 'aoDrawCallback',       oInit.fnDrawCallback );
			_fnCallbackReg( oSettings, 'aoStateSaveParams',    oInit.fnStateSaveParams );
			_fnCallbackReg( oSettings, 'aoStateLoadParams',    oInit.fnStateLoadParams );
			_fnCallbackReg( oSettings, 'aoStateLoaded',        oInit.fnStateLoaded );
			_fnCallbackReg( oSettings, 'aoRowCallback',        oInit.fnRowCallback );
			_fnCallbackReg( oSettings, 'aoRowCreatedCallback', oInit.fnCreatedRow );
			_fnCallbackReg( oSettings, 'aoHeaderCallback',     oInit.fnHeaderCallback );
			_fnCallbackReg( oSettings, 'aoFooterCallback',     oInit.fnFooterCallback );
			_fnCallbackReg( oSettings, 'aoInitComplete',       oInit.fnInitComplete );
			_fnCallbackReg( oSettings, 'aoPreDrawCallback',    oInit.fnPreDrawCallback );
			
			oSettings.rowIdFn = _fnGetObjectDataFn( oInit.rowId );
			
			/* Browser support detection */
			_fnBrowserDetect( oSettings );
			
			var oClasses = oSettings.oClasses;
			
			$.extend( oClasses, DataTable.ext.classes, oInit.oClasses );
			$this.addClass( oClasses.table );
			
			if (! oSettings.oFeatures.bPaginate) {
				oInit.iDisplayStart = 0;
			}
			
			if ( oSettings.iInitDisplayStart === undefined )
			{
				/* Display start point, taking into account the save saving */
				oSettings.iInitDisplayStart = oInit.iDisplayStart;
				oSettings._iDisplayStart = oInit.iDisplayStart;
			}
			
			var defer = oInit.iDeferLoading;
			if ( defer !== null )
			{
				oSettings.deferLoading = true;
			
				var tmp = Array.isArray(defer);
				oSettings._iRecordsDisplay = tmp ? defer[0] : defer;
				oSettings._iRecordsTotal = tmp ? defer[1] : defer;
			}
			
			/*
			 * Columns
			 * See if we should load columns automatically or use defined ones
			 */
			var columnsInit = [];
			var thead = this.getElementsByTagName('thead');
			var initHeaderLayout = _fnDetectHeader( oSettings, thead[0] );
			
			// If we don't have a columns array, then generate one with nulls
			if ( oInit.aoColumns ) {
				columnsInit = oInit.aoColumns;
			}
			else if ( initHeaderLayout.length ) {
				for ( i=0, iLen=initHeaderLayout[0].length ; i<iLen ; i++ ) {
					columnsInit.push( null );
				}
			}
			
			// Add the columns
			for ( i=0, iLen=columnsInit.length ; i<iLen ; i++ ) {
				_fnAddColumn( oSettings );
			}
			
			// Apply the column definitions
			_fnApplyColumnDefs( oSettings, oInit.aoColumnDefs, columnsInit, initHeaderLayout, function (iCol, oDef) {
				_fnColumnOptions( oSettings, iCol, oDef );
			} );
			
			/* HTML5 attribute detection - build an mData object automatically if the
			 * attributes are found
			 */
			var rowOne = $this.children('tbody').find('tr').eq(0);
			
			if ( rowOne.length ) {
				var a = function ( cell, name ) {
					return cell.getAttribute( 'data-'+name ) !== null ? name : null;
				};
			
				$( rowOne[0] ).children('th, td').each( function (i, cell) {
					var col = oSettings.aoColumns[i];
			
					if (! col) {
						_fnLog( oSettings, 0, 'Incorrect column count', 18 );
					}
			
					if ( col.mData === i ) {
						var sort = a( cell, 'sort' ) || a( cell, 'order' );
						var filter = a( cell, 'filter' ) || a( cell, 'search' );
			
						if ( sort !== null || filter !== null ) {
							col.mData = {
								_:      i+'.display',
								sort:   sort !== null   ? i+'.@data-'+sort   : undefined,
								type:   sort !== null   ? i+'.@data-'+sort   : undefined,
								filter: filter !== null ? i+'.@data-'+filter : undefined
							};
							col._isArrayHost = true;
			
							_fnColumnOptions( oSettings, i );
						}
					}
				} );
			}
			
			// Must be done after everything which can be overridden by the state saving!
			_fnCallbackReg( oSettings, 'aoDrawCallback', _fnSaveState );
			
			var features = oSettings.oFeatures;
			if ( oInit.bStateSave )
			{
				features.bStateSave = true;
			}
			
			// If aaSorting is not defined, then we use the first indicator in asSorting
			// in case that has been altered, so the default sort reflects that option
			if ( oInit.aaSorting === undefined ) {
				var sorting = oSettings.aaSorting;
				for ( i=0, iLen=sorting.length ; i<iLen ; i++ ) {
					sorting[i][1] = oSettings.aoColumns[ i ].asSorting[0];
				}
			}
			
			// Do a first pass on the sorting classes (allows any size changes to be taken into
			// account, and also will apply sorting disabled classes if disabled
			_fnSortingClasses( oSettings );
			
			_fnCallbackReg( oSettings, 'aoDrawCallback', function () {
				if ( oSettings.bSorted || _fnDataSource( oSettings ) === 'ssp' || features.bDeferRender ) {
					_fnSortingClasses( oSettings );
				}
			} );
			
			
			/*
			 * Table HTML init
			 * Cache the header, body and footer as required, creating them if needed
			 */
			var caption = $this.children('caption');
			
			if ( oSettings.caption ) {
				if ( caption.length === 0 ) {
					caption = $('<caption/>').appendTo( $this );
				}
			
				caption.html( oSettings.caption );
			}
			
			// Store the caption side, so we can remove the element from the document
			// when creating the element
			if (caption.length) {
				caption[0]._captionSide = caption.css('caption-side');
				oSettings.captionNode = caption[0];
			}
			
			if ( thead.length === 0 ) {
				thead = $('<thead/>').appendTo($this);
			}
			oSettings.nTHead = thead[0];
			
			var tbody = $this.children('tbody');
			if ( tbody.length === 0 ) {
				tbody = $('<tbody/>').insertAfter(thead);
			}
			oSettings.nTBody = tbody[0];
			
			var tfoot = $this.children('tfoot');
			if ( tfoot.length === 0 ) {
				// If we are a scrolling table, and no footer has been given, then we need to create
				// a tfoot element for the caption element to be appended to
				tfoot = $('<tfoot/>').appendTo($this);
			}
			oSettings.nTFoot = tfoot[0];
			
			// Copy the data index array
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			
			// Initialisation complete - table can be drawn
			oSettings.bInitialised = true;
			
			// Language definitions
			var oLanguage = oSettings.oLanguage;
			$.extend( true, oLanguage, oInit.oLanguage );
			
			if ( oLanguage.sUrl ) {
				// Get the language definitions from a file
				$.ajax( {
					dataType: 'json',
					url: oLanguage.sUrl,
					success: function ( json ) {
						_fnCamelToHungarian( defaults.oLanguage, json );
						$.extend( true, oLanguage, json, oSettings.oInit.oLanguage );
			
						_fnCallbackFire( oSettings, null, 'i18n', [oSettings], true);
						_fnInitialise( oSettings );
					},
					error: function () {
						// Error occurred loading language file
						_fnLog( oSettings, 0, 'i18n file loading error', 21 );
			
						// Continue on as best we can
						_fnInitialise( oSettings );
					}
				} );
			}
			else {
				_fnCallbackFire( oSettings, null, 'i18n', [oSettings], true);
				_fnInitialise( oSettings );
			}
		} );
		_that = null;
		return this;
	};
	
	
	
	/**
	 * DataTables extensions
	 * 
	 * This namespace acts as a collection area for plug-ins that can be used to
	 * extend DataTables capabilities. Indeed many of the build in methods
	 * use this method to provide their own capabilities (sorting methods for
	 * example).
	 *
	 * Note that this namespace is aliased to `jQuery.fn.dataTableExt` for legacy
	 * reasons
	 *
	 *  @namespace
	 */
	DataTable.ext = _ext = {
		/**
		 * Buttons. For use with the Buttons extension for DataTables. This is
		 * defined here so other extensions can define buttons regardless of load
		 * order. It is _not_ used by DataTables core.
		 *
		 *  @type object
		 *  @default {}
		 */
		buttons: {},
	
	
		/**
		 * Element class names
		 *
		 *  @type object
		 *  @default {}
		 */
		classes: {},
	
	
		/**
		 * DataTables build type (expanded by the download builder)
		 *
		 *  @type string
		 */
		builder: "dt/dt-2.2.2",
	
	
		/**
		 * Error reporting.
		 * 
		 * How should DataTables report an error. Can take the value 'alert',
		 * 'throw', 'none' or a function.
		 *
		 *  @type string|function
		 *  @default alert
		 */
		errMode: "alert",
	
	
		/**
		 * Legacy so v1 plug-ins don't throw js errors on load
		 */
		feature: [],
	
		/**
		 * Feature plug-ins.
		 * 
		 * This is an object of callbacks which provide the features for DataTables
		 * to be initialised via the `layout` option.
		 */
		features: {},
	
	
		/**
		 * Row searching.
		 * 
		 * This method of searching is complimentary to the default type based
		 * searching, and a lot more comprehensive as it allows you complete control
		 * over the searching logic. Each element in this array is a function
		 * (parameters described below) that is called for every row in the table,
		 * and your logic decides if it should be included in the searching data set
		 * or not.
		 *
		 * Searching functions have the following input parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 * 2. `{array|object}` Data for the row to be processed (same as the
		 *    original format that was passed in as the data source, or an array
		 *    from a DOM data source
		 * 3. `{int}` Row index ({@link DataTable.models.oSettings.aoData}), which
		 *    can be useful to retrieve the `TR` element if you need DOM interaction.
		 *
		 * And the following return is expected:
		 *
		 * * {boolean} Include the row in the searched result set (true) or not
		 *   (false)
		 *
		 * Note that as with the main search ability in DataTables, technically this
		 * is "filtering", since it is subtractive. However, for consistency in
		 * naming we call it searching here.
		 *
		 *  @type array
		 *  @default []
		 *
		 *  @example
		 *    // The following example shows custom search being applied to the
		 *    // fourth column (i.e. the data[3] index) based on two input values
		 *    // from the end-user, matching the data in a certain range.
		 *    $.fn.dataTable.ext.search.push(
		 *      function( settings, data, dataIndex ) {
		 *        var min = document.getElementById('min').value * 1;
		 *        var max = document.getElementById('max').value * 1;
		 *        var version = data[3] == "-" ? 0 : data[3]*1;
		 *
		 *        if ( min == "" && max == "" ) {
		 *          return true;
		 *        }
		 *        else if ( min == "" && version < max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && "" == max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && version < max ) {
		 *          return true;
		 *        }
		 *        return false;
		 *      }
		 *    );
		 */
		search: [],
	
	
		/**
		 * Selector extensions
		 *
		 * The `selector` option can be used to extend the options available for the
		 * selector modifier options (`selector-modifier` object data type) that
		 * each of the three built in selector types offer (row, column and cell +
		 * their plural counterparts). For example the Select extension uses this
		 * mechanism to provide an option to select only rows, columns and cells
		 * that have been marked as selected by the end user (`{selected: true}`),
		 * which can be used in conjunction with the existing built in selector
		 * options.
		 *
		 * Each property is an array to which functions can be pushed. The functions
		 * take three attributes:
		 *
		 * * Settings object for the host table
		 * * Options object (`selector-modifier` object type)
		 * * Array of selected item indexes
		 *
		 * The return is an array of the resulting item indexes after the custom
		 * selector has been applied.
		 *
		 *  @type object
		 */
		selector: {
			cell: [],
			column: [],
			row: []
		},
	
	
		/**
		 * Legacy configuration options. Enable and disable legacy options that
		 * are available in DataTables.
		 *
		 *  @type object
		 */
		legacy: {
			/**
			 * Enable / disable DataTables 1.9 compatible server-side processing
			 * requests
			 *
			 *  @type boolean
			 *  @default null
			 */
			ajax: null
		},
	
	
		/**
		 * Pagination plug-in methods.
		 * 
		 * Each entry in this object is a function and defines which buttons should
		 * be shown by the pagination rendering method that is used for the table:
		 * {@link DataTable.ext.renderer.pageButton}. The renderer addresses how the
		 * buttons are displayed in the document, while the functions here tell it
		 * what buttons to display. This is done by returning an array of button
		 * descriptions (what each button will do).
		 *
		 * Pagination types (the four built in options and any additional plug-in
		 * options defined here) can be used through the `paginationType`
		 * initialisation parameter.
		 *
		 * The functions defined take two parameters:
		 *
		 * 1. `{int} page` The current page index
		 * 2. `{int} pages` The number of pages in the table
		 *
		 * Each function is expected to return an array where each element of the
		 * array can be one of:
		 *
		 * * `first` - Jump to first page when activated
		 * * `last` - Jump to last page when activated
		 * * `previous` - Show previous page when activated
		 * * `next` - Show next page when activated
		 * * `{int}` - Show page of the index given
		 * * `{array}` - A nested array containing the above elements to add a
		 *   containing 'DIV' element (might be useful for styling).
		 *
		 * Note that DataTables v1.9- used this object slightly differently whereby
		 * an object with two functions would be defined for each plug-in. That
		 * ability is still supported by DataTables 1.10+ to provide backwards
		 * compatibility, but this option of use is now decremented and no longer
		 * documented in DataTables 1.10+.
		 *
		 *  @type object
		 *  @default {}
		 *
		 *  @example
		 *    // Show previous, next and current page buttons only
		 *    $.fn.dataTableExt.oPagination.current = function ( page, pages ) {
		 *      return [ 'previous', page, 'next' ];
		 *    };
		 */
		pager: {},
	
	
		renderer: {
			pageButton: {},
			header: {}
		},
	
	
		/**
		 * Ordering plug-ins - custom data source
		 * 
		 * The extension options for ordering of data available here is complimentary
		 * to the default type based ordering that DataTables typically uses. It
		 * allows much greater control over the the data that is being used to
		 * order a column, but is necessarily therefore more complex.
		 * 
		 * This type of ordering is useful if you want to do ordering based on data
		 * live from the DOM (for example the contents of an 'input' element) rather
		 * than just the static string that DataTables knows of.
		 * 
		 * The way these plug-ins work is that you create an array of the values you
		 * wish to be ordering for the column in question and then return that
		 * array. The data in the array much be in the index order of the rows in
		 * the table (not the currently ordering order!). Which order data gathering
		 * function is run here depends on the `dt-init columns.orderDataType`
		 * parameter that is used for the column (if any).
		 *
		 * The functions defined take two parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 * 2. `{int}` Target column index
		 *
		 * Each function is expected to return an array:
		 *
		 * * `{array}` Data for the column to be ordering upon
		 *
		 *  @type array
		 *
		 *  @example
		 *    // Ordering using `input` node values
		 *    $.fn.dataTable.ext.order['dom-text'] = function  ( settings, col )
		 *    {
		 *      return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
		 *        return $('input', td).val();
		 *      } );
		 *    }
		 */
		order: {},
	
	
		/**
		 * Type based plug-ins.
		 *
		 * Each column in DataTables has a type assigned to it, either by automatic
		 * detection or by direct assignment using the `type` option for the column.
		 * The type of a column will effect how it is ordering and search (plug-ins
		 * can also make use of the column type if required).
		 *
		 * @namespace
		 */
		type: {
			/**
			 * Automatic column class assignment
			 */
			className: {},
	
			/**
			 * Type detection functions.
			 *
			 * The functions defined in this object are used to automatically detect
			 * a column's type, making initialisation of DataTables super easy, even
			 * when complex data is in the table.
			 *
			 * The functions defined take two parameters:
			 *
		     *  1. `{*}` Data from the column cell to be analysed
		     *  2. `{settings}` DataTables settings object. This can be used to
		     *     perform context specific type detection - for example detection
		     *     based on language settings such as using a comma for a decimal
		     *     place. Generally speaking the options from the settings will not
		     *     be required
			 *
			 * Each function is expected to return:
			 *
			 * * `{string|null}` Data type detected, or null if unknown (and thus
			 *   pass it on to the other type detection functions.
			 *
			 *  @type array
			 *
			 *  @example
			 *    // Currency type detection plug-in:
			 *    $.fn.dataTable.ext.type.detect.push(
			 *      function ( data, settings ) {
			 *        // Check the numeric part
			 *        if ( ! data.substring(1).match(/[0-9]/) ) {
			 *          return null;
			 *        }
			 *
			 *        // Check prefixed by currency
			 *        if ( data.charAt(0) == '$' || data.charAt(0) == '&pound;' ) {
			 *          return 'currency';
			 *        }
			 *        return null;
			 *      }
			 *    );
			 */
			detect: [],
	
			/**
			 * Automatic renderer assignment
			 */
			render: {},
	
	
			/**
			 * Type based search formatting.
			 *
			 * The type based searching functions can be used to pre-format the
			 * data to be search on. For example, it can be used to strip HTML
			 * tags or to de-format telephone numbers for numeric only searching.
			 *
			 * Note that is a search is not defined for a column of a given type,
			 * no search formatting will be performed.
			 * 
			 * Pre-processing of searching data plug-ins - When you assign the sType
			 * for a column (or have it automatically detected for you by DataTables
			 * or a type detection plug-in), you will typically be using this for
			 * custom sorting, but it can also be used to provide custom searching
			 * by allowing you to pre-processing the data and returning the data in
			 * the format that should be searched upon. This is done by adding
			 * functions this object with a parameter name which matches the sType
			 * for that target column. This is the corollary of <i>afnSortData</i>
			 * for searching data.
			 *
			 * The functions defined take a single parameter:
			 *
		     *  1. `{*}` Data from the column cell to be prepared for searching
			 *
			 * Each function is expected to return:
			 *
			 * * `{string|null}` Formatted string that will be used for the searching.
			 *
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    $.fn.dataTable.ext.type.search['title-numeric'] = function ( d ) {
			 *      return d.replace(/\n/g," ").replace( /<.*?>/g, "" );
			 *    }
			 */
			search: {},
	
	
			/**
			 * Type based ordering.
			 *
			 * The column type tells DataTables what ordering to apply to the table
			 * when a column is sorted upon. The order for each type that is defined,
			 * is defined by the functions available in this object.
			 *
			 * Each ordering option can be described by three properties added to
			 * this object:
			 *
			 * * `{type}-pre` - Pre-formatting function
			 * * `{type}-asc` - Ascending order function
			 * * `{type}-desc` - Descending order function
			 *
			 * All three can be used together, only `{type}-pre` or only
			 * `{type}-asc` and `{type}-desc` together. It is generally recommended
			 * that only `{type}-pre` is used, as this provides the optimal
			 * implementation in terms of speed, although the others are provided
			 * for compatibility with existing Javascript sort functions.
			 *
			 * `{type}-pre`: Functions defined take a single parameter:
			 *
		     *  1. `{*}` Data from the column cell to be prepared for ordering
			 *
			 * And return:
			 *
			 * * `{*}` Data to be sorted upon
			 *
			 * `{type}-asc` and `{type}-desc`: Functions are typical Javascript sort
			 * functions, taking two parameters:
			 *
		     *  1. `{*}` Data to compare to the second parameter
		     *  2. `{*}` Data to compare to the first parameter
			 *
			 * And returning:
			 *
			 * * `{*}` Ordering match: <0 if first parameter should be sorted lower
			 *   than the second parameter, ===0 if the two parameters are equal and
			 *   >0 if the first parameter should be sorted height than the second
			 *   parameter.
			 * 
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    // Numeric ordering of formatted numbers with a pre-formatter
			 *    $.extend( $.fn.dataTable.ext.type.order, {
			 *      "string-pre": function(x) {
			 *        a = (a === "-" || a === "") ? 0 : a.replace( /[^\d\-\.]/g, "" );
			 *        return parseFloat( a );
			 *      }
			 *    } );
			 *
			 *  @example
			 *    // Case-sensitive string ordering, with no pre-formatting method
			 *    $.extend( $.fn.dataTable.ext.order, {
			 *      "string-case-asc": function(x,y) {
			 *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			 *      },
			 *      "string-case-desc": function(x,y) {
			 *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
			 *      }
			 *    } );
			 */
			order: {}
		},
	
		/**
		 * Unique DataTables instance counter
		 *
		 * @type int
		 * @private
		 */
		_unique: 0,
	
	
		//
		// Depreciated
		// The following properties are retained for backwards compatibility only.
		// The should not be used in new projects and will be removed in a future
		// version
		//
	
		/**
		 * Version check function.
		 *  @type function
		 *  @depreciated Since 1.10
		 */
		fnVersionCheck: DataTable.fnVersionCheck,
	
	
		/**
		 * Index for what 'this' index API functions should use
		 *  @type int
		 *  @deprecated Since v1.10
		 */
		iApiIndex: 0,
	
	
		/**
		 * Software version
		 *  @type string
		 *  @deprecated Since v1.10
		 */
		sVersion: DataTable.version
	};
	
	
	//
	// Backwards compatibility. Alias to pre 1.10 Hungarian notation counter parts
	//
	$.extend( _ext, {
		afnFiltering: _ext.search,
		aTypes:       _ext.type.detect,
		ofnSearch:    _ext.type.search,
		oSort:        _ext.type.order,
		afnSortData:  _ext.order,
		aoFeatures:   _ext.feature,
		oStdClasses:  _ext.classes,
		oPagination:  _ext.pager
	} );
	
	
	$.extend( DataTable.ext.classes, {
		container: 'dt-container',
		empty: {
			row: 'dt-empty'
		},
		info: {
			container: 'dt-info'
		},
		layout: {
			row: 'dt-layout-row',
			cell: 'dt-layout-cell',
			tableRow: 'dt-layout-table',
			tableCell: '',
			start: 'dt-layout-start',
			end: 'dt-layout-end',
			full: 'dt-layout-full'
		},
		length: {
			container: 'dt-length',
			select: 'dt-input'
		},
		order: {
			canAsc: 'dt-orderable-asc',
			canDesc: 'dt-orderable-desc',
			isAsc: 'dt-ordering-asc',
			isDesc: 'dt-ordering-desc',
			none: 'dt-orderable-none',
			position: 'sorting_'
		},
		processing: {
			container: 'dt-processing'
		},
		scrolling: {
			body: 'dt-scroll-body',
			container: 'dt-scroll',
			footer: {
				self: 'dt-scroll-foot',
				inner: 'dt-scroll-footInner'
			},
			header: {
				self: 'dt-scroll-head',
				inner: 'dt-scroll-headInner'
			}
		},
		search: {
			container: 'dt-search',
			input: 'dt-input'
		},
		table: 'dataTable',	
		tbody: {
			cell: '',
			row: ''
		},
		thead: {
			cell: '',
			row: ''
		},
		tfoot: {
			cell: '',
			row: ''
		},
		paging: {
			active: 'current',
			button: 'dt-paging-button',
			container: 'dt-paging',
			disabled: 'disabled',
			nav: ''
		}
	} );
	
	
	/*
	 * It is useful to have variables which are scoped locally so only the
	 * DataTables functions can access them and they don't leak into global space.
	 * At the same time these functions are often useful over multiple files in the
	 * core and API, so we list, or at least document, all variables which are used
	 * by DataTables as private variables here. This also ensures that there is no
	 * clashing of variable names and that they can easily referenced for reuse.
	 */
	
	
	// Defined else where
	//  _selector_run
	//  _selector_opts
	//  _selector_row_indexes
	
	var _ext; // DataTable.ext
	var _Api; // DataTable.Api
	var _api_register; // DataTable.Api.register
	var _api_registerPlural; // DataTable.Api.registerPlural
	
	var _re_dic = {};
	var _re_new_lines = /[\r\n\u2028]/g;
	var _re_html = /<([^>]*>)/g;
	var _max_str_len = Math.pow(2, 28);
	
	// This is not strict ISO8601 - Date.parse() is quite lax, although
	// implementations differ between browsers.
	var _re_date = /^\d{2,4}[./-]\d{1,2}[./-]\d{1,2}([T ]{1}\d{1,2}[:.]\d{2}([.:]\d{2})?)?$/;
	
	// Escape regular expression special characters
	var _re_escape_regex = new RegExp( '(\\' + [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^', '-' ].join('|\\') + ')', 'g' );
	
	// https://en.wikipedia.org/wiki/Foreign_exchange_market
	// - \u20BD - Russian ruble.
	// - \u20a9 - South Korean Won
	// - \u20BA - Turkish Lira
	// - \u20B9 - Indian Rupee
	// - R - Brazil (R$) and South Africa
	// - fr - Swiss Franc
	// - kr - Swedish krona, Norwegian krone and Danish krone
	// - \u2009 is thin space and \u202F is narrow no-break space, both used in many
	// - Ƀ - Bitcoin
	// - Ξ - Ethereum
	//   standards as thousands separators.
	var _re_formatted_numeric = /['\u00A0,$£€¥%\u2009\u202F\u20BD\u20a9\u20BArfkɃΞ]/gi;
	
	
	var _empty = function ( d ) {
		return !d || d === true || d === '-' ? true : false;
	};
	
	
	var _intVal = function ( s ) {
		var integer = parseInt( s, 10 );
		return !isNaN(integer) && isFinite(s) ? integer : null;
	};
	
	// Convert from a formatted number with characters other than `.` as the
	// decimal place, to a Javascript number
	var _numToDecimal = function ( num, decimalPoint ) {
		// Cache created regular expressions for speed as this function is called often
		if ( ! _re_dic[ decimalPoint ] ) {
			_re_dic[ decimalPoint ] = new RegExp( _fnEscapeRegex( decimalPoint ), 'g' );
		}
		return typeof num === 'string' && decimalPoint !== '.' ?
			num.replace( /\./g, '' ).replace( _re_dic[ decimalPoint ], '.' ) :
			num;
	};
	
	
	var _isNumber = function ( d, decimalPoint, formatted, allowEmpty ) {
		var type = typeof d;
		var strType = type === 'string';
	
		if ( type === 'number' || type === 'bigint') {
			return true;
		}
	
		// If empty return immediately so there must be a number if it is a
		// formatted string (this stops the string "k", or "kr", etc being detected
		// as a formatted number for currency
		if ( allowEmpty && _empty( d ) ) {
			return true;
		}
	
		if ( decimalPoint && strType ) {
			d = _numToDecimal( d, decimalPoint );
		}
	
		if ( formatted && strType ) {
			d = d.replace( _re_formatted_numeric, '' );
		}
	
		return !isNaN( parseFloat(d) ) && isFinite( d );
	};
	
	
	// A string without HTML in it can be considered to be HTML still
	var _isHtml = function ( d ) {
		return _empty( d ) || typeof d === 'string';
	};
	
	// Is a string a number surrounded by HTML?
	var _htmlNumeric = function ( d, decimalPoint, formatted, allowEmpty ) {
		if ( allowEmpty && _empty( d ) ) {
			return true;
		}
	
		// input and select strings mean that this isn't just a number
		if (typeof d === 'string' && d.match(/<(input|select)/i)) {
			return null;
		}
	
		var html = _isHtml( d );
		return ! html ?
			null :
			_isNumber( _stripHtml( d ), decimalPoint, formatted, allowEmpty ) ?
				true :
				null;
	};
	
	
	var _pluck = function ( a, prop, prop2 ) {
		var out = [];
		var i=0, ien=a.length;
	
		// Could have the test in the loop for slightly smaller code, but speed
		// is essential here
		if ( prop2 !== undefined ) {
			for ( ; i<ien ; i++ ) {
				if ( a[i] && a[i][ prop ] ) {
					out.push( a[i][ prop ][ prop2 ] );
				}
			}
		}
		else {
			for ( ; i<ien ; i++ ) {
				if ( a[i] ) {
					out.push( a[i][ prop ] );
				}
			}
		}
	
		return out;
	};
	
	
	// Basically the same as _pluck, but rather than looping over `a` we use `order`
	// as the indexes to pick from `a`
	var _pluck_order = function ( a, order, prop, prop2 )
	{
		var out = [];
		var i=0, ien=order.length;
	
		// Could have the test in the loop for slightly smaller code, but speed
		// is essential here
		if ( prop2 !== undefined ) {
			for ( ; i<ien ; i++ ) {
				if ( a[ order[i] ] && a[ order[i] ][ prop ] ) {
					out.push( a[ order[i] ][ prop ][ prop2 ] );
				}
			}
		}
		else {
			for ( ; i<ien ; i++ ) {
				if ( a[ order[i] ] ) {
					out.push( a[ order[i] ][ prop ] );
				}
			}
		}
	
		return out;
	};
	
	
	var _range = function ( len, start )
	{
		var out = [];
		var end;
	
		if ( start === undefined ) {
			start = 0;
			end = len;
		}
		else {
			end = start;
			start = len;
		}
	
		for ( var i=start ; i<end ; i++ ) {
			out.push( i );
		}
	
		return out;
	};
	
	
	var _removeEmpty = function ( a )
	{
		var out = [];
	
		for ( var i=0, ien=a.length ; i<ien ; i++ ) {
			if ( a[i] ) { // careful - will remove all falsy values!
				out.push( a[i] );
			}
		}
	
		return out;
	};
	
	// Replaceable function in api.util
	var _stripHtml = function (input) {
		if (! input || typeof input !== 'string') {
			return input;
		}
	
		// Irrelevant check to workaround CodeQL's false positive on the regex
		if (input.length > _max_str_len) {
			throw new Error('Exceeded max str len');
		}
	
		var previous;
	
		input = input.replace(_re_html, ''); // Complete tags
	
		// Safety for incomplete script tag - use do / while to ensure that
		// we get all instances
		do {
			previous = input;
			input = input.replace(/<script/i, '');
		} while (input !== previous);
	
		return previous;
	};
	
	// Replaceable function in api.util
	var _escapeHtml = function ( d ) {
		if (Array.isArray(d)) {
			d = d.join(',');
		}
	
		return typeof d === 'string' ?
			d
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;') :
			d;
	};
	
	// Remove diacritics from a string by decomposing it and then removing
	// non-ascii characters
	var _normalize = function (str, both) {
		if (typeof str !== 'string') {
			return str;
		}
	
		// It is faster to just run `normalize` than it is to check if
		// we need to with a regex! (Check as it isn't available in old
		// Safari)
		var res = str.normalize
			? str.normalize("NFD")
			: str;
	
		// Equally, here we check if a regex is needed or not
		return res.length !== str.length
			? (both === true ? str + ' ' : '' ) + res.replace(/[\u0300-\u036f]/g, "")
			: res;
	}
	
	/**
	 * Determine if all values in the array are unique. This means we can short
	 * cut the _unique method at the cost of a single loop. A sorted array is used
	 * to easily check the values.
	 *
	 * @param  {array} src Source array
	 * @return {boolean} true if all unique, false otherwise
	 * @ignore
	 */
	var _areAllUnique = function ( src ) {
		if ( src.length < 2 ) {
			return true;
		}
	
		var sorted = src.slice().sort();
		var last = sorted[0];
	
		for ( var i=1, ien=sorted.length ; i<ien ; i++ ) {
			if ( sorted[i] === last ) {
				return false;
			}
	
			last = sorted[i];
		}
	
		return true;
	};
	
	
	/**
	 * Find the unique elements in a source array.
	 *
	 * @param  {array} src Source array
	 * @return {array} Array of unique items
	 * @ignore
	 */
	var _unique = function ( src )
	{
		if (Array.from && Set) {
			return Array.from(new Set(src));
		}
	
		if ( _areAllUnique( src ) ) {
			return src.slice();
		}
	
		// A faster unique method is to use object keys to identify used values,
		// but this doesn't work with arrays or objects, which we must also
		// consider. See jsperf.app/compare-array-unique-versions/4 for more
		// information.
		var
			out = [],
			val,
			i, ien=src.length,
			j, k=0;
	
		again: for ( i=0 ; i<ien ; i++ ) {
			val = src[i];
	
			for ( j=0 ; j<k ; j++ ) {
				if ( out[j] === val ) {
					continue again;
				}
			}
	
			out.push( val );
			k++;
		}
	
		return out;
	};
	
	// Surprisingly this is faster than [].concat.apply
	// https://jsperf.com/flatten-an-array-loop-vs-reduce/2
	var _flatten = function (out, val) {
		if (Array.isArray(val)) {
			for (var i=0 ; i<val.length ; i++) {
				_flatten(out, val[i]);
			}
		}
		else {
			out.push(val);
		}
	
		return out;
	}
	
	// Similar to jQuery's addClass, but use classList.add
	function _addClass(el, name) {
		if (name) {
			name.split(' ').forEach(function (n) {
				if (n) {
					// `add` does deduplication, so no need to check `contains`
					el.classList.add(n);
				}
			});
		}
	}
	
	/**
	 * DataTables utility methods
	 * 
	 * This namespace provides helper methods that DataTables uses internally to
	 * create a DataTable, but which are not exclusively used only for DataTables.
	 * These methods can be used by extension authors to save the duplication of
	 * code.
	 *
	 *  @namespace
	 */
	DataTable.util = {
		/**
		 * Return a string with diacritic characters decomposed
		 * @param {*} mixed Function or string to normalize
		 * @param {*} both Return original string and the normalized string
		 * @returns String or undefined
		 */
		diacritics: function (mixed, both) {
			var type = typeof mixed;
	
			if (type !== 'function') {
				return _normalize(mixed, both);
			}
			_normalize = mixed;
		},
	
		/**
		 * Debounce a function
		 *
		 * @param {function} fn Function to be called
		 * @param {integer} freq Call frequency in mS
		 * @return {function} Wrapped function
		 */
		debounce: function ( fn, timeout ) {
			var timer;
	
			return function () {
				var that = this;
				var args = arguments;
	
				clearTimeout(timer);
	
				timer = setTimeout( function () {
					fn.apply(that, args);
				}, timeout || 250 );
			};
		},
	
		/**
		 * Throttle the calls to a function. Arguments and context are maintained
		 * for the throttled function.
		 *
		 * @param {function} fn Function to be called
		 * @param {integer} freq Call frequency in mS
		 * @return {function} Wrapped function
		 */
		throttle: function ( fn, freq ) {
			var
				frequency = freq !== undefined ? freq : 200,
				last,
				timer;
	
			return function () {
				var
					that = this,
					now  = +new Date(),
					args = arguments;
	
				if ( last && now < last + frequency ) {
					clearTimeout( timer );
	
					timer = setTimeout( function () {
						last = undefined;
						fn.apply( that, args );
					}, frequency );
				}
				else {
					last = now;
					fn.apply( that, args );
				}
			};
		},
	
		/**
		 * Escape a string such that it can be used in a regular expression
		 *
		 *  @param {string} val string to escape
		 *  @returns {string} escaped string
		 */
		escapeRegex: function ( val ) {
			return val.replace( _re_escape_regex, '\\$1' );
		},
	
		/**
		 * Create a function that will write to a nested object or array
		 * @param {*} source JSON notation string
		 * @returns Write function
		 */
		set: function ( source ) {
			if ( $.isPlainObject( source ) ) {
				/* Unlike get, only the underscore (global) option is used for for
				 * setting data since we don't know the type here. This is why an object
				 * option is not documented for `mData` (which is read/write), but it is
				 * for `mRender` which is read only.
				 */
				return DataTable.util.set( source._ );
			}
			else if ( source === null ) {
				// Nothing to do when the data source is null
				return function () {};
			}
			else if ( typeof source === 'function' ) {
				return function (data, val, meta) {
					source( data, 'set', val, meta );
				};
			}
			else if (
				typeof source === 'string' && (source.indexOf('.') !== -1 ||
				source.indexOf('[') !== -1 || source.indexOf('(') !== -1)
			) {
				// Like the get, we need to get data from a nested object
				var setData = function (data, val, src) {
					var a = _fnSplitObjNotation( src ), b;
					var aLast = a[a.length-1];
					var arrayNotation, funcNotation, o, innerSrc;
		
					for ( var i=0, iLen=a.length-1 ; i<iLen ; i++ ) {
						// Protect against prototype pollution
						if (a[i] === '__proto__' || a[i] === 'constructor') {
							throw new Error('Cannot set prototype values');
						}
		
						// Check if we are dealing with an array notation request
						arrayNotation = a[i].match(__reArray);
						funcNotation = a[i].match(__reFn);
		
						if ( arrayNotation ) {
							a[i] = a[i].replace(__reArray, '');
							data[ a[i] ] = [];
		
							// Get the remainder of the nested object to set so we can recurse
							b = a.slice();
							b.splice( 0, i+1 );
							innerSrc = b.join('.');
		
							// Traverse each entry in the array setting the properties requested
							if ( Array.isArray( val ) ) {
								for ( var j=0, jLen=val.length ; j<jLen ; j++ ) {
									o = {};
									setData( o, val[j], innerSrc );
									data[ a[i] ].push( o );
								}
							}
							else {
								// We've been asked to save data to an array, but it
								// isn't array data to be saved. Best that can be done
								// is to just save the value.
								data[ a[i] ] = val;
							}
		
							// The inner call to setData has already traversed through the remainder
							// of the source and has set the data, thus we can exit here
							return;
						}
						else if ( funcNotation ) {
							// Function call
							a[i] = a[i].replace(__reFn, '');
							data = data[ a[i] ]( val );
						}
		
						// If the nested object doesn't currently exist - since we are
						// trying to set the value - create it
						if ( data[ a[i] ] === null || data[ a[i] ] === undefined ) {
							data[ a[i] ] = {};
						}
						data = data[ a[i] ];
					}
		
					// Last item in the input - i.e, the actual set
					if ( aLast.match(__reFn ) ) {
						// Function call
						data = data[ aLast.replace(__reFn, '') ]( val );
					}
					else {
						// If array notation is used, we just want to strip it and use the property name
						// and assign the value. If it isn't used, then we get the result we want anyway
						data[ aLast.replace(__reArray, '') ] = val;
					}
				};
		
				return function (data, val) { // meta is also passed in, but not used
					return setData( data, val, source );
				};
			}
			else {
				// Array or flat object mapping
				return function (data, val) { // meta is also passed in, but not used
					data[source] = val;
				};
			}
		},
	
		/**
		 * Create a function that will read nested objects from arrays, based on JSON notation
		 * @param {*} source JSON notation string
		 * @returns Value read
		 */
		get: function ( source ) {
			if ( $.isPlainObject( source ) ) {
				// Build an object of get functions, and wrap them in a single call
				var o = {};
				$.each( source, function (key, val) {
					if ( val ) {
						o[key] = DataTable.util.get( val );
					}
				} );
		
				return function (data, type, row, meta) {
					var t = o[type] || o._;
					return t !== undefined ?
						t(data, type, row, meta) :
						data;
				};
			}
			else if ( source === null ) {
				// Give an empty string for rendering / sorting etc
				return function (data) { // type, row and meta also passed, but not used
					return data;
				};
			}
			else if ( typeof source === 'function' ) {
				return function (data, type, row, meta) {
					return source( data, type, row, meta );
				};
			}
			else if (
				typeof source === 'string' && (source.indexOf('.') !== -1 ||
				source.indexOf('[') !== -1 || source.indexOf('(') !== -1)
			) {
				/* If there is a . in the source string then the data source is in a
				 * nested object so we loop over the data for each level to get the next
				 * level down. On each loop we test for undefined, and if found immediately
				 * return. This allows entire objects to be missing and sDefaultContent to
				 * be used if defined, rather than throwing an error
				 */
				var fetchData = function (data, type, src) {
					var arrayNotation, funcNotation, out, innerSrc;
		
					if ( src !== "" ) {
						var a = _fnSplitObjNotation( src );
		
						for ( var i=0, iLen=a.length ; i<iLen ; i++ ) {
							// Check if we are dealing with special notation
							arrayNotation = a[i].match(__reArray);
							funcNotation = a[i].match(__reFn);
		
							if ( arrayNotation ) {
								// Array notation
								a[i] = a[i].replace(__reArray, '');
		
								// Condition allows simply [] to be passed in
								if ( a[i] !== "" ) {
									data = data[ a[i] ];
								}
								out = [];
		
								// Get the remainder of the nested object to get
								a.splice( 0, i+1 );
								innerSrc = a.join('.');
		
								// Traverse each entry in the array getting the properties requested
								if ( Array.isArray( data ) ) {
									for ( var j=0, jLen=data.length ; j<jLen ; j++ ) {
										out.push( fetchData( data[j], type, innerSrc ) );
									}
								}
		
								// If a string is given in between the array notation indicators, that
								// is used to join the strings together, otherwise an array is returned
								var join = arrayNotation[0].substring(1, arrayNotation[0].length-1);
								data = (join==="") ? out : out.join(join);
		
								// The inner call to fetchData has already traversed through the remainder
								// of the source requested, so we exit from the loop
								break;
							}
							else if ( funcNotation ) {
								// Function call
								a[i] = a[i].replace(__reFn, '');
								data = data[ a[i] ]();
								continue;
							}
		
							if (data === null || data[ a[i] ] === null) {
								return null;
							}
							else if ( data === undefined || data[ a[i] ] === undefined ) {
								return undefined;
							}
	
							data = data[ a[i] ];
						}
					}
		
					return data;
				};
		
				return function (data, type) { // row and meta also passed, but not used
					return fetchData( data, type, source );
				};
			}
			else {
				// Array or flat object mapping
				return function (data) { // row and meta also passed, but not used
					return data[source];
				};
			}
		},
	
		stripHtml: function (mixed) {
			var type = typeof mixed;
	
			if (type === 'function') {
				_stripHtml = mixed;
				return;
			}
			else if (type === 'string') {
				return _stripHtml(mixed);
			}
			return mixed;
		},
	
		escapeHtml: function (mixed) {
			var type = typeof mixed;
	
			if (type === 'function') {
				_escapeHtml = mixed;
				return;
			}
			else if (type === 'string' || Array.isArray(mixed)) {
				return _escapeHtml(mixed);
			}
			return mixed;
		},
	
		unique: _unique
	};
	
	
	
	/**
	 * Create a mapping object that allows camel case parameters to be looked up
	 * for their Hungarian counterparts. The mapping is stored in a private
	 * parameter called `_hungarianMap` which can be accessed on the source object.
	 *  @param {object} o
	 *  @memberof DataTable#oApi
	 */
	function _fnHungarianMap ( o )
	{
		var
			hungarian = 'a aa ai ao as b fn i m o s ',
			match,
			newKey,
			map = {};
	
		$.each( o, function (key) {
			match = key.match(/^([^A-Z]+?)([A-Z])/);
	
			if ( match && hungarian.indexOf(match[1]+' ') !== -1 )
			{
				newKey = key.replace( match[0], match[2].toLowerCase() );
				map[ newKey ] = key;
	
				if ( match[1] === 'o' )
				{
					_fnHungarianMap( o[key] );
				}
			}
		} );
	
		o._hungarianMap = map;
	}
	
	
	/**
	 * Convert from camel case parameters to Hungarian, based on a Hungarian map
	 * created by _fnHungarianMap.
	 *  @param {object} src The model object which holds all parameters that can be
	 *    mapped.
	 *  @param {object} user The object to convert from camel case to Hungarian.
	 *  @param {boolean} force When set to `true`, properties which already have a
	 *    Hungarian value in the `user` object will be overwritten. Otherwise they
	 *    won't be.
	 *  @memberof DataTable#oApi
	 */
	function _fnCamelToHungarian ( src, user, force )
	{
		if ( ! src._hungarianMap ) {
			_fnHungarianMap( src );
		}
	
		var hungarianKey;
	
		$.each( user, function (key) {
			hungarianKey = src._hungarianMap[ key ];
	
			if ( hungarianKey !== undefined && (force || user[hungarianKey] === undefined) )
			{
				// For objects, we need to buzz down into the object to copy parameters
				if ( hungarianKey.charAt(0) === 'o' )
				{
					// Copy the camelCase options over to the hungarian
					if ( ! user[ hungarianKey ] ) {
						user[ hungarianKey ] = {};
					}
					$.extend( true, user[hungarianKey], user[key] );
	
					_fnCamelToHungarian( src[hungarianKey], user[hungarianKey], force );
				}
				else {
					user[hungarianKey] = user[ key ];
				}
			}
		} );
	}
	
	/**
	 * Map one parameter onto another
	 *  @param {object} o Object to map
	 *  @param {*} knew The new parameter name
	 *  @param {*} old The old parameter name
	 */
	var _fnCompatMap = function ( o, knew, old ) {
		if ( o[ knew ] !== undefined ) {
			o[ old ] = o[ knew ];
		}
	};
	
	
	/**
	 * Provide backwards compatibility for the main DT options. Note that the new
	 * options are mapped onto the old parameters, so this is an external interface
	 * change only.
	 *  @param {object} init Object to map
	 */
	function _fnCompatOpts ( init )
	{
		_fnCompatMap( init, 'ordering',      'bSort' );
		_fnCompatMap( init, 'orderMulti',    'bSortMulti' );
		_fnCompatMap( init, 'orderClasses',  'bSortClasses' );
		_fnCompatMap( init, 'orderCellsTop', 'bSortCellsTop' );
		_fnCompatMap( init, 'order',         'aaSorting' );
		_fnCompatMap( init, 'orderFixed',    'aaSortingFixed' );
		_fnCompatMap( init, 'paging',        'bPaginate' );
		_fnCompatMap( init, 'pagingType',    'sPaginationType' );
		_fnCompatMap( init, 'pageLength',    'iDisplayLength' );
		_fnCompatMap( init, 'searching',     'bFilter' );
	
		// Boolean initialisation of x-scrolling
		if ( typeof init.sScrollX === 'boolean' ) {
			init.sScrollX = init.sScrollX ? '100%' : '';
		}
		if ( typeof init.scrollX === 'boolean' ) {
			init.scrollX = init.scrollX ? '100%' : '';
		}
	
		// Column search objects are in an array, so it needs to be converted
		// element by element
		var searchCols = init.aoSearchCols;
	
		if ( searchCols ) {
			for ( var i=0, ien=searchCols.length ; i<ien ; i++ ) {
				if ( searchCols[i] ) {
					_fnCamelToHungarian( DataTable.models.oSearch, searchCols[i] );
				}
			}
		}
	
		// Enable search delay if server-side processing is enabled
		if (init.serverSide && ! init.searchDelay) {
			init.searchDelay = 400;
		}
	}
	
	
	/**
	 * Provide backwards compatibility for column options. Note that the new options
	 * are mapped onto the old parameters, so this is an external interface change
	 * only.
	 *  @param {object} init Object to map
	 */
	function _fnCompatCols ( init )
	{
		_fnCompatMap( init, 'orderable',     'bSortable' );
		_fnCompatMap( init, 'orderData',     'aDataSort' );
		_fnCompatMap( init, 'orderSequence', 'asSorting' );
		_fnCompatMap( init, 'orderDataType', 'sortDataType' );
	
		// orderData can be given as an integer
		var dataSort = init.aDataSort;
		if ( typeof dataSort === 'number' && ! Array.isArray( dataSort ) ) {
			init.aDataSort = [ dataSort ];
		}
	}
	
	
	/**
	 * Browser feature detection for capabilities, quirks
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnBrowserDetect( settings )
	{
		// We don't need to do this every time DataTables is constructed, the values
		// calculated are specific to the browser and OS configuration which we
		// don't expect to change between initialisations
		if ( ! DataTable.__browser ) {
			var browser = {};
			DataTable.__browser = browser;
	
			// Scrolling feature / quirks detection
			var n = $('<div/>')
				.css( {
					position: 'fixed',
					top: 0,
					left: -1 * window.pageXOffset, // allow for scrolling
					height: 1,
					width: 1,
					overflow: 'hidden'
				} )
				.append(
					$('<div/>')
						.css( {
							position: 'absolute',
							top: 1,
							left: 1,
							width: 100,
							overflow: 'scroll'
						} )
						.append(
							$('<div/>')
								.css( {
									width: '100%',
									height: 10
								} )
						)
				)
				.appendTo( 'body' );
	
			var outer = n.children();
			var inner = outer.children();
	
			// Get scrollbar width
			browser.barWidth = outer[0].offsetWidth - outer[0].clientWidth;
	
			// In rtl text layout, some browsers (most, but not all) will place the
			// scrollbar on the left, rather than the right.
			browser.bScrollbarLeft = Math.round( inner.offset().left ) !== 1;
	
			n.remove();
		}
	
		$.extend( settings.oBrowser, DataTable.__browser );
		settings.oScroll.iBarWidth = DataTable.__browser.barWidth;
	}
	
	/**
	 * Add a column to the list used for the table with default values
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAddColumn( oSettings )
	{
		// Add column to aoColumns array
		var oDefaults = DataTable.defaults.column;
		var iCol = oSettings.aoColumns.length;
		var oCol = $.extend( {}, DataTable.models.oColumn, oDefaults, {
			"aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
			"mData": oDefaults.mData ? oDefaults.mData : iCol,
			idx: iCol,
			searchFixed: {},
			colEl: $('<col>').attr('data-dt-column', iCol)
		} );
		oSettings.aoColumns.push( oCol );
	
		// Add search object for column specific search. Note that the `searchCols[ iCol ]`
		// passed into extend can be undefined. This allows the user to give a default
		// with only some of the parameters defined, and also not give a default
		var searchCols = oSettings.aoPreSearchCols;
		searchCols[ iCol ] = $.extend( {}, DataTable.models.oSearch, searchCols[ iCol ] );
	}
	
	
	/**
	 * Apply options for a column
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iCol column index to consider
	 *  @param {object} oOptions object with sType, bVisible and bSearchable etc
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnOptions( oSettings, iCol, oOptions )
	{
		var oCol = oSettings.aoColumns[ iCol ];
	
		/* User specified column options */
		if ( oOptions !== undefined && oOptions !== null )
		{
			// Backwards compatibility
			_fnCompatCols( oOptions );
	
			// Map camel case parameters to their Hungarian counterparts
			_fnCamelToHungarian( DataTable.defaults.column, oOptions, true );
	
			/* Backwards compatibility for mDataProp */
			if ( oOptions.mDataProp !== undefined && !oOptions.mData )
			{
				oOptions.mData = oOptions.mDataProp;
			}
	
			if ( oOptions.sType )
			{
				oCol._sManualType = oOptions.sType;
			}
		
			// `class` is a reserved word in Javascript, so we need to provide
			// the ability to use a valid name for the camel case input
			if ( oOptions.className && ! oOptions.sClass )
			{
				oOptions.sClass = oOptions.className;
			}
	
			var origClass = oCol.sClass;
	
			$.extend( oCol, oOptions );
			_fnMap( oCol, oOptions, "sWidth", "sWidthOrig" );
	
			// Merge class from previously defined classes with this one, rather than just
			// overwriting it in the extend above
			if (origClass !== oCol.sClass) {
				oCol.sClass = origClass + ' ' + oCol.sClass;
			}
	
			/* iDataSort to be applied (backwards compatibility), but aDataSort will take
			 * priority if defined
			 */
			if ( oOptions.iDataSort !== undefined )
			{
				oCol.aDataSort = [ oOptions.iDataSort ];
			}
			_fnMap( oCol, oOptions, "aDataSort" );
		}
	
		/* Cache the data get and set functions for speed */
		var mDataSrc = oCol.mData;
		var mData = _fnGetObjectDataFn( mDataSrc );
	
		// The `render` option can be given as an array to access the helper rendering methods.
		// The first element is the rendering method to use, the rest are the parameters to pass
		if ( oCol.mRender && Array.isArray( oCol.mRender ) ) {
			var copy = oCol.mRender.slice();
			var name = copy.shift();
	
			oCol.mRender = DataTable.render[name].apply(window, copy);
		}
	
		oCol._render = oCol.mRender ? _fnGetObjectDataFn( oCol.mRender ) : null;
	
		var attrTest = function( src ) {
			return typeof src === 'string' && src.indexOf('@') !== -1;
		};
		oCol._bAttrSrc = $.isPlainObject( mDataSrc ) && (
			attrTest(mDataSrc.sort) || attrTest(mDataSrc.type) || attrTest(mDataSrc.filter)
		);
		oCol._setter = null;
	
		oCol.fnGetData = function (rowData, type, meta) {
			var innerData = mData( rowData, type, undefined, meta );
	
			return oCol._render && type ?
				oCol._render( innerData, type, rowData, meta ) :
				innerData;
		};
		oCol.fnSetData = function ( rowData, val, meta ) {
			return _fnSetObjectDataFn( mDataSrc )( rowData, val, meta );
		};
	
		// Indicate if DataTables should read DOM data as an object or array
		// Used in _fnGetRowElements
		if ( typeof mDataSrc !== 'number' && ! oCol._isArrayHost ) {
			oSettings._rowReadObject = true;
		}
	
		/* Feature sorting overrides column specific when off */
		if ( !oSettings.oFeatures.bSort )
		{
			oCol.bSortable = false;
		}
	}
	
	
	/**
	 * Adjust the table column widths for new data. Note: you would probably want to
	 * do a redraw after calling this function!
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAdjustColumnSizing ( settings )
	{
		_fnCalculateColumnWidths( settings );
		_fnColumnSizes( settings );
	
		var scroll = settings.oScroll;
		if ( scroll.sY !== '' || scroll.sX !== '') {
			_fnScrollDraw( settings );
		}
	
		_fnCallbackFire( settings, null, 'column-sizing', [settings] );
	}
	
	/**
	 * Apply column sizes
	 *
	 * @param {*} settings DataTables settings object
	 */
	function _fnColumnSizes ( settings )
	{
		var cols = settings.aoColumns;
	
		for (var i=0 ; i<cols.length ; i++) {
			var width = _fnColumnsSumWidth(settings, [i], false, false);
	
			cols[i].colEl.css('width', width);
	
			if (settings.oScroll.sX) {
				cols[i].colEl.css('min-width', width);
			}
		}
	}
	
	
	/**
	 * Convert the index of a visible column to the index in the data array (take account
	 * of hidden columns)
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iMatch Visible column index to lookup
	 *  @returns {int} i the data index
	 *  @memberof DataTable#oApi
	 */
	function _fnVisibleToColumnIndex( oSettings, iMatch )
	{
		var aiVis = _fnGetColumns( oSettings, 'bVisible' );
	
		return typeof aiVis[iMatch] === 'number' ?
			aiVis[iMatch] :
			null;
	}
	
	
	/**
	 * Convert the index of an index in the data array and convert it to the visible
	 *   column index (take account of hidden columns)
	 *  @param {int} iMatch Column index to lookup
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {int} i the data index
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnIndexToVisible( oSettings, iMatch )
	{
		var aiVis = _fnGetColumns( oSettings, 'bVisible' );
		var iPos = aiVis.indexOf(iMatch);
	
		return iPos !== -1 ? iPos : null;
	}
	
	
	/**
	 * Get the number of visible columns
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {int} i the number of visible columns
	 *  @memberof DataTable#oApi
	 */
	function _fnVisbleColumns( settings )
	{
		var layout = settings.aoHeader;
		var columns = settings.aoColumns;
		var vis = 0;
	
		if ( layout.length ) {
			for ( var i=0, ien=layout[0].length ; i<ien ; i++ ) {
				if ( columns[i].bVisible && $(layout[0][i].cell).css('display') !== 'none' ) {
					vis++;
				}
			}
		}
	
		return vis;
	}
	
	
	/**
	 * Get an array of column indexes that match a given property
	 *  @param {object} oSettings dataTables settings object
	 *  @param {string} sParam Parameter in aoColumns to look for - typically
	 *    bVisible or bSearchable
	 *  @returns {array} Array of indexes with matched properties
	 *  @memberof DataTable#oApi
	 */
	function _fnGetColumns( oSettings, sParam )
	{
		var a = [];
	
		oSettings.aoColumns.map( function(val, i) {
			if ( val[sParam] ) {
				a.push( i );
			}
		} );
	
		return a;
	}
	
	/**
	 * Allow the result from a type detection function to be `true` while
	 * translating that into a string. Old type detection functions will
	 * return the type name if it passes. An obect store would be better,
	 * but not backwards compatible.
	 *
	 * @param {*} typeDetect Object or function for type detection
	 * @param {*} res Result from the type detection function
	 * @returns Type name or false
	 */
	function _typeResult (typeDetect, res) {
		return res === true
			? typeDetect._name
			: res;
	}
	
	/**
	 * Calculate the 'type' of a column
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnTypes ( settings )
	{
		var columns = settings.aoColumns;
		var data = settings.aoData;
		var types = DataTable.ext.type.detect;
		var i, ien, j, jen, k, ken;
		var col, detectedType, cache;
	
		// For each column, spin over the data type detection functions, seeing if one matches
		for ( i=0, ien=columns.length ; i<ien ; i++ ) {
			col = columns[i];
			cache = [];
	
			if ( ! col.sType && col._sManualType ) {
				col.sType = col._sManualType;
			}
			else if ( ! col.sType ) {
				// With SSP type detection can be unreliable and error prone, so we provide a way
				// to turn it off.
				if (! settings.typeDetect) {
					return;
				}
	
				for ( j=0, jen=types.length ; j<jen ; j++ ) {
					var typeDetect = types[j];
	
					// There can be either one, or three type detection functions
					var oneOf = typeDetect.oneOf;
					var allOf = typeDetect.allOf || typeDetect;
					var init = typeDetect.init;
					var one = false;
	
					detectedType = null;
	
					// Fast detect based on column assignment
					if (init) {
						detectedType = _typeResult(typeDetect, init(settings, col, i));
	
						if (detectedType) {
							col.sType = detectedType;
							break;
						}
					}
	
					for ( k=0, ken=data.length ; k<ken ; k++ ) {
						if (! data[k]) {
							continue;
						}
	
						// Use a cache array so we only need to get the type data
						// from the formatter once (when using multiple detectors)
						if ( cache[k] === undefined ) {
							cache[k] = _fnGetCellData( settings, k, i, 'type' );
						}
	
						// Only one data point in the column needs to match this function
						if (oneOf && ! one) {
							one = _typeResult(typeDetect, oneOf( cache[k], settings ));
						}
	
						// All data points need to match this function
						detectedType = _typeResult(typeDetect, allOf( cache[k], settings ));
	
						// If null, then this type can't apply to this column, so
						// rather than testing all cells, break out. There is an
						// exception for the last type which is `html`. We need to
						// scan all rows since it is possible to mix string and HTML
						// types
						if ( ! detectedType && j !== types.length-3 ) {
							break;
						}
	
						// Only a single match is needed for html type since it is
						// bottom of the pile and very similar to string - but it
						// must not be empty
						if ( detectedType === 'html' && ! _empty(cache[k]) ) {
							break;
						}
					}
	
					// Type is valid for all data points in the column - use this
					// type
					if ( (oneOf && one && detectedType) || (!oneOf && detectedType) ) {
						col.sType = detectedType;
						break;
					}
				}
	
				// Fall back - if no type was detected, always use string
				if ( ! col.sType ) {
					col.sType = 'string';
				}
			}
	
			// Set class names for header / footer for auto type classes
			var autoClass = _ext.type.className[col.sType];
	
			if (autoClass) {
				_columnAutoClass(settings.aoHeader, i, autoClass);
				_columnAutoClass(settings.aoFooter, i, autoClass);
			}
	
			var renderer = _ext.type.render[col.sType];
	
			// This can only happen once! There is no way to remove
			// a renderer. After the first time the renderer has
			// already been set so createTr will run the renderer itself.
			if (renderer && ! col._render) {
				col._render = DataTable.util.get(renderer);
	
				_columnAutoRender(settings, i);
			}
		}
	}
	
	/**
	 * Apply an auto detected renderer to data which doesn't yet have
	 * a renderer
	 */
	function _columnAutoRender(settings, colIdx) {
		var data = settings.aoData;
	
		for (var i=0 ; i<data.length ; i++) {
			if (data[i].nTr) {
				// We have to update the display here since there is no
				// invalidation check for the data
				var display = _fnGetCellData( settings, i, colIdx, 'display' );
	
				data[i].displayData[colIdx] = display;
				_fnWriteCell(data[i].anCells[colIdx], display);
	
				// No need to update sort / filter data since it has
				// been invalidated and will be re-read with the
				// renderer now applied
			}
		}
	}
	
	/**
	 * Apply a class name to a column's header cells
	 */
	function _columnAutoClass(container, colIdx, className) {
		container.forEach(function (row) {
			if (row[colIdx] && row[colIdx].unique) {
				_addClass(row[colIdx].cell, className);
			}
		});
	}
	
	/**
	 * Take the column definitions and static columns arrays and calculate how
	 * they relate to column indexes. The callback function will then apply the
	 * definition found for a column to a suitable configuration object.
	 *  @param {object} oSettings dataTables settings object
	 *  @param {array} aoColDefs The aoColumnDefs array that is to be applied
	 *  @param {array} aoCols The aoColumns array that defines columns individually
	 *  @param {array} headerLayout Layout for header as it was loaded
	 *  @param {function} fn Callback function - takes two parameters, the calculated
	 *    column index and the definition for that column.
	 *  @memberof DataTable#oApi
	 */
	function _fnApplyColumnDefs( oSettings, aoColDefs, aoCols, headerLayout, fn )
	{
		var i, iLen, j, jLen, k, kLen, def;
		var columns = oSettings.aoColumns;
	
		if ( aoCols ) {
			for ( i=0, iLen=aoCols.length ; i<iLen ; i++ ) {
				if (aoCols[i] && aoCols[i].name) {
					columns[i].sName = aoCols[i].name;
				}
			}
		}
	
		// Column definitions with aTargets
		if ( aoColDefs )
		{
			/* Loop over the definitions array - loop in reverse so first instance has priority */
			for ( i=aoColDefs.length-1 ; i>=0 ; i-- )
			{
				def = aoColDefs[i];
	
				/* Each definition can target multiple columns, as it is an array */
				var aTargets = def.target !== undefined
					? def.target
					: def.targets !== undefined
						? def.targets
						: def.aTargets;
	
				if ( ! Array.isArray( aTargets ) )
				{
					aTargets = [ aTargets ];
				}
	
				for ( j=0, jLen=aTargets.length ; j<jLen ; j++ )
				{
					var target = aTargets[j];
	
					if ( typeof target === 'number' && target >= 0 )
					{
						/* Add columns that we don't yet know about */
						while( columns.length <= target )
						{
							_fnAddColumn( oSettings );
						}
	
						/* Integer, basic index */
						fn( target, def );
					}
					else if ( typeof target === 'number' && target < 0 )
					{
						/* Negative integer, right to left column counting */
						fn( columns.length+target, def );
					}
					else if ( typeof target === 'string' )
					{
						for ( k=0, kLen=columns.length ; k<kLen ; k++ ) {
							if (target === '_all') {
								// Apply to all columns
								fn( k, def );
							}
							else if (target.indexOf(':name') !== -1) {
								// Column selector
								if (columns[k].sName === target.replace(':name', '')) {
									fn( k, def );
								}
							}
							else {
								// Cell selector
								headerLayout.forEach(function (row) {
									if (row[k]) {
										var cell = $(row[k].cell);
	
										// Legacy support. Note that it means that we don't support
										// an element name selector only, since they are treated as
										// class names for 1.x compat.
										if (target.match(/^[a-z][\w-]*$/i)) {
											target = '.' + target;
										}
	
										if (cell.is( target )) {
											fn( k, def );
										}
									}
								});
							}
						}
					}
				}
			}
		}
	
		// Statically defined columns array
		if ( aoCols ) {
			for ( i=0, iLen=aoCols.length ; i<iLen ; i++ ) {
				fn( i, aoCols[i] );
			}
		}
	}
	
	
	/**
	 * Get the width for a given set of columns
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} targets Columns - comma separated string or array of numbers
	 * @param {*} original Use the original width (true) or calculated (false)
	 * @param {*} incVisible Include visible columns (true) or not (false)
	 * @returns Combined CSS value
	 */
	function _fnColumnsSumWidth( settings, targets, original, incVisible ) {
		if ( ! Array.isArray( targets ) ) {
			targets = _fnColumnsFromHeader( targets );
		}
	
		var sum = 0;
		var unit;
		var columns = settings.aoColumns;
		
		for ( var i=0, ien=targets.length ; i<ien ; i++ ) {
			var column = columns[ targets[i] ];
			var definedWidth = original ?
				column.sWidthOrig :
				column.sWidth;
	
			if ( ! incVisible && column.bVisible === false ) {
				continue;
			}
	
			if ( definedWidth === null || definedWidth === undefined ) {
				return null; // can't determine a defined width - browser defined
			}
			else if ( typeof definedWidth === 'number' ) {
				unit = 'px';
				sum += definedWidth;
			}
			else {
				var matched = definedWidth.match(/([\d\.]+)([^\d]*)/);
	
				if ( matched ) {
					sum += matched[1] * 1;
					unit = matched.length === 3 ?
						matched[2] :
						'px';
				}
			}
		}
	
		return sum + unit;
	}
	
	function _fnColumnsFromHeader( cell )
	{
		var attr = $(cell).closest('[data-dt-column]').attr('data-dt-column');
	
		if ( ! attr ) {
			return [];
		}
	
		return attr.split(',').map( function (val) {
			return val * 1;
		} );
	}
	/**
	 * Add a data array to the table, creating DOM node etc. This is the parallel to
	 * _fnGatherData, but for adding rows from a Javascript source, rather than a
	 * DOM source.
	 *  @param {object} settings dataTables settings object
	 *  @param {array} data data array to be added
	 *  @param {node} [tr] TR element to add to the table - optional. If not given,
	 *    DataTables will create a row automatically
	 *  @param {array} [tds] Array of TD|TH elements for the row - must be given
	 *    if nTr is.
	 *  @returns {int} >=0 if successful (index of new aoData entry), -1 if failed
	 *  @memberof DataTable#oApi
	 */
	function _fnAddData ( settings, dataIn, tr, tds )
	{
		/* Create the object for storing information about this new row */
		var rowIdx = settings.aoData.length;
		var rowModel = $.extend( true, {}, DataTable.models.oRow, {
			src: tr ? 'dom' : 'data',
			idx: rowIdx
		} );
	
		rowModel._aData = dataIn;
		settings.aoData.push( rowModel );
	
		var columns = settings.aoColumns;
	
		for ( var i=0, iLen=columns.length ; i<iLen ; i++ )
		{
			// Invalidate the column types as the new data needs to be revalidated
			columns[i].sType = null;
		}
	
		/* Add to the display array */
		settings.aiDisplayMaster.push( rowIdx );
	
		var id = settings.rowIdFn( dataIn );
		if ( id !== undefined ) {
			settings.aIds[ id ] = rowModel;
		}
	
		/* Create the DOM information, or register it if already present */
		if ( tr || ! settings.oFeatures.bDeferRender )
		{
			_fnCreateTr( settings, rowIdx, tr, tds );
		}
	
		return rowIdx;
	}
	
	
	/**
	 * Add one or more TR elements to the table. Generally we'd expect to
	 * use this for reading data from a DOM sourced table, but it could be
	 * used for an TR element. Note that if a TR is given, it is used (i.e.
	 * it is not cloned).
	 *  @param {object} settings dataTables settings object
	 *  @param {array|node|jQuery} trs The TR element(s) to add to the table
	 *  @returns {array} Array of indexes for the added rows
	 *  @memberof DataTable#oApi
	 */
	function _fnAddTr( settings, trs )
	{
		var row;
	
		// Allow an individual node to be passed in
		if ( ! (trs instanceof $) ) {
			trs = $(trs);
		}
	
		return trs.map( function (i, el) {
			row = _fnGetRowElements( settings, el );
			return _fnAddData( settings, row.data, el, row.cells );
		} );
	}
	
	
	/**
	 * Get the data for a given cell from the internal cache, taking into account data mapping
	 *  @param {object} settings dataTables settings object
	 *  @param {int} rowIdx aoData row id
	 *  @param {int} colIdx Column index
	 *  @param {string} type data get type ('display', 'type' 'filter|search' 'sort|order')
	 *  @returns {*} Cell data
	 *  @memberof DataTable#oApi
	 */
	function _fnGetCellData( settings, rowIdx, colIdx, type )
	{
		if (type === 'search') {
			type = 'filter';
		}
		else if (type === 'order') {
			type = 'sort';
		}
	
		var row = settings.aoData[rowIdx];
	
		if (! row) {
			return undefined;
		}
	
		var draw           = settings.iDraw;
		var col            = settings.aoColumns[colIdx];
		var rowData        = row._aData;
		var defaultContent = col.sDefaultContent;
		var cellData       = col.fnGetData( rowData, type, {
			settings: settings,
			row:      rowIdx,
			col:      colIdx
		} );
	
		// Allow for a node being returned for non-display types
		if (type !== 'display' && cellData && typeof cellData === 'object' && cellData.nodeName) {
			cellData = cellData.innerHTML;
		}
	
		if ( cellData === undefined ) {
			if ( settings.iDrawError != draw && defaultContent === null ) {
				_fnLog( settings, 0, "Requested unknown parameter "+
					(typeof col.mData=='function' ? '{function}' : "'"+col.mData+"'")+
					" for row "+rowIdx+", column "+colIdx, 4 );
				settings.iDrawError = draw;
			}
			return defaultContent;
		}
	
		// When the data source is null and a specific data type is requested (i.e.
		// not the original data), we can use default column data
		if ( (cellData === rowData || cellData === null) && defaultContent !== null && type !== undefined ) {
			cellData = defaultContent;
		}
		else if ( typeof cellData === 'function' ) {
			// If the data source is a function, then we run it and use the return,
			// executing in the scope of the data object (for instances)
			return cellData.call( rowData );
		}
	
		if ( cellData === null && type === 'display' ) {
			return '';
		}
	
		if ( type === 'filter' ) {
			var fomatters = DataTable.ext.type.search;
	
			if ( fomatters[ col.sType ] ) {
				cellData = fomatters[ col.sType ]( cellData );
			}
		}
	
		return cellData;
	}
	
	
	/**
	 * Set the value for a specific cell, into the internal data cache
	 *  @param {object} settings dataTables settings object
	 *  @param {int} rowIdx aoData row id
	 *  @param {int} colIdx Column index
	 *  @param {*} val Value to set
	 *  @memberof DataTable#oApi
	 */
	function _fnSetCellData( settings, rowIdx, colIdx, val )
	{
		var col     = settings.aoColumns[colIdx];
		var rowData = settings.aoData[rowIdx]._aData;
	
		col.fnSetData( rowData, val, {
			settings: settings,
			row:      rowIdx,
			col:      colIdx
		}  );
	}
	
	/**
	 * Write a value to a cell
	 * @param {*} td Cell
	 * @param {*} val Value
	 */
	function _fnWriteCell(td, val)
	{
		if (val && typeof val === 'object' && val.nodeName) {
			$(td)
				.empty()
				.append(val);
		}
		else {
			td.innerHTML = val;
		}
	}
	
	
	// Private variable that is used to match action syntax in the data property object
	var __reArray = /\[.*?\]$/;
	var __reFn = /\(\)$/;
	
	/**
	 * Split string on periods, taking into account escaped periods
	 * @param  {string} str String to split
	 * @return {array} Split string
	 */
	function _fnSplitObjNotation( str )
	{
		var parts = str.match(/(\\.|[^.])+/g) || [''];
	
		return parts.map( function ( s ) {
			return s.replace(/\\\./g, '.');
		} );
	}
	
	
	/**
	 * Return a function that can be used to get data from a source object, taking
	 * into account the ability to use nested objects as a source
	 *  @param {string|int|function} mSource The data source for the object
	 *  @returns {function} Data get function
	 *  @memberof DataTable#oApi
	 */
	var _fnGetObjectDataFn = DataTable.util.get;
	
	
	/**
	 * Return a function that can be used to set data from a source object, taking
	 * into account the ability to use nested objects as a source
	 *  @param {string|int|function} mSource The data source for the object
	 *  @returns {function} Data set function
	 *  @memberof DataTable#oApi
	 */
	var _fnSetObjectDataFn = DataTable.util.set;
	
	
	/**
	 * Return an array with the full table data
	 *  @param {object} oSettings dataTables settings object
	 *  @returns array {array} aData Master data array
	 *  @memberof DataTable#oApi
	 */
	function _fnGetDataMaster ( settings )
	{
		return _pluck( settings.aoData, '_aData' );
	}
	
	
	/**
	 * Nuke the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnClearTable( settings )
	{
		settings.aoData.length = 0;
		settings.aiDisplayMaster.length = 0;
		settings.aiDisplay.length = 0;
		settings.aIds = {};
	}
	
	
	/**
	 * Mark cached data as invalid such that a re-read of the data will occur when
	 * the cached data is next requested. Also update from the data source object.
	 *
	 * @param {object} settings DataTables settings object
	 * @param {int}    rowIdx   Row index to invalidate
	 * @param {string} [src]    Source to invalidate from: undefined, 'auto', 'dom'
	 *     or 'data'
	 * @param {int}    [colIdx] Column index to invalidate. If undefined the whole
	 *     row will be invalidated
	 * @memberof DataTable#oApi
	 *
	 * @todo For the modularisation of v1.11 this will need to become a callback, so
	 *   the sort and filter methods can subscribe to it. That will required
	 *   initialisation options for sorting, which is why it is not already baked in
	 */
	function _fnInvalidate( settings, rowIdx, src, colIdx )
	{
		var row = settings.aoData[ rowIdx ];
		var i, ien;
	
		// Remove the cached data for the row
		row._aSortData = null;
		row._aFilterData = null;
		row.displayData = null;
	
		// Are we reading last data from DOM or the data object?
		if ( src === 'dom' || ((! src || src === 'auto') && row.src === 'dom') ) {
			// Read the data from the DOM
			row._aData = _fnGetRowElements(
					settings, row, colIdx, colIdx === undefined ? undefined : row._aData
				)
				.data;
		}
		else {
			// Reading from data object, update the DOM
			var cells = row.anCells;
			var display = _fnGetRowDisplay(settings, rowIdx);
	
			if ( cells ) {
				if ( colIdx !== undefined ) {
					_fnWriteCell(cells[colIdx], display[colIdx]);
				}
				else {
					for ( i=0, ien=cells.length ; i<ien ; i++ ) {
						_fnWriteCell(cells[i], display[i]);
					}
				}
			}
		}
	
		// Column specific invalidation
		var cols = settings.aoColumns;
		if ( colIdx !== undefined ) {
			// Type - the data might have changed
			cols[ colIdx ].sType = null;
	
			// Max length string. Its a fairly cheep recalculation, so not worth
			// something more complicated
			cols[ colIdx ].maxLenString = null;
		}
		else {
			for ( i=0, ien=cols.length ; i<ien ; i++ ) {
				cols[i].sType = null;
				cols[i].maxLenString = null;
			}
	
			// Update DataTables special `DT_*` attributes for the row
			_fnRowAttributes( settings, row );
		}
	}
	
	
	/**
	 * Build a data source object from an HTML row, reading the contents of the
	 * cells that are in the row.
	 *
	 * @param {object} settings DataTables settings object
	 * @param {node|object} TR element from which to read data or existing row
	 *   object from which to re-read the data from the cells
	 * @param {int} [colIdx] Optional column index
	 * @param {array|object} [d] Data source object. If `colIdx` is given then this
	 *   parameter should also be given and will be used to write the data into.
	 *   Only the column in question will be written
	 * @returns {object} Object with two parameters: `data` the data read, in
	 *   document order, and `cells` and array of nodes (they can be useful to the
	 *   caller, so rather than needing a second traversal to get them, just return
	 *   them from here).
	 * @memberof DataTable#oApi
	 */
	function _fnGetRowElements( settings, row, colIdx, d )
	{
		var
			tds = [],
			td = row.firstChild,
			name, col, i=0, contents,
			columns = settings.aoColumns,
			objectRead = settings._rowReadObject;
	
		// Allow the data object to be passed in, or construct
		d = d !== undefined ?
			d :
			objectRead ?
				{} :
				[];
	
		var attr = function ( str, td  ) {
			if ( typeof str === 'string' ) {
				var idx = str.indexOf('@');
	
				if ( idx !== -1 ) {
					var attr = str.substring( idx+1 );
					var setter = _fnSetObjectDataFn( str );
					setter( d, td.getAttribute( attr ) );
				}
			}
		};
	
		// Read data from a cell and store into the data object
		var cellProcess = function ( cell ) {
			if ( colIdx === undefined || colIdx === i ) {
				col = columns[i];
				contents = (cell.innerHTML).trim();
	
				if ( col && col._bAttrSrc ) {
					var setter = _fnSetObjectDataFn( col.mData._ );
					setter( d, contents );
	
					attr( col.mData.sort, cell );
					attr( col.mData.type, cell );
					attr( col.mData.filter, cell );
				}
				else {
					// Depending on the `data` option for the columns the data can
					// be read to either an object or an array.
					if ( objectRead ) {
						if ( ! col._setter ) {
							// Cache the setter function
							col._setter = _fnSetObjectDataFn( col.mData );
						}
						col._setter( d, contents );
					}
					else {
						d[i] = contents;
					}
				}
			}
	
			i++;
		};
	
		if ( td ) {
			// `tr` element was passed in
			while ( td ) {
				name = td.nodeName.toUpperCase();
	
				if ( name == "TD" || name == "TH" ) {
					cellProcess( td );
					tds.push( td );
				}
	
				td = td.nextSibling;
			}
		}
		else {
			// Existing row object passed in
			tds = row.anCells;
	
			for ( var j=0, jen=tds.length ; j<jen ; j++ ) {
				cellProcess( tds[j] );
			}
		}
	
		// Read the ID from the DOM if present
		var rowNode = row.firstChild ? row : row.nTr;
	
		if ( rowNode ) {
			var id = rowNode.getAttribute( 'id' );
	
			if ( id ) {
				_fnSetObjectDataFn( settings.rowId )( d, id );
			}
		}
	
		return {
			data: d,
			cells: tds
		};
	}
	
	/**
	 * Render and cache a row's display data for the columns, if required
	 * @returns 
	 */
	function _fnGetRowDisplay (settings, rowIdx) {
		var rowModal = settings.aoData[rowIdx];
		var columns = settings.aoColumns;
	
		if (! rowModal.displayData) {
			// Need to render and cache
			rowModal.displayData = [];
		
			for ( var colIdx=0, len=columns.length ; colIdx<len ; colIdx++ ) {
				rowModal.displayData.push(
					_fnGetCellData( settings, rowIdx, colIdx, 'display' )
				);
			}
		}
	
		return rowModal.displayData;
	}
	
	/**
	 * Create a new TR element (and it's TD children) for a row
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iRow Row to consider
	 *  @param {node} [nTrIn] TR element to add to the table - optional. If not given,
	 *    DataTables will create a row automatically
	 *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
	 *    if nTr is.
	 *  @memberof DataTable#oApi
	 */
	function _fnCreateTr ( oSettings, iRow, nTrIn, anTds )
	{
		var
			row = oSettings.aoData[iRow],
			rowData = row._aData,
			cells = [],
			nTr, nTd, oCol,
			i, iLen, create,
			trClass = oSettings.oClasses.tbody.row;
	
		if ( row.nTr === null )
		{
			nTr = nTrIn || document.createElement('tr');
	
			row.nTr = nTr;
			row.anCells = cells;
	
			_addClass(nTr, trClass);
	
			/* Use a private property on the node to allow reserve mapping from the node
			 * to the aoData array for fast look up
			 */
			nTr._DT_RowIndex = iRow;
	
			/* Special parameters can be given by the data source to be used on the row */
			_fnRowAttributes( oSettings, row );
	
			/* Process each column */
			for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				oCol = oSettings.aoColumns[i];
				create = nTrIn && anTds[i] ? false : true;
	
				nTd = create ? document.createElement( oCol.sCellType ) : anTds[i];
	
				if (! nTd) {
					_fnLog( oSettings, 0, 'Incorrect column count', 18 );
				}
	
				nTd._DT_CellIndex = {
					row: iRow,
					column: i
				};
				
				cells.push( nTd );
				
				var display = _fnGetRowDisplay(oSettings, iRow);
	
				// Need to create the HTML if new, or if a rendering function is defined
				if (
					create ||
					(
						(oCol.mRender || oCol.mData !== i) &&
						(!$.isPlainObject(oCol.mData) || oCol.mData._ !== i+'.display')
					)
				) {
					_fnWriteCell(nTd, display[i]);
				}
	
				// column class
				_addClass(nTd, oCol.sClass);
	
				// Visibility - add or remove as required
				if ( oCol.bVisible && create )
				{
					nTr.appendChild( nTd );
				}
				else if ( ! oCol.bVisible && ! create )
				{
					nTd.parentNode.removeChild( nTd );
				}
	
				if ( oCol.fnCreatedCell )
				{
					oCol.fnCreatedCell.call( oSettings.oInstance,
						nTd, _fnGetCellData( oSettings, iRow, i ), rowData, iRow, i
					);
				}
			}
	
			_fnCallbackFire( oSettings, 'aoRowCreatedCallback', 'row-created', [nTr, rowData, iRow, cells] );
		}
		else {
			_addClass(row.nTr, trClass);
		}
	}
	
	
	/**
	 * Add attributes to a row based on the special `DT_*` parameters in a data
	 * source object.
	 *  @param {object} settings DataTables settings object
	 *  @param {object} DataTables row object for the row to be modified
	 *  @memberof DataTable#oApi
	 */
	function _fnRowAttributes( settings, row )
	{
		var tr = row.nTr;
		var data = row._aData;
	
		if ( tr ) {
			var id = settings.rowIdFn( data );
	
			if ( id ) {
				tr.id = id;
			}
	
			if ( data.DT_RowClass ) {
				// Remove any classes added by DT_RowClass before
				var a = data.DT_RowClass.split(' ');
				row.__rowc = row.__rowc ?
					_unique( row.__rowc.concat( a ) ) :
					a;
	
				$(tr)
					.removeClass( row.__rowc.join(' ') )
					.addClass( data.DT_RowClass );
			}
	
			if ( data.DT_RowAttr ) {
				$(tr).attr( data.DT_RowAttr );
			}
	
			if ( data.DT_RowData ) {
				$(tr).data( data.DT_RowData );
			}
		}
	}
	
	
	/**
	 * Create the HTML header for the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnBuildHead( settings, side )
	{
		var classes = settings.oClasses;
		var columns = settings.aoColumns;
		var i, ien, row;
		var target = side === 'header'
			? settings.nTHead
			: settings.nTFoot;
		var titleProp = side === 'header' ? 'sTitle' : side;
	
		// Footer might be defined
		if (! target) {
			return;
		}
	
		// If no cells yet and we have content for them, then create
		if (side === 'header' || _pluck(settings.aoColumns, titleProp).join('')) {
			row = $('tr', target);
	
			// Add a row if needed
			if (! row.length) {
				row = $('<tr/>').appendTo(target)
			}
	
			// Add the number of cells needed to make up to the number of columns
			if (row.length === 1) {
				var cellCount = 0;
				
				$('td, th', row).each(function () {
					cellCount += this.colSpan;
				});
	
				for ( i=cellCount, ien=columns.length ; i<ien ; i++ ) {
					$('<th/>')
						.html( columns[i][titleProp] || '' )
						.appendTo( row );
				}
			}
		}
	
		var detected = _fnDetectHeader( settings, target, true );
	
		if (side === 'header') {
			settings.aoHeader = detected;
			$('tr', target).addClass(classes.thead.row);
		}
		else {
			settings.aoFooter = detected;
			$('tr', target).addClass(classes.tfoot.row);
		}
	
		// Every cell needs to be passed through the renderer
		$(target).children('tr').children('th, td')
			.each( function () {
				_fnRenderer( settings, side )(
					settings, $(this), classes
				);
			} );
	}
	
	/**
	 * Build a layout structure for a header or footer
	 *
	 * @param {*} settings DataTables settings
	 * @param {*} source Source layout array
	 * @param {*} incColumns What columns should be included
	 * @returns Layout array
	 */
	function _fnHeaderLayout( settings, source, incColumns )
	{
		var row, column, cell;
		var local = [];
		var structure = [];
		var columns = settings.aoColumns;
		var columnCount = columns.length;
		var rowspan, colspan;
	
		if ( ! source ) {
			return;
		}
	
		// Default is to work on only visible columns
		if ( ! incColumns ) {
			incColumns = _range(columnCount)
				.filter(function (idx) {
					return columns[idx].bVisible;
				});
		}
	
		// Make a copy of the master layout array, but with only the columns we want
		for ( row=0 ; row<source.length ; row++ ) {
			// Remove any columns we haven't selected
			local[row] = source[row].slice().filter(function (cell, i) {
				return incColumns.includes(i);
			});
	
			// Prep the structure array - it needs an element for each row
			structure.push( [] );
		}
	
		for ( row=0 ; row<local.length ; row++ ) {
			for ( column=0 ; column<local[row].length ; column++ ) {
				rowspan = 1;
				colspan = 1;
	
				// Check to see if there is already a cell (row/colspan) covering our target
				// insert point. If there is, then there is nothing to do.
				if ( structure[row][column] === undefined ) {
					cell = local[row][column].cell;
	
					// Expand for rowspan
					while (
						local[row+rowspan] !== undefined &&
						local[row][column].cell == local[row+rowspan][column].cell
					) {
						structure[row+rowspan][column] = null;
						rowspan++;
					}
	
					// And for colspan
					while (
						local[row][column+colspan] !== undefined &&
						local[row][column].cell == local[row][column+colspan].cell
					) {
						// Which also needs to go over rows
						for ( var k=0 ; k<rowspan ; k++ ) {
							structure[row+k][column+colspan] = null;
						}
	
						colspan++;
					}
	
					var titleSpan = $('span.dt-column-title', cell);
	
					structure[row][column] = {
						cell: cell,
						colspan: colspan,
						rowspan: rowspan,
						title: titleSpan.length
							? titleSpan.html()
							: $(cell).html()
					};
				}
			}
		}
	
		return structure;
	}
	
	
	/**
	 * Draw the header (or footer) element based on the column visibility states.
	 *
	 *  @param object oSettings dataTables settings object
	 *  @param array aoSource Layout array from _fnDetectHeader
	 *  @memberof DataTable#oApi
	 */
	function _fnDrawHead( settings, source )
	{
		var layout = _fnHeaderLayout(settings, source);
		var tr, n;
	
		for ( var row=0 ; row<source.length ; row++ ) {
			tr = source[row].row;
	
			// All cells are going to be replaced, so empty out the row
			// Can't use $().empty() as that kills event handlers
			if (tr) {
				while( (n = tr.firstChild) ) {
					tr.removeChild( n );
				}
			}
	
			for ( var column=0 ; column<layout[row].length ; column++ ) {
				var point = layout[row][column];
	
				if (point) {
					$(point.cell)
						.appendTo(tr)
						.attr('rowspan', point.rowspan)
						.attr('colspan', point.colspan);
				}
			}
		}
	}
	
	
	/**
	 * Insert the required TR nodes into the table for display
	 *  @param {object} oSettings dataTables settings object
	 *  @param ajaxComplete true after ajax call to complete rendering
	 *  @memberof DataTable#oApi
	 */
	function _fnDraw( oSettings, ajaxComplete )
	{
		// Allow for state saving and a custom start position
		_fnStart( oSettings );
	
		/* Provide a pre-callback function which can be used to cancel the draw is false is returned */
		var aPreDraw = _fnCallbackFire( oSettings, 'aoPreDrawCallback', 'preDraw', [oSettings] );
		if ( aPreDraw.indexOf(false) !== -1 )
		{
			_fnProcessingDisplay( oSettings, false );
			return;
		}
	
		var anRows = [];
		var iRowCount = 0;
		var bServerSide = _fnDataSource( oSettings ) == 'ssp';
		var aiDisplay = oSettings.aiDisplay;
		var iDisplayStart = oSettings._iDisplayStart;
		var iDisplayEnd = oSettings.fnDisplayEnd();
		var columns = oSettings.aoColumns;
		var body = $(oSettings.nTBody);
	
		oSettings.bDrawing = true;
	
		/* Server-side processing draw intercept */
		if ( oSettings.deferLoading )
		{
			oSettings.deferLoading = false;
			oSettings.iDraw++;
			_fnProcessingDisplay( oSettings, false );
		}
		else if ( !bServerSide )
		{
			oSettings.iDraw++;
		}
		else if ( !oSettings.bDestroying && !ajaxComplete)
		{
			// Show loading message for server-side processing
			if (oSettings.iDraw === 0) {
				body.empty().append(_emptyRow(oSettings));
			}
	
			_fnAjaxUpdate( oSettings );
			return;
		}
	
		if ( aiDisplay.length !== 0 )
		{
			var iStart = bServerSide ? 0 : iDisplayStart;
			var iEnd = bServerSide ? oSettings.aoData.length : iDisplayEnd;
	
			for ( var j=iStart ; j<iEnd ; j++ )
			{
				var iDataIndex = aiDisplay[j];
				var aoData = oSettings.aoData[ iDataIndex ];
				if ( aoData.nTr === null )
				{
					_fnCreateTr( oSettings, iDataIndex );
				}
	
				var nRow = aoData.nTr;
	
				// Add various classes as needed
				for (var i=0 ; i<columns.length ; i++) {
					var col = columns[i];
					var td = aoData.anCells[i];
	
					_addClass(td, _ext.type.className[col.sType]); // auto class
					_addClass(td, oSettings.oClasses.tbody.cell); // all cells
				}
	
				// Row callback functions - might want to manipulate the row
				// iRowCount and j are not currently documented. Are they at all
				// useful?
				_fnCallbackFire( oSettings, 'aoRowCallback', null,
					[nRow, aoData._aData, iRowCount, j, iDataIndex] );
	
				anRows.push( nRow );
				iRowCount++;
			}
		}
		else
		{
			anRows[ 0 ] = _emptyRow(oSettings);
		}
	
		/* Header and footer callbacks */
		_fnCallbackFire( oSettings, 'aoHeaderCallback', 'header', [ $(oSettings.nTHead).children('tr')[0],
			_fnGetDataMaster( oSettings ), iDisplayStart, iDisplayEnd, aiDisplay ] );
	
		_fnCallbackFire( oSettings, 'aoFooterCallback', 'footer', [ $(oSettings.nTFoot).children('tr')[0],
			_fnGetDataMaster( oSettings ), iDisplayStart, iDisplayEnd, aiDisplay ] );
	
		// replaceChildren is faster, but only became widespread in 2020,
		// so a fall back in jQuery is provided for older browsers.
		if (body[0].replaceChildren) {
			body[0].replaceChildren.apply(body[0], anRows);
		}
		else {
			body.children().detach();
			body.append( $(anRows) );
		}
	
		// Empty table needs a specific class
		$(oSettings.nTableWrapper).toggleClass('dt-empty-footer', $('tr', oSettings.nTFoot).length === 0);
	
		/* Call all required callback functions for the end of a draw */
		_fnCallbackFire( oSettings, 'aoDrawCallback', 'draw', [oSettings], true );
	
		/* Draw is complete, sorting and filtering must be as well */
		oSettings.bSorted = false;
		oSettings.bFiltered = false;
		oSettings.bDrawing = false;
	}
	
	
	/**
	 * Redraw the table - taking account of the various features which are enabled
	 *  @param {object} oSettings dataTables settings object
	 *  @param {boolean} [holdPosition] Keep the current paging position. By default
	 *    the paging is reset to the first page
	 *  @memberof DataTable#oApi
	 */
	function _fnReDraw( settings, holdPosition, recompute )
	{
		var
			features = settings.oFeatures,
			sort     = features.bSort,
			filter   = features.bFilter;
	
		if (recompute === undefined || recompute === true) {
			// Resolve any column types that are unknown due to addition or invalidation
			_fnColumnTypes( settings );
	
			if ( sort ) {
				_fnSort( settings );
			}
	
			if ( filter ) {
				_fnFilterComplete( settings, settings.oPreviousSearch );
			}
			else {
				// No filtering, so we want to just use the display master
				settings.aiDisplay = settings.aiDisplayMaster.slice();
			}
		}
	
		if ( holdPosition !== true ) {
			settings._iDisplayStart = 0;
		}
	
		// Let any modules know about the draw hold position state (used by
		// scrolling internally)
		settings._drawHold = holdPosition;
	
		_fnDraw( settings );
	
		settings._drawHold = false;
	}
	
	
	/*
	 * Table is empty - create a row with an empty message in it
	 */
	function _emptyRow ( settings ) {
		var oLang = settings.oLanguage;
		var zero = oLang.sZeroRecords;
		var dataSrc = _fnDataSource( settings );
	
		if (
			(settings.iDraw < 1 && dataSrc === 'ssp') ||
			(settings.iDraw <= 1 && dataSrc === 'ajax')
		) {
			zero = oLang.sLoadingRecords;
		}
		else if ( oLang.sEmptyTable && settings.fnRecordsTotal() === 0 )
		{
			zero = oLang.sEmptyTable;
		}
	
		return $( '<tr/>' )
			.append( $('<td />', {
				'colSpan': _fnVisbleColumns( settings ),
				'class':   settings.oClasses.empty.row
			} ).html( zero ) )[0];
	}
	
	
	/**
	 * Expand the layout items into an object for the rendering function
	 */
	function _layoutItems (row, align, items) {
		if ( Array.isArray(items)) {
			for (var i=0 ; i<items.length ; i++) {
				_layoutItems(row, align, items[i]);
			}
	
			return;
		}
	
		var rowCell = row[align];
	
		// If it is an object, then there can be multiple features contained in it
		if ( $.isPlainObject( items ) ) {
			// A feature plugin cannot be named "features" due to this check
			if (items.features) {
				if (items.rowId) {
					row.id = items.rowId;
				}
				if (items.rowClass) {
					row.className = items.rowClass;
				}
	
				rowCell.id = items.id;
				rowCell.className = items.className;
	
				_layoutItems(row, align, items.features);
			}
			else {
				Object.keys(items).map(function (key) {
					rowCell.contents.push( {
						feature: key,
						opts: items[key]
					});
				});
			}
		}
		else {
			rowCell.contents.push(items);
		}
	}
	
	/**
	 * Find, or create a layout row
	 */
	function _layoutGetRow(rows, rowNum, align) {
		var row;
	
		// Find existing rows
		for (var i=0; i<rows.length; i++) {
			row = rows[i];
	
			if (row.rowNum === rowNum) {
				// full is on its own, but start and end share a row
				if (
					(align === 'full' && row.full) ||
					((align === 'start' || align === 'end') && (row.start || row.end))
				) {
					if (! row[align]) {
						row[align] = {
							contents: []
						};
					}
	
					return row;
				}
			}
		}
	
		// If we get this far, then there was no match, create a new row
		row = {
			rowNum: rowNum	
		};
	
		row[align] = {
			contents: []
		};
	
		rows.push(row);
	
		return row;
	}
	
	/**
	 * Convert a `layout` object given by a user to the object structure needed
	 * for the renderer. This is done twice, once for above and once for below
	 * the table. Ordering must also be considered.
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} layout Layout object to convert
	 * @param {string} side `top` or `bottom`
	 * @returns Converted array structure - one item for each row.
	 */
	function _layoutArray ( settings, layout, side ) {
		var rows = [];
		
		// Split out into an array
		$.each( layout, function ( pos, items ) {
			if (items === null) {
				return;
			}
	
			var parts = pos.match(/^([a-z]+)([0-9]*)([A-Za-z]*)$/);
			var rowNum = parts[2]
				? parts[2] * 1
				: 0;
			var align = parts[3]
				? parts[3].toLowerCase()
				: 'full';
	
			// Filter out the side we aren't interested in
			if (parts[1] !== side) {
				return;
			}
	
			// Get or create the row we should attach to
			var row = _layoutGetRow(rows, rowNum, align);
	
			_layoutItems(row, align, items);
		});
	
		// Order by item identifier
		rows.sort( function ( a, b ) {
			var order1 = a.rowNum;
			var order2 = b.rowNum;
	
			// If both in the same row, then the row with `full` comes first
			if (order1 === order2) {
				var ret = a.full && ! b.full ? -1 : 1;
	
				return side === 'bottom'
					? ret * -1
					: ret;
			}
	
			return order2 - order1;
		} );
	
		// Invert for below the table
		if ( side === 'bottom' ) {
			rows.reverse();
		}
	
		for (var row = 0; row<rows.length; row++) {
			delete rows[row].rowNum;
	
			_layoutResolve(settings, rows[row]);
		}
	
		return rows;
	}
	
	
	/**
	 * Convert the contents of a row's layout object to nodes that can be inserted
	 * into the document by a renderer. Execute functions, look up plug-ins, etc.
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} row Layout object for this row
	 */
	function _layoutResolve( settings, row ) {
		var getFeature = function (feature, opts) {
			if ( ! _ext.features[ feature ] ) {
				_fnLog( settings, 0, 'Unknown feature: '+ feature );
			}
	
			return _ext.features[ feature ].apply( this, [settings, opts] );
		};
	
		var resolve = function ( item ) {
			if (! row[ item ]) {
				return;
			}
	
			var line = row[ item ].contents;
	
			for ( var i=0, ien=line.length ; i<ien ; i++ ) {
				if ( ! line[i] ) {
					continue;
				}
				else if ( typeof line[i] === 'string' ) {
					line[i] = getFeature( line[i], null );
				}
				else if ( $.isPlainObject(line[i]) ) {
					// If it's an object, it just has feature and opts properties from
					// the transform in _layoutArray
					line[i] = getFeature(line[i].feature, line[i].opts);
				}
				else if ( typeof line[i].node === 'function' ) {
					line[i] = line[i].node( settings );
				}
				else if ( typeof line[i] === 'function' ) {
					var inst = line[i]( settings );
	
					line[i] = typeof inst.node === 'function' ?
						inst.node() :
						inst;
				}
			}
		};
	
		resolve('start');
		resolve('end');
		resolve('full');
	}
	
	
	/**
	 * Add the options to the page HTML for the table
	 *  @param {object} settings DataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAddOptionsHtml ( settings )
	{
		var classes = settings.oClasses;
		var table = $(settings.nTable);
	
		// Wrapper div around everything DataTables controls
		var insert = $('<div/>')
			.attr({
				id:      settings.sTableId+'_wrapper',
				'class': classes.container
			})
			.insertBefore(table);
	
		settings.nTableWrapper = insert[0];
	
		if (settings.sDom) {
			// Legacy
			_fnLayoutDom(settings, settings.sDom, insert);
		}
		else {
			var top = _layoutArray( settings, settings.layout, 'top' );
			var bottom = _layoutArray( settings, settings.layout, 'bottom' );
			var renderer = _fnRenderer( settings, 'layout' );
		
			// Everything above - the renderer will actually insert the contents into the document
			top.forEach(function (item) {
				renderer( settings, insert, item );
			});
	
			// The table - always the center of attention
			renderer( settings, insert, {
				full: {
					table: true,
					contents: [ _fnFeatureHtmlTable(settings) ]
				}
			} );
	
			// Everything below
			bottom.forEach(function (item) {
				renderer( settings, insert, item );
			});
		}
	
		// Processing floats on top, so it isn't an inserted feature
		_processingHtml( settings );
	}
	
	/**
	 * Draw the table with the legacy DOM property
	 * @param {*} settings DT settings object
	 * @param {*} dom DOM string
	 * @param {*} insert Insert point
	 */
	function _fnLayoutDom( settings, dom, insert )
	{
		var parts = dom.match(/(".*?")|('.*?')|./g);
		var featureNode, option, newNode, next, attr;
	
		for ( var i=0 ; i<parts.length ; i++ ) {
			featureNode = null;
			option = parts[i];
	
			if ( option == '<' ) {
				// New container div
				newNode = $('<div/>');
	
				// Check to see if we should append an id and/or a class name to the container
				next = parts[i+1];
	
				if ( next[0] == "'" || next[0] == '"' ) {
					attr = next.replace(/['"]/g, '');
	
					var id = '', className;
	
					/* The attribute can be in the format of "#id.class", "#id" or "class" This logic
					 * breaks the string into parts and applies them as needed
					 */
					if ( attr.indexOf('.') != -1 ) {
						var split = attr.split('.');
	
						id = split[0];
						className = split[1];
					}
					else if ( attr[0] == "#" ) {
						id = attr;
					}
					else {
						className = attr;
					}
	
					newNode
						.attr('id', id.substring(1))
						.addClass(className);
	
					i++; // Move along the position array
				}
	
				insert.append( newNode );
				insert = newNode;
			}
			else if ( option == '>' ) {
				// End container div
				insert = insert.parent();
			}
			else if ( option == 't' ) {
				// Table
				featureNode = _fnFeatureHtmlTable( settings );
			}
			else
			{
				DataTable.ext.feature.forEach(function(feature) {
					if ( option == feature.cFeature ) {
						featureNode = feature.fnInit( settings );
					}
				});
			}
	
			// Add to the display
			if ( featureNode ) {
				insert.append( featureNode );
			}
		}
	}
	
	
	/**
	 * Use the DOM source to create up an array of header cells. The idea here is to
	 * create a layout grid (array) of rows x columns, which contains a reference
	 * to the cell that that point in the grid (regardless of col/rowspan), such that
	 * any column / row could be removed and the new grid constructed
	 *  @param {node} thead The header/footer element for the table
	 *  @returns {array} Calculated layout array
	 *  @memberof DataTable#oApi
	 */
	function _fnDetectHeader ( settings, thead, write )
	{
		var columns = settings.aoColumns;
		var rows = $(thead).children('tr');
		var row, cell;
		var i, k, l, iLen, shifted, column, colspan, rowspan;
		var isHeader = thead && thead.nodeName.toLowerCase() === 'thead';
		var layout = [];
		var unique;
		var shift = function ( a, i, j ) {
			var k = a[i];
			while ( k[j] ) {
				j++;
			}
			return j;
		};
	
		// We know how many rows there are in the layout - so prep it
		for ( i=0, iLen=rows.length ; i<iLen ; i++ ) {
			layout.push( [] );
		}
	
		for ( i=0, iLen=rows.length ; i<iLen ; i++ ) {
			row = rows[i];
			column = 0;
	
			// For every cell in the row..
			cell = row.firstChild;
			while ( cell ) {
				if (
					cell.nodeName.toUpperCase() == 'TD' ||
					cell.nodeName.toUpperCase() == 'TH'
				) {
					var cols = [];
	
					// Get the col and rowspan attributes from the DOM and sanitise them
					colspan = cell.getAttribute('colspan') * 1;
					rowspan = cell.getAttribute('rowspan') * 1;
					colspan = (!colspan || colspan===0 || colspan===1) ? 1 : colspan;
					rowspan = (!rowspan || rowspan===0 || rowspan===1) ? 1 : rowspan;
	
					// There might be colspan cells already in this row, so shift our target
					// accordingly
					shifted = shift( layout, i, column );
	
					// Cache calculation for unique columns
					unique = colspan === 1 ?
						true :
						false;
					
					// Perform header setup
					if ( write ) {
						if (unique) {
							// Allow column options to be set from HTML attributes
							_fnColumnOptions( settings, shifted, $(cell).data() );
							
							// Get the width for the column. This can be defined from the
							// width attribute, style attribute or `columns.width` option
							var columnDef = columns[shifted];
							var width = cell.getAttribute('width') || null;
							var t = cell.style.width.match(/width:\s*(\d+[pxem%]+)/);
							if ( t ) {
								width = t[1];
							}
	
							columnDef.sWidthOrig = columnDef.sWidth || width;
	
							if (isHeader) {
								// Column title handling - can be user set, or read from the DOM
								// This happens before the render, so the original is still in place
								if ( columnDef.sTitle !== null && ! columnDef.autoTitle ) {
									cell.innerHTML = columnDef.sTitle;
								}
	
								if (! columnDef.sTitle && unique) {
									columnDef.sTitle = _stripHtml(cell.innerHTML);
									columnDef.autoTitle = true;
								}
							}
							else {
								// Footer specific operations
								if (columnDef.footer) {
									cell.innerHTML = columnDef.footer;
								}
							}
	
							// Fall back to the aria-label attribute on the table header if no ariaTitle is
							// provided.
							if (! columnDef.ariaTitle) {
								columnDef.ariaTitle = $(cell).attr("aria-label") || columnDef.sTitle;
							}
	
							// Column specific class names
							if ( columnDef.className ) {
								$(cell).addClass( columnDef.className );
							}
						}
	
						// Wrap the column title so we can write to it in future
						if ( $('span.dt-column-title', cell).length === 0) {
							$('<span>')
								.addClass('dt-column-title')
								.append(cell.childNodes)
								.appendTo(cell);
						}
	
						if ( isHeader && $('span.dt-column-order', cell).length === 0) {
							$('<span>')
								.addClass('dt-column-order')
								.appendTo(cell);
						}
					}
	
					// If there is col / rowspan, copy the information into the layout grid
					for ( l=0 ; l<colspan ; l++ ) {
						for ( k=0 ; k<rowspan ; k++ ) {
							layout[i+k][shifted+l] = {
								cell: cell,
								unique: unique
							};
	
							layout[i+k].row = row;
						}
	
						cols.push( shifted+l );
					}
	
					// Assign an attribute so spanning cells can still be identified
					// as belonging to a column
					cell.setAttribute('data-dt-column', _unique(cols).join(','));
				}
	
				cell = cell.nextSibling;
			}
		}
	
		return layout;
	}
	
	/**
	 * Set the start position for draw
	 *  @param {object} oSettings dataTables settings object
	 */
	function _fnStart( oSettings )
	{
		var bServerSide = _fnDataSource( oSettings ) == 'ssp';
		var iInitDisplayStart = oSettings.iInitDisplayStart;
	
		// Check and see if we have an initial draw position from state saving
		if ( iInitDisplayStart !== undefined && iInitDisplayStart !== -1 )
		{
			oSettings._iDisplayStart = bServerSide ?
				iInitDisplayStart :
				iInitDisplayStart >= oSettings.fnRecordsDisplay() ?
					0 :
					iInitDisplayStart;
	
			oSettings.iInitDisplayStart = -1;
		}
	}
	
	/**
	 * Create an Ajax call based on the table's settings, taking into account that
	 * parameters can have multiple forms, and backwards compatibility.
	 *
	 * @param {object} oSettings dataTables settings object
	 * @param {array} data Data to send to the server, required by
	 *     DataTables - may be augmented by developer callbacks
	 * @param {function} fn Callback function to run when data is obtained
	 */
	function _fnBuildAjax( oSettings, data, fn )
	{
		var ajaxData;
		var ajax = oSettings.ajax;
		var instance = oSettings.oInstance;
		var callback = function ( json ) {
			var status = oSettings.jqXHR
				? oSettings.jqXHR.status
				: null;
	
			if ( json === null || (typeof status === 'number' && status == 204 ) ) {
				json = {};
				_fnAjaxDataSrc( oSettings, json, [] );
			}
	
			var error = json.error || json.sError;
			if ( error ) {
				_fnLog( oSettings, 0, error );
			}
	
			// Microsoft often wrap JSON as a string in another JSON object
			// Let's handle that automatically
			if (json.d && typeof json.d === 'string') {
				try {
					json = JSON.parse(json.d);
				}
				catch (e) {
					// noop
				}
			}
	
			oSettings.json = json;
	
			_fnCallbackFire( oSettings, null, 'xhr', [oSettings, json, oSettings.jqXHR], true );
			fn( json );
		};
	
		if ( $.isPlainObject( ajax ) && ajax.data )
		{
			ajaxData = ajax.data;
	
			var newData = typeof ajaxData === 'function' ?
				ajaxData( data, oSettings ) :  // fn can manipulate data or return
				ajaxData;                      // an object object or array to merge
	
			// If the function returned something, use that alone
			data = typeof ajaxData === 'function' && newData ?
				newData :
				$.extend( true, data, newData );
	
			// Remove the data property as we've resolved it already and don't want
			// jQuery to do it again (it is restored at the end of the function)
			delete ajax.data;
		}
	
		var baseAjax = {
			"url": typeof ajax === 'string' ?
				ajax :
				'',
			"data": data,
			"success": callback,
			"dataType": "json",
			"cache": false,
			"type": oSettings.sServerMethod,
			"error": function (xhr, error) {
				var ret = _fnCallbackFire( oSettings, null, 'xhr', [oSettings, null, oSettings.jqXHR], true );
	
				if ( ret.indexOf(true) === -1 ) {
					if ( error == "parsererror" ) {
						_fnLog( oSettings, 0, 'Invalid JSON response', 1 );
					}
					else if ( xhr.readyState === 4 ) {
						_fnLog( oSettings, 0, 'Ajax error', 7 );
					}
				}
	
				_fnProcessingDisplay( oSettings, false );
			}
		};
	
		// If `ajax` option is an object, extend and override our default base
		if ( $.isPlainObject( ajax ) ) {
			$.extend( baseAjax, ajax )
		}
	
		// Store the data submitted for the API
		oSettings.oAjaxData = data;
	
		// Allow plug-ins and external processes to modify the data
		_fnCallbackFire( oSettings, null, 'preXhr', [oSettings, data, baseAjax], true );
	
		if ( typeof ajax === 'function' )
		{
			// Is a function - let the caller define what needs to be done
			oSettings.jqXHR = ajax.call( instance, data, callback, oSettings );
		}
		else if (ajax.url === '') {
			// No url, so don't load any data. Just apply an empty data array
			// to the object for the callback.
			var empty = {};
	
			DataTable.util.set(ajax.dataSrc)(empty, []);
			callback(empty);
		}
		else {
			// Object to extend the base settings
			oSettings.jqXHR = $.ajax( baseAjax );
		}
	
		// Restore for next time around
		if ( ajaxData ) {
			ajax.data = ajaxData;
		}
	}
	
	
	/**
	 * Update the table using an Ajax call
	 *  @param {object} settings dataTables settings object
	 *  @returns {boolean} Block the table drawing or not
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxUpdate( settings )
	{
		settings.iDraw++;
		_fnProcessingDisplay( settings, true );
	
		_fnBuildAjax(
			settings,
			_fnAjaxParameters( settings ),
			function(json) {
				_fnAjaxUpdateDraw( settings, json );
			}
		);
	}
	
	
	/**
	 * Build up the parameters in an object needed for a server-side processing
	 * request.
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {bool} block the table drawing or not
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxParameters( settings )
	{
		var
			columns = settings.aoColumns,
			features = settings.oFeatures,
			preSearch = settings.oPreviousSearch,
			preColSearch = settings.aoPreSearchCols,
			colData = function ( idx, prop ) {
				return typeof columns[idx][prop] === 'function' ?
					'function' :
					columns[idx][prop];
			};
	
		return {
			draw: settings.iDraw,
			columns: columns.map( function ( column, i ) {
				return {
					data: colData(i, 'mData'),
					name: column.sName,
					searchable: column.bSearchable,
					orderable: column.bSortable,
					search: {
						value: preColSearch[i].search,
						regex: preColSearch[i].regex,
						fixed: Object.keys(column.searchFixed).map( function(name) {
							return {
								name: name,
								term: column.searchFixed[name].toString()
							}
						})
					}
				};
			} ),
			order: _fnSortFlatten( settings ).map( function ( val ) {
				return {
					column: val.col,
					dir: val.dir,
					name: colData(val.col, 'sName')
				};
			} ),
			start: settings._iDisplayStart,
			length: features.bPaginate ?
				settings._iDisplayLength :
				-1,
			search: {
				value: preSearch.search,
				regex: preSearch.regex,
				fixed: Object.keys(settings.searchFixed).map( function(name) {
					return {
						name: name,
						term: settings.searchFixed[name].toString()
					}
				})
			}
		};
	}
	
	
	/**
	 * Data the data from the server (nuking the old) and redraw the table
	 *  @param {object} oSettings dataTables settings object
	 *  @param {object} json json data return from the server.
	 *  @param {string} json.sEcho Tracking flag for DataTables to match requests
	 *  @param {int} json.iTotalRecords Number of records in the data set, not accounting for filtering
	 *  @param {int} json.iTotalDisplayRecords Number of records in the data set, accounting for filtering
	 *  @param {array} json.aaData The data to display on this page
	 *  @param {string} [json.sColumns] Column ordering (sName, comma separated)
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxUpdateDraw ( settings, json )
	{
		var data = _fnAjaxDataSrc(settings, json);
		var draw = _fnAjaxDataSrcParam(settings, 'draw', json);
		var recordsTotal = _fnAjaxDataSrcParam(settings, 'recordsTotal', json);
		var recordsFiltered = _fnAjaxDataSrcParam(settings, 'recordsFiltered', json);
	
		if ( draw !== undefined ) {
			// Protect against out of sequence returns
			if ( draw*1 < settings.iDraw ) {
				return;
			}
			settings.iDraw = draw * 1;
		}
	
		// No data in returned object, so rather than an array, we show an empty table
		if ( ! data ) {
			data = [];
		}
	
		_fnClearTable( settings );
		settings._iRecordsTotal   = parseInt(recordsTotal, 10);
		settings._iRecordsDisplay = parseInt(recordsFiltered, 10);
	
		for ( var i=0, ien=data.length ; i<ien ; i++ ) {
			_fnAddData( settings, data[i] );
		}
		settings.aiDisplay = settings.aiDisplayMaster.slice();
	
		_fnColumnTypes(settings);
		_fnDraw( settings, true );
		_fnInitComplete( settings );
		_fnProcessingDisplay( settings, false );
	}
	
	
	/**
	 * Get the data from the JSON data source to use for drawing a table. Using
	 * `_fnGetObjectDataFn` allows the data to be sourced from a property of the
	 * source object, or from a processing function.
	 *  @param {object} settings dataTables settings object
	 *  @param  {object} json Data source object / array from the server
	 *  @return {array} Array of data to use
	 */
	function _fnAjaxDataSrc ( settings, json, write )
	{
		var dataProp = 'data';
	
		if ($.isPlainObject( settings.ajax ) && settings.ajax.dataSrc !== undefined) {
			// Could in inside a `dataSrc` object, or not!
			var dataSrc = settings.ajax.dataSrc;
	
			// string, function and object are valid types
			if (typeof dataSrc === 'string' || typeof dataSrc === 'function') {
				dataProp = dataSrc;
			}
			else if (dataSrc.data !== undefined) {
				dataProp = dataSrc.data;
			}
		}
	
		if ( ! write ) {
			if ( dataProp === 'data' ) {
				// If the default, then we still want to support the old style, and safely ignore
				// it if possible
				return json.aaData || json[dataProp];
			}
	
			return dataProp !== "" ?
				_fnGetObjectDataFn( dataProp )( json ) :
				json;
		}
		
		// set
		_fnSetObjectDataFn( dataProp )( json, write );
	}
	
	/**
	 * Very similar to _fnAjaxDataSrc, but for the other SSP properties
	 * @param {*} settings DataTables settings object
	 * @param {*} param Target parameter
	 * @param {*} json JSON data
	 * @returns Resolved value
	 */
	function _fnAjaxDataSrcParam (settings, param, json) {
		var dataSrc = $.isPlainObject( settings.ajax )
			? settings.ajax.dataSrc
			: null;
	
		if (dataSrc && dataSrc[param]) {
			// Get from custom location
			return _fnGetObjectDataFn( dataSrc[param] )( json );
		}
	
		// else - Default behaviour
		var old = '';
	
		// Legacy support
		if (param === 'draw') {
			old = 'sEcho';
		}
		else if (param === 'recordsTotal') {
			old = 'iTotalRecords';
		}
		else if (param === 'recordsFiltered') {
			old = 'iTotalDisplayRecords';
		}
	
		return json[old] !== undefined
			? json[old]
			: json[param];
	}
	
	
	/**
	 * Filter the table using both the global filter and column based filtering
	 *  @param {object} settings dataTables settings object
	 *  @param {object} input search information
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterComplete ( settings, input )
	{
		var columnsSearch = settings.aoPreSearchCols;
	
		// In server-side processing all filtering is done by the server, so no point hanging around here
		if ( _fnDataSource( settings ) != 'ssp' )
		{
			// Check if any of the rows were invalidated
			_fnFilterData( settings );
	
			// Start from the full data set
			settings.aiDisplay = settings.aiDisplayMaster.slice();
	
			// Global filter first
			_fnFilter( settings.aiDisplay, settings, input.search, input );
	
			$.each(settings.searchFixed, function (name, term) {
				_fnFilter(settings.aiDisplay, settings, term, {});
			});
	
			// Then individual column filters
			for ( var i=0 ; i<columnsSearch.length ; i++ )
			{
				var col = columnsSearch[i];
	
				_fnFilter(
					settings.aiDisplay,
					settings,
					col.search,
					col,
					i
				);
	
				$.each(settings.aoColumns[i].searchFixed, function (name, term) {
					_fnFilter(settings.aiDisplay, settings, term, {}, i);
				});
			}
	
			// And finally global filtering
			_fnFilterCustom( settings );
		}
	
		// Tell the draw function we have been filtering
		settings.bFiltered = true;
	
		_fnCallbackFire( settings, null, 'search', [settings] );
	}
	
	
	/**
	 * Apply custom filtering functions
	 * 
	 * This is legacy now that we have named functions, but it is widely used
	 * from 1.x, so it is not yet deprecated.
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterCustom( settings )
	{
		var filters = DataTable.ext.search;
		var displayRows = settings.aiDisplay;
		var row, rowIdx;
	
		for ( var i=0, ien=filters.length ; i<ien ; i++ ) {
			var rows = [];
	
			// Loop over each row and see if it should be included
			for ( var j=0, jen=displayRows.length ; j<jen ; j++ ) {
				rowIdx = displayRows[ j ];
				row = settings.aoData[ rowIdx ];
	
				if ( filters[i]( settings, row._aFilterData, rowIdx, row._aData, j ) ) {
					rows.push( rowIdx );
				}
			}
	
			// So the array reference doesn't break set the results into the
			// existing array
			displayRows.length = 0;
			_fnArrayApply(displayRows, rows);
		}
	}
	
	
	/**
	 * Filter the data table based on user input and draw the table
	 */
	function _fnFilter( searchRows, settings, input, options, column )
	{
		if ( input === '' ) {
			return;
		}
	
		var i = 0;
		var matched = [];
	
		// Search term can be a function, regex or string - if a string we apply our
		// smart filtering regex (assuming the options require that)
		var searchFunc = typeof input === 'function' ? input : null;
		var rpSearch = input instanceof RegExp
			? input
			: searchFunc
				? null
				: _fnFilterCreateSearch( input, options );
	
		// Then for each row, does the test pass. If not, lop the row from the array
		for (i=0 ; i<searchRows.length ; i++) {
			var row = settings.aoData[ searchRows[i] ];
			var data = column === undefined
				? row._sFilterRow
				: row._aFilterData[ column ];
	
			if ( (searchFunc && searchFunc(data, row._aData, searchRows[i], column)) || (rpSearch && rpSearch.test(data)) ) {
				matched.push(searchRows[i]);
			}
		}
	
		// Mutate the searchRows array
		searchRows.length = matched.length;
	
		for (i=0 ; i<matched.length ; i++) {
			searchRows[i] = matched[i];
		}
	}
	
	
	/**
	 * Build a regular expression object suitable for searching a table
	 *  @param {string} sSearch string to search for
	 *  @param {bool} bRegex treat as a regular expression or not
	 *  @param {bool} bSmart perform smart filtering or not
	 *  @param {bool} bCaseInsensitive Do case insensitive matching or not
	 *  @returns {RegExp} constructed object
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterCreateSearch( search, inOpts )
	{
		var not = [];
		var options = $.extend({}, {
			boundary: false,
			caseInsensitive: true,
			exact: false,
			regex: false,
			smart: true
		}, inOpts);
	
		if (typeof search !== 'string') {
			search = search.toString();
		}
	
		// Remove diacritics if normalize is set up to do so
		search = _normalize(search);
	
		if (options.exact) {
			return new RegExp(
				'^'+_fnEscapeRegex(search)+'$',
				options.caseInsensitive ? 'i' : ''
			);
		}
	
		search = options.regex ?
			search :
			_fnEscapeRegex( search );
		
		if ( options.smart ) {
			/* For smart filtering we want to allow the search to work regardless of
			 * word order. We also want double quoted text to be preserved, so word
			 * order is important - a la google. And a negative look around for
			 * finding rows which don't contain a given string.
			 * 
			 * So this is the sort of thing we want to generate:
			 * 
			 * ^(?=.*?\bone\b)(?=.*?\btwo three\b)(?=.*?\bfour\b).*$
			 */
			var parts = search.match( /!?["\u201C][^"\u201D]+["\u201D]|[^ ]+/g ) || [''];
			var a = parts.map( function ( word ) {
				var negative = false;
				var m;
	
				// Determine if it is a "does not include"
				if ( word.charAt(0) === '!' ) {
					negative = true;
					word = word.substring(1);
				}
	
				// Strip the quotes from around matched phrases
				if ( word.charAt(0) === '"' ) {
					m = word.match( /^"(.*)"$/ );
					word = m ? m[1] : word;
				}
				else if ( word.charAt(0) === '\u201C' ) {
					// Smart quote match (iPhone users)
					m = word.match( /^\u201C(.*)\u201D$/ );
					word = m ? m[1] : word;
				}
	
				// For our "not" case, we need to modify the string that is
				// allowed to match at the end of the expression.
				if (negative) {
					if (word.length > 1) {
						not.push('(?!'+word+')');
					}
	
					word = '';
				}
	
				return word.replace(/"/g, '');
			} );
	
			var match = not.length
				? not.join('')
				: '';
	
			var boundary = options.boundary
				? '\\b'
				: '';
	
			search = '^(?=.*?'+boundary+a.join( ')(?=.*?'+boundary )+')('+match+'.)*$';
		}
	
		return new RegExp( search, options.caseInsensitive ? 'i' : '' );
	}
	
	
	/**
	 * Escape a string such that it can be used in a regular expression
	 *  @param {string} sVal string to escape
	 *  @returns {string} escaped string
	 *  @memberof DataTable#oApi
	 */
	var _fnEscapeRegex = DataTable.util.escapeRegex;
	
	var __filter_div = $('<div>')[0];
	var __filter_div_textContent = __filter_div.textContent !== undefined;
	
	// Update the filtering data for each row if needed (by invalidation or first run)
	function _fnFilterData ( settings )
	{
		var columns = settings.aoColumns;
		var data = settings.aoData;
		var column;
		var j, jen, filterData, cellData, row;
		var wasInvalidated = false;
	
		for ( var rowIdx=0 ; rowIdx<data.length ; rowIdx++ ) {
			if (! data[rowIdx]) {
				continue;
			}
	
			row = data[rowIdx];
	
			if ( ! row._aFilterData ) {
				filterData = [];
	
				for ( j=0, jen=columns.length ; j<jen ; j++ ) {
					column = columns[j];
	
					if ( column.bSearchable ) {
						cellData = _fnGetCellData( settings, rowIdx, j, 'filter' );
	
						// Search in DataTables is string based
						if ( cellData === null ) {
							cellData = '';
						}
	
						if ( typeof cellData !== 'string' && cellData.toString ) {
							cellData = cellData.toString();
						}
					}
					else {
						cellData = '';
					}
	
					// If it looks like there is an HTML entity in the string,
					// attempt to decode it so sorting works as expected. Note that
					// we could use a single line of jQuery to do this, but the DOM
					// method used here is much faster https://jsperf.com/html-decode
					if ( cellData.indexOf && cellData.indexOf('&') !== -1 ) {
						__filter_div.innerHTML = cellData;
						cellData = __filter_div_textContent ?
							__filter_div.textContent :
							__filter_div.innerText;
					}
	
					if ( cellData.replace ) {
						cellData = cellData.replace(/[\r\n\u2028]/g, '');
					}
	
					filterData.push( cellData );
				}
	
				row._aFilterData = filterData;
				row._sFilterRow = filterData.join('  ');
				wasInvalidated = true;
			}
		}
	
		return wasInvalidated;
	}
	
	
	/**
	 * Draw the table for the first time, adding all required features
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnInitialise ( settings )
	{
		var i;
		var init = settings.oInit;
		var deferLoading = settings.deferLoading;
		var dataSrc = _fnDataSource( settings );
	
		// Ensure that the table data is fully initialised
		if ( ! settings.bInitialised ) {
			setTimeout( function(){ _fnInitialise( settings ); }, 200 );
			return;
		}
	
		// Build the header / footer for the table
		_fnBuildHead( settings, 'header' );
		_fnBuildHead( settings, 'footer' );
	
		// Load the table's state (if needed) and then render around it and draw
		_fnLoadState( settings, init, function () {
			// Then draw the header / footer
			_fnDrawHead( settings, settings.aoHeader );
			_fnDrawHead( settings, settings.aoFooter );
	
			// Cache the paging start point, as the first redraw will reset it
			var iAjaxStart = settings.iInitDisplayStart
	
			// Local data load
			// Check if there is data passing into the constructor
			if ( init.aaData ) {
				for ( i=0 ; i<init.aaData.length ; i++ ) {
					_fnAddData( settings, init.aaData[ i ] );
				}
			}
			else if ( deferLoading || dataSrc == 'dom' ) {
				// Grab the data from the page
				_fnAddTr( settings, $(settings.nTBody).children('tr') );
			}
	
			// Filter not yet applied - copy the display master
			settings.aiDisplay = settings.aiDisplayMaster.slice();
	
			// Enable features
			_fnAddOptionsHtml( settings );
			_fnSortInit( settings );
	
			_colGroup( settings );
	
			/* Okay to show that something is going on now */
			_fnProcessingDisplay( settings, true );
	
			_fnCallbackFire( settings, null, 'preInit', [settings], true );
	
			// If there is default sorting required - let's do it. The sort function
			// will do the drawing for us. Otherwise we draw the table regardless of the
			// Ajax source - this allows the table to look initialised for Ajax sourcing
			// data (show 'loading' message possibly)
			_fnReDraw( settings );
	
			// Server-side processing init complete is done by _fnAjaxUpdateDraw
			if ( dataSrc != 'ssp' || deferLoading ) {
				// if there is an ajax source load the data
				if ( dataSrc == 'ajax' ) {
					_fnBuildAjax( settings, {}, function(json) {
						var aData = _fnAjaxDataSrc( settings, json );
	
						// Got the data - add it to the table
						for ( i=0 ; i<aData.length ; i++ ) {
							_fnAddData( settings, aData[i] );
						}
	
						// Reset the init display for cookie saving. We've already done
						// a filter, and therefore cleared it before. So we need to make
						// it appear 'fresh'
						settings.iInitDisplayStart = iAjaxStart;
	
						_fnReDraw( settings );
						_fnProcessingDisplay( settings, false );
						_fnInitComplete( settings );
					}, settings );
				}
				else {
					_fnInitComplete( settings );
					_fnProcessingDisplay( settings, false );
				}
			}
		} );
	}
	
	
	/**
	 * Draw the table for the first time, adding all required features
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnInitComplete ( settings )
	{
		if (settings._bInitComplete) {
			return;
		}
	
		var args = [settings, settings.json];
	
		settings._bInitComplete = true;
	
		// Table is fully set up and we have data, so calculate the
		// column widths
		_fnAdjustColumnSizing( settings );
	
		_fnCallbackFire( settings, null, 'plugin-init', args, true );
		_fnCallbackFire( settings, 'aoInitComplete', 'init', args, true );
	}
	
	function _fnLengthChange ( settings, val )
	{
		var len = parseInt( val, 10 );
		settings._iDisplayLength = len;
	
		_fnLengthOverflow( settings );
	
		// Fire length change event
		_fnCallbackFire( settings, null, 'length', [settings, len] );
	}
	
	/**
	 * Alter the display settings to change the page
	 *  @param {object} settings DataTables settings object
	 *  @param {string|int} action Paging action to take: "first", "previous",
	 *    "next" or "last" or page number to jump to (integer)
	 *  @param [bool] redraw Automatically draw the update or not
	 *  @returns {bool} true page has changed, false - no change
	 *  @memberof DataTable#oApi
	 */
	function _fnPageChange ( settings, action, redraw )
	{
		var
			start     = settings._iDisplayStart,
			len       = settings._iDisplayLength,
			records   = settings.fnRecordsDisplay();
	
		if ( records === 0 || len === -1 )
		{
			start = 0;
		}
		else if ( typeof action === "number" )
		{
			start = action * len;
	
			if ( start > records )
			{
				start = 0;
			}
		}
		else if ( action == "first" )
		{
			start = 0;
		}
		else if ( action == "previous" )
		{
			start = len >= 0 ?
				start - len :
				0;
	
			if ( start < 0 )
			{
				start = 0;
			}
		}
		else if ( action == "next" )
		{
			if ( start + len < records )
			{
				start += len;
			}
		}
		else if ( action == "last" )
		{
			start = Math.floor( (records-1) / len) * len;
		}
		else if ( action === 'ellipsis' )
		{
			return;
		}
		else
		{
			_fnLog( settings, 0, "Unknown paging action: "+action, 5 );
		}
	
		var changed = settings._iDisplayStart !== start;
		settings._iDisplayStart = start;
	
		_fnCallbackFire( settings, null, changed ? 'page' : 'page-nc', [settings] );
	
		if ( changed && redraw ) {
			_fnDraw( settings );
		}
	
		return changed;
	}
	
	
	/**
	 * Generate the node required for the processing node
	 *  @param {object} settings DataTables settings object
	 */
	function _processingHtml ( settings )
	{
		var table = settings.nTable;
		var scrolling = settings.oScroll.sX !== '' || settings.oScroll.sY !== '';
	
		if ( settings.oFeatures.bProcessing ) {
			var n = $('<div/>', {
					'id': settings.sTableId + '_processing',
					'class': settings.oClasses.processing.container,
					'role': 'status'
				} )
				.html( settings.oLanguage.sProcessing )
				.append('<div><div></div><div></div><div></div><div></div></div>');
	
			// Different positioning depending on if scrolling is enabled or not
			if (scrolling) {
				n.prependTo( $('div.dt-scroll', settings.nTableWrapper) );
			}
			else {
				n.insertBefore( table );
			}
	
			$(table).on( 'processing.dt.DT', function (e, s, show) {
				n.css( 'display', show ? 'block' : 'none' );
			} );
		}
	}
	
	
	/**
	 * Display or hide the processing indicator
	 *  @param {object} settings DataTables settings object
	 *  @param {bool} show Show the processing indicator (true) or not (false)
	 */
	function _fnProcessingDisplay ( settings, show )
	{
		// Ignore cases when we are still redrawing
		if (settings.bDrawing && show === false) {
			return;
		}
	
		_fnCallbackFire( settings, null, 'processing', [settings, show] );
	}
	
	/**
	 * Show the processing element if an action takes longer than a given time
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} enable Do (true) or not (false) async processing (local feature enablement)
	 * @param {*} run Function to run
	 */
	function _fnProcessingRun( settings, enable, run ) {
		if (! enable) {
			// Immediate execution, synchronous
			run();
		}
		else {
			_fnProcessingDisplay(settings, true);
			
			// Allow the processing display to show if needed
			setTimeout(function () {
				run();
	
				_fnProcessingDisplay(settings, false);
			}, 0);
		}
	}
	/**
	 * Add any control elements for the table - specifically scrolling
	 *  @param {object} settings dataTables settings object
	 *  @returns {node} Node to add to the DOM
	 *  @memberof DataTable#oApi
	 */
	function _fnFeatureHtmlTable ( settings )
	{
		var table = $(settings.nTable);
	
		// Scrolling from here on in
		var scroll = settings.oScroll;
	
		if ( scroll.sX === '' && scroll.sY === '' ) {
			return settings.nTable;
		}
	
		var scrollX = scroll.sX;
		var scrollY = scroll.sY;
		var classes = settings.oClasses.scrolling;
		var caption = settings.captionNode;
		var captionSide = caption ? caption._captionSide : null;
		var headerClone = $( table[0].cloneNode(false) );
		var footerClone = $( table[0].cloneNode(false) );
		var footer = table.children('tfoot');
		var _div = '<div/>';
		var size = function ( s ) {
			return !s ? null : _fnStringToCss( s );
		};
	
		if ( ! footer.length ) {
			footer = null;
		}
	
		/*
		 * The HTML structure that we want to generate in this function is:
		 *  div - scroller
		 *    div - scroll head
		 *      div - scroll head inner
		 *        table - scroll head table
		 *          thead - thead
		 *    div - scroll body
		 *      table - table (master table)
		 *        thead - thead clone for sizing
		 *        tbody - tbody
		 *    div - scroll foot
		 *      div - scroll foot inner
		 *        table - scroll foot table
		 *          tfoot - tfoot
		 */
		var scroller = $( _div, { 'class': classes.container } )
			.append(
				$(_div, { 'class': classes.header.self } )
					.css( {
						overflow: 'hidden',
						position: 'relative',
						border: 0,
						width: scrollX ? size(scrollX) : '100%'
					} )
					.append(
						$(_div, { 'class': classes.header.inner } )
							.css( {
								'box-sizing': 'content-box',
								width: scroll.sXInner || '100%'
							} )
							.append(
								headerClone
									.removeAttr('id')
									.css( 'margin-left', 0 )
									.append( captionSide === 'top' ? caption : null )
									.append(
										table.children('thead')
									)
							)
					)
			)
			.append(
				$(_div, { 'class': classes.body } )
					.css( {
						position: 'relative',
						overflow: 'auto',
						width: size( scrollX )
					} )
					.append( table )
			);
	
		if ( footer ) {
			scroller.append(
				$(_div, { 'class': classes.footer.self } )
					.css( {
						overflow: 'hidden',
						border: 0,
						width: scrollX ? size(scrollX) : '100%'
					} )
					.append(
						$(_div, { 'class': classes.footer.inner } )
							.append(
								footerClone
									.removeAttr('id')
									.css( 'margin-left', 0 )
									.append( captionSide === 'bottom' ? caption : null )
									.append(
										table.children('tfoot')
									)
							)
					)
			);
		}
	
		var children = scroller.children();
		var scrollHead = children[0];
		var scrollBody = children[1];
		var scrollFoot = footer ? children[2] : null;
	
		// When the body is scrolled, then we also want to scroll the headers
		$(scrollBody).on( 'scroll.DT', function () {
			var scrollLeft = this.scrollLeft;
	
			scrollHead.scrollLeft = scrollLeft;
	
			if ( footer ) {
				scrollFoot.scrollLeft = scrollLeft;
			}
		} );
	
		// When focus is put on the header cells, we might need to scroll the body
		$('th, td', scrollHead).on('focus', function () {
			var scrollLeft = scrollHead.scrollLeft;
	
			scrollBody.scrollLeft = scrollLeft;
	
			if ( footer ) {
				scrollBody.scrollLeft = scrollLeft;
			}
		});
	
		$(scrollBody).css('max-height', scrollY);
		if (! scroll.bCollapse) {
			$(scrollBody).css('height', scrollY);
		}
	
		settings.nScrollHead = scrollHead;
		settings.nScrollBody = scrollBody;
		settings.nScrollFoot = scrollFoot;
	
		// On redraw - align columns
		settings.aoDrawCallback.push(_fnScrollDraw);
	
		return scroller[0];
	}
	
	
	
	/**
	 * Update the header, footer and body tables for resizing - i.e. column
	 * alignment.
	 *
	 * Welcome to the most horrible function DataTables. The process that this
	 * function follows is basically:
	 *   1. Re-create the table inside the scrolling div
	 *   2. Correct colgroup > col values if needed
	 *   3. Copy colgroup > col over to header and footer
	 *   4. Clean up
	 *
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnScrollDraw ( settings )
	{
		// Given that this is such a monster function, a lot of variables are use
		// to try and keep the minimised size as small as possible
		var
			scroll         = settings.oScroll,
			barWidth       = scroll.iBarWidth,
			divHeader      = $(settings.nScrollHead),
			divHeaderInner = divHeader.children('div'),
			divHeaderTable = divHeaderInner.children('table'),
			divBodyEl      = settings.nScrollBody,
			divBody        = $(divBodyEl),
			divFooter      = $(settings.nScrollFoot),
			divFooterInner = divFooter.children('div'),
			divFooterTable = divFooterInner.children('table'),
			header         = $(settings.nTHead),
			table          = $(settings.nTable),
			footer         = settings.nTFoot && $('th, td', settings.nTFoot).length ? $(settings.nTFoot) : null,
			browser        = settings.oBrowser,
			headerCopy, footerCopy;
	
		// If the scrollbar visibility has changed from the last draw, we need to
		// adjust the column sizes as the table width will have changed to account
		// for the scrollbar
		var scrollBarVis = divBodyEl.scrollHeight > divBodyEl.clientHeight;
		
		if ( settings.scrollBarVis !== scrollBarVis && settings.scrollBarVis !== undefined ) {
			settings.scrollBarVis = scrollBarVis;
			_fnAdjustColumnSizing( settings );
			return; // adjust column sizing will call this function again
		}
		else {
			settings.scrollBarVis = scrollBarVis;
		}
	
		// 1. Re-create the table inside the scrolling div
		// Remove the old minimised thead and tfoot elements in the inner table
		table.children('thead, tfoot').remove();
	
		// Clone the current header and footer elements and then place it into the inner table
		headerCopy = header.clone().prependTo( table );
		headerCopy.find('th, td').removeAttr('tabindex');
		headerCopy.find('[id]').removeAttr('id');
	
		if ( footer ) {
			footerCopy = footer.clone().prependTo( table );
			footerCopy.find('[id]').removeAttr('id');
		}
	
		// 2. Correct colgroup > col values if needed
		// It is possible that the cell sizes are smaller than the content, so we need to
		// correct colgroup>col for such cases. This can happen if the auto width detection
		// uses a cell which has a longer string, but isn't the widest! For example 
		// "Chief Executive Officer (CEO)" is the longest string in the demo, but
		// "Systems Administrator" is actually the widest string since it doesn't collapse.
		// Note the use of translating into a column index to get the `col` element. This
		// is because of Responsive which might remove `col` elements, knocking the alignment
		// of the indexes out.
		if (settings.aiDisplay.length) {
			// Get the column sizes from the first row in the table. This should really be a
			// [].find, but it wasn't supported in Chrome until Sept 2015, and DT has 10 year
			// browser support
			var firstTr = null;
			var start = _fnDataSource( settings ) !== 'ssp'
				? settings._iDisplayStart
				: 0;
	
			for (i=start ; i<start + settings.aiDisplay.length ; i++) {
				var idx = settings.aiDisplay[i];
				var tr = settings.aoData[idx].nTr;
	
				if (tr) {
					firstTr = tr;
					break;
				}
			}
	
			if (firstTr) {
				var colSizes = $(firstTr).children('th, td').map(function (vis) {
					return {
						idx: _fnVisibleToColumnIndex(settings, vis),
						width: $(this).outerWidth()
					};
				});
	
				// Check against what the colgroup > col is set to and correct if needed
				for (var i=0 ; i<colSizes.length ; i++) {
					var colEl = settings.aoColumns[ colSizes[i].idx ].colEl[0];
					var colWidth = colEl.style.width.replace('px', '');
	
					if (colWidth !== colSizes[i].width) {
						colEl.style.width = colSizes[i].width + 'px';
	
						if (scroll.sX) {
							colEl.style.minWidth = colSizes[i].width + 'px';
						}
					}
				}
			}
		}
	
		// 3. Copy the colgroup over to the header and footer
		divHeaderTable
			.find('colgroup')
			.remove();
	
		divHeaderTable.append(settings.colgroup.clone());
	
		if ( footer ) {
			divFooterTable
				.find('colgroup')
				.remove();
	
			divFooterTable.append(settings.colgroup.clone());
		}
	
		// "Hide" the header and footer that we used for the sizing. We need to keep
		// the content of the cell so that the width applied to the header and body
		// both match, but we want to hide it completely.
		$('th, td', headerCopy).each(function () {
			$(this.childNodes).wrapAll('<div class="dt-scroll-sizing">');
		});
	
		if ( footer ) {
			$('th, td', footerCopy).each(function () {
				$(this.childNodes).wrapAll('<div class="dt-scroll-sizing">');
			});
		}
	
		// 4. Clean up
		// Figure out if there are scrollbar present - if so then we need a the header and footer to
		// provide a bit more space to allow "overflow" scrolling (i.e. past the scrollbar)
		var isScrolling = Math.floor(table.height()) > divBodyEl.clientHeight || divBody.css('overflow-y') == "scroll";
		var paddingSide = 'padding' + (browser.bScrollbarLeft ? 'Left' : 'Right' );
	
		// Set the width's of the header and footer tables
		var outerWidth = table.outerWidth();
	
		divHeaderTable.css('width', _fnStringToCss( outerWidth ));
		divHeaderInner
			.css('width', _fnStringToCss( outerWidth ))
			.css(paddingSide, isScrolling ? barWidth+"px" : "0px");
	
		if ( footer ) {
			divFooterTable.css('width', _fnStringToCss( outerWidth ));
			divFooterInner
				.css('width', _fnStringToCss( outerWidth ))
				.css(paddingSide, isScrolling ? barWidth+"px" : "0px");
		}
	
		// Correct DOM ordering for colgroup - comes before the thead
		table.children('colgroup').prependTo(table);
	
		// Adjust the position of the header in case we loose the y-scrollbar
		divBody.trigger('scroll');
	
		// If sorting or filtering has occurred, jump the scrolling back to the top
		// only if we aren't holding the position
		if ( (settings.bSorted || settings.bFiltered) && ! settings._drawHold ) {
			divBodyEl.scrollTop = 0;
		}
	}
	
	/**
	 * Calculate the width of columns for the table
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnCalculateColumnWidths ( settings )
	{
		// Not interested in doing column width calculation if auto-width is disabled
		if (! settings.oFeatures.bAutoWidth) {
			return;
		}
	
		var
			table = settings.nTable,
			columns = settings.aoColumns,
			scroll = settings.oScroll,
			scrollY = scroll.sY,
			scrollX = scroll.sX,
			scrollXInner = scroll.sXInner,
			visibleColumns = _fnGetColumns( settings, 'bVisible' ),
			tableWidthAttr = table.getAttribute('width'), // from DOM element
			tableContainer = table.parentNode,
			i, column, columnIdx;
			
		var styleWidth = table.style.width;
		var containerWidth = _fnWrapperWidth(settings);
	
		// Don't re-run for the same width as the last time
		if (containerWidth === settings.containerWidth) {
			return false;
		}
	
		settings.containerWidth = containerWidth;
	
		// If there is no width applied as a CSS style or as an attribute, we assume that
		// the width is intended to be 100%, which is usually is in CSS, but it is very
		// difficult to correctly parse the rules to get the final result.
		if ( ! styleWidth && ! tableWidthAttr) {
			table.style.width = '100%';
			styleWidth = '100%';
		}
	
		if ( styleWidth && styleWidth.indexOf('%') !== -1 ) {
			tableWidthAttr = styleWidth;
		}
	
		// Let plug-ins know that we are doing a recalc, in case they have changed any of the
		// visible columns their own way (e.g. Responsive uses display:none).
		_fnCallbackFire(
			settings,
			null,
			'column-calc',
			{visible: visibleColumns},
			false
		);
	
		// Construct a single row, worst case, table with the widest
		// node in the data, assign any user defined widths, then insert it into
		// the DOM and allow the browser to do all the hard work of calculating
		// table widths
		var tmpTable = $(table.cloneNode())
			.css( 'visibility', 'hidden' )
			.removeAttr( 'id' );
	
		// Clean up the table body
		tmpTable.append('<tbody>')
		var tr = $('<tr/>').appendTo( tmpTable.find('tbody') );
	
		// Clone the table header and footer - we can't use the header / footer
		// from the cloned table, since if scrolling is active, the table's
		// real header and footer are contained in different table tags
		tmpTable
			.append( $(settings.nTHead).clone() )
			.append( $(settings.nTFoot).clone() );
	
		// Remove any assigned widths from the footer (from scrolling)
		tmpTable.find('tfoot th, tfoot td').css('width', '');
	
		// Apply custom sizing to the cloned header
		tmpTable.find('thead th, thead td').each( function () {
			// Get the `width` from the header layout
			var width = _fnColumnsSumWidth( settings, this, true, false );
	
			if ( width ) {
				this.style.width = width;
	
				// For scrollX we need to force the column width otherwise the
				// browser will collapse it. If this width is smaller than the
				// width the column requires, then it will have no effect
				if ( scrollX ) {
					this.style.minWidth = width;
	
					$( this ).append( $('<div/>').css( {
						width: width,
						margin: 0,
						padding: 0,
						border: 0,
						height: 1
					} ) );
				}
			}
			else {
				this.style.width = '';
			}
		} );
	
		// Find the widest piece of data for each column and put it into the table
		for ( i=0 ; i<visibleColumns.length ; i++ ) {
			columnIdx = visibleColumns[i];
			column = columns[ columnIdx ];
	
			var longest = _fnGetMaxLenString(settings, columnIdx);
			var autoClass = _ext.type.className[column.sType];
			var text = longest + column.sContentPadding;
			var insert = longest.indexOf('<') === -1
				? document.createTextNode(text)
				: text
			
			$('<td/>')
				.addClass(autoClass)
				.addClass(column.sClass)
				.append(insert)
				.appendTo(tr);
		}
	
		// Tidy the temporary table - remove name attributes so there aren't
		// duplicated in the dom (radio elements for example)
		$('[name]', tmpTable).removeAttr('name');
	
		// Table has been built, attach to the document so we can work with it.
		// A holding element is used, positioned at the top of the container
		// with minimal height, so it has no effect on if the container scrolls
		// or not. Otherwise it might trigger scrolling when it actually isn't
		// needed
		var holder = $('<div/>').css( scrollX || scrollY ?
				{
					position: 'absolute',
					top: 0,
					left: 0,
					height: 1,
					right: 0,
					overflow: 'hidden'
				} :
				{}
			)
			.append( tmpTable )
			.appendTo( tableContainer );
	
		// When scrolling (X or Y) we want to set the width of the table as 
		// appropriate. However, when not scrolling leave the table width as it
		// is. This results in slightly different, but I think correct behaviour
		if ( scrollX && scrollXInner ) {
			tmpTable.width( scrollXInner );
		}
		else if ( scrollX ) {
			tmpTable.css( 'width', 'auto' );
			tmpTable.removeAttr('width');
	
			// If there is no width attribute or style, then allow the table to
			// collapse
			if ( tmpTable.outerWidth() < tableContainer.clientWidth && tableWidthAttr ) {
				tmpTable.outerWidth( tableContainer.clientWidth );
			}
		}
		else if ( scrollY ) {
			tmpTable.outerWidth( tableContainer.clientWidth );
		}
		else if ( tableWidthAttr ) {
			tmpTable.outerWidth( tableWidthAttr );
		}
	
		// Get the width of each column in the constructed table
		var total = 0;
		var bodyCells = tmpTable.find('tbody tr').eq(0).children();
	
		for ( i=0 ; i<visibleColumns.length ; i++ ) {
			// Use getBounding for sub-pixel accuracy, which we then want to round up!
			var bounding = bodyCells[i].getBoundingClientRect().width;
	
			// Total is tracked to remove any sub-pixel errors as the outerWidth
			// of the table might not equal the total given here
			total += bounding;
	
			// Width for each column to use
			columns[ visibleColumns[i] ].sWidth = _fnStringToCss( bounding );
		}
	
		table.style.width = _fnStringToCss( total );
	
		// Finished with the table - ditch it
		holder.remove();
	
		// If there is a width attr, we want to attach an event listener which
		// allows the table sizing to automatically adjust when the window is
		// resized. Use the width attr rather than CSS, since we can't know if the
		// CSS is a relative value or absolute - DOM read is always px.
		if ( tableWidthAttr ) {
			table.style.width = _fnStringToCss( tableWidthAttr );
		}
	
		if ( (tableWidthAttr || scrollX) && ! settings._reszEvt ) {
			var resize = DataTable.util.throttle( function () {
				var newWidth = _fnWrapperWidth(settings);
	
				// Don't do it if destroying or the container width is 0
				if (! settings.bDestroying && newWidth !== 0) {
					_fnAdjustColumnSizing( settings );
				}
			} );
	
			// For browsers that support it (~2020 onwards for wide support) we can watch for the
			// container changing width.
			if (window.ResizeObserver) {
				// This is a tricky beast - if the element is visible when `.observe()` is called,
				// then the callback is immediately run. Which we don't want. If the element isn't
				// visible, then it isn't run, but we want it to run when it is then made visible.
				// This flag allows the above to be satisfied.
				var first = $(settings.nTableWrapper).is(':visible');
	
				// Use an empty div to attach the observer so it isn't impacted by height changes
				var resizer = $('<div>')
					.css({
						width: '100%',
						height: 0
					})
					.addClass('dt-autosize')
					.appendTo(settings.nTableWrapper);
	
				settings.resizeObserver = new ResizeObserver(function (e) {
					if (first) {
						first = false;
					}
					else {
						resize();
					}
				});
	
				settings.resizeObserver.observe(resizer[0]);
			}
			else {
				// For old browsers, the best we can do is listen for a window resize
				$(window).on('resize.DT-'+settings.sInstance, resize);
			}
	
			settings._reszEvt = true;
		}
	}
	
	/**
	 * Get the width of the DataTables wrapper element
	 *
	 * @param {*} settings DataTables settings object
	 * @returns Width
	 */
	function _fnWrapperWidth(settings) {
		return $(settings.nTableWrapper).is(':visible')
			? $(settings.nTableWrapper).width()
			: 0;
	}
	
	/**
	 * Get the maximum strlen for each data column
	 *  @param {object} settings dataTables settings object
	 *  @param {int} colIdx column of interest
	 *  @returns {string} string of the max length
	 *  @memberof DataTable#oApi
	 */
	function _fnGetMaxLenString( settings, colIdx )
	{
		var column = settings.aoColumns[colIdx];
	
		if (! column.maxLenString) {
			var s, max='', maxLen = -1;
		
			for ( var i=0, ien=settings.aiDisplayMaster.length ; i<ien ; i++ ) {
				var rowIdx = settings.aiDisplayMaster[i];
				var data = _fnGetRowDisplay(settings, rowIdx)[colIdx];
	
				var cellString = data && typeof data === 'object' && data.nodeType
					? data.innerHTML
					: data+'';
	
				// Remove id / name attributes from elements so they
				// don't interfere with existing elements
				cellString = cellString
					.replace(/id=".*?"/g, '')
					.replace(/name=".*?"/g, '');
	
				s = _stripHtml(cellString)
					.replace( /&nbsp;/g, ' ' );
		
				if ( s.length > maxLen ) {
					// We want the HTML in the string, but the length that
					// is important is the stripped string
					max = cellString;
					maxLen = s.length;
				}
			}
	
			column.maxLenString = max;
		}
	
		return column.maxLenString;
	}
	
	
	/**
	 * Append a CSS unit (only if required) to a string
	 *  @param {string} value to css-ify
	 *  @returns {string} value with css unit
	 *  @memberof DataTable#oApi
	 */
	function _fnStringToCss( s )
	{
		if ( s === null ) {
			return '0px';
		}
	
		if ( typeof s == 'number' ) {
			return s < 0 ?
				'0px' :
				s+'px';
		}
	
		// Check it has a unit character already
		return s.match(/\d$/) ?
			s+'px' :
			s;
	}
	
	/**
	 * Re-insert the `col` elements for current visibility
	 *
	 * @param {*} settings DT settings
	 */
	function _colGroup( settings ) {
		var cols = settings.aoColumns;
	
		settings.colgroup.empty();
	
		for (i=0 ; i<cols.length ; i++) {
			if (cols[i].bVisible) {
				settings.colgroup.append(cols[i].colEl);
			}
		}
	}
	
	
	function _fnSortInit( settings ) {
		var target = settings.nTHead;
		var headerRows = target.querySelectorAll('tr');
		var legacyTop = settings.bSortCellsTop;
		var notSelector = ':not([data-dt-order="disable"]):not([data-dt-order="icon-only"])';
		
		// Legacy support for `orderCellsTop`
		if (legacyTop === true) {
			target = headerRows[0];
		}
		else if (legacyTop === false) {
			target = headerRows[ headerRows.length - 1 ];
		}
	
		_fnSortAttachListener(
			settings,
			target,
			target === settings.nTHead
				? 'tr'+notSelector+' th'+notSelector+', tr'+notSelector+' td'+notSelector
				: 'th'+notSelector+', td'+notSelector
		);
	
		// Need to resolve the user input array into our internal structure
		var order = [];
		_fnSortResolve( settings, order, settings.aaSorting );
	
		settings.aaSorting = order;
	}
	
	
	function _fnSortAttachListener(settings, node, selector, column, callback) {
		_fnBindAction( node, selector, function (e) {
			var run = false;
			var columns = column === undefined
				? _fnColumnsFromHeader( e.target )
				: [column];
	
			if ( columns.length ) {
				for ( var i=0, ien=columns.length ; i<ien ; i++ ) {
					var ret = _fnSortAdd( settings, columns[i], i, e.shiftKey );
	
					if (ret !== false) {
						run = true;
					}					
	
					// If the first entry is no sort, then subsequent
					// sort columns are ignored
					if (settings.aaSorting.length === 1 && settings.aaSorting[0][1] === '') {
						break;
					}
				}
	
				if (run) {
					_fnProcessingRun(settings, true, function () {
						_fnSort( settings );
						_fnSortDisplay( settings, settings.aiDisplay );
	
						_fnReDraw( settings, false, false );
	
						if (callback) {
							callback();
						}
					});
				}
			}
		} );
	}
	
	/**
	 * Sort the display array to match the master's order
	 * @param {*} settings
	 */
	function _fnSortDisplay(settings, display) {
		if (display.length < 2) {
			return;
		}
	
		var master = settings.aiDisplayMaster;
		var masterMap = {};
		var map = {};
		var i;
	
		// Rather than needing an `indexOf` on master array, we can create a map
		for (i=0 ; i<master.length ; i++) {
			masterMap[master[i]] = i;
		}
	
		// And then cache what would be the indexOf fom the display
		for (i=0 ; i<display.length ; i++) {
			map[display[i]] = masterMap[display[i]];
		}
	
		display.sort(function(a, b){
			// Short version of this function is simply `master.indexOf(a) - master.indexOf(b);`
			return map[a] - map[b];
		});
	}
	
	
	function _fnSortResolve (settings, nestedSort, sort) {
		var push = function ( a ) {
			if ($.isPlainObject(a)) {
				if (a.idx !== undefined) {
					// Index based ordering
					nestedSort.push([a.idx, a.dir]);
				}
				else if (a.name) {
					// Name based ordering
					var cols = _pluck( settings.aoColumns, 'sName');
					var idx = cols.indexOf(a.name);
	
					if (idx !== -1) {
						nestedSort.push([idx, a.dir]);
					}
				}
			}
			else {
				// Plain column index and direction pair
				nestedSort.push(a);
			}
		};
	
		if ( $.isPlainObject(sort) ) {
			// Object
			push(sort);
		}
		else if ( sort.length && typeof sort[0] === 'number' ) {
			// 1D array
			push(sort);
		}
		else if ( sort.length ) {
			// 2D array
			for (var z=0; z<sort.length; z++) {
				push(sort[z]); // Object or array
			}
		}
	}
	
	
	function _fnSortFlatten ( settings )
	{
		var
			i, k, kLen,
			aSort = [],
			extSort = DataTable.ext.type.order,
			aoColumns = settings.aoColumns,
			aDataSort, iCol, sType, srcCol,
			fixed = settings.aaSortingFixed,
			fixedObj = $.isPlainObject( fixed ),
			nestedSort = [];
		
		if ( ! settings.oFeatures.bSort ) {
			return aSort;
		}
	
		// Build the sort array, with pre-fix and post-fix options if they have been
		// specified
		if ( Array.isArray( fixed ) ) {
			_fnSortResolve( settings, nestedSort, fixed );
		}
	
		if ( fixedObj && fixed.pre ) {
			_fnSortResolve( settings, nestedSort, fixed.pre );
		}
	
		_fnSortResolve( settings, nestedSort, settings.aaSorting );
	
		if (fixedObj && fixed.post ) {
			_fnSortResolve( settings, nestedSort, fixed.post );
		}
	
		for ( i=0 ; i<nestedSort.length ; i++ )
		{
			srcCol = nestedSort[i][0];
	
			if ( aoColumns[ srcCol ] ) {
				aDataSort = aoColumns[ srcCol ].aDataSort;
	
				for ( k=0, kLen=aDataSort.length ; k<kLen ; k++ )
				{
					iCol = aDataSort[k];
					sType = aoColumns[ iCol ].sType || 'string';
	
					if ( nestedSort[i]._idx === undefined ) {
						nestedSort[i]._idx = aoColumns[iCol].asSorting.indexOf(nestedSort[i][1]);
					}
	
					if ( nestedSort[i][1] ) {
						aSort.push( {
							src:       srcCol,
							col:       iCol,
							dir:       nestedSort[i][1],
							index:     nestedSort[i]._idx,
							type:      sType,
							formatter: extSort[ sType+"-pre" ],
							sorter:    extSort[ sType+"-"+nestedSort[i][1] ]
						} );
					}
				}
			}
		}
	
		return aSort;
	}
	
	/**
	 * Change the order of the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnSort ( oSettings, col, dir )
	{
		var
			i, ien, iLen,
			aiOrig = [],
			extSort = DataTable.ext.type.order,
			aoData = oSettings.aoData,
			sortCol,
			displayMaster = oSettings.aiDisplayMaster,
			aSort;
	
		// Make sure the columns all have types defined
		_fnColumnTypes(oSettings);
	
		// Allow a specific column to be sorted, which will _not_ alter the display
		// master
		if (col !== undefined) {
			var srcCol = oSettings.aoColumns[col];
	
			aSort = [{
				src:       col,
				col:       col,
				dir:       dir,
				index:     0,
				type:      srcCol.sType,
				formatter: extSort[ srcCol.sType+"-pre" ],
				sorter:    extSort[ srcCol.sType+"-"+dir ]
			}];
			displayMaster = displayMaster.slice();
		}
		else {
			aSort = _fnSortFlatten( oSettings );
		}
	
		for ( i=0, ien=aSort.length ; i<ien ; i++ ) {
			sortCol = aSort[i];
	
			// Load the data needed for the sort, for each cell
			_fnSortData( oSettings, sortCol.col );
		}
	
		/* No sorting required if server-side or no sorting array */
		if ( _fnDataSource( oSettings ) != 'ssp' && aSort.length !== 0 )
		{
			// Reset the initial positions on each pass so we get a stable sort
			for ( i=0, iLen=displayMaster.length ; i<iLen ; i++ ) {
				aiOrig[ i ] = i;
			}
	
			// If the first sort is desc, then reverse the array to preserve original
			// order, just in reverse
			if (aSort.length && aSort[0].dir === 'desc' && oSettings.orderDescReverse) {
				aiOrig.reverse();
			}
	
			/* Do the sort - here we want multi-column sorting based on a given data source (column)
			 * and sorting function (from oSort) in a certain direction. It's reasonably complex to
			 * follow on it's own, but this is what we want (example two column sorting):
			 *  fnLocalSorting = function(a,b){
			 *    var test;
			 *    test = oSort['string-asc']('data11', 'data12');
			 *      if (test !== 0)
			 *        return test;
			 *    test = oSort['numeric-desc']('data21', 'data22');
			 *    if (test !== 0)
			 *      return test;
			 *    return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
			 *  }
			 * Basically we have a test for each sorting column, if the data in that column is equal,
			 * test the next column. If all columns match, then we use a numeric sort on the row
			 * positions in the original data array to provide a stable sort.
			 */
			displayMaster.sort( function ( a, b ) {
				var
					x, y, k, test, sort,
					len=aSort.length,
					dataA = aoData[a]._aSortData,
					dataB = aoData[b]._aSortData;
	
				for ( k=0 ; k<len ; k++ ) {
					sort = aSort[k];
	
					// Data, which may have already been through a `-pre` function
					x = dataA[ sort.col ];
					y = dataB[ sort.col ];
	
					if (sort.sorter) {
						// If there is a custom sorter (`-asc` or `-desc`) for this
						// data type, use it
						test = sort.sorter(x, y);
	
						if ( test !== 0 ) {
							return test;
						}
					}
					else {
						// Otherwise, use generic sorting
						test = x<y ? -1 : x>y ? 1 : 0;
	
						if ( test !== 0 ) {
							return sort.dir === 'asc' ? test : -test;
						}
					}
				}
	
				x = aiOrig[a];
				y = aiOrig[b];
	
				return x<y ? -1 : x>y ? 1 : 0;
			} );
		}
		else if ( aSort.length === 0 ) {
			// Apply index order
			displayMaster.sort(function (x, y) {
				return x<y ? -1 : x>y ? 1 : 0;
			});
		}
	
		if (col === undefined) {
			// Tell the draw function that we have sorted the data
			oSettings.bSorted = true;
			oSettings.sortDetails = aSort;
	
			_fnCallbackFire( oSettings, null, 'order', [oSettings, aSort] );
		}
	
		return displayMaster;
	}
	
	
	/**
	 * Function to run on user sort request
	 *  @param {object} settings dataTables settings object
	 *  @param {node} attachTo node to attach the handler to
	 *  @param {int} colIdx column sorting index
	 *  @param {int} addIndex Counter
	 *  @param {boolean} [shift=false] Shift click add
	 *  @param {function} [callback] callback function
	 *  @memberof DataTable#oApi
	 */
	function _fnSortAdd ( settings, colIdx, addIndex, shift )
	{
		var col = settings.aoColumns[ colIdx ];
		var sorting = settings.aaSorting;
		var asSorting = col.asSorting;
		var nextSortIdx;
		var next = function ( a, overflow ) {
			var idx = a._idx;
			if ( idx === undefined ) {
				idx = asSorting.indexOf(a[1]);
			}
	
			return idx+1 < asSorting.length ?
				idx+1 :
				overflow ?
					null :
					0;
		};
	
		if ( ! col.bSortable ) {
			return false;
		}
	
		// Convert to 2D array if needed
		if ( typeof sorting[0] === 'number' ) {
			sorting = settings.aaSorting = [ sorting ];
		}
	
		// If appending the sort then we are multi-column sorting
		if ( (shift || addIndex) && settings.oFeatures.bSortMulti ) {
			// Are we already doing some kind of sort on this column?
			var sortIdx = _pluck(sorting, '0').indexOf(colIdx);
	
			if ( sortIdx !== -1 ) {
				// Yes, modify the sort
				nextSortIdx = next( sorting[sortIdx], true );
	
				if ( nextSortIdx === null && sorting.length === 1 ) {
					nextSortIdx = 0; // can't remove sorting completely
				}
	
				if ( nextSortIdx === null ) {
					sorting.splice( sortIdx, 1 );
				}
				else {
					sorting[sortIdx][1] = asSorting[ nextSortIdx ];
					sorting[sortIdx]._idx = nextSortIdx;
				}
			}
			else if (shift) {
				// No sort on this column yet, being added by shift click
				// add it as itself
				sorting.push( [ colIdx, asSorting[0], 0 ] );
				sorting[sorting.length-1]._idx = 0;
			}
			else {
				// No sort on this column yet, being added from a colspan
				// so add with same direction as first column
				sorting.push( [ colIdx, sorting[0][1], 0 ] );
				sorting[sorting.length-1]._idx = 0;
			}
		}
		else if ( sorting.length && sorting[0][0] == colIdx ) {
			// Single column - already sorting on this column, modify the sort
			nextSortIdx = next( sorting[0] );
	
			sorting.length = 1;
			sorting[0][1] = asSorting[ nextSortIdx ];
			sorting[0]._idx = nextSortIdx;
		}
		else {
			// Single column - sort only on this column
			sorting.length = 0;
			sorting.push( [ colIdx, asSorting[0] ] );
			sorting[0]._idx = 0;
		}
	}
	
	
	/**
	 * Set the sorting classes on table's body, Note: it is safe to call this function
	 * when bSort and bSortClasses are false
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnSortingClasses( settings )
	{
		var oldSort = settings.aLastSort;
		var sortClass = settings.oClasses.order.position;
		var sort = _fnSortFlatten( settings );
		var features = settings.oFeatures;
		var i, ien, colIdx;
	
		if ( features.bSort && features.bSortClasses ) {
			// Remove old sorting classes
			for ( i=0, ien=oldSort.length ; i<ien ; i++ ) {
				colIdx = oldSort[i].src;
	
				// Remove column sorting
				$( _pluck( settings.aoData, 'anCells', colIdx ) )
					.removeClass( sortClass + (i<2 ? i+1 : 3) );
			}
	
			// Add new column sorting
			for ( i=0, ien=sort.length ; i<ien ; i++ ) {
				colIdx = sort[i].src;
	
				$( _pluck( settings.aoData, 'anCells', colIdx ) )
					.addClass( sortClass + (i<2 ? i+1 : 3) );
			}
		}
	
		settings.aLastSort = sort;
	}
	
	
	// Get the data to sort a column, be it from cache, fresh (populating the
	// cache), or from a sort formatter
	function _fnSortData( settings, colIdx )
	{
		// Custom sorting function - provided by the sort data type
		var column = settings.aoColumns[ colIdx ];
		var customSort = DataTable.ext.order[ column.sSortDataType ];
		var customData;
	
		if ( customSort ) {
			customData = customSort.call( settings.oInstance, settings, colIdx,
				_fnColumnIndexToVisible( settings, colIdx )
			);
		}
	
		// Use / populate cache
		var row, cellData;
		var formatter = DataTable.ext.type.order[ column.sType+"-pre" ];
		var data = settings.aoData;
	
		for ( var rowIdx=0 ; rowIdx<data.length ; rowIdx++ ) {
			// Sparse array
			if (! data[rowIdx]) {
				continue;
			}
	
			row = data[rowIdx];
	
			if ( ! row._aSortData ) {
				row._aSortData = [];
			}
	
			if ( ! row._aSortData[colIdx] || customSort ) {
				cellData = customSort ?
					customData[rowIdx] : // If there was a custom sort function, use data from there
					_fnGetCellData( settings, rowIdx, colIdx, 'sort' );
	
				row._aSortData[ colIdx ] = formatter ?
					formatter( cellData, settings ) :
					cellData;
			}
		}
	}
	
	
	/**
	 * State information for a table
	 *
	 * @param {*} settings
	 * @returns State object
	 */
	function _fnSaveState ( settings )
	{
		if (settings._bLoadingState) {
			return;
		}
	
		// Sort state saving uses [[idx, order]] structure.
		var sorting = [];
		_fnSortResolve(settings, sorting, settings.aaSorting );
	
		/* Store the interesting variables */
		var columns = settings.aoColumns;
		var state = {
			time:    +new Date(),
			start:   settings._iDisplayStart,
			length:  settings._iDisplayLength,
			order:   sorting.map(function (sort) {
				// If a column name is available, use it
				return columns[sort[0]] && columns[sort[0]].sName
					? [ columns[sort[0]].sName, sort[1] ]
					: sort.slice();
			} ),
			search:  $.extend({}, settings.oPreviousSearch),
			columns: settings.aoColumns.map( function ( col, i ) {
				return {
					name: col.sName,
					visible: col.bVisible,
					search: $.extend({}, settings.aoPreSearchCols[i])
				};
			} )
		};
	
		settings.oSavedState = state;
		_fnCallbackFire( settings, "aoStateSaveParams", 'stateSaveParams', [settings, state] );
		
		if ( settings.oFeatures.bStateSave && !settings.bDestroying )
		{
			settings.fnStateSaveCallback.call( settings.oInstance, settings, state );
		}	
	}
	
	
	/**
	 * Attempt to load a saved table state
	 *  @param {object} oSettings dataTables settings object
	 *  @param {object} oInit DataTables init object so we can override settings
	 *  @param {function} callback Callback to execute when the state has been loaded
	 *  @memberof DataTable#oApi
	 */
	function _fnLoadState ( settings, init, callback )
	{
		if ( ! settings.oFeatures.bStateSave ) {
			callback();
			return;
		}
	
		var loaded = function(state) {
			_fnImplementState(settings, state, callback);
		}
	
		var state = settings.fnStateLoadCallback.call( settings.oInstance, settings, loaded );
	
		if ( state !== undefined ) {
			_fnImplementState( settings, state, callback );
		}
		// otherwise, wait for the loaded callback to be executed
	
		return true;
	}
	
	function _fnImplementState ( settings, s, callback) {
		var i, ien;
		var columns = settings.aoColumns;
		var currentNames = _pluck(settings.aoColumns, 'sName');
	
		settings._bLoadingState = true;
	
		// When StateRestore was introduced the state could now be implemented at any time
		// Not just initialisation. To do this an api instance is required in some places
		var api = settings._bInitComplete ? new DataTable.Api(settings) : null;
	
		if ( ! s || ! s.time ) {
			settings._bLoadingState = false;
			callback();
			return;
		}
	
		// Reject old data
		var duration = settings.iStateDuration;
		if ( duration > 0 && s.time < +new Date() - (duration*1000) ) {
			settings._bLoadingState = false;
			callback();
			return;
		}
	
		// Allow custom and plug-in manipulation functions to alter the saved data set and
		// cancelling of loading by returning false
		var abStateLoad = _fnCallbackFire( settings, 'aoStateLoadParams', 'stateLoadParams', [settings, s] );
		if ( abStateLoad.indexOf(false) !== -1 ) {
			settings._bLoadingState = false;
			callback();
			return;
		}
	
		// Store the saved state so it might be accessed at any time
		settings.oLoadedState = $.extend( true, {}, s );
	
		// This is needed for ColReorder, which has to happen first to allow all
		// the stored indexes to be usable. It is not publicly documented.
		_fnCallbackFire( settings, null, 'stateLoadInit', [settings, s], true );
	
		// Page Length
		if ( s.length !== undefined ) {
			// If already initialised just set the value directly so that the select element is also updated
			if (api) {
				api.page.len(s.length)
			}
			else {
				settings._iDisplayLength   = s.length;
			}
		}
	
		// Restore key features
		if ( s.start !== undefined ) {
			if(api === null) {
				settings._iDisplayStart    = s.start;
				settings.iInitDisplayStart = s.start;
			}
			else {
				_fnPageChange(settings, s.start/settings._iDisplayLength);
			}
		}
	
		// Order
		if ( s.order !== undefined ) {
			settings.aaSorting = [];
			$.each( s.order, function ( i, col ) {
				var set = [ col[0], col[1] ];
	
				// A column name was stored and should be used for restore
				if (typeof col[0] === 'string') {
					var idx = currentNames.indexOf(col[0]);
	
					// Find the name from the current list of column names, or fallback to index 0
					set[0] = idx >= 0
						? idx
						: 0;
				}
				else if (set[0] >= columns.length) {
					// If a column name, but it is out of bounds, set to 0
					set[0] = 0;
				}
	
				settings.aaSorting.push(set);
			} );
		}
	
		// Search
		if ( s.search !== undefined ) {
			$.extend( settings.oPreviousSearch, s.search );
		}
	
		// Columns
		if ( s.columns ) {
			var set = s.columns;
			var incoming = _pluck(s.columns, 'name');
	
			// Check if it is a 2.2 style state object with a `name` property for the columns, and if
			// the name was defined. If so, then create a new array that will map the state object
			// given, to the current columns (don't bother if they are already matching tho).
			if (incoming.join('').length && incoming.join('') !== currentNames.join('')) {
				set = [];
	
				// For each column, try to find the name in the incoming array
				for (i=0 ; i<currentNames.length ; i++) {
					if (currentNames[i] != '') {
						var idx = incoming.indexOf(currentNames[i]);
	
						if (idx >= 0) {
							set.push(s.columns[idx]);
						}
						else {
							// No matching column name in the state's columns, so this might be a new
							// column and thus can't have a state already.
							set.push({});
						}
					}
					else {
						// If no name, but other columns did have a name, then there is no knowing
						// where this one came from originally so it can't be restored.
						set.push({});
					}
				}
			}
	
			// If the number of columns to restore is different from current, then all bets are off.
			if (set.length === columns.length) {
				for ( i=0, ien=set.length ; i<ien ; i++ ) {
					var col = set[i];
	
					// Visibility
					if ( col.visible !== undefined ) {
						// If the api is defined, the table has been initialised so we need to use it rather than internal settings
						if (api) {
							// Don't redraw the columns on every iteration of this loop, we will do this at the end instead
							api.column(i).visible(col.visible, false);
						}
						else {
							columns[i].bVisible = col.visible;
						}
					}
	
					// Search
					if ( col.search !== undefined ) {
						$.extend( settings.aoPreSearchCols[i], col.search );
					}
				}
	
				// If the api is defined then we need to adjust the columns once the visibility has been changed
				if (api) {
					api.columns.adjust();
				}
			}
		}
	
		settings._bLoadingState = false;
		_fnCallbackFire( settings, 'aoStateLoaded', 'stateLoaded', [settings, s] );
		callback();
	}
	
	/**
	 * Log an error message
	 *  @param {object} settings dataTables settings object
	 *  @param {int} level log error messages, or display them to the user
	 *  @param {string} msg error message
	 *  @param {int} tn Technical note id to get more information about the error.
	 *  @memberof DataTable#oApi
	 */
	function _fnLog( settings, level, msg, tn )
	{
		msg = 'DataTables warning: '+
			(settings ? 'table id='+settings.sTableId+' - ' : '')+msg;
	
		if ( tn ) {
			msg += '. For more information about this error, please see '+
			'https://datatables.net/tn/'+tn;
		}
	
		if ( ! level  ) {
			// Backwards compatibility pre 1.10
			var ext = DataTable.ext;
			var type = ext.sErrMode || ext.errMode;
	
			if ( settings ) {
				_fnCallbackFire( settings, null, 'dt-error', [ settings, tn, msg ], true );
			}
	
			if ( type == 'alert' ) {
				alert( msg );
			}
			else if ( type == 'throw' ) {
				throw new Error(msg);
			}
			else if ( typeof type == 'function' ) {
				type( settings, tn, msg );
			}
		}
		else if ( window.console && console.log ) {
			console.log( msg );
		}
	}
	
	
	/**
	 * See if a property is defined on one object, if so assign it to the other object
	 *  @param {object} ret target object
	 *  @param {object} src source object
	 *  @param {string} name property
	 *  @param {string} [mappedName] name to map too - optional, name used if not given
	 *  @memberof DataTable#oApi
	 */
	function _fnMap( ret, src, name, mappedName )
	{
		if ( Array.isArray( name ) ) {
			$.each( name, function (i, val) {
				if ( Array.isArray( val ) ) {
					_fnMap( ret, src, val[0], val[1] );
				}
				else {
					_fnMap( ret, src, val );
				}
			} );
	
			return;
		}
	
		if ( mappedName === undefined ) {
			mappedName = name;
		}
	
		if ( src[name] !== undefined ) {
			ret[mappedName] = src[name];
		}
	}
	
	
	/**
	 * Extend objects - very similar to jQuery.extend, but deep copy objects, and
	 * shallow copy arrays. The reason we need to do this, is that we don't want to
	 * deep copy array init values (such as aaSorting) since the dev wouldn't be
	 * able to override them, but we do want to deep copy arrays.
	 *  @param {object} out Object to extend
	 *  @param {object} extender Object from which the properties will be applied to
	 *      out
	 *  @param {boolean} breakRefs If true, then arrays will be sliced to take an
	 *      independent copy with the exception of the `data` or `aaData` parameters
	 *      if they are present. This is so you can pass in a collection to
	 *      DataTables and have that used as your data source without breaking the
	 *      references
	 *  @returns {object} out Reference, just for convenience - out === the return.
	 *  @memberof DataTable#oApi
	 *  @todo This doesn't take account of arrays inside the deep copied objects.
	 */
	function _fnExtend( out, extender, breakRefs )
	{
		var val;
	
		for ( var prop in extender ) {
			if ( Object.prototype.hasOwnProperty.call(extender, prop) ) {
				val = extender[prop];
	
				if ( $.isPlainObject( val ) ) {
					if ( ! $.isPlainObject( out[prop] ) ) {
						out[prop] = {};
					}
					$.extend( true, out[prop], val );
				}
				else if ( breakRefs && prop !== 'data' && prop !== 'aaData' && Array.isArray(val) ) {
					out[prop] = val.slice();
				}
				else {
					out[prop] = val;
				}
			}
		}
	
		return out;
	}
	
	
	/**
	 * Bind an event handers to allow a click or return key to activate the callback.
	 * This is good for accessibility since a return on the keyboard will have the
	 * same effect as a click, if the element has focus.
	 *  @param {element} n Element to bind the action to
	 *  @param {object|string} selector Selector (for delegated events) or data object
	 *   to pass to the triggered function
	 *  @param {function} fn Callback function for when the event is triggered
	 *  @memberof DataTable#oApi
	 */
	function _fnBindAction( n, selector, fn )
	{
		$(n)
			.on( 'click.DT', selector, function (e) {
				fn(e);
			} )
			.on( 'keypress.DT', selector, function (e){
				if ( e.which === 13 ) {
					e.preventDefault();
					fn(e);
				}
			} )
			.on( 'selectstart.DT', selector, function () {
				// Don't want a double click resulting in text selection
				return false;
			} );
	}
	
	
	/**
	 * Register a callback function. Easily allows a callback function to be added to
	 * an array store of callback functions that can then all be called together.
	 *  @param {object} settings dataTables settings object
	 *  @param {string} store Name of the array storage for the callbacks in oSettings
	 *  @param {function} fn Function to be called back
	 *  @memberof DataTable#oApi
	 */
	function _fnCallbackReg( settings, store, fn )
	{
		if ( fn ) {
			settings[store].push(fn);
		}
	}
	
	
	/**
	 * Fire callback functions and trigger events. Note that the loop over the
	 * callback array store is done backwards! Further note that you do not want to
	 * fire off triggers in time sensitive applications (for example cell creation)
	 * as its slow.
	 *  @param {object} settings dataTables settings object
	 *  @param {string} callbackArr Name of the array storage for the callbacks in
	 *      oSettings
	 *  @param {string} eventName Name of the jQuery custom event to trigger. If
	 *      null no trigger is fired
	 *  @param {array} args Array of arguments to pass to the callback function /
	 *      trigger
	 *  @param {boolean} [bubbles] True if the event should bubble
	 *  @memberof DataTable#oApi
	 */
	function _fnCallbackFire( settings, callbackArr, eventName, args, bubbles )
	{
		var ret = [];
	
		if ( callbackArr ) {
			ret = settings[callbackArr].slice().reverse().map( function (val) {
				return val.apply( settings.oInstance, args );
			} );
		}
	
		if ( eventName !== null) {
			var e = $.Event( eventName+'.dt' );
			var table = $(settings.nTable);
			
			// Expose the DataTables API on the event object for easy access
			e.dt = settings.api;
	
			table[bubbles ?  'trigger' : 'triggerHandler']( e, args );
	
			// If not yet attached to the document, trigger the event
			// on the body directly to sort of simulate the bubble
			if (bubbles && table.parents('body').length === 0) {
				$('body').trigger( e, args );
			}
	
			ret.push( e.result );
		}
	
		return ret;
	}
	
	
	function _fnLengthOverflow ( settings )
	{
		var
			start = settings._iDisplayStart,
			end = settings.fnDisplayEnd(),
			len = settings._iDisplayLength;
	
		/* If we have space to show extra rows (backing up from the end point - then do so */
		if ( start >= end )
		{
			start = end - len;
		}
	
		// Keep the start record on the current page
		start -= (start % len);
	
		if ( len === -1 || start < 0 )
		{
			start = 0;
		}
	
		settings._iDisplayStart = start;
	}
	
	
	function _fnRenderer( settings, type )
	{
		var renderer = settings.renderer;
		var host = DataTable.ext.renderer[type];
	
		if ( $.isPlainObject( renderer ) && renderer[type] ) {
			// Specific renderer for this type. If available use it, otherwise use
			// the default.
			return host[renderer[type]] || host._;
		}
		else if ( typeof renderer === 'string' ) {
			// Common renderer - if there is one available for this type use it,
			// otherwise use the default
			return host[renderer] || host._;
		}
	
		// Use the default
		return host._;
	}
	
	
	/**
	 * Detect the data source being used for the table. Used to simplify the code
	 * a little (ajax) and to make it compress a little smaller.
	 *
	 *  @param {object} settings dataTables settings object
	 *  @returns {string} Data source
	 *  @memberof DataTable#oApi
	 */
	function _fnDataSource ( settings )
	{
		if ( settings.oFeatures.bServerSide ) {
			return 'ssp';
		}
		else if ( settings.ajax ) {
			return 'ajax';
		}
		return 'dom';
	}
	
	/**
	 * Common replacement for language strings
	 *
	 * @param {*} settings DT settings object
	 * @param {*} str String with values to replace
	 * @param {*} entries Plural number for _ENTRIES_ - can be undefined
	 * @returns String
	 */
	function _fnMacros ( settings, str, entries )
	{
		// When infinite scrolling, we are always starting at 1. _iDisplayStart is
		// used only internally
		var
			formatter  = settings.fnFormatNumber,
			start      = settings._iDisplayStart+1,
			len        = settings._iDisplayLength,
			vis        = settings.fnRecordsDisplay(),
			max        = settings.fnRecordsTotal(),
			all        = len === -1;
	
		return str.
			replace(/_START_/g, formatter.call( settings, start ) ).
			replace(/_END_/g,   formatter.call( settings, settings.fnDisplayEnd() ) ).
			replace(/_MAX_/g,   formatter.call( settings, max ) ).
			replace(/_TOTAL_/g, formatter.call( settings, vis ) ).
			replace(/_PAGE_/g,  formatter.call( settings, all ? 1 : Math.ceil( start / len ) ) ).
			replace(/_PAGES_/g, formatter.call( settings, all ? 1 : Math.ceil( vis / len ) ) ).
			replace(/_ENTRIES_/g, settings.api.i18n('entries', '', entries) ).
			replace(/_ENTRIES-MAX_/g, settings.api.i18n('entries', '', max) ).
			replace(/_ENTRIES-TOTAL_/g, settings.api.i18n('entries', '', vis) );
	}
	
	/**
	 * Add elements to an array as quickly as possible, but stack stafe.
	 *
	 * @param {*} arr Array to add the data to
	 * @param {*} data Data array that is to be added
	 * @returns 
	 */
	function _fnArrayApply(arr, data) {
		if (! data) {
			return;
		}
	
		// Chrome can throw a max stack error if apply is called with
		// too large an array, but apply is faster.
		if (data.length < 10000) {
			arr.push.apply(arr, data);
		}
		else {
			for (i=0 ; i<data.length ; i++) {
				arr.push(data[i]);
			}
		}
	}
	
	
	
	/**
	 * Computed structure of the DataTables API, defined by the options passed to
	 * `DataTable.Api.register()` when building the API.
	 *
	 * The structure is built in order to speed creation and extension of the Api
	 * objects since the extensions are effectively pre-parsed.
	 *
	 * The array is an array of objects with the following structure, where this
	 * base array represents the Api prototype base:
	 *
	 *     [
	 *       {
	 *         name:      'data'                -- string   - Property name
	 *         val:       function () {},       -- function - Api method (or undefined if just an object
	 *         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
	 *         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
	 *       },
	 *       {
	 *         name:     'row'
	 *         val:       {},
	 *         methodExt: [ ... ],
	 *         propExt:   [
	 *           {
	 *             name:      'data'
	 *             val:       function () {},
	 *             methodExt: [ ... ],
	 *             propExt:   [ ... ]
	 *           },
	 *           ...
	 *         ]
	 *       }
	 *     ]
	 *
	 * @type {Array}
	 * @ignore
	 */
	var __apiStruct = [];
	
	
	/**
	 * `Array.prototype` reference.
	 *
	 * @type object
	 * @ignore
	 */
	var __arrayProto = Array.prototype;
	
	
	/**
	 * Abstraction for `context` parameter of the `Api` constructor to allow it to
	 * take several different forms for ease of use.
	 *
	 * Each of the input parameter types will be converted to a DataTables settings
	 * object where possible.
	 *
	 * @param  {string|node|jQuery|object} mixed DataTable identifier. Can be one
	 *   of:
	 *
	 *   * `string` - jQuery selector. Any DataTables' matching the given selector
	 *     with be found and used.
	 *   * `node` - `TABLE` node which has already been formed into a DataTable.
	 *   * `jQuery` - A jQuery object of `TABLE` nodes.
	 *   * `object` - DataTables settings object
	 *   * `DataTables.Api` - API instance
	 * @return {array|null} Matching DataTables settings objects. `null` or
	 *   `undefined` is returned if no matching DataTable is found.
	 * @ignore
	 */
	var _toSettings = function ( mixed )
	{
		var idx, jq;
		var settings = DataTable.settings;
		var tables = _pluck(settings, 'nTable');
	
		if ( ! mixed ) {
			return [];
		}
		else if ( mixed.nTable && mixed.oFeatures ) {
			// DataTables settings object
			return [ mixed ];
		}
		else if ( mixed.nodeName && mixed.nodeName.toLowerCase() === 'table' ) {
			// Table node
			idx = tables.indexOf(mixed);
			return idx !== -1 ? [ settings[idx] ] : null;
		}
		else if ( mixed && typeof mixed.settings === 'function' ) {
			return mixed.settings().toArray();
		}
		else if ( typeof mixed === 'string' ) {
			// jQuery selector
			jq = $(mixed).get();
		}
		else if ( mixed instanceof $ ) {
			// jQuery object (also DataTables instance)
			jq = mixed.get();
		}
	
		if ( jq ) {
			return settings.filter(function (v, idx) {
				return jq.includes(tables[idx]);
			});
		}
	};
	
	
	/**
	 * DataTables API class - used to control and interface with  one or more
	 * DataTables enhanced tables.
	 *
	 * The API class is heavily based on jQuery, presenting a chainable interface
	 * that you can use to interact with tables. Each instance of the API class has
	 * a "context" - i.e. the tables that it will operate on. This could be a single
	 * table, all tables on a page or a sub-set thereof.
	 *
	 * Additionally the API is designed to allow you to easily work with the data in
	 * the tables, retrieving and manipulating it as required. This is done by
	 * presenting the API class as an array like interface. The contents of the
	 * array depend upon the actions requested by each method (for example
	 * `rows().nodes()` will return an array of nodes, while `rows().data()` will
	 * return an array of objects or arrays depending upon your table's
	 * configuration). The API object has a number of array like methods (`push`,
	 * `pop`, `reverse` etc) as well as additional helper methods (`each`, `pluck`,
	 * `unique` etc) to assist your working with the data held in a table.
	 *
	 * Most methods (those which return an Api instance) are chainable, which means
	 * the return from a method call also has all of the methods available that the
	 * top level object had. For example, these two calls are equivalent:
	 *
	 *     // Not chained
	 *     api.row.add( {...} );
	 *     api.draw();
	 *
	 *     // Chained
	 *     api.row.add( {...} ).draw();
	 *
	 * @class DataTable.Api
	 * @param {array|object|string|jQuery} context DataTable identifier. This is
	 *   used to define which DataTables enhanced tables this API will operate on.
	 *   Can be one of:
	 *
	 *   * `string` - jQuery selector. Any DataTables' matching the given selector
	 *     with be found and used.
	 *   * `node` - `TABLE` node which has already been formed into a DataTable.
	 *   * `jQuery` - A jQuery object of `TABLE` nodes.
	 *   * `object` - DataTables settings object
	 * @param {array} [data] Data to initialise the Api instance with.
	 *
	 * @example
	 *   // Direct initialisation during DataTables construction
	 *   var api = $('#example').DataTable();
	 *
	 * @example
	 *   // Initialisation using a DataTables jQuery object
	 *   var api = $('#example').dataTable().api();
	 *
	 * @example
	 *   // Initialisation as a constructor
	 *   var api = new DataTable.Api( 'table.dataTable' );
	 */
	_Api = function ( context, data )
	{
		if ( ! (this instanceof _Api) ) {
			return new _Api( context, data );
		}
	
		var i;
		var settings = [];
		var ctxSettings = function ( o ) {
			var a = _toSettings( o );
			if ( a ) {
				settings.push.apply( settings, a );
			}
		};
	
		if ( Array.isArray( context ) ) {
			for ( i=0 ; i<context.length ; i++ ) {
				ctxSettings( context[i] );
			}
		}
		else {
			ctxSettings( context );
		}
	
		// Remove duplicates
		this.context = settings.length > 1
			? _unique( settings )
			: settings;
	
		// Initial data
		_fnArrayApply(this, data);
	
		// selector
		this.selector = {
			rows: null,
			cols: null,
			opts: null
		};
	
		_Api.extend( this, this, __apiStruct );
	};
	
	DataTable.Api = _Api;
	
	// Don't destroy the existing prototype, just extend it. Required for jQuery 2's
	// isPlainObject.
	$.extend( _Api.prototype, {
		any: function ()
		{
			return this.count() !== 0;
		},
	
		context: [], // array of table settings objects
	
		count: function ()
		{
			return this.flatten().length;
		},
	
		each: function ( fn )
		{
			for ( var i=0, ien=this.length ; i<ien; i++ ) {
				fn.call( this, this[i], i, this );
			}
	
			return this;
		},
	
		eq: function ( idx )
		{
			var ctx = this.context;
	
			return ctx.length > idx ?
				new _Api( ctx[idx], this[idx] ) :
				null;
		},
	
		filter: function ( fn )
		{
			var a = __arrayProto.filter.call( this, fn, this );
	
			return new _Api( this.context, a );
		},
	
		flatten: function ()
		{
			var a = [];
	
			return new _Api( this.context, a.concat.apply( a, this.toArray() ) );
		},
	
		get: function ( idx )
		{
			return this[ idx ];
		},
	
		join:    __arrayProto.join,
	
		includes: function ( find ) {
			return this.indexOf( find ) === -1 ? false : true;
		},
	
		indexOf: __arrayProto.indexOf,
	
		iterator: function ( flatten, type, fn, alwaysNew ) {
			var
				a = [], ret,
				i, ien, j, jen,
				context = this.context,
				rows, items, item,
				selector = this.selector;
	
			// Argument shifting
			if ( typeof flatten === 'string' ) {
				alwaysNew = fn;
				fn = type;
				type = flatten;
				flatten = false;
			}
	
			for ( i=0, ien=context.length ; i<ien ; i++ ) {
				var apiInst = new _Api( context[i] );
	
				if ( type === 'table' ) {
					ret = fn.call( apiInst, context[i], i );
	
					if ( ret !== undefined ) {
						a.push( ret );
					}
				}
				else if ( type === 'columns' || type === 'rows' ) {
					// this has same length as context - one entry for each table
					ret = fn.call( apiInst, context[i], this[i], i );
	
					if ( ret !== undefined ) {
						a.push( ret );
					}
				}
				else if ( type === 'every' || type === 'column' || type === 'column-rows' || type === 'row' || type === 'cell' ) {
					// columns and rows share the same structure.
					// 'this' is an array of column indexes for each context
					items = this[i];
	
					if ( type === 'column-rows' ) {
						rows = _selector_row_indexes( context[i], selector.opts );
					}
	
					for ( j=0, jen=items.length ; j<jen ; j++ ) {
						item = items[j];
	
						if ( type === 'cell' ) {
							ret = fn.call( apiInst, context[i], item.row, item.column, i, j );
						}
						else {
							ret = fn.call( apiInst, context[i], item, i, j, rows );
						}
	
						if ( ret !== undefined ) {
							a.push( ret );
						}
					}
				}
			}
	
			if ( a.length || alwaysNew ) {
				var api = new _Api( context, flatten ? a.concat.apply( [], a ) : a );
				var apiSelector = api.selector;
				apiSelector.rows = selector.rows;
				apiSelector.cols = selector.cols;
				apiSelector.opts = selector.opts;
				return api;
			}
			return this;
		},
	
		lastIndexOf: __arrayProto.lastIndexOf,
	
		length:  0,
	
		map: function ( fn )
		{
			var a = __arrayProto.map.call( this, fn, this );
	
			return new _Api( this.context, a );
		},
	
		pluck: function ( prop )
		{
			var fn = DataTable.util.get(prop);
	
			return this.map( function ( el ) {
				return fn(el);
			} );
		},
	
		pop:     __arrayProto.pop,
	
		push:    __arrayProto.push,
	
		reduce: __arrayProto.reduce,
	
		reduceRight: __arrayProto.reduceRight,
	
		reverse: __arrayProto.reverse,
	
		// Object with rows, columns and opts
		selector: null,
	
		shift:   __arrayProto.shift,
	
		slice: function () {
			return new _Api( this.context, this );
		},
	
		sort:    __arrayProto.sort,
	
		splice:  __arrayProto.splice,
	
		toArray: function ()
		{
			return __arrayProto.slice.call( this );
		},
	
		to$: function ()
		{
			return $( this );
		},
	
		toJQuery: function ()
		{
			return $( this );
		},
	
		unique: function ()
		{
			return new _Api( this.context, _unique(this.toArray()) );
		},
	
		unshift: __arrayProto.unshift
	} );
	
	
	function _api_scope( scope, fn, struc ) {
		return function () {
			var ret = fn.apply( scope || this, arguments );
	
			// Method extension
			_Api.extend( ret, ret, struc.methodExt );
			return ret;
		};
	}
	
	function _api_find( src, name ) {
		for ( var i=0, ien=src.length ; i<ien ; i++ ) {
			if ( src[i].name === name ) {
				return src[i];
			}
		}
		return null;
	}
	
	window.__apiStruct = __apiStruct;
	
	_Api.extend = function ( scope, obj, ext )
	{
		// Only extend API instances and static properties of the API
		if ( ! ext.length || ! obj || ( ! (obj instanceof _Api) && ! obj.__dt_wrapper ) ) {
			return;
		}
	
		var
			i, ien,
			struct;
	
		for ( i=0, ien=ext.length ; i<ien ; i++ ) {
			struct = ext[i];
	
			if (struct.name === '__proto__') {
				continue;
			}
	
			// Value
			obj[ struct.name ] = struct.type === 'function' ?
				_api_scope( scope, struct.val, struct ) :
				struct.type === 'object' ?
					{} :
					struct.val;
	
			obj[ struct.name ].__dt_wrapper = true;
	
			// Property extension
			_Api.extend( scope, obj[ struct.name ], struct.propExt );
		}
	};
	
	//     [
	//       {
	//         name:      'data'                -- string   - Property name
	//         val:       function () {},       -- function - Api method (or undefined if just an object
	//         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
	//         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
	//       },
	//       {
	//         name:     'row'
	//         val:       {},
	//         methodExt: [ ... ],
	//         propExt:   [
	//           {
	//             name:      'data'
	//             val:       function () {},
	//             methodExt: [ ... ],
	//             propExt:   [ ... ]
	//           },
	//           ...
	//         ]
	//       }
	//     ]
	
	
	_Api.register = _api_register = function ( name, val )
	{
		if ( Array.isArray( name ) ) {
			for ( var j=0, jen=name.length ; j<jen ; j++ ) {
				_Api.register( name[j], val );
			}
			return;
		}
	
		var
			i, ien,
			heir = name.split('.'),
			struct = __apiStruct,
			key, method;
	
		for ( i=0, ien=heir.length ; i<ien ; i++ ) {
			method = heir[i].indexOf('()') !== -1;
			key = method ?
				heir[i].replace('()', '') :
				heir[i];
	
			var src = _api_find( struct, key );
			if ( ! src ) {
				src = {
					name:      key,
					val:       {},
					methodExt: [],
					propExt:   [],
					type:      'object'
				};
				struct.push( src );
			}
	
			if ( i === ien-1 ) {
				src.val = val;
				src.type = typeof val === 'function' ?
					'function' :
					$.isPlainObject( val ) ?
						'object' :
						'other';
			}
			else {
				struct = method ?
					src.methodExt :
					src.propExt;
			}
		}
	};
	
	_Api.registerPlural = _api_registerPlural = function ( pluralName, singularName, val ) {
		_Api.register( pluralName, val );
	
		_Api.register( singularName, function () {
			var ret = val.apply( this, arguments );
	
			if ( ret === this ) {
				// Returned item is the API instance that was passed in, return it
				return this;
			}
			else if ( ret instanceof _Api ) {
				// New API instance returned, want the value from the first item
				// in the returned array for the singular result.
				return ret.length ?
					Array.isArray( ret[0] ) ?
						new _Api( ret.context, ret[0] ) : // Array results are 'enhanced'
						ret[0] :
					undefined;
			}
	
			// Non-API return - just fire it back
			return ret;
		} );
	};
	
	
	/**
	 * Selector for HTML tables. Apply the given selector to the give array of
	 * DataTables settings objects.
	 *
	 * @param {string|integer} [selector] jQuery selector string or integer
	 * @param  {array} Array of DataTables settings objects to be filtered
	 * @return {array}
	 * @ignore
	 */
	var __table_selector = function ( selector, a )
	{
		if ( Array.isArray(selector) ) {
			var result = [];
	
			selector.forEach(function (sel) {
				var inner = __table_selector(sel, a);
	
				_fnArrayApply(result, inner);
			});
	
			return result.filter( function (item) {
				return item;
			});
		}
	
		// Integer is used to pick out a table by index
		if ( typeof selector === 'number' ) {
			return [ a[ selector ] ];
		}
	
		// Perform a jQuery selector on the table nodes
		var nodes = a.map( function (el) {
			return el.nTable;
		} );
	
		return $(nodes)
			.filter( selector )
			.map( function () {
				// Need to translate back from the table node to the settings
				var idx = nodes.indexOf(this);
				return a[ idx ];
			} )
			.toArray();
	};
	
	
	
	/**
	 * Context selector for the API's context (i.e. the tables the API instance
	 * refers to.
	 *
	 * @name    DataTable.Api#tables
	 * @param {string|integer} [selector] Selector to pick which tables the iterator
	 *   should operate on. If not given, all tables in the current context are
	 *   used. This can be given as a jQuery selector (for example `':gt(0)'`) to
	 *   select multiple tables or as an integer to select a single table.
	 * @returns {DataTable.Api} Returns a new API instance if a selector is given.
	 */
	_api_register( 'tables()', function ( selector ) {
		// A new instance is created if there was a selector specified
		return selector !== undefined && selector !== null ?
			new _Api( __table_selector( selector, this.context ) ) :
			this;
	} );
	
	
	_api_register( 'table()', function ( selector ) {
		var tables = this.tables( selector );
		var ctx = tables.context;
	
		// Truncate to the first matched table
		return ctx.length ?
			new _Api( ctx[0] ) :
			tables;
	} );
	
	// Common methods, combined to reduce size
	[
		['nodes', 'node', 'nTable'],
		['body', 'body', 'nTBody'],
		['header', 'header', 'nTHead'],
		['footer', 'footer', 'nTFoot'],
	].forEach(function (item) {
		_api_registerPlural(
			'tables().' + item[0] + '()',
			'table().' + item[1] + '()' ,
			function () {
				return this.iterator( 'table', function ( ctx ) {
					return ctx[item[2]];
				}, 1 );
			}
		);
	});
	
	// Structure methods
	[
		['header', 'aoHeader'],
		['footer', 'aoFooter'],
	].forEach(function (item) {
		_api_register( 'table().' + item[0] + '.structure()' , function (selector) {
			var indexes = this.columns(selector).indexes().flatten();
			var ctx = this.context[0];
			
			return _fnHeaderLayout(ctx, ctx[item[1]], indexes);
		} );
	})
	
	
	_api_registerPlural( 'tables().containers()', 'table().container()' , function () {
		return this.iterator( 'table', function ( ctx ) {
			return ctx.nTableWrapper;
		}, 1 );
	} );
	
	_api_register( 'tables().every()', function ( fn ) {
		var that = this;
	
		return this.iterator('table', function (s, i) {
			fn.call(that.table(i), i);
		});
	});
	
	_api_register( 'caption()', function ( value, side ) {
		var context = this.context;
	
		// Getter - return existing node's content
		if ( value === undefined ) {
			var caption = context[0].captionNode;
	
			return caption && context.length ?
				caption.innerHTML : 
				null;
		}
	
		return this.iterator( 'table', function ( ctx ) {
			var table = $(ctx.nTable);
			var caption = $(ctx.captionNode);
			var container = $(ctx.nTableWrapper);
	
			// Create the node if it doesn't exist yet
			if ( ! caption.length ) {
				caption = $('<caption/>').html( value );
				ctx.captionNode = caption[0];
	
				// If side isn't set, we need to insert into the document to let the
				// CSS decide so we can read it back, otherwise there is no way to
				// know if the CSS would put it top or bottom for scrolling
				if (! side) {
					table.prepend(caption);
	
					side = caption.css('caption-side');
				}
			}
	
			caption.html( value );
	
			if ( side ) {
				caption.css( 'caption-side', side );
				caption[0]._captionSide = side;
			}
	
			if (container.find('div.dataTables_scroll').length) {
				var selector = (side === 'top' ? 'Head' : 'Foot');
	
				container.find('div.dataTables_scroll'+ selector +' table').prepend(caption);
			}
			else {
				table.prepend(caption);
			}
		}, 1 );
	} );
	
	_api_register( 'caption.node()', function () {
		var ctx = this.context;
	
		return ctx.length ? ctx[0].captionNode : null;
	} );
	
	
	/**
	 * Redraw the tables in the current context.
	 */
	_api_register( 'draw()', function ( paging ) {
		return this.iterator( 'table', function ( settings ) {
			if ( paging === 'page' ) {
				_fnDraw( settings );
			}
			else {
				if ( typeof paging === 'string' ) {
					paging = paging === 'full-hold' ?
						false :
						true;
				}
	
				_fnReDraw( settings, paging===false );
			}
		} );
	} );
	
	
	
	/**
	 * Get the current page index.
	 *
	 * @return {integer} Current page index (zero based)
	 *//**
	 * Set the current page.
	 *
	 * Note that if you attempt to show a page which does not exist, DataTables will
	 * not throw an error, but rather reset the paging.
	 *
	 * @param {integer|string} action The paging action to take. This can be one of:
	 *  * `integer` - The page index to jump to
	 *  * `string` - An action to take:
	 *    * `first` - Jump to first page.
	 *    * `next` - Jump to the next page
	 *    * `previous` - Jump to previous page
	 *    * `last` - Jump to the last page.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'page()', function ( action ) {
		if ( action === undefined ) {
			return this.page.info().page; // not an expensive call
		}
	
		// else, have an action to take on all tables
		return this.iterator( 'table', function ( settings ) {
			_fnPageChange( settings, action );
		} );
	} );
	
	
	/**
	 * Paging information for the first table in the current context.
	 *
	 * If you require paging information for another table, use the `table()` method
	 * with a suitable selector.
	 *
	 * @return {object} Object with the following properties set:
	 *  * `page` - Current page index (zero based - i.e. the first page is `0`)
	 *  * `pages` - Total number of pages
	 *  * `start` - Display index for the first record shown on the current page
	 *  * `end` - Display index for the last record shown on the current page
	 *  * `length` - Display length (number of records). Note that generally `start
	 *    + length = end`, but this is not always true, for example if there are
	 *    only 2 records to show on the final page, with a length of 10.
	 *  * `recordsTotal` - Full data set length
	 *  * `recordsDisplay` - Data set length once the current filtering criterion
	 *    are applied.
	 */
	_api_register( 'page.info()', function () {
		if ( this.context.length === 0 ) {
			return undefined;
		}
	
		var
			settings   = this.context[0],
			start      = settings._iDisplayStart,
			len        = settings.oFeatures.bPaginate ? settings._iDisplayLength : -1,
			visRecords = settings.fnRecordsDisplay(),
			all        = len === -1;
	
		return {
			"page":           all ? 0 : Math.floor( start / len ),
			"pages":          all ? 1 : Math.ceil( visRecords / len ),
			"start":          start,
			"end":            settings.fnDisplayEnd(),
			"length":         len,
			"recordsTotal":   settings.fnRecordsTotal(),
			"recordsDisplay": visRecords,
			"serverSide":     _fnDataSource( settings ) === 'ssp'
		};
	} );
	
	
	/**
	 * Get the current page length.
	 *
	 * @return {integer} Current page length. Note `-1` indicates that all records
	 *   are to be shown.
	 *//**
	 * Set the current page length.
	 *
	 * @param {integer} Page length to set. Use `-1` to show all records.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'page.len()', function ( len ) {
		// Note that we can't call this function 'length()' because `length`
		// is a Javascript property of functions which defines how many arguments
		// the function expects.
		if ( len === undefined ) {
			return this.context.length !== 0 ?
				this.context[0]._iDisplayLength :
				undefined;
		}
	
		// else, set the page length
		return this.iterator( 'table', function ( settings ) {
			_fnLengthChange( settings, len );
		} );
	} );
	
	
	
	var __reload = function ( settings, holdPosition, callback ) {
		// Use the draw event to trigger a callback
		if ( callback ) {
			var api = new _Api( settings );
	
			api.one( 'draw', function () {
				callback( api.ajax.json() );
			} );
		}
	
		if ( _fnDataSource( settings ) == 'ssp' ) {
			_fnReDraw( settings, holdPosition );
		}
		else {
			_fnProcessingDisplay( settings, true );
	
			// Cancel an existing request
			var xhr = settings.jqXHR;
			if ( xhr && xhr.readyState !== 4 ) {
				xhr.abort();
			}
	
			// Trigger xhr
			_fnBuildAjax( settings, {}, function( json ) {
				_fnClearTable( settings );
	
				var data = _fnAjaxDataSrc( settings, json );
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					_fnAddData( settings, data[i] );
				}
	
				_fnReDraw( settings, holdPosition );
				_fnInitComplete( settings );
				_fnProcessingDisplay( settings, false );
			} );
		}
	};
	
	
	/**
	 * Get the JSON response from the last Ajax request that DataTables made to the
	 * server. Note that this returns the JSON from the first table in the current
	 * context.
	 *
	 * @return {object} JSON received from the server.
	 */
	_api_register( 'ajax.json()', function () {
		var ctx = this.context;
	
		if ( ctx.length > 0 ) {
			return ctx[0].json;
		}
	
		// else return undefined;
	} );
	
	
	/**
	 * Get the data submitted in the last Ajax request
	 */
	_api_register( 'ajax.params()', function () {
		var ctx = this.context;
	
		if ( ctx.length > 0 ) {
			return ctx[0].oAjaxData;
		}
	
		// else return undefined;
	} );
	
	
	/**
	 * Reload tables from the Ajax data source. Note that this function will
	 * automatically re-draw the table when the remote data has been loaded.
	 *
	 * @param {boolean} [reset=true] Reset (default) or hold the current paging
	 *   position. A full re-sort and re-filter is performed when this method is
	 *   called, which is why the pagination reset is the default action.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.reload()', function ( callback, resetPaging ) {
		return this.iterator( 'table', function (settings) {
			__reload( settings, resetPaging===false, callback );
		} );
	} );
	
	
	/**
	 * Get the current Ajax URL. Note that this returns the URL from the first
	 * table in the current context.
	 *
	 * @return {string} Current Ajax source URL
	 *//**
	 * Set the Ajax URL. Note that this will set the URL for all tables in the
	 * current context.
	 *
	 * @param {string} url URL to set.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.url()', function ( url ) {
		var ctx = this.context;
	
		if ( url === undefined ) {
			// get
			if ( ctx.length === 0 ) {
				return undefined;
			}
			ctx = ctx[0];
	
			return $.isPlainObject( ctx.ajax ) ?
				ctx.ajax.url :
				ctx.ajax;
		}
	
		// set
		return this.iterator( 'table', function ( settings ) {
			if ( $.isPlainObject( settings.ajax ) ) {
				settings.ajax.url = url;
			}
			else {
				settings.ajax = url;
			}
		} );
	} );
	
	
	/**
	 * Load data from the newly set Ajax URL. Note that this method is only
	 * available when `ajax.url()` is used to set a URL. Additionally, this method
	 * has the same effect as calling `ajax.reload()` but is provided for
	 * convenience when setting a new URL. Like `ajax.reload()` it will
	 * automatically redraw the table once the remote data has been loaded.
	 *
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.url().load()', function ( callback, resetPaging ) {
		// Same as a reload, but makes sense to present it for easy access after a
		// url change
		return this.iterator( 'table', function ( ctx ) {
			__reload( ctx, resetPaging===false, callback );
		} );
	} );
	
	
	
	
	var _selector_run = function ( type, selector, selectFn, settings, opts )
	{
		var
			out = [], res,
			a, i, ien, j, jen,
			selectorType = typeof selector;
	
		// Can't just check for isArray here, as an API or jQuery instance might be
		// given with their array like look
		if ( ! selector || selectorType === 'string' || selectorType === 'function' || selector.length === undefined ) {
			selector = [ selector ];
		}
	
		for ( i=0, ien=selector.length ; i<ien ; i++ ) {
			// Only split on simple strings - complex expressions will be jQuery selectors
			a = selector[i] && selector[i].split && ! selector[i].match(/[[(:]/) ?
				selector[i].split(',') :
				[ selector[i] ];
	
			for ( j=0, jen=a.length ; j<jen ; j++ ) {
				res = selectFn( typeof a[j] === 'string' ? (a[j]).trim() : a[j] );
	
				// Remove empty items
				res = res.filter( function (item) {
					return item !== null && item !== undefined;
				});
	
				if ( res && res.length ) {
					out = out.concat( res );
				}
			}
		}
	
		// selector extensions
		var ext = _ext.selector[ type ];
		if ( ext.length ) {
			for ( i=0, ien=ext.length ; i<ien ; i++ ) {
				out = ext[i]( settings, opts, out );
			}
		}
	
		return _unique( out );
	};
	
	
	var _selector_opts = function ( opts )
	{
		if ( ! opts ) {
			opts = {};
		}
	
		// Backwards compatibility for 1.9- which used the terminology filter rather
		// than search
		if ( opts.filter && opts.search === undefined ) {
			opts.search = opts.filter;
		}
	
		return $.extend( {
			search: 'none',
			order: 'current',
			page: 'all'
		}, opts );
	};
	
	
	// Reduce the API instance to the first item found
	var _selector_first = function ( old )
	{
		var inst = new _Api(old.context[0]);
	
		// Use a push rather than passing to the constructor, since it will
		// merge arrays down automatically, which isn't what is wanted here
		if (old.length) {
			inst.push( old[0] );
		}
	
		inst.selector = old.selector;
	
		// Limit to a single row / column / cell
		if (inst.length && inst[0].length > 1) {
			inst[0].splice(1);
		}
	
		return inst;
	};
	
	
	var _selector_row_indexes = function ( settings, opts )
	{
		var
			i, ien, tmp, a=[],
			displayFiltered = settings.aiDisplay,
			displayMaster = settings.aiDisplayMaster;
	
		var
			search = opts.search,  // none, applied, removed
			order  = opts.order,   // applied, current, index (original - compatibility with 1.9)
			page   = opts.page;    // all, current
	
		if ( _fnDataSource( settings ) == 'ssp' ) {
			// In server-side processing mode, most options are irrelevant since
			// rows not shown don't exist and the index order is the applied order
			// Removed is a special case - for consistency just return an empty
			// array
			return search === 'removed' ?
				[] :
				_range( 0, displayMaster.length );
		}
	
		if ( page == 'current' ) {
			// Current page implies that order=current and filter=applied, since it is
			// fairly senseless otherwise, regardless of what order and search actually
			// are
			for ( i=settings._iDisplayStart, ien=settings.fnDisplayEnd() ; i<ien ; i++ ) {
				a.push( displayFiltered[i] );
			}
		}
		else if ( order == 'current' || order == 'applied' ) {
			if ( search == 'none') {
				a = displayMaster.slice();
			}
			else if ( search == 'applied' ) {
				a = displayFiltered.slice();
			}
			else if ( search == 'removed' ) {
				// O(n+m) solution by creating a hash map
				var displayFilteredMap = {};
	
				for ( i=0, ien=displayFiltered.length ; i<ien ; i++ ) {
					displayFilteredMap[displayFiltered[i]] = null;
				}
	
				displayMaster.forEach(function (item) {
					if (! Object.prototype.hasOwnProperty.call(displayFilteredMap, item)) {
						a.push(item);
					}
				});
			}
		}
		else if ( order == 'index' || order == 'original' ) {
			for ( i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
				if (! settings.aoData[i]) {
					continue;
				}
	
				if ( search == 'none' ) {
					a.push( i );
				}
				else { // applied | removed
					tmp = displayFiltered.indexOf(i);
	
					if ((tmp === -1 && search == 'removed') ||
						(tmp >= 0   && search == 'applied') )
					{
						a.push( i );
					}
				}
			}
		}
		else if ( typeof order === 'number' ) {
			// Order the rows by the given column
			var ordered = _fnSort(settings, order, 'asc');
	
			if (search === 'none') {
				a = ordered;
			}
			else { // applied | removed
				for (i=0; i<ordered.length; i++) {
					tmp = displayFiltered.indexOf(ordered[i]);
	
					if ((tmp === -1 && search == 'removed') ||
						(tmp >= 0   && search == 'applied') )
					{
						a.push( ordered[i] );
					}
				}
			}
		}
	
		return a;
	};
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Rows
	 *
	 * {}          - no selector - use all available rows
	 * {integer}   - row aoData index
	 * {node}      - TR node
	 * {string}    - jQuery selector to apply to the TR elements
	 * {array}     - jQuery array of nodes, or simply an array of TR nodes
	 *
	 */
	var __row_selector = function ( settings, selector, opts )
	{
		var rows;
		var run = function ( sel ) {
			var selInt = _intVal( sel );
			var aoData = settings.aoData;
	
			// Short cut - selector is a number and no options provided (default is
			// all records, so no need to check if the index is in there, since it
			// must be - dev error if the index doesn't exist).
			if ( selInt !== null && ! opts ) {
				return [ selInt ];
			}
	
			if ( ! rows ) {
				rows = _selector_row_indexes( settings, opts );
			}
	
			if ( selInt !== null && rows.indexOf(selInt) !== -1 ) {
				// Selector - integer
				return [ selInt ];
			}
			else if ( sel === null || sel === undefined || sel === '' ) {
				// Selector - none
				return rows;
			}
	
			// Selector - function
			if ( typeof sel === 'function' ) {
				return rows.map( function (idx) {
					var row = aoData[ idx ];
					return sel( idx, row._aData, row.nTr ) ? idx : null;
				} );
			}
	
			// Selector - node
			if ( sel.nodeName ) {
				var rowIdx = sel._DT_RowIndex;  // Property added by DT for fast lookup
				var cellIdx = sel._DT_CellIndex;
	
				if ( rowIdx !== undefined ) {
					// Make sure that the row is actually still present in the table
					return aoData[ rowIdx ] && aoData[ rowIdx ].nTr === sel ?
						[ rowIdx ] :
						[];
				}
				else if ( cellIdx ) {
					return aoData[ cellIdx.row ] && aoData[ cellIdx.row ].nTr === sel.parentNode ?
						[ cellIdx.row ] :
						[];
				}
				else {
					var host = $(sel).closest('*[data-dt-row]');
					return host.length ?
						[ host.data('dt-row') ] :
						[];
				}
			}
	
			// ID selector. Want to always be able to select rows by id, regardless
			// of if the tr element has been created or not, so can't rely upon
			// jQuery here - hence a custom implementation. This does not match
			// Sizzle's fast selector or HTML4 - in HTML5 the ID can be anything,
			// but to select it using a CSS selector engine (like Sizzle or
			// querySelect) it would need to need to be escaped for some characters.
			// DataTables simplifies this for row selectors since you can select
			// only a row. A # indicates an id any anything that follows is the id -
			// unescaped.
			if ( typeof sel === 'string' && sel.charAt(0) === '#' ) {
				// get row index from id
				var rowObj = settings.aIds[ sel.replace( /^#/, '' ) ];
				if ( rowObj !== undefined ) {
					return [ rowObj.idx ];
				}
	
				// need to fall through to jQuery in case there is DOM id that
				// matches
			}
			
			// Get nodes in the order from the `rows` array with null values removed
			var nodes = _removeEmpty(
				_pluck_order( settings.aoData, rows, 'nTr' )
			);
	
			// Selector - jQuery selector string, array of nodes or jQuery object/
			// As jQuery's .filter() allows jQuery objects to be passed in filter,
			// it also allows arrays, so this will cope with all three options
			return $(nodes)
				.filter( sel )
				.map( function () {
					return this._DT_RowIndex;
				} )
				.toArray();
		};
	
		var matched = _selector_run( 'row', selector, run, settings, opts );
	
		if (opts.order === 'current' || opts.order === 'applied') {
			_fnSortDisplay(settings, matched);
		}
	
		return matched;
	};
	
	
	_api_register( 'rows()', function ( selector, opts ) {
		// argument shifting
		if ( selector === undefined ) {
			selector = '';
		}
		else if ( $.isPlainObject( selector ) ) {
			opts = selector;
			selector = '';
		}
	
		opts = _selector_opts( opts );
	
		var inst = this.iterator( 'table', function ( settings ) {
			return __row_selector( settings, selector, opts );
		}, 1 );
	
		// Want argument shifting here and in __row_selector?
		inst.selector.rows = selector;
		inst.selector.opts = opts;
	
		return inst;
	} );
	
	_api_register( 'rows().nodes()', function () {
		return this.iterator( 'row', function ( settings, row ) {
			return settings.aoData[ row ].nTr || undefined;
		}, 1 );
	} );
	
	_api_register( 'rows().data()', function () {
		return this.iterator( true, 'rows', function ( settings, rows ) {
			return _pluck_order( settings.aoData, rows, '_aData' );
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().cache()', 'row().cache()', function ( type ) {
		return this.iterator( 'row', function ( settings, row ) {
			var r = settings.aoData[ row ];
			return type === 'search' ? r._aFilterData : r._aSortData;
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().invalidate()', 'row().invalidate()', function ( src ) {
		return this.iterator( 'row', function ( settings, row ) {
			_fnInvalidate( settings, row, src );
		} );
	} );
	
	_api_registerPlural( 'rows().indexes()', 'row().index()', function () {
		return this.iterator( 'row', function ( settings, row ) {
			return row;
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().ids()', 'row().id()', function ( hash ) {
		var a = [];
		var context = this.context;
	
		// `iterator` will drop undefined values, but in this case we want them
		for ( var i=0, ien=context.length ; i<ien ; i++ ) {
			for ( var j=0, jen=this[i].length ; j<jen ; j++ ) {
				var id = context[i].rowIdFn( context[i].aoData[ this[i][j] ]._aData );
				a.push( (hash === true ? '#' : '' )+ id );
			}
		}
	
		return new _Api( context, a );
	} );
	
	_api_registerPlural( 'rows().remove()', 'row().remove()', function () {
		this.iterator( 'row', function ( settings, row ) {
			var data = settings.aoData;
			var rowData = data[ row ];
	
			// Delete from the display arrays
			var idx = settings.aiDisplayMaster.indexOf(row);
			if (idx !== -1) {
				settings.aiDisplayMaster.splice(idx, 1);
			}
	
			// For server-side processing tables - subtract the deleted row from the count
			if ( settings._iRecordsDisplay > 0 ) {
				settings._iRecordsDisplay--;
			}
	
			// Check for an 'overflow' they case for displaying the table
			_fnLengthOverflow( settings );
	
			// Remove the row's ID reference if there is one
			var id = settings.rowIdFn( rowData._aData );
			if ( id !== undefined ) {
				delete settings.aIds[ id ];
			}
	
			data[row] = null;
		} );
	
		return this;
	} );
	
	
	_api_register( 'rows.add()', function ( rows ) {
		var newRows = this.iterator( 'table', function ( settings ) {
				var row, i, ien;
				var out = [];
	
				for ( i=0, ien=rows.length ; i<ien ; i++ ) {
					row = rows[i];
	
					if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
						out.push( _fnAddTr( settings, row )[0] );
					}
					else {
						out.push( _fnAddData( settings, row ) );
					}
				}
	
				return out;
			}, 1 );
	
		// Return an Api.rows() extended instance, so rows().nodes() etc can be used
		var modRows = this.rows( -1 );
		modRows.pop();
		_fnArrayApply(modRows, newRows);
	
		return modRows;
	} );
	
	
	
	
	
	/**
	 *
	 */
	_api_register( 'row()', function ( selector, opts ) {
		return _selector_first( this.rows( selector, opts ) );
	} );
	
	
	_api_register( 'row().data()', function ( data ) {
		var ctx = this.context;
	
		if ( data === undefined ) {
			// Get
			return ctx.length && this.length && this[0].length ?
				ctx[0].aoData[ this[0] ]._aData :
				undefined;
		}
	
		// Set
		var row = ctx[0].aoData[ this[0] ];
		row._aData = data;
	
		// If the DOM has an id, and the data source is an array
		if ( Array.isArray( data ) && row.nTr && row.nTr.id ) {
			_fnSetObjectDataFn( ctx[0].rowId )( data, row.nTr.id );
		}
	
		// Automatically invalidate
		_fnInvalidate( ctx[0], this[0], 'data' );
	
		return this;
	} );
	
	
	_api_register( 'row().node()', function () {
		var ctx = this.context;
	
		if (ctx.length && this.length && this[0].length) {
			var row = ctx[0].aoData[ this[0] ];
	
			if (row && row.nTr) {
				return row.nTr;
			}
		}
	
		return null;
	} );
	
	
	_api_register( 'row.add()', function ( row ) {
		// Allow a jQuery object to be passed in - only a single row is added from
		// it though - the first element in the set
		if ( row instanceof $ && row.length ) {
			row = row[0];
		}
	
		var rows = this.iterator( 'table', function ( settings ) {
			if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
				return _fnAddTr( settings, row )[0];
			}
			return _fnAddData( settings, row );
		} );
	
		// Return an Api.rows() extended instance, with the newly added row selected
		return this.row( rows[0] );
	} );
	
	
	$(document).on('plugin-init.dt', function (e, context) {
		var api = new _Api( context );
	
		api.on( 'stateSaveParams.DT', function ( e, settings, d ) {
			// This could be more compact with the API, but it is a lot faster as a simple
			// internal loop
			var idFn = settings.rowIdFn;
			var rows = settings.aiDisplayMaster;
			var ids = [];
	
			for (var i=0 ; i<rows.length ; i++) {
				var rowIdx = rows[i];
				var data = settings.aoData[rowIdx];
	
				if (data._detailsShow) {
					ids.push( '#' + idFn(data._aData) );
				}
			}
	
			d.childRows = ids;
		});
	
		// For future state loads (e.g. with StateRestore)
		api.on( 'stateLoaded.DT', function (e, settings, state) {
			__details_state_load( api, state );
		});
	
		// And the initial load state
		__details_state_load( api, api.state.loaded() );
	});
	
	var __details_state_load = function (api, state)
	{
		if ( state && state.childRows ) {
			api
				.rows( state.childRows.map(function (id) {
					// Escape any `:` characters from the row id. Accounts for
					// already escaped characters.
					return id.replace(/([^:\\]*(?:\\.[^:\\]*)*):/g, "$1\\:");
				}) )
				.every( function () {
					_fnCallbackFire( api.settings()[0], null, 'requestChild', [ this ] )
				});
		}
	}
	
	var __details_add = function ( ctx, row, data, klass )
	{
		// Convert to array of TR elements
		var rows = [];
		var addRow = function ( r, k ) {
			// Recursion to allow for arrays of jQuery objects
			if ( Array.isArray( r ) || r instanceof $ ) {
				for ( var i=0, ien=r.length ; i<ien ; i++ ) {
					addRow( r[i], k );
				}
				return;
			}
	
			// If we get a TR element, then just add it directly - up to the dev
			// to add the correct number of columns etc
			if ( r.nodeName && r.nodeName.toLowerCase() === 'tr' ) {
				r.setAttribute( 'data-dt-row', row.idx );
				rows.push( r );
			}
			else {
				// Otherwise create a row with a wrapper
				var created = $('<tr><td></td></tr>')
					.attr( 'data-dt-row', row.idx )
					.addClass( k );
				
				$('td', created)
					.addClass( k )
					.html( r )[0].colSpan = _fnVisbleColumns( ctx );
	
				rows.push( created[0] );
			}
		};
	
		addRow( data, klass );
	
		if ( row._details ) {
			row._details.detach();
		}
	
		row._details = $(rows);
	
		// If the children were already shown, that state should be retained
		if ( row._detailsShow ) {
			row._details.insertAfter( row.nTr );
		}
	};
	
	
	// Make state saving of child row details async to allow them to be batch processed
	var __details_state = DataTable.util.throttle(
		function (ctx) {
			_fnSaveState( ctx[0] )
		},
		500
	);
	
	
	var __details_remove = function ( api, idx )
	{
		var ctx = api.context;
	
		if ( ctx.length ) {
			var row = ctx[0].aoData[ idx !== undefined ? idx : api[0] ];
	
			if ( row && row._details ) {
				row._details.remove();
	
				row._detailsShow = undefined;
				row._details = undefined;
				$( row.nTr ).removeClass( 'dt-hasChild' );
				__details_state( ctx );
			}
		}
	};
	
	
	var __details_display = function ( api, show ) {
		var ctx = api.context;
	
		if ( ctx.length && api.length ) {
			var row = ctx[0].aoData[ api[0] ];
	
			if ( row._details ) {
				row._detailsShow = show;
	
				if ( show ) {
					row._details.insertAfter( row.nTr );
					$( row.nTr ).addClass( 'dt-hasChild' );
				}
				else {
					row._details.detach();
					$( row.nTr ).removeClass( 'dt-hasChild' );
				}
	
				_fnCallbackFire( ctx[0], null, 'childRow', [ show, api.row( api[0] ) ] )
	
				__details_events( ctx[0] );
				__details_state( ctx );
			}
		}
	};
	
	
	var __details_events = function ( settings )
	{
		var api = new _Api( settings );
		var namespace = '.dt.DT_details';
		var drawEvent = 'draw'+namespace;
		var colvisEvent = 'column-sizing'+namespace;
		var destroyEvent = 'destroy'+namespace;
		var data = settings.aoData;
	
		api.off( drawEvent +' '+ colvisEvent +' '+ destroyEvent );
	
		if ( _pluck( data, '_details' ).length > 0 ) {
			// On each draw, insert the required elements into the document
			api.on( drawEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				api.rows( {page:'current'} ).eq(0).each( function (idx) {
					// Internal data grab
					var row = data[ idx ];
	
					if ( row._detailsShow ) {
						row._details.insertAfter( row.nTr );
					}
				} );
			} );
	
			// Column visibility change - update the colspan
			api.on( colvisEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				// Update the colspan for the details rows (note, only if it already has
				// a colspan)
				var row, visible = _fnVisbleColumns( ctx );
	
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					row = data[i];
	
					if ( row && row._details ) {
						row._details.each(function () {
							var el = $(this).children('td');
	
							if (el.length == 1) {
								el.attr('colspan', visible);
							}
						});
					}
				}
			} );
	
			// Table destroyed - nuke any child rows
			api.on( destroyEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					if ( data[i] && data[i]._details ) {
						__details_remove( api, i );
					}
				}
			} );
		}
	};
	
	// Strings for the method names to help minification
	var _emp = '';
	var _child_obj = _emp+'row().child';
	var _child_mth = _child_obj+'()';
	
	// data can be:
	//  tr
	//  string
	//  jQuery or array of any of the above
	_api_register( _child_mth, function ( data, klass ) {
		var ctx = this.context;
	
		if ( data === undefined ) {
			// get
			return ctx.length && this.length && ctx[0].aoData[ this[0] ]
				? ctx[0].aoData[ this[0] ]._details
				: undefined;
		}
		else if ( data === true ) {
			// show
			this.child.show();
		}
		else if ( data === false ) {
			// remove
			__details_remove( this );
		}
		else if ( ctx.length && this.length ) {
			// set
			__details_add( ctx[0], ctx[0].aoData[ this[0] ], data, klass );
		}
	
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.show()',
		_child_mth+'.show()' // only when `child()` was called with parameters (without
	], function () {         // it returns an object and this method is not executed)
		__details_display( this, true );
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.hide()',
		_child_mth+'.hide()' // only when `child()` was called with parameters (without
	], function () {         // it returns an object and this method is not executed)
		__details_display( this, false );
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.remove()',
		_child_mth+'.remove()' // only when `child()` was called with parameters (without
	], function () {           // it returns an object and this method is not executed)
		__details_remove( this );
		return this;
	} );
	
	
	_api_register( _child_obj+'.isShown()', function () {
		var ctx = this.context;
	
		if ( ctx.length && this.length && ctx[0].aoData[ this[0] ] ) {
			// _detailsShown as false or undefined will fall through to return false
			return ctx[0].aoData[ this[0] ]._detailsShow || false;
		}
		return false;
	} );
	
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Columns
	 *
	 * {integer}           - column index (>=0 count from left, <0 count from right)
	 * "{integer}:visIdx"  - visible column index (i.e. translate to column index)  (>=0 count from left, <0 count from right)
	 * "{integer}:visible" - alias for {integer}:visIdx  (>=0 count from left, <0 count from right)
	 * "{string}:name"     - column name
	 * "{string}"          - jQuery selector on column header nodes
	 *
	 */
	
	// can be an array of these items, comma separated list, or an array of comma
	// separated lists
	
	var __re_column_selector = /^([^:]+)?:(name|title|visIdx|visible)$/;
	
	
	// r1 and r2 are redundant - but it means that the parameters match for the
	// iterator callback in columns().data()
	var __columnData = function ( settings, column, r1, r2, rows, type ) {
		var a = [];
		for ( var row=0, ien=rows.length ; row<ien ; row++ ) {
			a.push( _fnGetCellData( settings, rows[row], column, type ) );
		}
		return a;
	};
	
	
	var __column_header = function ( settings, column, row ) {
		var header = settings.aoHeader;
		var target = row !== undefined
			? row
			: settings.bSortCellsTop // legacy support
				? 0
				: header.length - 1;
	
		return header[target][column].cell;
	};
	
	var __column_selector = function ( settings, selector, opts )
	{
		var
			columns = settings.aoColumns,
			names = _pluck( columns, 'sName' ),
			titles = _pluck( columns, 'sTitle' ),
			cells = DataTable.util.get('[].[].cell')(settings.aoHeader),
			nodes = _unique( _flatten([], cells) );
		
		var run = function ( s ) {
			var selInt = _intVal( s );
	
			// Selector - all
			if ( s === '' ) {
				return _range( columns.length );
			}
	
			// Selector - index
			if ( selInt !== null ) {
				return [ selInt >= 0 ?
					selInt : // Count from left
					columns.length + selInt // Count from right (+ because its a negative value)
				];
			}
	
			// Selector = function
			if ( typeof s === 'function' ) {
				var rows = _selector_row_indexes( settings, opts );
	
				return columns.map(function (col, idx) {
					return s(
							idx,
							__columnData( settings, idx, 0, 0, rows ),
							__column_header( settings, idx )
						) ? idx : null;
				});
			}
	
			// jQuery or string selector
			var match = typeof s === 'string' ?
				s.match( __re_column_selector ) :
				'';
	
			if ( match ) {
				switch( match[2] ) {
					case 'visIdx':
					case 'visible':
						// Selector is a column index
						if (match[1] && match[1].match(/^\d+$/)) {
							var idx = parseInt( match[1], 10 );
	
							// Visible index given, convert to column index
							if ( idx < 0 ) {
								// Counting from the right
								var visColumns = columns.map( function (col,i) {
									return col.bVisible ? i : null;
								} );
								return [ visColumns[ visColumns.length + idx ] ];
							}
							// Counting from the left
							return [ _fnVisibleToColumnIndex( settings, idx ) ];
						}
						
						return columns.map( function (col, idx) {
							// Not visible, can't match
							if (! col.bVisible) {
								return null;
							}
	
							// Selector
							if (match[1]) {
								return $(nodes[idx]).filter(match[1]).length > 0 ? idx : null;
							}
	
							// `:visible` on its own
							return idx;
						} );
	
					case 'name':
						// match by name. `names` is column index complete and in order
						return names.map( function (name, i) {
							return name === match[1] ? i : null;
						} );
	
					case 'title':
						// match by column title
						return titles.map( function (title, i) {
							return title === match[1] ? i : null;
						} );
	
					default:
						return [];
				}
			}
	
			// Cell in the table body
			if ( s.nodeName && s._DT_CellIndex ) {
				return [ s._DT_CellIndex.column ];
			}
	
			// jQuery selector on the TH elements for the columns
			var jqResult = $( nodes )
				.filter( s )
				.map( function () {
					return _fnColumnsFromHeader( this ); // `nodes` is column index complete and in order
				} )
				.toArray()
				.sort(function (a, b) {
					return a - b;
				});
	
			if ( jqResult.length || ! s.nodeName ) {
				return jqResult;
			}
	
			// Otherwise a node which might have a `dt-column` data attribute, or be
			// a child or such an element
			var host = $(s).closest('*[data-dt-column]');
			return host.length ?
				[ host.data('dt-column') ] :
				[];
		};
	
		return _selector_run( 'column', selector, run, settings, opts );
	};
	
	
	var __setColumnVis = function ( settings, column, vis ) {
		var
			cols = settings.aoColumns,
			col  = cols[ column ],
			data = settings.aoData,
			cells, i, ien, tr;
	
		// Get
		if ( vis === undefined ) {
			return col.bVisible;
		}
	
		// Set
		// No change
		if ( col.bVisible === vis ) {
			return false;
		}
	
		if ( vis ) {
			// Insert column
			// Need to decide if we should use appendChild or insertBefore
			var insertBefore = _pluck(cols, 'bVisible').indexOf(true, column+1);
	
			for ( i=0, ien=data.length ; i<ien ; i++ ) {
				if (data[i]) {
					tr = data[i].nTr;
					cells = data[i].anCells;
	
					if ( tr ) {
						// insertBefore can act like appendChild if 2nd arg is null
						tr.insertBefore( cells[ column ], cells[ insertBefore ] || null );
					}
				}
			}
		}
		else {
			// Remove column
			$( _pluck( settings.aoData, 'anCells', column ) ).detach();
		}
	
		// Common actions
		col.bVisible = vis;
	
		_colGroup(settings);
		
		return true;
	};
	
	
	_api_register( 'columns()', function ( selector, opts ) {
		// argument shifting
		if ( selector === undefined ) {
			selector = '';
		}
		else if ( $.isPlainObject( selector ) ) {
			opts = selector;
			selector = '';
		}
	
		opts = _selector_opts( opts );
	
		var inst = this.iterator( 'table', function ( settings ) {
			return __column_selector( settings, selector, opts );
		}, 1 );
	
		// Want argument shifting here and in _row_selector?
		inst.selector.cols = selector;
		inst.selector.opts = opts;
	
		return inst;
	} );
	
	_api_registerPlural( 'columns().header()', 'column().header()', function ( row ) {
		return this.iterator( 'column', function (settings, column) {
			return __column_header(settings, column, row);
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().footer()', 'column().footer()', function ( row ) {
		return this.iterator( 'column', function ( settings, column ) {
			var footer = settings.aoFooter;
	
			if (! footer.length) {
				return null;
			}
	
			return settings.aoFooter[row !== undefined ? row : 0][column].cell;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().data()', 'column().data()', function () {
		return this.iterator( 'column-rows', __columnData, 1 );
	} );
	
	_api_registerPlural( 'columns().render()', 'column().render()', function ( type ) {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return __columnData( settings, column, i, j, rows, type );
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().dataSrc()', 'column().dataSrc()', function () {
		return this.iterator( 'column', function ( settings, column ) {
			return settings.aoColumns[column].mData;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().cache()', 'column().cache()', function ( type ) {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return _pluck_order( settings.aoData, rows,
				type === 'search' ? '_aFilterData' : '_aSortData', column
			);
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().init()', 'column().init()', function () {
		return this.iterator( 'column', function ( settings, column ) {
			return settings.aoColumns[column];
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().nodes()', 'column().nodes()', function () {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return _pluck_order( settings.aoData, rows, 'anCells', column ) ;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().titles()', 'column().title()', function (title, row) {
		return this.iterator( 'column', function ( settings, column ) {
			// Argument shifting
			if (typeof title === 'number') {
				row = title;
				title = undefined;
			}
	
			var span = $('span.dt-column-title', this.column(column).header(row));
	
			if (title !== undefined) {
				span.html(title);
				return this;
			}
	
			return span.html();
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().types()', 'column().type()', function () {
		return this.iterator( 'column', function ( settings, column ) {
			var type = settings.aoColumns[column].sType;
	
			// If the type was invalidated, then resolve it. This actually does
			// all columns at the moment. Would only happen once if getting all
			// column's data types.
			if (! type) {
				_fnColumnTypes(settings);
			}
	
			return type;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().visible()', 'column().visible()', function ( vis, calc ) {
		var that = this;
		var changed = [];
		var ret = this.iterator( 'column', function ( settings, column ) {
			if ( vis === undefined ) {
				return settings.aoColumns[ column ].bVisible;
			} // else
			
			if (__setColumnVis( settings, column, vis )) {
				changed.push(column);
			}
		} );
	
		// Group the column visibility changes
		if ( vis !== undefined ) {
			this.iterator( 'table', function ( settings ) {
				// Redraw the header after changes
				_fnDrawHead( settings, settings.aoHeader );
				_fnDrawHead( settings, settings.aoFooter );
		
				// Update colspan for no records display. Child rows and extensions will use their own
				// listeners to do this - only need to update the empty table item here
				if ( ! settings.aiDisplay.length ) {
					$(settings.nTBody).find('td[colspan]').attr('colspan', _fnVisbleColumns(settings));
				}
		
				_fnSaveState( settings );
	
				// Second loop once the first is done for events
				that.iterator( 'column', function ( settings, column ) {
					if (changed.includes(column)) {
						_fnCallbackFire( settings, null, 'column-visibility', [settings, column, vis, calc] );
					}
				} );
	
				if ( changed.length && (calc === undefined || calc) ) {
					that.columns.adjust();
				}
			});
		}
	
		return ret;
	} );
	
	_api_registerPlural( 'columns().widths()', 'column().width()', function () {
		// Injects a fake row into the table for just a moment so the widths can
		// be read, regardless of colspan in the header and rows being present in
		// the body
		var columns = this.columns(':visible').count();
		var row = $('<tr>').html('<td>' + Array(columns).join('</td><td>') + '</td>');
	
		$(this.table().body()).append(row);
	
		var widths = row.children().map(function () {
			return $(this).outerWidth();
		});
	
		row.remove();
		
		return this.iterator( 'column', function ( settings, column ) {
			var visIdx = _fnColumnIndexToVisible( settings, column );
	
			return visIdx !== null ? widths[visIdx] : 0;
		}, 1);
	} );
	
	_api_registerPlural( 'columns().indexes()', 'column().index()', function ( type ) {
		return this.iterator( 'column', function ( settings, column ) {
			return type === 'visible' ?
				_fnColumnIndexToVisible( settings, column ) :
				column;
		}, 1 );
	} );
	
	_api_register( 'columns.adjust()', function () {
		return this.iterator( 'table', function ( settings ) {
			// Force a column sizing to happen with a manual call - otherwise it can skip
			// if the size hasn't changed
			settings.containerWidth = -1;
	
			_fnAdjustColumnSizing( settings );
		}, 1 );
	} );
	
	_api_register( 'column.index()', function ( type, idx ) {
		if ( this.context.length !== 0 ) {
			var ctx = this.context[0];
	
			if ( type === 'fromVisible' || type === 'toData' ) {
				return _fnVisibleToColumnIndex( ctx, idx );
			}
			else if ( type === 'fromData' || type === 'toVisible' ) {
				return _fnColumnIndexToVisible( ctx, idx );
			}
		}
	} );
	
	_api_register( 'column()', function ( selector, opts ) {
		return _selector_first( this.columns( selector, opts ) );
	} );
	
	var __cell_selector = function ( settings, selector, opts )
	{
		var data = settings.aoData;
		var rows = _selector_row_indexes( settings, opts );
		var cells = _removeEmpty( _pluck_order( data, rows, 'anCells' ) );
		var allCells = $(_flatten( [], cells ));
		var row;
		var columns = settings.aoColumns.length;
		var a, i, ien, j, o, host;
	
		var run = function ( s ) {
			var fnSelector = typeof s === 'function';
	
			if ( s === null || s === undefined || fnSelector ) {
				// All cells and function selectors
				a = [];
	
				for ( i=0, ien=rows.length ; i<ien ; i++ ) {
					row = rows[i];
	
					for ( j=0 ; j<columns ; j++ ) {
						o = {
							row: row,
							column: j
						};
	
						if ( fnSelector ) {
							// Selector - function
							host = data[ row ];
	
							if ( s( o, _fnGetCellData(settings, row, j), host.anCells ? host.anCells[j] : null ) ) {
								a.push( o );
							}
						}
						else {
							// Selector - all
							a.push( o );
						}
					}
				}
	
				return a;
			}
			
			// Selector - index
			if ( $.isPlainObject( s ) ) {
				// Valid cell index and its in the array of selectable rows
				return s.column !== undefined && s.row !== undefined && rows.indexOf(s.row) !== -1 ?
					[s] :
					[];
			}
	
			// Selector - jQuery filtered cells
			var jqResult = allCells
				.filter( s )
				.map( function (i, el) {
					return { // use a new object, in case someone changes the values
						row:    el._DT_CellIndex.row,
						column: el._DT_CellIndex.column
					};
				} )
				.toArray();
	
			if ( jqResult.length || ! s.nodeName ) {
				return jqResult;
			}
	
			// Otherwise the selector is a node, and there is one last option - the
			// element might be a child of an element which has dt-row and dt-column
			// data attributes
			host = $(s).closest('*[data-dt-row]');
			return host.length ?
				[ {
					row: host.data('dt-row'),
					column: host.data('dt-column')
				} ] :
				[];
		};
	
		return _selector_run( 'cell', selector, run, settings, opts );
	};
	
	
	
	
	_api_register( 'cells()', function ( rowSelector, columnSelector, opts ) {
		// Argument shifting
		if ( $.isPlainObject( rowSelector ) ) {
			// Indexes
			if ( rowSelector.row === undefined ) {
				// Selector options in first parameter
				opts = rowSelector;
				rowSelector = null;
			}
			else {
				// Cell index objects in first parameter
				opts = columnSelector;
				columnSelector = null;
			}
		}
		if ( $.isPlainObject( columnSelector ) ) {
			opts = columnSelector;
			columnSelector = null;
		}
	
		// Cell selector
		if ( columnSelector === null || columnSelector === undefined ) {
			return this.iterator( 'table', function ( settings ) {
				return __cell_selector( settings, rowSelector, _selector_opts( opts ) );
			} );
		}
	
		// The default built in options need to apply to row and columns
		var internalOpts = opts ? {
			page: opts.page,
			order: opts.order,
			search: opts.search
		} : {};
	
		// Row + column selector
		var columns = this.columns( columnSelector, internalOpts );
		var rows = this.rows( rowSelector, internalOpts );
		var i, ien, j, jen;
	
		var cellsNoOpts = this.iterator( 'table', function ( settings, idx ) {
			var a = [];
	
			for ( i=0, ien=rows[idx].length ; i<ien ; i++ ) {
				for ( j=0, jen=columns[idx].length ; j<jen ; j++ ) {
					a.push( {
						row:    rows[idx][i],
						column: columns[idx][j]
					} );
				}
			}
	
			return a;
		}, 1 );
	
		// There is currently only one extension which uses a cell selector extension
		// It is a _major_ performance drag to run this if it isn't needed, so this is
		// an extension specific check at the moment
		var cells = opts && opts.selected ?
			this.cells( cellsNoOpts, opts ) :
			cellsNoOpts;
	
		$.extend( cells.selector, {
			cols: columnSelector,
			rows: rowSelector,
			opts: opts
		} );
	
		return cells;
	} );
	
	
	_api_registerPlural( 'cells().nodes()', 'cell().node()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			var data = settings.aoData[ row ];
	
			return data && data.anCells ?
				data.anCells[ column ] :
				undefined;
		}, 1 );
	} );
	
	
	_api_register( 'cells().data()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return _fnGetCellData( settings, row, column );
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().cache()', 'cell().cache()', function ( type ) {
		type = type === 'search' ? '_aFilterData' : '_aSortData';
	
		return this.iterator( 'cell', function ( settings, row, column ) {
			return settings.aoData[ row ][ type ][ column ];
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().render()', 'cell().render()', function ( type ) {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return _fnGetCellData( settings, row, column, type );
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().indexes()', 'cell().index()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return {
				row: row,
				column: column,
				columnVisible: _fnColumnIndexToVisible( settings, column )
			};
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().invalidate()', 'cell().invalidate()', function ( src ) {
		return this.iterator( 'cell', function ( settings, row, column ) {
			_fnInvalidate( settings, row, src, column );
		} );
	} );
	
	
	
	_api_register( 'cell()', function ( rowSelector, columnSelector, opts ) {
		return _selector_first( this.cells( rowSelector, columnSelector, opts ) );
	} );
	
	
	_api_register( 'cell().data()', function ( data ) {
		var ctx = this.context;
		var cell = this[0];
	
		if ( data === undefined ) {
			// Get
			return ctx.length && cell.length ?
				_fnGetCellData( ctx[0], cell[0].row, cell[0].column ) :
				undefined;
		}
	
		// Set
		_fnSetCellData( ctx[0], cell[0].row, cell[0].column, data );
		_fnInvalidate( ctx[0], cell[0].row, 'data', cell[0].column );
	
		return this;
	} );
	
	
	
	/**
	 * Get current ordering (sorting) that has been applied to the table.
	 *
	 * @returns {array} 2D array containing the sorting information for the first
	 *   table in the current context. Each element in the parent array represents
	 *   a column being sorted upon (i.e. multi-sorting with two columns would have
	 *   2 inner arrays). The inner arrays may have 2 or 3 elements. The first is
	 *   the column index that the sorting condition applies to, the second is the
	 *   direction of the sort (`desc` or `asc`) and, optionally, the third is the
	 *   index of the sorting order from the `column.sorting` initialisation array.
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {integer} order Column index to sort upon.
	 * @param {string} direction Direction of the sort to be applied (`asc` or `desc`)
	 * @returns {DataTables.Api} this
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {array} order 1D array of sorting information to be applied.
	 * @param {array} [...] Optional additional sorting conditions
	 * @returns {DataTables.Api} this
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {array} order 2D array of sorting information to be applied.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'order()', function ( order, dir ) {
		var ctx = this.context;
		var args = Array.prototype.slice.call( arguments );
	
		if ( order === undefined ) {
			// get
			return ctx.length !== 0 ?
				ctx[0].aaSorting :
				undefined;
		}
	
		// set
		if ( typeof order === 'number' ) {
			// Simple column / direction passed in
			order = [ [ order, dir ] ];
		}
		else if ( args.length > 1 ) {
			// Arguments passed in (list of 1D arrays)
			order = args;
		}
		// otherwise a 2D array was passed in
	
		return this.iterator( 'table', function ( settings ) {
			settings.aaSorting = Array.isArray(order) ? order.slice() : order;
		} );
	} );
	
	
	/**
	 * Attach a sort listener to an element for a given column
	 *
	 * @param {node|jQuery|string} node Identifier for the element(s) to attach the
	 *   listener to. This can take the form of a single DOM node, a jQuery
	 *   collection of nodes or a jQuery selector which will identify the node(s).
	 * @param {integer} column the column that a click on this node will sort on
	 * @param {function} [callback] callback function when sort is run
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'order.listener()', function ( node, column, callback ) {
		return this.iterator( 'table', function ( settings ) {
			_fnSortAttachListener(settings, node, {}, column, callback);
		} );
	} );
	
	
	_api_register( 'order.fixed()', function ( set ) {
		if ( ! set ) {
			var ctx = this.context;
			var fixed = ctx.length ?
				ctx[0].aaSortingFixed :
				undefined;
	
			return Array.isArray( fixed ) ?
				{ pre: fixed } :
				fixed;
		}
	
		return this.iterator( 'table', function ( settings ) {
			settings.aaSortingFixed = $.extend( true, {}, set );
		} );
	} );
	
	
	// Order by the selected column(s)
	_api_register( [
		'columns().order()',
		'column().order()'
	], function ( dir ) {
		var that = this;
	
		if ( ! dir ) {
			return this.iterator( 'column', function ( settings, idx ) {
				var sort = _fnSortFlatten( settings );
	
				for ( var i=0, ien=sort.length ; i<ien ; i++ ) {
					if ( sort[i].col === idx ) {
						return sort[i].dir;
					}
				}
	
				return null;
			}, 1 );
		}
		else {
			return this.iterator( 'table', function ( settings, i ) {
				settings.aaSorting = that[i].map( function (col) {
					return [ col, dir ];
				} );
			} );
		}
	} );
	
	_api_registerPlural('columns().orderable()', 'column().orderable()', function ( directions ) {
		return this.iterator( 'column', function ( settings, idx ) {
			var col = settings.aoColumns[idx];
	
			return directions ?
				col.asSorting :
				col.bSortable;
		}, 1 );
	} );
	
	
	_api_register( 'processing()', function ( show ) {
		return this.iterator( 'table', function ( ctx ) {
			_fnProcessingDisplay( ctx, show );
		} );
	} );
	
	
	_api_register( 'search()', function ( input, regex, smart, caseInsen ) {
		var ctx = this.context;
	
		if ( input === undefined ) {
			// get
			return ctx.length !== 0 ?
				ctx[0].oPreviousSearch.search :
				undefined;
		}
	
		// set
		return this.iterator( 'table', function ( settings ) {
			if ( ! settings.oFeatures.bFilter ) {
				return;
			}
	
			if (typeof regex === 'object') {
				// New style options to pass to the search builder
				_fnFilterComplete( settings, $.extend( settings.oPreviousSearch, regex, {
					search: input
				} ) );
			}
			else {
				// Compat for the old options
				_fnFilterComplete( settings, $.extend( settings.oPreviousSearch, {
					search: input,
					regex:  regex === null ? false : regex,
					smart:  smart === null ? true  : smart,
					caseInsensitive: caseInsen === null ? true : caseInsen
				} ) );
			}
		} );
	} );
	
	_api_register( 'search.fixed()', function ( name, search ) {
		var ret = this.iterator( true, 'table', function ( settings ) {
			var fixed = settings.searchFixed;
	
			if (! name) {
				return Object.keys(fixed)
			}
			else if (search === undefined) {
				return fixed[name];
			}
			else if (search === null) {
				delete fixed[name];
			}
			else {
				fixed[name] = search;
			}
	
			return this;
		} );
	
		return name !== undefined && search === undefined
			? ret[0]
			: ret;
	} );
	
	_api_registerPlural(
		'columns().search()',
		'column().search()',
		function ( input, regex, smart, caseInsen ) {
			return this.iterator( 'column', function ( settings, column ) {
				var preSearch = settings.aoPreSearchCols;
	
				if ( input === undefined ) {
					// get
					return preSearch[ column ].search;
				}
	
				// set
				if ( ! settings.oFeatures.bFilter ) {
					return;
				}
	
				if (typeof regex === 'object') {
					// New style options to pass to the search builder
					$.extend( preSearch[ column ], regex, {
						search: input
					} );
				}
				else {
					// Old style (with not all options available)
					$.extend( preSearch[ column ], {
						search: input,
						regex:  regex === null ? false : regex,
						smart:  smart === null ? true  : smart,
						caseInsensitive: caseInsen === null ? true : caseInsen
					} );
				}
	
				_fnFilterComplete( settings, settings.oPreviousSearch );
			} );
		}
	);
	
	_api_register([
			'columns().search.fixed()',
			'column().search.fixed()'
		],
		function ( name, search ) {
			var ret = this.iterator( true, 'column', function ( settings, colIdx ) {
				var fixed = settings.aoColumns[colIdx].searchFixed;
	
				if (! name) {
					return Object.keys(fixed)
				}
				else if (search === undefined) {
					return fixed[name];
				}
				else if (search === null) {
					delete fixed[name];
				}
				else {
					fixed[name] = search;
				}
	
				return this;
			} );
	
			return name !== undefined && search === undefined
				? ret[0]
				: ret;
		}
	);
	/*
	 * State API methods
	 */
	
	_api_register( 'state()', function ( set, ignoreTime ) {
		// getter
		if ( ! set ) {
			return this.context.length ?
				this.context[0].oSavedState :
				null;
		}
	
		var setMutate = $.extend( true, {}, set );
	
		// setter
		return this.iterator( 'table', function ( settings ) {
			if ( ignoreTime !== false ) {
				setMutate.time = +new Date() + 100;
			}
	
			_fnImplementState( settings, setMutate, function(){} );
		} );
	} );
	
	
	_api_register( 'state.clear()', function () {
		return this.iterator( 'table', function ( settings ) {
			// Save an empty object
			settings.fnStateSaveCallback.call( settings.oInstance, settings, {} );
		} );
	} );
	
	
	_api_register( 'state.loaded()', function () {
		return this.context.length ?
			this.context[0].oLoadedState :
			null;
	} );
	
	
	_api_register( 'state.save()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnSaveState( settings );
		} );
	} );
	
	// Can be assigned in DateTable.use() - note luxon and moment vars are in helpers.js
	var __bootstrap;
	var __foundation;
	
	/**
	 * Set the libraries that DataTables uses, or the global objects.
	 * Note that the arguments can be either way around (legacy support)
	 * and the second is optional. See docs.
	 */
	DataTable.use = function (arg1, arg2) {
		// Reverse arguments for legacy support
		var module = typeof arg1 === 'string'
			? arg2
			: arg1;
		var type = typeof arg2 === 'string'
			? arg2
			: arg1;
	
		// Getter
		if (module === undefined && typeof type === 'string') {
			switch (type) {
				case 'lib':
				case 'jq':
					return $;
	
				case 'win':
					return window;
	
				case 'datetime':
					return DataTable.DateTime;
	
				case 'luxon':
					return __luxon;
	
				case 'moment':
					return __moment;
	
				case 'bootstrap':
					// Use local if set, otherwise try window, which could be undefined
					return __bootstrap || window.bootstrap;
	
				case 'foundation':
					// Ditto
					return __foundation || window.Foundation;
	
				default:
					return null;
			}
		}
	
		// Setter
		if (type === 'lib' || type === 'jq' || (module && module.fn && module.fn.jquery)) {
			$ = module;
		}
		else if (type === 'win' || (module && module.document)) {
			window = module;
			document = module.document;
		}
		else if (type === 'datetime' || (module && module.type === 'DateTime')) {
			DataTable.DateTime = module;
		}
		else if (type === 'luxon' || (module && module.FixedOffsetZone)) {
			__luxon = module;
		}
		else if (type === 'moment' || (module && module.isMoment)) {
			__moment = module;
		}
		else if (type === 'bootstrap' || (module && module.Modal && module.Modal.NAME === 'modal'))
		{
			// This is currently for BS5 only. BS3/4 attach to jQuery, so no need to use `.use()`
			__bootstrap = module;
		}
		else if (type === 'foundation' || (module && module.Reveal)) {
			__foundation = module;
		}
	}
	
	/**
	 * CommonJS factory function pass through. This will check if the arguments
	 * given are a window object or a jQuery object. If so they are set
	 * accordingly.
	 * @param {*} root Window
	 * @param {*} jq jQUery
	 * @returns {boolean} Indicator
	 */
	DataTable.factory = function (root, jq) {
		var is = false;
	
		// Test if the first parameter is a window object
		if (root && root.document) {
			window = root;
			document = root.document;
		}
	
		// Test if the second parameter is a jQuery object
		if (jq && jq.fn && jq.fn.jquery) {
			$ = jq;
			is = true;
		}
	
		return is;
	}
	
	/**
	 * Provide a common method for plug-ins to check the version of DataTables being
	 * used, in order to ensure compatibility.
	 *
	 *  @param {string} version Version string to check for, in the format "X.Y.Z".
	 *    Note that the formats "X" and "X.Y" are also acceptable.
	 *  @param {string} [version2=current DataTables version] As above, but optional.
	 *   If not given the current DataTables version will be used.
	 *  @returns {boolean} true if this version of DataTables is greater or equal to
	 *    the required version, or false if this version of DataTales is not
	 *    suitable
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    alert( $.fn.dataTable.versionCheck( '1.9.0' ) );
	 */
	DataTable.versionCheck = function( version, version2 )
	{
		var aThis = version2 ?
			version2.split('.') :
			DataTable.version.split('.');
		var aThat = version.split('.');
		var iThis, iThat;
	
		for ( var i=0, iLen=aThat.length ; i<iLen ; i++ ) {
			iThis = parseInt( aThis[i], 10 ) || 0;
			iThat = parseInt( aThat[i], 10 ) || 0;
	
			// Parts are the same, keep comparing
			if (iThis === iThat) {
				continue;
			}
	
			// Parts are different, return immediately
			return iThis > iThat;
		}
	
		return true;
	};
	
	
	/**
	 * Check if a `<table>` node is a DataTable table already or not.
	 *
	 *  @param {node|jquery|string} table Table node, jQuery object or jQuery
	 *      selector for the table to test. Note that if more than more than one
	 *      table is passed on, only the first will be checked
	 *  @returns {boolean} true the table given is a DataTable, or false otherwise
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    if ( ! $.fn.DataTable.isDataTable( '#example' ) ) {
	 *      $('#example').dataTable();
	 *    }
	 */
	DataTable.isDataTable = function ( table )
	{
		var t = $(table).get(0);
		var is = false;
	
		if ( table instanceof DataTable.Api ) {
			return true;
		}
	
		$.each( DataTable.settings, function (i, o) {
			var head = o.nScrollHead ? $('table', o.nScrollHead)[0] : null;
			var foot = o.nScrollFoot ? $('table', o.nScrollFoot)[0] : null;
	
			if ( o.nTable === t || head === t || foot === t ) {
				is = true;
			}
		} );
	
		return is;
	};
	
	
	/**
	 * Get all DataTable tables that have been initialised - optionally you can
	 * select to get only currently visible tables.
	 *
	 *  @param {boolean} [visible=false] Flag to indicate if you want all (default)
	 *    or visible tables only.
	 *  @returns {array} Array of `table` nodes (not DataTable instances) which are
	 *    DataTables
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    $.each( $.fn.dataTable.tables(true), function () {
	 *      $(table).DataTable().columns.adjust();
	 *    } );
	 */
	DataTable.tables = function ( visible )
	{
		var api = false;
	
		if ( $.isPlainObject( visible ) ) {
			api = visible.api;
			visible = visible.visible;
		}
	
		var a = DataTable.settings
			.filter( function (o) {
				return !visible || (visible && $(o.nTable).is(':visible')) 
					? true
					: false;
			} )
			.map( function (o) {
				return o.nTable;
			});
	
		return api ?
			new _Api( a ) :
			a;
	};
	
	
	/**
	 * Convert from camel case parameters to Hungarian notation. This is made public
	 * for the extensions to provide the same ability as DataTables core to accept
	 * either the 1.9 style Hungarian notation, or the 1.10+ style camelCase
	 * parameters.
	 *
	 *  @param {object} src The model object which holds all parameters that can be
	 *    mapped.
	 *  @param {object} user The object to convert from camel case to Hungarian.
	 *  @param {boolean} force When set to `true`, properties which already have a
	 *    Hungarian value in the `user` object will be overwritten. Otherwise they
	 *    won't be.
	 */
	DataTable.camelToHungarian = _fnCamelToHungarian;
	
	
	
	/**
	 *
	 */
	_api_register( '$()', function ( selector, opts ) {
		var
			rows   = this.rows( opts ).nodes(), // Get all rows
			jqRows = $(rows);
	
		return $( [].concat(
			jqRows.filter( selector ).toArray(),
			jqRows.find( selector ).toArray()
		) );
	} );
	
	
	// jQuery functions to operate on the tables
	$.each( [ 'on', 'one', 'off' ], function (i, key) {
		_api_register( key+'()', function ( /* event, handler */ ) {
			var args = Array.prototype.slice.call(arguments);
	
			// Add the `dt` namespace automatically if it isn't already present
			args[0] = args[0].split( /\s/ ).map( function ( e ) {
				return ! e.match(/\.dt\b/) ?
					e+'.dt' :
					e;
				} ).join( ' ' );
	
			var inst = $( this.tables().nodes() );
			inst[key].apply( inst, args );
			return this;
		} );
	} );
	
	
	_api_register( 'clear()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnClearTable( settings );
		} );
	} );
	
	
	_api_register( 'error()', function (msg) {
		return this.iterator( 'table', function ( settings ) {
			_fnLog( settings, 0, msg );
		} );
	} );
	
	
	_api_register( 'settings()', function () {
		return new _Api( this.context, this.context );
	} );
	
	
	_api_register( 'init()', function () {
		var ctx = this.context;
		return ctx.length ? ctx[0].oInit : null;
	} );
	
	
	_api_register( 'data()', function () {
		return this.iterator( 'table', function ( settings ) {
			return _pluck( settings.aoData, '_aData' );
		} ).flatten();
	} );
	
	
	_api_register( 'trigger()', function ( name, args, bubbles ) {
		return this.iterator( 'table', function ( settings ) {
			return _fnCallbackFire( settings, null, name, args, bubbles );
		} ).flatten();
	} );
	
	
	_api_register( 'ready()', function ( fn ) {
		var ctx = this.context;
	
		// Get status of first table
		if (! fn) {
			return ctx.length
				? (ctx[0]._bInitComplete || false)
				: null;
		}
	
		// Function to run either once the table becomes ready or
		// immediately if it is already ready.
		return this.tables().every(function () {
			var api = this;
	
			if (this.context[0]._bInitComplete) {
				fn.call(api);
			}
			else {
				this.on('init.dt.DT', function () {
					fn.call(api);
				});
			}
		} );
	} );
	
	
	_api_register( 'destroy()', function ( remove ) {
		remove = remove || false;
	
		return this.iterator( 'table', function ( settings ) {
			var classes   = settings.oClasses;
			var table     = settings.nTable;
			var tbody     = settings.nTBody;
			var thead     = settings.nTHead;
			var tfoot     = settings.nTFoot;
			var jqTable   = $(table);
			var jqTbody   = $(tbody);
			var jqWrapper = $(settings.nTableWrapper);
			var rows      = settings.aoData.map( function (r) { return r ? r.nTr : null; } );
			var orderClasses = classes.order;
	
			// Flag to note that the table is currently being destroyed - no action
			// should be taken
			settings.bDestroying = true;
	
			// Fire off the destroy callbacks for plug-ins etc
			_fnCallbackFire( settings, "aoDestroyCallback", "destroy", [settings], true );
	
			// If not being removed from the document, make all columns visible
			if ( ! remove ) {
				new _Api( settings ).columns().visible( true );
			}
	
			// Container width change listener
			if (settings.resizeObserver) {
				settings.resizeObserver.disconnect();
			}
	
			// Blitz all `DT` namespaced events (these are internal events, the
			// lowercase, `dt` events are user subscribed and they are responsible
			// for removing them
			jqWrapper.off('.DT').find(':not(tbody *)').off('.DT');
			$(window).off('.DT-'+settings.sInstance);
	
			// When scrolling we had to break the table up - restore it
			if ( table != thead.parentNode ) {
				jqTable.children('thead').detach();
				jqTable.append( thead );
			}
	
			if ( tfoot && table != tfoot.parentNode ) {
				jqTable.children('tfoot').detach();
				jqTable.append( tfoot );
			}
	
			// Clean up the header
			$(thead).find('span.dt-column-order').remove();
			$(thead).find('span.dt-column-title').each(function () {
				var title = $(this).html();
				$(this).parent().append(title);
				$(this).remove();
			});
	
			settings.colgroup.remove();
	
			settings.aaSorting = [];
			settings.aaSortingFixed = [];
			_fnSortingClasses( settings );
	
			$(jqTable).find('th, td').removeClass(
				$.map(DataTable.ext.type.className, function (v) {
					return v;
				}).join(' ')
			);
	
			$('th, td', thead)
				.removeClass(
					orderClasses.none + ' ' +
					orderClasses.canAsc + ' ' +
					orderClasses.canDesc + ' ' +
					orderClasses.isAsc + ' ' +
					orderClasses.isDesc
				)
				.css('width', '')
				.removeAttr('data-dt-column')
				.removeAttr('aria-sort');
	
			// Add the TR elements back into the table in their original order
			jqTbody.children().detach();
			jqTbody.append( rows );
	
			var orig = settings.nTableWrapper.parentNode;
			var insertBefore = settings.nTableWrapper.nextSibling;
	
			// Remove the DataTables generated nodes, events and classes
			var removedMethod = remove ? 'remove' : 'detach';
			jqTable[ removedMethod ]();
			jqWrapper[ removedMethod ]();
	
			// If we need to reattach the table to the document
			if ( ! remove && orig ) {
				// insertBefore acts like appendChild if !arg[1]
				orig.insertBefore( table, insertBefore );
	
				// Restore the width of the original table - was read from the style property,
				// so we can restore directly to that
				jqTable
					.css( 'width', settings.sDestroyWidth )
					.removeClass( classes.table );
			}
	
			/* Remove the settings object from the settings array */
			var idx = DataTable.settings.indexOf(settings);
			if ( idx !== -1 ) {
				DataTable.settings.splice( idx, 1 );
			}
		} );
	} );
	
	
	// Add the `every()` method for rows, columns and cells in a compact form
	$.each( [ 'column', 'row', 'cell' ], function ( i, type ) {
		_api_register( type+'s().every()', function ( fn ) {
			var opts = this.selector.opts;
			var api = this;
			var inst;
			var counter = 0;
	
			return this.iterator( 'every', function ( settings, selectedIdx, tableIdx ) {
				inst = api[ type ](selectedIdx, opts);
	
				if (type === 'cell') {
					fn.call(inst, inst[0][0].row, inst[0][0].column, tableIdx, counter);
				}
				else {
					fn.call(inst, selectedIdx, tableIdx, counter);
				}
	
				counter++;
			} );
		} );
	} );
	
	
	// i18n method for extensions to be able to use the language object from the
	// DataTable
	_api_register( 'i18n()', function ( token, def, plural ) {
		var ctx = this.context[0];
		var resolved = _fnGetObjectDataFn( token )( ctx.oLanguage );
	
		if ( resolved === undefined ) {
			resolved = def;
		}
	
		if ( $.isPlainObject( resolved ) ) {
			resolved = plural !== undefined && resolved[ plural ] !== undefined ?
				resolved[ plural ] :
				resolved._;
		}
	
		return typeof resolved === 'string'
			? resolved.replace( '%d', plural ) // nb: plural might be undefined,
			: resolved;
	} );
	
	/**
	 * Version string for plug-ins to check compatibility. Allowed format is
	 * `a.b.c-d` where: a:int, b:int, c:int, d:string(dev|beta|alpha). `d` is used
	 * only for non-release builds. See https://semver.org/ for more information.
	 *  @member
	 *  @type string
	 *  @default Version number
	 */
	DataTable.version = "2.2.2";
	
	/**
	 * Private data store, containing all of the settings objects that are
	 * created for the tables on a given page.
	 *
	 * Note that the `DataTable.settings` object is aliased to
	 * `jQuery.fn.dataTableExt` through which it may be accessed and
	 * manipulated, or `jQuery.fn.dataTable.settings`.
	 *  @member
	 *  @type array
	 *  @default []
	 *  @private
	 */
	DataTable.settings = [];
	
	/**
	 * Object models container, for the various models that DataTables has
	 * available to it. These models define the objects that are used to hold
	 * the active state and configuration of the table.
	 *  @namespace
	 */
	DataTable.models = {};
	
	
	
	/**
	 * Template object for the way in which DataTables holds information about
	 * search information for the global filter and individual column filters.
	 *  @namespace
	 */
	DataTable.models.oSearch = {
		/**
		 * Flag to indicate if the filtering should be case insensitive or not
		 */
		"caseInsensitive": true,
	
		/**
		 * Applied search term
		 */
		"search": "",
	
		/**
		 * Flag to indicate if the search term should be interpreted as a
		 * regular expression (true) or not (false) and therefore and special
		 * regex characters escaped.
		 */
		"regex": false,
	
		/**
		 * Flag to indicate if DataTables is to use its smart filtering or not.
		 */
		"smart": true,
	
		/**
		 * Flag to indicate if DataTables should only trigger a search when
		 * the return key is pressed.
		 */
		"return": false
	};
	
	
	
	
	/**
	 * Template object for the way in which DataTables holds information about
	 * each individual row. This is the object format used for the settings
	 * aoData array.
	 *  @namespace
	 */
	DataTable.models.oRow = {
		/**
		 * TR element for the row
		 */
		"nTr": null,
	
		/**
		 * Array of TD elements for each row. This is null until the row has been
		 * created.
		 */
		"anCells": null,
	
		/**
		 * Data object from the original data source for the row. This is either
		 * an array if using the traditional form of DataTables, or an object if
		 * using mData options. The exact type will depend on the passed in
		 * data from the data source, or will be an array if using DOM a data
		 * source.
		 */
		"_aData": [],
	
		/**
		 * Sorting data cache - this array is ostensibly the same length as the
		 * number of columns (although each index is generated only as it is
		 * needed), and holds the data that is used for sorting each column in the
		 * row. We do this cache generation at the start of the sort in order that
		 * the formatting of the sort data need be done only once for each cell
		 * per sort. This array should not be read from or written to by anything
		 * other than the master sorting methods.
		 */
		"_aSortData": null,
	
		/**
		 * Per cell filtering data cache. As per the sort data cache, used to
		 * increase the performance of the filtering in DataTables
		 */
		"_aFilterData": null,
	
		/**
		 * Filtering data cache. This is the same as the cell filtering cache, but
		 * in this case a string rather than an array. This is easily computed with
		 * a join on `_aFilterData`, but is provided as a cache so the join isn't
		 * needed on every search (memory traded for performance)
		 */
		"_sFilterRow": null,
	
		/**
		 * Denote if the original data source was from the DOM, or the data source
		 * object. This is used for invalidating data, so DataTables can
		 * automatically read data from the original source, unless uninstructed
		 * otherwise.
		 */
		"src": null,
	
		/**
		 * Index in the aoData array. This saves an indexOf lookup when we have the
		 * object, but want to know the index
		 */
		"idx": -1,
	
		/**
		 * Cached display value
		 */
		displayData: null
	};
	
	
	/**
	 * Template object for the column information object in DataTables. This object
	 * is held in the settings aoColumns array and contains all the information that
	 * DataTables needs about each individual column.
	 *
	 * Note that this object is related to {@link DataTable.defaults.column}
	 * but this one is the internal data store for DataTables's cache of columns.
	 * It should NOT be manipulated outside of DataTables. Any configuration should
	 * be done through the initialisation options.
	 *  @namespace
	 */
	DataTable.models.oColumn = {
		/**
		 * Column index.
		 */
		"idx": null,
	
		/**
		 * A list of the columns that sorting should occur on when this column
		 * is sorted. That this property is an array allows multi-column sorting
		 * to be defined for a column (for example first name / last name columns
		 * would benefit from this). The values are integers pointing to the
		 * columns to be sorted on (typically it will be a single integer pointing
		 * at itself, but that doesn't need to be the case).
		 */
		"aDataSort": null,
	
		/**
		 * Define the sorting directions that are applied to the column, in sequence
		 * as the column is repeatedly sorted upon - i.e. the first value is used
		 * as the sorting direction when the column if first sorted (clicked on).
		 * Sort it again (click again) and it will move on to the next index.
		 * Repeat until loop.
		 */
		"asSorting": null,
	
		/**
		 * Flag to indicate if the column is searchable, and thus should be included
		 * in the filtering or not.
		 */
		"bSearchable": null,
	
		/**
		 * Flag to indicate if the column is sortable or not.
		 */
		"bSortable": null,
	
		/**
		 * Flag to indicate if the column is currently visible in the table or not
		 */
		"bVisible": null,
	
		/**
		 * Store for manual type assignment using the `column.type` option. This
		 * is held in store so we can manipulate the column's `sType` property.
		 */
		"_sManualType": null,
	
		/**
		 * Flag to indicate if HTML5 data attributes should be used as the data
		 * source for filtering or sorting. True is either are.
		 */
		"_bAttrSrc": false,
	
		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available.
		 */
		"fnCreatedCell": null,
	
		/**
		 * Function to get data from a cell in a column. You should <b>never</b>
		 * access data directly through _aData internally in DataTables - always use
		 * the method attached to this property. It allows mData to function as
		 * required. This function is automatically assigned by the column
		 * initialisation method
		 */
		"fnGetData": null,
	
		/**
		 * Function to set data for a cell in the column. You should <b>never</b>
		 * set the data directly to _aData internally in DataTables - always use
		 * this method. It allows mData to function as required. This function
		 * is automatically assigned by the column initialisation method
		 */
		"fnSetData": null,
	
		/**
		 * Property to read the value for the cells in the column from the data
		 * source array / object. If null, then the default content is used, if a
		 * function is given then the return from the function is used.
		 */
		"mData": null,
	
		/**
		 * Partner property to mData which is used (only when defined) to get
		 * the data - i.e. it is basically the same as mData, but without the
		 * 'set' option, and also the data fed to it is the result from mData.
		 * This is the rendering method to match the data method of mData.
		 */
		"mRender": null,
	
		/**
		 * The class to apply to all TD elements in the table's TBODY for the column
		 */
		"sClass": null,
	
		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 */
		"sContentPadding": null,
	
		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because mData
		 * is set to null, or because the data source itself is null).
		 */
		"sDefaultContent": null,
	
		/**
		 * Name for the column, allowing reference to the column by name as well as
		 * by index (needs a lookup to work by name).
		 */
		"sName": null,
	
		/**
		 * Custom sorting data type - defines which of the available plug-ins in
		 * afnSortData the custom sorting will use - if any is defined.
		 */
		"sSortDataType": 'std',
	
		/**
		 * Class to be applied to the header element when sorting on this column
		 */
		"sSortingClass": null,
	
		/**
		 * Title of the column - what is seen in the TH element (nTh).
		 */
		"sTitle": null,
	
		/**
		 * Column sorting and filtering type
		 */
		"sType": null,
	
		/**
		 * Width of the column
		 */
		"sWidth": null,
	
		/**
		 * Width of the column when it was first "encountered"
		 */
		"sWidthOrig": null,
	
		/** Cached string which is the longest in the column */
		maxLenString: null,
	
		/**
		 * Store for named searches
		 */
		searchFixed: null
	};
	
	
	/*
	 * Developer note: The properties of the object below are given in Hungarian
	 * notation, that was used as the interface for DataTables prior to v1.10, however
	 * from v1.10 onwards the primary interface is camel case. In order to avoid
	 * breaking backwards compatibility utterly with this change, the Hungarian
	 * version is still, internally the primary interface, but is is not documented
	 * - hence the @name tags in each doc comment. This allows a Javascript function
	 * to create a map from Hungarian notation to camel case (going the other direction
	 * would require each property to be listed, which would add around 3K to the size
	 * of DataTables, while this method is about a 0.5K hit).
	 *
	 * Ultimately this does pave the way for Hungarian notation to be dropped
	 * completely, but that is a massive amount of work and will break current
	 * installs (therefore is on-hold until v2).
	 */
	
	/**
	 * Initialisation options that can be given to DataTables at initialisation
	 * time.
	 *  @namespace
	 */
	DataTable.defaults = {
		/**
		 * An array of data to use for the table, passed in at initialisation which
		 * will be used in preference to any data which is already in the DOM. This is
		 * particularly useful for constructing tables purely in Javascript, for
		 * example with a custom Ajax call.
		 */
		"aaData": null,
	
	
		/**
		 * If ordering is enabled, then DataTables will perform a first pass sort on
		 * initialisation. You can define which column(s) the sort is performed
		 * upon, and the sorting direction, with this variable. The `sorting` array
		 * should contain an array for each column to be sorted initially containing
		 * the column's index and a direction string ('asc' or 'desc').
		 */
		"aaSorting": [[0,'asc']],
	
	
		/**
		 * This parameter is basically identical to the `sorting` parameter, but
		 * cannot be overridden by user interaction with the table. What this means
		 * is that you could have a column (visible or hidden) which the sorting
		 * will always be forced on first - any sorting after that (from the user)
		 * will then be performed as required. This can be useful for grouping rows
		 * together.
		 */
		"aaSortingFixed": [],
	
	
		/**
		 * DataTables can be instructed to load data to display in the table from a
		 * Ajax source. This option defines how that Ajax call is made and where to.
		 *
		 * The `ajax` property has three different modes of operation, depending on
		 * how it is defined. These are:
		 *
		 * * `string` - Set the URL from where the data should be loaded from.
		 * * `object` - Define properties for `jQuery.ajax`.
		 * * `function` - Custom data get function
		 *
		 * `string`
		 * --------
		 *
		 * As a string, the `ajax` property simply defines the URL from which
		 * DataTables will load data.
		 *
		 * `object`
		 * --------
		 *
		 * As an object, the parameters in the object are passed to
		 * [jQuery.ajax](https://api.jquery.com/jQuery.ajax/) allowing fine control
		 * of the Ajax request. DataTables has a number of default parameters which
		 * you can override using this option. Please refer to the jQuery
		 * documentation for a full description of the options available, although
		 * the following parameters provide additional options in DataTables or
		 * require special consideration:
		 *
		 * * `data` - As with jQuery, `data` can be provided as an object, but it
		 *   can also be used as a function to manipulate the data DataTables sends
		 *   to the server. The function takes a single parameter, an object of
		 *   parameters with the values that DataTables has readied for sending. An
		 *   object may be returned which will be merged into the DataTables
		 *   defaults, or you can add the items to the object that was passed in and
		 *   not return anything from the function. This supersedes `fnServerParams`
		 *   from DataTables 1.9-.
		 *
		 * * `dataSrc` - By default DataTables will look for the property `data` (or
		 *   `aaData` for compatibility with DataTables 1.9-) when obtaining data
		 *   from an Ajax source or for server-side processing - this parameter
		 *   allows that property to be changed. You can use Javascript dotted
		 *   object notation to get a data source for multiple levels of nesting, or
		 *   it my be used as a function. As a function it takes a single parameter,
		 *   the JSON returned from the server, which can be manipulated as
		 *   required, with the returned value being that used by DataTables as the
		 *   data source for the table.
		 *
		 * * `success` - Should not be overridden it is used internally in
		 *   DataTables. To manipulate / transform the data returned by the server
		 *   use `ajax.dataSrc`, or use `ajax` as a function (see below).
		 *
		 * `function`
		 * ----------
		 *
		 * As a function, making the Ajax call is left up to yourself allowing
		 * complete control of the Ajax request. Indeed, if desired, a method other
		 * than Ajax could be used to obtain the required data, such as Web storage
		 * or an AIR database.
		 *
		 * The function is given four parameters and no return is required. The
		 * parameters are:
		 *
		 * 1. _object_ - Data to send to the server
		 * 2. _function_ - Callback function that must be executed when the required
		 *    data has been obtained. That data should be passed into the callback
		 *    as the only parameter
		 * 3. _object_ - DataTables settings object for the table
		 */
		"ajax": null,
	
	
		/**
		 * This parameter allows you to readily specify the entries in the length drop
		 * down menu that DataTables shows when pagination is enabled. It can be
		 * either a 1D array of options which will be used for both the displayed
		 * option and the value, or a 2D array which will use the array in the first
		 * position as the value, and the array in the second position as the
		 * displayed options (useful for language strings such as 'All').
		 *
		 * Note that the `pageLength` property will be automatically set to the
		 * first value given in this array, unless `pageLength` is also provided.
		 */
		"aLengthMenu": [ 10, 25, 50, 100 ],
	
	
		/**
		 * The `columns` option in the initialisation parameter allows you to define
		 * details about the way individual columns behave. For a full list of
		 * column options that can be set, please see
		 * {@link DataTable.defaults.column}. Note that if you use `columns` to
		 * define your columns, you must have an entry in the array for every single
		 * column that you have in your table (these can be null if you don't which
		 * to specify any options).
		 */
		"aoColumns": null,
	
		/**
		 * Very similar to `columns`, `columnDefs` allows you to target a specific
		 * column, multiple columns, or all columns, using the `targets` property of
		 * each object in the array. This allows great flexibility when creating
		 * tables, as the `columnDefs` arrays can be of any length, targeting the
		 * columns you specifically want. `columnDefs` may use any of the column
		 * options available: {@link DataTable.defaults.column}, but it _must_
		 * have `targets` defined in each object in the array. Values in the `targets`
		 * array may be:
		 *   <ul>
		 *     <li>a string - class name will be matched on the TH for the column</li>
		 *     <li>0 or a positive integer - column index counting from the left</li>
		 *     <li>a negative integer - column index counting from the right</li>
		 *     <li>the string "_all" - all columns (i.e. assign a default)</li>
		 *   </ul>
		 */
		"aoColumnDefs": null,
	
	
		/**
		 * Basically the same as `search`, this parameter defines the individual column
		 * filtering state at initialisation time. The array must be of the same size
		 * as the number of columns, and each element be an object with the parameters
		 * `search` and `escapeRegex` (the latter is optional). 'null' is also
		 * accepted and the default will be used.
		 */
		"aoSearchCols": [],
	
	
		/**
		 * Enable or disable automatic column width calculation. This can be disabled
		 * as an optimisation (it takes some time to calculate the widths) if the
		 * tables widths are passed in using `columns`.
		 */
		"bAutoWidth": true,
	
	
		/**
		 * Deferred rendering can provide DataTables with a huge speed boost when you
		 * are using an Ajax or JS data source for the table. This option, when set to
		 * true, will cause DataTables to defer the creation of the table elements for
		 * each row until they are needed for a draw - saving a significant amount of
		 * time.
		 */
		"bDeferRender": true,
	
	
		/**
		 * Replace a DataTable which matches the given selector and replace it with
		 * one which has the properties of the new initialisation object passed. If no
		 * table matches the selector, then the new DataTable will be constructed as
		 * per normal.
		 */
		"bDestroy": false,
	
	
		/**
		 * Enable or disable filtering of data. Filtering in DataTables is "smart" in
		 * that it allows the end user to input multiple words (space separated) and
		 * will match a row containing those words, even if not in the order that was
		 * specified (this allow matching across multiple columns). Note that if you
		 * wish to use filtering in DataTables this must remain 'true' - to remove the
		 * default filtering input box and retain filtering abilities, please use
		 * {@link DataTable.defaults.dom}.
		 */
		"bFilter": true,
	
		/**
		 * Used only for compatiblity with DT1
		 * @deprecated
		 */
		"bInfo": true,
	
		/**
		 * Used only for compatiblity with DT1
		 * @deprecated
		 */
		"bLengthChange": true,
	
		/**
		 * Enable or disable pagination.
		 */
		"bPaginate": true,
	
	
		/**
		 * Enable or disable the display of a 'processing' indicator when the table is
		 * being processed (e.g. a sort). This is particularly useful for tables with
		 * large amounts of data where it can take a noticeable amount of time to sort
		 * the entries.
		 */
		"bProcessing": false,
	
	
		/**
		 * Retrieve the DataTables object for the given selector. Note that if the
		 * table has already been initialised, this parameter will cause DataTables
		 * to simply return the object that has already been set up - it will not take
		 * account of any changes you might have made to the initialisation object
		 * passed to DataTables (setting this parameter to true is an acknowledgement
		 * that you understand this). `destroy` can be used to reinitialise a table if
		 * you need.
		 */
		"bRetrieve": false,
	
	
		/**
		 * When vertical (y) scrolling is enabled, DataTables will force the height of
		 * the table's viewport to the given height at all times (useful for layout).
		 * However, this can look odd when filtering data down to a small data set,
		 * and the footer is left "floating" further down. This parameter (when
		 * enabled) will cause DataTables to collapse the table's viewport down when
		 * the result set will fit within the given Y height.
		 */
		"bScrollCollapse": false,
	
	
		/**
		 * Configure DataTables to use server-side processing. Note that the
		 * `ajax` parameter must also be given in order to give DataTables a
		 * source to obtain the required data for each draw.
		 */
		"bServerSide": false,
	
	
		/**
		 * Enable or disable sorting of columns. Sorting of individual columns can be
		 * disabled by the `sortable` option for each column.
		 */
		"bSort": true,
	
	
		/**
		 * Enable or display DataTables' ability to sort multiple columns at the
		 * same time (activated by shift-click by the user).
		 */
		"bSortMulti": true,
	
	
		/**
		 * Allows control over whether DataTables should use the top (true) unique
		 * cell that is found for a single column, or the bottom (false - default).
		 * This is useful when using complex headers.
		 */
		"bSortCellsTop": null,
	
	
		/**
		 * Enable or disable the addition of the classes `sorting\_1`, `sorting\_2` and
		 * `sorting\_3` to the columns which are currently being sorted on. This is
		 * presented as a feature switch as it can increase processing time (while
		 * classes are removed and added) so for large data sets you might want to
		 * turn this off.
		 */
		"bSortClasses": true,
	
	
		/**
		 * Enable or disable state saving. When enabled HTML5 `localStorage` will be
		 * used to save table display information such as pagination information,
		 * display length, filtering and sorting. As such when the end user reloads
		 * the page the display display will match what thy had previously set up.
		 */
		"bStateSave": false,
	
	
		/**
		 * This function is called when a TR element is created (and all TD child
		 * elements have been inserted), or registered if using a DOM source, allowing
		 * manipulation of the TR element (adding classes etc).
		 */
		"fnCreatedRow": null,
	
	
		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify any aspect you want about the created DOM.
		 */
		"fnDrawCallback": null,
	
	
		/**
		 * Identical to fnHeaderCallback() but for the table footer this function
		 * allows you to modify the table footer on every 'draw' event.
		 */
		"fnFooterCallback": null,
	
	
		/**
		 * When rendering large numbers in the information element for the table
		 * (i.e. "Showing 1 to 10 of 57 entries") DataTables will render large numbers
		 * to have a comma separator for the 'thousands' units (e.g. 1 million is
		 * rendered as "1,000,000") to help readability for the end user. This
		 * function will override the default method DataTables uses.
		 */
		"fnFormatNumber": function ( toFormat ) {
			return toFormat.toString().replace(
				/\B(?=(\d{3})+(?!\d))/g,
				this.oLanguage.sThousands
			);
		},
	
	
		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify the header row. This can be used to calculate and
		 * display useful information about the table.
		 */
		"fnHeaderCallback": null,
	
	
		/**
		 * The information element can be used to convey information about the current
		 * state of the table. Although the internationalisation options presented by
		 * DataTables are quite capable of dealing with most customisations, there may
		 * be times where you wish to customise the string further. This callback
		 * allows you to do exactly that.
		 */
		"fnInfoCallback": null,
	
	
		/**
		 * Called when the table has been initialised. Normally DataTables will
		 * initialise sequentially and there will be no need for this function,
		 * however, this does not hold true when using external language information
		 * since that is obtained using an async XHR call.
		 */
		"fnInitComplete": null,
	
	
		/**
		 * Called at the very start of each table draw and can be used to cancel the
		 * draw by returning false, any other return (including undefined) results in
		 * the full draw occurring).
		 */
		"fnPreDrawCallback": null,
	
	
		/**
		 * This function allows you to 'post process' each row after it have been
		 * generated for each table draw, but before it is rendered on screen. This
		 * function might be used for setting the row class name etc.
		 */
		"fnRowCallback": null,
	
	
		/**
		 * Load the table state. With this function you can define from where, and how, the
		 * state of a table is loaded. By default DataTables will load from `localStorage`
		 * but you might wish to use a server-side database or cookies.
		 */
		"fnStateLoadCallback": function ( settings ) {
			try {
				return JSON.parse(
					(settings.iStateDuration === -1 ? sessionStorage : localStorage).getItem(
						'DataTables_'+settings.sInstance+'_'+location.pathname
					)
				);
			} catch (e) {
				return {};
			}
		},
	
	
		/**
		 * Callback which allows modification of the saved state prior to loading that state.
		 * This callback is called when the table is loading state from the stored data, but
		 * prior to the settings object being modified by the saved state. Note that for
		 * plug-in authors, you should use the `stateLoadParams` event to load parameters for
		 * a plug-in.
		 */
		"fnStateLoadParams": null,
	
	
		/**
		 * Callback that is called when the state has been loaded from the state saving method
		 * and the DataTables settings object has been modified as a result of the loaded state.
		 */
		"fnStateLoaded": null,
	
	
		/**
		 * Save the table state. This function allows you to define where and how the state
		 * information for the table is stored By default DataTables will use `localStorage`
		 * but you might wish to use a server-side database or cookies.
		 */
		"fnStateSaveCallback": function ( settings, data ) {
			try {
				(settings.iStateDuration === -1 ? sessionStorage : localStorage).setItem(
					'DataTables_'+settings.sInstance+'_'+location.pathname,
					JSON.stringify( data )
				);
			} catch (e) {
				// noop
			}
		},
	
	
		/**
		 * Callback which allows modification of the state to be saved. Called when the table
		 * has changed state a new state save is required. This method allows modification of
		 * the state saving object prior to actually doing the save, including addition or
		 * other state properties or modification. Note that for plug-in authors, you should
		 * use the `stateSaveParams` event to save parameters for a plug-in.
		 */
		"fnStateSaveParams": null,
	
	
		/**
		 * Duration for which the saved state information is considered valid. After this period
		 * has elapsed the state will be returned to the default.
		 * Value is given in seconds.
		 */
		"iStateDuration": 7200,
	
	
		/**
		 * Number of rows to display on a single page when using pagination. If
		 * feature enabled (`lengthChange`) then the end user will be able to override
		 * this to a custom setting using a pop-up menu.
		 */
		"iDisplayLength": 10,
	
	
		/**
		 * Define the starting point for data display when using DataTables with
		 * pagination. Note that this parameter is the number of records, rather than
		 * the page number, so if you have 10 records per page and want to start on
		 * the third page, it should be "20".
		 */
		"iDisplayStart": 0,
	
	
		/**
		 * By default DataTables allows keyboard navigation of the table (sorting, paging,
		 * and filtering) by adding a `tabindex` attribute to the required elements. This
		 * allows you to tab through the controls and press the enter key to activate them.
		 * The tabindex is default 0, meaning that the tab follows the flow of the document.
		 * You can overrule this using this parameter if you wish. Use a value of -1 to
		 * disable built-in keyboard navigation.
		 */
		"iTabIndex": 0,
	
	
		/**
		 * Classes that DataTables assigns to the various components and features
		 * that it adds to the HTML table. This allows classes to be configured
		 * during initialisation in addition to through the static
		 * {@link DataTable.ext.oStdClasses} object).
		 */
		"oClasses": {},
	
	
		/**
		 * All strings that DataTables uses in the user interface that it creates
		 * are defined in this object, allowing you to modified them individually or
		 * completely replace them all as required.
		 */
		"oLanguage": {
			/**
			 * Strings that are used for WAI-ARIA labels and controls only (these are not
			 * actually visible on the page, but will be read by screenreaders, and thus
			 * must be internationalised as well).
			 */
			"oAria": {
				/**
				 * ARIA label that is added to the table headers when the column may be sorted
				 */
				"orderable": ": Activate to sort",
	
				/**
				 * ARIA label that is added to the table headers when the column is currently being sorted
				 */
				"orderableReverse": ": Activate to invert sorting",
	
				/**
				 * ARIA label that is added to the table headers when the column is currently being 
				 * sorted and next step is to remove sorting
				 */
				"orderableRemove": ": Activate to remove sorting",
	
				paginate: {
					first: 'First',
					last: 'Last',
					next: 'Next',
					previous: 'Previous',
					number: ''
				}
			},
	
			/**
			 * Pagination string used by DataTables for the built-in pagination
			 * control types.
			 */
			"oPaginate": {
				/**
				 * Label and character for first page button («)
				 */
				"sFirst": "\u00AB",
	
				/**
				 * Last page button (»)
				 */
				"sLast": "\u00BB",
	
				/**
				 * Next page button (›)
				 */
				"sNext": "\u203A",
	
				/**
				 * Previous page button (‹)
				 */
				"sPrevious": "\u2039",
			},
	
			/**
			 * Plural object for the data type the table is showing
			 */
			entries: {
				_: "entries",
				1: "entry"
			},
	
			/**
			 * This string is shown in preference to `zeroRecords` when the table is
			 * empty of data (regardless of filtering). Note that this is an optional
			 * parameter - if it is not given, the value of `zeroRecords` will be used
			 * instead (either the default or given value).
			 */
			"sEmptyTable": "No data available in table",
	
	
			/**
			 * This string gives information to the end user about the information
			 * that is current on display on the page. The following tokens can be
			 * used in the string and will be dynamically replaced as the table
			 * display updates. This tokens can be placed anywhere in the string, or
			 * removed as needed by the language requires:
			 *
			 * * `\_START\_` - Display index of the first record on the current page
			 * * `\_END\_` - Display index of the last record on the current page
			 * * `\_TOTAL\_` - Number of records in the table after filtering
			 * * `\_MAX\_` - Number of records in the table without filtering
			 * * `\_PAGE\_` - Current page number
			 * * `\_PAGES\_` - Total number of pages of data in the table
			 */
			"sInfo": "Showing _START_ to _END_ of _TOTAL_ _ENTRIES-TOTAL_",
	
	
			/**
			 * Display information string for when the table is empty. Typically the
			 * format of this string should match `info`.
			 */
			"sInfoEmpty": "Showing 0 to 0 of 0 _ENTRIES-TOTAL_",
	
	
			/**
			 * When a user filters the information in a table, this string is appended
			 * to the information (`info`) to give an idea of how strong the filtering
			 * is. The variable _MAX_ is dynamically updated.
			 */
			"sInfoFiltered": "(filtered from _MAX_ total _ENTRIES-MAX_)",
	
	
			/**
			 * If can be useful to append extra information to the info string at times,
			 * and this variable does exactly that. This information will be appended to
			 * the `info` (`infoEmpty` and `infoFiltered` in whatever combination they are
			 * being used) at all times.
			 */
			"sInfoPostFix": "",
	
	
			/**
			 * This decimal place operator is a little different from the other
			 * language options since DataTables doesn't output floating point
			 * numbers, so it won't ever use this for display of a number. Rather,
			 * what this parameter does is modify the sort methods of the table so
			 * that numbers which are in a format which has a character other than
			 * a period (`.`) as a decimal place will be sorted numerically.
			 *
			 * Note that numbers with different decimal places cannot be shown in
			 * the same table and still be sortable, the table must be consistent.
			 * However, multiple different tables on the page can use different
			 * decimal place characters.
			 */
			"sDecimal": "",
	
	
			/**
			 * DataTables has a build in number formatter (`formatNumber`) which is
			 * used to format large numbers that are used in the table information.
			 * By default a comma is used, but this can be trivially changed to any
			 * character you wish with this parameter.
			 */
			"sThousands": ",",
	
	
			/**
			 * Detail the action that will be taken when the drop down menu for the
			 * pagination length option is changed. The '_MENU_' variable is replaced
			 * with a default select list of 10, 25, 50 and 100, and can be replaced
			 * with a custom select box if required.
			 */
			"sLengthMenu": "_MENU_ _ENTRIES_ per page",
	
	
			/**
			 * When using Ajax sourced data and during the first draw when DataTables is
			 * gathering the data, this message is shown in an empty row in the table to
			 * indicate to the end user the the data is being loaded. Note that this
			 * parameter is not used when loading data by server-side processing, just
			 * Ajax sourced data with client-side processing.
			 */
			"sLoadingRecords": "Loading...",
	
	
			/**
			 * Text which is displayed when the table is processing a user action
			 * (usually a sort command or similar).
			 */
			"sProcessing": "",
	
	
			/**
			 * Details the actions that will be taken when the user types into the
			 * filtering input text box. The variable "_INPUT_", if used in the string,
			 * is replaced with the HTML text box for the filtering input allowing
			 * control over where it appears in the string. If "_INPUT_" is not given
			 * then the input box is appended to the string automatically.
			 */
			"sSearch": "Search:",
	
	
			/**
			 * Assign a `placeholder` attribute to the search `input` element
			 *  @type string
			 *  @default 
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.searchPlaceholder
			 */
			"sSearchPlaceholder": "",
	
	
			/**
			 * All of the language information can be stored in a file on the
			 * server-side, which DataTables will look up if this parameter is passed.
			 * It must store the URL of the language file, which is in a JSON format,
			 * and the object has the same properties as the oLanguage object in the
			 * initialiser object (i.e. the above parameters). Please refer to one of
			 * the example language files to see how this works in action.
			 */
			"sUrl": "",
	
	
			/**
			 * Text shown inside the table records when the is no information to be
			 * displayed after filtering. `emptyTable` is shown when there is simply no
			 * information in the table at all (regardless of filtering).
			 */
			"sZeroRecords": "No matching records found"
		},
	
	
		/** The initial data order is reversed when `desc` ordering */
		orderDescReverse: true,
	
	
		/**
		 * This parameter allows you to have define the global filtering state at
		 * initialisation time. As an object the `search` parameter must be
		 * defined, but all other parameters are optional. When `regex` is true,
		 * the search string will be treated as a regular expression, when false
		 * (default) it will be treated as a straight string. When `smart`
		 * DataTables will use it's smart filtering methods (to word match at
		 * any point in the data), when false this will not be done.
		 */
		"oSearch": $.extend( {}, DataTable.models.oSearch ),
	
	
		/**
		 * Table and control layout. This replaces the legacy `dom` option.
		 */
		layout: {
			topStart: 'pageLength',
			topEnd: 'search',
			bottomStart: 'info',
			bottomEnd: 'paging'
		},
	
	
		/**
		 * Legacy DOM layout option
		 */
		"sDom": null,
	
	
		/**
		 * Search delay option. This will throttle full table searches that use the
		 * DataTables provided search input element (it does not effect calls to
		 * `dt-api search()`, providing a delay before the search is made.
		 */
		"searchDelay": null,
	
	
		/**
		 * DataTables features six different built-in options for the buttons to
		 * display for pagination control:
		 *
		 * * `numbers` - Page number buttons only
		 * * `simple` - 'Previous' and 'Next' buttons only
		 * * 'simple_numbers` - 'Previous' and 'Next' buttons, plus page numbers
		 * * `full` - 'First', 'Previous', 'Next' and 'Last' buttons
		 * * `full_numbers` - 'First', 'Previous', 'Next' and 'Last' buttons, plus page numbers
		 * * `first_last_numbers` - 'First' and 'Last' buttons, plus page numbers
		 */
		"sPaginationType": "",
	
	
		/**
		 * Enable horizontal scrolling. When a table is too wide to fit into a
		 * certain layout, or you have a large number of columns in the table, you
		 * can enable x-scrolling to show the table in a viewport, which can be
		 * scrolled. This property can be `true` which will allow the table to
		 * scroll horizontally when needed, or any CSS unit, or a number (in which
		 * case it will be treated as a pixel measurement). Setting as simply `true`
		 * is recommended.
		 */
		"sScrollX": "",
	
	
		/**
		 * This property can be used to force a DataTable to use more width than it
		 * might otherwise do when x-scrolling is enabled. For example if you have a
		 * table which requires to be well spaced, this parameter is useful for
		 * "over-sizing" the table, and thus forcing scrolling. This property can by
		 * any CSS unit, or a number (in which case it will be treated as a pixel
		 * measurement).
		 */
		"sScrollXInner": "",
	
	
		/**
		 * Enable vertical scrolling. Vertical scrolling will constrain the DataTable
		 * to the given height, and enable scrolling for any data which overflows the
		 * current viewport. This can be used as an alternative to paging to display
		 * a lot of data in a small area (although paging and scrolling can both be
		 * enabled at the same time). This property can be any CSS unit, or a number
		 * (in which case it will be treated as a pixel measurement).
		 */
		"sScrollY": "",
	
	
		/**
		 * __Deprecated__ The functionality provided by this parameter has now been
		 * superseded by that provided through `ajax`, which should be used instead.
		 *
		 * Set the HTTP method that is used to make the Ajax call for server-side
		 * processing or Ajax sourced data.
		 */
		"sServerMethod": "GET",
	
	
		/**
		 * DataTables makes use of renderers when displaying HTML elements for
		 * a table. These renderers can be added or modified by plug-ins to
		 * generate suitable mark-up for a site. For example the Bootstrap
		 * integration plug-in for DataTables uses a paging button renderer to
		 * display pagination buttons in the mark-up required by Bootstrap.
		 *
		 * For further information about the renderers available see
		 * DataTable.ext.renderer
		 */
		"renderer": null,
	
	
		/**
		 * Set the data property name that DataTables should use to get a row's id
		 * to set as the `id` property in the node.
		 */
		"rowId": "DT_RowId",
	
	
		/**
		 * Caption value
		 */
		"caption": null,
	
	
		/**
		 * For server-side processing - use the data from the DOM for the first draw
		 */
		iDeferLoading: null
	};
	
	_fnHungarianMap( DataTable.defaults );
	
	
	
	/*
	 * Developer note - See note in model.defaults.js about the use of Hungarian
	 * notation and camel case.
	 */
	
	/**
	 * Column options that can be given to DataTables at initialisation time.
	 *  @namespace
	 */
	DataTable.defaults.column = {
		/**
		 * Define which column(s) an order will occur on for this column. This
		 * allows a column's ordering to take multiple columns into account when
		 * doing a sort or use the data from a different column. For example first
		 * name / last name columns make sense to do a multi-column sort over the
		 * two columns.
		 */
		"aDataSort": null,
		"iDataSort": -1,
	
		ariaTitle: '',
	
	
		/**
		 * You can control the default ordering direction, and even alter the
		 * behaviour of the sort handler (i.e. only allow ascending ordering etc)
		 * using this parameter.
		 */
		"asSorting": [ 'asc', 'desc', '' ],
	
	
		/**
		 * Enable or disable filtering on the data in this column.
		 */
		"bSearchable": true,
	
	
		/**
		 * Enable or disable ordering on this column.
		 */
		"bSortable": true,
	
	
		/**
		 * Enable or disable the display of this column.
		 */
		"bVisible": true,
	
	
		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available.
		 */
		"fnCreatedCell": null,
	
	
		/**
		 * This property can be used to read data from any data source property,
		 * including deeply nested objects / properties. `data` can be given in a
		 * number of different ways which effect its behaviour:
		 *
		 * * `integer` - treated as an array index for the data source. This is the
		 *   default that DataTables uses (incrementally increased for each column).
		 * * `string` - read an object property from the data source. There are
		 *   three 'special' options that can be used in the string to alter how
		 *   DataTables reads the data from the source object:
		 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
		 *      Javascript to read from nested objects, so to can the options
		 *      specified in `data`. For example: `browser.version` or
		 *      `browser.name`. If your object parameter name contains a period, use
		 *      `\\` to escape it - i.e. `first\\.name`.
		 *    * `[]` - Array notation. DataTables can automatically combine data
		 *      from and array source, joining the data with the characters provided
		 *      between the two brackets. For example: `name[, ]` would provide a
		 *      comma-space separated list from the source array. If no characters
		 *      are provided between the brackets, the original array source is
		 *      returned.
		 *    * `()` - Function notation. Adding `()` to the end of a parameter will
		 *      execute a function of the name given. For example: `browser()` for a
		 *      simple function on the data source, `browser.version()` for a
		 *      function in a nested property or even `browser().version` to get an
		 *      object property if the function called returns an object. Note that
		 *      function notation is recommended for use in `render` rather than
		 *      `data` as it is much simpler to use as a renderer.
		 * * `null` - use the original data source for the row rather than plucking
		 *   data directly from it. This action has effects on two other
		 *   initialisation options:
		 *    * `defaultContent` - When null is given as the `data` option and
		 *      `defaultContent` is specified for the column, the value defined by
		 *      `defaultContent` will be used for the cell.
		 *    * `render` - When null is used for the `data` option and the `render`
		 *      option is specified for the column, the whole data source for the
		 *      row is used for the renderer.
		 * * `function` - the function given will be executed whenever DataTables
		 *   needs to set or get the data for a cell in the column. The function
		 *   takes three parameters:
		 *    * Parameters:
		 *      * `{array|object}` The data source for the row
		 *      * `{string}` The type call data requested - this will be 'set' when
		 *        setting data or 'filter', 'display', 'type', 'sort' or undefined
		 *        when gathering data. Note that when `undefined` is given for the
		 *        type DataTables expects to get the raw data for the object back<
		 *      * `{*}` Data to set when the second parameter is 'set'.
		 *    * Return:
		 *      * The return value from the function is not required when 'set' is
		 *        the type of call, but otherwise the return is what will be used
		 *        for the data requested.
		 *
		 * Note that `data` is a getter and setter option. If you just require
		 * formatting of data for output, you will likely want to use `render` which
		 * is simply a getter and thus simpler to use.
		 *
		 * Note that prior to DataTables 1.9.2 `data` was called `mDataProp`. The
		 * name change reflects the flexibility of this property and is consistent
		 * with the naming of mRender. If 'mDataProp' is given, then it will still
		 * be used by DataTables, as it automatically maps the old name to the new
		 * if required.
		 */
		"mData": null,
	
	
		/**
		 * This property is the rendering partner to `data` and it is suggested that
		 * when you want to manipulate data for display (including filtering,
		 * sorting etc) without altering the underlying data for the table, use this
		 * property. `render` can be considered to be the the read only companion to
		 * `data` which is read / write (then as such more complex). Like `data`
		 * this option can be given in a number of different ways to effect its
		 * behaviour:
		 *
		 * * `integer` - treated as an array index for the data source. This is the
		 *   default that DataTables uses (incrementally increased for each column).
		 * * `string` - read an object property from the data source. There are
		 *   three 'special' options that can be used in the string to alter how
		 *   DataTables reads the data from the source object:
		 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
		 *      Javascript to read from nested objects, so to can the options
		 *      specified in `data`. For example: `browser.version` or
		 *      `browser.name`. If your object parameter name contains a period, use
		 *      `\\` to escape it - i.e. `first\\.name`.
		 *    * `[]` - Array notation. DataTables can automatically combine data
		 *      from and array source, joining the data with the characters provided
		 *      between the two brackets. For example: `name[, ]` would provide a
		 *      comma-space separated list from the source array. If no characters
		 *      are provided between the brackets, the original array source is
		 *      returned.
		 *    * `()` - Function notation. Adding `()` to the end of a parameter will
		 *      execute a function of the name given. For example: `browser()` for a
		 *      simple function on the data source, `browser.version()` for a
		 *      function in a nested property or even `browser().version` to get an
		 *      object property if the function called returns an object.
		 * * `object` - use different data for the different data types requested by
		 *   DataTables ('filter', 'display', 'type' or 'sort'). The property names
		 *   of the object is the data type the property refers to and the value can
		 *   defined using an integer, string or function using the same rules as
		 *   `render` normally does. Note that an `_` option _must_ be specified.
		 *   This is the default value to use if you haven't specified a value for
		 *   the data type requested by DataTables.
		 * * `function` - the function given will be executed whenever DataTables
		 *   needs to set or get the data for a cell in the column. The function
		 *   takes three parameters:
		 *    * Parameters:
		 *      * {array|object} The data source for the row (based on `data`)
		 *      * {string} The type call data requested - this will be 'filter',
		 *        'display', 'type' or 'sort'.
		 *      * {array|object} The full data source for the row (not based on
		 *        `data`)
		 *    * Return:
		 *      * The return value from the function is what will be used for the
		 *        data requested.
		 */
		"mRender": null,
	
	
		/**
		 * Change the cell type created for the column - either TD cells or TH cells. This
		 * can be useful as TH cells have semantic meaning in the table body, allowing them
		 * to act as a header for a row (you may wish to add scope='row' to the TH elements).
		 */
		"sCellType": "td",
	
	
		/**
		 * Class to give to each cell in this column.
		 */
		"sClass": "",
	
		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 * Generally you shouldn't need this!
		 */
		"sContentPadding": "",
	
	
		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because `data`
		 * is set to null, or because the data source itself is null).
		 */
		"sDefaultContent": null,
	
	
		/**
		 * This parameter is only used in DataTables' server-side processing. It can
		 * be exceptionally useful to know what columns are being displayed on the
		 * client side, and to map these to database fields. When defined, the names
		 * also allow DataTables to reorder information from the server if it comes
		 * back in an unexpected order (i.e. if you switch your columns around on the
		 * client-side, your server-side code does not also need updating).
		 */
		"sName": "",
	
	
		/**
		 * Defines a data source type for the ordering which can be used to read
		 * real-time information from the table (updating the internally cached
		 * version) prior to ordering. This allows ordering to occur on user
		 * editable elements such as form inputs.
		 */
		"sSortDataType": "std",
	
	
		/**
		 * The title of this column.
		 */
		"sTitle": null,
	
	
		/**
		 * The type allows you to specify how the data for this column will be
		 * ordered. Four types (string, numeric, date and html (which will strip
		 * HTML tags before ordering)) are currently available. Note that only date
		 * formats understood by Javascript's Date() object will be accepted as type
		 * date. For example: "Mar 26, 2008 5:03 PM". May take the values: 'string',
		 * 'numeric', 'date' or 'html' (by default). Further types can be adding
		 * through plug-ins.
		 */
		"sType": null,
	
	
		/**
		 * Defining the width of the column, this parameter may take any CSS value
		 * (3em, 20px etc). DataTables applies 'smart' widths to columns which have not
		 * been given a specific width through this interface ensuring that the table
		 * remains readable.
		 */
		"sWidth": null
	};
	
	_fnHungarianMap( DataTable.defaults.column );
	
	
	
	/**
	 * DataTables settings object - this holds all the information needed for a
	 * given table, including configuration, data and current application of the
	 * table options. DataTables does not have a single instance for each DataTable
	 * with the settings attached to that instance, but rather instances of the
	 * DataTable "class" are created on-the-fly as needed (typically by a
	 * $().dataTable() call) and the settings object is then applied to that
	 * instance.
	 *
	 * Note that this object is related to {@link DataTable.defaults} but this
	 * one is the internal data store for DataTables's cache of columns. It should
	 * NOT be manipulated outside of DataTables. Any configuration should be done
	 * through the initialisation options.
	 */
	DataTable.models.oSettings = {
		/**
		 * Primary features of DataTables and their enablement state.
		 */
		"oFeatures": {
	
			/**
			 * Flag to say if DataTables should automatically try to calculate the
			 * optimum table and columns widths (true) or not (false).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bAutoWidth": null,
	
			/**
			 * Delay the creation of TR and TD elements until they are actually
			 * needed by a driven page draw. This can give a significant speed
			 * increase for Ajax source and Javascript source data, but makes no
			 * difference at all for DOM and server-side processing tables.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bDeferRender": null,
	
			/**
			 * Enable filtering on the table or not. Note that if this is disabled
			 * then there is no filtering at all on the table, including fnFilter.
			 * To just remove the filtering input use sDom and remove the 'f' option.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bFilter": null,
	
			/**
			 * Used only for compatiblity with DT1
			 * @deprecated
			 */
			"bInfo": true,
	
			/**
			 * Used only for compatiblity with DT1
			 * @deprecated
			 */
			"bLengthChange": true,
	
			/**
			 * Pagination enabled or not. Note that if this is disabled then length
			 * changing must also be disabled.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bPaginate": null,
	
			/**
			 * Processing indicator enable flag whenever DataTables is enacting a
			 * user request - typically an Ajax request for server-side processing.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bProcessing": null,
	
			/**
			 * Server-side processing enabled flag - when enabled DataTables will
			 * get all data from the server for every draw - there is no filtering,
			 * sorting or paging done on the client-side.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bServerSide": null,
	
			/**
			 * Sorting enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bSort": null,
	
			/**
			 * Multi-column sorting
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bSortMulti": null,
	
			/**
			 * Apply a class to the columns which are being sorted to provide a
			 * visual highlight or not. This can slow things down when enabled since
			 * there is a lot of DOM interaction.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bSortClasses": null,
	
			/**
			 * State saving enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bStateSave": null
		},
	
	
		/**
		 * Scrolling settings for a table.
		 */
		"oScroll": {
			/**
			 * When the table is shorter in height than sScrollY, collapse the
			 * table container down to the height of the table (when true).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bCollapse": null,
	
			/**
			 * Width of the scrollbar for the web-browser's platform. Calculated
			 * during table initialisation.
			 */
			"iBarWidth": 0,
	
			/**
			 * Viewport width for horizontal scrolling. Horizontal scrolling is
			 * disabled if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"sX": null,
	
			/**
			 * Width to expand the table to when using x-scrolling. Typically you
			 * should not need to use this.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @deprecated
			 */
			"sXInner": null,
	
			/**
			 * Viewport height for vertical scrolling. Vertical scrolling is disabled
			 * if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"sY": null
		},
	
		/**
		 * Language information for the table.
		 */
		"oLanguage": {
			/**
			 * Information callback function. See
			 * {@link DataTable.defaults.fnInfoCallback}
			 */
			"fnInfoCallback": null
		},
	
		/**
		 * Browser support parameters
		 */
		"oBrowser": {
			/**
			 * Determine if the vertical scrollbar is on the right or left of the
			 * scrolling container - needed for rtl language layout, although not
			 * all browsers move the scrollbar (Safari).
			 */
			"bScrollbarLeft": false,
	
			/**
			 * Browser scrollbar width
			 */
			"barWidth": 0
		},
	
	
		"ajax": null,
	
	
		/**
		 * Array referencing the nodes which are used for the features. The
		 * parameters of this object match what is allowed by sDom - i.e.
		 *   <ul>
		 *     <li>'l' - Length changing</li>
		 *     <li>'f' - Filtering input</li>
		 *     <li>'t' - The table!</li>
		 *     <li>'i' - Information</li>
		 *     <li>'p' - Pagination</li>
		 *     <li>'r' - pRocessing</li>
		 *   </ul>
		 */
		"aanFeatures": [],
	
		/**
		 * Store data information - see {@link DataTable.models.oRow} for detailed
		 * information.
		 */
		"aoData": [],
	
		/**
		 * Array of indexes which are in the current display (after filtering etc)
		 */
		"aiDisplay": [],
	
		/**
		 * Array of indexes for display - no filtering
		 */
		"aiDisplayMaster": [],
	
		/**
		 * Map of row ids to data indexes
		 */
		"aIds": {},
	
		/**
		 * Store information about each column that is in use
		 */
		"aoColumns": [],
	
		/**
		 * Store information about the table's header
		 */
		"aoHeader": [],
	
		/**
		 * Store information about the table's footer
		 */
		"aoFooter": [],
	
		/**
		 * Store the applied global search information in case we want to force a
		 * research or compare the old search to a new one.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"oPreviousSearch": {},
	
		/**
		 * Store for named searches
		 */
		searchFixed: {},
	
		/**
		 * Store the applied search for each column - see
		 * {@link DataTable.models.oSearch} for the format that is used for the
		 * filtering information for each column.
		 */
		"aoPreSearchCols": [],
	
		/**
		 * Sorting that is applied to the table. Note that the inner arrays are
		 * used in the following manner:
		 * <ul>
		 *   <li>Index 0 - column number</li>
		 *   <li>Index 1 - current sorting direction</li>
		 * </ul>
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"aaSorting": null,
	
		/**
		 * Sorting that is always applied to the table (i.e. prefixed in front of
		 * aaSorting).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"aaSortingFixed": [],
	
		/**
		 * If restoring a table - we should restore its width
		 */
		"sDestroyWidth": 0,
	
		/**
		 * Callback functions array for every time a row is inserted (i.e. on a draw).
		 */
		"aoRowCallback": [],
	
		/**
		 * Callback functions for the header on each draw.
		 */
		"aoHeaderCallback": [],
	
		/**
		 * Callback function for the footer on each draw.
		 */
		"aoFooterCallback": [],
	
		/**
		 * Array of callback functions for draw callback functions
		 */
		"aoDrawCallback": [],
	
		/**
		 * Array of callback functions for row created function
		 */
		"aoRowCreatedCallback": [],
	
		/**
		 * Callback functions for just before the table is redrawn. A return of
		 * false will be used to cancel the draw.
		 */
		"aoPreDrawCallback": [],
	
		/**
		 * Callback functions for when the table has been initialised.
		 */
		"aoInitComplete": [],
	
	
		/**
		 * Callbacks for modifying the settings to be stored for state saving, prior to
		 * saving state.
		 */
		"aoStateSaveParams": [],
	
		/**
		 * Callbacks for modifying the settings that have been stored for state saving
		 * prior to using the stored values to restore the state.
		 */
		"aoStateLoadParams": [],
	
		/**
		 * Callbacks for operating on the settings object once the saved state has been
		 * loaded
		 */
		"aoStateLoaded": [],
	
		/**
		 * Cache the table ID for quick access
		 */
		"sTableId": "",
	
		/**
		 * The TABLE node for the main table
		 */
		"nTable": null,
	
		/**
		 * Permanent ref to the thead element
		 */
		"nTHead": null,
	
		/**
		 * Permanent ref to the tfoot element - if it exists
		 */
		"nTFoot": null,
	
		/**
		 * Permanent ref to the tbody element
		 */
		"nTBody": null,
	
		/**
		 * Cache the wrapper node (contains all DataTables controlled elements)
		 */
		"nTableWrapper": null,
	
		/**
		 * Indicate if all required information has been read in
		 */
		"bInitialised": false,
	
		/**
		 * Information about open rows. Each object in the array has the parameters
		 * 'nTr' and 'nParent'
		 */
		"aoOpenRows": [],
	
		/**
		 * Dictate the positioning of DataTables' control elements - see
		 * {@link DataTable.model.oInit.sDom}.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"sDom": null,
	
		/**
		 * Search delay (in mS)
		 */
		"searchDelay": null,
	
		/**
		 * Which type of pagination should be used.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"sPaginationType": "two_button",
	
		/**
		 * Number of paging controls on the page. Only used for backwards compatibility
		 */
		pagingControls: 0,
	
		/**
		 * The state duration (for `stateSave`) in seconds.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"iStateDuration": 0,
	
		/**
		 * Array of callback functions for state saving. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the JSON string to save that has been thus far created. Returns
		 *       a JSON string to be inserted into a json object
		 *       (i.e. '"param": [ 0, 1, 2]')</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 */
		"aoStateSave": [],
	
		/**
		 * Array of callback functions for state loading. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the object stored. May return false to cancel state loading</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 */
		"aoStateLoad": [],
	
		/**
		 * State that was saved. Useful for back reference
		 */
		"oSavedState": null,
	
		/**
		 * State that was loaded. Useful for back reference
		 */
		"oLoadedState": null,
	
		/**
		 * Note if draw should be blocked while getting data
		 */
		"bAjaxDataGet": true,
	
		/**
		 * The last jQuery XHR object that was used for server-side data gathering.
		 * This can be used for working with the XHR information in one of the
		 * callbacks
		 */
		"jqXHR": null,
	
		/**
		 * JSON returned from the server in the last Ajax request
		 */
		"json": undefined,
	
		/**
		 * Data submitted as part of the last Ajax request
		 */
		"oAjaxData": undefined,
	
		/**
		 * Send the XHR HTTP method - GET or POST (could be PUT or DELETE if
		 * required).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"sServerMethod": null,
	
		/**
		 * Format numbers for display.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"fnFormatNumber": null,
	
		/**
		 * List of options that can be used for the user selectable length menu.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"aLengthMenu": null,
	
		/**
		 * Counter for the draws that the table does. Also used as a tracker for
		 * server-side processing
		 */
		"iDraw": 0,
	
		/**
		 * Indicate if a redraw is being done - useful for Ajax
		 */
		"bDrawing": false,
	
		/**
		 * Draw index (iDraw) of the last error when parsing the returned data
		 */
		"iDrawError": -1,
	
		/**
		 * Paging display length
		 */
		"_iDisplayLength": 10,
	
		/**
		 * Paging start point - aiDisplay index
		 */
		"_iDisplayStart": 0,
	
		/**
		 * Server-side processing - number of records in the result set
		 * (i.e. before filtering), Use fnRecordsTotal rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 */
		"_iRecordsTotal": 0,
	
		/**
		 * Server-side processing - number of records in the current display set
		 * (i.e. after filtering). Use fnRecordsDisplay rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 */
		"_iRecordsDisplay": 0,
	
		/**
		 * The classes to use for the table
		 */
		"oClasses": {},
	
		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if filtering has been done in the draw. Deprecated in favour of
		 * events.
		 *  @deprecated
		 */
		"bFiltered": false,
	
		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if sorting has been done in the draw. Deprecated in favour of
		 * events.
		 *  @deprecated
		 */
		"bSorted": false,
	
		/**
		 * Indicate that if multiple rows are in the header and there is more than
		 * one unique cell per column, if the top one (true) or bottom one (false)
		 * should be used for sorting / title by DataTables.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"bSortCellsTop": null,
	
		/**
		 * Initialisation object that is used for the table
		 */
		"oInit": null,
	
		/**
		 * Destroy callback functions - for plug-ins to attach themselves to the
		 * destroy so they can clean up markup and events.
		 */
		"aoDestroyCallback": [],
	
	
		/**
		 * Get the number of records in the current record set, before filtering
		 */
		"fnRecordsTotal": function ()
		{
			return _fnDataSource( this ) == 'ssp' ?
				this._iRecordsTotal * 1 :
				this.aiDisplayMaster.length;
		},
	
		/**
		 * Get the number of records in the current record set, after filtering
		 */
		"fnRecordsDisplay": function ()
		{
			return _fnDataSource( this ) == 'ssp' ?
				this._iRecordsDisplay * 1 :
				this.aiDisplay.length;
		},
	
		/**
		 * Get the display end point - aiDisplay index
		 */
		"fnDisplayEnd": function ()
		{
			var
				len      = this._iDisplayLength,
				start    = this._iDisplayStart,
				calc     = start + len,
				records  = this.aiDisplay.length,
				features = this.oFeatures,
				paginate = features.bPaginate;
	
			if ( features.bServerSide ) {
				return paginate === false || len === -1 ?
					start + records :
					Math.min( start+len, this._iRecordsDisplay );
			}
			else {
				return ! paginate || calc>records || len===-1 ?
					records :
					calc;
			}
		},
	
		/**
		 * The DataTables object for this table
		 */
		"oInstance": null,
	
		/**
		 * Unique identifier for each instance of the DataTables object. If there
		 * is an ID on the table node, then it takes that value, otherwise an
		 * incrementing internal counter is used.
		 */
		"sInstance": null,
	
		/**
		 * tabindex attribute value that is added to DataTables control elements, allowing
		 * keyboard navigation of the table and its controls.
		 */
		"iTabIndex": 0,
	
		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollHead": null,
	
		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollFoot": null,
	
		/**
		 * Last applied sort
		 */
		"aLastSort": [],
	
		/**
		 * Stored plug-in instances
		 */
		"oPlugins": {},
	
		/**
		 * Function used to get a row's id from the row's data
		 */
		"rowIdFn": null,
	
		/**
		 * Data location where to store a row's id
		 */
		"rowId": null,
	
		caption: '',
	
		captionNode: null,
	
		colgroup: null,
	
		/** Delay loading of data */
		deferLoading: null,
	
		/** Allow auto type detection */
		typeDetect: true,
	
		/** ResizeObserver for the container div */
		resizeObserver: null,
	
		/** Keep a record of the last size of the container, so we can skip duplicates */
		containerWidth: -1
	};
	
	/**
	 * Extension object for DataTables that is used to provide all extension
	 * options.
	 *
	 * Note that the `DataTable.ext` object is available through
	 * `jQuery.fn.dataTable.ext` where it may be accessed and manipulated. It is
	 * also aliased to `jQuery.fn.dataTableExt` for historic reasons.
	 *  @namespace
	 *  @extends DataTable.models.ext
	 */
	
	
	var extPagination = DataTable.ext.pager;
	
	// Paging buttons configuration
	$.extend( extPagination, {
		simple: function () {
			return [ 'previous', 'next' ];
		},
	
		full: function () {
			return [ 'first', 'previous', 'next', 'last' ];
		},
	
		numbers: function () {
			return [ 'numbers' ];
		},
	
		simple_numbers: function () {
			return [ 'previous', 'numbers', 'next' ];
		},
	
		full_numbers: function () {
			return [ 'first', 'previous', 'numbers', 'next', 'last' ];
		},
	
		first_last: function () {
			return ['first', 'last'];
		},
	
		first_last_numbers: function () {
			return ['first', 'numbers', 'last'];
		},
	
		// For testing and plug-ins to use
		_numbers: _pagingNumbers,
	
		// Number of number buttons - legacy, use `numbers` option for paging feature
		numbers_length: 7
	} );
	
	
	$.extend( true, DataTable.ext.renderer, {
		pagingButton: {
			_: function (settings, buttonType, content, active, disabled) {
				var classes = settings.oClasses.paging;
				var btnClasses = [classes.button];
				var btn;
	
				if (active) {
					btnClasses.push(classes.active);
				}
	
				if (disabled) {
					btnClasses.push(classes.disabled)
				}
	
				if (buttonType === 'ellipsis') {
					btn = $('<span class="ellipsis"></span>').html(content)[0];
				}
				else {
					btn = $('<button>', {
						class: btnClasses.join(' '),
						role: 'link',
						type: 'button'
					}).html(content);
				}
	
				return {
					display: btn,
					clicker: btn
				}
			}
		},
	
		pagingContainer: {
			_: function (settings, buttons) {
				// No wrapping element - just append directly to the host
				return buttons;
			}
		}
	} );
	
	// Common function to remove new lines, strip HTML and diacritic control
	var _filterString = function (stripHtml, normalize) {
		return function (str) {
			if (_empty(str) || typeof str !== 'string') {
				return str;
			}
	
			str = str.replace( _re_new_lines, " " );
	
			if (stripHtml) {
				str = _stripHtml(str);
			}
	
			if (normalize) {
				str = _normalize(str, false);
			}
	
			return str;
		};
	}
	
	/*
	 * Public helper functions. These aren't used internally by DataTables, or
	 * called by any of the options passed into DataTables, but they can be used
	 * externally by developers working with DataTables. They are helper functions
	 * to make working with DataTables a little bit easier.
	 */
	
	/**
	 * Common logic for moment, luxon or a date action.
	 *
	 * Happens after __mldObj, so don't need to call `resolveWindowsLibs` again
	 */
	function __mld( dtLib, momentFn, luxonFn, dateFn, arg1 ) {
		if (__moment) {
			return dtLib[momentFn]( arg1 );
		}
		else if (__luxon) {
			return dtLib[luxonFn]( arg1 );
		}
		
		return dateFn ? dtLib[dateFn]( arg1 ) : dtLib;
	}
	
	
	var __mlWarning = false;
	var __luxon; // Can be assigned in DateTable.use()
	var __moment; // Can be assigned in DateTable.use()
	
	/**
	 * 
	 */
	function resolveWindowLibs() {
		if (window.luxon && ! __luxon) {
			__luxon = window.luxon;
		}
		
		if (window.moment && ! __moment) {
			__moment = window.moment;
		}
	}
	
	function __mldObj (d, format, locale) {
		var dt;
	
		resolveWindowLibs();
	
		if (__moment) {
			dt = __moment.utc( d, format, locale, true );
	
			if (! dt.isValid()) {
				return null;
			}
		}
		else if (__luxon) {
			dt = format && typeof d === 'string'
				? __luxon.DateTime.fromFormat( d, format )
				: __luxon.DateTime.fromISO( d );
	
			if (! dt.isValid) {
				return null;
			}
	
			dt = dt.setLocale(locale);
		}
		else if (! format) {
			// No format given, must be ISO
			dt = new Date(d);
		}
		else {
			if (! __mlWarning) {
				alert('DataTables warning: Formatted date without Moment.js or Luxon - https://datatables.net/tn/17');
			}
	
			__mlWarning = true;
		}
	
		return dt;
	}
	
	// Wrapper for date, datetime and time which all operate the same way with the exception of
	// the output string for auto locale support
	function __mlHelper (localeString) {
		return function ( from, to, locale, def ) {
			// Luxon and Moment support
			// Argument shifting
			if ( arguments.length === 0 ) {
				locale = 'en';
				to = null; // means toLocaleString
				from = null; // means iso8601
			}
			else if ( arguments.length === 1 ) {
				locale = 'en';
				to = from;
				from = null;
			}
			else if ( arguments.length === 2 ) {
				locale = to;
				to = from;
				from = null;
			}
	
			var typeName = 'datetime' + (to ? '-' + to : '');
	
			// Add type detection and sorting specific to this date format - we need to be able to identify
			// date type columns as such, rather than as numbers in extensions. Hence the need for this.
			if (! DataTable.ext.type.order[typeName + '-pre']) {
				DataTable.type(typeName, {
					detect: function (d) {
						// The renderer will give the value to type detect as the type!
						return d === typeName ? typeName : false;
					},
					order: {
						pre: function (d) {
							// The renderer gives us Moment, Luxon or Date obects for the sorting, all of which have a
							// `valueOf` which gives milliseconds epoch
							return d.valueOf();
						}
					},
					className: 'dt-right'
				});
			}
		
			return function ( d, type ) {
				// Allow for a default value
				if (d === null || d === undefined) {
					if (def === '--now') {
						// We treat everything as UTC further down, so no changes are
						// made, as such need to get the local date / time as if it were
						// UTC
						var local = new Date();
						d = new Date( Date.UTC(
							local.getFullYear(), local.getMonth(), local.getDate(),
							local.getHours(), local.getMinutes(), local.getSeconds()
						) );
					}
					else {
						d = '';
					}
				}
	
				if (type === 'type') {
					// Typing uses the type name for fast matching
					return typeName;
				}
	
				if (d === '') {
					return type !== 'sort'
						? ''
						: __mldObj('0000-01-01 00:00:00', null, locale);
				}
	
				// Shortcut. If `from` and `to` are the same, we are using the renderer to
				// format for ordering, not display - its already in the display format.
				if ( to !== null && from === to && type !== 'sort' && type !== 'type' && ! (d instanceof Date) ) {
					return d;
				}
	
				var dt = __mldObj(d, from, locale);
	
				if (dt === null) {
					return d;
				}
	
				if (type === 'sort') {
					return dt;
				}
				
				var formatted = to === null
					? __mld(dt, 'toDate', 'toJSDate', '')[localeString]()
					: __mld(dt, 'format', 'toFormat', 'toISOString', to);
	
				// XSS protection
				return type === 'display' ?
					_escapeHtml( formatted ) :
					formatted;
			};
		}
	}
	
	// Based on locale, determine standard number formatting
	// Fallback for legacy browsers is US English
	var __thousands = ',';
	var __decimal = '.';
	
	if (window.Intl !== undefined) {
		try {
			var num = new Intl.NumberFormat().formatToParts(100000.1);
		
			for (var i=0 ; i<num.length ; i++) {
				if (num[i].type === 'group') {
					__thousands = num[i].value;
				}
				else if (num[i].type === 'decimal') {
					__decimal = num[i].value;
				}
			}
		}
		catch (e) {
			// noop
		}
	}
	
	// Formatted date time detection - use by declaring the formats you are going to use
	DataTable.datetime = function ( format, locale ) {
		var typeName = 'datetime-' + format;
	
		if (! locale) {
			locale = 'en';
		}
	
		if (! DataTable.ext.type.order[typeName]) {
			DataTable.type(typeName, {
				detect: function (d) {
					var dt = __mldObj(d, format, locale);
					return d === '' || dt ? typeName : false;
				},
				order: {
					pre: function (d) {
						return __mldObj(d, format, locale) || 0;
					}
				},
				className: 'dt-right'
			});
		}
	}
	
	/**
	 * Helpers for `columns.render`.
	 *
	 * The options defined here can be used with the `columns.render` initialisation
	 * option to provide a display renderer. The following functions are defined:
	 *
	 * * `moment` - Uses the MomentJS library to convert from a given format into another.
	 * This renderer has three overloads:
	 *   * 1 parameter:
	 *     * `string` - Format to convert to (assumes input is ISO8601 and locale is `en`)
	 *   * 2 parameters:
	 *     * `string` - Format to convert from
	 *     * `string` - Format to convert to. Assumes `en` locale
	 *   * 3 parameters:
	 *     * `string` - Format to convert from
	 *     * `string` - Format to convert to
	 *     * `string` - Locale
	 * * `number` - Will format numeric data (defined by `columns.data`) for
	 *   display, retaining the original unformatted data for sorting and filtering.
	 *   It takes 5 parameters:
	 *   * `string` - Thousands grouping separator
	 *   * `string` - Decimal point indicator
	 *   * `integer` - Number of decimal points to show
	 *   * `string` (optional) - Prefix.
	 *   * `string` (optional) - Postfix (/suffix).
	 * * `text` - Escape HTML to help prevent XSS attacks. It has no optional
	 *   parameters.
	 *
	 * @example
	 *   // Column definition using the number renderer
	 *   {
	 *     data: "salary",
	 *     render: $.fn.dataTable.render.number( '\'', '.', 0, '$' )
	 *   }
	 *
	 * @namespace
	 */
	DataTable.render = {
		date: __mlHelper('toLocaleDateString'),
		datetime: __mlHelper('toLocaleString'),
		time: __mlHelper('toLocaleTimeString'),
		number: function ( thousands, decimal, precision, prefix, postfix ) {
			// Auto locale detection
			if (thousands === null || thousands === undefined) {
				thousands = __thousands;
			}
	
			if (decimal === null || decimal === undefined) {
				decimal = __decimal;
			}
	
			return {
				display: function ( d ) {
					if ( typeof d !== 'number' && typeof d !== 'string' ) {
						return d;
					}
	
					if (d === '' || d === null) {
						return d;
					}
	
					var negative = d < 0 ? '-' : '';
					var flo = parseFloat( d );
					var abs = Math.abs(flo);
	
					// Scientific notation for large and small numbers
					if (abs >= 100000000000 || (abs < 0.0001 && abs !== 0) ) {
						var exp = flo.toExponential(precision).split(/e\+?/);
						return exp[0] + ' x 10<sup>' + exp[1] + '</sup>';
					}
	
					// If NaN then there isn't much formatting that we can do - just
					// return immediately, escaping any HTML (this was supposed to
					// be a number after all)
					if ( isNaN( flo ) ) {
						return _escapeHtml( d );
					}
	
					flo = flo.toFixed( precision );
					d = Math.abs( flo );
	
					var intPart = parseInt( d, 10 );
					var floatPart = precision ?
						decimal+(d - intPart).toFixed( precision ).substring( 2 ):
						'';
	
					// If zero, then can't have a negative prefix
					if (intPart === 0 && parseFloat(floatPart) === 0) {
						negative = '';
					}
	
					return negative + (prefix||'') +
						intPart.toString().replace(
							/\B(?=(\d{3})+(?!\d))/g, thousands
						) +
						floatPart +
						(postfix||'');
				}
			};
		},
	
		text: function () {
			return {
				display: _escapeHtml,
				filter: _escapeHtml
			};
		}
	};
	
	
	var _extTypes = DataTable.ext.type;
	
	// Get / set type
	DataTable.type = function (name, prop, val) {
		if (! prop) {
			return {
				className: _extTypes.className[name],
				detect: _extTypes.detect.find(function (fn) {
					return fn._name === name;
				}),
				order: {
					pre: _extTypes.order[name + '-pre'],
					asc: _extTypes.order[name + '-asc'],
					desc: _extTypes.order[name + '-desc']
				},
				render: _extTypes.render[name],
				search: _extTypes.search[name]
			};
		}
	
		var setProp = function(prop, propVal) {
			_extTypes[prop][name] = propVal;
		};
		var setDetect = function (detect) {
			// `detect` can be a function or an object - we set a name
			// property for either - that is used for the detection
			Object.defineProperty(detect, "_name", {value: name});
	
			var idx = _extTypes.detect.findIndex(function (item) {
				return item._name === name;
			});
	
			if (idx === -1) {
				_extTypes.detect.unshift(detect);
			}
			else {
				_extTypes.detect.splice(idx, 1, detect);
			}
		};
		var setOrder = function (obj) {
			_extTypes.order[name + '-pre'] = obj.pre; // can be undefined
			_extTypes.order[name + '-asc'] = obj.asc; // can be undefined
			_extTypes.order[name + '-desc'] = obj.desc; // can be undefined
		};
	
		// prop is optional
		if (val === undefined) {
			val = prop;
			prop = null;
		}
	
		if (prop === 'className') {
			setProp('className', val);
		}
		else if (prop === 'detect') {
			setDetect(val);
		}
		else if (prop === 'order') {
			setOrder(val);
		}
		else if (prop === 'render') {
			setProp('render', val);
		}
		else if (prop === 'search') {
			setProp('search', val);
		}
		else if (! prop) {
			if (val.className) {
				setProp('className', val.className);
			}
	
			if (val.detect !== undefined) {
				setDetect(val.detect);
			}
	
			if (val.order) {
				setOrder(val.order);
			}
	
			if (val.render !== undefined) {
				setProp('render', val.render);
			}
	
			if (val.search !== undefined) {
				setProp('search', val.search);
			}
		}
	}
	
	// Get a list of types
	DataTable.types = function () {
		return _extTypes.detect.map(function (fn) {
			return fn._name;
		});
	};
	
	var __diacriticSort = function (a, b) {
		a = a !== null && a !== undefined ? a.toString().toLowerCase() : '';
		b = b !== null && b !== undefined ? b.toString().toLowerCase() : '';
	
		// Checked for `navigator.languages` support in `oneOf` so this code can't execute in old
		// Safari and thus can disable this check
		// eslint-disable-next-line compat/compat
		return a.localeCompare(b, navigator.languages[0] || navigator.language, {
			numeric: true,
			ignorePunctuation: true,
		});
	}
	
	var __diacriticHtmlSort = function (a, b) {
		a = _stripHtml(a);
		b = _stripHtml(b);
	
		return __diacriticSort(a, b);
	}
	
	//
	// Built in data types
	//
	
	DataTable.type('string', {
		detect: function () {
			return 'string';
		},
		order: {
			pre: function ( a ) {
				// This is a little complex, but faster than always calling toString,
				// http://jsperf.com/tostring-v-check
				return _empty(a) && typeof a !== 'boolean' ?
					'' :
					typeof a === 'string' ?
						a.toLowerCase() :
						! a.toString ?
							'' :
							a.toString();
			}
		},
		search: _filterString(false, true)
	});
	
	DataTable.type('string-utf8', {
		detect: {
			allOf: function ( d ) {
				return true;
			},
			oneOf: function ( d ) {
				// At least one data point must contain a non-ASCII character
				// This line will also check if navigator.languages is supported or not. If not (Safari 10.0-)
				// this data type won't be supported.
				// eslint-disable-next-line compat/compat
				return ! _empty( d ) && navigator.languages && typeof d === 'string' && d.match(/[^\x00-\x7F]/);
			}
		},
		order: {
			asc: __diacriticSort,
			desc: function (a, b) {
				return __diacriticSort(a, b) * -1;
			}
		},
		search: _filterString(false, true)
	});
	
	
	DataTable.type('html', {
		detect: {
			allOf: function ( d ) {
				return _empty( d ) || (typeof d === 'string' && d.indexOf('<') !== -1);
			},
			oneOf: function ( d ) {
				// At least one data point must contain a `<`
				return ! _empty( d ) && typeof d === 'string' && d.indexOf('<') !== -1;
			}
		},
		order: {
			pre: function ( a ) {
				return _empty(a) ?
					'' :
					a.replace ?
						_stripHtml(a).trim().toLowerCase() :
						a+'';
			}
		},
		search: _filterString(true, true)
	});
	
	
	DataTable.type('html-utf8', {
		detect: {
			allOf: function ( d ) {
				return _empty( d ) || (typeof d === 'string' && d.indexOf('<') !== -1);
			},
			oneOf: function ( d ) {
				// At least one data point must contain a `<` and a non-ASCII character
				// eslint-disable-next-line compat/compat
				return navigator.languages &&
					! _empty( d ) &&
					typeof d === 'string' &&
					d.indexOf('<') !== -1 &&
					typeof d === 'string' && d.match(/[^\x00-\x7F]/);
			}
		},
		order: {
			asc: __diacriticHtmlSort,
			desc: function (a, b) {
				return __diacriticHtmlSort(a, b) * -1;
			}
		},
		search: _filterString(true, true)
	});
	
	
	DataTable.type('date', {
		className: 'dt-type-date',
		detect: {
			allOf: function ( d ) {
				// V8 tries _very_ hard to make a string passed into `Date.parse()`
				// valid, so we need to use a regex to restrict date formats. Use a
				// plug-in for anything other than ISO8601 style strings
				if ( d && !(d instanceof Date) && ! _re_date.test(d) ) {
					return null;
				}
				var parsed = Date.parse(d);
				return (parsed !== null && !isNaN(parsed)) || _empty(d);
			},
			oneOf: function ( d ) {
				// At least one entry must be a date or a string with a date
				return (d instanceof Date) || (typeof d === 'string' && _re_date.test(d));
			}
		},
		order: {
			pre: function ( d ) {
				var ts = Date.parse( d );
				return isNaN(ts) ? -Infinity : ts;
			}
		}
	});
	
	
	DataTable.type('html-num-fmt', {
		className: 'dt-type-numeric',
		detect: {
			allOf: function ( d, settings ) {
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric( d, decimal, true, false );
			},
			oneOf: function (d, settings) {
				// At least one data point must contain a numeric value
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric( d, decimal, true, false );
			}
		},
		order: {
			pre: function ( d, s ) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp, _re_html, _re_formatted_numeric );
			}
		},
		search: _filterString(true, true)
	});
	
	
	DataTable.type('html-num', {
		className: 'dt-type-numeric',
		detect: {
			allOf: function ( d, settings ) {
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric( d, decimal, false, true );
			},
			oneOf: function (d, settings) {
				// At least one data point must contain a numeric value
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric( d, decimal, false, false );
			}
		},
		order: {
			pre: function ( d, s ) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp, _re_html );
			}
		},
		search: _filterString(true, true)
	});
	
	
	DataTable.type('num-fmt', {
		className: 'dt-type-numeric',
		detect: {
			allOf: function ( d, settings ) {
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber( d, decimal, true, true );
			},
			oneOf: function (d, settings) {
				// At least one data point must contain a numeric value
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber( d, decimal, true, false );
			}
		},
		order: {
			pre: function ( d, s ) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp, _re_formatted_numeric );
			}
		}
	});
	
	
	DataTable.type('num', {
		className: 'dt-type-numeric',
		detect: {
			allOf: function ( d, settings ) {
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber( d, decimal, false, true );
			},
			oneOf: function (d, settings) {
				// At least one data point must contain a numeric value
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber( d, decimal, false, false );
			}
		},
		order: {
			pre: function (d, s) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp );
			}
		}
	});
	
	
	
	
	var __numericReplace = function ( d, decimalPlace, re1, re2 ) {
		if ( d !== 0 && (!d || d === '-') ) {
			return -Infinity;
		}
		
		var type = typeof d;
	
		if (type === 'number' || type === 'bigint') {
			return d;
		}
	
		// If a decimal place other than `.` is used, it needs to be given to the
		// function so we can detect it and replace with a `.` which is the only
		// decimal place Javascript recognises - it is not locale aware.
		if ( decimalPlace ) {
			d = _numToDecimal( d, decimalPlace );
		}
	
		if ( d.replace ) {
			if ( re1 ) {
				d = d.replace( re1, '' );
			}
	
			if ( re2 ) {
				d = d.replace( re2, '' );
			}
		}
	
		return d * 1;
	};
	
	
	$.extend( true, DataTable.ext.renderer, {
		footer: {
			_: function ( settings, cell, classes ) {
				cell.addClass(classes.tfoot.cell);
			}
		},
	
		header: {
			_: function ( settings, cell, classes ) {
				cell.addClass(classes.thead.cell);
	
				if (! settings.oFeatures.bSort) {
					cell.addClass(classes.order.none);
				}
	
				var legacyTop = settings.bSortCellsTop;
				var headerRows = cell.closest('thead').find('tr');
				var rowIdx = cell.parent().index();
	
				// Conditions to not apply the ordering icons
				if (
					// Cells and rows which have the attribute to disable the icons
					cell.attr('data-dt-order') === 'disable' ||
					cell.parent().attr('data-dt-order') === 'disable' ||
	
					// Legacy support for `orderCellsTop`. If it is set, then cells
					// which are not in the top or bottom row of the header (depending
					// on the value) do not get the sorting classes applied to them
					(legacyTop === true && rowIdx !== 0) ||
					(legacyTop === false && rowIdx !== headerRows.length - 1)
				) {
					return;
				}
	
				// No additional mark-up required
				// Attach a sort listener to update on sort - note that using the
				// `DT` namespace will allow the event to be removed automatically
				// on destroy, while the `dt` namespaced event is the one we are
				// listening for
				$(settings.nTable).on( 'order.dt.DT column-visibility.dt.DT', function ( e, ctx ) {
					if ( settings !== ctx ) { // need to check this this is the host
						return;               // table, not a nested one
					}
	
					var sorting = ctx.sortDetails;
	
					if (! sorting) {
						return;
					}
	
					var i;
					var orderClasses = classes.order;
					var columns = ctx.api.columns( cell );
					var col = settings.aoColumns[columns.flatten()[0]];
					var orderable = columns.orderable().includes(true);
					var ariaType = '';
					var indexes = columns.indexes();
					var sortDirs = columns.orderable(true).flatten();
					var orderedColumns = _pluck(sorting, 'col');
					var tabIndex = settings.iTabIndex;
	
					cell
						.removeClass(
							orderClasses.isAsc +' '+
							orderClasses.isDesc
						)
						.toggleClass( orderClasses.none, ! orderable )
						.toggleClass( orderClasses.canAsc, orderable && sortDirs.includes('asc') )
						.toggleClass( orderClasses.canDesc, orderable && sortDirs.includes('desc') );
	
					// Determine if all of the columns that this cell covers are included in the
					// current ordering
					var isOrdering = true;
					
					for (i=0; i<indexes.length; i++) {
						if (! orderedColumns.includes(indexes[i])) {
							isOrdering = false;
						}
					}
	
					if ( isOrdering ) {
						// Get the ordering direction for the columns under this cell
						// Note that it is possible for a cell to be asc and desc sorting
						// (column spanning cells)
						var orderDirs = columns.order();
	
						cell.addClass(
							orderDirs.includes('asc') ? orderClasses.isAsc : '' +
							orderDirs.includes('desc') ? orderClasses.isDesc : ''
						);
					}
	
					// Find the first visible column that has ordering applied to it - it get's
					// the aria information, as the ARIA spec says that only one column should
					// be marked with aria-sort
					var firstVis = -1; // column index
	
					for (i=0; i<orderedColumns.length; i++) {
						if (settings.aoColumns[orderedColumns[i]].bVisible) {
							firstVis = orderedColumns[i];
							break;
						}
					}
	
					if (indexes[0] == firstVis) {
						var firstSort = sorting[0];
						var sortOrder = col.asSorting;
	
						cell.attr('aria-sort', firstSort.dir === 'asc' ? 'ascending' : 'descending');
	
						// Determine if the next click will remove sorting or change the sort
						ariaType = ! sortOrder[firstSort.index + 1] ? 'Remove' : 'Reverse';
					}
					else {
						cell.removeAttr('aria-sort');
					}
	
					// Make the headers tab-able for keyboard navigation
					if (orderable) {
						var orderSpan = cell.find('.dt-column-order');
						
						orderSpan
							.attr('role', 'button')
							.attr('aria-label', orderable
								? col.ariaTitle + ctx.api.i18n('oAria.orderable' + ariaType)
								: col.ariaTitle
							);
	
						if (tabIndex !== -1) {
							orderSpan.attr('tabindex', tabIndex);
						}
					}
				} );
			}
		},
	
		layout: {
			_: function ( settings, container, items ) {
				var classes = settings.oClasses.layout;
				var row = $('<div/>')
					.attr('id', items.id || null)
					.addClass(items.className || classes.row)
					.appendTo( container );
	
				DataTable.ext.renderer.layout._forLayoutRow(items, function (key, val) {
					if (key === 'id' || key === 'className') {
						return;
					}
	
					var klass = '';
	
					if (val.table) {
						row.addClass(classes.tableRow);
						klass += classes.tableCell + ' ';
					}
	
					if (key === 'start') {
						klass += classes.start;
					}
					else if (key === 'end') {
						klass += classes.end;
					}
					else {
						klass += classes.full;
					}
	
					$('<div/>')
						.attr({
							id: val.id || null,
							"class": val.className
								? val.className
								: classes.cell + ' ' + klass
						})
						.append( val.contents )
						.appendTo( row );
				});
			},
	
			// Shared for use by the styling frameworks
			_forLayoutRow: function (items, fn) {
				// As we are inserting dom elements, we need start / end in a
				// specific order, this function is used for sorting the layout
				// keys.
				var layoutEnum = function (x) {
					switch (x) {
						case '': return 0;
						case 'start': return 1;
						case 'end': return 2;
						default: return 3;
					}
				};
	
				Object
					.keys(items)
					.sort(function (a, b) {
						return layoutEnum(a) - layoutEnum(b);
					})
					.forEach(function (key) {
						fn(key, items[key]);
					});
			}
		}
	} );
	
	
	DataTable.feature = {};
	
	// Third parameter is internal only!
	DataTable.feature.register = function ( name, cb, legacy ) {
		DataTable.ext.features[ name ] = cb;
	
		if (legacy) {
			_ext.feature.push({
				cFeature: legacy,
				fnInit: cb
			});
		}
	};
	
	function _divProp(el, prop, val) {
		if (val) {
			el[prop] = val;
		}
	}
	
	DataTable.feature.register( 'div', function ( settings, opts ) {
		var n = $('<div>')[0];
	
		if (opts) {
			_divProp(n, 'className', opts.className);
			_divProp(n, 'id', opts.id);
			_divProp(n, 'innerHTML', opts.html);
			_divProp(n, 'textContent', opts.text);
		}
	
		return n;
	} );
	
	DataTable.feature.register( 'info', function ( settings, opts ) {
		// For compatibility with the legacy `info` top level option
		if (! settings.oFeatures.bInfo) {
			return null;
		}
	
		var
			lang  = settings.oLanguage,
			tid = settings.sTableId,
			n = $('<div/>', {
				'class': settings.oClasses.info.container,
			} );
	
		opts = $.extend({
			callback: lang.fnInfoCallback,
			empty: lang.sInfoEmpty,
			postfix: lang.sInfoPostFix,
			search: lang.sInfoFiltered,
			text: lang.sInfo,
		}, opts);
	
	
		// Update display on each draw
		settings.aoDrawCallback.push(function (s) {
			_fnUpdateInfo(s, opts, n);
		});
	
		// For the first info display in the table, we add a callback and aria information.
		if (! settings._infoEl) {
			n.attr({
				'aria-live': 'polite',
				id: tid+'_info',
				role: 'status'
			});
	
			// Table is described by our info div
			$(settings.nTable).attr( 'aria-describedby', tid+'_info' );
	
			settings._infoEl = n;
		}
	
		return n;
	}, 'i' );
	
	/**
	 * Update the information elements in the display
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnUpdateInfo ( settings, opts, node )
	{
		var
			start = settings._iDisplayStart+1,
			end   = settings.fnDisplayEnd(),
			max   = settings.fnRecordsTotal(),
			total = settings.fnRecordsDisplay(),
			out   = total
				? opts.text
				: opts.empty;
	
		if ( total !== max ) {
			// Record set after filtering
			out += ' ' + opts.search;
		}
	
		// Convert the macros
		out += opts.postfix;
		out = _fnMacros( settings, out );
	
		if ( opts.callback ) {
			out = opts.callback.call( settings.oInstance,
				settings, start, end, max, total, out
			);
		}
	
		node.html( out );
	
		_fnCallbackFire(settings, null, 'info', [settings, node[0], out]);
	}
	
	var __searchCounter = 0;
	
	// opts
	// - text
	// - placeholder
	DataTable.feature.register( 'search', function ( settings, opts ) {
		// Don't show the input if filtering isn't available on the table
		if (! settings.oFeatures.bFilter) {
			return null;
		}
	
		var classes = settings.oClasses.search;
		var tableId = settings.sTableId;
		var language = settings.oLanguage;
		var previousSearch = settings.oPreviousSearch;
		var input = '<input type="search" class="'+classes.input+'"/>';
	
		opts = $.extend({
			placeholder: language.sSearchPlaceholder,
			processing: false,
			text: language.sSearch
		}, opts);
	
		// The _INPUT_ is optional - is appended if not present
		if (opts.text.indexOf('_INPUT_') === -1) {
			opts.text += '_INPUT_';
		}
	
		opts.text = _fnMacros(settings, opts.text);
	
		// We can put the <input> outside of the label if it is at the start or end
		// which helps improve accessability (not all screen readers like implicit
		// for elements).
		var end = opts.text.match(/_INPUT_$/);
		var start = opts.text.match(/^_INPUT_/);
		var removed = opts.text.replace(/_INPUT_/, '');
		var str = '<label>' + opts.text + '</label>';
	
		if (start) {
			str = '_INPUT_<label>' + removed + '</label>';
		}
		else if (end) {
			str = '<label>' + removed + '</label>_INPUT_';
		}
	
		var filter = $('<div>')
			.addClass(classes.container)
			.append(str.replace(/_INPUT_/, input));
	
		// add for and id to label and input
		filter.find('label').attr('for', 'dt-search-' + __searchCounter);
		filter.find('input').attr('id', 'dt-search-' + __searchCounter);
		__searchCounter++;
	
		var searchFn = function(event) {
			var val = this.value;
	
			if(previousSearch.return && event.key !== "Enter") {
				return;
			}
	
			/* Now do the filter */
			if ( val != previousSearch.search ) {
				_fnProcessingRun(settings, opts.processing, function () {
					previousSearch.search = val;
			
					_fnFilterComplete( settings, previousSearch );
			
					// Need to redraw, without resorting
					settings._iDisplayStart = 0;
					_fnDraw( settings );
				});
			}
		};
	
		var searchDelay = settings.searchDelay !== null ?
			settings.searchDelay :
			0;
	
		var jqFilter = $('input', filter)
			.val( previousSearch.search )
			.attr( 'placeholder', opts.placeholder )
			.on(
				'keyup.DT search.DT input.DT paste.DT cut.DT',
				searchDelay ?
					DataTable.util.debounce( searchFn, searchDelay ) :
					searchFn
			)
			.on( 'mouseup.DT', function(e) {
				// Edge fix! Edge 17 does not trigger anything other than mouse events when clicking
				// on the clear icon (Edge bug 17584515). This is safe in other browsers as `searchFn`
				// checks the value to see if it has changed. In other browsers it won't have.
				setTimeout( function () {
					searchFn.call(jqFilter[0], e);
				}, 10);
			} )
			.on( 'keypress.DT', function(e) {
				/* Prevent form submission */
				if ( e.keyCode == 13 ) {
					return false;
				}
			} )
			.attr('aria-controls', tableId);
	
		// Update the input elements whenever the table is filtered
		$(settings.nTable).on( 'search.dt.DT', function ( ev, s ) {
			if ( settings === s && jqFilter[0] !== document.activeElement ) {
				jqFilter.val( typeof previousSearch.search !== 'function'
					? previousSearch.search
					: ''
				);
			}
		} );
	
		return filter;
	}, 'f' );
	
	// opts
	// - type - button configuration
	// - buttons - number of buttons to show - must be odd
	DataTable.feature.register( 'paging', function ( settings, opts ) {
		// Don't show the paging input if the table doesn't have paging enabled
		if (! settings.oFeatures.bPaginate) {
			return null;
		}
	
		opts = $.extend({
			buttons: DataTable.ext.pager.numbers_length,
			type: settings.sPaginationType,
			boundaryNumbers: true,
			firstLast: true,
			previousNext: true,
			numbers: true
		}, opts);
	
		var host = $('<div/>')
			.addClass(settings.oClasses.paging.container + (opts.type ? ' paging_' + opts.type : ''))
			.append(
				$('<nav>')
					.attr('aria-label', 'pagination')
					.addClass(settings.oClasses.paging.nav)
			);
		var draw = function () {
			_pagingDraw(settings, host.children(), opts);
		};
	
		settings.aoDrawCallback.push(draw);
	
		// Responsive redraw of paging control
		$(settings.nTable).on('column-sizing.dt.DT', draw);
	
		return host;
	}, 'p' );
	
	/**
	 * Dynamically create the button type array based on the configuration options.
	 * This will only happen if the paging type is not defined.
	 */
	function _pagingDynamic(opts) {
		var out = [];
	
		if (opts.numbers) {
			out.push('numbers');
		}
	
		if (opts.previousNext) {
			out.unshift('previous');
			out.push('next');
		}
	
		if (opts.firstLast) {
			out.unshift('first');
			out.push('last');
		}
	
		return out;
	}
	
	function _pagingDraw(settings, host, opts) {
		if (! settings._bInitComplete) {
			return;
		}
	
		var
			plugin = opts.type
				? DataTable.ext.pager[ opts.type ]
				: _pagingDynamic,
			aria = settings.oLanguage.oAria.paginate || {},
			start      = settings._iDisplayStart,
			len        = settings._iDisplayLength,
			visRecords = settings.fnRecordsDisplay(),
			all        = len === -1,
			page = all ? 0 : Math.ceil( start / len ),
			pages = all ? 1 : Math.ceil( visRecords / len ),
			buttons = [],
			buttonEls = [],
			buttonsNested = plugin(opts)
				.map(function (val) {
					return val === 'numbers'
						? _pagingNumbers(page, pages, opts.buttons, opts.boundaryNumbers)
						: val;
				});
	
		// .flat() would be better, but not supported in old Safari
		buttons = buttons.concat.apply(buttons, buttonsNested);
	
		for (var i=0 ; i<buttons.length ; i++) {
			var button = buttons[i];
	
			var btnInfo = _pagingButtonInfo(settings, button, page, pages);
			var btn = _fnRenderer( settings, 'pagingButton' )(
				settings,
				button,
				btnInfo.display,
				btnInfo.active,
				btnInfo.disabled
			);
	
			var ariaLabel = typeof button === 'string'
				? aria[ button ]
				: aria.number
					? aria.number + (button+1)
					: null;
	
			// Common attributes
			$(btn.clicker).attr({
				'aria-controls': settings.sTableId,
				'aria-disabled': btnInfo.disabled ? 'true' : null,
				'aria-current': btnInfo.active ? 'page' : null,
				'aria-label': ariaLabel,
				'data-dt-idx': button,
				'tabIndex': btnInfo.disabled
					? -1
					: settings.iTabIndex && btn.clicker[0].nodeName.toLowerCase() !== 'span'
						? settings.iTabIndex
						: null, // `0` doesn't need a tabIndex since it is the default
			});
	
			if (typeof button !== 'number') {
				$(btn.clicker).addClass(button);
			}
	
			_fnBindAction(
				btn.clicker, {action: button}, function(e) {
					e.preventDefault();
	
					_fnPageChange( settings, e.data.action, true );
				}
			);
	
			buttonEls.push(btn.display);
		}
	
		var wrapped = _fnRenderer(settings, 'pagingContainer')(
			settings, buttonEls
		);
	
		var activeEl = host.find(document.activeElement).data('dt-idx');
	
		host.empty().append(wrapped);
	
		if ( activeEl !== undefined ) {
			host.find( '[data-dt-idx='+activeEl+']' ).trigger('focus');
		}
	
		// Responsive - check if the buttons are over two lines based on the
		// height of the buttons and the container.
		if (buttonEls.length) {
			var outerHeight = $(buttonEls[0]).outerHeight();
		
			if (
				opts.buttons > 1 && // prevent infinite
				outerHeight > 0 && // will be 0 if hidden
				$(host).height() >= (outerHeight * 2) - 10
			) {
				_pagingDraw(settings, host, $.extend({}, opts, { buttons: opts.buttons - 2 }));
			}
		}
	}
	
	/**
	 * Get properties for a button based on the current paging state of the table
	 *
	 * @param {*} settings DT settings object
	 * @param {*} button The button type in question
	 * @param {*} page Table's current page
	 * @param {*} pages Number of pages
	 * @returns Info object
	 */
	function _pagingButtonInfo(settings, button, page, pages) {
		var lang = settings.oLanguage.oPaginate;
		var o = {
			display: '',
			active: false,
			disabled: false
		};
	
		switch ( button ) {
			case 'ellipsis':
				o.display = '&#x2026;';
				break;
	
			case 'first':
				o.display = lang.sFirst;
	
				if (page === 0) {
					o.disabled = true;
				}
				break;
	
			case 'previous':
				o.display = lang.sPrevious;
	
				if ( page === 0 ) {
					o.disabled = true;
				}
				break;
	
			case 'next':
				o.display = lang.sNext;
	
				if ( pages === 0 || page === pages-1 ) {
					o.disabled = true;
				}
				break;
	
			case 'last':
				o.display = lang.sLast;
	
				if ( pages === 0 || page === pages-1 ) {
					o.disabled = true;
				}
				break;
	
			default:
				if ( typeof button === 'number' ) {
					o.display = settings.fnFormatNumber( button + 1 );
					
					if (page === button) {
						o.active = true;
					}
				}
				break;
		}
	
		return o;
	}
	
	/**
	 * Compute what number buttons to show in the paging control
	 *
	 * @param {*} page Current page
	 * @param {*} pages Total number of pages
	 * @param {*} buttons Target number of number buttons
	 * @param {boolean} addFirstLast Indicate if page 1 and end should be included
	 * @returns Buttons to show
	 */
	function _pagingNumbers ( page, pages, buttons, addFirstLast ) {
		var
			numbers = [],
			half = Math.floor(buttons / 2),
			before = addFirstLast ? 2 : 1,
			after = addFirstLast ? 1 : 0;
	
		if ( pages <= buttons ) {
			numbers = _range(0, pages);
		}
		else if (buttons === 1) {
			// Single button - current page only
			numbers = [page];
		}
		else if (buttons === 3) {
			// Special logic for just three buttons
			if (page <= 1) {
				numbers = [0, 1, 'ellipsis'];
			}
			else if (page >= pages - 2) {
				numbers = _range(pages-2, pages);
				numbers.unshift('ellipsis');
			}
			else {
				numbers = ['ellipsis', page, 'ellipsis'];
			}
		}
		else if ( page <= half ) {
			numbers = _range(0, buttons-before);
			numbers.push('ellipsis');
	
			if (addFirstLast) {
				numbers.push(pages-1);
			}
		}
		else if ( page >= pages - 1 - half ) {
			numbers = _range(pages-(buttons-before), pages);
			numbers.unshift('ellipsis');
	
			if (addFirstLast) {
				numbers.unshift(0);
			}
		}
		else {
			numbers = _range(page-half+before, page+half-after);
			numbers.push('ellipsis');
			numbers.unshift('ellipsis');
	
			if (addFirstLast) {
				numbers.push(pages-1);
				numbers.unshift(0);
			}
		}
	
		return numbers;
	}
	
	var __lengthCounter = 0;
	
	// opts
	// - menu
	// - text
	DataTable.feature.register( 'pageLength', function ( settings, opts ) {
		var features = settings.oFeatures;
	
		// For compatibility with the legacy `pageLength` top level option
		if (! features.bPaginate || ! features.bLengthChange) {
			return null;
		}
	
		opts = $.extend({
			menu: settings.aLengthMenu,
			text: settings.oLanguage.sLengthMenu
		}, opts);
	
		var
			classes  = settings.oClasses.length,
			tableId  = settings.sTableId,
			menu     = opts.menu,
			lengths  = [],
			language = [],
			i;
	
		// Options can be given in a number of ways
		if (Array.isArray( menu[0] )) {
			// Old 1.x style - 2D array
			lengths = menu[0];
			language = menu[1];
		}
		else {
			for ( i=0 ; i<menu.length ; i++ ) {
				// An object with different label and value
				if ($.isPlainObject(menu[i])) {
					lengths.push(menu[i].value);
					language.push(menu[i].label);
				}
				else {
					// Or just a number to display and use
					lengths.push(menu[i]);
					language.push(menu[i]);
				}
			}
		}
	
		// We can put the <select> outside of the label if it is at the start or
		// end which helps improve accessability (not all screen readers like
		// implicit for elements).
		var end = opts.text.match(/_MENU_$/);
		var start = opts.text.match(/^_MENU_/);
		var removed = opts.text.replace(/_MENU_/, '');
		var str = '<label>' + opts.text + '</label>';
	
		if (start) {
			str = '_MENU_<label>' + removed + '</label>';
		}
		else if (end) {
			str = '<label>' + removed + '</label>_MENU_';
		}
	
		// Wrapper element - use a span as a holder for where the select will go
		var tmpId = 'tmp-' + (+new Date())
		var div = $('<div/>')
			.addClass( classes.container )
			.append(
				str.replace( '_MENU_', '<span id="'+tmpId+'"></span>' )
			);
	
		// Save text node content for macro updating
		var textNodes = [];
		Array.prototype.slice.call(div.find('label')[0].childNodes).forEach(function (el) {
			if (el.nodeType === Node.TEXT_NODE) {
				textNodes.push({
					el: el,
					text: el.textContent
				});
			}
		});
	
		// Update the label text in case it has an entries value
		var updateEntries = function (len) {
			textNodes.forEach(function (node) {
				node.el.textContent = _fnMacros(settings, node.text, len);
			});
		}
	
		// Next, the select itself, along with the options
		var select = $('<select/>', {
			'aria-controls': tableId,
			'class':         classes.select
		} );
	
		for ( i=0 ; i<lengths.length ; i++ ) {
			select[0][ i ] = new Option(
				typeof language[i] === 'number' ?
					settings.fnFormatNumber( language[i] ) :
					language[i],
				lengths[i]
			);
		}
	
		// add for and id to label and input
		div.find('label').attr('for', 'dt-length-' + __lengthCounter);
		select.attr('id', 'dt-length-' + __lengthCounter);
		__lengthCounter++;
	
		// Swap in the select list
		div.find('#' + tmpId).replaceWith(select);
	
		// Can't use `select` variable as user might provide their own and the
		// reference is broken by the use of outerHTML
		$('select', div)
			.val( settings._iDisplayLength )
			.on( 'change.DT', function() {
				_fnLengthChange( settings, $(this).val() );
				_fnDraw( settings );
			} );
	
		// Update node value whenever anything changes the table's length
		$(settings.nTable).on( 'length.dt.DT', function (e, s, len) {
			if ( settings === s ) {
				$('select', div).val( len );
	
				// Resolve plurals in the text for the new length
				updateEntries(len);
			}
		} );
	
		updateEntries(settings._iDisplayLength);
	
		return div;
	}, 'l' );
	
	// jQuery access
	$.fn.dataTable = DataTable;
	
	// Provide access to the host jQuery object (circular reference)
	DataTable.$ = $;
	
	// Legacy aliases
	$.fn.dataTableSettings = DataTable.settings;
	$.fn.dataTableExt = DataTable.ext;
	
	// With a capital `D` we return a DataTables API instance rather than a
	// jQuery object
	$.fn.DataTable = function ( opts ) {
		return $(this).dataTable( opts ).api();
	};
	
	// All properties that are available to $.fn.dataTable should also be
	// available on $.fn.DataTable
	$.each( DataTable, function ( prop, val ) {
		$.fn.DataTable[ prop ] = val;
	} );

	return DataTable;
}));


/*! DataTables styling integration
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;





return DataTable;
}));



/*
 * Copyright 2016 Small Batch, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
/* Web Font Loader v1.6.26 - (c) Adobe Systems, Google. License: Apache 2.0 */(function(){function aa(a,b,c){return a.call.apply(a.bind,arguments)}function ba(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function p(a,b,c){p=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?aa:ba;return p.apply(null,arguments)}var q=Date.now||function(){return+new Date};function ca(a,b){this.a=a;this.m=b||a;this.c=this.m.document}var da=!!window.FontFace;function t(a,b,c,d){b=a.c.createElement(b);if(c)for(var e in c)c.hasOwnProperty(e)&&("style"==e?b.style.cssText=c[e]:b.setAttribute(e,c[e]));d&&b.appendChild(a.c.createTextNode(d));return b}function u(a,b,c){a=a.c.getElementsByTagName(b)[0];a||(a=document.documentElement);a.insertBefore(c,a.lastChild)}function v(a){a.parentNode&&a.parentNode.removeChild(a)}
function w(a,b,c){b=b||[];c=c||[];for(var d=a.className.split(/\s+/),e=0;e<b.length;e+=1){for(var f=!1,g=0;g<d.length;g+=1)if(b[e]===d[g]){f=!0;break}f||d.push(b[e])}b=[];for(e=0;e<d.length;e+=1){f=!1;for(g=0;g<c.length;g+=1)if(d[e]===c[g]){f=!0;break}f||b.push(d[e])}a.className=b.join(" ").replace(/\s+/g," ").replace(/^\s+|\s+$/,"")}function y(a,b){for(var c=a.className.split(/\s+/),d=0,e=c.length;d<e;d++)if(c[d]==b)return!0;return!1}
function z(a){if("string"===typeof a.f)return a.f;var b=a.m.location.protocol;"about:"==b&&(b=a.a.location.protocol);return"https:"==b?"https:":"http:"}function ea(a){return a.m.location.hostname||a.a.location.hostname}
function A(a,b,c){function d(){k&&e&&f&&(k(g),k=null)}b=t(a,"link",{rel:"stylesheet",href:b,media:"all"});var e=!1,f=!0,g=null,k=c||null;da?(b.onload=function(){e=!0;d()},b.onerror=function(){e=!0;g=Error("Stylesheet failed to load");d()}):setTimeout(function(){e=!0;d()},0);u(a,"head",b)}
function B(a,b,c,d){var e=a.c.getElementsByTagName("head")[0];if(e){var f=t(a,"script",{src:b}),g=!1;f.onload=f.onreadystatechange=function(){g||this.readyState&&"loaded"!=this.readyState&&"complete"!=this.readyState||(g=!0,c&&c(null),f.onload=f.onreadystatechange=null,"HEAD"==f.parentNode.tagName&&e.removeChild(f))};e.appendChild(f);setTimeout(function(){g||(g=!0,c&&c(Error("Script load timeout")))},d||5E3);return f}return null};function C(){this.a=0;this.c=null}function D(a){a.a++;return function(){a.a--;E(a)}}function F(a,b){a.c=b;E(a)}function E(a){0==a.a&&a.c&&(a.c(),a.c=null)};function G(a){this.a=a||"-"}G.prototype.c=function(a){for(var b=[],c=0;c<arguments.length;c++)b.push(arguments[c].replace(/[\W_]+/g,"").toLowerCase());return b.join(this.a)};function H(a,b){this.c=a;this.f=4;this.a="n";var c=(b||"n4").match(/^([nio])([1-9])$/i);c&&(this.a=c[1],this.f=parseInt(c[2],10))}function fa(a){return I(a)+" "+(a.f+"00")+" 300px "+J(a.c)}function J(a){var b=[];a=a.split(/,\s*/);for(var c=0;c<a.length;c++){var d=a[c].replace(/['"]/g,"");-1!=d.indexOf(" ")||/^\d/.test(d)?b.push("'"+d+"'"):b.push(d)}return b.join(",")}function K(a){return a.a+a.f}function I(a){var b="normal";"o"===a.a?b="oblique":"i"===a.a&&(b="italic");return b}
function ga(a){var b=4,c="n",d=null;a&&((d=a.match(/(normal|oblique|italic)/i))&&d[1]&&(c=d[1].substr(0,1).toLowerCase()),(d=a.match(/([1-9]00|normal|bold)/i))&&d[1]&&(/bold/i.test(d[1])?b=7:/[1-9]00/.test(d[1])&&(b=parseInt(d[1].substr(0,1),10))));return c+b};function ha(a,b){this.c=a;this.f=a.m.document.documentElement;this.h=b;this.a=new G("-");this.j=!1!==b.events;this.g=!1!==b.classes}function ia(a){a.g&&w(a.f,[a.a.c("wf","loading")]);L(a,"loading")}function M(a){if(a.g){var b=y(a.f,a.a.c("wf","active")),c=[],d=[a.a.c("wf","loading")];b||c.push(a.a.c("wf","inactive"));w(a.f,c,d)}L(a,"inactive")}function L(a,b,c){if(a.j&&a.h[b])if(c)a.h[b](c.c,K(c));else a.h[b]()};function ja(){this.c={}}function ka(a,b,c){var d=[],e;for(e in b)if(b.hasOwnProperty(e)){var f=a.c[e];f&&d.push(f(b[e],c))}return d};function N(a,b){this.c=a;this.f=b;this.a=t(this.c,"span",{"aria-hidden":"true"},this.f)}function O(a){u(a.c,"body",a.a)}function P(a){return"display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:"+J(a.c)+";"+("font-style:"+I(a)+";font-weight:"+(a.f+"00")+";")};function Q(a,b,c,d,e,f){this.g=a;this.j=b;this.a=d;this.c=c;this.f=e||3E3;this.h=f||void 0}Q.prototype.start=function(){var a=this.c.m.document,b=this,c=q(),d=new Promise(function(d,e){function k(){q()-c>=b.f?e():a.fonts.load(fa(b.a),b.h).then(function(a){1<=a.length?d():setTimeout(k,25)},function(){e()})}k()}),e=new Promise(function(a,d){setTimeout(d,b.f)});Promise.race([e,d]).then(function(){b.g(b.a)},function(){b.j(b.a)})};function R(a,b,c,d,e,f,g){this.v=a;this.B=b;this.c=c;this.a=d;this.s=g||"BESbswy";this.f={};this.w=e||3E3;this.u=f||null;this.o=this.j=this.h=this.g=null;this.g=new N(this.c,this.s);this.h=new N(this.c,this.s);this.j=new N(this.c,this.s);this.o=new N(this.c,this.s);a=new H(this.a.c+",serif",K(this.a));a=P(a);this.g.a.style.cssText=a;a=new H(this.a.c+",sans-serif",K(this.a));a=P(a);this.h.a.style.cssText=a;a=new H("serif",K(this.a));a=P(a);this.j.a.style.cssText=a;a=new H("sans-serif",K(this.a));a=
P(a);this.o.a.style.cssText=a;O(this.g);O(this.h);O(this.j);O(this.o)}var S={D:"serif",C:"sans-serif"},T=null;function U(){if(null===T){var a=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);T=!!a&&(536>parseInt(a[1],10)||536===parseInt(a[1],10)&&11>=parseInt(a[2],10))}return T}R.prototype.start=function(){this.f.serif=this.j.a.offsetWidth;this.f["sans-serif"]=this.o.a.offsetWidth;this.A=q();la(this)};
function ma(a,b,c){for(var d in S)if(S.hasOwnProperty(d)&&b===a.f[S[d]]&&c===a.f[S[d]])return!0;return!1}function la(a){var b=a.g.a.offsetWidth,c=a.h.a.offsetWidth,d;(d=b===a.f.serif&&c===a.f["sans-serif"])||(d=U()&&ma(a,b,c));d?q()-a.A>=a.w?U()&&ma(a,b,c)&&(null===a.u||a.u.hasOwnProperty(a.a.c))?V(a,a.v):V(a,a.B):na(a):V(a,a.v)}function na(a){setTimeout(p(function(){la(this)},a),50)}function V(a,b){setTimeout(p(function(){v(this.g.a);v(this.h.a);v(this.j.a);v(this.o.a);b(this.a)},a),0)};function W(a,b,c){this.c=a;this.a=b;this.f=0;this.o=this.j=!1;this.s=c}var X=null;W.prototype.g=function(a){var b=this.a;b.g&&w(b.f,[b.a.c("wf",a.c,K(a).toString(),"active")],[b.a.c("wf",a.c,K(a).toString(),"loading"),b.a.c("wf",a.c,K(a).toString(),"inactive")]);L(b,"fontactive",a);this.o=!0;oa(this)};
W.prototype.h=function(a){var b=this.a;if(b.g){var c=y(b.f,b.a.c("wf",a.c,K(a).toString(),"active")),d=[],e=[b.a.c("wf",a.c,K(a).toString(),"loading")];c||d.push(b.a.c("wf",a.c,K(a).toString(),"inactive"));w(b.f,d,e)}L(b,"fontinactive",a);oa(this)};function oa(a){0==--a.f&&a.j&&(a.o?(a=a.a,a.g&&w(a.f,[a.a.c("wf","active")],[a.a.c("wf","loading"),a.a.c("wf","inactive")]),L(a,"active")):M(a.a))};function pa(a){this.j=a;this.a=new ja;this.h=0;this.f=this.g=!0}pa.prototype.load=function(a){this.c=new ca(this.j,a.context||this.j);this.g=!1!==a.events;this.f=!1!==a.classes;qa(this,new ha(this.c,a),a)};
function ra(a,b,c,d,e){var f=0==--a.h;(a.f||a.g)&&setTimeout(function(){var a=e||null,k=d||null||{};if(0===c.length&&f)M(b.a);else{b.f+=c.length;f&&(b.j=f);var h,m=[];for(h=0;h<c.length;h++){var l=c[h],n=k[l.c],r=b.a,x=l;r.g&&w(r.f,[r.a.c("wf",x.c,K(x).toString(),"loading")]);L(r,"fontloading",x);r=null;null===X&&(X=window.FontFace?(x=/Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent))?42<parseInt(x[1],10):!0:!1);X?r=new Q(p(b.g,b),p(b.h,b),b.c,l,b.s,n):r=new R(p(b.g,b),p(b.h,b),b.c,l,b.s,a,
n);m.push(r)}for(h=0;h<m.length;h++)m[h].start()}},0)}function qa(a,b,c){var d=[],e=c.timeout;ia(b);var d=ka(a.a,c,a.c),f=new W(a.c,b,e);a.h=d.length;b=0;for(c=d.length;b<c;b++)d[b].load(function(b,d,c){ra(a,f,b,d,c)})};function sa(a,b){this.c=a;this.a=b}function ta(a,b,c){var d=z(a.c);a=(a.a.api||"fast.fonts.net/jsapi").replace(/^.*http(s?):(\/\/)?/,"");return d+"//"+a+"/"+b+".js"+(c?"?v="+c:"")}
sa.prototype.load=function(a){function b(){if(f["__mti_fntLst"+d]){var c=f["__mti_fntLst"+d](),e=[],h;if(c)for(var m=0;m<c.length;m++){var l=c[m].fontfamily;void 0!=c[m].fontStyle&&void 0!=c[m].fontWeight?(h=c[m].fontStyle+c[m].fontWeight,e.push(new H(l,h))):e.push(new H(l))}a(e)}else setTimeout(function(){b()},50)}var c=this,d=c.a.projectId,e=c.a.version;if(d){var f=c.c.m;B(this.c,ta(c,d,e),function(e){e?a([]):(f["__MonotypeConfiguration__"+d]=function(){return c.a},b())}).id="__MonotypeAPIScript__"+
d}else a([])};function ua(a,b){this.c=a;this.a=b}ua.prototype.load=function(a){var b,c,d=this.a.urls||[],e=this.a.families||[],f=this.a.testStrings||{},g=new C;b=0;for(c=d.length;b<c;b++)A(this.c,d[b],D(g));var k=[];b=0;for(c=e.length;b<c;b++)if(d=e[b].split(":"),d[1])for(var h=d[1].split(","),m=0;m<h.length;m+=1)k.push(new H(d[0],h[m]));else k.push(new H(d[0]));F(g,function(){a(k,f)})};function va(a,b,c){a?this.c=a:this.c=b+wa;this.a=[];this.f=[];this.g=c||""}var wa="//fonts.googleapis.com/css";function xa(a,b){for(var c=b.length,d=0;d<c;d++){var e=b[d].split(":");3==e.length&&a.f.push(e.pop());var f="";2==e.length&&""!=e[1]&&(f=":");a.a.push(e.join(f))}}
function ya(a){if(0==a.a.length)throw Error("No fonts to load!");if(-1!=a.c.indexOf("kit="))return a.c;for(var b=a.a.length,c=[],d=0;d<b;d++)c.push(a.a[d].replace(/ /g,"+"));b=a.c+"?family="+c.join("%7C");0<a.f.length&&(b+="&subset="+a.f.join(","));0<a.g.length&&(b+="&text="+encodeURIComponent(a.g));return b};function za(a){this.f=a;this.a=[];this.c={}}
var Aa={latin:"BESbswy","latin-ext":"\u00e7\u00f6\u00fc\u011f\u015f",cyrillic:"\u0439\u044f\u0416",greek:"\u03b1\u03b2\u03a3",khmer:"\u1780\u1781\u1782",Hanuman:"\u1780\u1781\u1782"},Ba={thin:"1",extralight:"2","extra-light":"2",ultralight:"2","ultra-light":"2",light:"3",regular:"4",book:"4",medium:"5","semi-bold":"6",semibold:"6","demi-bold":"6",demibold:"6",bold:"7","extra-bold":"8",extrabold:"8","ultra-bold":"8",ultrabold:"8",black:"9",heavy:"9",l:"3",r:"4",b:"7"},Ca={i:"i",italic:"i",n:"n",normal:"n"},
Da=/^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
function Ea(a){for(var b=a.f.length,c=0;c<b;c++){var d=a.f[c].split(":"),e=d[0].replace(/\+/g," "),f=["n4"];if(2<=d.length){var g;var k=d[1];g=[];if(k)for(var k=k.split(","),h=k.length,m=0;m<h;m++){var l;l=k[m];if(l.match(/^[\w-]+$/)){var n=Da.exec(l.toLowerCase());if(null==n)l="";else{l=n[2];l=null==l||""==l?"n":Ca[l];n=n[1];if(null==n||""==n)n="4";else var r=Ba[n],n=r?r:isNaN(n)?"4":n.substr(0,1);l=[l,n].join("")}}else l="";l&&g.push(l)}0<g.length&&(f=g);3==d.length&&(d=d[2],g=[],d=d?d.split(","):
g,0<d.length&&(d=Aa[d[0]])&&(a.c[e]=d))}a.c[e]||(d=Aa[e])&&(a.c[e]=d);for(d=0;d<f.length;d+=1)a.a.push(new H(e,f[d]))}};function Fa(a,b){this.c=a;this.a=b}var Ga={Arimo:!0,Cousine:!0,Tinos:!0};Fa.prototype.load=function(a){var b=new C,c=this.c,d=new va(this.a.api,z(c),this.a.text),e=this.a.families;xa(d,e);var f=new za(e);Ea(f);A(c,ya(d),D(b));F(b,function(){a(f.a,f.c,Ga)})};function Ha(a,b){this.c=a;this.a=b}Ha.prototype.load=function(a){var b=this.a.id,c=this.c.m;b?B(this.c,(this.a.api||"https://use.typekit.net")+"/"+b+".js",function(b){if(b)a([]);else if(c.Typekit&&c.Typekit.config&&c.Typekit.config.fn){b=c.Typekit.config.fn;for(var e=[],f=0;f<b.length;f+=2)for(var g=b[f],k=b[f+1],h=0;h<k.length;h++)e.push(new H(g,k[h]));try{c.Typekit.load({events:!1,classes:!1,async:!0})}catch(m){}a(e)}},2E3):a([])};function Ia(a,b){this.c=a;this.f=b;this.a=[]}Ia.prototype.load=function(a){var b=this.f.id,c=this.c.m,d=this;b?(c.__webfontfontdeckmodule__||(c.__webfontfontdeckmodule__={}),c.__webfontfontdeckmodule__[b]=function(b,c){for(var g=0,k=c.fonts.length;g<k;++g){var h=c.fonts[g];d.a.push(new H(h.name,ga("font-weight:"+h.weight+";font-style:"+h.style)))}a(d.a)},B(this.c,z(this.c)+(this.f.api||"//f.fontdeck.com/s/css/js/")+ea(this.c)+"/"+b+".js",function(b){b&&a([])})):a([])};var Y=new pa(window);Y.a.c.custom=function(a,b){return new ua(b,a)};Y.a.c.fontdeck=function(a,b){return new Ia(b,a)};Y.a.c.monotype=function(a,b){return new sa(b,a)};Y.a.c.typekit=function(a,b){return new Ha(b,a)};Y.a.c.google=function(a,b){return new Fa(b,a)};var Z={load:p(Y.load,Y)};"function"===typeof define&&define.amd?define(function(){return Z}):"undefined"!==typeof module&&module.exports?module.exports=Z:(window.WebFont=Z,window.WebFontConfig&&Y.load(window.WebFontConfig));}());

/*!
 * Select2 4.0.13
 * https://select2.github.io
 *
 * Released under the MIT license
 * https://github.com/select2/select2/blob/master/LICENSE.md
 */
;(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = function (root, jQuery) {
      if (jQuery === undefined) {
        // require('jQuery') returns a factory that requires window to
        // build a jQuery instance, we normalize how we use modules
        // that require this pattern but the window provided is a noop
        // if it's defined (how jquery works)
        if (typeof window !== 'undefined') {
          jQuery = require('jquery');
        }
        else {
          jQuery = require('jquery')(root);
        }
      }
      factory(jQuery);
      return jQuery;
    };
  } else {
    // Browser globals
    factory(jQuery);
  }
} (function (jQuery) {
  // This is needed so we can catch the AMD loader configuration and use it
  // The inner file should be wrapped (by `banner.start.js`) in a function that
  // returns the AMD loader references.
  var S2 =(function () {
  // Restore the Select2 AMD loader so it can be used
  // Needed mostly in the language files, where the loader is not inserted
  if (jQuery && jQuery.fn && jQuery.fn.select2 && jQuery.fn.select2.amd) {
    var S2 = jQuery.fn.select2.amd;
  }
var S2;(function () { if (!S2 || !S2.requirejs) {
if (!S2) { S2 = {}; } else { require = S2; }
/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name) {
            name = name.split('/');
            lastIndex = name.length - 1;

            // If wanting node ID compatibility, strip .js from end
            // of IDs. Have to do this here, and not in nameToUrl
            // because node allows either .js or non .js to map
            // to same file.
            if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
            }

            // Starts with a '.' so need the baseName
            if (name[0].charAt(0) === '.' && baseParts) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that 'directory' and not name of the baseName's
                //module. For instance, baseName of 'one/two/three', maps to
                //'one/two/three.js', but we want the directory, 'one/two' for
                //this normalization.
                normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                name = normalizedBaseParts.concat(name);
            }

            //start trimDots
            for (i = 0; i < name.length; i++) {
                part = name[i];
                if (part === '.') {
                    name.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        name.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
            //end trimDots

            name = name.join('/');
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    //Creates a parts array for a relName where first part is plugin ID,
    //second part is resource ID. Assumes relName has already been normalized.
    function makeRelParts(relName) {
        return relName ? splitPrefix(relName) : [];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relParts) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0],
            relResourceName = relParts[1];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relResourceName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relResourceName));
            } else {
                name = normalize(name, relResourceName);
            }
        } else {
            name = normalize(name, relResourceName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i, relParts,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;
        relParts = makeRelParts(relName);

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relParts);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, makeRelParts(callback)).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

S2.requirejs = requirejs;S2.require = require;S2.define = define;
}
}());
S2.define("almond", function(){});

/* global jQuery:false, $:false */
S2.define('jquery',[],function () {
  var _$ = jQuery || $;

  if (_$ == null && console && console.error) {
    console.error(
      'Select2: An instance of jQuery or a jQuery-compatible library was not ' +
      'found. Make sure that you are including jQuery before Select2 on your ' +
      'web page.'
    );
  }

  return _$;
});

S2.define('select2/utils',[
  'jquery'
], function ($) {
  var Utils = {};

  Utils.Extend = function (ChildClass, SuperClass) {
    var __hasProp = {}.hasOwnProperty;

    function BaseConstructor () {
      this.constructor = ChildClass;
    }

    for (var key in SuperClass) {
      if (__hasProp.call(SuperClass, key)) {
        ChildClass[key] = SuperClass[key];
      }
    }

    BaseConstructor.prototype = SuperClass.prototype;
    ChildClass.prototype = new BaseConstructor();
    ChildClass.__super__ = SuperClass.prototype;

    return ChildClass;
  };

  function getMethods (theClass) {
    var proto = theClass.prototype;

    var methods = [];

    for (var methodName in proto) {
      var m = proto[methodName];

      if (typeof m !== 'function') {
        continue;
      }

      if (methodName === 'constructor') {
        continue;
      }

      methods.push(methodName);
    }

    return methods;
  }

  Utils.Decorate = function (SuperClass, DecoratorClass) {
    var decoratedMethods = getMethods(DecoratorClass);
    var superMethods = getMethods(SuperClass);

    function DecoratedClass () {
      var unshift = Array.prototype.unshift;

      var argCount = DecoratorClass.prototype.constructor.length;

      var calledConstructor = SuperClass.prototype.constructor;

      if (argCount > 0) {
        unshift.call(arguments, SuperClass.prototype.constructor);

        calledConstructor = DecoratorClass.prototype.constructor;
      }

      calledConstructor.apply(this, arguments);
    }

    DecoratorClass.displayName = SuperClass.displayName;

    function ctr () {
      this.constructor = DecoratedClass;
    }

    DecoratedClass.prototype = new ctr();

    for (var m = 0; m < superMethods.length; m++) {
      var superMethod = superMethods[m];

      DecoratedClass.prototype[superMethod] =
        SuperClass.prototype[superMethod];
    }

    var calledMethod = function (methodName) {
      // Stub out the original method if it's not decorating an actual method
      var originalMethod = function () {};

      if (methodName in DecoratedClass.prototype) {
        originalMethod = DecoratedClass.prototype[methodName];
      }

      var decoratedMethod = DecoratorClass.prototype[methodName];

      return function () {
        var unshift = Array.prototype.unshift;

        unshift.call(arguments, originalMethod);

        return decoratedMethod.apply(this, arguments);
      };
    };

    for (var d = 0; d < decoratedMethods.length; d++) {
      var decoratedMethod = decoratedMethods[d];

      DecoratedClass.prototype[decoratedMethod] = calledMethod(decoratedMethod);
    }

    return DecoratedClass;
  };

  var Observable = function () {
    this.listeners = {};
  };

  Observable.prototype.on = function (event, callback) {
    this.listeners = this.listeners || {};

    if (event in this.listeners) {
      this.listeners[event].push(callback);
    } else {
      this.listeners[event] = [callback];
    }
  };

  Observable.prototype.trigger = function (event) {
    var slice = Array.prototype.slice;
    var params = slice.call(arguments, 1);

    this.listeners = this.listeners || {};

    // Params should always come in as an array
    if (params == null) {
      params = [];
    }

    // If there are no arguments to the event, use a temporary object
    if (params.length === 0) {
      params.push({});
    }

    // Set the `_type` of the first object to the event
    params[0]._type = event;

    if (event in this.listeners) {
      this.invoke(this.listeners[event], slice.call(arguments, 1));
    }

    if ('*' in this.listeners) {
      this.invoke(this.listeners['*'], arguments);
    }
  };

  Observable.prototype.invoke = function (listeners, params) {
    for (var i = 0, len = listeners.length; i < len; i++) {
      listeners[i].apply(this, params);
    }
  };

  Utils.Observable = Observable;

  Utils.generateChars = function (length) {
    var chars = '';

    for (var i = 0; i < length; i++) {
      var randomChar = Math.floor(Math.random() * 36);
      chars += randomChar.toString(36);
    }

    return chars;
  };

  Utils.bind = function (func, context) {
    return function () {
      func.apply(context, arguments);
    };
  };

  Utils._convertData = function (data) {
    for (var originalKey in data) {
      var keys = originalKey.split('-');

      var dataLevel = data;

      if (keys.length === 1) {
        continue;
      }

      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];

        // Lowercase the first letter
        // By default, dash-separated becomes camelCase
        key = key.substring(0, 1).toLowerCase() + key.substring(1);

        if (!(key in dataLevel)) {
          dataLevel[key] = {};
        }

        if (k == keys.length - 1) {
          dataLevel[key] = data[originalKey];
        }

        dataLevel = dataLevel[key];
      }

      delete data[originalKey];
    }

    return data;
  };

  Utils.hasScroll = function (index, el) {
    // Adapted from the function created by @ShadowScripter
    // and adapted by @BillBarry on the Stack Exchange Code Review website.
    // The original code can be found at
    // http://codereview.stackexchange.com/q/13338
    // and was designed to be used with the Sizzle selector engine.

    var $el = $(el);
    var overflowX = el.style.overflowX;
    var overflowY = el.style.overflowY;

    //Check both x and y declarations
    if (overflowX === overflowY &&
        (overflowY === 'hidden' || overflowY === 'visible')) {
      return false;
    }

    if (overflowX === 'scroll' || overflowY === 'scroll') {
      return true;
    }

    return ($el.innerHeight() < el.scrollHeight ||
      $el.innerWidth() < el.scrollWidth);
  };

  Utils.escapeMarkup = function (markup) {
    var replaceMap = {
      '\\': '&#92;',
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;',
      '/': '&#47;'
    };

    // Do not try to escape the markup if it's not a string
    if (typeof markup !== 'string') {
      return markup;
    }

    return String(markup).replace(/[&<>"'\/\\]/g, function (match) {
      return replaceMap[match];
    });
  };

  // Append an array of jQuery nodes to a given element.
  Utils.appendMany = function ($element, $nodes) {
    // jQuery 1.7.x does not support $.fn.append() with an array
    // Fall back to a jQuery object collection using $.fn.add()
    if ($.fn.jquery.substr(0, 3) === '1.7') {
      var $jqNodes = $();

      $.map($nodes, function (node) {
        $jqNodes = $jqNodes.add(node);
      });

      $nodes = $jqNodes;
    }

    $element.append($nodes);
  };

  // Cache objects in Utils.__cache instead of $.data (see #4346)
  Utils.__cache = {};

  var id = 0;
  Utils.GetUniqueElementId = function (element) {
    // Get a unique element Id. If element has no id,
    // creates a new unique number, stores it in the id
    // attribute and returns the new id.
    // If an id already exists, it simply returns it.

    var select2Id = element.getAttribute('data-select2-id');
    if (select2Id == null) {
      // If element has id, use it.
      if (element.id) {
        select2Id = element.id;
        element.setAttribute('data-select2-id', select2Id);
      } else {
        element.setAttribute('data-select2-id', ++id);
        select2Id = id.toString();
      }
    }
    return select2Id;
  };

  Utils.StoreData = function (element, name, value) {
    // Stores an item in the cache for a specified element.
    // name is the cache key.
    var id = Utils.GetUniqueElementId(element);
    if (!Utils.__cache[id]) {
      Utils.__cache[id] = {};
    }

    Utils.__cache[id][name] = value;
  };

  Utils.GetData = function (element, name) {
    // Retrieves a value from the cache by its key (name)
    // name is optional. If no name specified, return
    // all cache items for the specified element.
    // and for a specified element.
    var id = Utils.GetUniqueElementId(element);
    if (name) {
      if (Utils.__cache[id]) {
        if (Utils.__cache[id][name] != null) {
          return Utils.__cache[id][name];
        }
        return $(element).data(name); // Fallback to HTML5 data attribs.
      }
      return $(element).data(name); // Fallback to HTML5 data attribs.
    } else {
      return Utils.__cache[id];
    }
  };

  Utils.RemoveData = function (element) {
    // Removes all cached items for a specified element.
    var id = Utils.GetUniqueElementId(element);
    if (Utils.__cache[id] != null) {
      delete Utils.__cache[id];
    }

    element.removeAttribute('data-select2-id');
  };

  return Utils;
});

S2.define('select2/results',[
  'jquery',
  './utils'
], function ($, Utils) {
  function Results ($element, options, dataAdapter) {
    this.$element = $element;
    this.data = dataAdapter;
    this.options = options;

    Results.__super__.constructor.call(this);
  }

  Utils.Extend(Results, Utils.Observable);

  Results.prototype.render = function () {
    var $results = $(
      '<ul class="select2-results__options" role="listbox"></ul>'
    );

    if (this.options.get('multiple')) {
      $results.attr('aria-multiselectable', 'true');
    }

    this.$results = $results;

    return $results;
  };

  Results.prototype.clear = function () {
    this.$results.empty();
  };

  Results.prototype.displayMessage = function (params) {
    var escapeMarkup = this.options.get('escapeMarkup');

    this.clear();
    this.hideLoading();

    var $message = $(
      '<li role="alert" aria-live="assertive"' +
      ' class="select2-results__option"></li>'
    );

    var message = this.options.get('translations').get(params.message);

    $message.append(
      escapeMarkup(
        message(params.args)
      )
    );

    $message[0].className += ' select2-results__message';

    this.$results.append($message);
  };

  Results.prototype.hideMessages = function () {
    this.$results.find('.select2-results__message').remove();
  };

  Results.prototype.append = function (data) {
    this.hideLoading();

    var $options = [];

    if (data.results == null || data.results.length === 0) {
      if (this.$results.children().length === 0) {
        this.trigger('results:message', {
          message: 'noResults'
        });
      }

      return;
    }

    data.results = this.sort(data.results);

    for (var d = 0; d < data.results.length; d++) {
      var item = data.results[d];

      var $option = this.option(item);

      $options.push($option);
    }

    this.$results.append($options);
  };

  Results.prototype.position = function ($results, $dropdown) {
    var $resultsContainer = $dropdown.find('.select2-results');
    $resultsContainer.append($results);
  };

  Results.prototype.sort = function (data) {
    var sorter = this.options.get('sorter');

    return sorter(data);
  };

  Results.prototype.highlightFirstItem = function () {
    var $options = this.$results
      .find('.select2-results__option[aria-selected]');

    var $selected = $options.filter('[aria-selected=true]');

    // Check if there are any selected options
    if ($selected.length > 0) {
      // If there are selected options, highlight the first
      $selected.first().trigger('mouseenter');
    } else {
      // If there are no selected options, highlight the first option
      // in the dropdown
      $options.first().trigger('mouseenter');
    }

    this.ensureHighlightVisible();
  };

  Results.prototype.setClasses = function () {
    var self = this;

    this.data.current(function (selected) {
      var selectedIds = $.map(selected, function (s) {
        return s.id.toString();
      });

      var $options = self.$results
        .find('.select2-results__option[aria-selected]');

      $options.each(function () {
        var $option = $(this);

        var item = Utils.GetData(this, 'data');

        // id needs to be converted to a string when comparing
        var id = '' + item.id;

        if ((item.element != null && item.element.selected) ||
            (item.element == null && $.inArray(id, selectedIds) > -1)) {
          $option.attr('aria-selected', 'true');
        } else {
          $option.attr('aria-selected', 'false');
        }
      });

    });
  };

  Results.prototype.showLoading = function (params) {
    this.hideLoading();

    var loadingMore = this.options.get('translations').get('searching');

    var loading = {
      disabled: true,
      loading: true,
      text: loadingMore(params)
    };
    var $loading = this.option(loading);
    $loading.className += ' loading-results';

    this.$results.prepend($loading);
  };

  Results.prototype.hideLoading = function () {
    this.$results.find('.loading-results').remove();
  };

  Results.prototype.option = function (data) {
    var option = document.createElement('li');
    option.className = 'select2-results__option';

    var attrs = {
      'role': 'option',
      'aria-selected': 'false'
    };

    var matches = window.Element.prototype.matches ||
      window.Element.prototype.msMatchesSelector ||
      window.Element.prototype.webkitMatchesSelector;

    if ((data.element != null && matches.call(data.element, ':disabled')) ||
        (data.element == null && data.disabled)) {
      delete attrs['aria-selected'];
      attrs['aria-disabled'] = 'true';
    }

    if (data.id == null) {
      delete attrs['aria-selected'];
    }

    if (data._resultId != null) {
      option.id = data._resultId;
    }

    if (data.title) {
      option.title = data.title;
    }

    if (data.children) {
      attrs.role = 'group';
      attrs['aria-label'] = data.text;
      delete attrs['aria-selected'];
    }

    for (var attr in attrs) {
      var val = attrs[attr];

      option.setAttribute(attr, val);
    }

    if (data.children) {
      var $option = $(option);

      var label = document.createElement('strong');
      label.className = 'select2-results__group';

      var $label = $(label);
      this.template(data, label);

      var $children = [];

      for (var c = 0; c < data.children.length; c++) {
        var child = data.children[c];

        var $child = this.option(child);

        $children.push($child);
      }

      var $childrenContainer = $('<ul></ul>', {
        'class': 'select2-results__options select2-results__options--nested'
      });

      $childrenContainer.append($children);

      $option.append(label);
      $option.append($childrenContainer);
    } else {
      this.template(data, option);
    }

    Utils.StoreData(option, 'data', data);

    return option;
  };

  Results.prototype.bind = function (container, $container) {
    var self = this;

    var id = container.id + '-results';

    this.$results.attr('id', id);

    container.on('results:all', function (params) {
      self.clear();
      self.append(params.data);

      if (container.isOpen()) {
        self.setClasses();
        self.highlightFirstItem();
      }
    });

    container.on('results:append', function (params) {
      self.append(params.data);

      if (container.isOpen()) {
        self.setClasses();
      }
    });

    container.on('query', function (params) {
      self.hideMessages();
      self.showLoading(params);
    });

    container.on('select', function () {
      if (!container.isOpen()) {
        return;
      }

      self.setClasses();

      if (self.options.get('scrollAfterSelect')) {
        self.highlightFirstItem();
      }
    });

    container.on('unselect', function () {
      if (!container.isOpen()) {
        return;
      }

      self.setClasses();

      if (self.options.get('scrollAfterSelect')) {
        self.highlightFirstItem();
      }
    });

    container.on('open', function () {
      // When the dropdown is open, aria-expended="true"
      self.$results.attr('aria-expanded', 'true');
      self.$results.attr('aria-hidden', 'false');

      self.setClasses();
      self.ensureHighlightVisible();
    });

    container.on('close', function () {
      // When the dropdown is closed, aria-expended="false"
      self.$results.attr('aria-expanded', 'false');
      self.$results.attr('aria-hidden', 'true');
      self.$results.removeAttr('aria-activedescendant');
    });

    container.on('results:toggle', function () {
      var $highlighted = self.getHighlightedResults();

      if ($highlighted.length === 0) {
        return;
      }

      $highlighted.trigger('mouseup');
    });

    container.on('results:select', function () {
      var $highlighted = self.getHighlightedResults();

      if ($highlighted.length === 0) {
        return;
      }

      var data = Utils.GetData($highlighted[0], 'data');

      if ($highlighted.attr('aria-selected') == 'true') {
        self.trigger('close', {});
      } else {
        self.trigger('select', {
          data: data
        });
      }
    });

    container.on('results:previous', function () {
      var $highlighted = self.getHighlightedResults();

      var $options = self.$results.find('[aria-selected]');

      var currentIndex = $options.index($highlighted);

      // If we are already at the top, don't move further
      // If no options, currentIndex will be -1
      if (currentIndex <= 0) {
        return;
      }

      var nextIndex = currentIndex - 1;

      // If none are highlighted, highlight the first
      if ($highlighted.length === 0) {
        nextIndex = 0;
      }

      var $next = $options.eq(nextIndex);

      $next.trigger('mouseenter');

      var currentOffset = self.$results.offset().top;
      var nextTop = $next.offset().top;
      var nextOffset = self.$results.scrollTop() + (nextTop - currentOffset);

      if (nextIndex === 0) {
        self.$results.scrollTop(0);
      } else if (nextTop - currentOffset < 0) {
        self.$results.scrollTop(nextOffset);
      }
    });

    container.on('results:next', function () {
      var $highlighted = self.getHighlightedResults();

      var $options = self.$results.find('[aria-selected]');

      var currentIndex = $options.index($highlighted);

      var nextIndex = currentIndex + 1;

      // If we are at the last option, stay there
      if (nextIndex >= $options.length) {
        return;
      }

      var $next = $options.eq(nextIndex);

      $next.trigger('mouseenter');

      var currentOffset = self.$results.offset().top +
        self.$results.outerHeight(false);
      var nextBottom = $next.offset().top + $next.outerHeight(false);
      var nextOffset = self.$results.scrollTop() + nextBottom - currentOffset;

      if (nextIndex === 0) {
        self.$results.scrollTop(0);
      } else if (nextBottom > currentOffset) {
        self.$results.scrollTop(nextOffset);
      }
    });

    container.on('results:focus', function (params) {
      params.element.addClass('select2-results__option--highlighted');
    });

    container.on('results:message', function (params) {
      self.displayMessage(params);
    });

    if ($.fn.mousewheel) {
      this.$results.on('mousewheel', function (e) {
        var top = self.$results.scrollTop();

        var bottom = self.$results.get(0).scrollHeight - top + e.deltaY;

        var isAtTop = e.deltaY > 0 && top - e.deltaY <= 0;
        var isAtBottom = e.deltaY < 0 && bottom <= self.$results.height();

        if (isAtTop) {
          self.$results.scrollTop(0);

          e.preventDefault();
          e.stopPropagation();
        } else if (isAtBottom) {
          self.$results.scrollTop(
            self.$results.get(0).scrollHeight - self.$results.height()
          );

          e.preventDefault();
          e.stopPropagation();
        }
      });
    }

    this.$results.on('mouseup', '.select2-results__option[aria-selected]',
      function (evt) {
      var $this = $(this);

      var data = Utils.GetData(this, 'data');

      if ($this.attr('aria-selected') === 'true') {
        if (self.options.get('multiple')) {
          self.trigger('unselect', {
            originalEvent: evt,
            data: data
          });
        } else {
          self.trigger('close', {});
        }

        return;
      }

      self.trigger('select', {
        originalEvent: evt,
        data: data
      });
    });

    this.$results.on('mouseenter', '.select2-results__option[aria-selected]',
      function (evt) {
      var data = Utils.GetData(this, 'data');

      self.getHighlightedResults()
          .removeClass('select2-results__option--highlighted');

      self.trigger('results:focus', {
        data: data,
        element: $(this)
      });
    });
  };

  Results.prototype.getHighlightedResults = function () {
    var $highlighted = this.$results
    .find('.select2-results__option--highlighted');

    return $highlighted;
  };

  Results.prototype.destroy = function () {
    this.$results.remove();
  };

  Results.prototype.ensureHighlightVisible = function () {
    var $highlighted = this.getHighlightedResults();

    if ($highlighted.length === 0) {
      return;
    }

    var $options = this.$results.find('[aria-selected]');

    var currentIndex = $options.index($highlighted);

    var currentOffset = this.$results.offset().top;
    var nextTop = $highlighted.offset().top;
    var nextOffset = this.$results.scrollTop() + (nextTop - currentOffset);

    var offsetDelta = nextTop - currentOffset;
    nextOffset -= $highlighted.outerHeight(false) * 2;

    if (currentIndex <= 2) {
      this.$results.scrollTop(0);
    } else if (offsetDelta > this.$results.outerHeight() || offsetDelta < 0) {
      this.$results.scrollTop(nextOffset);
    }
  };

  Results.prototype.template = function (result, container) {
    var template = this.options.get('templateResult');
    var escapeMarkup = this.options.get('escapeMarkup');

    var content = template(result, container);

    if (content == null) {
      container.style.display = 'none';
    } else if (typeof content === 'string') {
      container.innerHTML = escapeMarkup(content);
    } else {
      $(container).append(content);
    }
  };

  return Results;
});

S2.define('select2/keys',[

], function () {
  var KEYS = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46
  };

  return KEYS;
});

S2.define('select2/selection/base',[
  'jquery',
  '../utils',
  '../keys'
], function ($, Utils, KEYS) {
  function BaseSelection ($element, options) {
    this.$element = $element;
    this.options = options;

    BaseSelection.__super__.constructor.call(this);
  }

  Utils.Extend(BaseSelection, Utils.Observable);

  BaseSelection.prototype.render = function () {
    var $selection = $(
      '<span class="select2-selection" role="combobox" ' +
      ' aria-haspopup="true" aria-expanded="false">' +
      '</span>'
    );

    this._tabindex = 0;

    if (Utils.GetData(this.$element[0], 'old-tabindex') != null) {
      this._tabindex = Utils.GetData(this.$element[0], 'old-tabindex');
    } else if (this.$element.attr('tabindex') != null) {
      this._tabindex = this.$element.attr('tabindex');
    }

    $selection.attr('title', this.$element.attr('title'));
    $selection.attr('tabindex', this._tabindex);
    $selection.attr('aria-disabled', 'false');

    this.$selection = $selection;

    return $selection;
  };

  BaseSelection.prototype.bind = function (container, $container) {
    var self = this;

    var resultsId = container.id + '-results';

    this.container = container;

    this.$selection.on('focus', function (evt) {
      self.trigger('focus', evt);
    });

    this.$selection.on('blur', function (evt) {
      self._handleBlur(evt);
    });

    this.$selection.on('keydown', function (evt) {
      self.trigger('keypress', evt);

      if (evt.which === KEYS.SPACE) {
        evt.preventDefault();
      }
    });

    container.on('results:focus', function (params) {
      self.$selection.attr('aria-activedescendant', params.data._resultId);
    });

    container.on('selection:update', function (params) {
      self.update(params.data);
    });

    container.on('open', function () {
      // When the dropdown is open, aria-expanded="true"
      self.$selection.attr('aria-expanded', 'true');
      self.$selection.attr('aria-owns', resultsId);

      self._attachCloseHandler(container);
    });

    container.on('close', function () {
      // When the dropdown is closed, aria-expanded="false"
      self.$selection.attr('aria-expanded', 'false');
      self.$selection.removeAttr('aria-activedescendant');
      self.$selection.removeAttr('aria-owns');

      self.$selection.trigger('focus');

      self._detachCloseHandler(container);
    });

    container.on('enable', function () {
      self.$selection.attr('tabindex', self._tabindex);
      self.$selection.attr('aria-disabled', 'false');
    });

    container.on('disable', function () {
      self.$selection.attr('tabindex', '-1');
      self.$selection.attr('aria-disabled', 'true');
    });
  };

  BaseSelection.prototype._handleBlur = function (evt) {
    var self = this;

    // This needs to be delayed as the active element is the body when the tab
    // key is pressed, possibly along with others.
    window.setTimeout(function () {
      // Don't trigger `blur` if the focus is still in the selection
      if (
        (document.activeElement == self.$selection[0]) ||
        ($.contains(self.$selection[0], document.activeElement))
      ) {
        return;
      }

      self.trigger('blur', evt);
    }, 1);
  };

  BaseSelection.prototype._attachCloseHandler = function (container) {

    $(document.body).on('mousedown.select2.' + container.id, function (e) {
      var $target = $(e.target);

      var $select = $target.closest('.select2');

      var $all = $('.select2.select2-container--open');

      $all.each(function () {
        if (this == $select[0]) {
          return;
        }

        var $element = Utils.GetData(this, 'element');

        $element.select2('close');
      });
    });
  };

  BaseSelection.prototype._detachCloseHandler = function (container) {
    $(document.body).off('mousedown.select2.' + container.id);
  };

  BaseSelection.prototype.position = function ($selection, $container) {
    var $selectionContainer = $container.find('.selection');
    $selectionContainer.append($selection);
  };

  BaseSelection.prototype.destroy = function () {
    this._detachCloseHandler(this.container);
  };

  BaseSelection.prototype.update = function (data) {
    throw new Error('The `update` method must be defined in child classes.');
  };

  /**
   * Helper method to abstract the "enabled" (not "disabled") state of this
   * object.
   *
   * @return {true} if the instance is not disabled.
   * @return {false} if the instance is disabled.
   */
  BaseSelection.prototype.isEnabled = function () {
    return !this.isDisabled();
  };

  /**
   * Helper method to abstract the "disabled" state of this object.
   *
   * @return {true} if the disabled option is true.
   * @return {false} if the disabled option is false.
   */
  BaseSelection.prototype.isDisabled = function () {
    return this.options.get('disabled');
  };

  return BaseSelection;
});

S2.define('select2/selection/single',[
  'jquery',
  './base',
  '../utils',
  '../keys'
], function ($, BaseSelection, Utils, KEYS) {
  function SingleSelection () {
    SingleSelection.__super__.constructor.apply(this, arguments);
  }

  Utils.Extend(SingleSelection, BaseSelection);

  SingleSelection.prototype.render = function () {
    var $selection = SingleSelection.__super__.render.call(this);

    $selection.addClass('select2-selection--single');

    $selection.html(
      '<span class="select2-selection__rendered"></span>' +
      '<span class="select2-selection__arrow" role="presentation">' +
        '<b role="presentation"></b>' +
      '</span>'
    );

    return $selection;
  };

  SingleSelection.prototype.bind = function (container, $container) {
    var self = this;

    SingleSelection.__super__.bind.apply(this, arguments);

    var id = container.id + '-container';

    this.$selection.find('.select2-selection__rendered')
      .attr('id', id)
      .attr('role', 'textbox')
      .attr('aria-readonly', 'true');
    this.$selection.attr('aria-labelledby', id);

    this.$selection.on('mousedown', function (evt) {
      // Only respond to left clicks
      if (evt.which !== 1) {
        return;
      }

      self.trigger('toggle', {
        originalEvent: evt
      });
    });

    this.$selection.on('focus', function (evt) {
      // User focuses on the container
    });

    this.$selection.on('blur', function (evt) {
      // User exits the container
    });

    container.on('focus', function (evt) {
      if (!container.isOpen()) {
        self.$selection.trigger('focus');
      }
    });
  };

  SingleSelection.prototype.clear = function () {
    var $rendered = this.$selection.find('.select2-selection__rendered');
    $rendered.empty();
    $rendered.removeAttr('title'); // clear tooltip on empty
  };

  SingleSelection.prototype.display = function (data, container) {
    var template = this.options.get('templateSelection');
    var escapeMarkup = this.options.get('escapeMarkup');

    return escapeMarkup(template(data, container));
  };

  SingleSelection.prototype.selectionContainer = function () {
    return $('<span></span>');
  };

  SingleSelection.prototype.update = function (data) {
    if (data.length === 0) {
      this.clear();
      return;
    }

    var selection = data[0];

    var $rendered = this.$selection.find('.select2-selection__rendered');
    var formatted = this.display(selection, $rendered);

    $rendered.empty().append(formatted);

    var title = selection.title || selection.text;

    if (title) {
      $rendered.attr('title', title);
    } else {
      $rendered.removeAttr('title');
    }
  };

  return SingleSelection;
});

S2.define('select2/selection/multiple',[
  'jquery',
  './base',
  '../utils'
], function ($, BaseSelection, Utils) {
  function MultipleSelection ($element, options) {
    MultipleSelection.__super__.constructor.apply(this, arguments);
  }

  Utils.Extend(MultipleSelection, BaseSelection);

  MultipleSelection.prototype.render = function () {
    var $selection = MultipleSelection.__super__.render.call(this);

    $selection.addClass('select2-selection--multiple');

    $selection.html(
      '<ul class="select2-selection__rendered"></ul>'
    );

    return $selection;
  };

  MultipleSelection.prototype.bind = function (container, $container) {
    var self = this;

    MultipleSelection.__super__.bind.apply(this, arguments);

    this.$selection.on('click', function (evt) {
      self.trigger('toggle', {
        originalEvent: evt
      });
    });

    this.$selection.on(
      'click',
      '.select2-selection__choice__remove',
      function (evt) {
        // Ignore the event if it is disabled
        if (self.isDisabled()) {
          return;
        }

        var $remove = $(this);
        var $selection = $remove.parent();

        var data = Utils.GetData($selection[0], 'data');

        self.trigger('unselect', {
          originalEvent: evt,
          data: data
        });
      }
    );
  };

  MultipleSelection.prototype.clear = function () {
    var $rendered = this.$selection.find('.select2-selection__rendered');
    $rendered.empty();
    $rendered.removeAttr('title');
  };

  MultipleSelection.prototype.display = function (data, container) {
    var template = this.options.get('templateSelection');
    var escapeMarkup = this.options.get('escapeMarkup');

    return escapeMarkup(template(data, container));
  };

  MultipleSelection.prototype.selectionContainer = function () {
    var $container = $(
      '<li class="select2-selection__choice">' +
        '<span class="select2-selection__choice__remove" role="presentation">' +
          '&times;' +
        '</span>' +
      '</li>'
    );

    return $container;
  };

  MultipleSelection.prototype.update = function (data) {
    this.clear();

    if (data.length === 0) {
      return;
    }

    var $selections = [];

    for (var d = 0; d < data.length; d++) {
      var selection = data[d];

      var $selection = this.selectionContainer();
      var formatted = this.display(selection, $selection);

      $selection.append(formatted);

      var title = selection.title || selection.text;

      if (title) {
        $selection.attr('title', title);
      }

      Utils.StoreData($selection[0], 'data', selection);

      $selections.push($selection);
    }

    var $rendered = this.$selection.find('.select2-selection__rendered');

    Utils.appendMany($rendered, $selections);
  };

  return MultipleSelection;
});

S2.define('select2/selection/placeholder',[
  '../utils'
], function (Utils) {
  function Placeholder (decorated, $element, options) {
    this.placeholder = this.normalizePlaceholder(options.get('placeholder'));

    decorated.call(this, $element, options);
  }

  Placeholder.prototype.normalizePlaceholder = function (_, placeholder) {
    if (typeof placeholder === 'string') {
      placeholder = {
        id: '',
        text: placeholder
      };
    }

    return placeholder;
  };

  Placeholder.prototype.createPlaceholder = function (decorated, placeholder) {
    var $placeholder = this.selectionContainer();

    $placeholder.html(this.display(placeholder));
    $placeholder.addClass('select2-selection__placeholder')
                .removeClass('select2-selection__choice');

    return $placeholder;
  };

  Placeholder.prototype.update = function (decorated, data) {
    var singlePlaceholder = (
      data.length == 1 && data[0].id != this.placeholder.id
    );
    var multipleSelections = data.length > 1;

    if (multipleSelections || singlePlaceholder) {
      return decorated.call(this, data);
    }

    this.clear();

    var $placeholder = this.createPlaceholder(this.placeholder);

    this.$selection.find('.select2-selection__rendered').append($placeholder);
  };

  return Placeholder;
});

S2.define('select2/selection/allowClear',[
  'jquery',
  '../keys',
  '../utils'
], function ($, KEYS, Utils) {
  function AllowClear () { }

  AllowClear.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    if (this.placeholder == null) {
      if (this.options.get('debug') && window.console && console.error) {
        console.error(
          'Select2: The `allowClear` option should be used in combination ' +
          'with the `placeholder` option.'
        );
      }
    }

    this.$selection.on('mousedown', '.select2-selection__clear',
      function (evt) {
        self._handleClear(evt);
    });

    container.on('keypress', function (evt) {
      self._handleKeyboardClear(evt, container);
    });
  };

  AllowClear.prototype._handleClear = function (_, evt) {
    // Ignore the event if it is disabled
    if (this.isDisabled()) {
      return;
    }

    var $clear = this.$selection.find('.select2-selection__clear');

    // Ignore the event if nothing has been selected
    if ($clear.length === 0) {
      return;
    }

    evt.stopPropagation();

    var data = Utils.GetData($clear[0], 'data');

    var previousVal = this.$element.val();
    this.$element.val(this.placeholder.id);

    var unselectData = {
      data: data
    };
    this.trigger('clear', unselectData);
    if (unselectData.prevented) {
      this.$element.val(previousVal);
      return;
    }

    for (var d = 0; d < data.length; d++) {
      unselectData = {
        data: data[d]
      };

      // Trigger the `unselect` event, so people can prevent it from being
      // cleared.
      this.trigger('unselect', unselectData);

      // If the event was prevented, don't clear it out.
      if (unselectData.prevented) {
        this.$element.val(previousVal);
        return;
      }
    }

    this.$element.trigger('input').trigger('change');

    this.trigger('toggle', {});
  };

  AllowClear.prototype._handleKeyboardClear = function (_, evt, container) {
    if (container.isOpen()) {
      return;
    }

    if (evt.which == KEYS.DELETE || evt.which == KEYS.BACKSPACE) {
      this._handleClear(evt);
    }
  };

  AllowClear.prototype.update = function (decorated, data) {
    decorated.call(this, data);

    if (this.$selection.find('.select2-selection__placeholder').length > 0 ||
        data.length === 0) {
      return;
    }

    var removeAll = this.options.get('translations').get('removeAllItems');

    var $remove = $(
      '<span class="select2-selection__clear" title="' + removeAll() +'">' +
        '&times;' +
      '</span>'
    );
    Utils.StoreData($remove[0], 'data', data);

    this.$selection.find('.select2-selection__rendered').prepend($remove);
  };

  return AllowClear;
});

S2.define('select2/selection/search',[
  'jquery',
  '../utils',
  '../keys'
], function ($, Utils, KEYS) {
  function Search (decorated, $element, options) {
    decorated.call(this, $element, options);
  }

  Search.prototype.render = function (decorated) {
    var $search = $(
      '<li class="select2-search select2-search--inline">' +
        '<input class="select2-search__field" type="search" tabindex="-1"' +
        ' autocomplete="off" autocorrect="off" autocapitalize="none"' +
        ' spellcheck="false" role="searchbox" aria-autocomplete="list" />' +
      '</li>'
    );

    this.$searchContainer = $search;
    this.$search = $search.find('input');

    var $rendered = decorated.call(this);

    this._transferTabIndex();

    return $rendered;
  };

  Search.prototype.bind = function (decorated, container, $container) {
    var self = this;

    var resultsId = container.id + '-results';

    decorated.call(this, container, $container);

    container.on('open', function () {
      self.$search.attr('aria-controls', resultsId);
      self.$search.trigger('focus');
    });

    container.on('close', function () {
      self.$search.val('');
      self.$search.removeAttr('aria-controls');
      self.$search.removeAttr('aria-activedescendant');
      self.$search.trigger('focus');
    });

    container.on('enable', function () {
      self.$search.prop('disabled', false);

      self._transferTabIndex();
    });

    container.on('disable', function () {
      self.$search.prop('disabled', true);
    });

    container.on('focus', function (evt) {
      self.$search.trigger('focus');
    });

    container.on('results:focus', function (params) {
      if (params.data._resultId) {
        self.$search.attr('aria-activedescendant', params.data._resultId);
      } else {
        self.$search.removeAttr('aria-activedescendant');
      }
    });

    this.$selection.on('focusin', '.select2-search--inline', function (evt) {
      self.trigger('focus', evt);
    });

    this.$selection.on('focusout', '.select2-search--inline', function (evt) {
      self._handleBlur(evt);
    });

    this.$selection.on('keydown', '.select2-search--inline', function (evt) {
      evt.stopPropagation();

      self.trigger('keypress', evt);

      self._keyUpPrevented = evt.isDefaultPrevented();

      var key = evt.which;

      if (key === KEYS.BACKSPACE && self.$search.val() === '') {
        var $previousChoice = self.$searchContainer
          .prev('.select2-selection__choice');

        if ($previousChoice.length > 0) {
          var item = Utils.GetData($previousChoice[0], 'data');

          self.searchRemoveChoice(item);

          evt.preventDefault();
        }
      }
    });

    this.$selection.on('click', '.select2-search--inline', function (evt) {
      if (self.$search.val()) {
        evt.stopPropagation();
      }
    });

    // Try to detect the IE version should the `documentMode` property that
    // is stored on the document. This is only implemented in IE and is
    // slightly cleaner than doing a user agent check.
    // This property is not available in Edge, but Edge also doesn't have
    // this bug.
    var msie = document.documentMode;
    var disableInputEvents = msie && msie <= 11;

    // Workaround for browsers which do not support the `input` event
    // This will prevent double-triggering of events for browsers which support
    // both the `keyup` and `input` events.
    this.$selection.on(
      'input.searchcheck',
      '.select2-search--inline',
      function (evt) {
        // IE will trigger the `input` event when a placeholder is used on a
        // search box. To get around this issue, we are forced to ignore all
        // `input` events in IE and keep using `keyup`.
        if (disableInputEvents) {
          self.$selection.off('input.search input.searchcheck');
          return;
        }

        // Unbind the duplicated `keyup` event
        self.$selection.off('keyup.search');
      }
    );

    this.$selection.on(
      'keyup.search input.search',
      '.select2-search--inline',
      function (evt) {
        // IE will trigger the `input` event when a placeholder is used on a
        // search box. To get around this issue, we are forced to ignore all
        // `input` events in IE and keep using `keyup`.
        if (disableInputEvents && evt.type === 'input') {
          self.$selection.off('input.search input.searchcheck');
          return;
        }

        var key = evt.which;

        // We can freely ignore events from modifier keys
        if (key == KEYS.SHIFT || key == KEYS.CTRL || key == KEYS.ALT) {
          return;
        }

        // Tabbing will be handled during the `keydown` phase
        if (key == KEYS.TAB) {
          return;
        }

        self.handleSearch(evt);
      }
    );
  };

  /**
   * This method will transfer the tabindex attribute from the rendered
   * selection to the search box. This allows for the search box to be used as
   * the primary focus instead of the selection container.
   *
   * @private
   */
  Search.prototype._transferTabIndex = function (decorated) {
    this.$search.attr('tabindex', this.$selection.attr('tabindex'));
    this.$selection.attr('tabindex', '-1');
  };

  Search.prototype.createPlaceholder = function (decorated, placeholder) {
    this.$search.attr('placeholder', placeholder.text);
  };

  Search.prototype.update = function (decorated, data) {
    var searchHadFocus = this.$search[0] == document.activeElement;

    this.$search.attr('placeholder', '');

    decorated.call(this, data);

    this.$selection.find('.select2-selection__rendered')
                   .append(this.$searchContainer);

    this.resizeSearch();
    if (searchHadFocus) {
      this.$search.trigger('focus');
    }
  };

  Search.prototype.handleSearch = function () {
    this.resizeSearch();

    if (!this._keyUpPrevented) {
      var input = this.$search.val();

      this.trigger('query', {
        term: input
      });
    }

    this._keyUpPrevented = false;
  };

  Search.prototype.searchRemoveChoice = function (decorated, item) {
    this.trigger('unselect', {
      data: item
    });

    this.$search.val(item.text);
    this.handleSearch();
  };

  Search.prototype.resizeSearch = function () {
    this.$search.css('width', '25px');

    var width = '';

    if (this.$search.attr('placeholder') !== '') {
      width = this.$selection.find('.select2-selection__rendered').width();
    } else {
      var minimumWidth = this.$search.val().length + 1;

      width = (minimumWidth * 0.75) + 'em';
    }

    this.$search.css('width', width);
  };

  return Search;
});

S2.define('select2/selection/eventRelay',[
  'jquery'
], function ($) {
  function EventRelay () { }

  EventRelay.prototype.bind = function (decorated, container, $container) {
    var self = this;
    var relayEvents = [
      'open', 'opening',
      'close', 'closing',
      'select', 'selecting',
      'unselect', 'unselecting',
      'clear', 'clearing'
    ];

    var preventableEvents = [
      'opening', 'closing', 'selecting', 'unselecting', 'clearing'
    ];

    decorated.call(this, container, $container);

    container.on('*', function (name, params) {
      // Ignore events that should not be relayed
      if ($.inArray(name, relayEvents) === -1) {
        return;
      }

      // The parameters should always be an object
      params = params || {};

      // Generate the jQuery event for the Select2 event
      var evt = $.Event('select2:' + name, {
        params: params
      });

      self.$element.trigger(evt);

      // Only handle preventable events if it was one
      if ($.inArray(name, preventableEvents) === -1) {
        return;
      }

      params.prevented = evt.isDefaultPrevented();
    });
  };

  return EventRelay;
});

S2.define('select2/translation',[
  'jquery',
  'require'
], function ($, require) {
  function Translation (dict) {
    this.dict = dict || {};
  }

  Translation.prototype.all = function () {
    return this.dict;
  };

  Translation.prototype.get = function (key) {
    return this.dict[key];
  };

  Translation.prototype.extend = function (translation) {
    this.dict = $.extend({}, translation.all(), this.dict);
  };

  // Static functions

  Translation._cache = {};

  Translation.loadPath = function (path) {
    if (!(path in Translation._cache)) {
      var translations = require(path);

      Translation._cache[path] = translations;
    }

    return new Translation(Translation._cache[path]);
  };

  return Translation;
});

S2.define('select2/diacritics',[

], function () {
  var diacritics = {
    '\u24B6': 'A',
    '\uFF21': 'A',
    '\u00C0': 'A',
    '\u00C1': 'A',
    '\u00C2': 'A',
    '\u1EA6': 'A',
    '\u1EA4': 'A',
    '\u1EAA': 'A',
    '\u1EA8': 'A',
    '\u00C3': 'A',
    '\u0100': 'A',
    '\u0102': 'A',
    '\u1EB0': 'A',
    '\u1EAE': 'A',
    '\u1EB4': 'A',
    '\u1EB2': 'A',
    '\u0226': 'A',
    '\u01E0': 'A',
    '\u00C4': 'A',
    '\u01DE': 'A',
    '\u1EA2': 'A',
    '\u00C5': 'A',
    '\u01FA': 'A',
    '\u01CD': 'A',
    '\u0200': 'A',
    '\u0202': 'A',
    '\u1EA0': 'A',
    '\u1EAC': 'A',
    '\u1EB6': 'A',
    '\u1E00': 'A',
    '\u0104': 'A',
    '\u023A': 'A',
    '\u2C6F': 'A',
    '\uA732': 'AA',
    '\u00C6': 'AE',
    '\u01FC': 'AE',
    '\u01E2': 'AE',
    '\uA734': 'AO',
    '\uA736': 'AU',
    '\uA738': 'AV',
    '\uA73A': 'AV',
    '\uA73C': 'AY',
    '\u24B7': 'B',
    '\uFF22': 'B',
    '\u1E02': 'B',
    '\u1E04': 'B',
    '\u1E06': 'B',
    '\u0243': 'B',
    '\u0182': 'B',
    '\u0181': 'B',
    '\u24B8': 'C',
    '\uFF23': 'C',
    '\u0106': 'C',
    '\u0108': 'C',
    '\u010A': 'C',
    '\u010C': 'C',
    '\u00C7': 'C',
    '\u1E08': 'C',
    '\u0187': 'C',
    '\u023B': 'C',
    '\uA73E': 'C',
    '\u24B9': 'D',
    '\uFF24': 'D',
    '\u1E0A': 'D',
    '\u010E': 'D',
    '\u1E0C': 'D',
    '\u1E10': 'D',
    '\u1E12': 'D',
    '\u1E0E': 'D',
    '\u0110': 'D',
    '\u018B': 'D',
    '\u018A': 'D',
    '\u0189': 'D',
    '\uA779': 'D',
    '\u01F1': 'DZ',
    '\u01C4': 'DZ',
    '\u01F2': 'Dz',
    '\u01C5': 'Dz',
    '\u24BA': 'E',
    '\uFF25': 'E',
    '\u00C8': 'E',
    '\u00C9': 'E',
    '\u00CA': 'E',
    '\u1EC0': 'E',
    '\u1EBE': 'E',
    '\u1EC4': 'E',
    '\u1EC2': 'E',
    '\u1EBC': 'E',
    '\u0112': 'E',
    '\u1E14': 'E',
    '\u1E16': 'E',
    '\u0114': 'E',
    '\u0116': 'E',
    '\u00CB': 'E',
    '\u1EBA': 'E',
    '\u011A': 'E',
    '\u0204': 'E',
    '\u0206': 'E',
    '\u1EB8': 'E',
    '\u1EC6': 'E',
    '\u0228': 'E',
    '\u1E1C': 'E',
    '\u0118': 'E',
    '\u1E18': 'E',
    '\u1E1A': 'E',
    '\u0190': 'E',
    '\u018E': 'E',
    '\u24BB': 'F',
    '\uFF26': 'F',
    '\u1E1E': 'F',
    '\u0191': 'F',
    '\uA77B': 'F',
    '\u24BC': 'G',
    '\uFF27': 'G',
    '\u01F4': 'G',
    '\u011C': 'G',
    '\u1E20': 'G',
    '\u011E': 'G',
    '\u0120': 'G',
    '\u01E6': 'G',
    '\u0122': 'G',
    '\u01E4': 'G',
    '\u0193': 'G',
    '\uA7A0': 'G',
    '\uA77D': 'G',
    '\uA77E': 'G',
    '\u24BD': 'H',
    '\uFF28': 'H',
    '\u0124': 'H',
    '\u1E22': 'H',
    '\u1E26': 'H',
    '\u021E': 'H',
    '\u1E24': 'H',
    '\u1E28': 'H',
    '\u1E2A': 'H',
    '\u0126': 'H',
    '\u2C67': 'H',
    '\u2C75': 'H',
    '\uA78D': 'H',
    '\u24BE': 'I',
    '\uFF29': 'I',
    '\u00CC': 'I',
    '\u00CD': 'I',
    '\u00CE': 'I',
    '\u0128': 'I',
    '\u012A': 'I',
    '\u012C': 'I',
    '\u0130': 'I',
    '\u00CF': 'I',
    '\u1E2E': 'I',
    '\u1EC8': 'I',
    '\u01CF': 'I',
    '\u0208': 'I',
    '\u020A': 'I',
    '\u1ECA': 'I',
    '\u012E': 'I',
    '\u1E2C': 'I',
    '\u0197': 'I',
    '\u24BF': 'J',
    '\uFF2A': 'J',
    '\u0134': 'J',
    '\u0248': 'J',
    '\u24C0': 'K',
    '\uFF2B': 'K',
    '\u1E30': 'K',
    '\u01E8': 'K',
    '\u1E32': 'K',
    '\u0136': 'K',
    '\u1E34': 'K',
    '\u0198': 'K',
    '\u2C69': 'K',
    '\uA740': 'K',
    '\uA742': 'K',
    '\uA744': 'K',
    '\uA7A2': 'K',
    '\u24C1': 'L',
    '\uFF2C': 'L',
    '\u013F': 'L',
    '\u0139': 'L',
    '\u013D': 'L',
    '\u1E36': 'L',
    '\u1E38': 'L',
    '\u013B': 'L',
    '\u1E3C': 'L',
    '\u1E3A': 'L',
    '\u0141': 'L',
    '\u023D': 'L',
    '\u2C62': 'L',
    '\u2C60': 'L',
    '\uA748': 'L',
    '\uA746': 'L',
    '\uA780': 'L',
    '\u01C7': 'LJ',
    '\u01C8': 'Lj',
    '\u24C2': 'M',
    '\uFF2D': 'M',
    '\u1E3E': 'M',
    '\u1E40': 'M',
    '\u1E42': 'M',
    '\u2C6E': 'M',
    '\u019C': 'M',
    '\u24C3': 'N',
    '\uFF2E': 'N',
    '\u01F8': 'N',
    '\u0143': 'N',
    '\u00D1': 'N',
    '\u1E44': 'N',
    '\u0147': 'N',
    '\u1E46': 'N',
    '\u0145': 'N',
    '\u1E4A': 'N',
    '\u1E48': 'N',
    '\u0220': 'N',
    '\u019D': 'N',
    '\uA790': 'N',
    '\uA7A4': 'N',
    '\u01CA': 'NJ',
    '\u01CB': 'Nj',
    '\u24C4': 'O',
    '\uFF2F': 'O',
    '\u00D2': 'O',
    '\u00D3': 'O',
    '\u00D4': 'O',
    '\u1ED2': 'O',
    '\u1ED0': 'O',
    '\u1ED6': 'O',
    '\u1ED4': 'O',
    '\u00D5': 'O',
    '\u1E4C': 'O',
    '\u022C': 'O',
    '\u1E4E': 'O',
    '\u014C': 'O',
    '\u1E50': 'O',
    '\u1E52': 'O',
    '\u014E': 'O',
    '\u022E': 'O',
    '\u0230': 'O',
    '\u00D6': 'O',
    '\u022A': 'O',
    '\u1ECE': 'O',
    '\u0150': 'O',
    '\u01D1': 'O',
    '\u020C': 'O',
    '\u020E': 'O',
    '\u01A0': 'O',
    '\u1EDC': 'O',
    '\u1EDA': 'O',
    '\u1EE0': 'O',
    '\u1EDE': 'O',
    '\u1EE2': 'O',
    '\u1ECC': 'O',
    '\u1ED8': 'O',
    '\u01EA': 'O',
    '\u01EC': 'O',
    '\u00D8': 'O',
    '\u01FE': 'O',
    '\u0186': 'O',
    '\u019F': 'O',
    '\uA74A': 'O',
    '\uA74C': 'O',
    '\u0152': 'OE',
    '\u01A2': 'OI',
    '\uA74E': 'OO',
    '\u0222': 'OU',
    '\u24C5': 'P',
    '\uFF30': 'P',
    '\u1E54': 'P',
    '\u1E56': 'P',
    '\u01A4': 'P',
    '\u2C63': 'P',
    '\uA750': 'P',
    '\uA752': 'P',
    '\uA754': 'P',
    '\u24C6': 'Q',
    '\uFF31': 'Q',
    '\uA756': 'Q',
    '\uA758': 'Q',
    '\u024A': 'Q',
    '\u24C7': 'R',
    '\uFF32': 'R',
    '\u0154': 'R',
    '\u1E58': 'R',
    '\u0158': 'R',
    '\u0210': 'R',
    '\u0212': 'R',
    '\u1E5A': 'R',
    '\u1E5C': 'R',
    '\u0156': 'R',
    '\u1E5E': 'R',
    '\u024C': 'R',
    '\u2C64': 'R',
    '\uA75A': 'R',
    '\uA7A6': 'R',
    '\uA782': 'R',
    '\u24C8': 'S',
    '\uFF33': 'S',
    '\u1E9E': 'S',
    '\u015A': 'S',
    '\u1E64': 'S',
    '\u015C': 'S',
    '\u1E60': 'S',
    '\u0160': 'S',
    '\u1E66': 'S',
    '\u1E62': 'S',
    '\u1E68': 'S',
    '\u0218': 'S',
    '\u015E': 'S',
    '\u2C7E': 'S',
    '\uA7A8': 'S',
    '\uA784': 'S',
    '\u24C9': 'T',
    '\uFF34': 'T',
    '\u1E6A': 'T',
    '\u0164': 'T',
    '\u1E6C': 'T',
    '\u021A': 'T',
    '\u0162': 'T',
    '\u1E70': 'T',
    '\u1E6E': 'T',
    '\u0166': 'T',
    '\u01AC': 'T',
    '\u01AE': 'T',
    '\u023E': 'T',
    '\uA786': 'T',
    '\uA728': 'TZ',
    '\u24CA': 'U',
    '\uFF35': 'U',
    '\u00D9': 'U',
    '\u00DA': 'U',
    '\u00DB': 'U',
    '\u0168': 'U',
    '\u1E78': 'U',
    '\u016A': 'U',
    '\u1E7A': 'U',
    '\u016C': 'U',
    '\u00DC': 'U',
    '\u01DB': 'U',
    '\u01D7': 'U',
    '\u01D5': 'U',
    '\u01D9': 'U',
    '\u1EE6': 'U',
    '\u016E': 'U',
    '\u0170': 'U',
    '\u01D3': 'U',
    '\u0214': 'U',
    '\u0216': 'U',
    '\u01AF': 'U',
    '\u1EEA': 'U',
    '\u1EE8': 'U',
    '\u1EEE': 'U',
    '\u1EEC': 'U',
    '\u1EF0': 'U',
    '\u1EE4': 'U',
    '\u1E72': 'U',
    '\u0172': 'U',
    '\u1E76': 'U',
    '\u1E74': 'U',
    '\u0244': 'U',
    '\u24CB': 'V',
    '\uFF36': 'V',
    '\u1E7C': 'V',
    '\u1E7E': 'V',
    '\u01B2': 'V',
    '\uA75E': 'V',
    '\u0245': 'V',
    '\uA760': 'VY',
    '\u24CC': 'W',
    '\uFF37': 'W',
    '\u1E80': 'W',
    '\u1E82': 'W',
    '\u0174': 'W',
    '\u1E86': 'W',
    '\u1E84': 'W',
    '\u1E88': 'W',
    '\u2C72': 'W',
    '\u24CD': 'X',
    '\uFF38': 'X',
    '\u1E8A': 'X',
    '\u1E8C': 'X',
    '\u24CE': 'Y',
    '\uFF39': 'Y',
    '\u1EF2': 'Y',
    '\u00DD': 'Y',
    '\u0176': 'Y',
    '\u1EF8': 'Y',
    '\u0232': 'Y',
    '\u1E8E': 'Y',
    '\u0178': 'Y',
    '\u1EF6': 'Y',
    '\u1EF4': 'Y',
    '\u01B3': 'Y',
    '\u024E': 'Y',
    '\u1EFE': 'Y',
    '\u24CF': 'Z',
    '\uFF3A': 'Z',
    '\u0179': 'Z',
    '\u1E90': 'Z',
    '\u017B': 'Z',
    '\u017D': 'Z',
    '\u1E92': 'Z',
    '\u1E94': 'Z',
    '\u01B5': 'Z',
    '\u0224': 'Z',
    '\u2C7F': 'Z',
    '\u2C6B': 'Z',
    '\uA762': 'Z',
    '\u24D0': 'a',
    '\uFF41': 'a',
    '\u1E9A': 'a',
    '\u00E0': 'a',
    '\u00E1': 'a',
    '\u00E2': 'a',
    '\u1EA7': 'a',
    '\u1EA5': 'a',
    '\u1EAB': 'a',
    '\u1EA9': 'a',
    '\u00E3': 'a',
    '\u0101': 'a',
    '\u0103': 'a',
    '\u1EB1': 'a',
    '\u1EAF': 'a',
    '\u1EB5': 'a',
    '\u1EB3': 'a',
    '\u0227': 'a',
    '\u01E1': 'a',
    '\u00E4': 'a',
    '\u01DF': 'a',
    '\u1EA3': 'a',
    '\u00E5': 'a',
    '\u01FB': 'a',
    '\u01CE': 'a',
    '\u0201': 'a',
    '\u0203': 'a',
    '\u1EA1': 'a',
    '\u1EAD': 'a',
    '\u1EB7': 'a',
    '\u1E01': 'a',
    '\u0105': 'a',
    '\u2C65': 'a',
    '\u0250': 'a',
    '\uA733': 'aa',
    '\u00E6': 'ae',
    '\u01FD': 'ae',
    '\u01E3': 'ae',
    '\uA735': 'ao',
    '\uA737': 'au',
    '\uA739': 'av',
    '\uA73B': 'av',
    '\uA73D': 'ay',
    '\u24D1': 'b',
    '\uFF42': 'b',
    '\u1E03': 'b',
    '\u1E05': 'b',
    '\u1E07': 'b',
    '\u0180': 'b',
    '\u0183': 'b',
    '\u0253': 'b',
    '\u24D2': 'c',
    '\uFF43': 'c',
    '\u0107': 'c',
    '\u0109': 'c',
    '\u010B': 'c',
    '\u010D': 'c',
    '\u00E7': 'c',
    '\u1E09': 'c',
    '\u0188': 'c',
    '\u023C': 'c',
    '\uA73F': 'c',
    '\u2184': 'c',
    '\u24D3': 'd',
    '\uFF44': 'd',
    '\u1E0B': 'd',
    '\u010F': 'd',
    '\u1E0D': 'd',
    '\u1E11': 'd',
    '\u1E13': 'd',
    '\u1E0F': 'd',
    '\u0111': 'd',
    '\u018C': 'd',
    '\u0256': 'd',
    '\u0257': 'd',
    '\uA77A': 'd',
    '\u01F3': 'dz',
    '\u01C6': 'dz',
    '\u24D4': 'e',
    '\uFF45': 'e',
    '\u00E8': 'e',
    '\u00E9': 'e',
    '\u00EA': 'e',
    '\u1EC1': 'e',
    '\u1EBF': 'e',
    '\u1EC5': 'e',
    '\u1EC3': 'e',
    '\u1EBD': 'e',
    '\u0113': 'e',
    '\u1E15': 'e',
    '\u1E17': 'e',
    '\u0115': 'e',
    '\u0117': 'e',
    '\u00EB': 'e',
    '\u1EBB': 'e',
    '\u011B': 'e',
    '\u0205': 'e',
    '\u0207': 'e',
    '\u1EB9': 'e',
    '\u1EC7': 'e',
    '\u0229': 'e',
    '\u1E1D': 'e',
    '\u0119': 'e',
    '\u1E19': 'e',
    '\u1E1B': 'e',
    '\u0247': 'e',
    '\u025B': 'e',
    '\u01DD': 'e',
    '\u24D5': 'f',
    '\uFF46': 'f',
    '\u1E1F': 'f',
    '\u0192': 'f',
    '\uA77C': 'f',
    '\u24D6': 'g',
    '\uFF47': 'g',
    '\u01F5': 'g',
    '\u011D': 'g',
    '\u1E21': 'g',
    '\u011F': 'g',
    '\u0121': 'g',
    '\u01E7': 'g',
    '\u0123': 'g',
    '\u01E5': 'g',
    '\u0260': 'g',
    '\uA7A1': 'g',
    '\u1D79': 'g',
    '\uA77F': 'g',
    '\u24D7': 'h',
    '\uFF48': 'h',
    '\u0125': 'h',
    '\u1E23': 'h',
    '\u1E27': 'h',
    '\u021F': 'h',
    '\u1E25': 'h',
    '\u1E29': 'h',
    '\u1E2B': 'h',
    '\u1E96': 'h',
    '\u0127': 'h',
    '\u2C68': 'h',
    '\u2C76': 'h',
    '\u0265': 'h',
    '\u0195': 'hv',
    '\u24D8': 'i',
    '\uFF49': 'i',
    '\u00EC': 'i',
    '\u00ED': 'i',
    '\u00EE': 'i',
    '\u0129': 'i',
    '\u012B': 'i',
    '\u012D': 'i',
    '\u00EF': 'i',
    '\u1E2F': 'i',
    '\u1EC9': 'i',
    '\u01D0': 'i',
    '\u0209': 'i',
    '\u020B': 'i',
    '\u1ECB': 'i',
    '\u012F': 'i',
    '\u1E2D': 'i',
    '\u0268': 'i',
    '\u0131': 'i',
    '\u24D9': 'j',
    '\uFF4A': 'j',
    '\u0135': 'j',
    '\u01F0': 'j',
    '\u0249': 'j',
    '\u24DA': 'k',
    '\uFF4B': 'k',
    '\u1E31': 'k',
    '\u01E9': 'k',
    '\u1E33': 'k',
    '\u0137': 'k',
    '\u1E35': 'k',
    '\u0199': 'k',
    '\u2C6A': 'k',
    '\uA741': 'k',
    '\uA743': 'k',
    '\uA745': 'k',
    '\uA7A3': 'k',
    '\u24DB': 'l',
    '\uFF4C': 'l',
    '\u0140': 'l',
    '\u013A': 'l',
    '\u013E': 'l',
    '\u1E37': 'l',
    '\u1E39': 'l',
    '\u013C': 'l',
    '\u1E3D': 'l',
    '\u1E3B': 'l',
    '\u017F': 'l',
    '\u0142': 'l',
    '\u019A': 'l',
    '\u026B': 'l',
    '\u2C61': 'l',
    '\uA749': 'l',
    '\uA781': 'l',
    '\uA747': 'l',
    '\u01C9': 'lj',
    '\u24DC': 'm',
    '\uFF4D': 'm',
    '\u1E3F': 'm',
    '\u1E41': 'm',
    '\u1E43': 'm',
    '\u0271': 'm',
    '\u026F': 'm',
    '\u24DD': 'n',
    '\uFF4E': 'n',
    '\u01F9': 'n',
    '\u0144': 'n',
    '\u00F1': 'n',
    '\u1E45': 'n',
    '\u0148': 'n',
    '\u1E47': 'n',
    '\u0146': 'n',
    '\u1E4B': 'n',
    '\u1E49': 'n',
    '\u019E': 'n',
    '\u0272': 'n',
    '\u0149': 'n',
    '\uA791': 'n',
    '\uA7A5': 'n',
    '\u01CC': 'nj',
    '\u24DE': 'o',
    '\uFF4F': 'o',
    '\u00F2': 'o',
    '\u00F3': 'o',
    '\u00F4': 'o',
    '\u1ED3': 'o',
    '\u1ED1': 'o',
    '\u1ED7': 'o',
    '\u1ED5': 'o',
    '\u00F5': 'o',
    '\u1E4D': 'o',
    '\u022D': 'o',
    '\u1E4F': 'o',
    '\u014D': 'o',
    '\u1E51': 'o',
    '\u1E53': 'o',
    '\u014F': 'o',
    '\u022F': 'o',
    '\u0231': 'o',
    '\u00F6': 'o',
    '\u022B': 'o',
    '\u1ECF': 'o',
    '\u0151': 'o',
    '\u01D2': 'o',
    '\u020D': 'o',
    '\u020F': 'o',
    '\u01A1': 'o',
    '\u1EDD': 'o',
    '\u1EDB': 'o',
    '\u1EE1': 'o',
    '\u1EDF': 'o',
    '\u1EE3': 'o',
    '\u1ECD': 'o',
    '\u1ED9': 'o',
    '\u01EB': 'o',
    '\u01ED': 'o',
    '\u00F8': 'o',
    '\u01FF': 'o',
    '\u0254': 'o',
    '\uA74B': 'o',
    '\uA74D': 'o',
    '\u0275': 'o',
    '\u0153': 'oe',
    '\u01A3': 'oi',
    '\u0223': 'ou',
    '\uA74F': 'oo',
    '\u24DF': 'p',
    '\uFF50': 'p',
    '\u1E55': 'p',
    '\u1E57': 'p',
    '\u01A5': 'p',
    '\u1D7D': 'p',
    '\uA751': 'p',
    '\uA753': 'p',
    '\uA755': 'p',
    '\u24E0': 'q',
    '\uFF51': 'q',
    '\u024B': 'q',
    '\uA757': 'q',
    '\uA759': 'q',
    '\u24E1': 'r',
    '\uFF52': 'r',
    '\u0155': 'r',
    '\u1E59': 'r',
    '\u0159': 'r',
    '\u0211': 'r',
    '\u0213': 'r',
    '\u1E5B': 'r',
    '\u1E5D': 'r',
    '\u0157': 'r',
    '\u1E5F': 'r',
    '\u024D': 'r',
    '\u027D': 'r',
    '\uA75B': 'r',
    '\uA7A7': 'r',
    '\uA783': 'r',
    '\u24E2': 's',
    '\uFF53': 's',
    '\u00DF': 's',
    '\u015B': 's',
    '\u1E65': 's',
    '\u015D': 's',
    '\u1E61': 's',
    '\u0161': 's',
    '\u1E67': 's',
    '\u1E63': 's',
    '\u1E69': 's',
    '\u0219': 's',
    '\u015F': 's',
    '\u023F': 's',
    '\uA7A9': 's',
    '\uA785': 's',
    '\u1E9B': 's',
    '\u24E3': 't',
    '\uFF54': 't',
    '\u1E6B': 't',
    '\u1E97': 't',
    '\u0165': 't',
    '\u1E6D': 't',
    '\u021B': 't',
    '\u0163': 't',
    '\u1E71': 't',
    '\u1E6F': 't',
    '\u0167': 't',
    '\u01AD': 't',
    '\u0288': 't',
    '\u2C66': 't',
    '\uA787': 't',
    '\uA729': 'tz',
    '\u24E4': 'u',
    '\uFF55': 'u',
    '\u00F9': 'u',
    '\u00FA': 'u',
    '\u00FB': 'u',
    '\u0169': 'u',
    '\u1E79': 'u',
    '\u016B': 'u',
    '\u1E7B': 'u',
    '\u016D': 'u',
    '\u00FC': 'u',
    '\u01DC': 'u',
    '\u01D8': 'u',
    '\u01D6': 'u',
    '\u01DA': 'u',
    '\u1EE7': 'u',
    '\u016F': 'u',
    '\u0171': 'u',
    '\u01D4': 'u',
    '\u0215': 'u',
    '\u0217': 'u',
    '\u01B0': 'u',
    '\u1EEB': 'u',
    '\u1EE9': 'u',
    '\u1EEF': 'u',
    '\u1EED': 'u',
    '\u1EF1': 'u',
    '\u1EE5': 'u',
    '\u1E73': 'u',
    '\u0173': 'u',
    '\u1E77': 'u',
    '\u1E75': 'u',
    '\u0289': 'u',
    '\u24E5': 'v',
    '\uFF56': 'v',
    '\u1E7D': 'v',
    '\u1E7F': 'v',
    '\u028B': 'v',
    '\uA75F': 'v',
    '\u028C': 'v',
    '\uA761': 'vy',
    '\u24E6': 'w',
    '\uFF57': 'w',
    '\u1E81': 'w',
    '\u1E83': 'w',
    '\u0175': 'w',
    '\u1E87': 'w',
    '\u1E85': 'w',
    '\u1E98': 'w',
    '\u1E89': 'w',
    '\u2C73': 'w',
    '\u24E7': 'x',
    '\uFF58': 'x',
    '\u1E8B': 'x',
    '\u1E8D': 'x',
    '\u24E8': 'y',
    '\uFF59': 'y',
    '\u1EF3': 'y',
    '\u00FD': 'y',
    '\u0177': 'y',
    '\u1EF9': 'y',
    '\u0233': 'y',
    '\u1E8F': 'y',
    '\u00FF': 'y',
    '\u1EF7': 'y',
    '\u1E99': 'y',
    '\u1EF5': 'y',
    '\u01B4': 'y',
    '\u024F': 'y',
    '\u1EFF': 'y',
    '\u24E9': 'z',
    '\uFF5A': 'z',
    '\u017A': 'z',
    '\u1E91': 'z',
    '\u017C': 'z',
    '\u017E': 'z',
    '\u1E93': 'z',
    '\u1E95': 'z',
    '\u01B6': 'z',
    '\u0225': 'z',
    '\u0240': 'z',
    '\u2C6C': 'z',
    '\uA763': 'z',
    '\u0386': '\u0391',
    '\u0388': '\u0395',
    '\u0389': '\u0397',
    '\u038A': '\u0399',
    '\u03AA': '\u0399',
    '\u038C': '\u039F',
    '\u038E': '\u03A5',
    '\u03AB': '\u03A5',
    '\u038F': '\u03A9',
    '\u03AC': '\u03B1',
    '\u03AD': '\u03B5',
    '\u03AE': '\u03B7',
    '\u03AF': '\u03B9',
    '\u03CA': '\u03B9',
    '\u0390': '\u03B9',
    '\u03CC': '\u03BF',
    '\u03CD': '\u03C5',
    '\u03CB': '\u03C5',
    '\u03B0': '\u03C5',
    '\u03CE': '\u03C9',
    '\u03C2': '\u03C3',
    '\u2019': '\''
  };

  return diacritics;
});

S2.define('select2/data/base',[
  '../utils'
], function (Utils) {
  function BaseAdapter ($element, options) {
    BaseAdapter.__super__.constructor.call(this);
  }

  Utils.Extend(BaseAdapter, Utils.Observable);

  BaseAdapter.prototype.current = function (callback) {
    throw new Error('The `current` method must be defined in child classes.');
  };

  BaseAdapter.prototype.query = function (params, callback) {
    throw new Error('The `query` method must be defined in child classes.');
  };

  BaseAdapter.prototype.bind = function (container, $container) {
    // Can be implemented in subclasses
  };

  BaseAdapter.prototype.destroy = function () {
    // Can be implemented in subclasses
  };

  BaseAdapter.prototype.generateResultId = function (container, data) {
    var id = container.id + '-result-';

    id += Utils.generateChars(4);

    if (data.id != null) {
      id += '-' + data.id.toString();
    } else {
      id += '-' + Utils.generateChars(4);
    }
    return id;
  };

  return BaseAdapter;
});

S2.define('select2/data/select',[
  './base',
  '../utils',
  'jquery'
], function (BaseAdapter, Utils, $) {
  function SelectAdapter ($element, options) {
    this.$element = $element;
    this.options = options;

    SelectAdapter.__super__.constructor.call(this);
  }

  Utils.Extend(SelectAdapter, BaseAdapter);

  SelectAdapter.prototype.current = function (callback) {
    var data = [];
    var self = this;

    this.$element.find(':selected').each(function () {
      var $option = $(this);

      var option = self.item($option);

      data.push(option);
    });

    callback(data);
  };

  SelectAdapter.prototype.select = function (data) {
    var self = this;

    data.selected = true;

    // If data.element is a DOM node, use it instead
    if ($(data.element).is('option')) {
      data.element.selected = true;

      this.$element.trigger('input').trigger('change');

      return;
    }

    if (this.$element.prop('multiple')) {
      this.current(function (currentData) {
        var val = [];

        data = [data];
        data.push.apply(data, currentData);

        for (var d = 0; d < data.length; d++) {
          var id = data[d].id;

          if ($.inArray(id, val) === -1) {
            val.push(id);
          }
        }

        self.$element.val(val);
        self.$element.trigger('input').trigger('change');
      });
    } else {
      var val = data.id;

      this.$element.val(val);
      this.$element.trigger('input').trigger('change');
    }
  };

  SelectAdapter.prototype.unselect = function (data) {
    var self = this;

    if (!this.$element.prop('multiple')) {
      return;
    }

    data.selected = false;

    if ($(data.element).is('option')) {
      data.element.selected = false;

      this.$element.trigger('input').trigger('change');

      return;
    }

    this.current(function (currentData) {
      var val = [];

      for (var d = 0; d < currentData.length; d++) {
        var id = currentData[d].id;

        if (id !== data.id && $.inArray(id, val) === -1) {
          val.push(id);
        }
      }

      self.$element.val(val);

      self.$element.trigger('input').trigger('change');
    });
  };

  SelectAdapter.prototype.bind = function (container, $container) {
    var self = this;

    this.container = container;

    container.on('select', function (params) {
      self.select(params.data);
    });

    container.on('unselect', function (params) {
      self.unselect(params.data);
    });
  };

  SelectAdapter.prototype.destroy = function () {
    // Remove anything added to child elements
    this.$element.find('*').each(function () {
      // Remove any custom data set by Select2
      Utils.RemoveData(this);
    });
  };

  SelectAdapter.prototype.query = function (params, callback) {
    var data = [];
    var self = this;

    var $options = this.$element.children();

    $options.each(function () {
      var $option = $(this);

      if (!$option.is('option') && !$option.is('optgroup')) {
        return;
      }

      var option = self.item($option);

      var matches = self.matches(params, option);

      if (matches !== null) {
        data.push(matches);
      }
    });

    callback({
      results: data
    });
  };

  SelectAdapter.prototype.addOptions = function ($options) {
    Utils.appendMany(this.$element, $options);
  };

  SelectAdapter.prototype.option = function (data) {
    var option;

    if (data.children) {
      option = document.createElement('optgroup');
      option.label = data.text;
    } else {
      option = document.createElement('option');

      if (option.textContent !== undefined) {
        option.textContent = data.text;
      } else {
        option.innerText = data.text;
      }
    }

    if (data.id !== undefined) {
      option.value = data.id;
    }

    if (data.disabled) {
      option.disabled = true;
    }

    if (data.selected) {
      option.selected = true;
    }

    if (data.title) {
      option.title = data.title;
    }

    var $option = $(option);

    var normalizedData = this._normalizeItem(data);
    normalizedData.element = option;

    // Override the option's data with the combined data
    Utils.StoreData(option, 'data', normalizedData);

    return $option;
  };

  SelectAdapter.prototype.item = function ($option) {
    var data = {};

    data = Utils.GetData($option[0], 'data');

    if (data != null) {
      return data;
    }

    if ($option.is('option')) {
      data = {
        id: $option.val(),
        text: $option.text(),
        disabled: $option.prop('disabled'),
        selected: $option.prop('selected'),
        title: $option.prop('title')
      };
    } else if ($option.is('optgroup')) {
      data = {
        text: $option.prop('label'),
        children: [],
        title: $option.prop('title')
      };

      var $children = $option.children('option');
      var children = [];

      for (var c = 0; c < $children.length; c++) {
        var $child = $($children[c]);

        var child = this.item($child);

        children.push(child);
      }

      data.children = children;
    }

    data = this._normalizeItem(data);
    data.element = $option[0];

    Utils.StoreData($option[0], 'data', data);

    return data;
  };

  SelectAdapter.prototype._normalizeItem = function (item) {
    if (item !== Object(item)) {
      item = {
        id: item,
        text: item
      };
    }

    item = $.extend({}, {
      text: ''
    }, item);

    var defaults = {
      selected: false,
      disabled: false
    };

    if (item.id != null) {
      item.id = item.id.toString();
    }

    if (item.text != null) {
      item.text = item.text.toString();
    }

    if (item._resultId == null && item.id && this.container != null) {
      item._resultId = this.generateResultId(this.container, item);
    }

    return $.extend({}, defaults, item);
  };

  SelectAdapter.prototype.matches = function (params, data) {
    var matcher = this.options.get('matcher');

    return matcher(params, data);
  };

  return SelectAdapter;
});

S2.define('select2/data/array',[
  './select',
  '../utils',
  'jquery'
], function (SelectAdapter, Utils, $) {
  function ArrayAdapter ($element, options) {
    this._dataToConvert = options.get('data') || [];

    ArrayAdapter.__super__.constructor.call(this, $element, options);
  }

  Utils.Extend(ArrayAdapter, SelectAdapter);

  ArrayAdapter.prototype.bind = function (container, $container) {
    ArrayAdapter.__super__.bind.call(this, container, $container);

    this.addOptions(this.convertToOptions(this._dataToConvert));
  };

  ArrayAdapter.prototype.select = function (data) {
    var $option = this.$element.find('option').filter(function (i, elm) {
      return elm.value == data.id.toString();
    });

    if ($option.length === 0) {
      $option = this.option(data);

      this.addOptions($option);
    }

    ArrayAdapter.__super__.select.call(this, data);
  };

  ArrayAdapter.prototype.convertToOptions = function (data) {
    var self = this;

    var $existing = this.$element.find('option');
    var existingIds = $existing.map(function () {
      return self.item($(this)).id;
    }).get();

    var $options = [];

    // Filter out all items except for the one passed in the argument
    function onlyItem (item) {
      return function () {
        return $(this).val() == item.id;
      };
    }

    for (var d = 0; d < data.length; d++) {
      var item = this._normalizeItem(data[d]);

      // Skip items which were pre-loaded, only merge the data
      if ($.inArray(item.id, existingIds) >= 0) {
        var $existingOption = $existing.filter(onlyItem(item));

        var existingData = this.item($existingOption);
        var newData = $.extend(true, {}, item, existingData);

        var $newOption = this.option(newData);

        $existingOption.replaceWith($newOption);

        continue;
      }

      var $option = this.option(item);

      if (item.children) {
        var $children = this.convertToOptions(item.children);

        Utils.appendMany($option, $children);
      }

      $options.push($option);
    }

    return $options;
  };

  return ArrayAdapter;
});

S2.define('select2/data/ajax',[
  './array',
  '../utils',
  'jquery'
], function (ArrayAdapter, Utils, $) {
  function AjaxAdapter ($element, options) {
    this.ajaxOptions = this._applyDefaults(options.get('ajax'));

    if (this.ajaxOptions.processResults != null) {
      this.processResults = this.ajaxOptions.processResults;
    }

    AjaxAdapter.__super__.constructor.call(this, $element, options);
  }

  Utils.Extend(AjaxAdapter, ArrayAdapter);

  AjaxAdapter.prototype._applyDefaults = function (options) {
    var defaults = {
      data: function (params) {
        return $.extend({}, params, {
          q: params.term
        });
      },
      transport: function (params, success, failure) {
        var $request = $.ajax(params);

        $request.then(success);
        $request.fail(failure);

        return $request;
      }
    };

    return $.extend({}, defaults, options, true);
  };

  AjaxAdapter.prototype.processResults = function (results) {
    return results;
  };

  AjaxAdapter.prototype.query = function (params, callback) {
    var matches = [];
    var self = this;

    if (this._request != null) {
      // JSONP requests cannot always be aborted
      if ($.isFunction(this._request.abort)) {
        this._request.abort();
      }

      this._request = null;
    }

    var options = $.extend({
      type: 'GET'
    }, this.ajaxOptions);

    if (typeof options.url === 'function') {
      options.url = options.url.call(this.$element, params);
    }

    if (typeof options.data === 'function') {
      options.data = options.data.call(this.$element, params);
    }

    function request () {
      var $request = options.transport(options, function (data) {
        var results = self.processResults(data, params);

        if (self.options.get('debug') && window.console && console.error) {
          // Check to make sure that the response included a `results` key.
          if (!results || !results.results || !$.isArray(results.results)) {
            console.error(
              'Select2: The AJAX results did not return an array in the ' +
              '`results` key of the response.'
            );
          }
        }

        callback(results);
      }, function () {
        // Attempt to detect if a request was aborted
        // Only works if the transport exposes a status property
        if ('status' in $request &&
            ($request.status === 0 || $request.status === '0')) {
          return;
        }

        self.trigger('results:message', {
          message: 'errorLoading'
        });
      });

      self._request = $request;
    }

    if (this.ajaxOptions.delay && params.term != null) {
      if (this._queryTimeout) {
        window.clearTimeout(this._queryTimeout);
      }

      this._queryTimeout = window.setTimeout(request, this.ajaxOptions.delay);
    } else {
      request();
    }
  };

  return AjaxAdapter;
});

S2.define('select2/data/tags',[
  'jquery'
], function ($) {
  function Tags (decorated, $element, options) {
    var tags = options.get('tags');

    var createTag = options.get('createTag');

    if (createTag !== undefined) {
      this.createTag = createTag;
    }

    var insertTag = options.get('insertTag');

    if (insertTag !== undefined) {
        this.insertTag = insertTag;
    }

    decorated.call(this, $element, options);

    if ($.isArray(tags)) {
      for (var t = 0; t < tags.length; t++) {
        var tag = tags[t];
        var item = this._normalizeItem(tag);

        var $option = this.option(item);

        this.$element.append($option);
      }
    }
  }

  Tags.prototype.query = function (decorated, params, callback) {
    var self = this;

    this._removeOldTags();

    if (params.term == null || params.page != null) {
      decorated.call(this, params, callback);
      return;
    }

    function wrapper (obj, child) {
      var data = obj.results;

      for (var i = 0; i < data.length; i++) {
        var option = data[i];

        var checkChildren = (
          option.children != null &&
          !wrapper({
            results: option.children
          }, true)
        );

        var optionText = (option.text || '').toUpperCase();
        var paramsTerm = (params.term || '').toUpperCase();

        var checkText = optionText === paramsTerm;

        if (checkText || checkChildren) {
          if (child) {
            return false;
          }

          obj.data = data;
          callback(obj);

          return;
        }
      }

      if (child) {
        return true;
      }

      var tag = self.createTag(params);

      if (tag != null) {
        var $option = self.option(tag);
        $option.attr('data-select2-tag', true);

        self.addOptions([$option]);

        self.insertTag(data, tag);
      }

      obj.results = data;

      callback(obj);
    }

    decorated.call(this, params, wrapper);
  };

  Tags.prototype.createTag = function (decorated, params) {
    var term = $.trim(params.term);

    if (term === '') {
      return null;
    }

    return {
      id: term,
      text: term
    };
  };

  Tags.prototype.insertTag = function (_, data, tag) {
    data.unshift(tag);
  };

  Tags.prototype._removeOldTags = function (_) {
    var $options = this.$element.find('option[data-select2-tag]');

    $options.each(function () {
      if (this.selected) {
        return;
      }

      $(this).remove();
    });
  };

  return Tags;
});

S2.define('select2/data/tokenizer',[
  'jquery'
], function ($) {
  function Tokenizer (decorated, $element, options) {
    var tokenizer = options.get('tokenizer');

    if (tokenizer !== undefined) {
      this.tokenizer = tokenizer;
    }

    decorated.call(this, $element, options);
  }

  Tokenizer.prototype.bind = function (decorated, container, $container) {
    decorated.call(this, container, $container);

    this.$search =  container.dropdown.$search || container.selection.$search ||
      $container.find('.select2-search__field');
  };

  Tokenizer.prototype.query = function (decorated, params, callback) {
    var self = this;

    function createAndSelect (data) {
      // Normalize the data object so we can use it for checks
      var item = self._normalizeItem(data);

      // Check if the data object already exists as a tag
      // Select it if it doesn't
      var $existingOptions = self.$element.find('option').filter(function () {
        return $(this).val() === item.id;
      });

      // If an existing option wasn't found for it, create the option
      if (!$existingOptions.length) {
        var $option = self.option(item);
        $option.attr('data-select2-tag', true);

        self._removeOldTags();
        self.addOptions([$option]);
      }

      // Select the item, now that we know there is an option for it
      select(item);
    }

    function select (data) {
      self.trigger('select', {
        data: data
      });
    }

    params.term = params.term || '';

    var tokenData = this.tokenizer(params, this.options, createAndSelect);

    if (tokenData.term !== params.term) {
      // Replace the search term if we have the search box
      if (this.$search.length) {
        this.$search.val(tokenData.term);
        this.$search.trigger('focus');
      }

      params.term = tokenData.term;
    }

    decorated.call(this, params, callback);
  };

  Tokenizer.prototype.tokenizer = function (_, params, options, callback) {
    var separators = options.get('tokenSeparators') || [];
    var term = params.term;
    var i = 0;

    var createTag = this.createTag || function (params) {
      return {
        id: params.term,
        text: params.term
      };
    };

    while (i < term.length) {
      var termChar = term[i];

      if ($.inArray(termChar, separators) === -1) {
        i++;

        continue;
      }

      var part = term.substr(0, i);
      var partParams = $.extend({}, params, {
        term: part
      });

      var data = createTag(partParams);

      if (data == null) {
        i++;
        continue;
      }

      callback(data);

      // Reset the term to not include the tokenized portion
      term = term.substr(i + 1) || '';
      i = 0;
    }

    return {
      term: term
    };
  };

  return Tokenizer;
});

S2.define('select2/data/minimumInputLength',[

], function () {
  function MinimumInputLength (decorated, $e, options) {
    this.minimumInputLength = options.get('minimumInputLength');

    decorated.call(this, $e, options);
  }

  MinimumInputLength.prototype.query = function (decorated, params, callback) {
    params.term = params.term || '';

    if (params.term.length < this.minimumInputLength) {
      this.trigger('results:message', {
        message: 'inputTooShort',
        args: {
          minimum: this.minimumInputLength,
          input: params.term,
          params: params
        }
      });

      return;
    }

    decorated.call(this, params, callback);
  };

  return MinimumInputLength;
});

S2.define('select2/data/maximumInputLength',[

], function () {
  function MaximumInputLength (decorated, $e, options) {
    this.maximumInputLength = options.get('maximumInputLength');

    decorated.call(this, $e, options);
  }

  MaximumInputLength.prototype.query = function (decorated, params, callback) {
    params.term = params.term || '';

    if (this.maximumInputLength > 0 &&
        params.term.length > this.maximumInputLength) {
      this.trigger('results:message', {
        message: 'inputTooLong',
        args: {
          maximum: this.maximumInputLength,
          input: params.term,
          params: params
        }
      });

      return;
    }

    decorated.call(this, params, callback);
  };

  return MaximumInputLength;
});

S2.define('select2/data/maximumSelectionLength',[

], function (){
  function MaximumSelectionLength (decorated, $e, options) {
    this.maximumSelectionLength = options.get('maximumSelectionLength');

    decorated.call(this, $e, options);
  }

  MaximumSelectionLength.prototype.bind =
    function (decorated, container, $container) {
      var self = this;

      decorated.call(this, container, $container);

      container.on('select', function () {
        self._checkIfMaximumSelected();
      });
  };

  MaximumSelectionLength.prototype.query =
    function (decorated, params, callback) {
      var self = this;

      this._checkIfMaximumSelected(function () {
        decorated.call(self, params, callback);
      });
  };

  MaximumSelectionLength.prototype._checkIfMaximumSelected =
    function (_, successCallback) {
      var self = this;

      this.current(function (currentData) {
        var count = currentData != null ? currentData.length : 0;
        if (self.maximumSelectionLength > 0 &&
          count >= self.maximumSelectionLength) {
          self.trigger('results:message', {
            message: 'maximumSelected',
            args: {
              maximum: self.maximumSelectionLength
            }
          });
          return;
        }

        if (successCallback) {
          successCallback();
        }
      });
  };

  return MaximumSelectionLength;
});

S2.define('select2/dropdown',[
  'jquery',
  './utils'
], function ($, Utils) {
  function Dropdown ($element, options) {
    this.$element = $element;
    this.options = options;

    Dropdown.__super__.constructor.call(this);
  }

  Utils.Extend(Dropdown, Utils.Observable);

  Dropdown.prototype.render = function () {
    var $dropdown = $(
      '<span class="select2-dropdown">' +
        '<span class="select2-results"></span>' +
      '</span>'
    );

    $dropdown.attr('dir', this.options.get('dir'));

    this.$dropdown = $dropdown;

    return $dropdown;
  };

  Dropdown.prototype.bind = function () {
    // Should be implemented in subclasses
  };

  Dropdown.prototype.position = function ($dropdown, $container) {
    // Should be implemented in subclasses
  };

  Dropdown.prototype.destroy = function () {
    // Remove the dropdown from the DOM
    this.$dropdown.remove();
  };

  return Dropdown;
});

S2.define('select2/dropdown/search',[
  'jquery',
  '../utils'
], function ($, Utils) {
  function Search () { }

  Search.prototype.render = function (decorated) {
    var $rendered = decorated.call(this);

    var $search = $(
      '<span class="select2-search select2-search--dropdown">' +
        '<input class="select2-search__field" type="search" tabindex="-1"' +
        ' autocomplete="off" autocorrect="off" autocapitalize="none"' +
        ' spellcheck="false" role="searchbox" aria-autocomplete="list" />' +
      '</span>'
    );

    this.$searchContainer = $search;
    this.$search = $search.find('input');

    $rendered.prepend($search);

    return $rendered;
  };

  Search.prototype.bind = function (decorated, container, $container) {
    var self = this;

    var resultsId = container.id + '-results';

    decorated.call(this, container, $container);

    this.$search.on('keydown', function (evt) {
      self.trigger('keypress', evt);

      self._keyUpPrevented = evt.isDefaultPrevented();
    });

    // Workaround for browsers which do not support the `input` event
    // This will prevent double-triggering of events for browsers which support
    // both the `keyup` and `input` events.
    this.$search.on('input', function (evt) {
      // Unbind the duplicated `keyup` event
      $(this).off('keyup');
    });

    this.$search.on('keyup input', function (evt) {
      self.handleSearch(evt);
    });

    container.on('open', function () {
      self.$search.attr('tabindex', 0);
      self.$search.attr('aria-controls', resultsId);

      self.$search.trigger('focus');

      window.setTimeout(function () {
        self.$search.trigger('focus');
      }, 0);
    });

    container.on('close', function () {
      self.$search.attr('tabindex', -1);
      self.$search.removeAttr('aria-controls');
      self.$search.removeAttr('aria-activedescendant');

      self.$search.val('');
      self.$search.trigger('blur');
    });

    container.on('focus', function () {
      if (!container.isOpen()) {
        self.$search.trigger('focus');
      }
    });

    container.on('results:all', function (params) {
      if (params.query.term == null || params.query.term === '') {
        var showSearch = self.showSearch(params);

        if (showSearch) {
          self.$searchContainer.removeClass('select2-search--hide');
        } else {
          self.$searchContainer.addClass('select2-search--hide');
        }
      }
    });

    container.on('results:focus', function (params) {
      if (params.data._resultId) {
        self.$search.attr('aria-activedescendant', params.data._resultId);
      } else {
        self.$search.removeAttr('aria-activedescendant');
      }
    });
  };

  Search.prototype.handleSearch = function (evt) {
    if (!this._keyUpPrevented) {
      var input = this.$search.val();

      this.trigger('query', {
        term: input
      });
    }

    this._keyUpPrevented = false;
  };

  Search.prototype.showSearch = function (_, params) {
    return true;
  };

  return Search;
});

S2.define('select2/dropdown/hidePlaceholder',[

], function () {
  function HidePlaceholder (decorated, $element, options, dataAdapter) {
    this.placeholder = this.normalizePlaceholder(options.get('placeholder'));

    decorated.call(this, $element, options, dataAdapter);
  }

  HidePlaceholder.prototype.append = function (decorated, data) {
    data.results = this.removePlaceholder(data.results);

    decorated.call(this, data);
  };

  HidePlaceholder.prototype.normalizePlaceholder = function (_, placeholder) {
    if (typeof placeholder === 'string') {
      placeholder = {
        id: '',
        text: placeholder
      };
    }

    return placeholder;
  };

  HidePlaceholder.prototype.removePlaceholder = function (_, data) {
    var modifiedData = data.slice(0);

    for (var d = data.length - 1; d >= 0; d--) {
      var item = data[d];

      if (this.placeholder.id === item.id) {
        modifiedData.splice(d, 1);
      }
    }

    return modifiedData;
  };

  return HidePlaceholder;
});

S2.define('select2/dropdown/infiniteScroll',[
  'jquery'
], function ($) {
  function InfiniteScroll (decorated, $element, options, dataAdapter) {
    this.lastParams = {};

    decorated.call(this, $element, options, dataAdapter);

    this.$loadingMore = this.createLoadingMore();
    this.loading = false;
  }

  InfiniteScroll.prototype.append = function (decorated, data) {
    this.$loadingMore.remove();
    this.loading = false;

    decorated.call(this, data);

    if (this.showLoadingMore(data)) {
      this.$results.append(this.$loadingMore);
      this.loadMoreIfNeeded();
    }
  };

  InfiniteScroll.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    container.on('query', function (params) {
      self.lastParams = params;
      self.loading = true;
    });

    container.on('query:append', function (params) {
      self.lastParams = params;
      self.loading = true;
    });

    this.$results.on('scroll', this.loadMoreIfNeeded.bind(this));
  };

  InfiniteScroll.prototype.loadMoreIfNeeded = function () {
    var isLoadMoreVisible = $.contains(
      document.documentElement,
      this.$loadingMore[0]
    );

    if (this.loading || !isLoadMoreVisible) {
      return;
    }

    var currentOffset = this.$results.offset().top +
      this.$results.outerHeight(false);
    var loadingMoreOffset = this.$loadingMore.offset().top +
      this.$loadingMore.outerHeight(false);

    if (currentOffset + 50 >= loadingMoreOffset) {
      this.loadMore();
    }
  };

  InfiniteScroll.prototype.loadMore = function () {
    this.loading = true;

    var params = $.extend({}, {page: 1}, this.lastParams);

    params.page++;

    this.trigger('query:append', params);
  };

  InfiniteScroll.prototype.showLoadingMore = function (_, data) {
    return data.pagination && data.pagination.more;
  };

  InfiniteScroll.prototype.createLoadingMore = function () {
    var $option = $(
      '<li ' +
      'class="select2-results__option select2-results__option--load-more"' +
      'role="option" aria-disabled="true"></li>'
    );

    var message = this.options.get('translations').get('loadingMore');

    $option.html(message(this.lastParams));

    return $option;
  };

  return InfiniteScroll;
});

S2.define('select2/dropdown/attachBody',[
  'jquery',
  '../utils'
], function ($, Utils) {
  function AttachBody (decorated, $element, options) {
    this.$dropdownParent = $(options.get('dropdownParent') || document.body);

    decorated.call(this, $element, options);
  }

  AttachBody.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    container.on('open', function () {
      self._showDropdown();
      self._attachPositioningHandler(container);

      // Must bind after the results handlers to ensure correct sizing
      self._bindContainerResultHandlers(container);
    });

    container.on('close', function () {
      self._hideDropdown();
      self._detachPositioningHandler(container);
    });

    this.$dropdownContainer.on('mousedown', function (evt) {
      evt.stopPropagation();
    });
  };

  AttachBody.prototype.destroy = function (decorated) {
    decorated.call(this);

    this.$dropdownContainer.remove();
  };

  AttachBody.prototype.position = function (decorated, $dropdown, $container) {
    // Clone all of the container classes
    $dropdown.attr('class', $container.attr('class'));

    $dropdown.removeClass('select2');
    $dropdown.addClass('select2-container--open');

    $dropdown.css({
      position: 'absolute',
      top: -999999
    });

    this.$container = $container;
  };

  AttachBody.prototype.render = function (decorated) {
    var $container = $('<span></span>');

    var $dropdown = decorated.call(this);
    $container.append($dropdown);

    this.$dropdownContainer = $container;

    return $container;
  };

  AttachBody.prototype._hideDropdown = function (decorated) {
    this.$dropdownContainer.detach();
  };

  AttachBody.prototype._bindContainerResultHandlers =
      function (decorated, container) {

    // These should only be bound once
    if (this._containerResultsHandlersBound) {
      return;
    }

    var self = this;

    container.on('results:all', function () {
      self._positionDropdown();
      self._resizeDropdown();
    });

    container.on('results:append', function () {
      self._positionDropdown();
      self._resizeDropdown();
    });

    container.on('results:message', function () {
      self._positionDropdown();
      self._resizeDropdown();
    });

    container.on('select', function () {
      self._positionDropdown();
      self._resizeDropdown();
    });

    container.on('unselect', function () {
      self._positionDropdown();
      self._resizeDropdown();
    });

    this._containerResultsHandlersBound = true;
  };

  AttachBody.prototype._attachPositioningHandler =
      function (decorated, container) {
    var self = this;

    var scrollEvent = 'scroll.select2.' + container.id;
    var resizeEvent = 'resize.select2.' + container.id;
    var orientationEvent = 'orientationchange.select2.' + container.id;

    var $watchers = this.$container.parents().filter(Utils.hasScroll);
    $watchers.each(function () {
      Utils.StoreData(this, 'select2-scroll-position', {
        x: $(this).scrollLeft(),
        y: $(this).scrollTop()
      });
    });

    $watchers.on(scrollEvent, function (ev) {
      var position = Utils.GetData(this, 'select2-scroll-position');
      $(this).scrollTop(position.y);
    });

    $(window).on(scrollEvent + ' ' + resizeEvent + ' ' + orientationEvent,
      function (e) {
      self._positionDropdown();
      self._resizeDropdown();
    });
  };

  AttachBody.prototype._detachPositioningHandler =
      function (decorated, container) {
    var scrollEvent = 'scroll.select2.' + container.id;
    var resizeEvent = 'resize.select2.' + container.id;
    var orientationEvent = 'orientationchange.select2.' + container.id;

    var $watchers = this.$container.parents().filter(Utils.hasScroll);
    $watchers.off(scrollEvent);

    $(window).off(scrollEvent + ' ' + resizeEvent + ' ' + orientationEvent);
  };

  AttachBody.prototype._positionDropdown = function () {
    var $window = $(window);

    var isCurrentlyAbove = this.$dropdown.hasClass('select2-dropdown--above');
    var isCurrentlyBelow = this.$dropdown.hasClass('select2-dropdown--below');

    var newDirection = null;

    var offset = this.$container.offset();

    offset.bottom = offset.top + this.$container.outerHeight(false);

    var container = {
      height: this.$container.outerHeight(false)
    };

    container.top = offset.top;
    container.bottom = offset.top + container.height;

    var dropdown = {
      height: this.$dropdown.outerHeight(false)
    };

    var viewport = {
      top: $window.scrollTop(),
      bottom: $window.scrollTop() + $window.height()
    };

    var enoughRoomAbove = viewport.top < (offset.top - dropdown.height);
    var enoughRoomBelow = viewport.bottom > (offset.bottom + dropdown.height);

    var css = {
      left: offset.left,
      top: container.bottom
    };

    // Determine what the parent element is to use for calculating the offset
    var $offsetParent = this.$dropdownParent;

    // For statically positioned elements, we need to get the element
    // that is determining the offset
    if ($offsetParent.css('position') === 'static') {
      $offsetParent = $offsetParent.offsetParent();
    }

    var parentOffset = {
      top: 0,
      left: 0
    };

    if (
      $.contains(document.body, $offsetParent[0]) ||
      $offsetParent[0].isConnected
      ) {
      parentOffset = $offsetParent.offset();
    }

    css.top -= parentOffset.top;
    css.left -= parentOffset.left;

    if (!isCurrentlyAbove && !isCurrentlyBelow) {
      newDirection = 'below';
    }

    if (!enoughRoomBelow && enoughRoomAbove && !isCurrentlyAbove) {
      newDirection = 'above';
    } else if (!enoughRoomAbove && enoughRoomBelow && isCurrentlyAbove) {
      newDirection = 'below';
    }

    if (newDirection == 'above' ||
      (isCurrentlyAbove && newDirection !== 'below')) {
      css.top = container.top - parentOffset.top - dropdown.height;
    }

    if (newDirection != null) {
      this.$dropdown
        .removeClass('select2-dropdown--below select2-dropdown--above')
        .addClass('select2-dropdown--' + newDirection);
      this.$container
        .removeClass('select2-container--below select2-container--above')
        .addClass('select2-container--' + newDirection);
    }

    this.$dropdownContainer.css(css);
  };

  AttachBody.prototype._resizeDropdown = function () {
    var css = {
      width: this.$container.outerWidth(false) + 'px'
    };

    if (this.options.get('dropdownAutoWidth')) {
      css.minWidth = css.width;
      css.position = 'relative';
      css.width = 'auto';
    }

    this.$dropdown.css(css);
  };

  AttachBody.prototype._showDropdown = function (decorated) {
    this.$dropdownContainer.appendTo(this.$dropdownParent);

    this._positionDropdown();
    this._resizeDropdown();
  };

  return AttachBody;
});

S2.define('select2/dropdown/minimumResultsForSearch',[

], function () {
  function countResults (data) {
    var count = 0;

    for (var d = 0; d < data.length; d++) {
      var item = data[d];

      if (item.children) {
        count += countResults(item.children);
      } else {
        count++;
      }
    }

    return count;
  }

  function MinimumResultsForSearch (decorated, $element, options, dataAdapter) {
    this.minimumResultsForSearch = options.get('minimumResultsForSearch');

    if (this.minimumResultsForSearch < 0) {
      this.minimumResultsForSearch = Infinity;
    }

    decorated.call(this, $element, options, dataAdapter);
  }

  MinimumResultsForSearch.prototype.showSearch = function (decorated, params) {
    if (countResults(params.data.results) < this.minimumResultsForSearch) {
      return false;
    }

    return decorated.call(this, params);
  };

  return MinimumResultsForSearch;
});

S2.define('select2/dropdown/selectOnClose',[
  '../utils'
], function (Utils) {
  function SelectOnClose () { }

  SelectOnClose.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    container.on('close', function (params) {
      self._handleSelectOnClose(params);
    });
  };

  SelectOnClose.prototype._handleSelectOnClose = function (_, params) {
    if (params && params.originalSelect2Event != null) {
      var event = params.originalSelect2Event;

      // Don't select an item if the close event was triggered from a select or
      // unselect event
      if (event._type === 'select' || event._type === 'unselect') {
        return;
      }
    }

    var $highlightedResults = this.getHighlightedResults();

    // Only select highlighted results
    if ($highlightedResults.length < 1) {
      return;
    }

    var data = Utils.GetData($highlightedResults[0], 'data');

    // Don't re-select already selected resulte
    if (
      (data.element != null && data.element.selected) ||
      (data.element == null && data.selected)
    ) {
      return;
    }

    this.trigger('select', {
        data: data
    });
  };

  return SelectOnClose;
});

S2.define('select2/dropdown/closeOnSelect',[

], function () {
  function CloseOnSelect () { }

  CloseOnSelect.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    container.on('select', function (evt) {
      self._selectTriggered(evt);
    });

    container.on('unselect', function (evt) {
      self._selectTriggered(evt);
    });
  };

  CloseOnSelect.prototype._selectTriggered = function (_, evt) {
    var originalEvent = evt.originalEvent;

    // Don't close if the control key is being held
    if (originalEvent && (originalEvent.ctrlKey || originalEvent.metaKey)) {
      return;
    }

    this.trigger('close', {
      originalEvent: originalEvent,
      originalSelect2Event: evt
    });
  };

  return CloseOnSelect;
});

S2.define('select2/i18n/en',[],function () {
  // English
  return {
    errorLoading: function () {
      return 'The results could not be loaded.';
    },
    inputTooLong: function (args) {
      var overChars = args.input.length - args.maximum;

      var message = 'Please delete ' + overChars + ' character';

      if (overChars != 1) {
        message += 's';
      }

      return message;
    },
    inputTooShort: function (args) {
      var remainingChars = args.minimum - args.input.length;

      var message = 'Please enter ' + remainingChars + ' or more characters';

      return message;
    },
    loadingMore: function () {
      return 'Loading more results…';
    },
    maximumSelected: function (args) {
      var message = 'You can only select ' + args.maximum + ' item';

      if (args.maximum != 1) {
        message += 's';
      }

      return message;
    },
    noResults: function () {
      return 'No results found';
    },
    searching: function () {
      return 'Searching…';
    },
    removeAllItems: function () {
      return 'Remove all items';
    }
  };
});

S2.define('select2/defaults',[
  'jquery',
  'require',

  './results',

  './selection/single',
  './selection/multiple',
  './selection/placeholder',
  './selection/allowClear',
  './selection/search',
  './selection/eventRelay',

  './utils',
  './translation',
  './diacritics',

  './data/select',
  './data/array',
  './data/ajax',
  './data/tags',
  './data/tokenizer',
  './data/minimumInputLength',
  './data/maximumInputLength',
  './data/maximumSelectionLength',

  './dropdown',
  './dropdown/search',
  './dropdown/hidePlaceholder',
  './dropdown/infiniteScroll',
  './dropdown/attachBody',
  './dropdown/minimumResultsForSearch',
  './dropdown/selectOnClose',
  './dropdown/closeOnSelect',

  './i18n/en'
], function ($, require,

             ResultsList,

             SingleSelection, MultipleSelection, Placeholder, AllowClear,
             SelectionSearch, EventRelay,

             Utils, Translation, DIACRITICS,

             SelectData, ArrayData, AjaxData, Tags, Tokenizer,
             MinimumInputLength, MaximumInputLength, MaximumSelectionLength,

             Dropdown, DropdownSearch, HidePlaceholder, InfiniteScroll,
             AttachBody, MinimumResultsForSearch, SelectOnClose, CloseOnSelect,

             EnglishTranslation) {
  function Defaults () {
    this.reset();
  }

  Defaults.prototype.apply = function (options) {
    options = $.extend(true, {}, this.defaults, options);

    if (options.dataAdapter == null) {
      if (options.ajax != null) {
        options.dataAdapter = AjaxData;
      } else if (options.data != null) {
        options.dataAdapter = ArrayData;
      } else {
        options.dataAdapter = SelectData;
      }

      if (options.minimumInputLength > 0) {
        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          MinimumInputLength
        );
      }

      if (options.maximumInputLength > 0) {
        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          MaximumInputLength
        );
      }

      if (options.maximumSelectionLength > 0) {
        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          MaximumSelectionLength
        );
      }

      if (options.tags) {
        options.dataAdapter = Utils.Decorate(options.dataAdapter, Tags);
      }

      if (options.tokenSeparators != null || options.tokenizer != null) {
        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          Tokenizer
        );
      }

      if (options.query != null) {
        var Query = require(options.amdBase + 'compat/query');

        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          Query
        );
      }

      if (options.initSelection != null) {
        var InitSelection = require(options.amdBase + 'compat/initSelection');

        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          InitSelection
        );
      }
    }

    if (options.resultsAdapter == null) {
      options.resultsAdapter = ResultsList;

      if (options.ajax != null) {
        options.resultsAdapter = Utils.Decorate(
          options.resultsAdapter,
          InfiniteScroll
        );
      }

      if (options.placeholder != null) {
        options.resultsAdapter = Utils.Decorate(
          options.resultsAdapter,
          HidePlaceholder
        );
      }

      if (options.selectOnClose) {
        options.resultsAdapter = Utils.Decorate(
          options.resultsAdapter,
          SelectOnClose
        );
      }
    }

    if (options.dropdownAdapter == null) {
      if (options.multiple) {
        options.dropdownAdapter = Dropdown;
      } else {
        var SearchableDropdown = Utils.Decorate(Dropdown, DropdownSearch);

        options.dropdownAdapter = SearchableDropdown;
      }

      if (options.minimumResultsForSearch !== 0) {
        options.dropdownAdapter = Utils.Decorate(
          options.dropdownAdapter,
          MinimumResultsForSearch
        );
      }

      if (options.closeOnSelect) {
        options.dropdownAdapter = Utils.Decorate(
          options.dropdownAdapter,
          CloseOnSelect
        );
      }

      if (
        options.dropdownCssClass != null ||
        options.dropdownCss != null ||
        options.adaptDropdownCssClass != null
      ) {
        var DropdownCSS = require(options.amdBase + 'compat/dropdownCss');

        options.dropdownAdapter = Utils.Decorate(
          options.dropdownAdapter,
          DropdownCSS
        );
      }

      options.dropdownAdapter = Utils.Decorate(
        options.dropdownAdapter,
        AttachBody
      );
    }

    if (options.selectionAdapter == null) {
      if (options.multiple) {
        options.selectionAdapter = MultipleSelection;
      } else {
        options.selectionAdapter = SingleSelection;
      }

      // Add the placeholder mixin if a placeholder was specified
      if (options.placeholder != null) {
        options.selectionAdapter = Utils.Decorate(
          options.selectionAdapter,
          Placeholder
        );
      }

      if (options.allowClear) {
        options.selectionAdapter = Utils.Decorate(
          options.selectionAdapter,
          AllowClear
        );
      }

      if (options.multiple) {
        options.selectionAdapter = Utils.Decorate(
          options.selectionAdapter,
          SelectionSearch
        );
      }

      if (
        options.containerCssClass != null ||
        options.containerCss != null ||
        options.adaptContainerCssClass != null
      ) {
        var ContainerCSS = require(options.amdBase + 'compat/containerCss');

        options.selectionAdapter = Utils.Decorate(
          options.selectionAdapter,
          ContainerCSS
        );
      }

      options.selectionAdapter = Utils.Decorate(
        options.selectionAdapter,
        EventRelay
      );
    }

    // If the defaults were not previously applied from an element, it is
    // possible for the language option to have not been resolved
    options.language = this._resolveLanguage(options.language);

    // Always fall back to English since it will always be complete
    options.language.push('en');

    var uniqueLanguages = [];

    for (var l = 0; l < options.language.length; l++) {
      var language = options.language[l];

      if (uniqueLanguages.indexOf(language) === -1) {
        uniqueLanguages.push(language);
      }
    }

    options.language = uniqueLanguages;

    options.translations = this._processTranslations(
      options.language,
      options.debug
    );

    return options;
  };

  Defaults.prototype.reset = function () {
    function stripDiacritics (text) {
      // Used 'uni range + named function' from http://jsperf.com/diacritics/18
      function match(a) {
        return DIACRITICS[a] || a;
      }

      return text.replace(/[^\u0000-\u007E]/g, match);
    }

    function matcher (params, data) {
      // Always return the object if there is nothing to compare
      if ($.trim(params.term) === '') {
        return data;
      }

      // Do a recursive check for options with children
      if (data.children && data.children.length > 0) {
        // Clone the data object if there are children
        // This is required as we modify the object to remove any non-matches
        var match = $.extend(true, {}, data);

        // Check each child of the option
        for (var c = data.children.length - 1; c >= 0; c--) {
          var child = data.children[c];

          var matches = matcher(params, child);

          // If there wasn't a match, remove the object in the array
          if (matches == null) {
            match.children.splice(c, 1);
          }
        }

        // If any children matched, return the new object
        if (match.children.length > 0) {
          return match;
        }

        // If there were no matching children, check just the plain object
        return matcher(params, match);
      }

      var original = stripDiacritics(data.text).toUpperCase();
      var term = stripDiacritics(params.term).toUpperCase();

      // Check if the text contains the term
      if (original.indexOf(term) > -1) {
        return data;
      }

      // If it doesn't contain the term, don't return anything
      return null;
    }

    this.defaults = {
      amdBase: './',
      amdLanguageBase: './i18n/',
      closeOnSelect: true,
      debug: false,
      dropdownAutoWidth: false,
      escapeMarkup: Utils.escapeMarkup,
      language: {},
      matcher: matcher,
      minimumInputLength: 0,
      maximumInputLength: 0,
      maximumSelectionLength: 0,
      minimumResultsForSearch: 0,
      selectOnClose: false,
      scrollAfterSelect: false,
      sorter: function (data) {
        return data;
      },
      templateResult: function (result) {
        return result.text;
      },
      templateSelection: function (selection) {
        return selection.text;
      },
      theme: 'default',
      width: 'resolve'
    };
  };

  Defaults.prototype.applyFromElement = function (options, $element) {
    var optionLanguage = options.language;
    var defaultLanguage = this.defaults.language;
    var elementLanguage = $element.prop('lang');
    var parentLanguage = $element.closest('[lang]').prop('lang');

    var languages = Array.prototype.concat.call(
      this._resolveLanguage(elementLanguage),
      this._resolveLanguage(optionLanguage),
      this._resolveLanguage(defaultLanguage),
      this._resolveLanguage(parentLanguage)
    );

    options.language = languages;

    return options;
  };

  Defaults.prototype._resolveLanguage = function (language) {
    if (!language) {
      return [];
    }

    if ($.isEmptyObject(language)) {
      return [];
    }

    if ($.isPlainObject(language)) {
      return [language];
    }

    var languages;

    if (!$.isArray(language)) {
      languages = [language];
    } else {
      languages = language;
    }

    var resolvedLanguages = [];

    for (var l = 0; l < languages.length; l++) {
      resolvedLanguages.push(languages[l]);

      if (typeof languages[l] === 'string' && languages[l].indexOf('-') > 0) {
        // Extract the region information if it is included
        var languageParts = languages[l].split('-');
        var baseLanguage = languageParts[0];

        resolvedLanguages.push(baseLanguage);
      }
    }

    return resolvedLanguages;
  };

  Defaults.prototype._processTranslations = function (languages, debug) {
    var translations = new Translation();

    for (var l = 0; l < languages.length; l++) {
      var languageData = new Translation();

      var language = languages[l];

      if (typeof language === 'string') {
        try {
          // Try to load it with the original name
          languageData = Translation.loadPath(language);
        } catch (e) {
          try {
            // If we couldn't load it, check if it wasn't the full path
            language = this.defaults.amdLanguageBase + language;
            languageData = Translation.loadPath(language);
          } catch (ex) {
            // The translation could not be loaded at all. Sometimes this is
            // because of a configuration problem, other times this can be
            // because of how Select2 helps load all possible translation files
            if (debug && window.console && console.warn) {
              console.warn(
                'Select2: The language file for "' + language + '" could ' +
                'not be automatically loaded. A fallback will be used instead.'
              );
            }
          }
        }
      } else if ($.isPlainObject(language)) {
        languageData = new Translation(language);
      } else {
        languageData = language;
      }

      translations.extend(languageData);
    }

    return translations;
  };

  Defaults.prototype.set = function (key, value) {
    var camelKey = $.camelCase(key);

    var data = {};
    data[camelKey] = value;

    var convertedData = Utils._convertData(data);

    $.extend(true, this.defaults, convertedData);
  };

  var defaults = new Defaults();

  return defaults;
});

S2.define('select2/options',[
  'require',
  'jquery',
  './defaults',
  './utils'
], function (require, $, Defaults, Utils) {
  function Options (options, $element) {
    this.options = options;

    if ($element != null) {
      this.fromElement($element);
    }

    if ($element != null) {
      this.options = Defaults.applyFromElement(this.options, $element);
    }

    this.options = Defaults.apply(this.options);

    if ($element && $element.is('input')) {
      var InputCompat = require(this.get('amdBase') + 'compat/inputData');

      this.options.dataAdapter = Utils.Decorate(
        this.options.dataAdapter,
        InputCompat
      );
    }
  }

  Options.prototype.fromElement = function ($e) {
    var excludedData = ['select2'];

    if (this.options.multiple == null) {
      this.options.multiple = $e.prop('multiple');
    }

    if (this.options.disabled == null) {
      this.options.disabled = $e.prop('disabled');
    }

    if (this.options.dir == null) {
      if ($e.prop('dir')) {
        this.options.dir = $e.prop('dir');
      } else if ($e.closest('[dir]').prop('dir')) {
        this.options.dir = $e.closest('[dir]').prop('dir');
      } else {
        this.options.dir = 'ltr';
      }
    }

    $e.prop('disabled', this.options.disabled);
    $e.prop('multiple', this.options.multiple);

    if (Utils.GetData($e[0], 'select2Tags')) {
      if (this.options.debug && window.console && console.warn) {
        console.warn(
          'Select2: The `data-select2-tags` attribute has been changed to ' +
          'use the `data-data` and `data-tags="true"` attributes and will be ' +
          'removed in future versions of Select2.'
        );
      }

      Utils.StoreData($e[0], 'data', Utils.GetData($e[0], 'select2Tags'));
      Utils.StoreData($e[0], 'tags', true);
    }

    if (Utils.GetData($e[0], 'ajaxUrl')) {
      if (this.options.debug && window.console && console.warn) {
        console.warn(
          'Select2: The `data-ajax-url` attribute has been changed to ' +
          '`data-ajax--url` and support for the old attribute will be removed' +
          ' in future versions of Select2.'
        );
      }

      $e.attr('ajax--url', Utils.GetData($e[0], 'ajaxUrl'));
      Utils.StoreData($e[0], 'ajax-Url', Utils.GetData($e[0], 'ajaxUrl'));
    }

    var dataset = {};

    function upperCaseLetter(_, letter) {
      return letter.toUpperCase();
    }

    // Pre-load all of the attributes which are prefixed with `data-`
    for (var attr = 0; attr < $e[0].attributes.length; attr++) {
      var attributeName = $e[0].attributes[attr].name;
      var prefix = 'data-';

      if (attributeName.substr(0, prefix.length) == prefix) {
        // Get the contents of the attribute after `data-`
        var dataName = attributeName.substring(prefix.length);

        // Get the data contents from the consistent source
        // This is more than likely the jQuery data helper
        var dataValue = Utils.GetData($e[0], dataName);

        // camelCase the attribute name to match the spec
        var camelDataName = dataName.replace(/-([a-z])/g, upperCaseLetter);

        // Store the data attribute contents into the dataset since
        dataset[camelDataName] = dataValue;
      }
    }

    // Prefer the element's `dataset` attribute if it exists
    // jQuery 1.x does not correctly handle data attributes with multiple dashes
    if ($.fn.jquery && $.fn.jquery.substr(0, 2) == '1.' && $e[0].dataset) {
      dataset = $.extend(true, {}, $e[0].dataset, dataset);
    }

    // Prefer our internal data cache if it exists
    var data = $.extend(true, {}, Utils.GetData($e[0]), dataset);

    data = Utils._convertData(data);

    for (var key in data) {
      if ($.inArray(key, excludedData) > -1) {
        continue;
      }

      if ($.isPlainObject(this.options[key])) {
        $.extend(this.options[key], data[key]);
      } else {
        this.options[key] = data[key];
      }
    }

    return this;
  };

  Options.prototype.get = function (key) {
    return this.options[key];
  };

  Options.prototype.set = function (key, val) {
    this.options[key] = val;
  };

  return Options;
});

S2.define('select2/core',[
  'jquery',
  './options',
  './utils',
  './keys'
], function ($, Options, Utils, KEYS) {
  var Select2 = function ($element, options) {
    if (Utils.GetData($element[0], 'select2') != null) {
      Utils.GetData($element[0], 'select2').destroy();
    }

    this.$element = $element;

    this.id = this._generateId($element);

    options = options || {};

    this.options = new Options(options, $element);

    Select2.__super__.constructor.call(this);

    // Set up the tabindex

    var tabindex = $element.attr('tabindex') || 0;
    Utils.StoreData($element[0], 'old-tabindex', tabindex);
    $element.attr('tabindex', '-1');

    // Set up containers and adapters

    var DataAdapter = this.options.get('dataAdapter');
    this.dataAdapter = new DataAdapter($element, this.options);

    var $container = this.render();

    this._placeContainer($container);

    var SelectionAdapter = this.options.get('selectionAdapter');
    this.selection = new SelectionAdapter($element, this.options);
    this.$selection = this.selection.render();

    this.selection.position(this.$selection, $container);

    var DropdownAdapter = this.options.get('dropdownAdapter');
    this.dropdown = new DropdownAdapter($element, this.options);
    this.$dropdown = this.dropdown.render();

    this.dropdown.position(this.$dropdown, $container);

    var ResultsAdapter = this.options.get('resultsAdapter');
    this.results = new ResultsAdapter($element, this.options, this.dataAdapter);
    this.$results = this.results.render();

    this.results.position(this.$results, this.$dropdown);

    // Bind events

    var self = this;

    // Bind the container to all of the adapters
    this._bindAdapters();

    // Register any DOM event handlers
    this._registerDomEvents();

    // Register any internal event handlers
    this._registerDataEvents();
    this._registerSelectionEvents();
    this._registerDropdownEvents();
    this._registerResultsEvents();
    this._registerEvents();

    // Set the initial state
    this.dataAdapter.current(function (initialData) {
      self.trigger('selection:update', {
        data: initialData
      });
    });

    // Hide the original select
    $element.addClass('select2-hidden-accessible');
    $element.attr('aria-hidden', 'true');

    // Synchronize any monitored attributes
    this._syncAttributes();

    Utils.StoreData($element[0], 'select2', this);

    // Ensure backwards compatibility with $element.data('select2').
    $element.data('select2', this);
  };

  Utils.Extend(Select2, Utils.Observable);

  Select2.prototype._generateId = function ($element) {
    var id = '';

    if ($element.attr('id') != null) {
      id = $element.attr('id');
    } else if ($element.attr('name') != null) {
      id = $element.attr('name') + '-' + Utils.generateChars(2);
    } else {
      id = Utils.generateChars(4);
    }

    id = id.replace(/(:|\.|\[|\]|,)/g, '');
    id = 'select2-' + id;

    return id;
  };

  Select2.prototype._placeContainer = function ($container) {
    $container.insertAfter(this.$element);

    var width = this._resolveWidth(this.$element, this.options.get('width'));

    if (width != null) {
      $container.css('width', width);
    }
  };

  Select2.prototype._resolveWidth = function ($element, method) {
    var WIDTH = /^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;

    if (method == 'resolve') {
      var styleWidth = this._resolveWidth($element, 'style');

      if (styleWidth != null) {
        return styleWidth;
      }

      return this._resolveWidth($element, 'element');
    }

    if (method == 'element') {
      var elementWidth = $element.outerWidth(false);

      if (elementWidth <= 0) {
        return 'auto';
      }

      return elementWidth + 'px';
    }

    if (method == 'style') {
      var style = $element.attr('style');

      if (typeof(style) !== 'string') {
        return null;
      }

      var attrs = style.split(';');

      for (var i = 0, l = attrs.length; i < l; i = i + 1) {
        var attr = attrs[i].replace(/\s/g, '');
        var matches = attr.match(WIDTH);

        if (matches !== null && matches.length >= 1) {
          return matches[1];
        }
      }

      return null;
    }

    if (method == 'computedstyle') {
      var computedStyle = window.getComputedStyle($element[0]);

      return computedStyle.width;
    }

    return method;
  };

  Select2.prototype._bindAdapters = function () {
    this.dataAdapter.bind(this, this.$container);
    this.selection.bind(this, this.$container);

    this.dropdown.bind(this, this.$container);
    this.results.bind(this, this.$container);
  };

  Select2.prototype._registerDomEvents = function () {
    var self = this;

    this.$element.on('change.select2', function () {
      self.dataAdapter.current(function (data) {
        self.trigger('selection:update', {
          data: data
        });
      });
    });

    this.$element.on('focus.select2', function (evt) {
      self.trigger('focus', evt);
    });

    this._syncA = Utils.bind(this._syncAttributes, this);
    this._syncS = Utils.bind(this._syncSubtree, this);

    if (this.$element[0].attachEvent) {
      this.$element[0].attachEvent('onpropertychange', this._syncA);
    }

    var observer = window.MutationObserver ||
      window.WebKitMutationObserver ||
      window.MozMutationObserver
    ;

    if (observer != null) {
      this._observer = new observer(function (mutations) {
        self._syncA();
        self._syncS(null, mutations);
      });
      this._observer.observe(this.$element[0], {
        attributes: true,
        childList: true,
        subtree: false
      });
    } else if (this.$element[0].addEventListener) {
      this.$element[0].addEventListener(
        'DOMAttrModified',
        self._syncA,
        false
      );
      this.$element[0].addEventListener(
        'DOMNodeInserted',
        self._syncS,
        false
      );
      this.$element[0].addEventListener(
        'DOMNodeRemoved',
        self._syncS,
        false
      );
    }
  };

  Select2.prototype._registerDataEvents = function () {
    var self = this;

    this.dataAdapter.on('*', function (name, params) {
      self.trigger(name, params);
    });
  };

  Select2.prototype._registerSelectionEvents = function () {
    var self = this;
    var nonRelayEvents = ['toggle', 'focus'];

    this.selection.on('toggle', function () {
      self.toggleDropdown();
    });

    this.selection.on('focus', function (params) {
      self.focus(params);
    });

    this.selection.on('*', function (name, params) {
      if ($.inArray(name, nonRelayEvents) !== -1) {
        return;
      }

      self.trigger(name, params);
    });
  };

  Select2.prototype._registerDropdownEvents = function () {
    var self = this;

    this.dropdown.on('*', function (name, params) {
      self.trigger(name, params);
    });
  };

  Select2.prototype._registerResultsEvents = function () {
    var self = this;

    this.results.on('*', function (name, params) {
      self.trigger(name, params);
    });
  };

  Select2.prototype._registerEvents = function () {
    var self = this;

    this.on('open', function () {
      self.$container.addClass('select2-container--open');
    });

    this.on('close', function () {
      self.$container.removeClass('select2-container--open');
    });

    this.on('enable', function () {
      self.$container.removeClass('select2-container--disabled');
    });

    this.on('disable', function () {
      self.$container.addClass('select2-container--disabled');
    });

    this.on('blur', function () {
      self.$container.removeClass('select2-container--focus');
    });

    this.on('query', function (params) {
      if (!self.isOpen()) {
        self.trigger('open', {});
      }

      this.dataAdapter.query(params, function (data) {
        self.trigger('results:all', {
          data: data,
          query: params
        });
      });
    });

    this.on('query:append', function (params) {
      this.dataAdapter.query(params, function (data) {
        self.trigger('results:append', {
          data: data,
          query: params
        });
      });
    });

    this.on('keypress', function (evt) {
      var key = evt.which;

      if (self.isOpen()) {
        if (key === KEYS.ESC || key === KEYS.TAB ||
            (key === KEYS.UP && evt.altKey)) {
          self.close(evt);

          evt.preventDefault();
        } else if (key === KEYS.ENTER) {
          self.trigger('results:select', {});

          evt.preventDefault();
        } else if ((key === KEYS.SPACE && evt.ctrlKey)) {
          self.trigger('results:toggle', {});

          evt.preventDefault();
        } else if (key === KEYS.UP) {
          self.trigger('results:previous', {});

          evt.preventDefault();
        } else if (key === KEYS.DOWN) {
          self.trigger('results:next', {});

          evt.preventDefault();
        }
      } else {
        if (key === KEYS.ENTER || key === KEYS.SPACE ||
            (key === KEYS.DOWN && evt.altKey)) {
          self.open();

          evt.preventDefault();
        }
      }
    });
  };

  Select2.prototype._syncAttributes = function () {
    this.options.set('disabled', this.$element.prop('disabled'));

    if (this.isDisabled()) {
      if (this.isOpen()) {
        this.close();
      }

      this.trigger('disable', {});
    } else {
      this.trigger('enable', {});
    }
  };

  Select2.prototype._isChangeMutation = function (evt, mutations) {
    var changed = false;
    var self = this;

    // Ignore any mutation events raised for elements that aren't options or
    // optgroups. This handles the case when the select element is destroyed
    if (
      evt && evt.target && (
        evt.target.nodeName !== 'OPTION' && evt.target.nodeName !== 'OPTGROUP'
      )
    ) {
      return;
    }

    if (!mutations) {
      // If mutation events aren't supported, then we can only assume that the
      // change affected the selections
      changed = true;
    } else if (mutations.addedNodes && mutations.addedNodes.length > 0) {
      for (var n = 0; n < mutations.addedNodes.length; n++) {
        var node = mutations.addedNodes[n];

        if (node.selected) {
          changed = true;
        }
      }
    } else if (mutations.removedNodes && mutations.removedNodes.length > 0) {
      changed = true;
    } else if ($.isArray(mutations)) {
      $.each(mutations, function(evt, mutation) {
        if (self._isChangeMutation(evt, mutation)) {
          // We've found a change mutation.
          // Let's escape from the loop and continue
          changed = true;
          return false;
        }
      });
    }
    return changed;
  };

  Select2.prototype._syncSubtree = function (evt, mutations) {
    var changed = this._isChangeMutation(evt, mutations);
    var self = this;

    // Only re-pull the data if we think there is a change
    if (changed) {
      this.dataAdapter.current(function (currentData) {
        self.trigger('selection:update', {
          data: currentData
        });
      });
    }
  };

  /**
   * Override the trigger method to automatically trigger pre-events when
   * there are events that can be prevented.
   */
  Select2.prototype.trigger = function (name, args) {
    var actualTrigger = Select2.__super__.trigger;
    var preTriggerMap = {
      'open': 'opening',
      'close': 'closing',
      'select': 'selecting',
      'unselect': 'unselecting',
      'clear': 'clearing'
    };

    if (args === undefined) {
      args = {};
    }

    if (name in preTriggerMap) {
      var preTriggerName = preTriggerMap[name];
      var preTriggerArgs = {
        prevented: false,
        name: name,
        args: args
      };

      actualTrigger.call(this, preTriggerName, preTriggerArgs);

      if (preTriggerArgs.prevented) {
        args.prevented = true;

        return;
      }
    }

    actualTrigger.call(this, name, args);
  };

  Select2.prototype.toggleDropdown = function () {
    if (this.isDisabled()) {
      return;
    }

    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  };

  Select2.prototype.open = function () {
    if (this.isOpen()) {
      return;
    }

    if (this.isDisabled()) {
      return;
    }

    this.trigger('query', {});
  };

  Select2.prototype.close = function (evt) {
    if (!this.isOpen()) {
      return;
    }

    this.trigger('close', { originalEvent : evt });
  };

  /**
   * Helper method to abstract the "enabled" (not "disabled") state of this
   * object.
   *
   * @return {true} if the instance is not disabled.
   * @return {false} if the instance is disabled.
   */
  Select2.prototype.isEnabled = function () {
    return !this.isDisabled();
  };

  /**
   * Helper method to abstract the "disabled" state of this object.
   *
   * @return {true} if the disabled option is true.
   * @return {false} if the disabled option is false.
   */
  Select2.prototype.isDisabled = function () {
    return this.options.get('disabled');
  };

  Select2.prototype.isOpen = function () {
    return this.$container.hasClass('select2-container--open');
  };

  Select2.prototype.hasFocus = function () {
    return this.$container.hasClass('select2-container--focus');
  };

  Select2.prototype.focus = function (data) {
    // No need to re-trigger focus events if we are already focused
    if (this.hasFocus()) {
      return;
    }

    this.$container.addClass('select2-container--focus');
    this.trigger('focus', {});
  };

  Select2.prototype.enable = function (args) {
    if (this.options.get('debug') && window.console && console.warn) {
      console.warn(
        'Select2: The `select2("enable")` method has been deprecated and will' +
        ' be removed in later Select2 versions. Use $element.prop("disabled")' +
        ' instead.'
      );
    }

    if (args == null || args.length === 0) {
      args = [true];
    }

    var disabled = !args[0];

    this.$element.prop('disabled', disabled);
  };

  Select2.prototype.data = function () {
    if (this.options.get('debug') &&
        arguments.length > 0 && window.console && console.warn) {
      console.warn(
        'Select2: Data can no longer be set using `select2("data")`. You ' +
        'should consider setting the value instead using `$element.val()`.'
      );
    }

    var data = [];

    this.dataAdapter.current(function (currentData) {
      data = currentData;
    });

    return data;
  };

  Select2.prototype.val = function (args) {
    if (this.options.get('debug') && window.console && console.warn) {
      console.warn(
        'Select2: The `select2("val")` method has been deprecated and will be' +
        ' removed in later Select2 versions. Use $element.val() instead.'
      );
    }

    if (args == null || args.length === 0) {
      return this.$element.val();
    }

    var newVal = args[0];

    if ($.isArray(newVal)) {
      newVal = $.map(newVal, function (obj) {
        return obj.toString();
      });
    }

    this.$element.val(newVal).trigger('input').trigger('change');
  };

  Select2.prototype.destroy = function () {
    this.$container.remove();

    if (this.$element[0].detachEvent) {
      this.$element[0].detachEvent('onpropertychange', this._syncA);
    }

    if (this._observer != null) {
      this._observer.disconnect();
      this._observer = null;
    } else if (this.$element[0].removeEventListener) {
      this.$element[0]
        .removeEventListener('DOMAttrModified', this._syncA, false);
      this.$element[0]
        .removeEventListener('DOMNodeInserted', this._syncS, false);
      this.$element[0]
        .removeEventListener('DOMNodeRemoved', this._syncS, false);
    }

    this._syncA = null;
    this._syncS = null;

    this.$element.off('.select2');
    this.$element.attr('tabindex',
    Utils.GetData(this.$element[0], 'old-tabindex'));

    this.$element.removeClass('select2-hidden-accessible');
    this.$element.attr('aria-hidden', 'false');
    Utils.RemoveData(this.$element[0]);
    this.$element.removeData('select2');

    this.dataAdapter.destroy();
    this.selection.destroy();
    this.dropdown.destroy();
    this.results.destroy();

    this.dataAdapter = null;
    this.selection = null;
    this.dropdown = null;
    this.results = null;
  };

  Select2.prototype.render = function () {
    var $container = $(
      '<span class="select2 select2-container">' +
        '<span class="selection"></span>' +
        '<span class="dropdown-wrapper" aria-hidden="true"></span>' +
      '</span>'
    );

    $container.attr('dir', this.options.get('dir'));

    this.$container = $container;

    this.$container.addClass('select2-container--' + this.options.get('theme'));

    Utils.StoreData($container[0], 'element', this.$element);

    return $container;
  };

  return Select2;
});

S2.define('jquery-mousewheel',[
  'jquery'
], function ($) {
  // Used to shim jQuery.mousewheel for non-full builds.
  return $;
});

S2.define('jquery.select2',[
  'jquery',
  'jquery-mousewheel',

  './select2/core',
  './select2/defaults',
  './select2/utils'
], function ($, _, Select2, Defaults, Utils) {
  if ($.fn.select2 == null) {
    // All methods that should return the element
    var thisMethods = ['open', 'close', 'destroy'];

    $.fn.select2 = function (options) {
      options = options || {};

      if (typeof options === 'object') {
        this.each(function () {
          var instanceOptions = $.extend(true, {}, options);

          var instance = new Select2($(this), instanceOptions);
        });

        return this;
      } else if (typeof options === 'string') {
        var ret;
        var args = Array.prototype.slice.call(arguments, 1);

        this.each(function () {
          var instance = Utils.GetData(this, 'select2');

          if (instance == null && window.console && console.error) {
            console.error(
              'The select2(\'' + options + '\') method was called on an ' +
              'element that is not using Select2.'
            );
          }

          ret = instance[options].apply(instance, args);
        });

        // Check if we should be returning `this`
        if ($.inArray(options, thisMethods) > -1) {
          return this;
        }

        return ret;
      } else {
        throw new Error('Invalid arguments for Select2: ' + options);
      }
    };
  }

  if ($.fn.select2.defaults == null) {
    $.fn.select2.defaults = Defaults;
  }

  return Select2;
});

  // Return the AMD loader configuration so it can be used outside of this file
  return {
    define: S2.define,
    require: S2.require
  };
}());

  // Autoload the jQuery bindings
  // We know that all of the modules exist above this, so we're safe
  var select2 = S2.require('jquery.select2');

  // Hold the AMD module references on the jQuery function that was just loaded
  // This allows Select2 to use the internal loader outside of this file, such
  // as in the language files.
  jQuery.fn.select2.amd = S2;

  // Return the Select2 instance for anyone who is importing it.
  return select2;
}));

/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.8.0
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
;(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = (function() {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this, dataSettings;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
                nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function(slider, i) {
                    return $('<button type="button" />').text(i + 1);
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                focusOnChange: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnFocus: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                useTransform: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1000
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                scrolling: false,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                swiping: false,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.focussed = false;
            _.interrupted = false;
            _.hidden = 'hidden';
            _.paused = true;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, settings, dataSettings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;


            _.registerBreakpoints();
            _.init(true);

        }

        return Slick;

    }());

    Slick.prototype.activateADA = function() {
        var _ = this;

        _.$slideTrack.find('.slick-active').attr({
            'aria-hidden': 'false'
        }).find('a, input, button, select').attr({
            'tabindex': '0'
        });

    };

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function(markup, index, addBefore) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }

        _.unload();

        if (typeof(index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function(index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateHeight = function() {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function(targetLeft, callback) {

        var animProps = {},
            _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -(_.currentLeft);
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function(now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                                now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                                now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });

            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function() {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.getNavTarget = function() {

        var _ = this,
            asNavFor = _.options.asNavFor;

        if ( asNavFor && asNavFor !== null ) {
            asNavFor = $(asNavFor).not(_.$slider);
        }

        return asNavFor;

    };

    Slick.prototype.asNavFor = function(index) {

        var _ = this,
            asNavFor = _.getNavTarget();

        if ( asNavFor !== null && typeof asNavFor === 'object' ) {
            asNavFor.each(function() {
                var target = $(this).slick('getSlick');
                if(!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }

    };

    Slick.prototype.applyTransition = function(slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function() {

        var _ = this;

        _.autoPlayClear();

        if ( _.slideCount > _.options.slidesToShow ) {
            _.autoPlayTimer = setInterval( _.autoPlayIterator, _.options.autoplaySpeed );
        }

    };

    Slick.prototype.autoPlayClear = function() {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function() {

        var _ = this,
            slideTo = _.currentSlide + _.options.slidesToScroll;

        if ( !_.paused && !_.interrupted && !_.focussed ) {

            if ( _.options.infinite === false ) {

                if ( _.direction === 1 && ( _.currentSlide + 1 ) === ( _.slideCount - 1 )) {
                    _.direction = 0;
                }

                else if ( _.direction === 0 ) {

                    slideTo = _.currentSlide - _.options.slidesToScroll;

                    if ( _.currentSlide - 1 === 0 ) {
                        _.direction = 1;
                    }

                }

            }

            _.slideHandler( slideTo );

        }

    };

    Slick.prototype.buildArrows = function() {

        var _ = this;

        if (_.options.arrows === true ) {

            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

            if( _.slideCount > _.options.slidesToShow ) {

                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }

                if (_.options.infinite !== true) {
                    _.$prevArrow
                        .addClass('slick-disabled')
                        .attr('aria-disabled', 'true');
                }

            } else {

                _.$prevArrow.add( _.$nextArrow )

                    .addClass('slick-hidden')
                    .attr({
                        'aria-disabled': 'true',
                        'tabindex': '-1'
                    });

            }

        }

    };

    Slick.prototype.buildDots = function() {

        var _ = this,
            i, dot;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$slider.addClass('slick-dotted');

            dot = $('<ul />').addClass(_.options.dotsClass);

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
            }

            _.$dots = dot.appendTo(_.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active');

        }

    };

    Slick.prototype.buildOut = function() {

        var _ = this;

        _.$slides =
            _.$slider
                .children( _.options.slide + ':not(.slick-cloned)')
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        _.$slides.each(function(index, element) {
            $(element)
                .attr('data-slick-index', index)
                .data('originalStyling', $(element).attr('style') || '');
        });

        _.$slider.addClass('slick-slider');

        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
            '<div class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();


        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.buildRows = function() {

        var _ = this, a, b, c, newSlides, numOfSlides, originalSlides,slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if(_.options.rows > 0) {

            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(
                originalSlides.length / slidesPerSection
            );

            for(a = 0; a < numOfSlides; a++){
                var slide = document.createElement('div');
                for(b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for(c = 0; c < _.options.slidesPerRow; c++) {
                        var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }

            _.$slider.empty().append(newSlides);
            _.$slider.children().children().children()
                .css({
                    'width':(100 / _.options.slidesPerRow) + '%',
                    'display': 'inline-block'
                });

        }

    };

    Slick.prototype.checkResponsive = function(initial, forceUpdate) {

        var _ = this,
            breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();

        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if ( _.options.responsive &&
            _.options.responsive.length &&
            _.options.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings,
                                _.breakpointSettings[
                                    targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings,
                            _.breakpointSettings[
                                targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }

            // only trigger breakpoints during an actual break. not on initialize.
            if( !initial && triggerBreakpoint !== false ) {
                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
            }
        }

    };

    Slick.prototype.changeSlide = function(event, dontAnimate) {

        var _ = this,
            $target = $(event.currentTarget),
            indexOffset, slideOffset, unevenOffset;

        // If target is a link, prevent default action.
        if($target.is('a')) {
            event.preventDefault();
        }

        // If target is not the <li> element (ie: a child), find the <li>.
        if(!$target.is('li')) {
            $target = $target.closest('li');
        }

        unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 :
                    event.data.index || $target.index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                $target.children().trigger('focus');
                break;

            default:
                return;
        }

    };

    Slick.prototype.checkNavigable = function(index) {

        var _ = this,
            navigables, prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function() {

        var _ = this;

        if (_.options.dots && _.$dots !== null) {

            $('li', _.$dots)
                .off('click.slick', _.changeSlide)
                .off('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .off('mouseleave.slick', $.proxy(_.interrupt, _, false));

            if (_.options.accessibility === true) {
                _.$dots.off('keydown.slick', _.keyHandler);
            }
        }

        _.$slider.off('focus.slick blur.slick');

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow && _.$prevArrow.off('keydown.slick', _.keyHandler);
                _.$nextArrow && _.$nextArrow.off('keydown.slick', _.keyHandler);
            }
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        $(document).off(_.visibilityChange, _.visibility);

        _.cleanUpSlideEvents();

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.cleanUpSlideEvents = function() {

        var _ = this;

        _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));

    };

    Slick.prototype.cleanUpRows = function() {

        var _ = this, originalSlides;

        if(_.options.rows > 0) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.empty().append(originalSlides);
        }

    };

    Slick.prototype.clickHandler = function(event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }

    };

    Slick.prototype.destroy = function(refresh) {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).detach();

        if (_.$dots) {
            _.$dots.remove();
        }

        if ( _.$prevArrow && _.$prevArrow.length ) {

            _.$prevArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display','');

            if ( _.htmlExpr.test( _.options.prevArrow )) {
                _.$prevArrow.remove();
            }
        }

        if ( _.$nextArrow && _.$nextArrow.length ) {

            _.$nextArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display','');

            if ( _.htmlExpr.test( _.options.nextArrow )) {
                _.$nextArrow.remove();
            }
        }


        if (_.$slides) {

            _.$slides
                .removeClass('slick-slide slick-active slick-center slick-visible slick-current')
                .removeAttr('aria-hidden')
                .removeAttr('data-slick-index')
                .each(function(){
                    $(this).attr('style', $(this).data('originalStyling'));
                });

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.detach();

            _.$list.detach();

            _.$slider.append(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');
        _.$slider.removeClass('slick-dotted');

        _.unslicked = true;

        if(!refresh) {
            _.$slider.trigger('destroy', [_]);
        }

    };

    Slick.prototype.disableTransition = function(slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function(slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });

            if (callback) {
                setTimeout(function() {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.fadeSlideOut = function(slideIndex) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });

        }

    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function(filter) {

        var _ = this;

        if (filter !== null) {

            _.$slidesCache = _.$slides;

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.focusHandler = function() {

        var _ = this;

        _.$slider
            .off('focus.slick blur.slick')
            .on('focus.slick blur.slick', '*', function(event) {

            event.stopImmediatePropagation();
            var $sf = $(this);

            setTimeout(function() {

                if( _.options.pauseOnFocus ) {
                    _.focussed = $sf.is(':focus');
                    _.autoPlay();
                }

            }, 0);

        });
    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function() {

        var _ = this;
        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function() {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            if (_.slideCount <= _.options.slidesToShow) {
                 ++pagerQty;
            } else {
                while (breakPoint < _.slideCount) {
                    ++pagerQty;
                    breakPoint = counter + _.options.slidesToScroll;
                    counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                }
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else if(!_.options.asNavFor) {
            pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
        }else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;

    };

    Slick.prototype.getLeft = function(slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            targetSlide,
            coef;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                coef = -1

                if (_.options.vertical === true && _.options.centerMode === true) {
                    if (_.options.slidesToShow === 2) {
                        coef = -1.5;
                    } else if (_.options.slidesToShow === 1) {
                        coef = -2
                    }
                }
                verticalOffset = (verticalHeight * _.options.slidesToShow) * coef;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;
                        verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;
                    } else {
                        _.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;
                        verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;
                verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.slideCount <= _.options.slidesToShow) {
            _.slideOffset = ((_.slideWidth * Math.floor(_.options.slidesToShow)) / 2) - ((_.slideWidth * _.slideCount) / 2);
        } else if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            if (_.options.rtl === true) {
                if (targetSlide[0]) {
                    targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                } else {
                    targetLeft =  0;
                }
            } else {
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
            }

            if (_.options.centerMode === true) {
                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }

                if (_.options.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft =  0;
                    }
                } else {
                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                }

                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;

    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function(option) {

        var _ = this;

        return _.options[option];

    };

    Slick.prototype.getNavigableIndexes = function() {

        var _ = this,
            breakPoint = 0,
            counter = 0,
            indexes = [],
            max;

        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;

    };

    Slick.prototype.getSlick = function() {

        return this;

    };

    Slick.prototype.getSlideCount = function() {

        var _ = this,
            slidesTraversed, swipedSlide, centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function(index, slide) {
                if (slide.offsetLeft - centerOffset + ($(slide).outerWidth() / 2) > (_.swipeLeft * -1)) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;

        } else {
            return _.options.slidesToScroll;
        }

    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function(slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide)
            }
        }, dontAnimate);

    };

    Slick.prototype.init = function(creation) {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');

            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
            _.checkResponsive(true);
            _.focusHandler();

        }

        if (creation) {
            _.$slider.trigger('init', [_]);
        }

        if (_.options.accessibility === true) {
            _.initADA();
        }

        if ( _.options.autoplay ) {

            _.paused = false;
            _.autoPlay();

        }

    };

    Slick.prototype.initADA = function() {
        var _ = this,
                numDotGroups = Math.ceil(_.slideCount / _.options.slidesToShow),
                tabControlIndexes = _.getNavigableIndexes().filter(function(val) {
                    return (val >= 0) && (val < _.slideCount);
                });

        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        if (_.$dots !== null) {
            _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function(i) {
                var slideControlIndex = tabControlIndexes.indexOf(i);

                $(this).attr({
                    'role': 'tabpanel',
                    'id': 'slick-slide' + _.instanceUid + i,
                    'tabindex': -1
                });

                if (slideControlIndex !== -1) {
                   var ariaButtonControl = 'slick-slide-control' + _.instanceUid + slideControlIndex
                   if ($('#' + ariaButtonControl).length) {
                     $(this).attr({
                         'aria-describedby': ariaButtonControl
                     });
                   }
                }
            });

            _.$dots.attr('role', 'tablist').find('li').each(function(i) {
                var mappedSlideIndex = tabControlIndexes[i];

                $(this).attr({
                    'role': 'presentation'
                });

                $(this).find('button').first().attr({
                    'role': 'tab',
                    'id': 'slick-slide-control' + _.instanceUid + i,
                    'aria-controls': 'slick-slide' + _.instanceUid + mappedSlideIndex,
                    'aria-label': (i + 1) + ' of ' + numDotGroups,
                    'aria-selected': null,
                    'tabindex': '-1'
                });

            }).eq(_.currentSlide).find('button').attr({
                'aria-selected': 'true',
                'tabindex': '0'
            }).end();
        }

        for (var i=_.currentSlide, max=i+_.options.slidesToShow; i < max; i++) {
          if (_.options.focusOnChange) {
            _.$slides.eq(i).attr({'tabindex': '0'});
          } else {
            _.$slides.eq(i).removeAttr('tabindex');
          }
        }

        _.activateADA();

    };

    Slick.prototype.initArrowEvents = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow
               .off('click.slick')
               .on('click.slick', {
                    message: 'previous'
               }, _.changeSlide);
            _.$nextArrow
               .off('click.slick')
               .on('click.slick', {
                    message: 'next'
               }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow.on('keydown.slick', _.keyHandler);
                _.$nextArrow.on('keydown.slick', _.keyHandler);
            }
        }

    };

    Slick.prototype.initDotEvents = function() {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$dots.on('keydown.slick', _.keyHandler);
            }
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.slideCount > _.options.slidesToShow) {

            $('li', _.$dots)
                .on('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initSlideEvents = function() {

        var _ = this;

        if ( _.options.pauseOnHover ) {

            _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
            _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initializeEvents = function() {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();
        _.initSlideEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(_.setPosition);

    };

    Slick.prototype.initUI = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

    };

    Slick.prototype.keyHandler = function(event) {

        var _ = this;
         //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if(!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'next' :  'previous'
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'previous' : 'next'
                    }
                });
            }
        }

    };

    Slick.prototype.lazyLoad = function() {

        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;

        function loadImages(imagesScope) {

            $('img[data-lazy]', imagesScope).each(function() {

                var image = $(this),
                    imageSource = $(this).attr('data-lazy'),
                    imageSrcSet = $(this).attr('data-srcset'),
                    imageSizes  = $(this).attr('data-sizes') || _.$slider.attr('data-sizes'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function() {

                    image
                        .animate({ opacity: 0 }, 100, function() {

                            if (imageSrcSet) {
                                image
                                    .attr('srcset', imageSrcSet );

                                if (imageSizes) {
                                    image
                                        .attr('sizes', imageSizes );
                                }
                            }

                            image
                                .attr('src', imageSource)
                                .animate({ opacity: 1 }, 200, function() {
                                    image
                                        .removeAttr('data-lazy data-srcset data-sizes')
                                        .removeClass('slick-loading');
                                });
                            _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                        });

                };

                imageToLoad.onerror = function() {

                    image
                        .removeAttr( 'data-lazy' )
                        .removeClass( 'slick-loading' )
                        .addClass( 'slick-lazyload-error' );

                    _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);

                };

                imageToLoad.src = imageSource;

            });

        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);

        if (_.options.lazyLoad === 'anticipated') {
            var prevSlide = rangeStart - 1,
                nextSlide = rangeEnd,
                $slides = _.$slider.find('.slick-slide');

            for (var i = 0; i < _.options.slidesToScroll; i++) {
                if (prevSlide < 0) prevSlide = _.slideCount - 1;
                loadRange = loadRange.add($slides.eq(prevSlide));
                loadRange = loadRange.add($slides.eq(nextSlide));
                prevSlide--;
                nextSlide++;
            }
        }

        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else
        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange);
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }

    };

    Slick.prototype.loadSlider = function() {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.next = Slick.prototype.slickNext = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next'
            }
        });

    };

    Slick.prototype.orientationChange = function() {

        var _ = this;

        _.checkResponsive();
        _.setPosition();

    };

    Slick.prototype.pause = Slick.prototype.slickPause = function() {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;

    };

    Slick.prototype.play = Slick.prototype.slickPlay = function() {

        var _ = this;

        _.autoPlay();
        _.options.autoplay = true;
        _.paused = false;
        _.focussed = false;
        _.interrupted = false;

    };

    Slick.prototype.postSlide = function(index) {

        var _ = this;

        if( !_.unslicked ) {

            _.$slider.trigger('afterChange', [_, index]);

            _.animating = false;

            if (_.slideCount > _.options.slidesToShow) {
                _.setPosition();
            }

            _.swipeLeft = null;

            if ( _.options.autoplay ) {
                _.autoPlay();
            }

            if (_.options.accessibility === true) {
                _.initADA();

                if (_.options.focusOnChange) {
                    var $currentSlide = $(_.$slides.get(_.currentSlide));
                    $currentSlide.attr('tabindex', 0).focus();
                }
            }

        }

    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous'
            }
        });

    };

    Slick.prototype.preventDefault = function(event) {

        event.preventDefault();

    };

    Slick.prototype.progressiveLazyLoad = function( tryCount ) {

        tryCount = tryCount || 1;

        var _ = this,
            $imgsToLoad = $( 'img[data-lazy]', _.$slider ),
            image,
            imageSource,
            imageSrcSet,
            imageSizes,
            imageToLoad;

        if ( $imgsToLoad.length ) {

            image = $imgsToLoad.first();
            imageSource = image.attr('data-lazy');
            imageSrcSet = image.attr('data-srcset');
            imageSizes  = image.attr('data-sizes') || _.$slider.attr('data-sizes');
            imageToLoad = document.createElement('img');

            imageToLoad.onload = function() {

                if (imageSrcSet) {
                    image
                        .attr('srcset', imageSrcSet );

                    if (imageSizes) {
                        image
                            .attr('sizes', imageSizes );
                    }
                }

                image
                    .attr( 'src', imageSource )
                    .removeAttr('data-lazy data-srcset data-sizes')
                    .removeClass('slick-loading');

                if ( _.options.adaptiveHeight === true ) {
                    _.setPosition();
                }

                _.$slider.trigger('lazyLoaded', [ _, image, imageSource ]);
                _.progressiveLazyLoad();

            };

            imageToLoad.onerror = function() {

                if ( tryCount < 3 ) {

                    /**
                     * try to load the image 3 times,
                     * leave a slight delay so we don't get
                     * servers blocking the request.
                     */
                    setTimeout( function() {
                        _.progressiveLazyLoad( tryCount + 1 );
                    }, 500 );

                } else {

                    image
                        .removeAttr( 'data-lazy' )
                        .removeClass( 'slick-loading' )
                        .addClass( 'slick-lazyload-error' );

                    _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);

                    _.progressiveLazyLoad();

                }

            };

            imageToLoad.src = imageSource;

        } else {

            _.$slider.trigger('allImagesLoaded', [ _ ]);

        }

    };

    Slick.prototype.refresh = function( initializing ) {

        var _ = this, currentSlide, lastVisibleIndex;

        lastVisibleIndex = _.slideCount - _.options.slidesToShow;

        // in non-infinite sliders, we don't want to go past the
        // last visible index.
        if( !_.options.infinite && ( _.currentSlide > lastVisibleIndex )) {
            _.currentSlide = lastVisibleIndex;
        }

        // if less slides than to show, go to start.
        if ( _.slideCount <= _.options.slidesToShow ) {
            _.currentSlide = 0;

        }

        currentSlide = _.currentSlide;

        _.destroy(true);

        $.extend(_, _.initials, { currentSlide: currentSlide });

        _.init();

        if( !initializing ) {

            _.changeSlide({
                data: {
                    message: 'index',
                    index: currentSlide
                }
            }, false);

        }

    };

    Slick.prototype.registerBreakpoints = function() {

        var _ = this, breakpoint, currentBreakpoint, l,
            responsiveSettings = _.options.responsive || null;

        if ( $.type(responsiveSettings) === 'array' && responsiveSettings.length ) {

            _.respondTo = _.options.respondTo || 'window';

            for ( breakpoint in responsiveSettings ) {

                l = _.breakpoints.length-1;

                if (responsiveSettings.hasOwnProperty(breakpoint)) {
                    currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                    // loop through the breakpoints and cut out any existing
                    // ones with the same breakpoint number, we don't want dupes.
                    while( l >= 0 ) {
                        if( _.breakpoints[l] && _.breakpoints[l] === currentBreakpoint ) {
                            _.breakpoints.splice(l,1);
                        }
                        l--;
                    }

                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;

                }

            }

            _.breakpoints.sort(function(a, b) {
                return ( _.options.mobileFirst ) ? a-b : b-a;
            });

        }

    };

    Slick.prototype.reinit = function() {

        var _ = this;

        _.$slides =
            _.$slideTrack
                .children(_.options.slide)
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.registerBreakpoints();

        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.cleanUpSlideEvents();
        _.initSlideEvents();

        _.checkResponsive(false, true);

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        _.setPosition();
        _.focusHandler();

        _.paused = !_.options.autoplay;
        _.autoPlay();

        _.$slider.trigger('reInit', [_]);

    };

    Slick.prototype.resize = function() {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function() {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if( !_.unslicked ) { _.setPosition(); }
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function(index, removeBefore, removeAll) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function(position) {

        var _ = this,
            positionProps = {},
            x, y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function() {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function() {

        var _ = this,
            targetLeft;

        _.$slides.each(function(index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });

    };

    Slick.prototype.setHeight = function() {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }

    };

    Slick.prototype.setOption =
    Slick.prototype.slickSetOption = function() {

        /**
         * accepts arguments in format of:
         *
         *  - for changing a single option's value:
         *     .slick("setOption", option, value, refresh )
         *
         *  - for changing a set of responsive options:
         *     .slick("setOption", 'responsive', [{}, ...], refresh )
         *
         *  - for updating multiple values at once (not responsive)
         *     .slick("setOption", { 'option': value, ... }, refresh )
         */

        var _ = this, l, item, option, value, refresh = false, type;

        if( $.type( arguments[0] ) === 'object' ) {

            option =  arguments[0];
            refresh = arguments[1];
            type = 'multiple';

        } else if ( $.type( arguments[0] ) === 'string' ) {

            option =  arguments[0];
            value = arguments[1];
            refresh = arguments[2];

            if ( arguments[0] === 'responsive' && $.type( arguments[1] ) === 'array' ) {

                type = 'responsive';

            } else if ( typeof arguments[1] !== 'undefined' ) {

                type = 'single';

            }

        }

        if ( type === 'single' ) {

            _.options[option] = value;


        } else if ( type === 'multiple' ) {

            $.each( option , function( opt, val ) {

                _.options[opt] = val;

            });


        } else if ( type === 'responsive' ) {

            for ( item in value ) {

                if( $.type( _.options.responsive ) !== 'array' ) {

                    _.options.responsive = [ value[item] ];

                } else {

                    l = _.options.responsive.length-1;

                    // loop through the responsive object and splice out duplicates.
                    while( l >= 0 ) {

                        if( _.options.responsive[l].breakpoint === value[item].breakpoint ) {

                            _.options.responsive.splice(l,1);

                        }

                        l--;

                    }

                    _.options.responsive.push( value[item] );

                }

            }

        }

        if ( refresh ) {

            _.unload();
            _.reinit();

        }

    };

    Slick.prototype.setPosition = function() {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);

    };

    Slick.prototype.setProps = function() {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
            bodyStyle.MozTransition !== undefined ||
            bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if ( _.options.fade ) {
            if ( typeof _.options.zIndex === 'number' ) {
                if( _.options.zIndex < 3 ) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);
    };


    Slick.prototype.setSlideClasses = function(index) {

        var _ = this,
            centerOffset, allSlides, indexOffset, remainder;

        allSlides = _.$slider
            .find('.slick-slide')
            .removeClass('slick-active slick-center slick-current')
            .attr('aria-hidden', 'true');

        _.$slides
            .eq(index)
            .addClass('slick-current');

        if (_.options.centerMode === true) {

            var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {
                    _.$slides
                        .slice(index - centerOffset + evenCoef, index + centerOffset + 1)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides
                        .slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

                if (index === 0) {

                    allSlides
                        .eq(allSlides.length - 1 - _.options.slidesToShow)
                        .addClass('slick-center');

                } else if (index === _.slideCount - 1) {

                    allSlides
                        .eq(_.options.slidesToShow)
                        .addClass('slick-center');

                }

            }

            _.$slides
                .eq(index)
                .addClass('slick-center');

        } else {

            if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {

                _.$slides
                    .slice(index, index + _.options.slidesToShow)
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else if (allSlides.length <= _.options.slidesToShow) {

                allSlides
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else {

                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {

                    allSlides
                        .slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    allSlides
                        .slice(indexOffset, indexOffset + _.options.slidesToShow)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

            }

        }

        if (_.options.lazyLoad === 'ondemand' || _.options.lazyLoad === 'anticipated') {
            _.lazyLoad();
        }
    };

    Slick.prototype.setupInfinite = function() {

        var _ = this,
            i, slideIndex, infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > (_.slideCount -
                        infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex - _.slideCount)
                        .prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount  + _.slideCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex + _.slideCount)
                        .appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function() {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.interrupt = function( toggle ) {

        var _ = this;

        if( !toggle ) {
            _.autoPlay();
        }
        _.interrupted = toggle;

    };

    Slick.prototype.selectHandler = function(event) {

        var _ = this;

        var targetElement =
            $(event.target).is('.slick-slide') ?
                $(event.target) :
                $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {

            _.slideHandler(index, false, true);
            return;

        }

        _.slideHandler(index);

    };

    Slick.prototype.slideHandler = function(index, sync, dontAnimate) {

        var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,
            _ = this, navTarget;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if ( _.options.autoplay ) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        if ( _.options.asNavFor ) {

            navTarget = _.getNavTarget();
            navTarget = navTarget.slick('getSlick');

            if ( navTarget.slideCount <= navTarget.options.slidesToShow ) {
                navTarget.setSlideClasses(_.currentSlide);
            }

        }

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {

                _.fadeSlideOut(oldSlide);

                _.fadeSlide(animSlide, function() {
                    _.postSlide(animSlide);
                });

            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
            _.animateSlide(targetLeft, function() {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }

    };

    Slick.prototype.startLoad = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function() {

        var xDist, yDist, r, swipeAngle, _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return (_.options.rtl === false ? 'right' : 'left');
        }
        if (_.options.verticalSwiping === true) {
            if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
                return 'down';
            } else {
                return 'up';
            }
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function(event) {

        var _ = this,
            slideCount,
            direction;

        _.dragging = false;
        _.swiping = false;

        if (_.scrolling) {
            _.scrolling = false;
            return false;
        }

        _.interrupted = false;
        _.shouldClick = ( _.touchObject.swipeLength > 10 ) ? false : true;

        if ( _.touchObject.curX === undefined ) {
            return false;
        }

        if ( _.touchObject.edgeHit === true ) {
            _.$slider.trigger('edge', [_, _.swipeDirection() ]);
        }

        if ( _.touchObject.swipeLength >= _.touchObject.minSwipe ) {

            direction = _.swipeDirection();

            switch ( direction ) {

                case 'left':
                case 'down':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable( _.currentSlide + _.getSlideCount() ) :
                            _.currentSlide + _.getSlideCount();

                    _.currentDirection = 0;

                    break;

                case 'right':
                case 'up':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable( _.currentSlide - _.getSlideCount() ) :
                            _.currentSlide - _.getSlideCount();

                    _.currentDirection = 1;

                    break;

                default:


            }

            if( direction != 'vertical' ) {

                _.slideHandler( slideCount );
                _.touchObject = {};
                _.$slider.trigger('swipe', [_, direction ]);

            }

        } else {

            if ( _.touchObject.startX !== _.touchObject.curX ) {

                _.slideHandler( _.currentSlide );
                _.touchObject = {};

            }

        }

    };

    Slick.prototype.swipeHandler = function(event) {

        var _ = this;

        if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options
            .touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options
                .touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }

    };

    Slick.prototype.swipeMove = function(event) {

        var _ = this,
            edgeWasHit = false,
            curLeft, swipeDirection, swipeLength, positionOffset, touches, verticalSwipeLength;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || _.scrolling || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        verticalSwipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));

        if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {
            _.scrolling = true;
            return false;
        }

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = verticalSwipeLength;
        }

        swipeDirection = _.swipeDirection();

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            _.swiping = true;
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }


        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function(event) {

        var _ = this,
            touches;

        _.interrupted = true;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function() {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function() {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }

        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }

        _.$slides
            .removeClass('slick-slide slick-active slick-visible slick-current')
            .attr('aria-hidden', 'true')
            .css('width', '');

    };

    Slick.prototype.unslick = function(fromBreakpoint) {

        var _ = this;
        _.$slider.trigger('unslick', [_, fromBreakpoint]);
        _.destroy();

    };

    Slick.prototype.updateArrows = function() {

        var _ = this,
            centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if ( _.options.arrows === true &&
            _.slideCount > _.options.slidesToShow &&
            !_.options.infinite ) {

            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            if (_.currentSlide === 0) {

                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            }

        }

    };

    Slick.prototype.updateDots = function() {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots
                .find('li')
                    .removeClass('slick-active')
                    .end();

            _.$dots
                .find('li')
                .eq(Math.floor(_.currentSlide / _.options.slidesToScroll))
                .addClass('slick-active');

        }

    };

    Slick.prototype.visibility = function() {

        var _ = this;

        if ( _.options.autoplay ) {

            if ( document[_.hidden] ) {

                _.interrupted = true;

            } else {

                _.interrupted = false;

            }

        }

    };

    $.fn.slick = function() {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].slick = new Slick(_[i], opt);
            else
                ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

}));

/**
 * @name MarkerClustererPlus for Google Maps V3
 * @version 2.1.2 [May 28, 2014]
 * @author Gary Little
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of markers.
 * <p>
 * This is an enhanced V3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >V2 MarkerClusterer</a> by Xiaoxi Wu. It is based on the
 * <a href="http://google-maps-utility-library-v3.googlecode.com/svn/tags/markerclusterer/"
 * >V3 MarkerClusterer</a> port by Luke Mahe. MarkerClustererPlus was created by Gary Little.
 * <p>
 * v2.0 release: MarkerClustererPlus v2.0 is backward compatible with MarkerClusterer v1.0. It
 *  adds support for the <code>ignoreHidden</code>, <code>title</code>, <code>batchSizeIE</code>,
 *  and <code>calculator</code> properties as well as support for four more events. It also allows
 *  greater control over the styling of the text that appears on the cluster marker. The
 *  documentation has been significantly improved and the overall code has been simplified and
 *  polished. Very large numbers of markers can now be managed without causing Javascript timeout
 *  errors on Internet Explorer. Note that the name of the <code>clusterclick</code> event has been
 *  deprecated. The new name is <code>click</code>, so please change your application code now.
 */

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * @name ClusterIconStyle
 * @class This class represents the object for values in the <code>styles</code> array passed
 *  to the {@link MarkerClusterer} constructor. The element in this array that is used to
 *  style the cluster icon is determined by calling the <code>calculator</code> function.
 *
 * @property {string} url The URL of the cluster icon image file. Required.
 * @property {number} height The display height (in pixels) of the cluster icon. Required.
 * @property {number} width The display width (in pixels) of the cluster icon. Required.
 * @property {Array} [anchorText] The position (in pixels) from the center of the cluster icon to
 *  where the text label is to be centered and drawn. The format is <code>[yoffset, xoffset]</code>
 *  where <code>yoffset</code> increases as you go down from center and <code>xoffset</code>
 *  increases to the right of center. The default is <code>[0, 0]</code>.
 * @property {Array} [anchorIcon] The anchor position (in pixels) of the cluster icon. This is the
 *  spot on the cluster icon that is to be aligned with the cluster position. The format is
 *  <code>[yoffset, xoffset]</code> where <code>yoffset</code> increases as you go down and
 *  <code>xoffset</code> increases to the right of the top-left corner of the icon. The default
 *  anchor position is the center of the cluster icon.
 * @property {string} [textColor="black"] The color of the label text shown on the
 *  cluster icon.
 * @property {number} [textSize=11] The size (in pixels) of the label text shown on the
 *  cluster icon.
 * @property {string} [textDecoration="none"] The value of the CSS <code>text-decoration</code>
 *  property for the label text shown on the cluster icon.
 * @property {string} [fontWeight="bold"] The value of the CSS <code>font-weight</code>
 *  property for the label text shown on the cluster icon.
 * @property {string} [fontStyle="normal"] The value of the CSS <code>font-style</code>
 *  property for the label text shown on the cluster icon.
 * @property {string} [fontFamily="Arial,sans-serif"] The value of the CSS <code>font-family</code>
 *  property for the label text shown on the cluster icon.
 * @property {string} [backgroundPosition="0 0"] The position of the cluster icon image
 *  within the image defined by <code>url</code>. The format is <code>"xpos ypos"</code>
 *  (the same format as for the CSS <code>background-position</code> property). You must set
 *  this property appropriately when the image defined by <code>url</code> represents a sprite
 *  containing multiple images. Note that the position <i>must</i> be specified in px units.
 */
/**
 * @name ClusterIconInfo
 * @class This class is an object containing general information about a cluster icon. This is
 *  the object that a <code>calculator</code> function returns.
 *
 * @property {string} text The text of the label to be shown on the cluster icon.
 * @property {number} index The index plus 1 of the element in the <code>styles</code>
 *  array to be used to style the cluster icon.
 * @property {string} title The tooltip to display when the mouse moves over the cluster icon.
 *  If this value is <code>undefined</code> or <code>""</code>, <code>title</code> is set to the
 *  value of the <code>title</code> property passed to the MarkerClusterer.
 */
/**
 * A cluster icon.
 *
 * @constructor
 * @extends google.maps.OverlayView
 * @param {Cluster} cluster The cluster with which the icon is to be associated.
 * @param {Array} [styles] An array of {@link ClusterIconStyle} defining the cluster icons
 *  to use for various cluster sizes.
 * @private
 */
function ClusterIcon(cluster, styles) {
    cluster.getMarkerClusterer().extend(ClusterIcon, google.maps.OverlayView);

    this.cluster_ = cluster;
    this.className_ = cluster.getMarkerClusterer().getClusterClass();
    this.styles_ = styles;
    this.center_ = null;
    this.div_ = null;
    this.sums_ = null;
    this.visible_ = false;

    this.setMap(cluster.getMap()); // Note: this causes onAdd to be called
}


/**
 * Adds the icon to the DOM.
 */
ClusterIcon.prototype.onAdd = function() {
    var cClusterIcon = this;
    var cMouseDownInCluster;
    var cDraggingMapByCluster;

    this.div_ = document.createElement("div");
    this.div_.className = this.className_;
    if (this.visible_) {
        this.show();
    }

    this.getPanes().overlayMouseTarget.appendChild(this.div_);

    // Fix for Issue 157
    this.boundsChangedListener_ = google.maps.event.addListener(this.getMap(), "bounds_changed", function() {
        cDraggingMapByCluster = cMouseDownInCluster;
    });

    google.maps.event.addDomListener(this.div_, "mousedown", function() {
        cMouseDownInCluster = true;
        cDraggingMapByCluster = false;
    });

    google.maps.event.addDomListener(this.div_, "click", function(e) {
        cMouseDownInCluster = false;
        if (!cDraggingMapByCluster) {
            var theBounds;
            var mz;
            var mc = cClusterIcon.cluster_.getMarkerClusterer();
            /**
             * This event is fired when a cluster marker is clicked.
             * @name MarkerClusterer#click
             * @param {Cluster} c The cluster that was clicked.
             * @event
             */
            google.maps.event.trigger(mc, "click", cClusterIcon.cluster_);
            google.maps.event.trigger(mc, "clusterclick", cClusterIcon.cluster_); // deprecated name

            // The default click handler follows. Disable it by setting
            // the zoomOnClick property to false.
            if (mc.getZoomOnClick()) {
                // Zoom into the cluster.
                mz = mc.getMaxZoom();
                theBounds = cClusterIcon.cluster_.getBounds();
                mc.getMap().fitBounds(theBounds);
                // There is a fix for Issue 170 here:
                setTimeout(function() {
                    mc.getMap().fitBounds(theBounds);
                    // Don't zoom beyond the max zoom level
                    if (mz !== null && (mc.getMap().getZoom() > mz)) {
                        mc.getMap().setZoom(mz + 1);
                    }
                }, 100);
            }

            // Prevent event propagation to the map:
            e.cancelBubble = true;
            if (e.stopPropagation) {
                e.stopPropagation();
            }
        }
    });

    google.maps.event.addDomListener(this.div_, "mouseover", function() {
        var mc = cClusterIcon.cluster_.getMarkerClusterer();
        /**
         * This event is fired when the mouse moves over a cluster marker.
         * @name MarkerClusterer#mouseover
         * @param {Cluster} c The cluster that the mouse moved over.
         * @event
         */
        google.maps.event.trigger(mc, "mouseover", cClusterIcon.cluster_);
    });

    google.maps.event.addDomListener(this.div_, "mouseout", function() {
        var mc = cClusterIcon.cluster_.getMarkerClusterer();
        /**
         * This event is fired when the mouse moves out of a cluster marker.
         * @name MarkerClusterer#mouseout
         * @param {Cluster} c The cluster that the mouse moved out of.
         * @event
         */
        google.maps.event.trigger(mc, "mouseout", cClusterIcon.cluster_);
    });
};


/**
 * Removes the icon from the DOM.
 */
ClusterIcon.prototype.onRemove = function() {
    if (this.div_ && this.div_.parentNode) {
        this.hide();
        google.maps.event.removeListener(this.boundsChangedListener_);
        google.maps.event.clearInstanceListeners(this.div_);
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    }
};


/**
 * Draws the icon.
 */
ClusterIcon.prototype.draw = function() {
    if (this.visible_) {
        var pos = this.getPosFromLatLng_(this.center_);
        this.div_.style.top = pos.y + "px";
        this.div_.style.left = pos.x + "px";
    }
};


/**
 * Hides the icon.
 */
ClusterIcon.prototype.hide = function() {
    if (this.div_) {
        this.div_.style.display = "none";
    }
    this.visible_ = false;
};


/**
 * Positions and shows the icon.
 */
ClusterIcon.prototype.show = function() {
    if (this.div_) {
        var img = "";
        // NOTE: values must be specified in px units
        var bp = this.backgroundPosition_.split(" ");
        var spriteH = parseInt(bp[0].replace(/^\s+|\s+$/g, ""), 10);
        var spriteV = parseInt(bp[1].replace(/^\s+|\s+$/g, ""), 10);
        var pos = this.getPosFromLatLng_(this.center_);
        this.div_.style.cssText = this.createCss(pos);
        img = "<img src='" + this.url_ + "' style='position: absolute; top: " + spriteV + "px; left: " + spriteH + "px; ";
        if (!this.cluster_.getMarkerClusterer().enableRetinaIcons_) {
            img += "clip: rect(" + (-1 * spriteV) + "px, " + ((-1 * spriteH) + this.width_) + "px, " +
                ((-1 * spriteV) + this.height_) + "px, " + (-1 * spriteH) + "px);";
        }
        img += "'>";
        this.div_.innerHTML = img + "<div style='" +
            "position: absolute;" +
            "top: " + this.anchorText_[0] + "px;" +
            "left: " + this.anchorText_[1] + "px;" +
            "color: " + this.textColor_ + ";" +
            "font-size: " + this.textSize_ + "px;" +
            "font-family: " + this.fontFamily_ + ";" +
            "font-weight: " + this.fontWeight_ + ";" +
            "font-style: " + this.fontStyle_ + ";" +
            "text-decoration: " + this.textDecoration_ + ";" +
            "text-align: center;" +
            "width: " + this.width_ + "px;" +
            "line-height:" + this.height_ + "px;" +
            "'>" + this.sums_.text + "</div>";
        if (typeof this.sums_.title === "undefined" || this.sums_.title === "") {
            this.div_.title = this.cluster_.getMarkerClusterer().getTitle();
        } else {
            this.div_.title = this.sums_.title;
        }
        this.div_.style.display = "";
    }
    this.visible_ = true;
};


/**
 * Sets the icon styles to the appropriate element in the styles array.
 *
 * @param {ClusterIconInfo} sums The icon label text and styles index.
 */
ClusterIcon.prototype.useStyle = function(sums) {
    this.sums_ = sums;
    var index = Math.max(0, sums.index - 1);
    index = Math.min(this.styles_.length - 1, index);
    var style = this.styles_[index];
    this.url_ = style.url;
    this.height_ = style.height;
    this.width_ = style.width;
    this.anchorText_ = style.anchorText || [0, 0];
    this.anchorIcon_ = style.anchorIcon || [parseInt(this.height_ / 2, 10), parseInt(this.width_ / 2, 10)];
    this.textColor_ = style.textColor || "black";
    this.textSize_ = style.textSize || 11;
    this.textDecoration_ = style.textDecoration || "none";
    this.fontWeight_ = style.fontWeight || "bold";
    this.fontStyle_ = style.fontStyle || "normal";
    this.fontFamily_ = style.fontFamily || "Arial,sans-serif";
    this.backgroundPosition_ = style.backgroundPosition || "0 0";
};


/**
 * Sets the position at which to center the icon.
 *
 * @param {google.maps.LatLng} center The latlng to set as the center.
 */
ClusterIcon.prototype.setCenter = function(center) {
    this.center_ = center;
};


/**
 * Creates the cssText style parameter based on the position of the icon.
 *
 * @param {google.maps.Point} pos The position of the icon.
 * @return {string} The CSS style text.
 */
ClusterIcon.prototype.createCss = function(pos) {
    var style = [];
    style.push("cursor: pointer;");
    style.push("position: absolute; top: " + pos.y + "px; left: " + pos.x + "px;");
    style.push("width: " + this.width_ + "px; height: " + this.height_ + "px;");
    return style.join("");
};


/**
 * Returns the position at which to place the DIV depending on the latlng.
 *
 * @param {google.maps.LatLng} latlng The position in latlng.
 * @return {google.maps.Point} The position in pixels.
 */
ClusterIcon.prototype.getPosFromLatLng_ = function(latlng) {
    var pos = this.getProjection().fromLatLngToDivPixel(latlng);
    pos.x -= this.anchorIcon_[1];
    pos.y -= this.anchorIcon_[0];
    pos.x = parseInt(pos.x, 10);
    pos.y = parseInt(pos.y, 10);
    return pos;
};


/**
 * Creates a single cluster that manages a group of proximate markers.
 *  Used internally, do not call this constructor directly.
 * @constructor
 * @param {MarkerClusterer} mc The <code>MarkerClusterer</code> object with which this
 *  cluster is associated.
 */
function Cluster(mc) {
    this.markerClusterer_ = mc;
    this.map_ = mc.getMap();
    this.gridSize_ = mc.getGridSize();
    this.minClusterSize_ = mc.getMinimumClusterSize();
    this.averageCenter_ = mc.getAverageCenter();
    this.markers_ = [];
    this.center_ = null;
    this.bounds_ = null;
    this.clusterIcon_ = new ClusterIcon(this, mc.getStyles());
}


/**
 * Returns the number of markers managed by the cluster. You can call this from
 * a <code>click</code>, <code>mouseover</code>, or <code>mouseout</code> event handler
 * for the <code>MarkerClusterer</code> object.
 *
 * @return {number} The number of markers in the cluster.
 */
Cluster.prototype.getSize = function() {
    return this.markers_.length;
};


/**
 * Returns the array of markers managed by the cluster. You can call this from
 * a <code>click</code>, <code>mouseover</code>, or <code>mouseout</code> event handler
 * for the <code>MarkerClusterer</code> object.
 *
 * @return {Array} The array of markers in the cluster.
 */
Cluster.prototype.getMarkers = function() {
    return this.markers_;
};


/**
 * Returns the center of the cluster. You can call this from
 * a <code>click</code>, <code>mouseover</code>, or <code>mouseout</code> event handler
 * for the <code>MarkerClusterer</code> object.
 *
 * @return {google.maps.LatLng} The center of the cluster.
 */
Cluster.prototype.getCenter = function() {
    return this.center_;
};


/**
 * Returns the map with which the cluster is associated.
 *
 * @return {google.maps.Map} The map.
 * @ignore
 */
Cluster.prototype.getMap = function() {
    return this.map_;
};


/**
 * Returns the <code>MarkerClusterer</code> object with which the cluster is associated.
 *
 * @return {MarkerClusterer} The associated marker clusterer.
 * @ignore
 */
Cluster.prototype.getMarkerClusterer = function() {
    return this.markerClusterer_;
};


/**
 * Returns the bounds of the cluster.
 *
 * @return {google.maps.LatLngBounds} the cluster bounds.
 * @ignore
 */
Cluster.prototype.getBounds = function() {
    var i;
    var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
    var markers = this.getMarkers();
    for (i = 0; i < markers.length; i++) {
        bounds.extend(markers[i].getPosition());
    }
    return bounds;
};


/**
 * Removes the cluster from the map.
 *
 * @ignore
 */
Cluster.prototype.remove = function() {
    this.clusterIcon_.setMap(null);
    this.markers_ = [];
    delete this.markers_;
};


/**
 * Adds a marker to the cluster.
 *
 * @param {google.maps.Marker} marker The marker to be added.
 * @return {boolean} True if the marker was added.
 * @ignore
 */
Cluster.prototype.addMarker = function(marker) {
    var i;
    var mCount;
    var mz;

    if (this.isMarkerAlreadyAdded_(marker)) {
        return false;
    }

    if (!this.center_) {
        this.center_ = marker.getPosition();
        this.calculateBounds_();
    } else {
        if (this.averageCenter_) {
            var l = this.markers_.length + 1;
            var lat = (this.center_.lat() * (l - 1) + marker.getPosition().lat()) / l;
            var lng = (this.center_.lng() * (l - 1) + marker.getPosition().lng()) / l;
            this.center_ = new google.maps.LatLng(lat, lng);
            this.calculateBounds_();
        }
    }

    marker.isAdded = true;
    this.markers_.push(marker);

    mCount = this.markers_.length;
    mz = this.markerClusterer_.getMaxZoom();
    if (mz !== null && this.map_.getZoom() > mz) {
        // Zoomed in past max zoom, so show the marker.
        if (marker.getMap() !== this.map_) {
            marker.setMap(this.map_);
        }
    } else if (mCount < this.minClusterSize_) {
        // Min cluster size not reached so show the marker.
        if (marker.getMap() !== this.map_) {
            marker.setMap(this.map_);
        }
    } else if (mCount === this.minClusterSize_) {
        // Hide the markers that were showing.
        for (i = 0; i < mCount; i++) {
            this.markers_[i].setMap(null);
        }
    } else {
        marker.setMap(null);
    }

    this.updateIcon_();
    return true;
};


/**
 * Determines if a marker lies within the cluster's bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker lies in the bounds.
 * @ignore
 */
Cluster.prototype.isMarkerInClusterBounds = function(marker) {
    return this.bounds_.contains(marker.getPosition());
};


/**
 * Calculates the extended bounds of the cluster with the grid.
 */
Cluster.prototype.calculateBounds_ = function() {
    var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
    this.bounds_ = this.markerClusterer_.getExtendedBounds(bounds);
};


/**
 * Updates the cluster icon.
 */
Cluster.prototype.updateIcon_ = function() {
    var mCount = this.markers_.length;
    var mz = this.markerClusterer_.getMaxZoom();

    if (mz !== null && this.map_.getZoom() > mz) {
        this.clusterIcon_.hide();
        return;
    }

    if (mCount < this.minClusterSize_) {
        // Min cluster size not yet reached.
        this.clusterIcon_.hide();
        return;
    }

    var numStyles = this.markerClusterer_.getStyles().length;
    var sums = this.markerClusterer_.getCalculator()(this.markers_, numStyles);
    this.clusterIcon_.setCenter(this.center_);
    this.clusterIcon_.useStyle(sums);
    this.clusterIcon_.show();
};


/**
 * Determines if a marker has already been added to the cluster.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker has already been added.
 */
Cluster.prototype.isMarkerAlreadyAdded_ = function(marker) {
    var i;
    if (this.markers_.indexOf) {
        return this.markers_.indexOf(marker) !== -1;
    } else {
        for (i = 0; i < this.markers_.length; i++) {
            if (marker === this.markers_[i]) {
                return true;
            }
        }
    }
    return false;
};


/**
 * @name MarkerClustererOptions
 * @class This class represents the optional parameter passed to
 *  the {@link MarkerClusterer} constructor.
 * @property {number} [gridSize=60] The grid size of a cluster in pixels. The grid is a square.
 * @property {number} [maxZoom=null] The maximum zoom level at which clustering is enabled or
 *  <code>null</code> if clustering is to be enabled at all zoom levels.
 * @property {boolean} [zoomOnClick=true] Whether to zoom the map when a cluster marker is
 *  clicked. You may want to set this to <code>false</code> if you have installed a handler
 *  for the <code>click</code> event and it deals with zooming on its own.
 * @property {boolean} [averageCenter=false] Whether the position of a cluster marker should be
 *  the average position of all markers in the cluster. If set to <code>false</code>, the
 *  cluster marker is positioned at the location of the first marker added to the cluster.
 * @property {number} [minimumClusterSize=2] The minimum number of markers needed in a cluster
 *  before the markers are hidden and a cluster marker appears.
 * @property {boolean} [ignoreHidden=false] Whether to ignore hidden markers in clusters. You
 *  may want to set this to <code>true</code> to ensure that hidden markers are not included
 *  in the marker count that appears on a cluster marker (this count is the value of the
 *  <code>text</code> property of the result returned by the default <code>calculator</code>).
 *  If set to <code>true</code> and you change the visibility of a marker being clustered, be
 *  sure to also call <code>MarkerClusterer.repaint()</code>.
 * @property {string} [title=""] The tooltip to display when the mouse moves over a cluster
 *  marker. (Alternatively, you can use a custom <code>calculator</code> function to specify a
 *  different tooltip for each cluster marker.)
 * @property {function} [calculator=MarkerClusterer.CALCULATOR] The function used to determine
 *  the text to be displayed on a cluster marker and the index indicating which style to use
 *  for the cluster marker. The input parameters for the function are (1) the array of markers
 *  represented by a cluster marker and (2) the number of cluster icon styles. It returns a
 *  {@link ClusterIconInfo} object. The default <code>calculator</code> returns a
 *  <code>text</code> property which is the number of markers in the cluster and an
 *  <code>index</code> property which is one higher than the lowest integer such that
 *  <code>10^i</code> exceeds the number of markers in the cluster, or the size of the styles
 *  array, whichever is less. The <code>styles</code> array element used has an index of
 *  <code>index</code> minus 1. For example, the default <code>calculator</code> returns a
 *  <code>text</code> value of <code>"125"</code> and an <code>index</code> of <code>3</code>
 *  for a cluster icon representing 125 markers so the element used in the <code>styles</code>
 *  array is <code>2</code>. A <code>calculator</code> may also return a <code>title</code>
 *  property that contains the text of the tooltip to be used for the cluster marker. If
 *   <code>title</code> is not defined, the tooltip is set to the value of the <code>title</code>
 *   property for the MarkerClusterer.
 * @property {string} [clusterClass="cluster"] The name of the CSS class defining general styles
 *  for the cluster markers. Use this class to define CSS styles that are not set up by the code
 *  that processes the <code>styles</code> array.
 * @property {Array} [styles] An array of {@link ClusterIconStyle} elements defining the styles
 *  of the cluster markers to be used. The element to be used to style a given cluster marker
 *  is determined by the function defined by the <code>calculator</code> property.
 *  The default is an array of {@link ClusterIconStyle} elements whose properties are derived
 *  from the values for <code>imagePath</code>, <code>imageExtension</code>, and
 *  <code>imageSizes</code>.
 * @property {boolean} [enableRetinaIcons=false] Whether to allow the use of cluster icons that
 * have sizes that are some multiple (typically double) of their actual display size. Icons such
 * as these look better when viewed on high-resolution monitors such as Apple's Retina displays.
 * Note: if this property is <code>true</code>, sprites cannot be used as cluster icons.
 * @property {number} [batchSize=MarkerClusterer.BATCH_SIZE] Set this property to the
 *  number of markers to be processed in a single batch when using a browser other than
 *  Internet Explorer (for Internet Explorer, use the batchSizeIE property instead).
 * @property {number} [batchSizeIE=MarkerClusterer.BATCH_SIZE_IE] When Internet Explorer is
 *  being used, markers are processed in several batches with a small delay inserted between
 *  each batch in an attempt to avoid Javascript timeout errors. Set this property to the
 *  number of markers to be processed in a single batch; select as high a number as you can
 *  without causing a timeout error in the browser. This number might need to be as low as 100
 *  if 15,000 markers are being managed, for example.
 * @property {string} [imagePath=MarkerClusterer.IMAGE_PATH]
 *  The full URL of the root name of the group of image files to use for cluster icons.
 *  The complete file name is of the form <code>imagePath</code>n.<code>imageExtension</code>
 *  where n is the image file number (1, 2, etc.).
 * @property {string} [imageExtension=MarkerClusterer.IMAGE_EXTENSION]
 *  The extension name for the cluster icon image files (e.g., <code>"png"</code> or
 *  <code>"jpg"</code>).
 * @property {Array} [imageSizes=MarkerClusterer.IMAGE_SIZES]
 *  An array of numbers containing the widths of the group of
 *  <code>imagePath</code>n.<code>imageExtension</code> image files.
 *  (The images are assumed to be square.)
 */
/**
 * Creates a MarkerClusterer object with the options specified in {@link MarkerClustererOptions}.
 * @constructor
 * @extends google.maps.OverlayView
 * @param {google.maps.Map} map The Google map to attach to.
 * @param {Array.<google.maps.Marker>} [opt_markers] The markers to be added to the cluster.
 * @param {MarkerClustererOptions} [opt_options] The optional parameters.
 */
function MarkerClusterer(map, opt_markers, opt_options) {
    // MarkerClusterer implements google.maps.OverlayView interface. We use the
    // extend function to extend MarkerClusterer with google.maps.OverlayView
    // because it might not always be available when the code is defined so we
    // look for it at the last possible moment. If it doesn't exist now then
    // there is no point going ahead :)
    this.extend(MarkerClusterer, google.maps.OverlayView);

    opt_markers = opt_markers || [];
    opt_options = opt_options || {};

    this.markers_ = [];
    this.clusters_ = [];
    this.listeners_ = [];
    this.activeMap_ = null;
    this.ready_ = false;

    this.gridSize_ = opt_options.gridSize || 60;
    this.minClusterSize_ = opt_options.minimumClusterSize || 2;
    this.maxZoom_ = opt_options.maxZoom || null;
    this.styles_ = opt_options.styles || [];
    this.title_ = opt_options.title || "";
    this.zoomOnClick_ = true;
    if (opt_options.zoomOnClick !== undefined) {
        this.zoomOnClick_ = opt_options.zoomOnClick;
    }
    this.averageCenter_ = false;
    if (opt_options.averageCenter !== undefined) {
        this.averageCenter_ = opt_options.averageCenter;
    }
    this.ignoreHidden_ = false;
    if (opt_options.ignoreHidden !== undefined) {
        this.ignoreHidden_ = opt_options.ignoreHidden;
    }
    this.enableRetinaIcons_ = false;
    if (opt_options.enableRetinaIcons !== undefined) {
        this.enableRetinaIcons_ = opt_options.enableRetinaIcons;
    }
    this.imagePath_ = opt_options.imagePath || MarkerClusterer.IMAGE_PATH;
    this.imageExtension_ = opt_options.imageExtension || MarkerClusterer.IMAGE_EXTENSION;
    this.imageSizes_ = opt_options.imageSizes || MarkerClusterer.IMAGE_SIZES;
    this.calculator_ = opt_options.calculator || MarkerClusterer.CALCULATOR;
    this.batchSize_ = opt_options.batchSize || MarkerClusterer.BATCH_SIZE;
    this.batchSizeIE_ = opt_options.batchSizeIE || MarkerClusterer.BATCH_SIZE_IE;
    this.clusterClass_ = opt_options.clusterClass || "cluster";

    if (navigator.userAgent.toLowerCase().indexOf("msie") !== -1) {
        // Try to avoid IE timeout when processing a huge number of markers:
        this.batchSize_ = this.batchSizeIE_;
    }

    this.setupStyles_();

    this.addMarkers(opt_markers, true);
    this.setMap(map); // Note: this causes onAdd to be called
}


/**
 * Implementation of the onAdd interface method.
 * @ignore
 */
MarkerClusterer.prototype.onAdd = function() {
    var cMarkerClusterer = this;

    this.activeMap_ = this.getMap();
    this.ready_ = true;

    this.repaint();

    // Add the map event listeners
    this.listeners_ = [
        google.maps.event.addListener(this.getMap(), "zoom_changed", function() {
            cMarkerClusterer.resetViewport_(false);
            // Workaround for this Google bug: when map is at level 0 and "-" of
            // zoom slider is clicked, a "zoom_changed" event is fired even though
            // the map doesn't zoom out any further. In this situation, no "idle"
            // event is triggered so the cluster markers that have been removed
            // do not get redrawn. Same goes for a zoom in at maxZoom.
            if (this.getZoom() === (this.get("minZoom") || 0) || this.getZoom() === this.get("maxZoom")) {
                google.maps.event.trigger(this, "idle");
            }
        }),
        google.maps.event.addListener(this.getMap(), "idle", function() {
            cMarkerClusterer.redraw_();
        })
    ];
};


/**
 * Implementation of the onRemove interface method.
 * Removes map event listeners and all cluster icons from the DOM.
 * All managed markers are also put back on the map.
 * @ignore
 */
MarkerClusterer.prototype.onRemove = function() {
    var i;

    // Put all the managed markers back on the map:
    for (i = 0; i < this.markers_.length; i++) {
        if (this.markers_[i].getMap() !== this.activeMap_) {
            this.markers_[i].setMap(this.activeMap_);
        }
    }

    // Remove all clusters:
    for (i = 0; i < this.clusters_.length; i++) {
        this.clusters_[i].remove();
    }
    this.clusters_ = [];

    // Remove map event listeners:
    for (i = 0; i < this.listeners_.length; i++) {
        google.maps.event.removeListener(this.listeners_[i]);
    }
    this.listeners_ = [];

    this.activeMap_ = null;
    this.ready_ = false;
};


/**
 * Implementation of the draw interface method.
 * @ignore
 */
MarkerClusterer.prototype.draw = function() {};


/**
 * Sets up the styles object.
 */
MarkerClusterer.prototype.setupStyles_ = function() {
    var i, size;
    if (this.styles_.length > 0) {
        return;
    }

    for (i = 0; i < this.imageSizes_.length; i++) {
        size = this.imageSizes_[i];
        this.styles_.push({
            url: this.imagePath_ + (i + 1) + "." + this.imageExtension_,
            height: size,
            width: size
        });
    }
};


/**
 *  Fits the map to the bounds of the markers managed by the clusterer.
 */
MarkerClusterer.prototype.fitMapToMarkers = function() {
    var i;
    var markers = this.getMarkers();
    var bounds = new google.maps.LatLngBounds();
    for (i = 0; i < markers.length; i++) {
        bounds.extend(markers[i].getPosition());
    }

    this.getMap().fitBounds(bounds);
};


/**
 * Returns the value of the <code>gridSize</code> property.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getGridSize = function() {
    return this.gridSize_;
};


/**
 * Sets the value of the <code>gridSize</code> property.
 *
 * @param {number} gridSize The grid size.
 */
MarkerClusterer.prototype.setGridSize = function(gridSize) {
    this.gridSize_ = gridSize;
};


/**
 * Returns the value of the <code>minimumClusterSize</code> property.
 *
 * @return {number} The minimum cluster size.
 */
MarkerClusterer.prototype.getMinimumClusterSize = function() {
    return this.minClusterSize_;
};

/**
 * Sets the value of the <code>minimumClusterSize</code> property.
 *
 * @param {number} minimumClusterSize The minimum cluster size.
 */
MarkerClusterer.prototype.setMinimumClusterSize = function(minimumClusterSize) {
    this.minClusterSize_ = minimumClusterSize;
};


/**
 *  Returns the value of the <code>maxZoom</code> property.
 *
 *  @return {number} The maximum zoom level.
 */
MarkerClusterer.prototype.getMaxZoom = function() {
    return this.maxZoom_;
};


/**
 *  Sets the value of the <code>maxZoom</code> property.
 *
 *  @param {number} maxZoom The maximum zoom level.
 */
MarkerClusterer.prototype.setMaxZoom = function(maxZoom) {
    this.maxZoom_ = maxZoom;
};


/**
 *  Returns the value of the <code>styles</code> property.
 *
 *  @return {Array} The array of styles defining the cluster markers to be used.
 */
MarkerClusterer.prototype.getStyles = function() {
    return this.styles_;
};


/**
 *  Sets the value of the <code>styles</code> property.
 *
 *  @param {Array.<ClusterIconStyle>} styles The array of styles to use.
 */
MarkerClusterer.prototype.setStyles = function(styles) {
    this.styles_ = styles;
};


/**
 * Returns the value of the <code>title</code> property.
 *
 * @return {string} The content of the title text.
 */
MarkerClusterer.prototype.getTitle = function() {
    return this.title_;
};


/**
 *  Sets the value of the <code>title</code> property.
 *
 *  @param {string} title The value of the title property.
 */
MarkerClusterer.prototype.setTitle = function(title) {
    this.title_ = title;
};


/**
 * Returns the value of the <code>zoomOnClick</code> property.
 *
 * @return {boolean} True if zoomOnClick property is set.
 */
MarkerClusterer.prototype.getZoomOnClick = function() {
    return this.zoomOnClick_;
};


/**
 *  Sets the value of the <code>zoomOnClick</code> property.
 *
 *  @param {boolean} zoomOnClick The value of the zoomOnClick property.
 */
MarkerClusterer.prototype.setZoomOnClick = function(zoomOnClick) {
    this.zoomOnClick_ = zoomOnClick;
};


/**
 * Returns the value of the <code>averageCenter</code> property.
 *
 * @return {boolean} True if averageCenter property is set.
 */
MarkerClusterer.prototype.getAverageCenter = function() {
    return this.averageCenter_;
};


/**
 *  Sets the value of the <code>averageCenter</code> property.
 *
 *  @param {boolean} averageCenter The value of the averageCenter property.
 */
MarkerClusterer.prototype.setAverageCenter = function(averageCenter) {
    this.averageCenter_ = averageCenter;
};


/**
 * Returns the value of the <code>ignoreHidden</code> property.
 *
 * @return {boolean} True if ignoreHidden property is set.
 */
MarkerClusterer.prototype.getIgnoreHidden = function() {
    return this.ignoreHidden_;
};


/**
 *  Sets the value of the <code>ignoreHidden</code> property.
 *
 *  @param {boolean} ignoreHidden The value of the ignoreHidden property.
 */
MarkerClusterer.prototype.setIgnoreHidden = function(ignoreHidden) {
    this.ignoreHidden_ = ignoreHidden;
};


/**
 * Returns the value of the <code>enableRetinaIcons</code> property.
 *
 * @return {boolean} True if enableRetinaIcons property is set.
 */
MarkerClusterer.prototype.getEnableRetinaIcons = function() {
    return this.enableRetinaIcons_;
};


/**
 *  Sets the value of the <code>enableRetinaIcons</code> property.
 *
 *  @param {boolean} enableRetinaIcons The value of the enableRetinaIcons property.
 */
MarkerClusterer.prototype.setEnableRetinaIcons = function(enableRetinaIcons) {
    this.enableRetinaIcons_ = enableRetinaIcons;
};


/**
 * Returns the value of the <code>imageExtension</code> property.
 *
 * @return {string} The value of the imageExtension property.
 */
MarkerClusterer.prototype.getImageExtension = function() {
    return this.imageExtension_;
};


/**
 *  Sets the value of the <code>imageExtension</code> property.
 *
 *  @param {string} imageExtension The value of the imageExtension property.
 */
MarkerClusterer.prototype.setImageExtension = function(imageExtension) {
    this.imageExtension_ = imageExtension;
};


/**
 * Returns the value of the <code>imagePath</code> property.
 *
 * @return {string} The value of the imagePath property.
 */
MarkerClusterer.prototype.getImagePath = function() {
    return this.imagePath_;
};


/**
 *  Sets the value of the <code>imagePath</code> property.
 *
 *  @param {string} imagePath The value of the imagePath property.
 */
MarkerClusterer.prototype.setImagePath = function(imagePath) {
    this.imagePath_ = imagePath;
};


/**
 * Returns the value of the <code>imageSizes</code> property.
 *
 * @return {Array} The value of the imageSizes property.
 */
MarkerClusterer.prototype.getImageSizes = function() {
    return this.imageSizes_;
};


/**
 *  Sets the value of the <code>imageSizes</code> property.
 *
 *  @param {Array} imageSizes The value of the imageSizes property.
 */
MarkerClusterer.prototype.setImageSizes = function(imageSizes) {
    this.imageSizes_ = imageSizes;
};


/**
 * Returns the value of the <code>calculator</code> property.
 *
 * @return {function} the value of the calculator property.
 */
MarkerClusterer.prototype.getCalculator = function() {
    return this.calculator_;
};


/**
 * Sets the value of the <code>calculator</code> property.
 *
 * @param {function(Array.<google.maps.Marker>, number)} calculator The value
 *  of the calculator property.
 */
MarkerClusterer.prototype.setCalculator = function(calculator) {
    this.calculator_ = calculator;
};


/**
 * Returns the value of the <code>batchSizeIE</code> property.
 *
 * @return {number} the value of the batchSizeIE property.
 */
MarkerClusterer.prototype.getBatchSizeIE = function() {
    return this.batchSizeIE_;
};


/**
 * Sets the value of the <code>batchSizeIE</code> property.
 *
 *  @param {number} batchSizeIE The value of the batchSizeIE property.
 */
MarkerClusterer.prototype.setBatchSizeIE = function(batchSizeIE) {
    this.batchSizeIE_ = batchSizeIE;
};


/**
 * Returns the value of the <code>clusterClass</code> property.
 *
 * @return {string} the value of the clusterClass property.
 */
MarkerClusterer.prototype.getClusterClass = function() {
    return this.clusterClass_;
};


/**
 * Sets the value of the <code>clusterClass</code> property.
 *
 *  @param {string} clusterClass The value of the clusterClass property.
 */
MarkerClusterer.prototype.setClusterClass = function(clusterClass) {
    this.clusterClass_ = clusterClass;
};


/**
 *  Returns the array of markers managed by the clusterer.
 *
 *  @return {Array} The array of markers managed by the clusterer.
 */
MarkerClusterer.prototype.getMarkers = function() {
    return this.markers_;
};


/**
 *  Returns the number of markers managed by the clusterer.
 *
 *  @return {number} The number of markers.
 */
MarkerClusterer.prototype.getTotalMarkers = function() {
    return this.markers_.length;
};


/**
 * Returns the current array of clusters formed by the clusterer.
 *
 * @return {Array} The array of clusters formed by the clusterer.
 */
MarkerClusterer.prototype.getClusters = function() {
    return this.clusters_;
};


/**
 * Returns the number of clusters formed by the clusterer.
 *
 * @return {number} The number of clusters formed by the clusterer.
 */
MarkerClusterer.prototype.getTotalClusters = function() {
    return this.clusters_.length;
};


/**
 * Adds a marker to the clusterer. The clusters are redrawn unless
 *  <code>opt_nodraw</code> is set to <code>true</code>.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @param {boolean} [opt_nodraw] Set to <code>true</code> to prevent redrawing.
 */
MarkerClusterer.prototype.addMarker = function(marker, opt_nodraw) {
    this.pushMarkerTo_(marker);
    if (!opt_nodraw) {
        this.redraw_();
    }
};


/**
 * Adds an array of markers to the clusterer. The clusters are redrawn unless
 *  <code>opt_nodraw</code> is set to <code>true</code>.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to add.
 * @param {boolean} [opt_nodraw] Set to <code>true</code> to prevent redrawing.
 */
MarkerClusterer.prototype.addMarkers = function(markers, opt_nodraw) {
    var key;
    for (key in markers) {
        if (markers.hasOwnProperty(key)) {
            this.pushMarkerTo_(markers[key]);
        }
    }
    if (!opt_nodraw) {
        this.redraw_();
    }
};


/**
 * Pushes a marker to the clusterer.
 *
 * @param {google.maps.Marker} marker The marker to add.
 */
MarkerClusterer.prototype.pushMarkerTo_ = function(marker) {
    // If the marker is draggable add a listener so we can update the clusters on the dragend:
    if (marker.getDraggable()) {
        var cMarkerClusterer = this;
        google.maps.event.addListener(marker, "dragend", function() {
            if (cMarkerClusterer.ready_) {
                this.isAdded = false;
                cMarkerClusterer.repaint();
            }
        });
    }
    marker.isAdded = false;
    this.markers_.push(marker);
};


/**
 * Removes a marker from the cluster.  The clusters are redrawn unless
 *  <code>opt_nodraw</code> is set to <code>true</code>. Returns <code>true</code> if the
 *  marker was removed from the clusterer.
 *
 * @param {google.maps.Marker} marker The marker to remove.
 * @param {boolean} [opt_nodraw] Set to <code>true</code> to prevent redrawing.
 * @return {boolean} True if the marker was removed from the clusterer.
 */
MarkerClusterer.prototype.removeMarker = function(marker, opt_nodraw) {
    var removed = this.removeMarker_(marker);

    if (!opt_nodraw && removed) {
        this.repaint();
    }

    return removed;
};


/**
 * Removes an array of markers from the cluster. The clusters are redrawn unless
 *  <code>opt_nodraw</code> is set to <code>true</code>. Returns <code>true</code> if markers
 *  were removed from the clusterer.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to remove.
 * @param {boolean} [opt_nodraw] Set to <code>true</code> to prevent redrawing.
 * @return {boolean} True if markers were removed from the clusterer.
 */
MarkerClusterer.prototype.removeMarkers = function(markers, opt_nodraw) {
    var i, r;
    var removed = false;

    for (i = 0; i < markers.length; i++) {
        r = this.removeMarker_(markers[i]);
        removed = removed || r;
    }

    if (!opt_nodraw && removed) {
        this.repaint();
    }

    return removed;
};


/**
 * Removes a marker and returns true if removed, false if not.
 *
 * @param {google.maps.Marker} marker The marker to remove
 * @return {boolean} Whether the marker was removed or not
 */
MarkerClusterer.prototype.removeMarker_ = function(marker) {
    var i;
    var index = -1;
    if (this.markers_.indexOf) {
        index = this.markers_.indexOf(marker);
    } else {
        for (i = 0; i < this.markers_.length; i++) {
            if (marker === this.markers_[i]) {
                index = i;
                break;
            }
        }
    }

    if (index === -1) {
        // Marker is not in our list of markers, so do nothing:
        return false;
    }

    marker.setMap(null);
    this.markers_.splice(index, 1); // Remove the marker from the list of managed markers
    return true;
};


/**
 * Removes all clusters and markers from the map and also removes all markers
 *  managed by the clusterer.
 */
MarkerClusterer.prototype.clearMarkers = function() {
    this.resetViewport_(true);
    this.markers_ = [];
};


/**
 * Recalculates and redraws all the marker clusters from scratch.
 *  Call this after changing any properties.
 */
MarkerClusterer.prototype.repaint = function() {
    var oldClusters = this.clusters_.slice();
    this.clusters_ = [];
    this.resetViewport_(false);
    this.redraw_();

    // Remove the old clusters.
    // Do it in a timeout to prevent blinking effect.
    setTimeout(function() {
        var i;
        for (i = 0; i < oldClusters.length; i++) {
            oldClusters[i].remove();
        }
    }, 0);
};


/**
 * Returns the current bounds extended by the grid size.
 *
 * @param {google.maps.LatLngBounds} bounds The bounds to extend.
 * @return {google.maps.LatLngBounds} The extended bounds.
 * @ignore
 */
MarkerClusterer.prototype.getExtendedBounds = function(bounds) {
    var projection = this.getProjection();

    // Turn the bounds into latlng.
    var tr = new google.maps.LatLng(bounds.getNorthEast().lat(),
        bounds.getNorthEast().lng());
    var bl = new google.maps.LatLng(bounds.getSouthWest().lat(),
        bounds.getSouthWest().lng());

    // Convert the points to pixels and the extend out by the grid size.
    var trPix = projection.fromLatLngToDivPixel(tr);
    trPix.x += this.gridSize_;
    trPix.y -= this.gridSize_;

    var blPix = projection.fromLatLngToDivPixel(bl);
    blPix.x -= this.gridSize_;
    blPix.y += this.gridSize_;

    // Convert the pixel points back to LatLng
    var ne = projection.fromDivPixelToLatLng(trPix);
    var sw = projection.fromDivPixelToLatLng(blPix);

    // Extend the bounds to contain the new bounds.
    bounds.extend(ne);
    bounds.extend(sw);

    return bounds;
};


/**
 * Redraws all the clusters.
 */
MarkerClusterer.prototype.redraw_ = function() {
    this.createClusters_(0);
};


/**
 * Removes all clusters from the map. The markers are also removed from the map
 *  if <code>opt_hide</code> is set to <code>true</code>.
 *
 * @param {boolean} [opt_hide] Set to <code>true</code> to also remove the markers
 *  from the map.
 */
MarkerClusterer.prototype.resetViewport_ = function(opt_hide) {
    var i, marker;
    // Remove all the clusters
    for (i = 0; i < this.clusters_.length; i++) {
        this.clusters_[i].remove();
    }
    this.clusters_ = [];

    // Reset the markers to not be added and to be removed from the map.
    for (i = 0; i < this.markers_.length; i++) {
        marker = this.markers_[i];
        marker.isAdded = false;
        if (opt_hide) {
            marker.setMap(null);
        }
    }
};


/**
 * Calculates the distance between two latlng locations in km.
 *
 * @param {google.maps.LatLng} p1 The first lat lng point.
 * @param {google.maps.LatLng} p2 The second lat lng point.
 * @return {number} The distance between the two points in km.
 * @see http://www.movable-type.co.uk/scripts/latlong.html
 */
MarkerClusterer.prototype.distanceBetweenPoints_ = function(p1, p2) {
    var R = 6371; // Radius of the Earth in km
    var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
    var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
};


/**
 * Determines if a marker is contained in a bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @param {google.maps.LatLngBounds} bounds The bounds to check against.
 * @return {boolean} True if the marker is in the bounds.
 */
MarkerClusterer.prototype.isMarkerInBounds_ = function(marker, bounds) {
    return bounds.contains(marker.getPosition());
};


/**
 * Adds a marker to a cluster, or creates a new cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 */
MarkerClusterer.prototype.addToClosestCluster_ = function(marker) {
    var i, d, cluster, center;
    var distance = 40000; // Some large number
    var clusterToAddTo = null;
    for (i = 0; i < this.clusters_.length; i++) {
        cluster = this.clusters_[i];
        center = cluster.getCenter();
        if (center) {
            d = this.distanceBetweenPoints_(center, marker.getPosition());
            if (d < distance) {
                distance = d;
                clusterToAddTo = cluster;
            }
        }
    }

    if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)) {
        clusterToAddTo.addMarker(marker);
    } else {
        cluster = new Cluster(this);
        cluster.addMarker(marker);
        this.clusters_.push(cluster);
    }
};


/**
 * Creates the clusters. This is done in batches to avoid timeout errors
 *  in some browsers when there is a huge number of markers.
 *
 * @param {number} iFirst The index of the first marker in the batch of
 *  markers to be added to clusters.
 */
MarkerClusterer.prototype.createClusters_ = function(iFirst) {
    var i, marker;
    var mapBounds;
    var cMarkerClusterer = this;
    if (!this.ready_) {
        return;
    }

    // Cancel previous batch processing if we're working on the first batch:
    if (iFirst === 0) {
        /**
         * This event is fired when the <code>MarkerClusterer</code> begins
         *  clustering markers.
         * @name MarkerClusterer#clusteringbegin
         * @param {MarkerClusterer} mc The MarkerClusterer whose markers are being clustered.
         * @event
         */
        google.maps.event.trigger(this, "clusteringbegin", this);

        if (typeof this.timerRefStatic !== "undefined") {
            clearTimeout(this.timerRefStatic);
            delete this.timerRefStatic;
        }
    }

    // Get our current map view bounds.
    // Create a new bounds object so we don't affect the map.
    //
    // See Comments 9 & 11 on Issue 3651 relating to this workaround for a Google Maps bug:
    if (this.getMap().getZoom() > 3) {
        mapBounds = new google.maps.LatLngBounds(this.getMap().getBounds().getSouthWest(),
            this.getMap().getBounds().getNorthEast());
    } else {
        mapBounds = new google.maps.LatLngBounds(new google.maps.LatLng(85.02070771743472, -178.48388434375), new google.maps.LatLng(-85.08136444384544, 178.00048865625));
    }
    var bounds = this.getExtendedBounds(mapBounds);

    var iLast = Math.min(iFirst + this.batchSize_, this.markers_.length);

    for (i = iFirst; i < iLast; i++) {
        marker = this.markers_[i];
        if (!marker.isAdded && this.isMarkerInBounds_(marker, bounds)) {
            if (!this.ignoreHidden_ || (this.ignoreHidden_ && marker.getVisible())) {
                this.addToClosestCluster_(marker);
            }
        }
    }

    if (iLast < this.markers_.length) {
        this.timerRefStatic = setTimeout(function() {
            cMarkerClusterer.createClusters_(iLast);
        }, 0);
    } else {
        delete this.timerRefStatic;

        /**
         * This event is fired when the <code>MarkerClusterer</code> stops
         *  clustering markers.
         * @name MarkerClusterer#clusteringend
         * @param {MarkerClusterer} mc The MarkerClusterer whose markers are being clustered.
         * @event
         */
        google.maps.event.trigger(this, "clusteringend", this);
    }
};


/**
 * Extends an object's prototype by another's.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
MarkerClusterer.prototype.extend = function(obj1, obj2) {
    return (function(object) {
        var property;
        for (property in object.prototype) {
            this.prototype[property] = object.prototype[property];
        }
        return this;
    }).apply(obj1, [obj2]);
};


/**
 * The default function for determining the label text and style
 * for a cluster icon.
 *
 * @param {Array.<google.maps.Marker>} markers The array of markers represented by the cluster.
 * @param {number} numStyles The number of marker styles available.
 * @return {ClusterIconInfo} The information resource for the cluster.
 * @constant
 * @ignore
 */
MarkerClusterer.CALCULATOR = function(markers, numStyles) {
    var index = 0;
    var title = "";
    var count = markers.length.toString();

    var dv = count;
    while (dv !== 0) {
        dv = parseInt(dv / 10, 10);
        index++;
    }

    index = Math.min(index, numStyles);
    return {
        text: count,
        index: index,
        title: title
    };
};


/**
 * The number of markers to process in one batch.
 *
 * @type {number}
 * @constant
 */
MarkerClusterer.BATCH_SIZE = 2000;


/**
 * The number of markers to process in one batch (IE only).
 *
 * @type {number}
 * @constant
 */
MarkerClusterer.BATCH_SIZE_IE = 500;


/**
 * The default root name for the marker cluster images.
 *
 * @type {string}
 * @constant
 */
MarkerClusterer.IMAGE_PATH = "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/images/m";


/**
 * The default extension name for the marker cluster images.
 *
 * @type {string}
 * @constant
 */
MarkerClusterer.IMAGE_EXTENSION = "png";


/**
 * The default array of sizes for the marker cluster images.
 *
 * @type {Array.<number>}
 * @constant
 */
MarkerClusterer.IMAGE_SIZES = [53, 56, 66, 78, 90];
/**
 * Accordion, jQuery Plugin
 *
 * This plugin provides an accordion with cookie support.
 *
 * Copyright (c) 2011 John Snyder (snyderplace.com)
 * @license http://www.snyderplace.com/accordion/license.txt New BSD
 * @version 1.1
 */
(function($) {
    $.fn.accordion = function(options) {

        //firewalling
        if (!this || this.length < 1) {
            return this;
        }

        initialize(this, options);

    };

    //create the initial accordion
    function initialize(obj, options) {

        //build main options before element iteration
        var opts = $.extend({}, $.fn.accordion.defaults, options);

        //store any opened default values to set cookie later
        var opened = '';

        //iterate each matched object, bind, and open/close
        obj.each(function() {
            var $this = $(this);
            saveOpts($this, opts);

            //bind it to the event
            if (opts.bind == 'mouseenter') {
                $this.bind('mouseenter', function(e) {
                    e.preventDefault();
                    toggle($this, opts);
                });
            }

            //bind it to the event
            if (opts.bind == 'mouseover') {
                $this.bind('mouseover', function(e) {
                    e.preventDefault();
                    toggle($this, opts);
                });
            }

            //bind it to the event
            if (opts.bind == 'click') {
                $this.bind('click', function(e) {
                    e.preventDefault();
                    toggle($this, opts);
                });
            }

            //bind it to the event
            if (opts.bind == 'dblclick') {
                $this.bind('dblclick', function(e) {
                    e.preventDefault();
                    toggle($this, opts);
                });
            }

            //initialize the panels
            //get the id for this element
            var id = $this.attr('id');

            //if not using cookies, open defaults
            if (!useCookies(opts)) {
                //close it if not defaulted to open
                if (id != opts.defaultOpen) {
                    $this.addClass(opts.cssClose);
                    opts.loadClose($this, opts);
                } else { //its a default open, open it
                    $this.addClass(opts.cssOpen);
                    opts.loadOpen($this, opts);
                    opened = id;
                }
            } else { //can use cookies, use them now
                //has a cookie been set, this overrides default open
                if (issetCookie(opts)) {
                    if (inCookie(id, opts) === false) {
                        $this.addClass(opts.cssClose);
                        opts.loadClose($this, opts);
                    } else {
                        $this.addClass(opts.cssOpen);
                        opts.loadOpen($this, opts);
                        opened = id;
                    }
                } else { //a cookie hasn't been set open defaults
                    if (id != opts.defaultOpen) {
                        $this.addClass(opts.cssClose);
                        opts.loadClose($this, opts);
                    } else { //its a default open, open it
                        $this.addClass(opts.cssOpen);
                        opts.loadOpen($this, opts);
                        opened = id;
                    }
                }
            }
        });

        //now that the loop is done, set the cookie
        if (opened.length > 0 && useCookies(opts)) {
            setCookie(opened, opts);
        } else { //there are none open, set cookie
            setCookie('', opts);
        }

        return obj;
    };

    //load opts from object
    function loadOpts($this) {
        return $this.data('accordion-opts');
    }

    //save opts into object
    function saveOpts($this, opts) {
        return $this.data('accordion-opts', opts);
    }

    //hides a accordion panel
    function close(opts) {
        opened = $(document).find('.' + opts.cssOpen);
        $.each(opened, function() {
            //give the proper class to the linked element
            $(this).addClass(opts.cssClose).removeClass(opts.cssOpen);
            opts.animateClose($(this), opts);
        });
    }

    //opens a accordion panel
    function open($this, opts) {
        close(opts);
        //give the proper class to the linked element
        $this.removeClass(opts.cssClose).addClass(opts.cssOpen);

        //open the element
        opts.animateOpen($this, opts);

        //do cookies if plugin available
        if (useCookies(opts)) {
            // split the cookieOpen string by ","
            id = $this.attr('id');
            setCookie(id, opts);
        }
    }

    //toggle a accordion on an event
    function toggle($this, opts) {
        // close the only open item
        if ($this.hasClass(opts.cssOpen)) {
            close(opts);
            //do cookies if plugin available
            if (useCookies(opts)) {
                // split the cookieOpen string by ","
                setCookie('', opts);
            }
            return false;
        }
        close(opts);
        //open a closed element
        open($this, opts);
        return false;
    }

    //use cookies?
    function useCookies(opts) {
        //return false if cookie plugin not present or if a cookie name is not provided
        if (!$.cookie || opts.cookieName == '') {
            return false;
        }

        //we can use cookies
        return true;
    }

    //set a cookie
    function setCookie(value, opts) {
        //can use the cookie plugin
        if (!useCookies(opts)) { //no, quit here
            return false;
        }

        //cookie plugin is available, lets set the cookie
        $.cookie(opts.cookieName, value, opts.cookieOptions);
    }

    //check if a accordion is in the cookie
    function inCookie(value, opts) {
        //can use the cookie plugin
        if (!useCookies(opts)) {
            return false;
        }

        //if its not there we don't need to remove from it
        if (!issetCookie(opts)) { //quit here, don't have a cookie
            return false;
        }

        //unescape it
        cookie = unescape($.cookie(opts.cookieName));

        //is this value in the cookie arrray
        if (cookie != value) { //no, quit here
            return false;
        }

        return true;
    }

    //check if a cookie is set
    function issetCookie(opts) {
        //can we use the cookie plugin
        if (!useCookies(opts)) { //no, quit here
            return false;
        }

        //is the cookie set
        if ($.cookie(opts.cookieName) == null) { //no, quit here
            return false;
        }

        return true;
    }

    // settings
    $.fn.accordion.defaults = {
        cssClose: 'accordion-close', //class you want to assign to a closed accordion header
        cssOpen: 'accordion-open', //class you want to assign an opened accordion header
        cookieName: 'accordion', //name of the cookie you want to set for this accordion
        cookieOptions: { //cookie options, see cookie plugin for details
            path: '/',
            expires: 7,
            domain: '',
            secure: ''
        },
        defaultOpen: '', //id that you want opened by default
        speed: 'slow', //speed of the slide effect
        bind: 'click', //event to bind to, supports click, dblclick, mouseover and mouseenter
        animateOpen: function(elem, opts) { //replace the standard slideDown with custom function
            elem.next().stop(true, true).slideDown(opts.speed);
        },
        animateClose: function(elem, opts) { //replace the standard slideUp with custom function
            elem.next().stop(true, true).slideUp(opts.speed);
        },
        loadOpen: function(elem, opts) { //replace the default open state with custom function
            elem.next().show();
        },
        loadClose: function(elem, opts) { //replace the default close state with custom function
            elem.next().hide();
        }
    };
})(jQuery);
(function($) {
    "use strict";
    $.fn.fcModal = function(options) {

        var fcmodal = $.extend({
            onOpen: function() {},
            register_fc_modal_handing_events: function() {

                $('.fc-modal').each(function(i, obj) {

                    var initiator = $(this).data('initiator');
                    if (typeof initiator != typeof undefined) {
                        if ($(initiator.length)) {

                            $(initiator).data('target', $(this).attr('id'));
                            var releatedModal = $(this).attr('id');
                            $('body').on('click', initiator, function() {

                                if ($('#' + releatedModal).length > 0) {
                                    fcmodal.onOpen();
                                    $('#' + releatedModal).css('display', 'block');
                                }

                            });


                        }
                    }


                });

                $('body').on('click', '.fc-modal-close', function() {
                    var releatedModal = $(this).closest('.fc-modal-overlay');
                    $(releatedModal).css('display', 'none');
                });

                
                $('body').on('click', '.fc-modal-open', function(e) {
                    e.preventDefault();
                    var releatedModal = $('.fc-modal-overlay');
                    console.log(releatedModal);
                    $(releatedModal).css('display', 'flex');
                });

                window.onclick = function(event) {

                    if ($(event.toElement).hasClass('fc-modal-overlay'))
                        $('.fc-modal-overlay').hide();

                }
            }
        }, options);

        return this.each(function() {
            fcmodal.register_fc_modal_handing_events();
        });
    };

	jQuery(document).ready(function($) {

	    $(".fc-file_input").change(function(e) {
	        //submit the form here
	        var file_name = e.target.files[0].name;
	        $(this).parent().find(".fc-file-details").text(file_name);
	    });

	    $('.fc-modal').fcModal({});

	});

    jQuery(document).ready(function($) {

        if (jQuery(".fc_select2").length > 0) {
            jQuery(".fc_select2").select2();
        }
          
        /*
        if (jQuery(".location_newfields").length > 0 ) {
            // check this
            $.each(settings_obj.wpgmp_extrafield_val, function(index, element) {
                jQuery('.location_select2_'+index).select2({
                   tags:element, // Doesn't work either
                   multiple: true,
                   tokenSeparators: [","]
                });

            });
        }
            */
        
        var allPanels = $('.custom-accordion > dd').hide();

        var $firstDt = $('.custom-accordion > dt:first-of-type');
        var $firstDd = $firstDt.next('dd');

        // Check if the section inside <dt> has the 'fc-feature-not-available' class
        if ($firstDt.find('.fc-feature-not-available').length > 0) {
            $firstDd.hide();
            $firstDt.removeClass('accordion-active');
        } else {
            $firstDd.show();
            $firstDt.addClass('accordion-active');
        }


        $('.fc-help-right .custom-accordion > dd:first-of-type').hide();
        $('.fc-help-right .custom-accordion > dt:first-of-type').removeClass('accordion-active');

        $('.custom-accordion dt h4').on('click', function() {
            var $this = $(this);
            var $target = $this.closest('dt').next();
        
            if (!$this.closest('dt').hasClass('accordion-active')) {
                $this.closest('.custom-accordion').find('dd').slideUp();
                $this.closest('.custom-accordion').find('dt').removeClass('accordion-active');
                $this.closest('dt').addClass('accordion-active');
                $target.addClass('active').slideDown();
            } else {
                $this.closest('dt').next('dd').slideUp();
                $this.closest('dt').removeClass('accordion-active');
            }
        
            return false;
        });

        $('.wp-list-table .check-column input[type="checkbox"]').wrap('<div class="fc-form-check"></div>'); 
        $('.wp-list-table .check-column input[type="checkbox"]').addClass('fc-form-check-input');
        $('.wp-list-table .check-column input[type="checkbox"]').each(function () {
            $(this).closest('table').removeClass('striped');
          });
          

        var table = $('.wp-list-table #the-list');    
        table.on('click', 'tr', function (e) {

            if ( $(this).hasClass('active') ) {

                $(this).removeClass('active');

            }else{

                $(this).addClass('active');
            }
        });

        var currentDeletedTemplate = '';
        $('.yes-remove-current-template').on("click", function() {

            var product = $(this).data('product');
            var templatetype = $(this).data('templatetype');
            var templateName = $(this).data('templatename');
            var data = {
                action: 'core_backend_ajax_calls',
                product: product,
                templateName: templateName,
                templatetype: templatetype,
                selector: '.default-custom-template',
                operation: 'delete_custom_template'
            }

            currentDeletedTemplate = templateName;
            perform_ajax_events(data);
            $('#remove-current-template').modal('hide');

        });

        $(document).on("click", ".access_link_copy", function(e) {
            var inputField = $(this).prev(".fc_login_link_copy"); // Find the previous input field
            inputField.select(); // Select the text inside the input field
            document.execCommand("copy"); // Copy the selected text to clipboard
        });

        $('.fc_temp_access_button').on("click", function(e) {
            e.preventDefault();
            var temp_flag = false;
            if($(this).hasClass("fc_temp_revoke_button")){
                temp_flag = true;
            }

            var data = {
                action: 'wpgmp_temp_access_ajax',
                check_temp: temp_flag,
                nonce: settings_obj.nonce,
            }

            jQuery.ajax({
                type: "POST",
                url: settings_obj.ajax_url,
                dataType: "json",
                data: data,
                beforeSend: function() {
                    $( ".fc-backend-loader" ).show();
                },
                success: function(response) {
                    $( ".fc-backend-loader" ).hide();
                    
                    if(response.url){
                        $(".fc_temp_access_button").addClass('fc_temp_revoke_button');
                        $(".fc_temp_access_button").text(settings_obj.access_revoke);
                        var access_url = '<input type="text" class="fc-form-control fc_login_link_copy" value="'+response.url+'"><span class="access_link_copy"><img src="'+settings_obj.copy_icon+'"></span>';
                        $('.fc_access_url').html(access_url);
                    }else if(response.error){
                        $('.fc_access_url').text(response.error)
                    }else if(response.deleted){
                        $(".fc_temp_access_button").removeClass('fc_temp_revoke_button');
                        $(".fc_temp_access_button").text(settings_obj.access_create);
                        $('.fc_access_url').html('');
                    }

                }
 

            });

        });

        

        $('.default-custom-template').on("click", function() {

            $('#remove-current-template').modal('show');
            $('.yes-remove-current-template').data('product', $(this).data('product'));
            $('.yes-remove-current-template').data('templatetype', $(this).data('templatetype'));
            $('.yes-remove-current-template').data('templatename', $(this).data('templatename'));
            return false;

        });

        // Sortable JS
        $("body").find(".sortable_child").closest('.fc-form-group').addClass('sortable-item');
        $("body").find('.sortable-item').wrapAll("<div class='fc-12 sortable' />");
        if($("body").find('.sortable').length > 0 ) {
            $("body").find('.sortable').sortable({
                placeholder: "ui-sortable-placeholder"
            });
        }
        

        var wpgmp_image_id = '';
        var remove_ids = "";
        $("body").on('click', ".repeat_button", function(e) {
            e.preventDefault();

            //find out which container we need to copy.
            var target = $(this).parent().parent();
            var new_element = $(target).clone();
            //incrase index here
            var inputs = $(new_element).find("input[type='text']");
            for (var i = 0; i < inputs.length; i++) {
                var element_name = $(inputs[i]).attr("name");
                var patt = new RegExp(/\[([0-9]+)\]/i);
                var res = patt.exec(element_name);
                var new_index = parseInt(res[1]) + 1;
                var name = element_name.replace(/\[([0-9]+)\]/i, "[" + new_index + "]");
                $(inputs[i]).attr("name", name);
            }

            var inputs = $(new_element).find("input[type='number']");
            for (var i = 0; i < inputs.length; i++) {
                var element_name = $(inputs[i]).attr("name");
                var patt = new RegExp(/\[([0-9]+)\]/i);
                var res = patt.exec(element_name);
                var new_index = parseInt(res[1]) + 1;
                var name = element_name.replace(/\[([0-9]+)\]/i, "[" + new_index + "]");
                $(inputs[i]).attr("name", name);
            }

            $(new_element).find("input[type='text']").val("");
            $(new_element).find("input[type='number']").val("");

            $(target).find(".repeat_button").text("Remove");
            $(target).find(".repeat_button").removeClass("repeat_button").addClass("repeat_remove_button");
            $(target).after($(new_element));

            $("body").find('.sortable').sortable("refresh");


        });
        //Delete add more...
        $("body").on('click', ".repeat_remove_button", function(e) {
            e.preventDefault();
            //find out which container we need to copy.
            var target = $(this).parent().parent();
            var temp = $(target).clone();
            $(target).remove();
            //reindexing
            var inputs = $(temp).find("input[type='text']");
            $.each(inputs, function(index, element) {
                var current_name = $(this).attr("name");
                var name = current_name.replace(/\[([0-9]+)\]/i, "");
                $.each($("*[name^='" + name + "']"), function(index, element) {
                    current_name = $(this).attr('name');
                    var name = current_name.replace(/\[([0-9]+)\]/i, "[" + index + "]");
                    $(this).attr("name", name);
                });
            });
            var entiy_id = $(this).data("id");
            if (entiy_id) {
                remove_ids = remove_ids + $(this).data("id") + "|";
                $('#fc_remove_entities').val(remove_ids);
            }

            $("body").find('.sortable').sortable("refresh");

        });

        window.send_to_editor_default = window.send_to_editor;

        $('.fa-picture-o').click(function() {
            window.send_to_editor = function(html) {

                $('body').append('<div id="temp_image">' + html + '</div>');
                var img = $('#temp_image').find('img');
                var imgurl = img.attr('src');
                $('.active_element').css('background-image', 'url(' + imgurl + ')');
                try {
                    tb_remove();
                } catch (e) {}
                $('#temp_image').remove();
                window.send_to_editor = window.send_to_editor_default;
            };
            tb_show('', 'media-upload.php?post_ID=0&type=image&TB_iframe=true');
            return false;

        });


        var wpp_image_id = '';
        var currentClickedID = '';
        $('.choose_image').click(function() {
            currentClickedID = $(this).data('ref');
            window.send_to_editor = window.attach_image;
            tb_show('', 'media-upload.php?post_ID=0&target=' + currentClickedID + '&type=image&TB_iframe=true');
            return false;
        });

        window.attach_image = function(html) {
            $('body').append('<div id="temp_image' + currentClickedID + '">' + html + '</div>');
            var img = $('#temp_image' + currentClickedID).find('img');
            var imgurl = img.attr('src');
            var imgclass = img.attr('class');
            var imgid = parseInt(imgclass.replace(/\D/g, ''), 10);
            $('#remove_image' + currentClickedID).show();
            $('#remove_image_' + currentClickedID).show();
            $('#image_' + currentClickedID).attr('src', imgurl).show();
            $('#input_' + currentClickedID).val(imgurl);
            try {
                tb_remove();
            } catch (e) {};
            $('#temp_image' + currentClickedID).remove();
            window.send_to_editor = window.send_to_editor_default;
        }

        $('.remove_image').click(function() {
            var wpp_image_id = $(this).parent().parent();
            $(wpp_image_id).find('.selected_image').attr('src', '');
            $(wpp_image_id).find('input[name="' + $(this).data('target') + '"]').val('');
            $(this).hide();
            return false;
        });

        $("input[name='wpp_refresh']").trigger('change');

        function ajax_success_handler(data, selector) {

            switch (selector) {

                case '.set-default-template':
                    $('.fc_tools').css('display', 'none');
                    $('.fc_name').css('display', 'none');
                    $('.current_selected').parent().parent().find('.fc_name').css('display', 'block');
                    $('.current_selected').closest('.fc_tools').css('display', 'block');
                    $('.current-temp-in-use').removeClass('current-temp-in-use');
                    $('.current_selected').addClass('current-temp-in-use');
                    break;
                case '.default-custom-template':
                    $(".default-custom-template[data-templatename=" + currentDeletedTemplate + "]").parent().parent().parent().remove();
                    break;
                default:

            }

        }

        function perform_ajax_events(data) {

            $inputs = data;
            jQuery.ajax({
                type: "POST",
                url: settings_obj.ajax_url,
                dataType: "json",
                data: data,
                beforeSend: function() {

                    jQuery(".se-pre-con").fadeIn("slow");
                },
                success: function(data) {
                    jQuery(".se-pre-con").fadeOut("slow");
                    ajax_success_handler(data, $inputs.selector);

                }

            });

        }

        // Customizer JS

        $('body').on('click', ".fc-accordion-tab", function() {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                var acc_child = $(this).next().removeClass('active');
            } else {
                $(".fc-accordion-tab").removeClass('active');
                $(".fc-acc-child").removeClass('active');
                $(this).addClass('active');
                var acc_child = $(this).next().addClass('active');
            }

        });

        // Sticky Footer
        if ($('.fc-footer').length > 0) {

            $(window).scroll(function() {

                if ($('.flippercode-ui-height').height() > 800) {

                    if ($('.fc-no-sticky').length > 0) {
                        return;
                    }

                    var scroll = $(window).scrollTop();
                    var scrollBottom = $(window).height() - scroll;

                    if (scroll >= 0) {
                        $(".fc-footer").addClass("fc-fixed-footer");

                    }
                    if ($(window).scrollTop() + $(window).height() > ($(document).height() - 30)) {
                        $(".fc-fixed-footer").removeClass("fc-fixed-footer");
                    }
                }

            });

        }

        $('.fc-main').find('[data-toggle="tab"]').click(function(e) {
            e.preventDefault();
            var tab_id = $(this).attr('href');
            $('.fc-tabs-container .fc-tabs-content').hide();
            $(tab_id).show();
            $('.fc-tabs .active').removeClass('active');
            $(this).parent().addClass('active');
        });

    });

}(jQuery));

jQuery(document).ready(function($) {

    function fc_set_customizer_properties(current_element) {
        var preview_parent = $(current_element).closest('.fc_preview').parent().parent().parent();
        // Get properties of selected element. 
        var font_weight = $(current_element).css('font-weight');
        var font_size = $(current_element).css('font-size').replace(/[^-\d\.]/g, '');
        var font_color = $(current_element).css('color').replace(')', ', 0)').replace('rgb', 'rgba');
        var line_height = $(current_element).css('line-height').replace(/[^-\d\.]/g, '');
        var background_color = $(current_element).css('background-color');
        var background = $(current_element).css('background');
        var font_style = $(current_element).css('font-style');
        var text_decoration = $(current_element).css('text-decoration-line');
        var font_family = $(current_element).css('font-family');
        if (font_family.indexOf(',') >= 0) {
            font_family = font_family.split(",");
            font_family = font_family[0];
        }
        if (font_family.indexOf('"') >= 0) {
            font_family = font_family.replace('"', '');
            font_family = font_family.replace('"', '');
        }
        WebFont.load({
            google: {
                families: [font_family]
            }
        });
        $(preview_parent).find('.fc-font-family select').val(font_family);
        var text_align = $(current_element).css('text-align');
        var margin_top = $(current_element).css('margin-top').replace(/[^-\d\.]/g, '');
        var margin_bottom = $(current_element).css('margin-bottom').replace(/[^-\d\.]/g, '');
        var margin_left = $(current_element).css('margin-left').replace(/[^-\d\.]/g, '');
        var margin_right = $(current_element).css('margin-right').replace(/[^-\d\.]/g, '');
        var padding_top = $(current_element).css('padding-top').replace(/[^-\d\.]/g, '');
        var padding_bottom = $(current_element).css('padding-bottom').replace(/[^-\d\.]/g, '');
        var padding_left = $(current_element).css('padding-left').replace(/[^-\d\.]/g, '');
        var padding_right = $(current_element).css('padding-right').replace(/[^-\d\.]/g, '');

        $(preview_parent).find('.fc_margin_top').val(margin_top);
        $(preview_parent).find('.fc_margin_bottom').val(margin_bottom);
        $(preview_parent).find('.fc_margin_left').val(margin_left);
        $(preview_parent).find('.fc_margin_right').val(margin_right);
        $(preview_parent).find('.fc_padding_top').val(padding_top);
        $(preview_parent).find('.fc_padding_bottom').val(padding_bottom);
        $(preview_parent).find('.fc_padding_left').val(padding_left);
        $(preview_parent).find('.fc_padding_right').val(padding_right);

        //$(preview_parent).find('.fc_tool_bgc').wpColorPicker('color', background_color);
        const $bgPicker = $(preview_parent).find('.fc_tool_bgc');
        $bgPicker.val('').wpColorPicker('color', '');
        // Set the actual background color
        $bgPicker.val(background_color).wpColorPicker('color', background_color);

        $(preview_parent).find('.fc_tool_fgc').wpColorPicker('color', font_color);

       // Set Bold checkbox
        $(preview_parent).find('.font-style-bold').prop('checked', font_weight === 'bold' || font_weight === '700');

        // Set Italic checkbox
        $(preview_parent).find('.font-style-italic').prop('checked', font_style === 'italic');

        // Set Underline checkbox
        $(preview_parent).find('.font-style-underline').prop('checked', text_decoration === 'underline');

        // Set the checked alignment radio based on current text-align
        //$(preview_parent).find('input[name="flexRadioDefault"]').prop('checked', false); // Clear all first
        switch (text_align) {
            case 'left':
                $(preview_parent).find('.text-align-left').prop('checked', true);
                break;
            case 'center':
                $(preview_parent).find('.text-align-center').prop('checked', true);
                break;
            case 'right':
                $(preview_parent).find('.text-align-right').prop('checked', true);
                break;
        }


        if (background == 'none') {
            const isTransparent = background === 'none';
            $(preview_parent).find('.fc_tool_bg_transparent').prop('checked', isTransparent);
        }


        $(preview_parent).find('.fc_tool_text_lineheight').val(line_height);
        $(preview_parent).find('.fc_tool_font_size').val(font_size);

    }

    if($('.fc_view_source').length > 0){
        var editor = [];
        $('textarea[name="fc_view_source"]').each(function() {
            editor.push(wp.codeEditor.initialize(this, null));
        });
    }

    if (jQuery(".fc_templates").length > 0) {

        $('.fc_load_original').click(function() {
            if (confirm('Are you Sure?')) {
                var templates_div = $(this).closest('.fc_customizer').parent();
                $(templates_div).find('.current-temp-in-use').trigger('click');
            }

        });


        $('.custom-accordion dt div.fc-type-infowindow h4, .custom-accordion dt div.fc-type-post h4, .custom-accordion dt div.wpgmp_display_listing_item h4').on('click', function() {

            if ($(this).closest('dt').hasClass('accordion-active')) {
                setTimeout(function() {
                    editor[0].codemirror.refresh();
                    editor[1].codemirror.refresh();
                    editor[2].codemirror.refresh();
                },50);
            }
        });

        $('.fc_apply_changes').click(function() {
            var parent_div = $(this).closest('.fc_customizer');
            var templates_div = $(this).closest('.fc_customizer').parent();
            $(parent_div).find('.fc_preview').append('<div class="fc_loading"></div>');
            var textarea = $(parent_div).find('.fc_view_source'); 
            var index = $('.fc_view_source').index(textarea);  
            var template_source_code = editor[index].codemirror.getValue();
            var template = $(templates_div).find('.current-temp-in-use').data("templatename");
            var template_type = $(templates_div).find('.current-temp-in-use').data("templatetype");

            jQuery.ajax({
                type: "POST",
                url: settings_obj.ajax_url,
                dataType: 'json',
                data: {
                    action: 'core_templates',
                    operation: 'fc_load_template',
                    nonce: settings_obj.nonce,
                    template_name: template,
                    template_type: template_type,
                    template_source: template_source_code,
                    columns: $(parent_div).find('.fc-grid-active').data('col')

                },
                beforeSend: function() {},
                success: function(data) {
                    $(parent_div).parent().find('.fc-bottom-bar').show();
                    var editable_elements = settings_obj.text_editable;
                    var new_html = new DOMParser().parseFromString(data.html, "text/html").body.innerHTML;
                    //First apply the design changes to the new html.
                    var prev_html_with_designs = $(parent_div).find('.fc_preview').clone();
                    $(parent_div).find('.fc_preview').html(new_html);

                    $(prev_html_with_designs).find(".editable").each(function(index) {
                        var custom_style = {};
                        var temp_obj = $(this);
                        var type = $(this).data('temp-type');
                        custom_style[type] = {};
                        $(temp_obj).removeClass('editable');
                        $(temp_obj).removeClass('active_element');
                        var class_name = $(temp_obj).attr('class').split(' ');

                        if (class_name && class_name.length) {

                            $.each(class_name, function(k, c_name) {
                                if (c_name.indexOf('{') >= 0) {
                                    delete class_name[k];
                                }

                                class_name[k] = '.' + c_name;
                            });

                            class_name = class_name.join('');

                            var styles = $(temp_obj).attr('style');
                            $(parent_div).find('.fc_preview').find(class_name).attr('style', styles);

                        }

                    });


                    if (editable_elements.length > 0) {
                        $.each(editable_elements, function(index, ele) {
                            $(parent_div).find(ele).addClass('editable').data('editor', 'text');
                            $(parent_div).find(ele).data('temp-type', template_type + '-' + template);

                        });
                    }
                    editable_elements = settings_obj.bg_editable;
                    if (editable_elements.length > 0) {
                        $.each(editable_elements, function(index, ele) {
                            $(parent_div).find(ele).addClass('editable').data('editor', 'bg');
                            $(parent_div).find(ele).data('temp-type', template_type + '-' + template);

                        });
                    }
                    editable_elements = settings_obj.margin_editable;
                    if (editable_elements.length > 0) {
                        $.each(editable_elements, function(index, ele) {
                            $(parent_div).find(ele).addClass('editable').data('editor', 'margin');
                            $(parent_div).find(ele).data('temp-type', template_type + '-' + template);

                        });
                    }
                    editable_elements = settings_obj.full_editable;
                    if (editable_elements.length > 0) {
                        $.each(editable_elements, function(index, ele) {
                            $(parent_div).find(ele).addClass('editable').data('editor', 'full');
                            $(parent_div).find(ele).data('temp-type', template_type + '-' + template);

                        });
                    }

                    var new_sourcecode = new DOMParser().parseFromString(data.sourcecode, "text/html").body.innerHTML;
                    
                    var textarea = $(parent_div).find('.fc_view_source'); 
                    var index = $('.fc_view_source').index(textarea);
                    editor[index].codemirror.setValue(new_sourcecode);

                    setTimeout(function() {
                        editor[index].codemirror.refresh();
                    },50);
                    //Apply Styles here back

                }
            });

        });

        //Set Default Template
        $(".set-default-template").click(function(e) {
            
            var parent_div = $(this).closest('.fc_templates');

            $(".fc_customizer .fc_apply_style").removeClass('show_customizer');
            $('.fc_tool_fgc').iris('hide');
            $('.fc_tool_bgc').iris('hide');
            
            
            $('.active_element').removeClass('active_element');

            $(parent_div).find('.current_selected').removeClass('current_selected');
            $(this).addClass('current_selected');
            e.preventDefault();

            var template = $(this).data("templatename");
            var template_type = $(this).data("templatetype");
            var input = $(this).data("input");
            $('input[name="' + input + '[name]"]').val(template);
            $('input[name="' + input + '[type]"]').val(template_type);
            $(parent_div).find('.fc_tools').css('display', 'none');
            $(parent_div).find('.fc_name').css('display', 'none');
            $(parent_div).find('.current_selected').parent().parent().find('.fc_name').css('display', 'block');
            $(parent_div).find('.current_selected').closest('.fc_tools').css('display', 'block');
            $(parent_div).find('.current-temp-in-use').removeClass('current-temp-in-use');
            $(parent_div).find('.current_selected').addClass('current-temp-in-use');
            // load preview here.
            $(parent_div).find('.fc_preview').html('<div class="fc_loading"></div>');
            var ajax_data = {
                action: 'core_templates',
                operation: 'fc_load_template',
                nonce: settings_obj.nonce,
                template_name: template,
                template_type: template_type,
                columns: $(parent_div).parent().find('.fc_customizer').find('.fc-grid-active').data('col')
            };

            if ($(this).hasClass('current-saved')) {
                ajax_data.template_source = $('input[name="' + input + '[sourcecode]"]').val();
            }

            jQuery.ajax({
                type: "POST",
                url: settings_obj.ajax_url,
                dataType: 'json',
                data: ajax_data,
                beforeSend: function() {
                    $(parent_div).append('<div class="fc_loading"></div>');
                    $('.fc-btn-submit').attr("disabled","disabled");
                    $('.fc-btn-submit').prop("disabled", true);
                },
                complete: function() {
                   
                   $('.fc_loading').remove();
                   $('.fc-btn-submit').removeAttr("disabled");
                   $('.fc-btn-submit').prop("disabled", false);
                },
                success: function(data) {
                    $(parent_div).parent().find('.fc_customizer').show();
                    $(parent_div).parent().find('.fc_source_code_container').show();
                    $(parent_div).parent().find('.fc_preview').html(data.html);
                    var editable_elements = settings_obj.text_editable;
                    if (editable_elements.length > 0) {
                        $.each(editable_elements, function(index, ele) {
                            $(parent_div).parent().find(ele).addClass('editable').data('editor', 'text');
                            $(parent_div).parent().find(ele).data('temp-type', template_type + '-' + template);

                        });
                    }
                    editable_elements = settings_obj.bg_editable;
                    if (editable_elements.length > 0) {
                        $.each(editable_elements, function(index, ele) {
                            $(parent_div).parent().find(ele).addClass('editable').data('editor', 'bg');
                            $(parent_div).parent().find(ele).data('temp-type', template_type + '-' + template);

                        });
                    }
                    editable_elements = settings_obj.margin_editable;
                    if (editable_elements.length > 0) {
                        $.each(editable_elements, function(index, ele) {
                            $(parent_div).parent().find(ele).addClass('editable').data('editor', 'margin');
                            $(parent_div).parent().find(ele).data('temp-type', template_type + '-' + template);

                        });
                    }
                    editable_elements = settings_obj.full_editable;
                    if (editable_elements.length > 0) {
                        $.each(editable_elements, function(index, ele) {
                            $(parent_div).parent().find(ele).addClass('editable').data('editor', 'full');
                            $(parent_div).parent().find(ele).data('temp-type', template_type + '-' + template);

                        });
                    }
                    // $(parent_div).parent().find('.fc_view_source').val(data.sourcecode);

                    var textarea = $(parent_div).parent().find('.fc_view_source'); 
                    var index = $('.fc_view_source').index(textarea);
                    editor[index].codemirror.setValue(data.sourcecode);

                    setTimeout(function() {
                        editor[index].codemirror.refresh();
                    },50);
                }
            });

        });

        if ($('.current-temp-in-use').length > 0) {

            $('.fc_apply_changes').trigger('click');

        }

        if ($('.current-temp-in-use').length) {
            $('.current-temp-in-use').parent().parent().find('.fc_name').css('display', 'block');
            $('.current-temp-in-use').closest('.fc_tools').css('display', 'block');
        }
        
        
        // Initialize each slider
        $('.fc_templates').each(function () {
            var $slider = $(this);
            $slider.slick({
            slidesToShow: 1,
            centerMode: true,
            variableWidth: true,
            infinite: true,
            speed: 250,
            swipeToSlide: true,
            focusOnSelect: false,
            arrows: true,
            dots: false
            });
        });
          
        $('.fc_preview').on('click', 'a', function(event) {
            event.preventDefault();
        });

        setTimeout(function(){
            if ($('.current-saved').length) {
                $(" .current-saved.set-default-template").trigger('click');
            }
        }, 3000);

        $('.fc_preview').on('hover', '.editable', function(e) {

            if (e.target !== e.currentTarget) return;

            var class_name = $(this).attr('class');
            if (class_name != 'editable') {
                $(this).addClass('fc-show-editable');
            } else {
                $(this).addClass('fc-show-editable');
            }


        });

        $('.fc_preview').on('mouseout', '.editable', function(e) {
            if (e.target !== e.currentTarget) return;

            var class_name = $(this).attr('class');
            $(this).removeClass('fc-show-editable');
        });


        $('.fc_preview').on('click', '.editable', function(e) {
            var preview_parent = $(this).closest('.fc_preview').parent().parent().parent();

            $(preview_parent).find('.fc_tool_fgc').iris('hide');
            $(preview_parent).find('.fc_tool_bgc').iris('hide');

            if (e.target !== e.currentTarget) return;

            //check this
            $('.active_element').removeClass('active_element');

            $(this).addClass('fc_inline');
            var preview_pos = $(preview_parent).position();
            var preview_outer = $(preview_parent).outerWidth();

            var pos = $(this).position();
            var width = $(this).outerWidth();
            var preview_outer_width = preview_pos.left + preview_outer;
            $(this).removeClass('fc_inline');

            
            var tool_right_position = pos.left + width + 60;
            if (tool_right_position < preview_outer_width) {
                //$(preview_parent).parent().find(".fc_customizer .fc_apply_style").show();
                $(preview_parent).parent().find(".fc_customizer .fc_apply_style").addClass('show_customizer');
            } else {
                //$(preview_parent).parent().find(".fc_customizer .fc_apply_style").show();
                $(preview_parent).parent().find(".fc_customizer .fc_apply_style").addClass('show_customizer');
            }


            var class_name = $(this).attr('class');
            if (class_name != 'editable') {
                $('*[class*="' + class_name + '"]').addClass('active_element');
            } else {
                $(this).addClass('active_element');
            }

            fc_set_customizer_properties($(this));


        });

      
        $('.font-style-bold').on('change', function () {
            $('.active_element').css('font-weight', this.checked ? 'bold' : 'normal');
        });

        // Italic Toggle
        $('.font-style-italic').on('change', function () {
            $('.active_element').css('font-style', this.checked ? 'italic' : 'normal');
        });

        // Underline Toggle
        $('.font-style-underline').on('change', function () {
            $('.active_element').css('text-decoration', this.checked ? 'underline' : 'none');
        });

        // Alignments

        $('input[name="flexRadioDefault"]').on('change', function () {
            const $customizer = $(this).closest('.fc_customizer');
            const $active = $customizer.find('.active_element');
            if ($customizer.find('.text-align-left').is(':checked')) {
              $active.css('text-align', 'left');
            } else if ($customizer.find('.text-align-center').is(':checked')) {
              $active.css('text-align', 'center');
            } else if ($customizer.find('.text-align-right').is(':checked')) {
              $active.css('text-align', 'right');
            }
          });
          

        $('.fc_tool_fgc').wpColorPicker({
            change: function(event, ui) {
                $('.active_element').css('color', $(this).val());
            }
        });

        $('.fc_tool_bgc').wpColorPicker({
            change: function(event, ui) {
                $('.active_element').css('background-color', $(this).val());
            }
        });

        $('.fc_tool_bg_transparent').change(function() {
            if (this.checked) {
                $('.active_element').css('background', 'none');
            } else {
                $('.active_element').css('background-color', $('.fc-bg-control .fc_tool_bgc').val());
            }

        });


        $('.fc-font-family select').change(function() {
            var font = $(this).val();
            WebFont.load({
                google: {
                    families: [font]
                }
            });
            $('.active_element').css('font-family', font);
        });

        $('.fc_apply_style').click(function(e) {
            if (e.target !== e.currentTarget) return;
            $('.fc_tool_fgc').iris('hide');
            $('.fc_tool_bgc').iris('hide');
        });

        $('.fc-reset-style').click(function (e) {
            e.preventDefault();
            const $customizer = $(this).closest('.fc_customizer');
            const $active = $customizer.find('.active_element');
                    
            // Remove all inline styles
            $active.removeAttr('style');
          
            // Reapply default customizer state if needed
            fc_set_customizer_properties($active);
          });
          
        
        $('.fc_tool_text_italic').click(function() {
            if (!$(this).hasClass('fc-tool-active')) {
                $(this).addClass('fc-tool-active');
                $('.active_element').css('font-style', 'italic');
            } else {
                $(this).removeClass('fc-tool-active');
                $('.active_element').css('font-style', 'normal');
            }

        });

        $('.fc-forground-control .fc_tool_fgc').wpColorPicker({
            change: function(event, ui) {
                $('.active_element').css('color', $(this).val());
            }
        });

        $('.fc-bg-control .fc_tool_bgc').wpColorPicker({
            change: function(event, ui) {
                $('.active_element').css('background-color', $(this).val());
            }
        });

        jQuery('.fc-show-placeholder').on('click', function(event) {
            var parent_div = $(this).closest('.fc_supported_placeholder').parent().parent().parent();
            //$(parent_div).find('.fc-hidden-placeholder').toggle('show');
            const $placeholder = $(parent_div).find('.fc-hidden-placeholder');
            $placeholder.css('display') === 'none'
            ? $placeholder.css('display', 'flex')
            : $placeholder.css('display', 'none');

            if ($.trim($(this).val()) === 'Show Placeholder') {
                $(this).val('Hide Placeholder');
            } else {
                $(this).val('Show Placeholder');
            }
        });

        $('.fc-show-source').toggle(function() {
            var parent_div = $(this).closest('.fc-bottom-bar').parent();
            $(parent_div).find('.fc_source_code_container').show();
            $(this).val('Hide Source');
        }, function() {
            var parent_div = $(this).closest('.fc-bottom-bar').parent();
            $(parent_div).find('.fc_source_code_container').hide();
            $(this).val('View Source');
        });

        $('.fc_tool_text_lineheight').bind('keyup mouseup', function() {
            $('.active_element').css('line-height', $(this).val() + 'px');
        });
    
        $('.fc_tool_font_size').bind('keyup mouseup', function() {
            $('.active_element').css('font-size', $(this).val() + 'px');
        });

        $('.fc_margin_top').bind('keyup mouseup', function() {
            $('.active_element').css('margin-top', $(this).val() + 'px');
        });
        $('.fc_margin_bottom').bind('keyup mouseup', function() {
            $('.active_element').css('margin-bottom', $(this).val() + 'px');
        });
        $('.fc_margin_left').bind('keyup mouseup', function() {
            $('.active_element').css('margin-left', $(this).val() + 'px');
        });
        $('.fc_margin_right').bind('keyup mouseup', function() {
            $('.active_element').css('margin-right', $(this).val() + 'px');
        });
        $('.fc_padding_top').bind('keyup mouseup', function() {
            $('.active_element').css('padding-top', $(this).val() + 'px');
        });
        $('.fc_padding_bottom').bind('keyup mouseup', function() {
            $('.active_element').css('padding-bottom', $(this).val() + 'px');
        });
        $('.fc_padding_left').bind('keyup mouseup', function() {
            $('.active_element').css('padding-left', $(this).val() + 'px');
        });
        $('.fc_padding_right').bind('keyup mouseup', function() {
            $('.active_element').css('padding-right', $(this).val() + 'px');
        });

        $('.fc-show-grid').click(function() {
            var parent_div = $(this).closest('.fc-bottom-bar').parent().parent();
            $(parent_div).find('.fc_preview .fc-component-block .fc-component-content').not(':first').remove();
            $(parent_div).find('.fc-grid-active').removeClass('fc-grid-active');
            var column = $(this).data('col');
            var box_copy = $(parent_div).find('.fc_preview .fc-component-block .fc-component-content').clone(true).off();
            for (c = 1; c < column; c++) {
                $(parent_div).find('.fc_preview .fc-component-block').append(box_copy.clone());
            }
            $(this).addClass('fc-grid-active');
        });

        $('.fc-reset-design').toggle(function() {
            var parent_div = $(this).closest('.fc_customizer').parent().find('.fc_templates');
            var template = $(parent_div).find('.current-temp-in-use').data("templatename");
            var template_type = $(parent_div).find('.current-temp-in-use').data("templatetype");
            var undo = 'fc-' + template_type + '-' + template;
            $('.' + undo).addClass('fc-temp-undo').removeClass(undo);
            $(this).removeClass('fa-arrow-circle-left').addClass('fa-arrow-circle-right');
            $(this).parent().find('.fc-tooltiptext').text('View Customized');
        }, function() {
            var parent_div = $(this).closest('.fc_customizer').parent().find('.fc_templates');
            var template = $(parent_div).find('.current-temp-in-use').data("templatename");
            var template_type = $(parent_div).find('.current-temp-in-use').data("templatetype");
            var undo = 'fc-' + template_type + '-' + template;
            $('.fc-temp-undo').addClass(undo).removeClass('fc-temp-undo');
            $(this).removeClass('fa-arrow-circle-right').addClass('fa-arrow-circle-left');
            $(this).parent().find('.fc-tooltiptext').text('View Original');

        });
        $('.fc-check-responsive .fa-mobile').click(function() {
            var parent_div = $(this).closest('.fc-bottom-bar').parent();
            $(parent_div).find('.fc_preview .fc-component-block').addClass('fc-mobile-view');
        });

        $('.fc-check-responsive .fa-desktop').click(function() {
            var parent_div = $(this).closest('.fc-bottom-bar').parent();
            $(parent_div).find('.fc_preview .fc-component-block').removeClass('fc-mobile-view');
        });

        $(".fc_view_source").click(function() {
            $(".fc_customizer .fc_apply_style").removeClass('show_customizer');
            $('.fc_tool_fgc').iris('hide');
            $('.fc_tool_bgc').iris('hide');
            $('.active_element').removeClass('active_element');
        });

        $(document).keyup(function(e) {
            if (e.keyCode == 27) {
                //$(".fc_customizer .fc_apply_style").hide();
                $(".fc_customizer .fc_apply_style").removeClass('show_customizer');
                $('.fc_tool_fgc').iris('hide');
                $('.fc_tool_bgc').iris('hide');
                $('.active_element').removeClass('active_element');
            }
        });

        $(document).on('click','.fc-close-customizer',function(e) {
                e.preventDefault();
                $(".fc_customizer .fc_apply_style").removeClass('show_customizer');
                $('.fc_tool_fgc').iris('hide');
                $('.fc_tool_bgc').iris('hide');
                $('.active_element').removeClass('active_element');
        });

        $('.fc-root form').submit(function() {

            var all_custom_style = {};
            var count = 0;
            $(".editable").each(function(index) {
                var custom_style = {};
                var temp_obj = $(this);
                var type = $(this).data('temp-type');
                custom_style[type] = {};
                $(temp_obj).removeClass('editable');
                $(temp_obj).removeClass('active_element');
                var class_name = $(temp_obj).attr('class').split(' ');

                if (class_name && class_name.length) {

                    $.each(class_name, function(k, c_name) {
                        if (c_name.indexOf('{') >= 0) {
                            delete class_name[k];
                        }
                    });
                    class_name = class_name.join('.');

                    var font_weight = $(temp_obj).css('font-weight');
                    var font_size = $(temp_obj).css('font-size');
                    var font_color = $(temp_obj).css('color');
                    var font_family = $(temp_obj).css('font-family');
                    var text_align = $(temp_obj).css('text-align');
                    var line_height = $(temp_obj).css('line-height');
                    var background = $(temp_obj).css('background-color');
                    var font_style = $(temp_obj).css('font-style');
                    var text_decoration = $(temp_obj).css('text-decoration');
                    var bg_image = $(temp_obj).css('background-image');
                    var margin_top = $(temp_obj).css('margin-top');
                    var margin_bottom = $(temp_obj).css('margin-bottom');
                    var margin_left = $(temp_obj).css('margin-left');
                    var margin_right = $(temp_obj).css('margin-right');
                    var padding_top = $(temp_obj).css('padding-top');
                    var padding_bottom = $(temp_obj).css('padding-bottom');
                    var padding_left = $(temp_obj).css('padding-left');
                    var padding_right = $(temp_obj).css('padding-right');

                    var style = 'background-image:' + bg_image + ';font-family:' + font_family + ';font-weight:' + font_weight + ';font-size:' + font_size + ';color:' + font_color + ';line-height:' + line_height + ';background-color:' + background + ';font-style:' + font_style + ';text-align:' + text_align + ';text-decoration:' + text_decoration + ';margin-top:' + margin_top + ';margin-bottom:' + margin_bottom + ';margin-left:' + margin_left + ';margin-right:' + margin_right + ';padding-top:' + padding_top + ';padding-bottom:' + padding_bottom + ';padding-left:' + padding_left + ';padding-right:' + padding_right + ';';
                    custom_style[type][class_name] = style;
                    all_custom_style[count] = custom_style;
                    count++;
                }

            });

            $('#fc_custom_styles').val(JSON.stringify(all_custom_style));
            $(".fc_view_source").each(function(index, elem) {
                $(elem).closest('.fc_customizer').parent().find('.custom_sourcecode').val($(elem).val());
            });
            return true;
        });
    }
 
});
/*!
 * Generated using the Bootstrap Customizer (https://getbootstrap.com/docs/3.4/customize/)
 */

/*!
 * Bootstrap v3.4.1 (https://getbootstrap.com/)
 * Copyright 2011-2021 Twitter, Inc.
 * Licensed under the MIT license
 */

if (typeof jQuery === 'undefined') {
  throw new Error('Bootstrap\'s JavaScript requires jQuery')
}
+function ($) {
  'use strict';
  var version = $.fn.jquery.split(' ')[0].split('.')
  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
    throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4')
  }
}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.4.1'

  Alert.TRANSITION_DURATION = 150

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    selector    = selector === '#' ? [] : selector
    var $parent = $(document).find(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.closest('.alert')
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#modals
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options = options
    this.$body = $(document.body)
    this.$element = $(element)
    this.$dialog = this.$element.find('.modal-dialog')
    this.$backdrop = null
    this.isShown = null
    this.originalBodyPad = null
    this.scrollbarWidth = 0
    this.ignoreBackdropClick = false
    this.fixedContent = '.navbar-fixed-top, .navbar-fixed-bottom'

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION = '3.4.1'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (document !== e.target &&
          this.$element[0] !== e.target &&
          !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    var scrollbarWidth = this.scrollbarWidth
    if (this.bodyIsOverflowing) {
      this.$body.css('padding-right', bodyPad + scrollbarWidth)
      $(this.fixedContent).each(function (index, element) {
        var actualPadding = element.style.paddingRight
        var calculatedPadding = $(element).css('padding-right')
        $(element)
          .data('padding-right', actualPadding)
          .css('padding-right', parseFloat(calculatedPadding) + scrollbarWidth + 'px')
      })
    }
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
    $(this.fixedContent).each(function (index, element) {
      var padding = $(element).data('padding-right')
      $(element).removeData('padding-right')
      element.style.paddingRight = padding ? padding : ''
    })
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this = $(this)
      var data = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this = $(this)
    var href = $this.attr('href')
    var target = $this.attr('data-target') ||
      (href && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7

    var $target = $(document).find(target)
    var option = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element)
    // jscs:enable requireDollarBeforejQueryAssignment
  }

  Tab.VERSION = '3.4.1'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(document).find(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
        .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
        .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
          .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */

+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.4.1'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(document).find(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(document).find(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.4.1'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: https://modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // https://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

(function($) {
    "use strict";

    $(document).ready(function() {

        var fc_plugin_form = $( ".fc_plugin_form" );

        fc_plugin_form.on( "submit",function (e) {

                e.preventDefault();

                $( '#verification_mode' ).val( 'live' );

                $( ".fc-error-msg" ).remove();

                var formerror = false;

                $( "#customer_purchase_key" ).removeClass( "plugin-licence-error" );
                
                if ($( "#customer_purchase_key" ).val() == "") {
                        formerror = true;
                        $( "#customer_purchase_key" ).addClass( "plugin-licence-error" );
                }

                if (formerror)
                return false;

                // Validations passed, proceed request now.
                if ( ! formerror) {

                        $( ".fc-backend-loader" ).show();
                        var ajaxurl = 'https://www.wpmapspro.com/wp-admin/admin-ajax.php';
                        jQuery
                        .ajax(
                            {
                                type: "post",
                                dataType: "json",
                                url: ajaxurl,
                                data: fc_plugin_form.serialize(),
                            }
                        )

                        .done( function (data) { $( ".fc-backend-loader" ).hide(); } )

                        .fail( function (reason) {  $( ".fc-backend-loader" ).hide(); } )

                        .then(
                            function (data) {

                                if (typeof data.verified !== undefined && data.verified == true) {

                                    if (typeof data.codecanyon_api_call_result) {
                                        
                                        var purchase_data = data.codecanyon_api_call_result;
                                        var verification_mode = data.verification_mode;
                                        var platform          = data.platform;
                                        jQuery.ajax(
                                            {
                                                url: settings_obj.ajax_url,
                                                type: "post",
                                                dataType: "json",
                                                data: {

                                                    action: "wpdfenabledebug",
                                                    nonce: settings_obj.nonce,
                                                    purcahse_data : purchase_data,
                                                    platform : platform,
                                                    verification_mode : verification_mode

                                                },
                                            }
                                        )

                                        .done( function (data)   {  window.location.reload();  } )
                                        .fail( function (reason) {  $( ".fc-backend-loader" ).hide();  } );

                                    } 

                                } else {

                                    $( ".fc-backend-loader" ).eq( 0 ).after( '<div class="fc-12 fc-msg fc-danger fade in py-2 fc-error-msg">' + data.msg + "</div>" );
                                    $(window).scrollTop(0);  

                                }

                            }
                        );
                }

                return false;
            }
        );
        
        if($('#search_id-search-input').length > 0){ 
            $('#search_id-search-input').attr('placeholder','Please enter keywords and hit search button..');
        }

        var checked_chkboxes = [];

        $('.wp-list-table').find(':checkbox').change(function() {
        
            var temp = [];
            
            var checked_boxes = $('.wp-list-table').find(':checkbox').not('#cb-select-all-1');
            
            checked_boxes.each(function(){
                
                if($(this).is(":checked")){
                    temp.push(this.value);
                }
                
            });
            checked_chkboxes = temp;
          
        });
        
        $(document).on('click', '#doaction', function( e ) {
                
                e.preventDefault();

                if($('#bulk-action-selector-top').val() == '-1'){

                     $(".wpgmp_listing_form").submit();

                }else{

                    if($('#bulk-action-selector-top').val() == 'delete'){
                    
                        if(checked_chkboxes.length == 0){
                            alert(settings_obj.no_record_for_bulk_delete);
                            return;                           
                        }else{
                            
                            var result = confirm(settings_obj.confirm_bulk_delete);
                            if (result) {
                                $(".wpgmp_listing_form").submit();
                            }

                            
                        }
                        
                        return false;
                                
                    }else if($('#bulk-action-selector-top').val() == 'export_location_csv'){

                        $(".wpgmp_listing_form").submit();
                    }
                    
                    else{
                        
                        $('.modal-footer.delete').show();
                        $('.modal-footer.select-some').show();
                    }


                }
                  
         });

        jQuery(document).on('click', '.bulk-delete-btn', function( e ) {
      
          e.preventDefault();
          $(".wpgmp_listing_form").submit();
          
        });

        $('.delete_fc_record').click( function (event) {
            event.preventDefault();
            var triggerElement = jQuery(this); // Button that triggered the modal
            var current_id = triggerElement.data('item-id'); 
            var current_page = triggerElement.data('page-slug');
            var record_type = triggerElement.data('record-type');
            var _wpnonce = $('#_wpnonce').val();
            if(record_type == 'location_id'){
                var result = confirm(settings_obj.confirm_location_delete);
            }else if(record_type == 'map_id'){
                var result = confirm(settings_obj.confirm_map_delete);
            }else if(record_type == 'group_map_id'){
                var result = confirm(settings_obj.confirm_category_delete);
            }else{
                var result = confirm(settings_obj.confirm_record_delete);
            }
            if (result) {
                var delete_url = '?page='+current_page+'&doaction=delete&'+record_type+'='+current_id+'&_wpnonce='+_wpnonce;
                window.location.href = delete_url;
            }
            
        });

        function reindexCustomControlSections() {
            $('section:has([name*="map_control_settings"])').each(function (index) {
                $(this).find('input, select, textarea').each(function () {
                    const name = $(this).attr('name');
                    if (name) {
                        const updated = name.replace(/\[map_control_settings]\[\d+]/, `[map_control_settings][${index}]`);
                        $(this).attr('name', updated);
                    }
                });
            });
        }
        

        
        $(document).on('click', '.add_more_custom_control_setting', function (e) {
            e.preventDefault();
            const currentSection = $(this).closest('section');
            const cloned = currentSection.clone();
        
            // Clear values and update name attributes to temporary placeholder
            cloned.find('input, select, textarea').each(function () {
                const name = $(this).attr('name');
                if (name) {
                    const updated = name.replace(/\[map_control_settings]\[\d+]/, '[map_control_settings][__INDEX__]');
                    $(this).attr('name', updated);
                }
            });        
            // Insert after current section
            cloned.insertAfter(currentSection);
            $(this).removeClass('add_more_custom_control_setting').addClass('remove_custom_control_setting').text("Remove");

            // Reindex all matching sections
            reindexCustomControlSections();
        });
        
        
        $(document).on('click', '.remove_custom_control_setting', function () {
            const totalSections = $('section:has([name*="map_control_settings"])').length;
        
            if (totalSections > 1) {
                $(this).closest('section').remove();
                reindexCustomControlSections();
            } else {
                alert("At least one section is required.");
            }
        });

        

        $(".referrer_to_copy.copy_to_clipboard").click(function () { 

            var referrer_to_copy  = $(this).parent('.tooltip').prev('.referrer_to_create').val();
            navigator.clipboard.writeText(referrer_to_copy);
            $('span.tooltiptext').html(wpgmp_local.do_referrer_copy);
            $(this).find('span.tooltiptext').html(wpgmp_local.referrer_copied);
            
        });

        $('.wp-list-table .copy_to_clipboard').on('click', function(){

          $('.fc-tooltip').removeClass('active');

          var value = $(this).data('clipboard-text'); 

          var $temp = $("<input>");

          $("body").append($temp);

          $temp.val(value).select();

          document.execCommand("copy");

          $temp.remove();

          $(this).closest('.fc-tooltip').addClass('active');
          
          setTimeout(
            function() { 
             $('.fc-tooltip').removeClass('active');
             $('tr').removeClass('active');
          }, 1000);
    

        });

        if(typeof google_customizer_fonts !== 'undefined'){

            var result = Object.keys(google_customizer_fonts).map(function(key) {
              return google_customizer_fonts[key];
            });

            if (result && result.length > 0) {
                for (var i in result ) {
                    var font = result[i];

                    if (font.indexOf(',') >= 0) {
                        font = font.split(",");
                        font = font[0];
                    }
                    if (font.indexOf('"') >= 0) {
                        font = font.replace('"', '');
                        font = font.replace('"', '');
                    }
                    WebFont.load({
                        google: {
                            families: [font]
                        }
                    });

                }
            }
        }

        var wpgmp_timeouts = [];
        $('body').on('click', 'input[name="fc-geocoding-abort"]', function(e) {

            $(this).hide();
            var new_locations = $(this).parent().parent().find('.fc-location-new-set');
            var progress = $(this).parent().parent().find('.fc-geocoding-progress');
            var geocode_instructions = settings_obj.geocode_success;
            var geocode_stats = settings_obj.geocode_stats;
            for (var i = 0; i < wpgmp_timeouts.length; i++) {
                clearTimeout(wpgmp_timeouts[i]);
            }

            $('.fcdoc-loader').hide();
            $('.fc-geocoding').hide();
            $(progress).hide();
            if ($(new_locations).val() != '') {
                var final_records = JSON.parse($(new_locations).val());
                $('.wpgmp-status').html('<div class="fc-msg fc-success">' + final_records.length + " " + geocode_stats + '. ' + geocode_instructions + ".</div>").show();
                $('.fc-geocoding-updates').show();
            } else {
                $('.wpgmp-status').html('<div class="fc-msg fc-danger"> 0 ' + geocode_stats + '.</div>').show();
            }

        });
        $('body').on('click', 'input[name="fc-geocoding"]', function(e) {
            e.preventDefault();
            $(this).hide();
            $(".wpgmp_geo_adv").hide();
            $(this).parent().parent().find('.fcdoc-loader').show();
            $(this).parent().parent().find('.fc-geocoding-abort').show();
            var progress = $(this).parent().parent().find('.fc-geocoding-progress');
            var is_advanced = $("input[name='wpgmp_geo_adv']").is(":checked");
            var new_locations = $(this).parent().parent().find('.fc-location-new-set');
            var geocode_instructions = settings_obj.geocode_success;
            var geocode_stats = settings_obj.geocode_stats;
            /* Start Geocoding */
            var source_csv_records = JSON.parse($(this).parent().parent().find('.fc-location-data-set').val());
            var final_records = [];
            var delay = 1000; //0.5 second
            var object_count = 0;
            
            $.each(source_csv_records, function(id, csv_record) {
                object_count++;
            });

            var new_object_count = 0;
            const maps_provider = $('input[name="maps_provider"]').val();
            $.each(source_csv_records, function (id, csv_record) {
            wpgmp_timeouts[new_object_count] = setTimeout(function () {
                if (maps_provider === 'google') {
                // ✅ Google Maps Geocoding
                var geocoder = new google.maps.Geocoder();
                const geocode_options = { address: csv_record.address };

                if (is_advanced === true) {
                    const componentRestrictions = {};
                    if (csv_record.country) componentRestrictions.country = csv_record.country;
                    if (csv_record.postal_code) componentRestrictions.postalCode = csv_record.postal_code;
                    if (Object.keys(componentRestrictions).length > 0) {
                    geocode_options.componentRestrictions = componentRestrictions;
                    }
                    if (csv_record.state) geocode_options.region = csv_record.state;
                }

                geocoder.geocode(geocode_options, function (results, status) {
                    if (results && results.length > 0) {
                    const lat = results[0].geometry.location.lat();
                    const lng = results[0].geometry.location.lng();
                    final_records.push({ id, latitude: lat, longitude: lng });
                    $(new_locations).val(JSON.stringify(final_records));
                    $(progress).html(`${final_records.length} ${geocode_stats}.`).show();
                    }
                });

                } else if (maps_provider === 'leaflet') {
                // ✅ Leaflet / Nominatim Geocoding
                let query = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(csv_record.address)}&format=json&limit=1`;

                if (is_advanced === true) {
                    if (csv_record.country) query += `&country=${encodeURIComponent(csv_record.country)}`;
                    if (csv_record.postal_code) query += `&postalcode=${encodeURIComponent(csv_record.postal_code)}`;
                    if (csv_record.state) query += `&state=${encodeURIComponent(csv_record.state)}`;
                }

                fetch(query, { headers: { 'User-Agent': 'Leaflet-Geocoder' } })
                    .then(response => response.json())
                    .then(results => {
                    if (results && results.length > 0) {
                        const lat = results[0].lat;
                        const lng = results[0].lon;
                        final_records.push({ id, latitude: lat, longitude: lng });
                        $(new_locations).val(JSON.stringify(final_records));
                        $(progress).html(`${final_records.length} ${geocode_stats}.`).show();
                    }
                    })
                    .catch(err => console.error('Leaflet geocoding failed:', err));
                }
            }, delay);

            new_object_count++;
            delay += 500;
            });



            setTimeout(function() {
                $('.fcdoc-loader').hide();
                $('.fc-geocoding').hide();
                $('.fc-geocoding-abort').hide();
                $('.fc-geocoding-progress').hide();

                if ($(new_locations).val() != '') {
                    var final_records = JSON.parse($(new_locations).val());
                    $('.wpgmp-status').html('<div class="fc-alert fc-alert-success">' + final_records.length + " " + geocode_stats + '. ' + geocode_instructions + ".</div>").show();
                    $('.fc-geocoding-updates').show();
                } else {
                    $('.wpgmp-status').html('<div class="fc-alert fc-alert-danger"> 0 ' + geocode_stats + '.</div>').show();
                }

            }, delay + 2000);

        });
        if($('.wpgmp_datepicker').length > 0 ) {

            $('.wpgmp_datepicker').datepicker({
                dateFormat: 'dd-mm-yy'
            });
        }
        

        var wpgmp_image_id = '';
        //intialize add more...

        
        $(".wpgmp_check_key").click(function() {
            $('.wpgmp_apitest').html("...");
            var wpgmp_maps_key = $("input[name='wpgmp_api_key']").val();
            var address = 'london';
            $.get("https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=" + wpgmp_maps_key, function(data) {
            if (data.status == 'OK') { 
                     $('.wpgmp_apitest').html("<div class='fc-alert fc-alert-success'>Congratulation, the API key you created is perfect. You can now <a class='create_location_link' target='_blank' href='https://www.wpmapspro.com/docs/create-a-location-using-simple-method/'>start</a> creating maps!</div>");
                } else {
                     $('.wpgmp_apitest').html("<div class='fc-alert fc-alert-danger'>"+data.error_message+"</div>");
                }

            });
        });

        $(".cancel_import").click(function() {
            var wpgmp_bid = confirm("Do you want to cancel import process?.");
            if (wpgmp_bid == true) {
                $(this).closest("form").find("input[name='operation']").val("cancel_import");
                $(this).closest("form").submit();
                return true;
            } else {
                return false;
            }
        });

        $("select[name='map_id']").change(function() {
            $(this).closest('form').submit();
        });
        $("select[name='filter_location']").change(function(event) {

            event.preventDefault();

            var what_value = $(this).val();

            if (what_value > 0) {
                $("tr[class^='filter_group_cat']").hide();
                $(".filter_group_cat" + $(this).val()).show("slow");
            } else {
                $("tr[class^='filter_group_cat']").show("slow");
            }

        });

        $(".wpgmp_search_input").keyup(function() {
            map_id = $(this).attr("rel");
            $(".wpgmp_locations_listing[rel='" + map_id + "']").addClass("wpgmp_loading");
            wpgmp_filter_locations(map_id, 1);
        });

        $(".wpgmp_toggle_container").click(function() {
            $(".wpgmp_toggle_main_container").toggle("slow");
            if ($(this).text() == "Hide") {
                $(this).text("Show");
            } else {
                $(this).text("Hide");
            }
        });

        $(".wpgmp_mcurrent_location").click(function() {
            wpgmp_get_current_location();
        });

        $(".wpgmp-select-all").click(function() {
            var checkAll = $(".wpgmp-select-all").prop('checked');
            if (checkAll) {
                $(this).closest('table').find(".wpgmp-location-checkbox").prop("checked", true);
            } else {
                $(this).closest('table').find(".wpgmp-location-checkbox").prop("checked", false);
            }
        });

        $(".wpgmp-location-checkbox").click(function() {
            if ($(".wpgmp-location-checkbox").length == $(".wpgmp-location-checkbox:checked").length) {
                $(".wpgmp-select-all").prop("checked", true);
            } else {
                $(".wpgmp-select-all").prop("checked", false);
            }
        });


        var category_assign_table = $('#wpgmp_assign_category_tbl').dataTable({
            "lengthMenu": [
                [10, 25, 50, 100, 200, 500, -1],
                [10, 25, 50, 100, 200, 500, "All"]
            ],
            "order": [
                [2, "asc"]
            ],
            "columns": [
                { "width": "5%" },
                null,
                null,
                null
              ],
            "language": { "search":"", "searchPlaceholder": "Search..." }

        }); 

        var maptable = $('#wpgmp_google_map_data_table').dataTable({
            "lengthMenu": [
                [10, 25, 50, 100, 200, 500, -1],
                [10, 25, 50, 100, 200, 500, "All"]
            ],
            "order": [
                [1, "desc"]
            ],
            "aoColumns": [{
                sWidth: '5%',
                "bSortable": false
            }, {
                sWidth: '40%'
            }, {
                sWidth: '30%'
            }, {
                sWidth: '20%'
            }],
            "language": { "search":"", "searchPlaceholder": "Search..." }

        });

        var route_maptable = $('#wpgmp_google_map_route_data_table').dataTable({
            "lengthMenu": [
                [10, 25, 50, 100, 200, 500, -1],
                [10, 25, 50, 100, 200, 500, "All"]
            ],
            "aoColumns": [{
                sWidth: '10%'
            }, {
                sWidth: '35%'
            }, {
                sWidth: '35%'
            }, {
                sWidth: '20%'
            }]
        });

        $('input[name="save_entity_data"]').click(function () {
            var tableApi = $('#wpgmp_google_map_data_table').DataTable();
            var selected_val = [];
        
            tableApi.rows({ page: 'all' }).nodes().to$().find('input[type="checkbox"]:checked').each(function () {
                selected_val.push($(this).val());
            });
        
            $('input[name="map_locations"]').val(selected_val.join(',')); // use comma-separated string if needed
            return true;
        });
        

        $('input[name="save_entity_data"]').click(function () {
            var tableApi = category_assign_table.DataTable(); // Ensure you're using the DataTables API
            var selected_val = [];
        
            tableApi.rows({ page: 'all' }).nodes().to$().find('input[type="checkbox"]:checked').each(function () {
                selected_val.push($(this).val());
            });
        
            $('input[name="location_group_map"]').val(selected_val.join(','));
            return true;
        });
        

        $('select[name="select_all"]').change(function() {

            if ($(this).val() == 'select_all'){
                 
                $('input[name="map_locations[]"]').prop('checked',true);
                $('input[name="map_locations[]"]').attr('checked', true);
                $('input[name="select_route_way_points[]"]').prop('checked',true);
                $('input[name="select_route_way_points[]"]').attr('checked', true);

            }
            else if( $(this).val() == 'deselect_all') {
                $('input[name="map_locations[]"]').attr('checked', false);
                $('input[name="map_locations[]"]').removeAttr('checked');
                $('input[name="select_route_way_points[]"]').attr('checked', false);
                $('input[name="select_route_way_points[]"]').removeAttr('checked');

            }
            
        });

        $('input[name="save_route_data"]').click(function () {
            var tableApi = maptable.DataTable(); // make sure maptable is already initialized
            var selected_val = [];
        
            tableApi.rows({ page: 'all' }).nodes().to$().find('input[type="checkbox"]:checked').each(function () {
                selected_val.push($(this).val());
            });
        
            $('input[name="route_way_points"]').val(selected_val.join(','));
            return true;
        });
        

        $('.switch_onoff').change(function () {
           
            let target = $(this).data('target');
            
            // If radio, reset all options first
            if ($(this).attr('type') === 'radio') {
                $(target).closest('.fc-form-group').addClass('hiderow');
                target += '_' + $(this).val(); // Append suffix for selected radio value
            }
        
            const $targetGroup = $(target).closest('.fc-row');
        
            if ($(this).is(':checked')) {
                // Show by removing .hiderow safely
                $targetGroup.addClass('temp_row').removeClass('hiderow');
                // Uncheck nested switches and trigger change
            } else {
                // Hide again and recursively handle nested switches
                $targetGroup.removeClass('temp_row').addClass('hiderow');
        
                // Uncheck nested switches and trigger change
                if ($(target).hasClass('switch_onoff')) {
                    $(target).prop('checked', false).trigger('change');
                }
            }
        });
        

        $.each($('.switch_onoff'), function(index, element) {
            if (true == $(this).is(":checked")) {
                $(this).trigger("change");
            }

        });

        if($('.fc-root .color').length > 0 ) {
            $('.fc-root .color').wpColorPicker();
        }

    });

    var re = /([^&=]+)=?([^&]*)/g;
    var decodeRE = /\+/g; // Regex for replacing addition symbol with a space
    var decode = function(str) {
        return decodeURIComponent(str.replace(decodeRE, " "));
    };
    $.parseParams = function(query) {
        var params = {},
            e;
        while (e = re.exec(query)) {
            var k = decode(e[1]),
                v = decode(e[2]);
            if (k.substring(k.length - 2) === '[]') {
                k = k.substring(0, k.length - 2);
                (params[k] || (params[k] = [])).push(v);
            } else params[k] = v;
        }
        return params;
    };

    // Function to handle clicks on elements with the '.fc_tutorial_link' class
    function handleTutorialLinkClick(event) {
        // Prevent the default behavior of parent elements' click events
        event.stopPropagation();

        // Open the URL in a new tab
        const urlToOpen = $(this).attr('href');
        if (urlToOpen) {
            window.open(urlToOpen, '_blank');
        }
    }

    // Add the click event handler to all elements with the '.fc_tutorial_link' class
    $(document).on('click','.fc_tutorial_link', handleTutorialLinkClick);

    $(document).on('click','.fc-badge', function(e) {
          e.preventDefault();
          const target = $($(this).attr('href'));
          if (target.length) {
            // Open accordion section if it's collapsed (if needed)
            // For example, you can trigger a click or add `active` class
      
            $('html, body').animate({
              scrollTop: target.offset().top - 125
            }, 50);
          }
    });
      


})(jQuery);

function send_icon_to_map(imagesrc, target) {
    const $container = jQuery('#image_' + target);
    const $input = jQuery('#input_' + target);
  
    jQuery('#remove_image_' + target).show();
  
    function svgToDataUrl(svg) {
      const encoded = encodeURIComponent(svg)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');
      return `data:image/svg+xml;charset=UTF-8,${encoded}`;
    }
    
    if (imagesrc.trim().startsWith('<svg')) {
      const dataUrl = svgToDataUrl(imagesrc);
  
      // Create new <img> with data URL
      const $img = jQuery('<img>', {
        id: 'image_' + target,
        class: 'svg-preview-img',
        src: dataUrl,
        width: 40,
        height: 40
      });
  
      $container.replaceWith($img);
      console.log(imagesrc);
      // Store original SVG in the hidden input for map use
      $input.val(dataUrl);
    } else {
      $container.attr('src', imagesrc).show();
      $input.val(imagesrc);
    }
  
    tb_remove();
  }

  function submitToMailchimp() {
    const email = document.getElementById('mce-EMAIL').value;
    if (!email) return alert('Email is required');

    const form = document.createElement('form');
    form.action = '//flippercode.us10.list-manage.com/subscribe/post?u=eb646b3b0ffcb4c371ea0de1a&id=3ee1d0075d';
    form.method = 'POST';
    form.target = '_blank';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'EMAIL';
    input.value = email;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}