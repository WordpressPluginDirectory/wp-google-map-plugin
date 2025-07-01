<?php
/**
 * Controller class
 *
 * @author Flipper Code<hello@flippercode.com>
 * @version 3.0.0
 * @package Posts
 */

if ( ! class_exists( 'WPGMP_Model' ) ) {

	/**
	 * Controller class to display views.
	 *
	 * @author: Flipper Code<hello@flippercode.com>
	 * @version: 3.0.0
	 * @package: Maps
	 */

	class WPGMP_Model extends Flippercode_Factory_Model {


		function __construct() {

			$page = isset($_GET['page']) && !empty($_GET['page']) ? $_GET['page'] : '';
			$module_path = WPGMP_MODEL;
			$module_path = apply_filters('fc_modal_load_module', $module_path, $page);
			parent::__construct( $module_path, 'WPGMP_Model_' );

		}

	}

}
