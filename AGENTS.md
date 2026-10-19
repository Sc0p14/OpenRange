# Engineering rules

- Active phase: 2 (completed 2026-10-19, pending user acceptance) — do not start Phase 3
  product features (lineups, prefire, practice cfg) until the user accepts Phase 2.
- Aim scoring v1 uses client-side GSI only (kills, HS%, weapon context); exact shots, hits,
  damage, and hitbox data are NOT available client-side and need a dedicated research cycle
  before any server-side plugin work (ADR/rfC required).
- Preserve local-only operation. A local user must not need an account, Steam authentication,
  Docker, PostgreSQL, demo parsing, or an internet connection for core features.
- Never implement game-process memory access, injection, hooks, input simulation/interception,
  screen scanning, anti-cheat evasion, or live-match advantages.
- GSI must bind to loopback by default, validate a token, validate input, and redact secrets.
- Use versioned migrations. Do not apply manual production schema changes.
- Any unknown CS2/Steam/GSI detail must be documented as `TODO-RESEARCH` rather than assumed.
- Code is MIT. Project-authored content is CC BY-SA 4.0.
