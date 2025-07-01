<?php
/**
 * Map's Center Location setting(s).
 *
 * @package Maps
 */

$form->add_element(
	'group', 'map_center_setting', array(
		'value'  => esc_html__( 'Map\'s Center', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/topic/center-location/'
	)
);

$form->add_element(
	'text', 'map_all_control[map_center_latitude]', array(
		'label'       => esc_html__( 'Center Latitude', 'wp-google-map-plugin' ),
		'value'       => isset( $data['map_all_control']['map_center_latitude'] ) ? $data['map_all_control']['map_center_latitude'] : '',
		'desc'        => esc_html__( 'Enter here the center latitude.', 'wp-google-map-plugin' ),
		'placeholder' => esc_html__( 'Enter here the center latitude.', 'wp-google-map-plugin' )
	)
);
$form->add_element(
	'text', 'map_all_control[map_center_longitude]', array(
		'label'       => esc_html__( 'Center Longitude', 'wp-google-map-plugin' ),
		'value'       => isset( $data['map_all_control']['map_center_longitude'] ) ? $data['map_all_control']['map_center_longitude'] : '',
		'desc'        => esc_html__( 'Enter here the center longitude.', 'wp-google-map-plugin' ),
		'placeholder' => esc_html__( 'Enter here the center longitude.', 'wp-google-map-plugin' )
	)
);


$form->add_element(
	'checkbox', 'map_all_control[nearest_location]', array(
		'label'   => esc_html__( 'Center by Current Location', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'class'   => 'chkbox_class',
		'id'      => 'wpgmp_nearest_location',
		'current' => isset( $data['map_all_control']['nearest_location'] ) ? $data['map_all_control']['nearest_location'] : '',
		'desc'    => esc_html__( 'Center the map based on visitor\'s current location. SSL (https://) is required on the website.', 'wp-google-map-plugin' ),
		'placeholder'    => esc_html__( 'Center the map based on visitor\'s current location. SSL (https://) is required on the website.', 'wp-google-map-plugin' )
	)
);

$form->add_element(
	'checkbox', 'map_all_control[fit_bounds]', array(
		'label'   => esc_html__( 'Center by Assigned Locations', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'class'   => 'chkbox_class',
		'id'      => 'wpgmp_fit_bounds_location',
		'current' => isset( $data['map_all_control']['fit_bounds'] ) ? $data['map_all_control']['fit_bounds'] : '',
		'desc'    => esc_html__( 'Center the map based on locations assigned to the map to show all locations at once.', 'wp-google-map-plugin' ).'<br><b>'.esc_html__('( Most recommended way for centering the map according to assigned locations. )', 'wp-google-map-plugin').'</b>',
	)
);

$form->add_element(
	'checkbox', 'map_all_control[current_post]', array(
		'label'   => esc_html__( 'Center by Current Post', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'class'   => 'chkbox_class',
		'current' => isset( $data['map_all_control']['current_post'] ) ? $data['map_all_control']['current_post'] : '',
		'desc'    => esc_html__( 'To display a map centred on the current post', 'wp-google-map-plugin' ),
	)
);

$form->add_element(
	'checkbox', 'map_all_control[show_center_circle]', array(
		'label'   => esc_html__( 'Display Circle', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'show_center_circle',
		'current' => isset( $data['map_all_control']['show_center_circle'] ) ? $data['map_all_control']['show_center_circle'] : '',
		'desc'    => esc_html__( 'Display a circle around the center location.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class switch_onoff',
		'data'    => array( 'target' => '.center_circle_settings' ),
	)
);
$form->set_col( 6 );
$color = ( empty( $data['map_all_control']['center_circle_fillcolor'] ) ) ? '8CAEF2' : sanitize_text_field( wp_unslash( $data['map_all_control']['center_circle_fillcolor'] ) );
$form->add_element(
	'text', 'map_all_control[center_circle_fillcolor]', array(
		'value'  => $color,
		'class'  => 'color form-control center_circle_settings',
		'id'     => 'center_circle_fillcolor',
		'desc'   => esc_html__( 'Fill color', 'wp-google-map-plugin' ),
		'placeholder'   => esc_html__( 'Fill color', 'wp-google-map-plugin' ),
		'show'   => 'false',
		'before' => '<div class="fc-3">&nbsp;</div><div class="fc-9"><div class="fc-center-cirle-control-list"><div class="fc-center-cirle-control-item">',
		'after'  => '</div>',
	)
);
$form->add_element(
	'text', 'map_all_control[center_circle_fillopacity]', array(
		'value'         => isset( $data['map_all_control']['center_circle_fillopacity'] ) ? $data['map_all_control']['center_circle_fillopacity'] : '.5',
		'class'         => 'form-control center_circle_settings',
		'id'            => 'center_circle_fillopacity',
		'desc'          => esc_html__( 'Enter circle fill opacity', 'wp-google-map-plugin' ),
		'placeholder'          => esc_html__( 'Enter fill opacity', 'wp-google-map-plugin' ),
		'show'          => 'false',
		'before'        => '<div class="fc-center-cirle-control-item">',
		'after'         => '</div>',
		'default_value' => '.5',
	)
);
$color = ( empty( $data['map_all_control']['center_circle_strokecolor'] ) ) ? '8CAEF2' : sanitize_text_field( wp_unslash( $data['map_all_control']['center_circle_strokecolor'] ) );
$form->add_element(
	'text', 'map_all_control[center_circle_strokecolor]', array(
		'value'  => $color,
		'class'  => 'color {pickerClosable:true} form-control center_circle_settings',
		'id'     => 'center_circle_strokecolor',
		'desc'   => esc_html__( 'Stroke color', 'wp-google-map-plugin' ),
		'show'   => 'false',
		'before' => '<div class="fc-center-cirle-control-item">',
		'after'  => '</div>',
	)
);

$form->add_element(
	'text', 'map_all_control[center_circle_strokeopacity]', array(
		'value'         => isset( $data['map_all_control']['center_circle_strokeopacity'] ) ? $data['map_all_control']['center_circle_strokeopacity'] : '.5',
		'class'         => 'form-control center_circle_settings',
		'id'            => 'center_circle_strokeopacity',
		'desc'          => esc_html__( 'Enter circle stroke opacity', 'wp-google-map-plugin' ),
		'placeholder'          => esc_html__( 'Enter stroke opacity', 'wp-google-map-plugin' ),
		'show'          => 'false',
		'before'        => '<div class="fc-center-cirle-control-item">',
		'after'         => '</div>',
		'default_value' => '.5',
	)
);

$form->add_element(
	'text', 'map_all_control[center_circle_strokeweight]', array(
		'value'         => isset( $data['map_all_control']['center_circle_strokeweight'] ) ? $data['map_all_control']['center_circle_strokeweight'] : '',
		'class'         => 'form-control center_circle_settings',
		'id'            => 'center_circle_strokeweight',
		'desc'          => esc_html__( 'Enter circle stroke weight', 'wp-google-map-plugin' ),
		'placeholder'   => esc_html__( 'Enter stroke weight', 'wp-google-map-plugin' ),
		'show'          => 'false',
		'before'        => '<div class="fc-center-cirle-control-item">',
		'after'         => '</div>',
		'default_value' => '1',
	)
);

$form->add_element(
	'text', 'map_all_control[center_circle_radius]', array(
		'value'         => isset( $data['map_all_control']['center_circle_radius'] ) ? $data['map_all_control']['center_circle_radius'] : '',
		'class'         => 'form-control center_circle_settings',
		'id'            => 'center_circle_radius',
		'desc'          => esc_html__( 'Enter circle radius around center location', 'wp-google-map-plugin' ),
		'placeholder'          => esc_html__( 'Enter circle radius', 'wp-google-map-plugin' ),
		'show'          => 'false',
		'before'        => '<div class="fc-center-cirle-control-item">',
		'after'         => '</div></div></div>',
		'default_value' => '5',
	)
);

$form->set_col( 1 );
$form->add_element(
	'checkbox', 'map_all_control[show_center_marker]', array(
		'label'   => esc_html__( 'Display Marker', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'show_center_marker',
		'current' => isset( $data['map_all_control']['show_center_marker'] ) ? $data['map_all_control']['show_center_marker'] : '',
		'desc'    => esc_html__( 'Display a marker on center location.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class switch_onoff',
		'data'    => array( 'target' => '.center_marker_settings' ),
	)
);

$form->add_element(
	'textarea', 'map_all_control[show_center_marker_infowindow]', array(
		'label'         => esc_html__( 'Infowindow Message for Center Marker', 'wp-google-map-plugin' ),
		'value'         => isset( $data['map_all_control']['show_center_marker_infowindow'] ) ? $data['map_all_control']['show_center_marker_infowindow'] : '',
		'desc'          => esc_html__( 'Display custom message to display inside infowindow of center location marker.', 'wp-google-map-plugin' ),
		'placeholder'          => esc_html__( 'Display custom message to display for center location marker.', 'wp-google-map-plugin' ),
		'textarea_rows' => 10,
		'textarea_name' => 'show_center_marker_infowindow',
		'class'         => 'form-control center_marker_settings',
		'id'            => 'show_center_marker_infowindow',
		'show'          => 'false',
	)
);

$form->add_element(
	'image_picker', 'map_all_control[marker_center_icon]', array(
		'label'         => esc_html__( 'Choose Center Marker Image', 'wp-google-map-plugin' ),
		'src'           => ( isset( $data['map_all_control']['marker_center_icon'] ) ? wp_unslash( $data['map_all_control']['marker_center_icon'] ) : WPGMP_Helper::wpgmp_default_marker_icon() ),
		'required'      => false,
		'before'        => '<div class="fc-6 center_marker_settings">',
		'after'         => '</div>',
		'show'          => 'false',
		'choose_button' => esc_html__( 'Choose', 'wp-google-map-plugin' ),
		'remove_button' => esc_html__( 'Remove', 'wp-google-map-plugin' ),
		'id'            => 'marker_center_icon',
	)
);
