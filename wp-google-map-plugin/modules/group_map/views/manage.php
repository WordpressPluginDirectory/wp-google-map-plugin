<?php
/**
 * Manage Marker Categories
 *
 * @package Maps
 */

  $form = new WPGMP_Template();
  echo $form->start_page_layout();

if ( class_exists( 'FlipperCode_List_Table_Helper' ) and ! class_exists( 'WPGMP_Manage_Group_Table' ) ) {

	/**
	 * Display categories manager.
	 */
	class WPGMP_Manage_Group_Table extends FlipperCode_List_Table_Helper {

		/**
		 * Intialize manage category table.
		 *
		 * @param array $tableinfo Table's properties.
		 */
		public function __construct( $tableinfo ) {
			parent::__construct( $tableinfo ); }
		/**
		 * Show marker image assigned to category.
		 *
		 * @param  array $item Category row.
		 * @return html       Image tag.
		 */
		public function column_group_marker( $item ) {
			$marker = $item->group_marker;
		
			// Fix path if it's a standard icon
			if ( strpos( $marker, 'wp-google-map-pro/icons/' ) !== false ) {
				$marker = str_replace( 'icons', 'assets/images/icons', $marker );
			}
		
			// Output as <img> if it's a valid URL or data URI
			if ( strpos( $marker, 'data:image/svg+xml' ) === 0 || filter_var( $marker, FILTER_VALIDATE_URL ) ) {
				return sprintf(
					'<img src="%s" name="group_image[]" width="32" height="32" alt="Marker" />',
					esc_attr( $marker )
				);
			}
		
			// Fallback (if you ever allow inline <svg> code, which we recommend avoiding here)
			return esc_html__( 'Invalid Marker', 'wp-google-map-plugin' );
		}
		
		/**
		 * Show category's parent name.
		 *
		 * @param  [type] $item Category row.
		 * @return string       Category name.
		 */
		public function column_group_parent( $item ) {

			 global $wpdb;
			 $parent = $wpdb->get_col( $wpdb->prepare( 'SELECT group_map_title FROM ' . $this->table . ' where group_map_id = %d', $item->group_parent ) );
			 $parent = ( ! empty( $parent ) ) ? ucwords( $parent[0] ) : '---';
			 return $parent;

		}

		public function column_extensions_fields( $item ) {

			 global $wpdb;
			 $order = maybe_unserialize( $item->extensions_fields );
			 $cat_order = isset($order['cat_order']) ? $order['cat_order'] : '';
			 return $cat_order;

		}

	}
	
	global $wpdb;
	$columns   = array(
		'group_map_title'   => esc_html__( 'Marker Category Title', 'wp-google-map-plugin' ),
		'group_marker'      => esc_html__( 'Marker Image', 'wp-google-map-plugin' ),
		'group_parent'      => esc_html__( 'Parent Category', 'wp-google-map-plugin' ),
		'extensions_fields' => esc_html__( 'Priority Order', 'wp-google-map-plugin' ),
		'group_added'       => esc_html__( 'Updated On', 'wp-google-map-plugin' ),
	);
	$sortable  = array( 'group_map_title', 'extensions_fields' );
	$tableinfo = array(
		'table'                   => $wpdb->prefix . 'group_map',
		'textdomain'              => 'wp-google-map-plugin',
		'singular_label'          => esc_html__( 'marker category', 'wp-google-map-plugin' ),
		'plural_label'            => esc_html__( 'Categories', 'wp-google-map-plugin' ),
		'admin_listing_page_name' => 'wpgmp_manage_group_map',
		'admin_add_page_name'     => 'wpgmp_form_group_map',
		'primary_col'             => 'group_map_id',
		'columns'                 => $columns,
		'sortable'                => $sortable,
		'per_page'                => 20,
		'form_id' => 'wpgmp_manage_marker_category',
		'form_class' => 'wpgmp_listing_form wpgmp_manage_marker_category',
		'col_showing_links'       => 'group_map_title',
		'searchExclude'           => array( 'group_parent' ),
		'bulk_actions'            => array( 'delete' => esc_html__( 'Delete', 'wp-google-map-plugin' ) ),
		'translation' => array(
			'manage_heading'      => esc_html__( 'Manage Marker Categories', 'wp-google-map-plugin' ),
			'add_button'          => esc_html__( 'Add Category', 'wp-google-map-plugin' ),
			'delete_msg'          => esc_html__( 'Marker category was deleted successfully.', 'wp-google-map-plugin' ),
			'bulk_delete_msg'     => esc_html__( 'Selected marker categories were deleted successfully.', 'wp-google-map-plugin' ),
			'insert_msg'          => esc_html__( 'Marker category was added successfully.', 'wp-google-map-plugin' ),
			'update_msg'          => esc_html__( 'Marker category was updated successfully.', 'wp-google-map-plugin' ),
			'search_text'         => esc_html__( 'Search', 'wp-google-map-plugin' ),
			'no_records_selected_for_bulk' => esc_html__( 'Please choose some records first to apply bulk action.', 'wp-google-map-plugin' ),
			'no_records_selected' => esc_html__( 'Please choose some records to delete.', 'wp-google-map-plugin' ),
			'no_records_found' => esc_html__( 'No marker categories were found.', 'wp-google-map-plugin' )
		),
	);
	$obj = new WPGMP_Manage_Group_Table( $tableinfo );

}

echo $form->end_page_layout();

