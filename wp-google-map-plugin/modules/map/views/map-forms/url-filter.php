<?php
/**
 * Map's Advanced setting(s).
 *
 * @package Maps
 */

$form->add_element(
	'group', 'map_advanced_setting', array(
		'value'  => esc_html__( 'URL Filters Settings', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-do-url-filter-in-google-maps-plugin/',
		'pro' => true
	)
);

$form->add_element(
	'html',
	'wpgmp_map_advanced_setting_msg',
	array(
		'html' => WPGMP_Helper::wpgmp_instructions('url_filters'),
		'show'  => 'true',
		'before' => '<div class="fc-7">',
		'after'  => '</div>',
	)
);

$url_parameters = array(
	array( 'search', esc_html__( 'Search Term', 'wp-google-map-plugin' ) ),
	array( 'category', esc_html__( 'Category ID or Name.', 'wp-google-map-plugin' ) ),
	array( 'limit', esc_html__( '# of Locations.', 'wp-google-map-plugin' ) ),
	array( 'perpage', esc_html__( '# of Locations per page.', 'wp-google-map-plugin' ) ),
	array( 'zoom', esc_html__( 'Zoom Level.', 'wp-google-map-plugin' ) ),
	array( 'hide_map', esc_html__( 'To hide the map. Filters & listing will be visible if enabled.', 'wp-google-map-plugin' ) ),
	array( 'maps_only', esc_html__( 'To show only maps. Tabs, filters, listing will be hide.', 'wp-google-map-plugin' ) ),
);

$form->add_element(
	'table', 'wpgmp_urlparameters_table', array(
		'heading' => array( 'Query Parameter', 'Value' ),
		'data'    => $url_parameters,
		'before'  => '<div class="fc-12">',
		'after'   => '</div>',
		'class'   => 'fc-table fc-table-layout5 url_filer_options',
		'show'    => 'show',
	)
);
