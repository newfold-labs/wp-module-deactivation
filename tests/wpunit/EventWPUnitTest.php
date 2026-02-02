<?php

namespace NewfoldLabs\WP\Module\Deactivation;

use NewfoldLabs\WP\Module\Deactivation\Events\Event;

/**
 * WPUnit tests for the Event class.
 *
 * @coversDefaultClass \NewfoldLabs\WP\Module\Deactivation\Events\Event
 */
class EventWPUnitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	/**
	 * Test that Event constructor sets default category and data.
	 *
	 * @covers ::__construct
	 */
	public function test_constructor_sets_default_category_and_data() {
		$event = new Event();

		$this->assertSame( 'plugin_deactivation', $event->category );
		$this->assertSame( array(), $event->data );
		$this->assertInstanceOf( \WP_REST_Request::class, $event->request );
	}

	/**
	 * Test that Event constructor accepts custom category and data.
	 *
	 * @covers ::__construct
	 */
	public function test_constructor_accepts_custom_category_and_data() {
		$data = array( 'reason' => 'testing' );
		$event = new Event( 'custom_category', $data );

		$this->assertSame( 'custom_category', $event->category );
		$this->assertSame( $data, $event->data );
		$this->assertInstanceOf( \WP_REST_Request::class, $event->request );
	}

	/**
	 * Test that Event request is POST to the events endpoint.
	 *
	 * @covers ::__construct
	 */
	public function test_request_is_post_to_events_endpoint() {
		$event = new Event();

		$this->assertSame( 'POST', $event->request->get_method() );
		$this->assertStringContainsString( 'newfold-data/v1/events', $event->endpoint );
	}
}
