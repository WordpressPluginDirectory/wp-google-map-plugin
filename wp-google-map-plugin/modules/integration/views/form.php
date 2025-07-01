<?php
/**
 * This class used to manage settings page in backend.
 *
 * @author Flipper Code <hello@flippercode.com>
 * @version 1.0.0
 * @package Maps
 */

$integrations = WPGMP_Helper::wpgmp_get_all_integrations();

$active_tab = $_GET['integration'] ?? key($integrations);

$integration_slug = $_GET['integration'] ?? $active_tab;
$sub_tab = $_GET['subtab'] ?? 'settings';

$tabs = apply_filters( 'wpgmp_integration_nav_' . $integration_slug, [] );

$subnav_html = '';
foreach ( $tabs as $slug => $label ) {
    $active = ( $slug === $sub_tab ) ? 'active' : '';
    $url = admin_url( 'admin.php?page=wpgmp_form_integration&integration=' . $integration_slug . '&subtab=' . $slug );
    $subnav_html .= '<div class="fc-nav-item ' . $active . '"><a href="' . esc_url( $url ) . '" class="fc-nav-link">' . esc_html( $label ) . '</a></div>';
}

$menu = '';
$content = '';

foreach ( $integrations as $slug => $integration ) {
    $active = ($slug === $active_tab) ? 'active' : '';
    $menu .= '<div class="fc-integration-menu-item"><a href="?page=wpgmp_form_integration&integration=' . $slug . '" class="fc-integration-menu-link ' . $active . '">' . esc_html( $integration['title'] ) . '</a></div>';
}

ob_start();
do_action( 'wpgmp_render_integration_' . $active_tab );
$content = ob_get_clean();


$wpgmp_settings = get_option( 'wpgmp_settings', true );

$form = new WPGMP_Template();
$form->set_header( esc_html__( 'Integration', 'wp-google-map-plugin' ), $response, $enable = true );

if( count($integrations) > 0 ) {

$html = '
<div class="wpgmp-integration-section">
  <div class="fc-page-header">
    <h2 class="fc-page-title">Integration</h2>
  </div>
  <div class="wpgmp-integration-wrapper">
  
    <!-- Sidebar -->
    <div class="wpgmp-integration-sidebar">
      <div class="fc-integration-menu">
      <div class="fc-integration-menu-header">
        Menu
      </div>

      ' . $menu . '
      </div>
    </div>
    
    <!-- Right Section -->
    <div class="wpgmp-integration-content-area">
    
      <!-- Sub Navigation -->
      <div class="fc-header-secondary">
        <div class="fc-container">
          <div class="fc-navbar">' . $subnav_html . '</div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="fc-content-area">';
      
      ob_start();
      do_action( 'wpgmp_render_integration_' . $integration_slug . '_' . $sub_tab );
      $html .= ob_get_clean();

$html .= '
      </div>
    </div>
  </div>
</div>';

} else {
  
  $html  = '<div class="wpgmp-integration-section">';
  $html  = '<div class="fc-page-header">';
  $html .= '<h2 class="fc-page-title">' . esc_html__( 'Integration', 'wp-google-map-plugin' ) . '</h2>';
  $html .= '</div>';
  $html .= '<div class="wpgmp-integration-wrapper fc-gap-5">';
  $html .= sprintf(
    /* translators: 1: Link to addons page */
    esc_html__( 'No addons are activated right now. Please check our addons here: %s', 'wp-google-map-plugin' ),
    '<a href="' . esc_url( 'https://weplugins.com/shop' ) . '" target="_blank" rel="noopener noreferrer">' . esc_html__( 'View Addons', 'wp-google-map-plugin' ) . '</a>'
  );
  
  $html .= '</div></div>';


}
$form->add_element(
	'html', 'integration_div', array(
		'html'   => $html,
		'before' => '<div class="fc-12 integration_div">',
		'after'  => '</div>',
	)
);


$form->add_element(	'hidden', 'wpgmp_version', array( 'value' => WPGMP_VERSION )	);
$form->render();