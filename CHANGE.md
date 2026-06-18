# CHANGE.md

## 0.0.4 - Modular Dev Structure

### Added

- `src/features/auth/` for login/auth/dev-token logic.
- `src/features/layout/` for sidebar/topbar shell.
- Separate page modules for Dashboard, Servers, Installer, Console, and placeholders.
- `src/services/` for API/mock/storage.
- `src/ui/` for reusable UI pieces.
- `src/app/` for app boot, state, router.
- Split CSS files.

### Changed

- `index.html` is now only a minimal boot file.
- Auth login is no longer mixed with page logic.
- Demo/mock mode is controlled by `devAuth.js` and `mockApi.js`.
