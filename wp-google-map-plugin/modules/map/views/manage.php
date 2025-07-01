<?php
/**
 * Manage Maps
 *
 * @package Maps
 */
  $form = new WPGMP_Template();
  echo $form->start_page_layout();
if ( class_exists( 'FlipperCode_List_Table_Helper' ) && ! class_exists( 'WPGMP_Maps_Table' ) ) {

	/**
	 * Display maps manager.
	 */
	class WPGMP_Maps_Table extends FlipperCode_List_Table_Helper {
		/**
		 * Intialize manage category table.
		 *
		 * @param array $tableinfo Table's properties.
		 */
		public function __construct( $tableinfo ) {
			parent::__construct( $tableinfo ); }
		/**
		 * Output for Shortcode column.
		 *
		 * @param array $item Map Row.
		 */
		public function column_shortcodes( $item ) {
			
			$tooltip = "<div class='fc-tooltip'><a href='javascript:void(0);' data-toggle='tooltip' title='Copy Shortcode To Clipboard!' data-clipboard-text='[put_wpgm id=" . $item->map_id . "]' class='copy_to_clipboard'><img src='" . WPGMP_IMAGES . "copy-to-clipboard.png'></a>
				<span class='fc-tooltiptext fc-tooltip-top'>Shortcode has been copied to clipboard.</span>
				</div>";

			echo '<b>[put_wpgm id=' . $item->map_id . ']</b>&nbsp;&nbsp;'. $tooltip; 

		}
		/**
		 * Clone of the map.
		 *
		 * @param  integer $item Map ID.
		 */
		public function copy() {
			$map_id       = intval( $_GET['map_id'] );
			$modelFactory = new WPGMP_Model();
			$map_obj      = $modelFactory->create_object( 'map' );
			$map          = $map_obj->copy( $map_id );
			$this->prepare_items();
			$this->listing();
		}

	}

	global $wpdb;
	$columns   = array(
		'map_title'      => esc_html__( 'Map Title', 'wp-google-map-plugin' ),
		'map_width'      => esc_html__( 'Map Width', 'wp-google-map-plugin' ),
		'map_height'     => esc_html__( 'Map Height', 'wp-google-map-plugin' ),
		'map_zoom_level' => esc_html__( 'Zoom Level', 'wp-google-map-plugin' ),
		'map_type'       => esc_html__( 'Map Type', 'wp-google-map-plugin' ),
		'shortcodes'     => esc_html__( 'Map Shortcode', 'wp-google-map-plugin' )
	);
	$sortable  = array( 'map_title', 'map_width', 'map_height', 'map_zoom_level', 'map_type' );
	$tableinfo = array(
		'table'                   => $wpdb->prefix . 'create_map',
		'textdomain'              => 'wp-google-map-plugin',
		'singular_label'          => esc_html__( 'map', 'wp-google-map-plugin' ),
		'plural_label'            => esc_html__( 'maps', 'wp-google-map-plugin' ),
		'admin_listing_page_name' => 'wpgmp_manage_map',
		'admin_add_page_name'     => 'wpgmp_form_map',
		'primary_col'             => 'map_id',
		'columns'                 => $columns,
		'sortable'                => $sortable,
		'per_page'                => 20,
		'form_id' => 'wpgmp_manage_maps',
		'form_class' => 'wpgmp_listing_form wpgmp_manage_maps',
		'actions'                 => array( 'edit', 'delete', 'copy' ),
		'bulk_actions'            => array( 'delete' => esc_html__( 'Delete', 'wp-google-map-plugin' ) ),
		'col_showing_links'       => 'map_title',
		'searchExclude'           => array( 'shortcodes' ),
		'translation' => array(
			'manage_heading'      => esc_html__( 'Manage Maps', 'wp-google-map-plugin' ),
			'add_button'          => esc_html__( 'Add Map', 'wp-google-map-plugin' ),
			'delete_msg'          => esc_html__( 'Map was deleted successfully.', 'wp-google-map-plugin' ),
			'bulk_delete_msg'     => esc_html__( 'Selected maps were deleted successfully.', 'wp-google-map-plugin' ),
			'insert_msg'          => esc_html__( 'Map was added successfully.', 'wp-google-map-plugin' ),
			'update_msg'          => esc_html__( 'Map was updated successfully.', 'wp-google-map-plugin' ),
			'search_text'         => esc_html__( 'Search', 'wp-google-map-plugin' ),
			'no_records_selected_for_bulk' => esc_html__( 'Please choose some records first to apply bulk action.', 'wp-google-map-plugin' ),
			'no_records_selected' => esc_html__( 'Please choose some records to delete.', 'wp-google-map-plugin' ),
			'no_records_found' => esc_html__( 'No maps were found.', 'wp-google-map-plugin' )
		),
	);
	$obj       = new WPGMP_Maps_Table( $tableinfo );
}

echo $form->end_page_layout();