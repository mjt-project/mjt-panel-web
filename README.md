# MJT Panel Web

**Version:** `3.0.0-SNAPSHOT+1`  
**Type:** Static frontend repository for Mini Java Terminal

MJT Panel Web is a lightweight static web dashboard for Mini Java Terminal.  
It is designed to be served by the MJT Java core from:

```text
/home/container/MJT/panel/static
```

This frontend does not start Minecraft servers by itself.  
It calls MJT API endpoints exposed by `PanelService`.

---

## Features

- Token login
- Dashboard overview
- Multi Minecraft profile list
- Start / stop / kill selected profile
- Console log viewer
- Send console command
- Files page shell
- Backups page shell
- Players page shell
- Network / tunnel page shell
- Settings page shell
- System page shell
- Demo mode when API is unavailable
- No build step required

---

## Folder Layout

```text
mjt-panel-web/
├── index.html
├── panel.json
├── README.md
├── CHANGE.md
├── LICENSE
└── assets/
    ├── app.js
    └── style.css
```

---

## Install Into MJT

Copy this repository content into:

```text
/home/container/MJT/panel/static
```

Or install from a release zip later:

```text
.mjt panel install
.mjt panel update
```

---

## Expected MJT API

```text
GET  /api/auth/check
GET  /api/status
GET  /api/minecraft/profiles
GET  /api/minecraft/status
GET  /api/minecraft/logs?profile=<name>
POST /api/minecraft/start
POST /api/minecraft/stop
POST /api/minecraft/kill
POST /api/minecraft/send
```

Optional future APIs:

```text
GET  /api/files/list
GET  /api/files/read
POST /api/files/write
GET  /api/backups/list
POST /api/backups/create
GET  /api/network/status
GET  /api/system/status
```

---

## Auth

The frontend sends the token using:

```text
X-MJT-Token: <token>
Authorization: Bearer <token>
Cookie: MJT_TOKEN=<token>
```

---

## Development

No Node.js build is required.  
Open `index.html` directly for layout preview, or serve it through MJT PanelService.

---

## License

MIT
