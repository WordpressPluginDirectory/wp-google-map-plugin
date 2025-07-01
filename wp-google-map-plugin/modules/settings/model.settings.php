<?php
/**
 * Class: WPGMP_Model_Settings
 * Handles plugin settings save and navigation registration.
 *
 * @author Flipper Code <hello@flippercode.com>
 * @version 3.0.0
 * @package Maps
 */

if ( ! class_exists( 'WPGMP_Model_Settings' ) ) {

	class WPGMP_Model_Settings extends FlipperCode_Model_Base {
		function __construct() {}

		/**
		 * Navigation entries for settings page.
		 *
		 * @return array
		 */
		function navigation() {
			return apply_filters('wpgmp_settings_navigation', [
				'wpgmp_manage_settings' => esc_html__( 'Plugin Settings', 'wp-google-map-plugin' ),
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

			$wpgmp_saved_settings = maybe_unserialize(get_option('wpgmp_settings'));
			$extra_fields = [];

			if (!empty($_POST['location_extrafields'])) {
				foreach ($_POST['location_extrafields'] as $index => $label) {
					if ($label !== '') {
						$extra_fields[$index] = sanitize_text_field(wp_unslash($label));
					}
				}
			}

			$meta_hide = [];
			if (!empty($_POST['wpgmp_allow_meta']) && is_array($_POST['wpgmp_allow_meta'])) {
				foreach ($_POST['wpgmp_allow_meta'] as $index => $label) {
					if ($label !== '') {
						$meta_hide[$index] = sanitize_text_field(wp_unslash($label));
					}
				}
			}

			$settings = [
				'wpgmp_map_source'           => sanitize_text_field(wp_unslash($_POST['wpgmp_map_source'] ?? '')),
				'wpgmp_tiles_source'         => sanitize_text_field(wp_unslash($_POST['wpgmp_tiles_source'] ?? '')),
				'wpgmp_router_source'        => sanitize_text_field(wp_unslash($_POST['wpgmp_router_source'] ?? '')),
				'wpgmp_language'             => sanitize_text_field(wp_unslash($_POST['wpgmp_language'] ?? '')),
				'wpgmp_scripts_place'        => sanitize_text_field(wp_unslash($_POST['wpgmp_scripts_place'] ?? '')),
				'wpgmp_version'              => sanitize_text_field(wp_unslash($_POST['wpgmp_version'] ?? '')),
				'wpgmp_scripts_minify'       => sanitize_text_field(wp_unslash($_POST['wpgmp_scripts_minify'] ?? 'yes')),
				'wpgmp_allow_meta'           => serialize($meta_hide),
				'wpgmp_metabox_map'          => sanitize_text_field(wp_unslash($_POST['wpgmp_metabox_map'] ?? '')),
				'wpgmp_auto_fix'             => sanitize_text_field(wp_unslash($_POST['wpgmp_auto_fix'] ?? '')),
				'wpgmp_hide_notification'    => sanitize_text_field(wp_unslash($_POST['wpgmp_hide_notification'] ?? '')),
				'wpgmp_advanced_marker'    => sanitize_text_field(wp_unslash($_POST['wpgmp_advanced_marker'] ?? 'false')),
				'wpgmp_set_timeout'       => sanitize_text_field(wp_unslash($_POST['wpgmp_set_timeout'] ?? '100')),
				'wpgmp_debug_mode'           => sanitize_text_field(wp_unslash($_POST['wpgmp_debug_mode'] ?? '')),
				'wpgmp_gdpr'                 => sanitize_text_field(wp_unslash($_POST['wpgmp_gdpr'] ?? '')),
				'wpgmp_gdpr_msg'             => wp_unslash($_POST['wpgmp_gdpr_msg'] ?? ''),
				'wpgmp_gdpr_show_placeholder'=> sanitize_text_field(wp_unslash($_POST['wpgmp_gdpr_show_placeholder'] ?? '')),
				'wpgmp_country_specific'     => sanitize_text_field(wp_unslash($_POST['wpgmp_country_specific'] ?? '')),
				'wpgmp_countries'            => wp_unslash($_POST['wpgmp_countries'] ?? []),
			];

			foreach (['wpgmp_api_key','wpgmp_mapbox_key'] as $key) {
				if (!empty($_POST[$key])) {
					$settings[$key] = sanitize_text_field(wp_unslash($_POST[$key]));
				}
			}

			if (!empty($extra_fields)) {
				$settings['wpgmp_extrafield_val'] = $wpgmp_saved_settings['wpgmp_extrafield_val'] ?? [];
				foreach ($extra_fields as $val) {
					$slug = sanitize_title($val);
					$settings['wpgmp_extrafield_val'][$slug] = $settings['wpgmp_extrafield_val'][$slug] ?? [];
				}
			}

			if (!empty($wpgmp_saved_settings['wpgmp_enabled']) && $wpgmp_saved_settings['wpgmp_enabled'] === 'yes') {
				$settings['wpgmp_enabled'] = 'yes';
				$settings['wpgmp_debug_info'] = $wpgmp_saved_settings['wpgmp_debug_info'] ?? '';
			}

			$settings = apply_filters('wpgmp_plugin_settings', $settings);
			$extra_fields = apply_filters('wpgmp_plugin_extra_fields', $extra_fields);

			update_option('wpgmp_settings', $settings);
			update_option('wpgmp_location_extrafields', serialize($extra_fields));

			return ['success' => esc_html__('Plugin settings were saved successfully.', 'wp-google-map-plugin')];
		}
	}
}
