<?php
/**
 * Security Class for WP Google Map Plugin
 * Handles validation, sanitization, and escaping of shortcode attributes
 * Using core WordPress functions.
 */

if ( ! class_exists( 'WPGMP_Security' ) ) {

    class WPGMP_Security {
    
        /**
         * Sanitize and validate shortcode attributes.
         * Replaces custom regex with WordPress's sanitize_key() and type-specific functions.
         *
         * @param array $atts Shortcode attributes.
         * @return array Sanitized and validated attributes.
         */
        public static function wpgmp_sanitize_shortcode_atts( $atts ) {

            // Return empty array if input is not an array
            if ( ! is_array( $atts ) ) {
                return array();
            }
            
            $sanitized = array();
            
            foreach ( $atts as $key => $value ) {

                // Validate/Sanitize the shortcode attribute NAME using WordPress's sanitize_key()
                $clean_key = sanitize_key( $key );
                
                if ( empty( $clean_key ) ) {
                    continue; // Skip if the key becomes empty after sanitization
                }
                
                // Validate or Sanitize the attribute VALUE based on its expected type
                switch ( $clean_key ) {
                    case 'id':
                    case 'limit':
                    case 'perpage':
                    case 'zoom':
                        // VALIDATION & SANITIZATION: Use absint() to convert to a non-negative integer.
                        $sanitized[ $clean_key ] = absint( $value );
                        break;
                        
                    case 'width':
                    case 'height':
                        // SANITIZATION: Delegate to a dedicated CSS sanitizer.
                        $sanitized[ $clean_key ] = self::wpgmp_sanitize_css_unit( $value );
                        break;
                        
                    case 'show_all_locations':
                    case 'hide_map':
                    case 'maps_only':
                        // SANITIZATION: Use a WordPress-aware boolean sanitizer.
                        $sanitized[ $clean_key ] = self::wpgmp_sanitize_boolean_value( $value );
                        break;
                        
                    case 'show':
                    case 'category':
                    default:
                        // SANITIZATION: For general text, use sanitize_text_field().
                        // This core function checks for invalid UTF-8, strips tags, and removes extra whitespace.
                        $sanitized[ $clean_key ] = sanitize_text_field( $value );
                        break;
                }
            }
            
            return $sanitized;
        }
        
        /**
         * Sanitize CSS units (width, height, etc.).
         * Uses sanitize_text_field() as a base and adds strict regex validation for units allowed by shortcode.
         *
         * @param string $value CSS value.
         * @return string Sanitized CSS value or empty string.
         */
        private static function wpgmp_sanitize_css_unit( $value ) {

            if ( empty( $value ) ) {
                return '';
            }
            
            // Initial sanitization by WordPress : Remove tags, invalid UTF-8, etc.
            $value = sanitize_text_field( $value );
            $value = trim( $value );
            
            // Once the received value is sanitised by WordPress, check for allowed pattern for CSS units by shortcode.
            $pattern = '/^(\d+(\.\d+)?)\s*(px|em|rem|%|vh|vw|vmin|vmax|cm|mm|in|pt|pc)?$/';
            
            if ( preg_match( $pattern, $value ) ) {
                return $value;
            }
            
            // If it's just a plain number.
            if ( is_numeric( $value ) ) {
                return absint( $value ) . 'px';
            }
            
            // If the format is unrecognized, return a safe empty string.
            return '';
        }
        
        /**
         * Sanitize boolean-like values.
         * Replaces custom array checking with wp_validate_boolean() for consistency.
         *
         * @param mixed $value Boolean-like input.
         * @return string 'true', 'false', or empty string.
         */
        private static function wpgmp_sanitize_boolean_value( $value ) {

            // Use WordPress's boolean validator which understands 'true', 'false', '0', '1', etc.
            $bool = wp_validate_boolean( $value );
            
            // Return a string representation for shortcode attribute context.
            return $bool ? 'true' : 'false';
        }
        
        /**
         * Remove malicious content from strings.
         * REPLACED by core functions. This method is kept for backward compatibility
         * but now acts as a wrapper for wp_kses_post(), which is the WordPress standard
         * for stripping unsafe HTML.
         *
         * @param string $value Input string.
         * @return string Cleaned string.
         */
        private static function wpgmp_remove_malicious_content( $value ) {
            if ( empty( $value ) ) {
                return '';
            }
            // Use wp_kses_post() to allow only HTML tags permitted in post content.
            return wp_kses_post( $value );
        }
        
        /**
         * Escape output for display.
         * Uses wp_kses_post() as in the original, which is the correct function for
         * outputting HTML that should be safe for post content.
         *
         * @param string $output Output to escape.
         * @return string Escaped output.
         */
        public static function wpgmp_escape_output( $output ) {
            return wp_kses_post( $output );
        }
        
        /**
         * Validate map ID.
         * Uses absint() for validation, which is the WordPress standard.
         *
         * @param mixed $id Map ID.
         * @return int Validated map ID or 0.
         */
        public static function wpgmp_validate_map_id( $id ) {
            return absint( $id );
        }
        
        /**
         * Sanitize array values recursively.
         * Now uses sanitize_text_field() for all leaf values, ensuring consistency.
         *
         * @param mixed $array Array or string to sanitize.
         * @return array|string Sanitized array or string.
         */
        public static function wpgmp_sanitize_array( $array ) {
            // If it's not an array, treat it as a single text field.
            if ( ! is_array( $array ) ) {
                return sanitize_text_field( $array );
            }
            
            $sanitized = array();
            foreach ( $array as $key => $value ) {
                // Sanitize the key itself.
                $clean_key = sanitize_key( $key );
                // Recursively sanitize the value.
                $sanitized[ $clean_key ] = is_array( $value ) 
                    ? self::wpgmp_sanitize_array( $value ) 
                    : sanitize_text_field( $value );
            }
            
            return $sanitized;
        }
    }
}