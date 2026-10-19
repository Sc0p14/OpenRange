# Contributing

## Setup

Follow the [Quick start](./README.md#quick-start), then run:

```powershell
corepack pnpm check
```

## Rules

- Keep changes within the active development phase.
- Add or update tests for business logic and payload contracts.
- Keep all UI strings in RU/EN dictionaries once the web app is introduced.
- Do not add code that interacts with game memory, injects into the game, simulates input,
  scans pixels, or bypasses anti-cheat.
- Mark unverified CS2, GSI, Steam, and console details as `TODO-RESEARCH` with a source and
  validation plan.
- Never commit secrets, demo files, or user databases.
