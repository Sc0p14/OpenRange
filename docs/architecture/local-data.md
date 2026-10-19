# Local data model — Phase 1

## Database

The application opens SQLite exclusively from a `DATABASE_URL` beginning with `file:`. The default
is `file:./data/openrange.db`. The parent directory is created automatically and SQLite runs with
foreign-key enforcement and WAL journaling enabled.

The initial, versioned SQL migration is `packages/db/src/migrations/0000_initial.sql`.

## Local profile

There is exactly one `users` row with `kind = 'local'`. On first access, the application generates
a UUID and default settings atomically. Later accesses reuse the same row. Steam identity is not
collected, checked, or stored.

## Settings boundary

The database reserves local settings for language, visual theme, optional paths, and planned GSI
endpoint configuration. Storing a path does not access or modify the game. GSI configuration
generation and any HTTP receiver remain Phase 2 work.
