<?php
/**
 * Custom Control Setting(s).
 *
 * @package Maps
 */

$form->add_element(
	'group', 'map_custom_control_setting', array(
		'value'  => esc_html__( 'Custom Control(s) Settings', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-display-custom-controls-in-google-maps/',
		"pro" => true
	)
);


$form->add_element(
	'html',
	'wpgmp_custom_control_setting_msg',
	array(
		'html' => WPGMP_Helper::wpgmp_instructions('custom_control'),
		'show'  => 'true',
		'before' => '<div class="fc-7">',
		'after'  => '</div>',
	)
);