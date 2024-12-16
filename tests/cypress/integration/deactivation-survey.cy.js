// <reference types="Cypress" />
import { wpLogin } from '../wp-module-support/utils.cy';

describe( 'Plugin Deactivation Survey', { testIsolation: true }, () => {
	let newfoldDeactivationSurvey;

	before( () => {
		// define commands for repetitive commands
		Cypress.Commands.add( 'triggerDeactivationModal', () => {
			cy.get(
				'.deactivate a[id*="' + Cypress.env( 'pluginId' ) + '"]'
			).click();
		} );

		Cypress.Commands.add( 'verifyModalClosed', () => {
			cy.get( '.nfd-deactivation-survey__container' ).should(
				'not.exist'
			);
			cy.get( 'body' ).should( 'not.have.class', 'nfd-noscroll' );
		} );

		Cypress.Commands.add( 'verifyPluginDeactivated', () => {
			cy.get(
				'.deactivate a[id*="' + Cypress.env( 'pluginId' ) + '"]'
			).should( 'not.exist' );
			cy.get(
				'.activate a[id*="' + Cypress.env( 'pluginId' ) + '"]'
			).should( 'exist' );
		} );

		Cypress.Commands.add( 'activatePlugin', () => {
			cy.get('body')
			.then(($body) => {
				// check if activate link is present
				if ( $body.find('.activate a[id*="' + Cypress.env( 'pluginId' ) + '"]').length ) {
					cy.get(
						'.activate a[id*="' + Cypress.env( 'pluginId' ) + '"]'
					).click();		
				}
				// else assume it was textarea
				return false;
			})
			cy.wait( 500 );
		} );

		Cypress.Commands.add( 'verifyPluginActive', () => {
			cy.get(
				'.deactivate a[id*="' + Cypress.env( 'pluginId' ) + '"]'
			).should( 'exist' );
			cy.get(
				'.activate a[id*="' + Cypress.env( 'pluginId' ) + '"]'
			).should( 'not.exist' );
		} );

	});

	beforeEach( () => {
		wpLogin();
		cy.visit( '/wp-admin/plugins.php', {
			onLoad() {
				cy.window().then( ( win ) => {
					// load module data into var
					newfoldDeactivationSurvey = win.newfoldDeactivationSurvey;
				} );
			},
		} );

		// ignore notifications errors if there are any
		cy.intercept(
			{
				method: 'GET',
				url: /newfold-notifications/,
			},
			{ body: {} }
		);

		cy.intercept( {
			method: 'POST',
			url: /newfold-data(\/|%2F)v1(\/|%2F)events/,
		} ).as( 'surveyEvent' );

	} );

	it( 'Modal opens and closes properly and Skip action works', () => {
		// On overlay click
		cy.triggerDeactivationModal();

		// body has no scroll class
		cy.get( 'body' ).should( 'have.class', 'nfd-noscroll' );

		// modal exists
		cy.get( '.nfd-deactivation-survey__container' )
			.scrollIntoView()
			.should( 'be.visible' );

		// overlay exists
		cy.get( '.nfd-deactivation-survey__overlay' ).should( 'exist' );

		cy.get( '.nfd-deactivation-survey__overlay' ).click( { force: true } );
		cy.verifyModalClosed();

		// On step 1 cancel button click
		cy.triggerDeactivationModal();
		cy.get(
			'.nfd-deactivation-sure button[nfd-deactivation-survey-destroy]'
		).click();
		cy.verifyModalClosed();

		// On ESC key press (step 1)
		cy.triggerDeactivationModal();
		cy.get( 'body' ).type( '{esc}' );
		cy.verifyModalClosed();

		// On step 2 cancel button click
		cy.triggerDeactivationModal();
		cy.get(
			'.nfd-deactivation-sure button[nfd-deactivation-survey-next]'
		).click();
		cy.get(
			'.nfd-deactivation-survey button[nfd-deactivation-survey-destroy]'
		).click();
		cy.verifyModalClosed();

		// On ESC key press (step 2)
		cy.triggerDeactivationModal();
		cy.get(
			'.nfd-deactivation-sure button[nfd-deactivation-survey-next]'
		).click();
		cy.get( 'body' ).type( '{esc}' );
		cy.verifyModalClosed();

		// Step 1 content renders correctly
	 	// click "Deactivate" link from plugins list
		cy.triggerDeactivationModal();

		cy.get(
			'.nfd-deactivation-sure .nfd-deactivation__header-title'
		).should( 'be.visible' );
		cy.get(
			'.nfd-deactivation-sure .nfd-deactivation__header-subtitle'
		).should( 'be.visible' );
		cy.get( '.nfd-deactivation-sure .nfd-deactivation__cards' ).should( 'be.visible' );
		cy.get( '.nfd-deactivation-sure .nfd-deactivation__helptext' ).should( 'be.visible' );

		// Check content matches deactivation runtime data
		cy.get(
			'.nfd-deactivation-sure .nfd-deactivation__header-title'
		).contains( newfoldDeactivationSurvey.strings.sureTitle );

		// Cancel button exists
		cy.get(
			'.nfd-deactivation-sure button[nfd-deactivation-survey-destroy]'
		).should( 'be.visible' );

		// Continue button exists
		cy.get(
			'.nfd-deactivation-sure button[nfd-deactivation-survey-next]'
		).should( 'be.visible' );

		// Step 2 content renders correctly
	 	// Go to next step
		cy.get( 'button[nfd-deactivation-survey-next]' ).click();
		
		cy.get(
			'.nfd-deactivation-survey .nfd-deactivation__header-title'
		).should( 'be.visible' );
		cy.get(
			'.nfd-deactivation-survey .nfd-deactivation__header-subtitle'
		).should( 'be.visible' );
		cy.get( '.nfd-deactivation-survey .nfd-deactivation-label' ).should(
			'be.visible'
		);
		cy.get( '.nfd-deactivation-survey .nfd-deactivation-textarea' ).should(
			'be.visible'
		);

		// Check content matches deactivation runtime data
		cy.get(
			'.nfd-deactivation-survey .nfd-deactivation__header-title'
		).contains( newfoldDeactivationSurvey.strings.surveyTitle );

		// Cancel button exists
		cy.get(
			'.nfd-deactivation-survey button[nfd-deactivation-survey-destroy]'
		).should( 'be.visible' );

		// Submit button exists
		cy.get(
			'.nfd-deactivation-survey input[nfd-deactivation-survey-submit]'
		).should( 'be.visible' );

		// Skip button exists
		cy.get(
			'.nfd-deactivation-survey button[nfd-deactivation-survey-skip]'
		).should( 'be.visible' );
		
		// Skip action works
		// skip & deactivate functions
		cy.get( 'button[nfd-deactivation-survey-skip]' ).should( 'be.visible' );
		cy.get( 'button[nfd-deactivation-survey-skip]' ).click();
		cy.wait( '@surveyEvent' )
			.its( 'request.body.data.survey_input' )
			.should( 'eq', '(Skipped)' );
		// verify modal closed
		cy.verifyModalClosed();
		// verify plugin is deactivated
		cy.verifyPluginDeactivated();
		// activate plugin
		cy.activatePlugin();
		// verify plugin is activated
		cy.verifyPluginActive();
	} );

	it( 'Modal Submit survey action works', () => {
		// click link to open modal
		cy.triggerDeactivationModal();

		// go to step 2
		cy.get( 'button[nfd-deactivation-survey-next]' ).click();

		// can enter reason
		const ugcReason = 'automated testing';
		cy.get( '#nfd-deactivation-survey__input' ).type( ugcReason );
		// submit and deactivate works
		cy.get( 'input[nfd-deactivation-survey-submit]' ).should(
			'be.visible'
		);
		cy.get( 'input[nfd-deactivation-survey-submit]' ).click();
		cy.wait( '@surveyEvent' )
			.its( 'request.body.data.survey_input' )
			.should( 'eq', ugcReason );
		cy.wait( 500 );
		// verify plugin is deactivated
		cy.verifyPluginDeactivated();
		// activate plugin
		cy.activatePlugin();
		// verify plugin is activated
		cy.verifyPluginActive();
	} );

} );