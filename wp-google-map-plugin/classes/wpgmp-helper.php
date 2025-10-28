<?php

class WPGMP_Helper{

	public static function wpgmp_get_all_post_types(){

		$screens        = array( 'post', 'page' );
		$args = array( 'public'   => true,'_builtin' => false );
		$custom_post_types = get_post_types( $args, 'names' );
		$screens = array_merge( $screens, $custom_post_types );
		return $screens;

	}

	public static function wpgmp_register_map_assets( $context = 'frontend', $assets = [] ) {
		$wpgmp_settings = get_option( 'wpgmp_settings', true );
		$minify         = isset( $wpgmp_settings['wpgmp_scripts_minify'] ) && $wpgmp_settings['wpgmp_scripts_minify'] === 'yes';
		$suffix         = $minify ? '.min' : '';
		$in_footer      = true;
	
		// === GDPR Cookie Acceptance
		if ( isset( $wpgmp_settings['wpgmp_gdpr'] ) && $wpgmp_settings['wpgmp_gdpr'] === true ) {
			if ( apply_filters( 'wpgmp_accept_cookies', false ) === false ) return;
		}
	
		// === Auto Fix
		if ( isset( $wpgmp_settings['wpgmp_auto_fix'] ) && $wpgmp_settings['wpgmp_auto_fix'] === 'true' ) {
			wp_enqueue_script( 'jquery' );
		}
	
		// === Language
		$language = $wpgmp_settings['wpgmp_language'] ?? 'en';
		$language = apply_filters( 'wpgmp_map_lang', $language );
	
		// === Placement
		if ( isset( $wpgmp_settings['wpgmp_scripts_place'] ) ) {
			$in_footer = ( $wpgmp_settings['wpgmp_scripts_place'] !== 'header' );
		}
	
		// === Google API URL

		if( WPGMP_Helper::wpgmp_get_map_provider() == 'leaflet') {

			$google_api = WPGMP_JS . 'wpgmp_leaflet_loader.js?callback=wpgmpInitMap&language=' . $language;

		} else {

		
			if ( isset( $wpgmp_settings['wpgmp_auto_fix'] ) && $wpgmp_settings['wpgmp_auto_fix'] === 'true' ) {
				$google_api = 'https://maps.google.com/maps/api/js?libraries=marker,geometry,places,drawing&callback=wpgmpInitMap&language=' . $language;
			} else {
				$google_api = 'https://maps.google.com/maps/api/js?loading=async&libraries=marker,geometry,places,drawing&callback=wpgmpInitMap&language=' . $language;
			}
		
			if ( ! empty( $wpgmp_settings['wpgmp_api_key'] ) ) {
			$google_api = str_replace( '?', '?key=' . $wpgmp_settings['wpgmp_api_key'] . '&', $google_api );
		}

		}

		
	
		// === Script Definitions
		$scripts = [
			
			'map' => [
				'handle' => 'wpgmp-google-map-main',
				'src'    => WPGMP_JS . "maps$suffix.js",
				'deps'   => [ 'jquery', 'jquery-masonry', 'imagesloaded' ],
			],
			'google_api' => [
				'handle' => 'wpgmp-google-api',
				'src'    => $google_api,
				'deps'   => ['wpgmp-google-map-main'],
			],
			'frontend' => [
				'handle' => 'wpgmp-frontend',
				'src'    => WPGMP_JS . "wpgmp_frontend$suffix.js",
				'deps'   => ['wpgmp-google-api'],
			],
			'backend' => [
				'handle' => 'wpgmp-backend',
				'src'    => WPGMP_JS . "wpgmp_backend$suffix.js",
				'deps'   => ['wpgmp-google-api'],
			],
		];
	
		// === Enqueue Scripts Conditionally
		foreach ( $scripts as $key => $script ) {
			if ( empty( $assets ) || in_array( $key, $assets ) ) {
				if ( isset( $wpgmp_settings['wpgmp_auto_fix'] ) && $wpgmp_settings['wpgmp_auto_fix'] !== 'true' && $context === 'frontend' ) {

					wp_register_script( $script['handle'], $script['src'], $script['deps'], WPGMP_VERSION, $in_footer );
					
				}else{
					wp_enqueue_script( $script['handle'], $script['src'], $script['deps'], WPGMP_VERSION, $in_footer );
				}
			}
		}
	
		// === Styles
		if ( $context === 'frontend' ) {
			$styles['wpgmp-frontend'] = WPGMP_CSS . "wpgmp_all_frontend$suffix.css";
			wp_enqueue_style( 'masonry' );
		} else {
			$styles['wpgmp-backend']  = WPGMP_CSS . "wpgmp_all_backend$suffix.css";
			
		}
	
		$styles = apply_filters( "wpgmp_{$context}_styles", $styles );
		foreach ( $styles as $handle => $src ) {
			if ( isset( $wpgmp_settings['wpgmp_auto_fix'] ) && $wpgmp_settings['wpgmp_auto_fix'] !== 'true' && $context === 'frontend' ) {
				wp_register_style( $handle, $src, [], WPGMP_VERSION );
			}else{
				wp_enqueue_style( $handle, $src, [], WPGMP_VERSION );
			}
		}
	
		// === Localization for JS
		$wpgmp_local = [
			// Core map settings
			'language'               => $language,
			'apiKey'                 => $wpgmp_settings['wpgmp_api_key'] ?? '',
			'urlforajax'             => admin_url( 'admin-ajax.php' ),
			'nonce'                  => wp_create_nonce( 'fc-call-nonce' ),
			'wpgmp_country_specific' => ! empty( $wpgmp_settings['wpgmp_country_specific'] ) && $wpgmp_settings['wpgmp_country_specific'] === 'true',
			'wpgmp_countries'        => $wpgmp_settings['wpgmp_countries'] ?? false,
			'wpgmp_assets'           => WPGMP_JS,
		
			// Frontend-only: memory & cookies
			'days_to_remember'       => $wpgmp_settings['wpgmp_days_to_remember'] ?? '',
		
			// Access keys for external services
			'wpgmp_mapbox_key'            => $wpgmp_settings['wpgmp_mapbox_key'] ?? '',
			// Access keys for external services
			'map_provider'            => WPGMP_Helper::wpgmp_get_map_provider(),
			'route_provider'      => WPGMP_Helper::wpgmp_get_route_provider(),
			'tiles_provider' => WPGMP_Helper::wpgmp_get_leaflet_provider(),
			'use_advanced_marker' => $wpgmp_settings['wpgmp_advanced_marker'] ?? false,
			'set_timeout' => min(1000, intval($wpgmp_settings['wpgmp_set_timeout'] ?? 100)),
			'debug_mode' => (
				(isset($_GET['wpgmp_debug']) && $_GET['wpgmp_debug'] === 'true') ||
				(isset($wpgmp_settings['wpgmp_debug_mode']) && $wpgmp_settings['wpgmp_debug_mode'] === 'true')
			)
		];
		
		// Merge additional localized values from external method (like zoom labels, messages, etc.)
		$wpomp_extra = self::wpgmp_get_localised_data();
		if ( is_array( $wpomp_extra ) ) {
			$wpgmp_local = array_merge( $wpgmp_local, $wpomp_extra );
		}
		
		// Filter for addons or overrides
		$wpgmp_local = apply_filters( 'wpgmp_text_settings', $wpgmp_local );
		// Final localization
		wp_localize_script( 'wpgmp-google-map-main', 'wpgmp_local', $wpgmp_local );
		
	}
	

	public static function wpgmp_register_map_backend_resources() {
		// Enqueue native WordPress admin styles and scripts
		wp_enqueue_style( 'thickbox' );
		wp_enqueue_style( 'wp-color-picker' );
		$wp_scripts = [ 'jQuery', 'thickbox', 'wp-color-picker', 'jquery-ui-datepicker', 'jquery-ui-sortable' ];
		foreach ( $wp_scripts as $wp_script ) {
			wp_enqueue_script( $wp_script );
		}
	
		// Reuse optimized asset loader (loads leaflet, google api, backend js/css)
		self::wpgmp_register_map_assets( 'backend', [ 'map', 'backend', 'google_api' ] );
	
		// === JavaScript Localization for Backend Custom Scripts
		$settings = get_option( 'wpgmp_settings', true );
		$extra_fields_raw = maybe_unserialize( get_option( 'wpgmp_location_extrafields', true ) );
		$extra_fields = [];
	
		if ( is_array( $extra_fields_raw ) ) {
			foreach ( $extra_fields_raw as $field ) {
				$extra_fields[ sanitize_title( $field ) ] = [];
			}
		}
	
		$localized = [
			'ajax_url'                  => admin_url( 'admin-ajax.php' ),
			'nonce'                     => wp_create_nonce( 'fc-call-nonce' ),
			'copy_icon'                 => WPGMP_IMAGES . 'copy-to-clipboard.png',
			'access_revoke'            => __( 'Revoke Access', 'wp-google-map-plugin' ),
			'access_create'            => __( 'Create Access', 'wp-google-map-plugin' ),
			'confirm'                  => __( 'Are you sure to delete item?', 'wp-google-map-plugin' ),
			'text_editable'            => [ '.fc-text', '.fc-post-link', '.place_title', '.fc-item-content', '.wpgmp_locations_content' ],
			'bg_editable'              => [ '.fc-bg', '.fc-item-box', '.fc-pagination', '.wpgmp_locations' ],
			'margin_editable'          => [ '.fc-margin', '.fc-item-title', '.wpgmp_locations_head', '.fc-item-content', '.fc-item-meta' ],
			'full_editable'            => [ '.fc-css', '.fc-item-title', '.wpgmp_locations_head', '.fc-readmore-link', '.fc-item-meta', 'a.page-numbers', '.current', '.wpgmp_location_meta' ],
			'image_path'               => WPGMP_IMAGES,
			'geocode_stats'            => __( 'locations geocoded', 'wp-google-map-plugin' ),
			'geocode_success'          => __( 'Click below to save geocoded locations', 'wp-google-map-plugin' ),
			'confirm_location_delete'  => __( 'Do you really want to delete this location?', 'wp-google-map-plugin' ),
			'confirm_map_delete'       => __( 'Do you really want to delete this map?', 'wp-google-map-plugin' ),
			'confirm_category_delete'  => __( 'Do you really want to delete this category?', 'wp-google-map-plugin' ),
			'confirm_route_delete'     => __( 'Do you really want to delete this route?', 'wp-google-map-plugin' ),
			'no_record_for_bulk_delete'=> __( 'Please select some records first to apply bulk action on them.', 'wp-google-map-plugin' ),
			'confirm_bulk_delete'      => __( 'Are you sure you want to delete the selected records?', 'wp-google-map-plugin' ),
			'confirm_record_delete'    => __( 'Do you really want to delete this record?', 'wp-google-map-plugin' ),
			'wpgmp_extrafield_val'     => $settings['wpgmp_extrafield_val'] ?? $extra_fields,
		];
	
		wp_localize_script( 'wpgmp-backend', 'settings_obj', $localized );
	}

	public static function wpgmp_register_map_frontend_resources() {
		$wpgmp_settings = get_option( 'wpgmp_settings', true );
	
		// === GDPR Cookie Check
		if ( ! empty( $wpgmp_settings['wpgmp_gdpr'] ) && apply_filters( 'wpgmp_accept_cookies', false ) === false ) {
			return;
		}
	
		// === Auto jQuery Fix
		if ( ! empty( $wpgmp_settings['wpgmp_auto_fix'] ) && $wpgmp_settings['wpgmp_auto_fix'] === 'true' ) {
			wp_enqueue_script( 'jquery' );
		}
	
		// === Core Assets (scripts + localization)
		self::wpgmp_register_map_assets( 'frontend', [ 'map', 'google_api', 'frontend' ] );
	
	}

	public static function wpgmp_get_localised_data(){

		$wpgmp_local                              = array();
		$wpgmp_local['select_radius']             = esc_html__( 'Select Radius', 'wp-google-map-plugin' );
		$wpgmp_local['search_placeholder']        = esc_html__( 'Enter address or latitude or longitude or title or city or state or country or postal code here...', 'wp-google-map-plugin' );
		$wpgmp_local['select']                    = esc_html__( 'Select', 'wp-google-map-plugin' );
		$wpgmp_local['select_all']                = esc_html__( 'Select All', 'wp-google-map-plugin' );
		$wpgmp_local['select_category']           = esc_html__( 'Select Category', 'wp-google-map-plugin' );
		$wpgmp_local['all_location']              = esc_html__( 'All', 'wp-google-map-plugin' );
		$wpgmp_local['show_locations']            = esc_html__( 'Show Locations', 'wp-google-map-plugin' );
		$wpgmp_local['sort_by']                   = esc_html__( 'Sort by', 'wp-google-map-plugin' );
		$wpgmp_local['wpgmp_not_working']         = esc_html__( 'not working...', 'wp-google-map-plugin' );
		$wpgmp_local['place_icon_url']            = WPGMP_ICONS;
		$wpgmp_local['wpgmp_location_no_results'] = esc_html__( 'No results found.', 'wp-google-map-plugin' );
		$wpgmp_local['wpgmp_route_not_avilable']  = esc_html__( 'Route is not available for your requested route.', 'wp-google-map-plugin' );
		$wpgmp_local['image_path']                = WPGMP_IMAGES;
		$wpgmp_local['default_marker_icon']       =  WPGMP_Helper::wpgmp_default_marker_icon();
		$wpgmp_local['img_grid']                  = "<span class='span_grid'><a class='wpgmp_grid'><i class='wep-icon-grid'></i></a></span>";
		$wpgmp_local['img_list']                  = "<span class='span_list'><a class='wpgmp_list'><i class='wep-icon-list'></i></a></span>";
		$wpgmp_local['img_print']                 = "<span class='span_print'><a class='wpgmp_print' data-action='wpgmp-print'><i class='wep-icon-printer'></i></a></span>";
		$wpgmp_local['hide']                      = esc_html__( 'Hide', 'wp-google-map-plugin' );
		$wpgmp_local['show']                      = esc_html__( 'Show', 'wp-google-map-plugin' );
		$wpgmp_local['start_location']            = esc_html__( 'Start Location', 'wp-google-map-plugin' );
		$wpgmp_local['start_point']               = esc_html__( 'Start Point', 'wp-google-map-plugin' );
		$wpgmp_local['radius']                    = esc_html__( 'Radius', 'wp-google-map-plugin' );
		$wpgmp_local['end_location']              = esc_html__( 'End Location', 'wp-google-map-plugin' );
		$wpgmp_local['take_current_location']     = esc_html__( 'Take Current Location', 'wp-google-map-plugin' );
		$wpgmp_local['center_location_message']   = esc_html__( 'Your Location', 'wp-google-map-plugin' );
		$wpgmp_local['center_location_message']   = esc_html__( 'Your Location', 'wp-google-map-plugin' );
		$wpgmp_local['driving']                   = esc_html__( 'Driving', 'wp-google-map-plugin' );
		$wpgmp_local['bicycling']                 = esc_html__( 'Bicycling', 'wp-google-map-plugin' );
		$wpgmp_local['walking']                   = esc_html__( 'Walking', 'wp-google-map-plugin' );
		$wpgmp_local['transit']                   = esc_html__( 'Transit', 'wp-google-map-plugin' );
		$wpgmp_local['metric']                    = esc_html__( 'Metric', 'wp-google-map-plugin' );
		$wpgmp_local['imperial']                  = esc_html__( 'Imperial', 'wp-google-map-plugin' );
		$wpgmp_local['find_direction']            = esc_html__( 'Find Direction', 'wp-google-map-plugin' );
		$wpgmp_local['miles']                     = esc_html__( 'Miles', 'wp-google-map-plugin' );
		$wpgmp_local['km']                        = esc_html__( 'KM', 'wp-google-map-plugin' );
		$wpgmp_local['show_amenities']            = esc_html__( 'Show Amenities', 'wp-google-map-plugin' );
		$wpgmp_local['find_location']             = esc_html__( 'Find Locations', 'wp-google-map-plugin' );
		$wpgmp_local['locate_me']                 = esc_html__( 'Locate Me', 'wp-google-map-plugin' );
		$wpgmp_local['prev']                      = esc_html__( 'Prev', 'wp-google-map-plugin' );
		$wpgmp_local['next']                      = esc_html__( 'Next', 'wp-google-map-plugin' );
		$wpgmp_local['ajax_url']                  = admin_url( 'admin-ajax.php' );
		$wpgmp_local['no_routes']     = esc_html__( 'No routes have been assigned to this map.', 'wp-google-map-plugin' );
		$wpgmp_local['no_categories'] = esc_html__( 'No categories have been assigned to the locations.', 'wp-google-map-plugin' );
		$default_sizes = [
			'mobile'  => [24,24],
			'desktop' => [32,32],
			'retina'  => [64,64],
		];
		
		$marker_sizes = apply_filters('wpgmp_marker_size', $default_sizes);
		$wpgmp_local['mobile_marker_size']  = isset($marker_sizes['mobile']) ? $marker_sizes['mobile'] : $default_sizes['mobile'];
		$wpgmp_local['desktop_marker_size'] = isset($marker_sizes['desktop']) ? $marker_sizes['desktop'] : $default_sizes['desktop'];
		$wpgmp_local['retina_marker_size']  = isset($marker_sizes['retina']) ? $marker_sizes['retina'] : $default_sizes['retina'];

		$wpgmp_local = apply_filters('wpgmp_js_local', $wpgmp_local);
		
		return $wpgmp_local;


	}

	public static function wpgmp_get_server_protocol(){

		if ( isset( $_SERVER['HTTPS'] ) && ( 'on' == $_SERVER['HTTPS'] || 1 == $_SERVER['HTTPS'] ) || isset( $_SERVER['HTTP_X_FORWARDED_PROTO'] ) && 'https' == $_SERVER['HTTP_X_FORWARDED_PROTO'] ) {
			$protocol = 'https';
		} else {
			$protocol = 'http';
		}  

		return $protocol;

	}

	public static function wpgmp_apply_placeholders( $content ){  

		 $data['marker_id']                 = 1;
		 $data['marker_title']              = 'The Ultimate Sunshine Cafe';
		 $data['marker_address']            = '123 Main St, Springfield, IL';
		 $data['marker_message']            = 'A cozy coffee spot tucked in the heart of the city. 
Famous for its artisan brews, warm ambiance, and friendly staff. 
Perfect for morning meetings, casual hangouts, or remote work. 
Enjoy the aroma of freshly roasted beans all day long.';
		 $data['marker_category']           = '<span class="fc-badge">Coffee</span><span class="fc-badge">Pastries</span><span class="fc-badge">Wifi</span>';
		 $data['marker_icon']               =  WPGMP_Helper::wpgmp_default_marker_icon();
		 $data['marker_latitude']           = '40.7127837';
		 $data['marker_longitude']          = '-74.00594130000002';
		 $data['marker_city']               = 'Springfield';
		 $data['marker_state']              = 'Springfield, IL';
		 $data['marker_country']            = 'United States';
		 $data['marker_zoom']               = '5';
		 $data['marker_postal_code']        = '62704';
		 $data['extra_field_slug']          = 'color';
		 $data['marker_featured_image_src'] = WPGMP_IMAGES . 'sample.jpg';
		 $data['marker_image']              = '<img class="fc-item-featured_image  fc-item-large" src="' . WPGMP_IMAGES . 'sample.jpg' . '" />';
		 $data['marker_featured_image']     = '<img class="fc-item-featured_image  fc-item-large" src="' . WPGMP_IMAGES . 'sample.jpg' . '" />';
		 $data['post_title']                = 'The Ultimate Sunshine Cafe';
		 $data['post_link']                 = '#';
		 $data['post_excerpt']              = 'Lorem ipsum dolor sit amet, consectetur';
		 $data['post_content']              = 'A cozy coffee spot known for artisan brews and sunny vibes.';
		 $data['post_categories']           = 'city tour';
		 $data['post_tags']                 = '<span class="fc-badge">WordPress</span><span class="fc-badge">plugins</span><span class="fc-badge">google maps</span>';
		 $data['post_featured_image']       = '<img class="fc-item-featured_image  fc-item-large" src="' . WPGMP_IMAGES . 'sample.jpg' . '" />';
		 $data['post_author']               = 'FlipperCode';
		 $data['post_comments']             = '<i class="wep-icon-note"></i> 10';
		 $data['view_count']                = '<i class="wep-icon-heart"></i> 1';

		foreach ( $data as $key => $value ) {
			if ( strstr( $key, 'marker_featured_image_src' ) === false && strstr( $key, 'marker_icon' ) === false && strstr( $key, 'post_link' ) === false && strstr( $key, 'marker_zoom' ) === false && strstr( $key, 'marker_id' ) === false && strstr( $key, 'post_title' ) === false) {
				$content = str_replace( "{{$key}}", $value . '<span class="fc-hidden-placeholder">{' . $key . '}</span>', $content );
			} else {
				$content = str_replace( "{{$key}}", $value, $content );
			}
		}

		return $content;

	}

	public static function wpgmp_instructions($feature) {

		$features = [
			'metabox' => "Assign precise map locations to posts, pages, or custom post types with an easy-to-use metabox.",
			'extra_fields' => "Add custom fields to each location—perfect for showing extra details in info windows and listings.",
			'tabs' => "Enable smart tabs for Categories, Directions, Routes, and Nearby Amenities to enhance user experience.",
			'custom_filters' => "Create unlimited filters based on custom fields, taxonomies, or ACF fields—ideal for complex map searches.",
			'url_filters' => "Control what appears on the map using URL parameters—great for sharing filtered map views.",
			'routes' => "Display custom routes between locations directly on your map for a seamless navigation experience.",
			'custom_control' => "Add your own HTML, images, or videos as custom map controls for interactive, branded maps.",
			'spidereffect' => "Prevent overlapping markers with automatic spiderfier effects—perfect for clustered or identical locations.",
			'amenities' => "Show nearby amenities like ATMs, Banks, and Stores to give users valuable local context.",
			'post_infowindow' => "Fully customize infowindows for posts, pages, or CPTs with rich content and styling.",
			'geotags' => "Display posts, pages, or custom post types with location data from your own custom fields—perfect for geo-tagged content.",
			'acf' => "Automatically map content using ACF’s Google Map field—ideal for displaying location-enabled posts or custom types."
		];
		

		$instruction = isset( $features[ $feature ] ) ? $features[ $feature ] : __( 'This is a premium feature.', 'wp-google-map-plugin' );
		$instruction_html = "<div class='fc-pro-feature-message'>

		<div class='fc-pro-feature-content'>
		<i class='wep-icon-info-circle-fill wep-icon-lg'></i>
		<div>".$instruction."</div>
		</div>
		<div class='fc-btn-wrapper'>
		<a class='fc-btn fc-btn-purple fc-modal-open'><i class='wep-icon-crown wep-icon-xl'></i><span>Upgrade to Pro</span></a>
		</div>

		</div>";
		return $instruction_html;
	}

	public static function wpgmp_get_available_features_by_provider() {
		return [
			'google' => [
				'route_marker_draggable',
				'route_optimize_waypoints',
				'map_drawing',
				'map_all_control[wpgmp_nearby_tab]',
				'map_all_control[camera_control]',
				'location_animation',
				'map_type',
				'map_all_control[zoom_level_after_search]',
				'map_45imagery',
				'map_all_control[gesture]',
				'map_am_setting',
				'map_all_control[street_view_control]',
				'map_all_control[overview_map_control]',
				'map_all_control[camera_control_position]',
				'map_all_control[street_view_control_position]',
				'map_all_control[map_type_control_style]',
				'map_all_control[zoom_control_style]',
				'map_all_control[infowindow_bounce_animation]',
				'map_all_control[infowindow_drop_animation]',
				'map_control_layers',
				'map_styles_settings',
				'map_street_view_setting',
				'map_marker_cluster',
				'map_marker_spidifier_group',
				'map_overlay_setting',
				'map_limit_panning_setting',
				'map_all_control[wpgmp_category_location_sort_order]',
				'map_all_control[wpgmp_secondary_color]',
				'map_geojson_setting',
				'map_all_control[listing_openoption]',
				'wpgmp_search_placeholders_list',
				'map_all_control[wpgmp_display_print_option]',
				
			],
			'leaflet' => [
				'drawing_tools',
				'infowindow_autopan',
				'custom_icons',
				'mapbox_tiles',
			],
		];
	}

	public static function wpgmp_is_feature_available($feature_name, $provider = 'google') {

		if( !WPGMP_Helper::wpgmp_is_leaflet_enabled() ) {
			return false;
		}
		$features = WPGMP_Helper::wpgmp_get_available_features_by_provider();
		if (! isset($features[$provider])) {
			return false; // Unknown provider
		}
	
		return in_array($feature_name, $features[$provider], true);
	}

	public static function wpgmp_is_leaflet_enabled() {
		
		$wpgmp_settings = maybe_unserialize( get_option( 'wpgmp_settings') );
		if(isset($wpgmp_settings['wpgmp_map_source']) && $wpgmp_settings['wpgmp_map_source'] != 'google'){
			return true;
		}else{
			return false;
		}
	}

	public static function wpgmp_get_map_provider() {
		
		global $_POST;

		$wpgmp_settings = maybe_unserialize( get_option( 'wpgmp_settings') );

		if( isset($_POST['wpgmp_map_source']) && $_POST['wpgmp_map_source'] == 'openstreet' ) {
			return 'leaflet';
		} else if( isset($_POST['wpgmp_map_source']) && $_POST['wpgmp_map_source'] == 'google' ) {
			return 'google';
		} else if(isset($wpgmp_settings['wpgmp_map_source']) && $wpgmp_settings['wpgmp_map_source'] != 'google'){
			return 'leaflet';
		} else{
			return 'google';
		}
	}

	public static function wpgmp_get_leaflet_provider() {
		
		$wpgmp_settings = maybe_unserialize( get_option( 'wpgmp_settings') );
		if(isset($wpgmp_settings['wpgmp_tiles_source']) ){
			return $wpgmp_settings['wpgmp_tiles_source'];
		} else{
			return 'openstreet';
		}
	}

	public static function wpgmp_get_route_provider() {
		//only needed for leaflet providers.
		$settings = maybe_unserialize(get_option('wpgmp_settings'));
		return $settings['wpgmp_router_source'] ?? 'openstreet';
	}

	public static function wpgmp_features_limits_msg() {

		return esc_html__('You\'re using Leaflet. Google Maps–only features have been greyed out.','wp-google-maps');

	}

	public static function wpgmp_default_marker_icon() {
		return apply_filters( 'wpgmp_default_marker_icon', WPGMP_ICONS . 'marker-shape-2.svg' );
	}

	public static function wpgmp_get_all_integrations() {
		$integrations = apply_filters( 'wpgmp_integrations_list', [] );
		return $integrations;
	}

	public static function wpgmp_render_pro_upgrade_modal() {
		ob_start();

	
		?>
		<div class="fc-modal-overlay fc-pro-feature-modal" id="proModal" data-keyboard="false" data-backdrop="static">
	<div class="fc-modal" role="document">
		<div class="fc-modal-body">
			<div class="fc-pro-feature-header">
				<i class="wep-icon-achivement"></i>
				<h3 class="fc-pro-feature-title"><?php esc_html_e( 'Upgrade to WP Maps PRO Try Free for 14 Days!', 'wp-google-map-plugin' ); ?></h3>
				<div><?php esc_html_e( 'Unlock all premium features and build fully customizable, interactive maps in minutes.', 'wp-google-map-plugin' ); ?></div>
			</div>

			<div class="pro-feature-list">
				<div class="pro-feature-list-item">	
					<i class="wep-icon-flash wep-icon-xl fc-text-purple"></i>
					<?php esc_html_e( 'Advanced Filters', 'wp-google-map-plugin' ); ?>
				</div>
				<div class="pro-feature-list-item">
					<i class="wep-icon-flash wep-icon-xl fc-text-purple"></i>
					<?php esc_html_e( 'Custom Post Types', 'wp-google-map-plugin' ); ?>
				</div>
				<div class="pro-feature-list-item">	
					<i class="wep-icon-flash wep-icon-xl fc-text-purple"></i>
					<?php esc_html_e( 'Polygon, Circle & More', 'wp-google-map-plugin' ); ?>
				</div>
				<div class="pro-feature-list-item">	
					<i class="wep-icon-flash wep-icon-xl fc-text-purple"></i>
					<?php esc_html_e( 'Routes', 'wp-google-map-plugin' ); ?>
				</div>
				<div cla  ss="pro-feature-list-item">		
					<i class="wep-icon-flash wep-icon-xl fc-text-purple"></i>
					<?php esc_html_e( 'GeoJSON, KML, KMZ', 'wp-google-map-plugin' ); ?>
				</div>
				<div class="pro-feature-list-item">	
					<i class="wep-icon-flash wep-icon-xl fc-text-purple"></i>
					<?php esc_html_e( 'Zapier', 'wp-google-map-plugin' ); ?>
				</div>

				<div class="pro-feature-list-item">
					<i class="wep-icon-flash wep-icon-xl fc-text-purple"></i>
					<?php esc_html_e( 'Pages/Posts', 'wp-google-map-plugin' ); ?>
				</div>
				<div class="pro-feature-list-item">	
					<i class="wep-icon-flash wep-icon-xl fc-text-purple"></i>
					<?php esc_html_e( 'Directions', 'wp-google-map-plugin' ); ?>
				</div>
				<div class="pro-feature-list-item">	
					<i class="wep-icon-flash wep-icon-xl fc-text-purple"></i>
					<?php esc_html_e( 'Nearby Amenities', 'wp-google-map-plugin' ); ?>
				</div>
				<div class="pro-feature-list-item">	
					<i class="wep-icon-flash wep-icon-xl fc-text-purple"></i>
					<?php esc_html_e( 'GEO Tags', 'wp-google-map-plugin' ); ?>
				</div>
				<div class="pro-feature-list-item">		
					<i class="wep-icon-flash wep-icon-xl fc-text-purple"></i>
					<?php esc_html_e( 'Microsoft Clarity', 'wp-google-map-plugin' ); ?>
				</div>
				<div class="pro-feature-list-item">	
					<i class="wep-icon-flash wep-icon-xl fc-text-purple"></i>
					<?php esc_html_e( 'Facebook Pixels', 'wp-google-map-plugin' ); ?>
				</div>

				<div class="pro-feature-list-item">	
					<i class="wep-icon-flash wep-icon-xl fc-text-purple"></i>
					<?php esc_html_e( 'Meta Box', 'wp-google-map-plugin' ); ?>
				</div>

				<div class="pro-feature-list-item">	
					<i class="wep-icon-flash wep-icon-xl fc-text-purple"></i>
					<?php esc_html_e( 'Import/Export', 'wp-google-map-plugin' ); ?>
				</div>
			</div>

			<div class="fc-alert fc-alert-info"><?php esc_html_e( 'Join 15000+ WordPress Professionals Using WP Maps PRO', 'wp-google-map-plugin' ); ?></div>

			<div class="fc-btn-wrapper">
				<a class="fc-btn fc-btn-purple" href="<?php echo esc_url( 'https://www.wpmapspro.com/?utm_source=wordpress&utm_medium=liteversion&utm_campaign=freemium&utm_id=freemium' ); ?>" target="_blank" rel="noopener noreferrer">
					<i class="wep-icon-crown wep-icon-xl"></i><?php esc_html_e( 'Start Free Trial', 'wp-google-map-plugin' ); ?>
				</a>
			</div>
			<p><?php esc_html_e( 'Risk-free: Cancel anytime. 30-Day Money Back Guarantee.', 'wp-google-map-plugin' ); ?></p>
		</div>
		<button class="fc-btn fc-btn-icon fc-btn-close fc-modal-close"><i class="wep-icon-close wep-icon-lg"></i></button>
	</div>
</div>



		<?php
		return ob_get_clean();
	}
	
	

}
