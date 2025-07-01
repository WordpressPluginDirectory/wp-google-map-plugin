<?php
/**
 * Manage Route(s)
 *
 * @package Maps
 */
  $form = new WPGMP_Template();
  echo $form->start_page_layout();
if ( class_exists( 'FlipperCode_List_Table_Helper' ) and ! class_exists( 'WPGMP_Route_Table' ) ) {

	/**
	 * Display route(s) manager.
	 */
	class WPGMP_Route_Table extends FlipperCode_List_Table_Helper {

		/**
		 * Intialize manage category table.
		 *
		 * @param array $tableinfo Table's properties.
		 */
		public function __construct( $tableinfo ) {
			parent::__construct( $tableinfo );
		}
		/**
		 * Output for Start Location column.
		 *
		 * @param array $item Route Row.
		 */
		public function column_route_start_location( $item ) {
			$modelFactory = new WPGMP_Model();
			$location_obj = $modelFactory->create_object( 'location' );
			$location     = $location_obj->fetch( array( array( 'location_id', '=', intval( wp_unslash( $item->route_start_location ) ) ) ) );
			if ( isset( $location[0]->location_title ) ) {
				echo esc_html( $location[0]->location_title );
			}
		}
		/**
		 * Output for End Location column.
		 *
		 * @param array $item Route Row.
		 */
		public function column_route_end_location( $item ) {
			$modelFactory = new WPGMP_Model();
			$location_obj = $modelFactory->create_object( 'location' );
			$location     = $location_obj->fetch( array( array( 'location_id', '=', intval( wp_unslash( $item->route_end_location ) ) ) ) );

			if ( isset( $location[0]->location_title ) ) {
				echo esc_html( $location[0]->location_title );
			}
		}
	}
	global $wpdb;
	$columns = array(
		'route_title'          => esc_html__( 'Route Title', 'wp-google-map-plugin' ),
		'route_start_location' => esc_html__( 'Route Start Location', 'wp-google-map-plugin' ),
		'route_end_location'   => esc_html__( 'Route End Location', 'wp-google-map-plugin' ),

	);
	$sortable  = array( 'route_title', 'route_start_location', 'route_end_location' );
	$tableinfo = array(
		'table'                   => $wpdb->prefix . 'map_routes',
		'textdomain'              => 'wp-google-map-plugin',
		'singular_label'          => esc_html__( 'route', 'wp-google-map-plugin' ),
		'plural_label'            => esc_html__( 'routes', 'wp-google-map-plugin' ),
		'admin_listing_page_name' => 'wpgmp_manage_route',
		'admin_add_page_name'     => 'wpgmp_form_route',
		'primary_col'             => 'route_id',
		'columns'                 => $columns,
		'sortable'                => $sortable,
		'per_page'                => 20,
		'form_id' => 'wpgmp_manage_marker_category',
		'form_class' => 'wpgmp_listing_form wpgmp_manage_routes',
		'actions'                 => array( 'edit', 'delete' ),
		'col_showing_links'       => 'route_title',
		'bulk_actions'            => array( 'delete' => esc_html__( 'Delete', 'wp-google-map-plugin' ) ),
		'translation' => array(
			'manage_heading'      => esc_html__( 'Manage Routes', 'wp-google-map-plugin' ),
			'add_button'          => esc_html__( 'Add Route', 'wp-google-map-plugin' ),
			'delete_msg'          => esc_html__( 'Route was deleted successfully.', 'wp-google-map-plugin' ),
			'bulk_delete_msg'     => esc_html__( 'Selected routes were deleted successfully.', 'wp-google-map-plugin' ),
			'insert_msg'          => esc_html__( 'Route was added successfully.', 'wp-google-map-plugin' ),
			'update_msg'          => esc_html__( 'Route was updated successfully.', 'wp-google-map-plugin' ),
			'search_text'         => esc_html__( 'Search', 'wp-google-map-plugin' ),
			'no_records_selected_for_bulk' => esc_html__( 'Please choose some records first to apply bulk action.', 'wp-google-map-plugin' ),
			'no_records_selected' => esc_html__( 'Please choose some records to delete.', 'wp-google-map-plugin' ),
			'no_records_found' => esc_html__( 'No routes were found.', 'wp-google-map-plugin' )
		),
	);
	$obj       = new WPGMP_Route_Table( $tableinfo );

}

echo $form->end_page_layout();