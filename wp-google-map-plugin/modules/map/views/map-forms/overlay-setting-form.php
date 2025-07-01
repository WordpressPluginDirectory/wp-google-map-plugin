<?php
/**
 * Overlay Settings.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */

$form->add_element(
	'group', 'map_overlay_setting', array(
		'value'  => esc_html__( 'Overlays Settings', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-apply-overlays-on-a-map/'
	)
);

$form->add_element(
	'checkbox', 'map_overlay_setting[overlay]', array(
		'label'   => esc_html__( 'Apply Overlays', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'wpgmp_overlay',
		'current' => isset( $data['map_overlay_setting']['overlay'] ) ? $data['map_overlay_setting']['overlay'] : '',
		'desc'    => esc_html__( 'Please check to apply overlays. if enabled, below information can not be empty.', 'wp-google-map-plugin' ),
		'placeholder'    => esc_html__( 'Please check to apply overlays. if enabled, below information can not be empty.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class switch_onoff',
		'data'    => array( 'target' => '.map_overlay_setting' ),
	)
);


$form->add_element(
	'text', 'map_overlay_setting[overlay_border_color]', array(
		'label' => esc_html__( 'Overlay Border Color', 'wp-google-map-plugin' ),
		'value' => isset( $data['map_overlay_setting']['overlay_border_color'] ) ? $data['map_overlay_setting']['overlay_border_color'] : '',
		'desc'  => esc_html__( 'Default is red.', 'wp-google-map-plugin' ),
		'placeholder'  => esc_html__( 'Default is red.', 'wp-google-map-plugin' ),
		'class' => 'color {pickerClosable:true} form-control map_overlay_setting',
		'show'  => 'false',
	)
);

$form->add_element(
	'text', 'map_overlay_setting[overlay_width]', array(
		'label'         => esc_html__( 'Overlay Width', 'wp-google-map-plugin' ),
		'value'         => isset( $data['map_overlay_setting']['overlay_width'] ) ? $data['map_overlay_setting']['overlay_width'] : '',
		'desc'          => esc_html__( 'Enter the overlay width in numeric pixel value. The default value is 200.', 'wp-google-map-plugin' ),
		'placeholder'   => esc_html__( 'Enter the overlay width numeric value.', 'wp-google-map-plugin' ),
		'class'         => 'form-control map_overlay_setting',
		'show'          => 'false',
		'default_value' => '200',
	)
);

$form->add_element(
	'text', 'map_overlay_setting[overlay_height]', array(
		'label'         => esc_html__( 'Overlay Height', 'wp-google-map-plugin' ),
		'value'         => isset( $data['map_overlay_setting']['overlay_height'] ) ? $data['map_overlay_setting']['overlay_height'] : '',
		'desc'          => esc_html__( 'Enter the overlay height in numeric pixel value. The default value is 200.', 'wp-google-map-plugin' ),
		'placeholder'   => esc_html__( 'Enter the overlay height numeric value.', 'wp-google-map-plugin' ),
		'class'         => 'form-control map_overlay_setting',
		'show'          => 'false',
		'default_value' => '200',
	)
);

$form->add_element(
	'text', 'map_overlay_setting[overlay_fontsize]', array(
		'label'         => esc_html__( 'Overlay Font size', 'wp-google-map-plugin' ),
		'value'         => isset( $data['map_overlay_setting']['overlay_fontsize'] ) ? $data['map_overlay_setting']['overlay_fontsize'] : '',
		'desc'          => esc_html__( 'Enter here the numeric value for font size of overlay. The default is 16.', 'wp-google-map-plugin' ),
		'placeholder'          => esc_html__( 'Enter the numeric value for font size.', 'wp-google-map-plugin' ),
		'class'         => 'form-control map_overlay_setting',
		'show'          => 'false',
		'default_value' => '16',
	)
);

$form->add_element(
	'text', 'map_overlay_setting[overlay_border_width]', array(
		'label'         => esc_html__( 'Overlay Border Width', 'wp-google-map-plugin' ),
		'value'         => isset( $data['map_overlay_setting']['overlay_border_width'] ) ? $data['map_overlay_setting']['overlay_border_width'] : '',
		'desc'          => esc_html__( 'Enter the numeric pixel value for border of overlay. The default value is 2.', 'wp-google-map-plugin' ),
		'placeholder'   => esc_html__( 'Enter the numeric pixel value for border of overlay', 'wp-google-map-plugin' ),
		'class'         => 'form-control map_overlay_setting',
		'show'          => 'false',
		'default_value' => '2',
	)
);
$overlay_values = array(
	'dotted' => 'Dotted',
	'solid'  => 'Solid',
	'dashed' => 'Dashed',
);
$form->add_element(
	'select', 'map_overlay_setting[overlay_border_style]', array(
		'label'   => esc_html__( 'Overlay Border Style', 'wp-google-map-plugin' ),
		'current' => isset( $data['map_overlay_setting']['overlay_border_style'] ) ? $data['map_overlay_setting']['overlay_border_style'] : '',
		'desc'    => esc_html__( 'Select overlay border style.', 'wp-google-map-plugin' ),
		'options' => $overlay_values,
		'class'   => 'map_overlay_setting form-control',
		'show'    => 'false',
	)
);
