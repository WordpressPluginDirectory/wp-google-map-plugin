<?php
/**
 *Marker Spiderfier Effect for overlapping markers in google maps.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */

//echo '<pre>'; print_r($data); exit;


$form->add_element(
	'group', 'map_marker_spidifier_group', array(
		'value'  => esc_html__( 'Overlapping Markers Spiderfier Settings', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-use-spiderfier-effect-for-overlapping-markers-on-map/',
		'pro' => true
	)
);

$form->add_element(
	'html',
	'wpgmp_map_spidereffect_msg',
	array(
		'html' => WPGMP_Helper::wpgmp_instructions('spidereffect'),
		'show'  => 'true',
		'before' => '<div class="fc-7">',
		'after'  => '</div>',
	)
);