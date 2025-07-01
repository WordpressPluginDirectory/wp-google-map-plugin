<?php
/**
 * This class used to manage permissions in backend.
 *
 * @author Flipper Code <hello@flippercode.com>
 * @version 1.0.0
 * @package Maps
 */

global $wp_roles;
$wpgmp_roles = $wp_roles->get_names();
unset( $wpgmp_roles['administrator'] );
$wpgmp_permissions = array(
	'wpgmp_admin_overview'   => esc_html__( 'Map Overview', 'wp-google-map-plugin' ),
	'wpgmp_form_location'    => esc_html__( 'Add Locations', 'wp-google-map-plugin' ),
	'wpgmp_manage_location'  => esc_html__( 'Manage Locations', 'wp-google-map-plugin' ),
	'wpgmp_import_location'  => esc_html__( 'Import Locations', 'wp-google-map-plugin' ),
	'wpgmp_form_map'         => esc_html__( 'Create Map', 'wp-google-map-plugin' ),
	'wpgmp_manage_map'       => esc_html__( 'Manage Map', 'wp-google-map-plugin' ),
	'wpgmp_manage_drawing'   => esc_html__( 'Drawing', 'wp-google-map-plugin' ),
	'wpgmp_form_group_map'   => esc_html__( 'Add Marker Category', 'wp-google-map-plugin' ),
	'wpgmp_manage_group_map' => esc_html__( 'Manage Marker Category', 'wp-google-map-plugin' ),
	'wpgmp_form_route'       => esc_html__( 'Add Route', 'wp-google-map-plugin' ),
	'wpgmp_manage_route'     => esc_html__( 'Manage Routes', 'wp-google-map-plugin' ),
	'wpgmp_settings'         => esc_html__( 'Settings', 'wp-google-map-plugin' ),
);

$form = new WPGMP_Template();
$form->set_header( esc_html__( 'Manage Permission(s)', 'wp-google-map-plugin' ), $response, $enable = false );

$form->add_element(
	'group', 'manage_permissions', array(
		'value'  => esc_html__( 'Manage Permission(s)', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-assign-permission-to-your-users/',
		'pro' => true
	)
);

if ( ! empty( $wpgmp_permissions ) ) {
	$count = 0;
	foreach ( $wpgmp_permissions as $wpgmp_mkey => $wpgmp_mvalue ) {
		$permission_row[ $count ][0] = $wpgmp_mvalue;
		foreach ( $wpgmp_roles as $wpgmp_role_key => $wpgmp_role_value ) {
			$urole                      = get_role( $wpgmp_role_key );
			$permission_row[ $count ][] = $form->field_checkbox(
				'wpgmp_map_permissions[' . $wpgmp_role_key . '][' . $wpgmp_mkey . ']', array(
					'value'   => 'true',
					'current' => ( ( @array_key_exists( $wpgmp_mkey, $urole->capabilities ) == true ) ? 'true' : 'false' ),
					'before'  => '<div class="fc-1">',
					'after'   => '</div>',
					'class'   => 'fc-form-check-input chkbox_class',
				)
			);
		}
		$count++;
	}
}
$form->add_element(
	'table', 'wpgmp_save_permission_table', array(
		'heading' => array_merge( array( 'Page' ), $wpgmp_roles ),
		'data'    => $permission_row,
		'before'  => '<div class="fc-12">',
		'after'   => '</div>',
	)
);

$form->add_element(
	'submit', 'wpgmp_save_permission', array(
		'value' => esc_html__( 'Save Permissions', 'wp-google-map-plugin' ),
		'pro' => true,
	)
);

$form->add_element(
	'hidden', 'operation', array(
		'value' => 'save',
	)
);

$form->render();

