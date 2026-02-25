/**
 * Babylon.js Sky ShaderMaterial factory.
 *
 * Adapts Strata's GLSL sky shaders for Babylon.js's ShaderMaterial API.
 * The sky shader simulates atmospheric scattering with day/night cycles,
 * star fields, weather effects, and sun glow.
 */

/**
 * Configuration for creating a Babylon.js sky shader material.
 */
export interface BabylonSkyMaterialOptions {
  /** Time of day settings. */
  timeOfDay: {
    sunIntensity: number;
    sunAngle: number;
    ambientLight: number;
    starVisibility: number;
    fogDensity: number;
  };
  /** Weather settings. */
  weather?: {
    intensity: number;
  };
}

/**
 * Handle returned by the sky material factory.
 */
export interface BabylonSkyMaterialHandle {
  /** Update the animation time. */
  updateTime(time: number): void;
  /** Update time of day parameters. */
  updateTimeOfDay(timeOfDay: {
    sunIntensity: number;
    sunAngle: number;
    ambientLight: number;
    starVisibility: number;
    fogDensity: number;
  }): void;
  /** Update weather parameters. */
  updateWeather(weather: { intensity: number }): void;
  /** Get current uniform values. */
  getUniforms(): SkyUniformValues;
  /** Vertex shader source adapted for Babylon.js. */
  vertexShader: string;
  /** Fragment shader source adapted for Babylon.js. */
  fragmentShader: string;
  /** Dispose of the material handle. */
  dispose(): void;
}

export interface SkyUniformValues {
  uTime: number;
  uSunIntensity: number;
  uSunAngle: number;
  uAmbientLight: number;
  uStarVisibility: number;
  uFogDensity: number;
  uWeatherIntensity: number;
  uGyroTilt: [number, number];
}

/**
 * Babylon.js-adapted vertex shader for procedural sky.
 */
const babylonSkyVertexShader = /* glsl */ `
  precision highp float;

  attribute vec3 position;
  attribute vec2 uv;

  uniform mat4 worldViewProjection;

  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = worldViewProjection * vec4(position, 1.0);
  }
`;

/**
 * Babylon.js-adapted fragment shader for procedural sky.
 * Includes day/night cycle, star field, sun glow, weather, and fog.
 */
const babylonSkyFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uSunIntensity;
  uniform float uSunAngle;
  uniform float uAmbientLight;
  uniform float uStarVisibility;
  uniform float uFogDensity;
  uniform float uWeatherIntensity;
  uniform vec2 uGyroTilt;

  varying vec2 vUv;
  varying vec3 vPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  vec3 getSkyColor(float height) {
    vec3 daySkyTop = vec3(0.4, 0.6, 0.9);
    vec3 daySkyHorizon = vec3(0.7, 0.8, 0.95);

    vec3 nightSkyTop = vec3(0.01, 0.01, 0.05);
    vec3 nightSkyHorizon = vec3(0.1, 0.1, 0.2);

    vec3 skyTop = mix(nightSkyTop, daySkyTop, uSunIntensity);
    vec3 skyHorizon = mix(nightSkyHorizon, daySkyHorizon, uSunIntensity);

    return mix(skyHorizon, skyTop, height);
  }

  void main() {
    vec2 adjustedUv = vUv + uGyroTilt;
    float height = adjustedUv.y;

    vec3 skyColor = getSkyColor(height);

    // Stars at night
    if (uStarVisibility > 0.0) {
      float starNoise = hash(floor(adjustedUv * 200.0));
      if (starNoise > 0.995) {
        float starBrightness = (starNoise - 0.995) * 200.0;
        skyColor += vec3(starBrightness) * uStarVisibility;
      }
    }

    // Sun glow
    if (uSunIntensity > 0.0) {
      float sunY = (uSunAngle / 180.0);
      float distToSun = distance(adjustedUv, vec2(0.5, sunY));
      float sunGlow = smoothstep(0.2, 0.0, distToSun) * uSunIntensity;
      skyColor += vec3(1.0, 0.9, 0.7) * sunGlow;
    }

    // Weather effects
    if (uWeatherIntensity > 0.0) {
      float cloudNoise = hash(floor(adjustedUv * 10.0 + vec2(uTime * 0.1)));
      vec3 cloudColor = vec3(0.8, 0.8, 0.85);
      skyColor = mix(skyColor, cloudColor, cloudNoise * uWeatherIntensity * 0.5);
    }

    // Fog
    if (uFogDensity > 0.0) {
      vec3 fogColor = vec3(0.9, 0.9, 0.95);
      skyColor = mix(skyColor, fogColor, uFogDensity * (1.0 - height));
    }

    skyColor *= (0.5 + uAmbientLight * 0.5);

    gl_FragColor = vec4(skyColor, 1.0);
  }
`;

/**
 * Create a Babylon.js-compatible sky shader material handle.
 *
 * Usage with Babylon.js:
 * ```ts
 * const handle = createBabylonSkyShaderMaterial({
 *   timeOfDay: { sunAngle: 60, sunIntensity: 1.0, ... },
 * });
 * const material = new BABYLON.ShaderMaterial('strataSky', scene, {
 *   vertexSource: handle.vertexShader,
 *   fragmentSource: handle.fragmentShader,
 * }, {
 *   attributes: ['position', 'uv'],
 *   uniforms: ['worldViewProjection', 'uTime', 'uSunIntensity', ...],
 * });
 * ```
 */
export function createBabylonSkyShaderMaterial(
  options: BabylonSkyMaterialOptions,
): BabylonSkyMaterialHandle {
  const { timeOfDay, weather = { intensity: 0 } } = options;

  if (timeOfDay.sunIntensity < 0 || timeOfDay.sunIntensity > 1) {
    throw new Error('createBabylonSkyShaderMaterial: sunIntensity must be between 0 and 1');
  }
  if (timeOfDay.sunAngle < -180 || timeOfDay.sunAngle > 360) {
    throw new Error('createBabylonSkyShaderMaterial: sunAngle must be between -180 and 360');
  }

  const uniforms: SkyUniformValues = {
    uTime: 0,
    uSunIntensity: timeOfDay.sunIntensity,
    uSunAngle: timeOfDay.sunAngle,
    uAmbientLight: timeOfDay.ambientLight,
    uStarVisibility: timeOfDay.starVisibility,
    uFogDensity: timeOfDay.fogDensity,
    uWeatherIntensity: weather.intensity,
    uGyroTilt: [0, 0],
  };

  let disposed = false;

  return {
    vertexShader: babylonSkyVertexShader,
    fragmentShader: babylonSkyFragmentShader,

    updateTime(time: number) {
      if (!disposed) {
        uniforms.uTime = time;
        // Subtle gyroscopic tilt for immersive feel
        uniforms.uGyroTilt = [
          Math.sin(time * 0.1) * 0.02,
          Math.cos(time * 0.15) * 0.02,
        ];
      }
    },

    updateTimeOfDay(tod) {
      if (!disposed) {
        uniforms.uSunIntensity = tod.sunIntensity;
        uniforms.uSunAngle = tod.sunAngle;
        uniforms.uAmbientLight = tod.ambientLight;
        uniforms.uStarVisibility = tod.starVisibility;
        uniforms.uFogDensity = tod.fogDensity;
      }
    },

    updateWeather(w) {
      if (!disposed) {
        uniforms.uWeatherIntensity = w.intensity;
      }
    },

    getUniforms() {
      return { ...uniforms };
    },

    dispose() {
      disposed = true;
    },
  };
}
