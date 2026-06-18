# MJT Panel Web

**Version:** `0.0.14`  
**Stack:** React + TypeScript + Vite + Mantine  
**Runtime:** Static files served by MJT Java Core

MJT Panel Web is the frontend for Mini Java Terminal. It is developed as a proper React application, but the MJT host only serves the compiled `dist/` files. Node.js and Vite are not required on the runtime host.

## Panel areas

| Area | UI status | Core API status |
|---|---:|---:|
| Login | Ready | Ready |
| Dashboard | Ready | Ready |
| Servers | Ready | Ready |
| Installer | Ready | Ready |
| Console | Ready | Ready |
| Files | Ready | Basic API required |
| Backups | Ready | Future API required |
| Players | Ready | Future API required |
| Network | Ready | Future API required |
| Settings | Ready | Browser preferences now |
| System | Ready | Future API optional |

## Development

```bash
npm ci
npm run dev
```

Open the Vite URL. Use **Demo Mode** for UI work with mock data.

To build the static release:

```bash
npm run check
npm run build
```

The output is created in:

```text
dist/
```

## Runtime installation

MJT Java Core should download the built release archive and extract it to:

```text
/home/container/MJT/panel/static/
```

The directory must contain `index.html` at its root.

## UI source layout

```text
src/
├── api/           # MJT API client, mock API, types
├── app/           # app shell and page routing
├── features/      # one folder per panel area
│   ├── auth/
│   ├── dashboard/
│   ├── servers/
│   ├── installer/
│   ├── console/
│   ├── files/
│   ├── backups/
│   ├── players/
│   ├── network/
│   ├── settings/
│   └── system/
├── shared/        # reusable UI components
└── theme/         # Mantine theme and global CSS
```

## Security model

- Panel uses the MJT token with `X-MJT-Token` and `Authorization: Bearer` headers.
- File operations must stay inside the selected profile workdir.
- Dangerous server, file and backup actions need confirmation.
- Public exposure should be explicit and separate from local panel defaults.

## License

MIT
