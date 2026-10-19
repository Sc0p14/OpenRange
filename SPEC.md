# OpenRange product specification

**Status:** working specification, adopted for Phase 0 on 2026-10-19.

## Product mission

OpenRange is a free, open-source, local-first training ecosystem compatible with
Counter-Strike 2. It will provide measurable aim routines, a utility library, and prefire
practice without subscriptions or dark patterns.

## Non-negotiable boundaries

The project must not read or write Counter-Strike 2 process memory, inject DLLs, hook game
functions, simulate or intercept input, scan pixels, bypass VAC, reverse engineer game
protection, or provide an advantage in real matches.

Permitted integration surfaces only:

- official Game State Integration HTTP POSTs;
- cfg files and launch options;
- user-created Steam Workshop maps built in Hammer;
- own dedicated servers with MetaMod2 / CounterStrikeSharp.

`sv_cheats 1` is limited to local practice or an owner-controlled server, never public Valve
or FACEIT servers.

## Local-first architecture

```text
CS2 GSI -> loopback GSI receiver -> idempotent event store -> local database <- web application
```

The web application and GSI receiver are separate processes. Local mode uses SQLite. No cloud
service, Steam account, or demo-file analysis is required or planned for the initial local build.

## Phases

| Phase | Scope                                            |
| ----- | ------------------------------------------------ |
| 0     | Stack, monorepo, CI, documentation               |
| 1     | Web skeleton, database, and single local profile |
| 2     | GSI receiver and aim trainer v1                  |
| 3     | Utility library and practice cfg package         |
| 4     | Reserved — demo parsing explicitly out of scope  |
| 5     | Prefire                                          |
| 6     | Progression and social foundation                |
| 7     | Release hardening                                |

## Licensing

- Source code: MIT.
- Project-authored maps, routines, diagrams, and instructional content: CC BY-SA 4.0.
- Third-party dependencies retain their own licenses and must be attributed.

## Research status

GSI field availability and current CS2 console commands are not final until validated against
current Valve documentation and a controlled local CS2 installation. See:

- [GSI research](./docs/research/gsi.md)
- [CS2 console command research](./docs/research/cs2-console-commands.md)

## Working-name notice

`OpenRange` is a temporary project name. Preliminary public checks found unrelated existing
GitHub projects and registered `openrange.dev`, `openrange.org`, and `openrange.app` domains.
Brand approval, domain availability, and trademark clearance are required before release.
