import { describe, expect, it } from "vitest";

import {
  practiceCommandRegistry,
  practicePresetKeys,
  renderPracticeConfig
} from "../src/practice-config";

describe("practice cfg renderer", () => {
  it("registers commands with a local-practice warning", () => {
    for (const key of practicePresetKeys) {
      const config = renderPracticeConfig(key);
      expect(config).toContain("TODO-RESEARCH");
      expect(config).toContain("локальной практики");
      expect(config).toContain("exec openrange_practice");
      expect(config).toContain(`Пресет: ${key}`);
    }
  });

  it("emits only registry commands and restarts last", () => {
    const config = renderPracticeConfig("warmup");
    const commands = config
      .split("\r\n")
      .filter((line) => !line.startsWith("//"))
      .map((line) => line.split(" ")[0]);
    const registry = new Set(Object.values(practiceCommandRegistry).map((entry) => entry.command));
    for (const command of commands) {
      expect(registry.has(command)).toBe(true);
    }
    expect(commands[commands.length - 1]).toBe("mp_restartgame");
  });

  it("supports custom presets and rejects unknown keys", () => {
    const custom = renderPracticeConfig("custom", ["cheats", "showImpacts"]);
    expect(custom).toContain("sv_cheats 1");
    expect(custom).toContain("sv_showimpacts 1");
    expect(() => renderPracticeConfig("custom", [])).toThrow("at least one");
    expect(() => renderPracticeConfig("custom", ["not_a_key"])).toThrow("not_a_key");
  });

  it("never duplicates restart inside a preset", () => {
    const config = renderPracticeConfig("utility");
    expect(config.split("\r\n").filter((line) => line.startsWith("mp_restartgame"))).toHaveLength(
      1
    );
  });
});
