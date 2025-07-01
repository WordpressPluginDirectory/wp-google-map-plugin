<?php
/**
 * Contro Positioning over google maps.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */

$form->add_element(
	'group', 'map_geotags_settings', array(
		'value'  => esc_html__( 'Display Posts Using Custom Fields', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-show-posts-location-using-custom-fields/',
		'pro' => true
	)
);

$form->add_element(
	'checkbox', 'map_all_control[geo_tags]', array(
		'label'   => esc_html__( 'GEO Tags', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'wpgmp_geo_tags',
		'current' => isset( $data['map_all_control']['geo_tags'] ) ? $data['map_all_control']['geo_tags'] : '',
		'desc'    => esc_html__( 'Enable to display location from your own custom fields of posts or custom post types.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class switch_onoff',
		'before' => '<div class="fc-8">',
		'after'  => '</div>',
		'data'    => array( 'target' => '.geo_tags_setting' ),
		'pro' => true
	)
);

$form->add_element(
	'html',
	'wpgmp_map_geotags_setting_msg',
	array(
		'html' => WPGMP_Helper::wpgmp_instructions('geotags'),
		'show'  => 'true',
		'before' => '<div class="fc-7">',
		'after'  => '</div>',
	)
);



$form->add_element(
	'group', 'map_acf_settings', array(
		'value'  => esc_html__( 'Display Posts using ACF Plugin', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link'=> 'https://www.wpmapspro.com/docs/how-to-assign-location-using-acf-plugin/',
		'pro' => true
	)
);
$form->add_element(
	'text', 'map_all_control[wpgmp_acf_field_name]', array(
		'label' => esc_html__( 'ACF Field Name', 'wp-google-map-plugin' ),
		'value' => isset( $data['map_all_control']['wpgmp_acf_field_name'] ) ? $data['map_all_control']['wpgmp_acf_field_name'] : '',
		'id'    => 'wpgmp_acf_field_name',
		'desc'  => esc_html__( 'Enter acf field name/slug which is of type Google Map. It should be exactly same slug which is created which you create the element in field group. The map you are creating will fetch all the locations added through ACF\'s google map type field and will display markers on all those locations. ', 'wp-google-map-plugin' ),
		'placeholder'  => esc_html__( 'Enter the acf form field name / slug which you used to assign the locations on google maps.', 'wp-google-map-plugin' ),
		'class' => 'form-control  geo_acf_setting',
		'pro' => true
	)
);
$form->add_element(
	'html',
	'wpgmp_map_acf_setting_msg',
	array(
		'html' => WPGMP_Helper::wpgmp_instructions('acf'),
		'show'  => 'true',
		'before' => '<div class="fc-7">',
		'after'  => '</div>',
	)
);