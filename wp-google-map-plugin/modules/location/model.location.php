<?php
/**
 * Class: WPGMP_Model_Location
 *
 * Handles CRUD operations for Locations.
 * Adds developer-friendly hooks to extend behavior.
 *
 * @package Maps
 * @version 3.0.0
 */

if ( ! class_exists( 'WPGMP_Model_Location' ) ) {

	class WPGMP_Model_Location extends FlipperCode_Model_Base {

		protected $validations;
		protected $query;

		public function __construct() {
			$this->table     = TBL_LOCATION;
			$this->unique    = 'location_id';
			$this->validations = array(
				'location_title'   => array(
					'req'     => esc_html__( 'Please enter location title.', 'wp-google-map-plugin' ),
					'max=255' => esc_html__( 'Location title cannot contain more than 255 characters.', 'wp-google-map-plugin' )
				),
				'location_address' => array(
					'req' => esc_html__( 'Please enter location address.', 'wp-google-map-plugin' )
				)
			);
		}

		public function navigation() {
			return array(
				'wpgmp_form_location'   => esc_html__( 'Add Location', 'wp-google-map-plugin' ),
				'wpgmp_manage_location' => esc_html__( 'Manage Locations', 'wp-google-map-plugin' ),
				'wpgmp_import_location' => esc_html__( 'Import Locations', 'wp-google-map-plugin' ),
			);
		}

		/**
		 * Creates SQL query to install locations table on plugin activation.
		 *
		 * @return string SQL CREATE TABLE statement.
		 */
		public function install() {
			global $wpdb;
			$charset_collate = $wpdb->get_charset_collate();

			$table_name = $wpdb->prefix . 'map_locations';

			return "CREATE TABLE {$table_name} (
				location_id INT(11) NOT NULL AUTO_INCREMENT,
				location_title VARCHAR(255),
				location_address VARCHAR(255),
				location_draggable VARCHAR(255),
				location_infowindow_default_open VARCHAR(255),
				location_animation VARCHAR(255),
				location_latitude VARCHAR(255),
				location_longitude VARCHAR(255),
				location_city VARCHAR(255),
				location_state VARCHAR(255),
				location_country VARCHAR(255),
				location_postal_code VARCHAR(255),
				location_author INT(11),
				location_messages TEXT,
				location_settings TEXT,
				location_group_map TEXT,
				location_extrafields TEXT,
				PRIMARY KEY  (location_id)
			) $charset_collate;";
		}

		/**
		 * Fetch all location entries optionally by condition.
		 *
		 * @param array $where Filtering condition for fetch.
		 * @return array List of location objects.
		 */
		public function fetch( $where = array() ) {
			$objects = $this->get( $this->table, $where );

			foreach ( (array) $objects as $object ) {
				$object->location_settings    = maybe_unserialize( $object->location_settings );
				$object->location_extrafields = maybe_unserialize( $object->location_extrafields );

				$group_map = maybe_unserialize( $object->location_group_map );
				$object->location_group_map = is_array( $group_map ) ? $group_map : array( $object->location_group_map );

				if ( ! is_null( $object->location_messages ) ) {
					$decoded = base64_decode( $object->location_messages );
					$parsed  = maybe_serialize( $decoded );

					if ( is_array( $parsed ) && isset( $parsed['googlemap_infowindow_message_one'] ) ) {
						$object->location_messages = $parsed['googlemap_infowindow_message_one'];
					}
				}

				/**
				 * Allow plugins to modify location object after fetch.
				 *
				 * @since 3.0.0
				 * @param object $object Location object.
				 */
				do_action( 'wpgmp_after_location_fetched', $object );
			}

			/**
			 * Filter the list of fetched locations.
			 *
			 * @since 3.0.0
			 * @param array $objects List of location objects.
			 * @param array $where   Original condition used.
			 */
			return apply_filters( 'wpgmp_location_results', $objects, $where );
		}

		/**
		 * Cancel location import process by deleting uploaded file.
		 *
		 * @return void
		 */
		public function cancel_import() {
			$current_csv = get_option( 'wpgmp_current_csv' );

			if ( is_array( $current_csv ) && ! empty( $current_csv['file'] ) && file_exists( $current_csv['file'] ) ) {
				unlink( $current_csv['file'] );
			}

			delete_option( 'wpgmp_current_csv' );
			do_action( 'wpgmp_import_cancelled', $current_csv );
		}

		public function update_loc() {
			global $_POST;

			$entityID = '';

			if ( isset( $_REQUEST['_wpnonce'] ) ) {
				$nonce = sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) ); }

			if ( isset( $nonce ) and ! wp_verify_nonce( $nonce, 'wpgmp-nonce' ) ) {

				die( 'Cheating...' );

			}
			$all_new_locations = json_decode( wp_unslash( $_POST['fc-location-new-set'] ) );
			if ( is_array( $all_new_locations ) and ! empty( $all_new_locations ) ) {
				foreach ( $all_new_locations as $location ) {
						$data['location_latitude']  = sanitize_text_field( $location->latitude );
						$data['location_longitude'] = sanitize_text_field( $location->longitude );
					if ( $location->id > 0 ) {
						$where[ $this->unique ] = $location->id;
						$data = apply_filters('wpgmp_location_save',$data,$where);
						$result                 = FlipperCode_Database::insert_or_update( TBL_LOCATION, $data, $where );
					}
				}
			}

			if ( false === $result ) {
				$response['error'] = esc_html__( 'Something went wrong. Please try again.', 'wp-google-map-plugin' );
			} elseif ( $entityID > 0 ) {
				$response['success'] = esc_html__( 'Location updated successfully', 'wp-google-map-plugin' );
			} else {
				$response['success'] = esc_html__( 'Location added successfully.', 'wp-google-map-plugin' );
			}

			return $response;
		}
		
		public function write_to_db_backup(){

			$entityID = '';
			if ( isset( $_POST['entityID'] ) )
			$entityID = intval( wp_unslash( $_POST['entityID'] ) );

			if ( isset( $_POST['location_messages'] ) )
			$data['location_messages'] = wp_unslash( $_POST['location_messages'] );
			
			if ( isset( $_POST['extensions_fields'] ) )
			$_POST['location_settings']['extensions_fields'] = $_POST['extensions_fields'];
			
			$data['location_settings']                = serialize( wp_unslash( $_POST['location_settings'] ) );

			if ( isset($_POST['location_group_map']) && ! is_array( $_POST['location_group_map'] ) and '' != sanitize_text_field( $_POST['location_group_map'] ) ) {
				$expolded_cat = explode( ',', sanitize_text_field( $_POST['location_group_map'] ) );
				$data['location_group_map'] = serialize( wp_unslash($expolded_cat) );
			} elseif ( isset($_POST['location_group_map']) &&  is_array( $_POST['location_group_map'] ) and ! empty( $_POST['location_group_map'] ) ) {
				$data['location_group_map'] = serialize( wp_unslash( $_POST['location_group_map'] ) );
			} else {
				$data['location_group_map'] = ''; } 

			$extra_fields = '';
			if( isset( $_POST['location_extrafields'] ) ) {
				$extra_fields                         = wp_unslash( $_POST['location_extrafields'] );	
			} 




			$data['location_extrafields']             = serialize( wp_unslash( $extra_fields ) );
			$data['location_title']                   = sanitize_text_field( wp_unslash( $_POST['location_title'] ) );
			$data['location_address']                 = sanitize_text_field( wp_unslash( $_POST['location_address'] ) );
			$data['location_latitude']                = sanitize_text_field( wp_unslash( $_POST['location_latitude'] ) );
			$data['location_longitude']               = sanitize_text_field( wp_unslash( $_POST['location_longitude'] ) );
			$data['location_city']                    = sanitize_text_field( wp_unslash( $_POST['location_city'] ) );
			$data['location_state']                   = sanitize_text_field( wp_unslash( $_POST['location_state'] ) );
			$data['location_country']                 = sanitize_text_field( wp_unslash( $_POST['location_country'] ) );
			$data['location_postal_code']             = sanitize_text_field( wp_unslash( $_POST['location_postal_code'] ) );
			
			$data['location_draggable'] = '';
			

			$data['location_infowindow_default_open'] = '';
			

			$data['location_animation']               = sanitize_text_field( wp_unslash( $_POST['location_animation'] ) );
			$data['location_author']                  = get_current_user_id();
			if ( $entityID > 0 ) {
				$where[ $this->unique ] = $entityID;
			} else {
				$where = '';
			}

			$data = apply_filters('wpgmp_location_save',$data,$where);
			$result = FlipperCode_Database::insert_or_update( $this->table, $data, $where );

			if($result !== false){
				$extra_field_val = get_option( 'wpgmp_settings', true );
				$extra_val_impolode = array();

				if(!isset($extra_field_val['wpgmp_extrafield_val'])){
					WPGMP_Google_Maps_Lite::wpgmp_set_extrafields();
				}else{

					if (is_array($extra_fields)) {
					foreach($extra_fields as $ex_key => $ex_val){
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
					update_option( 'wpgmp_settings', $extra_field_val );
				}

				
			}
			return $result;

		}

		/**
		 * Write location data to DB from POST.
		 *
		 * @return int|false Result from insert_or_update
		 */
		public function write_to_db() {
			$entityID = isset( $_POST['entityID'] ) ? intval( wp_unslash( $_POST['entityID'] ) ) : 0;

			// Gather and sanitize input fields.
			$extra_fields = isset( $_POST['location_extrafields'] ) ? wp_unslash( $_POST['location_extrafields'] ) : array();
			$data = array(
				'location_title'       => sanitize_text_field( wp_unslash( $_POST['location_title'] ) ),
				'location_address'     => sanitize_text_field( wp_unslash( $_POST['location_address'] ) ),
				'location_latitude'    => sanitize_text_field( wp_unslash( $_POST['location_latitude'] ) ),
				'location_longitude'   => sanitize_text_field( wp_unslash( $_POST['location_longitude'] ) ),
				'location_city'        => sanitize_text_field( wp_unslash( $_POST['location_city'] ) ),
				'location_state'       => sanitize_text_field( wp_unslash( $_POST['location_state'] ) ),
				'location_country'     => sanitize_text_field( wp_unslash( $_POST['location_country'] ) ),
				'location_postal_code' => sanitize_text_field( wp_unslash( $_POST['location_postal_code'] ) ),
				'location_messages'    => isset( $_POST['location_messages'] ) ? wp_unslash( $_POST['location_messages'] ) : '',
				'location_animation'   => sanitize_text_field( wp_unslash( $_POST['location_animation'] ) ),
				'location_author'      => get_current_user_id(),
				'location_draggable'   => '',
				'location_infowindow_default_open' => '',
			);

			// Settings
			if ( isset( $_POST['extensions_fields'] ) ) {
				$_POST['location_settings']['extensions_fields'] = $_POST['extensions_fields'];
			}
			$data['location_settings'] = serialize( wp_unslash( $_POST['location_settings'] ?? array() ) );

			// Category mapping
			if ( isset( $_POST['location_group_map'] ) ) {
				$cats = is_array( $_POST['location_group_map'] ) ? $_POST['location_group_map'] : explode( ',', sanitize_text_field( $_POST['location_group_map'] ) );
				$data['location_group_map'] = serialize( wp_unslash( $cats ) );
			} else {
				$data['location_group_map'] = '';
			}

			$data['location_extrafields'] = serialize( $extra_fields );
			$where = $entityID > 0 ? array( $this->unique => $entityID ) : '';

			$data = apply_filters( 'wpgmp_location_save', $data, $where );
			$result = FlipperCode_Database::insert_or_update( $this->table, $data, $where );

			// Manage unique extra field values
			if ( $result !== false ) {
				$settings = get_option( 'wpgmp_settings', true );
				$settings['wpgmp_extrafield_val'] = $settings['wpgmp_extrafield_val'] ?? array();

				if ( is_array( $extra_fields ) ) {
					foreach ( $extra_fields as $key => $val ) {
						if ( ! isset( $settings['wpgmp_extrafield_val'][ $key ] ) ) {
							$settings['wpgmp_extrafield_val'][ $key ] = array();
						}
						$vals = array_map( 'trim', explode( ',', $val ) );
						foreach ( $vals as $v ) {
							if ( $v && ! in_array( strtolower( $v ), array_map( 'strtolower', $settings['wpgmp_extrafield_val'][ $key ] ) ) ) {
								$settings['wpgmp_extrafield_val'][ $key ][] = $v;
							}
						}
					}
				}

				update_option( 'wpgmp_settings', $settings );
				if ( empty( $settings['wpgmp_extrafield_val'] ) ) {
					WPGMP_Google_Maps_Lite::wpgmp_set_extrafields();
				}
			}

			return $result;
		}


		public function save_via_rest() {
						
		    //Rest Validations
            $rest_errors = [];
            if(!isset($_POST['location_title']) || empty($_POST['location_title']))
                $rest_errors[] = esc_html__( 'Please enter location title.', 'wp-google-map-plugin' );      
            if(!isset($_POST['location_address']) || empty($_POST['location_address']))
                $rest_errors[] = esc_html__( 'Please enter location address.', 'wp-google-map-plugin' );        
            if(!isset($_POST['location_latitude']) || empty($_POST['location_latitude']))
                $rest_errors[] = esc_html__( 'Please enter location latitude.', 'wp-google-map-plugin' );
            if(!isset($_POST['location_longitude']) || empty($_POST['location_longitude']))
                $rest_errors[] = esc_html__( 'Please enter location longitude.', 'wp-google-map-plugin' );
        
            $rest_errors = apply_filters('wpgmp_location_rest_validation',$rest_errors,$_POST);
            if ( is_array( $rest_errors ) && ! empty( $rest_errors ) ){
                return new WP_Error( 'wpgmp_rest_validation_failed', esc_html__( 'Please checkout the errors and fix those to proceed with this request.', 'rest-api-for-google-maps' ), array( 'status' => 422, 'errors' => $rest_errors ) );
            }

			//Write to DB
			$result = $this->write_to_db();

			$action  = (isset( $_POST['entityID'] ) && !empty($_POST['entityID']) ) ? 'update' : 'create';

            // Handle the result
            if ( false !== $result ) {
                return new WP_REST_Response( array( 'success' => true , 'wpgmp_module' => 'location' , 'action' => $action ), 200 );
            } else {
                return new WP_REST_Response( array( 'success' => false ), 400 );
            }
			
		}

		/**
		 * Save location data via form submission
		 */
		public function save() {
			if ( ! isset( $_REQUEST['_wpnonce'] ) || ! wp_verify_nonce( $_REQUEST['_wpnonce'], 'wpgmp-nonce' ) ) {
				die( 'You are not allowed to save changes!' );
			}
			$this->verify( $_POST );
			$this->errors = apply_filters( 'wpgmp_location_validation', $this->errors, $_POST );
			if ( is_array( $this->errors ) && ! empty( $this->errors ) ) {
				$this->throw_errors();
			}
			$entityID = isset( $_POST['entityID'] ) ? intval( $_POST['entityID'] ) : 0;
			$result = $this->write_to_db();
			do_action( 'wpgmp_after_location_save', $result, $_POST );

			if ( false === $result ) {
				$response['error'] = esc_html__( 'Something went wrong. Please try again.', 'wp-google-map-plugin' );
			} elseif ( $entityID > 0 ) {
				$response['success'] = esc_html__( 'Location was updated successfully.', 'wp-google-map-plugin' );
			} else {
				$response['success'] = esc_html__( 'Location was added successfully.', 'wp-google-map-plugin' );
			}

			$response['last_db_id'] = $result;
			return $response;
		}

		/**
		 * Delete location by ID.
		 */
		public function delete() {
			if ( isset( $_GET['location_id'] ) ) {
				$id = intval( wp_unslash( $_GET['location_id'] ) );
				do_action( 'wpgmp_before_location_delete', $id );
				$connection = FlipperCode_Database::connect();
				$this->query = $connection->prepare( "DELETE FROM $this->table WHERE $this->unique='%d'", $id );
				$result = FlipperCode_Database::non_query( $this->query, $connection );
				do_action( 'wpgmp_after_location_delete', $id, $result );
				return $result;
			}
		}
		
		/**
		 * Export locations to file
		 */
		public function export( $type = 'csv' ) {
			$selected_ids = isset( $_POST['id'] ) && is_array( $_POST['id'] ) ? $_POST['id'] : array();
			$locations = $this->fetch();
			$extra_fields = maybe_unserialize( get_option( 'wpgmp_location_extrafields', [] ) );
			$extra_fields = is_array( $extra_fields ) ? $extra_fields : array();

			$category_data = array();
			$modelFactory = new WPGMP_Model();
			$category_obj = $modelFactory->create_object( 'group_map' );
			$categories = $category_obj->fetch();
			foreach ( (array) $categories as $cat ) {
				$category_data[ $cat->group_map_id ] = $cat->group_map_title;
			}

			$data_rows = array();
			foreach ( $locations as $location ) {
				if ( ! empty( $selected_ids ) && ! in_array( $location->location_id, $selected_ids ) ) continue;

				$assigned_cats = array();
				foreach ( (array) $location->location_group_map as $cat_id ) {
					if ( isset( $category_data[ $cat_id ] ) ) {
						$assigned_cats[] = $category_data[ $cat_id ];
					}
				}
				$categories_str = implode( ',', $assigned_cats );

				$row = array(
					'location_id'          => $location->location_id,
					'location_title'       => $location->location_title,
					'location_address'     => $location->location_address,
					'location_latitude'    => $location->location_latitude,
					'location_longitude'   => $location->location_longitude,
					'location_city'        => $location->location_city,
					'location_state'       => $location->location_state,
					'location_country'     => $location->location_country,
					'location_postal_code' => $location->location_postal_code,
					'location_messages'    => $location->location_messages,
					'location_group_map'   => $categories_str,
				);

				foreach ( $extra_fields as $label ) {
					$slug = sanitize_title( $label );
					$row[ $label ] = isset( $location->location_extrafields[ $slug ] ) ? $location->location_extrafields[ $slug ] : '';
				}

				foreach ( (array) $location->location_settings as $key => $val ) {
					$row[ $key ] = $val;
				}

				$data_rows[] = apply_filters( 'wpgmp_location_export_row', $row, $location );
			}

			$headers = array(
				'ID','Title','Address','Latitude','Longitude','City','State','Country','Postal Code','Message','Categories'
			);
			$headers = array_merge( $headers, $extra_fields, array( 'Location Click', 'Redirect URL','Open New Tab','Location Image' ) );
			$filename = sanitize_file_name( 'location_' . $type . '_' . time() );
			
			do_action( 'wpgmp_before_location_export', $data_rows );

			$exporter = new FlipperCode_Export_Import( $headers, $data_rows );
			$exporter->export( $type, $filename );
			die();
		}
		/**
		 * Import Location via CSV,JSON,XML and Excel.
		 *
		 * @return array Success or Failure error message.
		 */
		public function map_fields() {
			$response = array();

			// Validate nonce.
			if ( ! isset( $_REQUEST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) ), 'wpgmp-nonce' ) ) {
				die( esc_html__( 'Cheating...', 'wp-google-map-plugin' ) );
			}

			if ( isset( $_POST['import_loc'] ) ) {
				// Check for valid file.
				if ( empty( $_FILES['import_file']['tmp_name'] ) ) {
					$response['error'] = esc_html__( 'Please select file to be imported.', 'wp-google-map-plugin' );
				} elseif ( ! $this->validate_extension( sanitize_file_name( wp_unslash( $_FILES['import_file']['name'] ) ) ) ) {
					$response['error'] = esc_html__( 'Please upload a valid CSV file.', 'wp-google-map-plugin' );
				} else {
					// Handle the file upload.
					if ( ! function_exists( 'wp_handle_upload' ) ) {
						require_once ABSPATH . 'wp-admin/includes/file.php';
					}

					$movefile = wp_handle_upload( $_FILES['import_file'], array( 'test_form' => false ) );

					if ( isset( $movefile['error'] ) ) {
						$response['error'] = $movefile['error'];
					} else {
						update_option( 'wpgmp_current_csv', $movefile );

						/**
						 * Fires after CSV upload succeeded and stored.
						 *
						 * @param array $movefile The file upload details.
						 */
						do_action( 'wpgmp_after_location_csv_upload', $movefile );
					}
				}
				return $response;
			}
			return false;
		}

		public function import_location1() {
			$result = false;

			if ( isset( $_REQUEST['_wpnonce'] ) ) {
				$nonce = sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) ); }

			if ( ! wp_verify_nonce( $nonce, 'wpgmp-nonce' ) ) {

				die( 'Cheating...' );

			}

			if ( isset( $_POST['import_loc'] ) ) {

					$current_csv = get_option( 'wpgmp_current_csv' );
				if ( ! is_array( $current_csv ) or ! file_exists( $current_csv['file'] ) ) {
					$response['error'] = esc_html__( 'Something went wrong. Please start import process again.', 'wp-google-map-plugin' );
					return $response;
				}

					$csv_columns = wp_unslash( $_POST['csv_columns'] );

					$colums_mapping    = array();
					$duplicate_columns = array();

					// Unset unasigned field
				foreach ( $csv_columns as $key => $value ) {

					if ( $value == '' ) {
						unset( $csv_columns[ $key ] );
					}
				}

					// Find duplicate fields
					$duplicate_columns = array_count_values( $csv_columns );

					$not_allowed = array();
				foreach ( $duplicate_columns as $name => $count ) {

					if ( $count > 1 and $name != 'category' and $name != 'extra_field' ) {
						$not_allowed[] = $name;
					}
				}

				if ( count( $csv_columns ) == 0 ) {
					$response['error'] = _( 'Please map locations fields to csv columns.', 'wp-google-map-plugin' );

					return $response;
				}

					$is_update_process = false;

				if ( in_array( 'location_id', $csv_columns ) !== false ) {
					$is_update_process = true;
				}

				if ( count( $not_allowed ) > 0 ) {
					$wrongly_mapped = implode(',',$not_allowed);
					$response['error'] = esc_html__( 'Duplicate mapping is not allowed except the category field and extra field. Please check these fields : ', 'wp-google-map-plugin' ).$wrongly_mapped;
					return $response;
				}

					// Address and title is required if add process.
				if ( $is_update_process == false ) {

					if ( in_array( 'location_address', $csv_columns ) === false or in_array( 'location_title', $csv_columns ) === false ) {
						$response['error'] = esc_html__( 'Title & Address fields are required.', 'wp-google-map-plugin' );
						return $response;
					}
				}

				if ( count( $csv_columns ) > 0 ) {
					$importer             = new FlipperCode_Export_Import();
					$file_data            = $importer->import( 'csv', $current_csv['file'] );
					$current_extra_fields = maybe_unserialize( get_option( 'wpgmp_location_extrafields' ) );
					if ( ! is_array( $current_extra_fields ) ) {
						$current_extra_fields = array();
					}

					if ( ! empty( $file_data ) ) {
						$modelFactory = new WPGMP_Model();
						$category     = $modelFactory->create_object( 'group_map' );
						$categories   = $category->fetch();
						$first_row    = $file_data[0];
						unset( $file_data[0] );
						if ( ! empty( $categories ) ) {
							$categories_data = array();
							foreach ( $categories as $cat ) {
								$categories_data[ $cat->group_map_id ] = strtolower( sanitize_text_field( $cat->group_map_title ) );
							}
						}
						foreach ( $file_data as $data ) {

							$all_data_in_string = implode(' ',$data);
							if( empty( trim($all_data_in_string) ) || trim($all_data_in_string) == '' )
							continue;
							
							$datas             = array();
							$category_ids      = array();
							$extra_fields      = array();
							$categories        = array();
							$location_settings = array();
							foreach ( $data as $key => $value ) {

								if ( ! isset( $csv_columns[ $key ] ) || trim( $csv_columns[ $key ] ) == '' ) {
									continue;
								}

								if ( $value != '' and ( $csv_columns[ $key ] == 'location_longitude' or $csv_columns[ $key ] == 'location_latitude' ) ) {
									$datas[ $csv_columns[ $key ] ] = (float) filter_var( $value, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION );
								} elseif ( $csv_columns[ $key ] == 'category' ) {

									if ( trim( $value != '' ) ) {
										$all_categories = explode( ',', $value );
										if ( is_array( $all_categories ) ) {
											foreach ( $all_categories as $ci => $cname ) {
												$categories[] = strtolower( $cname );
											}
										}
									}
								} elseif ( $csv_columns[ $key ] == 'onclick' || $csv_columns[ $key ] == 'redirect_link' || $csv_columns[ $key ] == 'redirect_link_window' || $csv_columns[ $key ] == 'featured_image') {
									$location_settings[ $csv_columns[ $key ] ] = $value;
								} elseif ( $csv_columns[ $key ] == 'extra_field' ) {
									   $current_extra_fields[]                               = $first_row[ $key ];
									   $extra_fields[ sanitize_title( $first_row[ $key ] ) ] = $value;
								} else {
									$datas[ $csv_columns[ $key ] ] = trim( $value );
								}
							}

							if ( ! isset( $categories_data ) ) {
								$categories_data = array();
							}

							// Find out categories id or insert new category.
							if ( isset( $categories ) and ! empty( $categories ) ) {
								$all_cat = $categories;
								if ( is_array( $all_cat ) ) {
									foreach ( $all_cat as $cat ) {
										$cat_id = array_search( sanitize_text_field( $cat ), (array) $categories_data );
										if ( false == $cat_id ) {
											// Create a new category.
											$new_cat_id                     = FlipperCode_Database::insert_or_update(
												TBL_GROUPMAP, array(
													'group_map_title' => sanitize_text_field( $cat ),
													'group_marker' => WPGMP_Helper::wpgmp_default_marker_icon(),
												)
											);
											$category_ids[]                 = $new_cat_id;
											$categories_data[ $new_cat_id ] = sanitize_text_field( $cat );

										} else {
											$category_ids[] = $cat_id;
										}
									}
								}
							}

							if ( is_array( $category_ids ) and ! empty( $category_ids ) ) {
								$datas['location_group_map'] = serialize( (array) $category_ids );
							}

							if ( is_array( $extra_fields ) and ! empty( $extra_fields ) ) {
								$datas['location_extrafields'] = serialize( $extra_fields );
							}

							if ( is_array( $location_settings ) and ! empty( $location_settings ) ) {
								$datas['location_settings'] = serialize( $location_settings );
							}

							if ( isset( $datas['location_latitude'] ) && trim( $datas['location_latitude'] ) == '' ) {
								unset( $datas['location_latitude'] );
							}

							if ( isset( $datas['location_longitude'] ) && trim( $datas['location_longitude'] ) == '' ) {
								unset( $datas['location_longitude'] );
							}

							$entityID = '';
							if ( isset( $datas['location_id'] ) ) {
								$entityID = intval( wp_unslash( $datas['location_id'] ) );
								unset( $datas['location_id'] );
							}

							// Rest Columns are extra fields.
							if ( $entityID > 0 ) {
								$where[ $this->unique ] = $entityID;
							} else {
								$where = '';
							}
							
							$datas = array_filter( $datas );
							if(  count( $datas ) == 0 )
							continue;
							
							$datas = apply_filters('wpgmp_location_before_import',$datas);

							$result = FlipperCode_Database::insert_or_update( $this->table, $datas, $where );

						}

						$current_extra_fields = array_unique( $current_extra_fields );
						update_option( 'wpgmp_location_extrafields', serialize( $current_extra_fields ) );
						$response['success'] = count( $file_data ) . ' ' . esc_html__( 'records imported successfully.', 'wp-google-map-plugin' );
						if(!isset($extra_field_val['wpgmp_extrafield_val'])){
							WPGMP_Google_Maps_Lite::wpgmp_set_extrafields();
						}
						// Here remove the temp file.
						unlink( $current_csv['file'] );
						delete_option( 'wpgmp_current_csv' );

					} else {
						$response['error'] = esc_html__( 'No records found in the csv file.', 'wp-google-map-plugin' );
					}
				} else {
					$response['error'] = esc_html__( 'Please assign fields to the csv columns.', 'wp-google-map-plugin' );
				}

				return $response;
			}
		}

		/**
		 * Step 2: Import CSV rows into locations table.
		 *
		 * @return array Response with success or error.
		 */
		public function import_location() {
			$response = array();

			// Verify nonce.
			if ( ! isset( $_REQUEST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) ), 'wpgmp-nonce' ) ) {
				die( esc_html__( 'Cheating...', 'wp-google-map-plugin' ) );
			}

			if ( isset( $_POST['import_loc'] ) ) {
				$current_csv = get_option( 'wpgmp_current_csv' );
				if ( ! is_array( $current_csv ) || ! file_exists( $current_csv['file'] ) ) {
					return array('error' => esc_html__( 'Something went wrong. Please start import process again.', 'wp-google-map-plugin' ));
				}

				$csv_columns = array_filter( wp_unslash( $_POST['csv_columns'] ) );
				$duplicates = array_count_values( $csv_columns );
				$invalid = array();
				foreach ( $duplicates as $name => $count ) {
					if ( $count > 1 && $name !== 'category' && $name !== 'extra_field' ) {
						$invalid[] = $name;
					}
				}
				if ( count( $invalid ) ) {
					return array('error' => esc_html__( 'Duplicate mapping not allowed except category/extra_field: ', 'wp-google-map-plugin' ) . implode(', ', $invalid));
				}
				if ( ! in_array( 'location_address', $csv_columns ) || ! in_array( 'location_title', $csv_columns ) ) {
					return array('error' => esc_html__( 'Title & Address fields are required.', 'wp-google-map-plugin' ));
				}

				$importer   = new FlipperCode_Export_Import();
				$file_data  = $importer->import( 'csv', $current_csv['file'] );
				if ( empty( $file_data ) ) {
					return array('error' => esc_html__( 'No records found in the csv file.', 'wp-google-map-plugin' ));
				}

				$modelFactory = new WPGMP_Model();
				$category = $modelFactory->create_object( 'group_map' );
				$category_list = $category->fetch();
				$category_map = array();
				foreach ( $category_list as $cat ) {
					$category_map[ strtolower( sanitize_text_field( $cat->group_map_title ) ) ] = $cat->group_map_id;
				}
				$current_extra_fields = (array) maybe_unserialize( get_option( 'wpgmp_location_extrafields' ) );

				$first_row = $file_data[0];
				unset( $file_data[0] );
				foreach ( $file_data as $row ) {
					if ( empty( implode('', $row) ) ) continue;
					$data = $extra_fields = $settings = array();
					$category_ids = array();
					foreach ( $row as $col => $value ) {
						$field = $csv_columns[$col] ?? '';
						if ( ! $field ) continue;
						if ( $field === 'location_latitude' || $field === 'location_longitude' ) {
							$data[$field] = (float) filter_var( $value, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION );
						} elseif ( $field === 'category' ) {
							foreach ( explode(',', $value) as $cat_title ) {
								$cat_title = trim(strtolower($cat_title));
								if ( $cat_title ) {
									$category_ids[] = $category_map[$cat_title] ?? $category_map[$cat_title] = FlipperCode_Database::insert_or_update( TBL_GROUPMAP, array( 'group_map_title' => $cat_title, 'group_marker' => WPGMP_Helper::wpgmp_default_marker_icon() ) );
								}
							}
						} elseif ( $field === 'onclick' || $field === 'redirect_link' || $field === 'redirect_link_window' || $field === 'featured_image' ) {
							$settings[$field] = $value;
						} elseif ( $field === 'extra_field' ) {
							$name = sanitize_title( $first_row[$col] );
							$extra_fields[$name] = $value;
							$current_extra_fields[] = $first_row[$col];
						} else {
							$data[$field] = trim( $value );
						}
					}
					if ( $category_ids ) $data['location_group_map'] = serialize( $category_ids );
					if ( $extra_fields ) $data['location_extrafields'] = serialize( $extra_fields );
					if ( $settings ) $data['location_settings'] = serialize( $settings );
					if ( isset($data['location_id']) ) {
						$where = array( $this->unique => intval( $data['location_id'] ) );
						unset( $data['location_id'] );
					} else {
						$where = '';
					}
					$data = apply_filters( 'wpgmp_location_before_import', array_filter($data) );
					FlipperCode_Database::insert_or_update( $this->table, $data, $where );
				}
				update_option( 'wpgmp_location_extrafields', array_unique($current_extra_fields) );
				delete_option( 'wpgmp_current_csv' );
				unlink( $current_csv['file'] );

				$response['success'] = count($file_data) . ' ' . esc_html__( 'records imported successfully.', 'wp-google-map-plugin' );
			}
			return $response;
		}

	}
}
