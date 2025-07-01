<?php
/**
 * Display Tabs over google maps.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */

if ( ! isset( $data['map_all_control'] ) ) {
	$data['map_all_control'] = array();
}

$form->add_element(
	'group', 'map_am_setting', array(
		'value'  => esc_html__( 'Maps Amenities', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link'=> 'https://www.wpmapspro.com/docs/display-nearby-amenities-listing-on-google-maps/',
		'pro' => true
	)
);

$form->add_element(
	'html',
	'wpgmp_map_amenities_msg',
	array(
		'html' => WPGMP_Helper::wpgmp_instructions('amenities'),
		'show'  => 'true',
		'before' => '<div class="fc-7">',
		'after'  => '</div>',
	)
);