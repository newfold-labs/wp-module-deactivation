import { test, expect } from '@playwright/test';
import {
  auth,
  triggerDeactivationModal,
  verifyPluginActive,
  activatePluginViaCLI,
  waitForDeactivationNavigation,
  clearInstallerQueues,
} from '../helpers';

// Use environment variable to resolve plugin helpers
const pluginId = process.env.PLUGIN_ID || 'bluehost';

test.describe('Plugin Deactivation Survey', () => {
  let surveyRuntimeData;

  test.beforeEach(async ({ page }) => {
    // Drop any installer work left by earlier projects before we activate.
    await clearInstallerQueues();

    // Login to WordPress
    await auth.loginToWordPress(page);
    await activatePluginViaCLI(page, pluginId);
    // Activating can re-seed the installer queue — clear again so a mid-suite
    // install cannot race the plugins screen during Skip/Submit.
    await clearInstallerQueues();

    // Navigate to plugins page
    await page.goto('/wp-admin/plugins.php');
    await page.waitForLoadState('load');
    // Own the active-plugin precondition here. CLI activate used to hardcode the
    // local directory name and fail silently on CI's wp-plugin-* install path, so
    // a prior test that left the plugin inactive cascaded into "Deactivate link
    // not found" on the next test.
    await verifyPluginActive(page, pluginId);

    // Get survey runtime data
    surveyRuntimeData = await page.evaluate(() => {
      return window.NewfoldRuntime?.data || {};
    });

    // Setup API intercepts
    await page.route('**/newfold-data/v1/events**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
  });

  test('Modal opens and closes properly', async ({ page }) => {
    // Define selectors for better readability
    const modalContainer = '.nfd-deactivation-survey__container';
    const overlay = '.nfd-deactivation-survey__overlay';
    const step1CancelButton = '.nfd-deactivation-sure button[nfd-deactivation-survey-destroy]';
    const step1ContinueButton = '.nfd-deactivation-sure button[nfd-deactivation-survey-next]';
    const step2CancelButton = '.nfd-deactivation-survey button[nfd-deactivation-survey-destroy]';
    
    // Ensure no modal is open before starting
    const existingModal = page.locator(modalContainer);
    if (await existingModal.isVisible()) {
      await page.locator(step1CancelButton).click();
      await page.waitForTimeout(500);
    }
    
    // Test overlay click
    await triggerDeactivationModal(page, pluginId);
    
    // Verify modal is open
    await expect(page.locator('body')).toHaveClass(/nfd-noscroll/);
    await expect(page.locator(modalContainer)).toBeVisible();
    await expect(page.locator(overlay)).toHaveCount(1);
    
    // Click overlay to close modal
    const overlayElement = page.locator(overlay);
    const overlayBox = await overlayElement.boundingBox();
    await page.mouse.click(overlayBox.x + 100, overlayBox.y + 100);
    await page.waitForTimeout(500);
    
    // Verify modal closed and plugin still active
    await expect(page.locator(modalContainer)).not.toBeVisible();
    await verifyPluginActive(page, pluginId);

    // Test step 1 cancel button click
    await triggerDeactivationModal(page, pluginId);
    await page.locator(step1CancelButton).click();
    await expect(page.locator(modalContainer)).not.toBeVisible();
    await verifyPluginActive(page, pluginId);

    // Test ESC key press (step 1)
    await triggerDeactivationModal(page, pluginId);
    await page.keyboard.press('Escape');
    await expect(page.locator(modalContainer)).not.toBeVisible();
    await verifyPluginActive(page, pluginId);

    // Test step 2 cancel button click
    await triggerDeactivationModal(page, pluginId);
    await page.locator(step1ContinueButton).click();
    await page.locator(step2CancelButton).click();
    await expect(page.locator(modalContainer)).not.toBeVisible();
    await verifyPluginActive(page, pluginId);

    // Test ESC key press (step 2)
    await triggerDeactivationModal(page, pluginId);
    await page.locator(step1ContinueButton).click();
    await page.keyboard.press('Escape');
    await expect(page.locator(modalContainer)).not.toBeVisible();
    await verifyPluginActive(page, pluginId);
  });

  test('Modal content renders correctly', async ({ page }) => {
    // Define selectors for better readability
    const modalContainer = '.nfd-deactivation-survey__container';
    const step1ContinueButton = '.nfd-deactivation-sure button[nfd-deactivation-survey-next]';
    const step2CancelButton = '.nfd-deactivation-survey button[nfd-deactivation-survey-destroy]';
    
    // Step 1 content renders correctly
    await triggerDeactivationModal(page, pluginId);
    
    // Check step 1 elements exist
    const step1Title = page.locator('.nfd-deactivation-sure .nfd-deactivation__header-title');
    const step1Subtitle = page.locator('.nfd-deactivation-sure .nfd-deactivation__header-subtitle');
    const step1Cards = page.locator('.nfd-deactivation-sure .nfd-deactivation__cards');
    const step1HelpText = page.locator('.nfd-deactivation-sure .nfd-deactivation__helptext');
    const step1CancelBtn = page.locator('.nfd-deactivation-sure button[nfd-deactivation-survey-destroy]');
    const step1ContinueBtn = page.locator('.nfd-deactivation-sure button[nfd-deactivation-survey-next]');
    
    await expect(step1Title).toBeVisible();
    await expect(step1Subtitle).toBeVisible();
    await expect(step1Cards).toBeVisible();
    await expect(step1HelpText).toBeVisible();
    await expect(step1CancelBtn).toBeVisible();
    await expect(step1ContinueBtn).toBeVisible();
    
    // Check content matches deactivation runtime data
    if (surveyRuntimeData && surveyRuntimeData.strings) {
      await expect(step1Title).toContainText(surveyRuntimeData.strings.sureTitle);
    }

    // Step 2 content renders correctly
    await page.locator(step1ContinueButton).click();
    
    // Check step 2 elements exist
    const step2Title = page.locator('.nfd-deactivation-survey .nfd-deactivation__header-title');
    const step2Subtitle = page.locator('.nfd-deactivation-survey .nfd-deactivation__header-subtitle');
    const step2Label = page.locator('.nfd-deactivation-survey .nfd-deactivation-label');
    const step2Textarea = page.locator('.nfd-deactivation-survey .nfd-deactivation-textarea');
    const step2CancelBtn = page.locator('.nfd-deactivation-survey button[nfd-deactivation-survey-destroy]');
    const step2SubmitBtn = page.locator('.nfd-deactivation-survey input[nfd-deactivation-survey-submit]');
    const step2SkipBtn = page.locator('.nfd-deactivation-survey button[nfd-deactivation-survey-skip]');
    
    await expect(step2Title).toBeVisible();
    await expect(step2Subtitle).toBeVisible();
    await expect(step2Label).toBeVisible();
    await expect(step2Textarea).toBeVisible();
    await expect(step2CancelBtn).toBeVisible();
    await expect(step2SubmitBtn).toBeVisible();
    await expect(step2SkipBtn).toBeVisible();
    
    // Check content matches deactivation runtime data
    if (surveyRuntimeData && surveyRuntimeData.strings) {
      await expect(step2Title).toContainText(surveyRuntimeData.strings.surveyTitle);
    }
    
    // Close modal
    await page.locator(step2CancelButton).click();
    await expect(page.locator(modalContainer)).not.toBeVisible();
  });

  test('Skip action works and deactivates plugin', async ({ page }) => {
    test.setTimeout(60000);
    // Define selectors
    const modalContainer = '.nfd-deactivation-survey__container';
    const step1ContinueButton = 'button[nfd-deactivation-survey-next]';
    const step2SkipButton = 'button[nfd-deactivation-survey-skip]';

    // Skip action works
    await triggerDeactivationModal(page, pluginId);
    await page.locator(step1ContinueButton).click();

    // Set up request interception BEFORE triggering the action
    const requestPromise = page.waitForRequest(request =>
      request.url().includes('/newfold-data/v1/events') && request.method() === 'POST'
    );

    // Skip redirects via window.location.href — wait for the plugins-page reload,
    // not a fixed timeout after "modal gone" (that passes on document teardown).
    const [request] = await Promise.all([
      requestPromise,
      waitForDeactivationNavigation(page, pluginId, async () => {
        await page.locator(step2SkipButton).click();
      }),
    ]);

    // Validate the request payload
    const requestBody = request.postDataJSON();
    expect(requestBody.data.survey_input).toBe('(Skipped)');

    // waitForDeactivationNavigation already asserted the Activate link; confirm
    // the survey UI is gone on the reloaded plugins page.
    await expect(page.locator(modalContainer)).not.toBeVisible();

    // Reactivate via CLI (not the plugins-row UI). UI activation re-runs plugin
    // bootstrap, which re-seeds the installer queue; a fast cron install of a
    // companion plugin has been observed to fatal this screen before the next test.
    await activatePluginViaCLI(page, pluginId);
    await clearInstallerQueues();
  });

  test('Modal Submit survey action works', async ({ page }) => {
    test.setTimeout(60000);
    // Define selectors
    const modalContainer = '.nfd-deactivation-survey__container';
    const step1ContinueButton = 'button[nfd-deactivation-survey-next]';
    const surveyTextarea = '#nfd-deactivation-survey__input';
    const submitButton = 'input[nfd-deactivation-survey-submit]';

    // Open modal and go to step 2
    await triggerDeactivationModal(page, pluginId);
    await page.locator(step1ContinueButton).click();

    // Enter reason and submit
    const ugcReason = 'automated testing';
    await page.locator(surveyTextarea).fill(ugcReason);

    // Set up request interception BEFORE triggering the action
    const requestPromise = page.waitForRequest(request =>
      request.url().includes('/newfold-data/v1/events') && request.method() === 'POST'
    );

    const [request] = await Promise.all([
      requestPromise,
      waitForDeactivationNavigation(page, pluginId, async () => {
        await page.locator(submitButton).click();
      }),
    ]);

    // Validate the request payload
    const requestBody = request.postDataJSON();
    expect(requestBody.data.survey_input).toBe(ugcReason);

    await expect(page.locator(modalContainer)).not.toBeVisible();

    await activatePluginViaCLI(page, pluginId);
    await clearInstallerQueues();
  });
});
