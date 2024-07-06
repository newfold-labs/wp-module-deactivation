// <reference types="Cypress" />

describe( 'Plugin Deactivation Survey', () => {
	let newfoldDeactivationSurvey;

	before( () => {
		cy.visit( '/wp-admin/plugins.php' );

		cy.window()
			.its( 'newfoldDeactivationSurvey' )
			.then( ( data ) => {
				newfoldDeactivationSurvey = data;
			} );
		// ignore notifications errors if there are any
		cy.intercept(
			{
				method: 'GET',
				url: /newfold-notifications/,
			},
			{ body: {} }
		);

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

		Cypress.Commands.add( 'reactivatePlugin', () => {
			cy.get(
				'.activate a[id*="' + Cypress.env( 'pluginId' ) + '"]'
			).click();
			cy.wait( 500 );
		} );
	} );

	it( 'Plugin deactivate link opens modal', () => {
		// click "Deactivate" link from plugins list
		cy.triggerDeactivationModal();

		// body has no scroll class
		cy.get( 'body' ).should( 'have.class', 'nfd-noscroll' );

		// modal exists
		cy.get( '.nfd-deactivation-survey__container' )
			.scrollIntoView()
			.should( 'be.visible' );

		// overlay exists
		cy.get( '.nfd-deactivation-survey__overlay' ).should( 'exist' );
	} );

	it( 'Step 1 content renders correctly', () => {
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

		// Go to next step
		cy.get(
			'.nfd-deactivation-sure button[nfd-deactivation-survey-next]'
		).click();
	} );

	it( 'Step 2 content renders correctly', () => {
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
	} );

	it( 'Skip action works', () => {
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

		// skip & deactivate functions
		cy.get( 'button[nfd-deactivation-survey-skip]' ).should( 'be.visible' );
		cy.get( 'button[nfd-deactivation-survey-skip]' ).click();
		cy.wait( '@surveyEvent' )
			// .its('request.body.action').should('eq', 'deactivation_survey_freeform')
			.its( 'request.body.data.survey_input' )
			.should( 'eq', '(Skipped)' );
		// verify modal closed
		cy.verifyModalClosed();
		// verify plugin is deactivated
		cy.verifyPluginDeactivated();
		// reactivate plugin
		cy.reactivatePlugin();
	} );

	it( 'Submit action works', () => {
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
			// .its('request.body.action').should('eq', 'deactivation_survey_freeform')
			.its( 'request.body.data.survey_input' )
			.should( 'eq', ugcReason );
		cy.wait( 500 );
		// verify plugin is deactivated
		cy.verifyPluginDeactivated();
		// reactivate plugin
		cy.reactivatePlugin();
	} );

	it( 'Modal closes properly', () => {
		// On overlay click
		cy.triggerDeactivationModal();
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
	} );
} );

after( () => {
	cy.exec(
		`npx wp-env run cli wp plugin activate ${ Cypress.env( 'pluginSlug' ) }`
	);
} );
