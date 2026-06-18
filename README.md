# MJT Panel Web

**Version:** `0.0.4`  
**Focus:** Modular frontend structure for easier development.

This release restructures the panel web into folders by function. `index.html` is now only a small boot file. Login/auth logic lives in its own folder.

## Run locally

```bash
python3 -m http.server 5173
```

Open:

```text
http://127.0.0.1:5173
```

For local dev login:

```text
Token: dev
```

The token `dev` enables mock API mode automatically on localhost / 127.0.0.1.

## Folder layout

```text
mjt-panel-web/
├── index.html
├── panel.json
├── styles/
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   └── pages.css
└── src/
    ├── main.js
    ├── app/
    ├── services/
    ├── features/
    │   ├── auth/
    │   ├── layout/
    │   ├── dashboard/
    │   ├── servers/
    │   ├── installer/
    │   ├── console/
    │   └── placeholder/
    ├── ui/
    └── utils/
```

## Design rule

- Auth-related logic goes into `src/features/auth/`.
- API calls go into `src/services/`.
- Page rendering goes into `src/features/<page>/`.
- Shared UI components go into `src/ui/`.
- Shared app state goes into `src/app/state.js`.
- `index.html` should not contain page markup.

## License

MIT
