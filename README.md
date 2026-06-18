# MJT Panel Web

Version: `0.0.10`  
Focus: Vanilla CSS + Anime.js, no Tailwind.

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

## Notes

- No Tailwind CSS.
- No build step.
- Anime.js is loaded from CDN and used only for small UI transitions.
- If Anime.js fails to load, the panel still works.
- `index.html` is small and all logic is split into feature folders.

## Folder layout

```text
src/
  app/
  services/
  features/
    auth/
    layout/
    dashboard/
    servers/
    installer/
    console/
    files/
    placeholder/
  ui/
  utils/
styles/app.css
```

## Release URL example

```text
https://github.com/mjt-project/mjt-panel-web/archive/refs/tags/0.1.0.zip
```
