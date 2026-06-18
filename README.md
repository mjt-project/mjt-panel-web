# MJT Panel Web

**Version:** `0.0.12`  
**Type:** Static frontend — no npm install or build step required.

This version resets the visual direction of MJT Panel into a calmer, light-first game-server admin interface. It takes broad UX inspiration from modern server panels: quiet navigation, a clear content hierarchy, compact status indicators, and one primary action per context. It does **not** include or copy Calagopus source code or assets.

## Run locally

```bash
python3 -m http.server 5173
```

Open `http://127.0.0.1:5173`.

For local UI development, sign in with:

```text
Token: dev
```

That enables Mock Mode. No MJT Java core is needed.

## Design choices

- **Be Vietnam Pro** via Google Fonts CDN for UI text.
- **JetBrains Mono** for console and code surfaces.
- Vanilla CSS with internal design tokens: no Tailwind.
- Anime.js is optional and only improves subtle transitions.
- Start is the sole positive primary server action.
- Stop is a neutral secondary action.
- Kill is placed in a quiet “More” menu to reduce accidental destructive clicks.
- File Manager does not call a missing API automatically; it waits for an explicit user action.

## Project structure

```text
src/
├── app/          # application controller and shared state
├── features/     # page-level UI and interaction modules
│   ├── auth/
│   ├── dashboard/
│   ├── servers/
│   ├── installer/
│   ├── console/
│   └── files/
├── services/     # API, mock API, browser storage
└── ui/           # toast and motion helpers
styles/
├── tokens.css
└── app.css
```

## Expected API

```text
GET  /api/auth/check
GET  /api/status
GET  /api/minecraft/status
GET  /api/minecraft/logs?profile=<profile>
POST /api/minecraft/start
POST /api/minecraft/stop
POST /api/minecraft/kill
POST /api/minecraft/send
POST /api/minecraft/install

GET  /api/files/list?profile=<profile>&path=<path>
GET  /api/files/read?profile=<profile>&path=<path>
POST /api/files/write
POST /api/files/create
POST /api/files/mkdir
POST /api/files/delete
```

## Install into MJT

Extract the release contents into:

```text
/home/container/MJT/panel/static
```

## License

MIT
