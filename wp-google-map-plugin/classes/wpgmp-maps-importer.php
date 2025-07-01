<?php

if ( ! defined( 'ABSPATH' ) ) {
	die( 'You are not allowed to call this page directly.' );
}

if ( ! class_exists( 'WPGMP_Maps_Importer' ) ) {

	class WPGMP_Maps_Importer {

		/*
		* Class Vars
		*
		*/  	
		private $wpgmp_data = array();
		private $wpgmp_settings = '';
		private $allow_url_fopen = false;
		private $curl = false;
		private $notification = '';
		private $response = array();
		private $group_map_data;
		private $location_data;
		private $map_data;
		private $routes_data;
		private $settings;  
		private $location_extrafields;
		private $wpgmp_widget_settings;
		private $extra_data;
		private $source_website;
		private $is_source_multisite;
		private $source_site_id;
		private $mapping_data = array();
		private $files_to_migrate;
		private $proceed = false;
		private $googlemapsMissing;
		private $migratedImages = 0;
		private $current_operation = '';
		
		public function __construct() { 
			
			
			$this->wpgmp_settings = maybe_unserialize( get_option( 'wpgmp_settings' ) );
			
			if( is_admin() ){
				add_action( 'admin_menu', array($this,'wpgmm_migrate_map_settings'),100);
				add_action( 'admin_init', array($this,'wpgmm_handle_migration'),100);
				add_action( 'admin_footer', array($this,'wpgmm_handle_custom'),100);
				add_action( 'admin_head', array($this,'wpgmm_action_head'));
				
			}

		}
		
				
		function wpgmm_check_security_authentication(){
			
			//Permission Authentication
            if ( ! current_user_can( 'manage_options' ) ) {
                 die( 'You are not allowed to make changes' );
            }
                
			//Nonce Verification
			if ( !isset( $_REQUEST['_wpnonce'] ) ) {
				 die( 'You are not allowed to make changes' );
			}
			$nonce = sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) );
			if ( !empty( $nonce ) &&  ! wp_verify_nonce( $nonce, 'wpgmp-nonce' ) ) {
				 die( 'You are not allowed to make changes' );
			}

		}
		
		
		function wpgmm_handle_migration(){
			
			$this->wpgmp_settings = maybe_unserialize( get_option( 'wpgmp_settings' ) );
			if( !empty( ini_get('allow_url_fopen') ) && ini_get('allow_url_fopen') == '1') {
				$this->allow_url_fopen  = true;
			}else if( in_array ('curl', get_loaded_extensions()) ){
				$this->curl  = true;
			}
			
			
			if( isset($_POST['wpgmp_do_images_migration']) && !empty($_POST['wpgmp_do_images_migration']) ) {
					
					$this->wpgmm_check_security_authentication();
					$this->files_to_migrate = maybe_unserialize( get_option('wpgmm_location_images') );
					$this->wpgmm_migrate_images();
					if( $this->migratedImages == '0' ){
						
						$this->response['success'] = esc_html__( 'All images are already present now in wordpress uploads. Please refresh maps page and cross check images. Migration process of images is complete.', 'wp-google-map-plugin' );
						
					}else{
						$this->response['success'] = sprintf( __( 'Missing %s image(s) has been imported successfully.', 'wp-google-map-plugin' ), $this->migratedImages );
					}
					return;
					
			}
			
			if(isset($_POST['wpgmp_do_map_migration']) && !empty($_POST['wpgmp_do_map_migration'])) {
			
				$this->wpgmm_check_security_authentication();
				$proceed = true; 

				if(empty($_FILES['wpgmp_map_import_control']['tmp_name'])){
					$this->response['error'] = esc_html__( 'Please upload the original backup .txt file that was exported from the target site as backup.', 'wp-google-map-plugin' );
					$proceed = false;
				}
				$allowed = array('txt');
				$filename = $_FILES['wpgmp_map_import_control']['name'];
				$ext = pathinfo($filename, PATHINFO_EXTENSION);
				if ( !empty($_FILES['wpgmp_map_import_control']['tmp_name']) && !in_array($ext, $allowed) ) {
					$this->response['error'] = esc_html__( 'The uploaded file is not valid .txt file that was exported and downloaded as map code file. Please upload the downloaded .txt file only that contains the map code.', 'wp-google-map-plugin' );
					$proceed = false;
				}
				
				if(!$proceed)
				return;
				
				$this->response['success'] = esc_html__( 'Map was successfully imported on your website. Please navigate to Manage Maps screen.', 'wp-google-map-plugin' );
				
				$decrypted_data = maybe_unserialize( base64_decode( file_get_contents($_FILES['wpgmp_map_import_control']['tmp_name']) ) );
				
				
				$this->location_data = $decrypted_data['location']; 
				$this->group_map_data = $decrypted_data['group_map']; 
				$this->routes_data = $decrypted_data['route']; 
				$this->map_data = $decrypted_data['map'];
				$this->settings = $decrypted_data['settings'];
				$this->location_extrafields = $decrypted_data['location_extrafields'];
				$this->wpgmp_widget_settings = $decrypted_data['wpgmp_widget_settings'];
				$this->extra_data = ( isset($decrypted_data['extra_data']) && !empty($decrypted_data['extra_data']) ) ? $decrypted_data['extra_data'] : '';
				$this->source_website = (isset($decrypted_data['source_website'])) ? $decrypted_data['source_website'] : '';
				$this->is_source_multisite = (isset($decrypted_data['is_multisite'])) ? $decrypted_data['is_multisite'] : '';
				$this->source_site_id = (isset($decrypted_data['source_site_id'])) ? $decrypted_data['source_site_id'] : '';
							
				if(!empty($location_data) && !is_array($location_data)){
				   $this->location_data  = maybe_unserialize( base64_decode( $location_data ) );
				}
				if(!empty($group_map_data) && !is_array($group_map_data)){
				   $this->group_map_data  = maybe_unserialize( base64_decode( $group_map_data ) );
				}
				if(!empty($routes_data) && !is_array($routes_data)){
				   $this->routes_data  = maybe_unserialize( base64_decode( $routes_data ) );
				}
				if(!empty($map_data) && !is_array($map_data)){
				   $this->map_data  = maybe_unserialize( base64_decode( $map_data ) );
				}
				if(!empty($settings) && !is_array($settings)){
				   $this->settings  = maybe_unserialize( base64_decode( $settings ) );
				}
				if(!empty($location_extrafields) && !is_array($location_extrafields)){
				   $this->location_extrafields  = maybe_unserialize( base64_decode( $location_extrafields ) );
				}
				if(!empty($wpgmp_widget_settings) && !is_array($wpgmp_widget_settings)){
				   $this->wpgmp_widget_settings  = maybe_unserialize( base64_decode( $wpgmp_widget_settings ) );
				}
				if(!empty($extra_data) && !is_array($extra_data)){
				   $this->extra_data  = maybe_unserialize( base64_decode( $extra_data ) );
				}
				if(!empty($source_website) && !is_array($source_website)){
				   $this->source_website  = maybe_unserialize( base64_decode( $source_website ) );
				}
				
				$this->wpgmm_migrate_settings();
				$this->wpgmm_migrate_group_maps();
				$this->wpgmm_migrate_locations();
				$this->wpgmm_migrate_routes();
				$this->wpgmm_migrate_maps();
				$this->wpgmm_migrate_images();
				
			}
			
		}
		
		function wpgmm_migrate_settings(){
			
			//Migrate Settings
			if( class_exists( 'WPGMP_Model_Settings' ) ){
				
				$settingsObj = new WPGMP_Model_Settings();
				if(!empty($settingsObj)) {
					
					$settings = (array)$this->wpgmp_settings;
					$settings['location_extrafields'] = maybe_unserialize($this->location_extrafields);
					$settings['_wpnonce'] = $_POST['_wpnonce'];
					$_POST = $settings;
					$settingsObj->save();
					update_option( 'widget_wpgmp_google_map_widget_class', maybe_unserialize($this->wpgmp_widget_settings) );
					
				}
				
			}
			
		}
				
		function wpgmm_migrate_group_maps(){
			
			global $wpdb;

			//Migrate Categories
			if( class_exists( 'WPGMP_Model_Group_Map' ) ){
				
				$categoryObj = new WPGMP_Model_Group_Map();
				if(!empty($this->group_map_data)) {
					foreach($this->group_map_data as $category){
						
						$category = (array)$category;
						$category['extensions_fields'] = maybe_unserialize($category['extensions_fields']);
						$category['group_marker'] = str_replace( $this->extra_data['source_website'] , home_url(), $category['group_marker']);
						$category['_wpnonce'] = $_POST['_wpnonce'];
						$_POST = $category;
						$response = $categoryObj->save();
						$this->mapping_data['old_and_new_group'][$category['group_map_id']] = $response['last_db_id'];
							
					}

					//Map the parent categories also once new categories are created. Parent category mapping should be done like source site.
					foreach($this->group_map_data as $category){
						
						$category = (array)$category;
						
						if($category['group_parent'] == 0)
						continue;

						$old_cat_to_be_updated = $category['group_parent'];
						$new_cat_to_be_updated = @$this->mapping_data['old_and_new_group'][$old_cat_to_be_updated];
						$oldkey = array_search($this->mapping_data['old_and_new_group'][$category['group_map_id']], $this->mapping_data['old_and_new_group']); 
						
						$wpdb->update(
						    $wpdb->prefix .'group_map',
						    array( 
						        'group_parent' => $new_cat_to_be_updated
						    ),
						    array(
						        'group_map_id' => $this->mapping_data['old_and_new_group'][$oldkey]
						    )
						);

					}
				}
				
			}
			
		}
		
		function wpgmm_migrate_locations(){
			
			//Migrate Locations
			if( class_exists( 'WPGMP_Model_Location' ) ){
				
				$locationObj = new WPGMP_Model_Location();
				if(!empty($this->location_data)) {
					
					if(!is_multisite() && !$this->is_source_multisite){
						
						$home_url_to_replace = home_url();
						$source_url_to_replace = $this->extra_data['source_website'];
						
					}else if(is_multisite() && !$this->is_source_multisite) {
						
						$home_url_to_replace = home_url().'/wp-content/uploads/sites/'.get_current_blog_id();
						$source_url_to_replace = $this->extra_data['source_website'].'/wp-content/uploads';
						
					}else if(!is_multisite() && $this->is_source_multisite){
						
						$home_url_to_replace = home_url().'/wp-content/uploads';
						$source_url_to_replace = $this->extra_data['source_website'].'/wp-content/uploads/sites/'.$this->source_site_id;
						
					}else if(is_multisite() && $this->is_source_multisite){
						
						$home_url_to_replace = home_url().'/wp-content/uploads/sites/'.get_current_blog_id();
						$source_url_to_replace = $this->extra_data['source_website'].'/wp-content/uploads/sites/'.$this->source_site_id;
						
					}
						
					foreach($this->location_data as $location){
						
						$location = (array)$location;
						$location['location_settings'] = maybe_unserialize($location['location_settings']);
						$location['location_group_map'] = maybe_unserialize($location['location_group_map']);
						$location['location_extrafields'] = maybe_unserialize($location['location_extrafields']);
						$this->files_to_migrate[] = $location['location_settings']['featured_image'];
						
						if(!empty($location['location_settings']['featured_image'])) {
							
							if ( strpos($location['location_settings']['featured_image'], $this->extra_data['source_website']  ) !== false ) {
								
								$location['location_settings']['featured_image'] = str_replace( $source_url_to_replace , $home_url_to_replace, $location['location_settings']['featured_image']);
								
							}else{
								
								if ( strpos( $location['location_settings']['featured_image'], 'https' ) === false && strpos( $this->extra_data['source_website'], 'https' ) !== false ) {
									
									$location['location_settings']['featured_image'] = str_replace( 'http','https',$location['location_settings']['featured_image']);
									$location['location_settings']['featured_image'] = str_replace( $source_url_to_replace , $home_url_to_replace ,$location['location_settings']['featured_image']);
									
								}
								
							}
							
						}
						
						$new_group_map_ids = array();
						foreach($location['location_group_map'] as $old_id){
							$new_group_map_ids[] = $this->mapping_data['old_and_new_group'][$old_id];
						}
						$location['location_group_map'] = $new_group_map_ids;
						$location['_wpnonce'] = $_POST['_wpnonce'];
						$_POST = $location;
						$response = $locationObj->save();
						$this->mapping_data['old_and_new_location'][$location['location_id']] = $response['last_db_id'];
							
					}
				}
				
			}
			
			update_option('wpgmm_location_images',$this->files_to_migrate);
			
		}
		
		function wpgmm_migrate_routes(){
			
			//Migrate Routes
			if( class_exists( 'WPGMP_Model_Route' ) ){
				
				$routeObj = new WPGMP_Model_Route();
				
				if(!empty($this->routes_data)) {
					foreach($this->routes_data as $route){
													
						$route = (array)$route;
						$route['route_way_points'] = maybe_unserialize($route['route_way_points']);
						$route['route_way_points'] = implode(',',$route['route_way_points']);
						$route['_wpnonce'] = $_POST['_wpnonce'];
						if(!empty($route['route_start_location'])){
							$route['route_start_location'] = $this->mapping_data['old_and_new_location'][$route['route_start_location']];
						}
						if(!empty($route['route_end_location'])) {
							$route['route_end_location'] = $this->mapping_data['old_and_new_location'][$route['route_end_location']];
						}
						
						if(!empty($route['route_way_points'])) {
							
							$new_assigned_locations = array();	
							$route['route_way_points'] = explode(',',$route['route_way_points']);
							foreach($route['route_way_points'] as $old_id){
								$new_assigned_locations[] = $this->mapping_data['old_and_new_location'][$old_id];
							}
							$route['route_way_points'] = implode(',',$new_assigned_locations);
						
						}
						$_POST = $route;
						$response = $routeObj->save();
						$this->mapping_data['old_and_new_routes'][$route['route_id']] = $response['last_db_id'];
							
					}
				}
				
			}
				
			
		}
		
		function wpgmm_migrate_maps(){
			
			//Migrate Maps
			if( class_exists( 'WPGMP_Model_Map' ) ){
				
				$mapObj = new WPGMP_Model_Map();
				
				if(!empty($this->map_data)) {

					$map = 	$this->map_data;			
					$map = (array)$map;
					$map['map_street_view_setting'] = maybe_unserialize($map['map_street_view_setting']);
					$map['map_route_direction_setting'] = maybe_unserialize($map['map_route_direction_setting']);
					$map['map_all_control'] = maybe_unserialize($map['map_all_control']);
					$map['style_google_map'] = maybe_unserialize($map['style_google_map']);
					$map['map_locations'] = maybe_unserialize($map['map_locations']);
					$map['map_layer_setting'] = maybe_unserialize($map['map_layer_setting']);
					$map['map_cluster_setting'] = maybe_unserialize($map['map_cluster_setting']);
					$map['map_overlay_setting'] = maybe_unserialize($map['map_overlay_setting']);
					$map['map_geotags'] = maybe_unserialize($map['map_geotags']);
					$map['_wpnonce'] = $_POST['_wpnonce'];
					
					$new_map_locations = array();
					if(!empty($map['map_locations'])){
						foreach($map['map_locations'] as $old_map_id){
							$new_map_locations[] = $this->mapping_data['old_and_new_location'][$old_map_id];
						}
						$map['map_locations'] = $new_map_locations;
					}
					
					$new_map_routes = array();
					if(!empty($map['map_route_direction_setting']['specific_routes'])) {
						foreach($map['map_route_direction_setting']['specific_routes'] as $old_id){
							$new_map_routes[] = $this->mapping_data['old_and_new_routes'][$old_id];
						}
					}
					$map['map_route_direction_setting']['specific_routes'] = $new_map_routes;
					$_POST = $map;
					$mapObj->save();
							
					
				}
				
			}
			
		}
		
		function wpgmm_migrate_images(){
			
			//Migrate Images
			$uploads = wp_upload_dir();
			if( $this->allow_url_fopen ) {
				
				$this->files_to_migrate = array_filter($this->files_to_migrate);
				
				if(isset($this->files_to_migrate) && !empty($this->files_to_migrate)) {
					foreach($this->files_to_migrate as $url){
							
						$imageinfo = explode('/',$url);
						$month = $imageinfo[count($imageinfo)-2];
						$year = $imageinfo[count($imageinfo)-3];
						$upload_path = $uploads['basedir'].'/'.$year.'/'.$month.'/'.end($imageinfo);
						
						if( !is_dir($uploads['basedir'].'/'.$year.'/'.$month) )   {
							wp_mkdir_p( $uploads['basedir'].'/'.$year.'/'.$month );
						}
						if( is_dir($uploads['basedir'].'/'.$year.'/'.$month) ){
							
							if ( file_exists( $uploads['basedir'].'/'.$year.'/'.$month.'/'.basename($url) ) ) {
								continue;   
							}else{
							
								$file_content = file_get_contents($url);
								file_put_contents( $upload_path, $file_content );
								$this->migratedImages++;
								
							}

						}
						
					}
				}
			}
		}
		
		function wpgmm_get_complete_data(){
			
			$wpgmp_settings = get_option( 'wpgmp_settings', true );
			$wpgmp_location_extrafields = get_option( 'wpgmp_location_extrafields', true );
			$wpgmp_widget_settings = get_option( 'widget_wpgmp_google_map_widget_class', true );
			$modelFactory = new WPGMP_Model();
			
			$location_obj = $modelFactory->create_object( 'location' );
			$all_location_data = $location_obj->fetch();
			if(!empty($all_location_data)) {
				$this->wpgmp_data['location'] = $all_location_data;
			}
			
			$category_obj = $modelFactory->create_object( 'group_map' );
			$categories   = $category_obj->fetch();
			if(!empty($categories)) {
				$this->wpgmp_data['group_map'] = $categories;
			}
			
			$route_obj = $modelFactory->create_object( 'route' );
			$routes   = $route_obj->fetch();
			if(!empty($routes)) {
				$this->wpgmp_data['route'] = $routes;
			}
			
			$map_obj = $modelFactory->create_object( 'map' );
			$maps   = $map_obj->fetch();
			if(!empty($maps)) {
				$this->wpgmp_data['map'] = $maps;
			}
			
			if(!empty($wpgmp_settings)) {
				$this->wpgmp_data['settings'] = maybe_unserialize($wpgmp_settings);
			}
			
			if(!empty($wpgmp_location_extrafields)) {
				$this->wpgmp_data['location_extrafields'] = maybe_unserialize($wpgmp_location_extrafields);
			}
			
			if(!empty($wpgmp_widget_settings)) {
				$this->wpgmp_data['wpgmp_widget_settings'] = maybe_unserialize($wpgmp_widget_settings);
			}
			
			if(!empty($this->wpgmp_data)) {
				$this->wpgmp_data['extra_data']['source_website'] = home_url();
			}
			
			if(is_multisite()){
				$this->wpgmp_data['is_multisite'] = true;
				$this->wpgmp_data['source_site_id'] = get_current_blog_id();
			}
			
			if(!empty($this->wpgmp_data))
			$this->wpgmp_data = base64_encode( serialize( $this->wpgmp_data ) );
			else
			$this->wpgmp_data = '';
			
		}	
		
		function wpgmm_settings_page() {

			global $wpdb;
			$modelFactory = new WPGMP_Model();
			$mapobj       = $modelFactory->create_object( 'map' );
			$map_records  = $mapobj->fetch();
			
			//Permission Authentication
			if ( ! current_user_can( 'manage_options' ) ) {
				die( 'You are not allowed to make changes' );
			}
							
			$form = new WPGMP_Template();
			
			$form->set_header( esc_html__( 'Import Maps Easily', 'wp-google-map-plugin' ), $this->response, $accordion = true );
			
			$form->add_element(
                'group', 'migration_settings', array(
                'value'  => esc_html__( 'Import Live Demos', 'wp-google-map-plugin' ),
                'before' => '<div class="fc-12">',
                'after' => '</div>',
				'tutorial_link' > 'https://www.wpmapspro.com/docs/how-to-export-a-live-demo-and-import-it-to-your-website/' ,
				"pro" => true        
            ));

			$form->form_id = 'wpgmp_complete_migration_form';
						

			$form->add_element(
			'file', 'wpgmp_map_import_control', array(
				'label'         => esc_html__( 'Upload Map Code File', 'wp-google-map-plugin' ),
				'default_value' => 'true',
				'value'	=> 	'true',
				'desc'  => esc_html__( 'Please upload the map code file that you have downloaded from wpmapspro.com website\'s live demo page.', 'wp-google-map-plugin' ),
				'class'         => 'file_input form-control wpgmp_data_migration_option_import_wpgmp_process wpgmp_data_migration_option',
				'id'            => 'wpgmp_map_import_control'
				)
			);
			
			$form->add_element(
				'submit', 'wpgmp_do_map_migration', array( 'value' => esc_html__( 'Import Map', 'wp-google-map-plugin' ),'pro' => true )
			);
			
			if(isset($_GET['devmode']) && $_GET['devmode'] == 'yes'){
				
				$form->add_element(
					'submit', 'wpgmp_do_images_migration', array( 'value' => esc_html__( 'Migrate Images Again', 'wp-google-map-plugin' ) )
				);
				
		 	}
				
			$form->render();	
							
		}

		
		function wpgmm_migrate_map_settings() {

			$style_editor = add_submenu_page(
				'wpgmp_view_overview',
				esc_html__( 'Import Maps','wp-google-map-plugin' ),
				esc_html__( 'Import Maps','wp-google-map-plugin' ),
				'manage_options',
				'wpgmp_map_import',
				array($this,'wpgmm_settings_page')
			);

			add_action( 'load-'.$style_editor, array($this,'wpgmm_required_resources' ) );

		}
		
		function wpgmm_required_resources(){ 
			 
			if(class_exists('WPGMP_Helper')) {
				
				WPGMP_Helper::wpgmp_register_map_backend_resources();
			}
			
		}
		
		function wpgmm_action_head(){ ?>
			<style>.wp-google-map-pro_page_wpgmp_complete_migration input[name="wpgmp_complete_json_download"]{display:none;}</style>
		<?php }
		
		
        
		function wpgmm_handle_custom() { 
		?>
		<script>
			jQuery(document).ready(function($) {
			   
			  $('.wpgmp_import_export_switch').change(function(){ 
				var value = $( 'input[name=wpgmp_import_export_switch]:checked' ).val();
				if(value == 'export_wpgmp_process'){
					$('input[name="wpgmp_do_map_migration"]').hide();
					$('input[name="wpgmp_complete_json_download"]').show();
					$('.wpgmm_upload_control').hide();
				}else{
					$('input[name="wpgmp_complete_json_download"]').hide();
					$('input[name="wpgmp_do_map_migration"]').show();
					$('.wpgmm_upload_control').show();
				}
			  });
			  $('#wpgmp_map_import_control').closest('.fc-form-group ').addClass('wpgmm_upload_control');
			  
			});
			
		</script>
		<?php
			
		}
		
		

		
	}

	return new WPGMP_Maps_Importer();

}
