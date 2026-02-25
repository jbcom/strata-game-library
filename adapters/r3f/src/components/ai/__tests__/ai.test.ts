/**
 * AI Component Tests
 *
 * Tests for AI component exports and utility functions.
 *
 * @module components/ai/__tests__/ai.test
 */

import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: any) => callback,
  useThree: () => ({
    camera: new THREE.PerspectiveCamera(),
  }),
}));

vi.mock('yuka', () => {
  class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }
  class GameEntity {
    position = new Vector3();
    worldMatrix = {
      elements: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    };
  }
  class Vehicle extends GameEntity {
    maxSpeed = 1;
  }
  class Polygon {
    fromContour(_points: Vector3[]) {}
  }
  class State<_T> {
    enter(_entity: any) {}
    execute(_entity: any) {}
    exit(_entity: any) {}
  }
  class StateMachine<_T> {
    currentState: any = null;
    previousState: any = null;
    globalState: any = null;
    changeTo(_state: any) {}
    revert() {}
    update() {}
  }
  class EntityManager {
    add(_entity: any) {}
    remove(_entity: any) {}
    update(_delta: number) {}
  }
  class Time {
    update() {
      return { delta: 0.016 };
    }
  }
  class NavMesh {}
  class SteeringBehavior {
    weight = 1;
  }

  return {
    Vector3,
    GameEntity,
    Vehicle,
    Polygon,
    State,
    StateMachine,
    EntityManager,
    Time,
    NavMesh,
    SteeringBehavior,
  };
});

describe('AI exports', () => {
  it('should export all AI components from index', async () => {
    const aiModule = await import('../index');

    expect(aiModule.YukaEntityManager).toBeDefined();
    expect(aiModule.YukaNavMesh).toBeDefined();
    expect(aiModule.YukaPath).toBeDefined();
    expect(aiModule.YukaStateMachine).toBeDefined();
    expect(aiModule.YukaVehicle).toBeDefined();
  });

  it('should export utility functions', async () => {
    const aiModule = await import('../index');

    expect(aiModule.syncYukaToThree).toBeDefined();
    expect(aiModule.yukaVector3ToThree).toBeDefined();
    expect(aiModule.threeVector3ToYuka).toBeDefined();
    expect(aiModule.createPolygonsFromGeometry).toBeDefined();
  });
});

describe('AI utility functions', () => {
  describe('yukaVector3ToThree', () => {
    it('should convert a Yuka Vector3 to a THREE.Vector3', async () => {
      const { yukaVector3ToThree } = await import('../utils');
      const YUKA = await import('yuka');
      const yukaVec = new YUKA.Vector3(1, 2, 3);
      const threeVec = yukaVector3ToThree(yukaVec);

      expect(threeVec).toBeInstanceOf(THREE.Vector3);
      expect(threeVec.x).toBe(1);
      expect(threeVec.y).toBe(2);
      expect(threeVec.z).toBe(3);
    });

    it('should handle zero vector', async () => {
      const { yukaVector3ToThree } = await import('../utils');
      const YUKA = await import('yuka');
      const yukaVec = new YUKA.Vector3(0, 0, 0);
      const threeVec = yukaVector3ToThree(yukaVec);

      expect(threeVec.x).toBe(0);
      expect(threeVec.y).toBe(0);
      expect(threeVec.z).toBe(0);
    });

    it('should handle negative values', async () => {
      const { yukaVector3ToThree } = await import('../utils');
      const YUKA = await import('yuka');
      const yukaVec = new YUKA.Vector3(-5, -10, -15);
      const threeVec = yukaVector3ToThree(yukaVec);

      expect(threeVec.x).toBe(-5);
      expect(threeVec.y).toBe(-10);
      expect(threeVec.z).toBe(-15);
    });
  });

  describe('threeVector3ToYuka', () => {
    it('should convert a THREE.Vector3 to a Yuka Vector3', async () => {
      const { threeVector3ToYuka } = await import('../utils');
      const threeVec = new THREE.Vector3(4, 5, 6);
      const yukaVec = threeVector3ToYuka(threeVec);

      expect(yukaVec.x).toBe(4);
      expect(yukaVec.y).toBe(5);
      expect(yukaVec.z).toBe(6);
    });
  });

  describe('syncYukaToThree', () => {
    it('should sync Yuka entity transform to Three.js object', async () => {
      const { syncYukaToThree } = await import('../utils');
      const YUKA = await import('yuka');

      const entity = new YUKA.GameEntity();
      entity.position.x = 10;
      entity.position.y = 20;
      entity.position.z = 30;

      const object = new THREE.Object3D();
      syncYukaToThree(entity, object);

      expect(object.matrixAutoUpdate).toBe(false);
      expect(object.matrixWorldNeedsUpdate).toBe(true);
    });
  });

  describe('createPolygonsFromGeometry', () => {
    it('should create polygons from vertex and index arrays', async () => {
      const { createPolygonsFromGeometry } = await import('../utils');

      const vertices = [0, 0, 0, 1, 0, 0, 0, 1, 0];
      const indices = [0, 1, 2];

      const polygons = createPolygonsFromGeometry(vertices, indices);
      expect(polygons).toHaveLength(1);
    });

    it('should create multiple polygons for multiple triangles', async () => {
      const { createPolygonsFromGeometry } = await import('../utils');

      const vertices = [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0];
      const indices = [0, 1, 2, 1, 3, 2];

      const polygons = createPolygonsFromGeometry(vertices, indices);
      expect(polygons).toHaveLength(2);
    });

    it('should return empty array for empty input', async () => {
      const { createPolygonsFromGeometry } = await import('../utils');

      const polygons = createPolygonsFromGeometry([], []);
      expect(polygons).toHaveLength(0);
    });
  });
});
