<?php
/**
 * Route Direction setting for google maps.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */

$form->add_element(
	'group',
	'route_direction_settings',
	array(
		'value'  => esc_html__('Route Direction Settings', 'wp-google-map-plugin').WPGMP_PREMIUM_LINK,
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'parent_class'		=> 'fc-locked',
	)
);