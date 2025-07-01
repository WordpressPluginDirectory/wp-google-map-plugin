<?php
/**
 * This class used to manage settings page in backend.
 *
 * @author Flipper Code <hello@flippercode.com>
 * @version 1.0.0
 * @package Maps
 */

$form = new WPGMP_Template();

$wpgmp_settings = 	maybe_unserialize( get_option( 'wpgmp_settings' ) );

$show_notifications = true;
if( isset( $wpgmp_settings['wpgmp_hide_notification']) &&  $wpgmp_settings['wpgmp_hide_notification'] == 'true') {
    $show_notifications = false;
}

ob_start(); // Start output buffering
?>

<section class="fc-section">
    <div class="fc-card fc-card-feature">
        <div class="fc-card-body">

            <div class="fc-feature-widget-header">
                <div class="fc-d-flex fc-align-items-center fc-gap-15">
                    <img src='<?php echo esc_url( WPGMP_IMAGES ); ?>/dashboard-icons/icon-diamond.svg' alt="logo">
                    <h4 class="fc-card-title fc-text-white"><?php esc_html_e( 'Try the Pro Version Free for 14 Days!', 'wp-google-map-plugin' ); ?></h4>
                </div>
                <div class="fc-btn-wrapper">
                    <a href="https://www.wpmapspro.com/examples/" target="_blank" class="fc-btn fc-btn-light">
                        <span><?php esc_html_e( 'View Demo', 'wp-google-map-plugin' ); ?></span>
</a>
                    <a href="https://www.wpmapspro.com/pricing/" target="_blank" class="fc-btn fc-btn-success">
                        <i class="wep-icon-crown wep-icon-xl"></i>
                        <span><?php esc_html_e( 'Buy Now', 'wp-google-map-plugin' ); ?></span>
</a>
                </div>
            </div>

            <div class="fc-feature-widget-list">
            <?php
                $features = [
                    [
                        'title' => __( 'Listing', 'wp-google-map-plugin' ),
                        'desc'  => __( 'Display a beautiful, searchable listing of your map locations below the map.', 'wp-google-map-plugin' ),
                        'icon'  => 'wep-icon-list'
                    ],
                    [
                        'title' => __( 'Drawing', 'wp-google-map-plugin' ),
                        'desc'  => __( 'Draw and highlight areas using polygons, circles, or rectangles on your map.', 'wp-google-map-plugin' ),
                        'icon'  => 'wep-icon-ruler'
                    ],
                    [
                        'title' => __( 'Posts/Pages/Custom Post Types', 'wp-google-map-plugin' ),
                        'desc'  => __( 'Automatically display locations based on WordPress posts or custom post types.', 'wp-google-map-plugin' ),
                        'icon'  => 'wep-icon-book'
                    ],
                    [
                        'title' => __( 'Custom Filters', 'wp-google-map-plugin' ),
                        'desc'  => __( 'Allow users to filter markers and listings by categories, tags, or custom fields.', 'wp-google-map-plugin' ),
                        'icon'  => 'wep-icon-filter'
                    ],
                    [
                        'title' => __( 'Geo Tags', 'wp-google-map-plugin' ),
                        'desc'  => __( 'Assign geo-coordinates to posts and display them automatically on the map. ACF Supported.', 'wp-google-map-plugin' ),
                        'icon'  => 'wep-icon-gps'
                    ],
                    [
                        'title' => __( '18+ Add-ons', 'wp-google-map-plugin' ),
                        'desc'  => __( 'Extend functionality with 18+ powerful add-ons, including integrations with Airtable, Excel, CSV, and more.', 'wp-google-map-plugin' ),
                        'icon'  => 'wep-icon-wallet'
                    ]
                    
                ];

                foreach ( $features as $feature ) : ?>
                    <div class="fc-feature-widget">
                        <div class="fc-avatar fc-size-70">
                            <i class=' wep-icon-2x <?php echo esc_attr($feature['icon']); ?>'></i>
                        </div>
                        <div class="fc-feature-widget-info">
                            <h5 class="title"><?php echo esc_html( $feature['title'] ); ?></h5>
                            <div class="description"><?php echo esc_html( $feature['desc'] ); ?></div>
                        </div>
                    </div>
                <?php endforeach; ?>

            </div>

            <div class="fc-mt-30">
                <a href="https://www.wpmapspro.com/try-now" target="_blank" rel="noopener noreferrer" class="fc-d-flex fc-align-items-center">
                    <span><?php esc_html_e( 'View All Features', 'wp-google-map-plugin' ); ?></span>
                    
                    <i class="wep-icon-long-arrow-right"></i>
                </a>
            </div>
        </div>
    </div>
</section>

<section class="fc-section">
    <div class="fc-row">
    <div class="<?php echo $show_notifications ? 'fc-col-xl-9' : 'fc-col-xl-12'; ?>">
    <div class="fc-row">
                <div class="fc-col-md-6">
                    <div class="fc-card fc-card-full-height">
                        <div class="fc-card-header">
                            <div class="fc-card-heading">
                                <img src='<?php echo esc_url( WPGMP_IMAGES ); ?>/dashboard-icons/icon-book.svg' alt="logo">
                                <h4 class="fc-card-title"><?php esc_html_e( 'Getting Started Guide', 'wp-google-map-plugin' ); ?></h4>
                            </div>
                        </div>
                        <div class="fc-card-body">
                            <div class="fc-d-flex fc-gap-10">
                                <div>
                                    <div class="fc-mb-15">
                                        <h5 class="fc-card-title"><?php esc_html_e( 'WP MAPS', 'wp-google-map-plugin' ); ?></h5>
                                        <div class="fc-font-14"><?php esc_html_e( 'Installed Version:', 'wp-google-map-plugin' ); ?> <?php echo WPGMP_VERSION; ?></div>
                                    </div>
                                    <div class="fc-card-text">
                                        <?php esc_html_e( 'For each of our plugins, we have created step by step detailed tutorials that help you to get started quickly.', 'wp-google-map-plugin' ); ?>
                                    </div>
                                    <div class="fc-btn-wrapper">
                                        <a href="https://www.wpmapspro.com/tutorials/" target="_blank" class="fc-btn fc-btn-primary"><?php esc_html_e( 'Start Now', 'wp-google-map-plugin' ); ?></a>
                                    </div>
                                </div>
                                <div class="fc-flex-shrink-0">
                                    <img class="fc-max-w-200" src='<?php echo esc_url( WPGMP_IMAGES ); ?>/graphics/graphic-1.svg' alt="Graphics">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="fc-col-md-6">
                    <div class="fc-card fc-card-full-height">
                        <div class="fc-card-header">
                            <div class="fc-card-heading">
                                <img src='<?php echo esc_url( WPGMP_IMAGES ); ?>/dashboard-icons/icon-megaphone.svg' alt="logo">
                                <h4 class="fc-card-title"><?php esc_html_e( 'Subscribe Now', 'wp-google-map-plugin' ); ?></h4>
                            </div>
                        </div>
                        <div class="fc-card-body">
                            <div class="fc-d-flex fc-gap-10 fc-mb-20">
                                <div>
                                    <div class="fc-card-text">
                                        <?php esc_html_e( 'Receive updates on our new product features and new products effortlessly.', 'wp-google-map-plugin' ); ?>
                                    </div>
                                    <div>
                                        <h5 class="fc-card-title"><?php esc_html_e( 'We will not share your email addresses in any case.', 'wp-google-map-plugin' ); ?></h5>
                                    </div>
                                </div>
                                <div class="fc-flex-shrink-0">
                                    <img class="fc-max-w-200" src='<?php echo esc_url( WPGMP_IMAGES ); ?>/graphics/graphic-2.svg' alt="Graphics">
                                </div>
                            </div>
                            
                            <div class="fc-d-flex fc-gap-5">
                                <input 
                                    type="email" 
                                    name="EMAIL" 
                                    value="<?php echo esc_attr( get_bloginfo( 'admin_email' ) ); ?>" 
                                    class="email fc-form-control fc-flex-1" 
                                    id="mce-EMAIL" 
                                    placeholder="<?php esc_attr_e( 'name@example.com', 'wp-google-map-plugin' ); ?>" 
                                    required
                                >

                                <button onclick="submitToMailchimp()"; class="fc-btn fc-btn-icon fc-btn-primary fc-btn-icon-lg">
                                    <i class="wep-icon-send"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="fc-col-md-6">
                    <div class="fc-card fc-card-full-height">
                        <div class="fc-card-header">
                            <div class="fc-card-heading">
                                <img src='<?php echo esc_url( WPGMP_IMAGES ); ?>/dashboard-icons/icon-user.svg' alt="logo">
                                <h4 class="fc-card-title"><?php esc_html_e( 'Hire WordPress Expert', 'wp-google-map-plugin' ); ?></h4>
                            </div>
                        </div>
                        <div class="fc-card-body">
                            <div class="fc-d-flex fc-gap-10">
                                <div>
                                    <div class="fc-mb-20">
                                        <h5 class="fc-card-title"><?php esc_html_e( 'Do you have a custom requirement which is missing in this plugin?', 'wp-google-map-plugin' ); ?></h5>
                                    </div>
                                    <div class="fc-card-text">
                                        <?php esc_html_e( 'We can customize this plugin according to your needs. Click below button to send a quotation request.', 'wp-google-map-plugin' ); ?>
                                    </div>
                                    <div class="fc-btn-wrapper">
                                        <a href="https://weplugins.com/request-a-quote/" target="_blank" class="fc-btn fc-btn-primary"><?php esc_html_e( 'Request a Quotation', 'wp-google-map-plugin' ); ?></a>
                                    </div>
                                </div>
                                <div class="fc-flex-shrink-0">
                                    <img class="fc-max-w-200" src='<?php echo esc_url( WPGMP_IMAGES ); ?>/graphics/graphic-3.svg' alt="Graphics">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="fc-col-md-6">
                    <div class="fc-card fc-card-full-height">
                        <div class="fc-card-header">
                            <div class="fc-card-heading">
                                <img src='<?php echo esc_url( WPGMP_IMAGES ); ?>/dashboard-icons/icon-ticket.svg' alt="logo">
                                <h4 class="fc-card-title"><?php esc_html_e( 'Create Support Ticket', 'wp-google-map-plugin' ); ?></h4>
                            </div>
                        </div>
                        <div class="fc-card-body">
                            <div class="fc-d-flex fc-gap-10">
                                <div>
                                    <div class="fc-mb-20">
                                        <h5 class="fc-card-title"><?php esc_html_e( 'Do you have any Question?', 'wp-google-map-plugin' ); ?></h5>
                                    </div>
                                    <div class="fc-card-text">
                                        <?php esc_html_e( 'If you have any question and need our help, click below button to create a support ticket and our support team will assist you asap.', 'wp-google-map-plugin' ); ?>
                                    </div>
                                    <div class="fc-btn-wrapper">
                                        <a href="https://weplugins.com/support" target="_blank" class="fc-btn fc-btn-primary"><?php esc_html_e( 'Create Ticket', 'wp-google-map-plugin' ); ?></a>
                                    </div>
                                </div>
                                <div class="fc-flex-shrink-0">
                                    <img class="fc-max-w-200" src='<?php echo esc_url( WPGMP_IMAGES ); ?>/graphics/graphic-4.svg' alt="Graphics">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <!-- Previous sections stay as-is -->

<?php if( $show_notifications == true ) : ?>
<div class="fc-col-xl-3">
    <div class="fc-card fc-card-full-height fc-card-notification">
        <div class="fc-card-header">
            <div class="fc-card-heading">
                <h4 class="fc-card-title"><?php esc_html_e( 'Notifications', 'wp-google-map-plugin' ); ?></h4>
            </div>
        </div>
        <div class="fc-card-body">
    <?php
    $saved_notifications = get_option('weplugins_notification', []);

    // Fallback/default notifications
    $default_notifications = [
        'Today' => [
            [
                'id' => 'static_1',
                'title' => __( '15+ New InfoWindow Designs', 'wp-google-map-plugin' ),
                'desc'  => __( 'You now have access to over 15 beautifully crafted InfoWindow layouts. Try them from the settings panel!', 'wp-google-map-plugin' ),
                'icon_class' => 'wep-icon-circle-info fc-text-primary'
            ],
            [
                'id' => 'static_2',
                'title' => __( 'Mapbox Integration Added', 'wp-google-map-plugin' ),
                'desc'  => __( 'Now you can use Mapbox as a map provider alongside Google Maps and OpenStreetMap.', 'wp-google-map-plugin' ),
                'icon_class' => 'wep-icon-circle-info fc-text-success'
            ]
        ],
        'Yesterday' => [
            [
                'id' => 'static_3',
                'title' => __( 'Hooks Documentation Published', 'wp-google-map-plugin' ),
                'desc'  => sprintf(
                    esc_html__( 'Explore our new developer docs covering filters and actions: %s', 'wp-google-map-plugin' ),
                    '<a href="https://www.wpmapspro.com/map-hooks/" target="_blank">' . esc_html__( 'View Docs', 'wp-google-map-plugin' ) . '</a>'
                ),
                'icon_class' => 'wep-icon-circle-info fc-text-warning'
            ],
            [
                'id' => 'static_4',
                'title' => __( 'New Version Released', 'wp-google-map-plugin' ),
                'desc'  => __( 'The plugin has been updated to version 6.0.0 with performance improvements and bug fixes.', 'wp-google-map-plugin' ),
                'icon_class' => 'wep-icon-circle-info fc-text-info'
            ]
        ]
    ];
    
    
    // Group notifications by Today, Yesterday, Earlier
    $notifications = [];

    if (!empty($saved_notifications) && is_array($saved_notifications)) {
        foreach ($saved_notifications as $item) {
            $date = isset($item['date']) ? strtotime($item['date']) : time();
            $day_key = 'Earlier';
            if (date('Y-m-d', $date) === date('Y-m-d')) {
                $day_key = 'Today';
            } elseif (date('Y-m-d', $date) === date('Y-m-d', strtotime('-1 day'))) {
                $day_key = 'Yesterday';
            }

            $notifications[$day_key][] = [
                'id' => $item['id'] ?? uniqid('notif_'),
                'title' => esc_html($item['title'] ?? ''),
                'desc' => wp_kses_post($item['desc'] ?? ''),
                'icon_class' => esc_attr($item['icon_class'] ?? 'wep-icon-circle-info fc-text-primary ')
            ];
        }
    } else {
        $notifications = $default_notifications;
    }

    // Output HTML
    foreach ($notifications as $day => $entries) {
        echo '<div class="fc-list">';
        echo '<div class="fc-list-header">' . esc_html($day) . '</div>';
        foreach ($entries as $note) {
            echo '<div class="fc-list-item" data-id="' . esc_attr($note['id']) . '">';
            echo '<div class="fc-notification">';
            echo '<div class="fc-notification-icon">';
            echo '<div class="' . esc_attr($note['icon_class']) . ' fc-text-primary wep-icon-xl"></div>';
            echo '</div>';
            echo '<div class="fc-notification-content">';
            echo '<h6 class="fc-notification-title">' . esc_html($note['title']) . '</h6>';
            echo '<div class="fc-notification-description">' . $note['desc'] . '</div>';
            echo '</div>';
            echo '</div>';
            echo '</div>';
        }
        echo '</div>';
    }
    ?>
        </div>
    </div>
</div>
<?php endif; ?>

    </div>
</section>
          
    
<?php
$html = ob_get_clean(); // Get contents and clean the buffer


$form->add_element(
	'html', 'gerenal_settings', array(
		'html' => $html,
		'before' => '<div class="fc-12">',
		'after' => '</div>')
);

$form->render();