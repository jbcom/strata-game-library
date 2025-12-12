/**
 * Post-Processing Preset - Screen-space effects
 *
 * Provides post-processing effects: bloom, SSAO, color grading,
 * motion blur, depth of field, and more.
 */

import * as THREE from 'three';

export interface PostProcessingOptions {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
    effects?: PostProcessingEffect[];
    resolution?: { width: number; height: number };
}

export type PostProcessingEffect =
    | { type: 'bloom'; threshold?: number; intensity?: number; radius?: number }
    | { type: 'ssao'; radius?: number; intensity?: number; bias?: number }
    | { type: 'colorGrading'; lut?: THREE.Texture; intensity?: number }
    | { type: 'motionBlur'; samples?: number; intensity?: number }
    | { type: 'depthOfField'; focus?: number; aperture?: number; maxBlur?: number }
    | { type: 'chromaticAberration'; offset?: number }
    | { type: 'vignette'; offset?: number; darkness?: number }
    | { type: 'filmGrain'; intensity?: number };

export interface PostProcessingPipeline {
    render: (deltaTime: number) => void;
    dispose: () => void;
}

/**
 * Create post-processing pipeline
 */
export function createPostProcessingPipeline(
    options: PostProcessingOptions
): PostProcessingPipeline {
    // Input validation first (before accessing browser-specific APIs)
    if (!options.renderer) {
        throw new Error('createPostProcessingPipeline: renderer is required');
    }
    if (!options.scene) {
        throw new Error('createPostProcessingPipeline: scene is required');
    }
    if (!options.camera) {
        throw new Error('createPostProcessingPipeline: camera is required');
    }

    const {
        renderer,
        scene,
        camera,
        effects = [],
        resolution = {
            width: typeof window !== 'undefined' ? window.innerWidth : 1920,
            height: typeof window !== 'undefined' ? window.innerHeight : 1080,
        },
    } = options;

    // Create render targets
    const rtA = new THREE.WebGLRenderTarget(resolution.width, resolution.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
    });

    const rtB = rtA.clone();

    // Create fullscreen quad
    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    const quadScene = new THREE.Scene();
    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Build effect chain
    const effectMaterials: THREE.ShaderMaterial[] = [];
    let currentRT = rtA;
    let nextRT = rtB;

    // Initial render to first RT
    renderer.setRenderTarget(currentRT);
    renderer.render(scene, camera);

    // Apply effects
    effects.forEach((effect, _index) => {
        const material = createEffectMaterial(effect, renderer, scene, camera);
        effectMaterials.push(material);

        const quad = new THREE.Mesh(quadGeometry, material);
        quadScene.add(quad);

        // Render effect
        renderer.setRenderTarget(nextRT);
        renderer.render(quadScene, quadCamera);

        // Swap render targets
        [currentRT, nextRT] = [nextRT, currentRT];
        quadScene.remove(quad);
    });

    // Final render to screen
    const finalMaterial = new THREE.MeshBasicMaterial({
        map: currentRT.texture,
    });
    const finalQuad = new THREE.Mesh(quadGeometry, finalMaterial);
    quadScene.add(finalQuad);

    let previousTime = 0;

    const render = (deltaTime: number) => {
        // Update effect uniforms
        effectMaterials.forEach((material, index) => {
            const effect = effects[index];
            updateEffectUniforms(material, effect, deltaTime, previousTime);
        });

        previousTime = deltaTime;

        // Re-render scene if needed
        renderer.setRenderTarget(rtA);
        renderer.render(scene, camera);

        // Apply effects
        let current = rtA;
        let next = rtB;

        effects.forEach((_effect, index) => {
            const material = effectMaterials[index];
            const quad = new THREE.Mesh(quadGeometry, material);
            quadScene.add(quad);

            renderer.setRenderTarget(next);
            renderer.render(quadScene, quadCamera);

            quadScene.remove(quad);
            [current, next] = [next, current];
        });

        // Render to screen
        renderer.setRenderTarget(null);
        finalMaterial.map = current.texture;
        renderer.render(quadScene, quadCamera);
    };

    const dispose = () => {
        rtA.dispose();
        rtB.dispose();
        effectMaterials.forEach((m) => m.dispose());
        quadGeometry.dispose();
        finalMaterial.dispose();
    };

    return { render, dispose };
}

/**
 * Create effect material
 */
function createEffectMaterial(
    effect: PostProcessingEffect,
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
): THREE.ShaderMaterial {
    switch (effect.type) {
        case 'bloom':
            return createBloomMaterial(effect);
        case 'ssao':
            return createSSAOMaterial(effect, renderer, scene, camera);
        case 'colorGrading':
            return createColorGradingMaterial(effect);
        case 'motionBlur':
            return createMotionBlurMaterial(effect);
        case 'depthOfField':
            return createDepthOfFieldMaterial(effect, camera);
        case 'chromaticAberration':
            return createChromaticAberrationMaterial(effect);
        case 'vignette':
            return createVignetteMaterial(effect);
        case 'filmGrain':
            return createFilmGrainMaterial(effect);
        default:
            throw new Error(`Unknown effect type: ${(effect as any).type}`);
    }
}

/**
 * Update effect uniforms
 */
function updateEffectUniforms(
    material: THREE.ShaderMaterial,
    _effect: PostProcessingEffect,
    deltaTime: number,
    _previousTime: number
): void {
    if (material.uniforms) {
        if (material.uniforms.uTime) {
            material.uniforms.uTime.value += deltaTime;
        }
        if (material.uniforms.uDeltaTime) {
            material.uniforms.uDeltaTime.value = deltaTime;
        }
    }
}

/**
 * Bloom effect
 */
function createBloomMaterial(effect: {
    threshold?: number;
    intensity?: number;
    radius?: number;
}): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: null },
            uThreshold: { value: effect.threshold ?? 0.8 },
            uIntensity: { value: effect.intensity ?? 1.0 },
            uRadius: { value: effect.radius ?? 0.5 },
        },
        vertexShader: bloomVertexShader,
        fragmentShader: bloomFragmentShader,
    });
}

const bloomVertexShader = /* glsl */ `
  varying vec2 vUv;
  
  void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const bloomFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uThreshold;
  uniform float uIntensity;
  uniform float uRadius;
  
  varying vec2 vUv;
  
  void main() {
      vec4 color = texture2D(uTexture, vUv);
      float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
      
      if (brightness > uThreshold) {
          vec4 bloom = color * (brightness - uThreshold) * uIntensity;
          // Simple blur approximation
          vec4 blur = vec4(0.0);
          for (int i = -2; i <= 2; i++) {
              for (int j = -2; j <= 2; j++) {
                  blur += texture2D(uTexture, vUv + vec2(float(i), float(j)) * uRadius * 0.01);
              }
          }
          blur /= 25.0;
          color += blur * uIntensity;
      }
      
      gl_FragColor = color;
  }
`;

/**
 * SSAO effect
 */
function createSSAOMaterial(
    effect: { radius?: number; intensity?: number; bias?: number },
    _renderer: THREE.WebGLRenderer,
    _scene: THREE.Scene,
    _camera: THREE.Camera
): THREE.ShaderMaterial {
    // In a full implementation, you'd need depth and normal textures
    return new THREE.ShaderMaterial({
        uniforms: {
            uDepthTexture: { value: null },
            uNormalTexture: { value: null },
            uRadius: { value: effect.radius ?? 0.5 },
            uIntensity: { value: effect.intensity ?? 1.0 },
            uBias: { value: effect.bias ?? 0.025 },
        },
        vertexShader: ssaoVertexShader,
        fragmentShader: ssaoFragmentShader,
    });
}

const ssaoVertexShader = /* glsl */ `
  varying vec2 vUv;
  
  void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ssaoFragmentShader = /* glsl */ `
  uniform sampler2D uDepthTexture;
  uniform sampler2D uNormalTexture;
  uniform float uRadius;
  uniform float uIntensity;
  uniform float uBias;
  
  varying vec2 vUv;
  
  void main() {
      float depth = texture2D(uDepthTexture, vUv).r;
      vec3 normal = texture2D(uNormalTexture, vUv).rgb * 2.0 - 1.0;
      
      // Simplified SSAO
      float occlusion = 0.0;
      for (int i = 0; i < 8; i++) {
          float angle = float(i) * 3.14159 * 2.0 / 8.0;
          vec2 offset = vec2(cos(angle), sin(angle)) * uRadius * 0.01;
          float sampleDepth = texture2D(uDepthTexture, vUv + offset).r;
          
          if (sampleDepth < depth - uBias) {
              occlusion += 1.0;
          }
      }
      
      occlusion = 1.0 - (occlusion / 8.0) * uIntensity;
      gl_FragColor = vec4(vec3(occlusion), 1.0);
  }
`;

/**
 * Color grading effect
 */
function createColorGradingMaterial(effect: {
    lut?: THREE.Texture;
    intensity?: number;
}): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: null },
            uLUT: { value: effect.lut || null },
            uIntensity: { value: effect.intensity ?? 1.0 },
        },
        vertexShader: colorGradingVertexShader,
        fragmentShader: colorGradingFragmentShader,
    });
}

const colorGradingVertexShader = /* glsl */ `
  varying vec2 vUv;
  
  void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const colorGradingFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform sampler2D uLUT;
  uniform float uIntensity;
  
  varying vec2 vUv;
  
  void main() {
      vec4 color = texture2D(uTexture, vUv);
      
      if (uLUT != null) {
          // LUT color grading
          float blue = color.b * 63.0;
          vec2 quad1 = vec2(floor(blue) / 64.0, fract(blue));
          vec2 quad2 = vec2((floor(blue) + 1.0) / 64.0, fract(blue));
          
          vec3 lutColor1 = texture2D(uLUT, quad1 + color.rg / 64.0).rgb;
          vec3 lutColor2 = texture2D(uLUT, quad2 + color.rg / 64.0).rgb;
          
          vec3 lutColor = mix(lutColor1, lutColor2, fract(blue));
          color.rgb = mix(color.rgb, lutColor, uIntensity);
      }
      
      gl_FragColor = color;
  }
`;

/**
 * Motion blur effect
 */
function createMotionBlurMaterial(effect: {
    samples?: number;
    intensity?: number;
}): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: null },
            uPreviousTexture: { value: null },
            uSamples: { value: effect.samples ?? 8 },
            uIntensity: { value: effect.intensity ?? 0.5 },
        },
        vertexShader: motionBlurVertexShader,
        fragmentShader: motionBlurFragmentShader,
    });
}

const motionBlurVertexShader = /* glsl */ `
  varying vec2 vUv;
  
  void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const motionBlurFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform sampler2D uPreviousTexture;
  uniform float uSamples;
  uniform float uIntensity;
  
  varying vec2 vUv;
  
  void main() {
      vec4 current = texture2D(uTexture, vUv);
      vec4 previous = texture2D(uPreviousTexture, vUv);
      vec4 blurred = mix(current, previous, uIntensity);
      gl_FragColor = blurred;
  }
`;

/**
 * Depth of field effect
 */
function createDepthOfFieldMaterial(
    effect: { focus?: number; aperture?: number; maxBlur?: number },
    camera: THREE.Camera
): THREE.ShaderMaterial {
    const focus = effect.focus ?? 10.0;
    const aperture = effect.aperture ?? 0.025;
    const maxBlur = effect.maxBlur ?? 0.1;

    return new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: null },
            uDepthTexture: { value: null },
            uFocus: { value: focus },
            uAperture: { value: aperture },
            uMaxBlur: { value: maxBlur },
            uCameraNear: { value: camera instanceof THREE.PerspectiveCamera ? camera.near : 0.1 },
            uCameraFar: { value: camera instanceof THREE.PerspectiveCamera ? camera.far : 1000 },
        },
        vertexShader: dofVertexShader,
        fragmentShader: dofFragmentShader,
    });
}

const dofVertexShader = /* glsl */ `
  varying vec2 vUv;
  
  void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const dofFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform sampler2D uDepthTexture;
  uniform float uFocus;
  uniform float uAperture;
  uniform float uMaxBlur;
  uniform float uCameraNear;
  uniform float uCameraFar;
  
  varying vec2 vUv;
  
  float readDepth(sampler2D depthSampler, vec2 coord) {
      float fragCoordZ = texture2D(depthSampler, coord).x;
      // Convert from NDC depth [0,1] to linear depth
      // For perspective projection: linearDepth = (near * far) / (far - depth * (far - near))
      float linearDepth = (uCameraNear * uCameraFar) / (uCameraFar - fragCoordZ * (uCameraFar - uCameraNear));
      return linearDepth;
  }
  
  void main() {
      float depth = readDepth(uDepthTexture, vUv);
      float focusDistance = uFocus / uCameraFar;
      float blurAmount = abs(depth - focusDistance) * uAperture;
      blurAmount = min(blurAmount, uMaxBlur);
      
      vec4 color = vec4(0.0);
      float total = 0.0;
      
      for (int i = -3; i <= 3; i++) {
          for (int j = -3; j <= 3; j++) {
              vec2 offset = vec2(float(i), float(j)) * blurAmount * 0.01;
              color += texture2D(uTexture, vUv + offset);
              total += 1.0;
          }
      }
      
      color /= total;
      gl_FragColor = color;
  }
`;

/**
 * Chromatic aberration effect
 */
function createChromaticAberrationMaterial(effect: { offset?: number }): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: null },
            uOffset: { value: effect.offset ?? 0.002 },
        },
        vertexShader: chromaticAberrationVertexShader,
        fragmentShader: chromaticAberrationFragmentShader,
    });
}

const chromaticAberrationVertexShader = /* glsl */ `
  varying vec2 vUv;
  
  void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const chromaticAberrationFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uOffset;
  
  varying vec2 vUv;
  
  void main() {
      vec2 center = vUv - 0.5;
      float dist = length(center);
      vec2 offset = center * uOffset * dist;
      
      float r = texture2D(uTexture, vUv + offset).r;
      float g = texture2D(uTexture, vUv).g;
      float b = texture2D(uTexture, vUv - offset).b;
      
      gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

/**
 * Vignette effect
 */
function createVignetteMaterial(effect: {
    offset?: number;
    darkness?: number;
}): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: null },
            uOffset: { value: effect.offset ?? 0.5 },
            uDarkness: { value: effect.darkness ?? 0.5 },
        },
        vertexShader: vignetteVertexShader,
        fragmentShader: vignetteFragmentShader,
    });
}

const vignetteVertexShader = /* glsl */ `
  varying vec2 vUv;
  
  void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const vignetteFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uOffset;
  uniform float uDarkness;
  
  varying vec2 vUv;
  
  void main() {
      vec4 color = texture2D(uTexture, vUv);
      vec2 center = vUv - 0.5;
      float dist = length(center);
      float vignette = smoothstep(uOffset, uOffset - 0.3, dist);
      color.rgb *= mix(1.0, uDarkness, vignette);
      gl_FragColor = color;
  }
`;

/**
 * Film grain effect
 */
function createFilmGrainMaterial(effect: { intensity?: number }): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: null },
            uIntensity: { value: effect.intensity ?? 0.1 },
            uTime: { value: 0 },
        },
        vertexShader: filmGrainVertexShader,
        fragmentShader: filmGrainFragmentShader,
    });
}

const filmGrainVertexShader = /* glsl */ `
  varying vec2 vUv;
  
  void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const filmGrainFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uIntensity;
  uniform float uTime;
  
  varying vec2 vUv;
  
  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  void main() {
      vec4 color = texture2D(uTexture, vUv);
      float grain = random(vUv + uTime) * uIntensity;
      color.rgb += grain - uIntensity * 0.5;
      gl_FragColor = color;
  }
`;

/**
 * Re-export types from core postProcessing module
 */
export type {
    BloomSettings,
    BrightnessContrastSettings,
    ChromaticAberrationSettings,
    ColorGradingSettings,
    DOFSettings,
    FilmGrainSettings,
    LUTConfig,
    NoiseSettings,
    PostProcessingMood,
    PostProcessingPreset,
    SepiaSettings,
    SSAOSettings,
    ToneMappingSettings,
    VignetteSettings,
} from '../../core/postProcessing';

export {
    apertureToBokehScale,
    blendPostProcessingPresets,
    calculateFocusDistance,
    calculateFocusDistanceToMesh,
    defaultEffectSettings,
    dofScenarios,
    focalLengthToFOV,
    fovToFocalLength,
    getTimeOfDayEffects,
    lutConfigs,
} from '../../core/postProcessing';

import type { PostProcessingPreset } from '../../core/postProcessing';

/**
 * Cinematic post-processing preset
 * Film-like appearance with subtle bloom, vignette, and color grading
 */
export const cinematicPreset: PostProcessingPreset = {
    name: 'Cinematic',
    description: 'Film-like appearance with subtle bloom and vignette',
    mood: 'cinematic',
    bloom: {
        intensity: 1,
        luminanceThreshold: 0.85,
        luminanceSmoothing: 0.05,
        mipmapBlur: true,
    },
    vignette: {
        darkness: 0.4,
        offset: 0.4,
    },
    chromaticAberration: {
        offset: { x: 0.003, y: 0.003 },
        radialModulation: true,
        modulationOffset: 0.2,
    },
    filmGrain: {
        intensity: 0.05,
    },
    toneMapping: {
        mode: 1,
        exposure: 1,
    },
};

/**
 * Dreamy post-processing preset
 * Soft, ethereal look with high bloom and reduced saturation
 */
export const dreamyPreset: PostProcessingPreset = {
    name: 'Dreamy',
    description: 'Soft, ethereal appearance with diffuse bloom',
    mood: 'dreamy',
    bloom: {
        intensity: 2,
        luminanceThreshold: 0.7,
        luminanceSmoothing: 0.1,
        mipmapBlur: true,
    },
    vignette: {
        darkness: 0.3,
        offset: 0.6,
    },
    colorGrading: {
        hue: 0,
        saturation: -0.2,
        brightness: 0.1,
    },
    brightnessContrast: {
        brightness: 0.1,
        contrast: -0.1,
    },
};

/**
 * Horror post-processing preset
 * Desaturated, dark, and noisy for unsettling atmosphere
 */
export const horrorPreset: PostProcessingPreset = {
    name: 'Horror',
    description: 'Dark, desaturated, unsettling atmosphere',
    mood: 'horror',
    vignette: {
        darkness: 0.7,
        offset: 0.3,
    },
    colorGrading: {
        hue: 0,
        saturation: -0.5,
        brightness: -0.15,
    },
    brightnessContrast: {
        brightness: -0.15,
        contrast: 0.2,
    },
    filmGrain: {
        intensity: 0.2,
    },
    chromaticAberration: {
        offset: { x: 0.005, y: 0.005 },
        radialModulation: true,
        modulationOffset: 0.3,
    },
    noise: {
        premultiply: false,
    },
};

/**
 * Neon post-processing preset
 * High bloom, saturated colors for cyberpunk aesthetics
 */
export const neonPreset: PostProcessingPreset = {
    name: 'Neon',
    description: 'High bloom, saturated colors for cyberpunk look',
    mood: 'neon',
    bloom: {
        intensity: 3,
        luminanceThreshold: 0.6,
        luminanceSmoothing: 0.05,
        mipmapBlur: true,
    },
    colorGrading: {
        hue: 0,
        saturation: 0.3,
        brightness: 0,
    },
    brightnessContrast: {
        brightness: 0,
        contrast: 0.15,
    },
    toneMapping: {
        mode: 2,
        exposure: 1,
    },
};

/**
 * Realistic post-processing preset
 * Subtle enhancements for physically-based rendering
 */
export const realisticPreset: PostProcessingPreset = {
    name: 'Realistic',
    description: 'Subtle, physically-based rendering enhancements',
    mood: 'realistic',
    bloom: {
        intensity: 0.5,
        luminanceThreshold: 0.95,
        luminanceSmoothing: 0.01,
        mipmapBlur: true,
    },
    ssao: {
        samples: 16,
        radius: 0.05,
        intensity: 1,
        luminanceInfluence: 0.5,
    },
    toneMapping: {
        mode: 1,
        exposure: 1,
    },
};

/**
 * Vintage post-processing preset
 * Old film/photograph look with sepia tones
 */
export const vintagePreset: PostProcessingPreset = {
    name: 'Vintage',
    description: 'Old film look with sepia tones and vignette',
    mood: 'vintage',
    sepia: {
        intensity: 0.4,
    },
    vignette: {
        darkness: 0.5,
        offset: 0.4,
    },
    colorGrading: {
        hue: 0.05,
        saturation: -0.3,
        brightness: -0.05,
    },
    filmGrain: {
        intensity: 0.15,
    },
    brightnessContrast: {
        brightness: -0.05,
        contrast: 0.1,
    },
};

/**
 * Noir post-processing preset
 * Black and white film noir style
 */
export const noirPreset: PostProcessingPreset = {
    name: 'Noir',
    description: 'Classic black and white film noir style',
    mood: 'noir',
    colorGrading: {
        hue: 0,
        saturation: -1,
        brightness: 0,
    },
    vignette: {
        darkness: 0.6,
        offset: 0.35,
    },
    brightnessContrast: {
        brightness: -0.1,
        contrast: 0.3,
    },
    filmGrain: {
        intensity: 0.12,
    },
};

/**
 * Sci-Fi post-processing preset
 * Futuristic look with cool tones and tech feel
 */
export const sciFiPreset: PostProcessingPreset = {
    name: 'Sci-Fi',
    description: 'Futuristic look with cool tones',
    mood: 'sci-fi',
    bloom: {
        intensity: 1.5,
        luminanceThreshold: 0.75,
        luminanceSmoothing: 0.04,
        mipmapBlur: true,
    },
    colorGrading: {
        hue: -0.1,
        saturation: 0.1,
        brightness: 0,
    },
    chromaticAberration: {
        offset: { x: 0.002, y: 0.002 },
        radialModulation: true,
        modulationOffset: 0.15,
    },
    vignette: {
        darkness: 0.3,
        offset: 0.5,
    },
    toneMapping: {
        mode: 1,
        exposure: 1.1,
    },
};

/**
 * All post-processing presets
 */
export const postProcessingPresets = {
    cinematic: cinematicPreset,
    dreamy: dreamyPreset,
    horror: horrorPreset,
    neon: neonPreset,
    realistic: realisticPreset,
    vintage: vintagePreset,
    noir: noirPreset,
    sciFi: sciFiPreset,
};

/**
 * Bloom presets for different use cases
 */
export const bloomPresets = {
    subtle: {
        intensity: 0.5,
        luminanceThreshold: 0.9,
        luminanceSmoothing: 0.025,
        mipmapBlur: true,
    },
    intense: {
        intensity: 2,
        luminanceThreshold: 0.7,
        luminanceSmoothing: 0.08,
        mipmapBlur: true,
    },
    neon: {
        intensity: 3,
        luminanceThreshold: 0.5,
        luminanceSmoothing: 0.05,
        mipmapBlur: true,
    },
    film: {
        intensity: 1,
        luminanceThreshold: 0.85,
        luminanceSmoothing: 0.05,
        mipmapBlur: true,
    },
    glow: {
        intensity: 1.5,
        luminanceThreshold: 0.8,
        luminanceSmoothing: 0.1,
        mipmapBlur: true,
    },
};

/**
 * Depth of field presets for different photography styles
 */
export const dofPresets = {
    portrait: {
        focusDistance: 2,
        focalLength: 85,
        bokehScale: 5,
    },
    landscape: {
        focusDistance: 50,
        focalLength: 24,
        bokehScale: 0.7,
    },
    macro: {
        focusDistance: 0.3,
        focalLength: 100,
        bokehScale: 8,
    },
    street: {
        focusDistance: 5,
        focalLength: 35,
        bokehScale: 2,
    },
    cinematic: {
        focusDistance: 4,
        focalLength: 50,
        bokehScale: 3,
    },
    product: {
        focusDistance: 1,
        focalLength: 90,
        bokehScale: 4,
    },
};

/**
 * Vignette presets for different moods
 */
export const vignettePresets = {
    light: {
        darkness: 0.3,
        offset: 0.6,
    },
    medium: {
        darkness: 0.5,
        offset: 0.5,
    },
    heavy: {
        darkness: 0.7,
        offset: 0.35,
    },
    vintage: {
        darkness: 0.5,
        offset: 0.4,
    },
    horror: {
        darkness: 0.8,
        offset: 0.25,
    },
    subtle: {
        darkness: 0.2,
        offset: 0.7,
    },
};

/**
 * Get a preset by name
 * @param name Preset name
 * @returns The preset configuration
 */
export function getPostProcessingPreset(
    name: keyof typeof postProcessingPresets
): PostProcessingPreset {
    return postProcessingPresets[name];
}

/**
 * Preset type for type safety
 */
export type PostProcessingPresetName = keyof typeof postProcessingPresets;
export type BloomPresetName = keyof typeof bloomPresets;
export type DOFPresetName = keyof typeof dofPresets;
export type VignettePresetName = keyof typeof vignettePresets;
