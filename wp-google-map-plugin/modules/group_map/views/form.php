<?php
/**
 * Template for Add & Edit Category
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
$modelFactory = new WPGMP_Model();
$category     = $modelFactory->create_object( 'group_map' );
$categories   = (array) $category->fetch();
$current_cat_id = '';
if ( isset( $_GET['doaction'] ) and 'edit' == $_GET['doaction'] and isset( $_GET['group_map_id'] ) ) {
	$category_obj = $category->fetch( array( array( 'group_map_id', '=', intval( wp_unslash( $_GET['group_map_id'] ) ) ) ) );
	$_POST        = (array) $category_obj[0];
	$current_cat_id = $_GET['group_map_id'];
} elseif ( ! isset( $_GET['doaction'] ) and isset( $response['success'] ) ) {
	// Reset $_POST object for antoher entry.
	unset( $_POST );
}
$form = new WPGMP_Template();
$form->set_header( esc_html__( 'Marker Category', 'wp-google-map-plugin' ), $response, $enable = true, esc_html__( 'Manage Marker Categories', 'wp-google-map-plugin' ), 'wpgmp_manage_group_map' );
$form->add_element(
	'group', 'marker_cat', array(
		'value'  => esc_html__( 'Marker Category', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-create-a-marker-categories/'
	)
);



$form->add_element(
	'text', 'group_map_title', array(
		'label'       => esc_html__( 'Marker Category Title', 'wp-google-map-plugin' ),
		'value'       => ( isset( $_POST['group_map_title'] ) && ! empty( $_POST['group_map_title'] ) ) ? sanitize_text_field( wp_unslash( $_POST['group_map_title'] ) ) : '',
		'id'          => 'group_map_title',
		'desc'        => esc_html__( 'Enter the marker category title / name here.', 'wp-google-map-plugin' ),
		'class'       => 'create_map form-control',
		'placeholder' => esc_html__( 'Marker Category Title', 'wp-google-map-plugin' ),
		'required'    => true,
	)
);

if ( is_array( $categories ) ) {
	$markers = array( ' ' => esc_html__('Please Select', 'wp-google-map-plugin') );
	foreach ( $categories as $i => $single_category ) {
			if($single_category->group_map_id == $current_cat_id)
				continue;

			$markers[ $single_category->group_map_id ] = $single_category->group_map_title;
	}

	$form->add_element(
		'select', 'group_parent', array(
			'label'   => esc_html__( 'Parent Category', 'wp-google-map-plugin' ),
			'current' => ( isset( $_POST['group_parent'] ) and ! empty( $_POST['group_parent'] ) ) ? intval( wp_unslash( $_POST['group_parent'] ) ) : '',
			'desc'    => esc_html__( 'Assign parent category to the current category you are creating if you want. Its optional.', 'wp-google-map-plugin' ),
			'options' => $markers,
		)
	);

}

$form->add_element(
	'image_picker', 'group_marker', array(
		'label'         => esc_html__( 'Choose Marker Image', 'wp-google-map-plugin' ),
		'src'           => ( isset( $_POST['group_marker'] ) ) ? wp_unslash( $_POST['group_marker'] ) : WPGMP_Helper::wpgmp_default_marker_icon(),
		'required'      => false,
		'choose_button' => esc_html__( 'Choose', 'wp-google-map-plugin' ),
		'remove_button' => esc_html__( 'Remove', 'wp-google-map-plugin' ),
		'id'            => 'marker_category_icon',
		'desc' => esc_html__( 'Please choose a unique marker icon for the marker category you\'re creating. All the locations with same marker categories displays the same marker icon on the map. So marker category icon is basically used to group the markers on map by marker icon image.', 'wp-google-map-plugin' ),
	)
);

$form->set_col( 1 );
$form->add_element(
	'text', 'extensions_fields[cat_order]', array(
		'label'         => esc_html__( 'Marker Category Order Number', 'wp-google-map-plugin' ),
		'value'         => ( isset( $_POST['extensions_fields']['cat_order'] ) && ! empty( $_POST['extensions_fields']['cat_order'] ) ) ? sanitize_text_field( wp_unslash( $_POST['extensions_fields']['cat_order'] ) ) : '',
		'id'            => 'group_map_cat_order_value',
		'desc'          => esc_html__( 'Enter a numeric category priority order number. Listing records with category of lower priority order will be populated first on the top when you set the sorting of listing records by category prioritiy', 'wp-google-map-plugin' ),
		'class'         => 'create_map form-control',
		'placeholder'   => esc_html__( 'Enter category priority order number', 'wp-google-map-plugin' ),
		'default_value' => 0,
	)
);

$form->add_element(
	'extensions', 'wpgmp_category_form', array(
		'value'  => isset( $_POST['extensions_fields'] ) ? $_POST['extensions_fields'] : '',
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
	)
);


$form->add_element(
	'submit', 'create_group_map_location', array(
		'value'  => esc_html__('Save Marker Category', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',

	)
);

$form->add_element(
	'hidden', 'operation', array(
		'value' => 'save',
	)
);

if ( isset( $_GET['doaction'] ) and 'edit' == $_GET['doaction'] ) {
	$form->add_element(
		'hidden', 'entityID', array(
			'value' => intval( wp_unslash( $_GET['group_map_id'] ) ),
		)
	);
}

$form->render();
