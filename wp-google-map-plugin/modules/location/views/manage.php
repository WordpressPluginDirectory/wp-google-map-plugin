<?php
  global $wpdb;
  $objects       = $wpdb->get_results( 'select location_id, location_address,location_country,location_postal_code,location_state from ' . TBL_LOCATION . " where location_latitude IS NULL OR location_latitude = '' or location_longitude IS NULL OR location_longitude = '' " );
  $geo_locations = array();

  $geocode_limit = apply_filters( 'wpgmp_geocode_limit', 1000 );

  $objects_1000 = array_slice( $objects, 0, $geocode_limit );

if ( is_array( $objects_1000 ) ) {
	foreach ( $objects_1000 as $object ) {
		$geo_locations[ $object->location_id ] = array(
			'address'     => strtolower( trim( $object->location_address ) ),
			'country'     => strtolower( trim( $object->location_country ) ),
			'postal_code' => strtolower( trim( $object->location_postal_code ) ),
			'state'       => strtolower( trim( $object->location_state ) ),
		);
	}
}

  $json = json_encode( $geo_locations );
  $form = new WPGMP_Template();
  echo $form->start_page_layout();

if ( class_exists( 'FlipperCode_List_Table_Helper' ) && ! class_exists( 'WPGMP_Location_Table' ) ) {

	class WPGMP_Location_Table extends FlipperCode_List_Table_Helper {
		public function __construct( $tableinfo ) {
			parent::__construct( $tableinfo ); }  }

	// Minimal Configuration :)
	global $wpdb;
	$columns   = array(
		'location_title'     => esc_html__( 'Location Title', 'wp-google-map-plugin' ),
		'location_address'   => esc_html__( 'Address', 'wp-google-map-plugin' ),
		'location_city'      => esc_html__( 'City', 'wp-google-map-plugin' ),
		'location_latitude'  => esc_html__( 'Latitude', 'wp-google-map-plugin' ),
		'location_longitude' => esc_html__( 'Longitude', 'wp-google-map-plugin' ),
	);
	$sortable  = array( 'location_title', 'location_address', 'location_city', 'location_latitude', 'location_longitude' );
	$tableinfo = array(
		'table'                   => $wpdb->prefix . 'map_locations',
		'textdomain'              => 'wp-google-map-plugin',
		'singular_label'          => esc_html__( 'location', 'wp-google-map-plugin' ),
		'plural_label'            => esc_html__( 'locations', 'wp-google-map-plugin' ),
		'admin_listing_page_name' => 'wpgmp_manage_location',
		'admin_add_page_name'     => 'wpgmp_form_location',
		'primary_col'             => 'location_id',
		'columns'                 => $columns,
		'sortable'                => $sortable,
		'per_page'                => 200,
		'form_id' => 'wpgmp_manage_locations',
	  'form_class' => 'wpgmp_listing_form wpgmp_manage_locations',
		'actions'                 => array( 'edit', 'delete' ),
		'bulk_actions'            => array(
			'delete' => esc_html__( 'Delete', 'wp-google-map-plugin' ),
			'export_location_csv' => esc_html__( 'Export as CSV', 'wp-google-map-plugin' ),
		),
		'col_showing_links'       => 'location_title',
		'translation' => array(
			'manage_heading'      => esc_html__( 'Manage Locations', 'wp-google-map-plugin' ),
			'add_button'          => esc_html__( 'Add Location', 'wp-google-map-plugin' ),
			'delete_msg'          => esc_html__( 'Location was deleted successfully.', 'wp-google-map-plugin' ),
			'bulk_delete_msg'     => esc_html__( 'Selected locations were deleted successfully.', 'wp-google-map-plugin' ),
			'insert_msg'          => esc_html__( 'Location was added successfully.', 'wp-google-map-plugin' ),
			'update_msg'          => esc_html__( 'Location was updated successfully.', 'wp-google-map-plugin' ),
			'search_text'         => esc_html__( 'Search', 'wp-google-map-plugin' ),
			'no_records_selected_for_bulk' => esc_html__( 'Please choose some records first to apply bulk action.', 'wp-google-map-plugin' ),
			'no_records_selected' => esc_html__( 'Please choose some records to delete.', 'wp-google-map-plugin' ),
			'no_records_selected_for_export' => esc_html__( 'Please select some records to export.', 'wp-google-map-plugin' ),
			'no_records_found' => esc_html__( 'No locations were found.', 'wp-google-map-plugin' )
		),
	);
	$obj=new WPGMP_Location_Table( $tableinfo );

}

echo $form->end_page_layout();