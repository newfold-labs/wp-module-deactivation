/**
 * Deactivation Module Test Helpers
 * 
 * Specific utilities for testing the deactivation survey module functionality.
 * Includes modal interactions, plugin state management, and survey form handling.
 */

const { expect } = require('@playwright/test');

/**
 * Get deactivation link for plugin
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginId - Plugin ID
 * @returns {import('@playwright/test').Locator} Deactivation link locator
 */
function getDeactivationLink(page, pluginId) {
  return page.locator(`.deactivate a[id*="${pluginId}"]`);
}

/**
 * Get activation link for plugin
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginId - Plugin ID
 * @returns {import('@playwright/test').Locator} Activation link locator
 */
function getActivationLink(page, pluginId) {
  return page.locator(`.activate a[id*="${pluginId}"]`);
}

/**
 * Trigger deactivation modal
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginId - Plugin ID
 */
async function triggerDeactivationModal(page, pluginId) {
  console.log('Clicking Deactivate link to Open Deactivation Modal');
  const deactivateLink = getDeactivationLink(page, pluginId);
  await deactivateLink.click();
}

/**
 * Verify plugin is deactivated
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginId - Plugin ID
 */
async function verifyPluginDeactivated(page, pluginId) {
  console.log('Verifying Plugin is Not Active');
  const deactivateLink = getDeactivationLink(page, pluginId);
  await expect(deactivateLink).not.toBeVisible(); // Should not be visible if deactivated
  
  const activateLink = getActivationLink(page, pluginId);
  await expect(activateLink).toBeVisible(); // Should be visible if deactivated
}

/**
 * Verify plugin is active
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginId - Plugin ID
 */
async function verifyPluginActive(page, pluginId) {
  console.log('Verifying Plugin is Active');
  const activateLink = getActivationLink(page, pluginId);
  await expect(activateLink).not.toBeVisible();
  
  const deactivateLink = getDeactivationLink(page, pluginId);
  await expect(deactivateLink).toBeVisible();
}

/**
 * Activate plugin
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginId - Plugin ID
 */
async function activatePlugin(page, pluginId) {
  console.log('Clicking Activate Link to Activate Plugin');
  const activateLink = getActivationLink(page, pluginId);
  await activateLink.click();
  
  // Wait for activation to complete
  await page.waitForTimeout(1000);
}

module.exports = {
  getDeactivationLink,
  getActivationLink,
  triggerDeactivationModal,
  verifyPluginDeactivated,
  verifyPluginActive,
  activatePlugin,
};