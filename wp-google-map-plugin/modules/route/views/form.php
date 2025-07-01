<?php
/**
 * Template for Add & Edit Route
 *
 * @author  Flipper Code <hello@flippercode.com>
 * @package Maps
 */

if ( isset( $_REQUEST['_wpnonce'] ) ) {

	$nonce = sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) );

	if ( ! wp_verify_nonce( $nonce, 'wpgmp-nonce' ) ) {

		die( 'Cheating...' );

	} else {
		$data = $_POST;
	}
}
global $wpdb;
$form         = new WPGMP_Template();
$modelFactory = new WPGMP_Model();
$category     = $modelFactory->create_object( 'group_map' );
$location     = $modelFactory->create_object( 'location' );
$locations    = $location->fetch();
$categories   = $category->fetch();
if ( ! empty( $categories ) ) {
	$categories_data = array();
	foreach ( $categories as $cat ) {
		$categories_data[ $cat->group_map_id ] = $cat->group_map_title;
	}
}
$route = $modelFactory->create_object( 'route' );
if ( isset( $_GET['doaction'] ) and 'edit' == $_GET['doaction'] and isset( $_GET['route_id'] ) ) {
	$route_obj = $route->fetch( array( array( 'route_id', '=', intval( wp_unslash( $_GET['route_id'] ) ) ) ) );
	$data      = (array) $route_obj[0];
} elseif ( ! isset( $_GET['doaction'] ) and isset( $response['success'] ) ) {
	// Reset $_POST object for antoher entry.
	unset( $data );
}

$all_locations = array();

if ( ! empty( $locations ) ) {

	if ( ! isset( $data['route_way_points'] ) ) {
		$data['route_way_points'] = array();
	}


	foreach ( $locations as $loc ) {
		$assigned_categories = array();
		if ( isset( $loc->location_group_map ) and is_array( $loc->location_group_map ) ) {
			foreach ( $loc->location_group_map as $c => $cat ) {
				if ( isset( $categories_data[ $cat ] ) ) {
					$assigned_categories[] = $categories_data[ $cat ];
				}
			}
		}
		$assigned_categories = implode( ',', $assigned_categories );
		$loc_checkbox        = $form->field_checkbox(
			'select_route_way_points[]', array(
				'value'   => $loc->location_id,
				'current' => ( ( in_array( $loc->location_id, (array) $data['route_way_points'] ) ) ? $loc->location_id : '' ),
				'class'   => 'fc-form-check-input chkbox_class',
				'before'  => '<div class="fc-1">',
				'after'   => '</div>',
			)
		);
		$all_locations[]     = array( $loc_checkbox, $loc->location_title, $loc->location_address, $assigned_categories );
	}
}


$form->set_header( esc_html__( 'Route Information', 'wp-google-map-plugin' ), $response, $enable = true, esc_html__( 'Manage Routes', 'wp-google-map-plugin' ), 'wpgmp_manage_route' );

if(WPGMP_Helper::wpgmp_is_leaflet_enabled()) {

	$form->add_element(
		'message', 'wpgmp_features_message', array(
			'value'  => WPGMP_Helper::wpgmp_features_limits_msg(),
			'class'  => 'fc-alert fc-alert-info',
			'before' => '<div class="fc-12 ">',
			'after'  => '</div>',
		)
	);
	
}

$form->add_element(
	'group', 'route_info', array(
		'value'  => esc_html__( 'Route Information', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-create-routes-google-maps/',
		'pro' => true
	)
);

$form->add_element(
	'text', 'route_title', array(
		'label'       => esc_html__( 'Route Title', 'wp-google-map-plugin' ),
		'value'       => ( isset( $data['route_title'] ) and ! empty( $data['route_title'] ) ) ? sanitize_text_field( wp_unslash( $data['route_title'] ) ) : '',
		'id'          => 'route_title',
		'desc'        => esc_html__( 'Please enter route title.', 'wp-google-map-plugin' ),
		'placeholder' => esc_html__( 'Route Title', 'wp-google-map-plugin' ),
		'required'    => true,
	)
);

$color = ( empty( $data['route_stroke_color'] ) ) ? '8CAEF2' : sanitize_text_field( wp_unslash( $data['route_stroke_color'] ) );
$form->add_element(
	'text', 'route_stroke_color', array(
		'label'       => esc_html__( 'Stroke Color', 'wp-google-map-plugin' ),
		'value'       => $color,
		'class'       => 'color {pickerClosable:true} form-control',
		'id'          => 'route_stroke_color',
		'desc'        => esc_html__( 'Choose route direction stroke color.(Default is Blue)', 'wp-google-map-plugin' ),
		'placeholder' => esc_html__( 'Route Stroke Color', 'wp-google-map-plugin' ),
	)
);

$stroke_opacity = array(
	'1'   => '1',
	'0.9' => '0.9',
	'0.8' => '0.8',
	'0.7' => '0.7',
	'0.6' => '0.6',
	'0.5' => '0.5',
	'0.4' => '0.4',
	'0.3' => '0.3',
	'0.2' => '0.2',
	'0.1' => '0.1',
);
$form->add_element(
	'select', 'route_stroke_opacity', array(
		'label'   => esc_html__( 'Stroke Opacity', 'wp-google-map-plugin' ),
		'current' => ( isset( $data['route_stroke_opacity'] ) and ! empty( $data['route_stroke_opacity'] ) ) ? sanitize_text_field( wp_unslash( $data['route_stroke_opacity'] ) ) : '',
		'desc'    => esc_html__( 'Please select route direction stroke opacity.', 'wp-google-map-plugin' ),
		'options' => $stroke_opacity,
		'class'   => 'form-control-select',
	)
);

$stroke_weight = array();
for ( $sw = 10; $sw >= 1; $sw-- ) {
	$stroke_weight[ $sw ] = $sw;
}
$form->add_element(
	'select', 'route_stroke_weight', array(
		'label'   => esc_html__( 'Stroke Weight', 'wp-google-map-plugin' ),
		'current' => ( isset( $data['route_stroke_weight'] ) and ! empty( $data['route_stroke_weight'] ) ) ? sanitize_text_field( wp_unslash( $data['route_stroke_weight'] ) ) : '',
		'desc'    => esc_html__( 'Please select route stroke weight.', 'wp-google-map-plugin' ),
		'options' => $stroke_weight,
		'class'   => 'form-control-select',
	)
);

$route_travel_mode = array(
	'DRIVE'   => 'DRIVE',
	'WALK'   => 'WALK',
	'BICYCLE' => 'BICYCLE',
	'TWO_WHEELER' => 'TWO_WHEELER',
	'TRANSIT'   => 'TRANSIT',
);

$form->add_element(
	'select', 'route_travel_mode', array(
		'label'   => esc_html__( 'Travel Modes', 'wp-google-map-plugin' ),
		'current' => ( isset( $data['route_travel_mode'] ) and ! empty( $data['route_travel_mode'] ) ) ? sanitize_text_field( wp_unslash( $data['route_travel_mode'] ) ) : '',
		'desc'    => esc_html__( 'Please select travel mode.', 'wp-google-map-plugin' ),
		'options' => $route_travel_mode,
		'class'   => 'form-control-select',
	)
);

$form->add_element(
	'select', 'route_unit_system', array(
		'label'   => esc_html__( 'Unit Systems', 'wp-google-map-plugin' ),
		'current' => ( isset( $data['route_unit_system'] ) and ! empty( $data['route_unit_system'] ) ) ? sanitize_text_field( wp_unslash( $data['route_unit_system'] ) ) : '',
		'desc'    => esc_html__( 'Please select unit system.', 'wp-google-map-plugin' ),
		'options' => array(
			'METRIC'   => 'METRIC',
			'IMPERIAL' => 'IMPERIAL',
		),
		'class'   => 'form-control-select',
	)
);

$current = ( empty( $data['route_marker_draggable'] ) ) ? '' : sanitize_text_field( wp_unslash( $data['route_marker_draggable'] ) );
$form->add_element(
	'checkbox', 'route_marker_draggable', array(
		'label'   => esc_html__( 'Draggable', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'current' => $current,
		'id'      => 'route_marker_draggable',
		'desc'    => esc_html__( 'Please check to enable route draggable.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);

$current = ( empty( $data['route_optimize_waypoints'] ) ) ? '' : sanitize_text_field( wp_unslash( $data['route_optimize_waypoints'] ) );
$form->add_element(
	'checkbox', 'route_optimize_waypoints', array(
		'label'   => esc_html__( 'Optimize Waypoints', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'current' => $current,
		'id'      => 'route_optimize_waypoints',
		'desc'    => esc_html__( 'Please check to enable optimize waypoints.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);

$res = array();
if ( ! empty( $locations ) ) {

	for ( $i = 0; $i < count( $locations ); $i++ ) {
		$res[ $locations[ $i ]->location_id ] = $locations[ $i ]->location_title;
	}
}

$form->add_element(
	'select', 'route_start_location', array(
		'label'   => esc_html__( 'Start Location', 'wp-google-map-plugin' ),
		'current' => ( isset( $data['route_start_location'] ) and ! empty( $data['route_start_location'] ) ) ? sanitize_text_field( wp_unslash( $data['route_start_location'] ) ) : '',
		'desc'    => esc_html__( 'Please select start location.', 'wp-google-map-plugin' ),
		'options' => $res,
	)
);

$form->add_element(
	'select', 'route_end_location', array(
		'label'   => esc_html__( 'End Location', 'wp-google-map-plugin' ),
		'current' => ( isset( $data['route_end_location'] ) and ! empty( $data['route_end_location'] ) ) ? sanitize_text_field( wp_unslash( $data['route_end_location'] ) ) : '',
		'desc'    => esc_html__( 'Please select end location.', 'wp-google-map-plugin' ),
		'options' => $res,
	)
);


$form->add_element(
	'message', 'route_notes', array(
		'value'  => esc_html__( 'Choose locations / way points from the below table that will connect the "Start Location" & "End Location". Route will be created using the start location , selected locations and the end location. You can select maximum 8 locations from the below table in the route you are creating.', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'class'  => 'fc-alert fc-alert-info',
		'after'  => '</div>',
	)
);

$select_all = $form->field_select(
	'select_all', array(
		'options' => array(
			''             => esc_html__( 'Choose', 'wp-google-map-plugin' ),
			'select_all'   => esc_html__( 'Select All', 'wp-google-map-plugin' ),
			'deselect_all' => esc_html__( 'Deselect All', 'wp-google-map-plugin' ),
		),
	)
);

$form->add_element(
	'html', 'map_routes_listing_div', array(
		'html'   => $select_all,
		'before' => '<div class="fc-12 wpgmp_routes_selection">',
		'after'  => '</div>',
	)
);

$form->add_element(
	'table', 'route_selected_way_points', array(
		'heading' => array( esc_html__( 'Select', 'wp-google-map-plugin' ), esc_html__( 'Location Title', 'wp-google-map-plugin' ), esc_html__( 'Location Address', 'wp-google-map-plugin' ), esc_html__( 'Marker Category', 'wp-google-map-plugin' ) ),
		'data'    => $all_locations,
		'id'      => 'wpgmp_google_map_data_table',
		'before'  => '<div class="fc-12">',
		'after'   => '</div>',
	)
);


$form->add_element(
	'submit', 'save_route_data', array(
		'value' => 'Save Route',
		'pro' => true
	)
);

$form->add_element(
	'hidden', 'route_way_points', array(
		'value' => '',
	)
);

$form->add_element(
	'hidden', 'operation', array(
		'value' => 'save',
	)
);

if ( isset( $_GET['doaction'] ) and 'edit' == 'edit' and isset( $_GET['route_id'] ) ) {

	$form->add_element(
		'hidden', 'entityID', array(
			'value' => intval( wp_unslash( $_GET['route_id'] ) ),
		)
	);

}

$form->render();
