# CS2 console command research register

## Status

The future cfg package must be verified on the then-current CS2 version before release. No command
in this file is a guarantee that it currently exists or accepts a particular value.

## TODO-RESEARCH: practice profile candidates

Validate existence, values, required privilege level, and behavior on local versus dedicated
servers for:

```text
sv_cheats
bot_kick
mp_freezetime
mp_team_intro_time
cl_versus_intro
mp_ignore_round_win_conditions
mp_roundtime_defuse
mp_buy_anywhere
mp_buytime
mp_startmoney
mp_maxmoney
sv_infinite_ammo
ammo_grenade_limit_total
sv_grenade_trajectory_prac_pipreview
sv_grenade_trajectory_prac_trailtime
sv_showimpacts
mp_respawn_on_death_t
mp_respawn_on_death_ct
buddha
buddha_reset_hp
mp_restartgame
noclip
sv_rethrow_last_grenade
ent_fire smokegrenade_projectile kill
ent_fire molotov_projectile kill
```

## Validation protocol

1. Check an official Valve source or current in-game command help.
2. Test only on a local practice server or an owner-controlled dedicated server.
3. Record CS2 build/version, command, expected result, actual result, and required `sv_cheats`.
4. Remove or clearly document commands that do not work in the supported environment.
