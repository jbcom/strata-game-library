/**
 * Opt-in module-load side effect, deliberately NOT baked into mountPixi —
 * too load-bearing and PixiJS-version-specific to apply silently.
 *
 * Extracted from bioluminescent-sea's src/render/stage.ts.
 */

import { Filter } from 'pixi.js';

/**
 * Make every Pixi filter created from now on inherit the renderer's
 * resolution instead of defaulting to 1. This is the upstream-recommended
 * fix for pixijs/pixijs#11467 — without it, filters at resolution=1 render
 * to half-size textures on a DPR=2 canvas and composite into the
 * upper-left quadrant.
 *
 * Call it once, from a guaranteed-executed code path (e.g. right before
 * your first mountPixi). bioluminescent-sea learned the hard way that a
 * module-scope assignment gets tree-shaken by Rolldown — bundlers may drop
 * module-level mutations to imported namespace objects even with
 * side-effect intent — which is exactly why this ships as a callable
 * function rather than an import side effect.
 *
 * `'inherit'` documented at:
 * https://pixijs.download/dev/docs/filters.FilterOptions.html#resolution
 */
export function applyFilterResolutionFix(): void {
  Filter.defaultOptions.resolution = 'inherit';
}
