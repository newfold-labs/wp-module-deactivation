<?php

namespace NewfoldLabs\WP\Module\Deactivation;

/**
 * Module loading tests for Deactivation module.
 *
 * Verifies the Deactivation module and its core classes are properly loaded.
 *
 * @coversDefaultClass \NewfoldLabs\WP\Module\Deactivation\Deactivation
 */
class ModuleLoadingWPUnitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	/**
	 * Test that WordPress factory is working.
	 *
	 * @coversNothing
	 */
	public function test_wordpress_factory_works() {
		$post = static::factory()->post->create_and_get();

		$this->assertInstanceOf( \WP_Post::class, $post );
	}

	/**
	 * Test that the Deactivation class is loaded.
	 *
	 * @coversNothing
	 */
	public function test_deactivation_class_loaded() {
		$this->assertTrue( class_exists( 'NewfoldLabs\WP\Module\Deactivation\Deactivation' ) );
	}

	/**
	 * Test that the DeactivationSurvey class is loaded.
	 *
	 * @coversNothing
	 */
	public function test_deactivation_survey_class_loaded() {
		$this->assertTrue( class_exists( 'NewfoldLabs\WP\Module\Deactivation\DeactivationSurvey' ) );
	}

	/**
	 * Test that the Event class is loaded.
	 *
	 * @coversNothing
	 */
	public function test_event_class_loaded() {
		$this->assertTrue( class_exists( 'NewfoldLabs\WP\Module\Deactivation\Events\Event' ) );
	}

	/**
	 * Test that the SiteLaunched class is loaded.
	 *
	 * @coversNothing
	 */
	public function test_site_launched_class_loaded() {
		$this->assertTrue( class_exists( 'NewfoldLabs\WP\Module\Deactivation\Events\SiteLaunched' ) );
	}
}
