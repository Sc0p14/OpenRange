# Phase 0 report

**Status:** accepted; scope was later reduced to local-only mode without Steam authentication or
demo parsing.

## Delivered

- pnpm/Turborepo workspace with separate web and GSI-receiver applications.
- Shared contracts, configuration, domain, database placeholder, and secret-redacting logger
  packages.
- TypeScript lint, formatting, typecheck, unit-test, and build scripts.
- GitHub Actions Node CI job.
- Root `README.md`, `SPEC.md`, `SECURITY.md`, `CONTRIBUTING.md`, ADR, architecture notes, and
  research registers.
- MIT code license and CC BY-SA 4.0 content license.
- Loopback-only GSI configuration contract and explicit security guardrails.
- Unit tests for versioned documents, environment validation, package foundation, and secret
  redaction.

## Local validation completed

- `corepack pnpm install --allow-build=esbuild` completed successfully.
- Prettier completed successfully.
- ESLint completed successfully.
- TypeScript typechecks completed successfully for every TypeScript workspace.
- Vitest: 4 files and 6 tests passed.

## Environment notes

- Git is not installed. This prevents initializing, committing, or publishing the repository.
- Corepack can execute pnpm through `corepack pnpm`, but cannot create the global `pnpm` shim
  without Administrator permission. Turborepo therefore cannot launch package-manager child
  commands locally. Individual lint/typecheck/test commands were run directly and passed.

## TODO-RESEARCH

- Validate the current CS2 GSI cfg format and payload fields before Phase 2.
- Validate every practice cfg command against a controlled local CS2 installation before Phase 3.
- Demo parsing and Steam authentication are explicitly out of scope for this local-only build.

## Risks

- `OpenRange` is a temporary name and should not be used for a public release without brand,
  domain, GitHub, and trademark review.
- GSI may not contain enough data for exact client-side scoring; server-side scoring remains a
  later own-server capability.
