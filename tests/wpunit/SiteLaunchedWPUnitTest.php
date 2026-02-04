<?php

namespace NewfoldLabs\WP\Module\Deactivation;

use NewfoldLabs\WP\Module\Deactivation\Events\SiteLaunched;

/**
 * WPUnit tests for the SiteLaunched event class.
 *
 * @coversDefaultClass \NewfoldLabs\WP\Module\Deactivation\Events\SiteLaunched
 */
class SiteLaunchedWPUnitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	/**
	 * Test that send sets action and returns a REST response.
	 *
	 * @covers ::send
	 */
	public function test_send_sets_action_and_returns_response() {
		$event  = new SiteLaunched();
		$result = $event->send();

		$this->assertSame( 'site_launched', $event->action );
		$this->assertIsArray( $event->data );
		$this->assertArrayHasKey( 'ttl', $event->data );
		$this->assertInstanceOf( \WP_REST_Response::class, $result );
	}
}
