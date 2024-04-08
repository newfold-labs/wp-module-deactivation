# WordPress Plugin Deactivation Module
A module for handling WordPress brand plugins and modules deactivations.

## Module Responsibilities

- Display a modal/popup when a user attemps to deactivate the brand plugin on plugins.php page.
- The modal contains two steps. The first one, will bring the user's attention to all the features that brand plugin adds to their site. And the second step is a survey form asking the user for the reason they're deactivating the plugin.
- When the survey is submitted, the response is captured for analytics.
- When the brand plugin is deactivated, the module will set the coming soon option in the database.

## Critical Paths

- On plugins.php page when the user clicks `Deactivate` on the brand plugin, the survey modal should appear.
- In the modal, when the modal clicks `Skip and Deactivate` or `Submit` the modal MUST be closed and the plugin MUST be deactivated.

## Installation

### 1. Add the Newfold Satis to your `composer.json`.

```bash
composer config repositories.newfold composer https://newfold-labs.github.io/satis
```

### 2. Require the `newfold-labs/wp-module-deactivation` package.

```bash
composer require newfold-labs/wp-module-deactivation
```
