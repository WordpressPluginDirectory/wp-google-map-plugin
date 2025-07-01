<?php
/**
 * Import Location(s) Tool.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */

$form        = new WPGMP_Template();
$step        = 'step-1';

if ( $step == 'step-1' ) {
	$form->set_header( esc_html__( 'Step 1 - Upload CSV', 'wp-google-map-plugin' ), $response,$enable=true );
	$form->add_element(
		'group', 'csv_upload_step_1', array(
			'value'  => esc_html__( 'Step 1 - Upload CSV', 'wp-google-map-plugin' ),
			'before' => '<div class="fc-12">',
			'after'  => '</div>',
			'tutorial_link' => 'https://www.wpmapspro.com/docs/import-multiple-locations-single-click/',
			"pro" => true
		)
	);

}


if ( $step == 'step-1' ) {


	$form->add_element(
		'file', 'import_file', array(
			'label' => esc_html__( 'Choose File', 'wp-google-map-plugin' ),
			'file_text' => esc_html__( 'Choose a File', 'wp-google-map-plugin' ),
			'class' => 'file_input',
			'desc'  => esc_html__( 'Please upload a valid CSV file of locations. You can also download a sample data csv file using the below section, fill the csv file with your data  and then you can upload that file here.', 'wp-google-map-plugin' ),
		)
	);

	$download_link = wp_nonce_url(admin_url('admin.php?page=wpgmp_import_location&do_action=sample_csv_download'), 'sample_csv_download_action', 'sample_csv_download_nonce');

	$form->add_element(
		'html', 'download_sample_file', array(
			'label' => esc_html__( 'Download Sample CSV', 'wp-google-map-plugin' ),
			'id' => 'download_sample_file',
			'html' => '<a href="'.$download_link.'">'.__('Download Sample CSV','wp-google-map-plugin').'</a>',
			'desc'  => esc_html__( 'Click here to download the sample csv file, keep the file structure same, re-populate it with your data and upload it using above file upload control.', 'wp-google-map-plugin' ),
		)
	);

	$form->add_element(
		'submit', 'import_loc', array(
			'value'     => esc_html__( 'Continue', 'wp-google-map-plugin' ),
			'no-sticky' => true,
			"pro" => true

		)
	);

	$form->add_element(
		'html', 'instruction_html', array(
			'html'   => '',
			'before' => '<div class="fc-12">',
			'after'  => '</div>',
		)
	);


	$form->add_element(
		'hidden', 'operation', array(
			'value' => 'map_fields',
		)
	);
	$form->add_element(
		'hidden', 'import', array(
			'value' => 'location_import',
		)
	);
	$form->render();

}

