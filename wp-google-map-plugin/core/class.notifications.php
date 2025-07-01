<?php

if ( ! class_exists( 'WePlugins_Notification' ) ) {

class WePlugins_Notification {

	/**
	 * Initialize hooks and schedule the cron
	 */
	public static function init() {
		add_action('wpmapspro_check_notification', [__CLASS__, 'fetch_notification_from_server']);
	}

	public static function schedule_cron() {
		if (!wp_next_scheduled('wpmapspro_check_notification')) {
			wp_schedule_event(time(), 'daily', 'wpmapspro_check_notification');
		}
	}

	public static function deactivate_cron() {
		wp_clear_scheduled_hook('wpmapspro_check_notification');
	}

	/**
	 * Returns notification HTML if available
	 *
	 * @return string
	 */
	public static function weplugins_display_notification() {

		$wpgmp_settings = 	maybe_unserialize( get_option( 'wpgmp_settings' ) );

		if( isset( $wpgmp_settings['wpgmp_hide_notification']) &&  $wpgmp_settings['wpgmp_hide_notification'] == 'true') {
			return;
		}
		//WePlugins_Notification::fetch_notification_from_server();
		$notifications = get_option('weplugins_notification', []);
	
		// If no notifications, show fallback
		if (empty($notifications)) {
			return '
			<div class="fc-notification-strip">
				<div class="fc-container">
					<div class="fc-avatar">
						<i class="wep-icon-plug wep-icon-2x"></i>
					</div>
					<div>' . sprintf(
						esc_html__(
							'This plugin now supports OpenStreetMap. Visit the %s to try it out!',
							'wp-google-map-plugin'
						),
						'<a href="' . esc_url(admin_url('admin.php?page=wpgmp_manage_settings')) . '">' . esc_html__('Settings page', 'wp-google-map-plugin') . '</a>'
					) . '</div>
				</div>
			</div>';
		}
		
		// Sort notifications by date DESC (latest first)
		usort($notifications, function($a, $b) {
			return strtotime($b['date']) <=> strtotime($a['date']);
		});
	
		$latest = $notifications[0];
	
		// Sanitize fields for output
		$title = isset($latest['title']) ? esc_html($latest['title']) : '';
		$desc = isset($latest['desc']) ? wp_kses_post($latest['desc']) : '';
		$icon_class = isset($latest['icon_class']) ? esc_attr($latest['icon_class']) : 'wep-icon-plug';
	
		return '
		<div class="fc-notification-strip">
			<div class="fc-container">
				<div class="fc-avatar">
					<i class="' . $icon_class . ' wep-icon-2x"></i>
				</div>
				<div>
					<strong>' . $title . '</strong><br>' . $desc . '
				</div>
			</div>
		</div>';
	}
	

	/**
	 * Cron callback to fetch latest notification from the remote server
	 */
	public static function fetch_notification_from_server() {
		$response = wp_remote_get('https://weplugins.com/wp-json/weplugins/v1/get-wpgmp-notification');
		if (is_wp_error($response)) return;
	
		$body = wp_remote_retrieve_body($response);
		$data = json_decode($body, true);
	
		if (empty($data['message']) || !is_array($data['message'])) return;
	
		$existing = get_option('weplugins_notification', []);
	
		// Flatten existing by ID if needed
		$existing_by_hash = [];
		foreach ($existing as $item) {
			$hash = md5($item['title'] . $item['desc']);
			$existing_by_hash[$hash] = $item;
		}
	
		foreach ($data['message'] as $entry) {
			$title = sanitize_text_field($entry['wp_maps_pro_notification_title'] ?? '');
			$desc = sanitize_textarea_field($entry['wp_maps_pro_notification_message'] ?? '');
	
			if (!$title && !$desc) continue;
	
			$hash = md5($title . $desc);
			if (!isset($existing_by_hash[$hash])) {
				$existing_by_hash[$hash] = [
					'id' => uniqid('notif_'),
					'title' => $title,
					'desc' => $desc,
					'date' => current_time('mysql'),
					'icon_class' => 'wep-icon-circle-info' // default
				];
			}
		}
	
		update_option('weplugins_notification', array_values($existing_by_hash));
	}	
	
}

}