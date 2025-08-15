<?php
/**
 * Contro Positioning over google maps.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */

$form->add_element(
	'group', 'map_infowindow_settings', array(
		'value'  => esc_html__( 'Infowindow Settings', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
	)
);
$url  = admin_url( 'admin.php?page=wpgmp_how_overview' );
$link = sprintf(
	wp_kses(
		esc_html__( 'Enter placeholders {marker_title},{marker_address},{marker_message},{marker_image},{marker_latitude},{marker_longitude}, {extra_field_slug_here}. View complete list <a target="_blank" href="%s">here</a>.', 'wp-google-map-plugin' ), array(
			'a' => array(
				'href'   => array(),
				'target' => '_blank',
			),
		)
	), esc_url( $url )
);

$form->add_element(
	'checkbox', 'map_all_control[infowindow_filter_only]', array(
		'label'   => esc_html__( 'Hide Markers on Page Load', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'infowindow_default_open',
		'current' => isset( $data['map_all_control']['infowindow_filter_only'] ) ? $data['map_all_control']['infowindow_filter_only'] : '',
		'desc'    => esc_html__( "Don't display markers on page load. Display markers after filtration only.", 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);

$info_default_value = '<div class="fc-main"><div class="fc-item-title">{marker_title} <span class="fc-infobox-categories">{marker_category}</span></div> <div class="fc-item-featured_image">{marker_image} </div>{marker_message}<address><b>Address : </b>{marker_address}</address></div>';

$info_default_value = ( isset( $data['map_all_control']['infowindow_setting'] ) and '' != $data['map_all_control']['infowindow_setting'] ) ? $data['map_all_control']['infowindow_setting'] : $info_default_value;

$default_value = '<div class="fc-main"><div class="fc-item-title">{post_title} <span class="fc-infobox-categories">{post_categories}</span></div> <div class="fc-item-featured_image">{post_featured_image} </div>{post_excerpt}<address><b>Address : </b>{marker_address}</address><a target="_blank"  class="fc-btn fc-btn-small fc-btn-red" href="{post_link}">Read More...</a></div>';
$default_value = ( isset( $data['map_all_control']['infowindow_geotags_setting'] ) and '' != $data['map_all_control']['infowindow_geotags_setting'] ) ? $data['map_all_control']['infowindow_geotags_setting'] : $default_value;

if ( isset( $data['map_all_control']['infowindow_openoption'] ) && 'mouseclick' == $data['map_all_control']['infowindow_openoption'] ) {
	$data['map_all_control']['infowindow_openoption'] = 'click'; } elseif ( isset( $data['map_all_control']['infowindow_openoption'] ) && 'mousehover' == $data['map_all_control']['infowindow_openoption'] ) {
	$data['map_all_control']['infowindow_openoption'] = 'mouseover'; }
	$event = array(
		'click'     => 'Mouse Click',
		'mouseover' => 'Mouse Hover',
	);
	$form->add_element(
		'select', 'map_all_control[infowindow_openoption]', array(
			'label'   => esc_html__( 'Show Infowindow on', 'wp-google-map-plugin' ),
			'current' => isset( $data['map_all_control']['infowindow_openoption'] ) ? $data['map_all_control']['infowindow_openoption'] : '',
			'desc'    => esc_html__( 'Open infowindow on Mouse Click or Mouse Hover.', 'wp-google-map-plugin' ),
			'options' => $event,
		)
	);

	$form->add_element(
		'image_picker', 'map_all_control[marker_default_icon]', array(
			'label'         => esc_html__( 'Choose Marker Image', 'wp-google-map-plugin' ),
			'src'           => ( isset( $data['map_all_control']['marker_default_icon'] ) ? wp_unslash( $data['map_all_control']['marker_default_icon'] ) : WPGMP_Helper::wpgmp_default_marker_icon() ),
			'required'      => false,
			'choose_button' => esc_html__( 'Choose', 'wp-google-map-plugin' ),
			'remove_button' => esc_html__( 'Remove', 'wp-google-map-plugin' ),
			'id'            => 'marker_category_icon',
		)
	);

	$form->add_element(
		'checkbox', 'map_all_control[infowindow_open]', array(
			'label'   => esc_html__( 'InfoWindow Open', 'wp-google-map-plugin' ),
			'value'   => 'true',
			'id'      => 'wpgmp_infowindow_open',
			'current' => isset( $data['map_all_control']['infowindow_open'] ) ? $data['map_all_control']['infowindow_open'] : '',
			'desc'    => esc_html__( 'Please check to enable infowindow default open.', 'wp-google-map-plugin' ),
			'class'   => 'chkbox_class',
		)
	);

	$form->add_element(
		'checkbox', 'map_all_control[infowindow_close]', array(
			'label'   => esc_html__( 'Close InfoWindow', 'wp-google-map-plugin' ),
			'value'   => 'true',
			'id'      => 'wpgmp_infowindow_close',
			'current' => isset( $data['map_all_control']['infowindow_close'] ) ? $data['map_all_control']['infowindow_close'] : '',
			'desc'    => esc_html__( 'Please check to close infowindow on map click.', 'wp-google-map-plugin' ),
			'class'   => 'chkbox_class',
		)
	);

	$event = array(
		''          => esc_html__( 'Select Animation', 'wp-google-map-plugin' ),
		'click'     => esc_html__( 'Mouse Click', 'wp-google-map-plugin' ),
		'mouseover' => esc_html__( 'Mouse Hover', 'wp-google-map-plugin' ),
	);
	$form->add_element(
		'select', 'map_all_control[infowindow_bounce_animation]', array(
			'label'   => esc_html__( 'Bounce Animation', 'wp-google-map-plugin' ),
			'current' => isset( $data['map_all_control']['infowindow_bounce_animation'] ) ? $data['map_all_control']['infowindow_bounce_animation'] : '',
			'desc'    => esc_html__( 'Apply bounce animation on mousehover or mouse click. BOUNCE indicates that the marker should bounce in place.', 'wp-google-map-plugin' ),
			'options' => $event,
		)
	);

	$form->add_element(
		'checkbox', 'map_all_control[infowindow_drop_animation]', array(
			'label'   => esc_html__( 'Apply Drop Animation', 'wp-google-map-plugin' ),
			'value'   => 'true',
			'id'      => 'infowindow_drop_animation',
			'current' => isset( $data['map_all_control']['infowindow_drop_animation'] ) ? $data['map_all_control']['infowindow_drop_animation'] : '',
			'desc'    => esc_html__( 'DROP indicates that the marker should drop from the top of the map. ', 'wp-google-map-plugin' ),
			'class'   => 'chkbox_class',
		)
	);

	$zoom_level     = array();
	$zoom_level[''] = esc_html__( 'Select Zoom', 'wp-google-map-plugin' );
	for ( $i = 1; $i < 20; $i++ ) {
		$zoom_level[ $i ] = $i;
	}

	$form->add_element(
		'select', 'map_all_control[infowindow_zoomlevel]', array(
			'label'   => esc_html__( 'Change Zoom on Click', 'wp-google-map-plugin' ),
			'current' => isset( $data['map_all_control']['infowindow_zoomlevel'] ) ? $data['map_all_control']['infowindow_zoomlevel'] : '',
			'desc'    => esc_html__( 'Change zoom level of the map on marker click.', 'wp-google-map-plugin' ),
			'options' => $zoom_level,
			'before'  => '<div class="fc-6">',
			'after'   => '</div>',
		)
	);

	$form->add_element(
		'checkbox', 'map_all_control[infowindow_iscenter]', array(
			'label'   => esc_html__( 'Center the Map', 'wp-google-map-plugin' ),
			'value'   => 'true',
			'current' => isset( $data['map_all_control']['infowindow_iscenter'] ) ? $data['map_all_control']['infowindow_iscenter'] : '',
			'desc'    => esc_html__( 'Set as center point on marker click', 'wp-google-map-plugin' ),
			'class'   => 'chkbox_class',
		)
	);


	$form->add_element(
		'checkbox', 'map_all_control[map_infowindow_customisations]', array(
			'label'   => esc_html__( 'Turn On Infowindow Customization', 'wp-google-map-plugin' ),
			'value'   => 'true',
			'id'      => 'map_infowindow_customisations',
			'current' => isset( $data['map_all_control']['map_infowindow_customisations'] ) ? $data['map_all_control']['map_infowindow_customisations'] : '',
			'desc'    => esc_html__( 'Please check to enable infowindow customization. These settings will only work with default infowindow skin.', 'wp-google-map-plugin' ),
			'class'   => 'switch_onoff chkbox_class',
			'data'    => array( 'target' => '.map_iw_customisations' ),
		)
	);

	$form->add_element(
		'text', 'map_all_control[infowindow_width]', array(
			'label'         => esc_html__( 'Width', 'wp-google-map-plugin' ),
			'value'         => isset( $data['map_all_control']['infowindow_width'] ) ? $data['map_all_control']['infowindow_width'] : '',
			'class'         => 'form-control map_iw_customisations',
			'desc'          => esc_html__( 'Enter infowindow width in px. Leave blank for default settings.', 'wp-google-map-plugin' ),
			'placeholder'          => esc_html__( 'Enter infowindow width in px. Leave blank for default settings.', 'wp-google-map-plugin' ),
			'show'          => 'false',
			'default_value' => '',
		)
	);

	$location_placeholders = array(
		'{marker_id}',
		'{marker_title}',
		'{marker_image}',
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
		'{marker_postal_code}',
		'{extra_field_slug}',
		'{get_directions_link}',
		'{#if marker_city} content {/if}'
	);

	if(isset($data['map_all_control']['location_infowindow_skin']['sourcecode']) && !empty($data['map_all_control']['location_infowindow_skin']['sourcecode'])){
		$data['map_all_control']['location_infowindow_skin']['sourcecode'] = htmlspecialchars_decode($data['map_all_control']['location_infowindow_skin']['sourcecode']);
	}

	if( isset( $data['map_all_control']['location_infowindow_skin']['name'] ) && $data['map_all_control']['location_infowindow_skin']['name'] == 'basic'){
		$data['map_all_control']['location_infowindow_skin']['name'] = 'default';
	}


	
	$form->add_element(
		'templates', 'map_all_control[location_infowindow_skin]', array(
			'parent_class'	=> 'fc-type-infowindow',
			'label'	=> esc_html__( 'Infowindow Message for Locations', 'wp-google-map-plugin' ),
			'template_types'      => 'infowindow',
			'templatePath'        => WPGMP_TEMPLATES,
			'templateURL'         => WPGMP_TEMPLATES_URL,
			'data_placeholders'   => $location_placeholders,
			'customiser'          => 'true',
			'current'             => ( isset( $data['map_all_control']['location_infowindow_skin'] ) ) ? $data['map_all_control']['location_infowindow_skin'] : array(
				'name'       => 'default',
				'type'       => 'infowindow',
				'sourcecode' => $info_default_value,
			),
			'customiser_controls' => array( 'edit_mode', 'placeholder', 'sourcecode' ),
			'tutorial_link' => 'https://www.wpmapspro.com/docs/customizing-infowindow-messages-for-locations/'
		)
	);

	$post_placeholders = array(
		'{post_title}',
		'{post_link}',
		'{post_excerpt}',
		'{post_content}',
		'{post_featured_image}',
		'{post_categories}',
		'{post_tags}',
		'{%custom_field_slug_here%}',
		'{get_directions_link}',
		'{taxonomy=taxonomy_slug}',
		'{#if marker_city} content {/if}',
	);

	if(isset($data['map_all_control']['post_infowindow_skin']['sourcecode']) && !empty($data['map_all_control']['post_infowindow_skin']['sourcecode'])){
		$data['map_all_control']['post_infowindow_skin']['sourcecode'] = htmlspecialchars_decode($data['map_all_control']['post_infowindow_skin']['sourcecode']);
	}

	$form->add_element(
		'group', 'map_posts_infowindow_setting', array(
			'value'  => esc_html__( 'Infowindow Message for Posts', 'wp-google-map-plugin' ),
			'before' => '<div class="fc-12">',
			'after'  => '</div>',
			'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-show-post-infowindow-using-custom-field/',
			'pro' => true
		)
	);
	
	$form->add_element(
		'html',
		'wpgmp_map_posts_infowindow_msg',
		array(
			'html' => WPGMP_Helper::wpgmp_instructions('post_infowindow'),
			'show'  => 'true',
			'before' => '<div class="fc-7">',
			'after'  => '</div>',
		)
	);