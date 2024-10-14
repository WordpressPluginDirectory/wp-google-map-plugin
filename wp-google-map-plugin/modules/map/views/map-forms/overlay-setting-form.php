<?php
/**
 * Overlay Settings.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */

$form->add_element(
	'group',
	'overlay_settings',
	array(
		'value'  => esc_html__('Overlays Settings', 'wp-google-map-plugin').WPGMP_PREMIUM_LINK,
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'parent_class'		=> 'fc-locked',
	)
);