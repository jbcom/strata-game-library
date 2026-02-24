/**
 * Billboard Presets - Camera-facing sprite systems.
 * @packageDocumentation
 * @module presets/billboards
 */

import * as THREE from 'three';

/**
 * Configuration options for creating a billboard.
 * @category World Building
 */
export interface BillboardOptions {
  /** The texture to display on the billboard. */
  texture: THREE.Texture;
  /** Dimensions of the billboard. */
  size?: number | { width: number; height: number };
  /** Base color multiplier. */
  color?: THREE.Color;
  /** Whether to enable transparency. Default: true. */
  transparent?: boolean;
  /** Opacity level (0-1). Default: 1.0. */
  opacity?: number;
  /** Alpha test threshold. Default: 0.1. */
  alphaTest?: number;
  /** Which side of the plane to render. Default: DoubleSide. */
  side?: THREE.Side;
}

/**
 * Create a billboard mesh that always faces the camera.
 * @category World Building
 */
export function createBillboard(options: BillboardOptions): THREE.Mesh {
  const {
    texture,
    size = 1,
    color = new THREE.Color(1, 1, 1),
    transparent = true,
    opacity = 1.0,
    alphaTest = 0.1,
    side = THREE.DoubleSide,
  } = options;

  // Input validation
  if (!texture) {
    throw new Error('createBillboard: texture is required');
  }

  const width = typeof size === 'number' ? size : size.width;
  const height = typeof size === 'number' ? size : size.height;

  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    color: color,
    transparent: transparent,
    opacity: opacity,
    alphaTest: alphaTest,
    side: side,
    depthWrite: !transparent,
  });

  const mesh = new THREE.Mesh(geometry, material);

  // Add custom onBeforeRender to face camera
  mesh.onBeforeRender = (_renderer, _scene, camera) => {
    if (camera instanceof THREE.PerspectiveCamera || camera instanceof THREE.OrthographicCamera) {
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);

      const cameraPos = camera.position.clone();
      const lookAt = new THREE.Vector3().subVectors(cameraPos, worldPos).normalize();

      // Create rotation to face camera
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(up, lookAt).normalize();
      const _newUp = new THREE.Vector3().crossVectors(lookAt, right).normalize();

      mesh.lookAt(worldPos.clone().add(lookAt));
    }
  };

  return mesh;
}

/**
 * Create instanced billboards for high-performance rendering.
 * @category World Building
 */
export function createBillboardInstances(
  count: number,
  positions: THREE.Vector3[],
  options: BillboardOptions
): THREE.InstancedMesh {
  const {
    texture,
    size = 1,
    color = new THREE.Color(1, 1, 1),
    transparent = true,
    opacity = 1.0,
  } = options;

  if (count <= 0) {
    throw new Error('createBillboardInstances: count must be positive');
  }
  if (!positions || positions.length < count) {
    throw new Error('createBillboardInstances: positions array must have at least count elements');
  }

  const width = typeof size === 'number' ? size : size.width;
  const height = typeof size === 'number' ? size : size.height;

  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    color: color,
    transparent: transparent,
    opacity: opacity,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < count; i++) {
    matrix.setPosition(positions[i]);
    mesh.setMatrixAt(i, matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;

  return mesh;
}

/**
 * Create a sprite sheet animated billboard.
 * @category World Building
 */
export function createAnimatedBillboard(
  texture: THREE.Texture,
  frameCount: { x: number; y: number },
  frameRate: number = 10,
  options: Omit<BillboardOptions, 'texture'> = {}
): THREE.Mesh & { update: (deltaTime: number) => void } {
  const mesh = createBillboard({ ...options, texture }) as THREE.Mesh & {
    update: (deltaTime: number) => void;
  };

  let currentFrame = 0;
  let frameTime = 0;
  const frameWidth = 1 / frameCount.x;
  const frameHeight = 1 / frameCount.y;

  const update = (deltaTime: number) => {
    frameTime += deltaTime;
    if (frameTime >= 1 / frameRate) {
      frameTime = 0;
      currentFrame = (currentFrame + 1) % (frameCount.x * frameCount.y);

      const x = currentFrame % frameCount.x;
      const y = Math.floor(currentFrame / frameCount.x);

      const uvs = mesh.geometry.attributes.uv.array;
      uvs[0] = x * frameWidth;
      uvs[1] = 1 - (y + 1) * frameHeight;
      uvs[2] = (x + 1) * frameWidth;
      uvs[3] = 1 - (y + 1) * frameHeight;
      uvs[4] = (x + 1) * frameWidth;
      uvs[5] = 1 - y * frameHeight;
      uvs[6] = x * frameWidth;
      uvs[7] = 1 - y * frameHeight;

      mesh.geometry.attributes.uv.needsUpdate = true;
    }
  };

  mesh.update = update;
  return mesh;
}
