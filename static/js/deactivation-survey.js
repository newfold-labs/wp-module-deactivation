{
	// Data module runtime data
	const runtimeData = window.newfoldDeactivationSurvey;
	// Dialog instance / will be initialized later
	let deactivationSurveyDialog;

	const renderDialog = () => {
		// Create dialog container
		const surveyDialog = document.createElement( 'div' );
		surveyDialog.id = 'nfd-deactivation-survey';
		surveyDialog.setAttribute(
			'aria-labelledby',
			'nfd-deactivation-survey-title'
		);
		surveyDialog.setAttribute( 'aria-hidden', 'true' );
		surveyDialog.innerHTML = getDialogHTML();

		// Append dialog container to DOM
		const wpAdmin = document.querySelector( 'body.wp-admin' );
		wpAdmin.appendChild( surveyDialog );

		// Disable body scroll
		document.body.classList.add( 'nfd-noscroll' );

		// Create dialog instance
		deactivationSurveyDialog = new A11yDialog( surveyDialog );
		deactivationSurveyDialog.show();
	};

	const getSureContent = () => {
		const content = `
			<div class="nfd-deactivation-sure__content">
                <h1 id="nfd-deactivation-sure-title">${ runtimeData.strings.sureTitle }</h1>
                <div class="nfd-deactivation-sure__content-header">
                    <p>This plugin is currently powering features on your site. If you deactivate, these features will no longer be available.</p>
                    <ul style="list-style: disc; list-style-position: inside;">
						<li>Integrations with your hosting</li>
						<li>Performance Improvements</li>
						<li>Wonder Blocks</li>
					</ul>

					<div class="nfd-deactivation-survey__content-actions">
						<div>
							<button type="button" nfd-deactivation-survey-next class="nfd-button nfd-button-seconday nfd-deactivation-survey-action" aria-label="${ runtimeData.strings.submitAriaLabel }">Continue</button>
							<button type="button" class="nfd-button nfd-button-primary nfd-deactivation-survey-action" nfd-deactivation-survey-destroy aria-label="${ runtimeData.strings.cancelAriaLabel }">${ runtimeData.strings.cancel }</button>
						</div>
					</div>
                </div>
            </div>
		`;
		return content;
	};

	const getSurveyContent = () => {
		const content = `
			<div class="nfd-deactivation-survey__content nfd-hidden" aria-hidden="true">
                <h1 id="nfd-deactivation-survey-title" class="nfd-hidden" aria-hidden="true">${
					runtimeData.strings.surveyTitle
				}</h1>
                <div class="nfd-deactivation-survey__content-header">
                    <h3>${ runtimeData.strings.dialogTitle }</h3>
                    <p>${ runtimeData.strings.dialogDesc }</p>
                </div>
                ${ getSurveyFormHTML() }
                <span class="nfd-deactivation-survey_loading nfd-hidden"></span>
            </div>
		`;
		return content;
	};

	const getDialogHTML = () => {
		const content = `
			<div class="nfd-deactivation-survey__overlay" nfd-deactivation-survey-destroy></div>
			<div class="nfd-deactivation-survey__container" role="document">
				${ getSureContent() }
				${ getSurveyContent() }
			</div>
			<div class="nfd-deactivation-survey__disabled nfd-hidden"></div>
        `;
		return content;
	};

	const getSurveyFormHTML = () => {
		const content = `
			<form aria-label="${ runtimeData.strings.formAriaLabel }">
				<fieldset>
					<label for="nfd-deactivation-survey__input">${ runtimeData.strings.label }</label>
					<textarea id="nfd-deactivation-survey__input" placeholder="${ runtimeData.strings.placeholder }"></textarea>
				</fieldset>
				<div class="nfd-deactivation-survey__content-actions">
					<div>
						<input type="submit" value="${ runtimeData.strings.submit }" nfd-deactivation-survey-submit class="button button-primary" aria-label="${ runtimeData.strings.submitAriaLabel }"/>
						<button type="button" class="nfd-deactivation-survey-action" nfd-deactivation-survey-destroy aria-label="${ runtimeData.strings.cancelAriaLabel }">${ runtimeData.strings.cancel }</button>
					</div>
					<div>
						<button type="button" class="nfd-deactivation-survey-action" nfd-deactivation-survey-skip aria-label="${ runtimeData.strings.skipAriaLabel }">${ runtimeData.strings.skip }</button>
					</div>
				</div>
			</form>
        `;
		return content;
	};

	const destroyDialog = () => {
		// Destroy dialog instance
		deactivationSurveyDialog.destroy();
		deactivationSurveyDialog = null;

		// Remove dialog container from DOM if exists
		const dialog = document.getElementById( 'nfd-deactivation-survey' );
		if ( dialog ) {
			dialog.remove();
		}

		// Enable body scroll
		document.body.classList.remove( 'nfd-noscroll' );
	};

	const deactivatePlugin = () => {
		destroyDialog();
		// Get deactivation link and redirect
		const deactivateLink = document.getElementById(
			'deactivate-' + runtimeData.pluginSlug
		).href;
		if ( deactivateLink ) {
			window.location.href = deactivateLink;
		} else {
			console.error( 'Error: Deactivation link not found.' );
		}
	};

	const isSubmitting = () => {
		// Disable actions while submitting
		const dialogDisabledOverlay = document.querySelector(
			'.nfd-deactivation-survey__disabled'
		);
		dialogDisabledOverlay.classList.remove( 'nfd-hidden' );
		const dialogLoading = document.querySelector(
			'.nfd-deactivation-survey_loading'
		);
		dialogLoading.classList.remove( 'nfd-hidden' );
		const actionsBtns = [
			...document.querySelectorAll( '.nfd-deactivation-survey-action' ),
			document.querySelector(
				'#nfd-deactivation-survey form input[type="submit"]'
			),
		];
		actionsBtns.forEach( ( btn ) => {
			btn.setAttribute( 'disabled', 'true' );
		} );

		// disbale ESC key while submitting
		deactivationSurveyDialog.on( 'show', () => {
			deactivationSurveyDialog.off( 'keydown' );
		} );
	};

	const submitSurvey = async ( skipped = false ) => {
		isSubmitting();

		let surveyInput = 'No input';
		if ( ! skipped ) {
			const inputValue = document.getElementById(
				'nfd-deactivation-survey__input'
			).value;
			if ( inputValue.length > 0 ) {
				surveyInput = inputValue;
			}
		}

		// Send event
		const send = await sendEvent( surveyInput );
		deactivatePlugin();
	};

	const sendEvent = async ( surveyInput ) => {
		const eventData = {
			label_key: 'survey_input',
			survey_input: surveyInput,
			category: 'user_action',
			brand: runtimeData.brand,
			page: window.location.href,
		};

		// Attach abTestPluginHome flag value if exists
		if ( typeof getABTestPluginHome() === 'boolean' ) {
			eventData.abTestPluginHome = getABTestPluginHome();
		}

		await fetch( runtimeData.eventsEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': runtimeData.restApiNonce,
			},
			body: JSON.stringify( {
				action: 'deactivation_survey_freeform',
				data: eventData,
			} ),
		} );
		return true;
	};

	const getABTestPluginHome = () => {
		const { NewfoldRuntime } = window;

		return NewfoldRuntime?.capabilities?.abTestPluginHome;
	};

	const showSurvey = () => {
		const sure = document.querySelector(
			'.nfd-deactivation-sure__content'
		);
		const survey = document.querySelector(
			'.nfd-deactivation-survey__content'
		);
		// hide interstitial are you sure page
		sure.classList.add( 'nfd-hidden' );
		sure.setAttribute( 'aria-hidden', true );
		// display survey content
		survey.classList.remove( 'nfd-hidden' );
		survey.removeAttribute( 'aria-hidden' );
	};

	// Attach events listeners
	window.addEventListener( 'DOMContentLoaded', () => {
		const wpAdmin = document.querySelector( 'body.wp-admin' );
		wpAdmin.addEventListener( 'click', ( e ) => {
			// Plugin deactivation listener
			if ( e.target.id === 'deactivate-' + runtimeData.pluginSlug ) {
				e.preventDefault();
				renderDialog();
			}

			// Remove dialog listener
			if ( e.target.hasAttribute( 'nfd-deactivation-survey-destroy' ) ) {
				destroyDialog();
			}

			// Continue to survey
			if ( e.target.hasAttribute( 'nfd-deactivation-survey-next' ) ) {
				e.preventDefault();
				showSurvey();
			}

			// Submit listener
			if ( e.target.hasAttribute( 'nfd-deactivation-survey-submit' ) ) {
				e.preventDefault();
				submitSurvey();
			}

			// Skip listener
			if ( e.target.hasAttribute( 'nfd-deactivation-survey-skip' ) ) {
				e.preventDefault();
				submitSurvey( true );
			}
		} );
	} );
}
