<?php
/**
 * Route Direction setting for google maps.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */

$form->add_element(
	'group', 'map_route_settings', array(
		'value'  => esc_html__( 'Route Direction Settings', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-display-route-tab-in-tabs-setting/',
		'pro' => true
	)
);

$form->add_element(
	'html',
	'wpgmp_map_route_setting_msg',
	array(
		'html' => WPGMP_Helper::wpgmp_instructions('routes'),
		'show'  => 'true',
		'before' => '<div class="fc-7">',
		'after'  => '</div>',
	)
);