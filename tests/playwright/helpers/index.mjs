/**
 * Deactivation Module Test Helpers for Playwright
 * 
 * Utilities for testing the Deactivation module functionality.
 * Includes plugin activation/deactivation helpers and survey interactions.
 */
import { expect } from '@playwright/test';
import { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);

// Resolve plugin directory from PLUGIN_DIR env var (set by playwright.config.mjs) or process.cwd()
const pluginDir = process.env.PLUGIN_DIR || process.cwd();

// Build path to plugin helpers (.mjs extension for ES module compatibility)
const finalHelpersPath = join(pluginDir, 'tests/playwright/helpers/index.mjs');

// Import plugin helpers using file:// URL
const helpersUrl = pathToFileURL(finalHelpersPath).href;
const pluginHelpers = await import(helpersUrl);
// destructure pluginHelpers
let { auth, wordpress, newfold, a11y, utils } = pluginHelpers;
// destructure wpCli from wordpress
const { wpCli } = wordpress;
const { fancyLog } = utils;

/**
 * Get deactivation link for plugin
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginId - Plugin ID
 * @returns {import('@playwright/test').Locator} Deactivation link locator
 */
const getDeactivationLink = (page, pluginId) => {
    return page.locator(`.deactivate a[id*="${pluginId}"]`);
  }
  
  /**
   * Get activation link for plugin
   * 
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {string} pluginId - Plugin ID
   * @returns {import('@playwright/test').Locator} Activation link locator
   */
  const getActivationLink = (page, pluginId) => {
    return page.locator(`.activate a[id*="${pluginId}"]`);
  }
  
  /**
   * Trigger deactivation modal
   * 
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {string} pluginId - Plugin ID
   */
  const triggerDeactivationModal = async (page, pluginId) => {
    fancyLog('Clicking Deactivate link to Open Deactivation Modal');
    const deactivateLink = getDeactivationLink(page, pluginId);
    await deactivateLink.click();
  }
  
  /**
   * Verify plugin is deactivated via wp-admin interface
   * 
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {string} pluginId - Plugin ID
   */
  const verifyPluginDeactivated = async (page, pluginId) => {
    fancyLog('Verifying Plugin is Not Active');
    const deactivateLink = getDeactivationLink(page, pluginId);
    await expect(deactivateLink).not.toBeVisible(); // Should not be visible if deactivated
    
    const activateLink = getActivationLink(page, pluginId);
    await expect(activateLink).toBeVisible(); // Should be visible if deactivated
  }
  
  /**
   * Verify plugin is active via wp-admin interface
   * 
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {string} pluginId - Plugin ID
   */
  const verifyPluginActive = async (page, pluginId) => {
    fancyLog('Verifying Plugin is Active');
    const activateLink = getActivationLink(page, pluginId);
    await expect(activateLink).not.toBeVisible();
    
    const deactivateLink = getDeactivationLink(page, pluginId);
    await expect(deactivateLink).toBeVisible();
  }
  
  /**
   * Activate plugin via wp-admin interface
   * 
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {string} pluginId - Plugin ID
   */
  const activatePlugin = async (page, pluginId) => {
    fancyLog('Clicking Activate Link to Activate Plugin');
    const activateLink = getActivationLink(page, pluginId);
    await activateLink.click();
    
    // Wait for activation to complete
    await page.waitForTimeout(1000);
  }

  /**
   * Activate plugin via CLI
   * 
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {string} pluginId - Plugin ID
   */
  const activatePluginViaCLI = async (page, pluginId) => {
    fancyLog('Activating Plugin via CLI');
    const pluginSlug = getPluginSlug(pluginId);
    await wpCli(`plugin activate ${pluginSlug}`);
  }

  /**
   * Get plugin slug from plugin ID
   * 
   * @param {string} pluginId - Plugin ID
   * @returns {string} Plugin slug
   */
  const getPluginSlug = (pluginId) => {
    if (pluginId === 'bluehost' ) {
        return 'bluehost-wordpress-plugin/bluehost-wordpress-plugin.php'; // local
        // return 'wp-plugin-bluehost/wp-plugin-bluehost.php'; // runner
    } else if (pluginId === 'hostgator') {
        return 'wp-plugin-hostgator/wp-plugin-hostgator.php';
    } else if (pluginId === 'crazy-domains') {
        return 'wp-plugin-crazy-domains/wp-plugin-crazy-domains.php';
    } else if (pluginId === 'web') {
        return 'wp-plugin-web/wp-plugin-web.php';
    } else if (pluginId === 'mojo') {
        return 'wp-plugin-mojo/wp-plugin-mojo.php';
    } else {
        throw new Error(`Invalid plugin ID: ${pluginId}`);
    }
  }


export {
    // Plugin helpers (re-exported for convenience)
    auth,
    wordpress,
    newfold,
    a11y,
    utils,
    // module specific helpers
    getDeactivationLink,
    getActivationLink,
    triggerDeactivationModal,
    verifyPluginDeactivated,
    verifyPluginActive,
    activatePlugin,
    activatePluginViaCLI,
    getPluginSlug,
};