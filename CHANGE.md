# CHANGE.md

## 0.0.12 — Calmer light UI reset

### Changed

- Rebuilt visual system around a neutral light shell, quiet cards, compact navigation and clearer hierarchy.
- Replaced generic/rainbow action buttons with a deliberate action model:
  - **Start** = blue primary
  - **Stop** = neutral secondary
  - **Restart** = outline action
  - **Kill** = tucked into More menu
- Added Be Vietnam Pro UI font and JetBrains Mono console font through CDN.
- Kept Anime.js only as an optional enhancement.
- Improved installer layout and field spacing.
- Added explicit loading, empty, error and unavailable states.
- File Manager now avoids automatic calls to unimplemented backend APIs.

### Fixed

- Added top-level bootstrap error fallback so a JavaScript issue cannot silently produce a blank white page.
- Added user-visible API status and retry entry points.
