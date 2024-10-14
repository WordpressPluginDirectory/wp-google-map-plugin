<?php
/**
 * Display Tabs over google maps.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */

$form->add_element(
	'group',
	'map_am_setting',
	array(
		'value'  => esc_html__('Google Maps Amenities', 'wp-google-map-plugin').WPGMP_PREMIUM_LINK,
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'parent_class'		=> 'fc-locked',
	)
);