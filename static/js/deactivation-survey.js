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

	const getSureCards = () => {
		return runtimeData.strings.sureCards
			.map( ( card ) => {
				if ( card.condition !== true && ! eval( card.condition ) ) {
					return '';
				}

				return `<div class="nfd-deactivation__card">
					<span class="nfd-deactivation__card-title">${ card.title }</span>
					<span class="nfd-deactivation__card-desc">${ card.desc }</span>
				</div>`;
			} )
			.join( '' );
	};

	const getSureContent = () => {
		const content = `
			<div class="nfd-deactivation-sure nfd-deactivation__content">
				<div class="nfd-deactivation__header">
					<h1 class="nfd-deactivation__content-title">${
						runtimeData.strings.sureTitle
					}</h1>
                    <p class="nfd-deactivation__content-subtitle">${
						runtimeData.strings.sureDesc
					}</p>
				</div>
				<div class="nfd-deactivation__body">
                    <div class="nfd-deactivation__cards">
						${ getSureCards() }
					</div>
				</div>
				<div class="nfd-deactivation__footer"><div class="nfd-deactivation__footer-content">
					<div class="nfd-deactivation-survey__content-actions">
						<div class="nfd-deactivation__helptext" "style="text-align:left">
							<p>${ runtimeData.strings.sureHelp }</p>
						</div>
						<div class="nfd-deactivation-survey__content-buttons">
							<button type="button" nfd-deactivation-survey-destroy
								class="button button-primary" 
								aria-label="${ runtimeData.strings.cancelAriaLabel }">
								${ runtimeData.strings.cancel }
							</button>
							<button type="button" nfd-deactivation-survey-next 
								class="button button-seconday" 
								aria-label="${ runtimeData.strings.continueAriaLabel }">
								${ runtimeData.strings.continue }
							</button>
						</div>
					</div>
                </div></div>
            </div>
		`;
		return content;
	};

	const getSurveyContent = () => {
		const content = `
			<div class="nfd-deactivation-survey nfd-deactivation__content nfd-hidden" aria-hidden="true">
				<form class="nfd-deactivation-form" aria-label="${ runtimeData.strings.formAriaLabel }">
					<div class="nfd-deactivation__header">
						<h1 id="nfd-deactivation-survey-title" class="nfd-hidden" aria-hidden="true">
							${ runtimeData.strings.surveyAriaTitle }
						</h1>
						<h2 class="nfd-deactivation__content-title">${ runtimeData.strings.surveyTitle }</h2>
						<p class="nfd-deactivation__content-subtitle">${ runtimeData.strings.surveyDesc }</p>
					</div>
					<div class="nfd-deactivation__body">
						<fieldset class="nfd-deactivation-fieldset">
							<label for="nfd-deactivation-survey__input" class="nfd-deactivation-label">${ runtimeData.strings.label }</label>
							<textarea id="nfd-deactivation-survey__input" class="nfd-deactivation-textarea" placeholder="${ runtimeData.strings.placeholder }"></textarea>
						</fieldset>
					</div>
					<div class="nfd-deactivation__footer"><div class="nfd-deactivation__footer-content nfd-deactivation-survey__content-actions">
						<div>
							<button type="button" class="button button-secondary" nfd-deactivation-survey-destroy aria-label="${ runtimeData.strings.cancelAriaLabel }">${ runtimeData.strings.cancel }</button>
						</div>
						<div class="nfd-deactivation-survey__content-actions">
							<button type="button" class="nfd-deactivation-survey-action" nfd-deactivation-survey-skip aria-label="${ runtimeData.strings.skipAriaLabel }">${ runtimeData.strings.skip }</button>
							<select id="deactivation-duration" name="deactivation_duration" class="nfd-deactivation-duration">
								<option value=${ runtimeData.strings.durationOption1Value }>${ runtimeData.strings.durationOption1 }</option>
								<option value=${ runtimeData.strings.durationOption2Value }>${ runtimeData.strings.durationOption2 }</option>
								<option value=${ runtimeData.strings.durationOption3Value } selected>${ runtimeData.strings.durationOption3 }</option>
							</select>
							<input type="submit" value="${ runtimeData.strings.submit }" nfd-deactivation-survey-submit class="button button-primary" aria-label="${ runtimeData.strings.submitAriaLabel }"/>
						</div>
					</div></div>
				</form>
                <span class="nfd-deactivation-survey_loading nfd-hidden"></span>
            </div>
		`;
		return content;
	};

	const getDialogHTML = () => {
		const content = `
			<div class="nfd-deactivation-survey__overlay" nfd-deactivation-survey-destroy></div>
			<div class="nfd-deactivation-survey__container" role="document" data-step="1">
				${ getSureContent() }
				${ getSurveyContent() }
			</div>
			<div class="nfd-deactivation-survey__disabled nfd-hidden"></div>
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
		let deactivationDuration = '';
		if ( ! skipped ) {
			const inputValue = document.getElementById(
				'nfd-deactivation-survey__input'
			).value;
			if ( inputValue.length > 0 ) {
				surveyInput = inputValue;
			}
			deactivationDuration = document.getElementById(
				'deactivation-duration'
			).value;
		}

		// Send event
		const sendSurveyInput = await sendEvent( surveyInput,'');
		const sendDeactivationDuration = await sendEvent( '', deactivationDuration);
		deactivatePlugin();
	};

	const sendEvent = async ( surveyInput = '', deactivationDuration = '' ) => {
		const eventData = {
			label_key: surveyInput ? 'survey_input' : 'deactivation_duration',
			category: 'user_action',
			brand: runtimeData.brand,
			page: window.location.href,
			...surveyInput && { survey_input: surveyInput },
			...deactivationDuration && { deactivation_duration: deactivationDuration },
		};

		// Attach abTestPluginHome flag value if exists
		if ( typeof getABTestPluginHome() === 'boolean' ) {
			eventData.abTestPluginHome = getABTestPluginHome();
		}
		const actionName = surveyInput ? 'deactivation_survey_freeform' : 'deactivation_duration';
		await fetch( runtimeData.eventsEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': runtimeData.restApiNonce,
			},
			body: JSON.stringify( {
				action: actionName,
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
		const container = document.querySelector(
			'.nfd-deactivation-survey__container'
		);
		const sure = document.querySelector( '.nfd-deactivation-sure' );
		const survey = document.querySelector( '.nfd-deactivation-survey' );
		// update container with data setp 2
		container.setAttribute( 'data-step', '2' );

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
