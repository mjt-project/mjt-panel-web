# MJT Panel Web 0.0.5

Tailwind CDN + modular frontend for Mini Java Terminal.

## Local dev

```bash
python3 -m http.server 5173
```

Open:

```text
http://127.0.0.1:5173
```

Use token:

```text
dev
```

The token `dev` enables mock API mode on localhost.

## Folder layout

```text
src/
  app/                 App state and router
  services/            API client, mock API, storage
  features/auth/       Login and local dev auth
  features/layout/     Shell layout
  features/dashboard/  Dashboard view
  features/servers/    Servers view
  features/installer/  Installer view
  features/console/    Console view
  features/files/      File manager view/controller
  ui/                  Shared UI components
  utils/               Helpers
```

## File manager expected APIs

```text
GET  /api/files/list?profile=<profile>&path=<path>
GET  /api/files/read?profile=<profile>&path=<path>
POST /api/files/write
POST /api/files/mkdir
POST /api/files/create
POST /api/files/delete
POST /api/files/rename
GET  /api/files/download?profile=<profile>&path=<path>
```

All file APIs should be jailed by the MJT Java core to the selected Minecraft profile workdir.

## Notes

This version uses Tailwind Play CDN for zero-build frontend development.
