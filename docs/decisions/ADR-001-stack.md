# ADR-001: Initial platform stack

- **Status:** Accepted for Phase 0
- **Date:** 2026-10-19

## Decision

Use a pnpm/Turborepo monorepo. Implement the web interface with TypeScript, React, and Next.js;
the GSI receiver with TypeScript and Fastify; shared input contracts with Zod; and structured
logging with Pino. Use SQLite in local mode. Steam authentication and demo parsing are out of
scope for the local build.

## Context

The project is local-only on Windows and needs independent processes for web UI and game-state
ingestion. It must work without an account or external service.

## Consequences

- Node.js is the main development toolchain.
- Go is not required for this project scope.
- Docker and PostgreSQL are not required for local development.
- Database migrations support SQLite and must remain version controlled.
