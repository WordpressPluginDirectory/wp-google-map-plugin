<?php
/**
 * Display Tabs over google maps.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */

$form->add_element(
	'group', 'map_tabs_setting', array(
		'value'  => esc_html__( 'Tabs Settings', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/tutorials/',
		'pro' => true
	)
);

$form->add_element(
	'html',
	'wpgmp_map_tabs_setting_msg',
	array(
		'html' => WPGMP_Helper::wpgmp_instructions('tabs'),
		'show'  => 'true',
		'before' => '<div class="fc-7">',
		'after'  => '</div>',
	)
);