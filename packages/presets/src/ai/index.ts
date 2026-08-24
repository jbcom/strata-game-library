/**
 * AI Presets for YukaJS Integration.
 * @packageDocumentation
 * @module presets/ai
 */

export { createFlockMemberPreset } from './FlockMemberPreset';
export type { FlockConfig } from './FlockPreset';
export { createFlock } from './FlockPreset';
export { createFollowerPreset } from './FollowerPreset';
export { createGuardPreset } from './GuardPreset';
export { createPredatorPreset } from './PredatorPreset';
export { createPreyPreset } from './PreyPreset';
export type {
  AIPresetConfig,
  AIPresetName,
  AIPresetResult,
  FlockMemberPresetConfig,
  FollowerPresetConfig,
  GuardPresetConfig,
  PredatorPresetConfig,
  PreyPresetConfig,
} from './types';
