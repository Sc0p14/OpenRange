# GSI research register

## Status

The configuration semantics below were resolved against public sources on 2026-10-19; live
in-game verification on a local practice server is still required before relying on
observation-only data blocks.

## Verified configuration semantics

Per the official Valve GSI page (developer.valvesoftware.com, "Counter-Strike: Global
Offensive Game State Integration", last updated 2026-07 and maintained for CS2):

- The config must be named `gamestate_integration_*.cfg` and placed in the `game/csgo/cfg/`
  directory of the CS2 installation; the game loads it on the next launch.
- The file uses Valve KeyValues, not JSON: quoted keys, nested brace sections, `//` comments.
  A UTF-8 BOM prevents the file from loading; our generator writes no BOM.
- Scalar keys: `uri`, `timeout`, `buffer`, `throttle`, `heartbeat`; optional `auth` and
  `output` sections; `data` selects state blocks.
- `auth` fields are echoed verbatim into the payload as JSON strings, so `auth.token`
  arrives as `payload.auth.token`.
- On any change the client POSTs the full state plus `previously` / `added` delta blocks;
  an unchanged payload is re-sent every `heartbeat` seconds.
- Verified local-player `data` blocks (valid in normal gameplay per the wiki and confirmed
  by active CS2 GSI libraries such as CounterStrike2GSI):
  `provider`, `map`, `round`, `player_id`, `player_state`, `player_weapons`,
  `player_match_stats`.
- `allplayers_*`, `allgrenades`, `bomb`, `phase_countdowns`, `player_position` are documented
  as valid only while spectating/observing; they are intentionally excluded from our cfg
  generator until behavior in local practice modes is tested live.

## Verified live (2026-10-19, CS2 build 14191)

Captured from a local client, main menu and a local competitive session on de_dust2:

- Top-level keys observed: `auth`, `provider`, `map`, `player`, plus delta blocks
  `previously` / `added` on change.
- `provider`: `name` = "Counter-Strike: Global Offensive", `appid` = 730, `version`,
  `steamid` of the local client, `timestamp` (unix seconds).
- `map`: `mode`, `name`, `phase` ("warmup" observed), `round`, per-team `score`,
  `consecutive_round_losses`, `timeouts_remaining`, `matches_won_this_series`.
- `player`: `steamid`, `clan`, `name`, `observer_slot`, `team`, `activity`
  ("menu" / "playing").
- `player.state`: `health`, `armor`, `helmet`, `flashed`, `smoked`, `burning`, `money`,
  `round_kills`, `round_killhs` (headshot kills in current round), `equip_value`.
- `player.weapons`: indexed list with `name`, `paintkit`, `type` ("Knife", "Pistol", …),
  `state` ("active"/"holstered"), `ammo_clip`, `ammo_clip_max`, `ammo_reserve`; state
  flips are included in `previously` deltas on switch.
- Payloads arrive in the menu roughly every 1s and in-game near the `buffer` interval;
  token mismatch yields a steady 401 stream until `.env` matches the cfg token.

## Quantified client-side scoring limits (settled by this capture)

- Derivable: per-round kills and headshot-kill ratios from `round_kills`/`round_killhs`
  deltas; weapon switch events from `player.weapons.*.state` transitions; ammo-clip
  decrements as a _proxy_ for fired shots (imperfect: spray misses, non-bullet tools,
  and reload resets make it an approximation, not exact shots).
- Not derivable from client GSI: per-shot events, hit registration, damage numbers,
  hitboxes, reaction timing to millisecond precision, misses vs hits.
- Practical consequence: the aim module v1 uses GSI for kills/HS%/weapon context, and
  exact shots/hits stay behind a CounterStrikeSharp server plugin plan (Phase 2 option
  b) or a later iteration. `round_kills` resets each round, so cross-round aggregation
  must sum deltas keyed by `map.round`.

## TODO-RESEARCH: live verification on local CS2

- Confirm that the rendered `gamestate_integration_openrange.cfg` loads in current CS2
  (check console output "Configuration file loaded" analog on game launch).
- Capture sanitized real payloads for the enabled local-player blocks and pin them as test
  fixtures; compare with the CounterStrike2GSI schema registry.
- Determine whether `player_state.flashed`, `player_match_stats`, and weapon `state` change
  reliably during practice cfg sessions (`sv_cheats 1`, infinite ammo, respawn).
- Measure duplicate/heartbeat behavior against our fingerprint deduplication and confirm
  whether `previously`/`added` blocks should be excluded from the fingerprint.

## TODO-RESEARCH: payload fields required by scoring

- Determine reliable map and round phase transitions.
- Determine whether client GSI exposes sufficient death, hit, weapon, and headshot data.
- Determine which fields identify the local player and which are available for all players.
- Measure retry/duplicate behavior and derive a safe idempotency fingerprint.
- Confirm whether any valid timing data supports a client-side reaction-time estimate.

## Implementation guardrail

When Phase 2 starts, all accepted data must be schema-validated, body-size limited, authenticated,
stored idempotently, and received through a loopback listener by default. Missing fields must not
be fabricated into metrics.
