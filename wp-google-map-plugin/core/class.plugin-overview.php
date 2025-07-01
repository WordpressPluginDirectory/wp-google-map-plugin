<?php

/**
 * Flippercode Product Overview Setup Class
 *
 * @author Flipper Code<hello@flippercode.com>
 * @version 2.0.0
 * @package Core
 */


if ( ! class_exists( 'Flippercode_Product_Overview' ) ) {
/**


 * FlipperCode Overview Setup Class.
 *
 * @author Flipper Code<hello@flippercode.com>
 *
 * @version 2.0.0
 *
 * @package Core
 */


	class Flippercode_Product_Overview {


		public $PO;


		public $productOverview;


		public $productName;


		public $productSlug;


		public $productTextDomain;


		public $productIconImage;


		public $productVersion;


		private $commonBlocks;


		private $productSpecificBlocks;


		private $is_common_block;


		private $productBlocksRendered = 0;


		private $blockHeading;


		private $blockContent;


		private $blockClass = '';
		

		private $commonBlockMarkup = '';


		private $pluginSpecificBlockMarkup = '';


		private $finalproductOverviewMarkup = '';


		private $allProductsInfo = array();


		private $message = '';

		private $productID;

		private $videoURL;

		private $error;


		private $docURL;


		private $demoURL;


		private $productImagePath;


		private $isUpdateAvailable;


		private $multisiteLicence;


		private $productSaleURL;

		private $pluginProperty;

		
		private $getting_started_link;


		function __construct( $pluginInfo ) {


			$this->commonBlocks = array( 'product-activation', 'newsletter', 'links-block', 'extended-support', 'create_support_ticket', 'hire_wp_expert' );

			if ( isset( $pluginInfo['excludeBlocks'] ) ) {
				$this->commonBlocks = array_diff( $this->commonBlocks, $pluginInfo['excludeBlocks'] );
			}


			$this->init( $pluginInfo );
			$this->renderOverviewPage();


		}


		function renderOverviewPage() {	?>


			<div class="flippercode-ui fcdoc-product-info" data-current-product=<?php echo esc_attr($this->productTextDomain); ?> data-current-product-slug=<?php echo esc_attr($this->productSlug); ?> data-product-version = <?php echo esc_attr($this->productVersion) ; ?> data-product-name = "<?php echo esc_attr($this->productName); ?>" >
			
			<div class="fc-root">
				<div class="fc-root-inner">
				<?php echo WePlugins_Notification::weplugins_display_notification();?>
				<div class="fc-header">
						<div class="fc-header-primary">
							<div class="fc-container">
								<div class="fc-product-wrapper">
									<div class="fc-product-icon">
										<img src="<?php echo plugin_dir_url( __DIR__ ) . 'assets/images/icon-folder.svg' ?>" alt="Icon Folder">
									</div>
									<div class="fc-product-name"><?php esc_html_e( $this->productName ) ?></div>
									<div class="fc-product-version"><?php esc_html_e( $this->productVersion ) ?></div>
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
													<img src="<?php  echo plugin_dir_url( __DIR__ ) . 'assets/images/logo.svg' ?>" alt="logo" class="fc-brand-img">
												</a>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<?php echo apply_filters('fc_plugin_nav_menu',''); ?> 

					</div>
			<div class="fc-main">	
			<div class="fc-container">


				 <div class="fc-divider"><div class="fc-12"><div class="fc-divider">


					  <div class="fcdoc-flexrow fc-row">


						<?php $this->renderBlocks(); ?> 


					  </div>

				 </div></div></div>


			 </div>    


			</div>

			</div>
			</div>

			<?php



		}


		function setup_plugin_info( $pluginInfo ) {


			foreach ( $pluginInfo as $pluginProperty => $value ) {


				$this->$pluginProperty = $value;


			}


		}


		function get_mailchimp_integration_form() {


			$form = '';


			$form .= '<!-- Begin MailChimp Signup Form -->



<link href="//cdn-images.mailchimp.com/embedcode/slim-10_7.css" rel="stylesheet" type="text/css">
<style type="text/css">
	#mc_embed_signup{background:#fff; clear:left; font:14px Helvetica,Arial,sans-serif; }
</style>
<div id="mc_embed_signup">
<form action="//flippercode.us10.list-manage.com/subscribe/post?u=eb646b3b0ffcb4c371ea0de1a&amp;id=3ee1d0075d" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
    <div id="mc_embed_signup_scroll">
	<label for="mce-EMAIL">' . $this->PO['subscribe_mailing_list'] . '</label>
	<input type="email"  name="EMAIL" value="' . get_bloginfo( 'admin_email' ) . '" class="email" id="mce-EMAIL" placeholder="email address" required>
    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
    <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_eb646b3b0ffcb4c371ea0de1a_3ee1d0075d" tabindex="-1" value=""></div>


    <div class="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="fc-btn fc-btn-default"></div>


    </div>
</form>
</div>
<!--End mc_embed_signup-->';


			 return $form;


		}



		function init( $pluginInfo ) {



			$this->setup_plugin_info( $pluginInfo );


			$this->PO = $this->productOverview;

			$debug_array = array();

			if ( isset( $this->PO['debug_array'] ) && ! empty( $this->PO['debug_array'] ) ) {
				$debug_array = $this->PO['debug_array'];
			}


			foreach ( $this->commonBlocks as $block ) {


				switch ( $block ) {


					case 'product-activation':
						$this->blockHeading = '<h1>' . ( (!empty($this->PO['product_info_heading']) ) ? $this->PO['product_info_heading'] : $this->PO['get_started_heading'] ) . '</h1>';

						$this->blockContent .= '<div class="fc-divider fcdoc-brow fc-row">

	                       	<div class="fc-3 fc-text-center"><img src="' . plugin_dir_url( __DIR__ ) . 'assets/images/folder-logo.png"></div>

	                       	<div class="fc-9">
	                       	<h3>' . $pluginInfo['productName'] . '</h3>
							<span class="fcdoc-span">' . $this->PO['installed_version'] . ' <strong>' . $this->productVersion . '</strong></span>';

						if ( !empty( $debug_array ) ) {

							if ( array_key_exists( 'envato_response', $debug_array ) ) {

								$summary             = $debug_array['envato_response']['summary'];
								$this->blockContent .= '</div><div class="fc-12">

								<table style="width:100%" class="fc-table fc-table-layout3 purchase_verification_info">
	                       	 		<tr>
									    <td style="width:25%;">' . $this->PO['product_support']['envato_purchase_date'] . '</td>
									    <td>' . date( 'Y M, d', strtotime( $summary['sold_at'] ) ) . '</td>
									</tr>
									<tr>
									   	<td>' . $this->PO['product_support']['envato_license_type'] . '</td>
									    <td>' . $summary['license'] . '</td>
									</tr>
									<tr>
									    <td>' . $this->PO['product_support']['envato_support_until'] . '</td>
									    <td>' . date( 'Y M, d', strtotime( $summary['supported_until'] ) ) . '</td>
									</tr>
								</table>
								<strong><a href="' . $this->PO['getting_started_link'] . '" target="_blank" class="fc-btn fc-btn-default get_started_link">' . $this->PO['get_started_btn_text'] . '</a></strong>';

							} 
						} else {

							$this->blockContent .= '<p>' . $this->PO['product_info_desc'] . '</p><strong>
							<a href="' . $this->PO['getting_started_link'] . '" target="_blank" class="fc-btn fc-btn-default get_started_link">' . $this->PO['get_started_btn_text'] . '</a></strong>';

						}

						$this->blockContent .= "</div></div>";

						break;




					case 'newsletter':


						$this->blockHeading = '<h1>' . $this->PO['subscribe_now']['heading'] . '</h1>';


						$this->blockContent = '<div class="fc-divider fcdoc-brow fc-row fc-items-center"> 


	                       	<div class="fc-7 fc-items-center"><p>' . $this->PO['subscribe_now']['desc1'] . '<br>


	                       	<strong>' . $this->PO['subscribe_now']['desc2'] . '	</strong></p>


	                       	'.$this->get_mailchimp_integration_form().'	


	                         </div>


	                         <div class="fc-5 fc-items-center fc-text-center"><img src="'. plugin_dir_url( __DIR__ ).'assets/images/email_campaign_Flatline.png"></div>


                        </div>';


						break;


					case 'links-block':
						$links_html = '';
						$links = $this->PO['links']['link'];
						if (!empty($links)) {
							$links_html = '<ul>';
						
							// Loop through the links array to generate list items
							foreach ($links as $link) {
								$links_html .= '<li><a target="_blank" href="' . esc_url($link['url']) . '">' . esc_html($link['label']) . '</a></li>';
							}
						
							$links_html .= '</ul>';
						}
						$this->blockHeading = '<h1>' . $this->PO['links']['heading'] . '</h1>';


						$this->blockContent = '<div class="fc-divider fcdoc-brow fc-row">


							<div class="fc-7">
								<p>' . $this->PO['links']['desc'] . '</p>
								'.$links_html.'
							</div>
							<div class="fc-5 fc-items-center fc-text-center"><img src="'. plugin_dir_url( __DIR__ ).'assets/images/money_transfer_Flatline.png">


							</div>
						</div>';


						break;


					case 'extended-support':


						$this->blockHeading = '<h1>' . $this->PO['support']['heading'] . '</h1>';


						$this->blockContent = '<div class="fc-divider fcdoc-brow fc-row">


							<div class="fc-7 fc-items-center">


								<p>' . $this->PO['support']['desc1'] . '</p>


								<br><br>


								<a target="_blank" href="' . esc_url( $this->productSaleURL ) . '" name="one_year_support" id="one_year_support" value="" class="fc-btn fc-btn-default support">' . $this->PO['support']['link']['label'] . '</a>

							</div>



							<div class="fc-5 fc-items-center fc-text-center"><img src="'. plugin_dir_url( __DIR__ ).'assets/images/coding_Flatline.png">



							</div>



						</div>';


						break;


					case 'create_support_ticket':


						$this->blockHeading = '<h1>' . $this->PO['create_support_ticket']['heading'] . '</h1>';


						$this->blockContent = '<div class="fc-divider fcdoc-brow fc-row">


							<div class="fc-7 fc-items-center">
								<p>' . $this->PO['create_support_ticket']['desc1'] . '</p>
								<br><br>
								<a target="_blank" class="fc-btn fc-btn-default" href="' . $this->PO['create_support_ticket']['link']['url'] . '">' . $this->PO['create_support_ticket']['link']['label'] . '</a>
							</div>


							<div class="fc-5 fc-items-center fc-text-center"><img src="'. plugin_dir_url( __DIR__ ).'assets/images/it_Support_Flatline.png">


							</div>


						</div>';


						break;


					case 'hire_wp_expert':


						$this->blockHeading = '<h1>' . $this->PO['hire_wp_expert']['heading'] . '</h1>';


						$this->blockContent = '<div class="fc-divider fcdoc-brow fc-row">


							<div class="fc-7 fc-items-center">


								<p><strong>' . $this->PO['hire_wp_expert']['desc'] . '</strong></p>


								<p>' . $this->PO['hire_wp_expert']['desc1'] . '</p>


								<a target="_blank" class="fc-btn fc-btn-default refundbtn" href="'. $this->PO['hire_wp_expert']['link']['url'] .'">' . $this->PO['hire_wp_expert']['link']['label'] . '</a>


							</div>


							<div class="fc-5 fc-items-center fc-text-center"><img src="'. plugin_dir_url( __DIR__ ).'assets/images/web_Developer_Flatline.png">


							</div>


						</div>';


						break;


				}


				$info = array( $this->blockHeading, $this->blockContent, $block );


				$this->commonBlockMarkup .= $this->get_block_markup( $info );


			}



		}



		function get_block_markup( $blockinfo ) {


			$markup = '<div class="fc-6 fcdoc-blocks ' . $blockinfo[2] . '">


			                <div class="fcdoc-block-content">


			                    <div class="fcdoc-header">' . $blockinfo[0] . '</div>


			                    <div class="fcdoc-body">' . $blockinfo[1] . '</div>



			                </div>



            		   </div>';


			$this->productBlocksRendered++;


			if ( $this->productBlocksRendered % 2 == 0 ) {


				$markup .= '</div></div><div class="fc-divider"><div class="fcdoc-flexrow fc-row">';

				

			}


			return $markup;


		}



		function renderBlocks() {


			$this->finalproductOverviewMarkup = $this->commonBlockMarkup . $this->pluginSpecificBlockMarkup;


			echo $this->finalproductOverviewMarkup;


		}



	}




}
