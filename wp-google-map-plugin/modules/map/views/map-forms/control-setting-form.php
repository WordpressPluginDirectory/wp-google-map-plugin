<?php
/**
 * Control Setting(s).
 *
 * @package Maps
 */

$form->add_element(
	'group', 'map_control_setting', array(
		'value'  => esc_html__( 'Control Settings', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link'=>'https://www.wpmapspro.com/docs/different-types-of-control-settings/'
	)
);

$form->add_element(
	'checkbox', 'map_all_control[zoom_control]', array(
		'label'   => esc_html__( 'Turn Off Zoom Control', 'wp-google-map-plugin' ),
		'value'   => 'false',
		'id'      => 'wpgmp_zoom_control',
		'current' => isset( $data['map_all_control']['zoom_control'] ) ? $data['map_all_control']['zoom_control'] : '',
		'desc'    => esc_html__( 'Please check to disable zoom control.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);


$form->add_element(
	'checkbox', 'map_all_control[full_screen_control]', array(
		'label'   => esc_html__( 'Turn Off Full Screen Control', 'wp-google-map-plugin' ),
		'value'   => 'false',
		'id'      => 'full_screen_control',
		'current' => isset( $data['map_all_control']['full_screen_control'] ) ? $data['map_all_control']['full_screen_control'] : '',
		'desc'    => esc_html__( 'Please check to disable full screen control.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);


$form->add_element(
	'checkbox', 'map_all_control[map_type_control]', array(
		'label'   => esc_html__( 'Turn Off Map Type Control', 'wp-google-map-plugin' ),
		'value'   => 'false',
		'id'      => 'map_type_control',
		'current' => isset( $data['map_all_control']['map_type_control'] ) ? $data['map_all_control']['map_type_control'] : '',
		'desc'    => esc_html__( 'Please check to disable map type control.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);
$form->add_element(
	'checkbox', 'map_all_control[scale_control]', array(
		'label'   => esc_html__( 'Turn Off Scale Control', 'wp-google-map-plugin' ),
		'value'   => 'false',
		'id'      => 'scale_control',
		'current' => isset( $data['map_all_control']['scale_control'] ) ? $data['map_all_control']['scale_control'] : '',
		'desc'    => esc_html__( 'Please check to disable scale control.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);
$form->add_element(
	'checkbox', 'map_all_control[street_view_control]', array(
		'label'   => esc_html__( 'Turn Off Street View Control', 'wp-google-map-plugin' ),
		'value'   => 'false',
		'id'      => 'wpgmp_street_view_control',
		'current' => isset( $data['map_all_control']['street_view_control'] ) ? $data['map_all_control']['street_view_control'] : '',
		'desc'    => esc_html__( 'Please check to disable street view control.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);
$form->add_element(
	'checkbox', 'map_all_control[overview_map_control]', array(
		'label'   => esc_html__( 'Turn Off Overview Map Control', 'wp-google-map-plugin' ),
		'value'   => 'false',
		'id'      => 'overview_map_control',
		'current' => isset( $data['map_all_control']['overview_map_control'] ) ? $data['map_all_control']['overview_map_control'] : '',
		'desc'    => esc_html__( 'Please check to disable overview map control.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);

$form->add_element(
	'checkbox', 'map_all_control[camera_control]', array(
		'label'   => esc_html__( 'Turn On Camera Control', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'camera_control',
		'current' => isset( $data['map_all_control']['camera_control'] ) ? $data['map_all_control']['camera_control'] : '',
		'desc'    => esc_html__( 'Please check to enable camera control.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);

$form->add_element(
	'checkbox', 'map_all_control[search_control]', array(
		'label'   => esc_html__( 'Turn On Search Control', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'search_control',
		'current' => isset( $data['map_all_control']['search_control'] ) ? $data['map_all_control']['search_control'] : '',
		'desc'    => esc_html__( 'Please check to enable search box control.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);

$form->add_element(
	'checkbox', 'map_all_control[locateme_control]', array(
		'label'   => esc_html__( 'Turn On Locate Me Control', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'search_control',
		'current' => isset( $data['map_all_control']['locateme_control'] ) ? $data['map_all_control']['locateme_control'] : '',
		'desc'    => esc_html__( 'Please check to enable locate me control.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);
