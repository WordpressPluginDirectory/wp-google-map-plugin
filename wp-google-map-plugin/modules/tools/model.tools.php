<?php
/**
 * Class: WPGMP_Model_Tools
 *
 * @author Flipper Code <hello@flippercode.com>
 * @version 3.0.0
 * @package Maps
 */

if ( ! class_exists( 'WPGMP_Model_Tools' ) ) {

	/**
	 * Backup model for Backup operation.
	 *
	 * @package Maps
	 * @author Flipper Code <hello@flippercode.com>
	 */
	class WPGMP_Model_Tools extends FlipperCode_Model_Base {

		/**
		 * Generate SQL query.
		 *
		 * @var string
		 */
		protected $query;

		/**
		 * Intialize Backup object.
		 */
		function __construct() {

		}
		/**
		 * Admin menu for Backup Operation
		 *
		 * @return array Admin menu navigation(s).
		 */
		function navigation() {
			return array(
				'wpgmp_manage_tools' => esc_html__( 'Plugin Tools', 'wp-google-map-plugin' ),
			);
		}
		/**
		 * Install table associated with Location entity.
		 *
		 * @return string SQL query to install map_locations table.
		 */
		function install() {

		}
		/**
		 * Upload backup from .sql file.
		 *
		 * @return string Success or Error response.
		 */
		public function clean_database() {
			global $_POST;

			if ( isset( $_REQUEST['_wpnonce'] ) ) {

				$nonce = sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) );

				if ( ! wp_verify_nonce( $nonce, 'wpgmp-nonce' ) ) {

					die( 'Cheating...' );

				} else {
					$data = $_POST;
				}
			}

			if ( isset( $data['wpgmp_cleandatabase_tools'] ) ) {

				if( empty($data['wpgmp_clean_consent']) || (!empty($data['wpgmp_clean_consent']) && $data['wpgmp_clean_consent'] != 'DELETE' ) ){
					$response['error'] = esc_html__( 'Please entery "DELETE" in the provided textbox and then proceed to clear plugin\'s database.', 'wp-google-map-plugin' );
					return $response;
				}  

				if ( !empty( $data['wpgmp_clean_consent'] ) && $data['wpgmp_clean_consent'] == 'DELETE' ) {

					$backup_tables = array( TBL_LOCATION, TBL_GROUPMAP, TBL_MAP, TBL_ROUTES );
					$connection    = FlipperCode_Database::connect();
					foreach ( $backup_tables as  $table ) {
						$this->query = $connection->prepare( "DELETE FROM $table where %d", 1 );
						FlipperCode_Database::non_query( $this->query, $connection );
					}

					$response['success'] = esc_html__( 'All the saved locations, marker categories, routes and maps were removed.', 'wp-google-map-plugin' );
				} 
			} else {

				$response['error'] = esc_html__( 'Something went wrong. Please try again.', 'wp-google-map-plugin' );
			}
			return $response;

		}
		/**
		 * Take backup to .sql file.
		 *
		 * @return string Success or Error response.
		 */
		public function upload_sampledata() {

			if ( isset( $_REQUEST['_wpnonce'] ) ) {

				$nonce = sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) );

				if ( ! wp_verify_nonce( $nonce, 'wpgmp-nonce' ) ) {

					die( 'Cheating...' );

				} else {
					$data = $_POST;
				}
			}
			if ( isset( $_POST['wpgmp_sampledata_consent'] ) ) {

				if ( isset( $data['wpgmp_sampledata_consent'] ) && $data['wpgmp_sampledata_consent'] == 'YES' ) {

					global $wpdb;

					$success = true;

					$category_ids = array();

					$sample_data             = array();
				
					$sample_data['category'] = array(
						'Universities'     => array(WPGMP_IMAGES . '/icons/university.png', 1),
						'Tech Companies'   => array(WPGMP_IMAGES . '/icons/company.png', 2),
					);

					foreach ( $sample_data['category'] as $title => $category ) {
						$sdata                      = array();
						$sdata['group_map_title']   = $title;
						$sdata['group_parent']      = 0;
						$sdata['group_marker']      = wp_unslash( $category[0] );
						$sdata['extensions_fields'] = serialize( wp_unslash( array( 'cat_order' => $category[1] ) ) );
						$category_ids[]             = FlipperCode_Database::insert_or_update( TBL_GROUPMAP, $sdata, $where = '' );
					}

				
					$sample_data['locations'] = array(
						'San Diego State University' => array(
							'5500 Campanile Dr, San Diego, CA 92182, United States',
							'32.7757217',
							'-117.0718893',
							$category_ids[0],
							'A public research university known for its vibrant campus and strong academic programs.',
							'San Diego',
							'CA',
							'United States'
						),
						'Google HQ' => array(
							'1600 Amphitheatre Parkway, Mountain View, CA, United States',
							'37.4220656',
							'-122.0840897',
							$category_ids[1],
							'Google’s global headquarters in Silicon Valley, home to innovation and cutting-edge technology.',
							'Mountain View',
							'CA',
							'United States'
						),
						'University of Virginia' => array(
							'1827 University Ave, Charlottesville, VA 22903, United States',
							'38.0335529',
							'-78.5079772',
							$category_ids[0],
							'A historic university founded by Thomas Jefferson, known for its architecture and research.',
							'Charlottesville',
							'VA',
							'United States'
						),
						'Microsoft Campus' => array(
							'1 Microsoft Way, Redmond, WA 98052, United States',
							'47.6396205',
							'-122.1282706',
							$category_ids[1],
							'Microsoft’s corporate campus featuring offices, labs, and visitor centers.',
							'Redmond',
							'WA',
							'United States'
						),
						'Texas A&M University' => array(
							'400 Bizzell St, College Station, TX 77843, United States',
							'30.6183558',
							'-96.3365232',
							$category_ids[0],
							'One of the largest universities in the U.S., known for engineering and agricultural sciences.',
							'College Station',
							'TX',
							'United States'
						),
					);
					
					$before_image = '<img src="' . WPGMP_IMAGES . '/sample.jpg" alt="Location Image" 
					style="width:100%; height:auto; margin-bottom:10px; border-radius:5px;" />';
					
					$before_image = '';
					
					$after_buttons = '<div class="wpgmp-actions">
      <a href="https://www.google.com/maps/dir/?api=1&destination={marker_latitude},{marker_longitude}" target="_blank" target="_blank" class="wpgmp-action-link">Get Directions</a>
      <a href="https://www.wpmapspro.com" target="_blank" class="wpgmp-action-link">Visit Website</a>
    </div>';

	

					

					foreach ( $sample_data['locations'] as $title => $location ) {

						$after_buttons = str_replace('{marker_latitude}',$location[1],$after_buttons);
						$after_buttons = str_replace('{marker_longitude}',$location[2],$after_buttons);
	
						$sdata                       = array();
						$sdata['location_messages']  = $before_image.wp_unslash( $location[4] ).$after_buttons;
						$sdata['location_group_map'] = serialize( wp_unslash( array( $location[3] ) ) );
						$sdata['location_title']     = $title;
						$sdata['location_address']   = $location[0];
						$sdata['location_latitude']  = $location[1];
						$sdata['location_longitude'] = $location[2];
						$sdata['location_city']      = $location[5];
						$sdata['location_state']     = $location[6];
						$sdata['location_country']   = $location[7];
						$sdata['location_author']    = get_current_user_id();
						$location_ids[]              = FlipperCode_Database::insert_or_update( TBL_LOCATION, $sdata, $where = '' );
					}

				
					$sample_data['routes'] = array(
						'SDSU to Google HQ' => array('#4285F4', 1, 8, 'DRIVING', 'METRIC', $location_ids[0], $location_ids[1]),
						'UVA to Microsoft HQ' => array('#34A853', 1, 8, 'DRIVING', 'METRIC', $location_ids[2], $location_ids[3]),
					);
					

					foreach ( $sample_data['routes'] as $title => $route ) {

						$sdata                         = array();
						$sdata['route_way_points']     = serialize( array() );
						$sdata['route_title']          = $title;
						$sdata['route_stroke_color']   = $route[0];
						$sdata['route_stroke_opacity'] = $route[1];
						$sdata['route_stroke_weight']  = $route[2];
						$sdata['route_travel_mode']    = $route[3];
						$sdata['route_unit_system']    = $route[4];
						$sdata['route_start_location'] = $route[5];
						$sdata['route_end_location']   = $route[6];

						$routes_ids[] = FlipperCode_Database::insert_or_update( TBL_ROUTES, $sdata, $where = '' );
					}

					$sample_data['maps'] = array(

						'map 1' => 'Tzo4OiJzdGRDbGFzcyI6MjI6e3M6NjoibWFwX2lkIjtzOjI6IjMyIjtzOjk6Im1hcF90aXRsZSI7czoxODoiQWxsIEluIE9uZSBMaXN0aW5nIjtzOjk6Im1hcF93aWR0aCI7czowOiIiO3M6MTA6Im1hcF9oZWlnaHQiO3M6MzoiNDAwIjtzOjE0OiJtYXBfem9vbV9sZXZlbCI7czoxOiIzIjtzOjg6Im1hcF90eXBlIjtzOjc6IlJPQURNQVAiO3M6MTk6Im1hcF9zY3JvbGxpbmdfd2hlZWwiO3M6NToiZmFsc2UiO3M6MTg6Im1hcF92aXN1YWxfcmVmcmVzaCI7TjtzOjEzOiJtYXBfNDVpbWFnZXJ5IjtzOjA6IiI7czoyMzoibWFwX3N0cmVldF92aWV3X3NldHRpbmciO2E6Mjp7czoxMToicG92X2hlYWRpbmciO3M6MDoiIjtzOjk6InBvdl9waXRjaCI7czowOiIiO31zOjI3OiJtYXBfcm91dGVfZGlyZWN0aW9uX3NldHRpbmciO2E6Mjp7czoxNToicm91dGVfZGlyZWN0aW9uIjtzOjQ6InRydWUiO3M6MTU6InNwZWNpZmljX3JvdXRlcyI7YToyOntpOjA7czoyOiIxNiI7aToxO3M6MjoiMTciO319czoxNToibWFwX2FsbF9jb250cm9sIjthOjEwMzp7czoxNzoibWFwX21pbnpvb21fbGV2ZWwiO3M6MToiMCI7czoxNzoibWFwX21heHpvb21fbGV2ZWwiO3M6MjoiMTkiO3M6MjM6Inpvb21fbGV2ZWxfYWZ0ZXJfc2VhcmNoIjtzOjI6IjEwIjtzOjc6Imdlc3R1cmUiO3M6NDoiYXV0byI7czo3OiJzY3JlZW5zIjthOjM6e3M6MTE6InNtYXJ0cGhvbmVzIjthOjM6e3M6MTY6Im1hcF93aWR0aF9tb2JpbGUiO3M6MDoiIjtzOjE3OiJtYXBfaGVpZ2h0X21vYmlsZSI7czowOiIiO3M6MjE6Im1hcF96b29tX2xldmVsX21vYmlsZSI7czoxOiI1Ijt9czo1OiJpcGFkcyI7YTozOntzOjE2OiJtYXBfd2lkdGhfbW9iaWxlIjtzOjA6IiI7czoxNzoibWFwX2hlaWdodF9tb2JpbGUiO3M6MDoiIjtzOjIxOiJtYXBfem9vbV9sZXZlbF9tb2JpbGUiO3M6MToiNSI7fXM6MTM6ImxhcmdlLXNjcmVlbnMiO2E6Mzp7czoxNjoibWFwX3dpZHRoX21vYmlsZSI7czowOiIiO3M6MTc6Im1hcF9oZWlnaHRfbW9iaWxlIjtzOjA6IiI7czoyMToibWFwX3pvb21fbGV2ZWxfbW9iaWxlIjtzOjE6IjUiO319czoxOToibWFwX2NlbnRlcl9sYXRpdHVkZSI7czo5OiIzNy4wNzk3NDQiO3M6MjA6Im1hcF9jZW50ZXJfbG9uZ2l0dWRlIjtzOjEwOiItOTAuMzAzODUyIjtzOjIzOiJjZW50ZXJfY2lyY2xlX2ZpbGxjb2xvciI7czo3OiIjOENBRUYyIjtzOjI1OiJjZW50ZXJfY2lyY2xlX2ZpbGxvcGFjaXR5IjtzOjI6Ii41IjtzOjI1OiJjZW50ZXJfY2lyY2xlX3N0cm9rZWNvbG9yIjtzOjc6IiM4Q0FFRjIiO3M6Mjc6ImNlbnRlcl9jaXJjbGVfc3Ryb2tlb3BhY2l0eSI7czoyOiIuNSI7czoyNjoiY2VudGVyX2NpcmNsZV9zdHJva2V3ZWlnaHQiO3M6MToiMSI7czoyMDoiY2VudGVyX2NpcmNsZV9yYWRpdXMiO3M6MToiNSI7czoyOToic2hvd19jZW50ZXJfbWFya2VyX2luZm93aW5kb3ciO3M6MDoiIjtzOjE4OiJtYXJrZXJfY2VudGVyX2ljb24iO3M6MTAxOiJodHRwOi8vMTI3LjAuMC4xL2ZjbGFicy93cGdtcC93cC1jb250ZW50L3BsdWdpbnMvd3AtZ29vZ2xlLW1hcC1nb2xkL2Fzc2V0cy9pbWFnZXMvL2RlZmF1bHRfbWFya2VyLnBuZyI7czoyMDoid3BnbXBfYWNmX2ZpZWxkX25hbWUiO3M6MDoiIjtzOjIxOiJpbmZvd2luZG93X29wZW5vcHRpb24iO3M6NToiY2xpY2siO3M6MTk6Im1hcmtlcl9kZWZhdWx0X2ljb24iO3M6MTMwOToiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9VVRGLTgsJTNDc3ZnJTIwdmVyc2lvbiUzRCUyMjEuMSUyMiUyMHhtbG5zJTNEJTIyaHR0cCUzQSUyRiUyRnd3dy53My5vcmclMkYyMDAwJTJGc3ZnJTIyJTIweG1sbnMlM0F4bGluayUzRCUyMmh0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMTk5OSUyRnhsaW5rJTIyJTIweCUzRCUyMjBweCUyMiUyMHklM0QlMjIwcHglMjIlMjB2aWV3Qm94JTNEJTIyMCUyMDAlMjA1MTIlMjA1MTIlMjIlMjBzdHlsZSUzRCUyMmVuYWJsZS1iYWNrZ3JvdW5kJTNBbmV3JTIwMCUyMDAlMjA1MTIlMjA1MTIlM0IlMjIlMjB4bWwlM0FzcGFjZSUzRCUyMnByZXNlcnZlJTIyJTNFJTBBJTNDc3R5bGUlMjB0eXBlJTNEJTIydGV4dCUyRmNzcyUyMiUzRSUwQSUwOS5zdmdfZmRxMHBhLXN0MCU3QmZpbGwlM0ElMjAlMjNkMTRiNGIlM0JzdHJva2UlM0ElMjAlMjMwMDAwMDAlM0JzdHJva2Utd2lkdGglM0ElMjAwJTNCc3Ryb2tlLW1pdGVybGltaXQlM0ExMCUzQiU3RCUwQSUzQyUyRnN0eWxlJTNFJTBBJTNDZyUyMGlkJTNEJTIyTGF5ZXJfMSUyMiUzRSUwQSUwOSUzQ3BhdGglMjBjbGFzcyUzRCUyMnN2Z19mZHEwcGEtc3QwJTIyJTIwZCUzRCUyMk0zMTkuOSUyQzMwLjFDMjU0LTUuMyUyQzE2NS42JTJDMjMuMiUyQzEyOSUyQzg3LjRjLTE2LjQlMkMyNi44LTIzLjUlMkM1OC40LTIxLjclMkM4OS42YzIuMiUyQzM2LjklMkMxNy45JTJDNzEuNiUyQzQyLjklMkM5OC45JTBBJTA5JTA5YzU0LjQlMkM1OS42JTJDNzkuOSUyQzEzOC42JTJDMTAwJTJDMjE1LjZjMS40JTJDNS4yJTJDOC43JTJDNS4yJTJDMTAuMSUyQzAuMWMxNi42LTU5LjclMkMzNS41LTExOS4zJTJDNjcuNC0xNzIuN2MyMC43LTMzLjglMkM1NC41LTU4LjclMkM2Ny45LTk3JTBBJTA5JTA5QzQyMi4zJTJDMTUwLjQlMkMzODkuNyUyQzYyLjYlMkMzMTkuOSUyQzMwLjF6JTIwTTI1NiUyQzI4MC40Yy02NC4zJTJDMC0xMTYuNS01Mi4xLTExNi41LTExNi41YzAtNjQuMyUyQzUyLjEtMTE2LjUlMkMxMTYuNS0xMTYuNSUwQSUwOSUwOXMxMTYuNSUyQzUyLjElMkMxMTYuNSUyQzExNi41QzM3Mi41JTJDMjI4LjIlMkMzMjAuMyUyQzI4MC40JTJDMjU2JTJDMjgwLjR6JTIyJTNFJTNDJTJGcGF0aCUzRSUwQSUzQyUyRmclM0UlMEElM0NnJTIwaWQlM0QlMjJMYXllcl8yJTIyJTNFJTBBJTA5JTNDY2lyY2xlJTIwY2xhc3MlM0QlMjJzdmdfZmRxMHBhLXN0MCUyMiUyMGN4JTNEJTIyMjU2JTIyJTIwY3klM0QlMjIxNjMuOSUyMiUyMHIlM0QlMjI5Mi41JTIyJTNFJTNDJTJGY2lyY2xlJTNFJTBBJTNDJTJGZyUzRSUwQSUzQyUyRnN2ZyUzRSI7czoyNzoiaW5mb3dpbmRvd19ib3VuY2VfYW5pbWF0aW9uIjtzOjA6IiI7czoyMDoiaW5mb3dpbmRvd196b29tbGV2ZWwiO3M6MDoiIjtzOjE2OiJpbmZvd2luZG93X3dpZHRoIjtzOjA6IiI7czoyMzoiaW5mb3dpbmRvd19ib3JkZXJfY29sb3IiO3M6MToiIyI7czoyNDoiaW5mb3dpbmRvd19ib3JkZXJfcmFkaXVzIjtzOjA6IiI7czoxOToiaW5mb3dpbmRvd19iZ19jb2xvciI7czoxOiIjIjtzOjI0OiJsb2NhdGlvbl9pbmZvd2luZG93X3NraW4iO2E6Mzp7czo0OiJuYW1lIjtzOjU6InVkaW5lIjtzOjQ6InR5cGUiO3M6MTA6ImluZm93aW5kb3ciO3M6MTA6InNvdXJjZWNvZGUiO3M6NjkzOiImbHQ7ZGl2IGNsYXNzPSZxdW90O2ZjLWl0ZW0tYm94IGZjLWl0ZW0tbm8tcGFkZGluZyZxdW90OyZndDsNCiAgICB7bWFya2VyX2ltYWdlfQ0KICAgICZsdDtkaXYgY2xhc3M9JnF1b3Q7ZmMtaXRlbWNvbnRlbnQtcGFkZGluZyZxdW90OyZndDsNCiAgICAgICAgJmx0O2RpdiBjbGFzcz0mcXVvdDtmYy1pdGVtLXBhZGRpbmctY29udGVudF8yMCZxdW90OyZndDsNCiAgICAgICAgICAgICZsdDtkaXYgY2xhc3M9JnF1b3Q7ZmMtaXRlbS1tZXRhIGZjLWl0ZW0tc2Vjb25kYXJ5LXRleHQtY29sb3IgZmMtaXRlbS10b3Atc3BhY2UgZmMtdGV4dC1jZW50ZXImcXVvdDsmZ3Q7e21hcmtlcl9jYXRlZ29yeX0mbHQ7L2RpdiZndDsNCiAgICAgICAgICAgICZsdDtkaXYgY2xhc3M9JnF1b3Q7ZmMtaXRlbS10aXRsZSBmYy1pdGVtLXByaW1hcnktdGV4dC1jb2xvciBmYy10ZXh0LWNlbnRlciZxdW90OyZndDt7bWFya2VyX3RpdGxlfSZsdDsvZGl2Jmd0Ow0KICAgICAgICAgICAgJmx0O2RpdiBjbGFzcz0mcXVvdDtmYy1pdGVtLWNvbnRlbnQgZmMtaXRlbS1ib2R5LXRleHQtY29sb3IgZmMtaXRlbS10b3Atc3BhY2UmcXVvdDsmZ3Q7DQogICAgICAgICAgICAgICAge21hcmtlcl9tZXNzYWdlfQ0KICAgICAgICAgICAgJmx0Oy9kaXYmZ3Q7DQoNCiAgICAgICAgJmx0Oy9kaXYmZ3Q7DQogICAgJmx0Oy9kaXYmZ3Q7DQombHQ7L2RpdiZndDsiO31zOjIwOiJwb3N0X2luZm93aW5kb3dfc2tpbiI7YTozOntzOjQ6Im5hbWUiO3M6NToidWRpbmUiO3M6NDoidHlwZSI7czo0OiJwb3N0IjtzOjEwOiJzb3VyY2Vjb2RlIjtzOjY5NDoiJmx0O2RpdiBjbGFzcz0mcXVvdDtmYy1pdGVtLWJveCBmYy1pdGVtLW5vLXBhZGRpbmcmcXVvdDsmZ3Q7DQogICAge3Bvc3RfZmVhdHVyZWRfaW1hZ2V9DQogICAgJmx0O2RpdiBjbGFzcz0mcXVvdDtmYy1pdGVtY29udGVudC1wYWRkaW5nJnF1b3Q7Jmd0Ow0KICAgICAgICAmbHQ7ZGl2IGNsYXNzPSZxdW90O2ZjLWl0ZW0tcGFkZGluZy1jb250ZW50XzIwJnF1b3Q7Jmd0Ow0KICAgICAgICAgICAgJmx0O2RpdiBjbGFzcz0mcXVvdDtmYy1pdGVtLW1ldGEgZmMtaXRlbS1zZWNvbmRhcnktdGV4dC1jb2xvciBmYy1pdGVtLXRvcC1zcGFjZSBmYy10ZXh0LWNlbnRlciZxdW90OyZndDt7cG9zdF9jYXRlZ29yaWVzfSZsdDsvZGl2Jmd0Ow0KICAgICAgICAgICAgJmx0O2RpdiBjbGFzcz0mcXVvdDtmYy1pdGVtLXRpdGxlIGZjLWl0ZW0tcHJpbWFyeS10ZXh0LWNvbG9yIGZjLXRleHQtY2VudGVyJnF1b3Q7Jmd0O3twb3N0X3RpdGxlfSZsdDsvZGl2Jmd0Ow0KICAgICAgICAgICAgJmx0O2RpdiBjbGFzcz0mcXVvdDtmYy1pdGVtLWNvbnRlbnQgZmMtaXRlbS1ib2R5LXRleHQtY29sb3IgZmMtaXRlbS10b3Atc3BhY2UmcXVvdDsmZ3Q7DQogICAgICAgICAgICAgICAge3Bvc3RfZXhjZXJwdH0NCiAgICAgICAgICAgICZsdDsvZGl2Jmd0Ow0KICAgICAgICAmbHQ7L2RpdiZndDsNCiAgICAmbHQ7L2RpdiZndDsNCiZsdDsvZGl2Jmd0OyI7fXM6MjM6ImRpc3BsYXlfbWFya2VyX2NhdGVnb3J5IjtzOjQ6InRydWUiO3M6MTg6IndwZ21wX2NhdGVnb3J5X3RhYiI7czo0OiJ0cnVlIjtzOjI0OiJ3cGdtcF9jYXRlZ29yeV90YWJfdGl0bGUiO3M6MTA6IkNhdGVnb3JpZXMiO3M6MjA6IndwZ21wX2NhdGVnb3J5X29yZGVyIjtzOjU6InRpdGxlIjtzOjM0OiJ3cGdtcF9jYXRlZ29yeV9sb2NhdGlvbl9zb3J0X29yZGVyIjtzOjM6ImFzYyI7czoxOToid3BnbXBfZGlyZWN0aW9uX3RhYiI7czo0OiJ0cnVlIjtzOjI1OiJ3cGdtcF9kaXJlY3Rpb25fdGFiX3RpdGxlIjtzOjEwOiJEaXJlY3Rpb25zIjtzOjE5OiJ3cGdtcF91bml0X3NlbGVjdGVkIjtzOjI6ImttIjtzOjI1OiJ3cGdtcF9kaXJlY3Rpb25fdGFiX3N0YXJ0IjtzOjc6InRleHRib3giO3M6MzM6IndwZ21wX2RpcmVjdGlvbl90YWJfc3RhcnRfZGVmYXVsdCI7czowOiIiO3M6MjM6IndwZ21wX2RpcmVjdGlvbl90YWJfZW5kIjtzOjc6InRleHRib3giO3M6MzE6IndwZ21wX2RpcmVjdGlvbl90YWJfZW5kX2RlZmF1bHQiO3M6MDoiIjtzOjIyOiJ3cGdtcF9uZWFyYnlfdGFiX3RpdGxlIjtzOjEzOiJOZWFyYnkgUGxhY2VzIjtzOjIzOiJuZWFyYnlfY2lyY2xlX2ZpbGxjb2xvciI7czo3OiIjOENBRUYyIjtzOjI1OiJuZWFyYnlfY2lyY2xlX2ZpbGxvcGFjaXR5IjtzOjI6Ii41IjtzOjI1OiJuZWFyYnlfY2lyY2xlX3N0cm9rZWNvbG9yIjtzOjc6IiM4Q0FFRjIiO3M6Mjc6Im5lYXJieV9jaXJjbGVfc3Ryb2tlb3BhY2l0eSI7czoyOiIuNSI7czoyNjoibmVhcmJ5X2NpcmNsZV9zdHJva2V3ZWlnaHQiO3M6MToiMSI7czoxODoibmVhcmJ5X2NpcmNsZV96b29tIjtzOjE6IjgiO3M6MTU6IndwZ21wX3JvdXRlX3RhYiI7czo0OiJ0cnVlIjtzOjIxOiJ3cGdtcF9yb3V0ZV90YWJfdGl0bGUiO3M6NjoiUm91dGVzIjtzOjE1OiJkaXNwbGF5X2xpc3RpbmciO3M6NDoidHJ1ZSI7czoxODoibGlzdGluZ19vcGVub3B0aW9uIjtzOjU6ImNsaWNrIjtzOjIwOiJ3cGdtcF9zZWFyY2hfZGlzcGxheSI7czo0OiJ0cnVlIjtzOjI3OiJ3cGdtcF9zZWFyY2hiYXJfcGxhY2Vob2xkZXIiO3M6MDoiIjtzOjI1OiJ3cGdtcF9zZWFyY2hfcGxhY2Vob2xkZXJzIjtzOjA6IiI7czoyNjoid3BnbXBfZXhjbHVkZV9wbGFjZWhvbGRlcnMiO3M6MDoiIjtzOjI0OiJzZWFyY2hfZmllbGRfYXV0b3N1Z2dlc3QiO3M6NDoidHJ1ZSI7czoyOToid3BnbXBfZGlzcGxheV9jYXRlZ29yeV9maWx0ZXIiO3M6NDoidHJ1ZSI7czoyNjoid3BnbXBfY2F0ZWdvcnlfcGxhY2Vob2xkZXIiO3M6MDoiIjtzOjI4OiJ3cGdtcF9kaXNwbGF5X3NvcnRpbmdfZmlsdGVyIjtzOjQ6InRydWUiO3M6Mjc6IndwZ21wX2Rpc3BsYXlfcmFkaXVzX2ZpbHRlciI7czo0OiJ0cnVlIjtzOjIyOiJ3cGdtcF9yYWRpdXNfZGltZW5zaW9uIjtzOjU6Im1pbGVzIjtzOjIwOiJ3cGdtcF9yYWRpdXNfb3B0aW9ucyI7czoyODoiNSwxMCwxNSwyMCwyNSw1MCwxMDAsMjAwLDUwMCI7czozODoid3BnbXBfZGlzcGxheV9sb2NhdGlvbl9wZXJfcGFnZV9maWx0ZXIiO3M6NDoidHJ1ZSI7czoyNjoid3BnbXBfZGlzcGxheV9wcmludF9vcHRpb24iO3M6NDoidHJ1ZSI7czoyMDoid3BnbXBfbGlzdGluZ19udW1iZXIiO3M6MjoiMTAiO3M6MjA6IndwZ21wX2JlZm9yZV9saXN0aW5nIjtzOjEzOiJNYXAgTG9jYXRpb25zIjtzOjE1OiJ3cGdtcF9saXN0X2dyaWQiO3M6MTg6IndwZ21wX2xpc3RpbmdfbGlzdCI7czoyNToid3BnbXBfY2F0ZWdvcnlkaXNwbGF5c29ydCI7czo1OiJ0aXRsZSI7czoyNzoid3BnbXBfY2F0ZWdvcnlkaXNwbGF5c29ydGJ5IjtzOjM6ImFzYyI7czoyMDoid3BnbXBfZGVmYXVsdF9yYWRpdXMiO3M6MzoiMTAwIjtzOjMwOiJ3cGdtcF9kZWZhdWx0X3JhZGl1c19kaW1lbnNpb24iO3M6NToibWlsZXMiO3M6OToiaXRlbV9za2luIjthOjM6e3M6NDoibmFtZSI7czo0OiJhYXJlIjtzOjQ6InR5cGUiO3M6NDoiaXRlbSI7czoxMDoic291cmNlY29kZSI7czoxMzUyOiImbHQ7ZGl2IGNsYXNzPSZxdW90O2ZjLWl0ZW0tYm94IGZjLWNvbXBvbmVudC0yIHdwZ21wX2xvY2F0aW9ucyAmcXVvdDsmZ3Q7DQogICAgJmx0O2RpdiBjbGFzcz0mcXVvdDtmYy1jb21wb25lbnQtYmxvY2smcXVvdDsmZ3Q7DQogICAgICAgICZsdDtkaXYgY2xhc3M9JnF1b3Q7ZmMtY29tcG9uZW50LWNvbnRlbnQmcXVvdDsmZ3Q7DQogICAgICAgICAgICAmbHQ7dWwmZ3Q7DQogICAgICAgICAgICAgICAgJmx0O2xpIGNsYXNzPSZxdW90O2ZjLWl0ZW0tZmVhdHVyZWQgZmMtY29tcG9uZW50LXRodW1iIGZjLWl0ZW0tdG9wX3NwYWNlJnF1b3Q7Jmd0Ow0KICAgICAgICAgICAgICAgICAgICAmbHQ7ZGl2IGNsYXNzPSZxdW90O2ZjLWZlYXR1cmVkLWhvdmVyZGl2JnF1b3Q7Jmd0Ow0KICAgICAgICAgICAgICAgICAgICAgICAgJmx0O2RpdiBjbGFzcz0mcXVvdDtmYy1mZWF0dXJlZC1ob3ZlcmlubmVyICZxdW90OyZndDsmbHQ7YSB7b25jbGlja19hY3Rpb259IGNsYXNzPSZxdW90O21hcCZxdW90OyZndDsmbHQ7L2EmZ3Q7Jmx0Oy9kaXYmZ3Q7DQogICAgICAgICAgICAgICAgICAgICAgICB7bWFya2VyX2ltYWdlfQ0KICAgICAgICAgICAgICAgICAgICAmbHQ7L2RpdiZndDsNCiAgICAgICAgICAgICAgICAmbHQ7L2xpJmd0Ow0KDQogICAgICAgICAgICAgICAgJmx0O2xpIGNsYXNzPSZxdW90O2ZjLWNvbXBvbmVudC10ZXh0JnF1b3Q7Jmd0Ow0KICAgICAgICAgICAgICAgICAgICAmbHQ7ZGl2IGNsYXNzPSZxdW90O2ZjLWl0ZW1jb250ZW50LXBhZGRpbmcmcXVvdDsmZ3Q7DQogICAgICAgICAgICAgICAgICAgICAgICAmbHQ7ZGl2IGNsYXNzPSZxdW90O2ZjLWl0ZW0tdGl0bGUgZmMtaXRlbS1wcmltYXJ5LXRleHQtY29sb3IgJnF1b3Q7Jmd0O3ttYXJrZXJfdGl0bGV9Jmx0Oy9kaXYmZ3Q7DQogICAgICAgICAgICAgICAgICAgICAgICAmbHQ7ZGl2IGNsYXNzPSZxdW90O2ZjLWl0ZW0tY29udGVudCBmYy1pdGVtLWJvZHktdGV4dC1jb2xvciZxdW90OyZndDsNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bWFya2VyX21lc3NhZ2V9DQogICAgICAgICAgICAgICAgICAgICAgICAmbHQ7L2RpdiZndDsNCiAgICAgICAgICAgICAgICAgICAgICAgICZsdDthIHtvbmNsaWNrX2FjdGlvbn0gY2xhc3M9JnF1b3Q7cmVhZC1tb3JlIGZjLWl0ZW0tcHJpbWFyeS10ZXh0LWNvbG9yIGZjLWNzcyZxdW90OyZndDtSZWFkIE1vcmUmbHQ7L2EmZ3Q7DQogICAgICAgICAgICAgICAgICAgICZsdDsvZGl2Jmd0Ow0KICAgICAgICAgICAgICAgICZsdDsvbGkmZ3Q7DQogICAgICAgICAgICAmbHQ7L3VsJmd0Ow0KICAgICAgICAmbHQ7L2RpdiZndDsNCiAgICAmbHQ7L2RpdiZndDsNCiZsdDsvZGl2Jmd0OyI7fXM6MTQ6ImN1c3RvbV9maWx0ZXJzIjthOjA6e31zOjE2OiJmaWx0ZXJzX3Bvc2l0aW9uIjtzOjc6ImRlZmF1bHQiO3M6MjE6Im1hcF9yZXNldF9idXR0b25fdGV4dCI7czo1OiJSZXNldCI7czoxOToiYXBwbHlfY3VzdG9tX2Rlc2lnbiI7czo0OiJ0cnVlIjtzOjE2OiJ3cGdtcF9jdXN0b21fY3NzIjtzOjA6IiI7czoyMDoid3BnbXBfYmFzZV9mb250X3NpemUiO3M6NDoiMTRweCI7czoxMjoiY29sb3Jfc2NoZW1hIjtzOjE1OiIjMjEyRjNEXyMyMTIxMjEiO3M6MTk6IndwZ21wX3ByaW1hcnlfY29sb3IiO3M6MToiIyI7czoyMToid3BnbXBfc2Vjb25kYXJ5X2NvbG9yIjtzOjE6IiMiO3M6MTI6ImN1c3RvbV9zdHlsZSI7czowOiIiO3M6MjE6Inpvb21fY29udHJvbF9wb3NpdGlvbiI7czo4OiJUT1BfTEVGVCI7czoxODoiem9vbV9jb250cm9sX3N0eWxlIjtzOjU6IkxBUkdFIjtzOjI1OiJtYXBfdHlwZV9jb250cm9sX3Bvc2l0aW9uIjtzOjk6IlRPUF9SSUdIVCI7czoyMjoibWFwX3R5cGVfY29udHJvbF9zdHlsZSI7czoxNDoiSE9SSVpPTlRBTF9CQVIiO3M6Mjg6ImZ1bGxfc2NyZWVuX2NvbnRyb2xfcG9zaXRpb24iO3M6OToiVE9QX1JJR0hUIjtzOjI4OiJzdHJlZXRfdmlld19jb250cm9sX3Bvc2l0aW9uIjtzOjg6IlRPUF9MRUZUIjtzOjIzOiJjYW1lcmFfY29udHJvbF9wb3NpdGlvbiI7czo4OiJUT1BfTEVGVCI7czoyMzoic2VhcmNoX2NvbnRyb2xfcG9zaXRpb24iO3M6ODoiVE9QX0xFRlQiO3M6MjU6ImxvY2F0ZW1lX2NvbnRyb2xfcG9zaXRpb24iO3M6ODoiVE9QX0xFRlQiO3M6MjA6Im1hcF9jb250cm9sX3NldHRpbmdzIjthOjA6e31zOjEzOiJmcm9tX2xhdGl0dWRlIjtzOjA6IiI7czoxNDoiZnJvbV9sb25naXR1ZGUiO3M6MDoiIjtzOjExOiJ0b19sYXRpdHVkZSI7czowOiIiO3M6MTI6InRvX2xvbmdpdHVkZSI7czowOiIiO3M6MTA6Inpvb21fbGV2ZWwiO3M6MToiMSI7czoxOToiZ21fcmFkaXVzX2RpbWVuc2lvbiI7czo1OiJtaWxlcyI7czo5OiJnbV9yYWRpdXMiO3M6MzoiMTAwIjtzOjExOiJnZW9qc29uX3VybCI7czowOiIiO3M6MTY6ImZjX2N1c3RvbV9zdHlsZXMiO3M6NjI0NToieyIwIjp7ImluZm93aW5kb3ctdWRpbmUiOnsiZmMtaXRlbS1ib3guZmMtaXRlbS1uby1wYWRkaW5nIjoiYmFja2dyb3VuZC1pbWFnZTpub25lO2ZvbnQtZmFtaWx5OkludGVyLCBzZXJpZjtmb250LXdlaWdodDo0MDA7Zm9udC1zaXplOjE0cHg7Y29sb3I6cmdiKDExOSwgMTE5LCAxMTkpO2xpbmUtaGVpZ2h0OjE4cHg7YmFja2dyb3VuZC1jb2xvcjpyZ2IoMjU1LCAyNTUsIDI1NSk7Zm9udC1zdHlsZTpub3JtYWw7dGV4dC1hbGlnbjpzdGFydDt0ZXh0LWRlY29yYXRpb246bm9uZSBzb2xpZCByZ2IoMTE5LCAxMTksIDExOSk7bWFyZ2luLXRvcDowcHg7bWFyZ2luLWJvdHRvbTowcHg7bWFyZ2luLWxlZnQ6MHB4O21hcmdpbi1yaWdodDowcHg7cGFkZGluZy10b3A6MHB4O3BhZGRpbmctYm90dG9tOjBweDtwYWRkaW5nLWxlZnQ6MHB4O3BhZGRpbmctcmlnaHQ6MHB4OyJ9fSwiMSI6eyJpbmZvd2luZG93LXVkaW5lIjp7ImZjLWl0ZW0tbWV0YS5mYy1pdGVtLXNlY29uZGFyeS10ZXh0LWNvbG9yLmZjLWl0ZW0tdG9wLXNwYWNlLmZjLXRleHQtY2VudGVyIjoiYmFja2dyb3VuZC1pbWFnZTpub25lO2ZvbnQtZmFtaWx5OkludGVyLCBzZXJpZjtmb250LXdlaWdodDo0MDA7Zm9udC1zaXplOjE0cHg7Y29sb3I6cmdiKDExOSwgMTE5LCAxMTkpO2xpbmUtaGVpZ2h0OjE4cHg7YmFja2dyb3VuZC1jb2xvcjpyZ2JhKDAsIDAsIDAsIDApO2ZvbnQtc3R5bGU6bm9ybWFsO3RleHQtYWxpZ246Y2VudGVyO3RleHQtZGVjb3JhdGlvbjpub25lIHNvbGlkIHJnYigxMTksIDExOSwgMTE5KTttYXJnaW4tdG9wOjBweDttYXJnaW4tYm90dG9tOjEwcHg7bWFyZ2luLWxlZnQ6MHB4O21hcmdpbi1yaWdodDowcHg7cGFkZGluZy10b3A6MHB4O3BhZGRpbmctYm90dG9tOjBweDtwYWRkaW5nLWxlZnQ6MHB4O3BhZGRpbmctcmlnaHQ6MHB4OyJ9fSwiMiI6eyJpbmZvd2luZG93LXVkaW5lIjp7ImZjLWl0ZW0tdGl0bGUuZmMtaXRlbS1wcmltYXJ5LXRleHQtY29sb3IuZmMtdGV4dC1jZW50ZXIiOiJiYWNrZ3JvdW5kLWltYWdlOm5vbmU7Zm9udC1mYW1pbHk6SW50ZXIsIHNlcmlmO2ZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MTZweDtjb2xvcjpyZ2IoNjgsIDY4LCA2OCk7bGluZS1oZWlnaHQ6MjBweDtiYWNrZ3JvdW5kLWNvbG9yOnJnYmEoMCwgMCwgMCwgMCk7Zm9udC1zdHlsZTpub3JtYWw7dGV4dC1hbGlnbjpjZW50ZXI7dGV4dC1kZWNvcmF0aW9uOm5vbmUgc29saWQgcmdiKDY4LCA2OCwgNjgpO21hcmdpbi10b3A6MHB4O21hcmdpbi1ib3R0b206MTVweDttYXJnaW4tbGVmdDowcHg7bWFyZ2luLXJpZ2h0OjBweDtwYWRkaW5nLXRvcDowcHg7cGFkZGluZy1ib3R0b206MHB4O3BhZGRpbmctbGVmdDowcHg7cGFkZGluZy1yaWdodDowcHg7In19LCIzIjp7ImluZm93aW5kb3ctdWRpbmUiOnsiZmMtaXRlbS1jb250ZW50LmZjLWl0ZW0tYm9keS10ZXh0LWNvbG9yLmZjLWl0ZW0tdG9wLXNwYWNlIjoiYmFja2dyb3VuZC1pbWFnZTpub25lO2ZvbnQtZmFtaWx5OkludGVyLCBzZXJpZjtmb250LXdlaWdodDo0MDA7Zm9udC1zaXplOjE0cHg7Y29sb3I6cmdiKDExOSwgMTE5LCAxMTkpO2xpbmUtaGVpZ2h0OjE4cHg7YmFja2dyb3VuZC1jb2xvcjpyZ2JhKDAsIDAsIDAsIDApO2ZvbnQtc3R5bGU6bm9ybWFsO3RleHQtYWxpZ246c3RhcnQ7dGV4dC1kZWNvcmF0aW9uOm5vbmUgc29saWQgcmdiKDExOSwgMTE5LCAxMTkpO21hcmdpbi10b3A6NXB4O21hcmdpbi1ib3R0b206MTBweDttYXJnaW4tbGVmdDowcHg7bWFyZ2luLXJpZ2h0OjBweDtwYWRkaW5nLXRvcDowcHg7cGFkZGluZy1ib3R0b206MHB4O3BhZGRpbmctbGVmdDowcHg7cGFkZGluZy1yaWdodDowcHg7In19LCI0Ijp7InBvc3QtdWRpbmUiOnsiZmMtaXRlbS1ib3guZmMtaXRlbS1uby1wYWRkaW5nIjoiYmFja2dyb3VuZC1pbWFnZTpub25lO2ZvbnQtZmFtaWx5Oi1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXCJTZWdvZSBVSVwiLCBSb2JvdG8sIE94eWdlbi1TYW5zLCBVYnVudHUsIENhbnRhcmVsbCwgXCJIZWx2ZXRpY2EgTmV1ZVwiLCBzYW5zLXNlcmlmO2ZvbnQtd2VpZ2h0OjQwMDtmb250LXNpemU6MTRweDtjb2xvcjpyZ2IoMTE5LCAxMTksIDExOSk7bGluZS1oZWlnaHQ6MThweDtiYWNrZ3JvdW5kLWNvbG9yOnJnYigyNTUsIDI1NSwgMjU1KTtmb250LXN0eWxlOm5vcm1hbDt0ZXh0LWFsaWduOnN0YXJ0O3RleHQtZGVjb3JhdGlvbjpub25lIHNvbGlkIHJnYigxMTksIDExOSwgMTE5KTttYXJnaW4tdG9wOjBweDttYXJnaW4tYm90dG9tOjBweDttYXJnaW4tbGVmdDowcHg7bWFyZ2luLXJpZ2h0OjBweDtwYWRkaW5nLXRvcDowcHg7cGFkZGluZy1ib3R0b206MHB4O3BhZGRpbmctbGVmdDowcHg7cGFkZGluZy1yaWdodDowcHg7In19LCI1Ijp7InBvc3QtdWRpbmUiOnsiZmMtaXRlbS1tZXRhLmZjLWl0ZW0tc2Vjb25kYXJ5LXRleHQtY29sb3IuZmMtaXRlbS10b3Atc3BhY2UuZmMtdGV4dC1jZW50ZXIiOiJiYWNrZ3JvdW5kLWltYWdlOm5vbmU7Zm9udC1mYW1pbHk6LWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBcIlNlZ29lIFVJXCIsIFJvYm90bywgT3h5Z2VuLVNhbnMsIFVidW50dSwgQ2FudGFyZWxsLCBcIkhlbHZldGljYSBOZXVlXCIsIHNhbnMtc2VyaWY7Zm9udC13ZWlnaHQ6NDAwO2ZvbnQtc2l6ZToxNHB4O2NvbG9yOnJnYigxMTksIDExOSwgMTE5KTtsaW5lLWhlaWdodDoxOHB4O2JhY2tncm91bmQtY29sb3I6cmdiYSgwLCAwLCAwLCAwKTtmb250LXN0eWxlOm5vcm1hbDt0ZXh0LWFsaWduOmNlbnRlcjt0ZXh0LWRlY29yYXRpb246bm9uZSBzb2xpZCByZ2IoMTE5LCAxMTksIDExOSk7bWFyZ2luLXRvcDowcHg7bWFyZ2luLWJvdHRvbToxMHB4O21hcmdpbi1sZWZ0OjBweDttYXJnaW4tcmlnaHQ6MHB4O3BhZGRpbmctdG9wOjBweDtwYWRkaW5nLWJvdHRvbTowcHg7cGFkZGluZy1sZWZ0OjBweDtwYWRkaW5nLXJpZ2h0OjBweDsifX0sIjYiOnsicG9zdC11ZGluZSI6eyJmYy1pdGVtLXRpdGxlLmZjLWl0ZW0tcHJpbWFyeS10ZXh0LWNvbG9yLmZjLXRleHQtY2VudGVyIjoiYmFja2dyb3VuZC1pbWFnZTpub25lO2ZvbnQtZmFtaWx5Oi1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXCJTZWdvZSBVSVwiLCBSb2JvdG8sIE94eWdlbi1TYW5zLCBVYnVudHUsIENhbnRhcmVsbCwgXCJIZWx2ZXRpY2EgTmV1ZVwiLCBzYW5zLXNlcmlmO2ZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MTZweDtjb2xvcjpyZ2IoNjgsIDY4LCA2OCk7bGluZS1oZWlnaHQ6MjBweDtiYWNrZ3JvdW5kLWNvbG9yOnJnYmEoMCwgMCwgMCwgMCk7Zm9udC1zdHlsZTpub3JtYWw7dGV4dC1hbGlnbjpjZW50ZXI7dGV4dC1kZWNvcmF0aW9uOm5vbmUgc29saWQgcmdiKDY4LCA2OCwgNjgpO21hcmdpbi10b3A6MHB4O21hcmdpbi1ib3R0b206MTVweDttYXJnaW4tbGVmdDowcHg7bWFyZ2luLXJpZ2h0OjBweDtwYWRkaW5nLXRvcDowcHg7cGFkZGluZy1ib3R0b206MHB4O3BhZGRpbmctbGVmdDowcHg7cGFkZGluZy1yaWdodDowcHg7In19LCI3Ijp7InBvc3QtdWRpbmUiOnsiZmMtaXRlbS1jb250ZW50LmZjLWl0ZW0tYm9keS10ZXh0LWNvbG9yLmZjLWl0ZW0tdG9wLXNwYWNlIjoiYmFja2dyb3VuZC1pbWFnZTpub25lO2ZvbnQtZmFtaWx5Oi1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXCJTZWdvZSBVSVwiLCBSb2JvdG8sIE94eWdlbi1TYW5zLCBVYnVudHUsIENhbnRhcmVsbCwgXCJIZWx2ZXRpY2EgTmV1ZVwiLCBzYW5zLXNlcmlmO2ZvbnQtd2VpZ2h0OjQwMDtmb250LXNpemU6MTRweDtjb2xvcjpyZ2IoMTE5LCAxMTksIDExOSk7bGluZS1oZWlnaHQ6MThweDtiYWNrZ3JvdW5kLWNvbG9yOnJnYmEoMCwgMCwgMCwgMCk7Zm9udC1zdHlsZTpub3JtYWw7dGV4dC1hbGlnbjpzdGFydDt0ZXh0LWRlY29yYXRpb246bm9uZSBzb2xpZCByZ2IoMTE5LCAxMTksIDExOSk7bWFyZ2luLXRvcDowcHg7bWFyZ2luLWJvdHRvbTowcHg7bWFyZ2luLWxlZnQ6MHB4O21hcmdpbi1yaWdodDowcHg7cGFkZGluZy10b3A6MHB4O3BhZGRpbmctYm90dG9tOjBweDtwYWRkaW5nLWxlZnQ6MHB4O3BhZGRpbmctcmlnaHQ6MHB4OyJ9fSwiOCI6eyJpdGVtLWFhcmUiOnsiZmMtaXRlbS1ib3guZmMtY29tcG9uZW50LTIud3BnbXBfbG9jYXRpb25zIjoiYmFja2dyb3VuZC1pbWFnZTpub25lO2ZvbnQtZmFtaWx5Oi1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXCJTZWdvZSBVSVwiLCBSb2JvdG8sIE94eWdlbi1TYW5zLCBVYnVudHUsIENhbnRhcmVsbCwgXCJIZWx2ZXRpY2EgTmV1ZVwiLCBzYW5zLXNlcmlmO2ZvbnQtd2VpZ2h0OjQwMDtmb250LXNpemU6MTRweDtjb2xvcjpyZ2IoMTE5LCAxMTksIDExOSk7bGluZS1oZWlnaHQ6MThweDtiYWNrZ3JvdW5kLWNvbG9yOnJnYigyNTUsIDI1NSwgMjU1KTtmb250LXN0eWxlOm5vcm1hbDt0ZXh0LWFsaWduOnN0YXJ0O3RleHQtZGVjb3JhdGlvbjpub25lIHNvbGlkIHJnYigxMTksIDExOSwgMTE5KTttYXJnaW4tdG9wOjBweDttYXJnaW4tYm90dG9tOjBweDttYXJnaW4tbGVmdDowcHg7bWFyZ2luLXJpZ2h0OjBweDtwYWRkaW5nLXRvcDowcHg7cGFkZGluZy1ib3R0b206MHB4O3BhZGRpbmctbGVmdDowcHg7cGFkZGluZy1yaWdodDowcHg7In19LCI5Ijp7Iml0ZW0tYWFyZSI6eyJmYy1pdGVtLXRpdGxlLmZjLWl0ZW0tcHJpbWFyeS10ZXh0LWNvbG9yIjoiYmFja2dyb3VuZC1pbWFnZTpub25lO2ZvbnQtZmFtaWx5Oi1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXCJTZWdvZSBVSVwiLCBSb2JvdG8sIE94eWdlbi1TYW5zLCBVYnVudHUsIENhbnRhcmVsbCwgXCJIZWx2ZXRpY2EgTmV1ZVwiLCBzYW5zLXNlcmlmO2ZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MTZweDtjb2xvcjpyZ2IoNjgsIDY4LCA2OCk7bGluZS1oZWlnaHQ6MjBweDtiYWNrZ3JvdW5kLWNvbG9yOnJnYmEoMCwgMCwgMCwgMCk7Zm9udC1zdHlsZTpub3JtYWw7dGV4dC1hbGlnbjpsZWZ0O3RleHQtZGVjb3JhdGlvbjpub25lIHNvbGlkIHJnYig2OCwgNjgsIDY4KTttYXJnaW4tdG9wOjBweDttYXJnaW4tYm90dG9tOjEwcHg7bWFyZ2luLWxlZnQ6MHB4O21hcmdpbi1yaWdodDowcHg7cGFkZGluZy10b3A6MHB4O3BhZGRpbmctYm90dG9tOjBweDtwYWRkaW5nLWxlZnQ6MHB4O3BhZGRpbmctcmlnaHQ6MHB4OyJ9fSwiMTAiOnsiaXRlbS1hYXJlIjp7ImZjLWl0ZW0tY29udGVudC5mYy1pdGVtLWJvZHktdGV4dC1jb2xvciI6ImJhY2tncm91bmQtaW1hZ2U6bm9uZTtmb250LWZhbWlseTotYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIFwiU2Vnb2UgVUlcIiwgUm9ib3RvLCBPeHlnZW4tU2FucywgVWJ1bnR1LCBDYW50YXJlbGwsIFwiSGVsdmV0aWNhIE5ldWVcIiwgc2Fucy1zZXJpZjtmb250LXdlaWdodDo0MDA7Zm9udC1zaXplOjE0cHg7Y29sb3I6cmdiKDExOSwgMTE5LCAxMTkpO2xpbmUtaGVpZ2h0OjE4cHg7YmFja2dyb3VuZC1jb2xvcjpyZ2JhKDAsIDAsIDAsIDApO2ZvbnQtc3R5bGU6bm9ybWFsO3RleHQtYWxpZ246bGVmdDt0ZXh0LWRlY29yYXRpb246bm9uZSBzb2xpZCByZ2IoMTE5LCAxMTksIDExOSk7bWFyZ2luLXRvcDowcHg7bWFyZ2luLWJvdHRvbTowcHg7bWFyZ2luLWxlZnQ6MHB4O21hcmdpbi1yaWdodDowcHg7cGFkZGluZy10b3A6MHB4O3BhZGRpbmctYm90dG9tOjBweDtwYWRkaW5nLWxlZnQ6MHB4O3BhZGRpbmctcmlnaHQ6MHB4OyJ9fSwiMTEiOnsiaXRlbS1hYXJlIjp7InJlYWQtbW9yZS5mYy1pdGVtLXByaW1hcnktdGV4dC1jb2xvci5mYy1jc3MiOiJiYWNrZ3JvdW5kLWltYWdlOm5vbmU7Zm9udC1mYW1pbHk6LWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBcIlNlZ29lIFVJXCIsIFJvYm90bywgT3h5Z2VuLVNhbnMsIFVidW50dSwgQ2FudGFyZWxsLCBcIkhlbHZldGljYSBOZXVlXCIsIHNhbnMtc2VyaWY7Zm9udC13ZWlnaHQ6NDAwO2ZvbnQtc2l6ZToxNHB4O2NvbG9yOnJnYig2OCwgNjgsIDY4KTtsaW5lLWhlaWdodDoxOHB4O2JhY2tncm91bmQtY29sb3I6cmdiKDI1NSwgMjU1LCAyNTUpO2ZvbnQtc3R5bGU6bm9ybWFsO3RleHQtYWxpZ246bGVmdDt0ZXh0LWRlY29yYXRpb246bm9uZSBzb2xpZCByZ2IoNjgsIDY4LCA2OCk7bWFyZ2luLXRvcDoxNXB4O21hcmdpbi1ib3R0b206MHB4O21hcmdpbi1sZWZ0OjBweDttYXJnaW4tcmlnaHQ6MHB4O3BhZGRpbmctdG9wOjhweDtwYWRkaW5nLWJvdHRvbTo4cHg7cGFkZGluZy1sZWZ0OjE4cHg7cGFkZGluZy1yaWdodDoxOHB4OyJ9fX0iO3M6Mjk6Im1hcF9tYXJrZXJfc3BpZGVyZmllcl9zZXR0aW5nIjthOjE6e3M6MTU6Im1pbmltdW1fbWFya2VycyI7czoxOiIwIjt9czoxODoiaW5mb3dpbmRvd19zZXR0aW5nIjtzOjY5MzoiJmx0O2RpdiBjbGFzcz0mcXVvdDtmYy1pdGVtLWJveCBmYy1pdGVtLW5vLXBhZGRpbmcmcXVvdDsmZ3Q7DQogICAge21hcmtlcl9pbWFnZX0NCiAgICAmbHQ7ZGl2IGNsYXNzPSZxdW90O2ZjLWl0ZW1jb250ZW50LXBhZGRpbmcmcXVvdDsmZ3Q7DQogICAgICAgICZsdDtkaXYgY2xhc3M9JnF1b3Q7ZmMtaXRlbS1wYWRkaW5nLWNvbnRlbnRfMjAmcXVvdDsmZ3Q7DQogICAgICAgICAgICAmbHQ7ZGl2IGNsYXNzPSZxdW90O2ZjLWl0ZW0tbWV0YSBmYy1pdGVtLXNlY29uZGFyeS10ZXh0LWNvbG9yIGZjLWl0ZW0tdG9wLXNwYWNlIGZjLXRleHQtY2VudGVyJnF1b3Q7Jmd0O3ttYXJrZXJfY2F0ZWdvcnl9Jmx0Oy9kaXYmZ3Q7DQogICAgICAgICAgICAmbHQ7ZGl2IGNsYXNzPSZxdW90O2ZjLWl0ZW0tdGl0bGUgZmMtaXRlbS1wcmltYXJ5LXRleHQtY29sb3IgZmMtdGV4dC1jZW50ZXImcXVvdDsmZ3Q7e21hcmtlcl90aXRsZX0mbHQ7L2RpdiZndDsNCiAgICAgICAgICAgICZsdDtkaXYgY2xhc3M9JnF1b3Q7ZmMtaXRlbS1jb250ZW50IGZjLWl0ZW0tYm9keS10ZXh0LWNvbG9yIGZjLWl0ZW0tdG9wLXNwYWNlJnF1b3Q7Jmd0Ow0KICAgICAgICAgICAgICAgIHttYXJrZXJfbWVzc2FnZX0NCiAgICAgICAgICAgICZsdDsvZGl2Jmd0Ow0KDQogICAgICAgICZsdDsvZGl2Jmd0Ow0KICAgICZsdDsvZGl2Jmd0Ow0KJmx0Oy9kaXYmZ3Q7IjtzOjI2OiJpbmZvd2luZG93X2dlb3RhZ3Nfc2V0dGluZyI7czo2OTQ6IiZsdDtkaXYgY2xhc3M9JnF1b3Q7ZmMtaXRlbS1ib3ggZmMtaXRlbS1uby1wYWRkaW5nJnF1b3Q7Jmd0Ow0KICAgIHtwb3N0X2ZlYXR1cmVkX2ltYWdlfQ0KICAgICZsdDtkaXYgY2xhc3M9JnF1b3Q7ZmMtaXRlbWNvbnRlbnQtcGFkZGluZyZxdW90OyZndDsNCiAgICAgICAgJmx0O2RpdiBjbGFzcz0mcXVvdDtmYy1pdGVtLXBhZGRpbmctY29udGVudF8yMCZxdW90OyZndDsNCiAgICAgICAgICAgICZsdDtkaXYgY2xhc3M9JnF1b3Q7ZmMtaXRlbS1tZXRhIGZjLWl0ZW0tc2Vjb25kYXJ5LXRleHQtY29sb3IgZmMtaXRlbS10b3Atc3BhY2UgZmMtdGV4dC1jZW50ZXImcXVvdDsmZ3Q7e3Bvc3RfY2F0ZWdvcmllc30mbHQ7L2RpdiZndDsNCiAgICAgICAgICAgICZsdDtkaXYgY2xhc3M9JnF1b3Q7ZmMtaXRlbS10aXRsZSBmYy1pdGVtLXByaW1hcnktdGV4dC1jb2xvciBmYy10ZXh0LWNlbnRlciZxdW90OyZndDt7cG9zdF90aXRsZX0mbHQ7L2RpdiZndDsNCiAgICAgICAgICAgICZsdDtkaXYgY2xhc3M9JnF1b3Q7ZmMtaXRlbS1jb250ZW50IGZjLWl0ZW0tYm9keS10ZXh0LWNvbG9yIGZjLWl0ZW0tdG9wLXNwYWNlJnF1b3Q7Jmd0Ow0KICAgICAgICAgICAgICAgIHtwb3N0X2V4Y2VycHR9DQogICAgICAgICAgICAmbHQ7L2RpdiZndDsNCiAgICAgICAgJmx0Oy9kaXYmZ3Q7DQogICAgJmx0Oy9kaXYmZ3Q7DQombHQ7L2RpdiZndDsiO3M6Mjc6IndwZ21wX2NhdGVnb3J5ZGlzcGxheWZvcm1hdCI7czoxMzUyOiImbHQ7ZGl2IGNsYXNzPSZxdW90O2ZjLWl0ZW0tYm94IGZjLWNvbXBvbmVudC0yIHdwZ21wX2xvY2F0aW9ucyAmcXVvdDsmZ3Q7DQogICAgJmx0O2RpdiBjbGFzcz0mcXVvdDtmYy1jb21wb25lbnQtYmxvY2smcXVvdDsmZ3Q7DQogICAgICAgICZsdDtkaXYgY2xhc3M9JnF1b3Q7ZmMtY29tcG9uZW50LWNvbnRlbnQmcXVvdDsmZ3Q7DQogICAgICAgICAgICAmbHQ7dWwmZ3Q7DQogICAgICAgICAgICAgICAgJmx0O2xpIGNsYXNzPSZxdW90O2ZjLWl0ZW0tZmVhdHVyZWQgZmMtY29tcG9uZW50LXRodW1iIGZjLWl0ZW0tdG9wX3NwYWNlJnF1b3Q7Jmd0Ow0KICAgICAgICAgICAgICAgICAgICAmbHQ7ZGl2IGNsYXNzPSZxdW90O2ZjLWZlYXR1cmVkLWhvdmVyZGl2JnF1b3Q7Jmd0Ow0KICAgICAgICAgICAgICAgICAgICAgICAgJmx0O2RpdiBjbGFzcz0mcXVvdDtmYy1mZWF0dXJlZC1ob3ZlcmlubmVyICZxdW90OyZndDsmbHQ7YSB7b25jbGlja19hY3Rpb259IGNsYXNzPSZxdW90O21hcCZxdW90OyZndDsmbHQ7L2EmZ3Q7Jmx0Oy9kaXYmZ3Q7DQogICAgICAgICAgICAgICAgICAgICAgICB7bWFya2VyX2ltYWdlfQ0KICAgICAgICAgICAgICAgICAgICAmbHQ7L2RpdiZndDsNCiAgICAgICAgICAgICAgICAmbHQ7L2xpJmd0Ow0KDQogICAgICAgICAgICAgICAgJmx0O2xpIGNsYXNzPSZxdW90O2ZjLWNvbXBvbmVudC10ZXh0JnF1b3Q7Jmd0Ow0KICAgICAgICAgICAgICAgICAgICAmbHQ7ZGl2IGNsYXNzPSZxdW90O2ZjLWl0ZW1jb250ZW50LXBhZGRpbmcmcXVvdDsmZ3Q7DQogICAgICAgICAgICAgICAgICAgICAgICAmbHQ7ZGl2IGNsYXNzPSZxdW90O2ZjLWl0ZW0tdGl0bGUgZmMtaXRlbS1wcmltYXJ5LXRleHQtY29sb3IgJnF1b3Q7Jmd0O3ttYXJrZXJfdGl0bGV9Jmx0Oy9kaXYmZ3Q7DQogICAgICAgICAgICAgICAgICAgICAgICAmbHQ7ZGl2IGNsYXNzPSZxdW90O2ZjLWl0ZW0tY29udGVudCBmYy1pdGVtLWJvZHktdGV4dC1jb2xvciZxdW90OyZndDsNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bWFya2VyX21lc3NhZ2V9DQogICAgICAgICAgICAgICAgICAgICAgICAmbHQ7L2RpdiZndDsNCiAgICAgICAgICAgICAgICAgICAgICAgICZsdDthIHtvbmNsaWNrX2FjdGlvbn0gY2xhc3M9JnF1b3Q7cmVhZC1tb3JlIGZjLWl0ZW0tcHJpbWFyeS10ZXh0LWNvbG9yIGZjLWNzcyZxdW90OyZndDtSZWFkIE1vcmUmbHQ7L2EmZ3Q7DQogICAgICAgICAgICAgICAgICAgICZsdDsvZGl2Jmd0Ow0KICAgICAgICAgICAgICAgICZsdDsvbGkmZ3Q7DQogICAgICAgICAgICAmbHQ7L3VsJmd0Ow0KICAgICAgICAmbHQ7L2RpdiZndDsNCiAgICAmbHQ7L2RpdiZndDsNCiZsdDsvZGl2Jmd0OyI7fXM6MjM6Im1hcF9pbmZvX3dpbmRvd19zZXR0aW5nIjtOO3M6MTY6InN0eWxlX2dvb2dsZV9tYXAiO2E6NDp7czoxNDoibWFwZmVhdHVyZXR5cGUiO2E6MTA6e2k6MDtzOjIwOiJTZWxlY3QgRmVhdHVyZWQgVHlwZSI7aToxO3M6MjA6IlNlbGVjdCBGZWF0dXJlZCBUeXBlIjtpOjI7czoyMDoiU2VsZWN0IEZlYXR1cmVkIFR5cGUiO2k6MztzOjIwOiJTZWxlY3QgRmVhdHVyZWQgVHlwZSI7aTo0O3M6MjA6IlNlbGVjdCBGZWF0dXJlZCBUeXBlIjtpOjU7czoyMDoiU2VsZWN0IEZlYXR1cmVkIFR5cGUiO2k6NjtzOjIwOiJTZWxlY3QgRmVhdHVyZWQgVHlwZSI7aTo3O3M6MjA6IlNlbGVjdCBGZWF0dXJlZCBUeXBlIjtpOjg7czoyMDoiU2VsZWN0IEZlYXR1cmVkIFR5cGUiO2k6OTtzOjIwOiJTZWxlY3QgRmVhdHVyZWQgVHlwZSI7fXM6MTQ6Im1hcGVsZW1lbnR0eXBlIjthOjEwOntpOjA7czoxOToiU2VsZWN0IEVsZW1lbnQgVHlwZSI7aToxO3M6MTk6IlNlbGVjdCBFbGVtZW50IFR5cGUiO2k6MjtzOjE5OiJTZWxlY3QgRWxlbWVudCBUeXBlIjtpOjM7czoxOToiU2VsZWN0IEVsZW1lbnQgVHlwZSI7aTo0O3M6MTk6IlNlbGVjdCBFbGVtZW50IFR5cGUiO2k6NTtzOjE5OiJTZWxlY3QgRWxlbWVudCBUeXBlIjtpOjY7czoxOToiU2VsZWN0IEVsZW1lbnQgVHlwZSI7aTo3O3M6MTk6IlNlbGVjdCBFbGVtZW50IFR5cGUiO2k6ODtzOjE5OiJTZWxlY3QgRWxlbWVudCBUeXBlIjtpOjk7czoxOToiU2VsZWN0IEVsZW1lbnQgVHlwZSI7fXM6NToiY29sb3IiO2E6MTA6e2k6MDtzOjE6IiMiO2k6MTtzOjE6IiMiO2k6MjtzOjE6IiMiO2k6MztzOjE6IiMiO2k6NDtzOjE6IiMiO2k6NTtzOjE6IiMiO2k6NjtzOjE6IiMiO2k6NztzOjE6IiMiO2k6ODtzOjE6IiMiO2k6OTtzOjE6IiMiO31zOjEwOiJ2aXNpYmlsaXR5IjthOjEwOntpOjA7czoyOiJvbiI7aToxO3M6Mjoib24iO2k6MjtzOjI6Im9uIjtpOjM7czoyOiJvbiI7aTo0O3M6Mjoib24iO2k6NTtzOjI6Im9uIjtpOjY7czoyOiJvbiI7aTo3O3M6Mjoib24iO2k6ODtzOjI6Im9uIjtpOjk7czoyOiJvbiI7fX1zOjEzOiJtYXBfbG9jYXRpb25zIjthOjU6e2k6MDtzOjI6IjYzIjtpOjE7czoyOiI2NSI7aToyO3M6MjoiNjEiO2k6MztzOjI6IjY0IjtpOjQ7czoyOiI2MiI7fXM6MTc6Im1hcF9sYXllcl9zZXR0aW5nIjthOjE6e3M6OToibWFwX2xpbmtzIjtzOjA6IiI7fXM6MTk6Im1hcF9wb2x5Z29uX3NldHRpbmciO047czoyMDoibWFwX3BvbHlsaW5lX3NldHRpbmciO047czoxOToibWFwX2NsdXN0ZXJfc2V0dGluZyI7YTo1OntzOjQ6ImdyaWQiO3M6MjoiMTUiO3M6ODoibWF4X3pvb20iO3M6MToiMSI7czoxMzoibG9jYXRpb25fem9vbSI7czoyOiIxMCI7czo0OiJpY29uIjtzOjU6IjQucG5nIjtzOjEwOiJob3Zlcl9pY29uIjtzOjU6IjQucG5nIjt9czoxOToibWFwX292ZXJsYXlfc2V0dGluZyI7YTo2OntzOjIwOiJvdmVybGF5X2JvcmRlcl9jb2xvciI7czoxOiIjIjtzOjEzOiJvdmVybGF5X3dpZHRoIjtzOjM6IjIwMCI7czoxNDoib3ZlcmxheV9oZWlnaHQiO3M6MzoiMjAwIjtzOjE2OiJvdmVybGF5X2ZvbnRzaXplIjtzOjI6IjE2IjtzOjIwOiJvdmVybGF5X2JvcmRlcl93aWR0aCI7czoxOiIyIjtzOjIwOiJvdmVybGF5X2JvcmRlcl9zdHlsZSI7czo2OiJkb3R0ZWQiO31zOjExOiJtYXBfZ2VvdGFncyI7YToyOntzOjQ6InBvc3QiO2E6NDp7czo3OiJhZGRyZXNzIjtzOjA6IiI7czo4OiJsYXRpdHVkZSI7czowOiIiO3M6OToibG9uZ2l0dWRlIjtzOjA6IiI7czo4OiJjYXRlZ29yeSI7czowOiIiO31zOjQ6InBhZ2UiO2E6NDp7czo3OiJhZGRyZXNzIjtzOjA6IiI7czo4OiJsYXRpdHVkZSI7czowOiIiO3M6OToibG9uZ2l0dWRlIjtzOjA6IiI7czo4OiJjYXRlZ29yeSI7czowOiIiO319czoyMjoibWFwX2luZm93aW5kb3dfc2V0dGluZyI7Tjt9',
					);

					foreach ( $sample_data['maps'] as $title => $export_code ) {

						$import_code = wp_unslash( $export_code );
						if ( trim( $import_code ) != '' ) {
							$map_settings = maybe_unserialize( base64_decode( $import_code ) );

							if ( is_object( $map_settings ) ) {
								$sdata                  = array();
								$data                   = (array) $map_settings;
								$sdata['map_locations'] = serialize( wp_unslash( $location_ids ) );
								$data['map_route_direction_setting']['specific_routes'] = $routes_ids;

								if ( isset( $data['extensions_fields'] ) ) {
									$sdata['map_all_control']['extensions_fields'] = $data['extensions_fields'];
								}

								if ( isset( $data['map_all_control']['map_control_settings'] ) ) {
									$arr = array();
									$i   = 0;
									foreach ( $data['map_all_control']['map_control_settings'] as $key => $val ) {
										if ( $val['html'] != '' ) {
											$arr[ $i ]['html']     = $val['html'];
											$arr[ $i ]['position'] = $val['position'];
											$i++;
										}
									}
									$sdata['map_all_control']['map_control_settings'] = $arr;
								}

								if ( isset( $data['map_all_control']['custom_filters'] ) ) {
									$custom_filters = array();
									foreach ( $data['map_all_control']['custom_filters'] as $k => $val ) {
										if ( $val['slug'] == '' ) {
											unset( $data['map_all_control']['custom_filters'][ $k ] );
										} else {
											$custom_filters[] = $val;
										}
									}
									$sdata['map_all_control']['custom_filters'] = $custom_filters;
								}

								if ( isset( $data['map_all_control']['location_infowindow_skin']['sourcecode'] ) ) {
									$sdata['map_all_control']['infowindow_setting'] = $data['map_all_control']['location_infowindow_skin']['sourcecode'];
								}

								if ( isset( $data['map_all_control']['post_infowindow_skin']['sourcecode'] ) ) {
									$sdata['map_all_control']['infowindow_geotags_setting'] = $data['map_all_control']['post_infowindow_skin']['sourcecode'];
								}

								if ( isset( $_POST['map_all_control']['item_skin']['sourcecode'] ) ) {
									$sdata['map_all_control']['wpgmp_categorydisplayformat'] = $data['map_all_control']['item_skin']['sourcecode'];
								}

								$sdata['map_title']                   = sanitize_text_field( wp_unslash( $data['map_title'] ) );
								$sdata['map_width']                   = str_replace( 'px', '', sanitize_text_field( wp_unslash( $data['map_width'] ) ) );
								$sdata['map_height']                  = str_replace( 'px', '', sanitize_text_field( wp_unslash( $data['map_height'] ) ) );
								$sdata['map_zoom_level']              = intval( wp_unslash( $data['map_zoom_level'] ) );
								$sdata['map_type']                    = sanitize_text_field( wp_unslash( $data['map_type'] ) );
								$sdata['map_scrolling_wheel']         = sanitize_text_field( wp_unslash( $data['map_scrolling_wheel'] ) );
								$sdata['map_45imagery']               = sanitize_text_field( wp_unslash( $data['map_45imagery'] ) );
								$sdata['map_street_view_setting']     = serialize( wp_unslash( $data['map_street_view_setting'] ) );
								$sdata['map_route_direction_setting'] = serialize( wp_unslash( $data['map_route_direction_setting'] ) );
								$sdata['map_all_control']             = serialize( wp_unslash( $data['map_all_control'] ) );
								$sdata['map_info_window_setting']     = serialize( wp_unslash( $data['map_info_window_setting'] ) );
								$sdata['style_google_map']            = serialize( wp_unslash( $data['style_google_map'] ) );
								$sdata['map_layer_setting']           = serialize( wp_unslash( $data['map_layer_setting'] ) );
								$sdata['map_polygon_setting']         = serialize( wp_unslash( $data['map_polygon_setting'] ) );
								$sdata['map_cluster_setting']         = serialize( wp_unslash( $data['map_cluster_setting'] ) );
								$sdata['map_overlay_setting']         = serialize( wp_unslash( $data['map_overlay_setting'] ) );
								$sdata['map_infowindow_setting']      = serialize( wp_unslash( $data['map_infowindow_setting'] ) );
								$sdata['map_geotags']                 = serialize( wp_unslash( $data['map_geotags'] ) );
								$map_ids[]                            = FlipperCode_Database::insert_or_update( TBL_MAP, $sdata, $where = '' );
							}
						}
					}

					if ( $success == true ) {

						$response['success'] = esc_html__( 'Sample Data has been created successfully. Go to Manage Maps and use the map shortcode.', 'wp-google-map-plugin' );

					} else {
						$response['error'] = esc_html__( 'Something went wrong. Please try again.', 'wp-google-map-plugin' );
					}
				} else {
					
					$response['error'] = esc_html__( 'Please enter "YES" in the provided textbox and then submit the form to install sample data.', 'wp-google-map-plugin' );
				}
				
				return $response;
			}
		}

	}
}
