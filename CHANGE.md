# MJT Panel Web — Operator UI/UX

## Scope

Phase 6 changes the panel from a collection of admin screens into a focused
operator workspace. It builds on the Phase 5 Control API v1 integration.

## What changed

- New dark control-surface theme with stronger visual hierarchy and responsive
  top navigation. No large persistent sidebar is added.
- Home is now a control center: workload counts, profile cards, and direct
  paths to application services and network exposure.
- Guest Services moves from a dense table to status-first service cards.
- Service detail is available in a drawer with local origin, restart policy,
  public hostname and latest output.
- Network is reframed around the safe routing model: private loopback service
  -> health check -> explicit Cloudflare publication.
- `package.json` is bumped to `0.0.16`. No extra frontend dependency is added.

## Compatibility

The overlay contains the Phase 5 Control API frontend client and pages as well
as Phase 6 UI updates. It expects MJT Core to expose the Phase 5
`/api/v1` endpoint for Services and Network.

The existing Minecraft API remains unchanged.
