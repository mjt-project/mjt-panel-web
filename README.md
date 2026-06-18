# MJT Panel Web

**Version:** `0.0.11`  
**Focus:** UX moodboard and button system

This is the static frontend for Mini Java Terminal.

## Design direction

MJT Panel is now **light-first**. Dark mode will be added later after the UX is stable.

The UI moodboard is:

- clean hosting panel
- calm admin dashboard
- low-glare colors
- soft borders
- clear action buttons
- no Tailwind
- no build step
- optional Anime.js CDN for light animation

## Button moodboard

| Action | Mood | CSS class |
|---|---|---|
| Start | calm emerald | `btn success` |
| Stop | soft amber | `btn warn` |
| Kill | soft rose | `btn danger` |
| Console | soft indigo | `btn console` |
| Main action | hosting blue | `btn primary` |
| Secondary | neutral slate | `btn soft` |

## Local development

```bash
python3 -m http.server 5173
```

Open:

```text
http://127.0.0.1:5173
```

Use local dev token:

```text
dev
```

## Install in MJT

Upload this release to GitHub and set:

```properties
app.panel.frontend.url=https://github.com/mjt-project/mjt-panel-web/archive/refs/tags/0.0.11.zip
app.panel.frontend.tag=0.0.11
```

Then run:

```text
.mjt panel update
.mjt panel restart
```
