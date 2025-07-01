<?php
/**
 * Template class
 *
 * @author Flipper Code<hello@flippercode.com>
 * @version 5.3.3
 * @package WP Maps Pro
 */

if ( ! class_exists( 'WPGMP_Template' ) ) {

	/**
	 * Controller class to display views.
	 *
	 * @author: Flipper Code<hello@flippercode.com>
	 * @version: 5.3.3
	 * @package: Maps
	 */

	class WPGMP_Template extends FlipperCode_HTML_Markup {


		function __construct( $options = array() ) {

			$dubug_info  = maybe_unserialize( get_option( 'wpgmp_settings' ) );
			$debug_array = array();
			if ( isset( $dubug_info['wpgmp_debug_info'] ) && ! empty( $dubug_info['wpgmp_debug_info'] ) ) {
				$debug_array = maybe_unserialize( $dubug_info['wpgmp_debug_info'] );
			}

			$productOverview = array(
				'debug_array' => $debug_array,
				'subscribe_mailing_list' => esc_html__( 'Subscribe to our mailing list', 'wp-google-map-plugin' ),
				'product_info_heading' => esc_html__( 'Plugin Information', 'wp-google-map-plugin' ),
				'product_info_desc' => esc_html__( 'For each of our plugins, we have created step by step detailed tutorials that helps you to get started quickly.', 'wp-google-map-plugin' ),
				'live_demo_caption' => esc_html__( 'Product Detail Information', 'wp-google-map-plugin' ),
				'installed_version' => esc_html__( 'Installed version :', 'wp-google-map-plugin' ),
				'latest_version_available' => esc_html__( 'Latest Version Available : ', 'wp-google-map-plugin' ),
				'updates_available' => esc_html__( 'Update Available', 'wp-google-map-plugin' ),
				'get_started_btn_text' => esc_html__( 'Get Started', 'wp-google-map-plugin' ),
				'getting_started_link' => 'https://www.wpmapspro.com/tutorials/',
				'subscribe_now' => array(
					'heading' => esc_html__( 'Subscribe Now', 'wp-google-map-plugin' ),
					'desc1' => esc_html__( 'Receive updates on our new product features and new products effortlessly.', 'wp-google-map-plugin' ),
					'desc2' => esc_html__( 'We will not share your email addresses in any case.', 'wp-google-map-plugin' ),
				),

				'product_support' => array(
					'heading' => esc_html__( 'Product Support', 'wp-google-map-plugin' ),
					'desc' => esc_html__( 'For our each product we have very well explained starting guide to get you started in matter of minutes.', 'wp-google-map-plugin' ),
					'click_here' => esc_html__( ' Click Here', 'wp-google-map-plugin' ),
					'desc2' => esc_html__( 'For our each product we have set up demo pages where you can see the plugin in working mode. You can see a working demo before making a purchase.', 'wp-google-map-plugin' ),
					'envato_purchase_date' => esc_html__( 'Purchase Date', 'wp-google-map-plugin' ),
					'envato_license_type' => esc_html__( 'Licence Type', 'wp-google-map-plugin' ),
					'envato_support_until' => esc_html__( 'Support Valid Upto', 'wp-google-map-plugin' )


				),

				'links' => array(
					'heading' => esc_html__( 'Important Links', 'wp-google-map-plugin' ),
					'desc' => 'Here are some informative guides.',
					'link' => array( 
						array(
						'label' => esc_html__( 'Generating Google Maps API Key', 'wp-google-map-plugin' ),
						'url' => 'https://www.wpmapspro.com/docs/get-a-google-maps-api-key/'
						),
						array(
							'label' => esc_html__( 'Basic Troubleshooting', 'wp-google-map-plugin' ),
							'url' => 'https://www.wpmapspro.com/docs/what-to-do-when-google-maps-is-not-visible/'
							),
							array(
								'label' => esc_html__( 'Export/Import', 'wp-google-map-plugin' ),
								'url' => 'https://www.wpmapspro.com/topic/export-import/'
							),
							array(
								'label' => esc_html__( 'Customizing Infowindow for Locations', 'wp-google-map-plugin' ),
								'url' => 'https://www.wpmapspro.com/docs/customizing-infowindow-messages-for-locations/'
							),
						array(
							'label' => esc_html__( 'Show Posts on Google Maps', 'wp-google-map-plugin' ),
							'url' => 'https://www.wpmapspro.com/topic/posts/'
							)
						,
						array(
							'label' => esc_html__( 'Creating Custom Filters', 'wp-google-map-plugin' ),
							'url' => 'https://www.wpmapspro.com/topic/filters/'
						),
						)
				),

				'support' => array(
					'heading' => esc_html__( 'Plugin Extensions', 'wp-google-map-plugin' ),
					'desc1' => esc_html__( 'Explore our ready-to-use extensions and unlock even more possibilities with WP Maps Pro.', 'wp-google-map-plugin' ),
					'link' => array(
						'label' => esc_html__( 'Explore Extensions', 'wp-google-map-plugin' ),
						'url' => 'https://weplugins.com/shop/'
					  
					  ),
				),
				'create_support_ticket' => array(
                    'heading' => esc_html__( 'Create Support Ticket', 'wp-google-map-plugin' ),
                    'desc1' => esc_html__( 'If you have any question and need our help, click below button to create a support ticket and our support team will assist you.', 'wp-google-map-plugin' ),
                    'link' => array( 
						'label' => esc_html__( 'Create Ticket', 'wp-google-map-plugin' ),
						'url' => 'https://weplugins.com/support/'
					)
                ),

                'hire_wp_expert' => array(
                    'heading' => esc_html__( 'Hire Wordpress Expert', 'wp-google-map-plugin' ),
                    'desc' => esc_html__( 'Do you have a custom requirement which is missing in this plugin?', 'wp-google-map-plugin' ),
                    'desc1' => esc_html__( 'We can customize this plugin according to your needs. Click below button to send an quotation request.', 'wp-google-map-plugin' ),
                    'link' => array(
                                    
                        'label' => esc_html__( 'Request a quotation', 'wp-google-map-plugin' ),
                        'url' => 'https://weplugins.com/contact/'
					)
                ),


			);

			$productInfo = array(
				'productName'       => esc_html__( 'WP MAPS', 'wp-google-map-plugin' ),
				'productSlug'       => 'wp-google-map-gold',
				'productTextDomain' => 'wp-google-map-plugin',
				'productVersion'    => WPGMP_VERSION,
				'productID'         => '5211638',
				'videoURL'          => 'https://www.youtube.com/playlist?list=PLlCp-8jiD3p2PYJI1QCIvjhYALuRGBJ2A',
				'docURL'            => 'https://wpmapspro.com/tutorials/',
				'demoURL'           => 'https://www.wpmapspro.com/docs/get-a-google-maps-api-key/',
				'productSaleURL'    => 'https://weplugins.com/shop',
				'multisiteLicence'  => 'https://weplugins.com/shop',
				'productOverview' => $productOverview,
			);
			$productInfo = array_merge( $productInfo, $options );
			parent::__construct( $productInfo );

		}

	}

}
