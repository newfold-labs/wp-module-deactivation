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
	} );

	it( 'Plugin deactivate link opens modal, clicking out closes modal', () => {
		// body does not have no scroll class
		cy.get( 'body' ).should( 'not.have.class', 'nfd-noscroll' );
		cy.get( '.nfd-deactivation-survey__container' ).should( 'not.exist' );

		// click link
		cy.get(
			'.deactivate a[id*="' + Cypress.env( 'pluginId' ) + '"]'
		).click();

		// body has no scroll class
		cy.get( 'body' ).should( 'have.class', 'nfd-noscroll' );

		// modal exists
		cy.get( '.nfd-deactivation-survey__container' )
			.scrollIntoView()
			.should( 'be.visible' );

		// overlay exists
		cy.get( '.nfd-deactivation-survey__overlay' ).should( 'exist' );

		cy.get( '.nfd-deactivation-survey__overlay' ).click( { force: true } );

		cy.get( 'body' ).should( 'not.have.class', 'nfd-noscroll' );
		cy.get( '.nfd-deactivation-survey__content' ).should( 'not.exist' );
	} );

	it( 'Are You Sure Interstitial exists, cancel button exits modal', () => {
		// click link to open modal
		cy.get(
			'.deactivate a[id*="' + Cypress.env( 'pluginId' ) + '"]'
		).click();

		cy.get( '.nfd-deactivation-sure .nfd-deactivation__content-title' ).should( 'be.visible' );
		cy.get( '.nfd-deactivation-sure .nfd-deactivation__content-subtitle' ).should( 'be.visible' );
		cy.get( '.nfd-deactivation-sure .nfd-deactivation__cards' ).should( 'be.visible' );
		cy.get( '.nfd-deactivation-sure .nfd-deactivation__helptext' ).should( 'be.visible' );

		// Check content matches deactivation runtime data
		cy.get(
			'.nfd-deactivation-sure .nfd-deactivation__content-title'
		).contains( newfoldDeactivationSurvey.strings.sureTitle );

		cy.get( 'button[nfd-deactivation-survey-destroy]' ).should(
			'be.visible'
		);
		cy.get( 'button[nfd-deactivation-survey-next]' ).should( 'be.visible' );

		cy.get(
			'.nfd-deactivation-sure button[nfd-deactivation-survey-destroy]'
		).click();

		cy.get( 'body' ).should( 'not.have.class', 'nfd-noscroll' );
		cy.get( '.nfd-deactivation-survey__content' ).should( 'not.exist' );
	} );

	it( 'Continue button exists and advances to survey, skip button functions', () => {
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
		cy.get(
			'.deactivate a[id*="' + Cypress.env( 'pluginId' ) + '"]'
		).click();

		cy.get( 'button[nfd-deactivation-survey-next]' ).click();

		// skip & deactivate functions
		cy.get( 'button[nfd-deactivation-survey-skip]' ).should( 'be.visible' );
		cy.get( 'button[nfd-deactivation-survey-skip]' ).click();
		cy.wait( '@surveyEvent' )
			// .its('request.body.action').should('eq', 'deactivation_survey_freeform')
			.its( 'request.body.data.survey_input' )
			.should( 'eq', '(Skipped)' );
		// verify modal closed
		cy.get( '.nfd-deactivation-survey__container' ).should( 'not.exist' );
		// verify plugin is deactivated
		cy.get(
			'.deactivate a[id*="' + Cypress.env( 'pluginId' ) + '"]'
		).should( 'not.exist' );
		cy.get( '.activate a[id*="' + Cypress.env( 'pluginId' ) + '"]' ).should(
			'exist'
		);
		// reactivate plugin
		cy.get(
			'.activate a[id*="' + Cypress.env( 'pluginId' ) + '"]'
		).click();
		cy.wait( 500 );
	} );

	it( 'Survey successfully deactivates plugin', () => {
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
		cy.get(
			'.deactivate a[id*="' + Cypress.env( 'pluginId' ) + '"]'
		).click();

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
		cy.get(
			'.deactivate a[id*="' + Cypress.env( 'pluginId' ) + '"]'
		).should( 'not.exist' );
		cy.get( '.activate a[id*="' + Cypress.env( 'pluginId' ) + '"]' ).should(
			'exist'
		);
		// reactivate plugin
		cy.get(
			'.activate a[id*="' + Cypress.env( 'pluginId' ) + '"]'
		).click();
		cy.wait( 500 );
	} );
} );

after(()=>{
	cy.exec( `npx wp-env run cli wp plugin activate ${ Cypress.env( 'pluginSlug' ) }` );
});