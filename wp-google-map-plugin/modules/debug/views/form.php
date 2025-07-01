<?php

if ( isset( $_REQUEST['_wpnonce'] ) ) {
	$nonce = sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) );
	if ( ! wp_verify_nonce( $nonce, 'wpgmp-nonce' ) ) {
		die( 'Cheating...' );
	} else {
		if ( isset( $response['success'] ) ) {
			unset( $_POST );
		} else {
			$data = $_POST;
		}
	}
}


$form = new WPGMP_Template();

$form->set_header( esc_html__( 'Plugin Purchase Verification', 'wp-google-map-plugin' ), [] );

$form->form_id = 'wpgmp_enable_debug_form';

$form->form_class = 'fc_plugin_form';

$form->add_element(
	'group',
	'wpgmp_plugin_settings_group',
	array(
		'value'  => esc_html__( 'Verify Your Purchase', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
	)
);

$purchase_key_tutorial_link = '<a href="https://help.market.envato.com/hc/en-us/articles/202822600-Where-Is-My-Purchase-Code-" target="_blank">'.esc_html__( 'here', 'wp-google-map-plugin' ).'</a>';

$form->add_element(
	'message',
	'subscription_verification_notice',
	array(
		'value'  => esc_html__( 'In order to verify your purchase and provide you with access to the plugin, we kindly request that you provide us with your purchase key.', 'wp-google-map-plugin' ).sprintf( esc_html__( ' Click %1$s to know your purchase code.', 'wp-google-map-plugin' ), $purchase_key_tutorial_link),
		'class'  => 'fc-alert fc-alert-warning subscription_verification_notice',
		'show'   => 'true',
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
	)
);

$form->add_element(
	'text',
	'customer_purchase_key',
	array(
		'required' => 'true',
		'label'       => esc_html__( 'Codecanyon Purchase Code', 'wp-google-map-plugin' ),
		'id'          => 'customer_purchase_key',
		'value'       => '',
		'placeholder' => esc_html__( 'Please enter the plugin purchase code', 'wp-google-map-plugin' ),
		'class'       => 'form-control',
		'desc'        => esc_html__( 'Please enter the purchase code that you\'ve got from codecanyon.net.', 'wp-google-map-plugin' ).sprintf( esc_html__( ' Click %1$s to get know your purchase code.', 'wp-google-map-plugin' ), $purchase_key_tutorial_link),
	)
);

$form->add_element(
	'text',
	'wpgmp_customer_email_address',
	array(
		'label'       => esc_html__( 'Email Address (Optional)', 'wp-google-map-plugin' ),
		'id'          => 'wpgmp_customer_email_address',
		'value'       => get_option( 'admin_email' ),
		'placeholder' => esc_html__( 'Please enter your email address.', 'wp-google-map-plugin' ),
		'class'       => 'form-control',
		'desc'        => esc_html__( 'Please enter your email address for getting continous support from out team & to know more about new features.', 'wp-google-map-plugin' )
	)
);

$form->add_element(
	'checkbox', 'wpgmp_customer_info_consent', array(
		'label'   => esc_html__( 'Provide Consent', 'wp-google-map-plugin' ),
		'value'   => 'ok',
		'id'      => 'wpgmp_customer_info_consent',
		'desc'    => esc_html__( 'To verify your purchase & provide support, we require your purchase key & email address. By providing this information, you consent to us collecting and storing it securely.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);


$form->add_element( 'hidden', 'action', array( 'value' => 'fclicensecheck' ) );
$form->add_element( 'hidden', 'activity', array( 'value' => 'activate' ) );
$form->add_element( 'hidden', 'remote_addr', array( 'value' => $_SERVER['SERVER_ADDR'] ) );
$form->add_element( 'hidden', 'website_url', array( 'value' => site_url() ) );

$form->add_element(
	'submit',
	'verify_purchase',
	array(
		'value'  => __( 'Verify Purchase', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-2">',
		'after'  => '</div>',
	)
);

$form->render();
