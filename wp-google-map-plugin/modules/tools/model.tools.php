<?php
/**
 * Class: WPGMP_Model_Tools
 *
 * @author Flipper Code <hello@flippercode.com>
 * @version 3.0.0
 * @package Maps
 */

if ( ! class_exists( 'WPGMP_Model_Tools' ) ) {

	/**
	 * Backup model for Backup operation.
	 *
	 * @package Maps
	 * @author Flipper Code <hello@flippercode.com>
	 */
	class WPGMP_Model_Tools extends FlipperCode_Model_Base {

		/**
		 * Intialize Backup object.
		 */
		function __construct() {

		}
		/**
		 * Admin menu for Backup Operation
		 *
		 * @return array Admin menu navigation(s).
		 */
		function navigation() {
			return array(
				'wpgmp_manage_tools' => esc_html__( 'Plugin Tools', 'wpgmp-google-map' ),
			);
		}
		

	}
}
