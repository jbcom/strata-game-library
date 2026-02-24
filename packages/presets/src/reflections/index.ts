/**
 * Reflection Probes Preset - Real-time reflections
 *
 * Provides reflection probes for real-time reflections,
 * environment mapping, and glossy surfaces.
 */

import * as THREE from 'three';

export interface ReflectionProbeOptions {
  position: THREE.Vector3;
  size?: number;
  resolution?: number;
  updateRate?: number; // Updates per second (0 = every frame)
  boxProjection?: boolean;
  boxSize?: THREE.Vector3;
  renderObjects?: (scene: THREE.Scene) => THREE.Object3D[];
}

export interface ReflectionProbe {
  probe: THREE.CubeTexture;
  camera: THREE.CubeCamera;
  update: (renderer: THREE.WebGLRenderer, scene: THREE.Scene) => void;
  dispose: () => void;
}

/**
 * Create a reflection probe
 */
export function createReflectionProbe(options: ReflectionProbeOptions): ReflectionProbe {
  const {
    position,
    size = 10,
    resolution = 256,
    updateRate = 0, // 0 = every frame
    renderObjects,
  } = options;

  // Input validation
  if (!position) {
    throw new Error('createReflectionProbe: position is required');
  }
  if (size <= 0) {
    throw new Error('createReflectionProbe: size must be positive');
  }
  if (resolution <= 0 || !Number.isInteger(resolution)) {
    throw new Error('createReflectionProbe: resolution must be a positive integer');
  }
  if (updateRate < 0) {
    throw new Error('createReflectionProbe: updateRate must be non-negative');
  }

  // Create cube render target
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(resolution, {
    type: THREE.HalfFloatType,
  });

  // Create cube camera for reflections
  const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
  cubeCamera.position.copy(position);

  let lastUpdateTime = 0;
  const updateInterval = updateRate > 0 ? 1 / updateRate : 0;

  const update = (renderer: THREE.WebGLRenderer, scene: THREE.Scene) => {
    const currentTime = performance.now() / 1000;

    if (updateRate === 0 || currentTime - lastUpdateTime >= updateInterval) {
      // Get objects to render (or use all objects)
      const _objectsToRender = renderObjects ? renderObjects(scene) : scene.children;

      // Render cube map
      cubeCamera.update(renderer, scene);

      lastUpdateTime = currentTime;
    }
  };

  const dispose = () => {
    cubeRenderTarget.dispose();
  };

  return {
    probe: cubeRenderTarget.texture,
    camera: cubeCamera,
    update,
    dispose,
  };
}

/**
 * Create environment map from reflection probe
 */
export function createEnvironmentMap(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  position: THREE.Vector3,
  resolution: number = 512
): THREE.CubeTexture {
  if (!renderer) {
    throw new Error('createEnvironmentMap: renderer is required');
  }
  if (!scene) {
    throw new Error('createEnvironmentMap: scene is required');
  }
  if (!position) {
    throw new Error('createEnvironmentMap: position is required');
  }
  if (resolution <= 0 || !Number.isInteger(resolution)) {
    throw new Error('createEnvironmentMap: resolution must be a positive integer');
  }

  const probe = createReflectionProbe({
    position,
    resolution,
    updateRate: 0, // Update once
  });

  probe.update(renderer, scene);

  return probe.probe;
}

/**
 * Apply reflection probe to material
 */
export function applyReflectionProbe(
  material: THREE.Material,
  probe: THREE.CubeTexture,
  intensity: number = 1.0
): void {
  if (!material) {
    throw new Error('applyReflectionProbe: material is required');
  }
  if (!probe) {
    throw new Error('applyReflectionProbe: probe is required');
  }
  if (intensity < 0 || intensity > 1) {
    throw new Error('applyReflectionProbe: intensity must be between 0 and 1');
  }

  if (
    material instanceof THREE.MeshStandardMaterial ||
    material instanceof THREE.MeshPhysicalMaterial
  ) {
    material.envMap = probe;
    material.envMapIntensity = intensity;
    material.needsUpdate = true;
  } else if (material instanceof THREE.ShaderMaterial) {
    if (material.uniforms) {
      material.uniforms.envMap = { value: probe };
      material.uniforms.envMapIntensity = { value: intensity };
    }
  }
}

/**
 * Create box-projected reflection
 */
export function createBoxProjectedReflection(
  material: THREE.Material,
  probe: THREE.CubeTexture,
  boxPosition: THREE.Vector3,
  boxSize: THREE.Vector3
): void {
  if (!material) {
    throw new Error('createBoxProjectedReflection: material is required');
  }
  if (!probe) {
    throw new Error('createBoxProjectedReflection: probe is required');
  }
  if (!boxPosition) {
    throw new Error('createBoxProjectedReflection: boxPosition is required');
  }
  if (!boxSize) {
    throw new Error('createBoxProjectedReflection: boxSize is required');
  }

  // Box projection requires custom shader modification
  // This is a simplified version - full implementation would modify material shader
  if (material instanceof THREE.ShaderMaterial) {
    if (!material.uniforms) {
      material.uniforms = {};
    }
    material.uniforms.envMap = { value: probe };
    material.uniforms.envBoxPosition = { value: boxPosition };
    material.uniforms.envBoxSize = { value: boxSize };

    // Modify fragment shader to include box projection
    // (Full implementation would inject box projection code)
  }
}

/**
 * Reflection probe manager for multiple probes
 */
export class ReflectionProbeManager {
  private probes: Map<string, ReflectionProbe> = new Map();
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    if (!renderer) {
      throw new Error('ReflectionProbeManager: renderer is required');
    }
    if (!scene) {
      throw new Error('ReflectionProbeManager: scene is required');
    }
    this.renderer = renderer;
    this.scene = scene;
  }

  /**
   * Add a reflection probe
   */
  addProbe(name: string, options: ReflectionProbeOptions): ReflectionProbe {
    if (this.probes.has(name)) {
      throw new Error(`ReflectionProbeManager: probe "${name}" already exists`);
    }

    const probe = createReflectionProbe(options);
    this.probes.set(name, probe);
    return probe;
  }

  /**
   * Get a reflection probe
   */
  getProbe(name: string): ReflectionProbe | undefined {
    return this.probes.get(name);
  }

  /**
   * Remove a reflection probe
   */
  removeProbe(name: string): void {
    const probe = this.probes.get(name);
    if (probe) {
      probe.dispose();
      this.probes.delete(name);
    }
  }

  /**
   * Update all probes
   */
  update(): void {
    this.probes.forEach((probe) => {
      probe.update(this.renderer, this.scene);
    });
  }

  /**
   * Dispose all probes
   */
  dispose(): void {
    this.probes.forEach((probe) => {
      probe.dispose();
    });
    this.probes.clear();
  }
}
