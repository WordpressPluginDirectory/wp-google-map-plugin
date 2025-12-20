<?php
/**
 * WPGMP_Google_Map_Widget_Class File.
 *
 * @author Flipper Code <hello@flippercode.com>
 * @package CORE
 */

if ( ! class_exists( 'WPGMP_Google_Map_Widget_Class' ) ) {

	/**
	 * Initilize google map widget.
	 *
	 * @author Flipper Code <hello@flippercode.com>
	 * @version 3.0.0
	 * @package Maps
	 */
	class WPGMP_Google_Map_Widget_Class extends WP_Widget {
		/**
		 * Initlize parent constructer.
		 */
		public function __construct() {

			parent::__construct(
				'WPGMP_Google_Map_Widget_Class',
				'WP Maps Pro',
				array( 'description' => esc_html__( 'A widget to display google maps', 'wp-google-map-plugin' ) )
			);
		}
		/**
		 * Display widget at frontend.
		 *
		 * @param  array $args     Widget Arguments.
		 * @param  int   $instance Instance of Widget.
		 */
		function widget( $args, $instance ) {

			global $wpdb, $map;
			
			// Don't use extract() - access array elements directly
			$before_widget = $args['before_widget'] ?? '';
			$after_widget = $args['after_widget'] ?? '';
			$before_title = $args['before_title'] ?? '';
			$after_title = $args['after_title'] ?? '';
			
			// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals
			$map_id    = apply_filters( 'widget_title', empty( $instance['map_id'] ) ? '' : $instance['map_id'], $instance, $this->id_base );
			$map_title = apply_filters( 'widget_text', empty( $instance['map_title'] ) ? '' : $instance['map_title'], $instance );
			// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals

			// Escape all widget output
			echo wp_kses_post( $before_widget );
			
			if ( ! empty( $map_title ) ) {
				echo wp_kses_post( $before_title ) . esc_html( $map_title ) . wp_kses_post( $after_title );
			}

			if ( ! empty( $map_id ) ) {
				// do_shortcode is safe, but ensure map_id is numeric
				$safe_map_id = absint( $map_id );
				echo do_shortcode( '[put_wpgm id=' . $safe_map_id . ']' );
			}
			
			echo wp_kses_post( $after_widget );
		}
		/**
		 * Update widget options.
		 *
		 * @param  array $new_instance New Options values.
		 * @param  array $old_instance Old Options values.
		 * @return array               Modified Options values.
		 */
		function update( $new_instance, $old_instance ) {

			$instance              = $old_instance;
			$instance['map_title'] = wp_strip_all_tags( $new_instance['map_title'] );
			$instance['map_id']    = wp_strip_all_tags( $new_instance['map_id'] );
			return $instance;
		}
		/**
		 * Backend Widget Form.
		 *
		 * @param  array $instance Widget options values.
		 */
		function form( $instance ) {

			global $wpdb,$map;
			$map_records = $wpdb->get_results( 'SELECT map_id,map_title FROM ' . TBL_MAP . '' );// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared

			if ( ! isset( $instance['map_title'] ) ) {
				$instance['map_title'] = '';
			}

			if ( ! isset( $instance['map_id'] ) ) {
				$instance['map_id'] = '';
			}
			?>
			<p>
				<label for="<?php echo esc_html( $this->get_field_id( 'map_title' ) ); ?>">
					<?php esc_html_e( 'Title:', 'wp-google-map-plugin' ); ?>
				</label>
				<input type="text" value="<?php echo esc_html($instance['map_title']); ?>" name="<?php echo esc_html( $this->get_field_name( 'map_title' ) ); ?>" class="widefat" style="margin-top:6px;">
			</p>
			<p>
				<label for="<?php echo esc_html($this->get_field_id( 'map_id' )); ?>">
					<?php esc_html_e( 'Select Your Map:', 'wp-google-map-plugin' ); ?>
				</label>
				<select id="<?php echo esc_html($this->get_field_id( 'map_id' )); ?>" name="<?php echo esc_attr( $this->get_field_name( 'map_id' ) ); ?>" class="widefat" style="margin-top:6px;">
				<option value=""><?php esc_html_e( 'Select map', 'wp-google-map-plugin' ); ?></option>
				<?php
				if ( ! empty( $map_records ) ) {
					foreach ( $map_records as $key => $map_record ) {
						?>
						<option value="<?php echo esc_html($map_record->map_id); ?>"<?php selected( $map_record->map_id, $instance['map_id'] ); ?>><?php echo esc_html( $map_record->map_title ); ?></option>
						<?php
					}
				}
				?>
				</select>
			</p>
			<?php
		}
	}
}
