<?php
/**
* Parse Shortcode and display maps.
* @package Maps
* @author Flipper Code <hello@flippercode.com>
*/
do_action('wpgmp_before_map');

$wpgmp_settings = get_option( 'wpgmp_settings', true );

$auto_fix = '';

$options = apply_filters('wpgmp_shortcode_params', $options);

if ( isset( $options['id'] ) ) {
$map_id = $options['id'];
} else { return ''; }

if ( isset($wpgmp_settings['wpgmp_gdpr']) && $wpgmp_settings['wpgmp_gdpr'] == true ) {

	$wpgmp_accept_cookies = apply_filters( 'wpgmp_accept_cookies', false );

	if ( $wpgmp_accept_cookies == false ) {

		if ( isset( $wpgmp_settings['wpgmp_gdpr_msg'] ) and $wpgmp_settings['wpgmp_gdpr_msg'] != '' ) {
			return '<div class="wpgmp-message-container"><div class="no-cookie-accepted">'.$wpgmp_settings['wpgmp_gdpr_msg'].'</div></div>';
		} else {
			return apply_filters( 'wpgmp_nomap_notice', '', $map_id );
		}
	}
}

if ( isset( $options['show'] ) ) {
$show_option = $options['show'];
} else {
$show_option = 'default' ;
}
$shortcode_filters = array();
if ( isset( $options['category'] ) ) {
$shortcode_filters['category'] = $options['category'];
}
// Fetch map information.
$modelFactory = new WPGMP_Model();
$map_obj = $modelFactory->create_object( 'map' );
$map_record = $map_obj->fetch( array( array( 'map_id', '=', $map_id ) ) );

if(isset($map_record[0]) && !empty($map_record[0])) {
$map = $map_record[0];

if(!empty($map)) {
$map->map_street_view_setting = maybe_unserialize( $map->map_street_view_setting );
$map->map_all_control = maybe_unserialize( $map->map_all_control );
$map->map_info_window_setting = maybe_unserialize( $map->map_info_window_setting );
$map->map_locations = maybe_unserialize( $map->map_locations );
$map->map_layer_setting = maybe_unserialize( $map->map_layer_setting );
$map->map_cluster_setting = unserialize( $map->map_cluster_setting );
$map->map_infowindow_setting = maybe_unserialize( $map->map_infowindow_setting );
}

$category_obj = $modelFactory->create_object( 'group_map' );
$categories = $category_obj->fetch();
$all_categories = array();
$all_child_categories = array();
$all_categories_name = array();
$location_obj = $modelFactory->create_object( 'location' );

if ( ! empty( $categories ) ) {
foreach ( $categories as $category ) {
$all_categories[ $category->group_map_id ] = $category;
$all_categories_name[ sanitize_title( $category->group_map_title ) ] = $category;
if($category->group_parent > 0)
$all_child_categories[$category->group_map_id] = $category->group_parent;
}
}

if ( ! empty( $map->map_locations ) ) {
$map_locations = $location_obj->fetch( array( array( 'location_id', 'IN', implode( ',',$map->map_locations ) ) ) );
}
$location_criteria = array(
'show_all_locations' => false,
'catetory__in' => false,
'catetory__not_in' => false,
'limit' => 0,
);

$location_criteria = apply_filters('wpgmp_location_criteria',$location_criteria,$map);

if( isset($location_criteria['show_all_locations']) and $location_criteria['show_all_locations'] == true ) {
$map_locations = $location_obj->fetch();
}


if( isset($location_criteria['limit']) and $location_criteria['limit'] > 0 ) {
$how_many = intval($location_criteria['limit']);
$map_locations = array_slice($map_locations,0,$how_many);
}

$apply_category_in = false;
$apply_category_not_in = false;

if( isset($location_criteria['category__in']) and is_array($location_criteria['category__in']) ) {
$apply_category_in = true;
}

if( isset($location_criteria['category__not_in']) and is_array($location_criteria['category__not_in']) ) {
$apply_category_not_in = true;
}

if ( ! isset( $map->map_all_control['fit_bounds'] ) ) {
	$map->map_all_control['fit_bounds'] = false;
}

$map_data = array();
// Set map options.
$map_data['places'] = array();
if ( isset($map->map_all_control['infowindow_openoption']) && $map->map_all_control['infowindow_openoption'] == 'mouseclick' ) {
$map->map_all_control['infowindow_openoption'] = 'click';
} else if ( isset($map->map_all_control['infowindow_openoption']) && $map->map_all_control['infowindow_openoption'] == 'mousehover' ) {
$map->map_all_control['infowindow_openoption'] = 'mouseover';
} else if ( isset($map->map_all_control['infowindow_openoption']) && $map->map_all_control['infowindow_openoption'] == 'mouseover' ) {
$map->map_all_control['infowindow_openoption'] = 'mouseover';
} else {
$map->map_all_control['infowindow_openoption'] = 'click';
}

$infowindow_setting = isset($map->map_all_control['infowindow_setting'])? $map->map_all_control['infowindow_setting']: '';

$infowindow_sourcecode = apply_filters('wpgmp_infowindow_message',do_shortcode($infowindow_setting) , $map );
if ( ! isset( $map->map_all_control['search_control'] ) )
$map->map_all_control['search_control'] = false;

$map_data['map_options'] = array(
'center_lat' => sanitize_text_field( $map->map_all_control['map_center_latitude'] ),
'center_lng' => sanitize_text_field( $map->map_all_control['map_center_longitude'] ),
'zoom' => (isset( $options['zoom'] )) ? intval( $options['zoom'] ): intval( $map->map_zoom_level ),
'map_type_id' => sanitize_text_field( $map->map_type ),
'fit_bounds'  => ( 'true' == sanitize_text_field( $map->map_all_control['fit_bounds'] ) ),
'draggable' => (!isset($map->map_all_control['map_draggable']) || sanitize_text_field( $map->map_all_control['map_draggable'] ) != 'false'),
'scroll_wheel' => (sanitize_text_field( $map->map_scrolling_wheel ) != 'false'),
'display_45_imagery' => sanitize_text_field( $map->map_45imagery ),
'marker_default_icon' => (isset( $map->map_all_control['marker_default_icon'] ) ) ? esc_url( $map->map_all_control['marker_default_icon'] ) : WPGMP_IMAGES.'default_marker.png',
'infowindow_setting' => wpautop( wp_unslash( $infowindow_sourcecode ) ),
'infowindow_bounce_animation' => (isset( $map->map_all_control['infowindow_bounce_animation'] ) ) ? $map->map_all_control['infowindow_bounce_animation'] : '',
'infowindow_drop_animation' => (isset($map->map_all_control['infowindow_drop_animation']) && 'true' == $map->map_all_control['infowindow_drop_animation'] ),
'close_infowindow_on_map_click' => (isset($map->map_all_control['infowindow_close']) && 'true' == $map->map_all_control['infowindow_close'] ),
'infowindow_skin'                => ( isset( $map->map_all_control['location_infowindow_skin'] ) ) ? $map->map_all_control['location_infowindow_skin'] : '',
'default_infowindow_open' => (isset($map->map_all_control['infowindow_open']) && 'true' == $map->map_all_control['infowindow_open'] ),
'infowindow_open_event' => ($map->map_all_control['infowindow_openoption']) ? $map->map_all_control['infowindow_openoption'] : 'click',
'full_screen_control' => (!isset($map->map_all_control['full_screen_control']) || $map->map_all_control['full_screen_control'] != 'false'),
'search_control' => (!isset($map->map_all_control['search_control']) || $map->map_all_control['search_control'] != 'false'),
'zoom_control' => (!isset($map->map_all_control['zoom_control']) || $map->map_all_control['zoom_control'] != 'false'),
'map_type_control' => (!isset($map->map_all_control['map_type_control']) || $map->map_all_control['map_type_control'] != 'false'),
'street_view_control' => (!isset($map->map_all_control['street_view_control']) || $map->map_all_control['street_view_control'] != 'false'),
'full_screen_control_position' => (isset( $map->map_all_control['full_screen_control_position'] ) ) ? $map->map_all_control['full_screen_control_position'] : 'TOP_RIGHT',
'search_control' => (!isset($map->map_all_control['search_control']) || $map->map_all_control['search_control'] != 'false'),
'search_control_position' => ( isset($map->map_all_control['search_control_position']) && !empty($map->map_all_control['search_control_position'])) ? $map->map_all_control['search_control_position'] : 'TOP_LEFT',
'zoom_control_position' => $map->map_all_control['zoom_control_position'],
'map_type_control_position' => $map->map_all_control['map_type_control_position'],
'map_type_control_style' => $map->map_all_control['map_type_control_style'],
'street_view_control_position' => $map->map_all_control['street_view_control_position'],
'map_control' => (!isset($map->map_all_control['map_control']) || $map->map_all_control['map_control'] != 'false'),
'map_control_settings' => (isset($map->map_all_control['map_control_settings'])),
'map_zoom_after_search' => apply_filters('map_zoom_after_search',6),
);

$map_data['map_options']['width'] = sanitize_text_field( $map->map_width );

$map_data['map_options']['height'] = sanitize_text_field( $map->map_height );

$map_data['map_options'] = apply_filters( 'wpgmp_maps_options',$map_data['map_options'],$map );

if ( isset( $map_data['map_options']['width'] ) ) {
$width = $map_data['map_options']['width'];
} else { 	$width = '100%'; }

if ( isset( $map_data['map_options']['height'] ) ) {
$height = $map_data['map_options']['height'];
} else { 	$height = '300px'; }

if ( '' != $width and strstr( $width, '%' ) === false ) {
$width = str_replace( 'px', '', $width ).'px';
}

if ( '' == $width ) {
$width = '100%';
}
if ( strstr( $height, '%' ) === false ) {
$height = str_replace( 'px', '', $height ).'px';
}

wp_enqueue_script( 'wpgmp-google-map-main' );
wp_enqueue_script( 'wpgmp-google-api' );
wp_enqueue_script( 'wpgmp-frontend' );
wp_enqueue_style('wpgmp-frontend_css'); 
if ( isset($map_locations) && is_array( $map_locations ) && !empty($map_locations) ) {
$loc_count = 0;
foreach ( $map_locations as $location ) {
$location_categories = array();
$is_continue = true;

if ( empty( $location->location_group_map ) || empty( $location->location_group_map[0] )) {
	$icon = (isset($map_data['map_options']['marker_default_icon']) && !empty($map_data['map_options']['marker_default_icon'])) ? $map_data['map_options']['marker_default_icon'] : WPGMP_IMAGES.'default_marker.png';
	$icon = str_replace('wp-google-map-gold', 'wp-google-map-plugin', $icon);
	$location_categories[] = array(
	'id'      => '',
	'name'    => '',
	'type'    => 'category',
	'extension_fields' => array(),
	'icon'    => $icon,
	);

} else {
	 if( isset($location->location_group_map) && !empty($location->location_group_map)) {
		foreach ( $location->location_group_map as $key => $loc_category_id ) {
			
			if(isset($all_categories[ $loc_category_id ]))
			$loc_category = $all_categories[ $loc_category_id ];

			if( $apply_category_in == true ) {
			if( !in_array( $loc_category_id, $location_criteria['category__in'] ) and !in_array( strtolower($loc_category->group_map_title), $location_criteria['category__in'] ) ) {
			$is_continue = false;
			}
			}

			if( $apply_category_not_in == true ) {
			if( in_array( $loc_category_id, $location_criteria['category__not_in'] ) or in_array( strtolower($loc_category->group_map_title), $location_criteria['category__not_in'] ) ) {
			$is_continue = false;
			}
			}

			if ( ! empty( $loc_category ) ) {
			$location_categories[] = array(
			'id'      => $loc_category->group_map_id,
			'name'    => $loc_category->group_map_title,
			'type'    => 'category',
			'extension_fields' => array(),
			'icon'    => $loc_category->group_marker,
			);
			}
		}
	}	
}
if( $is_continue == false) {
continue;
}
// Extra Fields in location.

if ( isset( $location->location_settings['featured_image'] ) and $location->location_settings['featured_image'] != '' ){
	$marker_image = "<div class='fc-feature-img'><img loading='lazy' decoding='async' alt='" . esc_attr( $location->location_title ) . "' src='" . $location->location_settings['featured_image'] . "' class='wpgmp_marker_image fc-item-featured_image fc-item-large' /></div>";
} else {
	$marker_image = '';
}

$extra_fields = (!isset($extra_fields)) ? '' : $extra_fields;
$extra_fields_filters = (!isset($extra_fields_filters)) ? '' : $extra_fields_filters;



$onclick = isset( $location->location_settings['onclick'] ) ? $location->location_settings['onclick'] : 'marker';
$icon = (isset($map_data['map_options']['marker_default_icon']) && !empty($map_data['map_options']['marker_default_icon'])) ? $map_data['map_options']['marker_default_icon'] : WPGMP_IMAGES.'default_marker.png';

$map_data['places'][ $loc_count ] = array(
'id'          => $location->location_id,
'title'       => $location->location_title,
'address'     => $location->location_address,
'source'	  => 'manual',
'content'     => ('' != $location->location_messages) ? do_shortcode( stripcslashes( $location->location_messages ) ) : $location->location_title,
'location' => array(
'icon'      => (isset($location_categories[0]['icon'])) ? $location_categories[0]['icon'] : $icon,
'lat'       => $location->location_latitude,
'lng'       => $location->location_longitude,
'city'      => $location->location_city,
'state'     => $location->location_state,
'country'   => $location->location_country,
'onclick_action' => $onclick,
'redirect_custom_link' => isset($location->location_settings['redirect_link'] ) ? $location->location_settings['redirect_link'] : '' ,
'marker_image' => $marker_image,
'open_new_tab' => isset( $location->location_settings['redirect_link_window'] ) ? $location->location_settings['redirect_link_window'] : '',
'postal_code' => $location->location_postal_code,
'draggable' => ( 'true' == $location->location_draggable ),
'infowindow_default_open' => ('true' == $location->location_infowindow_default_open),
'animation' => $location->location_animation,
'infowindow_disable' => (!isset($location->location_settings['hide_infowindow']) || $location->location_settings['hide_infowindow'] !== 'false'),
'zoom'      => 5,
'extra_fields' => $extra_fields),
'categories' => $location_categories,
'custom_filters' => $extra_fields_filters,
);

$loc_count++;
}
}


if ( ! empty( $map->map_layer_setting['choose_layer']['bicycling_layer'] ) && $map->map_layer_setting['choose_layer']['bicycling_layer'] == 'BicyclingLayer' ) {
$map_data['bicyle_layer'] = array(
'display_layer' => true,
);

if(isset($map_data['bicycling_layer']))
$map_data['bicycling_layer'] = apply_filters('wpgmp_bicycling_layer',$map_data['bicycling_layer'],$map);

}

if ( ! empty( $map->map_layer_setting['choose_layer']['traffic_layer'] ) && $map->map_layer_setting['choose_layer']['traffic_layer'] == 'TrafficLayer' ) {
$map_data['traffic_layer']  = array(
'display_layer' => true,
);

$map_data['traffic_layer'] = apply_filters('wpgmp_traffic_layer',$map_data['traffic_layer'],$map);

}

if ( ! empty( $map->map_layer_setting['choose_layer']['transit_layer'] ) && $map->map_layer_setting['choose_layer']['transit_layer'] == 'TransitLayer' ) {
$map_data['transit_layer']  = array(
'display_layer' => true,
);

$map_data['transit_layer'] = apply_filters('wpgmp_transit_layer',$map_data['transit_layer'],$map);

}

// Here loop through all places and apply filter. Shortcode Awesome.
$filterd_places = array();
$render_shortcode = apply_filters('wpgmp_render_shortcode',true,$map);
if ( is_array( $map_data['places'] ) ) {

foreach ( $map_data['places'] as $place ) {
$use_me = true;

// Category filter here.
if ( isset( $shortcode_filters['category'] ) ) {
$found_category = false;
$show_categories_only = explode( ',', strtolower($shortcode_filters['category']) );

foreach ( $place['categories'] as $cat ) {
if ( in_array( strtolower( $cat['name'] ),$show_categories_only ) or in_array( strtolower( $cat['id'] ),$show_categories_only ) ) {
$found_category = true;
}
}
if ( false == $found_category ) {
$use_me = false;
}
}

if( true == $render_shortcode ) {
$place['content'] = do_shortcode($place['content']);	
}

$use_me = apply_filters( 'wpgmp_show_place',$use_me,$place,$map );

if ( true == $use_me ) {
$filterd_places[] = $place;
}
}
unset( $map_data['places'] );
}
$map_data['places'] = apply_filters( 'wpgmp_markers',$filterd_places, $map->map_id );

if ( '' == $map_data['map_options']['center_lat'] && isset($map_data['places'][0]['location']['lat'])) {
$map_data['map_options']['center_lat'] = $map_data['places'][0]['location']['lat'];
}

if ( '' == $map_data['map_options']['center_lng'] && isset($map_data['places'][0]['location']['lat']) ) {
$map_data['map_options']['center_lng'] = $map_data['places'][0]['location']['lng'];
}

/*
* START Snazzy Maps 
*/
if (  isset($map->map_all_control['custom_style']) && $map->map_all_control['custom_style'] != '' ) {
	$map_data['styles'] = stripslashes( $map->map_all_control['custom_style'] );
} else {
	$map_data['styles'] = '';
}
$map_data['styles'] = apply_filters( 'wpgmp_map_styles', $map_data['styles'], $map );
/*
* END Snazzy Maps 
*/

//Display Category Filter
if ( ! empty( $map->map_all_control['display_listing'] ) && $map->map_all_control['display_listing'] == true ) {

	if ( ! isset( $map->map_all_control['wpgmp_display_category_filter'] ) ) {
		$map->map_all_control['wpgmp_display_category_filter'] = false;
	}
	$map_data['listing'] = array(
		'listing_header' => (! empty($map->map_all_control['wpgmp_before_listing']) ? $map->map_all_control['wpgmp_before_listing'] : esc_html__( 'Filter Locations', 'wp-google-map-plugin' )),
		'display_category_filter'          => ( $map->map_all_control['wpgmp_display_category_filter'] == 'true' ),
		'filters'                          => array( 'place_category' ),
	);
} else {
	$map_data['listing'] = '';
}
$map_data['listing']      = apply_filters( 'wpgmp_listing', $map_data['listing'], $map );

// Marker cluster.
if ( ! empty( $map->map_cluster_setting['marker_cluster'] ) && $map->map_cluster_setting['marker_cluster'] == 'true' ) {

	if ( ! isset( $map->map_cluster_setting['marker_cluster_style'] ) ) {
		$map->map_cluster_setting['marker_cluster_style'] = false;
	}

	$map_data['marker_cluster'] = array(
		'grid'              => $map->map_cluster_setting['grid'],
		'max_zoom'          => $map->map_cluster_setting['max_zoom'],
		'image_path'        => WPGMP_IMAGES . 'm',
		'icon'              => WPGMP_IMAGES . 'cluster/' . $map->map_cluster_setting['icon'],
		'hover_icon'        => WPGMP_IMAGES . 'cluster/' . $map->map_cluster_setting['hover_icon'],
		'apply_style'       => ( $map->map_cluster_setting['marker_cluster_style'] == 'true' ),
		'marker_zoom_level' => ( isset( $map->map_cluster_setting['location_zoom'] ) ? $map->map_cluster_setting['location_zoom'] : 10 ),
	);
} else {
	$map_data['marker_cluster'] = '';
}

$map_data['marker_cluster'] = apply_filters( 'wpgmp_map_markercluster', $map_data['marker_cluster'], $map );

// Street view.
if ( isset($map->map_street_view_setting['street_control']) && $map->map_street_view_setting['street_control'] == 'true' ) {
$map_data['street_view'] = array(
'street_control'            => ( isset($map->map_street_view_setting['street_control']) ) ? true : false,
'street_view_close_button'  => ( isset($map->map_street_view_setting['street_view_close_button']) && $map->map_street_view_setting['street_view_close_button'] === 'true' ) ? true : false,
'links_control'             => ( isset($map->map_street_view_setting['links_control']) &&  $map->map_street_view_setting['links_control'] == 'true') ? true : false,
'street_view_pan_control'   => ( isset($map->map_street_view_setting['street_view_pan_control']) && $map->map_street_view_setting['street_view_pan_control'] === 'true' ) ? true : false,
'pov_heading'				=> $map->map_street_view_setting['pov_heading'],
'pov_pitch'					=> $map->map_street_view_setting['pov_pitch'],
);
}

if(isset($map_data['street_view']))
$map_data['street_view'] = apply_filters('wpgmp_map_streetview',$map_data['street_view'],$map);

$map_data['map_property'] = array(
	'map_id'     => $map->map_id,
	'debug_mode' => ( isset($wpgmp_settings['wpgmp_debug_mode']) && $wpgmp_settings['wpgmp_debug_mode'] == 'true' ),
);
/*
* START Addtional css
*/
$map_output = '';
if (  isset($map->map_all_control['additional_css']) && $map->map_all_control['additional_css'] != '' ) {
	$map_output.= '<style>'.stripslashes( $map->map_all_control['additional_css'] ).'</style>';
} 


if ( !empty( $map->map_all_control['location_infowindow_skin'] ) and is_array( $map->map_all_control['location_infowindow_skin'] )  ) {
	$skin_data = $map->map_all_control['location_infowindow_skin'];
	$css_file  = WPGMP_URL . 'templates/' . $skin_data['type'] . '/' . $skin_data['name'] . '/' . $skin_data['name'] . '.css';
	wp_enqueue_style( 'fc-wpgmp-' . $skin_data['type'] . '-' . $skin_data['name'], $css_file );
	if($skin_data['name'] == 'basic'){
		$map_output.= '<style>.gm-style-iw { line-height: inherit !important;}</style>';
	}
}else{
	$map_output.= '<style>.gm-style-iw { line-height: inherit !important;}</style>';
}
/*
* END Addtional css
*/

$map_output.= '<div class="wpgmp_map_container '.apply_filters('wpgmp_container_class','wpgmp-map-'.$map->map_id,$map).'" rel="map'.$map->map_id.'">';

/* Search Control over map */
if ( $map->map_all_control['search_control'] == 'true' ) {
	$map_output .= '<input data-input="map-search-control" placeholder="' . esc_html__( apply_filters('wpgmp_search_bar_placeholder', 'Type here...', $map ), 'wp-google-map-plugin' ) . '" type="text">';
}


$map_div  = apply_filters('wpgmp_before_map','',$map);

$map_div .= '<div class="wpgmp_map_parent"><div class="wpgmp_map '.apply_filters('wpgmp_map_container_class','',$map).'" style="width:'.$width.'; height:'.$height.';" id="map'.$map->map_id.'" ></div></div>';

$map_div .= apply_filters('wpgmp_after_map','',$map);

$output = $map_div;

$listing_div = apply_filters( 'wpgmp_before_listing', '', $map );
if ( ! empty( $map->map_all_control['display_listing'] ) && $map->map_all_control['display_listing'] == true ) {
	$listing_div .= '<div class="location_listing' . $map->map_id . ' ' . apply_filters( 'wpgmp_listing_class', '', $map ) . '" style="float:left; width:100%;"></div>';
}

$listing_div .= apply_filters( 'wpgmp_after_listing', '', $map );




$output = $map_div.$listing_div;

$map_output.= apply_filters( 'wpgmp_before_container','',$map);
$map_output .= apply_filters( 'wpgmp_map_output', $output, $map_div, $listing_div, $map->map_id );
$map_output.= apply_filters( 'wpgmp_after_container','',$map);

$map_output .= '</div>';

if ( isset( $map->map_all_control['fc_custom_styles'] ) ) {
	$fc_custom_styles = json_decode( $map->map_all_control['fc_custom_styles'], true );
	if ( ! empty( $fc_custom_styles ) && is_array( $fc_custom_styles ) ) {
		$fc_skin_styles = '';
		$font_families  = array();

		foreach ( $fc_custom_styles as $fc_style ) {
			if ( is_array( $fc_style ) ) {
				foreach ( $fc_style as $skin => $class_style ) {
					if ( is_array( $class_style ) ) {
						foreach ( $class_style as $class => $style ) {
							$ind_style         = explode( ';', $style );

							if ( strpos( $class, '.' ) !== 0 ) {
								$class = '.' . $class;
							}

							foreach ($ind_style as $css_value) {
								if ( strpos( $css_value, 'font-family' ) !== false ) {
										$font_family_properties   = explode( ':', $css_value );
										if(!empty($font_family_properties['1'])){
											$multiple_family = explode( ',', $font_family_properties['1']);
											if(count($multiple_family)==1){
												$font_families[] = $font_family_properties['1'];
											}
										}
								}
							}

							if ( strpos( $skin, 'infowindow' ) !== false ) {
								$class = ' .wpgmp_infowindow ' . $class;
							} elseif ( strpos( $skin, 'post' ) !== false ) {
								$class = ' .wpgmp_infowindow.wpgmp_infowindow_post ' . $class;
							} elseif ( strpos( $class, 'fc-item-title' ) !== false ) {
								$fc_skin_styles .= ' ' . $class . ' a, ' . $class . ' a:hover, ' . $class . ' a:focus, ' . $class . ' a:visited{' . $style . '}';
							}
							$fc_skin_styles .= ' ' . '.wpgmp-map-' . $map->map_id . ' ' . $class . '{' . $style . '}';
						}
					}
				}
			}
		}

		if ( ! empty( $fc_skin_styles ) ) {
			$map_output .= '<style>' . $fc_skin_styles . '</style>';
		}
		if ( ! empty( $font_families ) ) {
			$font_families = array_unique($font_families);
			$map_data['map_options']['google_fonts'] = $font_families;
		}
	}
}

$map_data = apply_filters('wpgmp_map_data',$map_data,$map);
$map_data_obj = json_encode( $map_data );
$map_data_obj = base64_encode($map_data_obj);

$map_output .= '<div style="display:none !important;visiblity:hidden !important:width:0px;height:0px;padding:0px;margin:0px;" class="wpgmp-map-data-container" data-map-id="'. $map_id . '">'.$map_data_obj.'</div>';

return $map_output;
}
else{
  return '';	
}
