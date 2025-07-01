<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WPGMP_Integration_GA4' ) ) {

	class WPGMP_Integration_GA4 {

		public function __construct() {
			add_filter( 'wpgmp_integrations_list', [ $this, 'register_extension' ] );
			add_filter( 'wpgmp_integration_nav_ga4', [ $this, 'register_nav_tabs' ] );
			add_action( 'wpgmp_render_integration_ga4_settings', [ $this, 'render_settings_tab' ] );
			add_action( 'wpgmp_render_integration_ga4_help', [ $this, 'render_help_tab' ] );
		}

		public function register_extension( $integrations ) {
			$integrations['ga4'] = [
				'title' => __( 'Google Analytics 4', 'wp-google-map-plugin' ),
				'slug'  => 'ga4',
			];
			return $integrations;
		}

		public function register_nav_tabs( $tabs ) {
			return [
				'settings' => __( 'Settings', 'wp-google-map-plugin' ),
				'help'     => __( 'Help', 'wp-google-map-plugin' ),
			];
		}

		public function render_settings_tab() {
			echo '<div class="fc-box">';
			echo '<h3>' . esc_html__( 'GA4 Integration Settings', 'wp-google-map-plugin' ) . '</h3>';
			echo '<p>' . esc_html__( 'Enable or disable Google Analytics 4 event tracking for maps.', 'wp-google-map-plugin' ) . '</p>';
		
			$form_fields = [
				[
					'type'  => 'checkbox',
					'name'  => 'ga4_enable_marker_click',
					'label' => __( 'Enable Marker Click Tracking', 'wp-google-map-plugin' ),
					'desc'  => __( 'Track marker_click events in Google Analytics when users click a marker.', 'wp-google-map-plugin' ),
				],
			];
		
			$form = new WPGMP_Integration_Form( 'ga4', $form_fields );
			$form->render_form();
		
			echo '</div>';
		}

		public function render_help_tab() {
			echo '<div class="fc-box">';
			echo '<h3>' . esc_html__( 'Help & Instructions', 'wp-google-map-plugin' ) . '</h3>';
			echo '<p>' . esc_html__( 'This integration sends events like marker clicks, direction generation, and filter usage to Google Analytics 4.', 'wp-google-map-plugin' ) . '</p>';
			echo '<p>' . esc_html__( 'Tracked Events: marker_click, directions_generated, map_filters_applied.', 'wp-google-map-plugin' ) . '</p>';
			echo '</div>';
		}
		
	}
}

new WPGMP_Integration_GA4();
