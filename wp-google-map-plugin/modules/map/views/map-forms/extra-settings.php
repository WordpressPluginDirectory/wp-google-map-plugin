<?php

$form->add_element(
    'group', 'map_control_layers', array(
        'value'  => esc_html__( 'Map Layers Settings', 'wp-google-map-plugin' ),
        'before' => '<div class="fc-12">',
        'after'  => '</div>',
        'tutorial_link' => 'https://www.wpmapspro.com/topic/layers/'
    )
);
$form->add_element(
    'checkbox', 'map_layer_setting[choose_layer][kml_layer]', array(
        'label'   => esc_html__( 'Kml/Kmz Layer', 'wp-google-map-plugin' ),
        'value'   => 'KmlLayer',
        'id'      => 'wpgmp_kml_layer',
        'current' => isset( $data['map_layer_setting']['choose_layer']['kml_layer'] ) ? $data['map_layer_setting']['choose_layer']['kml_layer'] : '',
        'desc'    => esc_html__( 'Please check to enable Kml/Kmz Layer.', 'wp-google-map-plugin' ),
        'class'   => 'chkbox_class switch_onoff',
        'data'    => array( 'target' => '#map_links' ),
    )
);
$form->add_element(
    'textarea', 'map_layer_setting[map_links]', array(
        'label'         => esc_html__( 'KML Link(s)', 'wp-google-map-plugin' ),
        'value'         => isset( $data['map_layer_setting']['map_links'] ) ? $data['map_layer_setting']['map_links'] : '',
        'desc'          => esc_html__( 'Paste here kml or kmz link. You can insert multiple comma (,) separated kml or kmz links here.', 'wp-google-map-plugin' ),
        'placeholder'          => esc_html__( 'Enter the kml or kmz link url to display KML data directly on the map.', 'wp-google-map-plugin' ),
        'textarea_rows' => 10,
        'textarea_name' => 'map_layer_setting[map_links]',
        'class'         => 'form-control',
        'id'            => 'map_links',
        'show'          => 'false',
    )
);

$form->add_element(
    'checkbox', 'map_layer_setting[choose_layer][traffic_layer]', array(
        'label'   => esc_html__( 'Traffic Layer', 'wp-google-map-plugin' ),
        'value'   => 'TrafficLayer',
        'id'      => 'wpgmp_traffic_layer',
        'current' => isset( $data['map_layer_setting']['choose_layer']['traffic_layer'] ) ? $data['map_layer_setting']['choose_layer']['traffic_layer'] : '',
        'desc'    => esc_html__( 'Please check to enable traffic Layer.', 'wp-google-map-plugin' ),
        'class'   => 'chkbox_class',
    )
);

$form->add_element(
    'checkbox', 'map_layer_setting[choose_layer][transit_layer]', array(
        'label'   => esc_html__( 'Transit Layer', 'wp-google-map-plugin' ),
        'value'   => 'TransitLayer',
        'id'      => 'wpgmp_transit_layer',
        'current' => isset( $data['map_layer_setting']['choose_layer']['transit_layer'] ) ? $data['map_layer_setting']['choose_layer']['transit_layer'] : '',
        'desc'    => esc_html__( 'Please check to enable Transit Layer.', 'wp-google-map-plugin' ),
        'class'   => 'chkbox_class',
    )
);


$form->add_element(
    'checkbox', 'map_layer_setting[choose_layer][bicycling_layer]', array(
        'label'   => esc_html__( 'Bicycling Layer', 'wp-google-map-plugin' ),
        'value'   => 'BicyclingLayer',
        'id'      => 'wpgmp_bicycling_layer',
        'current' => isset( $data['map_layer_setting']['choose_layer']['bicycling_layer'] ) ? $data['map_layer_setting']['choose_layer']['bicycling_layer'] : '',
        'desc'    => esc_html__( 'Please check to enable Bicycling Layer.', 'wp-google-map-plugin' ),
        'class'   => 'chkbox_class',
    )
);


$form->add_element(
	'group', 'map_geojson_setting', array(
		'value'  => esc_html__( 'Geo Json Settings', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-insert-geo-json-url/'
	)
);

$form->add_element(
	'text', 'map_all_control[geojson_url]', array(
		'label' => esc_html__( 'Paste GEO JSON URL', 'wp-google-map-plugin' ),
		'value' => isset( $data['map_all_control']['geojson_url'] ) ? $data['map_all_control']['geojson_url'] : '',
		'desc'  => esc_html__( 'Enter a GEO JSON Url for displaying a geographical data directly on the map. The url must return valid GEO JSON data like ', 'wp-google-map-plugin' ).'<a href="https://storage.googleapis.com/mapsdevsite/json/google.json" target="_blank">this</a>',
		'placeholder'  => esc_html__( 'Please enter a GEO JSON url here', 'wp-google-map-plugin' ),
		'class' => 'form-control',
	)
);