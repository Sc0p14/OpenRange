# Local-first contract

The core product must run after local installation without:

- an account or Steam authentication;
- an internet connection;
- a remote database;
- Docker;
- a payment service.

The local profile owns settings, training records, imported routines, and imported lineups.
Steam linking and demo parsing are out of scope. Cloud sharing, moderation, and global
leaderboards remain deferred, optional features and must require explicit user consent before
upload if they are ever introduced.

Default paths, database files, and generated GSI configuration remain local to the machine.
No telemetry is enabled by default.
