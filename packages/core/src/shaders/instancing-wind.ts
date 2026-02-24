/**
 * GPU-Driven Instancing Wind/LOD Shader
 *
 * Vertex shader for drei's Instances with wind and LOD support
 */

export const instancingWindVertexShader = /* glsl */ `
  attribute vec3 position;
  attribute vec3 normal;
  attribute float instanceRandom;

  uniform float uTime;
  uniform vec3 uCameraPosition;
  uniform float uWindStrength;
  uniform float uLodDistance;
  uniform bool uEnableWind;

  varying vec3 vNormal;
  varying vec3 vWorldPos;

  // Noise functions for wind variation
  float hash(float n) {
      return fract(sin(n) * 43758.5453);
  }

  float hash3(vec3 p) {
      return hash(p.x + p.y * 157.0 + p.z * 113.0);
  }

  float noise3D(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float n000 = hash3(i);
      float n100 = hash3(i + vec3(1.0, 0.0, 0.0));
      float n010 = hash3(i + vec3(0.0, 1.0, 0.0));
      float n110 = hash3(i + vec3(1.0, 1.0, 0.0));
      float n001 = hash3(i + vec3(0.0, 0.0, 1.0));
      float n101 = hash3(i + vec3(1.0, 0.0, 1.0));
      float n011 = hash3(i + vec3(0.0, 1.0, 1.0));
      float n111 = hash3(i + vec3(1.0, 1.0, 1.0));

      float nx00 = mix(n000, n100, f.x);
      float nx10 = mix(n010, n110, f.x);
      float nx01 = mix(n001, n101, f.x);
      float nx11 = mix(n011, n111, f.x);

      float nxy0 = mix(nx00, nx10, f.y);
      float nxy1 = mix(nx01, nx11, f.y);

      return mix(nxy0, nxy1, f.z);
  }

  // Quaternion operations
  vec3 quatRotate(vec4 q, vec3 v) {
      return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
  }

  vec4 quatMul(vec4 q1, vec4 q2) {
      return vec4(
          q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y,
          q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x,
          q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w,
          q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z
      );
  }

  void main() {
      vec3 localPos = position;
      vec3 localNormal = normal;

      // Get instance position from model matrix
      vec3 instancePosition = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;

      // Calculate LOD scale based on distance
      float distToCamera = length(instancePosition - uCameraPosition);
      float lodScale = 1.0 - clamp((distToCamera - uLodDistance * 0.5) / (uLodDistance * 0.5), 0.0, 1.0);

      // Hide if too far
      if (lodScale < 0.01) {
          gl_Position = vec4(0.0, 0.0, -1.0, 1.0);
          return;
      }

      // Apply LOD scale
      localPos *= lodScale;

      // Calculate wind effect on GPU
      if (uEnableWind && uWindStrength > 0.0) {
          // Wind phase with instance-specific variation
          float windPhase = uTime * 2.0 + instancePosition.x * 0.1 + instancePosition.z * 0.1 + instanceRandom * 6.28;

          // Wind noise for variation
          float windNoise = noise3D(instancePosition * 0.05 + vec3(uTime * 0.5));

          // Calculate bend angle
          float bendAngle = sin(windPhase) * uWindStrength * 0.3 * (0.5 + 0.5 * windNoise);

          // Bend axis (perpendicular to wind direction)
          vec3 bendAxis = normalize(vec3(-cos(windPhase), 0.0, sin(windPhase)));

          // Apply wind rotation
          float halfAngle = bendAngle * 0.5;
          vec4 windQuat = vec4(bendAxis * sin(halfAngle), cos(halfAngle));
          localPos = quatRotate(windQuat, localPos);
          localNormal = quatRotate(windQuat, localNormal);
      }

      vNormal = normalize(normalMatrix * localNormal);
      vWorldPos = (modelMatrix * vec4(localPos, 1.0)).xyz;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(localPos, 1.0);
  }
`;
