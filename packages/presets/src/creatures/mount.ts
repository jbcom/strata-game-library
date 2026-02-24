import { createQuadruped, type FormName, type QuadrupedParams } from './quadruped';

/**
 * Mount Parameters
 * Extends Quadruped with riding-specific equipment.
 */
export interface MountParams extends QuadrupedParams {
  /** Is the creature equipped for riding? */
  saddled: boolean;
  /** Type of saddle equipped */
  saddleType: 'none' | 'basic' | 'war' | 'pack' | 'fancy';
  /** Barding/Armor coverage (0 = none, 1 = full plate) */
  barding: number;
  /** Does it have reins/bridle? */
  hasReins: boolean;
  /** Additional carrying bags/pouches */
  hasPanniers: boolean;
  /** Carrying capacity multiplier */
  carryingCapacity: number;
  /** Decorative elements (0 = functional, 1 = ceremonial) */
  mountOrnamentation: number;
}

export const MOUNT_DEFAULTS: Partial<MountParams> = {
  saddled: false,
  saddleType: 'none',
  barding: 0,
  hasReins: false,
  hasPanniers: false,
  carryingCapacity: 1,
  mountOrnamentation: 0,
};

/**
 * Create a mount from a quadruped form
 *
 * @param form - Base creature form (horse, camel, wolf, etc.)
 * @param customizations - Any parameter overrides (creature or mount)
 */
export function createMount(form: FormName, customizations?: Partial<MountParams>): MountParams {
  // Extract mount-specific params from customizations
  const mountCustoms: Partial<MountParams> = {};
  const creatureCustoms: Partial<QuadrupedParams> = {};

  if (customizations) {
    for (const key in customizations) {
      if (key in MOUNT_DEFAULTS) {
        (mountCustoms as any)[key] = (customizations as any)[key];
      } else {
        (creatureCustoms as any)[key] = (customizations as any)[key];
      }
    }
  }

  // Create base creature
  const baseCreature = createQuadruped(form, creatureCustoms);

  // Combine with mount defaults and customs
  const mount = {
    ...baseCreature,
    ...MOUNT_DEFAULTS,
    ...mountCustoms,
  } as MountParams;

  // Auto-enable basic gear if a saddle is specified
  if (mount.saddleType !== 'none' && !customizations?.saddled) {
    mount.saddled = true;
    mount.hasReins = true;
  }

  return mount;
}

/**
 * Generate an AI prompt for a mount (creature + gear)
 */
export function generateMountPrompt(params: MountParams, speciesName?: string): string {
  const parts: string[] = [];

  // Base creature description (simplified)
  parts.push(params.age !== 'adult' ? params.age : '');
  parts.push(speciesName || 'creature');

  if (params.saddled) {
    parts.push(`equipped with a ${params.saddleType} saddle`);
    if (params.hasReins) parts.push('and bridle');
    if (params.hasPanniers) parts.push('with pack bags');
  }

  if (params.barding > 0) {
    if (params.barding > 0.7) parts.push('in heavy plate barding');
    else if (params.barding > 0.3) parts.push('in leather barding');
    else parts.push('with light armor');
  }

  if (params.mountOrnamentation > 0.5) {
    parts.push('decorated with ceremonial silks and tassels');
  }

  return parts.filter(Boolean).join(', ');
}
