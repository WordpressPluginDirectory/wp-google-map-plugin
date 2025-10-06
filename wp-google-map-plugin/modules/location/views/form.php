<?php
/**
 * Template for Add & Edit Location
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

$wpgmp_settings = get_option( 'wpgmp_settings', true );

$modelFactory = new WPGMP_Model();
$category_obj = $modelFactory->create_object( 'group_map' );
$categories   = $category_obj->fetch();
if ( is_array( $categories ) and ! empty( $categories ) ) {
	$all_categories = array();
	foreach ( $categories as $category ) {
		$all_categories [ $category->group_map_id ] = $category;
	}
}
$location_obj = $modelFactory->create_object( 'location' );
if ( isset( $_GET['doaction'] ) and 'edit' == $_GET['doaction'] and isset( $_GET['location_id'] ) ) {
	$location_obj = $location_obj->fetch( array( array( 'location_id', '=', intval( wp_unslash( $_GET['location_id'] ) ) ) ) );
	$data         = (array) $location_obj[0];
	$current_user = wp_get_current_user();

	$permission = apply_filters( 'wpgmp_location_update_permission', true, $_GET['page'], $current_user );

	if ( !current_user_can('administrator') && get_current_user_id() !== (int) $data['location_author'] && $permission ) {
	    wp_die( 'You are not allowed to save changes!' ); 
	}
	
} elseif ( ! isset( $_GET['doaction'] ) and isset( $response['success'] ) ) {
	// Reset $_POST object for antoher entry.
	unset( $data );
}


$form = new WPGMP_Template();
$form->set_header( esc_html__( 'Location Information', 'wp-google-map-plugin' ), $response, $enable = true, esc_html__( 'Manage Locations', 'wp-google-map-plugin' ), 'wpgmp_manage_location' );

if ( (!isset($wpgmp_settings['wpgmp_api_key']) || $wpgmp_settings['wpgmp_api_key'] == '') && $wpgmp_settings['wpgmp_map_source'] != 'openstreet' ) {

	$link = '<a target="_blank" href="https://www.wpmapspro.com/docs/get-a-google-maps-api-key/">'.esc_html__("create google maps api key","wp-google-map-plugin").'</a>';
	$setting_link = '<a target="_blank" href="' . admin_url( 'admin.php?page=wpgmp_manage_settings' ) . '">'.esc_html__("here","wp-google-map-plugin").'</a>';

	$form->add_element(
		'message', 'wpgmp_key_required', array(
			'value'  => sprintf( esc_html__( 'Google Maps API Key is missing. Follow instructions to %1$s and then insert your key %2$s.', 'wp-google-map-plugin' ), $link, $setting_link ),
			'class'  => 'fc-alert fc-alert-danger',
			'before' => '<div class="fc-12 wpgmp_key_required">',
			'after'  => '</div>',
		)
	);

}

$form->add_element(
	'group', 'location_info', array(
		'value'  => esc_html__( 'Location Information', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/create-a-location-using-simple-method/'
	)
);

$form->add_element(
	'text', 'location_title', array(
		'label'       => esc_html__( 'Location Title', 'wp-google-map-plugin' ),
		'value'       => ( isset( $data['location_title'] ) and ! empty( $data['location_title'] ) ) ? $data['location_title'] : '',
		'required'    => true,
		'placeholder' => esc_html__( 'Enter Location Title', 'wp-google-map-plugin' ),
	)
);

$form->add_element(
	'text', 'location_address', array(
		'label'       => esc_html__( 'Location Address', 'wp-google-map-plugin' ),
		'value'       => ( isset( $data['location_address'] ) and ! empty( $data['location_address'] ) ) ? $data['location_address'] : '',
		'desc'        => esc_html__( 'Enter the location address here. The auto-suggest feature will help you', 'wp-google-map-plugin' ),
		'required'    => true,
		'class'       => 'form-control wpgmp_auto_suggest',
		'id'		=> 'wpgmp_auto_suggest',
		'placeholder' => esc_html__( 'Type Location Address', 'wp-google-map-plugin' ),
	)
);
$form->set_col( 2 );
$form->add_element(
	'text', 'location_latitude', array(
		'label'       => esc_html__( 'Latitude and Longitude', 'wp-google-map-plugin' ),
		'value'       => ( isset( $data['location_latitude'] ) and ! empty( $data['location_latitude'] ) ) ? $data['location_latitude'] : '',
		'id'          => 'googlemap_latitude',
		'class'       => 'google_latitude form-control',
		'placeholder' => esc_html__( 'Latitude', 'wp-google-map-plugin' ),
		'before'      => '<div class="fc-3">',
		'after'       => '</div>',
	)
);
$form->add_element(
	'text', 'location_longitude', array(
		'value'       => ( isset( $data['location_longitude'] ) and ! empty( $data['location_longitude'] ) ) ? $data['location_longitude'] : '',
		'id'          => 'googlemap_longitude',
		'class'       => 'google_longitude form-control',
		'placeholder' => esc_html__( 'Longitude', 'wp-google-map-plugin' ),
		'before'      => '<div class="fc-3">',
		'after'       => '</div>',
	)
);
$form->add_element(
	'text', 'location_city', array(
		'label'       => esc_html__( 'City & State', 'wp-google-map-plugin' ),
		'value'       => ( isset( $data['location_city'] ) and ! empty( $data['location_city'] ) ) ? $data['location_city'] : '',
		'id'          => 'googlemap_city',
		'class'       => 'google_city form-control',
		'placeholder' => esc_html__( 'City', 'wp-google-map-plugin' ),
		'before'      => '<div class="fc-3">',
		'after'       => '</div>',
	)
);
$form->add_element(
	'text', 'location_state', array(
		'value'       => ( isset( $data['location_state'] ) and ! empty( $data['location_state'] ) ) ? $data['location_state'] : '',
		'id'          => 'googlemap_state',
		'class'       => 'google_state form-control',
		'placeholder' => esc_html__( 'State', 'wp-google-map-plugin' ),
		'before'      => '<div class="fc-3">',
		'after'       => '</div>',
	)
);
$form->add_element(
	'text', 'location_country', array(
		'label'       => esc_html__( 'Country & Postal Code', 'wp-google-map-plugin' ),
		'value'       => ( isset( $data['location_country'] ) and ! empty( $data['location_country'] ) ) ? $data['location_country'] : '',
		'id'          => 'googlemap_country',
		'class'       => 'google_country form-control',
		'placeholder' => esc_html__( 'Country', 'wp-google-map-plugin' ),
		'before'      => '<div class="fc-3">',
		'after'       => '</div>',
	)
);
$form->add_element(
	'text', 'location_postal_code', array(
		'value'       => ( isset( $data['location_postal_code'] ) and ! empty( $data['location_postal_code'] ) ) ? $data['location_postal_code'] : '',
		'id'          => 'googlemap_postal_code',
		'class'       => 'google_postal_code form-control',
		'placeholder' => esc_html__( 'Postal Code', 'wp-google-map-plugin' ),
		'before'      => '<div class="fc-3">',
		'after'       => '</div>',
	)
);
$form->set_col( 1 );
$form->add_element(
	'div', 'wpgmp_map', array(
		'label' => esc_html__( 'Current Location', 'wp-google-map-plugin' ),
		'id'    => 'wpgmp_map',
		'style' => array(
			'width'  => '100%',
			'height' => '300px',
		),
	)
);


$form->add_element(
	'radio', 'location_settings[onclick]', array(
		'label'           => esc_html__( 'On Click', 'wp-google-map-plugin' ),
		'radio-val-label' => array(
			'marker'      => esc_html__( 'Display Infowindow', 'wp-google-map-plugin' ),
			'custom_link' => esc_html__( 'Redirect', 'wp-google-map-plugin' ),
		),
		'current'         => isset( $data['location_settings']['onclick'] ) ? $data['location_settings']['onclick'] : '',
		'class'           => 'chkbox_class switch_onoff',
		'default_value'   => 'marker',
		'data'            => array( 'target' => '.wpgmp_location_onclick' ),
	)
);


$form->add_element(
	'textarea', 'location_messages', array(
		'label'         => esc_html__( 'Infowindow Message', 'wp-google-map-plugin' ),
		'value'         => ( isset( $data['location_messages'] ) and ! empty( $data['location_messages'] ) ) ? $data['location_messages'] : '',
		'placeholder'          => esc_html__( 'Enter the marker infoWindow message for the location you are creating.', 'wp-google-map-plugin' ),
		'desc'   => esc_html__( 'Enter the marker infoWindow message for the location you are creating. You can enter plain text as well as HTML.', 'wp-google-map-plugin' ),
		'textarea_rows' => 10,
		'textarea_name' => 'location_messages',
		'class'         => 'form-control wpgmp_location_onclick wpgmp_location_onclick_marker',
		'id'            => 'googlemap_infomessage',
		'show'          => 'false',
	)
);

$form->add_element(
	'text', 'location_settings[redirect_link]', array(
		'label'  => esc_html__( 'Redirect Url', 'wp-google-map-plugin' ),
		'value'  => isset( $data['location_settings']['redirect_link'] ) ? $data['location_settings']['redirect_link'] : '',
		'desc'   => esc_html__( 'Enter the redirect url here. For e.g https://weplugins.com Site visitors will be redirected to this url when the marker icon is clicked', 'wp-google-map-plugin' ),
		'placeholder'   => esc_html__( 'Enter the redirect url for the marker when its clicked.', 'wp-google-map-plugin' ),
		'class'  => 'wpgmp_location_onclick_custom_link wpgmp_location_onclick form-control',
		'before' => '<div class="fc-6">',
		'after'  => '</div>',
		'show'   => 'false',
	)
);

$form->add_element(
	'select', 'location_settings[redirect_link_window]', array(
		'options' => array(
			'yes' => esc_html__( 'YES', 'wp-google-map-plugin' ),
			'no'  => esc_html__( 'NO', 'wp-google-map-plugin' ),
		),
		'label'   => esc_html__( 'Open in new tab', 'wp-google-map-plugin' ),
		'current' => isset( $data['location_settings']['redirect_link_window'] ) ? $data['location_settings']['redirect_link_window'] : '',
		'desc'    => esc_html__( 'Open a new window tab.', 'wp-google-map-plugin' ),
		'class'   => 'wpgmp_location_onclick_custom_link wpgmp_location_onclick form-control',
		'before'  => '<div class="fc-6">',
		'after'   => '</div>',
		'show'    => 'false',
	)
);

$form->add_element(
	'image_picker', 'location_settings[featured_image]', array(
		'label'         => esc_html__( 'Location Image', 'wp-google-map-plugin' ),
		'src'           => isset( $data['location_settings']['featured_image'] ) ? wp_unslash( $data['location_settings']['featured_image'] ) : '',
		'required'      => false,
		'choose_button' => esc_html__( 'Choose', 'wp-google-map-plugin' ),
		'remove_button' => esc_html__( 'Remove', 'wp-google-map-plugin' ),
		'id' => 'loc_img',
	)
);



$form->add_element(
	'checkbox', 'location_settings[hide_infowindow]', array(
		'label'   => esc_html__( 'Disable Infowindow', 'wp-google-map-plugin' ),
		'value'   => 'false',
		'id'      => 'location_settings',
		'current' => isset( $data['location_settings']['hide_infowindow'] ) ? $data['location_settings']['hide_infowindow'] : '',
		'desc'    => esc_html__( 'Do you want to disable infowindow for this location?', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);
$form->add_element(
	'checkbox', 'location_infowindow_default_open', array(
		'label'   => esc_html__( 'Infowindow Default Open', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'location_infowindow_default_open',
		'current' => isset( $data['location_infowindow_default_open'] ) ? $data['location_infowindow_default_open'] : '',
		'desc'    => esc_html__( 'Check to enable infowindow default open.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
		'pro' => true,
	)
);
$form->add_element(
	'checkbox', 'location_draggable', array(
		'label'   => esc_html__( 'Marker Draggable', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'id'      => 'location_draggable',
		'current' => isset( $data['location_draggable'] ) ? $data['location_draggable'] : '',
		'desc'    => esc_html__( 'Check if you want to allow visitors to drag the marker.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
		'pro' => true,
	)
);
$form->add_element(
	'select', 'location_animation', array(
		'label'   => esc_html__( 'Marker Animation', 'wp-google-map-plugin' ),
		'current' => ( isset( $data['location_animation'] ) and ! empty( $data['location_animation'] ) ) ? $data['location_animation'] : '',
		'options' => array(
			''		  => esc_html__( 'Please Select', 'wp-google-map-plugin' ),
			'BOUNCE1' => esc_html__( 'BOUNCE', 'wp-google-map-plugin' ),
			'DROP'    => esc_html__( 'DROP', 'wp-google-map-plugin' ),
		),
		'before'  => '<div class="fc-6">',
		'after'   => '</div>',
		'pro' => true,
	)
);
$form->add_element(
	'group', 'location_extra_fields', array(
		'value'  => esc_html__( 'Extra Fields Values', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-create-extra-fields-for-location-infowindow-2/',
		'pro' => true,
	)
);

$form->add_element(
	'html',
	'location_extra_fields_msg',
	array(
		'html' => WPGMP_Helper::wpgmp_instructions('extra_fields'),
		'show'  => 'true',
		'before' => '<div class="fc-7">',
		'after'  => '</div>',
	)
);

$form->add_element(
	'group', 'marker_category_listing', array(
		'value'  => esc_html__( 'Apply Marker Category', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-assign-multiple-categories-to-a-single-locaton/'
	)
);

if ( ! empty( $all_categories ) ) {
	$category_data        = array();
	$parent_category_data = array();
	if ( ! isset( $data['location_group_map'] ) ) {
		$data['location_group_map'] = array(); }

	foreach ( $categories as $category ) {
		if ( is_null( $category->group_parent ) or 0 == $category->group_parent ) {
			$parent_category_data = ' ---- ';
		} else {
			if(isset($all_categories[ $category->group_parent ]))
			$parent_category_data = $all_categories[ $category->group_parent ]->group_map_title;
		}
		if ( '' != $category->group_marker ) {
			$icon_src = "<img width='32px' src='" . $category->group_marker . "' />";
		} else {
			$icon_src = "<img width='32px' src='" . WPGMP_Helper::wpgmp_default_marker_icon()."' />";

		}
		$select_input    = $form->field_checkbox(
			'location_group_map[]', array(
				'value'   => $category->group_map_id,
				'current' => (is_array($data['location_group_map']) && in_array( $category->group_map_id, $data['location_group_map'] ) ? $category->group_map_id : '' ),
				'class'   => 'fc-form-check-input chkbox_class',
				'before'  => '<div class="fc-1">',
				'after'   => '</div>',
			)
		);
		$category_data[] = array( $select_input, $category->group_map_title, $parent_category_data, $icon_src );
	}
	$category_data = $form->add_element(
		'table', 'location_group_map_listing', array(
			'heading' => array( esc_html__('Select', 'wp-google-map-plugin'), esc_html__('Category', 'wp-google-map-plugin'), esc_html__('Parent', 'wp-google-map-plugin'), esc_html__('Icon', 'wp-google-map-plugin') ),
			'data'    => $category_data,
			'class'   => 'fc-table fc-table-layout3',
			'before'  => '<div class="fc-12">',
			'id' => 'wpgmp_assign_category_tbl',
			'after'   => '</div>',
		)
	);
} else {
	
	$add_marker_category = '<a target="_blank" href="' . admin_url( 'admin.php?page=wpgmp_form_group_map' ) . '">'.esc_html__('here','wp-google-map-plugin').'</a>';
	 	
	$form->add_element(
		'message', 'no_marker_category_message', array(
			'value'  => sprintf( esc_html__( 'You don\'t have marker categories right now. You can create marker categories from %1$s', 'wp-google-map-plugin' ), $add_marker_category ),
			'class'  => 'fc-alert fc-alert-danger',
			'before' => '<div class="fc-12">',
			'after'  => '</div>',
		)
	);
}

$form->add_element(
	'extensions', 'wpgmp_location_form', array(
		'value'  => isset( $data['location_settings']['extensions_fields'] ) ? $data['location_settings']['extensions_fields'] : '',
		'before' => '<div class="fc-11">',
		'after'  => '</div>',
	)
);

$form->add_element(
	'submit', 'save_entity_data', array(
		'value' => esc_html__( 'Save Location', 'wp-google-map-plugin' ),
	)
);

$form->add_element(
	'hidden', 'location_group_map', array(
		'value' => '',
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
			'value' => intval( wp_unslash( $_GET['location_id'] ) ),
		)
	);
}
$form->render();
$infowindow_message = ( isset( $data['location_messages'] ) and ! empty( $data['location_messages'] ) ) ? $data['location_messages'] : '';
$infowindow_disable = ( isset( $data['location_settings'] ) and ! empty( $data['location_settings'] ) ) ? $data['location_settings'] : '';

$category = new stdClass();

if ( isset( $_GET['group_map_id'] ) ) {

	$category_obj       = $category_obj->get( array( array( 'group_map_id', '=', intval( wp_unslash( $_GET['group_map_id'] ) ) ) ) );

	$category           = (array) $category_obj[0];

}


if ( ! empty( $category->group_marker ) ) {
	$category_group_marker = $category->group_marker;
} else {
	$category_group_marker = WPGMP_Helper::wpgmp_default_marker_icon();
}
$map_data['map_options'] = array(
	'center_lat' => ( isset( $data['location_latitude'] ) and ! empty( $data['location_latitude'] ) ) ? $data['location_latitude'] : '',
	'center_lng' => ( isset( $data['location_longitude'] ) and ! empty( $data['location_longitude'] ) ) ? $data['location_longitude'] : '',
);
$map_data['places'][]    = array(
	'id'         => ( isset( $data['location_id'] ) and ! empty( $data['location_id'] ) ) ? $data['location_id'] : '',
	'title'      => ( isset( $data['location_title'] ) and ! empty( $data['location_title'] ) ) ? $data['location_title'] : '',
	'content'    => $infowindow_message,
	'location'   => array(
		'icon'                    => ( $category_group_marker ),
		'lat'                     => ( isset( $data['location_latitude'] ) and ! empty( $data['location_latitude'] ) ) ? $data['location_latitude'] : '',
		'lng'                     => ( isset( $data['location_longitude'] ) and ! empty( $data['location_longitude'] ) ) ? $data['location_longitude'] : '',
		'draggable'               => true,
		'infowindow_default_open' => ( isset( $data['location_infowindow_default_open'] ) and ! empty( $data['location_infowindow_default_open'] ) ) ? $data['location_infowindow_default_open'] : '',
		'animation'               => ( isset( $data['location_animation'] ) and ! empty( $data['location_animation'] ) ) ? $data['location_animation'] : '',
		'infowindow_disable'      => ( isset( $infowindow_disable['hide_infowindow'] ) && 'false' === $infowindow_disable['hide_infowindow'] ),
	),
	'categories' => array(
		array(
			'id'   => isset( $category->group_map_id ) ? $category->group_map_id : '',
			'name' => isset( $category->group_map_title ) ? $category->group_map_title : '',
			'type' => 'category',
			'icon' => $category_group_marker,
		),
	),
);
$map_data['page']        = 'edit_location';
$map_data['provider'] = WPGMP_Helper::wpgmp_get_map_provider();
$map_data['map_options']['tiles_provider'] = WPGMP_Helper::wpgmp_get_leaflet_provider();
$map_data['map_property'] = array('map_id' => 1);
$map_data['map_options']['marker_default_icon'] = WPGMP_Helper::wpgmp_default_marker_icon();
?>
<script type="text/javascript">
document.addEventListener("wpgmpReady", function () {
  jQuery(document).ready(function($) {
	var map = $("#wpgmp_map").maps("<?php echo base64_encode(wp_json_encode( $map_data )); ?>").data('wpgmp_maps');
	});

});
</script>