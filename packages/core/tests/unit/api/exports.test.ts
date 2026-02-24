import { describe, expect, it } from 'vitest';

/**
 * Tests that the API barrel modules export the expected symbols.
 *
 * These tests verify that re-exports from each domain module are wired
 * correctly so consumers get the public surface they expect.
 */

describe('API barrel exports', () => {
  describe('api/index', () => {
    it('should re-export createGame', async () => {
      const api = await import('../../../src/api/index');
      expect(api.createGame).toBeTypeOf('function');
    });
  });

  describe('api/effects', () => {
    it('should export particle system utilities', async () => {
      const effects = await import('../../../src/api/effects');

      expect(effects.createParticleEmitter).toBeTypeOf('function');
      expect(effects.CoreParticleEmitter).toBeDefined();
    });

    it('should export weather system utilities', async () => {
      const effects = await import('../../../src/api/effects');

      expect(effects.createWeatherSystem).toBeTypeOf('function');
      expect(effects.createWindSimulation).toBeTypeOf('function');
      expect(effects.CoreWeatherSystem).toBeDefined();
      expect(effects.WindSimulation).toBeDefined();
      expect(effects.getPrecipitationType).toBeTypeOf('function');
      expect(effects.calculateTemperature).toBeTypeOf('function');
    });

    it('should export LOD utilities', async () => {
      const effects = await import('../../../src/api/effects');

      expect(effects.calculateLODLevel).toBeTypeOf('function');
      expect(effects.createLODLevels).toBeTypeOf('function');
      expect(effects.LODManager).toBeDefined();
      expect(effects.batchLODObjects).toBeTypeOf('function');
      expect(effects.shouldUseLOD).toBeTypeOf('function');
    });

    it('should export billboard and decal utilities', async () => {
      const effects = await import('../../../src/api/effects');

      expect(effects.createBillboardMatrix).toBeTypeOf('function');
      expect(effects.sortBillboardsByDepth).toBeTypeOf('function');
      expect(effects.DecalProjector).toBeDefined();
      expect(effects.createDecalTexture).toBeTypeOf('function');
    });

    it('should export god rays / volumetric utilities', async () => {
      const effects = await import('../../../src/api/effects');

      expect(effects.createGodRaysMaterial).toBeTypeOf('function');
      expect(effects.blendGodRayColors).toBeTypeOf('function');
      expect(effects.calculateGodRayIntensityFromAngle).toBeTypeOf('function');
      expect(effects.createVolumetricPointLightMaterial).toBeTypeOf('function');
      expect(effects.createVolumetricSpotlightMaterial).toBeTypeOf('function');
    });

    it('should export sprite sheet utilities', async () => {
      const effects = await import('../../../src/api/effects');

      expect(effects.createSpriteSheetAnimation).toBeTypeOf('function');
      expect(effects.createSpriteSheetMaterial).toBeTypeOf('function');
      expect(effects.applySpriteSheetFrame).toBeTypeOf('function');
      expect(effects.getSpriteSheetUVs).toBeTypeOf('function');
      expect(effects.updateSpriteSheetAnimation).toBeTypeOf('function');
    });
  });

  describe('api/entities', () => {
    it('should export physics utilities', async () => {
      const entities = await import('../../../src/api/entities');

      expect(entities.calculateForce).toBeTypeOf('function');
      expect(entities.calculateImpulse).toBeTypeOf('function');
      expect(entities.calculateJumpImpulse).toBeTypeOf('function');
      expect(entities.applyDrag).toBeTypeOf('function');
      expect(entities.CollisionLayer).toBeDefined();
      expect(entities.createDefaultPhysicsConfig).toBeTypeOf('function');
      expect(entities.createDefaultCharacterConfig).toBeTypeOf('function');
    });

    it('should export IK solver utilities', async () => {
      const entities = await import('../../../src/api/entities');

      expect(entities.CCDSolver).toBeDefined();
      expect(entities.FABRIKSolver).toBeDefined();
      expect(entities.TwoBoneIKSolver).toBeDefined();
      expect(entities.createBoneChain).toBeTypeOf('function');
    });

    it('should export animation utilities', async () => {
      const entities = await import('../../../src/api/entities');

      expect(entities.dampedSpring).toBeTypeOf('function');
      expect(entities.dampedSpringVector3).toBeTypeOf('function');
      expect(entities.SpringDynamics).toBeDefined();
      expect(entities.SpringChain).toBeDefined();
      expect(entities.ProceduralGait).toBeDefined();
      expect(entities.LookAtController).toBeDefined();
    });

    it('should export vehicle and buoyancy utilities', async () => {
      const entities = await import('../../../src/api/entities');

      expect(entities.createDefaultVehicleConfig).toBeTypeOf('function');
      expect(entities.calculateSuspensionForce).toBeTypeOf('function');
      expect(entities.calculateSteeringAngle).toBeTypeOf('function');
      expect(entities.createDefaultBuoyancyConfig).toBeTypeOf('function');
      expect(entities.calculateBuoyancyForce).toBeTypeOf('function');
    });

    it('should export ragdoll utilities', async () => {
      const entities = await import('../../../src/api/entities');

      expect(entities.createHumanoidRagdoll).toBeTypeOf('function');
      expect(entities.createDefaultDestructibleConfig).toBeTypeOf('function');
      expect(entities.calculateExplosionForce).toBeTypeOf('function');
      expect(entities.generateDebrisVelocity).toBeTypeOf('function');
    });
  });

  describe('api/experience', () => {
    it('should export camera utilities', async () => {
      const experience = await import('../../../src/api/experience');

      expect(experience.CoreCameraShake).toBeDefined();
      expect(experience.calculateHeadBob).toBeTypeOf('function');
      expect(experience.calculateLookAhead).toBeTypeOf('function');
      expect(experience.calculateScreenShakeIntensity).toBeTypeOf('function');
      expect(experience.evaluateCatmullRom).toBeTypeOf('function');
      expect(experience.FOVTransition).toBeDefined();
    });

    it('should export input manager', async () => {
      const experience = await import('../../../src/api/experience');

      expect(experience.createInputManager).toBeTypeOf('function');
      expect(experience.InputManager).toBeDefined();
      expect(experience.InputStateMachine).toBeDefined();
      expect(experience.HapticFeedback).toBeDefined();
    });

    it('should export audio utilities', async () => {
      const experience = await import('../../../src/api/experience');

      expect(experience.createSoundManager).toBeTypeOf('function');
      expect(experience.createSpatialAudio).toBeTypeOf('function');
      expect(experience.SoundManager).toBeDefined();
      expect(experience.SpatialAudio).toBeDefined();
      expect(experience.Howl).toBeDefined();
      expect(experience.Howler).toBeDefined();
    });

    it('should export UI utility functions', async () => {
      const experience = await import('../../../src/api/experience');

      expect(experience.createDefaultCrosshair).toBeTypeOf('function');
      expect(experience.createDefaultMinimap).toBeTypeOf('function');
      expect(experience.createDefaultInventory).toBeTypeOf('function');
      expect(experience.createDefaultTooltip).toBeTypeOf('function');
      expect(experience.createDefaultProgressBar).toBeTypeOf('function');
      expect(experience.formatNumber).toBeTypeOf('function');
      expect(experience.getAnchorOffset).toBeTypeOf('function');
    });

    it('should export math interpolation helpers', async () => {
      const experience = await import('../../../src/api/experience');

      expect(experience.lerp).toBeTypeOf('function');
      expect(experience.slerp).toBeTypeOf('function');
      expect(experience.smoothDamp).toBeTypeOf('function');
      expect(experience.smoothDampScalar).toBeTypeOf('function');
      expect(experience.smoothDampVector3).toBeTypeOf('function');
      expect(experience.screenToWorld).toBeTypeOf('function');
      expect(experience.worldToScreen).toBeTypeOf('function');
    });
  });

  describe('api/rendering', () => {
    it('should export post-processing utilities', async () => {
      const rendering = await import('../../../src/api/rendering');

      expect(rendering.defaultEffectSettings).toBeTypeOf('object');
      expect(rendering.blendPostProcessingPresets).toBeTypeOf('function');
      expect(rendering.getTimeOfDayEffects).toBeTypeOf('function');
    });

    it('should export DOF / camera utilities', async () => {
      const rendering = await import('../../../src/api/rendering');

      expect(rendering.calculateFocusDistance).toBeTypeOf('function');
      expect(rendering.apertureToBokehScale).toBeTypeOf('function');
      expect(rendering.focalLengthToFOV).toBeTypeOf('function');
      expect(rendering.fovToFocalLength).toBeTypeOf('function');
    });

    it('should export raymarching utilities', async () => {
      const rendering = await import('../../../src/api/rendering');

      expect(rendering.createRaymarchingGeometry).toBeTypeOf('function');
      expect(rendering.createRaymarchingMaterial).toBeTypeOf('function');
    });
  });

  describe('api/systems', () => {
    it('should export state management utilities', async () => {
      const systems = await import('../../../src/api/systems');

      expect(systems.createGameStore).toBeTypeOf('function');
      expect(systems.create).toBeTypeOf('function');
      expect(systems.immer).toBeTypeOf('function');
      expect(systems.temporal).toBeTypeOf('function');
    });

    it('should export persistence utilities', async () => {
      const systems = await import('../../../src/api/systems');

      expect(systems.createPersistenceAdapter).toBeTypeOf('function');
      expect(systems.calculateChecksum).toBeTypeOf('function');
      expect(systems.verifyChecksum).toBeTypeOf('function');
    });
  });

  describe('api/world', () => {
    it('should export terrain generation utilities', async () => {
      const world = await import('../../../src/api/world');

      expect(world.generateTerrainChunk).toBeTypeOf('function');
      expect(world.getTerrainHeight).toBeTypeOf('function');
      expect(world.getBiomeAt).toBeTypeOf('function');
    });

    it('should export noise functions', async () => {
      const world = await import('../../../src/api/world');

      expect(world.fbm).toBeTypeOf('function');
      expect(world.fbmNoise2D).toBeTypeOf('function');
      expect(world.noise3D).toBeTypeOf('function');
      expect(world.warpedFbm).toBeTypeOf('function');
    });

    it('should export SDF primitives', async () => {
      const world = await import('../../../src/api/world');

      expect(world.sdBox).toBeTypeOf('function');
      expect(world.sdSphere).toBeTypeOf('function');
      expect(world.sdCapsule).toBeTypeOf('function');
      expect(world.sdCone).toBeTypeOf('function');
      expect(world.sdTorus).toBeTypeOf('function');
      expect(world.sdPlane).toBeTypeOf('function');
    });

    it('should export SDF operations', async () => {
      const world = await import('../../../src/api/world');

      expect(world.opUnion).toBeTypeOf('function');
      expect(world.opSubtraction).toBeTypeOf('function');
      expect(world.opIntersection).toBeTypeOf('function');
      expect(world.opSmoothUnion).toBeTypeOf('function');
      expect(world.opSmoothSubtraction).toBeTypeOf('function');
      expect(world.opSmoothIntersection).toBeTypeOf('function');
    });

    it('should export marching cubes', async () => {
      const world = await import('../../../src/api/world');

      expect(world.marchingCubes).toBeTypeOf('function');
      expect(world.createGeometryFromMarchingCubes).toBeTypeOf('function');
    });

    it('should export water and sky utilities', async () => {
      const world = await import('../../../src/api/world');

      expect(world.createWaterGeometry).toBeTypeOf('function');
      expect(world.createWaterMaterial).toBeTypeOf('function');
      expect(world.createSkyGeometry).toBeTypeOf('function');
      expect(world.createSkyMaterial).toBeTypeOf('function');
    });

    it('should export cloud utilities', async () => {
      const world = await import('../../../src/api/world');

      expect(world.createDefaultCloudSkyConfig).toBeTypeOf('function');
      expect(world.createCloudLayerGeometry).toBeTypeOf('function');
      expect(world.createCloudLayerMaterial).toBeTypeOf('function');
      expect(world.createVolumetricCloudGeometry).toBeTypeOf('function');
      expect(world.createVolumetricCloudMaterial).toBeTypeOf('function');
      expect(world.sampleCloudDensity).toBeTypeOf('function');
    });

    it('should export instancing utilities', async () => {
      const world = await import('../../../src/api/world');

      expect(world.createInstancedMesh).toBeTypeOf('function');
    });
  });
});
