<?php

if ( ! defined( 'ABSPATH' ) ) exit;

if ( ! class_exists( 'WPGMP_Integration_MetaPixel' ) ) {

	class WPGMP_Integration_MetaPixel {

		public function __construct() {
			add_filter( 'wpgmp_integrations_list', [ $this, 'register_extension' ] );
			add_filter( 'wpgmp_integration_nav_metapixel', [ $this, 'register_nav_tabs' ] );
			add_action( 'wpgmp_render_integration_metapixel_settings', [ $this, 'render_settings_tab' ] );
			add_action( 'wpgmp_render_integration_metapixel_help', [ $this, 'render_help_tab' ] );
		}

		public function register_extension( $integrations ) {
			$integrations['metapixel'] = [
				'title' => __( 'Meta Pixel', 'wp-google-map-plugin' ),
				'slug'  => 'metapixel',
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
			echo '<h3>' . esc_html__( 'Meta Pixel Settings', 'wp-google-map-plugin' ) . '</h3>';
			echo '<p>' . esc_html__( 'Enable marker click tracking via Facebook Pixel.', 'wp-google-map-plugin' ) . '</p>';

			$form_fields = [
				[
					'type'  => 'checkbox',
					'name'  => 'metapixel_enable_marker_click',
					'label' => __( 'Enable Marker Click Tracking', 'wp-google-map-plugin' ),
					'desc'  => __( 'Trigger Facebook Pixel event when a marker is clicked.', 'wp-google-map-plugin' ),
				],
			];

			$form = new WPGMP_Integration_Form( 'metapixel', $form_fields );
			$form->render_form();

			echo '</div>';
		}

		public function render_help_tab() {
			echo '<div class="fc-box">';
			echo '<h3>' . esc_html__( 'Help & Instructions', 'wp-google-map-plugin' ) . '</h3>';
			echo '<p>' . esc_html__( 'This integration sends marker click events to Facebook Pixel. Make sure your site has the Meta Pixel base code installed.', 'wp-google-map-plugin' ) . '</p>';
			echo '<p><strong>Pixel Event Name:</strong> <code>MarkerClick</code></p>';
			echo '</div>';
		}

	}
}

new WPGMP_Integration_MetaPixel();
