<?php
/**
 *
 * @author Flipper Code <hello@flippercode.com>
 * @version 5.2.6
 * @package Maps
 */

	$form = new WPGMP_Template();
	$form->set_header( esc_html__( 'Premium Add-Ons / Extentions For WP Google Maps Pro', 'wp-google-map-plugin' ), array() );
	$extentions = array();

	$wp_maps_templates = array('url' => 'https://weplugins.com/product/wp-maps-templates/',
					 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/12/wp-maps-templates.jpg',
					'demo_url' => 'https://weplugins.com/wp-maps-templates/');
	$listing = array('url' => 'https://weplugins.com/product/listing-designs-for-google-maps',
					 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Listing-Design-for-Google-Maps.png',
					'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/listing-designs-on-google-maps/');
	$search_widget = array('url' => 'https://weplugins.com/product/search-widget-for-google-maps/',
						   'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Search-Widget-for-Google-Maps.png',
						   'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/search-widget-for-google-maps/');
	$filter_by_viewport = array('url' => 'https://weplugins.com/product/filter-map-listing-by-viewport/',
										 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Markers-Filter-by-Viewport-on-Google-Maps.png', 'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/markers-filter-by-viewport-on-google-maps');

	$frontend_submissions = array('url' => 'https://weplugins.com/product/frontend-submissions-on-google-maps/',
							     'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2014/12/Frontend-Submissions-on-Google-Maps.png',
								 'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/frontend-submissions-on-google-maps/');
	$user_location = array('url' => 'https://weplugins.com/product/user-locations-on-google-maps/',
	                                'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/User-Location-Mapping-on-Google-Maps.png',
									'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/user-location-mapping-on-google-maps/');
	$skin_color = array('url' => 'https://weplugins.com/product/google-maps-skin-color/',
					    'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2014/12/Custom-Map-Colors-for-Google-Maps.png',
						'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/custom-map-colors-for-google-maps/');
	$migration = array('url' => 'https://weplugins.com/product/wp-google-maps-migration/', 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/WP-Maps-Pro-Data-Migration.png', 'demo_url' => '#');
	$mysql = array('url' => 'https://weplugins.com/product/mysql-to-googlemaps/', 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/MySQL-Data-on-Google-Maps.png', 'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/mysql-data-on-google-maps/');
	$excel = array('url' => 'https://weplugins.com/product/excel-to-googlemaps/', 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2014/12/Excel-Data-on-Google-Maps.png', 'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/excel-data-on-google-maps/');
	$airtable = array('url' => 'https://weplugins.com/product/airtable-to-google-maps/', 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Airtable-Data-on-Google-Maps.png', 'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/airtable-data-on-google-maps/');
	$gravity = array('url' => 'https://weplugins.com/product/gravity-submissions-to-googlemaps/', 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2014/12/Gravity-Form-Submissions-on-Google-Maps-New.png', 'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/gravity-form-submissions-on-google-maps/');
	$buddypress = array('url' => 'https://weplugins.com/product/buddypress-members-google-maps/', 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/BuddyPress-Members-on-Google-Maps.png', 'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/buddypress-members-on-google-maps/');
	$cf7 = array('url' => 'https://weplugins.com/product/cf7-submissions-to-googlemaps/', 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Contact-Form-7-Submissions-on-Google-Maps.png', 'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/contact-form-7-submissions-on-google-maps/');
	$bookmark = array('url' => 'https://weplugins.com/product/bookmark-locations-for-google-maps/', 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Location-Bookmarking-for-Google-Maps.png', 'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/location-bookmarking-for-google-maps/');
	$Itinerary = array('url' => 'https://weplugins.com/product/customer-itinerary-on-google-maps/', 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Customer-Itinerary-Planner-for-Google-Maps.png', 'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/customer-itinerary-planner-for-google-maps/');
	$json = array('url' => 'https://weplugins.com/product/json-to-google-maps/', 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/JSON-Data-on-Google-Maps.png', 'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/json-data-on-google-maps/');
	$wpusers = array('url' => 'https://weplugins.com/product/wp-users-on-google-maps/', 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/WordPress-Users-on-Google-Maps.png', 'demo_url' => 'https://weplugins.com/wp-content/uploads/2024/02/WordPress-Users-on-Google-Maps.png');
	$amenities = array('url' => 'https://weplugins.com/product/nearby-amenities-listing-on-google-maps/', 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Nearby-Amenities-Listing-on-Google-Maps.png', 'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/nearby-amenities-listing-on-google-maps/');
	$html_markers = array('url' => 'https://weplugins.com/product/html-markers-for-google-maps/', 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/HTML-Marker-For-Google-Maps.png', 'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/html-markers-for-google-maps/');
	
	$extentions[] =  $wp_maps_templates;
	$extentions[] =  $listing;
	$extentions[] =  $buddypress;
	$extentions[] =  $filter_by_viewport;
	$extentions[] =  $search_widget;
	$extentions[] =  $frontend_submissions;
	$extentions[] =  $Itinerary;
	$extentions[] =  $user_location;
	$extentions[] =  $skin_color;
	
	
	$extentions[] =  $migration;
	$extentions[] =  $mysql;
	$extentions[] =  $excel;
	$extentions[] =  $airtable;
	$extentions[] =  $gravity;
	$extentions[] =  $cf7;
	$extentions[] =  $bookmark;
	
	$extentions[] =  $json;
	$extentions[] =  $wpusers;
	$extentions[] =  $amenities;
	$extentions[] =  $html_markers;


	$html = '<div class="fc-row">';

	$count = count($extentions);
	foreach($extentions as $key => $addon){

		if($key != 0 && $key % 3 == 0){ $html .= '</div><div class="fc-row">';	}

		if($key == $count -1) {

			$links = '<a target="_blank" href="'.$addon['url'].'">'.esc_html__( 'Contact Now', 'wp-google-map-plugin' ).'</a>';
		}else{

			$addon['url'] = add_query_arg( array(  'utm_source' => 'extensions', 'utm_medium' => 'proplugin', 'utm_campaign' => 'pro_extensions'  ),  $addon['url'] );
			
			$links = '<a target="_blank" href="'.$addon['url'].'">'.esc_html__( 'Buy Now', 'wp-google-map-plugin' ).'</a>
				<a target="_blank" href="'.$addon['demo_url'].'">'.esc_html__( 'View Demo', 'wp-google-map-plugin' ).'</a>';
		}

		$html .= '<div class="fc-4">
			<div class="addon_block">
			<div class="addon_block_overlay">
				'.$links.'
			</div>
			<img src="'.$addon['thumbnail_url'].'"/>
			</div>
   		</div>';
	}
	
	$html .= '</div>';

	$form->add_element(
		'html', 'wpgmp_extentions_listing', array(
			'id'     => 'wpgmp_extentions_listing',
			'class'  => 'wpgmp_extentions_listing',
			'html' => $html,
			'before' => '<div class="fc-12">',
			'after' => '</div>'
		)
	);

    $form->render();
