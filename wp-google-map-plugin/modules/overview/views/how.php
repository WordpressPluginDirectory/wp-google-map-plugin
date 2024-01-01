<?php
/**
 * Plugin Overviews.
 * @package Maps
 * @author Flipper Code <flippercode>
 **/

?>
<?php 
$form  = new WPGMP_Template();
echo wp_kses_post( $form->show_header() );
?>

<div class="flippercode-ui">
<div class="fc-main">
<div class="fc-container">
 <div class="fc-divider">

 <div class="fc-back fc-docs ">
 <div class="fc-12">
            <h4 class="fc-title-blue"><?php esc_html_e('How to Create your First Map?','wp-google-map-plugin');?>  </h4>
              <div class="wpgmp-overview">
                <ol>

                    <li><?php 
                    $api_key_link = '<a href="javascript:void(0);" class="wpgmp_map_key_missing" >  '.esc_html__( 'Google Map API Key','wp-google-map-plugin').'</a>';
                    $plugin_setting = '<a href="'.admin_url( 'admin.php?page=wpgmp_manage_settings' ).'"> Settings </a>';
                    echo sprintf( esc_html__( 'First create a %s. Then go to %s page and insert your google maps API Key and save.', 'wp-google-map-plugin' ), $api_key_link, $plugin_setting );

                    ?>
                        
                    </li>
                    
                    <li><?php

                    $add_location = '<a href="'.admin_url( 'admin.php?page=wpgmp_form_location' ).'" target="_blank">  '.esc_html__('Add Location','wp-google-map-plugin').'</a>';
                    echo sprintf( esc_html__( 'Create a location by using %s page.', 'wp-google-map-plugin' ), $add_location);
                    
                     ?>
                    </li>
                    
                    <li><?php
                    $addmap = '<a href="'.admin_url( 'admin.php?page=wpgmp_form_map' ).'" target="_blank">  '.esc_html__( 'Add Map','wp-google-map-plugin').'</a>';

                    echo sprintf( esc_html__( 'Go to %s page, assign locations to the map and setup other details as per your requirements. Save the map.', 'wp-google-map-plugin' ), $addmap);

                     ?>
                    </li>
                                                                                
                </ol>
            </div>
            
            <h4 class="fc-title-blue"><?php esc_html_e('How to Display Map in Frontend?','wp-google-map-plugin'); ?>  </h4>
              <div class="wpgmp-overview">
                        
                    <p><?php
                    $manage_map = '<a href="'.admin_url( 'admin.php?page=wpgmp_manage_map' ).'" target="_blank"> '.esc_html__( 'Manage Map','wp-google-map-plugin').'</a>';
                    echo sprintf( esc_html__( 'Go to %s and copy the shortcode then paste it to any page/post where you want to display map.', 'wp-google-map-plugin' ), $manage_map);
                    ?>
                     
                    </p>
                    
              </div>
        <h4 class="fc-title-blue"><?php esc_html_e('How to Create Marker Category?','wp-google-map-plugin'); ?>  </h4>
                <div class="wpgmp-overview">
                        
                    <p><?php
                    $add_marker_Category = '<a href="'.admin_url( 'admin.php?page=wpgmp_form_group_map' ).'" target="_blank"> '.esc_html__( 'Add Marker Category','wp-google-map-plugin').'</a>';
                    echo sprintf( esc_html__( 'Creating marker categories & assiging those to locations helps grouping the markers on the map by their icon image. Markers having the same marker category will display the same marker icon. Go to %s , specify marker category title and assign a marker icon. Once you have created some marker categories, these categories can be assigned to the location on "Add Locations" page.', 'wp-google-map-plugin' ), $add_marker_Category);


                     ?>
                   </p>
                </div> 


        <h4 class="fc-title-blue"> <?php esc_html_e('Google Map API Troubleshooting','wp-google-map-plugin'); ?>  </h4>
        <div class="wpgmp-overview">
        <p> <?php esc_html_e('If your google maps is not working. Make sure you have checked following things.','wp-google-map-plugin'); ?></p>
        <ul>
        <li> <?php esc_html_e('1. Make sure you have assigned locations to your map.','wp-google-map-plugin');?></li>
        <li> <?php esc_html_e('2. You must have google maps api key.','wp-google-map-plugin');?></li>
        <li> <?php esc_html_e('3. Check HTTP referrers. It must be *yourwebsite.com/* or *.yourwebsite.com/*','wp-google-map-plugin');?> 
        </li>
        </ul>
        <p><img src="<?php echo WPGMP_IMAGES; ?>referrer.png"> </p>
        <p><?php

        $support_ticket = '<a target="_blank" href="http://www.flippercode.com/support">'.esc_html__('support ticket','wp-google-map-plugin').'</a>';

            echo sprintf( esc_html__( "If you need any assistance or if you still see any issue, feel free to create a %s and we'd be happy to help you asap.", 'wp-google-map-plugin' ), $support_ticket);
            echo '<br><br>';    
           
            $premium_plugin = '<a target="_blank" href="https://www.wpmapspro.com/?utm_source=wordpress&utm_medium=liteversion&utm_campaign=freemium&utm_id=freemium">'.esc_html__('WP Maps Pro','wp-google-map-plugin').'</a>';
                    
             echo sprintf( esc_html__( "If you are looking for even more features, please have a look on the pro version : %s. It's the number #1 selling (13k+ happy customers ), most loved & trusted advanced google maps plugin for wordpress. We are continously adding more features to it based on the suggestions of esteemed customers / users like you. With pro version, you can setup google maps with very advance features in just few seconds. Also both our free and pro version plugins can be customised to achieve specific requirements.", 'wp-google-map-plugin' ), $premium_plugin);
         ?>

               </p>
        </div>          
    </div>
</div></div>
</div>
</div></div>
