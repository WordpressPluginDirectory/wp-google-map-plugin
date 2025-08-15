<?php
/**
 * Parse Shortcode and display maps.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */

$options = apply_filters('wpgmp_shortcode_attributes', $options);


if ( isset( $options['id'] ) ) {
	$map_id = $options['id'];
} else {
	return '';
}


$mapsprovider = WPGMP_Helper::wpgmp_get_map_provider();

// Fetch map information.
$modelFactory = new WPGMP_Model();
$map_obj      = $modelFactory->create_object( 'map' );
$map_record   = $map_obj->fetch( array( array( 'map_id', '=', $map_id ) ) );

if ( ! is_array( $map_record ) || empty( $map_record ) ) {
	return '';
} else {
	$map = $map_record[0];
}

$wpgmp_settings = get_option( 'wpgmp_settings', true );

$auto_fix = '';

// Hook accept cookies
if ( isset($wpgmp_settings['wpgmp_gdpr']) && $wpgmp_settings['wpgmp_gdpr'] == true ) {

	$wpgmp_accept_cookies = apply_filters( 'wpgmp_accept_cookies', false );

	if ( $wpgmp_accept_cookies == false ) {
		$no_map_notice = '';
		if ( isset( $wpgmp_settings['wpgmp_gdpr_msg'] ) and $wpgmp_settings['wpgmp_gdpr_msg'] != '' ) {
			$no_map_notice = $wpgmp_settings['wpgmp_gdpr_msg'];
		}
		$no_map_notice = "<div class='wpgmp-no-maps'>".apply_filters( 'wpgmp_nomap_notice', $no_map_notice, $map_id )."</div>";
		return $no_map_notice;
	}
}

// End
if ( isset( $options['show'] ) ) {
	$show_option = $options['show'];
} else {
	$show_option = 'default';
}
$shortcode_filters = array();
if ( isset( $options['category'] ) ) {
	$shortcode_filters['category'] = $options['category'];
}


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

$map = apply_filters('wpgmp_map_pre_data',$map);

$default_map_tile_url = apply_filters('wpgmp_map_tile_url','https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',$map);
$map_tile_url = !empty($map->map_all_control['openstreet_url']) ? $map->map_all_control['openstreet_url'] : $default_map_tile_url;


$category_obj          = $modelFactory->create_object( 'group_map' );
$categories            = $category_obj->fetch();
$all_categories        = array();
$all_child_categories  = array();
$all_parent_categories = array();
$all_categories_name   = array();
$location_obj          = $modelFactory->create_object( 'location' );
$marker_category_icons = array();


if ( ! empty( $categories ) ) {
	foreach ( $categories as $category ) {
		$all_categories[ $category->group_map_id ]                           = $category;
		$all_categories_name[ sanitize_title( $category->group_map_title ) ] = $category;
		$marker_category_icons[ $category->group_map_id ] = $category->group_marker;
		if ( $category->group_parent > 0 ) {
			$all_child_categories[ $category->group_map_id ]    = $category->group_parent;
			$all_parent_categories[ $category->group_parent ][] = $category->group_map_id;
		}
	}
}

if ( ! empty( $map->map_locations ) ) {
	$map->map_locations = array_filter($map->map_locations);
	$map_locations = $location_obj->fetch( array( array( 'location_id', 'IN', implode( ',', $map->map_locations ) ) ) );
}

$location_criteria = array(
	'show_all_locations' => false,
	'category__in'       => false,
	'limit'              => 0,
);

$location_criteria = apply_filters( 'wpgmp_location_criteria', $location_criteria, $map );

if ( isset( $options['show_all_locations'] ) and $options['show_all_locations'] == 'true' ) {
	$location_criteria['show_all_locations'] = true;
}

if ( isset( $options['limit'] ) and $options['limit'] > 0 ) {
	$location_criteria['limit'] = $options['limit'];
} elseif ( isset( $_GET['limit'] ) and $map->map_all_control['url_filter'] == 'true' ) {
	$location_criteria['limit'] = sanitize_text_field( $_GET['limit'] );
}

if ( isset( $location_criteria['show_all_locations'] ) and $location_criteria['show_all_locations'] == true ) {
	$map_locations = $location_obj->fetch();
}


if ( isset( $location_criteria['category__in'] ) and is_array( $location_criteria['category__in'] ) ) {
	$shortcode_filters['category'] = implode( ',', $location_criteria['category__in'] );
}


$map_data = array();
// Set map options.
$map_data['autosort'] = true;
$map_data['places'] = array();
if ( $map->map_all_control['infowindow_openoption'] == 'mouseclick' ) {
	$map->map_all_control['infowindow_openoption'] = 'click';
} elseif ( $map->map_all_control['infowindow_openoption'] == 'mousehover' ) {
	$map->map_all_control['infowindow_openoption'] = 'mouseover';
} elseif ( $map->map_all_control['infowindow_openoption'] == 'mouseover' ) {
	$map->map_all_control['infowindow_openoption'] = 'mouseover';
} else {
	$map->map_all_control['infowindow_openoption'] = 'click';
}

$infowindow_setting = isset($map->map_all_control['infowindow_setting'])? $map->map_all_control['infowindow_setting'] : '';

if( isset( $map->map_all_control['location_infowindow_skin']['name'] ) && $map->map_all_control['location_infowindow_skin']['name'] == 'basic'){
	$map->map_all_control['location_infowindow_skin']['name'] = 'default';
}

if( !is_array( $infowindow_setting ) ){
	$infowindow_setting = htmlspecialchars_decode($infowindow_setting);
}

$infowindow_sourcecode = apply_filters( 'wpgmp_infowindow_message',do_shortcode($infowindow_setting) , $map );

$wpgmp_categorydisplayformat = isset($map->map_all_control['wpgmp_categorydisplayformat'])? $map->map_all_control['wpgmp_categorydisplayformat']: '';

if( !is_array( $wpgmp_categorydisplayformat ) && !empty($wpgmp_categorydisplayformat) ){
	$wpgmp_categorydisplayformat = htmlspecialchars_decode($wpgmp_categorydisplayformat);
}

$listing_placeholder_content = apply_filters( 'wpgmp_listing_html', $wpgmp_categorydisplayformat, $map );

if ( ! isset( $map->map_all_control['nearest_location'] ) ) {
	$map->map_all_control['nearest_location'] = false;
}

if ( ! isset( $map->map_all_control['fit_bounds'] ) ) {
	$map->map_all_control['fit_bounds'] = false;
}

if ( ! isset( $map->map_all_control['show_center_circle'] ) ) {
	$map->map_all_control['show_center_circle'] = false;
}

if ( ! isset( $map->map_all_control['show_center_marker'] ) ) {
	$map->map_all_control['show_center_marker'] = false;
}

if ( ! isset( $map->map_all_control['map_draggable'] ) ) {
	$map->map_all_control['map_draggable'] = true;
}

if ( ! isset( $map->map_all_control['infowindow_bounce_animation'] ) ) {
	$map->map_all_control['infowindow_bounce_animation'] = '';
}

if ( ! isset( $map->map_all_control['infowindow_drop_animation'] ) ) {
	$map->map_all_control['infowindow_drop_animation'] = false;
}

if ( ! isset( $map->map_all_control['infowindow_close'] ) ) {
	$map->map_all_control['infowindow_close'] = false;
}

if ( ! isset( $map->map_all_control['infowindow_open'] ) ) {
	$map->map_all_control['infowindow_open'] = false;
}


if ( ! isset( $map->map_all_control['infowindow_filter_only'] ) ) {
	$map->map_all_control['infowindow_filter_only'] = false;
}

if ( ! isset( $map->map_all_control['infowindow_iscenter'] ) ) {
	$map->map_all_control['infowindow_iscenter'] = false;
}


if ( ! isset( $map->map_all_control['full_screen_control'] ) ) {
	$map->map_all_control['full_screen_control'] = false;
}

if ( ! isset( $map->map_all_control['camera_control'] ) ) {
	$map->map_all_control['camera_control'] = false;
}

if ( ! isset( $map->map_all_control['search_control'] ) ) {
	$map->map_all_control['search_control'] = false;
}


if ( ! isset( $map->map_all_control['zoom_control'] ) ) {
	$map->map_all_control['zoom_control'] = false;
}

if ( ! isset( $map->map_all_control['map_type_control'] ) ) {
	$map->map_all_control['map_type_control'] = false;
}

if ( ! isset( $map->map_all_control['street_view_control'] ) ) {
	$map->map_all_control['street_view_control'] = false;
}


if ( ! isset( $map->map_all_control['locateme_control'] ) ) {
	$map->map_all_control['locateme_control'] = false;
}


if ( ! isset( $map->map_all_control['mobile_specific'] ) ) {
	$map->map_all_control['mobile_specific'] = false;
}

if ( ! isset( $map->map_all_control['map_zoom_level_mobile'] ) ) {
	$map->map_all_control['map_zoom_level_mobile'] = 5;
}

if ( ! isset( $map->map_all_control['map_draggable_mobile'] ) ) {
	$map->map_all_control['map_draggable_mobile'] = true;
}

if ( ! isset( $map->map_all_control['map_scrolling_wheel_mobile'] ) ) {
	$map->map_all_control['map_scrolling_wheel_mobile'] = true;
}

if ( ! isset( $map->map_all_control['map_infowindow_customisations'] ) ) {
	$map->map_all_control['map_infowindow_customisations'] = false;
}

if ( ! isset( $map->map_all_control['show_infowindow_header'] ) ) {
	$map->map_all_control['show_infowindow_header'] = false;
}

if ( isset( $map->map_all_control['doubleclickzoom'] ) ) {
	$map->map_all_control['doubleclickzoom'] = true;
}

if ( ! isset( $map->map_all_control['bound_map_after_filter'] ) ) {
	$map->map_all_control['bound_map_after_filter'] = false;
}

if ( ! isset( $map->map_all_control['display_reset_button'] ) ) {
	$map->map_all_control['display_reset_button'] = false;
}

if ( ! isset( $map->map_all_control['wpgmp_search_placeholders'] ) ) {
	$map->map_all_control['wpgmp_search_placeholders'] = false;
}

if ( ! isset( $map->map_all_control['wpgmp_exclude_placeholders'] ) ) {
	$map->map_all_control['wpgmp_exclude_placeholders'] = false;
}

$exclude_placeholders = isset($map->map_all_control['wpgmp_exclude_placeholders']) ? $map->map_all_control['wpgmp_exclude_placeholders'] : '';

if (!empty($exclude_placeholders)) {
    $exclude_explode = array_map('trim', explode(',', $exclude_placeholders));
} else {
    $exclude_explode = '';
}

$search_placeholders = isset($map->map_all_control['wpgmp_search_placeholders']) ? $map->map_all_control['wpgmp_search_placeholders'] : '';

if (!empty($search_placeholders)) {
    $search_explode = array_map('trim', explode(',', $search_placeholders));
} else {
    $search_explode = '';
}

$is_mobile = false;
if ( wp_is_mobile() ) {
    $is_mobile = true;
    $map->map_all_control['infowindow_openoption'] = 'click';
    $map->map_all_control['listing_openoption'] = 'click';
}

$openstreet_styles = array(
	'OpenStreetMap.Mapnik'=>'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	'OpenStreetMap.DE'=>'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
	'OpenStreetMap.CH'=>'https://tile.osm.ch/switzerland/{z}/{x}/{y}.png',
	'OpenStreetMap.France'=>'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
	'OpenStreetMap.HOT'=>'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
	'OpenStreetMap.BZH'=>'https://tile.openstreetmap.bzh/br/{z}/{x}/{y}.png',
	'OpenTopoMap'=>'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
	'Thunderforest.OpenCycleMap'=>'https://dev.{s}.tile.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
	'OpenMapSurfer.Roads'=>'https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png',
);

$openstreet_styles = apply_filters('wpgmp_openstreet_style',$openstreet_styles);
$openstreet_styles_markup = '';
if(count($openstreet_styles)>0){
$openstreet_styles_markup .='<select class="wpomp_map_type">';
foreach ($openstreet_styles as $key => $style) {	
	$openstreet_styles_markup .='<option value="'.$key.'">'.$key.'</option>';
}
$openstreet_styles_markup .='</select>';
}
$map_box_styles = array(
'streets-v11'=>'streets',
'light-v10'=>'light',
'dark-v10'=>'dark',
'outdoors-v11'=>'outdoors',
'satellite-v9'=>'satellite'
);

$map_box_styles = apply_filters('wpgmp_mapbox_style',$map_box_styles);
$map_box_styles_markup = '';
if(count($map_box_styles)>0){
$map_box_styles_markup .='<select class="wpomp_mapbox_type">';
foreach ($map_box_styles as $mkey=>$mstyle) {	
	$map_box_styles_markup .='<option value="'.$mkey.'">'.ucfirst($mstyle).'</option>';
}
$map_box_styles_markup .='</select>';
}

$map_data['map_options'] = array(
	'center_lat'                     => sanitize_text_field( $map->map_all_control['map_center_latitude'] ),
	'center_lng'                     => sanitize_text_field( $map->map_all_control['map_center_longitude'] ),
	'zoom'                           => ( isset( $options['zoom'] ) ) ? intval( $options['zoom'] ) : intval( $map->map_zoom_level ),
	'map_type_id'                    => sanitize_text_field( $map->map_type ),
	'center_by_nearest'              => ( 'true' == sanitize_text_field( $map->map_all_control['nearest_location'] ) ),
	'fit_bounds'                     => ( 'true' == sanitize_text_field( $map->map_all_control['fit_bounds'] ) ),
	'center_circle_fillcolor'        => (isset($map->map_all_control['center_circle_fillcolor'])) ? sanitize_text_field( $map->map_all_control['center_circle_fillcolor'] ) : '',
	'center_circle_fillopacity'      => (isset($map->map_all_control['center_circle_fillopacity'])) ? sanitize_text_field( $map->map_all_control['center_circle_fillopacity'] ) : '',
	'center_circle_strokecolor'      => (isset($map->map_all_control['center_circle_strokecolor'])) ? sanitize_text_field( $map->map_all_control['center_circle_strokecolor'] ) : '',
	'center_circle_strokeopacity'    => (isset($map->map_all_control['center_circle_strokeopacity'])) ? sanitize_text_field( $map->map_all_control['center_circle_strokeopacity'] ) : '',
	'center_circle_radius'           => (isset($map->map_all_control['center_circle_radius'])) ? sanitize_text_field( $map->map_all_control['center_circle_radius'] ) : '',
	'show_center_circle'             => ( sanitize_text_field( $map->map_all_control['show_center_circle'] ) == 'true' ),
	'show_center_marker'             => ( sanitize_text_field( $map->map_all_control['show_center_marker'] ) == 'true' ),
	'center_marker_icon'             => (isset($map->map_all_control['marker_center_icon'])) ? esc_attr( $map->map_all_control['marker_center_icon'] ) : esc_attr( $map->map_all_control['marker_default_icon'] ),
	'center_marker_infowindow'       => (isset($map->map_all_control['show_center_marker_infowindow'])) ? wpautop( wp_unslash( $map->map_all_control['show_center_marker_infowindow'] ) ) : '',
	'center_circle_strokeweight'     => (isset($map->map_all_control['center_circle_fillcolor'])) ? sanitize_text_field( $map->map_all_control['center_circle_strokeweight'] ) : '',
	'draggable'                      => ( sanitize_text_field( $map->map_all_control['map_draggable'] ) != 'false' ),
	'scroll_wheel'                   => ( isset($map->map_scrolling_wheel) ? $map->map_scrolling_wheel : false ),

	'display_45_imagery'             => sanitize_text_field( $map->map_45imagery ),
	'gesture'                        => isset($map->map_all_control['gesture']) ? sanitize_text_field( $map->map_all_control['gesture'] ) : '',
	'marker_default_icon'            => esc_attr( $map->map_all_control['marker_default_icon'] ),
	'infowindow_setting'             => wp_unslash( $infowindow_sourcecode ),
	'infowindow_geotags_setting'     => '',
	'infowindow_skin'                => ( isset( $map->map_all_control['location_infowindow_skin'] ) ) ? $map->map_all_control['location_infowindow_skin'] : array(
		'name'       => 'default',
		'type'       => 'infowindow',
		'sourcecode' => $infowindow_sourcecode,
	),
	'infowindow_post_skin'           => '',
	'infowindow_bounce_animation'    => $map->map_all_control['infowindow_bounce_animation'],
	'infowindow_drop_animation'      => ( 'true' == $map->map_all_control['infowindow_drop_animation'] ),
	'close_infowindow_on_map_click'  => ( 'true' == $map->map_all_control['infowindow_close'] ),
	'default_infowindow_open'        => ( 'true' == $map->map_all_control['infowindow_open'] ),
	'infowindow_open_event'          => ( $map->map_all_control['infowindow_openoption'] ) ? $map->map_all_control['infowindow_openoption'] : 'click',
	'listing_infowindow_open_event'          => isset( $map->map_all_control['listing_openoption'] ) ? $map->map_all_control['listing_openoption'] : 'click',
	'is_mobile'						 => $is_mobile,
	'infowindow_filter_only'         => ( $map->map_all_control['infowindow_filter_only'] == 'true' ),
	'infowindow_click_change_zoom'   => (isset($map->map_all_control['infowindow_zoomlevel'])) ? (int) $map->map_all_control['infowindow_zoomlevel'] : '',
	'infowindow_click_change_center' => ( 'true' == $map->map_all_control['infowindow_iscenter'] ),
	'full_screen_control'            => ( $map->map_all_control['full_screen_control'] != 'false' ),
	'camera_control'                 => ( $map->map_all_control['camera_control'] == 'true' ),
	'search_control'                 => ( $map->map_all_control['search_control'] != 'false' ),
	'search_fields' 				 => $search_explode,
	'exclude_fields' 				 => $exclude_explode,
	'zoom_control'                   => ( $map->map_all_control['zoom_control'] != 'false' ),
	'map_type_control'               => ( $map->map_all_control['map_type_control'] != 'false' ),
	'street_view_control'            => ( $map->map_all_control['street_view_control'] != 'false' ),
	'locateme_control'               => ( $map->map_all_control['locateme_control'] == 'true' ),
	'mobile_specific'                => ( $map->map_all_control['mobile_specific'] == 'true' ),
	'zoom_mobile'                    => intval( $map->map_all_control['map_zoom_level_mobile'] ),
	'draggable_mobile'               => ( sanitize_text_field( $map->map_all_control['map_draggable_mobile'] ) != 'false' ),
	'scroll_wheel_mobile'            => ( sanitize_text_field( $map->map_all_control['map_scrolling_wheel_mobile'] ) != 'false' ),
	'full_screen_control_position'   => (isset($map->map_all_control['full_screen_control_position']) ) ? $map->map_all_control['full_screen_control_position'] : '',
	'camera_control_position'        => (isset($map->map_all_control['camera_control_position']) ) ? $map->map_all_control['camera_control_position'] : '',
	'search_control_position'        => (isset($map->map_all_control['search_control_position']) ) ? $map->map_all_control['search_control_position'] : '',
	'locateme_control_position'      => (isset($map->map_all_control['locateme_control_position'])) ? $map->map_all_control['locateme_control_position'] : '',
	'zoom_control_position'          => $map->map_all_control['zoom_control_position'],
	'map_type_control_position'      => $map->map_all_control['map_type_control_position'],
	'map_type_control_style'         => $map->map_all_control['map_type_control_style'],
	'street_view_control_position'   => $map->map_all_control['street_view_control_position'],
	'map_control'                    => '',
	'map_control_settings'           => (isset($map->map_all_control['map_control_settings']) ) ? $map->map_all_control['map_control_settings'] : '',
	'screens'                        => (isset($map->map_all_control['screens']) ) ? $map->map_all_control['screens'] : '',
	'map_infowindow_customisations'  => ( $map->map_all_control['map_infowindow_customisations'] == 'true' ),
	'infowindow_width'               => ( empty( $map->map_all_control['infowindow_width'] ) || $map->map_all_control['infowindow_width'] == '0' ) ? '100%' : $map->map_all_control['infowindow_width'] . 'px',
	'show_infowindow_header'         => ( $map->map_all_control['show_infowindow_header'] == 'true' ),
	'min_zoom'                       => (isset($map->map_all_control['map_minzoom_level'])) ? $map->map_all_control['map_minzoom_level'] : '',
	'max_zoom'                       => isset($map->map_all_control['map_maxzoom_level']) ? $map->map_all_control['map_maxzoom_level'] : '' ,
	'zoom_level_after_search'        => isset($map->map_all_control['zoom_level_after_search']) ? $map->map_all_control['zoom_level_after_search'] : 10,
	'url_filters'                    => '',
	'doubleclickzoom' 				 => (isset($map->map_all_control['doubleclickzoom']) ? $map->map_all_control['doubleclickzoom'] : false),
	'current_post_only' 				 => false,
	'max_zoom'                       => isset($map->map_all_control['map_maxzoom_level']) ? $map->map_all_control['map_maxzoom_level'] : '' ,
	'search_placeholder'                       => ( isset( $map->map_all_control['wpgmp_searchbar_placeholder'] ) && !empty( $map->map_all_control['wpgmp_searchbar_placeholder'] ) )? $map->map_all_control['wpgmp_searchbar_placeholder'] : '' ,
	'select_category'                       => ( isset( $map->map_all_control['wpgmp_category_placeholder'] ) && !empty( $map->map_all_control['wpgmp_category_placeholder'] ) )? $map->map_all_control['wpgmp_category_placeholder'] : '' ,
	'advance_template'						=> false,
	'map_tile_url'				     => $map_tile_url,
	'openstreet_styles'				 => $openstreet_styles,
	'openstreet_styles_markup'	     => $openstreet_styles_markup,
	'map_box_styles_markup'	         => $map_box_styles_markup
);

$map_data['map_options']['bound_map_after_filter'] = ( 'true' == $map->map_all_control['bound_map_after_filter'] );
$map_data['map_options']['display_reset_button']   = ( 'true' == $map->map_all_control['display_reset_button'] );
$map_data['map_options']['map_reset_button_text']  = (isset($map->map_all_control['map_reset_button_text'])) ? $map->map_all_control['map_reset_button_text'] : esc_html__( 'Reset', 'wp-google-map-plugin' );

$map_data['map_options']['width'] = sanitize_text_field( $map->map_width );

$map_data['map_options']['width'] = sanitize_text_field( $map->map_width );

$map_data['map_options']['height'] = sanitize_text_field( $map->map_height );

// Special Values Replacement for leaflet maps.
$position_replacements = array(
	'TOP_LEFT'     => 'topleft',
	'TOP_RIGHT'    => 'topright',
	'BOTTOM_LEFT'  => 'bottomleft',
	'BOTTOM_RIGHT' => 'bottomright',
	'LEFT_TOP'     => 'topleft',
	'LEFT_BOTTOM'  => 'bottomleft',
	'RIGHT_TOP'    => 'topright',
	'RIGHT_BOTTOM' => 'bottomright',
);


if( $mapsprovider == 'leaflet' ) {
	$map_data['map_options']['zoom_control_position'] = $map_obj->replace_values($map_data['map_options']['zoom_control_position'],$position_replacements);
	$map_data['map_options']['map_type_control_position'] = $map_obj->replace_values($map_data['map_options']['map_type_control_position'],$position_replacements);
	$map_data['map_options']['full_screen_control_position'] = $map_obj->replace_values($map_data['map_options']['full_screen_control_position'],$position_replacements);
	$map_data['map_options']['search_control_position'] = $map_obj->replace_values($map_data['map_options']['search_control_position'],$position_replacements);
	$map_data['map_options']['locateme_control_position'] = $map_obj->replace_values($map_data['map_options']['locateme_control_position'],$position_replacements);

	
	if (!empty($map_data['map_options']['map_control_settings'])) {
		foreach ($map_data['map_options']['map_control_settings'] as $key => &$setting) {
			$setting['position'] = $map_obj->replace_values($setting['position'], $position_replacements);
		}
		unset($setting); // best practice to unset the reference after the loop
	}
}


$map_data['map_options'] = apply_filters( 'wpgmp_maps_options', $map_data['map_options'], $map );

if ( isset( $options['width'] ) and $options['width'] != '' ) {
	$map_data['map_options']['width'] = $options['width'];
}

if ( isset( $options['height'] ) and $options['height'] != '' ) {
	$map_data['map_options']['height'] = $options['height'];
}


if ( isset( $map_data['map_options']['width'] ) ) {
	$width = $map_data['map_options']['width'];
} else {
	$width = '100%'; }

if ( isset( $map_data['map_options']['height'] ) ) {
	$height = $map_data['map_options']['height'];
} else {
	$height = '300px'; }

if ( '' != $width and strstr( $width, '%' ) === false ) {
	$width = str_replace( 'px', '', $width ) . 'px';
}

if ( '' == $width ) {
	$width = '100%';
}
if ( strstr( $height, '%' ) === false ) {
	$height = str_replace( 'px', '', $height ) . 'px';
} else {
	$height = str_replace( '%', '', $height ) . 'px';
}


wp_enqueue_script( 'wpgmp-google-api' );
wp_enqueue_script( 'wpgmp-google-map-main' );
wp_enqueue_script( 'wpgmp-frontend' );
wp_enqueue_style( 'wpgmp-frontend' );


do_action( 'wpgmp_load_scripts_styles' );

if( isset( $map->map_all_control['item_skin'] ) && $map->map_all_control['item_skin']['name'] != 'default'){
		$map->map_all_control['item_skin']['name'] = 'default';
}

if ( !empty( $map->map_all_control['location_infowindow_skin'] ) and is_array( $map->map_all_control['location_infowindow_skin'] )  ) {
	$skin_data = $map->map_all_control['location_infowindow_skin'];
	$css_file  = WPGMP_URL . 'templates/' . $skin_data['type'] . '/' . $skin_data['name'] . '/' . $skin_data['name'] . '.css';
	wp_enqueue_style( 'fc-wpgmp-' . $skin_data['type'] . '-' . $skin_data['name'], $css_file );
}

if ( !empty( $map->map_all_control['item_skin'] ) and is_array( $map->map_all_control['item_skin'] ) ) {
	$skin_data = $map->map_all_control['item_skin'];
	$css_file  = WPGMP_URL . 'templates/' . $skin_data['type'] . '/' . $skin_data['name'] . '/' . $skin_data['name'] . '.css';
	wp_enqueue_style( 'fc-wpgmp-' . $skin_data['type'] . '-' . $skin_data['name'], $css_file );
}

if ( isset( $map_locations ) && is_array( $map_locations ) ) {

	$loc_count          = 0;
	foreach ( $map_locations as $location ) {
		$location_categories = array();
		$is_continue         = true;
		if ( empty( $location->location_group_map ) ) {
			$location_categories[] = array(
				'id'               => '',
				'name'             => 'Uncategories',
				'type'             => 'category',
				'extension_fields' => (isset($loc_category) && !empty($loc_category->extensions_fields)) ? $loc_category->extensions_fields : '',
			);
		} else {

			foreach ( $location->location_group_map as $key => $loc_category_id ) {
				
				if( isset($all_categories[ $loc_category_id ]) ) {
					$loc_category = $all_categories[ $loc_category_id ];
					$location_categories[] = array(
						'id'               => $loc_category->group_map_id,
						'name'             => $loc_category->group_map_title,
						'type'             => 'category',
						'extension_fields' => $loc_category->extensions_fields,
						'icon'             => $loc_category->group_marker,
					);	
				}
			}
		}


		// Extra Fields in location.
		$extra_fields          = array();
		$extra_fields_filters  = array();
		
		
		if ( is_array( $location_categories ) ) {
			$high_order = 0;
			foreach ( $location_categories as $cat_order ) {
				if ( isset($cat_order['extension_fields']['cat_order']) ) {
					if ( $cat_order['extension_fields']['cat_order'] > $high_order ) {
						$high_order = $cat_order['extension_fields']['cat_order'];
					}
				}
			}
			$extra_fields['listorder'] = $high_order;
		} else {
			$extra_fields['listorder'] = 0;
		}

		$onclick = isset( $location->location_settings['onclick'] ) ? $location->location_settings['onclick'] : 'marker';

		if ( isset( $location->location_settings['featured_image'] ) and $location->location_settings['featured_image'] != '' ) {
			$marker_image = "<div class='fc-feature-img'><img loading='lazy' decoding='async' alt='" . esc_attr( $location->location_title ) . "' src='" . $location->location_settings['featured_image'] . "' class='wpgmp_marker_image fc-item-featured_image fc-item-large' /></div>";
		} else {
			$marker_image = "<div class='fc-feature-img'><img loading='lazy' decoding='async' alt='" . esc_attr( $location->location_title ) . "' src='" .WPGMP_IMAGES.'sample.jpg'. "' class='wpgmp_marker_image fc-item-featured_image fc-item-large' /></div>";

		}

		$marker_image = apply_filters( 'wpgmp_marker_image_markup', $marker_image, $location ,$map_id);


		if( !isset($location->location_settings['hide_infowindow']) ) {
			$location->location_settings['hide_infowindow'] = false;
		}

		$cats_with_order_id = array();

		$c_icon = isset( $location_categories[0]['icon'] ) ? $location_categories[0]['icon'] : $map_data['map_options']['marker_default_icon'];

		foreach($location_categories as $key1 => $cat) {

			if(!empty($cat['extension_fields']['cat_order'])){
				$cats_with_order_id[$key1] = $cat['extension_fields']['cat_order'];	
			}
		}

		if(!empty($cats_with_order_id) && count($cats_with_order_id)>0){
			$top_priority_key = min(array_keys($cats_with_order_id, min($cats_with_order_id)));
			$c_icon = isset( $location_categories[$top_priority_key]['icon'] ) ? $location_categories[$top_priority_key]['icon'] : $map_data['map_options']['marker_default_icon'];

		}

		$map_data['places'][ $loc_count ] = array(
			'id'             => $location->location_id,
			'title'          => $location->location_title,
			'address'        => $location->location_address,
			'source'         => 'manual',
			'content'        => ( '' != $location->location_messages ) ? do_shortcode( stripcslashes( $location->location_messages ) ) : '',
			'location'       => array(
				'icon'                    => $c_icon ,
				'lat'                     => $location->location_latitude,
				'lng'                     => $location->location_longitude,
				'city'                    => $location->location_city,
				'state'                   => $location->location_state,
				'country'                 => $location->location_country,
				'onclick_action'          => $onclick,
				'redirect_custom_link'    => isset($location->location_settings['redirect_link']) ? $location->location_settings['redirect_link'] : '',
				'marker_image'            => $marker_image,
				'open_new_tab'            => isset($location->location_settings['redirect_link_window']) ? $location->location_settings['redirect_link_window'] : '',
				'postal_code'             => $location->location_postal_code,
				'draggable'               => '',
				'infowindow_default_open' => '',
				'animation'               => $location->location_animation,
				'infowindow_disable'      => ( $location->location_settings['hide_infowindow'] !== 'false' ),
				'zoom'                    => 5,
				'extra_fields'            => $extra_fields,
			),
			'categories'     => $location_categories,
			'custom_filters' => $extra_fields_filters,
		);

		$loc_count++;
	}
}

// KML Layer.
if ( ! empty( $map->map_layer_setting['choose_layer']['kml_layer'] ) && $map->map_layer_setting['choose_layer']['kml_layer'] == 'KmlLayer' ) {
	if ( strpos( $map->map_layer_setting['map_links'], ',' ) !== false ) {
		$kml_layers_links = explode( ',', $map->map_layer_setting['map_links'] );
	} else {
		$kml_layers_links = array( $map->map_layer_setting['map_links'] );
		$new_kml_links    = array();
		foreach ( $kml_layers_links as $kml ) {
			$new_kml_links[] = add_query_arg( 'x', time(), $kml );
		}
		$kml_layers_links = $new_kml_links;
	}

	$map_data['kml_layer'] = array(
		'kml_layers_links' => $kml_layers_links,
	);

	$map_data['kml_layer'] = apply_filters( 'wpgmp_kml_layer', $map_data['kml_layer'], $map );

}

if ( ! empty( $map->map_layer_setting['choose_layer']['bicycling_layer'] ) && $map->map_layer_setting['choose_layer']['bicycling_layer'] == 'BicyclingLayer' ) {
	$map_data['bicyle_layer'] = array(
		'display_layer' => true,
	);

	$map_data['bicycling_layer'] = apply_filters( 'wpgmp_bicycling_layer', $map_data['bicyle_layer'], $map );

}

if ( ! empty( $map->map_layer_setting['choose_layer']['traffic_layer'] ) && $map->map_layer_setting['choose_layer']['traffic_layer'] == 'TrafficLayer' ) {
	$map_data['traffic_layer'] = array(
		'display_layer' => true,
	);

	$map_data['traffic_layer'] = apply_filters( 'wpgmp_traffic_layer', $map_data['traffic_layer'], $map );

}

if ( ! empty( $map->map_layer_setting['choose_layer']['transit_layer'] ) && $map->map_layer_setting['choose_layer']['transit_layer'] == 'TransitLayer' ) {
	$map_data['transit_layer'] = array(
		'display_layer' => true,
	);

	$map_data['transit_layer'] = apply_filters( 'wpgmp_transit_layer', $map_data['transit_layer'], $map );

}

// Add  new places from external data source.
$custom_markers     = array();
$map_id             = $map->map_id;
$all_custom_markers = apply_filters( 'wpgmp_marker_source', $custom_markers, $map_id );
if ( is_array( $all_custom_markers ) ) {
	foreach ( $all_custom_markers as $marker ) {
		$places = array();

		if ( isset($marker['category']) && isset( $all_categories_name[ sanitize_title( $marker['category'] ) ] ) ) {
				$new_catagory = $all_categories_name[ sanitize_title( $marker['category'] ) ];
		} else {
				$new_catagory = '';
		}
		if( empty($new_catagory) && isset( $marker['category'] ) && !empty($marker['category']) ){
			$multiple_categories = explode(',',$marker['category']);
			$new_catagory = '';
		}


		$places['id']                         = isset( $marker['id'] ) ? $marker['id'] : rand( 4000, 9999 );
		$places['title']                      = $marker['title'];
		$places['source']                     = 'external';
		$places['address']                    = $marker['address'];
		$places['']                           = $marker['address'];
		$places['content']                    = $marker['message'];
		$places['location']['onclick_action'] = 'marker';
		$places['location']['lat']            = $marker['latitude'];
		$places['location']['lng']            = $marker['longitude'];
		$places['location']['postal_code']    = isset( $marker['postal_code'] ) ? $marker['postal_code'] : '';
        $places['location']['country']        = $marker['country'];
        $places['location']['city']           = $marker['city'];
        $places['location']['state']          = $marker['state'];
		$places['infowindow_disable']         = false;
		$places['location']['zoom']           = intval( $map->map_zoom_level );
		$places['location']['icon']           = ( isset($marker['icon']) && !empty($marker['icon']) ) ? $marker['icon'] : esc_attr( $map->map_all_control['marker_default_icon'] );
		if ( $new_catagory != '' ) {
			
			$places['categories'][0]['icon']             = $new_catagory->group_marker;
			$places['categories'][0]['name']             = $new_catagory->group_map_title;
			$places['categories'][0]['id']               = $new_catagory->group_map_id;
			$places['categories'][0]['type']             = 'category';
			$places['categories'][0]['extension_fields'] = $new_catagory->extensions_fields;
			$places['location']['icon']                  = ( isset($marker['icon']) && !empty($marker['icon']) ) ? $marker['icon'] : $new_catagory->group_marker;
			
		}else if(isset($multiple_categories) && count($multiple_categories)>0){
					
			foreach($multiple_categories as $key => $assigned_cat){

				if (isset($all_categories_name[sanitize_title( $assigned_cat )])) {

					$assigned = $all_categories_name[ sanitize_title( $assigned_cat ) ];
					$places['categories'][$key]['icon']             = $assigned->group_marker;
					$places['categories'][$key]['name']             = $assigned->group_map_title;
					$places['categories'][$key]['id']               = $assigned->group_map_id;
					$places['categories'][$key]['type']             = 'category';
					$places['categories'][$key]['extension_fields'] = $assigned->extensions_fields;
					$places['location']['icon']                  	= isset( $marker['icon'] ) ? $marker['icon'] : $assigned->group_marker;

				}
				    
			}
			
		}
		$places['location']['marker_image'] = isset( $marker['marker_image'] ) ? $marker['marker_image'] : '';
		$places['location']['extra_fields'] = isset( $marker['extra_fields'] ) ? $marker['extra_fields'] : '';
		$map_data['places'][] = $places;
	}
}

// Here loop through all places and apply filter. Shortcode Awesome.
$filterd_places   = array();
$render_shortcode = apply_filters( 'wpgmp_render_shortcode', true, $map );
if ( is_array( $map_data['places'] ) ) {

	foreach ( $map_data['places'] as $place ) {
		$use_me = true;


		if ( true == $render_shortcode ) {
			$place['content'] = do_shortcode( $place['content'] );
		}

		if ( '' == $place['location']['lat'] || '' == $place['location']['lng']) {
			$use_me = false;
		}

		$use_me = apply_filters( 'wpgmp_show_place', $use_me, $place, $map );

		if ( true == $use_me ) {
			$filterd_places[] = $place;
		}
	}
	unset( $map_data['places'] );
}

if ( isset( $location_criteria['limit'] ) and $location_criteria['limit'] > 0 ) {

	$how_many       = intval( $location_criteria['limit'] );
	$filterd_places = array_slice( $filterd_places, 0, $how_many );

}

$map_data['places'] = apply_filters( 'wpgmp_markers', $filterd_places, $map->map_id );

if ( '' == $map_data['map_options']['center_lat'] && !empty($map_data['places'])) {
	$map_data['map_options']['center_lat'] = $map_data['places'][0]['location']['lat'];
}

if ( '' == $map_data['map_options']['center_lng'] && !empty($map_data['places'])) {
	$map_data['map_options']['center_lng'] = $map_data['places'][0]['location']['lng'];
}


// Styles.
$map_stylers = array();
if ( isset( $map->style_google_map['mapfeaturetype'] ) ) {
	unset( $map_stylers );
	$total_rows = count( $map->style_google_map['mapfeaturetype'] );
	for ( $i = 0;$i < $total_rows;$i++ ) {
		if ( empty( $map->style_google_map['mapfeaturetype'][ $i ] ) or empty( $map->style_google_map['mapelementtype'][ $i ] ) ) {
			continue;
		}
		if ( 'Select Featured Type' == $map->style_google_map['mapfeaturetype'][ $i ] ) {
			continue;
		}
		if ( $map->style_google_map['visibility'][ $i ] == 'off' ) {
			$map_stylers[] = array(
				'featureType' => $map->style_google_map['mapfeaturetype'][ $i ],
				'elementType' => $map->style_google_map['mapelementtype'][ $i ],
				'stylers'     => array(
					array(
						'visibility' => $map->style_google_map['visibility'][ $i ],
					),
				),
			);
		} else {
			$map_stylers[] = array(
				'featureType' => $map->style_google_map['mapfeaturetype'][ $i ],
				'elementType' => $map->style_google_map['mapelementtype'][ $i ],
				'stylers'     => array(
					array(
						'color'      => '#' . str_replace( '#', '', $map->style_google_map['color'][ $i ] ),
						'visibility' => $map->style_google_map['visibility'][ $i ],
					),
				),
			);
		}
	}
}

if ( $map->map_all_control['custom_style'] != '' ) {
	$map_data['styles'] = stripslashes( $map->map_all_control['custom_style'] );
} else if ( isset( $map_stylers ) ) {
	if ( is_array( $map_stylers ) ) {
		$map_data['styles'] = $map_stylers;
	}
}else {
	$map_data['styles'] = '';
}
$map_data['styles'] = apply_filters( 'wpgmp_map_styles', $map_data['styles'], $map );

// Street view.
if ( isset( $map->map_street_view_setting['street_control'] ) && $map->map_street_view_setting['street_control'] == 'true' ) {
	$map_data['street_view'] = array(
		'street_control'           => ( isset( $map->map_street_view_setting['street_control'] ) ? $map->map_street_view_setting['street_control'] : '' ),
		'street_view_close_button' => ( ( isset( $map->map_street_view_setting['street_view_close_button'] ) && $map->map_street_view_setting['street_view_close_button'] === 'true' ) ? true : false ),
		'links_control'            => ( ( isset( $map->map_street_view_setting['links_control'] ) && $map->map_street_view_setting['links_control'] === 'true' ) ? true : false ),
		'street_view_pan_control'  => ( ( isset( $map->map_street_view_setting['street_view_pan_control'] ) && $map->map_street_view_setting['street_view_pan_control'] === 'true' ) ? true : false ),
		'pov_heading'              => $map->map_street_view_setting['pov_heading'],
		'pov_pitch'                => $map->map_street_view_setting['pov_pitch'],
	);
} else {
	$map_data['street_view'] = '';
}
$map_data['street_view'] = apply_filters( 'wpgmp_map_streetview', $map_data['street_view'], $map );

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

// Overlays.
if ( ! empty( $map->map_overlay_setting['overlay'] ) && $map->map_overlay_setting['overlay'] == 'true' ) {
	$map_data['overlay_setting'] = array(
		'border_color' => '#' . str_replace( '#', '', $map->map_overlay_setting['overlay_border_color'] ),
		'width'        => $map->map_overlay_setting['overlay_width'],
		'height'       => $map->map_overlay_setting['overlay_height'],
		'font_size'    => $map->map_overlay_setting['overlay_fontsize'],
		'border_width' => $map->map_overlay_setting['overlay_border_width'],
		'border_style' => $map->map_overlay_setting['overlay_border_style'],
	);
} else {
	$map_data['overlay_setting'] = '';
}

$map_data['overlay_setting'] = apply_filters( 'wpgmp_map_overlays', $map_data['overlay_setting'], $map );

// Limit panning and zoom control.
if ( ! empty( $map->map_all_control['panning_control'] ) && $map->map_all_control['panning_control'] == 'true' ) {
	$map_data['panning_control'] = array(
		'from_latitude'  => $map->map_all_control['from_latitude'],
		'from_longitude' => $map->map_all_control['from_longitude'],
		'to_latitude'    => $map->map_all_control['to_latitude'],
		'to_longitude'   => $map->map_all_control['to_longitude'],
		'zoom_level'     => $map->map_all_control['zoom_level'],
	);
} else {
	$map_data['panning_control'] = '';
}
$map_data['panning_control'] = apply_filters( 'wpgmp_map_panning', $map_data['panning_control'], $map );


if ( isset( $options['maps_only'] ) and $options['maps_only'] == 'true' ) {
	$map->map_all_control['display_marker_category'] = false;
	$map->map_all_control['display_listing']         = false;
}

if ( ! empty( $map->map_all_control['display_listing'] ) && $map->map_all_control['display_listing'] == true ) {
	$filcate       = array( 'place_category' );
	$sorting_array = array(
		'category__asc'  => esc_html__( 'A-Z Category', 'wp-google-map-plugin' ),
		'category__desc' => esc_html__( 'Z-A Category', 'wp-google-map-plugin' ),
		'title__asc'     => esc_html__( 'A-Z Title', 'wp-google-map-plugin' ),
		'title__desc'    => esc_html__( 'Z-A Title', 'wp-google-map-plugin' ),
		'address__asc'   => esc_html__( 'A-Z Address', 'wp-google-map-plugin' ),
		'address__desc'  => esc_html__( 'Z-A Address', 'wp-google-map-plugin' ),
	);

	$sorting_array = apply_filters( 'wpgmp_sorting', $sorting_array, $map );

	if ( empty( $map->map_all_control['wpgmp_listing_number'] ) ) {
		$map->map_all_control['wpgmp_listing_number'] = 10; }

	if ( ! isset( $map->map_all_control['wpgmp_categorydisplaysortby'] ) or $map->map_all_control['wpgmp_categorydisplaysortby'] == '' ) {
		$map->map_all_control['wpgmp_categorydisplaysortby'] = 'asc';
	}
	$render_shortcode = apply_filters( 'wpgmp_listing_render_shortcode', true, $map );

	if ( $render_shortcode == true && is_string($listing_placeholder_content) && !empty($listing_placeholder_content) ) {
		$listing_placeholder_text = do_shortcode( stripslashes( trim( $listing_placeholder_content ) ) );
	} else {
		if(!empty($listing_placeholder_content) && is_string($listing_placeholder_content) && !empty($listing_placeholder_content) ){
			$listing_placeholder_text = stripslashes( trim( $listing_placeholder_content ) );
		}else{
			$listing_placeholder_text = '
					<div class="wpgmp_locations">
					<div class="wpgmp_locations_head">
					<div class="wpgmp_location_title">
					<a href="" class="place_title" data-zoom="{marker_zoom}" data-marker="{marker_id}">{marker_title}</a>
					</div>
					<div class="wpgmp_location_meta">
					<span class="wpgmp_location_category fc-infobox-categories">{marker_category}</span>
					</div>
					</div>
					<div class="wpgmp_locations_content">
					{marker_message}
					</div>
					<div class="wpgmp_locations_foot"></div>
					</div>';
		}
		
	}

	if ( isset( $options['hide_map'] ) and $options['hide_map'] == 'true' ) {
		$map->map_all_control['hide_map'] = 'true';
	}

	if ( isset( $options['perpage'] ) and $options['perpage'] > 0 ) {
		$map->map_all_control['wpgmp_listing_number'] = sanitize_text_field( $options['perpage'] );
	} elseif ( isset( $_GET['perpage'] ) and $map->map_all_control['url_filter'] == 'true' ) {
		$map->map_all_control['wpgmp_listing_number'] = sanitize_text_field( $_GET['perpage'] );
	}

	if ( ! isset( $map->map_all_control['wpgmp_display_sorting_filter'] ) ) {
		$map->map_all_control['wpgmp_display_sorting_filter'] = false;
	}

	if ( ! isset( $map->map_all_control['hide_locations'] ) ) {
		$map->map_all_control['hide_locations'] = false;
	}

	if ( ! isset( $map->map_all_control['hide_map'] ) ) {
		$map->map_all_control['hide_map'] = false;
	}
	
	if ( ! isset( $map->map_all_control['wpgmp_search_display'] ) ) {
		$map->map_all_control['wpgmp_search_display'] = false;
	}

	if ( ! isset( $map->map_all_control['wpgmp_display_sorting_filter'] ) ) {
		$map->map_all_control['wpgmp_display_sorting_filter'] = false;
	}

	if ( ! isset( $map->map_all_control['wpgmp_display_category_filter'] ) ) {
		$map->map_all_control['wpgmp_display_category_filter'] = false;
	}

	if ( ! isset( $map->map_all_control['wpgmp_display_location_per_page_filter'] ) ) {
		$map->map_all_control['wpgmp_display_location_per_page_filter'] = false;
	}

	if ( ! isset( $map->map_all_control['wpgmp_display_print_option'] ) ) {
		$map->map_all_control['wpgmp_display_print_option'] = false;
	}

	$map_data['listing'] = array(
		'listing_header'                   => $map->map_all_control['wpgmp_before_listing'],
		'display_search_form'              => ( 'true' == $map->map_all_control['wpgmp_search_display'] ),
		'search_field_autosuggest'         => '',
		'display_category_filter'          => ( $map->map_all_control['wpgmp_display_category_filter'] == 'true' ),
		'display_sorting_filter'           => ( 'true' == $map->map_all_control['wpgmp_display_sorting_filter'] ),
		'display_radius_filter'            => '',
		'radius_dimension'                 => '',
		'radius_options'                   => '',
		'apply_default_radius'             => '',
		'default_radius'                   => "",
		'default_radius_dimension'         => "",
		'display_location_per_page_filter' => ( 'true' == $map->map_all_control['wpgmp_display_location_per_page_filter'] ),
		'display_print_option'             => ( $map->map_all_control['wpgmp_display_print_option'] == 'true' ),
		'display_grid_option'              => '',
		'filters'                          => array( 'place_category' ),
		'sorting_options'                  => $sorting_array,
		'default_sorting'                  => array(
			'orderby' => ( isset( $map->map_all_control['wpgmp_categorydisplaysort'] ) ) ? $map->map_all_control['wpgmp_categorydisplaysort'] : 'title' ,
			'inorder' => ( isset( $map->map_all_control['wpgmp_categorydisplaysortby'] ) ) ? $map->map_all_control['wpgmp_categorydisplaysortby'] : 'asc',
		),
		'listing_container'                => '.location_listing' . $map->map_id,
		'tabs_container'                   => '.location_listing' . $map->map_id,
		'hide_locations'                   => ( $map->map_all_control['hide_locations'] == 'true' ),
		'filters_position'                 => ( isset($map->map_all_control['filters_position']) ) ? $map->map_all_control['filters_position'] : '',
		'hide_map'                         => ( $map->map_all_control['hide_map'] == 'true' ),
		'pagination'                       => array( 'listing_per_page' => $map->map_all_control['wpgmp_listing_number'] ),
		'list_grid'                        => 'wpgmp_listing_list',
		'listing_placeholder'              => $listing_placeholder_text,
		'list_item_skin'                   => ( isset( $map->map_all_control['item_skin'] ) ) ? $map->map_all_control['item_skin'] : array(
			'name'       => 'default',
			'type'       => 'item',
			'sourcecode' => $listing_placeholder_text,
		),
	);
} else {
	$map_data['listing'] = '';
}
$map_data['listing']      = apply_filters( 'wpgmp_listing', $map_data['listing'], $map );
$map_data['map_property'] = array(
	'map_id'     => $map->map_id);


if ( isset($map->map_all_control['geojson_url']) && '' != sanitize_text_field( $map->map_all_control['geojson_url'] ) ) {
	$map_data['geojson'] = sanitize_text_field( $map->map_all_control['geojson_url'] );
}



// Drawing.
$drawing_editable_true = false;
if ( is_admin() && current_user_can( 'manage_options' ) ) {
	$drawing_editable_true = true;
	$objects               = array( 'circle', 'polygon', 'polyline', 'rectangle' );
	for ( $i = 0; $i < count( $objects ); $i++ ) {
		$object_name    = $objects[ $i ];
		$drawingModes[] = 'google.maps.drawing.OverlayType.' . strtoupper( $object_name );

		$drawing_options[ $object_name ][] = "fillColor: '#ff0000'";
		$drawing_options[ $object_name ][] = "strokeColor: '#ff0000'";
		$drawing_options[ $object_name ][] = 'strokeWeight: 1';
		$drawing_options[ $object_name ][] = 'strokeOpacity: 1';
		$drawing_options[ $object_name ][] = 'zindex: 1';
		$drawing_options[ $object_name ][] = 'fillOpacity: 1';
		$drawing_options[ $object_name ][] = 'editable: true';
		$drawing_options[ $object_name ][] = 'draggable: true';
		$drawing_options[ $object_name ][] = 'clickable: false';
	}

	if ( is_array( $drawingModes ) ) {
		$display_modes = implode( ',', $drawingModes ); }

	if ( is_array( $drawing_options['circle'] ) ) {
		$display_circle_options = implode( ',', $drawing_options['circle'] ); }

	if ( is_array( $drawing_options['polygon'] ) ) {
		$display_polygon_options = implode( ',', $drawing_options['polygon'] ); }

	if ( is_array( $drawing_options['polyline'] ) ) {
		$display_polyline_options = implode( ',', $drawing_options['polyline'] ); }

	if ( is_array( $drawing_options['rectangle'] ) ) {
		$display_rectangle_options = implode( ',', $drawing_options['rectangle'] ); }
}
if ( isset($map->map_polyline_setting['polylines']) && $map->map_polyline_setting['polylines'] != '' ) {
	$map_shapes      = array();
	$all_saved_shape = $map->map_polyline_setting['polylines'];
	$all_shapes      = explode( '|', $all_saved_shape[0] );
	if ( is_array( $all_shapes ) ) {
		foreach ( $all_shapes as $key => $shapes ) {
			$find_shape = explode( '=', $shapes, 2 );

			if ( !empty($find_shape) && isset($find_shape) && is_array($find_shape) && 'polylines' == $find_shape[0] ) {
				$polylines_shape[0] = $find_shape[1]; } elseif ( 'polygons' == $find_shape[0] ) {
				$polygons_shape[0] = $find_shape[1]; } elseif ( 'circles' == $find_shape[0] ) {
					$circles_shape[0] = $find_shape[1]; } elseif ( 'rectangles' == $find_shape[0] ) {
						$rectangles_shape[0] = $find_shape[1]; }
		}
	}

	if ( is_array($polygons_shape) && $polygons_shape[0] && ! empty( $polygons_shape[0] ) ) {
		$all_polylines = explode( '::', $polygons_shape[0] );

		for ( $p = 0;$p < count( $all_polylines );$p++ ) {
			unset( $settings );
			$all_settings     = explode( '...', $all_polylines[ $p ] );
			$cordinates       = explode( '----', $all_settings[0] );
			$all_events       = $all_settings[2];
			$all_events       = explode( '***', $all_events );
			$all_settings_val = explode( ',', $all_settings[1] );

			if ( empty( $all_settings_val[3] ) ) {
				$all_settings_val[3] = '#ff0000'; }

			if ( empty( $all_settings_val[4] ) ) {
				$all_settings_val[4] = 1; }

			if ( empty( $all_settings_val[2] ) ) {
				$all_settings_val[2] = '#ff0000'; }

			if ( empty( $all_settings_val[1] ) ) {
				$all_settings_val[1] = 1; }

			if ( empty( $all_settings_val[0] ) ) {
				$all_settings_val[0] = 5; }

			$settings['stroke_color']   = '#' . str_replace( '#', '', $all_settings_val[2] );
			$settings['stroke_opacity'] = $all_settings_val[1];
			$settings['stroke_weight']  = $all_settings_val[0];
			$settings['fill_color']     = '#' . str_replace( '#', '', $all_settings_val[3] );
			$settings['fill_opacity']   = $all_settings_val[4];
			$events                     = array();
			$events['url']              = $all_events[0];
			$events['message']          = nl2br( stripcslashes( $all_events[1] ) );
			$map_shapes['polygons'][]   = array(
				'cordinates' => $cordinates,
				'settings'   => $settings,
				'events'     => $events,
			);
		}
	}

	if ( is_array($polylines_shape) && $polylines_shape[0] && ! empty( $polylines_shape[0] ) ) {

		$all_polylines = explode( '::', $polylines_shape[0] );
		for ( $p = 0;$p < count( $all_polylines );$p++ ) {
			$all_settings     = explode( '...', $all_polylines[ $p ] );
			$cordinates       = explode( '----', $all_settings[0] );
			$all_events       = $all_settings[2];
			$all_events       = explode( '***', $all_events );
			$all_settings_val = explode( ',', $all_settings[1] );

			if ( empty( $all_settings_val[2] ) ) {
				$all_settings_val[2] = '#ff0000'; }

			if ( empty( $all_settings_val[1] ) ) {
				$all_settings_val[1] = 1; }

			if ( empty( $all_settings_val[0] ) ) {
				$all_settings_val[0] = 5; }

			$settings['stroke_color']   = '#' . str_replace( '#', '', $all_settings_val[2] );
			$settings['stroke_opacity'] = $all_settings_val[1];
			$settings['stroke_weight']  = $all_settings_val[0];
			$events                     = array();
			$events['url']              = $all_events[0];
			$events['message']          = nl2br( stripcslashes( $all_events[1] ) );
			$map_shapes['polylines'][]  = array(
				'cordinates' => $cordinates,
				'settings'   => $settings,
				'events'     => $events,
			);
		}
	}

	if ( is_array($circles_shape) && isset($circles_shape) && ! empty( $circles_shape[0] ) ) {
		$all_circles = explode( '::', $circles_shape[0] );
		for ( $p = 0;$p < count( $all_circles );$p++ ) {
			$all_settings     = explode( '...', $all_circles[ $p ] );
			$cordinates       = explode( '----', $all_settings[0] );
			$all_events       = $all_settings[2];
			$all_events       = explode( '***', $all_events );
			$all_settings_val = explode( ',', $all_settings[1] );

			if ( empty( $all_settings_val[5] ) ) {
				$all_settings_val[5] = 1; }

			if ( empty( $all_settings_val[3] ) ) {
				$all_settings_val[3] = '#ff0000'; }

			if ( empty( $all_settings_val[4] ) ) {
				$all_settings_val[4] = 1; }

			if ( empty( $all_settings_val[2] ) ) {
				$all_settings_val[2] = '#ff0000'; }

			if ( empty( $all_settings_val[1] ) ) {
				$all_settings_val[1] = 1; }

			if ( empty( $all_settings_val[0] ) ) {
				$all_settings_val[0] = 5; }

			$settings['stroke_color']   = '#' . str_replace( '#', '', $all_settings_val[2] );
			$settings['stroke_opacity'] = $all_settings_val[1];
			$settings['stroke_weight']  = $all_settings_val[0];
			$settings['fill_color']     = '#' . str_replace( '#', '', $all_settings_val[3] );
			$settings['fill_opacity']   = $all_settings_val[4];
			$settings['radius']         = $all_settings_val[5];
			$events                     = array();
			$events['url']              = $all_events[0];
			$events['message']          = nl2br( stripcslashes( $all_events[1] ) );
			$map_shapes['circles'][]    = array(
				'cordinates' => $cordinates,
				'settings'   => $settings,
				'events'     => $events,
			);
		}
	}

	if ( isset($rectangles_shape) && $rectangles_shape[0] && ! empty( $rectangles_shape[0] ) ) {
		
		$all_polylines = explode( '::', $rectangles_shape[0] );
		for ( $p = 0;$p < count( $all_polylines );$p++ ) {
			$all_settings     = explode( '...', $all_polylines[ $p ] );
			$cordinates       = explode( '----', $all_settings[0] );
			$all_settings_val = explode( ',', $all_settings[1] );
			$all_events       = $all_settings[2];
			$all_events       = explode( '***', $all_events );
			if ( empty( $all_settings_val[3] ) ) {
				$all_settings_val[3] = 'ff0000'; }

			if ( empty( $all_settings_val[4] ) ) {
				$all_settings_val[4] = 1; }

			if ( empty( $all_settings_val[2] ) ) {
				$all_settings_val[2] = 'ff0000'; }

			if ( empty( $all_settings_val[1] ) ) {
				$all_settings_val[1] = 1; }

			if ( empty( $all_settings_val[0] ) ) {
				$all_settings_val[0] = 5; }

			$settings['stroke_color']   = '#' . str_replace( '#', '', $all_settings_val[2] );
			$settings['stroke_opacity'] = $all_settings_val[1];
			$settings['stroke_weight']  = $all_settings_val[0];
			$settings['fill_color']     = '#' . str_replace( '#', '', $all_settings_val[3] );
			$settings['fill_opacity']   = $all_settings_val[4];
			$events                     = array();
			$events['url']              = $all_events[0];
			$events['message']          = nl2br( stripcslashes( $all_events[1] ) );
			$map_shapes['rectangles'][] = array(
				'cordinates' => $cordinates,
				'settings'   => $settings,
				'events'     => $events,
			);
		}
	}
}


$map_data['shapes'] = array(
	'drawing_editable' => $drawing_editable_true,
);

if ( ! isset( $map_shapes ) ) {
	$map_shapes = array();
}

$map_shapes = apply_filters( 'wpgmp_shapes', $map_shapes, $map_data, $map->map_id );

if ( ! empty( $map_shapes ) && is_array( $map_shapes ) ) {
	$map_data['shapes']['shape'] = $map_shapes; }


$custom_filter_container = apply_filters( 'wpgmp_filter_container', '[data-container="wpgmp-filters-container"]', $map );

$map_data['filters'] = array(
	'filters_container' => $custom_filter_container,
);

$global_settings = maybe_unserialize( get_option( 'wpgmp_settings' ) );
$map_data['global_settings'] = $global_settings;

$map_output = apply_filters( 'wpgmp_before_container', '', $map );

$map_output .= '<div class="wpgmp_map_container wpgmp-map-provider-'.$mapsprovider.' '. apply_filters( 'wpgmp_container_css_class', 'wpgmp-map-' . $map->map_id, $map ) . '" rel="map' . $map->map_id . '" data-plugin-version="'.WPGMP_VERSION.'">';

/* Search Control over map */
if ( $map->map_all_control['search_control'] == 'true' ) {
	$map_output .= '<div class=""><input  data-input="map-search-control" name="map-search-control" class="wpgmp_auto_suggest" placeholder="' . apply_filters('wpgmp_searchbox_placeholder', esc_html__( 'Type here...', 'wp-google-map-plugin' ) ) . '" type="text">';
}

$map_div = apply_filters( 'wpgmp_before_map', '', $map );

if ( isset( $map_data['listing']['hide_map'] ) && $map_data['listing']['hide_map'] == 'true' ) {
	$width  = '0px';
	$height = '0px';
}

$filters_div = '<div class="wpgmp_filter_wrappers"></div>';

if( !class_exists('Listing_Designs_For_Google_Maps') || wp_is_mobile() ){

	if( isset( $map->map_all_control['display_listing'] ) && $map->map_all_control['display_listing'] == 'true' && $map_data['map_options']['current_post_only'] != true){
		
		if(isset($map->map_all_control['filters_position']) && $map->map_all_control['filters_position'] == 'top_map'){
		
		$map_div .= $filters_div.'<div class="wpgmp_map_parent"><div class="wpgmp_map ' . apply_filters( 'wpgmp_map_class', '', $map ) . '" style="width:' . $width . '; height:' . $height . ';" id="map' . $map->map_id . '" data-map-id="'.$map->map_id.'"></div></div>';
		}else{

			$map_div .= '<div class="wpgmp_map_parent"><div class="wpgmp_map ' . apply_filters( 'wpgmp_map_class', '', $map ) . '" style="width:' . $width . '; height:' . $height . ';" id="map' . $map->map_id . '" data-map-id="'.$map->map_id.'"></div></div>'.$filters_div;
			
		}
			
	}else{ 
		
		$map_div .= '<div class="wpgmp_map_parent"><div class="wpgmp_map ' . apply_filters( 'wpgmp_map_class', '', $map ) . '" style="width:' . $width . '; height:' . $height . ';" id="map' . $map->map_id . '" data-map-id="'.$map->map_id.'"></div></div>';
		
	}

}else{

	$map_div .= '<div class="wpgmp_map_parent"><div class="wpgmp_map ' . apply_filters( 'wpgmp_map_class', '', $map ) . '" style="width:' . $width . '; height:' . $height . ';" id="map' . $map->map_id . '" data-map-id="'.$map->map_id.'"></div></div>';
}

$map_div .= apply_filters( 'wpgmp_after_map', '', $map );

$listing_div = apply_filters( 'wpgmp_before_listing', '', $map );

if ( ! empty( $map->map_all_control['display_listing'] ) && $map->map_all_control['display_listing'] == true ) {

	$listing_div .= '<div class="location_listing' . $map->map_id . ' ' . apply_filters( 'wpgmp_listing_css_class', '', $map ) . '" style="float:left; width:100%;"></div>';

	if ( $map->map_all_control['hide_locations'] != true ) {

		$listing_div .= '<div class="location_pagination' . $map->map_id . ' ' . apply_filters( 'wpgmp_pagination_css_class', '', $map ) . ' wpgmp_pagination" style="float:left; width:100%;"></div>';

	}
}

$listing_div .= apply_filters( 'wpgmp_after_listing', '', $map );

$output = $map_div . $listing_div;

if(class_exists('Listing_Designs_For_Google_Maps')){ 
	$map_output .= apply_filters( 'wpgmp_map_output', $output, $map_div, $filters_div, $listing_div, $map->map_id );
}
else { 
$map_output .= apply_filters( 'wpgmp_map_output', $output, $map_div, $listing_div, $map->map_id );
}

$map_output .= '</div>';

$map_output .= apply_filters( 'wpgmp_after_container', '', $map );

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

$map_data['marker_category_icons'] = $marker_category_icons;

$map_data = apply_filters( 'wpgmp_map_data', $map_data, $map );

$map_data = $map_obj->clear_empty_array_values( $map_data );

if( isset($wpgmp_settings['wpgmp_auto_fix']) && !empty($wpgmp_settings['wpgmp_auto_fix']) ){
$auto_fix = $wpgmp_settings['wpgmp_auto_fix'];
}

$map_data['provider'] = $mapsprovider;
$map_data['map_options']['tiles_provider'] = WPGMP_Helper::wpgmp_get_leaflet_provider();

if( isset( $wpgmp_settings['wpgmp_api_key'] ) ){
	$map_data['apiKey'] = $wpgmp_settings['wpgmp_api_key'];
}else{
	$map_data['apiKey'] = '';
}


$map_data = apply_filters( 'wpgmp_final_map_data', $map_data, $map );

if ( $auto_fix == 'true' ) { 
    $map_data_obj = json_encode( $map_data , JSON_UNESCAPED_SLASHES );
}else{
	$map_data_obj = json_encode( $map_data );
}

$map_data_obj = base64_encode($map_data_obj);
$map_data_obj_escaped = htmlspecialchars($map_data_obj, ENT_QUOTES, 'UTF-8');
$map_output .= '<script>';
$map_output .= 'jQuery(document).ready(function($){ ';
$map_output .= 'window.wpgmp = window.wpgmp || {}; ';
$map_output .= 'window.wpgmp.mapdata' . $map_id . ' = "' . $map_data_obj_escaped . '"; ';
$map_output .= '});</script>';

$base_font_size = isset($map->map_all_control['wpgmp_base_font_size'] ) ? trim( str_replace( 'px', '', $map->map_all_control['wpgmp_base_font_size'] ) ) : '';
$css_rules      = array();
$base_class     = '.wpgmp-map-' . $map->map_id . ' ';

if ( $base_font_size != '' ) {
	if (!strpos($base_font_size, 'px'))
	$base_font_size = $base_font_size . 'px';
	$css_rules[]    = $base_class . ',' . $base_class . ' .wpgmp_tabs_container,' . $base_class . ' .wpgmp_listing_container { font-size : ' . $base_font_size . ' !important;}';
}

if ( isset($map->map_all_control['wpgmp_custom_css']) && trim( $map->map_all_control['wpgmp_custom_css'] ) != '' ) {
	$css_rules[] = $map->map_all_control['wpgmp_custom_css'];
}

if ( ! isset( $map->map_all_control['apply_own_schema'] ) ) {
		$map->map_all_control['apply_own_schema'] = false;
	}


if ( isset( $map->map_all_control['color_schema'] ) && trim( $map->map_all_control['color_schema'] ) != '' and $map->map_all_control['apply_own_schema'] != true ) {
	$color_schema                                  = $map->map_all_control['color_schema'];
	$color_schema_colors                           = explode( '_', $color_schema );
	$map->map_all_control['wpgmp_primary_color']   = $color_schema_colors[0];
	$map->map_all_control['wpgmp_secondary_color'] = $color_schema_colors[1];
}




if ( isset( $map->map_all_control['apply_custom_design'] ) && $map->map_all_control['apply_custom_design'] == 'true'  && $map_data['map_options']['advance_template'] == false ) {


	if ( trim( $map->map_all_control['wpgmp_primary_color'] ) != '' && $map->map_all_control['wpgmp_primary_color'] != '#' ) {

		$secondary_color = $map->map_all_control['wpgmp_primary_color'];

		$css_rules[] = $base_class . '.wpgmp_tabs_container .wpgmp_tabs li a.active, ' . $base_class . '.fc-primary-bg, ' . $base_class . '.wpgmp_infowindow .fc-badge.info, ' . $base_class . '.wpgmp_toggle_main_container .amenity_type:hover, ' . $base_class . '
.wpgmp_direction_container p input.wpgmp_find_direction,
' . $base_class . '.wpgmp_nearby_container .wpgmp_find_nearby_button, ' . $base_class . '.fc-label-info, ' . $base_class . '.fc-badge.info, ' . $base_class . '.wpgmp_pagination span,
' . $base_class . '.wpgmp_pagination a, ' . $base_class . 'div.categories_filter select,  ' . $base_class . '.wpgmp_toggle_container, ' . $base_class . ' .categories_filter_reset_btn,' . $base_class . '.categories_filter input[type="button"], ' . $base_class . '.categories_filter_reset_btn:hover {
        background-color: ' . $secondary_color . ';
}

' . $base_class . '.wpgmp-select-all,' . $base_class . '.fc-primary-fg{
        color: ' . $secondary_color . ';
} 

' . $base_class . '.fc-label-info, ' . $base_class . '.fc-badge.info {
    border: 1px solid ' . $secondary_color . ';
}

' . $base_class . 'div.wpgmp_search_form input.wpgmp_search_input {
	border-bottom: 1px solid ' . $secondary_color . ';
} ' . $base_class . '.wpgmp_iw_content .fc-item-title span{color:#fff;}' . $base_class . '.wpgmp_location_category.fc-badge.info{color:#fff;}

' . $base_class . '.fc-infobox-root {
    --fc-infobox-primary:' . $secondary_color . ';
}

';

	

}
}


if ( isset( $map->map_all_control['apply_own_schema'] ) && $map->map_all_control['apply_own_schema'] == 'true' ) {

	if ( trim( $map->map_all_control['wpgmp_secondary_color'] ) != '' && $map->map_all_control['wpgmp_secondary_color'] != '#' ) {

		$primary_color = $map->map_all_control['wpgmp_secondary_color'];
		$css_rules[]   = $base_class . '.wpgmp_tabs_container .wpgmp_tabs, ' . $base_class . '.fc-secondary-bg, ' . $base_class . '.wpgmp_toggle_main_container .amenity_type, ' . $base_class . '.wpgmp_pagination span.current, ' . $base_class . '.wpgmp_pagination a:hover, .wpgmp_toggle_main_container input[type="submit"] {
background: ' . $primary_color . '; 
}

' . $base_class . '.fc-secondary-fg,' . $base_class . '.wpgmp_infowindow .fc-item-title,' . $base_class . '.wpgmp_tabs_container .wpgmp_tab_item .wpgmp_cat_title, ' . $base_class . '.wpgmp_location_title a.place_title {
    color: ' . $primary_color . '; 
}

' . $base_class . 'div.wpgmp_search_form input.wpgmp_search_input:focus {
    border: 1px solid ' . $primary_color . '; 
}' . $base_class . '.wpgmp_location_category.fc-badge.info{color:#fff;}' . $base_class . '.wpgmp_iw_content .fc-item-title span{color:#fff;}';

	}


	/* End Primary Color */

	
	if ( trim( $map->map_all_control['wpgmp_primary_color'] ) != '' && $map->map_all_control['wpgmp_primary_color'] != '#' ) {

		$secondary_color = $map->map_all_control['wpgmp_primary_color'];

		$css_rules[] = $base_class . '.wpgmp_tabs_container .wpgmp_tabs li a.active, ' . $base_class . '.fc-primary-bg, ' . $base_class . '.wpgmp_infowindow .fc-badge.info, ' . $base_class . '.wpgmp_toggle_main_container .amenity_type:hover, ' . $base_class . '
.wpgmp_direction_container p input.wpgmp_find_direction,
' . $base_class . '.wpgmp_nearby_container .wpgmp_find_nearby_button, ' . $base_class . '.fc-label-info, ' . $base_class . '.fc-badge.info, ' . $base_class . '.wpgmp_pagination span,
' . $base_class . '.wpgmp_pagination a, ' . $base_class . 'div.categories_filter select,  ' . $base_class . '.wpgmp_toggle_container, ' . $base_class . '.categories_filter_reset_btn,' . $base_class . '.categories_filter input[type="button"], ' . $base_class . '.categories_filter_reset_btn:hover {
        background-color: ' . $secondary_color . ';
}

' . $base_class . '.wpgmp-select-all,' . $base_class . '.fc-primary-fg {
        color: ' . $secondary_color . ';
} 

' . $base_class . '.fc-label-info, ' . $base_class . '.fc-badge.info {
    border: 1px solid ' . $secondary_color . ';
}

' . $base_class . 'div.wpgmp_search_form input.wpgmp_search_input {
	border-bottom: 1px solid ' . $secondary_color . ';
}

' . $base_class . '.fc-infobox-root {
    --fc-infobox-primary:' . $secondary_color . ';
}

';

	}
}

/* Infowindow style */
if ( $map->map_all_control['map_infowindow_customisations'] == 'true' ) {

	$infowindow_width = esc_attr( isset( $map->map_all_control['infowindow_width'] ) && ( $map->map_all_control['infowindow_width'] != '' ) ? 'width: ' . sanitize_text_field( $map->map_all_control['infowindow_width'] ) . 'px;' : '' ); 
	$infowindow_width_pixel = esc_attr( isset( $map->map_all_control['infowindow_width'] ) && ( $map->map_all_control['infowindow_width'] != '' ) ? '' . sanitize_text_field( $map->map_all_control['infowindow_width'] ) . 'px;' : '350px' ); 

	$css_rules[] = '#map'. $map_id .' .wpgmp_infowindow .wpgmp_iw_head_content, .wpgmp_infowindow .wpgmp_iw_content, #map'. $map_id .' .post_body .geotags_link{padding-left:5px;}
#map'. $map_id .' .wpgmp_infowindow .wpgmp_iw_content{ min-height: 50px!important; min-width: 150px!important; padding-top:5px; }
#map'. $map_id .' .wpgmp_infowindow, #map'. $map_id .' .post_body{ float: left; position: relative; '.' '. $infowindow_width .'}
#map'. $map_id .' .wpgmp_infowindow{float:none;}';
$css_rules[] = ".fc-infobox-root { --fc-infobox-max-width: ".$infowindow_width_pixel." }";
}

if( !isset( $secondary_color ) ) {
	$secondary_color = '';
}


if ( ! empty( $css_rules ) ) {
	$map_output .= '<style id="wpgmp_server_generated_css_rules">' . implode( ' ', apply_filters('wpgmp_css_rules',$css_rules, $map_id, $secondary_color) ) . '</style>';
}

return $map_output;
