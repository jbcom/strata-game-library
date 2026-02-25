import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  cameraPresets,
  cinematicCutscenePreset,
  cinematicDollyPreset,
  cinematicDramaticPreset,
  cinematicOrbitPreset,
  createCircularPath,
  createCranePath,
  createDollyPath,
  sideScrollerCinematicPreset,
  sideScrollerPreset,
  sideScrollerTightPreset,
  thirdPersonActionPreset,
  thirdPersonCombatPreset,
  thirdPersonExplorationPreset,
  topDownIsometricPreset,
  topDownRTSPreset,
  topDownTacticalPreset,
} from '../src/camera';

describe('camera presets', () => {
  describe('cameraPresets record', () => {
    it('contains all 13 presets', () => {
      expect(Object.keys(cameraPresets)).toHaveLength(13);
    });

    it('maps all preset references correctly', () => {
      expect(cameraPresets.thirdPersonAction).toBe(thirdPersonActionPreset);
      expect(cameraPresets.thirdPersonExploration).toBe(thirdPersonExplorationPreset);
      expect(cameraPresets.thirdPersonCombat).toBe(thirdPersonCombatPreset);
      expect(cameraPresets.topDownRTS).toBe(topDownRTSPreset);
      expect(cameraPresets.topDownTactical).toBe(topDownTacticalPreset);
      expect(cameraPresets.topDownIsometric).toBe(topDownIsometricPreset);
      expect(cameraPresets.sideScroller).toBe(sideScrollerPreset);
      expect(cameraPresets.sideScrollerTight).toBe(sideScrollerTightPreset);
      expect(cameraPresets.sideScrollerCinematic).toBe(sideScrollerCinematicPreset);
      expect(cameraPresets.cinematicCutscene).toBe(cinematicCutscenePreset);
      expect(cameraPresets.cinematicDolly).toBe(cinematicDollyPreset);
      expect(cameraPresets.cinematicOrbit).toBe(cinematicOrbitPreset);
      expect(cameraPresets.cinematicDramatic).toBe(cinematicDramaticPreset);
    });
  });

  describe('third-person presets', () => {
    it.each([
      ['action', thirdPersonActionPreset],
      ['exploration', thirdPersonExplorationPreset],
      ['combat', thirdPersonCombatPreset],
    ] as const)('%s preset has type third-person', (_name, preset) => {
      expect(preset.type).toBe('third-person');
    });

    it.each([
      ['action', thirdPersonActionPreset],
      ['exploration', thirdPersonExplorationPreset],
      ['combat', thirdPersonCombatPreset],
    ] as const)('%s preset has offset array of length 3', (_name, preset) => {
      expect(preset.offset).toHaveLength(3);
    });

    it.each([
      ['action', thirdPersonActionPreset],
      ['exploration', thirdPersonExplorationPreset],
      ['combat', thirdPersonCombatPreset],
    ] as const)('%s preset has positive fov', (_name, preset) => {
      expect(preset.fov).toBeGreaterThan(0);
    });
  });

  describe('top-down presets', () => {
    it.each([
      ['RTS', topDownRTSPreset],
      ['tactical', topDownTacticalPreset],
      ['isometric', topDownIsometricPreset],
    ] as const)('%s preset has type top-down', (_name, preset) => {
      expect(preset.type).toBe('top-down');
    });

    it('isometric preset locks polar angle', () => {
      expect(topDownIsometricPreset.minPolarAngle).toBe(topDownIsometricPreset.maxPolarAngle);
    });
  });

  describe('side-scroller presets', () => {
    it.each([
      ['standard', sideScrollerPreset],
      ['tight', sideScrollerTightPreset],
      ['cinematic', sideScrollerCinematicPreset],
    ] as const)('%s preset has type side-scroller', (_name, preset) => {
      expect(preset.type).toBe('side-scroller');
    });
  });

  describe('cinematic presets', () => {
    it.each([
      ['cutscene', cinematicCutscenePreset],
      ['dolly', cinematicDollyPreset],
      ['orbit', cinematicOrbitPreset],
      ['dramatic', cinematicDramaticPreset],
    ] as const)('%s preset has type cinematic', (_name, preset) => {
      expect(preset.type).toBe('cinematic');
    });

    it('orbit preset loops', () => {
      expect(cinematicOrbitPreset.loop).toBe(true);
      expect(cinematicOrbitPreset.closed).toBe(true);
    });

    it('dramatic preset has fovKeyframes', () => {
      expect(cinematicDramaticPreset.fovKeyframes).toBeDefined();
      expect(cinematicDramaticPreset.fovKeyframes!.length).toBeGreaterThan(0);
    });
  });

  describe('createCircularPath', () => {
    it('returns correct number of points', () => {
      const center = new THREE.Vector3(0, 0, 0);
      const points = createCircularPath(center, 10, 5, 8);
      expect(points).toHaveLength(8);
    });

    it('all points are THREE.Vector3 instances', () => {
      const center = new THREE.Vector3(0, 0, 0);
      const points = createCircularPath(center, 10, 5);
      for (const p of points) {
        expect(p).toBeInstanceOf(THREE.Vector3);
      }
    });

    it('points are at the correct height', () => {
      const center = new THREE.Vector3(0, 0, 0);
      const height = 5;
      const points = createCircularPath(center, 10, height, 4);
      for (const p of points) {
        expect(p.y).toBe(height);
      }
    });

    it('points are at the correct radius from center (xz plane)', () => {
      const center = new THREE.Vector3(1, 2, 3);
      const radius = 10;
      const points = createCircularPath(center, radius, 0, 16);
      for (const p of points) {
        const dx = p.x - center.x;
        const dz = p.z - center.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        expect(dist).toBeCloseTo(radius, 5);
      }
    });

    it('defaults to 8 segments', () => {
      const points = createCircularPath(new THREE.Vector3(), 5, 0);
      expect(points).toHaveLength(8);
    });
  });

  describe('createDollyPath', () => {
    it('returns segments + 1 points', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(10, 0, 0);
      const points = createDollyPath(start, end, 0, 4);
      expect(points).toHaveLength(5);
    });

    it('first point is at start, last point is at end', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(10, 0, 0);
      const points = createDollyPath(start, end, 0, 4);
      expect(points[0].x).toBeCloseTo(start.x);
      expect(points[0].z).toBeCloseTo(start.z);
      expect(points[points.length - 1].x).toBeCloseTo(end.x);
      expect(points[points.length - 1].z).toBeCloseTo(end.z);
    });

    it('applies height curve', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(10, 0, 0);
      const heightCurve = 5;
      const points = createDollyPath(start, end, heightCurve, 4);
      // Middle point should be elevated
      const mid = points[2];
      expect(mid.y).toBeGreaterThan(0);
    });

    it('with no height curve, points stay at interpolated y', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(10, 0, 0);
      const points = createDollyPath(start, end, 0, 4);
      for (const p of points) {
        expect(p.y).toBeCloseTo(0);
      }
    });
  });

  describe('createCranePath', () => {
    it('returns segments + 1 points', () => {
      const base = new THREE.Vector3(0, 0, 0);
      const points = createCranePath(base, 10, 5, 4);
      expect(points).toHaveLength(5);
    });

    it('first point is at base', () => {
      const base = new THREE.Vector3(1, 2, 3);
      const points = createCranePath(base, 10, 5, 4);
      expect(points[0].x).toBeCloseTo(base.x);
      expect(points[0].y).toBeCloseTo(base.y);
      expect(points[0].z).toBeCloseTo(base.z);
    });

    it('last point reaches the end height', () => {
      const base = new THREE.Vector3(0, 0, 0);
      const endHeight = 10;
      const points = createCranePath(base, endHeight, 5, 4);
      expect(points[points.length - 1].y).toBeCloseTo(endHeight);
    });

    it('all points are THREE.Vector3', () => {
      const points = createCranePath(new THREE.Vector3(), 5, 3, 4);
      for (const p of points) {
        expect(p).toBeInstanceOf(THREE.Vector3);
      }
    });
  });
});
