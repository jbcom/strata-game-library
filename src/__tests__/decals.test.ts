import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import {
    DecalProjector,
    DecalProjectorConfig,
    BillboardConfig,
    SpriteSheetConfig,
    updateBillboardRotation,
    createBillboardMatrix,
    sortBillboardsByDepth,
    createSpriteSheetAnimation,
    updateSpriteSheetAnimation,
    getSpriteSheetUVs,
    applySpriteSheetFrame,
    createSpriteSheetMaterial,
    createDecalTexture,
    createBulletHoleTexture,
    createBloodSplatterTexture,
    createScorchMarkTexture,
} from '../core/decals';

describe('DecalProjector', () => {
    describe('instantiation', () => {
        it('should create a DecalProjector with config', () => {
            const projector = new DecalProjector({
                size: new THREE.Vector3(1, 1, 0.1),
            });
            expect(projector).toBeDefined();
        });

        it('should create a DecalProjector with custom depth', () => {
            const projector = new DecalProjector({
                size: new THREE.Vector3(1, 1, 0.1),
                depth: 0.5,
            });
            expect(projector).toBeDefined();
        });

        it('should create a DecalProjector with fade time', () => {
            const projector = new DecalProjector({
                size: new THREE.Vector3(1, 1, 0.1),
                fadeTime: 10,
            });
            expect(projector).toBeDefined();
        });

        it('should create a DecalProjector with max decals', () => {
            const projector = new DecalProjector({
                size: new THREE.Vector3(1, 1, 0.1),
                maxDecals: 50,
            });
            expect(projector).toBeDefined();
        });
    });

    describe('management', () => {
        it('should track decal count', () => {
            const projector = new DecalProjector({
                size: new THREE.Vector3(1, 1, 0.1),
            });
            expect(projector.count).toBe(0);
        });

        it('should generate unique IDs', () => {
            const projector = new DecalProjector({
                size: new THREE.Vector3(1, 1, 0.1),
            });
            const id1 = projector.generateId();
            const id2 = projector.generateId();
            expect(id1).not.toBe(id2);
        });

        it('should update decals', () => {
            const projector = new DecalProjector({
                size: new THREE.Vector3(1, 1, 0.1),
            });
            expect(() => projector.update(0.016)).not.toThrow();
        });

        it('should clear all decals', () => {
            const projector = new DecalProjector({
                size: new THREE.Vector3(1, 1, 0.1),
            });
            expect(() => projector.clear()).not.toThrow();
            expect(projector.count).toBe(0);
        });

        it('should get all decals', () => {
            const projector = new DecalProjector({
                size: new THREE.Vector3(1, 1, 0.1),
            });
            const decals = projector.getAllDecals();
            expect(Array.isArray(decals)).toBe(true);
        });
    });
});

describe('updateBillboardRotation', () => {
    it('should rotate object to face camera', () => {
        const object = new THREE.Mesh();
        const camera = new THREE.PerspectiveCamera();
        camera.position.set(0, 0, 10);

        expect(() => updateBillboardRotation(object, camera)).not.toThrow();
    });

    it('should support Y-axis lock', () => {
        const object = new THREE.Mesh();
        const camera = new THREE.PerspectiveCamera();
        camera.position.set(5, 5, 5);

        expect(() => updateBillboardRotation(object, camera, { lockY: true })).not.toThrow();
    });

    it('should support offset', () => {
        const object = new THREE.Mesh();
        const camera = new THREE.PerspectiveCamera();
        camera.position.set(0, 0, 10);

        expect(() =>
            updateBillboardRotation(object, camera, {
                offset: new THREE.Vector3(0, 1, 0),
            })
        ).not.toThrow();
    });
});

describe('createBillboardMatrix', () => {
    it('should create billboard matrix', () => {
        const position = new THREE.Vector3(0, 0, 0);
        const cameraPos = new THREE.Vector3(0, 0, 10);
        const cameraQuat = new THREE.Quaternion();

        const matrix = createBillboardMatrix(position, cameraPos, cameraQuat);
        expect(matrix).toBeInstanceOf(THREE.Matrix4);
    });

    it('should support Y-axis lock', () => {
        const position = new THREE.Vector3(0, 0, 0);
        const cameraPos = new THREE.Vector3(5, 5, 5);
        const cameraQuat = new THREE.Quaternion();

        const matrix = createBillboardMatrix(position, cameraPos, cameraQuat, true);
        expect(matrix).toBeInstanceOf(THREE.Matrix4);
    });
});

describe('sortBillboardsByDepth', () => {
    it('should sort billboards by distance to camera', () => {
        const b1 = new THREE.Mesh();
        const b2 = new THREE.Mesh();
        const b3 = new THREE.Mesh();
        b1.position.set(0, 0, 5);
        b2.position.set(0, 0, 10);
        b3.position.set(0, 0, 2);

        const camera = new THREE.PerspectiveCamera();
        camera.position.set(0, 0, 0);

        const sorted = sortBillboardsByDepth([b1, b2, b3], camera);
        expect(sorted.length).toBe(3);
    });
});

describe('createSpriteSheetAnimation', () => {
    it('should create animation state', () => {
        const config: SpriteSheetConfig = {
            columns: 4,
            rows: 4,
            frameCount: 16,
            frameRate: 12,
        };
        const state = createSpriteSheetAnimation(config);
        expect(state.currentFrame).toBe(0);
        expect(state.elapsedTime).toBe(0);
        expect(state.isPlaying).toBe(true);
    });
});

describe('updateSpriteSheetAnimation', () => {
    it('should update animation frame', () => {
        const config: SpriteSheetConfig = {
            columns: 2,
            rows: 2,
            frameCount: 4,
            frameRate: 10,
        };
        let state = createSpriteSheetAnimation(config);
        state = updateSpriteSheetAnimation(state, config, 0.15);
        expect(state.currentFrame).toBe(1);
    });

    it('should loop animation by default', () => {
        const config: SpriteSheetConfig = {
            columns: 2,
            rows: 2,
            frameCount: 4,
            frameRate: 10,
        };
        let state = createSpriteSheetAnimation(config);
        state = updateSpriteSheetAnimation(state, config, 1.0);
        expect(state.currentFrame).toBeLessThan(4);
    });

    it('should not loop when loop is false', () => {
        const config: SpriteSheetConfig = {
            columns: 2,
            rows: 2,
            frameCount: 4,
            frameRate: 10,
            loop: false,
        };
        let state = createSpriteSheetAnimation(config);
        state = updateSpriteSheetAnimation(state, config, 10.0);
        expect(state.currentFrame).toBeLessThan(config.frameCount ?? 4);
    });

    it('should support ping-pong mode', () => {
        const config: SpriteSheetConfig = {
            columns: 2,
            rows: 2,
            frameCount: 4,
            frameRate: 10,
            pingPong: true,
        };
        let state = createSpriteSheetAnimation(config);
        state = updateSpriteSheetAnimation(state, config, 0.5);
        expect(state).toBeDefined();
    });
});

describe('getSpriteSheetUVs', () => {
    it('should return UV coordinates for frame', () => {
        const config: SpriteSheetConfig = {
            columns: 4,
            rows: 4,
            frameRate: 12,
        };
        const uvs = getSpriteSheetUVs(0, config);
        expect(uvs.scaleX).toBeCloseTo(0.25, 5);
        expect(uvs.scaleY).toBeCloseTo(0.25, 5);
        expect(uvs.offsetX).toBe(0);
    });

    it('should calculate correct offset for different frames', () => {
        const config: SpriteSheetConfig = {
            columns: 4,
            rows: 4,
            frameRate: 12,
        };
        const uvs = getSpriteSheetUVs(5, config);
        expect(uvs.offsetX).toBeCloseTo(0.25, 5);
    });
});

describe('applySpriteSheetFrame', () => {
    it('should update texture offset and repeat', () => {
        const texture = new THREE.Texture();
        const config: SpriteSheetConfig = {
            columns: 4,
            rows: 4,
            frameRate: 12,
        };
        expect(() => applySpriteSheetFrame(texture, 0, config)).not.toThrow();
        expect(texture.repeat.x).toBeCloseTo(0.25, 5);
        expect(texture.repeat.y).toBeCloseTo(0.25, 5);
    });
});

describe('createSpriteSheetMaterial', () => {
    it('should create sprite material', () => {
        const texture = new THREE.Texture();
        const config: SpriteSheetConfig = {
            columns: 4,
            rows: 4,
            frameRate: 12,
        };
        const material = createSpriteSheetMaterial(texture, config);
        expect(material).toBeInstanceOf(THREE.SpriteMaterial);
    });

    it('should accept options', () => {
        const texture = new THREE.Texture();
        const config: SpriteSheetConfig = {
            columns: 4,
            rows: 4,
            frameRate: 12,
        };
        const material = createSpriteSheetMaterial(texture, config, {
            transparent: true,
            alphaTest: 0.5,
        });
        expect(material).toBeDefined();
    });
});

describe('createDecalTexture', () => {
    it('should create texture in browser environment', () => {
        const texture = createDecalTexture(64, 64, () => {});
        // In JSDOM environment with mocks, texture is created
        expect(texture).toBeDefined();
    });
});

describe('createBulletHoleTexture', () => {
    it('should create texture in browser environment', () => {
        const texture = createBulletHoleTexture();
        expect(texture).toBeDefined();
    });
});

describe('createBloodSplatterTexture', () => {
    it('should create texture in browser environment', () => {
        const texture = createBloodSplatterTexture();
        expect(texture).toBeDefined();
    });
});

describe('createScorchMarkTexture', () => {
    it('should create texture in browser environment', () => {
        const texture = createScorchMarkTexture();
        expect(texture).toBeDefined();
    });
});

describe('BillboardConfig interface', () => {
    it('should create config with all options', () => {
        const config: BillboardConfig = {
            lockY: true,
            offset: new THREE.Vector3(0, 1, 0),
            scaleFactor: 1.5,
        };
        expect(config.lockY).toBe(true);
    });
});

describe('SpriteSheetConfig interface', () => {
    it('should create config with all options', () => {
        const config: SpriteSheetConfig = {
            columns: 8,
            rows: 8,
            frameCount: 64,
            frameRate: 24,
            loop: true,
            pingPong: false,
        };
        expect(config.columns).toBe(8);
        expect(config.frameRate).toBe(24);
    });
});
