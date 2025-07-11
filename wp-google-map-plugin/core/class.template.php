<?php
/**
 * Generate Bootstrap Form and it's Elements.
 *
 * @author Flipper Code <hello@flippercode.com>
 * @package Core
 */

if ( ! class_exists( 'FlipperCode_HTML_Markup' ) ) {

	/**
	 * Generate Bootstrap Form and it's Elements.
	 *
	 * @author Flipper Code <hello@flippercode.com>
	 * @package Core
	 */
	class FlipperCode_HTML_Markup {
		/**
		 * Form Title
		 *
		 * @var String
		 */
		protected $form_title = null;
		/**
		 * Form Name
		 *
		 * @var String
		 */
		public $form_name = null;
		/**
		 * Form ID
		 *
		 * @var String
		 */
		public $form_id = null;

		/**
		 * Form class
		 *
		 * @var String
		 */
		public $form_class = null;
		/**
		 * Form Action
		 *
		 * @var String
		 */
		public $form_action = '';
		/**
		 * Form Orientation - Vertical or Horizontal
		 *
		 * @var String
		 */
		public $form_type = 'form-horizontal';
		/**
		 * Call to Action Slug
		 *
		 * @var String
		 */
		protected $manage_pagename = null;
		/**
		 * Call to Action Title
		 *
		 * @var String
		 */
		protected $manage_pagetitle = null;
		/**
		 * Success or Failure Form Response
		 *
		 * @var Array
		 */
		protected $form_response = null;

		private static $enable_accordian = false;
		/**
		 * Form Method - POST or GET
		 *
		 * @var string
		 */
		protected $form_method = 'post';
		/**
		 * Bootstrap Elements Supported
		 *
		 * @var Array
		 */
		private $form_elements = array( 'extensions', 'text', 'checkbox', 'multiple_checkbox', 'checkbox_toggle', 'radio', 'submit', 'button', 'select', 'hidden', 'wp_editor', 'html', 'datalist', 'textarea', 'file', 'div', 'blockquote', 'html', 'image', 'group', 'table', 'message', 'anchor', 'number', 'image_picker', 'radio_slider', 'tab', 'category_selector', 'templates', 'fc_modal', 'select2', 'temp_access' );
		/**
		 * Attributes Allowed
		 *
		 * @var Array
		 */
		private $allowed_attributes;
		/**
		 * Hidden Fields
		 *
		 * @var Array
		 */
		private $form_hiddens = array();
		/**
		 * Form nonce key.
		 *
		 * @var string
		 */
		private $nonce_key = 'wpgmp-nonce';
		/**
		 * Array of Bootstrap Elements
		 *
		 * @var Array
		 */
		protected $elements = array();

		protected $quick_tags = array();
		/**
		 * Array of Previously Stored Elements
		 *
		 * @var Array
		 */
		protected $backup_elements = array();
		/**
		 * Array of Rendered Elements
		 *
		 * @var Array
		 */
		protected $partially_rendered = false;
		/**
		 * Number of bootstrap columns
		 *
		 * @var Int
		 */
		/**
		 * Whether setting api enabled or not.
		 *
		 * @var boolean
		 */
		public $setting_api = false;
		/**
		 * Columns in row.
		 *
		 * @var integer
		 */
		protected $columns = 1;
		/**
		 * Divide Page in multiple parts.
		 *
		 * @var string
		 */
		public $spliter = '';
		private $fonts  = false;

		private $options;
		/**
		 * Intialize form properties.
		 */
		public function __construct( $options = array() ) {

			$this->allowed_attributes = array_fill_keys( array( 'tutorial_link','min', 'max', 'choose_button', 'remove_button', 'label', 'id', 'class', 'required', 'default_value', 'value', 'options', 'desc', 'before', 'after', 'radio-val-label', 'onclick', 'placeholder', 'textarea_rows', 'textarea_name', 'html', 'current', 'width', 'height', 'src', 'alt', 'heading', 'data', 'show', 'optgroup', 'selectable_optgroup', 'tabs', 'row_class', 'page', 'data_type', 'href', 'target', 'fpc', 'product', 'productTemplate', 'parentTemplate', 'instance', 'dboption', 'template_types', 'templatePath', 'templateURL', 'settingPage', 'customiser', 'attachment_id', 'parent_page_slug', 'data_type', 'fc_modal_header', 'fc_modal_content', 'fc_modal_footer', 'fc_modal_initiator', 'no-sticky', 'customiser', 'customiser_controls', 'data_placeholders', 'parent_class', 'enable_slider', 'file_text','pro' ), '' );

			$this->allowed_attributes['style']    = array();
			$this->allowed_attributes['required'] = false;
			$this->fonts                          = $this->get_fonts();

			if (!is_array($this->fonts)) {
		        $this->fonts = array(); 
		    }
		    
			asort( $this->fonts );

			if ( isset( $options ) ) {
				$this->options = $options;
			}

		}
		/**
		 * Set Form's header
		 *
		 * @param String $form_title       Form Title.
		 * @param String $response         Success or Failure Message.
		 * @param string $manage_pagetitle Call to Action Title.
		 * @param string $manage_pagename  Call to Action Page Slug.
		 */
		public function set_header( $form_title, $response, $enable_accordian = '', $manage_pagetitle = '', $manage_pagename = '', $quick_tags = array() ) {
			if ( isset( $form_title ) && ! empty( $form_title ) ) {

				$this->form_title = $form_title; 
			}
			if ( isset( $response ) && ! empty( $response ) ) {

				$this->form_response = $response; 
			}
			$this->manage_pagename = $manage_pagename;
			$this->manage_pagetitle = $manage_pagetitle;
			$this->quick_tags = $quick_tags;

			$enable_accordian = true; // To fix all extensions.
			self::$enable_accordian = $enable_accordian;

		}

		/**
		 * Form Method
		 *
		 * @param string $method Form Method.
		 */
		public function set_form_method( $method ) {
			$this->form_method = $method;
		}
		/**
		 * Title Setter
		 *
		 * @param string $title Form Title.
		 */
		public function set_title( $title ) {
			$this->form_title = $title;
		}
		/**
		 * Action Setter
		 *
		 * @param String $action Form Action.
		 */
		public function set_form_action( $action ) {
			$this->form_action = $action;
		}
		/**
		 * Title Getter
		 *
		 * @return String Get Form Title.
		 */
		public function get_title() {
			if ( isset( $this->form_title ) && ! empty( $this->form_title ) ) {
				return $this->form_title; }
		}
		/**
		 * Call to Action Button
		 */
		public function get_manage_url() {
			return "<a class='ask-rating' target='_blank' href='http://codecanyon.net/downloads'>Rate Me</a>";
		}

		public static function field_fc_modal( $name, $atts ) {

			$id                 = isset( $atts['id'] ) ? $atts['id'] : $name;
			$fc_modal_header    = isset( $atts['fc_modal_header'] ) ? $atts['fc_modal_header'] : '';
			$fc_modal_content   = isset( $atts['fc_modal_content'] ) ? $atts['fc_modal_content'] : '';
			$fc_modal_initiator = isset( $atts['fc_modal_initiator'] ) ? $atts['fc_modal_initiator'] : '';

			$modal = '<div class="fc-modal-overlay fc-modal-show" ><div data-initiator = "' . $fc_modal_initiator . '" name="' . $name . '" ' . self::get_element_attributes( $atts ) . ' id="' . $id . '" class="fc-modal">
                       <div class="fc-modal-header">
								<div class="title">' . $fc_modal_header . '</div>
								<button class="fc-btn fc-btn-icon fc-btn-close fc-modal-close">
									<i class="wep-icon wep-icon-close"></i>
								</button>
						 </div>
						<div class="fc-modal-body">' . $fc_modal_content . '</div>
											
					  </div></div>';

			return $modal;

		}

		public static function field_number( $name, $atts ) {

			if ( isset( $atts['value'] ) ) {
				$elem_value = $atts['value'];
			} else if ( isset( $atts['default_value'] ) ) {
				$elem_value = $atts['default_value'];
			} else {
				$elem_value = '';
			}

			$min_value  = ( isset( $atts['min'] ) && $atts['min'] ) ? $atts['min'] : 0;
			$max_value  = ( isset( $atts['max'] ) && $atts['max'] ) ? $atts['max'] : 9999;
			$element    = '<input type="number" min ="' . $min_value . '" max = "' . $max_value . '" name="' . $name . '" value="' . esc_attr( stripcslashes( $elem_value ) ) . '"' . self::get_element_attributes( $atts ) . ' />';
			if ( isset( $atts['desc'] ) && ! empty( $atts['desc'] ) ) {
				$element .= '<p class="description">' . $atts['desc'] . '</p>'; }
			return apply_filters( 'wpgmp_input_field_' . $name, $element, $name, $atts );
		}

		/**
		 * Get form success or error message.
		 *
		 * @return HTML Success or error message html.
		 */
		public function get_form_messages() {

			if ( empty( $this->form_response ) && ! is_array( $this->form_response ) ) {
				return; }
			$response = $this->form_response;
			$output   = '';
			if ( isset( $response['error'] ) && $response['error'] ) {

				$output .= '<div class="fc-12 fc-alert fc-alert-danger fade in">
';
				$output .= '' . $response['error'] . '</div>';
			} elseif ( isset( $response['success'] ) && $response['success'] ) {

				$output .= '<div class="fc-12 fc-alert fc-alert-success fade in">
';
				$output .= '' . $response['success'] . '</div>';
			}
			return $output;
		}
		/**
		 * Form header getter.
		 *
		 * @return HTML  Generate form header html.
		 */

		public static function output( $safe_output ) {

			echo $safe_output;

		}
		
		/**
		 * Form header getter.
		 *
		 * @return HTML  Generate form header html.
		 */

		 public function show_header( $show = true ) {
			$output = '';
			$plugin_updates = maybe_unserialize( get_option( 'fc_' . $this->options['productSlug'] ) );
			$announcement = isset( $plugin_updates['annoucement'] ) ? $plugin_updates['annoucement'] : '';
			$allowed_tags = wp_kses_allowed_html( 'post' );
			
			$output = WePlugins_Notification::weplugins_display_notification();
			$output .= '
					
		
					<div class="fc-header">
						<div class="fc-header-primary">
							<div class="fc-container">
								<div class="fc-product-wrapper">
									<div class="fc-product-icon">
										<img src="' . plugin_dir_url( __DIR__ ) . 'assets/images/icon-folder.svg" alt="Icon Folder">
									</div>
									<div class="fc-product-name">' . esc_html( $this->options['productName'] ) . '</div>
									<div class="fc-product-version">' . esc_html( $this->options['productVersion'] ) . '</div>
								</div>
		
								<div class="fc-header-toolbar">
									<div class="fc-action-menu">
										<div class="fc-action-menu-item">
											<a href="https://www.wpmapspro.com/tutorials" target="_blank" class="fc-btn fc-btn-icon">
												<i class="wep-icon-note"></i>
											</a>
										</div>
										<div class="fc-action-menu-item">
											<a href="https://www.youtube.com/playlist?list=PLlCp-8jiD3p1mzGUmrEgjNP1zdamrJ6uI" target="_blank" class="fc-btn fc-btn-icon">
												<i class="wep-icon-video"></i>
											</a>
										</div>
										<div class="fc-action-menu-item">
											<a href="https://weplugins.com/support" target="_blank" class="fc-btn fc-btn-icon">
												<i class="wep-icon-chat"></i>
											</a>
										</div>
										<div class="fc-action-menu-item">
											<div class="fc-brand">
												<a href="https://weplugins.com" target="_blank">
													<img src="' . plugin_dir_url( __DIR__ ) . 'assets/images/logo.svg" alt="logo" class="fc-brand-img">
												</a>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						'.$this->get_navigation().'
					</div>';
		
			return wp_kses( $output, $allowed_tags );
		}
		public function get_navigation() {

			$output = apply_filters('fc_plugin_nav_menu','');                 

			return $output;

		}

		public function start_page_layout() {
			$output = '<div class="fc-root"><div class="fc-root-inner">';
			$output .= $this->show_header( false );
			$output .= '<div class="fc-main">
			<div class="fc-container">';			
			return $output;
		}

		public function end_page_layout() {
			$output = '<!-- fc root ended --></div></div></div><!-- fc container ended --></div>';
			return $output;
		}
		public function get_header() {

			$output = '<div class="fc-root">
				<div class="fc-root-inner">';

			if ( isset( $this->options['no_header'] ) && $this->options['no_header'] === true ) {
				$output .= '';
			} else {
				$output .= $this->show_header( false );
			}

			$container_class = ( isset($this->form_id) && !empty($this->form_id) ) ? 'form-container-'.$this->form_id : '';
			// check this	
			/*
			$output .= '<div class="flippercode-ui flippercode-ui-height '.$container_class.'">
						<div class="fc-main"><div class="fc-container">';
			$output .= '<div class="fc-divider   fc-item-shadow"><div class=" fc-back">
										
						<div class="wpgmp-overview">' .
						$this->get_form_messages();
			*/
			$output .= '<div class="fc-main">
			<div class="fc-container">';
			$output .= $this->get_form_messages();

			if ( isset( $this->quick_tags ) && is_array( $this->quick_tags ) && ! empty( $this->quick_tags ) ) {
				$output .= '<div class="fc-quick-tags"><div><strong><small>Quick Links:</small></strong></div>';
				foreach ( $this->quick_tags as $id => $label ) {
					$output .= '<a href="#' . esc_attr( $id ) . '" class="fc-badge">' . esc_html( $label ) . '</a>';
				}
				$output .= '</div>';
			}

			return apply_filters( 'wpgmp_form_header_html', $output );
		}
		/**
		 * Form footer getter.
		 *
		 * @return HTML Generate form footer html.
		 */
		public function get_footer() {
			
				$output = '<!-- ended here --></div>
					</div>
				</div>
			</div>';
						
			return apply_filters( 'wpgmp_form_footer_html', $output );
		}
		
		/**
		 * Bootstrap columns setter.
		 *
		 * @param int $column Set columns occupied by element.
		 */
		public function set_col( $column ) {
			if ( $this->elements ) {
				$last_index                                 = key( array_reverse( $this->elements ) );
				$this->elements[ $last_index ]['col_after'] = $column;
				return;
			}
			$this->columns = $column ? absint( $column ) : 2;
		}
		/**
		 * Bootstrap columns getter.
		 */
		public function get_col() {
			return $this->columns;
		}
		/**
		 * Add element in queue.
		 *
		 * @param string $type Element type.
		 * @param string $name Element name.
		 * @param array  $args Element Properties.
		 */
		public function add_element( $type, $name, $args = array() ) {
			if ( ! in_array( $type, $this->form_elements ) ) {
				return; }

			$this->elements[ $name ]         = shortcode_atts( $this->allowed_attributes, $args );
			$this->elements[ $name ]['type'] = $type;

		}

		public static function apply_extensions( $filter, $value ) {
			$element_html  = '';
			$element_html .= apply_filters( $filter, '', $value );
			$element_html .= FlipperCode_HTML_Markup::field_hidden( 'fc_entity_type', array( 'value' => strtolower( trim( $filter ) ) ) );
			return $element_html;
		}

		public static function field_extensions( $name, $atts ) {
			return self::apply_extensions( $name, $atts['value'] );
		}


		/**
		 * Display bootstrap elements.
		 *
		 * @param  boolean $echo Echo or not.
		 * @return HTML    Return form's element.
		 */
		public function print_elements( $echo = true ) {

			$form_output = '';
			if ( empty( $this->backup_elements ) ) {

				$form_output              = $this->get_header();
				$form_output             .= $this->get_form_header();
				$this->partially_rendered = true;
			}

			$element_html            = $this->get_combined_markup();
			$form_output            .= $element_html;
			$this->backup_elements[] = $this->elements;
			unset( $this->elements );
			if ( $echo ) {
				echo esc_html( balanceTags( $form_output ) );
			} else {
				return balanceTags( esc_html( $form_output ) ); }
		}
		/**
		 * Concat form elements together.
		 *
		 * @return html  Combined HTML of each elements.
		 */
		public function get_combined_markup() {

			$element_html = '<!-- Get combined markup starts here -->';
			#return $element_html;
			if ( $this->elements ) {

				#echo "<pre>";
				#$this->create_config_file($this->elements);
				#print_r($this->elements);
				#$this->get_information();
				#echo "</pre>";
				#die();

				$elements  = $this->elements;

				$num = 0;

				$tmpl = false;

				$section_start = '';

				while ( $num < count( $elements ) ) {

					$col = $this->get_col();

					$elem_content = '';

					foreach ( array_slice( $elements, $num, $col ) as $name => $atts ) {

						

						if ( WPGMP_Helper::wpgmp_is_feature_available($name, 'google') ) {
							$not_available_class = 'fc-feature-not-available';
						} else{
							$not_available_class = '';
						}

						

						if(self::$enable_accordian == true) {

							if($atts['type'] == 'group' ){

								$before = apply_filters( 'wpgmp_element_before_start_row', '<dt><section id="'.$name.'" class="fc-form-group {modifier} '.$atts['parent_class'].' '.$not_available_class.'">',$name,$atts );

								$after = apply_filters( 'wpgmp_element_after_end_row', '</section></dt>' );

								$group_section_start = '<dd>';

							} else if($atts['type'] == 'templates') {

								$group_section_start = '';

								//Do Noting For Now

							} else if( $atts['type'] == 'hidden' ) {

								$before = '';

								$after = '';

								$group_section_start = '';

							} else if( $atts['type'] == 'submit' ) {

								$before = apply_filters( 'wpgmp_element_before_start_row', '</dd>',$name,$atts );

								$after = apply_filters( 'wpgmp_element_after_end_row', '' );

								$group_section_start = '';

							} else {

								$before = apply_filters( 'wpgmp_element_before_start_row', '<section class="fc-form-group fc-row {modifier} '.$atts['parent_class'].' '.$not_available_class.'">',$name,$atts );

								$after = apply_filters( 'wpgmp_element_after_end_row', '</section>' );

								$group_section_start = '';

							}

						} else{

							if( $atts['type'] == 'hidden' ) {

								$before = '';

								$after = '';

								$group_section_start = '';

							}else{

								$group_section_start = '';

								$before = apply_filters( 'wpgmp_element_before_start_row', '<div class="fc-form-group {modifier} '.$atts['parent_class'].'">',$name,$atts );

								$after = apply_filters( 'wpgmp_element_after_end_row', '</div>' );
							}

							

						}

						

						$row_extra = false;

						$temp = $before;

						if ( ! isset( $atts['type'] ) || ! is_string( $name ) ) {

							continue; 

						}



						if ( 'hidden' == $atts['type'] ) {

							$before = '';

							$after = '';
							$elem_content .= call_user_func( 'FlipperCode_HTML_Markup::field_' . $atts['type'], $name, $atts );

							continue;

						}



						if ( 'templates' == $atts['type'] ) {

							$before = '';

							$after = '';

							$elem_content .= call_user_func( 'FlipperCode_HTML_Markup::field_' . $atts['type'], $name, $atts );

							continue;

						}

						

						$elem_content .= $this->get_element_html( $name, $atts['type'], $atts );



						if ( isset( $atts['col_after'] ) ) {

							$this->columns = $atts['col_after']; 

						}

						if ( isset( $atts['show'] ) and 'false' == $atts['show'] ) {

							$row_extra = true; 

						}



					}



					if ( true == $row_extra ) {

						$temp = str_replace( '{modifier}', 'hiderow', $temp );

					} else {

						$temp = str_replace( '{modifier}', '', $temp );

					}

					if ( ! empty( $elem_content ) ) {

						$element_html .= $temp . $elem_content . $after . $group_section_start; }

					$num = $num + $col;

					

				} 

			}

			return $element_html."<!-- Get Combined markup ended here -->";

		}
		/**
		 * Form header getter.
		 *
		 * @return html Generate form header html.
		 */
		public function get_form_header() {

			$form_header = '<form enctype="multipart/form-data" method="' . $this->form_method . '" action="' . $this->form_action . '" name="wpgmp_form" novalidate';
			if ( isset( $this->form_name ) && ! empty( $this->form_name ) ) {
				$form_header .= ' name="' . esc_attr($this->form_name) . '" '; }
			if ( isset( $this->form_id ) && ! empty( $this->form_id ) ) {
				$form_header .= ' id="' . esc_attr($this->form_id) . '" '; }
			if ( isset( $this->form_class ) && ! empty( $this->form_class ) )
			$form_header .= ' class="' . esc_attr( $this->form_class ) . '" ';
				
			$form_header .= '>';
			$form_header .= '<div class="' . $this->form_type . '">';

			
			
			if(self::$enable_accordian == true) {

				$form_header .= '<dl class="custom-accordion">';

			} else {
				$form_header .= '<div class="fc-content-area">';
			}
			return $form_header;

		}
		/**
		 * Form nonce key setter.
		 *
		 * @param string $nonce_key Form nonce key.
		 */
		public function set_form_nonce( $nonce_key ) {
			$this->nonce_key = $nonce_key;
		}
		/**
		 * Form footer getter.
		 *
		 * @return html Generate form footer html.
		 */
		public function get_form_footer() {

			if(self::$enable_accordian == true) {

				$form_footer = '</dl></div><!-- form ended -->';

			}else{

				$form_footer = '</div></div>';

			}

			$form_footer .= wp_nonce_field( $this->nonce_key, '_wpnonce', true, false );

			$form_footer .= '</form>';

			return $form_footer;
		}
		/**
		 * Echo or return html elements.
		 *
		 * @param  boolean $echo  True to display.
		 * @return html    html Generate form html
		 */
		public function render( $echo = true ) {

			if ( ! $this->elements || ! is_array( $this->elements ) and $this->partially_rendered == false ) {
				echo '<div id="message" class="error"><p>Please add form element first.</p></div>';
				return;
			}

			$form_output = '';
			if ( empty( $this->backup_elements ) and ! isset( $this->options['ajax'] ) and ! isset( $this->options['elements_only'] ) ) {
				$form_output = $this->get_header();
			}

			if ( empty( $this->backup_elements ) and ! isset( $this->options['elements_only'] ) ) {
				$form_header = $this->get_form_header();
			}

			if ( isset( $this->options['elements_only'] ) ) {
				$form_html = $this->get_combined_markup();
			} else {
				$form_html = $form_header . $this->get_combined_markup() . $this->get_form_footer();
			}
			if ( isset( $this->spliter ) and $this->spliter != '' ) {
				$spliter = str_replace( '%form', $form_html, $this->spliter );
			} else {
				$spliter = $form_html; }

			$form_output .= $spliter;

			if ( ! isset( $this->options['ajax'] ) and ! isset( $this->options['elements_only'] ) ) {
				$form_output .= $this->get_footer();
			}

			if ( $echo ) {
				$do_balanceTags = apply_filters('fc_form_balance_tags',true,$this);
				if($do_balanceTags){
					echo balanceTags( $form_output );
				}else{
					echo $form_output;
				}
			} else {
				return $form_output; }
		}
		/**
		 * Element's html creater.
		 *
		 * @param  string $name Element Name.
		 * @param  string $type Element Type.
		 * @param  array  $atts  Element Options.
		 * @return html       Element's Html.
		 */
		public static function get_element_html( $name, $type, $atts ) {

			$element_output = '';

			if ( 'hidden' == $type ) {

				$element_output = call_user_func( 'FlipperCode_HTML_Markup::field_' . $type, $name, $atts );

				return $element_output;

			}else if ( 'templates' == $type ) {

				$element_output = call_user_func( 'FlipperCode_HTML_Markup::field_' . $type, $name, $atts );

				return $element_output;

			}else if ( 'submit' == $type ) {

				$element_output = call_user_func( 'FlipperCode_HTML_Markup::field_' . $type, $name, $atts );

				return $element_output;

			}else {

				if ( ! empty( $atts['label'] ) ) {

					$label = apply_filters( 'wpgmp_input_label',  $atts['label'],$atts ); 

					$element_output .= apply_filters( 'wpgmp_input_label_' . $name, '<div class="fc-3"><label class="fc-form-label" for="' . $name . '">' . $label . '&nbsp;' . self::element_mandatory( isset($atts['required']) ? $atts['required'] : '' ) . '</div>' ) . '</label>'; 
				}

				$element_output .= (isset($atts['before']) && !empty($atts['before'])) ? $atts['before'] : '<div class="fc-6">';

				$element_output .= call_user_func( 'FlipperCode_HTML_Markup::field_' . $type, $name, $atts );

				$element_output .= (isset($atts['after']) && !empty($atts['after'])) ? $atts['after'] : '</div>';

				return $element_output;

			}

		}
		/**
		 * Display mandatory indicator on element.
		 *
		 * @param  boolean $required Whether field is required or not.
		 * @return html            Mandatory indicator.
		 */
		public static function element_mandatory( $required = false ) {

			if ( true == $required ) {
				return '<span style="color:#F00;">*</span>'; }
		}
		/**
		 * Attributes Generator for the element.
		 *
		 * @param  array $atts Attributes keys and values.
		 * @return string      Attributes section of the element.
		 */
		protected static function get_element_attributes( $atts ) {
			if ( ! is_array( $atts ) ) {
				return null; }

			$attributes = array();
			if ( isset( $atts['id'] ) && ! empty( $atts['id'] ) ) {
				$attributes[] = 'id="' . $atts['id'] . '"'; }

			$classes       = ( ! empty( $atts['class'] ) ) ? $atts['class'] : 'fc-form-control';

			if( isset($atts['type']) && ( $atts['type'] == 'radio' || $atts['type'] == 'checkbox' || $atts['type'] == 'multiple_checkbox'))
				$classes       = ( ! empty( $atts['class'] ) ) ? "fc-form-check-input ".$atts['class'] : 'fc-form-check-input';
				
			if( isset($atts['type']) && ( $atts['type'] == 'textarea'))
				$classes       = ( ! empty( $atts['class'] ) ) ? "fc-form-control ".$atts['class'] : 'fc-form-control';
			
			
			$attributes[] = 'class="' . $classes . '"';

			if ( isset( $atts['style'] ) && ! empty( $atts['style'] ) ) {
				$style = 'style="';
				foreach ( $atts['style'] as $key => $value ) {
					$style .= $key . ':' . $value . ';'; }
				$style .= '"';

				$attributes[2] = $style;
			}

			if ( isset( $atts['placeholder'] ) && ! empty( $atts['placeholder'] ) ) {
				$attributes[] = 'placeholder="' . esc_attr( $atts['placeholder'] ) . '"';
			}

			if ( isset( $atts['data'] ) && ! empty( $atts['data'] ) ) {
				foreach ( $atts['data'] as $key => $value ) {

					if ( ! is_array( $value ) ) {
						$attributes[] = 'data-' . $key . '="' . esc_attr( $value ) . '"';
					}
				}
			}

			if ( isset( $atts['src'] ) && ! empty( $atts['src'] ) ) {
				if ( strpos( $atts['src'], 'data:image/svg+xml' ) === 0 ) {
					// It's a data URI, so don't use esc_url
					$attributes[] = 'src="' . $atts['src'] . '"';
				} else {
					$attributes[] = 'src="' . esc_url( $atts['src'] ) . '"';
				}
			}
			

			if ( isset( $atts['alt'] ) && ! empty( $atts['alt'] ) ) {
				$attributes[] = 'alt="' . esc_attr( $atts['alt'] ) . '"';
			}

			if ( isset( $atts['height'] ) && ! empty( $atts['height'] ) ) {
				$attributes[] = 'height="' . esc_attr( $atts['height'] ) . '"';
			}

			if ( isset( $atts['width'] ) && ! empty( $atts['width'] ) ) {
				$attributes[] = 'width="' . esc_attr( $atts['width'] ) . '"';
			}

			if ( isset( $atts['value'] ) && ! empty( $atts['value'] ) and ! is_array( $atts['value'] ) ) {
				$attributes[] = 'value="' . esc_attr( $atts['value'] ) . '"';
			}

			if ( isset( $atts['name'] ) && ! empty( $atts['name'] ) ) {
				$attributes[] = 'name="' . esc_attr( $atts['name'] ) . '"';
			}

			if ( ! $attributes ) {
				return null; }

			return implode( ' ', $attributes );

		}

		/**
		 * Sort Url template.
		 *
		 * @param  url $path  No use.
		 */
		public static function extractLayoutNumber($path) {
		    if (strpos($path, 'default') !== false) {
		        return 0;
		    }
		    preg_match('/layout_(\d+)/', $path, $matches);
		    return isset($matches[1]) ? (int)$matches[1] : PHP_INT_MAX;
		}


		public static function get_all_templates( $name, $atts ) {

			$templatePath  = $atts['templatePath'];
			$templateURL   = $atts['templateURL'];
			$current       = $atts['current'];
			$preview_display = true;
			if(isset($atts['preview']) && $atts['preview'] == 'false' ){
				$preview_display = false;
			}
			$html          = '';
			$html .= '</dd><dt>';
			
			$after = '</div></section>';
      if( isset( $atts['tutorial_link'] ) && !empty( $atts['tutorial_link'] ) ){
        $after = '<a href="'.$atts['tutorial_link'].'" class="fc_tutorial_link" target="_blank" >Tutorial</a></div></section>';
      }
      
      $html .= FlipperCode_HTML_Markup::get_element_html(
        $atts['template_types'] . '_group', 'group', array(
          'value' => $atts['label'],
          'before' => '<section class="fc-form-group"><div class="fc-12 ' . $atts['parent_class'] . '">',
          'after' => $after,
          'for_template' => 'yes',
        )
      );

			$html .= '</dt><dd>';
			$template_type = $atts['template_types'];
			$directories   = glob( $templatePath . '/' . $template_type . '/*', GLOB_ONLYDIR );

			if ( $directories ) {
				natsort( $directories ); // Natural order: layout 1, layout 2, layout 10
				$directories = array_values($directories); // Optional: reset numeric keys
			}

			if($template_type == 'maps_templates'){
				usort($directories, function ($a, $b) {
				    return FlipperCode_HTML_Markup::extractLayoutNumber($a) - FlipperCode_HTML_Markup::extractLayoutNumber($b);
				});
			}
			
			foreach ( $directories as $key => $path ) {
				if ( basename( $path ) === $current['name'] ) {
					unset( $directories[$key] );
					array_unshift( $directories, $path );
					break;
				}
			}

			$html         .= "<div class='fc_templates'>";
			$customizer    = $atts['customiser'];
			$fonts         = FlipperCode_HTML_Markup::get_fonts();
			foreach ( $directories as $key => $directory ) {

					$parentTemplate = $directory = basename( $directory );
					$preview        = $templateURL . $template_type . '/' . $directory . '/' . $directory . '.png';
					$title          = ucwords( str_replace( '-', ' ', $directory ) );

				$pro_template  = apply_filters('wpgmp_template_directory',false,$directory,$name, $atts);
				$currentTemplateCondition = ( $current['name'] == $directory ) ? true : false;

				$useThis = ( $currentTemplateCondition ) ? "<a href='javascript:void(0)' class='current-temp-in-use current-saved set-default-template' data-templatename = '" . $directory . "' data-input= '" . $name . "' data-templatetype='" . $template_type . "'><span class='fa fa-check'></span></a>" : "<a class='set-default-template' href='javascript:void(0)' data-templatename = '" . $directory . "' data-input= '" . $name . "' data-templatetype='" . $template_type . "' ><span class='fa fa-check'></span></a>" ;

				$selectedClass = ( $currentTemplateCondition ) ? "fc-selected-template" : "";

				if( $pro_template === false) {
					$fctools = "<div class='fc_name'><span>Apply</span></div><div class='fc_tools'>" . $useThis . '</div>';
				} else {
					$fctools = '';
				}
				$title_label = ($pro_template === false) ? $title : $title."<span class='fc-badge fc-badge-pro'>Pro</span>";
				$html .= "<div class='fc-card-wrapper'>";
				$html .= "<div class='fc-card ".$selectedClass."'>";
				$html .=' <div class="fc-card-header">
					<div class="fc-card-title">' . $title_label . '</div>
				</div>';
				$html .= "<div class='fc-card-body'>";
				
					$html .= "<div class='fc_template fc_template_" . $title . "'>
									<div class='fc_screenshot'><img src='" . $preview . "' /></div>
									" . $fctools . '
							  </div><!--card body ended --></div><!--card ended -->';
				$html .= "</div>";
				$html .= "</div>";

			}
			  // hidden field where template name will be saved.
			  $html .= "</div><input type='hidden' name='" . $name . "[name]' value='" . $current['name'] . "' />";
			  $html .= "<input type='hidden' name='" . $name . "[type]' value='" . $current['type'] . "' />";
			  // hidden field where source will be saved.
			  //$html .= "<input type='hidden' class='custom_sourcecode' name='" . $name . "[sourcecode]' value='" . $current['sourcecode'] . "' />";
			  $html .= "<input type='hidden' class='custom_sourcecode' name='" . esc_attr($name . "[sourcecode]") . "' value='" . esc_attr($current['sourcecode']) . "' />";

			if ( $customizer == 'true' ) {

				$html .= "<div class='fc_customizer'>
				<div class='fc-divider fc-row'>";
				if($preview_display == true){
					$html .= "<div class='fc-7'>";
				}else{
					$html .= "<div class='fc-12'>";
				}
				
				$html .= "<div class='fc_source_code_container fc-divider'>
		
				<textarea name='fc_view_source' class='fc_view_source'>" . esc_textarea($current['sourcecode']) . "</textarea>
			
			
			<div class='fc_supported_placeholder'>
			<p>Modify contents and click on Apply button before save. To change design appereance, click on element in the preview, to open design editor.</p>
			<ul class='fc_placeholders fc-hidden-placeholder'>";
				if ( is_array( $atts['data_placeholders'] ) ) {

					foreach ( $atts['data_placeholders'] as $placeholder_label ) {

						$html .= '<li>' . $placeholder_label . '</li>';
					}
				}
				$html .= ' </ul> ';
				$html .= ' <div class="fc-btn-wrapper"> ';
				if($preview_display == true){
					$html .= "<input type='button' name='fc_apply_changes' class='fc-btn fc-btn-primary fc-btn-sm fc_apply_changes' value='Apply Changes' />
					";
				}
				
        	$html .= "<input type='button' name='fc_load_original' class='fc-btn fc-btn-primary fc-btn-sm fc_load_original' value='Reset Changes' />
			";
				if ( in_array( 'placeholder', $atts['customiser_controls'] ) ) {

					$html .= '<input type="button" class="fc-btn fc-btn-primary fc-btn-sm fc-show-placeholder" name="fc-show-placeholder" value="Show Placeholder" />';
				}
				$html .= "	</div></div>
			</div>
				</div>
				<div class='fc-5'>";
				if($preview_display == true){
					$html .= "<div class='fc_preview'><div class='fc_instruction'>Choose Skin to get preview.</div></div>";
				}

				$html .= "</div>
			</div>";


			$html .= "<div class='fc_apply_style fc-item-shadow fc-drawer'>
			
			<div class='fc-drawer-header'>
				<div class='fc-drawer-title'>
					Customizer
				</div>
				<button class='fc-btn fc-btn-icon fc-btn-icon-sm fc-close-customizer' >
				 <i class='wep-icon-close wep-icon-lg'></i>
				 </button>
			</div>
			<div class='fc-controls fc-drawer-body'>
               <div class='custom-accordion fc-drawer-body-inner'>
							<div class='fc-drawer-section'>
								<div class='fc-drawer-section-heading'>
									Typography
								</div>
								<div class='fc-drawer-section-content'>
									<div class='fc-d-flex fc-flex-column fc-gap-10'>
										<h6 class='fc-title'>Font family</h6>
										<div class='fc_tool_text fc-font-family'>
											<select class='fc-form-select'>";

								
								foreach ( $fonts as $k => $v ) {
													$html .= "<option value='" . $v->family . "'>" . $v->family . '</option>';
								}
								
								$html .="</select>
										</div>
									</div>
									<div class='fc-d-flex fc-flex-wrap fc-gap-20'>
										<div class='fc-d-flex fc-flex-column fc-gap-10 fc-flex-1'>
											<h6 class='fc-title'>Font size</h6>
											<div>
												<input tabindex='101' type='number' min='8' max='48' value='18' class='fc-form-control fc_tool_font_size' />
											</div>
										</div>
										<div class='fc-d-flex fc-flex-column fc-gap-10 fc-flex-1'>
											<h6 class='fc-title'>Line height</h6>
											<div>
												<input tabindex='102' type='number' min='8' max='48' value='18' class=' fc-form-control fc_tool_text_lineheight' />
											</div>
										</div>
									</div>
									<div class='fc-d-flex fc-flex-column fc-gap-10'>
										<h6 class='fc-title'>Font Style</h6>
										<div class='fc-d-flex fc-flex-column fc-gap-5'>
											<div class='fc-form-check fc-form-switch'>
												<input class='fc-form-check-input font-style-bold' type='checkbox' role='switch'>
												<label class='fc-form-check-label' for='font-style-bold'>Bold</label>
											</div>
											<div class='fc-form-check fc-form-switch'>
												<input class='fc-form-check-input font-style-italic' type='checkbox' role='switch' >
												<label class='fc-form-check-label' for='font-style-italic'>Italic</label>
											</div>
											<div class='fc-form-check fc-form-switch'>
												<input class='fc-form-check-input font-style-underline' type='checkbox' role='switch'>
												<label class='fc-form-check-label' for='font-style-underline'>Underline</label>
											</div>
										</div>
									</div>
									<div class='fc-d-flex fc-flex-column fc-gap-10'>
										<h6 class='fc-title'>Text alignment</h6>
										<div class='fc-d-flex fc-flex-wrap fc-gap-20'>
											<div class='fc-form-check'>
												<input class='fc-form-check-input text-align-left' type='radio' name='flexRadioDefault' >
												<label class='fc-form-check-label' for='text-align-left'>
													Left
												</label>
											</div>
											<div class='fc-form-check'>
												<input class='fc-form-check-input text-align-center' type='radio' name='flexRadioDefault' >
												<label class='fc-form-check-label' for='text-align-center'>
													Center
												</label>
											</div>
											<div class='fc-form-check'>
												<input class='fc-form-check-input text-align-right' type='radio' name='flexRadioDefault' >
												<label class='fc-form-check-label' for='text-align-right'>
													Right
												</label>
											</div>
										</div>
									</div>
									<div class='fc-d-flex fc-flex-column fc-gap-10'>
										<h6 class='fc-title'>Font color</h6>
										<div>
											<input tabindex='100'  name='fc_tool_fgc' type='text' value='' class='fc-form-control color fc-btn fc-btn-sm  fc_tool_fgc' />
										</div>
									</div>
									
								</div>
							</div>
							<div class='fc-drawer-section'>
								<div class='fc-drawer-section-heading'>
									Margin
								</div>
								<div class='fc-drawer-section-content'>
									<div class='fc-d-flex fc-flex-wrap fc-gap-20'>
										<div class='fc-d-flex fc-flex-column fc-gap-10 fc-flex-1'>
											<h6 class='fc-title'>Top</h6>
											<div>
												<input tabindex='105' type='number' min='0' max='100' value='0' class='fc-form-control fc_margin_top' />
											</div>
										</div>
										<div class='fc-d-flex fc-flex-column fc-gap-10 fc-flex-1'>
											<h6 class='fc-title'>Right</h6>
											<div>
												<input tabindex='108' type='number' min='0' max='100' value='0' class='fc-form-control fc_margin_right' />
											</div>
										</div>
										<div class='fc-d-flex fc-flex-column fc-gap-10 fc-flex-1'>
											<h6 class='fc-title'>Left</h6>
											<div>
												<input tabindex='107' type='number' min='0' max='100' value='0' class='fc-form-control fc_margin_left' />
											</div>
										</div>
										<div class='fc-d-flex fc-flex-column fc-gap-10 fc-flex-1'>
											<h6 class='fc-title'>Bottom</h6>
											<div>
												<input tabindex='106' type='number' min='0' max='100' value='0' class='fc-form-control fc_margin_bottom' />
											</div>
										</div>
									</div>

									
								</div>
							</div>
							<div class='fc-drawer-section'>
								<div class='fc-drawer-section-heading'>
									Padding
								</div>
								<div class='fc-drawer-section-content'>
									<div class='fc-d-flex fc-flex-wrap fc-gap-20'>
										<div class='fc-d-flex fc-flex-column fc-gap-10 fc-flex-1'>
											<h6 class='fc-title'>Top</h6>
											<div>
												<input tabindex='109' type='number' min='0' max='100' value='0' class='fc-form-control fc_padding_top' />
											</div>
										</div>
										<div class='fc-d-flex fc-flex-column fc-gap-10 fc-flex-1'>
											<h6 class='fc-title'>Right</h6>
											<div>
												<input tabindex='112' type='number' min='0' max='100' value='0' class='fc-form-control fc_padding_right' />
											</div>
										</div>
										<div class='fc-d-flex fc-flex-column fc-gap-10 fc-flex-1'>
											<h6 class='fc-title'>Left</h6>
											<div>
												<input tabindex='111' type='number' min='0' max='100' value='0' class='fc-form-control fc_padding_left' />
											</div>
										</div>
										<div class='fc-d-flex fc-flex-column fc-gap-10 fc-flex-1'>
											<h6 class='fc-title'>Bottom</h6>
											<div>
												<input tabindex='110' type='number' min='0' max='100' value='0' class='fc-form-control fc_padding_bottom' />
											</div>
										</div>
									</div>

									
								</div>
							</div>
							<div class='fc-drawer-section'>
								<div class='fc-drawer-section-heading'>
									Background
								</div>
								<div class='fc-drawer-section-content'>
									<div class='fc-d-flex fc-flex-column fc-gap-20'>
										<div class='fc-d-flex fc-flex-column fc-gap-10 fc-flex-1'>
											<h6 class='fc-title'>Background color</h6>
											<div>
												<input tabindex='106' name='fc_tool_bgc' type='text' value='' class='color fc_tool_bgc' />
											</div>
										</div>
										<div class='fc-d-flex fc-flex-column fc-gap-10 fc-flex-1'>
											<h6 class='fc-title'>Background Remove</h6>
											<div>
												<div class='fc-form-check fc-form-switch'>
													<input type='checkbox' role='switch' name='fc_tool_bg_transparent' data-class='fc_tool_bg_transparent' class='fc-form-check-input fc_tool_bg_transparent' id='bg-remove'>

													<label class='fc-form-check-label' for='bg-remove'>No background</label>
												</div>
											</div>
										</div>
									</div>

								<div class='fc-d-flex fc-flex-column fc-gap-10'>
										<button class='fc-btn fc-btn-outline-primary fc-btn-sm fc-text-center fc-reset-style'>Reset</button>
									</div>	
								</div>
							</div>			
							<div class='fc-item-top-space fc-alert fc-alert-warning fc-control-info'>
								Press <span class='fc-btn fc-btn-sm fc-btn-primary'>esc</span> escape to close editor.
							</div>
			</div>
								
		</div>
               
		";
				$html .= '</div>';
				$html .= '</dd>';
			}
			return $html;
		}

		function get_css_property_unit( $property ) {

			switch ( $property ) {

				case 'width':
					$unit = '%';
					break;
				case 'font-size':
					  $unit = 'px';
					break;
				case 'border-radius':
					  $unit = 'px';
				case 'padding':
					  $unit = 'px';
				case 'padding-top':
					  $unit = 'px';
				case 'padding-right':
					  $unit = 'px';
				case 'padding-bottom':
					  $unit = 'px';
				case 'padding-left':
					  $unit = 'px';
				case 'margin':
					  $unit = 'px';
				case 'margin-top':
					  $unit = 'px';
				case 'margin-right':
					  $unit = 'px';
				case 'margin-bottom':
					  $unit = 'px';
				case 'margin-left':
					  $unit = 'px';
					break;
				default:
					  $unit = '';

			}

				return $unit;
		}

			/**
			 * Get the google fonts from the API or in the cache
			 *
			 * @param  integer $amount
			 *
			 * @return String
			 */
		public static function get_fonts( $amount = 'all' ) {
			$selectDirectory      = WPGMP_CORE_CLASSES;
			$selectDirectoryInc   = WPGMP_CORE_CLASSES;
			$finalselectDirectory = '';
			if ( is_dir( $selectDirectory ) ) {
				$finalselectDirectory = $selectDirectory;
			}
			if ( is_dir( $selectDirectoryInc ) ) {
				$finalselectDirectory = $selectDirectoryInc;
			}
			$fontFile = $finalselectDirectory . '/cache/google-web-fonts.txt';
			// Total time the file will be cached in seconds, set to a week
			$cachetime = 1;
			if ( file_exists( $fontFile ) && $cachetime < filemtime( $fontFile ) ) {
				$content = json_decode( file_get_contents( $fontFile ) );
			} else {
				$googleApi   = 'https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&key=AIzaSyA_3pC94bBI_G_35mmBPzCU0VayhGrTZxI';
				$fontContent = wp_remote_get( $googleApi, array( 'sslverify' => false ) );
				$fp          = fopen( $fontFile, 'w' );
				fwrite( $fp, $fontContent['body'] );
				fclose( $fp );
				$content = json_decode( $fontContent['body'] );
			}
			if ( $amount == 'all' ) {
				return $content->items;
			} else {
				return array_slice( $content->items, 0, $amount );
			}
		}

		function generate_css( $prefix, $originalelements, $realformelements, $isImportant ) {

				
				$prefixspecificstyle = '';

				$final = array();

				$important = ( $isImportant ) ? '!important' : '';

			if ( is_array( $originalelements ) ) {

				foreach ( $originalelements as $element ) {

					foreach ( $realformelements as $key => $value ) {

						if ( strpos( $key, $element ) === 0 ) {

							$property                          = explode( '*', $key );
							$final[ $element ][ $property[1] ] = $value;
						}
					}
				}

				foreach ( $final as $selector => $cssInfo ) {

						$prefixspecificstyle .= $prefix . ' .' . $selector . '{ ';
					foreach ( $cssInfo as $cssproperty => $csspropertyvalue ) {

						$unit                 = FlipperCode_HTML_Markup::get_css_property_unit( $cssproperty );
						$unit                 = '';
						$prefixspecificstyle .= $cssproperty . ' : ' . $csspropertyvalue . $unit . $important . '; ';

					}
						$prefixspecificstyle .= ' }';

				}
			}

				return $prefixspecificstyle;

		}

		function give_css_with_prefix( $prefix, $layoutid, $productcustomiserdata ) {

				$originalelements = $productcustomiserdata[ $layoutid ]['originalelements'];

				$realformelements = $productcustomiserdata[ $layoutid ]['formdata'];

				$backupStyle = FlipperCode_HTML_Markup::generate_css( $prefix, $originalelements, $realformelements, false );

				return $backupStyle;

		}

		public static function get_userdefined_templates( $name, $atts, $templateType, $parentTemplate ) {

			$dbsetting = get_option( $atts['dboption'] );
			
			$userdefinetemplates = get_option( $atts['dboption'] . '-fc-styles' );

			$templatetype = $atts['templatetype'];
			foreach ( $userdefinetemplates as $key => $templates ) {

				
				if ( $templates['templateType'] != $templatetype ) {
					continue;
				}

					$directory                    = $key;
					$templatePreviewSpecificClass = '.current-templte-' . $directory;
					$css                          = FlipperCode_HTML_Markup::give_css_with_prefix( $templatePreviewSpecificClass, $directory, $userdefinetemplates );
					$preview                      = html_entity_decode( $templates['templateMarkup'] );
					$title                        = ucwords( $directory );
					$atts['productTemplate']      = $directory;
					$atts['templatetype']         = $templates['templateType'];
					$atts['parentTemplate']       = $parentTemplate;
					$customiserLink               = FlipperCode_HTML_Markup::get_product_customizer_link( $atts );

				if ( $key % 3 == 0 and $key != 0 ) {

					$html .= '</div><div class="fc-divider">';
				}

					$html .= "<div class='fc-4 custom-temp-inside'><style>" . $css . "</style><div class='fc_template current-templte-" . $directory . "'>";

				$currentTemplateCondition = ( $dbsetting['default_templates'][ $templateType ] != $key ) ? true : false;

				$useThis = ( $currentTemplateCondition ) ? "<a class='set-default-template' href='javascript:void(0)' data-templateName = '" . $directory . "' data-product= '" . $atts['dboption'] . "' data-templatetype='" . $templateType . "' >Use this</a>" : "<a href='javascript:void();' class='current-temp-in-use'>In Use</a>";

				$deleteTemplateLink = ( $currentTemplateCondition ) ? "<a class='default-custom-template' href='javascript:void(0)' data-templateName = '" . $directory . "' data-product= '" . $atts['dboption'] . "' data-templatetype='" . $templateType . "'>Delete This Template</a>" : '';

					$html .= "<div class='fc_screenshot'>" . $preview . "</div>
									<div class='fc_name'>" . $title . " - Custom Defined Template</div>
									<div class='fc_tools'>" . $useThis . " | <a href='" . $customiserLink . "' target='_blank'>Customize</a>
									 | " . $deleteTemplateLink . '
									</div>
							 </div></div>';

			}

			
			return $html;
		}

		public function get_product_customizer_link( $linkInfo ) {

			
			$info = array(
				'fpc'             => 'true',
				'product'         => $linkInfo['product'],
				'productTemplate' => $linkInfo['productTemplate'],
				'instance'        => $linkInfo['instance'],
				'templatetype'    => $linkInfo['templatetype'],
				'settingPage'     => $linkInfo['settingPage'],
			);

			if ( ! empty( $linkInfo['parentTemplate'] ) ) {
				$info['parentTemplate'] = $linkInfo['parentTemplate'];
			}

			$productCustomizerLink = add_query_arg( $info, admin_url( '?page=flippercode-product-customiser' ) );

			return $productCustomizerLink;

		}

		public static function field_templates( $name, $atts ) {

			$templatesHtml = FlipperCode_HTML_Markup::get_all_templates( $name, $atts );
			return $templatesHtml;
		}


		/**
		 * Image picker element.
		 *
		 * @param  string $name  No use.
		 * @param  array  $atts  Attributes for custom html.
		 * @return html       Image Picker.
		 */
		public static function field_image_picker( $name, $atts ) {
			if ( empty( $atts['src'] ) ) {
				$show = 'false';
			} else {
				$show = 'true';
			}

			$html = "<div class='fc-image-picker'>";
			$html .= FlipperCode_HTML_Markup::field_image(
				'selected_image', array(
					'src'      => $atts['src'],
					'width'    => '100',
					'class'    => 'noclass selected_image',
					'height'   => '100',
					'required' => $atts['required'],
					'show'     => $show,
					'id'       => 'image_' . $atts['id'],
				)
			);

			$html .= FlipperCode_HTML_Markup::field_anchor(
				'choose_image', array(
					'value' => "<i class='wep-icon-upload wep-icon-xl'></i>".$atts['choose_button'],
					'href'  => 'javascript:void(0);',
					'class' => 'fc-btn fc-btn-primary fc-btn-sm choose_image',
					'data'  => array(
						'target' => $name,
						'ref'    => $atts['id'],
					),

				)
			);

			$html .= FlipperCode_HTML_Markup::field_anchor(
				'remove_image', array(
					'value'  => "<i class='wep-icon-trash wep-icon-lg'></i>",
					'before' => '<div class="fc-3">',
					'after'  => '</div>',
					'href'   => 'javascript:void(0);',
					'class'  => 'fc-btn fc-btn-danger fc-btn-icon remove_image',
					'data'   => array( 'target' => $name ),
					'show'   => $show,
					'id'     => 'remove_image_' . $atts['id'],

				)
			);

			$html .= FlipperCode_HTML_Markup::field_hidden(
				'group_marker', array(
					'value' => $atts['src'],
					'id'    => 'input_' . $atts['id'],
					'name'  => $name,
				)
			);

			if ( isset( $atts['desc'] ) && ! empty( $atts['desc'] ) ) {
				$html .= '<div class="fc-form-text">' . $atts['desc'] . '</div>'; }

			$html .="</div>";
			return $html;
		}

		/**
		 * Custom HTML to display.
		 *
		 * @param  string $name  No use.
		 * @param  array  $atts  Attributes for custom html.
		 * @return html       Body of custom html.
		 */
		public static function field_html( $name, $atts ) {

			$html = '';

			if ( isset( $atts['html'] ) ) {
				$html = $atts['html'];
			}

			if ( isset( $atts['desc'] ) && ! empty( $atts['desc'] ) ) {

				return '<div ' . self::get_element_attributes( $atts ) . '>' . $html . '</div>'.'<div class="fc-form-text">' . $atts['desc'] . '</div>';

			}else{

				return '<div ' . self::get_element_attributes( $atts ) . '>' . $html . '</div>';
			}

			
		}
		/**
		 * Radio Slider
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_radio_slider( $name, $atts ) {

			if ( isset( $attr['value'] ) && $attr['value'] != '' ) {
				$value = $attr['value'];
			} elseif ( isset( $attr['default_value'] ) ) {
				$value = $atts['default_value'];
			} else {
				$value = '';
			}

			$min   = isset( $attr['min'] ) ? $attr['min'] : 1;
			$max   = isset( $attr['max'] ) ? $attr['max'] : 100;
			$id   = isset( $attr['id'] ) ? $attr['id'] : 'id';

			return '<div id="ui_' . $id . '" data-value="' . $value . '" data-min="' . $min . '" data-max="' . $max . '" class="ui-slider">
			<input type="hidden" id="' . $id . '" value="' . $value . '" name="' . $name . '"></div>';
		}
		/**
		 * Hidden Field
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_hidden( $name, $atts ) {

			if ( isset( $atts['name'] ) ) {
				$name = $atts['name'];
			}

			return '<input name=' . $name . ' type="hidden" ' . self::get_element_attributes( $atts ) . ' />';
		}
		
		/**
		 * Group Heading
		 *
		 * @param  string $name Group title.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_group( $name, $atts ) {

			extract( $atts );
			$value = $value ? $value : $default_value;
			$value = apply_filters( 'wpgmp_field_group_label', $value, $atts );
			$html = '<h4 class="fc-title-blue fc-item-shadow">' . $value. '</h4>';
			if( isset( $atts['tutorial_link'] ) && !empty( $atts['tutorial_link'] ) ){
				$html .= '<a href="'.$atts['tutorial_link'].'" class="fc_tutorial_link" target="_blank" >Tutorial</a>';
			}  

			return $html;
		}
		/**
		 * DIV node
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_div( $name, $atts ) {

			extract( $atts );
			$value = $value ? $value : $default_value;
			return '<div name="' . $name . '" ' . self::get_element_attributes( $atts ) . '>' . $value . '</div>';
		}
		/**
		 * Blockquote node
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_blockquote( $name, $atts ) {

			extract( $atts );
			$value = $value ? $value : $default_value;
			return '<blockquote>' . $atts['value'] . '</blockquote>';

		}
		/**
		 * Text Input element.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_text( $name, $atts ) {

			if ( isset( $atts['value'] ) ) {
				$elem_value = $atts['value'];
			} else if ( isset( $atts['default_value'] ) ) {
				$elem_value = $atts['default_value'];
			} else {
				$elem_value = '';
			}

			if ( isset( $atts['class'] ) && strstr( $atts['class'], 'color' ) !== false ) {
				$elem_value = str_replace( '#', '', $elem_value );
				$elem_value = '#' . $elem_value;
			}

			if(isset($atts['class'])){
				$atts['class'] = 'fc-form-control '.$atts['class'];	
			} else{
				$atts['class'] = 'fc-form-control ';
			}
			$element = '<input type="text" name="' . $name . '" value="' . esc_attr( stripcslashes( $elem_value ) ) . '"' . self::get_element_attributes( $atts ) . ' />';
			if ( isset( $atts['desc'] ) && ! empty( $atts['desc'] ) ) {
				$element .= '<div class="fc-form-text">' . $atts['desc'] . '</div>'; }
			return apply_filters( 'wpgmp_input_field_' . $name, $element, $name, $atts );
		}
		
		/**
		 * Display Information message in <p> tag.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_infoarea( $name, $atts ) {
			return '<p>' . $atts['desc'] . '</p>'; }

		/**
		 * Image tag.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_image( $name, $atts ) {

			if ( isset( $atts['show'] ) and $atts['show'] == 'false' ) {
				$hide = 'display:none;';
			} else {
				$hide = '';
			}

			$element = '<img ' . self::get_element_attributes( $atts ) . ' >';
			if ( isset( $atts['desc'] ) && ! empty( $atts['desc'] ) ) {
				$element .= '<div class="fc-form-text">' . $atts['desc'] . '</div>'; }
			return apply_filters( 'wpgmp_input_field_' . $name, $element, $name, $atts );
		}
		/**
		 * Generate output using wp_editor.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_wp_editor( $name, $atts ) {

			$value  = $atts['value'] ? $atts['value'] : $atts['default_value'];
			$args   = array(
				'textarea_rows' => $atts['textarea_rows'],
				'textarea_name' => $atts['textarea_name'],
				'editor_class'  => $atts['class'],
			);
			$output = '';
			ob_start();
			wp_editor( esc_textarea( $value ), $name, $args );
			$output .= ob_get_contents();
			ob_clean();
			$output .= '<div class="fc-form-text">' . $atts['desc'] . '</div>';
			return $output;

		}

		/**
		 * Textarea element.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_textarea( $name, $atts ) {

			if ( isset( $atts['value'] ) ) {
				$elem_value = $atts['value'];
			} else if ( isset( $atts['default_value'] ) ) {
				$elem_value = $atts['default_value'];
			} else {
				$elem_value = '';
			}
		
			$element  = '';
			$element .= '<textarea rows="5" name="' . esc_attr( $name ) . '"' . self::get_element_attributes( $atts ) . '>' . esc_textarea( wp_unslash( $elem_value ) ) . '</textarea>';
			if ( isset( $atts['desc'] ) && ! empty( $atts['desc'] ) ) {
				$element .= '<div class="fc-form-text">' . $atts['desc'] . '</div>';
			}
		
			
			return apply_filters( 'wpgmp_input_field_' . $name, $element, $name, $atts );
		}
		
		/**
		 * File Input element.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_file( $name, $atts ) {

			$file_text = isset($atts['file_text']) && !empty($atts['file_text']) ? $atts['file_text'] : 'Choose a File';
			$elem_value = $atts['value'] ? $atts['value'] : $atts['default_value'];
			$element    = '<div class="fc-field ext_btn wep-btn-input fc-file-input-wrapper"><input type="file" class="fc-file_input fc-file-input"  name="' . $name . '" ' . self::get_element_attributes( $atts ) . ' /><label for="file"><span class="icon-upload2" ></span> &nbsp;'.$file_text.' </label><label class="fc-file-details"></label></div>';
			if ( isset( $atts['desc'] ) && ! empty( $atts['desc'] ) ) {
				$element .= '<div class="fc-form-text">' . $atts['desc'] . '</div>'; }

			return apply_filters( 'wpgmp_input_field_' . $name, $element, $name, $atts );
		}
		/**
		 * Select Input element.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_select( $name, $atts ) {

			if ( ! isset( $atts['options'] ) || empty( $atts['options'] ) ) {
				return; }

			$options             = '';
			$elem_value          = isset( $atts['current'] ) ? $atts['current'] : '';

			if ( $elem_value == '' && isset( $atts['default_value'] ) ) {
				$elem_value = $atts['default_value'];
			}

			$optgroup            = isset( $atts['optgroup'] ) ? $atts['optgroup'] : 'false';
			$selectable_optgroup = isset( $atts['selectable_optgroup'] ) ? $atts['selectable_optgroup'] : 'false';
			$id                  = ( isset( $atts['id'] ) && ( $atts['id'] != '' ) ) ? $atts['id'] : $name;
			$main_class          = isset( $atts['class'] ) ? $atts['class']." fc-form-select" : 'fc-form-select';

			if ( 'true' == $optgroup ) {
				if ( 'true' == $selectable_optgroup ) {
					foreach ( $atts['options'] as $opt_name => $values ) {
						foreach ( $values as $key => $value ) {
							if ( $value == $opt_name ) {
								$class = 'optionParent';
							} else {
								$class = 'optionChild';
							}
							$options .= '<option class = "' . $class . '" value="' . esc_attr( $key ) . '" ' . selected( $elem_value, $key, false ) . '>' . $value . '</option>';
						}
					}
				} else {
					foreach ( $atts['options'] as $opt_name => $values ) {
						$options .= '<optgroup label="' . $opt_name . '">';
						foreach ( $values as $key => $value ) {
							$options .= '<option value="' . esc_attr( $key ) . '" ' . selected( $elem_value, $key, false ) . '>' . $value . '</option>';
						}
						$options .= '</optgroup>';
					}
				}
			} else {
				foreach ( $atts['options'] as $key => $value ) {
					$options .= '<option value="' . esc_attr( $key ) . '" ' . selected( $elem_value, $key, false ) . '>' . $value . '</option>';
				}
			}

			// removed fc_select2 from here.
			$main_class = ( isset( $atts['select2'] ) && ( $atts['select2'] == 'false' ) ) ? 'class="fc-form-select ' . $main_class . '"' : 'class="fc-form-select fc_select2 ' . $main_class . '"';

			$element = '<select id="' . $id . '" ' . $main_class . ' name="' . $name . '" ' . self::get_element_attributes( $atts ) . '>' . $options . '</select>';
			if ( isset( $atts['desc'] ) && ! empty( $atts['desc'] ) ) {
				$element .= '<div class="fc-form-text">' . $atts['desc'] . '</div>'; }
			return apply_filters( 'wpgmp_select_field_' . $name, $element, $name, $atts );
		}

		/**
		 * Submit button element.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_submit( $name, $atts ) {
			if ( isset( $atts['no-sticky'] ) and $atts['no-sticky'] == 'true' ) {
				$no_sticky = 'fc-no-sticky';
			} else {
				$no_sticky = 'fc-sticky';
			}

			
			$parent_class = isset($atts['parent_class']) ? $atts['parent_class'] : '';

			$element = '<div class="'.$no_sticky.' fc-form-footer"><input type="submit"  name="' . $name . '" class="fc-btn fc-btn-primary" value="' . $atts['value'] . '" '.self::get_element_attributes( $atts ) .'/></div>';
			
			return apply_filters( 'wpgmp_input_field_submit', $element, $name, $atts );
		}

		/**
		 * Button element.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_button( $name, $atts ) {

			$eventstr = '';
			if ( isset( $atts['onclick'] ) and ! empty( $atts['onclick'] ) ) {

				$eventstr .= 'onclick =' . stripcslashes( $atts['onclick'] );

			}

			$element = '<button name="' . $name . '" ' . self::get_element_attributes( $atts ) . '>'.$atts['value'].'</button>';

			if ( isset( $atts['desc'] ) && ! empty( $atts['desc'] ) ) {
				$element .= '<div class="fc-form-text">' . $atts['desc'] . '</div>'; }
			return apply_filters( 'wpgmp_input_field_button', $element, $name, $atts );
		}
		/**
		 * Checkbox input element.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_checkbox( $name, $atts ) {

			$id      = ( ! empty( $atts['id'] ) ) ? $atts['id'] : $name;

			if ( isset( $atts['value'] ) ) {
				$value = $atts['value'];
			} else if ( isset( $atts['default_value'] ) ) {
				$value = $atts['default_value'];
			} else {
				$value = '';
			}

			$desc = '';

			if ( isset( $atts['desc'] ) ) {
				$desc = $atts['desc'];
			}

			$element = '<div class="fc-form-group"><div class="fc-form-check"><input name=' . $name . ' type="checkbox" value="' . esc_attr( stripcslashes( $value ) ) . '"' . self::get_element_attributes( $atts ) . ' ' . checked( $value, $atts['current'], false ) . '/><label class="fc-form-check-label">' . $desc . '</label></div></div>';

			return apply_filters( 'wpgmp_input_field_' . $name, $element, $name, $atts );

		}

		/**
		 * Switch input element.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_checkbox_toggle( $name, $atts ) {

			$id      = ( ! empty( $atts['id'] ) ) ? $atts['id'] : $name;
			$value   = $atts['value'] ? $atts['value'] : $atts['default_value'];
			$element = '<div><label class="switch"><input type="checkbox"  id="' . $atts['id'] . '" name="' . $name . '" value="' . esc_attr( stripcslashes( $value ) ) . '"' . self::get_element_attributes( $atts ) . ' ' . checked( $value, $atts['current'], false ) . '/>&nbsp;&nbsp;<div class="round slider"><span></span></div></label></div> ';
			return apply_filters( 'wpgmp_input_field_' . $name, $element, $name, $atts );

		}
		/**
		 * Multiple Checkbox input element.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_multiple_checkbox( $name, $atts ) {

			$id      = ( ! empty( $atts['id'] ) ) ? $atts['id'] : $name;
			$value   = $atts['value'] ? $atts['value'] : $atts['default_value'];
			$element = '';
			if ( is_array( $value ) ) {
				foreach ( $value as $key => $val ) {
					if ( is_array( $atts['current'] ) and in_array( $key, $atts['current'] ) ) {
						$element .= '<div class="fc-form-check"><input type="checkbox"  name="' . $name . '" value="' . esc_attr( stripcslashes( $key ) ) . '"' . self::get_element_attributes( $atts ) . ' checked="checked" /><label>' . $val . '</label></div> ';
					} else {
						$element .= '<div class="checkbox fc-form-check"><input type="checkbox"  name="' . $name . '" value="' . esc_attr( stripcslashes( $key ) ) . '"' . self::get_element_attributes( $atts ) . ' /><label>' . $val . '</label></div> '; }
				}
			}
			return apply_filters( 'wpgmp_input_field_' . $name, $element, $name, $atts );

		}
		/**
		 * Anchor tag element.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_anchor( $name, $atts ) {
			if ( isset( $atts['show'] ) and $atts['show'] == 'false' ) {
				$style = "style='display:none;'";
			} else {
				$style = '';
			}
			$id      = ( ! empty( $atts['id'] ) ) ? $atts['id'] : $name;
			$value   = $atts['value'] ? $atts['value'] : $atts['default_value'];
			$element = '<a ' . $style . ' id="' . $id . '" name="' . $name . '" ' . self::get_element_attributes( $atts ) . '/>' . $value . '</a>';
			if ( isset( $atts['desc'] ) && ! empty( $atts['desc'] ) ) {
				$element .= '<div class="fc-form-text">' . $atts['desc'] . '</div>'; }
			return apply_filters( 'wpgmp_input_field_' . $name, $element, $name, $atts );

		}

		public static function field_temp_access( $name, $atts ) {

			$id      = ( ! empty( $atts['id'] ) ) ? $atts['id'] : $name;

			if ( isset( $atts['value'] ) ) {
				$value = $atts['value'];
			} else if ( isset( $atts['default_value'] ) ) {
				$value = $atts['default_value'];
			} else {
				$value = '';
			}

			$desc = '';

			if ( isset( $atts['desc'] ) ) {
				$desc = $atts['desc'];
			}

			$element = '<a href="" class="'.$atts['class'].'">'.$atts['value'].'</a>';
			return apply_filters( 'wpgmp_input_field_' . $name, $element, $name, $atts );

		}
		/**
		 * Radio input element.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_radio( $name, $atts ) {

			$elem_value    = $atts['current'] ? $atts['current'] : $atts['default_value'];
			$element       ='';
			$radio_options = $atts['radio-val-label'];
			if ( is_array( $atts['radio-val-label'] ) ) {

				foreach ( $radio_options as $radio_val => $radio_label ) {
					$element .= '<div class="fc-form-check"><input type="radio" name="' . $name . '" value="' . esc_attr( stripcslashes( $radio_val ) ) . '"' . self::get_element_attributes( $atts ) . ' ' . checked( $radio_val, $elem_value, false ) . '><label class="fc-form-check-label">' . $radio_label . '</label></div>';
				}
			}
			if ( isset( $atts['desc'] ) && ! empty( $atts['desc'] ) ) {
				$element .= '<div class="fc-form-text">' . $atts['desc'] . '</div>'; }
			
			$element .="";
			return apply_filters( 'wpgmp_input_field_' . $name, $element, $name, $atts );

		}
		/**
		 * Message boxes.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_message( $name, $atts ) {

			$element = '<div ' . self::get_element_attributes( $atts ) . '>' . $atts['value'] . '</div>';
			return apply_filters( 'wpgmp_input_field_' . $name, $element, $name, $atts );
		}
		/**
		 *  Sub heading
		 *
		 * @param  string $heading heading.
		 * @return html   blockquote html wrapper.
		 */
		public static function sub_heading( $heading ) {

			return '<div class="fc-12">
					<blockquote>
					' . $heading . '
					</blockquote>
					</div>';
		}

		public static function field_tab( $name, $atts ) {

			$tabs             = $atts['tabs'];
			$current          = $atts['current'];
			$page             = $atts['page'];
			$parent_page_slug = $atts['parent_page_slug'];
			if ( ! empty( $parent_page_slug ) and $parent_page_slug = 'page' ) {
				$pageslug = 'edit.php?post_type=page&page=';
			} else {
				$pageslug = '?page='; }
			$element = '<h2 class="nav-tab-wrapper">';
			foreach ( $tabs as $tab => $name ) {
				$class    = ( $tab == $current ) ? ' nav-tab-active' : '';
				$element .= "<a class='nav-tab$class' href='$pageslug$page&tab=$tab'>$name</a>";
			}

			return apply_filters( 'wpgmp_input_field_' . $name, $element, $name, $atts );

		}

		/**
		 * Table generator.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_table( $name, $atts ) {
			$heads   = $atts['heading'];
			$data    = $atts['data'];
			$current = $atts['current'];
			$id      = ( isset( $atts['id'] ) ) ? $atts['id'] : $name;
			if ( ! isset( $atts['class'] ) or '' == $atts['class'] ) {
				$atts['class'] = 'fc-table fc-table-layout3 dataTable';
			}
			$output = '<div class="fc-table-responsive"><table ' . self::get_element_attributes( $atts ) . ' id="' . $id . '"><thead><tr>';

			if ( is_array( $heads ) ) {

				foreach ( $heads as $head ) {
					$output .= '<th><strong>' . $head . '</strong></th>';
				}
			}

			$output .= '</tr></thead><tbody>';
			if ( ! empty( $data ) ) {
				foreach ( $data as $row => $columns ) {
					$output .= '<tr>';
					foreach ( $columns as $key => $col ) {
						$output .= '<td>' . ( $col ) . '</td>'; }
					$output .= '</tr>';
				}
			}

			$output .= '</tbody></table></div>';

			return apply_filters( 'wpgmp_input_field_' . $name, $output, $name, $atts );

		}
		/**
		 * Show success or error message.
		 *
		 * @param  array $response Success or Error message.
		 * @return html          Success or error message wrapper.
		 */
		public static function show_message( $response ) {

			if ( empty( $response ) ) {
				return; }

			$output  = '';
			$output .= '<div id="message" class="' . $response['type'] . '">';
			$output .= '<p><strong>' . $response['message'] . '</strong></p></div>';

			return $output;
		}
		/**
		 * Button Wrapper
		 *
		 * @param  string $title Button title.
		 * @param  url    $link  Link url.
		 * @return html       Button wrapper.
		 */
		public static function button( $title, $link ) {

			return '<span class="glyphicon glyphicon-add wpgmp_new_add button action"><a href="' . esc_html( $link ) . '">' . $title . '</a></span>';
		}
		/**
		 * Category Selection Generator.
		 *
		 * @param  string $name Element name.
		 * @param  array  $atts Attributes.
		 * @return html       Element Html.
		 */
		public static function field_category_selector( $name, $atts ) {
			
			$data = ( isset( $atts['data'] ) && ! empty( $atts['data'] ) ) ? $atts['data'] : array();

			$placeholder = $atts['placeholder'];
			$id          = ( isset( $atts['id'] ) && ( $atts['id'] != '' ) ) ? $atts['id'] : $name;
			$class       = $atts['class'];
			$options     = '';

			if ( isset( $atts['data_type'] ) && ! empty( $atts['data_type'] ) && $atts['data_type'] != '' ) {
				$data_type = explode( '=', $atts['data_type'] );
				switch ( $data_type[0] ) {

					case 'cpt':
						$all_post_type = array(
							'_builtin' => false,
							'public'   => true,
						);
							$types     = get_post_types( $all_post_type );

						$post = ( in_array( 'post', $atts['current'] ) ) ? 'selected="selected"' : '';
						$page = ( in_array( 'page', $atts['current'] ) ) ? 'selected="selected"' : '';

						$options .= "<option value='post' {$post}>Post</option>";
						$options .= "<option value='page' {$page}>Pages</option>";
						foreach ( $types as $type ) {
							$all_post_type[] = $type;
							$selected        = in_array( $type, $atts['current'] ) ? 'selected="selected"' : '';
							$options        .= "<option value='{$type}' {$selected}>" . ucwords( $type ) . '</option>';
						}
						break;

					case 'taxonomy':
						$terms = get_terms( $data_type[1], array( 'hide_empty' => 0 ) );
						foreach ( $terms as $term ) {
							$selected = in_array( $term->term_id, $atts['current'] ) ? 'selected="selected"' : '';
							$options .= "<option value='{$term->term_id}' {$selected}>{$term->name}</option>";
						}
						break;

					case 'post_type':
						$posts = get_posts( array( 'post_type' => $data_type[1] ) );
						foreach ( $posts as $post ) {
							$selected = in_array( $post->ID, $atts['current'] ) ? 'selected="selected"' : '';
							$options .= "<option value='{$post->ID}' {$selected} >{$post->post_title}</option>";
						}
						break;

					case 'users':
						$users = isset( $data_type[1] ) ? get_users( array( 'role' => $data_type[1] ) ) : get_users( array() );
						foreach ( $users as $user ) {
							$selected = in_array( $user->data->ID, $atts['current'] ) ? 'selected="selected"' : '';
							$options .= "<option value='{$user->data->ID}' {$selected} >{$user->data->user_login}</option>";
						}
						break;
				}
			} elseif ( ! empty( $data ) ) {
				foreach ( $data as $row ) {
					$selected = in_array( $row['id'], $atts['current'] ) ? 'selected="selected"' : '';
					$options .= "<option value='" . $row['id'] . "' {$selected}>" . $row['text'] . '</option>';
				}
			}

			if ( isset($atts['multiple']) && $atts['multiple'] == 'false' ) {

				$multiple_select = '';

			} else {

				$multiple_select = 'multiple="multiple"';

			}

			// removed fc_select2 from here.
			$output = '

		   <select id="' . $id . '" class="fc-form-select fc_select2 ' . $class . '" name="' . $name . '[]" data-tags="true" data-placeholder="' . $placeholder . '" data-allow-clear="true" ' . $multiple_select . '>

			 ' . $options . '

		   </select>

		   ';

			if ( isset( $atts['desc'] ) && ! empty( $atts['desc'] ) ) {

				$output .= '<div class="fc-form-text">' . $atts['desc'] . '</div>'; }

			return $output;
		}
	}
}
