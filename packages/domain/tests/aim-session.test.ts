import { describe, expect, it } from "vitest";

import {
  applySnapshot,
  emptyAggregationState,
  readSessionClosure,
  readSessionOpening,
  readSnapshot,
  totals
} from "../src/aim-session";

function payload(options: {
  round?: number;
  kills?: number;
  hs?: number;
  activity?: string;
  mapName?: string;
  mode?: string;
  phase?: string;
}) {
  return {
    map:
      options.round === undefined && options.mapName === undefined && options.phase === undefined
        ? undefined
        : {
            round: options.round,
            name: options.mapName,
            mode: options.mode,
            phase: options.phase
          },
    player: {
      activity: options.activity,
      state:
        options.kills === undefined && options.hs === undefined
          ? undefined
          : { round_kills: options.kills, round_killhs: options.hs }
    }
  };
}

describe("kill aggregation", () => {
  it("sums running maxima per round", () => {
    let state = emptyAggregationState();
    state = applySnapshot(state, readSnapshot(payload({ round: 0, kills: 2, hs: 1 })));
    state = applySnapshot(state, readSnapshot(payload({ round: 0, kills: 3, hs: 3 })));
    // A repeated lower heartbeat must not regress the counters.
    state = applySnapshot(state, readSnapshot(payload({ round: 0, kills: 1, hs: 0 })));
    state = applySnapshot(state, readSnapshot(payload({ round: 1, kills: 2, hs: 2 })));
    expect(totals(state)).toEqual({ kills: 5, hsKills: 5, rounds: 2 });
  });

  it("ignores payloads without counters", () => {
    const state = applySnapshot(emptyAggregationState(), readSnapshot({ provider: {} }));
    expect(totals(state)).toEqual({ kills: 0, hsKills: 0, rounds: 0 });
  });

  it("never trusts headshots above kills", () => {
    const state = applySnapshot(
      emptyAggregationState(),
      readSnapshot(payload({ round: 0, kills: 1, hs: 4 }))
    );
    expect(totals(state).hsKills).toBe(1);
  });
});

describe("session lifecycle detection", () => {
  it("opens on an active player on a map", () => {
    const opening = readSessionOpening(
      payload({ activity: "playing", mapName: "de_dust2", mode: "competitive", phase: "live" })
    );
    expect(opening.shouldOpen).toBe(true);
    expect(opening.mapName).toBe("de_dust2");
    expect(opening.mode).toBe("competitive");
  });

  it("does not open from the menu or an unloaded map", () => {
    expect(
      readSessionOpening(payload({ activity: "menu", mapName: "de_dust2", phase: "warmup" }))
        .shouldOpen
    ).toBe(false);
    expect(readSessionOpening({ player: { activity: "playing" } }).shouldOpen).toBe(false);
  });

  it("closes on menu, inactivity, and gameover", () => {
    expect(readSessionClosure(payload({ activity: "menu", phase: "warmup" }))).toBe(true);
    expect(readSessionClosure(payload({ activity: "playing", phase: "gameover" }))).toBe(true);
    expect(readSessionClosure(payload({ activity: "playing", phase: "live" }))).toBe(false);
    expect(readSessionClosure(null)).toBe(false);
  });
});
