/**
 * Domain rules are kept framework-independent so game data never needs to be
 * interpreted in a UI component or HTTP route.
 */
export const phase = 0;
export { renderGsiConfig, type GsiConfigOptions } from "./gsi-config.js";
export {
  practiceCommandRegistry,
  practicePresetKeys,
  renderPracticeConfig,
  type PracticeCommand,
  type PracticeCommandKey,
  type PracticePreset
} from "./practice-config.js";
export {
  applySnapshot,
  emptyAggregationState,
  readSessionClosure,
  readSessionOpening,
  readSnapshot,
  totals,
  type SessionAggregationState,
  type SessionTotals
} from "./aim-session.js";
