import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import {
    createPostProcessingPipeline,
    type PostProcessingOptions,
    type PostProcessingEffect,
    cinematicPreset,
    dreamyPreset,
    horrorPreset,
    neonPreset,
    realisticPreset,
    vintagePreset,
    noirPreset,
    sciFiPreset,
    postProcessingPresets,
    bloomPresets,
    dofPresets,
    vignettePresets,
    getPostProcessingPreset,
} from '../../../src/presets/postprocessing';
import {
    focalLengthToFOV,
    fovToFocalLength,
    apertureToBokehScale,
    dofScenarios,
    defaultEffectSettings,
    blendPostProcessingPresets,
    getTimeOfDayEffects,
} from '../../../src/core/postProcessing';

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

describe('Post-Processing Presets', () => {
    test('cinematicPreset should have correct structure', () => {
        expect(cinematicPreset).toBeDefined();
        expect(cinematicPreset.name).toBe('Cinematic');
        expect(cinematicPreset.mood).toBe('cinematic');
        expect(cinematicPreset.bloom).toBeDefined();
        expect(cinematicPreset.vignette).toBeDefined();
        expect(cinematicPreset.chromaticAberration).toBeDefined();
    });

    test('dreamyPreset should have correct structure', () => {
        expect(dreamyPreset).toBeDefined();
        expect(dreamyPreset.name).toBe('Dreamy');
        expect(dreamyPreset.mood).toBe('dreamy');
        expect(dreamyPreset.bloom?.intensity).toBeGreaterThan(cinematicPreset.bloom?.intensity ?? 0);
    });

    test('horrorPreset should have desaturated look', () => {
        expect(horrorPreset).toBeDefined();
        expect(horrorPreset.name).toBe('Horror');
        expect(horrorPreset.mood).toBe('horror');
        expect(horrorPreset.colorGrading?.saturation).toBeLessThan(0);
        expect(horrorPreset.vignette?.darkness).toBeGreaterThan(0.5);
    });

    test('neonPreset should have high bloom', () => {
        expect(neonPreset).toBeDefined();
        expect(neonPreset.name).toBe('Neon');
        expect(neonPreset.mood).toBe('neon');
        expect(neonPreset.bloom?.intensity).toBeGreaterThanOrEqual(3);
        expect(neonPreset.colorGrading?.saturation).toBeGreaterThan(0);
    });

    test('realisticPreset should have subtle effects', () => {
        expect(realisticPreset).toBeDefined();
        expect(realisticPreset.name).toBe('Realistic');
        expect(realisticPreset.mood).toBe('realistic');
        expect(realisticPreset.bloom?.intensity).toBeLessThan(1);
        expect(realisticPreset.ssao).toBeDefined();
    });

    test('vintagePreset should have sepia', () => {
        expect(vintagePreset).toBeDefined();
        expect(vintagePreset.name).toBe('Vintage');
        expect(vintagePreset.mood).toBe('vintage');
        expect(vintagePreset.sepia).toBeDefined();
    });

    test('noirPreset should be black and white', () => {
        expect(noirPreset).toBeDefined();
        expect(noirPreset.name).toBe('Noir');
        expect(noirPreset.colorGrading?.saturation).toBe(-1);
    });

    test('sciFiPreset should have futuristic look', () => {
        expect(sciFiPreset).toBeDefined();
        expect(sciFiPreset.name).toBe('Sci-Fi');
        expect(sciFiPreset.chromaticAberration).toBeDefined();
    });

    test('postProcessingPresets contains all presets', () => {
        expect(postProcessingPresets.cinematic).toBe(cinematicPreset);
        expect(postProcessingPresets.dreamy).toBe(dreamyPreset);
        expect(postProcessingPresets.horror).toBe(horrorPreset);
        expect(postProcessingPresets.neon).toBe(neonPreset);
        expect(postProcessingPresets.realistic).toBe(realisticPreset);
        expect(postProcessingPresets.vintage).toBe(vintagePreset);
        expect(postProcessingPresets.noir).toBe(noirPreset);
        expect(postProcessingPresets.sciFi).toBe(sciFiPreset);
    });

    test('getPostProcessingPreset returns correct preset', () => {
        expect(getPostProcessingPreset('cinematic')).toBe(cinematicPreset);
        expect(getPostProcessingPreset('horror')).toBe(horrorPreset);
    });
});

describe('Bloom Presets', () => {
    test('should have subtle preset', () => {
        expect(bloomPresets.subtle).toBeDefined();
        expect(bloomPresets.subtle.intensity).toBeLessThan(1);
    });

    test('should have intense preset', () => {
        expect(bloomPresets.intense).toBeDefined();
        expect(bloomPresets.intense.intensity).toBeGreaterThan(1);
    });

    test('should have neon preset', () => {
        expect(bloomPresets.neon).toBeDefined();
        expect(bloomPresets.neon.intensity).toBeGreaterThanOrEqual(3);
    });
});

describe('DOF Presets', () => {
    test('should have portrait preset with shallow DOF', () => {
        expect(dofPresets.portrait).toBeDefined();
        expect(dofPresets.portrait.bokehScale).toBeGreaterThan(3);
    });

    test('should have landscape preset with wide DOF', () => {
        expect(dofPresets.landscape).toBeDefined();
        expect(dofPresets.landscape.bokehScale).toBeLessThan(1);
    });

    test('should have macro preset', () => {
        expect(dofPresets.macro).toBeDefined();
        expect(dofPresets.macro.focusDistance).toBeLessThan(1);
    });
});

describe('Vignette Presets', () => {
    test('should have light preset', () => {
        expect(vignettePresets.light).toBeDefined();
        expect(vignettePresets.light.darkness).toBeLessThan(0.5);
    });

    test('should have heavy preset', () => {
        expect(vignettePresets.heavy).toBeDefined();
        expect(vignettePresets.heavy.darkness).toBeGreaterThan(0.5);
    });
});

describe('Post-Processing Utilities', () => {
    test('focalLengthToFOV converts correctly', () => {
        const fov = focalLengthToFOV(50, 36);
        expect(fov).toBeGreaterThan(0);
        expect(fov).toBeLessThan(Math.PI);
    });

    test('fovToFocalLength converts correctly', () => {
        const focal = fovToFocalLength(45, 36);
        expect(focal).toBeGreaterThan(0);
    });

    test('apertureToBokehScale converts correctly', () => {
        const bokeh = apertureToBokehScale(1.4);
        expect(bokeh).toBeGreaterThan(apertureToBokehScale(16));
    });

    test('dofScenarios contains expected scenarios', () => {
        expect(dofScenarios.portrait).toBeDefined();
        expect(dofScenarios.landscape).toBeDefined();
        expect(dofScenarios.macro).toBeDefined();
    });

    test('defaultEffectSettings has all effects', () => {
        expect(defaultEffectSettings.bloom).toBeDefined();
        expect(defaultEffectSettings.vignette).toBeDefined();
        expect(defaultEffectSettings.chromaticAberration).toBeDefined();
    });

    test('blendPostProcessingPresets blends two presets', () => {
        const blended = blendPostProcessingPresets(cinematicPreset, dreamyPreset, 0.5);
        expect(blended).toBeDefined();
        expect(blended.name).toContain('Cinematic');
        expect(blended.name).toContain('Dreamy');
    });

    test('getTimeOfDayEffects returns appropriate effects', () => {
        const morning = getTimeOfDayEffects(7);
        expect(morning.bloomIntensity).toBeDefined();
        expect(morning.vignetteOffset).toBeDefined();

        const night = getTimeOfDayEffects(23);
        expect(night.bloomIntensity).toBeLessThan(1);
    });
});
