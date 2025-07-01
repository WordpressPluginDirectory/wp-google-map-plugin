<?php

if ( ! defined( 'ABSPATH' ) ) exit;

if ( ! class_exists( 'WPGMP_Integration_Clarity' ) ) {

	class WPGMP_Integration_Clarity {

		public function __construct() {
			add_filter( 'wpgmp_integrations_list', [ $this, 'register_extension' ] );
			add_filter( 'wpgmp_integration_nav_clarity', [ $this, 'register_nav_tabs' ] );
			add_action( 'wpgmp_render_integration_clarity_settings', [ $this, 'render_settings_tab' ] );
			add_action( 'wpgmp_render_integration_clarity_help', [ $this, 'render_help_tab' ] );
		}

		public function register_extension( $integrations ) {
			$integrations['clarity'] = [
				'title' => __( 'Microsoft Clarity', 'wp-google-map-plugin' ),
				'slug'  => 'clarity',
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
			echo '<h3>' . esc_html__( 'Microsoft Clarity Settings', 'wp-google-map-plugin' ) . '</h3>';
			echo '<p>' . esc_html__( 'Enable marker click tracking using Clarity custom events.', 'wp-google-map-plugin' ) . '</p>';

			$form_fields = [
				[
					'type'  => 'checkbox',
					'name'  => 'clarity_enable_marker_click',
					'label' => __( 'Enable Marker Click Tracking', 'wp-google-map-plugin' ),
					'desc'  => __( 'Send a Clarity custom event on marker click.', 'wp-google-map-plugin' ),
				],
			];

			$form = new WPGMP_Integration_Form( 'clarity', $form_fields );
			$form->render_form();

			echo '</div>';
		}

		public function render_help_tab() {
			echo '<div class="fc-box">';
			echo '<h3>' . esc_html__( 'Help & Instructions', 'wp-google-map-plugin' ) . '</h3>';
			echo '<p>' . esc_html__( 'This integration sends "MarkerClick" events to Microsoft Clarity. You must first install the Clarity tracking script in your site header.', 'wp-google-map-plugin' ) . '</p>';
			echo '<p><strong>Clarity Event Name:</strong> <code>MarkerClick</code></p>';
			echo '</div>';
		}
	}
}

new WPGMP_Integration_Clarity();
