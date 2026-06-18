# MJT Panel Web

**Version:** `0.0.6`  
**Focus:** Light UI first + modular panel development.

This is a frontend-only static panel for Mini Java Terminal. It uses Tailwind CSS through CDN, so no npm build step is required.

## Run locally

```bash
python3 -m http.server 5173
```

Open:

```text
http://127.0.0.1:5173
```

Local dev login:

```text
Token: dev
```

## Structure

```text
index.html
styles/theme.css
src/main.js
src/app/
src/services/
src/features/auth/
src/features/layout/
src/features/dashboard/
src/features/servers/
src/features/installer/
src/features/console/
src/features/files/
src/features/placeholder/
src/ui/
src/utils/
```

## File Manager API expected later

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

## License

MIT
