<?php
/**
 * Class: WPGMP_Model_Drawing
 *
 * @author Flipper Code <hello@flippercode.com>
 * @version 3.0.0
 * @package Maps
 */

if ( ! class_exists( 'WPGMP_Model_Drawing' ) ) {

	/**
	 * Drawing model for Shapes operation.
	 *
	 * @package Maps
	 * @author Flipper Code <hello@flippercode.com>
	 */
	class WPGMP_Model_Drawing extends FlipperCode_Model_Base {
		/**
		 * Intialize drawing object.
		 */
		function __construct() {
		}
		/**
		 * Admin menu for Drawing Operation
		 *
		 * @return array Admin meny navigation(s).
		 */
		function navigation() {
			return array(
				'wpgmp_manage_drawing' => esc_html__( 'Map Drawing', 'wp-google-map-plugin' ),
			);
		}

		function save() {
			global  $_POST;

			if ( isset( $_POST['map_id'] ) ) {
				$map_id                                       = intval( wp_unslash( $_POST['map_id'] ) );
				$data['polylines'][0]                         = $_POST['shapes_values'];
				$infowindow['map_polyline_setting']['shapes'] = serialize( $data );
				$in_loc_data                                  = array(
					'map_polyline_setting' => $infowindow['map_polyline_setting']['shapes'],
				);
				$where['map_id']                              = $map_id;

				FlipperCode_Database::insert_or_update( TBL_MAP, $in_loc_data, $where );
			}

			unset( $_POST['operation'] );
		}
	}
}
