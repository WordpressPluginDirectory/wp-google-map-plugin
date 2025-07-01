<?php
if ( ! class_exists( 'WPGMP_Pro_Feature_UI_Modifier' ) ) {

	class WPGMP_Pro_Feature_UI_Modifier {

		public function __construct() {
			add_filter( 'wpgmp_form_footer_html', [ $this, 'append_pro_upgrade_modal_to_footer' ] );
			add_filter( 'wpgmp_field_group_label', [ $this, 'add_pro_suffix_to_label' ], 10, 2 );
			add_filter( 'wpgmp_input_label', [ $this, 'add_pro_suffix_to_label' ], 10, 2 );
			add_filter( 'wpgmp_input_field_submit', [ $this, 'handle_pro_submit_button' ], 10, 3 );
			add_filter( 'wpgmp_input_field_button', [ $this, 'handle_pro_submit_button' ], 10, 3 );
			add_filter( 'wpgmp_element_before_start_row', [ $this, 'wpgmp_element_before_start_row' ], 10, 3 );
			add_filter( 'wpgmp_template_directory', [ $this, 'wpgmp_template_directory' ], 10, 4 );

		}

		public function wpgmp_template_directory($is_pro,$directory,$name,$atts) { 

			if(strstr($directory,'layout')) {
				return true;
			}

			if(!strstr($directory,'default') and strstr($name,"item_skin")) {
				return true;
			}

			

			return $is_pro;

		}
		public function wpgmp_element_before_start_row($element,$name,$atts) {

			if ( WPGMP_Helper::wpgmp_is_feature_available($name, 'google') ) {
				$not_available_class = 'fc-feature-not-available';
			} else{
				$not_available_class = '';
			}
			
			if ( isset($atts['pro']) && $atts['pro'] == true && $atts['type'] == 'group') {
				$pro_feature_class = 'fc-pro-feature';
				$element = '<dt><section id="'.$name.'" class="fc-form-group {modifier} '.$atts['parent_class'].' '.$not_available_class.' '.$pro_feature_class.'">';
			} 
			
			if ( isset($atts['pro']) && $atts['pro'] == true && $atts['type'] != 'group' && $atts['type'] != 'submit' && $atts['type'] != 'button') {
				$pro_feature_class_lock = 'fc-pro-feature-lock';
				$element = '<section class="fc-form-group fc-row {modifier} '.$atts['parent_class'].' '.$not_available_class.' '.$pro_feature_class_lock .'">';
			} 
			
			return $element;
			
			}

		public function handle_pro_submit_button( $element, $name, $atts ) {
			$no_sticky = ( isset( $atts['no-sticky'] ) && $atts['no-sticky'] === 'true' ) ? 'fc-no-sticky' : 'fc-sticky';

			if ( isset( $atts['pro'] ) && $atts['pro'] === true ) {
				$element = '<div class="' . esc_attr( $no_sticky ) . ' fc-form-footer">
								<a href="javascript:void(0);" name="' . esc_attr( $name ) . '" class="fc-btn fc-btn-purple fc-modal-open">
									<i class="wep-icon-crown wep-icon-lg"></i><span>' . esc_html__( 'Upgrade to Pro', 'wp-google-map-plugin' ) . '</span>
								</a>
							</div>';
			}
			return $element;
		}

		public function add_pro_suffix_to_label( $value, $atts ) {
			if ( isset( $atts['pro'] ) && $atts['pro'] === true ) {
				$value .= ' <span class="fc-badge fc-badge-pro">' . esc_html__( 'PRO', 'wp-google-map-plugin' ) . '</span>';
			}
			return $value;
		}

		public function append_pro_upgrade_modal_to_footer( $output ) {
			$modal_html = WPGMP_Helper::wpgmp_render_pro_upgrade_modal();
			return $output . $modal_html;
		}
	}
}

return new WPGMP_Pro_Feature_UI_Modifier();