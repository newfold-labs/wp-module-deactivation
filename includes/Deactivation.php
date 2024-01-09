<?php
/**
 * Deactivation class file.
 *
 * @package NewfoldLabs\WP\Module\Deactivation
 */

namespace NewfoldLabs\WP\Module\Deactivation;

use NewfoldLabs\WP\ModuleLoader\Container;
use NewfoldLabs\WP\Module\Deactivation\DeactivationSurvey;

/**
 * Deactivation class.
 */
class Deactivation {

	/**
	 * Dependency injection container.
	 *
	 * @var Container
	 */
	protected $container;

	/**
	 * Constructor.
	 *
	 * @param Container $container The plugin container.
	 */
	public function __construct( Container $container ) {
		$this->container = $container;

		register_deactivation_hook(
			$container->plugin()->file,
			array( $this, 'handle' )
		);

		// Plugin deactivation survey.
		add_action( 'admin_head-plugins.php', function () {
			new DeactivationSurvey();
		} );
	}

	/**
	 * Handle deactivation.
	 *
	 * @return void
	 */
	public function handle() {
		$this->site_launched_event();
		$this->disable_coming_soon();
	}

	/**
	 * Send site launched event.
	 *
	 * @return void
	 */
	public function site_launched_event() {
		$coming_soon_service = $this->container->has( 'comingSoon' ) ? $this->container->get( 'comingSoon' ) : null;
		if ( $coming_soon_service && $coming_soon_service->is_enabled() ) {
			$site_launch_event = new Events\SiteLaunched();
			$site_launch_event->send();
		}
	}

	/**
	 * Disable the coming soon page.
	 *
	 * @return void
	 */
	public function disable_coming_soon() {
		$coming_soon_service = $this->container->has( 'comingSoon' ) ? $this->container->get( 'comingSoon' ) : null;
		if ( $coming_soon_service && $coming_soon_service->is_enabled() ) {
			$coming_soon_service->disable();
		}
	}
}
