# CHANGE.md

## 0.0.14 — Complete Panel UI Setup

This release completes the **frontend UI structure** for all planned panel areas.

### Fully set up in the UI

- Login and Demo Mode
- Dashboard
- Server profiles
- Velocity / Paper / Purpur installer
- Console
- File Manager
  - browse folders
  - open and edit files
  - save files
  - create file/folder
  - rename
  - delete confirmation
- Backups
  - list
  - create
  - restore confirmation
  - delete confirmation
- Players
  - online/offline list
  - kick / ban / OP / whitelist action UI
- Network
  - panel access, tunnel, gateway and port overview
- Settings
  - API base and browser-side panel preferences
- System
  - MJT Core, Java, memory, disk and frontend health overview

### Architecture

- React + TypeScript + Vite + Mantine
- Static build only at runtime
- Feature-first folders under `src/features/`
- Mock API covers every current UI page in Demo Mode
- Java Core APIs are connected when available; missing future endpoints only affect their own pages

### Notes

This is a **complete UI setup** release. Some pages are ready for real MJT API bindings that may be implemented in Java Core later:

```text
/api/backups/*
/api/players/*
/api/network/status
/api/system/status
/api/files/create
/api/files/mkdir
/api/files/rename
/api/files/delete
```
