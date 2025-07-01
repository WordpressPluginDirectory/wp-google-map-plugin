<?php
/**
 * Class: WPGMP_Model_Group_Map
 * Handles Marker Category (Group Map) CRUD operations.
 *
 * @package Maps
 * @author Flipper Code
 * @version 3.0.0
 */

if ( ! class_exists( 'WPGMP_Model_Group_Map' ) ) {

	class WPGMP_Model_Group_Map extends FlipperCode_Model_Base {
		/**
		 * Validation rules for category properties.
		 * @var array
		 */
		protected $validations;

		/**
		 * SQL query placeholder.
		 * @var string
		 */
		protected $query;

		/**
		 * Constructor: Set table, unique key, and validation rules.
		 */
		function __construct() {
			$this->table     = TBL_GROUPMAP;
			$this->unique    = 'group_map_id';
			$this->validations = [
				'group_map_title' => [
					'req'     => esc_html__( 'Please enter title for marker category.', 'wp-google-map-plugin' ),
					'max=255' => esc_html__( 'Marker category title cannot contain more than 255 characters.', 'wp-google-map-plugin' )
				],
				'group_marker' => [
					'req' => esc_html__( 'Please upload marker image.', 'wp-google-map-plugin' )
				]
			];
		}

		/**
		 * Return navigation labels for admin panel.
		 * @return array
		 */
		function navigation() {
			return [
				'wpgmp_form_group_map'   => esc_html__( 'Add Category', 'wp-google-map-plugin' ),
				'wpgmp_manage_group_map' => esc_html__( 'Manage Categories', 'wp-google-map-plugin' )
			];
		}

		/**
		 * Generate table creation SQL.
		 * @return string
		 */
		function install() {
			global $wpdb;
			$charset_collate = $wpdb->get_charset_collate();

			return "CREATE TABLE {$wpdb->prefix}group_map (
				group_map_id INT(11) NOT NULL AUTO_INCREMENT,
				group_map_title VARCHAR(255) DEFAULT NULL,
				group_marker TEXT DEFAULT NULL,
				extensions_fields TEXT DEFAULT NULL,
				group_parent INT(11) DEFAULT 0,
				group_added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
				PRIMARY KEY  (group_map_id)
			) $charset_collate;";
		}


		/**
		 * Fetch and filter marker categories.
		 * @param array $where Filter conditions.
		 * @return array Filtered category objects.
		 */
		public function fetch( $where = [] ) {
			$objects = $this->get( $this->table, $where );
			foreach ( $objects as $object ) {
				if ( isset( $object->group_marker ) && str_contains( $object->group_marker, 'wp-google-map-pro/icons/' ) ) {
					$object->group_marker = str_replace( 'icons', 'assets/images/icons', $object->group_marker );
				}
				$object->extensions_fields = maybe_unserialize( $object->extensions_fields );
			}
			return apply_filters( 'wpgmp_category_results', $objects );
		}

		/**
		 * Insert or update marker category into database.
		 * @return int|false Last inserted ID or false.
		 */
		function write_to_db() {
			$entityID = isset( $_POST['entityID'] ) ? intval( wp_unslash( $_POST['entityID'] ) ) : '';
			
			$data = [
				'group_map_title'   => sanitize_text_field( wp_unslash( $_POST['group_map_title'] ?? '' ) ),
				'group_parent'      => isset( $_POST['group_parent'] ) ? intval( wp_unslash( $_POST['group_parent'] ) ) : 0,
				'extensions_fields' => isset( $_POST['extensions_fields'] ) ? serialize( wp_unslash( $_POST['extensions_fields'] ) ) : serialize( [ 'cat_order' => '' ] ),
				'group_marker'      => ! empty( $_POST['group_marker'] ) ? wp_unslash( $_POST['group_marker'] ) : WPGMP_Helper::wpgmp_default_marker_icon(),
			];

			$where = $entityID ? [ $this->unique => $entityID ] : '';

			do_action( 'wpgmp_before_category_save', $data, $where );
			$data = apply_filters( 'wpgmp_category_save', $data, $where );
			$result = FlipperCode_Database::insert_or_update( $this->table, $data, $where );
			do_action( 'wpgmp_after_category_save', $data, $result, $where );

			return $result;
		}

		/**
		 * Save marker category via REST API.
		 * @return WP_REST_Response|WP_Error
		 */
		public function save_via_rest() {
			$errors = [];

			if ( empty( $_POST['group_map_title'] ) ) {
				$errors[] = esc_html__( 'Please enter marker category title.', 'wp-google-map-plugin' );
			}
			if ( ! empty( $_POST['extensions_fields']['cat_order'] ) && ! is_numeric( $_POST['extensions_fields']['cat_order'] ) ) {
				$errors[] = esc_html__( 'Please enter only a numeric value for marker category order number.', 'wp-google-map-plugin' );
			}

			$errors = apply_filters( 'wpgmp_marker_category_rest_validation', $errors, $_POST );
			if ( ! empty( $errors ) ) {
				return new WP_Error( 'wpgmp_rest_validation_failed', esc_html__( 'Please check the errors and try again.', 'wp-google-map-plugin' ), [ 'status' => 422, 'errors' => $errors ] );
			}

			$result = $this->write_to_db();
			$action = isset( $_POST['entityID'] ) ? 'update' : 'create';

			$response = apply_filters( 'wpgmp_category_rest_response', [
				'success'      => ( false !== $result ),
				'wpgmp_module' => 'marker_category',
				'action'       => $action
			], $action, $result );

			return new WP_REST_Response( $response, $response['success'] ? 200 : 400 );
		}

		/**
		 * Save marker category via admin form.
		 * @return array
		 */
		function save() {
			$entityID = isset( $_POST['entityID'] ) ? intval( wp_unslash( $_POST['entityID'] ) ) : '';

			if ( empty( $_REQUEST['_wpnonce'] ) || ! wp_verify_nonce( $_REQUEST['_wpnonce'], 'wpgmp-nonce' ) ) {
				die( esc_html__( 'You are not allowed to save changes!', 'wp-google-map-plugin' ) );
			}

			$this->verify( $_POST );

			if ( ! empty( $_POST['extensions_fields']['cat_order'] ) && ! is_numeric( $_POST['extensions_fields']['cat_order'] ) ) {
				$this->errors[] = esc_html__( 'Please enter only a numeric value for marker category order number.', 'wp-google-map-plugin' );
			}

			$this->errors = apply_filters( 'wpgmp_category_validation', $this->errors, $_POST );
			if ( ! empty( $this->errors ) ) {
				$this->throw_errors();
			}

			$result = $this->write_to_db();
			$response = [];

			if ( false === $result ) {
				$response['error'] = esc_html__( 'Something went wrong. Please try again.', 'wp-google-map-plugin' );
			} else {
				$response['success'] = ( $entityID > 0 )
					? esc_html__( 'Marker category was updated successfully.', 'wp-google-map-plugin' )
					: esc_html__( 'Marker category was added successfully.', 'wp-google-map-plugin' );
				$response['last_db_id'] = $result;
			}
			return $response;
		}

		/**
		 * Delete marker category by ID.
		 * @return bool|int
		 */
		function delete() {
			if ( isset( $_GET['group_map_id'] ) ) {
				$id = intval( wp_unslash( $_GET['group_map_id'] ) );
				$connection = FlipperCode_Database::connect();

				do_action( 'wpgmp_before_category_delete', $id );
				$this->query = $connection->prepare( "DELETE FROM {$this->table} WHERE {$this->unique} = %d", $id );
				$result = FlipperCode_Database::non_query( $this->query, $connection );
				do_action( 'wpgmp_after_category_delete', $id, $result );

				return $result;
			}
			return false;
		}
	}
}
