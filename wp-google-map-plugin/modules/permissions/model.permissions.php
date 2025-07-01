<?php
/**
 * Class: WPGMP_Model_Permissions
 *
 * @author Flipper Code <hello@flippercode.com>
 * @version 3.0.0
 * @package Maps
 */

if ( ! class_exists( 'WPGMP_Model_Permissions' ) ) {

	/**
	 * Permission model for Plugin Access Permission.
	 *
	 * @package Maps
	 * @author Flipper Code <hello@flippercode.com>
	 */
	class WPGMP_Model_Permissions extends FlipperCode_Model_Base {
		/**
		 * Intialize Permission object.
		 */
		function __construct() {
		}
		/**
		 * Admin menu for Permission Operation
		 *
		 * @return array Admin menu navigation(s).
		 */
		function navigation() {
			return array(
				'wpgmp_manage_permissions' => esc_html__( 'Manage Permissions', 'wp-google-map-plugin' ),
			);
		}
		/**
		 * Save Permissions
		 */
		function save() {
			global $_POST;
			if ( isset( $_REQUEST['_wpnonce'] ) ) {
				$nonce = sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) ); }

			if ( isset( $nonce ) and ! wp_verify_nonce( $nonce, 'wpgmp-nonce' ) ) {

				die( 'Cheating...' );

			}
			global $wp_roles;
			$wpgmp_roles = $wp_roles->get_names();
			unset( $wpgmp_roles['administrator'] );
			$wpgmp_permissions = array(
				'wpgmp_admin_overview'   => esc_html__('Map Overview','wp-google-map-plugin'),
				'wpgmp_form_location'    => esc_html__('Add Locations','wp-google-map-plugin'),
				'wpgmp_manage_location'  => esc_html__('Manage Locations','wp-google-map-plugin'),
				'wpgmp_import_location'  => esc_html__('Import Locations','wp-google-map-plugin'),
				'wpgmp_form_map'         => esc_html__('Create Map','wp-google-map-plugin'),
				'wpgmp_manage_map'       => esc_html__('Manage Map','wp-google-map-plugin'),
				'wpgmp_manage_drawing'   => esc_html__('Drawing','wp-google-map-plugin'),
				'wpgmp_form_group_map'   => esc_html__('Add Marker Category','wp-google-map-plugin'),
				'wpgmp_manage_group_map' => esc_html__('Manage Marker Category','wp-google-map-plugin'),
				'wpgmp_form_route'       => esc_html__('Add Routes','wp-google-map-plugin'),
				'wpgmp_manage_route'     => esc_html__('Manage Routes','wp-google-map-plugin'),
				'wpgmp_settings'         => esc_html__('Settings','wp-google-map-plugin'),
			);
			$this->verify( $_POST );

			if ( is_array( $this->errors ) and ! empty( $this->errors ) ) {
				$this->throw_errors();
			}
			if ( isset( $_POST['wpgmp_save_permission'] ) ) {

				if ( isset( $_POST['wpgmp_map_permissions'] ) ) {
					$wpgmp_map_permissions = wp_unslash( $_POST['wpgmp_map_permissions'] );
				} else {
					$wpgmp_map_permissions = array();
				}

				if ( ! empty( $wpgmp_roles ) ) {
					foreach ( $wpgmp_roles as $wpgmp_role_key => $wpgmp_role_value ) {
						if ( $wpgmp_role_key == 'administrator' && is_admin() && current_user_can( 'manage_options' ) ) {
							continue; }

						$role = get_role( $wpgmp_role_key );

						if ( ! empty( $wpgmp_permissions ) ) {
							foreach ( $wpgmp_permissions as $wpgmp_mkey => $wpgmp_mvalue ) {
								if ( isset( $wpgmp_map_permissions[ $wpgmp_role_key ][ $wpgmp_mkey ] ) ) {
									$role->add_cap( $wpgmp_mkey );
								} else {
									$role->remove_cap( $wpgmp_mkey );
								}
							}
						}
					}
				}
			}
			$response['success'] = esc_html__( 'Permissions were saved successfully.', 'wp-google-map-plugin' );
			return $response;
		}

	}
}
