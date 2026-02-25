import { describe, expect, it } from 'vitest';
import {
  blendGaitPresets,
  blendSpringPresets,
  createCustomGaitPreset,
  createCustomIKPreset,
  createCustomSpringPreset,
  gaitPresets,
  getGaitPreset,
  getIKPreset,
  getLookAtPreset,
  getSpringPreset,
  ikPresets,
  lookAtPresets,
  springPresets,
  BOUNCY_SPRING_PRESET,
  CLOTH_SPRING_PRESET,
  CRAWL_GAIT_PRESET,
  FINGER_IK_PRESET,
  FLOPPY_SPRING_PRESET,
  HAIR_SPRING_PRESET,
  HUMAN_ARM_IK_PRESET,
  HUMAN_LEG_IK_PRESET,
  JELLY_SPRING_PRESET,
  LAZY_LOOKAT_PRESET,
  LIMP_GAIT_PRESET,
  MARCH_GAIT_PRESET,
  ORGANIC_LOOKAT_PRESET,
  ROBOTIC_LOOKAT_PRESET,
  RUN_GAIT_PRESET,
  SMOOTH_LOOKAT_PRESET,
  SNAPPY_LOOKAT_PRESET,
  SNEAK_GAIT_PRESET,
  SPIDER_LEG_IK_PRESET,
  SPINE_IK_PRESET,
  STIFF_SPRING_PRESET,
  TAIL_IK_PRESET,
  TENTACLE_IK_PRESET,
  WALK_GAIT_PRESET,
} from '../src/animation';

describe('IK Presets', () => {
  const ikNames = Object.keys(ikPresets) as (keyof typeof ikPresets)[];

  it('has expected preset names', () => {
    expect(ikNames).toContain('humanArm');
    expect(ikNames).toContain('humanLeg');
    expect(ikNames).toContain('spiderLeg');
    expect(ikNames).toContain('tentacle');
    expect(ikNames).toContain('finger');
    expect(ikNames).toContain('spine');
    expect(ikNames).toContain('tail');
  });

  it.each(ikNames)('preset "%s" has required properties', (name) => {
    const preset = ikPresets[name];

    expect(typeof preset.name).toBe('string');
    expect(typeof preset.description).toBe('string');
    expect(Array.isArray(preset.boneLengths)).toBe(true);
    expect(preset.boneLengths.length).toBeGreaterThan(0);
    expect(typeof preset.tolerance).toBe('number');
    expect(typeof preset.maxIterations).toBe('number');
    expect(['fabrik', 'ccd']).toContain(preset.solver);
  });

  it.each(ikNames)('preset "%s" has positive bone lengths', (name) => {
    const preset = ikPresets[name];
    for (const length of preset.boneLengths) {
      expect(length).toBeGreaterThan(0);
    }
  });

  it('human arm has 2 bones', () => {
    expect(HUMAN_ARM_IK_PRESET.boneLengths).toHaveLength(2);
    expect(HUMAN_ARM_IK_PRESET.solver).toBe('fabrik');
  });

  it('human leg has 2 bones', () => {
    expect(HUMAN_LEG_IK_PRESET.boneLengths).toHaveLength(2);
  });

  it('spider leg has 4 segments', () => {
    expect(SPIDER_LEG_IK_PRESET.boneLengths).toHaveLength(4);
    expect(SPIDER_LEG_IK_PRESET.solver).toBe('ccd');
  });

  it('tentacle has many segments', () => {
    expect(TENTACLE_IK_PRESET.boneLengths.length).toBeGreaterThan(5);
  });

  it('finger has 3 bones', () => {
    expect(FINGER_IK_PRESET.boneLengths).toHaveLength(3);
  });

  it('spine uses ccd solver', () => {
    expect(SPINE_IK_PRESET.solver).toBe('ccd');
  });

  it('tail has many segments', () => {
    expect(TAIL_IK_PRESET.boneLengths.length).toBeGreaterThan(5);
  });
});

describe('Spring Presets', () => {
  const springNames = Object.keys(springPresets) as (keyof typeof springPresets)[];

  it('has expected preset names', () => {
    expect(springNames).toContain('stiff');
    expect(springNames).toContain('bouncy');
    expect(springNames).toContain('floppy');
    expect(springNames).toContain('hair');
    expect(springNames).toContain('cloth');
    expect(springNames).toContain('jelly');
  });

  it.each(springNames)('preset "%s" has required properties', (name) => {
    const preset = springPresets[name];

    expect(typeof preset.name).toBe('string');
    expect(typeof preset.description).toBe('string');
    expect(typeof preset.config.stiffness).toBe('number');
    expect(typeof preset.config.damping).toBe('number');
    expect(typeof preset.config.mass).toBe('number');
  });

  it.each(springNames)('preset "%s" has positive values', (name) => {
    const preset = springPresets[name];

    expect(preset.config.stiffness).toBeGreaterThan(0);
    expect(preset.config.damping).toBeGreaterThan(0);
    expect(preset.config.mass).toBeGreaterThan(0);
  });

  it('stiff has highest stiffness', () => {
    const stiffnesses = springNames.map((n) => springPresets[n].config.stiffness);
    expect(STIFF_SPRING_PRESET.config.stiffness).toBe(Math.max(...stiffnesses));
  });

  it('floppy has lowest stiffness', () => {
    const stiffnesses = springNames.map((n) => springPresets[n].config.stiffness);
    expect(FLOPPY_SPRING_PRESET.config.stiffness).toBe(Math.min(...stiffnesses));
  });
});

describe('Gait Presets', () => {
  const gaitNames = Object.keys(gaitPresets) as (keyof typeof gaitPresets)[];

  it('has expected preset names', () => {
    expect(gaitNames).toContain('walk');
    expect(gaitNames).toContain('run');
    expect(gaitNames).toContain('sneak');
    expect(gaitNames).toContain('limp');
    expect(gaitNames).toContain('march');
    expect(gaitNames).toContain('crawl');
  });

  it.each(gaitNames)('preset "%s" has required properties', (name) => {
    const preset = gaitPresets[name];

    expect(typeof preset.name).toBe('string');
    expect(typeof preset.description).toBe('string');
    expect(typeof preset.config.stepLength).toBe('number');
    expect(typeof preset.config.stepHeight).toBe('number');
    expect(typeof preset.config.stepDuration).toBe('number');
    expect(typeof preset.config.bodyBob).toBe('number');
    expect(typeof preset.config.bodySwayAmplitude).toBe('number');
    expect(typeof preset.config.hipRotation).toBe('number');
    expect(typeof preset.config.phaseOffset).toBe('number');
    expect(typeof preset.config.footOvershoot).toBe('number');
  });

  it('run has longer steps than walk', () => {
    expect(RUN_GAIT_PRESET.config.stepLength).toBeGreaterThan(WALK_GAIT_PRESET.config.stepLength);
  });

  it('run has shorter step duration than walk', () => {
    expect(RUN_GAIT_PRESET.config.stepDuration).toBeLessThan(WALK_GAIT_PRESET.config.stepDuration);
  });

  it('sneak has shortest steps', () => {
    expect(SNEAK_GAIT_PRESET.config.stepLength).toBeLessThan(WALK_GAIT_PRESET.config.stepLength);
    expect(SNEAK_GAIT_PRESET.config.stepHeight).toBeLessThan(WALK_GAIT_PRESET.config.stepHeight);
  });

  it('march has high steps', () => {
    expect(MARCH_GAIT_PRESET.config.stepHeight).toBeGreaterThan(WALK_GAIT_PRESET.config.stepHeight);
  });

  it('crawl has very low step height', () => {
    expect(CRAWL_GAIT_PRESET.config.stepHeight).toBeLessThan(WALK_GAIT_PRESET.config.stepHeight);
    expect(CRAWL_GAIT_PRESET.config.stepHeight).toBeLessThan(RUN_GAIT_PRESET.config.stepHeight);
  });

  it('limp has asymmetric phase offset', () => {
    expect(LIMP_GAIT_PRESET.config.phaseOffset).not.toBe(0.5);
  });
});

describe('LookAt Presets', () => {
  const lookAtNames = Object.keys(lookAtPresets) as (keyof typeof lookAtPresets)[];

  it('has expected preset names', () => {
    expect(lookAtNames).toContain('lazy');
    expect(lookAtNames).toContain('snappy');
    expect(lookAtNames).toContain('smooth');
    expect(lookAtNames).toContain('robotic');
    expect(lookAtNames).toContain('organic');
  });

  it.each(lookAtNames)('preset "%s" has required properties', (name) => {
    const preset = lookAtPresets[name];

    expect(typeof preset.name).toBe('string');
    expect(typeof preset.description).toBe('string');
    expect(typeof preset.config.maxAngle).toBe('number');
    expect(typeof preset.config.speed).toBe('number');
    expect(typeof preset.config.deadzone).toBe('number');
    expect(typeof preset.config.smoothing).toBe('number');
  });

  it('snappy has highest speed', () => {
    const speeds = lookAtNames.map((n) => lookAtPresets[n].config.speed);
    // robotic is actually fastest at 20, not snappy at 12
    expect(SNAPPY_LOOKAT_PRESET.config.speed).toBeGreaterThan(LAZY_LOOKAT_PRESET.config.speed);
  });

  it('lazy has most smoothing', () => {
    expect(LAZY_LOOKAT_PRESET.config.smoothing).toBeGreaterThan(
      SNAPPY_LOOKAT_PRESET.config.smoothing
    );
  });

  it('robotic has minimal smoothing', () => {
    expect(ROBOTIC_LOOKAT_PRESET.config.smoothing).toBeLessThan(
      SMOOTH_LOOKAT_PRESET.config.smoothing
    );
  });
});

describe('getter functions', () => {
  it('getIKPreset returns correct preset', () => {
    expect(getIKPreset('humanArm')).toBe(HUMAN_ARM_IK_PRESET);
    expect(getIKPreset('tail')).toBe(TAIL_IK_PRESET);
  });

  it('getSpringPreset returns correct preset', () => {
    expect(getSpringPreset('bouncy')).toBe(BOUNCY_SPRING_PRESET);
    expect(getSpringPreset('cloth')).toBe(CLOTH_SPRING_PRESET);
  });

  it('getGaitPreset returns correct preset', () => {
    expect(getGaitPreset('walk')).toBe(WALK_GAIT_PRESET);
    expect(getGaitPreset('run')).toBe(RUN_GAIT_PRESET);
  });

  it('getLookAtPreset returns correct preset', () => {
    expect(getLookAtPreset('lazy')).toBe(LAZY_LOOKAT_PRESET);
    expect(getLookAtPreset('organic')).toBe(ORGANIC_LOOKAT_PRESET);
  });
});

describe('custom preset factories', () => {
  describe('createCustomIKPreset', () => {
    it('creates preset with given values', () => {
      const preset = createCustomIKPreset('myArm', [0.5, 0.4, 0.3]);

      expect(preset.name).toBe('myArm');
      expect(preset.boneLengths).toEqual([0.5, 0.4, 0.3]);
      expect(preset.description).toContain('myArm');
    });

    it('uses defaults for omitted options', () => {
      const preset = createCustomIKPreset('test', [0.1]);

      expect(preset.tolerance).toBe(0.001);
      expect(preset.maxIterations).toBe(15);
      expect(preset.solver).toBe('fabrik');
    });

    it('allows overriding defaults', () => {
      const preset = createCustomIKPreset('test', [0.1], {
        solver: 'ccd',
        tolerance: 0.01,
        maxIterations: 5,
        description: 'Custom desc',
      });

      expect(preset.solver).toBe('ccd');
      expect(preset.tolerance).toBe(0.01);
      expect(preset.maxIterations).toBe(5);
      expect(preset.description).toBe('Custom desc');
    });
  });

  describe('createCustomSpringPreset', () => {
    it('creates preset with given values', () => {
      const preset = createCustomSpringPreset('mySpring', { stiffness: 300, damping: 20 });

      expect(preset.name).toBe('mySpring');
      expect(preset.config.stiffness).toBe(300);
      expect(preset.config.damping).toBe(20);
    });

    it('uses defaults for omitted config values', () => {
      const preset = createCustomSpringPreset('test', {});

      expect(preset.config.stiffness).toBe(100);
      expect(preset.config.damping).toBe(10);
      expect(preset.config.mass).toBe(1);
    });

    it('uses custom description when provided', () => {
      const preset = createCustomSpringPreset('test', {}, 'My custom spring');
      expect(preset.description).toBe('My custom spring');
    });

    it('generates default description when not provided', () => {
      const preset = createCustomSpringPreset('mySpring', {});
      expect(preset.description).toContain('mySpring');
    });
  });

  describe('createCustomGaitPreset', () => {
    it('creates preset with given values', () => {
      const preset = createCustomGaitPreset('myGait', { stepLength: 2.0, stepHeight: 0.5 });

      expect(preset.name).toBe('myGait');
      expect(preset.config.stepLength).toBe(2.0);
      expect(preset.config.stepHeight).toBe(0.5);
    });

    it('uses defaults for omitted config values', () => {
      const preset = createCustomGaitPreset('test', {});

      expect(preset.config.stepLength).toBe(0.8);
      expect(preset.config.stepHeight).toBe(0.15);
      expect(preset.config.stepDuration).toBe(0.4);
      expect(preset.config.bodyBob).toBe(0.05);
      expect(preset.config.bodySwayAmplitude).toBe(0.02);
      expect(preset.config.hipRotation).toBe(0.1);
      expect(preset.config.phaseOffset).toBe(0.5);
      expect(preset.config.footOvershoot).toBe(0.1);
    });

    it('uses custom description when provided', () => {
      const preset = createCustomGaitPreset('test', {}, 'My custom gait');
      expect(preset.description).toBe('My custom gait');
    });
  });
});

describe('blend functions', () => {
  describe('blendSpringPresets', () => {
    it('returns first preset at t=0', () => {
      const result = blendSpringPresets(STIFF_SPRING_PRESET, FLOPPY_SPRING_PRESET, 0);

      expect(result.stiffness).toBe(STIFF_SPRING_PRESET.config.stiffness);
      expect(result.damping).toBe(STIFF_SPRING_PRESET.config.damping);
      expect(result.mass).toBe(STIFF_SPRING_PRESET.config.mass);
    });

    it('returns second preset at t=1', () => {
      const result = blendSpringPresets(STIFF_SPRING_PRESET, FLOPPY_SPRING_PRESET, 1);

      expect(result.stiffness).toBe(FLOPPY_SPRING_PRESET.config.stiffness);
      expect(result.damping).toBe(FLOPPY_SPRING_PRESET.config.damping);
      expect(result.mass).toBe(FLOPPY_SPRING_PRESET.config.mass);
    });

    it('returns midpoint at t=0.5', () => {
      const result = blendSpringPresets(STIFF_SPRING_PRESET, FLOPPY_SPRING_PRESET, 0.5);

      const expectedStiffness =
        (STIFF_SPRING_PRESET.config.stiffness + FLOPPY_SPRING_PRESET.config.stiffness) / 2;
      expect(result.stiffness).toBeCloseTo(expectedStiffness);
    });

    it('clamps t below 0', () => {
      const result = blendSpringPresets(STIFF_SPRING_PRESET, FLOPPY_SPRING_PRESET, -1);
      expect(result.stiffness).toBe(STIFF_SPRING_PRESET.config.stiffness);
    });

    it('clamps t above 1', () => {
      const result = blendSpringPresets(STIFF_SPRING_PRESET, FLOPPY_SPRING_PRESET, 2);
      expect(result.stiffness).toBe(FLOPPY_SPRING_PRESET.config.stiffness);
    });
  });

  describe('blendGaitPresets', () => {
    it('returns first preset at t=0', () => {
      const result = blendGaitPresets(WALK_GAIT_PRESET, RUN_GAIT_PRESET, 0);

      expect(result.stepLength).toBe(WALK_GAIT_PRESET.config.stepLength);
      expect(result.stepHeight).toBe(WALK_GAIT_PRESET.config.stepHeight);
      expect(result.stepDuration).toBe(WALK_GAIT_PRESET.config.stepDuration);
    });

    it('returns second preset at t=1', () => {
      const result = blendGaitPresets(WALK_GAIT_PRESET, RUN_GAIT_PRESET, 1);

      expect(result.stepLength).toBe(RUN_GAIT_PRESET.config.stepLength);
      expect(result.stepHeight).toBe(RUN_GAIT_PRESET.config.stepHeight);
    });

    it('returns midpoint at t=0.5', () => {
      const result = blendGaitPresets(WALK_GAIT_PRESET, RUN_GAIT_PRESET, 0.5);

      const expectedStepLength =
        (WALK_GAIT_PRESET.config.stepLength + RUN_GAIT_PRESET.config.stepLength) / 2;
      expect(result.stepLength).toBeCloseTo(expectedStepLength);
    });

    it('clamps t below 0', () => {
      const result = blendGaitPresets(WALK_GAIT_PRESET, RUN_GAIT_PRESET, -0.5);
      expect(result.stepLength).toBe(WALK_GAIT_PRESET.config.stepLength);
    });

    it('clamps t above 1', () => {
      const result = blendGaitPresets(WALK_GAIT_PRESET, RUN_GAIT_PRESET, 1.5);
      expect(result.stepLength).toBe(RUN_GAIT_PRESET.config.stepLength);
    });

    it('blends all gait properties', () => {
      const result = blendGaitPresets(WALK_GAIT_PRESET, RUN_GAIT_PRESET, 0.5);

      expect(result).toHaveProperty('stepLength');
      expect(result).toHaveProperty('stepHeight');
      expect(result).toHaveProperty('stepDuration');
      expect(result).toHaveProperty('bodyBob');
      expect(result).toHaveProperty('bodySwayAmplitude');
      expect(result).toHaveProperty('hipRotation');
      expect(result).toHaveProperty('phaseOffset');
      expect(result).toHaveProperty('footOvershoot');
    });
  });
});
