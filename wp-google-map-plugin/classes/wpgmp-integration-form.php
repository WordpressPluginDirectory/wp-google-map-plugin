<?php

if ( ! class_exists( 'WPGMP_Integration_Form' ) ) {

class WPGMP_Integration_Form {
	private $fields = [];
	private $extension_key = '';

	public function __construct($extension_key, $fields = []) {
		$this->extension_key = sanitize_key($extension_key);
		$this->fields = $fields;
	}

	public function render_form() {
		wp_nonce_field('wpgmp_save_integration_data', 'wpgmp_nonce');

		foreach ($this->fields as $field) {
			$this->render_field($field);
		}

		echo '<input type="hidden" name="extension_key" value="' . esc_attr($this->extension_key) . '">';
		echo '<input type="hidden" name="operation" value="save">';
		echo FlipperCode_HTML_Markup::field_submit(
			'wpgmp_save_integration', array(
				'value' => esc_html__( 'Save Settings', 'wp-google-map-plugin' ),
				'class' => 'fc-btn fc-btn-primary fc-btn-sm',
				'pro' => true
			)
			);
	}

	private function render_field($field) {
		$name  = esc_attr($field['name']);
		$label = esc_html($field['label'] ?? '');
		$type  = $field['type'];
		$value = $this->get_saved_value($name);
		echo '<p><label for="' . $name . '">' . $label . '</label><br>';

		switch ($type) {
			case 'text':
				echo FlipperCode_HTML_Markup::field_text(
					$name, array(
						'value'       => $value,
						'desc' => $field['desc']
					)
					);
				break;

			case 'textarea':
				echo FlipperCode_HTML_Markup::field_textarea(
					$name, array(
						'value'       => $value,
						'desc' => $field['desc']
					)
					);
				break;

			case 'select':
				
				echo FlipperCode_HTML_Markup::field_select(
					$name, array(
						'current' => $value,
						'options' => $field['options'],
						'class'   => 'form-control-select',
						'select2' => 'false',
						'desc' => $field['desc']
					)
					);
				break;

			case 'checkbox':
				
				echo FlipperCode_HTML_Markup::field_checkbox($name,array(
						'value'   => true,
						'current' => $value,
						'class'   => 'fc-form-check-input',
						'desc' => $field['desc']
					));

				break;

			case 'radio':
				

				echo FlipperCode_HTML_Markup::field_radio(
					$name, array(
						'current' => $value,
						'radio-val-label' => $field['options'],
						'class'   => 'fc-form-check-input',
						'desc' => $field['desc']
					)
					);

				break;

			case 'hidden':
				echo '<input type="hidden" name="' . $name . '" value="' . esc_attr($value) . '">';
				break;
		}

		echo '</p>';
	}

	private function get_saved_value($name) {

       
		return '';

	}

}

}