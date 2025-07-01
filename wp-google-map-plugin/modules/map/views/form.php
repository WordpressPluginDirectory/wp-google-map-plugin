<?php
/**
 * Template for Add & Edit Map
 *
 * @author  Flipper Code <hello@flippercode.com>
 * @package Maps
 */

if ( isset( $_REQUEST['_wpnonce'] ) ) {

	$nonce = sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) );

	if ( ! wp_verify_nonce( $nonce, 'wpgmp-nonce' ) ) {

		die( 'Cheating...' );

	} else {
		$data = $_POST;
	}
}

if(function_exists('wp_enqueue_code_editor'))
      wp_enqueue_code_editor(array('type' => 'text/html'));

global $wpdb;
$modelFactory = new WPGMP_Model();
$map_obj      = $modelFactory->create_object( 'map' );
if ( isset( $_GET['doaction'] ) and 'edit' == $_GET['doaction'] and isset( $_GET['map_id'] ) ) {
	$map_obj = $map_obj->fetch( array( array( 'map_id', '=', intval( wp_unslash( $_GET['map_id'] ) ) ) ) );
	$map     = $map_obj[0];
	if ( ! empty( $map ) ) {
		$map->map_street_view_setting     = maybe_unserialize( $map->map_street_view_setting );
		$map->map_route_direction_setting = maybe_unserialize( $map->map_route_direction_setting );
		$map->map_all_control             = maybe_unserialize( $map->map_all_control );
		$map->map_info_window_setting     = maybe_unserialize( $map->map_info_window_setting );
		$map->style_google_map            = maybe_unserialize( $map->style_google_map );
		$map->map_locations               = maybe_unserialize( $map->map_locations );
		$map->map_layer_setting           = maybe_unserialize( $map->map_layer_setting );
		$map->map_polygon_setting         = maybe_unserialize( $map->map_polygon_setting );
		$map->map_polyline_setting        = maybe_unserialize( $map->map_polyline_setting );
		$map->map_cluster_setting         = maybe_unserialize( $map->map_cluster_setting );
		$map->map_overlay_setting         = maybe_unserialize( $map->map_overlay_setting );
		$map->map_infowindow_setting      = maybe_unserialize( $map->map_infowindow_setting );
		$map->map_geotags                 = maybe_unserialize( $map->map_geotags );
	}

	$data = (array) $map;
} elseif ( ! isset( $_GET['doaction'] ) and isset( $response['success'] ) ) {
	// Reset $_POST object for antoher entry.
	unset( $data );
}

$wpgmp_settings = get_option( 'wpgmp_settings', true );

$quick_tags = [
	'map_location_listing'    => esc_html__('Marker','wp-google-map-plugin' ),
	'map_infowindow_settings' => esc_html__('Infowindow','wp-google-map-plugin' ),
	'map_geotags_settings'    => esc_html__('Posts','wp-google-map-plugin' ),
	'map_listing_setting'     => esc_html__('Listing','wp-google-map-plugin' ),
	'map_filters_setting'     => esc_html__('Filters','wp-google-map-plugin' ),
];

$form = new WPGMP_Template();
$form->set_header( esc_html__( 'Enter Map Information', 'wp-google-map-plugin' ), $response, $enable = true, esc_html__( 'Manage Maps', 'wp-google-map-plugin' ), 'wpgmp_manage_map',$quick_tags );

if(WPGMP_Helper::wpgmp_is_leaflet_enabled()) {

	$form->add_element(
		'message', 'wpgmp_features_message', array(
			'value'  => WPGMP_Helper::wpgmp_features_limits_msg(),
			'class'  => 'fc-alert fc-alert-info',
			'before' => '<div class="fc-12 ">',
			'after'  => '</div>',
		)
	);
	
}

$form->add_element(
	'group', 'map_info', array(
		'value'  => esc_html__( 'Enter Map Information', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link'=> 'https://www.wpmapspro.com/docs/how-to-create-a-map/'
	)
);

if ( !isset($wpgmp_settings['wpgmp_api_key']) || $wpgmp_settings['wpgmp_api_key'] == '' ) {

	$link = '<a target="_blank" href="https://www.wpmapspro.com/docs/get-a-google-maps-api-key/">'.esc_html__("create google maps api key","wp-google-map-plugin").'</a>';
	$setting_link = '<a target="_blank" href="' . admin_url( 'admin.php?page=wpgmp_manage_settings' ) . '">'.esc_html__("here","wp-google-map-plugin").'</a>';

	$form->add_element(
		'message', 'wpgmp_key_required', array(
			'value'  => sprintf( esc_html__( 'Google Maps API Key is missing. Follow instructions to %1$s and then insert your key %2$s.', 'wp-google-map-plugin' ), $link, $setting_link ),
			'class'  => 'fc-alert fc-alert-danger',
			'before' => '<div class="fc-12 wpgmp_key_required">',
			'after'  => '</div>',
		)
	);

}

require 'map-forms/general-setting-form.php';
require 'map-forms/mobile-specific-settings.php';
require 'map-forms/map-center-settings.php';
require 'map-forms/locations-form.php';
require 'map-forms/geotag-form.php';
require 'map-forms/infowindow-settings.php';
require 'map-forms/tab-setting-form.php';
require 'map-forms/listing-setting-form.php';
require 'map-forms/url-filter.php';

require 'map-forms/route-direction-form.php';
require 'map-forms/map-ui.php';
require 'map-forms/map-style-setting-form.php';
require 'map-forms/control-setting-form.php';
require 'map-forms/control-position-style-form.php';
require 'map-forms/custom-control-form.php';
require 'map-forms/street-view-setting-form.php';
require 'map-forms/marker-cluster-setting-form.php';
require 'map-forms/overlapping-marker-spider-effect.php';
require 'map-forms/overlay-setting-form.php';
require 'map-forms/limit-panning-setting-form.php';
require 'map-forms/google-maps-amenities.php';
require 'map-forms/extra-settings.php';
require 'map-forms/import-maps.php';


require 'map-forms/extensible-settings.php';
$form->add_element(
	'extensions', 'wpgmp_map_form', array(
		'value'  => $data,
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
	)
);
$form->add_element(
	'submit', 'save_entity_data', array(
		'value' => esc_html__( 'Save Map', 'wp-google-map-plugin' ),
	)
);
$form->add_element(
	'hidden', 'operation', array(
		'value' => 'save',
	)
);
$form->add_element(
	'hidden', 'map_locations', array(
		'value' => '',
	)
);
$form->add_element(
	'hidden', 'map_all_control[fc_custom_styles]', array(
		'value' => '',
		'id'    => 'fc_custom_styles',
	)
);
if ( isset( $_GET['doaction'] ) and 'edit' == $_GET['doaction'] and isset( $_GET['map_id'] ) ) {

	$form->add_element(
		'hidden', 'entityID', array(
			'value' => intval( wp_unslash( $_GET['map_id'] ) ),
		)
	);
}
$form->render();
