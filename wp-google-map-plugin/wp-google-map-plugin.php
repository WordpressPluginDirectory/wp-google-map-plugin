<?php
/*
Plugin Name: WP Maps
Plugin URI: https://weplugins.com/
Description: A fully customizable WordPress Plugin for Google Maps. Create unlimited Google Maps Shortcodes, assign unlimited locations with custom infowindow messages and add to pages, posts and widgets.
Author: WePlugins
Author URI: https://weplugins.com/
Version: 4.8.3
Text Domain: wp-google-map-plugin
Domain Path: /lang
*/

if ( ! defined( 'ABSPATH' ) ) {
	die( 'You are not allowed to call this page directly.' );
}

if ( ! class_exists( 'WPGMP_Google_Maps_Lite' ) ) {

	/**
	 * Main plugin class
	 *
	 * @author Flipper Code <hello@flippercode.com>
	 * @package Maps
	 */
	class WPGMP_Google_Maps_Lite {

		/**
		 * List of Modules.
		 *
		 * @var array
		 */
		private $modules = array();

		/**
		 * Check if Pro Version Installed.
		 *
		 * @var bool
		 */
		private $proVersionInstalled = false;

		/**
		 * Intialize variables, files and call actions.
		 *
		 * @var array
		 */
		public function __construct() {

			$this->wpagm_check_plugin_dependancy();

			if( $this->proVersionInstalled === false)
			{
				$this->wpgmp_define_constants();
				$this->wpgmp_load_files();
				$this->wpgmp_register_hooks();
			}
			
		}

		function wpgmp_register_hooks(){

			register_activation_hook( __FILE__, 		  [ $this, 'wpgmp_plugin_activation'] );
			register_deactivation_hook( __FILE__, 		  [ $this, 'wpgmp_plugin_deactivation'] );

			if ( is_multisite() ) {
				add_action( 'wpmu_new_blog', 			  [ $this, 'wpgmp_on_blog_new_generate'], 10, 6 );
				add_filter( 'wpmu_drop_tables', 		  [ $this, 'wpgmp_on_blog_delete'] );
			}

			add_action('init', 							  [$this, 'wpgmp_notification'] );
			add_action( 'plugins_loaded', 				  [ $this, 'wpgmp_load_plugin_languages'] );
			add_action( 'plugins_loaded', 				  [ $this, 'wpgmp_load_integrations'] );
			add_action( 'widgets_init', 				  [ $this, 'wpgmp_google_map_widget'] );
			add_action( 'wp_enqueue_scripts', 			  [ $this, 'wpgmp_frontend_scripts'] );
			add_action( 'wp_ajax_wpgmp_ajax_call', 		  [ $this, 'wpgmp_ajax_call'] );
			add_action( 'wp_ajax_nopriv_wpgmp_ajax_call', [ $this, 'wpgmp_ajax_call'] );
			
			add_filter( 'media_upload_tabs', 			  [ $this, 'wpgmp_google_map_tabs_filter']);
			add_filter( 'fc-dummy-placeholders', 		  [ $this, 'wpgmp_apply_placeholders'] );
			add_filter( 'fc_tabular_action_cap',      	  [ $this, 'wpgmp_return_final_capability' ] );

			add_shortcode( 'put_wpgm', 					  [ $this, 'wpgmp_show_location_in_map'] );
			
			if ( is_admin() ) {
				
				add_action( 'admin_head', 				  [ $this, 'wpgmp_customizer_font_family']);
				add_action( 'admin_menu', 				  [ $this, 'wpgmp_create_menu' ] );
				add_action( 'admin_init', 				  [ $this, 'wpgmp_export_data' ] );
				add_action( 'admin_init', 				  [ $this, 'wpgmp_sample_csv_download' ] );
				add_action( 'admin_enqueue_scripts', [ $this, 'wpgmp_enqueue_metabox_assets' ] );
				add_action( 'media_upload_ell_insert_gmap_tab', [ $this, 'wpgmp_google_map_media_upload_tab' ] );
				add_action( 'media_upload_ell_insert_gmap_svg_tab', [ $this, 'wpgmp_google_map_media_upload_svg_tab' ] );
				add_action( 'wp_ajax_wpdfenabledebug', [ $this, 'wpgmp_enable_debug_mode' ] );
				add_action( 'wp_ajax_nopriv_wpdfenabledebug', [ $this, 'wpgmp_enable_debug_mode' ] );
				add_action( 'wp_ajax_wpgmp_temp_access_ajax', 		  [ $this, 'wpgmp_temp_access_ajax_callback'] );
				add_action( 'wp_ajax_nopriv_wpgmp_temp_access_ajax', [ $this, 'wpgmp_temp_access_ajax_callback'] );

				add_filter( 'plugin_row_meta', 			  [ $this,'wpgmp_add_plugin_row_custom_link'], 10, 2 );
				add_filter( 'wpgmp_form_header_html', [ $this, 'wpgmp_add_custom_loader' ] );
				add_filter( 'fc_manage_page_basic_query', [ $this, 'wpgmp_display_own_records' ],10,2 );
				add_filter( 'plugin_action_links_'. plugin_basename(__FILE__), [$this, 'wpgmp_plugin_settings_link'], 10, 1 );
				add_filter( 'fc_plugin_nav_menu', [$this,'fc_render_plugin_menu'] );
				$this->wpgmp_create_vc_component();
				add_action('wp_ajax_wpgmp_submit_uninstall_reason_action', array($this, 'wpgmp_submit_uninstall_reason_action_perform'));
				add_action('wp_ajax_nopriv_wpgmp_submit_uninstall_reason_action', array($this, 'wpgmp_submit_uninstall_reason_action'));
				add_action( 'admin_enqueue_scripts',        array( $this, 'wpgmp_overview_page_styles') );

			}

		}

		function wpagm_check_plugin_dependancy() {

            if ( ! function_exists( 'is_plugin_active_for_network' ) )
            require_once( ABSPATH . '/wp-admin/includes/plugin.php' );
            
            //Advance GoogleMaps Pro Dependency
            $is_google_maps_installed = in_array( 'wp-google-map-gold/wp-google-map-gold.php',get_option('active_plugins' ) ) ;
            $is_google_maps_active = ( is_plugin_active_for_network( 'wp-google-map-gold/wp-google-map-gold.php' ) ) ? true : false;
            $this->proVersionInstalled = ($is_google_maps_installed || $is_google_maps_active) ? true : false;
            
        }
		function fc_render_plugin_menu() {
			$plugin_submenu_info = $this->get_plugin_submenu_info_by_parent('wpgmp_view_overview');
			$page = isset($_GET['page']) ? sanitize_text_field(wp_unslash($_GET['page'])) : '';
		
			$grouped = [];
		
			foreach ($plugin_submenu_info as $menu) {
				$parts = explode('_', $menu['slug']);
				$key = $parts[2] ?? 'other';
		
				if ($key === 'group') $key = 'category';
				if ($key === 'overview') $key = 'dashboard';
		
				$grouped[$key][] = $menu;
			}
		
			ob_start();
			?>
			<div class="fc-header-secondary">
				<div class="fc-container">
					<div class="fc-navbar">
						<?php foreach ($grouped as $group => $items): ?>
							<?php
							$first = $items[0];
							$split_first = explode('_',$first['slug']);
							if(isset($split_first[2]))
								$active = (strpos($page, $split_first[2]) !== false) ? 'active' : '';
							else
							$active = '';

							if( strpos($page, 'group_map') !== false && isset($split_first[2]) && $split_first[2] == 'map') {
								$active = '';
							}

							?>
							<div class="fc-nav-item <?= esc_attr($active) ?>">
								<a href="<?= esc_url($first['url']) ?>" class="fc-nav-link <?= esc_attr($first['slug']) ?>">
									<?= ucfirst(esc_html($group)) ?>
								</a>
		
								<?php if (count($items) > 1): ?>
									<div class="fc-sub-menu">
										<?php foreach (array_slice($items, 0) as $item): ?>
											<?php $sub_active = ($page === $item['slug']) ? 'active' : ''; ?>
											<div class="fc-nav-item <?= esc_attr($sub_active) ?>">
												<a href="<?= esc_url($item['url']) ?>" class="fc-nav-link <?= esc_attr($item['slug']) ?>">
													<?= esc_html($item['name']) ?>
												</a>
											</div>
										<?php endforeach; ?>
									</div>
								<?php endif; ?>
							</div>
						<?php endforeach; ?>
					</div>
				</div>
			</div>
			<?php
			return ob_get_clean();
		}
			
		
		function wpgmp_load_integrations() {
			$integration_files = glob( plugin_dir_path( __FILE__ ) . 'integrations/class-wpgmp-integration-*.php' );
			if ( $integration_files ) {
				foreach ( $integration_files as $file ) {
					require_once $file;
				}
			}
		}

		function get_plugin_submenu_info_by_parent($parent_slug) {

		    global $submenu;
		    $plugin_submenu_info = array();

		    if (isset($submenu[$parent_slug])) {
		        foreach ($submenu[$parent_slug] as $submenu_item) {
		            $submenu_name = isset($submenu_item[0]) ? $submenu_item[0] : '';
		            $submenu_slug = isset($submenu_item[2]) ? $submenu_item[2] : '';
		            $submenu_url = isset($submenu_item[2]) ? admin_url('admin.php?page=' . $submenu_item[2]) : '';

		            $plugin_submenu_info[] = array(
		                'name' => $submenu_name,
		                'slug' => $submenu_slug,
		                'url' => $submenu_url
		            );
		        }
		    }

		    return $plugin_submenu_info;
		}
		

		/**
		 * Enqueue backend scripts and styles only when editing allowed post types
		 */
		public function wpgmp_enqueue_metabox_assets( $hook ) {
			if ( ! in_array( $hook, [ 'post.php', 'post-new.php' ], true ) ) {
				return;
			}

			global $post;
			if ( isset( $post ) && in_array( get_post_type( $post ), WPGMP_Helper::wpgmp_get_all_post_types(), true ) ) {
				WPGMP_Helper::wpgmp_register_map_backend_resources();
			}
		}

		function wpgmp_return_final_capability($cap){

			if ( current_user_can('administrator') ) {
				return $cap;
			}

			$frontend_page = ( !is_admin() && isset( $_GET['location_id'] ) && !empty( $_GET['location_id'] ) && isset($_GET['doaction']) && !empty($_GET['doaction']) && isset($_GET['cap']) && !empty($_GET['cap']) && $_GET['cap'] == 'wpgmp_manage_location' ) ? true : false;

			$backend_page = ( is_admin() && isset( $_GET['location_id'] ) && !empty( $_GET['location_id'] ) && isset($_GET['doaction']) && !empty($_GET['doaction']) && isset($_GET['page']) && !empty($_GET['page']) && $_GET['page'] == 'wpgmp_manage_location' ) ? true : false;

			if($frontend_page || $backend_page){
		
				$model_factory = new WPGMP_Model();
				$location_obj = $model_factory->create_object( 'location' );
				$location_data = $location_obj->fetch( array( array( 'location_id', '=', $_GET['location_id'] ) ) );
				if(get_current_user_id() != $location_data[0]->location_author){
					$cap = '';
				}
			}

			return $cap;
		}

		function wpgmp_submit_uninstall_reason_action_perform(){

			
		    global  $wp_version, $current_user;
		    wp_verify_nonce($_REQUEST['wpgmp_ajax_nonce'], 'wpgmp_ajax_nonce');
			$reason_id = isset($_REQUEST['reason_id']) ? stripcslashes(sanitize_text_field($_REQUEST['reason_id'])) : '';
		    $basename  = isset($_REQUEST['plugin']) ? stripcslashes(sanitize_text_field($_REQUEST['plugin'])) : '';

		    if (empty($reason_id) || empty($basename)) {
		        exit;
		    }

		    $reason_info = isset($_REQUEST['reason_info']) ? stripcslashes(sanitize_textarea_field($_REQUEST['reason_info'])) : '';
		    if (!empty($reason_info)) {
		        $reason_info = substr($reason_info, 0, 255);
		    }
		    $is_anonymous = isset($_REQUEST['is_anonymous']) && 1 == $_REQUEST['is_anonymous'];


		    $options = array(
		        'product'     => 'WP Maps Plugin',
		        'reason_id'   => $reason_id,
		        'reason_info' => $reason_info,
		    );

		    if (!$is_anonymous) {
		        $options['url']                  = get_site_url();
		        $options['wp_version']           = $wp_version;
		        $options['plugin_version']       = WPGMP_VERSION;
		        $options['email'] = $current_user->data->user_email;
		    }

	        wp_remote_post(
		        "https://weplugins.com/wp-json/weplugins/v1/plugin-deactivate",
		        array(
		            'method'  => 'POST',
		            'body'    => $options,
		            'timeout' => 15,
		        )
		    );
		    exit;
	    

		}

		function wpgmp_display_own_records($query, $page){

			// Check if the user is logged in
			if (is_user_logged_in()) {

				$current_user = wp_get_current_user();
				$roles = $current_user->roles;

			    // Check if the user has a specific role
			    if (in_array('administrator', $roles)) {
			       return $query;
			    } else {

			    	$permission = apply_filters( 'wpgmp_location_update_permission', true, $_GET['page'],  $current_user );

			    	if( isset( $_GET['page'] ) && $_GET['page'] == 'wpgmp_manage_location' && $permission){
			    		
			    		$query .= ' where location_author = '.get_current_user_id(); 
			    		 	
			    	}
			    	
			    }
			} 


			return $query;
		}

		function wpgmp_notification(){
			
			if (class_exists('WePlugins_Notification')) {
				WePlugins_Notification::init(); // call static init
			}

		}

		

		function wpgmp_temp_access_ajax_callback(){
			check_ajax_referer( 'fc-call-nonce', 'nonce' );
			$temp_access = new WPGMP_Temp_Access();
			$response = $temp_access->wpgmp_temp_access_support();

		    wp_send_json($response);

		    exit();
		}

		/**
		 * Display loader in back-end.
		 *
		 * @since  4.0.0
		 */
		function wpgmp_add_custom_loader( $form_container_html ) {

			if ( isset( $_GET['page'] ) && strpos( $_GET['page'], 'wpgmp' ) !== false ) {
				$form_container_html = $form_container_html . '<div class="fc-backend-loader" style="display:none;"><img src="' . WPGMP_IMAGES . '\Preloader_3.gif"></div>';
			}

			return $form_container_html;

		}

		/**
		 * Enable debug module.
		 *
		 * @since  4.0.0
		 */
		function wpgmp_enable_debug_mode() {

			if ( ! isset( $_POST['nonce'] ) || empty( $_POST['nonce'] ) ) {
				echo json_encode(
					array(
						'error'     => true,
						'error_msg' => 'Nonce security failed',
					)
				);
				wp_die();
			}
			if ( isset( $_POST['nonce'] ) && ( ! wp_verify_nonce( $_POST['nonce'], 'fc-call-nonce' ) ) ) {
				echo json_encode(
					array(
						'error'     => true,
						'error_msg' => 'Nonce security was not verified by our system. Please refresh the page and try again.',
					)
				);
				 wp_die();

			}
			if ( ! current_user_can( 'manage_options' ) ) {
				echo json_encode(
					array(
						'error'     => true,
						'error_msg' => 'You are not allowed to perform actions.',
					)
				);
				wp_die();

			}

			$enabled = true;
			$data = get_option( 'wpgmp_settings' );
			if(!empty($data)){
				$data = maybe_unserialize( $data );	
			}
			
			if ( ! isset( $data ) || ! isset( $data['wpgmp_enabled'] ) ) {

				$data['wpgmp_enabled']                       = 'yes';
				$_POST['purcahse_data']['platform']          = sanitize_text_field( $_POST['platform'] );
				$_POST['purcahse_data']['verification_mode'] = sanitize_text_field( $_POST['verification_mode'] );
				$data['wpgmp_debug_info']                    = serialize( $_POST['purcahse_data'] );
				update_option( 'wpgmp_settings', $data );

			}
			echo json_encode(
				array(
					'enabled' => $enabled,
					'data'    => $data,
				)
			);
			wp_die();

		}

		function wpgmp_create_vc_component() {

			if ( defined( 'WPB_VC_VERSION' ) && class_exists('WPGMP_VC_Builder') ) {
				
				$vcComponent = new WPGMP_VC_Builder();
				$vcComponent->wpgmp_register_vc_component();
				
			}
		}

		function wpgmp_sample_csv_download(){

			if(!empty($_GET['do_action']) && $_GET['do_action'] == 'sample_csv_download'){

				if ( isset( $_GET['sample_csv_download_nonce'] ) && wp_verify_nonce( $_GET['sample_csv_download_nonce'], 'sample_csv_download_action' ) ) {
				  
				  	$sample_zip =  WPGMP_DIR.'import_sample_file.zip';
					header("Content-type: application/zip",true,200);
				    header("Content-Disposition: attachment; filename=import_sample_file.zip");
				    header("Pragma: no-cache");
				    header("Expires: 0");
				    readfile($sample_zip); 
				    exit();
				  
				} else {

				  die( __( 'Something went wrong with the requested action. Please refresh page and try again.', 'wp-google-map-plugin' ) ); 

				}
				
			}

		}
		

		/**
		 * Export data into csv,xml,json or excel file
		 */
		function wpgmp_export_data() {

			if ( isset( $_POST['action'] ) && isset( $_REQUEST['_wpnonce'] ) && $_POST['action'] == 'export_location_csv' ) {
				$nonce = sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) );

				if ( isset( $nonce ) and ! wp_verify_nonce( $nonce, 'wpgmp-nonce' ) ) {
					die( 'Cheating...' );
				}

				if ( isset( $_POST['action'] ) and false != strstr( $_POST['action'], 'export_' ) ) {
					$export_action = explode( '_', sanitize_text_field( $_POST['action'] ) );
					if ( 3 == count( $export_action ) and 'export' == $export_action[0] ) {
						$model_class = 'WPGMP_Model_' . ucwords( $export_action[1] );
						$entity      = new $model_class();
						$entity->export( $export_action[2] );
					}
				}
			}

		}

		function wpgmp_apply_placeholders( $content ) {
			 
			$content = WPGMP_Helper::wpgmp_apply_placeholders( $content );
			return $content;
		}
		
		function wpgmp_customizer_font_family() {

			if ( isset( $_GET['doaction'] ) and 'edit' == $_GET['doaction'] and isset( $_GET['map_id'] ) ) {

			    $modelFactory = new WPGMP_Model();
				$map_obj      = $modelFactory->create_object( 'map' );
				$styles_and_scripts = $map_obj->get_map_customizer_style();
				$font_families   = $styles_and_scripts['font_families'];
				$fc_skin_styles  = $styles_and_scripts['fc_skin_styles']; 
				if ( ! empty( $fc_skin_styles ) ) {
					echo '<style>' . $fc_skin_styles . '</style>';
				}
				if ( ! empty( $font_families ) ) {
					$font_families = array_unique($font_families);
					?>
					<script type="text/javascript">
						var google_customizer_fonts = <?php echo json_encode($font_families,JSON_FORCE_OBJECT);?>;
					</script>
				<?php }

			}

		}

		/**
		 * Register WP Google Map Widget
		 */
		function wpgmp_google_map_widget() { register_widget( 'WPGMP_Google_Map_Widget_Class' ); }

		/**
		 * Eneque scripts at frontend.
		 */
		
		function wpgmp_frontend_scripts() {  WPGMP_Helper::wpgmp_register_map_frontend_resources();  }
		/**
		 * Display map at the frontend using put_wpgmp shortcode.
		 *
		 * @param  array  $atts   Map Options.
		 * @param  string $content Content.
		 */
		function wpgmp_show_location_in_map( $atts, $content = null ) {

			try {
				$factoryObject = new WPGMP_Controller();
				$viewObject    = $factoryObject->create_object( 'shortcode' );
				$output        = $viewObject->display( 'put-wpgmp', $atts );
				 return $output;

			} catch ( Exception $e ) {
				echo WPGMP_Template::show_message( array( 'error' => $e->getMessage() ) );

			}

		}
		
		/**
		 * Ajax Call
		 */
		function wpgmp_ajax_call() {

			check_ajax_referer( 'fc-call-nonce', 'nonce' );
			$operation = sanitize_text_field( wp_unslash( $_POST['operation'] ) );
			$value     = wp_unslash( $_POST );
			if ( isset( $operation ) ) {
				$this->$operation( $value );
			}
			exit;
		}

		/**
		 * Process slug and display view in the backend.
		 */
		function wpgmp_processor() {

			$return = '';
			$page = ( isset( $_GET['page'] ) ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : 'wpgmp_view_overview';
			$pageData      = explode( '_', $page );
			$obj_type      = $pageData[2];
			$obj_operation = $pageData[1];

			if ( count( $pageData ) < 3 ) {	die( 'Cheating!' );	}

			try {

				if ( count( $pageData ) > 3 ) {
					$obj_type = $pageData[2] . '_' . $pageData[3];
				}
				$factoryObject = new WPGMP_Controller();
				$viewObject    = $factoryObject->create_object( $obj_type , $factoryObject);
				$viewObject->display( $obj_operation );

			} catch ( Exception $e ) {
				echo WPGMP_Template::show_message( array( 'error' => $e->getMessage() ) );

			}

		}

		public function wpgmp_add_plugin_row_custom_link( $links, $file ){

			if ( strpos( $file, basename(__FILE__) ) ) {
				
				$links[] = '<a href="https://www.wpmapspro.com/tutorials/" target="_blank" title="WP Maps Docs">'.esc_html__('Docs','wp-google-map-plugin').'</a>';
				$links[] = '<a href="https://www.wpmapspro.com/map-hooks/" target="_blank" title="WP Maps Developer Hooks">'.esc_html__('Hooks','wp-google-map-plugin').'</a>';
				$links[] = '<a href="https://weplugins.com/support/" target="_blank" title="WP Maps Support">'.esc_html__('Support','wp-google-map-plugin').'</a>';
				$links[] = '<a href="https://weplugins.com/contact/" target="_blank" title="WP Maps Customisation">'.esc_html__('Customisation','wp-google-map-plugin').'</a>';
				$links[] = '<a href="https://www.wpmapspro.com/pricing/" class="wpgmp-pro-link" target="_blank" title="WP Maps Pro">'.esc_html__('Upgrade to Pro','wp-google-map-plugin').'</a>';

		    }
		    return $links;
		}

		function wpgmp_plugin_settings_link($actions) {

			$actions['settings'] = '<a href="' . admin_url( 'admin.php?page=wpgmp_manage_settings' ) . '">'.esc_html__( 'Settings', 'wp-google-map-plugin' ).'</a>';

			return $actions;
		}
		
		/**
		 * Create backend navigation.
		 */
		function wpgmp_create_menu() {

			global $navigations;

			$pagehook1 = add_menu_page(
				esc_html__( 'WP MAPS', 'wp-google-map-plugin' ),
				esc_html__( 'WP MAPS', 'wp-google-map-plugin' ),
				'wpgmp_admin_overview',
				WPGMP_SLUG,
				array( $this, 'wpgmp_processor' ),
				WPGMP_IMAGES . '/fc-small-logo.png'
			);

			if ( current_user_can( 'manage_options' ) ) {
				$role = get_role( 'administrator' );
				$role->add_cap( 'wpgmp_admin_overview' );
			}

			$this->wpgmp_load_modules_menu();
			add_action( 'load-' . $pagehook1, array( $this, 'wpgmp_backend_scripts' ) );

		}
		/**
		 * Read models and create backend navigation.
		 */
		function wpgmp_load_modules_menu() {

			$modules   = $this->modules;
			$pagehooks = array();
			if ( is_array( $modules ) ) {
				foreach ( $modules as $module ) {

						$object = new $module();

					if ( method_exists( $object, 'navigation' ) ) {

						if ( ! is_array( $object->navigation() ) ) {
							continue;
						}

						foreach ( $object->navigation() as $nav => $title ) {

							if ( current_user_can( 'manage_options' ) && is_admin() ) {
								$role = get_role( 'administrator' );
								$role->add_cap( $nav );

							}

							$pagehooks[] = add_submenu_page(
								WPGMP_SLUG,
								$title,
								$title,
								$nav,
								$nav,
								array( $this, 'wpgmp_processor' ),
								100
							);

						}
					}
				}
			}

			if ( is_array( $pagehooks ) ) {

				foreach ( $pagehooks as $key => $pagehook ) {
					add_action( 'load-' . $pagehooks[ $key ], array( $this, 'wpgmp_backend_scripts' ) );
				}
			}

		}
		/**
		 * Eneque scripts in the backend.
		 */
		function wpgmp_backend_scripts() { 

			WPGMP_Helper::wpgmp_register_map_backend_resources();
		}
		
		/**
		 * Load plugin language file.
		 */
		function wpgmp_load_plugin_languages() {

			$this->modules = apply_filters( 'wpgmp_extensions', $this->modules );
			load_plugin_textdomain( 'wp-google-map-plugin', false, WPGMP_FOLDER . '/lang/' );
		}
		/**
		 * Call hook on plugin activation for both multi-site and single-site.
		 */
		function wpgmp_plugin_activation( $network_wide ) {

			if ( is_multisite() && $network_wide ) {
				global $wpdb;
				$currentblog = $wpdb->blogid;
				$activated   = array();
				$sql         = "SELECT blog_id FROM {$wpdb->blogs}";
				$blog_ids    = $wpdb->get_col( $wpdb->prepare( $sql, null ) );

				foreach ( $blog_ids as $blog_id ) {
					switch_to_blog( $blog_id );
					$this->wpgmp_activation();
					$activated[] = $blog_id;
				}

				switch_to_blog( $currentblog );
				update_site_option( 'op_activated', $activated );

			} else {
				$this->wpgmp_activation();
			}

			if (class_exists('WePlugins_Notification')) {
				WePlugins_Notification::schedule_cron();
			}
		}
		/**
		 * Call hook on plugin deactivation for both multi-site and single-site.
		 */
		function wpgmp_plugin_deactivation() {

			if ( is_multisite() && $network_wide ) {
				global $wpdb;
				$currentblog = $wpdb->blogid;
				$activated   = array();
				$sql         = "SELECT blog_id FROM {$wpdb->blogs}";
				$blog_ids    = $wpdb->get_col( $wpdb->prepare( $sql, null ) );

				foreach ( $blog_ids as $blog_id ) {
					switch_to_blog( $blog_id );
					$this->wpgmp_deactivation();
					$activated[] = $blog_id;
				}

				switch_to_blog( $currentblog );
				update_site_option( 'op_activated', $activated );

			} else {
				$this->wpgmp_deactivation();
			}

			if (class_exists('WePlugins_Notification')) {
				WePlugins_Notification::deactivate_cron();
			}
		}

		/**
		 * Perform tasks on new blog create and table install.
		 */

		function wpgmp_on_blog_new_generate( $blog_id, $user_id, $domain, $path, $site_id, $meta ) {

			if ( is_plugin_active_for_network( plugin_basename( __FILE__ ) ) ) {
				switch_to_blog( $blog_id );
				$this->wpgmp_activation();
				restore_current_blog();
			}

		}

		/**
		 * Perform tasks on when blog deleted and remove plugin tables.
		 */

		function wpgmp_on_blog_delete( $tables ) {
			global $wpdb;
			$tables[] = str_replace( $wpdb->base_prefix, $wpdb->prefix, TBL_LOCATION );
			$tables[] = str_replace( $wpdb->base_prefix, $wpdb->prefix, TBL_GROUPMAP );
			$tables[] = str_replace( $wpdb->base_prefix, $wpdb->prefix, TBL_MAP );
			$tables[] = str_replace( $wpdb->base_prefix, $wpdb->prefix, TBL_ROUTES );
			return $tables;
		}
		/**
		 * Create choose icon tab in media manager.
		 *
		 * @param  array $tabs Current Tabs.
		 * @return array       New Tabs.
		 */
		function wpgmp_google_map_tabs_filter( $tabs ) {

			$newtab = array( 'ell_insert_gmap_tab' => esc_html__( 'Choose Icons', 'wp-google-map-plugin' ),
		'ell_insert_gmap_svg_tab' => esc_html__( 'SVG Icons', 'wp-google-map-plugin' ) );

			return array_merge( $tabs, $newtab );
		}
		/**
		 * Intialize wp_iframe for icons tab
		 *
		 * @return [type] [description]
		 */
		function wpgmp_google_map_media_upload_tab() {

			return wp_iframe( array( $this, 'media_wpgmp_google_map_icon' ), array() );
		}

		/**
		 * Intialize wp_iframe for svg icons tab
		 *
		 * @return [type] [description]
		 */
		function wpgmp_google_map_media_upload_svg_tab() {

			return wp_iframe( array( $this, 'media_wpgmp_google_map_svg_icon' ), array() );
		}
		/**
		 * Read images/icons folder.
		 */
		function media_wpgmp_google_map_icon() {

			wp_enqueue_style( 'media' );
			media_upload_header();
			$form_action_url = site_url( "wp-admin/media-upload.php?type={$GLOBALS['type']}&tab=ell_insert_gmap_tab", 'admin' );
			?>

			<style type="text/css">
			#select_icons .read_icons {width: 32px;height: 32px;}
			#select_icons .active img {border: 3px solid #000;width: 26px;}
			</style>

			<script type="text/javascript">

			jQuery(document).ready(function($) {

				$(".read_icons").click(function () {
					$(".read_icons").removeClass('active');
					$(this).addClass('active');
				});

				$('input[name="wpgmp_search_icon"]').keyup(function() {
					if($(this).val() == '')
					$('.read_icons').show();
				else {
					$('.read_icons').hide();
					$('img[title^="' + $(this).val() + '"]').parent().show();
				}

			});

		});

		

		function wpgmp_add_icon_to_images(target) {

			if(jQuery('.read_icons').hasClass('active')) {
				imgsrc = jQuery('.active').find('img').attr('src');
				var win = window.dialogArguments || opener || parent || top;
				win.send_icon_to_map(imgsrc,target);
			}else{
				alert('<?php esc_html_e( 'Choose marker icon', 'wp-google-map-plugin' ); ?>');
			}
		}
		</script>
		<form enctype="multipart/form-data" method="post" action="<?php echo esc_attr( $form_action_url ); ?>" class="media-upload-form" id="library-form">
	<h3 class="media-title" style="color: #5A5A5A; font-family: Georgia, 'Times New Roman', Times, serif; font-weight: normal; font-size: 1.6em; margin-left: 10px;"><?php esc_html_e( 'Choose icon', 'wp-google-map-plugin' ); ?> 	<input name="wpgmp_search_icon" id="wpgmp_search_icon" type='text' value="" placeholder="<?php esc_html_e( 'Search icons', 'wp-google-map-plugin' ); ?>" />
</h3>
	<div style="margin-bottom:20px; float:left; width:100%;">
	<ul style="float:left; width:100%;" id="select_icons">
			<?php
			$dir          = WPGMP_ICONS_DIR;
			$file_display = array( 'jpg', 'jpeg', 'png', 'gif' );

			if ( file_exists( $dir ) == false ) {
				echo 'Directory \'', $dir, '\' not found!';

			} else {
				$dir_contents = scandir( $dir );
				foreach ( $dir_contents as $file ) {
					$image_data = explode( '.', $file );
					$file_type  = strtolower( end( $image_data ) );
					if ( '.' !== $file && '..' !== $file && true == in_array( $file_type, $file_display ) ) {
						?>
			<li class="read_icons" style="float:left;">
			<img alt="<?php echo esc_attr( $image_data[0] ); ?>" title="<?php echo esc_attr( $image_data[0] ); ?>" src="<?php echo esc_url( WPGMP_ICONS . $file ); ?>" style="cursor:pointer;" />
		</li>
						<?php
					}
				}
			}

			if ( isset( $_GET['target'] ) ) {
				$target = esc_js( $_GET['target'] );
			} else {
				$target = '';
			}

			?>
		</ul>
		<button type="button" class="button" style="margin-left:10px;" value="1" onclick="wpgmp_add_icon_to_images('<?php echo esc_attr( $target ); ?>');" name="send[<?php echo esc_attr( $picid ); ?>]"><?php esc_html_e( 'Insert into Post', 'wp-google-map-plugin' ); ?></button>
	</div>
	</form>
			<?php
		}

		function media_wpgmp_google_map_svg_icon() {
			wp_enqueue_style( 'media' );
			media_upload_header();
			$form_action_url = site_url( "wp-admin/media-upload.php?type={$GLOBALS['type']}&tab=ell_insert_gmap_svg_tab", 'admin' );
			?>
		
			<style type="text/css">
				#wpgmp-icon-customizer {
					display: flex;
					gap: 20px;
					padding-block: 20px;
				}
				#wpgmp-icon-controls {
					flex: 1;
				}
				#svg_preview_panel {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
					border: 1px solid #ddd;
					padding: 15px;
					background: #f9f9f9;
					text-align: center;
					width: 200px;
					margin-right:20px;
				}
				#svg_preview_panel svg {
					width: auto;
					height: 120px;
				}
				#select_icons .read_icons {
					width: 75px;
					height: 75px;
					border: 1px solid #ccc;
					border-radius: 4px;
					padding: 5px;
					margin: 5px;
					display: flex;
					align-items: center;
					justify-content: center;
					cursor: pointer;
					transition: border 0.3s;
				}
				#select_icons .read_icons.active {
					border: 1px solid #007cba;
				}
				#select_icons .read_icons svg {
					width: 65px;
				}

				#wpgmp-icon-controls .wpgmp-icon-control-list {
					display: flex;
					flex-direction: column;
					gap: 15px;
				}
				#wpgmp-icon-controls .wpgmp-icon-control-item {
					display: flex;
					align-items: center;
					gap: 20px;
				}

				#wpgmp-icon-controls .wpgmp-icon-control-item label {
					font-weight: bold;
					min-width: 80px;
				}

				.fc-quick-filter {
					display: flex;
					flex-wrap: wrap;
					align-items: center;
					gap: 10px;
					margin-bottom: 20px;
				}

				.fc-quick-filter > label {
					display: inline-block;
					font-size: 14px;
					font-weight: 600;
				}
				.fc-quick-filter > .fc-filter-menu {
					background-color: color-mix(in srgb, #4390ff 15%, transparent);
					color: #4390ff;
					padding: 4px 12px 6px;
					font-size: 12px;
					font-weight: 500;
					border-radius: 6px;
					cursor: pointer;
					transition: all 0.2s ease;
				}

				.fc-quick-filter > .fc-filter-menu:is(:hover, :focus, .active) {
					background-color: #4390ff;
					color: #fff;
				}

			</style>
		
			<script type="text/javascript">
			jQuery(document).ready(function($) {
				let selectedSVG = '';
		
				$(document).on("click", ".read_icons", function () {
					$(".read_icons").removeClass('active');
					$(this).addClass('active');
					//selectedSVG = $(this).find('svg').prop('outerHTML');
					selectedSVG = $(this).find('svg').clone();
					updatePreview();
				});
		
				$('#icon_fill_color, #icon_stroke_color, #icon_stroke_width').on('input', updatePreview);

				function updatePreview() {
					if (!selectedSVG) return;

					const fillColor = $('#icon_fill_color').val();
					const strokeColor = $('#icon_stroke_color').val();
					const strokeWidth = $('#icon_stroke_width').val();

					// Clone fresh copy each time
					const $svgClone = selectedSVG.clone();
					// Generate a unique ID to prefix class names
					const uniqueId = 'svg_' + Math.random().toString(36).substr(2, 6);

					// Prefix all class names in the SVG
					$svgClone.find('[class]').each(function () {
						const classList = $(this).attr('class').split(/\s+/).map(cls => `${uniqueId}-${cls}`);
						$(this).attr('class', classList.join(' '));
					});

					// Update <style> block: prefix selectors and apply fill/stroke
					const $styleTag = $svgClone.find('style');
					if ($styleTag.length) {
						let css = $styleTag.html();

						// Prefix all class selectors like `.st0` => `.svg_xyz-st0`
						css = css.replace(/\.(\w[\w-]*)/g, `.${uniqueId}-$1`);

						// Then update fill, stroke, and stroke-width inside CSS
						css = css
							.replace(/fill\s*:\s*[^;]+/gi, `fill: ${fillColor}`)
							.replace(/stroke\s*:\s*[^;]+/gi, `stroke: ${strokeColor}`)
							.replace(/stroke-width\s*:\s*[^;]+/gi, `stroke-width: ${strokeWidth}`);

						$styleTag.html(css);
					}
					
					// Also update inline attributes just in case
					$svgClone.find('[fill]').attr('fill', fillColor);
					$svgClone.find('[stroke]').attr('stroke', strokeColor);
					$svgClone.find('[stroke-width]').attr('stroke-width', strokeWidth);

					// Render to preview
					$('#svg_preview').html($svgClone);
				}

				$('.fc-filter-menu').on('click', function () {
                    const filter = $(this).text().trim().toLowerCase();

                    $('.fc-filter-menu').removeClass('active');
                    $(this).addClass('active');

                    $('#select_icons .read_icons').each(function () {
                        const title = $(this).data('title').toLowerCase();

                        if (filter === 'all') {
                            $(this).show();
                        } else if (title.includes('alpha') && filter === 'alphabets') {
                            $(this).show();
                        } else if (title.includes('digit') && filter === 'digits') {
                            $(this).show();
                        } else if (title.includes('shape') && filter === 'shapes') {
                            $(this).show();
                        } else {
                            $(this).hide();
                        }
                    });
                });

			});
		
			function wpgmp_add_icon_to_images(target) {
				const svg = jQuery('#svg_preview').html();
				if (svg) {
					const win = window.dialogArguments || opener || parent || top;
					win.send_icon_to_map(svg, target);
				} else {
					alert('<?php esc_html_e( 'Choose an SVG marker icon.', 'wp-google-map-plugin' ); ?>');
				}
			}
			</script>
		
			<form enctype="multipart/form-data" method="post" action="<?php echo esc_attr( $form_action_url ); ?>" class="media-upload-form" id="library-form">
				<!-- <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 15px;">
					<h3 style="margin: 0;"><?php esc_html_e( 'Choose SVG Icon', 'wp-google-map-plugin' ); ?></h3>
					<input name="wpgmp_search_icon" id="wpgmp_search_icon" type='text' placeholder="<?php esc_html_e( 'Search icons', 'wp-google-map-plugin' ); ?>" />
				</div> -->

				<div class="fc-quick-filter">
					<label><?php _e('Quick Filter:', 'wpgmp'); ?></label>
					<span class="fc-filter-menu active"><?php _e('All', 'wp-google-map-plugin'); ?></span>
					<span class="fc-filter-menu"><?php _e('Alphabets', 'wp-google-map-plugin'); ?></span>
					<span class="fc-filter-menu"><?php _e('Digits', 'wp-google-map-plugin'); ?></span>
					<span class="fc-filter-menu"><?php _e('Shapes', 'wp-google-map-plugin'); ?></span>
				</div>

		
				<ul style="display: flex; flex-wrap: wrap;" id="select_icons">
					<?php
					$dir = WPGMP_ICONS_DIR;
					$file_display = array('svg');
		
					if (!file_exists($dir)) {
						echo '<li>' . esc_html__('Directory not found:', 'wp-google-map-plugin') . ' ' . esc_html($dir) . '</li>';
					} else {
						$dir_contents = scandir($dir);
						foreach ($dir_contents as $file) {
							$image_data = explode('.', $file);
							$file_type = strtolower(end($image_data));
							if ($file !== '.' && $file !== '..' && in_array($file_type, $file_display)) {
								$svg_content = file_get_contents($dir . '/' . $file);
								echo "<li class='read_icons' data-title='" . esc_attr($image_data[0]) . "'>" . $svg_content . "</li>";
							}
						}
					}
					$target = isset($_GET['target']) ? esc_js($_GET['target']) : '';
					?>
				</ul>
		
				<div id="wpgmp-icon-customizer">
					<div id="wpgmp-icon-controls">
						<h3><?php esc_html_e('Customize Icon', 'wp-google-map-plugin'); ?></h3>
						<div class="wpgmp-icon-control-list">
							<div class="wpgmp-icon-control-item">
								<label><?php esc_html_e('Fill Color:', 'wp-google-map-plugin'); ?></label>
								<input type="color" id="icon_fill_color" value="#D14B4B" />
							</div>
			
							<div class="wpgmp-icon-control-item">
								<label><?php esc_html_e('Stroke Color:', 'wp-google-map-plugin'); ?></label>
								<input type="color" id="icon_stroke_color" value="#000000" />
							</div>
			
							<div class="wpgmp-icon-control-item">
								<label><?php esc_html_e('Stroke Width:', 'wp-google-map-plugin'); ?></label>
								<input type="number" id="icon_stroke_width" style="width:100px" value="0" />
							</div>
			
							<div class="wpgmp-icon-control-item">
								<button type="button" class="button" onclick="wpgmp_add_icon_to_images('<?php echo esc_attr($target); ?>');">
									<?php esc_html_e('Insert into Post', 'wp-google-map-plugin'); ?>
								</button>
							</div>
						</div>
					</div>
		
					<div id="svg_preview_panel">
						<div id="svg_preview"></div>
					</div>
				</div>
			</form>
			<?php
		}
		
		/**
		 * Perform tasks on plugin deactivation.
		 */
		function wpgmp_deactivation() {}

		/**
		 * Perform tasks on plugin deactivation.
		 */
		function wpgmp_activation() {

			global $wpdb;

			// migrate options data from previous version.
			if ( ! get_option( 'wpgmp_settings' ) && get_option( 'wpgmp_language' ) ) {
				$wpgmp_settings['wpgmp_language']      = get_option( 'wpgmp_language', 'en' );
				$wpgmp_settings['wpgmp_api_key']       = get_option( 'wpgmp_api_key', '' );
				$wpgmp_settings['wpgmp_scripts_place'] = get_option( 'wpgmp_scripts_place', true );
				$wpgmp_settings['wpgmp_allow_meta']    = get_option( 'wpgmp_allow_meta', true );
				$wpgmp_settings['wpgmp_scripts_minify']    = get_option( 'wpgmp_scripts_minify', true );
				$wpgmp_settings['wpgmp_version']    = get_option( 'wpgmp_version', WPGMP_VERSION );
				
				update_option( 'wpgmp_settings', $wpgmp_settings );
			}else if(! get_option( 'wpgmp_settings' ) && ! get_option( 'wpgmp_language' )){
				$wpgmp_settings['wpgmp_language']     = 'en';
				$wpgmp_settings['wpgmp_api_key']      = '';
				$wpgmp_settings['wpgmp_version']      = WPGMP_VERSION;
				
				update_option( 'wpgmp_settings', $wpgmp_settings );
			}


			require_once ABSPATH . 'wp-admin/includes/upgrade.php';

			$modules   = $this->modules;
			$pagehooks = array();
			$tables = array();
			if ( is_array( $modules ) ) {
				foreach ( $modules as $module ) {
					$object = new $module();
					if ( method_exists( $object, 'install' ) ) {
								$tables[] = $object->install();
					}
				}
			}

			$tables = array_filter($tables);
			if ( is_array( $tables ) ) {
				foreach ( $tables as $i => $sql ) {
					dbDelta( $sql );
				}
			}

			$this->wpgmp_set_extrafields();
		}

		/**
		 * Eneque scripts at backend overview page only.
		 */
		function wpgmp_overview_page_styles( $hook ) {
			if($hook == 'plugins.php'){
				wp_enqueue_style('wpgmp-modal-css', plugin_dir_url(__FILE__) . 'assets/css/modal.css');
			   if(function_exists('wpgmp_add_feedback_form')){
				   wpgmp_add_feedback_form();
			   }
			}
			
		}

		public static function wpgmp_set_extrafields(){

			$extra_field_val = get_option( 'wpgmp_settings', true );	

			if(!isset($extra_field_val['wpgmp_extrafield_val'])){
				$modelFactory = new WPGMP_Model();
				$location_obj          = $modelFactory->create_object( 'location' );
				$map_locations = $location_obj->fetch();
				if( !empty( $map_locations ) ){
				$extra_field_val['wpgmp_extrafield_val'] = array();
					foreach($map_locations as $loc_val){
						if(isset($loc_val->location_extrafields) && !empty($loc_val->location_extrafields)){
							foreach($loc_val->location_extrafields as $ex_key => $ex_val){
								if(!isset($extra_field_val['wpgmp_extrafield_val'][$ex_key])){
									$extra_field_val['wpgmp_extrafield_val'][$ex_key] = array();
									if(!empty($ex_val)){
										$extra_val_impolode = array_map('trim',explode(',', $ex_val));
										$extra_field_val['wpgmp_extrafield_val'][$ex_key] = $extra_val_impolode;
									}
								}else{	
										
									if(empty($extra_field_val['wpgmp_extrafield_val'][$ex_key])){
										if(!empty($ex_val)){
											$extra_val_impolode = array_map('trim',explode(',', $ex_val));
											$extra_field_val['wpgmp_extrafield_val'][$ex_key] = $extra_val_impolode;
										}
									}else{
										if(!empty($ex_val)){
											$extra_val_impolode = array_map('trim',explode(',', $ex_val));
											$temp_store = $extra_field_val['wpgmp_extrafield_val'][$ex_key];
											foreach($extra_val_impolode as $ev_val){
												if (!in_array(strtolower($ev_val), array_map('strtolower', $temp_store))) {
													$extra_field_val['wpgmp_extrafield_val'][$ex_key][] = $ev_val;
												}
											}
										}
										
									}
									
								}
							}

						}
						
					}
				}

				update_option( 'wpgmp_settings', $extra_field_val );
			}

		}

		/**
		* Define all plugin constants.
		*/
		private function wpgmp_define( $name, $value ) {
			if ( ! defined( $name ) ) {
				define( $name, $value );
			}
		}

		/**
		 * Function calls to define constants.
		 */
		private function wpgmp_define_constants() {

			global $wpdb;
			
			if ( is_admin() )
			$this->wpgmp_define( 'ALLOW_UNFILTERED_UPLOADS', true );
			$this->wpgmp_define( 'WPGMP_SLUG', 'wpgmp_view_overview' );
			$this->wpgmp_define( 'WPGMP_VERSION', '4.8.3' );
			$this->wpgmp_define( 'WPGMP_FOLDER', basename( dirname( __FILE__ ) ) );
			$this->wpgmp_define( 'WPGMP_DIR', plugin_dir_path( __FILE__ ) );
			$this->wpgmp_define( 'WPGMP_ICONS_DIR', WPGMP_DIR . '/assets/images/icons/' );
			$this->wpgmp_define( 'WPGMP_CORE_CLASSES', WPGMP_DIR . 'core/' );
			$this->wpgmp_define( 'WPGMP_PLUGIN_CLASSES', WPGMP_DIR . 'classes/' );
			$this->wpgmp_define( 'WPGMP_TEMPLATES', WPGMP_DIR . 'templates/' );
			$this->wpgmp_define( 'WPGMP_MODEL', WPGMP_DIR . 'modules/' );
			$this->wpgmp_define( 'WPGMP_CONTROLLER', WPGMP_CORE_CLASSES );
			$this->wpgmp_define( 'WPGMP_URL', plugin_dir_url( WPGMP_FOLDER ) . WPGMP_FOLDER . '/' );
			$this->wpgmp_define( 'WPGMP_TEMPLATES_URL', WPGMP_URL . 'templates/' );
			$this->wpgmp_define( 'WPGMP_CSS', WPGMP_URL . 'assets/css/' );
			$this->wpgmp_define( 'WPGMP_JS', WPGMP_URL . 'assets/js/' );
			$this->wpgmp_define( 'WPGMP_IMAGES', WPGMP_URL . 'assets/images/' );
			$this->wpgmp_define( 'WPGMP_ICONS', WPGMP_URL . 'assets/images/icons/' );
			$this->wpgmp_define( 'TBL_LOCATION', $wpdb->prefix . 'map_locations' );
			$this->wpgmp_define( 'TBL_GROUPMAP', $wpdb->prefix . 'group_map' );
			$this->wpgmp_define( 'TBL_MAP', $wpdb->prefix . 'create_map' );
			$this->wpgmp_define( 'TBL_ROUTES', $wpdb->prefix . 'map_routes' );


		}
		
		public static function wpgmp_get_version_number(){	return WPGMP_VERSION; }
		
		
		/**
		 * Load all required core classes.
		 */
		private function wpgmp_load_files() {

			$coreInitialisationFile = plugin_dir_path( __FILE__ ) . 'core/class.initiate-core.php';
			if ( file_exists( $coreInitialisationFile ) ) {
				require_once $coreInitialisationFile;
			}

			// Load Plugin Files
			$plugin_files_to_include = array(
				'wpgmp-pro-feature-ui.php',
				'wpgmp-integration-form.php',
				'wpgmp-helper.php',
				'wpgmp-template.php',
				'wpgmp-controller.php',
				'wpgmp-model.php',
				'wpgmp-map-widget.php',
				'wpgmp-visual-composer.php',
				'wpgmp-maps-importer.php',
				'wpgmp-check-cookies.php',
				'wpgmp-temp-access.php',
				'wpgmp-feedback-form.php'
			);
		
			foreach ( $plugin_files_to_include as $file ) {

				if ( file_exists( WPGMP_PLUGIN_CLASSES . $file ) ) {
					require_once WPGMP_PLUGIN_CLASSES . $file;
				}
			}
			// Load all modules.
			$core_modules = array( 'overview', 'group_map','location', 'map', 'route', 'drawing', 'permissions', 'settings', 'tools', 'post', 'extentions','integration' );

			$core_modules = apply_filters('wpgmp_modules_to_load',$core_modules);

			if ( is_array( $core_modules ) ) {
				foreach ( $core_modules as $module ) {

					$file = WPGMP_MODEL . $module . '/model.' . $module . '.php';

					$file = apply_filters('fc_backend_module_path_load', $file ,$module );

					if ( file_exists( $file ) ) {
						include_once $file;
						$class_name = 'WPGMP_Model_' . ucwords( $module );
						array_push( $this->modules, $class_name );
					}
				}
			}

		}
	}
}

new WPGMP_Google_Maps_Lite();