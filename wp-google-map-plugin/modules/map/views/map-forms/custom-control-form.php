<?php
/**
 * Custom Control Setting(s).
 *
 * @package Maps
 */

$form->add_element(
	'group', 'map_custom_control_setting', array(
		'value'  => esc_html__( 'Custom Control(s) Settings', 'wp-google-map-plugin' ).WPGMP_PREMIUM_LINK,
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'parent_class' => 'fc-locked',
	)
);