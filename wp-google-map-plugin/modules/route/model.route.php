<?php
/**
 * Class: WPGMP_Model_Route
 *
 * Handles CRUD operations for the Route entity.
 *
 * @package Maps
 * @version 3.0.0
 */

if ( ! class_exists( 'WPGMP_Model_Route' ) ) {

	class WPGMP_Model_Route extends FlipperCode_Model_Base {

		protected $validations;

		public function __construct() {
			$this->table  = TBL_ROUTES;
			$this->unique = 'route_id';
			$this->validations = array(
				'route_title' => array(
					'req'     => esc_html__( 'Please enter route title.', 'wp-google-map-plugin' ),
					'max=255' => esc_html__( 'Route title cannot contain more than 255 characters.', 'wp-google-map-plugin' ),
				),
			);
		}

		public function navigation() {
			return apply_filters('wpgmp_route_navigation', array(
				'wpgmp_form_route'   => esc_html__( 'Add Route', 'wp-google-map-plugin' )			));
		}

		public function install() {
			global $wpdb;
			$charset = $wpdb->get_charset_collate();
			return "CREATE TABLE {$wpdb->prefix}map_routes (
				route_id int(11) NOT NULL AUTO_INCREMENT,
				route_title varchar(255),
				route_stroke_color varchar(255),
				route_stroke_opacity varchar(255),
				route_stroke_weight int(11),
				route_travel_mode varchar(255),
				route_unit_system varchar(255),
				route_marker_draggable varchar(255),
				route_optimize_waypoints varchar(255),
				route_start_location int(11),
				route_end_location int(11),
				route_way_points text,
				extensions_fields text,
				PRIMARY KEY  (route_id)
			) $charset;";
		}

		public function fetch( $where = array() ) {
			$routes = $this->get( $this->table, $where );

			foreach ( (array) $routes as $route ) {
				$route->route_way_points  = maybe_unserialize( $route->route_way_points );
				$route->extensions_fields = maybe_unserialize( $route->extensions_fields );
			}

			return apply_filters( 'wpgmp_route_results', $routes, $where );
		}

		public function save() {
			if ( ! isset( $_REQUEST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( $_REQUEST['_wpnonce'] ), 'wpgmp-nonce' ) ) {
				wp_die( esc_html__( 'You are not allowed to save changes!', 'wp-google-map-plugin' ) );
			}

			$this->verify( $_POST );
			$this->errors = apply_filters( 'wpgmp_route_validation', $this->errors, $_POST );

			$waypoints = ! empty( $_POST['route_way_points'] ) ? explode( ',', sanitize_text_field( $_POST['route_way_points'] ) ) : array();
			if ( count( $waypoints ) > 8 ) {
				$this->errors[] = esc_html__( 'Please do not select more than 8 locations.', 'wp-google-map-plugin' );
			}

			if ( ! empty( $this->errors ) ) {
				$this->throw_errors();
			}

			$data = array(
				'route_title'              => sanitize_text_field( $_POST['route_title'] ?? '' ),
				'route_stroke_color'       => sanitize_text_field( $_POST['route_stroke_color'] ?? '' ),
				'route_stroke_opacity'     => sanitize_text_field( $_POST['route_stroke_opacity'] ?? '' ),
				'route_stroke_weight'      => intval( $_POST['route_stroke_weight'] ?? 0 ),
				'route_travel_mode'        => sanitize_text_field( $_POST['route_travel_mode'] ?? '' ),
				'route_unit_system'        => sanitize_text_field( $_POST['route_unit_system'] ?? '' ),
				'route_marker_draggable'   => sanitize_text_field( $_POST['route_marker_draggable'] ?? '' ),
				'route_optimize_waypoints' => sanitize_text_field( $_POST['route_optimize_waypoints'] ?? '' ),
				'route_start_location'     => intval( $_POST['route_start_location'] ?? 0 ),
				'route_end_location'       => intval( $_POST['route_end_location'] ?? 0 ),
				'route_way_points'         => serialize( $waypoints ),
				'extensions_fields'        => serialize( wp_unslash( $_POST['extensions_fields'] ?? array() ) ),
			);

			$entityID = intval( $_POST['entityID'] ?? 0 );
			$where    = $entityID > 0 ? array( $this->unique => $entityID ) : '';

			$data   = apply_filters( 'wpgmp_route_save', $data, $where );
			$result = FlipperCode_Database::insert_or_update( $this->table, $data, $where );

			$response = array();
			if ( false === $result ) {
				$response['error'] = esc_html__( 'Something went wrong. Please try again.', 'wp-google-map-plugin' );
			} elseif ( $entityID > 0 ) {
				$response['success'] = esc_html__( 'Route was updated successfully.', 'wp-google-map-plugin' );
			} else {
				$response['success'] = esc_html__( 'Route was added successfully.', 'wp-google-map-plugin' );
			}
			$response['last_db_id'] = $result;

			do_action( 'wpgmp_after_route_save', $response, $data, $entityID );

			return $response;
		}

		public function delete() {
			if ( isset( $_GET['route_id'] ) ) {
				$id         = intval( wp_unslash( $_GET['route_id'] ) );
				$connection = FlipperCode_Database::connect();
				$query      = $connection->prepare( "DELETE FROM $this->table WHERE $this->unique = %d", $id );
				$result     = FlipperCode_Database::non_query( $query, $connection );

				do_action( 'wpgmp_after_route_deleted', $id, $result );
				return $result;
			}
			return false;
		}
	}
}