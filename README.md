# MJT Panel Web

**Version:** `0.0.15`  
**Design:** Server-first, no crowded sidebar.

MJT Panel Web is a React + Vite + Mantine frontend for MJT.

## Main UX flow

```text
Login
→ Welcome / server list
→ Create server OR select a server
→ Manage one server in its own workspace
→ Overview / Console / Files / Backups / Settings
```

The home page intentionally contains only what matters:

- Welcome and a clear **Create server** action
- Searchable server list
- Server status
- A single **Manage server** action per server

There is no persistent left sidebar full of unfinished features.

## Local development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

Use token `dev` on localhost for mock data.

To proxy API requests to MJT Core:

```bash
MJT_API_TARGET=http://127.0.0.1:9090 npm run dev
```

## Build for MJT runtime

```bash
npm run check
npm run build
```

Upload the contents of `dist/` to a GitHub release asset. The asset must have `index.html` at the root because MJT extracts it into:

```text
/home/container/MJT/panel/static/
```

## API compatibility

Required today:

```text
GET  /api/auth/check
GET  /api/status
GET  /api/minecraft/status
POST /api/minecraft/install
POST /api/minecraft/start
POST /api/minecraft/stop
POST /api/minecraft/restart
POST /api/minecraft/kill
POST /api/minecraft/send
GET  /api/minecraft/logs?profile=<name>
```

Optional capability API:

```text
GET /api/capabilities
```

For Files, MJT Workspace Foundation uses:

```text
GET  /api/workspaces/{id}/files/list?path=
GET  /api/workspaces/{id}/files/read?path=
POST /api/workspaces/{id}/files/write
```

If a feature is not available in core, the panel presents a clear unavailable state instead of calling missing endpoints.

## License

MIT
