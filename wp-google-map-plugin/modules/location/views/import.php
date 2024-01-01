<?php
/**
 * Import Location(s) Tool.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */

$form        = new WPGMP_Template();
$current_csv = get_option( 'wpgmp_current_csv' );
$step        = 'step-1';

if ( is_array( $current_csv ) && file_exists( $current_csv['file'] ) ) {
	$step = 'step-2';
}

if ( $step == 'step-1' ) {
	$form->set_header( esc_html__( 'Step 1 - Upload CSV', 'wpgmp-google-map' ), $response );
	$form->add_element(
		'group', 'csv_upload_step_1', array(
			'value'  => esc_html__( 'Step 1 - Upload CSV', 'wpgmp-google-map' ),
			'before' => '<div class="fc-12">',
			'after'  => '</div>',
		)
	);

} elseif ( $step == 'step-2' ) {
	$form->set_header( esc_html__( 'Step 2 - Columns Mapping', 'wpgmp-google-map' ), $response );
	$form->add_element(
		'group', 'csv_upload_step_2', array(
			'value'  => esc_html__( 'Step 2 - Columns Mapping', 'wpgmp-google-map' ),
			'before' => '<div class="fc-12">',
			'after'  => '</div>',
		)
	);
}



if ( $step == 'step-1' ) {


	$form->add_element(
		'file', 'import_file', array(
			'label' => esc_html__( 'Choose File', 'wpgmp-google-map' ),
			'file_text' => esc_html__( 'Choose a File', 'wpgmp-google-map' ),
			'class' => 'file_input',
			'desc'  => esc_html__( 'Please upload a valid CSV file. You can find a sample data csv file in the plugin directory.', 'wpgmp-google-map' ),
		)
	);

	$form->add_element(
		'submit', 'import_loc', array(
			'value'     => esc_html__( 'Continue', 'wpgmp-google-map' ),
			'no-sticky' => true,

		)
	);

	$form->add_element(
		'html', 'instruction_html', array(
			'html'   => '',
			'before' => '<div class="fc-11">',
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


} elseif ( $step == 'step-2' ) {

	$importer  = new FlipperCode_Export_Import();
	$file_data = $importer->import( 'csv', $current_csv['file'] );

	$datas = array();

	$csv_columns = array_values( $file_data[0] );

	$extra_fields = array();
	$core_fields  = array(
		''                     => esc_html__( 'Select Field', 'wpgmp-google-map' ),
		'location_title'       => esc_html__( 'Title', 'wpgmp-google-map' ),
		'location_address'     => esc_html__( 'Address', 'wpgmp-google-map' ),
		'location_latitude'    => esc_html__( 'Latitude', 'wpgmp-google-map' ),
		'location_longitude'   => esc_html__( 'Longitude', 'wpgmp-google-map' ),
		'location_city'        => esc_html__( 'City', 'wpgmp-google-map' ),
		'location_state'       => esc_html__( 'State', 'wpgmp-google-map' ),
		'location_country'     => esc_html__( 'Country', 'wpgmp-google-map' ),
		'location_postal_code' => esc_html__( 'Postal Code', 'wpgmp-google-map' ),
		'location_messages'    => esc_html__( 'Message', 'wpgmp-google-map' ),
		'onclick'              => esc_html__( 'Location Click', 'wpgmp-google-map' ),
		'redirect_link'        => esc_html__( 'Location Redirect URL', 'wpgmp-google-map' ),
		'category'             => esc_html__( 'Category', 'wpgmp-google-map' ),
		'extra_field'          => esc_html__( 'Extra Field', 'wpgmp-google-map' ),
		'location_id'          => esc_html__( 'ID', 'wpgmp-google-map' ),
	);

	foreach ( $core_fields as $key => $value ) {
		$csv_options[ $key ] = $value;
	}



	$html = '<p class="fc-msg"><b>' . ( count( $file_data ) - 1 ) . '</b> ' . esc_html__( 'records are ready to upload. Please map csv columns below and click on Import button.', 'wpgmp-google-map' ) . '. Leave ID field empty if you\'re adding new records. ID field is used to update existing location.</p>';

	$html .= '<div class="fc-table-responsive">
 <table class="fc-table">
 <thead><tr><th>CSV Field</th><th>Assign</th></tr></thead>
 <tbody>';

	foreach ( $csv_columns as $key => $value ) {

		if ( isset( $_POST['csv_columns'][ $key ] ) ) {
			$selected = $_POST['csv_columns'][ $key ];
		} elseif ( array_search( $value, $core_fields ) ) {
			$selected = array_search( $value, $core_fields );
		} else {
			$selected = '';
		}


		$html .= '<tr><td>' . $value . '</td><td>' . $form->field_select(
			'csv_columns[' . $key . ']', array(
				'options' => $csv_options,
				'current' => $selected,
			)
		) . '</td></tr>';
	}

	$html .= '</tbody></table>';
	$form->add_element(
		'html', 'instruction_html', array(
			'html'   => $html,
			'before' => '<div class="fc-11">',
			'after'  => '</div>',
		)
	);
	$form->add_element(
		'hidden', 'operation', array(
			'value' => 'import_location',
		)
	);
	$form->add_element(
		'hidden', 'import', array(
			'value' => 'location_import',
		)
	);


	$submit_button = $form->field_submit(
		'import_loc', array(
			'value'     => esc_html__( 'Import Locations', 'wpgmp-google-map' ),
			'no-sticky' => true,
			'class'     => 'fc-btn',
		)
	);

	$cancel_button = $form->field_button(
		'cancel_import', array(
			'value'     => esc_html__( 'Cancel', 'wpgmp-google-map' ),
			'no-sticky' => true,
			'class'     => 'fc-btn fc-danger fc-btn-big cancel_import',
		)
	);


	$html = "<div class='fc-row'><div class='fc-3'>" . $submit_button . "</div><div class='fc-9'>" . $cancel_button . '</div></div>';

	$form->add_element(
		'html', 'button_html', array(
			'html'   => $html,
			'before' => '<div class="fc-12">',
			'after'  => '</div>',
		)
	);


	$form->render();

}

