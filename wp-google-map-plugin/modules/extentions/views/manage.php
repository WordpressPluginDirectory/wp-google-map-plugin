<?php
/**
 *
 * @author Flipper Code <hello@flippercode.com>
 * @version 5.2.6
 * @package Maps
 */

	$form = new WPGMP_Template();
	$form->set_header( esc_html__( 'Premium Add-Ons / Extentions For WP Maps Pro', 'wp-google-map-plugin' ), array() );
	$extentions = array();

	$wp_maps_templates = array('url' => 'https://weplugins.com/product/wp-maps-templates/',
					 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/12/wp-maps-templates.jpg',
					'demo_url' => 'https://weplugins.com/wp-maps-templates/',
					'addon_name' => 'WP Maps Templates',
					'description' => 'Display Google Maps & Listings On Your Site With Modern & Stunning Look.'
				);

	$listing = array('url' => 'https://weplugins.com/product/listing-designs-for-google-maps',
					 'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Listing-Design-for-Google-Maps.png',
					'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/listing-designs-on-google-maps/',
					'addon_name' => 'Listing Design for Google Maps',
					'description' => 'Create visually appealing and fully customizable map listings.'
				);

	$search_widget = array('url' => 'https://weplugins.com/product/search-widget-for-google-maps/',
					'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Search-Widget-for-Google-Maps.png',
					'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/search-widget-for-google-maps/',
					'addon_name' => 'Search Widget for Google Maps',
					'description' => 'Add a customizable search widget to your Google Maps for improved navigation.'
				);

	$filter_by_viewport = array('url' => 'https://weplugins.com/product/filter-map-listing-by-viewport/',
					'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Markers-Filter-by-Viewport-on-Google-Maps.png', 
					'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/markers-filter-by-viewport-on-google-maps',
					'addon_name' => 'Markers Filter by Viewport on Google Maps',
					'description' => 'Display relevant listings based on map\'s current viewport.'
				);

	$frontend_submissions = array('url' => 'https://weplugins.com/product/frontend-submissions-on-google-maps/',
				    'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2014/12/Frontend-Submissions-on-Google-Maps.png',
					'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/frontend-submissions-on-google-maps/',
					'addon_name' => 'Frontend Submissions on Google Maps',
					'description' => 'Allow logged in users to add and manage their own locations directly from the frontend.'
				);


	$user_location = array('url' => 'https://weplugins.com/product/user-locations-on-google-maps/',
                    'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/User-Location-Mapping-on-Google-Maps.png',
					'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/user-location-mapping-on-google-maps/',
					'addon_name' => 'User Location Mapping on Google Maps',
					'description' => 'Showcase user locations to enhance engagement and build community.'
				);


	$skin_color = array('url' => 'https://weplugins.com/product/google-maps-skin-color/',
				    'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2014/12/Custom-Map-Colors-for-Google-Maps.png',
					'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/custom-map-colors-for-google-maps/',
					'addon_name' => 'Custom Map Colors for Google Maps',
					'description' => 'Customize, Enhance, and Brand Your Google Maps with Custom Colors.'
				);

	$migration = array(
					'url' => 'https://weplugins.com/product/wp-google-maps-migration/', 
					'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/WP-Maps-Pro-Data-Migration.png', 
					'demo_url' => '#',
					'addon_name' => 'WP Maps Pro Data Migration',
					'description' => 'Transfer your Google Maps data to a new website with ease.'
				);
	
	$mysql = array(
				'url' => 'https://weplugins.com/product/mysql-to-googlemaps/', 
				'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/MySQL-Data-on-Google-Maps.png', 
				'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/mysql-data-on-google-maps/',
				'addon_name' => 'MySQL Data on Google Maps',
				'description' => 'Effortlessly display MySQL database tables data directly on Google Maps.'
			);


	$excel = array(
				'url' => 'https://weplugins.com/product/excel-to-googlemaps/', 
				'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2014/12/Excel-Data-on-Google-Maps.png', 
				'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/excel-data-on-google-maps/',
				'addon_name' => 'Excel Data on Google Maps',
				'description' => 'Visualize an excel sheet data on Google Maps with just few clicks.'
			);


	$airtable = array(
				'url' => 'https://weplugins.com/product/airtable-to-google-maps/', 
				'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Airtable-Data-on-Google-Maps.png', 
				'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/airtable-data-on-google-maps/',
				'addon_name' => 'Airtable Data on Google Maps',
				'description' => 'Integrate, customize, and sync your Airtable data with ease.'
			);


	$gravity = array(
				'url' => 'https://weplugins.com/product/gravity-submissions-to-googlemaps/', 
				'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2014/12/Gravity-Form-Submissions-on-Google-Maps-New.png', 
				'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/gravity-form-submissions-on-google-maps/',
				'addon_name' => 'Gravity Form Submissions on Google Maps',
				'description' => 'Visualize and manage location-based data directly from your Gravity Forms.');

	$buddypress = array(
				'url' => 'https://weplugins.com/product/buddypress-members-google-maps/', 
				'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/BuddyPress-Members-on-Google-Maps.png', 
				'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/buddypress-members-on-google-maps/',
				'addon_name' => 'BuddyPress Members on Google Maps',
				'description' => 'Effortlessly showcase your BuddyPress members on Google Maps to enhance engagement and social connections in your network.'
			);

	$cf7 = array(
				'url' => 'https://weplugins.com/product/cf7-submissions-to-googlemaps/', 
				'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Contact-Form-7-Submissions-on-Google-Maps.png', 
				'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/contact-form-7-submissions-on-google-maps/',
				'addon_name' => 'Contact Form 7 Submissions on Google Maps',
				'description' => 'Visualize and manage location-based data directly from your CF7 forms.'
			);

	$bookmark = array(
				'url' => 'https://weplugins.com/product/bookmark-locations-for-google-maps/', 
				'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Location-Bookmarking-for-Google-Maps.png', 
				'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/location-bookmarking-for-google-maps/',
				'addon_name' => 'Location Bookmarking for Google Maps',
				'description' => 'Bookmark, manage, and share your favorite spots with ease.'
			);

	$Itinerary = array(
				'url' => 'https://weplugins.com/product/customer-itinerary-on-google-maps/', 
				'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Customer-Itinerary-Planner-for-Google-Maps.png', 
				'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/customer-itinerary-planner-for-google-maps/',
				'addon_name' => 'Customer Itinerary Planner for Google Maps',
				'description' => 'Create and showcase detailed travel itineraries on your website.'
			);

	$json = array(
				'url' => 'https://weplugins.com/product/json-to-google-maps/', 
				'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/JSON-Data-on-Google-Maps.png', 
				'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/json-data-on-google-maps/',
				'addon_name' => 'JSON Data on Google Maps',
				'description' => 'Display information from JSON file on Google Maps with ease and flexiblity'
			);

	$wpusers = array(
				'url' => 'https://weplugins.com/product/wp-users-on-google-maps/', 
				'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/WordPress-Users-on-Google-Maps.png', 
				'demo_url' => 'https://weplugins.com/wp-content/uploads/2024/02/WordPress-Users-on-Google-Maps.png',
				'addon_name' => 'WordPress Users on Google Maps',
				'description' => 'Analyze and easily manage your WordPress users’ geographical locations with ease.'
			);
	
	$amenities = array(
				'url' => 'https://weplugins.com/product/nearby-amenities-listing-on-google-maps/', 
				'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/Nearby-Amenities-Listing-on-Google-Maps.png', 
				'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/nearby-amenities-listing-on-google-maps/',
				'addon_name' => 'Nearby Amenities Listing on Google Maps',
				'description' => 'Showcase nearby restaurants, parks, and more with interactive Google Maps integration.'
			);

	$html_markers = array(
				'url' => 'https://weplugins.com/product/html-markers-for-google-maps/', 
				'thumbnail_url' => 'https://weplugins.com/wp-content/uploads/2024/02/HTML-Marker-For-Google-Maps.png', 
				'demo_url' => 'https://weplugins.com/wp-maps-extentions/maps-addon-demos/html-markers-for-google-maps/',
				'addon_name' => 'HTML Markers For Google Maps',
				'description' => 'Unleash the power of fully customizable and interactive map markers!'
			);

	$extentions[] =  $wp_maps_templates;
	$extentions[] =  $frontend_submissions;
	$extentions[] =  $html_markers;
	$extentions[] =  $search_widget;
	$extentions[] =  $airtable;
	$extentions[] =  $gravity;
	$extentions[] =  $bookmark;
	$extentions[] =  $cf7;
	$extentions[] =  $Itinerary;
	$extentions[] =  $buddypress;
	$extentions[] =  $listing;
	$extentions[] =  $filter_by_viewport;
	$extentions[] =  $user_location;
	$extentions[] =  $skin_color;
	$extentions[] =  $migration;
	$extentions[] =  $mysql;
	$extentions[] =  $excel;
	$extentions[] =  $json;
	$extentions[] =  $wpusers;
	$extentions[] =  $amenities;
	
	$html = '<div class="addon-listing">';

	$count = count($extentions);
	foreach($extentions as $key => $addon){

		$addon['url'] = add_query_arg( array(  'utm_source' => 'extensions', 'utm_medium' => 'proplugin', 'utm_campaign' => 'pro_extensions'  ),  $addon['url'] );
		
		$links = '<a class="fc-btn fc-btn-primary fc-btn-sm" target="_blank" href="'.$addon['url'].'">'.esc_html__( 'Buy Now', 'wp-google-map-plugin' ).'</a>';

		$html .= '<div class="fc-card fc-card-plugin">
			<div class="fc-card-image">
				<img loading="lazy" decoding="async" src="'.$addon['thumbnail_url'].'"/>
			</div>
			<div class="fc-card-body">
				<h6 class="fc-card-title">'.$addon['addon_name'].'</h6>
				<div class="fc-card-text">'.$addon['description'].'</div>
				<div class="fc-btn-wrapper">'.$links.'</div>
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