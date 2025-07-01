<?php
/**
 * Contro Positioning over google maps.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */


$form->add_element(
	'group', 'map_import_setting', array(
		'value'  => esc_html__( 'Import Settings', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-exportimport-map-from-one-site-to-another-site/'
	)
);

$form->add_element(
	'textarea', 'wpgmp_import_code', array(
		'label'         => esc_html__( 'Import Code', 'wp-google-map-plugin' ),
		'value'         => '',
		'desc'          => esc_html__( 'Paste here import json code to overwrite map settings. Your map settings will be overwrite permanently.', 'wp-google-map-plugin' ),
		'textarea_rows' => 10,
		'textarea_name' => 'wpgmp_import_code',
		'class'         => 'form-control',
	)
);

if ( ! empty( $map ) ) {

	$json_hash = base64_encode( serialize( $map ) );

	$form->add_element(
		'textarea', 'wpgmp_export_code', array(
			'label'         => esc_html__( 'Export Code', 'wp-google-map-plugin' ),
			'value'         => $json_hash,
			'desc'          => esc_html__( 'Copy above export code and paste on your map import setting to migrate maps settings from one site to another site.', 'wp-google-map-plugin' ),
			'textarea_rows' => 10,
			'textarea_name' => 'wpgmp_export_code',
			'class'         => 'form-control',
		)
	);

}
