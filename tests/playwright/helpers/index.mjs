/**
 * Deactivation Module Test Helpers for Playwright
 *
 * Bigrock override: PLUGIN_ID is `bigrock_in` (admin page slug) but the installed
 * plugin directory is `wp-plugin-bigrock`. Vendor resolvePluginSlug only matches
 * `wp-plugin-${pluginId}`, which fails for regional brand IDs.
 */
import { expect } from '@playwright/test';
import { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);

const pluginDir = process.env.PLUGIN_DIR || process.cwd();
const finalHelpersPath = join(pluginDir, 'tests/playwright/helpers/index.mjs');
const helpersUrl = pathToFileURL(finalHelpersPath).href;
const pluginHelpers = await import(helpersUrl);

let { auth, wordpress, newfold, a11y, utils } = pluginHelpers;
const { wpCli } = wordpress;
const { fancyLog } = utils;
const clearInstallerQueues = newfold.clearInstallerQueues;

const getDeactivationLink = (page, pluginId) => {
  return page.locator(`.deactivate a[id*="${pluginId}"]`);
};

const getActivationLink = (page, pluginId) => {
  return page.locator(`.activate a[id*="${pluginId}"]`);
};

const triggerDeactivationModal = async (page, pluginId) => {
  fancyLog('Clicking Deactivate link to Open Deactivation Modal');
  const deactivateLink = getDeactivationLink(page, pluginId);
  await deactivateLink.click();
};

const verifyPluginDeactivated = async (page, pluginId) => {
  fancyLog('Verifying Plugin is Not Active');
  const activateLink = getActivationLink(page, pluginId);
  await expect(activateLink).toBeVisible({ timeout: 30000 });

  const deactivateLink = getDeactivationLink(page, pluginId);
  await expect(deactivateLink).not.toBeVisible();
};

const verifyPluginActive = async (page, pluginId) => {
  fancyLog('Verifying Plugin is Active');
  const deactivateLink = getDeactivationLink(page, pluginId);
  await expect(deactivateLink).toBeVisible({ timeout: 30000 });

  const activateLink = getActivationLink(page, pluginId);
  await expect(activateLink).not.toBeVisible();
};

const activatePlugin = async (page, pluginId) => {
  fancyLog('Clicking Activate Link to Activate Plugin');
  const activateLink = getActivationLink(page, pluginId);
  await activateLink.click();
  await verifyPluginActive(page, pluginId);
};

/**
 * @param {string} pluginId - Brand admin page ID (e.g. bigrock_in)
 * @returns {Promise<string>} WP-CLI plugin slug (directory name)
 */
const resolvePluginSlug = async (pluginId) => {
  const raw = await wpCli('plugin list --format=json --skip-plugins --skip-themes', {
    failOnNonZeroExit: true,
  });
  const plugins = JSON.parse(typeof raw === 'string' ? raw : '[]');

  // Regional brands use admin IDs like bigrock_in but install as wp-plugin-bigrock.
  const brandBase = pluginId.replace(/_[a-z]{2}$/i, '');
  const preferred = [
    process.env.PLUGIN_SLUG,
    `wp-plugin-${pluginId}`,
    `${pluginId}-wordpress-plugin`,
    brandBase !== pluginId ? `wp-plugin-${brandBase}` : null,
  ].filter(Boolean);

  const match =
    preferred
      .map((name) => plugins.find((plugin) => plugin.name === name))
      .find(Boolean) ||
    plugins.find((plugin) =>
      [pluginId, brandBase, `wp-plugin-${pluginId}`, `wp-plugin-${brandBase}`].some(
        (candidate) => candidate && plugin.name.includes(candidate),
      ),
    );

  if (!match) {
    throw new Error(
      `Could not resolve plugin slug for "${pluginId}". Installed: ${plugins
        .map((plugin) => plugin.name)
        .join(', ')}`,
    );
  }

  return match.name;
};

const activatePluginViaCLI = async (page, pluginId) => {
  fancyLog('Activating Plugin via CLI');
  const pluginSlug = await resolvePluginSlug(pluginId);
  await wpCli(`plugin activate ${pluginSlug} --skip-plugins --skip-themes`, {
    failOnNonZeroExit: true,
  });
};

const waitForDeactivationNavigation = async (page, pluginId, action) => {
  await action();
  await verifyPluginDeactivated(page, pluginId);
};

export {
  auth,
  wordpress,
  newfold,
  a11y,
  utils,
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
