<?php
/**
 * Map's general setting(s).
 *
 * @package Maps
 */

$form->add_element(
	'text', 'map_title', array(
		'label'       => esc_html__( 'Map Title', 'wp-google-map-plugin' ),
		'value'       => isset( $data['map_title'] ) ? $data['map_title'] : '',
		'desc'        => esc_html__( 'Enter map name / title here.', 'wp-google-map-plugin' ),
		'required'    => true,
		'placeholder' => esc_html__( 'Enter map name / title here', 'wp-google-map-plugin' )
	)
);
$form->add_element(
	'text', 'map_width', array(
		'label'       => esc_html__( 'Map Width', 'wp-google-map-plugin' ),
		'value'       => isset( $data['map_width'] ) ? $data['map_width'] : '',
		'desc'        => esc_html__( 'For fixed width map, enter value without px. For eg. 500. If specified with %, that value will be considered as percent value. For eg 90%. We recommend to leave it blank for displaying map with 100% width.', 'wp-google-map-plugin' ),
		'placeholder' => esc_html__( 'Enter map width in pixel or percent', 'wp-google-map-plugin' )
	)
);
$form->add_element(
	'text', 'map_height', array(
		'label'       => esc_html__( 'Map Height', 'wp-google-map-plugin' ),
		'value'       => isset( $data['map_height'] ) ? $data['map_height'] : '',
		'desc'        => esc_html__( 'Enter map height in pixel. For eg. 450', 'wp-google-map-plugin' ),
		'required'    => true,
		'placeholder' => esc_html__( 'Enter map height in pixel', 'wp-google-map-plugin' )
	)
);

$zoom_level = array();
for ( $i = 0; $i < 20; $i++ ) {
	$zoom_level[ $i ] = $i;
}

$form->add_element(
	'select', 'map_all_control[map_minzoom_level]', array(
		'label'         => esc_html__( 'Minimum Zoom Level', 'wp-google-map-plugin' ),
		'current'       => isset( $data['map_all_control']['map_minzoom_level'] ) ? $data['map_all_control']['map_minzoom_level'] : '',
		'desc'          => esc_html__( 'The minimum zoom level which will be displayed on the map.', 'wp-google-map-plugin' ),
		'options'       => $zoom_level,
		'default_value' => 0,
	)
);

$form->add_element(
	'select', 'map_all_control[map_maxzoom_level]', array(
		'label'         => esc_html__( 'Maximum Zoom Level', 'wp-google-map-plugin' ),
		'current'       => isset( $data['map_all_control']['map_maxzoom_level'] ) ? $data['map_all_control']['map_maxzoom_level'] : '',
		'desc'          => esc_html__( 'The maximum zoom level which will be displayed on the map.', 'wp-google-map-plugin' ),
		'options'       => $zoom_level,
		'default_value' => 19,
	)
);

$form->add_element(
	'select', 'map_zoom_level', array(
		'label'         => esc_html__( 'Default Zoom Level', 'wp-google-map-plugin' ),
		'current'       => isset( $data['map_zoom_level'] ) ? $data['map_zoom_level'] : '',
		'desc'          => esc_html__( 'Default zoom level when page is loaded.', 'wp-google-map-plugin' ),
		'options'       => $zoom_level,
		'default_value' => 5,
	)
);

$form->add_element(
	'select', 'map_all_control[zoom_level_after_search]', array(
		'label'         => esc_html__( 'Zoom Level After Search', 'wp-google-map-plugin' ),
		'current'       => isset( $data['map_all_control']['zoom_level_after_search'] ) ? $data['map_all_control']['zoom_level_after_search'] : '',
		'desc'          => esc_html__( 'Please select zoom level after search a location on map.', 'wp-google-map-plugin' ),
		'options'       => $zoom_level,
		'default_value' => 10,
	)
);

$map_type = array(
	'ROADMAP'   => 'ROADMAP',
	'SATELLITE' => 'SATELLITE',
	'HYBRID'    => 'HYBRID',
	'TERRAIN'   => 'TERRAIN',
);
$form->add_element(
	'select', 'map_type', array(
		'label'   => esc_html__( 'Map Type', 'wp-google-map-plugin' ),
		'current' => isset( $data['map_type'] ) ? $data['map_type'] : '',
		'options' => $map_type,
	)
);

$form->add_element(
	'checkbox', 'map_scrolling_wheel', array(
		'label'   => esc_html__( 'Turn Off Scrolling Wheel', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'wpgmp_map_scrolling_wheel',
		'current' => isset( $data['map_scrolling_wheel'] ) ? $data['map_scrolling_wheel'] : '',
		'desc'    => esc_html__( 'Please check to disable scroll wheel zoom.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class ',
	)
);

$form->add_element(
	'checkbox', 'map_all_control[doubleclickzoom]', array(
		'label'   => esc_html__( 'Double Click Zoom', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'doubleclickzoom',
		'current' => isset( $data['map_all_control']['doubleclickzoom'] ) ? $data['map_all_control']['doubleclickzoom'] : '',
		'desc'    => esc_html__( 'Please check to enable zoom on double click on the map.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class ',
	)
);

$form->add_element(
	'checkbox', 'map_all_control[map_draggable]', array(
		'label'   => esc_html__( 'Map Draggable', 'wp-google-map-plugin' ),
		'value'   => 'false',
		'id'      => 'wpgmp_map_draggable',
		'current' => isset( $data['map_all_control']['map_draggable'] ) ? $data['map_all_control']['map_draggable'] : '',
		'desc'    => esc_html__( 'Please check to disable map draggable.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);

$form->add_element(
	'checkbox', 'map_45imagery', array(
		'label'   => esc_html__( '45&deg; Imagery', 'wp-google-map-plugin' ),
		'value'   => '45',
		'id'      => 'wpgmp_map_45imagery',
		'current' => isset( $data['map_45imagery'] ) ? $data['map_45imagery'] : '',
		'desc'    => esc_html__( 'Apply 45&deg; Imagery ? (only available for map type SATELLITE and HYBRID).', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);

$gesture = array(
	'auto'        => 'Auto',
	'greedy'      => 'Greedy',
	'cooperative' => 'Cooperative',
	'none'        => 'None',
);
$form->add_element(
	'select', 'map_all_control[gesture]', array(
		'label'   => esc_html__( 'Gesture Handling', 'wp-google-map-plugin' ),
		'current' => isset( $data['map_all_control']['gesture'] ) ? $data['map_all_control']['gesture'] : '',
		'options' => $gesture,
		'desc'    => esc_html__( 'Controlling Zoom and Pan for desktop, touchscreen and mobile devices.', 'wp-google-map-plugin' ),
	)
);
