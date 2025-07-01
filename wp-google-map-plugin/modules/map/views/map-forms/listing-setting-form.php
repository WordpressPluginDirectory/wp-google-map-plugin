<?php
/**
 * Contro Positioning over google maps.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */


$form->add_element(
	'group', 'map_listing_setting', array(
		'value'  => esc_html__( 'Listing Settings', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-display-listings-below-the-map-2/'
	)
);

$form->add_element(
	'checkbox', 'map_all_control[display_listing]', array(
		'label'   => esc_html__( 'Display Listing', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'wpgmp_display_listing',
		'current' => isset( $data['map_all_control']['display_listing'] ) ? $data['map_all_control']['display_listing'] : '',
		'desc'    => esc_html__( 'Display locations listing below the map.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class switch_onoff',
		'data'    => array( 'target' => '.wpgmp_display_listing' ),
	)
);

$event = array(
	'click'     => 'Mouse Click',
	'mouseover' => 'Mouse Hover',
);
$form->add_element(
	'select', 'map_all_control[listing_openoption]', array(
		'label'   => esc_html__( 'Show Infowindow on', 'wp-google-map-plugin' ),
		'current' => isset( $data['map_all_control']['listing_openoption'] ) ? $data['map_all_control']['listing_openoption'] : '',
		'desc'    => esc_html__( 'Display Infowindow on Mouse Click or Mouse Hover when Listing Title is Clicked.', 'wp-google-map-plugin' ),
		'class'   => 'wpgmp_display_listing',
		'options' => $event,
	)
);

$form->add_element(
	'checkbox', 'map_all_control[wpgmp_search_display]', array(
		'label'   => esc_html__( 'Display Search Form', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'wpgmp_wpgmp_search_display',
		'current' => isset( $data['map_all_control']['wpgmp_search_display'] ) ? $data['map_all_control']['wpgmp_search_display'] : '',
		'desc'    => esc_html__( 'Check to display search form below the map.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class wpgmp_display_listing switch_onoff',
		'show'    => 'false',
		'data'    => array( 'target' => '.wpgmp_search_display' ),

	)
);

$form->add_element(
	'text', 'map_all_control[wpgmp_searchbar_placeholder]', array(
		'label'         => esc_html__( 'Search Form Placeholder', 'wp-google-map-plugin' ),
		'value'         => ( isset( $data['map_all_control']['wpgmp_searchbar_placeholder']) && !empty($data['map_all_control']['wpgmp_searchbar_placeholder']) ) ? $data['map_all_control']['wpgmp_searchbar_placeholder'] : ''	, 'wp-google-map-plugin' ,
		'desc'          => esc_html__( 'Display Search Form Placeholder text.', 'wp-google-map-plugin' ),
		'placeholder'          => esc_html__( 'Set Search Form Placeholder text.', 'wp-google-map-plugin' ),
		'class'         => 'form-control  wpgmp_search_display',
		'show'          => 'false',
	)
);

$form->add_element(
	'message',
	'wpgmp_search_placeholders_list',
	array(
		'label' => esc_html__( 'Fine Tune Search Process', 'wp-google-map-plugin' ),
		'value' => esc_html__('You can fine tune the default search process by speicifying certain listing fields to be included / excluded while searching. Although using this feature is completely optional and you can keep both Include / Exclude search field ( below textareas ) empty , but if you want search process to be more controlled & specific, you can use this feature.','wp-google-map-plugin').'<br><br>'.esc_html__('If you have created locations using our plugin and dislaying those locations on map, you can use the following placeholders in below Include / Exclude search field controls :  ', 'wp-google-map-plugin').'<br><br>'.esc_html__('{marker_title},{marker_message},{marker_address},{marker_city},{marker_state},{marker_country},{marker_postal_code},{marker_latitude},{marker_longitude},{extra_field_slug}.', 'wp-google-map-plugin').'<br><br><br>'.esc_html__('If you are displaying blogs post / some custom post type on map , you can use the following placeholders in below Include / Exclude search field controls :  ', 'wp-google-map-plugin').'<br><br>'.esc_html__('{post_title},{post_content},{post_excerpt},{post_categories},{post_tags},{post_link},{post_featured_image},{marker_address},{marker_city},{marker_state},{marker_country},{marker_latitude},{marker_longitude},{%custom_field_slug_here%},{taxonomy=taxonomy_slug}.', 'wp-google-map-plugin'),
		'class' => 'fc-alert fc-alert-info form-control  wpgmp_search_display',
		'show'  => 'false',
		'desc'    => esc_html__( 'You can perform more strict search using the below include and exclude search fields control. Using both include and exclude search fields are completly optional.', 'wp-google-map-plugin' ),
		
	)
);

$form->add_element(
	'textarea', 'map_all_control[wpgmp_search_placeholders]', array(
		'label'         => esc_html__( 'Listing Fields To Include In Searching', 'wp-google-map-plugin' ),
		'value'         => ( isset( $data['map_all_control']['wpgmp_search_placeholders']) && !empty($data['map_all_control']['wpgmp_search_placeholders']) ) ? $data['map_all_control']['wpgmp_search_placeholders'] : ''	, 'wp-google-map-plugin' ,
		'desc'          => esc_html__( 'If you want match the searched keyword with only specific listing fields or custom fields, please enter those field\'s placeholders here from above list.', 'wp-google-map-plugin' ),
		'textarea_rows' => 5,
		'textarea_name' => 'map_all_control[wpgmp_search_placeholders]',
		'class'         => 'form-control  wpgmp_search_display',
		'show'          => 'false',
	)
);
$form->add_element(
	'textarea', 'map_all_control[wpgmp_exclude_placeholders]', array(
		'label'         => esc_html__( 'Listing Fields To Exclude In Searching', 'wp-google-map-plugin' ),
		'value'         => ( isset( $data['map_all_control']['wpgmp_exclude_placeholders']) && !empty($data['map_all_control']['wpgmp_exclude_placeholders']) ) ? $data['map_all_control']['wpgmp_exclude_placeholders'] : ''	, 'wp-google-map-plugin' ,
		'desc'          => esc_html__( 'If you want to exclude or skip some specific listing fields / custom fields to be matched with the searched keyword during search process, please enter those fields placeholders here from above list.', 'wp-google-map-plugin' ),
		'textarea_rows' => 5,
		'textarea_name' => 'map_all_control[wpgmp_exclude_placeholders]',
		'class'         => 'form-control  wpgmp_search_display',
		'show'          => 'false',
	)
);

$form->add_element(
	'checkbox', 'map_all_control[search_field_autosuggest]', array(
		'label'   => esc_html__( 'Enable Google Autosuggest', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'current' => isset( $data['map_all_control']['search_field_autosuggest'] ) ? $data['map_all_control']['search_field_autosuggest'] : '',
		'desc'    => esc_html__( 'Apply google autosuggest on search field.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class wpgmp_display_listing wpgmp_search_display',
		'show'    => 'false',
		'pro'    => true,
	)
);

$form->add_element(
	'checkbox', 'map_all_control[wpgmp_display_category_filter]', array(
		'label'   => esc_html__( 'Display Category Filter', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'wpgmp_display_category_filter',
		'current' => isset( $data['map_all_control']['wpgmp_display_category_filter'] ) ? $data['map_all_control']['wpgmp_display_category_filter'] : '',
		'desc'    => esc_html__( 'Check to display category filter.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class wpgmp_display_listing switch_onoff',
		'data'    => array( 'target' => '.wpgmp_category_filter' ),
		'show'    => 'false',
	)
);

$form->add_element(
	'text', 'map_all_control[wpgmp_category_placeholder]', array(
		'label'         => esc_html__( 'Category Filter Default Text', 'wp-google-map-plugin' ),
		'value'         => ( isset( $data['map_all_control']['wpgmp_category_placeholder']) && !empty($data['map_all_control']['wpgmp_category_placeholder']) ) ? $data['map_all_control']['wpgmp_category_placeholder'] : ''	, 'wp-google-map-plugin' ,
		'desc'          => esc_html__( 'Enter text here for the Category filter to be shown, e,g, : Select Category.', 'wp-google-map-plugin' ),
		'placeholder'          => esc_html__( 'Set Category filter default text.', 'wp-google-map-plugin' ),
		'class'         => 'form-control wpgmp_category_filter',
		'show'          => 'false',
	)
);


$form->add_element(
	'checkbox', 'map_all_control[wpgmp_display_sorting_filter]', array(
		'label'   => esc_html__( 'Display Sorting Filter', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'wpgmp_wpgmp_display_sorting_filter',
		'current' => isset( $data['map_all_control']['wpgmp_display_sorting_filter'] ) ? $data['map_all_control']['wpgmp_display_sorting_filter'] : '',
		'desc'    => esc_html__( 'Check to display sorting filter.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class wpgmp_display_listing',
		'show'    => 'false',
	)
);

$form->add_element(
	'checkbox', 'map_all_control[wpgmp_display_radius_filter]', array(
		'label'   => esc_html__( 'Display Radius Filter', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'wpgmp_display_radius_filter',
		'current' => isset( $data['map_all_control']['wpgmp_display_radius_filter'] ) ? $data['map_all_control']['wpgmp_display_radius_filter'] : '',
		'desc'    => esc_html__( 'Check to display radius filter. Recommended to display search results within certian radius.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class wpgmp_display_listing switch_onoff',
		'show'    => 'false',
		'data'    => array( 'target' => '.wpgmp_radius_filter' ),
		'pro' => true
	)
);

$form->add_element(
	'checkbox', 'map_all_control[wpgmp_display_location_per_page_filter]', array(
		'label'   => esc_html__( 'Display Per Page Filter', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'wpgmp_wpgmp_display_location_per_page_filter',
		'current' => isset( $data['map_all_control']['wpgmp_display_location_per_page_filter'] ) ? $data['map_all_control']['wpgmp_display_location_per_page_filter'] : '',
		'desc'    => esc_html__( 'Check to enable locations per page filter.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class wpgmp_display_listing',
		'show'    => 'false',
	)
);

$form->add_element(
	'checkbox', 'map_all_control[wpgmp_display_print_option]', array(
		'label'   => esc_html__( 'Display Print Option', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'wpgmp_display_print_option',
		'current' => isset( $data['map_all_control']['wpgmp_display_print_option'] ) ? $data['map_all_control']['wpgmp_display_print_option'] : '',
		'desc'    => esc_html__( 'Check to display print option.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class wpgmp_display_listing',
		'show'    => 'false',
	)
);

$form->add_element(
	'checkbox', 'map_all_control[wpgmp_display_grid_option]', array(
		'label'   => esc_html__( 'Display Grid/List Option', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'wpgmp_display_grid_option',
		'current' => isset( $data['map_all_control']['wpgmp_display_grid_option'] ) ? $data['map_all_control']['wpgmp_display_grid_option'] : '',
		'desc'    => esc_html__( 'Switch between list/grid view.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class wpgmp_display_listing',
		'show'    => 'false',
		'pro' => true
	)
);

$form->add_element(
	'text', 'map_all_control[wpgmp_listing_number]', array(
		'label'         => esc_html__( 'Locations Per Page', 'wp-google-map-plugin' ),
		'value'         => isset( $data['map_all_control']['wpgmp_listing_number'] ) ? $data['map_all_control']['wpgmp_listing_number'] : '10',
		'desc'          => esc_html__( 'Enter the number of locations to display per page. The default value is 10.', 'wp-google-map-plugin' ),
		'placeholder'          => esc_html__( 'Enter the number of locations to display per page. The default value is 10.', 'wp-google-map-plugin' ),
		'class'         => 'form-control wpgmp_display_listing',
		'show'          => 'false',
		'default_value' => 10,
	)
);


$form->add_element(
	'textarea', 'map_all_control[wpgmp_before_listing]', array(
		'label'         => esc_html__( 'Before Listing Placeholder', 'wp-google-map-plugin' ),
		'value'         => ( isset( $data['map_all_control']['wpgmp_before_listing']) && !empty($data['map_all_control']['wpgmp_before_listing']) ) ? $data['map_all_control']['wpgmp_before_listing'] : esc_html__( 'Locations Listing', 'wp-google-map-plugin' ),
		'desc'          => esc_html__( 'Display a text/html content before display listing.', 'wp-google-map-plugin' ),
		'textarea_rows' => 10,
		'textarea_name' => 'map_all_control[wpgmp_before_listing]',
		'class'         => 'form-control wpgmp_display_listing',
		'show'          => 'false',
		'default_value' => esc_html__( 'Map Locations', 'wp-google-map-plugin' ),
	)
);

$list_grid = array(
	'wpgmp_listing_list' => 'List',
	'wpgmp_listing_grid' => 'Grid',
);
$form->add_element(
	'select', 'map_all_control[wpgmp_list_grid]', array(
		'label'   => esc_html__( 'List/Grid', 'wp-google-map-plugin' ),
		'current' => isset( $data['map_all_control']['wpgmp_list_grid'] ) ? $data['map_all_control']['wpgmp_list_grid'] : '',
		'desc'    => esc_html__( 'Choose listing style for frontend display.', 'wp-google-map-plugin' ),
		'options' => $list_grid,
		'class'   => 'form-control wpgmp_display_listing',
		'show'    => 'false',
		'pro' => true
	)
);

$default_place_holder = '
<div class="wpgmp_locations">
<div class="wpgmp_locations_head">
<div class="wpgmp_location_title">
<a href="" class="place_title" data-zoom="{marker_zoom}" data-marker="{marker_id}">{marker_title}</a>
</div>
<div class="wpgmp_location_meta">
<span class="wpgmp_location_category fc-infobox-categories">{marker_category}</span>
</div>
</div>
<div class="wpgmp_locations_content">
{marker_message}
</div>
<div class="wpgmp_locations_foot"></div>
</div>';
$listing_place_holder = stripslashes( trim( $default_place_holder ) );
$listing_place_holder = ( isset( $data['map_all_control']['wpgmp_categorydisplayformat'] ) ? $data['map_all_control']['wpgmp_categorydisplayformat'] : $listing_place_holder );

$sort_listing_options = array(
	'title'     => esc_html__( 'Title', 'wp-google-map-plugin' ),
	'address'   => esc_html__( 'Address', 'wp-google-map-plugin' ),
	'category'  => esc_html__( 'Category', 'wp-google-map-plugin' ),
	'listorder' => esc_html__( 'Category Priority', 'wp-google-map-plugin' ),
);

$sort_listing_options = apply_filters( 'wpgmp_listing_order_sort_options', $sort_listing_options, $data );

$form->add_element(
	'select', 'map_all_control[wpgmp_categorydisplaysort]', array(
		'label'   => esc_html__( 'Sort By', 'wp-google-map-plugin' ),
		'current' => isset( $data['map_all_control']['wpgmp_categorydisplaysort'] ) ? $data['map_all_control']['wpgmp_categorydisplaysort'] : '',
		'desc'    => esc_html__( 'Select Sort By.', 'wp-google-map-plugin' ),
		'options' => apply_filters('wpgmp_listing_sort_options', $sort_listing_options),
		'class'   => 'form-control wpgmp_display_listing',
		'show'    => 'false',
	)
);


$form->add_element(
	'select', 'map_all_control[wpgmp_categorydisplaysortby]', array(
		'label'         => esc_html__( 'Sort Order', 'wp-google-map-plugin' ),
		'current'       => isset( $data['map_all_control']['wpgmp_categorydisplaysortby'] ) ? $data['map_all_control']['wpgmp_categorydisplaysortby'] : '',
		'desc'          => esc_html__( 'Select sorting order.', 'wp-google-map-plugin' ),
		'options'       => array(
			'asc'  => esc_html__( 'Ascending', 'wp-google-map-plugin' ),
			'desc' => esc_html__( 'Descending', 'wp-google-map-plugin' ),
		),
		'class'         => 'form-control wpgmp_display_listing',
		'show'          => 'false',
		'default_value' => 'asc',
	)
);

$form->add_element(
	'checkbox', 'map_all_control[wpgmp_apply_radius_only]', array(
		'label'   => esc_html__( 'Apply Default Radius Filter', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'current' => isset( $data['map_all_control']['wpgmp_apply_radius_only'] ) ? $data['map_all_control']['wpgmp_apply_radius_only'] : '',
		'desc'    => esc_html__( 'Show markers available in certain radius based on user search.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class wpgmp_display_listing switch_onoff',
		'show'    => 'false',
		'data'    => array( 'target' => '.wpgmp_radius_filter_apply' ),
		'pro' => true
	)
);


$location_placeholders = array(
	'{marker_id}',
	'{marker_title}',
	'{marker_address}',
	'{marker_message}',
	'{marker_category}',
	'{marker_icon}',
	'{marker_latitude}',
	'{marker_longitude}',
	'{marker_city}',
	'{marker_state}',
	'{marker_country}',
	'{marker_zoom}',
	'{marker_image}',
	'{marker_postal_code}',
	'{extra_field_slug}',
	'{post_title}',
	'{post_link}',
	'{post_excerpt}',
	'{post_content}',
	'{post_categories}',
	'{post_tags}',
	'{%custom_field_slug_here%}',
	'{taxonomy=taxonomy_slug}',
	'{#if marker_city} content {/if}'
);

if(isset($data['map_all_control']['item_skin']['sourcecode']) && !empty($data['map_all_control']['item_skin']['sourcecode'])){
	$data['map_all_control']['item_skin']['sourcecode'] = htmlspecialchars_decode($data['map_all_control']['item_skin']['sourcecode']);
}

$form->add_element(
	'templates', 'map_all_control[item_skin]', array(
		'parent_class'	=> 'wpgmp_display_listing_item',
		'label'	=> esc_html__( 'Listing Item Skin', 'wp-google-map-plugin' ),
		'template_types'      => 'item',
		'data_placeholders'   => $location_placeholders,
		'templatePath'        => WPGMP_TEMPLATES,
		'templateURL'         => WPGMP_TEMPLATES_URL,
		'customiser'          => 'true',
		'current'             => ( isset( $data['map_all_control']['item_skin'] ) ) ? $data['map_all_control']['item_skin'] : array(
			'name'       => 'default',
			'type'       => 'item',
			'sourcecode' => $listing_place_holder,
		),
		'customiser_controls' => array( 'edit_mode', 'placeholder', 'sourcecode', 'mobile', 'desktop', 'grid' ),
	)
);

$form->add_element(
	'group', 'map_filters_setting', array(
		'value'  => esc_html__( 'Custom Filters', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-create-custom-filters-in-google-maps/',
		'pro' => true
	)
);

$form->add_element(
	'checkbox', 'map_all_control[wpgmp_display_custom_filters]', array(
		'label'   => esc_html__( 'Display Custom Filters', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'wpgmp_wpgmp_display_custom_filters',
		'current' => isset( $data['map_all_control']['wpgmp_display_custom_filters'] ) ? $data['map_all_control']['wpgmp_display_custom_filters'] : '',
		'desc'    => esc_html__( 'Check to enable custom filters for extra fields, custom fields & taxonomies.', 'wp-google-map-plugin' ),
		'class'   => 'fc-form-check-input chkbox_class switch_onoff',
		'data'    => array( 'target' => '.wpgmp_custom_filters' ),
		'pro' => true
	)
);



$form->add_element(
	'html',
	'wpgmp_map_custom_filters_setting_msg',
	array(
		'html' => WPGMP_Helper::wpgmp_instructions('custom_filters'),
		'show'  => 'true',
		'before' => '<div class="fc-7">',
		'after'  => '</div>',
	)
);

$form->add_element(
	'group', 'map_filter_position', array(
		'value'  => esc_html__( 'Map Filter Settings', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
	)
);

$filters_position = array(
	'default' => esc_html__( 'Bottom of the Map', 'wp-google-map-plugin' ),
	'top_map' => esc_html__( 'Top of the Map', 'wp-google-map-plugin' ),
);
$form->add_element(
	'select', 'map_all_control[filters_position]', array(
		'label'   => esc_html__( 'Filters Position', 'wp-google-map-plugin' ),
		'current' => isset( $data['map_all_control']['filters_position'] ) ? $data['map_all_control']['filters_position'] : '',
		'desc'    => esc_html__( 'Choose filters position. Default is below the map.', 'wp-google-map-plugin' ),
		'options' => $filters_position,
		'class'   => 'form-control',
	)
);

$form->add_element(
	'checkbox', 'map_all_control[hide_locations]', array(
		'label'   => esc_html__( 'Show Filters Only', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'current' => isset( $data['map_all_control']['hide_locations'] ) ? $data['map_all_control']['hide_locations'] : '',
		'desc'    => esc_html__( 'Check to display filters only.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);

$form->add_element(
	'checkbox', 'map_all_control[hide_map]', array(
		'label'   => esc_html__( "Don't Show Maps", 'wp-google-map-plugin' ),
		'value'   => 'true',
		'current' => isset( $data['map_all_control']['hide_map'] ) ? $data['map_all_control']['hide_map'] : '',
		'desc'    => esc_html__( 'Check to display filters & locations only. Maps will be invisible.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);

$form->add_element(
	'checkbox', 'map_all_control[bound_map_after_filter]', array(
		'label'   => esc_html__( 'Fitbound Map After Filteration', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'current' => isset( $data['map_all_control']['bound_map_after_filter'] ) ? $data['map_all_control']['bound_map_after_filter'] : '',
		'desc'    => esc_html__( 'Fit bound the map with resultant markers after filteration process', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',

	)
);

$form->add_element(
	'checkbox', 'map_all_control[display_reset_button]', array(
		'label'   => esc_html__( 'Display Reset Map Button', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'current' => isset( $data['map_all_control']['display_reset_button'] ) ? $data['map_all_control']['display_reset_button'] : '',
		'desc'    => esc_html__( 'Check to enable display reset map button on frontend.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class switch_onoff',
		'data'    => array( 'target' => '.map_reset_button_text' ),
	)
);

$form->add_element(
	'text', 'map_all_control[map_reset_button_text]', array(
		'label'       => esc_html__( 'Reset Map Button Text', 'wp-google-map-plugin' ),
		'value'       => ( isset( $data['map_all_control']['map_reset_button_text'] ) and ! empty( $data['map_all_control']['map_reset_button_text'] ) ) ? $data['map_all_control']['map_reset_button_text'] : esc_html__( 'Reset', 'wp-google-map-plugin' ),
		'desc'        => esc_html__( 'Enter text to be displayed on Reset Map Button', 'wp-google-map-plugin' ),
		'class'       => 'form-control map_reset_button_text',
		'placeholder' => esc_html__( 'Enter Reset Map Text', 'wp-google-map-plugin' ),
		'show'        => 'false',
	)
);