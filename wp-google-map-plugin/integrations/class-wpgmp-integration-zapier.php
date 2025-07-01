<?php

if ( ! defined( 'ABSPATH' ) ) exit;

if ( ! class_exists( 'WPGMP_Integration_Zapier' ) ) {

class WPGMP_Integration_Zapier {

	public function __construct() {
		add_filter( 'wpgmp_integrations_list', [ $this, 'register_extension' ] );
		add_filter( 'wpgmp_integration_nav_zapier', [ $this, 'register_nav_tabs' ] );
		add_action( 'wpgmp_render_integration_zapier_settings', [ $this, 'render_settings_tab' ] );
		add_action( 'wpgmp_render_integration_zapier_help', [ $this, 'render_help_tab' ] );
	}
	
	public function register_extension( $integrations ) {
		$integrations['zapier'] = [
			'title' => __( 'Zapier', 'wp-google-map-plugin' ),
			'slug'  => 'zapier',
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
		echo '<h3>' . esc_html__( 'Zapier Integration Settings', 'wp-google-map-plugin' ) . '</h3>';
		echo '<p>' . esc_html__( 'Enter your Zapier webhook URL to receive marker click data.', 'wp-google-map-plugin' ) . '</p>';

		$form_fields = [
			[
				'type'  => 'text',
				'name'  => 'zapier_webhook_url',
				'label' => __( 'Zapier Webhook URL', 'wp-google-map-plugin' ),
				'desc'  => __( 'Paste your Zapier "Catch Hook" URL here.', 'wp-google-map-plugin' ),
			],
			[
				'type'  => 'checkbox',
				'name'  => 'zapier_enable_marker_click',
				'label' => __( 'Enable Marker Click Tracking', 'wp-google-map-plugin' ),
				'desc'  => __( 'Send marker_click event data to Zapier.', 'wp-google-map-plugin' ),
			],
		];

		$form = new WPGMP_Integration_Form( 'zapier', $form_fields );
		$form->render_form();

		echo '</div>';
	}

	public function render_help_tab() {
		echo '<div class="fc-box">';
		echo '<h3>' . esc_html__( 'Zapier Help & Instructions', 'wp-google-map-plugin' ) . '</h3>';
		echo '<p>' . esc_html__( '1. In Zapier, create a new Zap using "Webhooks by Zapier" → "Catch Hook"', 'wp-google-map-plugin' ) . '</p>';
		echo '<p>' . esc_html__( '2. Copy the webhook URL provided by Zapier and paste it into the Webhook URL field here.', 'wp-google-map-plugin' ) . '</p>';
		echo '<p>' . esc_html__( '3. Enable the marker click option and click a marker to test.', 'wp-google-map-plugin' ) . '</p>';
		echo '<p><strong>Fields sent:</strong> map_id, marker_id, marker_title, provider, clicked_at</p>';
		echo '</div>';
	}
}

}
new WPGMP_Integration_Zapier();

