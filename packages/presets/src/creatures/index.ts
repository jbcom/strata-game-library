/**
 * Creatures Module
 *
 * Generic creature templates + themes.
 * Forms are suggested starting points, everything is customizable.
 *
 * @example
 * ```typescript
 * import { createQuadruped, ALL_THEMES, generateCreaturePrompt } from '@strata-game-library/presets';
 *
 * // Create a baby otter with arctic theme
 * const params = createQuadruped('otter', { age: 'baby', furLength: 1.4 });
 * const theme = ALL_THEMES.arctic;
 *
 * // Generate AI prompt for 3D model
 * const prompt = generateCreaturePrompt(params, theme, 'otter');
 * // => "small baby otter, fluffy fur, #E3F2FD colored, gradient pattern, big eyes"
 *
 * // Use with model-synth
 * const model = await modelSynth.character({ prompt, style: 'cartoon' });
 * ```
 */

export * from './morphology';
export * from './mount';
export * from './quadruped';
export * from './themes';

import type { QuadrupedParams } from './quadruped';
import type { CreatureTheme } from './themes';

/**
 * Generate an AI prompt from creature params + theme
 */
export function generateCreaturePrompt(
  params: QuadrupedParams,
  theme: CreatureTheme,
  speciesName?: string
): string {
  const parts: string[] = [];

  // Age prefix
  if (params.age !== 'adult') {
    parts.push(params.age);
  }

  // Build prefix
  if (params.build !== 'average') {
    parts.push(params.build);
  }

  // Species
  if (speciesName) {
    parts.push(speciesName);
  } else {
    parts.push('creature');
  }

  // Size
  if (params.size < 0.5) parts.push('tiny');
  else if (params.size < 0.8) parts.push('small');
  else if (params.size > 1.5) parts.push('large');
  else if (params.size > 2) parts.push('massive');

  // Fur description
  if (params.furLength > 1.3) parts.push('fluffy fur');
  else if (params.furLength < 0.5) parts.push('short fur');

  // Color
  parts.push(`${theme.primary} colored`);

  // Pattern
  if (theme.pattern !== 'solid') {
    parts.push(`${theme.pattern} pattern`);
    parts.push(`with ${theme.secondary} markings`);
  }

  // Notable features
  if (params.earSize > 1.3) parts.push('large ears');
  if (params.eyeSize > 1.2) parts.push('big eyes');
  if (params.snoutLength > 1.3) parts.push('long snout');
  if (params.snoutLength < 0.6) parts.push('short snout');
  if (params.tailLength > 1.3) parts.push('long tail');
  if (params.tailFluff > 0.8) parts.push('bushy tail');
  if (params.whiskerLength > 0.8) parts.push('prominent whiskers');
  if (params.webbing > 0.5) parts.push('webbed feet');
  if (params.hornSize > 0) parts.push('horned');
  if (params.mane > 0.5) parts.push('with mane');

  // Condition
  if (params.wear > 0.5) parts.push('battle-scarred');
  else if (params.wear > 0.2) parts.push('weathered');

  // Eye color
  parts.push(`${theme.eyes} eyes`);

  return parts.join(', ');
}

/**
 * Calculate suggested gameplay stats from physical params
 * Games can use this as a starting point or ignore entirely
 */
export function suggestGameplayStats(params: QuadrupedParams): {
  speed: number;
  health: number;
  agility: number;
  strength: number;
} {
  // Speed: longer legs, leaner build = faster
  const speed =
    params.legLength * 0.4 +
    (1 / params.bodyBulk) * 0.3 +
    (params.build === 'lean' || params.build === 'thin' ? 0.2 : 0) +
    (params.age === 'adult' ? 0.1 : params.age === 'young' ? 0.05 : 0);

  // Health: larger, bulkier = more health
  const health =
    params.size * 40 +
    params.bodyBulk * 30 +
    (params.build === 'heavy' || params.build === 'stocky' ? 20 : 0) +
    (params.age === 'adult' ? 10 : params.age === 'old' ? -10 : -20);

  // Agility: smaller, longer tail = more agile
  const agility =
    (1 / params.size) * 0.3 +
    params.tailLength * 0.2 +
    (params.build === 'lean' || params.build === 'thin' ? 0.2 : 0) +
    (params.age === 'young' ? 0.2 : params.age === 'baby' ? 0.1 : 0);

  // Strength: bulk, claw size
  const strength =
    params.bodyBulk * 0.4 +
    params.clawLength * 0.2 +
    params.pawSize * 0.2 +
    (params.build === 'stocky' || params.build === 'heavy' ? 0.2 : 0);

  return {
    speed: Math.round(speed * 100) / 100,
    health: Math.round(health),
    agility: Math.round(agility * 100) / 100,
    strength: Math.round(strength * 100) / 100,
  };
}
