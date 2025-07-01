<?php
/**
 * Map's mobile specific setting(s).
 *
 * @package Maps
 */

$form->add_element(
	'group', 'mobile_specific_settings', array(
		'value'  => esc_html__( 'Screen Specific Settings', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-display-map-according-to-specific-screen-size/'

	)
);

$form->add_element(
	'checkbox', 'map_all_control[mobile_specific]', array(
		'label'   => esc_html__( 'Apply Screens Settings', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'wpgmp_overlay',
		'current' => isset( $data['map_all_control']['mobile_specific'] ) ? $data['map_all_control']['mobile_specific'] : '',
		'desc'    => esc_html__( 'Apply screen specific settings for desktop, mobile and tablets.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class switch_onoff',
		'data'    => array( 'target' => '.map_mobile_specific' ),
	)
);

$screens_options = array();


$zoom_level = array();
for ( $i = 0; $i < 20; $i++ ) {
	$zoom_level[ $i ] = $i;
}


$supported_screens = array( esc_html__('Smartphones', 'wp-google-map-plugin'), esc_html__('iPads', 'wp-google-map-plugin'), esc_html__('Large screens', 'wp-google-map-plugin') );


foreach ( $supported_screens as $key => $screen ) {
	$screen_slug = sanitize_title( $screen );
	$width       = $form->field_text(
		'map_all_control[screens][' . $screen_slug . '][map_width_mobile]', array(
			'label'       => esc_html__( 'Map Width', 'wp-google-map-plugin' ),
			'value'       => isset( $data['map_all_control']['screens'][ $screen_slug ]['map_width_mobile'] ) ? $data['map_all_control']['screens'][ $screen_slug ]['map_width_mobile'] : '',
			'placeholder' => esc_html__( 'Map width in pixel.', 'wp-google-map-plugin' ),
		)
	);

	$height = $form->field_text(
		'map_all_control[screens][' . $screen_slug . '][map_height_mobile]', array(
			'label'       => esc_html__( 'Map Height', 'wp-google-map-plugin' ),
			'value'       => isset( $data['map_all_control']['screens'][ $screen_slug ]['map_height_mobile'] ) ? $data['map_all_control']['screens'][ $screen_slug ]['map_height_mobile'] : '',
			'placeholder' => esc_html__( 'Map height in pixel.', 'wp-google-map-plugin' ),
		)
	);


	$zoom = $form->field_select(
		'map_all_control[screens][' . $screen_slug . '][map_zoom_level_mobile]', array(
			'label'         => esc_html__( 'Map Zoom Level', 'wp-google-map-plugin' ),
			'current'       => isset( $data['map_all_control']['screens'][ $screen_slug ]['map_zoom_level_mobile'] ) ? $data['map_all_control']['screens'][ $screen_slug ]['map_zoom_level_mobile'] : '',
			'options'       => $zoom_level,
			'class'         => 'form-controls',
			'default_value' => '5',
		)
	);

	$draggable = $form->field_checkbox(
		'map_all_control[screens][' . $screen_slug . '][map_draggable_mobile]', array(
			'label'         => esc_html__( 'Map Draggable', 'wp-google-map-plugin' ),
			'value'         => 'false',
			'id'            => 'wpgmp_map_draggable_mobile',
			'current'       => isset( $data['map_all_control']['screens'][ $screen_slug ]['map_draggable_mobile'] ) ? $data['map_all_control']['screens'][ $screen_slug ]['map_draggable_mobile'] : '',
			'desc'          => esc_html__( 'Tick to off map draggable.', 'wp-google-map-plugin' ),
			'class'         => 'fc-form-check-input chkbox_class',
			'default_value' => 'true',
		)
	);

	$scrolling = $form->field_checkbox(
		'map_all_control[screens][' . $screen_slug . '][map_scrolling_wheel_mobile]', array(
			'label'         => esc_html__( 'Turn Off Scrolling Wheel', 'wp-google-map-plugin' ),
			'value'         => 'false',
			'id'            => 'map_scrolling_wheel_mobile',
			'current'       => isset( $data['map_all_control']['screens'][ $screen_slug ]['map_scrolling_wheel_mobile'] ) ? $data['map_all_control']['screens'][ $screen_slug ]['map_scrolling_wheel_mobile'] : '',
			'desc'          => esc_html__( 'Tick to off scrolling wheel.', 'wp-google-map-plugin' ),
			'class'         => 'fc-form-check-input chkbox_class ',
			'default_value' => 'true',

		)
	);

	$screens_options[] = array( $screen, $width, $height, $zoom, $draggable, $scrolling );
}

$form->add_element(
	'table', 'screen_specific_settings', array(
		'heading' => array( esc_html__('Screen', 'wp-google-map-plugin'), esc_html__('Width', 'wp-google-map-plugin'), esc_html__('Height', 'wp-google-map-plugin'), esc_html__('Zoom', 'wp-google-map-plugin'), esc_html__('Draggable', 'wp-google-map-plugin'), esc_html__('Scrolling Wheel', 'wp-google-map-plugin') ),
		'data'    => $screens_options,
		'before'  => '<div class="fc-12 map_mobile_specific">',
		'after'   => '</div>',
		'show'    => 'false',
	)
);
