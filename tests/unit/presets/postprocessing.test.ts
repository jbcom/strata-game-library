import * as THREE from 'three';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
    createPostProcessingPipeline,
    type PostProcessingEffect,
    type PostProcessingOptions,
} from '../../../src/presets/postprocessing';

describe('Post-Processing', () => {
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;

    beforeEach(() => {
        // Skip WebGLRenderer creation in node environment
        if (typeof document !== 'undefined') {
            renderer = new THREE.WebGLRenderer();
        }
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    });

    afterEach(() => {
        if (renderer) {
            renderer.dispose();
        }
    });

    test('should create post-processing pipeline with no effects', () => {
        if (!renderer) {
            // Skip test in node environment
            return;
        }
        const options: PostProcessingOptions = {
            renderer,
            scene,
            camera,
            effects: [],
        };

        const pipeline = createPostProcessingPipeline(options);

        expect(pipeline).toBeDefined();
        expect(typeof pipeline.render).toBe('function');
        expect(typeof pipeline.dispose).toBe('function');
    });

    test('should create post-processing pipeline with bloom effect', () => {
        if (!renderer) {
            return;
        }
        const effects: PostProcessingEffect[] = [
            { type: 'bloom', threshold: 0.8, intensity: 1.0, radius: 0.5 },
        ];

        const pipeline = createPostProcessingPipeline({
            renderer,
            scene,
            camera,
            effects,
        });

        expect(pipeline).toBeDefined();
    });

    test('should create post-processing pipeline with multiple effects', () => {
        if (!renderer) {
            return;
        }
        const effects: PostProcessingEffect[] = [
            { type: 'bloom', threshold: 0.8 },
            { type: 'ssao', radius: 0.5, intensity: 1.0 },
            { type: 'vignette', offset: 0.5, darkness: 0.5 },
            { type: 'filmGrain', intensity: 0.1 },
        ];

        const pipeline = createPostProcessingPipeline({
            renderer,
            scene,
            camera,
            effects,
        });

        expect(pipeline).toBeDefined();
    });

    test('should validate required parameters', () => {
        expect(() => {
            createPostProcessingPipeline({
                renderer: null as any,
                scene,
                camera,
            });
        }).toThrow('renderer is required');

        if (!renderer) {
            return;
        }

        expect(() => {
            createPostProcessingPipeline({
                renderer,
                scene: null as any,
                camera,
            });
        }).toThrow('scene is required');

        expect(() => {
            createPostProcessingPipeline({
                renderer,
                scene,
                camera: null as any,
            });
        }).toThrow('camera is required');
    });

    test('should render pipeline', () => {
        if (!renderer) {
            return;
        }
        const pipeline = createPostProcessingPipeline({
            renderer,
            scene,
            camera,
            effects: [{ type: 'bloom' }],
        });

        expect(() => {
            pipeline.render(0.016);
        }).not.toThrow();
    });

    test('should dispose pipeline', () => {
        if (!renderer) {
            return;
        }
        const pipeline = createPostProcessingPipeline({
            renderer,
            scene,
            camera,
            effects: [{ type: 'bloom' }],
        });

        expect(() => {
            pipeline.dispose();
        }).not.toThrow();
    });

    test('should handle all effect types', () => {
        if (!renderer) {
            return;
        }
        const effectTypes: PostProcessingEffect['type'][] = [
            'bloom',
            'ssao',
            'colorGrading',
            'motionBlur',
            'depthOfField',
            'chromaticAberration',
            'vignette',
            'filmGrain',
        ];

        effectTypes.forEach((effectType) => {
            const pipeline = createPostProcessingPipeline({
                renderer: renderer!,
                scene,
                camera,
                effects: [{ type: effectType } as PostProcessingEffect],
            });

            expect(pipeline).toBeDefined();
            pipeline.dispose();
        });
    });

    test('should handle custom resolution', () => {
        if (!renderer) {
            return;
        }
        const pipeline = createPostProcessingPipeline({
            renderer,
            scene,
            camera,
            effects: [],
            resolution: { width: 1920, height: 1080 },
        });

        expect(pipeline).toBeDefined();
        pipeline.dispose();
    });
});
