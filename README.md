# OpenRange (working title)

Local-only, free and open-source training toolkit compatible with Counter-Strike 2.

> **Branding note:** `OpenRange` is a temporary working name. It is already in use by
> unrelated projects and its checked `.dev`, `.org`, and `.app` domains are registered.
> See [SPEC.md](./SPEC.md) before publishing under this name.

## Principles

- Local-only: core features run without an account, Steam authentication, internet connection,
  Docker, cloud services, or demo parsing.
- VAC-safe by design: only official interfaces are in scope (GSI, cfg files, Workshop, and
  own-server plugins).
- No process-memory access, DLL injection, hooks, input simulation, screen scanning, or
  anti-cheat bypasses.
- Source code is MIT. Project-authored game content is CC BY-SA 4.0.

## Prerequisites

### Required now

- [Node.js](https://nodejs.org/) 22+ (current machine: Node 24 is compatible)
- Corepack (bundled with current Node.js)
- Git for source control and GitHub workflows

### Required later

- Counter-Strike 2 only from Phase 2, for GSI and cfg validation
- Docker Desktop and PostgreSQL are optional: local mode uses SQLite

## Quick start

```powershell
Set-Location D:\refrag
corepack pnpm install --allow-build=esbuild
Copy-Item .env.example .env
corepack pnpm check
```

## Run the local dashboard

```powershell
Set-Location D:\refrag
Copy-Item .env.example .env -ErrorAction SilentlyContinue
corepack pnpm --filter @openrange/web dev
```

Open <http://127.0.0.1:3001>. The application deliberately binds to loopback.

## Run the GSI receiver

1. On the Settings screen, click "Скачать GSI cfg" and copy the downloaded
   `gamestate_integration_openrange.cfg` into
   `<CS2 install>\game\csgo\cfg\`. The response header `x-openrange-gsi-token`
   contains the generated token; put the same value into `GSI_AUTH_TOKEN` in `.env`.
2. Start the receiver:

```powershell
corepack pnpm --filter @openrange/gsi-receiver dev
```

It binds to `127.0.0.1:3000`, validates the `auth.token` from every payload, rejects
malformed JSON, and stores received states idempotently (SHA-256 fingerprint deduplication)
into the local SQLite database. It also aggregates the local-player aim session
(`aim_sessions`): kills and headshot kills are accumulated from the verified
`round_kills` / `round_killhs` GSI counters, a session opens when you join a local match
and closes when you return to the menu or idle for 10 minutes. CS2 must be relaunched
after the cfg file is added. Payload contents are logged without the token; metrics that
require unverified client GSI fields are not derived yet.

## Repository layout

- `apps/web` — web dashboard and local UI.
- `apps/gsi-receiver` — loopback-only Game State Integration receiver.
- `packages/contracts` — validated cross-process payload contracts.
- `packages/config` — typed runtime configuration and platform paths.
- `packages/domain` — framework-independent business rules.
- `packages/db` — schema, migrations, and repositories.
- `content` — project-authored routines, cfg, maps, and schemas.
- `docs` — architecture decisions and verified research.

## Commands

| Command                | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `corepack pnpm check`  | Format check, lint, typecheck, and unit tests   |
| `corepack pnpm build`  | Build all Node.js packages                      |
| `corepack pnpm dev`    | Start development processes once apps are added |
| `corepack pnpm format` | Apply formatting                                |

### Windows note

Run commands from the repository directory (`D:\refrag`), not `C:\Windows\System32`; pnpm reads
the nearest `package.json`. If `corepack enable` reports a permissions error under
`C:\Program Files\nodejs`, open an Administrator PowerShell once and run it there, or install
pnpm globally through an approved organization package-management path. Git is also required
before creating the project remote.

## Security and privacy

Read [SECURITY.md](./SECURITY.md) before reporting vulnerabilities. Do not commit `.env`,
GSI tokens or local databases.

## Development status

Current phase: **2 — GSI pipeline and client-side aim session tracking (completed,
live-verified with CS2 build 14191)**.
See [SPEC.md](./SPEC.md) and `docs/research/` for confirmed boundaries and open research.
