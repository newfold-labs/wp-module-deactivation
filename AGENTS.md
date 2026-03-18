# Agent guidance – wp-module-deactivation

This file gives AI agents a quick orientation to the repo. For full detail, see the **docs/** directory.

## What this project is

- **wp-module-deactivation** – Handles WordPress brand plugin and module deactivation. Hooks into `newfold_container_set`, registers the plugin’s deactivation hook (to disable coming soon, clear transients, etc.), and loads a deactivation survey on the plugins screen. Requires wp-module-data. Maintained by Newfold Labs.

- **Stack:** PHP 7.3+. Depends on `newfold-labs/wp-module-data`.

- **Architecture:** On `newfold_container_set`, defines `NFD_DEACTIVATION_DIR` and instantiates `Deactivation( $container )`, which registers `register_deactivation_hook` and adds the DeactivationSurvey on `admin_head-plugins.php`.

## Key paths

| Purpose | Location |
|---------|----------|
| Bootstrap | `bootstrap.php` |
| Deactivation logic | `includes/Deactivation.php` – on_deactivate, survey |
| Survey | `includes/DeactivationSurvey.php` (and related) |
| Tests | `tests/` |

## Essential commands

```bash
composer install
composer run lint
composer run fix
composer run test
composer run i18n
```

## Documentation

- **Full documentation** is in **docs/**. Start with **docs/index.md**.
- **CLAUDE.md** is a symlink to this file (AGENTS.md).

---

## Keeping documentation current

When you change code, features, or workflows, update the docs. Keep **docs/index.md** current: when you add, remove, or rename doc files, update the table of contents (and quick links if present). When cutting a release, update **docs/changelog.md**.
