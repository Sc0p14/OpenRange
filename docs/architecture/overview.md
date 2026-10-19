# Architecture overview

## Components

| Component            | Runtime           | Responsibility                                       |
| -------------------- | ----------------- | ---------------------------------------------------- |
| `apps/web`           | Node.js / Next.js | Dashboard, settings, routines, lineups, profile      |
| `apps/gsi-receiver`  | Node.js / Fastify | Authenticated loopback GSI intake and event dispatch |
| `packages/db`        | TypeScript        | Migrations and persistence contracts                 |
| `packages/domain`    | TypeScript        | Testable product rules and scoring contracts         |
| `packages/contracts` | TypeScript        | Versioned validated payloads                         |

## Trust boundaries

1. GSI JSON is untrusted even when received on loopback: validate token, size, and shape.
2. Imported routine and lineup JSON is untrusted content: use versioned schemas.

## Storage

Local deployments use a SQLite file controlled by the user. The domain/repository interfaces
must not assume cloud connectivity. PostgreSQL is a future optional deployment target, not a
local-mode prerequisite.
