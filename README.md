# MJT Panel Web

Version: `0.0.2`

Static frontend for Mini Java Terminal.

## Pages

- Dashboard
- Servers
- Installer
- Console
- Files
- Backups
- Players
- Network
- Settings
- System

## New in 0.0.2

The Installer page can call:

```text
GET  /api/minecraft/install/providers
POST /api/minecraft/install
```

It supports:

- Velocity
- Paper
- Purpur

## Install Into MJT

Copy contents into:

```text
/home/container/MJT/panel/static
```

Or upload this repo as a GitHub release and run:

```text
.mjt panel update
```
