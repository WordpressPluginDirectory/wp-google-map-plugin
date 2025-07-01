<?php
/**
 * Class: WPGMP_Model_Map
 *
 * @author Flipper Code <hello@flippercode.com>
 * @version 3.0.0
 * @package Maps
 */

if ( ! class_exists( 'WPGMP_Model_Map' ) ) {

	/**
	 * Map model for CRUD operation.
	 *
	 * @package Maps
	 * @author Flipper Code <hello@flippercode.com>
	 */
	class WPGMP_Model_Map extends FlipperCode_Model_Base {
		/**
		 * Validations on route properies.
		 *
		 * @var array
		 */
		protected $validations;

		/**
		 * Generate SQL query.
		 *
		 * @var string
		 */
		protected $query;
		
		/**
		 * Intialize map object.
		 */
		function __construct() {
			$this->validations = array(
				'map_title'  => array(
					'req' => esc_html__('Please enter map title.','wp-google-map-plugin'),
					'max=255' => esc_html__('Map title cannot contain more than 255 characters.','wp-google-map-plugin')
				),
				'map_height' => array(
					'req' => esc_html__('Please enter map height.','wp-google-map-plugin'),
					'num' => esc_html__('Please enter only numeric value for map height in pixels.','wp-google-map-plugin')
				)
			);
			$this->table  = TBL_MAP;
			$this->unique = 'map_id';
		}
		/**
		 * Admin menu for CRUD Operation
		 *
		 * @return array Admin menu navigation(s).
		 */
		function navigation() {
			$nav = array(
				'wpgmp_form_map'   => esc_html__( 'Add Map', 'wp-google-map-plugin' ),
				'wpgmp_manage_map' => esc_html__( 'Manage Maps', 'wp-google-map-plugin' ),
			);
			return apply_filters('wpgmp_map_navigation', $nav);
		}
		/**
		 * Install table associated with map entity.
		 *
		 * @return string SQL query to install create_map table.
		 */
		function install() {
			global $wpdb;
			$charset_collate = $wpdb->get_charset_collate();

			$create_map = 'CREATE TABLE ' . $wpdb->prefix . 'create_map (
			map_id int(11) NOT NULL AUTO_INCREMENT,
			map_title varchar(255) DEFAULT NULL,
			map_width varchar(255) DEFAULT NULL,
			map_height varchar(255) DEFAULT NULL,
			map_zoom_level varchar(255) DEFAULT NULL,
			map_type varchar(255) DEFAULT NULL,
			map_scrolling_wheel varchar(255) DEFAULT NULL,
			map_visual_refresh varchar(255) DEFAULT NULL,
			map_45imagery varchar(255) DEFAULT NULL,
			map_street_view_setting text DEFAULT NULL,
			map_route_direction_setting text DEFAULT NULL,
			map_all_control text DEFAULT NULL,
			map_info_window_setting text DEFAULT NULL,
			style_google_map text DEFAULT NULL,
			map_locations longtext DEFAULT NULL,
			map_layer_setting text DEFAULT NULL,
			map_polygon_setting longtext DEFAULT NULL,
			map_polyline_setting longtext DEFAULT NULL,
			map_cluster_setting text DEFAULT NULL,
			map_overlay_setting text DEFAULT NULL,
			map_geotags text DEFAULT NULL,
			map_infowindow_setting text DEFAULT NULL,
			PRIMARY KEY  (map_id)
			) '.$charset_collate.';';

			return $create_map;
		}

		public function wpgmp_array_map( $element ) {
			return $element['slug']; }

		public function clear_empty_array_values( $array ) {

			foreach ( $array as $k => &$v ) {

				if ( $k == 'extra_fields' ) {
					continue;
				}

				if ( is_array( $v ) ) {
					$v = $this->clear_empty_array_values( $v );
					if ( ! sizeof( $v ) ) {
						unset( $array[ $k ] );
					}
				} elseif ( ! is_object( $v ) and ! @strlen( $v ) and ! is_bool( $v ) ) {
					unset( $array[ $k ] );
				}
			}
			return $array;

		}

		public function replace_values($find,$replacements) {
			return isset($replacements[$find]) ? $replacements[$find] : $find;
		}

		public function find_font( $element ) {

			if ( strpos( $element, 'font-family' ) !== false ) {
				$f_family = str_replace( 'font-family:', '', $element );
				if ( strpos( $f_family, 'Open Sans' ) === false ) {
					return $f_family;
				}
			}

		}
		/**
		 * Get Map(s)
		 *
		 * @param  array $where  Conditional statement.
		 * @return array         Array of Map object(s).
		 */
		public function fetch($where = array()) {
			$results = $this->get($this->table, $where);
			return apply_filters('wpgmp_map_results', $results, $where);
		}
		/**
		 * Add or Edit Operation.
		 */
		function save() {

			global $_POST;
			$data     = array();
			$entityID = '';


			//Nonce Verification
			if( !isset( $_REQUEST['_wpnonce'] ) || ( isset( $_REQUEST['_wpnonce'] ) && empty($_REQUEST['_wpnonce']) ) )
			die( 'You are not allowed to save changes!' );
			if ( isset( $_REQUEST['_wpnonce'] ) && ! wp_verify_nonce( $_REQUEST['_wpnonce'], 'wpgmp-nonce' ) )
			die( 'You are not allowed to save changes!' );
		

			if ( ! isset( $_POST['wpgmp_import_code'] ) or $_POST['wpgmp_import_code'] == '' ) {
				$this->verify( $_POST );
			}
			
			$this->errors = apply_filters('wpgmp_map_validation',$this->errors,$_POST);
			
			foreach(['smartphones','ipads','large-screens'] as $screen){

				if(isset($_POST['map_all_control']['screens'][$screen]['map_width_mobile']) && !empty($_POST['map_all_control']['screens'][$screen]['map_width_mobile'])){
					if(!is_numeric($_POST['map_all_control']['screens'][$screen]['map_width_mobile']))
					$this->errors[] = esc_html__( 'Please enter the map width in numeric pixel value only under screen settings section.', 'wp-google-map-plugin' );	
				}
				if(isset($_POST['map_all_control']['screens'][$screen]['map_height_mobile']) && !empty($_POST['map_all_control']['screens'][$screen]['map_height_mobile'])){
					if(!is_numeric($_POST['map_all_control']['screens'][$screen]['map_height_mobile']))
					$this->errors[] = esc_html__( 'Please enter the map height in numeric pixel value only under Screen Settings section.', 'wp-google-map-plugin' );	
				}

			}

			if(isset($_POST['map_width']) && !empty($_POST['map_width'])){
                $map_width = str_replace("%","",$_POST['map_width']);
                if(!is_numeric($map_width)) {
                    $this->errors[] = esc_html__( 'Please enter a numeric value for pixel widths and specify it with a % sign if you want it to be treated as a percentage (e.g., 90%). If you prefer to display the map at full width, you can leave the field blank to default to 100% width.', 'wp-google-map-plugin' );
                }
            }


			
			if(isset($_POST['map_all_control']['center_circle_fillopacity']) && !empty($_POST['map_all_control']['center_circle_fillopacity']) ){

				if(!is_numeric($_POST['map_all_control']['center_circle_fillopacity'])){
					$this->errors[] = esc_html__( 'Please enter a numeric value for circle fill opacity under the Map\'s Center > Display Circle section.', 'wp-google-map-plugin' );		
				}else if( !($_POST['map_all_control']['center_circle_fillopacity'] >= 0 && $_POST['map_all_control']['center_circle_fillopacity'] <=1) ){
					$this->errors[] = esc_html__( 'The numeric value for circle fill opacity under the Map\'s Center > Display Circle section must be a valid float value between 0 to 1.', 'wp-google-map-plugin' );
				}
				
			}

			if(isset($_POST['map_all_control']['center_circle_strokeopacity']) && !empty($_POST['map_all_control']['center_circle_strokeopacity']) && !is_numeric($_POST['map_all_control']['center_circle_strokeopacity'])){

				if(!is_numeric($_POST['map_all_control']['center_circle_strokeopacity'])){
					$this->errors[] = esc_html__( 'Please enter a numeric value for circle stroke opacity under the Map\'s Center > Display Circle section.', 'wp-google-map-plugin' );
				}else if( !($_POST['map_all_control']['center_circle_strokeopacity'] >= 0 && $_POST['map_all_control']['center_circle_strokeopacity'] <=1) ){
					$this->errors[] = esc_html__( 'The numeric value for circle stroke opacity under the Map\'s Center > Display Circle section must be a valid float value between 0 to 1.', 'wp-google-map-plugin' );
				}
				
			}

			if(isset($_POST['map_all_control']['center_circle_strokeweight']) && !empty($_POST['map_all_control']['center_circle_strokeweight']) && !is_numeric($_POST['map_all_control']['center_circle_strokeweight'])){
				$this->errors[] = esc_html__( 'Please enter a numeric value for circle stroke weight under the Map\'s Center > Display Circle section.', 'wp-google-map-plugin' );
			}
			if(isset($_POST['map_all_control']['center_circle_radius']) && !empty($_POST['map_all_control']['center_circle_radius']) && !is_numeric($_POST['map_all_control']['center_circle_radius'])){
				$this->errors[] = esc_html__( 'Please enter a numeric value for circle\'s radius under the Map\'s Center > Display Circle section.', 'wp-google-map-plugin' );
			}


			if(isset($_POST['map_overlay_setting']['overlay_width']) && !empty($_POST['map_overlay_setting']['overlay_width']) && !is_numeric($_POST['map_overlay_setting']['overlay_width'])){
				$this->errors[] = esc_html__( 'Please enter the overlay width in numeric pixel value only the under Overlay Settings section.', 'wp-google-map-plugin' );
			}
			if(isset($_POST['map_overlay_setting']['overlay_height']) && !empty($_POST['map_overlay_setting']['overlay_height']) && !is_numeric($_POST['map_overlay_setting']['overlay_height'])){
				$this->errors[] = esc_html__( 'Please enter the overlay height in numeric pixel value only the under Overlay Settings section.', 'wp-google-map-plugin' );
			}
			if(isset($_POST['map_overlay_setting']['overlay_fontsize']) && !empty($_POST['map_overlay_setting']['overlay_fontsize']) && !is_numeric($_POST['map_overlay_setting']['overlay_fontsize'])){
				$this->errors[] = esc_html__( 'Please enter the font size in numeric pixel value only the under Overlay Settings section.', 'wp-google-map-plugin' );
			}
			if(isset($_POST['map_overlay_setting']['overlay_border_width']) && !empty($_POST['map_overlay_setting']['overlay_border_width']) && !is_numeric($_POST['map_overlay_setting']['overlay_border_width'])){
				$this->errors[] = esc_html__( 'Please enter the overlay border width in numeric pixel value only the under Overlay Settings section.', 'wp-google-map-plugin' );
			}
			if(isset($_POST['map_all_control']['wpgmp_base_font_size']) && !empty($_POST['map_all_control']['wpgmp_base_font_size']) ){
				
				if (!str_contains($_POST['map_all_control']['wpgmp_base_font_size'], 'px') && !is_numeric($_POST['map_all_control']['wpgmp_base_font_size']) ) { 
				    $this->errors[] = esc_html__( 'Please enter the overlay font size numeric pixel value only the under Map Theme Settings section.', 'wp-google-map-plugin' );
				} 

				if (!str_contains($_POST['map_all_control']['wpgmp_base_font_size'], 'px') && is_numeric($_POST['map_all_control']['wpgmp_base_font_size']) ) { 
				    $_POST['map_all_control']['wpgmp_base_font_size'] .= 'px'; 
				}
				
			}
			if(isset($_POST['map_all_control']['infowindow_width']) && !empty($_POST['map_all_control']['infowindow_width']) && !is_numeric($_POST['map_all_control']['infowindow_width'])){
				$this->errors[] = esc_html__( 'Please enter the infowindow width in numeric pixel value only the under Infowindow Customisation Settings section.', 'wp-google-map-plugin' );
			}
			
			if(isset($_POST['map_all_control']['gm_radius']) && !empty($_POST['map_all_control']['gm_radius']) && !is_numeric($_POST['map_all_control']['gm_radius'])){
				$this->errors[] = esc_html__( 'Please enter a numeric radius value under Google Maps Amenities section.', 'wp-google-map-plugin' );
			}
						
			if ( is_array( $this->errors ) and ! empty( $this->errors ) ) {
				$this->throw_errors();
			}

			if ( isset( $_POST['entityID'] ) ) {
				$entityID = intval( wp_unslash( $_POST['entityID'] ) );
			}

			if ( isset( $_POST['wpgmp_import_code'] ) and $_POST['wpgmp_import_code'] != '' ) {
				$import_code = wp_unslash( $_POST['wpgmp_import_code'] );
				if ( trim( $import_code ) != '' ) {
					$map_settings = maybe_unserialize( base64_decode( $import_code ) );
					if ( is_object( $map_settings ) ) {
						$_POST = (array) $map_settings;
					}
				}
			}

			if ( ! is_array( $_POST['map_locations'] ) and '' != sanitize_text_field( $_POST['map_locations'] ) ) {
				$map_locations = explode( ',', sanitize_text_field( $_POST['map_locations'] ) );
			} elseif ( is_array( $_POST['map_locations'] ) and ! empty( $_POST['map_locations'] ) ) {
				$map_locations = $_POST['map_locations'];
			} else {
				$map_locations = array(); }

			if ( isset( $_POST['extensions_fields'] ) ) {
				$_POST['map_all_control']['extensions_fields'] = $_POST['extensions_fields'];
			}

			if ( isset( $_POST['map_marker_spiderfier_setting'] ) ) {
				$_POST['map_all_control']['map_marker_spiderfier_setting'] = $_POST['map_marker_spiderfier_setting'];
			}

			if ( isset( $_POST['map_all_control']['map_control_settings'] ) ) {
				$arr = array();
				$i   = 0;
				foreach ( $_POST['map_all_control']['map_control_settings'] as $key => $val ) {
					if ( $val['html'] != '' ) {
						$arr[ $i ]['html']     = $val['html'];
						$arr[ $i ]['position'] = $val['position'];
						$i++;
					}
				}
				$_POST['map_all_control']['map_control_settings'] = $arr;
			}

			if ( isset( $_POST['map_all_control']['custom_filters'] ) ) {
				$custom_filters = array();
				foreach ( $_POST['map_all_control']['custom_filters'] as $k => $val ) {
					if ( $val['slug'] == '' ) {
						unset( $_POST['map_all_control']['custom_filters'][ $k ] );
					} else {
						$custom_filters[] = $val;
					}
				}
				$_POST['map_all_control']['custom_filters'] = $custom_filters;
			}

			if ( isset( $_POST['map_all_control']['location_infowindow_skin']['sourcecode'] ) ) {
				$_POST['map_all_control']['location_infowindow_skin']['sourcecode'] = esc_html(wp_unslash($_POST['map_all_control']['location_infowindow_skin']['sourcecode'] ) );
				$_POST['map_all_control']['infowindow_setting'] = $_POST['map_all_control']['location_infowindow_skin']['sourcecode'];
			}

			if ( isset( $_POST['map_all_control']['post_infowindow_skin']['sourcecode'] ) ) {
				$_POST['map_all_control']['post_infowindow_skin']['sourcecode'] = esc_html(wp_unslash($_POST['map_all_control']['post_infowindow_skin']['sourcecode'] ) );
				$_POST['map_all_control']['infowindow_geotags_setting'] = $_POST['map_all_control']['post_infowindow_skin']['sourcecode'];
			}

			if ( isset( $_POST['map_all_control']['item_skin']['sourcecode'] ) ) {
				$_POST['map_all_control']['item_skin']['sourcecode'] = esc_html(wp_unslash($_POST['map_all_control']['item_skin']['sourcecode'] ) );
				$_POST['map_all_control']['wpgmp_categorydisplayformat'] = $_POST['map_all_control']['item_skin']['sourcecode'];
			}

			$data['map_title']                   = sanitize_text_field( wp_unslash( $_POST['map_title'] ) );
			$data['map_width']                   = str_replace( 'px', '', sanitize_text_field( wp_unslash( $_POST['map_width'] ) ) );
			$data['map_height']                  = str_replace( 'px', '', sanitize_text_field( wp_unslash( $_POST['map_height'] ) ) );
			$data['map_zoom_level']              = intval( wp_unslash( $_POST['map_zoom_level'] ) );
			$data['map_type']                    = sanitize_text_field( wp_unslash( $_POST['map_type'] ) );

			if ( isset( $_POST['map_scrolling_wheel'] ) ) {
				$data['map_scrolling_wheel']     = sanitize_text_field( wp_unslash( $_POST['map_scrolling_wheel'] ) );
			}else{
				$data['map_scrolling_wheel']     = 'false';
			}

			if ( isset( $_POST['map_45imagery'] ) ) {
				$data['map_45imagery']               = sanitize_text_field( wp_unslash( $_POST['map_45imagery'] ) );
			}else{
				$data['map_45imagery']               = '';
			}

			$data['map_street_view_setting']     = serialize( wp_unslash( $_POST['map_street_view_setting'] ) );

			if ( isset( $_POST['map_route_direction_setting'] ) ) {
				$data['map_route_direction_setting'] = serialize( wp_unslash( $_POST['map_route_direction_setting'] ) );
			}else{
				$data['map_route_direction_setting']   = serialize( array('route_direction' => 'false') );
			}

			$data['map_all_control']             = serialize( wp_unslash( $_POST['map_all_control'] ) );

			if ( isset( $_POST['map_info_window_setting'] ) ) {
				$data['map_info_window_setting']     = serialize( wp_unslash( $_POST['map_info_window_setting'] ) );
			}

			$data['style_google_map']            = serialize( wp_unslash( $_POST['style_google_map'] ) );
			$data['map_locations']               = serialize( wp_unslash( $map_locations ) );
			$data['map_layer_setting']           = serialize( wp_unslash( $_POST['map_layer_setting'] ) );

			if ( isset( $_POST['map_polygon_setting'] ) ) {
				$data['map_polygon_setting']         = serialize( wp_unslash( $_POST['map_polygon_setting'] ) );
			}

			$data['map_cluster_setting']         = serialize( wp_unslash( $_POST['map_cluster_setting'] ) );
			$data['map_overlay_setting']         = serialize( wp_unslash( $_POST['map_overlay_setting'] ) );

			if ( isset( $_POST['map_infowindow_setting'] ) ) {
				$data['map_infowindow_setting']      = serialize( wp_unslash( $_POST['map_infowindow_setting'] ) );
			}
		
			$data['map_geotags']                 = '';
			if ( $entityID > 0 ) {
				$where[ $this->unique ] = $entityID;
			} else {
				$where = '';
			}
			// Hook to insert/update extension data.
			if ( isset( $_POST['fc_entity_type'] ) ) {

				$extension_name = strtolower( trim( sanitize_text_field( wp_unslash( $_POST['fc_entity_type'] ) ) ) );

				if ( $extension_name != '' ) {
					$data = apply_filters( $extension_name . '_save', $data, $this->table, $where );
				}
			}

			$data = apply_filters('wpgmp_map_save',$data,$where);
			$result = FlipperCode_Database::insert_or_update( $this->table, $data, $where );
			if ( false === $result ) {
				$response['error'] = esc_html__( 'Something went wrong. Please try again.', 'wp-google-map-plugin' );
			} elseif ( $entityID > 0 ) {
				$response['success'] = esc_html__( 'Map was updated successfully.', 'wp-google-map-plugin' );
			} else {
				
				$response['success'] = esc_html__( 'Map was added successfully. ', 'wp-google-map-plugin' ).'<b>[put_wpgm id='.$result.']</b>'.esc_html__(' can be used to display the map anywhere.', 'wp-google-map-plugin' );
			}
			
			$response['last_db_id'] = $result;

			do_action( 'wpgmp_after_map_save', $response, $data, $entityID );

			
			return $response;
		}
		/**
		 * Delete map object by id.
		 */
		function delete() {
			if ( isset( $_GET['map_id'] ) ) {
				$id          = intval( wp_unslash( $_GET['map_id'] ) );
				$connection  = FlipperCode_Database::connect();
				$this->query = $connection->prepare( "DELETE FROM $this->table WHERE $this->unique='%d'", $id );
				
				do_action( 'wpgmp_after_map_deleted', $id, $result );

				return FlipperCode_Database::non_query( $this->query, $connection );
			}
		}
		/**
		 * Clone map object by id.
		 */
		function copy($map_id) {
			if ($map_id) {
				$map = $this->get($this->table, array(array('map_id', '=', intval($map_id))));
				$data = array();
				foreach ($map[0] as $column => $value) {
					if( $column != 'map_id')
						$data[$column] = ($column == 'map_title') ? $value . ' ' . esc_html__('Copy', 'wp-google-map-plugin') : $value;
				}
				return FlipperCode_Database::insert_or_update($this->table, $data);
			}
		}
		

		function get_map_customizer_style(){

			$font_families  = array();
			$fc_skin_styles = '';

			$map_obj = $this->fetch( array( array( 'map_id', '=', intval( wp_unslash( $_GET['map_id'] ) ) ) ) );
			$map     = $map_obj[0];
			if ( ! empty( $map ) ) {
				$map->map_all_control = maybe_unserialize( $map->map_all_control );
			}

			$data = (array) $map;

			if ( isset( $data['map_all_control']['fc_custom_styles'] ) ) {
				$fc_custom_styles = json_decode( $data['map_all_control']['fc_custom_styles'], true );
				if ( ! empty( $fc_custom_styles ) && is_array( $fc_custom_styles ) ) {
					$fc_skin_styles = '';
					foreach ( $fc_custom_styles as $fc_style ) {
						if ( is_array( $fc_style ) ) {
							foreach ( $fc_style as $skin => $class_style ) {
								if ( is_array( $class_style ) ) {
									foreach ( $class_style as $class => $style ) {
										$ind_style         = explode( ';', $style );

										foreach ($ind_style as $css_value) {
											if ( strpos( $css_value, 'font-family' ) !== false ) {
													$font_family_properties   = explode( ':', $css_value );
													if(!empty($font_family_properties['1'])){
														$multiple_family = explode( ',', $font_family_properties['1']);
														if(count($multiple_family)==1){
															$font_families[] = $font_family_properties['1'];
														}
													}
											}
										}

										if ( strpos( $class, '.' ) !== 0 ) {
											$class = '.' . $class;
										}
										$fc_skin_styles .= ' .fc-' . $skin . ' ' . $class . '{' . $style . '}';
									}
								}
							}
						}
					}
					
				}
			}

			return array('font_families' => $font_families,'fc_skin_styles' => $fc_skin_styles );

		}

	}
}