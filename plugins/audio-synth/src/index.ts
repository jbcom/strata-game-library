/**
 * @strata-game-library/audio-synth
 *
 * Procedural audio synthesis for Strata 3D using Tone.js.
 * Provides SFX, music, and ambient sound generation without external audio files.
 *
 * @packageDocumentation
 * @module audio-synth
 */

// Component exports
export { AudioSynthProvider, useAudioReady, useAudioSynth, usePlayMusic, usePlaySFX } from "./components/index.js";
export type { AudioSynthProviderProps } from "./components/index.js";
export { SynthManager, createSynthManager } from "./core/index.js";
export type { AudioSynthContextValue, EnvelopeConfig, FilterConfig, FrequencySweep, ISynthManager, MusicNote, MusicPattern, OscillatorType, SFXPreset, SynthManagerConfig } from "./core/index.js";
export { AMBIENT_THEME, COMBAT_THEME, CONFIRM, DEFEAT_THEME, ERROR, EXPLORATION_THEME, EXPLOSION, FOOTSTEP, GUNSHOT, IMPACT, LASER, MENU_THEME, MUSIC_PATTERNS, PICKUP, POWERUP, RICOCHET, SELECT, SFX_PRESETS, SHOP_THEME, SPLASH, TENSION_THEME, VICTORY_THEME } from "./presets/index.js";
export type { MusicPatternId, SFXPresetId } from "./presets/index.js";
