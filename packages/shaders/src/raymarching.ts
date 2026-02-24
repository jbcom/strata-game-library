import * as THREE from 'three';
import type { IUniforms } from './types.js';

/**
 * Ray marching shader - GPU-based SDF rendering
 *
 * Based on marching.js patterns for efficient ray marching
 */

export const raymarchingVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vRayOrigin;
  varying vec3 vRayDirection;

  void main() {
    vUv = uv;

    // Fullscreen quad
    gl_Position = vec4(position, 1.0);

    // Ray origin is camera position (passed as uniform)
    // Ray direction calculated in fragment shader
  }
`;

export const raymarchingFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uCameraPosition;
  uniform mat4 uCameraMatrix;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uMaxSteps;
  uniform float uMaxDistance;
  uniform float uMinDistance;
  uniform vec3 uBackgroundColor;
  uniform float uFogStrength;
  uniform vec3 uFogColor;

  varying vec2 vUv;

  // SDF scene function - will be injected
  float sceneSDF(vec3 p);

  // Tetrahedron-based normal calculation (from marching.js)
  vec3 calcNormal(vec3 pos, float eps) {
    const vec3 v1 = vec3( 1.0,-1.0,-1.0);
    const vec3 v2 = vec3(-1.0,-1.0, 1.0);
    const vec3 v3 = vec3(-1.0, 1.0,-1.0);
    const vec3 v4 = vec3( 1.0, 1.0, 1.0);

    return normalize( v1 * sceneSDF( pos + v1*eps ) +
                      v2 * sceneSDF( pos + v2*eps ) +
                      v3 * sceneSDF( pos + v3*eps ) +
                      v4 * sceneSDF( pos + v4*eps ) );
  }

  vec3 calcNormal(vec3 pos) {
    return calcNormal(pos, 0.002);
  }

  // Ray marching intersection (from marching.js)
  vec2 calcRayIntersection( vec3 rayOrigin, vec3 rayDir, float maxd, float precis ) {
    float latest = precis * 2.0;
    float dist   = 0.0;
    vec2 result;
    vec2 res = vec2(-50000.0, -1.0);

    for (int i = 0; i < 256; i++) {
      if (float(i) >= uMaxSteps) break;
      if (latest < precis || dist > maxd) break;

      float sdf = sceneSDF(rayOrigin + rayDir * dist);
      latest = sdf;
      dist  += latest;
    }

    if( dist < maxd ) {
      result.x = dist;
      result.y = 1.0; // Material ID placeholder
      res = result;
    }

    return res;
  }

  void main() {
    vec2 uv = vUv;
    vec2 pos = uv * 2.0 - 1.0;

    // Aspect ratio correction
    pos.x *= (uResolution.x / uResolution.y);

    vec3 ro = uCameraPosition;
    vec3 rd = normalize( mat3(uCameraMatrix) * vec3( pos, 2.0 ) );

    vec2 t = calcRayIntersection( ro, rd, uMaxDistance, uMinDistance );

    vec4 color = vec4(uBackgroundColor, 1.0);

    if( t.x > -0.5 ) {
      vec3 samplePos = ro + rd * t.x;
      vec3 nor = calcNormal( samplePos );

      // Simple lighting
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diff = max(dot(nor, lightDir), 0.0);
      vec3 albedo = vec3(0.8, 0.8, 0.9);

      color = vec4(albedo * (0.3 + 0.7 * diff), 1.0);

      // Fog
      if (uFogStrength > 0.0) {
        float fogFactor = exp(-uFogStrength * t.x);
        color.rgb = mix(uFogColor, color.rgb, fogFactor);
      }
    }

    gl_FragColor = clamp(color, 0.0, 1.0);
  }
`;

export interface RaymarchingUniforms extends IUniforms {
  uCameraPosition: { value: THREE.Vector3 };
  uCameraMatrix: { value: THREE.Matrix4 };
  uResolution: { value: THREE.Vector2 };
  uTime: { value: number };
  uMaxSteps: { value: number };
  uMaxDistance: { value: number };
  uMinDistance: { value: number };
  uBackgroundColor: { value: THREE.Color };
  uFogStrength: { value: number };
  uFogColor: { value: THREE.Color };
}

export function createRaymarchingUniforms(
  camera: THREE.Camera,
  resolution: THREE.Vector2
): RaymarchingUniforms {
  return {
    uCameraPosition: { value: camera.position },
    uCameraMatrix: { value: camera.matrixWorld },
    uResolution: { value: resolution },
    uTime: { value: 0 },
    uMaxSteps: { value: 64 },
    uMaxDistance: { value: 100 },
    uMinDistance: { value: 0.001 },
    uBackgroundColor: { value: new THREE.Color(0, 0, 0) },
    uFogStrength: { value: 0.05 },
    uFogColor: { value: new THREE.Color(0, 0, 0) },
  };
}
