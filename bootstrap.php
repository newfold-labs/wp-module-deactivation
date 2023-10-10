<?php

use NewfoldLabs\WP\ModuleLoader\Container;
use NewfoldLabs\WP\Module\Deactivation\Deactivation;

use function NewfoldLabs\WP\ModuleLoader\register;

if ( function_exists( 'add_action' ) ) {

	add_action(
		'plugins_loaded',
		function () {
			register(
				array(
					'name'     => 'deactivation',
					'label'    => __( 'Deactivation', 'wp-module-deactivation' ),
					'callback' => function ( Container $container ) {
						new Deactivation( $container );
					},
					'isActive' => true,
					'isHidden' => true,
				)
			);
		}
	);

}
