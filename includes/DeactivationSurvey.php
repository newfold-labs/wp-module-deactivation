<?php
/**
 * Brand plugins deactivation survey modal.
 *
 * @package NewfoldLabs\WP\Module\Deactivation
 */

namespace NewfoldLabs\WP\Module\Deactivation;

use NewfoldLabs\WP\ModuleLoader\Container;
use function NewfoldLabs\WP\ModuleLoader\container;

/**
 * Class DeactivationSurvey.
 */
class DeactivationSurvey {

	/**
	 * DeactivationSurvey constructor.
	 */
	public function __construct() {
		// $this->container = $container;

		$defaults = array(
			'surveyAriaTitle'   => __( 'Plugin Deactivation Survey', 'wp-module-deactivation' ),
			'surveyTitle'       => sprintf( __( 'Thank you for using the %s plugin!', 'wp-module-deactivation' ), ucwords( container()->plugin()->id ) ),
			'surveyDesc'        => __( 'Please take a moment to let us know why you\'re deactivating this plugin.', 'wp-module-deactivation' ),
			'formAriaLabel'     => __( 'Plugin Deactivation Form', 'wp-module-deactivation' ),
			'label'             => __( 'Why are you deactivating this plugin?', 'wp-module-deactivation' ),
			'placeholder'       => __( 'Please share the reason here...', 'wp-module-deactivation' ),
			'submit'            => __( 'Submit & Deactivate', 'wp-module-deactivation' ),
			'submitAriaLabel'   => __( 'Submit and Deactivate Plugin', 'wp-module-deactivation' ),
			'cancel'            => __( 'Cancel', 'wp-module-deactivation' ),
			'cancelAriaLabel'   => __( 'Cancel Deactivation', 'wp-module-deactivation' ),
			'skip'              => __( 'Skip & Deactivate', 'wp-module-deactivation' ),
			'skipAriaLabel'     => __( 'Skip and Deactivate Plugin', 'wp-module-deactivation' ),
			'continue'          => __( 'Continue', 'wp-module-deactivation' ),
			'continueAriaLabel' => __( 'Continue Deactivation', 'wp-module-deactivation' ),
			'sureTitle'         => __( 'Are You Sure?', 'wp-module-deactivation' ),
			'sureDesc'          => __( 'This plugin is powers important features on your site. These will no longer be available if you deactivate the plugin.', 'wp-module-deactivation' ),
			'sureHelpTitle'     => __( 'Need Help?', 'wp-module-deactivation' ),
			'sureHelpUrl1'      => 'https://bluehost.com/',
			'sureHelpUrl2'      => 'https://bluehost.com/',
			'sureHelpUrl3'      => 'https://bluehost.com/',
			'sureCards'         => array(
				__( 'Performance Improvements' ),
				__( 'Wonder Blocks Patters' ),
				__( 'Security Improvements' ),
				__( 'Integrated AI Help Center' ),
			),
		);

		$defaults['sureHelp'] = sprintf( 
			__( 'Learn more about <a href="%1$s" target="_blank" nfd-deactivation-survey-destroy>the features of this plugin</a>, check the <a href="%2$s" onclick="newfoldEmbeddedHelp.toggleNFDLaunchedEmbeddedHelp()">help center</a>, or <a href="%3$s">contact support</a>.' ),
			$defaults['sureHelpUrl1'],
			$defaults['sureHelpUrl2'],
			$defaults['sureHelpUrl3']
		);

		// Merge defaults with container values from plugin
		// $this->strings = wp_parse_args(
		// 	$container->has( 'deactivation' ) ? 
		// 	$container['deactivation'] : 
		// 	array(), 
		// 	$defaults
		// );
		$this->strings = $defaults;

		$this->deactivation_survey_assets();
		$this->deactivation_survey_runtime();
	}

	/**
	 * Enqueue deactivation survey assets.
	 */
	public function deactivation_survey_assets() {
		$assets_dir = container()->plugin()->url . 'vendor/newfold-labs/wp-module-deactivation/static/';

		// Accessible a11y dialog.
		wp_register_script(
			'nfd-deactivation-a11y-dialog',
			$assets_dir . 'js/a11y-dialog.min.js',
			array(),
			'8.0.4'
		);

		// Deactivation-survey.js.
		wp_enqueue_script(
			'nfd-deactivation-survey',
			$assets_dir . 'js/deactivation-survey.js',
			array( 'nfd-deactivation-a11y-dialog' ),
			container()->plugin()->version,
			true
		);

		// Styles.
		wp_enqueue_style(
			'nfd-deactivation-survey-style',
			$assets_dir . 'css/deactivation-survey.css',
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
				'strings'        => $this->strings,
			)
		);
	}

}
