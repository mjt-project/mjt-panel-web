# CHANGE.md

## 0.0.15 - Server-first UX rebuild

### Changed

- Removed the crowded always-visible left sidebar.
- Rebuilt the first screen after login around only three actions:
  - welcome
  - create server
  - select an existing server
- Clicking a server now opens a dedicated management workspace.

### Added

- Dedicated server detail layout with tabs:
  - Overview
  - Console
  - Files
  - Backups
  - Settings
- Professional create-server modal for Velocity, Paper and Purpur.
- Clear danger handling: Kill is hidden inside a menu and requires confirmation.
- Capability-aware Files tab, which does not call missing APIs.
- Error boundary so a runtime exception does not become a blank page.
- Local mock/demo mode with `dev` token.

### UX decisions

- Start is the primary action only when the server is stopped.
- Stop is a quiet secondary action when the server is running.
- Restart and Kill are grouped in a More menu.
- Unfinished backend features do not show 404 errors to the user.
