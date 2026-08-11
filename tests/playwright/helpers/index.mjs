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
const clearInstallerQueues = newfold.clearInstallerQueues;

/**
 * Get deactivation link for plugin
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginId - Plugin ID
 * @returns {import('@playwright/test').Locator} Deactivation link locator
 */
const getDeactivationLink = (page, pluginId) => {
  return page.locator(`.deactivate a[id*="${pluginId}"]`);
};

/**
 * Get activation link for plugin
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginId - Plugin ID
 * @returns {import('@playwright/test').Locator} Activation link locator
 */
const getActivationLink = (page, pluginId) => {
  return page.locator(`.activate a[id*="${pluginId}"]`);
};

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
};

/**
 * Verify plugin is deactivated via wp-admin interface
 *
 * Assert the Activate link is present first. Checking only that Deactivate is
 * missing also matches a blank/loading plugins page mid-navigation after Skip
 * or Submit redirects via window.location.href — the intermittent CI failure
 * mode for this suite.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginId - Plugin ID
 */
const verifyPluginDeactivated = async (page, pluginId) => {
  fancyLog('Verifying Plugin is Not Active');
  const activateLink = getActivationLink(page, pluginId);
  // Deactivation is a full plugins.php round-trip (including flush_rewrite_rules
  // in on_deactivate). Allow the same budget as a test-level action, not the
  // default 5s expect timeout.
  await expect(activateLink).toBeVisible({ timeout: 30000 });

  const deactivateLink = getDeactivationLink(page, pluginId);
  await expect(deactivateLink).not.toBeVisible();
};

/**
 * Verify plugin is active via wp-admin interface
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginId - Plugin ID
 */
const verifyPluginActive = async (page, pluginId) => {
  fancyLog('Verifying Plugin is Active');
  const deactivateLink = getDeactivationLink(page, pluginId);
  await expect(deactivateLink).toBeVisible({ timeout: 30000 });

  const activateLink = getActivationLink(page, pluginId);
  await expect(activateLink).not.toBeVisible();
};

/**
 * Activate plugin via wp-admin interface
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginId - Plugin ID
 */
const activatePlugin = async (page, pluginId) => {
  fancyLog('Clicking Activate Link to Activate Plugin');
  const activateLink = getActivationLink(page, pluginId);
  // Do not waitForURL(/plugins\.php/) here — the page is already on plugins.php,
  // so that waiter resolves immediately and races the activate redirect.
  await activateLink.click();
  await verifyPluginActive(page, pluginId);
};

/**
 * Resolve the installed plugin slug for a brand pluginId.
 *
 * Local wp-env mounts the checkout as `bluehost-wordpress-plugin`. CI rsyncs
 * into `$DIST/wp-plugin-bluehost` (github.repository basename), so a hardcoded
 * path silently fails `wp plugin activate` there. Once a prior test leaves the
 * plugin inactive, the next beforeEach cannot recover — which is how Skip
 * flakes cascade into Submit.
 *
 * @param {string} pluginId - Plugin ID (e.g. 'bluehost')
 * @returns {Promise<string>} WP-CLI plugin slug (directory name)
 */
const resolvePluginSlug = async (pluginId) => {
  const raw = await wpCli('plugin list --format=json --skip-plugins --skip-themes', {
    failOnNonZeroExit: true,
  });
  const plugins = JSON.parse(typeof raw === 'string' ? raw : '[]');
  const preferred = [
    `wp-plugin-${pluginId}`,
    `${pluginId}-wordpress-plugin`,
  ];
  const match =
    preferred
      .map((name) => plugins.find((plugin) => plugin.name === name))
      .find(Boolean) ||
    plugins.find(
      (plugin) =>
        plugin.name.includes(pluginId) ||
        plugin.name.includes(`wp-plugin-${pluginId}`)
    );

  if (!match) {
    throw new Error(
      `Could not resolve plugin slug for "${pluginId}". Installed: ${plugins
        .map((plugin) => plugin.name)
        .join(', ')}`
    );
  }

  return match.name;
};

/**
 * Activate plugin via CLI
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginId - Plugin ID
 */
const activatePluginViaCLI = async (page, pluginId) => {
  fancyLog('Activating Plugin via CLI');
  const pluginSlug = await resolvePluginSlug(pluginId);
  // --skip-plugins: change active_plugins without bootstrapping a stack that may
  // currently be fataling (e.g. after a partial installer run).
  await wpCli(`plugin activate ${pluginSlug} --skip-plugins --skip-themes`, {
    failOnNonZeroExit: true,
  });
};

/**
 * Run a Skip/Submit action and wait until deactivation has finished.
 *
 * Skip/Submit set window.location.href to the deactivate URL. Waiting for the
 * modal to disappear is not enough — that passes as soon as the old document is
 * torn down. waitForURL(/plugins.php/) is also unsafe here because the page is
 * already on plugins.php, so the waiter can resolve before the redirect runs.
 * Wait for the Activate link instead (the post-deactivation plugins list).
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginId - Plugin ID
 * @param {() => Promise<void>} action - Click that starts deactivation
 */
const waitForDeactivationNavigation = async (page, pluginId, action) => {
  await action();
  await verifyPluginDeactivated(page, pluginId);
};

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
  resolvePluginSlug,
  waitForDeactivationNavigation,
  clearInstallerQueues,
};
