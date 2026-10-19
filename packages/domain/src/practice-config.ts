/**
 * Practice cfg renderer.
 *
 * Every command below is still TODO-RESEARCH (docs/research/cs2-console-commands.md):
 * existence, argument values, and privilege requirements must be validated on the
 * then-current CS2 build before this cfg is advertised as working. The renderer only
 * emits registry entries and always prints the local-practice warning.
 */

export interface PracticeCommand {
  readonly command: string;
  readonly description: string;
  /** Best-known value for practice setups; may be rejected by the game. */
  readonly value: string;
  readonly requiresCheats: boolean;
}

const commandRegistry = {
  cheats: {
    command: "sv_cheats",
    description: "Разрешить серверные команды практики",
    value: "1",
    requiresCheats: false
  },
  freezeTime: {
    command: "mp_freezetime",
    description: "Убрать время заморозки",
    value: "0",
    requiresCheats: true
  },
  roundTime: {
    command: "mp_roundtime_defuse",
    description: "Длинный раунд на дефуз-картах",
    value: "60",
    requiresCheats: true
  },
  ignoreWinConditions: {
    command: "mp_ignore_round_win_conditions",
    description: "Раунд не заканчивается от целей",
    value: "1",
    requiresCheats: true
  },
  respawnT: {
    command: "mp_respawn_on_death_t",
    description: "Мгновенный респавн за T",
    value: "1",
    requiresCheats: true
  },
  respawnCt: {
    command: "mp_respawn_on_death_ct",
    description: "Мгновенный респавн за CT",
    value: "1",
    requiresCheats: true
  },
  buyAnywhere: {
    command: "mp_buy_anywhere",
    description: "Закупка в любой точке",
    value: "1",
    requiresCheats: true
  },
  buyTime: {
    command: "mp_buytime",
    description: "Закупка всегда доступна",
    value: "99999",
    requiresCheats: true
  },
  startMoney: {
    command: "mp_startmoney",
    description: "Стартовые деньги",
    value: "16000",
    requiresCheats: true
  },
  maxMoney: {
    command: "mp_maxmoney",
    description: "Максимум денег",
    value: "16000",
    requiresCheats: true
  },
  infiniteAmmo: {
    command: "sv_infinite_ammo",
    description: "Бесконечные патроны",
    value: "2",
    requiresCheats: true
  },
  showImpacts: {
    command: "sv_showimpacts",
    description: "Показывать точки попаданий",
    value: "1",
    requiresCheats: true
  },
  grenadePreview: {
    command: "sv_grenade_trajectory_prac_pipreview",
    description: "Картинка в картинке траектории гранаты",
    value: "1",
    requiresCheats: true
  },
  grenadeTrail: {
    command: "sv_grenade_trajectory_prac_trailtime",
    description: "Длительность следа траектории (сек)",
    value: "4",
    requiresCheats: true
  },
  grenadeLimit: {
    command: "ammo_grenade_limit_total",
    description: "Лимит гранат в инвентаре",
    value: "6",
    requiresCheats: true
  },
  botKick: { command: "bot_kick", description: "Выгнать ботов", value: "", requiresCheats: true },
  noTeamIntro: {
    command: "mp_team_intro_time",
    description: "Убрать вступительное видео команд",
    value: "0",
    requiresCheats: true
  },
  restart: {
    command: "mp_restartgame",
    description: "Перезапустить игру (выполняется последней)",
    value: "1",
    requiresCheats: true
  }
} satisfies Record<string, PracticeCommand>;

export type PracticeCommandKey = keyof typeof commandRegistry;

export const practiceCommandRegistry: Readonly<Record<string, PracticeCommand>> = commandRegistry;

export const practicePresetKeys = ["warmup", "utility"] as const;
export type PracticePreset = (typeof practicePresetKeys)[number] | "custom";

const presets: Record<Exclude<PracticePreset, "custom">, readonly PracticeCommandKey[]> = {
  warmup: [
    "cheats",
    "freezeTime",
    "roundTime",
    "ignoreWinConditions",
    "respawnT",
    "respawnCt",
    "buyAnywhere",
    "buyTime",
    "startMoney",
    "maxMoney",
    "infiniteAmmo",
    "showImpacts",
    "noTeamIntro",
    "restart"
  ],
  utility: [
    "cheats",
    "botKick",
    "freezeTime",
    "ignoreWinConditions",
    "buyAnywhere",
    "buyTime",
    "startMoney",
    "maxMoney",
    "infiniteAmmo",
    "grenadePreview",
    "grenadeTrail",
    "grenadeLimit",
    "showImpacts",
    "restart"
  ]
};

export function renderPracticeConfig(
  preset: PracticePreset,
  customCommands: readonly PracticeCommandKey[] = []
): string {
  if (preset === "custom") {
    if (customCommands.length === 0) {
      throw new Error("Custom practice cfg requires at least one command");
    }
    for (const key of customCommands) {
      if (!(key in commandRegistry)) {
        throw new Error(`Unknown practice command key: ${String(key)}`);
      }
    }
  }

  const keys = preset === "custom" ? customCommands : presets[preset];
  const seen = new Set<PracticeCommandKey>();
  const lines: PracticeCommandKey[] = keys.filter((key) => {
    if (seen.has(key) || key === "restart") {
      return false;
    }
    seen.add(key);
    return true;
  });

  lines.push("restart");

  const body = lines.map((key) => {
    const entry = commandRegistry[key];
    return `${entry.command} ${entry.value}`.trim();
  });

  // Local practice only: sv_cheats cfg must never be executed on Valve or FACEIT servers.
  return [
    "// OpenRange practice cfg (CHANGE BEFORE RELEASE)",
    "// ВНИМАНИЕ: команды ниже не проверены на текущем CS2 (TODO-RESEARCH).",
    "// Предназначено только для локальной практики или своего сервера.",
    "// Запускать на официальных/публичных серверах запрещено — это приведёт к отклонению сервером.",
    "// Установка: положите openrange_practice.cfg в <CS2>\\game\\csgo\\cfg и введите exec openrange_practice",
    `// Пресет: ${preset}`,
    ...body
  ].join("\r\n");
}
