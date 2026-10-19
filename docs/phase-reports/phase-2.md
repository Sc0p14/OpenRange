# Phase 2 report — GSI pipeline and client-side aim session tracking

Date: 2026-10-19
Status: completed; live-verified with CS2 (build 14191) on the developer machine.

## Scope

Phase 2 delivered the local GSI pipeline end to end: a cfg-file wizard, a loopback-only
receiver, idempotent event storage, and the first client-side training metric track —
aim session tracking with kills and headshot statistics.

## Delivered

### GSI cfg wizard (`apps/web`)

- `POST /api/gsi/config` renders `gamestate_integration_openrange.cfg` for the local
  player only. Enabled blocks: `provider`, `map`, `round`, `player_id`, `player_state`,
  `player_weapons`, `player_match_stats` (verified against the public Valve wiki;
  spectator-only and all-player blocks are excluded by design).
- A cryptographically random token is embedded into the cfg and delivered in the
  `x-openrange-gsi-token` response header. The Settings screen copies the file via a
  download button and instructs the user to put the same token into `GSI_AUTH_TOKEN`.

### GSI receiver (`apps/gsi-receiver`)

- Fastify server bound to `127.0.0.1` (see `.env`/`packages/config`), body limit 256 KB,
  Zod-validated payload contracts (`@openrange/contracts`), constant-time token
  comparison, and pino redaction of the token in logs.
- Unauthorized requests: 401; invalid payload: 400; stored event: 202; duplicate
  payload: 200 with `duplicate: true`.
- Events are deduplicated by SHA-256 fingerprint of the payload.

### Aim session tracking

- `packages/domain/src/aim-session.ts` aggregates the verified per-round GSI counters
  `round_kills` / `round_killhs`. Counters reset every round, so the running maximum per
  round number is kept and session totals sum across rounds. Session lifecycle: opens
  when the local player is `playing` on a loaded map; closes on menu/inactive/gameover,
  on map change, or after 10 minutes without updates.
- `packages/db`: migration `0001_aim_sessions.sql` adds the `aim_sessions` table
  (versioned migration; the embedded initial migration in `database.ts` stays in sync).
  The receiver ingests every non-duplicate payload into the session tracker; aggregation
  failures never drop events.
- `apps/web`: `GET /api/sessions` returns the open session and short history; the
  Training screen contains a live widget (2 s polling) with kills, headshot kills, HS%,
  map, mode, and session history.

### Infrastructure fix found during live verification

Relative `DATABASE_URL` values were previously resolved against each process working
directory, so the web app and the receiver created two separate databases. Relative
paths are now anchored to the workspace root (`pnpm-workspace.yaml` directory): the
single database lives at `<repo>/data/openrange.db` for all processes.

## Live verification (CS2 build 14191)

All observations are recorded in `docs/research/gsi.md`:

- cfg is loaded by the game and payloads arrive on loopback with the token;
- menu payloads contain `provider` + `player` only; in-match payloads additionally carry
  `map` (mode/phase/round/score), `player.team`, `player.state`
  (health/armor/helmet/flash/smoke/burning/money/round_kills/round_killhs/equip_value),
  and `player.weapons` (name/paintkit/type/state/ammo);
- kills and headshot kills (3/3 observed) update within one payload interval and the
  session widget/DB reflect them; session close on returning to the menu verified in DB.

## Client-side scoring boundary (settled by live capture)

- Derivable: per-round kills, headshot-kill ratio, weapon switches, ammo-clip decrement
  as an approximate shot proxy.
- NOT derivable: per-shot events, hit registration, damage, hitboxes, millisecond
  reaction timing. Exact shot-level scoring requires a later dedicated effort (server
  plugin research cycle) and is out of Phase 2 scope.

## Acceptance checks

- `corepack pnpm check` — 21 unit tests, lint, typecheck, format: all green.
- `corepack pnpm build` — all packages build; web build emits only Turbopack dynamic
  filesystem tracing warnings caused by the intentional workspace-root DB anchor.
- Manual live run: unauthorized 401 → authenticated 202 → duplicate 200; cfg download;
  in-game kill/HS tracking; session open/close transitions observed in SQLite.

## Known limitations / open items

- `player_match_stats` was not yet captured in a completed round payload — keep as
  `TODO-RESEARCH` before using it for anything.
- The Settings screen generates a fresh token on every download; the receiver `.env`
  token must be updated manually after regenerating the cfg (documented in README).
- Git is not installed on the developer machine yet, so the tree is still uncommitted;
  commits and the GitHub Actions run remain pending until Git is available.
- Branding is still the provisional `OpenRange` working name.
