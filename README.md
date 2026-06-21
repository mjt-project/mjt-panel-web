# MJT Panel Web — Phase 6 Operator UI/UX

A cumulative frontend overlay for `mjt-project/mjt-panel-web`.

## Experience changes

- Home is a workspace control center, not a card list.
- Services uses concise operational cards: runtime, loopback origin, health,
  private/public state and direct Start/Stop/Restart/Logs actions.
- Network shows exactly how a guest application becomes public.
- A slim top bar replaces the need to remember where operations live, without
  returning to a crowded sidebar.

## Build

```bash
unzip -o mjt-panel-phase6-operator-ui-overlay.zip
npm install
npm run check
npm run build
```

## Required Core version

The panel needs the Phase 5 Control API (`/api/v1`) for Guest services and
Network. Minecraft pages still use the established `/api/minecraft/...` API.
