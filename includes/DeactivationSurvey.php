<?php

namespace NewfoldLabs\WP\Module\Deactivation;

use function NewfoldLabs\WP\ModuleLoader\container;

/**
 * Class DeactivationSurvey
 *
 * Brand plugins deactivation survey modal.
 *
 * @package NewfoldLabs\WP\Module\Deactivation
 */
class DeactivationSurvey {

    /**
     * DeactivationSurvey constructor.
     */
    public function __construct() {
        $this->deactivation_survey_assets();
        $this->deactivation_survey_runtime();
    }

    /**
     * Enqueue deactivation survey assets.
     */
    public function deactivation_survey_assets() {
        $assetsDir = container()->plugin()->url . 'vendor/newfold-labs/wp-module-deactivation/static/';

        // accessible a11y dialog
        wp_register_script(
            'nfd-deactivation-a11y-dialog',
            $assetsDir . 'js/a11y-dialog.min.js',
            array(),
            '8.0.4'
        );

        // deactivation-survey.js
        wp_enqueue_script(
            'nfd-deactivation-survey',
            $assetsDir . 'js/deactivation-survey.js',
            array( 'nfd-deactivation-a11y-dialog' ),
            container()->plugin()->version,
            true
        );

        // Styles
		wp_enqueue_style(
			'nfd-deactivation-survey-style',
			$assetsDir . 'css/deactivation-survey.css',
			array(),
			container()->plugin()->version
		);
    }

    /**
     * Localize deactivation survey runtime.
     */
    public function deactivation_survey_runtime() {
        $plugin_slug = explode( '/', container()->plugin()->basename )[0];

        wp_localize_script(
			'nfd-deactivation-survey',
			'newfoldDeactivationSurvey',
			array(
				'eventsEndpoint' => \esc_url_raw( \rest_url() . 'newfold-data/v1/events/' ),
				'restApiNonce'   => wp_create_nonce( 'wp_rest' ),
                'brand'          => container()->plugin()->id,
				'pluginSlug'     => $plugin_slug,
                'strings'        => array(
                    'surveyTitle'     => __( 'Plugin Deactivation Survey', 'wp-module-deactivation' ),
                    'dialogTitle'     => __( 'Thank You for Using the ' . ucwords( container()->plugin()->id ) . ' Plugin!', 'wp-module-deactivation' ),
                    'dialogDesc'      => sprintf( __('Thank you for using the %s plugin!', 'wp-module-deactivation'), ucwords( container()->plugin()->id )),
                    'formAriaLabel'   => __( 'Plugin Deactivation Form', 'wp-module-deactivation' ),
                    'label'           => __( 'Why are you deactivating this plugin?', 'wp-module-deactivation' ),
                    'placeholder'     => __( 'Please share the reason here...', 'wp-module-deactivation' ),
                    'submit'          => __( 'Submit & Deactivate', 'wp-module-deactivation' ),
                    'submitAriaLabel' => __( 'Submit and Deactivate Plugin', 'wp-module-deactivation' ),
                    'cancel'          => __( 'Cancel', 'wp-module-deactivation' ),
                    'cancelAriaLabel' => __( 'Cancel Deactivation', 'wp-module-deactivation' ),
                    'skip'            => __( 'Skip & Deactivate', 'wp-module-deactivation' ),
                    'skipAriaLabel'   => __( 'Skip and Deactivate Plugin', 'wp-module-deactivation' ),
                )
			)
		);
    }

}
