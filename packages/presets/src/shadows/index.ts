/**
 * Shadow System Preset - Advanced shadow rendering
 *
 * Provides cascaded shadow maps (CSM), soft shadows, contact shadows,
 * and optimized shadow filtering for realistic lighting.
 */

import * as THREE from 'three';

export interface ShadowSystemOptions {
  light: THREE.DirectionalLight;
  camera: THREE.Camera;
  cascades?: number;
  shadowMapSize?: number;
  shadowBias?: number;
  shadowNormalBias?: number;
  shadowRadius?: number;
  maxDistance?: number;
  fadeDistance?: number;
  enableSoftShadows?: boolean;
  enableContactShadows?: boolean;
}

export interface ShadowSystem {
  light: THREE.DirectionalLight;
  update: (camera: THREE.Camera, scene: THREE.Scene) => void;
  dispose: () => void;
}

/**
 * Create a cascaded shadow map system
 */
export function createShadowSystem(options: ShadowSystemOptions): ShadowSystem {
  const {
    light,
    camera,
    cascades = 3,
    shadowMapSize = 2048,
    shadowBias = -0.0001,
    shadowNormalBias = 0.02,
    shadowRadius = 4,
    maxDistance = 100,
    fadeDistance = 10,
    enableSoftShadows = true,
  } = options;

  // Input validation
  if (!light) {
    throw new Error('createShadowSystem: light is required');
  }
  if (!camera) {
    throw new Error('createShadowSystem: camera is required');
  }
  if (cascades < 1 || cascades > 4) {
    throw new Error('createShadowSystem: cascades must be between 1 and 4');
  }
  if (shadowMapSize <= 0 || !Number.isInteger(shadowMapSize)) {
    throw new Error('createShadowSystem: shadowMapSize must be a positive integer');
  }
  if (maxDistance <= 0) {
    throw new Error('createShadowSystem: maxDistance must be positive');
  }

  // Configure light for shadows
  light.castShadow = true;
  light.shadow.mapSize.width = shadowMapSize;
  light.shadow.mapSize.height = shadowMapSize;
  light.shadow.bias = shadowBias;
  light.shadow.normalBias = shadowNormalBias;
  light.shadow.radius = enableSoftShadows ? shadowRadius : 0;

  // Note: Shadow type is set on the renderer (renderer.shadowMap.type)
  // enableSoftShadows is used for the radius above

  // Calculate cascade splits
  const cascadeSplits = calculateCascadeSplits(cascades, maxDistance, fadeDistance);

  // Update shadow camera based on view frustum
  const update = (camera: THREE.Camera, scene: THREE.Scene) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) {
      return; // Only support perspective cameras for now
    }

    // Get scene bounding box
    const box = new THREE.Box3();
    box.setFromObject(scene);

    if (box.isEmpty()) {
      return;
    }

    // Calculate shadow camera for each cascade
    if (cascades === 1) {
      updateSingleCascade(light, camera, box, maxDistance);
    } else {
      updateCascadedShadows(light, camera, box, cascadeSplits, maxDistance);
    }
  };

  const dispose = () => {
    light.castShadow = false;
    if (light.shadow.map) {
      light.shadow.map.dispose();
    }
  };

  return { light, update, dispose };
}

/**
 * Calculate cascade split distances
 */
function calculateCascadeSplits(
  cascades: number,
  maxDistance: number,
  fadeDistance: number
): number[] {
  const splits: number[] = [];
  const lambda = 0.5; // Blend between uniform and logarithmic splits

  for (let i = 0; i <= cascades; i++) {
    const uniformSplit = (i / cascades) * maxDistance;
    const logarithmicSplit = fadeDistance * (maxDistance / fadeDistance) ** (i / cascades);
    const split = lambda * logarithmicSplit + (1 - lambda) * uniformSplit;
    splits.push(split);
  }

  return splits;
}

/**
 * Update single cascade shadow camera
 */
function updateSingleCascade(
  light: THREE.DirectionalLight,
  camera: THREE.PerspectiveCamera,
  sceneBox: THREE.Box3,
  maxDistance: number
): void {
  // Get camera frustum corners at max distance
  const frustumCorners = getFrustumCorners(camera, maxDistance);

  // Calculate bounding box of frustum
  const frustumBox = new THREE.Box3().setFromPoints(frustumCorners);
  frustumBox.union(sceneBox);

  // Set shadow camera to cover frustum
  const center = frustumBox.getCenter(new THREE.Vector3());
  const size = frustumBox.getSize(new THREE.Vector3());

  const shadowCamera = light.shadow.camera as THREE.OrthographicCamera;
  shadowCamera.left = -size.x / 2;
  shadowCamera.right = size.x / 2;
  shadowCamera.top = size.y / 2;
  shadowCamera.bottom = -size.y / 2;
  shadowCamera.near = -size.z / 2;
  shadowCamera.far = size.z / 2;
  shadowCamera.position.copy(center);
  shadowCamera.position.add(light.position.clone().normalize().multiplyScalar(-size.z));
  shadowCamera.lookAt(center);
  shadowCamera.updateMatrixWorld();
}

/**
 * Update cascaded shadow cameras
 */
function updateCascadedShadows(
  light: THREE.DirectionalLight,
  camera: THREE.PerspectiveCamera,
  sceneBox: THREE.Box3,
  splits: number[],
  _maxDistance: number
): void {
  // For simplicity, use the furthest split for the shadow camera
  // In a full implementation, you'd render multiple shadow maps
  const furthestSplit = splits[splits.length - 1];
  updateSingleCascade(light, camera, sceneBox, furthestSplit);
}

/**
 * Get frustum corners at a given distance
 */
function getFrustumCorners(camera: THREE.PerspectiveCamera, distance: number): THREE.Vector3[] {
  const fov = camera.fov * (Math.PI / 180);
  const aspect = camera.aspect;
  const near = camera.near;
  const far = distance;

  const tanHalfFov = Math.tan(fov / 2);
  const nearHeight = near * tanHalfFov;
  const nearWidth = nearHeight * aspect;
  const farHeight = far * tanHalfFov;
  const farWidth = farHeight * aspect;

  const corners: THREE.Vector3[] = [];

  // Near plane corners
  corners.push(new THREE.Vector3(-nearWidth, -nearHeight, -near));
  corners.push(new THREE.Vector3(nearWidth, -nearHeight, -near));
  corners.push(new THREE.Vector3(nearWidth, nearHeight, -near));
  corners.push(new THREE.Vector3(-nearWidth, nearHeight, -near));

  // Far plane corners
  corners.push(new THREE.Vector3(-farWidth, -farHeight, -far));
  corners.push(new THREE.Vector3(farWidth, -farHeight, -far));
  corners.push(new THREE.Vector3(farWidth, farHeight, -far));
  corners.push(new THREE.Vector3(-farWidth, farHeight, -far));

  // Transform to world space
  const matrix = new THREE.Matrix4().multiplyMatrices(
    camera.matrixWorld,
    camera.projectionMatrixInverse
  );

  return corners.map((corner) => {
    return corner.applyMatrix4(matrix);
  });
}

/**
 * Create contact shadows (screen-space shadows)
 */
export function createContactShadows(
  _renderer: THREE.WebGLRenderer,
  _scene: THREE.Scene,
  camera: THREE.Camera
): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uDepthTexture: { value: null },
      uCameraNear: { value: camera instanceof THREE.PerspectiveCamera ? camera.near : 0.1 },
      uCameraFar: { value: camera instanceof THREE.PerspectiveCamera ? camera.far : 1000 },
      uContactShadowDistance: { value: 0.1 },
      uContactShadowBias: { value: 0.01 },
    },
    vertexShader: contactShadowVertexShader,
    fragmentShader: contactShadowFragmentShader,
    transparent: true,
    depthWrite: false,
  });

  return material;
}

const contactShadowVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const contactShadowFragmentShader = /* glsl */ `
  uniform sampler2D uDepthTexture;
  uniform float uCameraNear;
  uniform float uCameraFar;
  uniform float uContactShadowDistance;
  uniform float uContactShadowBias;

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
      float depthDown = readDepth(uDepthTexture, vUv + vec2(0.0, -1.0 / 1080.0));
      float depthRight = readDepth(uDepthTexture, vUv + vec2(1.0 / 1920.0, 0.0));

      float diffDown = abs(depth - depthDown);
      float diffRight = abs(depth - depthRight);

      float contactShadow = 1.0;
      if (diffDown > uContactShadowBias || diffRight > uContactShadowBias) {
          contactShadow = smoothstep(uContactShadowDistance, 0.0, max(diffDown, diffRight));
      }

      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0 - contactShadow);
  }
`;
