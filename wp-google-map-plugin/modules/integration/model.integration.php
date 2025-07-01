<?php
/**
 * Class: WPGMP_Model_Integration
 * Handles plugin settings save and navigation registration.
 *
 * @author Flipper Code <hello@flippercode.com>
 * @version 3.0.0
 * @package Maps
 */

if ( ! class_exists( 'WPGMP_Model_Integration' ) ) {

	class WPGMP_Model_Integration extends FlipperCode_Model_Base {
		function __construct() {}

		/**
		 * Navigation entries for settings page.
		 *
		 * @return array
		 */
		function navigation() {
			return apply_filters('wpgmp_integration_navigation', [
				'wpgmp_form_integration' => esc_html__( 'Integrations', 'wp-google-map-plugin' ),
			]);
		}

		/**
		 * Save plugin settings.
		 *
		 * @return array
		 */
		
		function save() {
			global $_POST;

			if (!isset($_REQUEST['_wpnonce']) || empty($_REQUEST['_wpnonce']) || !wp_verify_nonce($_REQUEST['_wpnonce'], 'wpgmp-nonce')) {
				die( esc_html__( 'You are not allowed to save changes!', 'wp-google-map-plugin' ) );
			}

			$this->verify($_POST);

			if (!empty($this->errors)) {
				$this->throw_errors();
			}

			$extension_key = sanitize_key( $_POST['extension_key'] );

			// Sanitize submitted data
			$data = [];
			foreach ( $_POST as $key => $val ) {
				if ( in_array( $key, [ 'wpgmp_nonce', '_wp_http_referer', 'extension_key', 'submit' ] ) ) continue;
				$data[ $key ] = sanitize_text_field( $val );
			}

			// Check if individual option exists for this extension
			$existing = get_option( $extension_key, '' );

			if ( ! empty( $existing ) ) {
				// Save to individual option
				update_option( $extension_key, serialize( $data ) );
			} else {
				// Save to shared integrations option
				$all_data = maybe_unserialize( get_option( 'wpgmp_integrations_data', '' ) );

				if ( ! is_array( $all_data ) ) {
					$all_data = [];
				}

				$all_data[ $extension_key ] = $data;

				update_option( 'wpgmp_integrations_data', serialize( $all_data ) );
			}


			return ['success' => esc_html__('Plugin settings were saved successfully.', 'wp-google-map-plugin')];
		}
	}
}
