# Security policy

## Scope

OpenRange must remain VAC-safe by design. The project does not accept features involving
game-process memory access, injection, hooks, input simulation/interception, screen scanning,
anti-cheat evasion, or advantages in live matches.

Only official integration surfaces are in scope: Game State Integration, cfg files, Workshop
maps, demo files, Steam OpenID/Web API, and plugins running on an owner-controlled server.

## Reporting a vulnerability

Do not open a public issue for a security vulnerability. Until a project contact is published,
report privately to the repository owner with affected version, impact, and reproduction steps.

Never include credentials, Steam API keys, GSI tokens, private demo files, or personal data in
an issue or a report.

## Defaults

- Local services bind to `127.0.0.1` unless a user explicitly reconfigures them.
- Secrets are read from environment variables or local secure settings, never source control.
- External JSON is schema-validated and size-limited.
- Logs must redact authorization tokens and credentials.
