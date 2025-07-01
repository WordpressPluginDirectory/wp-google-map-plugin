<?php
/**
 * Contro Positioning over google maps.
 *
 * @package Maps
 * @author Flipper Code <hello@flippercode.com>
 */

$form->add_element(
	'group', 'map_styles_settings', array(
		'value'  => esc_html__( 'Map Styling Settings', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-give-different-style-to-your-google-map/'
	)
);

if ( ! isset( $data['style_google_map'] ) ) {
	$data['style_google_map'] = array();
}

$featuredtype = array(
	'Select Featured Type',
	'administrative',
	'administrative.country',
	'administrative.land_parcel',
	'administrative.locality',
	'administrative.neighborhood',
	'administrative.province',
	'all',
	'landscape',
	'landscape.man_made',
	'landscape.natural',
	'landscape.natural.landcover',
	'landscape.natural.terrain',
	'poi',
	'poi.attraction',
	'poi.business',
	'poi.government',
	'poi.medical',
	'poi.park',
	'poi.place_of_worship',
	'poi.school',
	'poi.sports_complex',
	'road',
	'road.arterial',
	'road.highway',
	'road.highway.controlled_access',
	'road.local',
	'transit',
	'transit.line',
	'transit.station',
	'transit.station.airport',
	'transit.station.bus',
	'transit.station.rail',
	'water',
);
foreach ( $featuredtype as $key => $value ) {
	$featuredtype_pair[ $value ] = $value;
}

$elementstype = array( 'Select Element Type', 'all', 'geometry', 'geometry.fill', 'geometry.stroke', 'labels', 'labels.icon', 'labels.text', 'labels.text.fill', 'labels.text.stroke' );

foreach ( $elementstype as $key => $value ) {
	$elementstype_pair[ $value ] = $value;
}

for ( $i = 0; $i < 10; $i++ ) {
	$input[ $i ][0] = esc_html__( 'Style', 'wp-google-map-plugin' ) . ' ' . ( $i + 1 );
	$input[ $i ][1] = $form->field_select(
		'style_google_map[mapfeaturetype][' . $i . ']', array(
			'options' => $featuredtype_pair,
			'current' => isset( $data['style_google_map']['mapfeaturetype'][ $i ] ) ? $data['style_google_map']['mapfeaturetype'][ $i ] : '',
		)
	);
	$input[ $i ][2] = $form->field_select(
		'style_google_map[mapelementtype][' . $i . ']', array(
			'options' => $elementstype_pair,
			'current' => isset( $data['style_google_map']['mapelementtype'][ $i ] ) ? $data['style_google_map']['mapelementtype'][ $i ] : '',
		)
	);
	$input[ $i ][3] = $form->field_text(
		'style_google_map[color][' . $i . ']', array(
			'value' => isset( $data['style_google_map']['color'][ $i ] ) ? $data['style_google_map']['color'][ $i ] : '',
			'class' => 'color {pickerClosable:true} form-control',
		)
	);
	$input[ $i ][4] = $form->field_select(
		'style_google_map[visibility][' . $i . ']', array(
			'options' => array(
				'on'        => 'YES',
				'off'       => 'NO',
				'simplifed' => 'Simplifed',
			),
			'current' => isset( $data['style_google_map']['visibility'][ $i ] ) ? $data['style_google_map']['visibility'][ $i ] : '',
		)
	);

}

$form->add_element(
	'table', 'map_styles_table', array(
		'heading' => array( '#', esc_html__('Feature Type','wp-google-map-plugin'), esc_html__('Element Type','wp-google-map-plugin'),esc_html__('Color','wp-google-map-plugin'), esc_html__('Visibility' ,'wp-google-map-plugin')),
		'data'    => $input,
		'id'      => 'map_styles_table',
		'before'  => '<div class="fc-12">',
		'after'   => '</div>',
		'current' => isset( $data['style_google_map'] ) ? $data['style_google_map'] : '',
	)
);

$form->add_element(
	'message', 'styles_message', array(
		'value'  => esc_html__( 'You can apply above settings manually or you can apply free and readymade maps style by clicking ', 'wp-google-map-plugin' ).'<a href="http://snazzymaps.com/" target="_blank">HERE</a><br>'.esc_html__('Select your favourite snazzy map style & then just copy paste its javascript code snippet in the below textarea control :'),
		'class'  => 'fc-alert fc-alert-info',
		'id'     => 'styles_message',
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
	)
);


$form->add_element(
	'textarea', 'map_all_control[custom_style]', array(
		'label'         => '',
		'value'         => ( isset( $data['map_all_control']['custom_style'] ) and ! empty( $data['map_all_control']['custom_style'] ) ) ? $data['map_all_control']['custom_style'] : '',
		'desc'          => esc_html__( 'Copy google map style from snazzymaps.com and paste here.', 'wp-google-map-plugin' ),
		'textarea_rows' => 20,
		'textarea_name' => 'location_messages',
		'class'         => 'form-control',
		'id'            => 'map_custom_style',
		'before'        => '<div class="fc-11">',
		'after'         => '</div>',
	)
);
