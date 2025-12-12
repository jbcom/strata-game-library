/**
 * Animation Presets
 *
 * Pre-configured animation settings for common use cases.
 * @module presets/animation
 */

import type { GaitConfig, LookAtConfig, SpringConfig } from '../core/animation';

export interface IKPreset {
    name: string;
    description: string;
    boneLengths: number[];
    tolerance: number;
    maxIterations: number;
    solver: 'fabrik' | 'ccd';
}

export interface SpringPreset {
    name: string;
    description: string;
    config: SpringConfig;
}

export interface GaitPreset {
    name: string;
    description: string;
    config: GaitConfig;
}

export interface LookAtPreset {
    name: string;
    description: string;
    config: LookAtConfig;
}

export type IKPresetName =
    | 'humanArm'
    | 'humanLeg'
    | 'spiderLeg'
    | 'tentacle'
    | 'finger'
    | 'spine'
    | 'tail';
export type SpringPresetName = 'stiff' | 'bouncy' | 'floppy' | 'hair' | 'cloth' | 'jelly';
export type GaitPresetName = 'walk' | 'run' | 'sneak' | 'limp' | 'march' | 'crawl';
export type LookAtPresetName = 'lazy' | 'snappy' | 'smooth' | 'robotic' | 'organic';

export const HUMAN_ARM_IK_PRESET: IKPreset = {
    name: 'Human Arm',
    description: 'Standard human arm proportions with two-bone IK',
    boneLengths: [0.3, 0.25],
    tolerance: 0.001,
    maxIterations: 10,
    solver: 'fabrik',
};

export const HUMAN_LEG_IK_PRESET: IKPreset = {
    name: 'Human Leg',
    description: 'Standard human leg proportions with two-bone IK',
    boneLengths: [0.45, 0.4],
    tolerance: 0.001,
    maxIterations: 10,
    solver: 'fabrik',
};

export const SPIDER_LEG_IK_PRESET: IKPreset = {
    name: 'Spider Leg',
    description: 'Multi-segment spider leg with CCD solver',
    boneLengths: [0.2, 0.3, 0.25, 0.15],
    tolerance: 0.002,
    maxIterations: 15,
    solver: 'ccd',
};

export const TENTACLE_IK_PRESET: IKPreset = {
    name: 'Tentacle',
    description: 'Flexible multi-segment tentacle',
    boneLengths: [0.15, 0.15, 0.15, 0.12, 0.12, 0.1, 0.1, 0.08],
    tolerance: 0.005,
    maxIterations: 25,
    solver: 'fabrik',
};

export const FINGER_IK_PRESET: IKPreset = {
    name: 'Finger',
    description: 'Human finger with three bones',
    boneLengths: [0.04, 0.03, 0.02],
    tolerance: 0.0005,
    maxIterations: 8,
    solver: 'fabrik',
};

export const SPINE_IK_PRESET: IKPreset = {
    name: 'Spine',
    description: 'Character spine for upper body movement',
    boneLengths: [0.1, 0.1, 0.1, 0.1, 0.1],
    tolerance: 0.002,
    maxIterations: 12,
    solver: 'ccd',
};

export const TAIL_IK_PRESET: IKPreset = {
    name: 'Tail',
    description: 'Animal tail with many segments',
    boneLengths: [0.12, 0.12, 0.1, 0.1, 0.08, 0.08, 0.06],
    tolerance: 0.003,
    maxIterations: 20,
    solver: 'fabrik',
};

export const ikPresets: Record<IKPresetName, IKPreset> = {
    humanArm: HUMAN_ARM_IK_PRESET,
    humanLeg: HUMAN_LEG_IK_PRESET,
    spiderLeg: SPIDER_LEG_IK_PRESET,
    tentacle: TENTACLE_IK_PRESET,
    finger: FINGER_IK_PRESET,
    spine: SPINE_IK_PRESET,
    tail: TAIL_IK_PRESET,
};

export const STIFF_SPRING_PRESET: SpringPreset = {
    name: 'Stiff',
    description: 'Very stiff spring with minimal bounce - good for ears, antennae',
    config: {
        stiffness: 500,
        damping: 25,
        mass: 0.5,
    },
};

export const BOUNCY_SPRING_PRESET: SpringPreset = {
    name: 'Bouncy',
    description: 'Springy and bouncy - good for ponytails, ribbons',
    config: {
        stiffness: 150,
        damping: 5,
        mass: 1,
    },
};

export const FLOPPY_SPRING_PRESET: SpringPreset = {
    name: 'Floppy',
    description: 'Loose and floppy - good for long tails, capes',
    config: {
        stiffness: 50,
        damping: 8,
        mass: 2,
    },
};

export const HAIR_SPRING_PRESET: SpringPreset = {
    name: 'Hair',
    description: 'Natural hair movement with medium stiffness',
    config: {
        stiffness: 200,
        damping: 12,
        mass: 0.3,
    },
};

export const CLOTH_SPRING_PRESET: SpringPreset = {
    name: 'Cloth',
    description: 'Fabric-like movement for capes and clothes',
    config: {
        stiffness: 80,
        damping: 6,
        mass: 0.8,
    },
};

export const JELLY_SPRING_PRESET: SpringPreset = {
    name: 'Jelly',
    description: 'Wobbly jelly-like movement',
    config: {
        stiffness: 100,
        damping: 3,
        mass: 1.5,
    },
};

export const springPresets: Record<SpringPresetName, SpringPreset> = {
    stiff: STIFF_SPRING_PRESET,
    bouncy: BOUNCY_SPRING_PRESET,
    floppy: FLOPPY_SPRING_PRESET,
    hair: HAIR_SPRING_PRESET,
    cloth: CLOTH_SPRING_PRESET,
    jelly: JELLY_SPRING_PRESET,
};

export const WALK_GAIT_PRESET: GaitPreset = {
    name: 'Walk',
    description: 'Standard walking gait',
    config: {
        stepLength: 0.8,
        stepHeight: 0.12,
        stepDuration: 0.5,
        bodyBob: 0.04,
        bodySwayAmplitude: 0.02,
        hipRotation: 0.08,
        phaseOffset: 0.5,
        footOvershoot: 0.05,
    },
};

export const RUN_GAIT_PRESET: GaitPreset = {
    name: 'Run',
    description: 'Running gait with longer strides and higher steps',
    config: {
        stepLength: 1.5,
        stepHeight: 0.25,
        stepDuration: 0.3,
        bodyBob: 0.08,
        bodySwayAmplitude: 0.01,
        hipRotation: 0.12,
        phaseOffset: 0.5,
        footOvershoot: 0.15,
    },
};

export const SNEAK_GAIT_PRESET: GaitPreset = {
    name: 'Sneak',
    description: 'Slow sneaking gait with low steps',
    config: {
        stepLength: 0.4,
        stepHeight: 0.05,
        stepDuration: 0.8,
        bodyBob: 0.01,
        bodySwayAmplitude: 0.005,
        hipRotation: 0.03,
        phaseOffset: 0.5,
        footOvershoot: 0.02,
    },
};

export const LIMP_GAIT_PRESET: GaitPreset = {
    name: 'Limp',
    description: 'Asymmetric limping gait',
    config: {
        stepLength: 0.5,
        stepHeight: 0.08,
        stepDuration: 0.6,
        bodyBob: 0.06,
        bodySwayAmplitude: 0.04,
        hipRotation: 0.05,
        phaseOffset: 0.35,
        footOvershoot: 0.03,
    },
};

export const MARCH_GAIT_PRESET: GaitPreset = {
    name: 'March',
    description: 'Military marching gait with high steps',
    config: {
        stepLength: 0.7,
        stepHeight: 0.2,
        stepDuration: 0.45,
        bodyBob: 0.02,
        bodySwayAmplitude: 0.01,
        hipRotation: 0.04,
        phaseOffset: 0.5,
        footOvershoot: 0,
    },
};

export const CRAWL_GAIT_PRESET: GaitPreset = {
    name: 'Crawl',
    description: 'Four-legged crawling gait',
    config: {
        stepLength: 0.3,
        stepHeight: 0.06,
        stepDuration: 0.4,
        bodyBob: 0.02,
        bodySwayAmplitude: 0.03,
        hipRotation: 0.02,
        phaseOffset: 0.25,
        footOvershoot: 0.01,
    },
};

export const gaitPresets: Record<GaitPresetName, GaitPreset> = {
    walk: WALK_GAIT_PRESET,
    run: RUN_GAIT_PRESET,
    sneak: SNEAK_GAIT_PRESET,
    limp: LIMP_GAIT_PRESET,
    march: MARCH_GAIT_PRESET,
    crawl: CRAWL_GAIT_PRESET,
};

export const LAZY_LOOKAT_PRESET: LookAtPreset = {
    name: 'Lazy',
    description: 'Slow, relaxed head tracking',
    config: {
        maxAngle: Math.PI / 4,
        speed: 1.5,
        deadzone: 0.1,
        smoothing: 0.3,
    },
};

export const SNAPPY_LOOKAT_PRESET: LookAtPreset = {
    name: 'Snappy',
    description: 'Quick, alert head tracking',
    config: {
        maxAngle: Math.PI / 2,
        speed: 12,
        deadzone: 0.02,
        smoothing: 0.05,
    },
};

export const SMOOTH_LOOKAT_PRESET: LookAtPreset = {
    name: 'Smooth',
    description: 'Balanced smooth head tracking',
    config: {
        maxAngle: Math.PI / 3,
        speed: 5,
        deadzone: 0.05,
        smoothing: 0.15,
    },
};

export const ROBOTIC_LOOKAT_PRESET: LookAtPreset = {
    name: 'Robotic',
    description: 'Mechanical, stepwise head tracking',
    config: {
        maxAngle: Math.PI / 2.5,
        speed: 20,
        deadzone: 0.15,
        smoothing: 0.02,
    },
};

export const ORGANIC_LOOKAT_PRESET: LookAtPreset = {
    name: 'Organic',
    description: 'Natural, animal-like head tracking',
    config: {
        maxAngle: Math.PI / 2.5,
        speed: 3,
        deadzone: 0.08,
        smoothing: 0.2,
    },
};

export const lookAtPresets: Record<LookAtPresetName, LookAtPreset> = {
    lazy: LAZY_LOOKAT_PRESET,
    snappy: SNAPPY_LOOKAT_PRESET,
    smooth: SMOOTH_LOOKAT_PRESET,
    robotic: ROBOTIC_LOOKAT_PRESET,
    organic: ORGANIC_LOOKAT_PRESET,
};

export function getIKPreset(name: IKPresetName): IKPreset {
    return ikPresets[name];
}

export function getSpringPreset(name: SpringPresetName): SpringPreset {
    return springPresets[name];
}

export function getGaitPreset(name: GaitPresetName): GaitPreset {
    return gaitPresets[name];
}

export function getLookAtPreset(name: LookAtPresetName): LookAtPreset {
    return lookAtPresets[name];
}

export function createCustomIKPreset(
    name: string,
    boneLengths: number[],
    options: Partial<Omit<IKPreset, 'name' | 'boneLengths'>> = {}
): IKPreset {
    return {
        name,
        description: options.description ?? `Custom IK preset: ${name}`,
        boneLengths,
        tolerance: options.tolerance ?? 0.001,
        maxIterations: options.maxIterations ?? 15,
        solver: options.solver ?? 'fabrik',
    };
}

export function createCustomSpringPreset(
    name: string,
    config: Partial<SpringConfig>,
    description?: string
): SpringPreset {
    return {
        name,
        description: description ?? `Custom spring preset: ${name}`,
        config: {
            stiffness: config.stiffness ?? 100,
            damping: config.damping ?? 10,
            mass: config.mass ?? 1,
            restLength: config.restLength,
        },
    };
}

export function createCustomGaitPreset(
    name: string,
    config: Partial<GaitConfig>,
    description?: string
): GaitPreset {
    return {
        name,
        description: description ?? `Custom gait preset: ${name}`,
        config: {
            stepLength: config.stepLength ?? 0.8,
            stepHeight: config.stepHeight ?? 0.15,
            stepDuration: config.stepDuration ?? 0.4,
            bodyBob: config.bodyBob ?? 0.05,
            bodySwayAmplitude: config.bodySwayAmplitude ?? 0.02,
            hipRotation: config.hipRotation ?? 0.1,
            phaseOffset: config.phaseOffset ?? 0.5,
            footOvershoot: config.footOvershoot ?? 0.1,
        },
    };
}

export function blendSpringPresets(
    preset1: SpringPreset,
    preset2: SpringPreset,
    t: number
): SpringConfig {
    const clampedT = Math.max(0, Math.min(1, t));
    return {
        stiffness:
            preset1.config.stiffness +
            (preset2.config.stiffness - preset1.config.stiffness) * clampedT,
        damping:
            preset1.config.damping + (preset2.config.damping - preset1.config.damping) * clampedT,
        mass: preset1.config.mass + (preset2.config.mass - preset1.config.mass) * clampedT,
        restLength:
            preset1.config.restLength !== undefined && preset2.config.restLength !== undefined
                ? preset1.config.restLength +
                  (preset2.config.restLength - preset1.config.restLength) * clampedT
                : undefined,
    };
}

export function blendGaitPresets(preset1: GaitPreset, preset2: GaitPreset, t: number): GaitConfig {
    const clampedT = Math.max(0, Math.min(1, t));
    const lerp = (a: number, b: number) => a + (b - a) * clampedT;

    return {
        stepLength: lerp(preset1.config.stepLength, preset2.config.stepLength),
        stepHeight: lerp(preset1.config.stepHeight, preset2.config.stepHeight),
        stepDuration: lerp(preset1.config.stepDuration, preset2.config.stepDuration),
        bodyBob: lerp(preset1.config.bodyBob, preset2.config.bodyBob),
        bodySwayAmplitude: lerp(preset1.config.bodySwayAmplitude, preset2.config.bodySwayAmplitude),
        hipRotation: lerp(preset1.config.hipRotation, preset2.config.hipRotation),
        phaseOffset: lerp(preset1.config.phaseOffset, preset2.config.phaseOffset),
        footOvershoot: lerp(preset1.config.footOvershoot, preset2.config.footOvershoot),
    };
}
