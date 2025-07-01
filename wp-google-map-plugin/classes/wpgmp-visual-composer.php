<?php

class WPGMP_VC_Builder{

	public function __construct() {	}

	public function wpgmp_register_vc_component(){

		global $wpdb;

		$map_options = array();

		$map_options[ esc_html__( 'Select Map', 'wp-google-map-plugin' ) ] = '';
		$map_records = $wpdb->get_results( 'SELECT map_id,map_title FROM ' . TBL_MAP . '' );

		if ( ! empty( $map_records ) ) {
			foreach ( $map_records as $key => $map_record ) {
				$map_options[ $map_record->map_title ] = $map_record->map_id;
			}
		}

		$shortcodeParams = array();

		$shortcodeParams[] = array(
			'type'        => 'dropdown',
			'heading'     => esc_html__( 'Choose Maps', 'wp-google-map-plugin' ),
			'param_name'  => 'id',
			'description' => esc_html__( 'Choose here the map you want to show.', 'wp-google-map-plugin' ),
			'value'       => $map_options,
		);

		$wpgmp_maps_component = array(
			'name'        => esc_html__( 'WP Maps Pro', 'wp-google-map-plugin' ),
			'base'        => 'put_wpgm',
			'class'       => '',
			'category'    => esc_html__( 'Content', 'wp-google-map-plugin' ),
			'description' => esc_html__( 'Google Maps', 'wp-google-map-plugin' ),
			'params'      => $shortcodeParams,
			'icon'        => WPGMP_IMAGES . 'flippercode.png',
		);
		vc_map( $wpgmp_maps_component );

	}
	

}