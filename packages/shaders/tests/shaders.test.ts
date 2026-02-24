/**
 * Shader exports tests
 *
 * Validates that every exported shader string is non-empty and contains
 * expected GLSL keywords, ensuring the GLSL template literals are intact.
 */
import { describe, expect, it } from 'vitest';

import {
  terrainVertexShader,
  terrainFragmentShader,
  simpleTerrainVertexShader,
  simpleTerrainFragmentShader,
} from '../src/terrain.js';

import {
  waterVertexShader,
  waterFragmentShader,
  advancedWaterVertexShader,
  advancedWaterFragmentShader,
} from '../src/water.js';

import {
  cloudLayerVertexShader,
  cloudLayerFragmentShader,
  volumetricCloudVertexShader,
  volumetricCloudFragmentShader,
} from '../src/clouds.js';

import { skyVertexShader, skyFragmentShader } from '../src/sky.js';

import { furVertexShader, furFragmentShader, defaultFurConfig } from '../src/fur.js';

import {
  godRaysVertexShader,
  godRaysFragmentShader,
  volumetricSpotlightVertexShader,
  volumetricSpotlightFragmentShader,
  volumetricPointLightVertexShader,
  volumetricPointLightFragmentShader,
} from '../src/godRays.js';

import { raymarchingVertexShader, raymarchingFragmentShader } from '../src/raymarching.js';

import {
  volumetricFogVertexShader,
  volumetricFogFragmentShader,
  underwaterVertexShader,
  underwaterFragmentShader,
  atmosphereVertexShader,
  atmosphereFragmentShader,
  dustParticlesVertexShader,
  dustParticlesFragmentShader,
} from '../src/volumetrics.js';

import {
  volumetricFogMeshVertexShader,
  volumetricFogMeshFragmentShader,
  underwaterOverlayVertexShader,
  underwaterOverlayFragmentShader,
} from '../src/volumetrics-components.js';

import { instancingWindVertexShader } from '../src/instancing-wind.js';

import { NoiseChunks, MathChunks } from '../src/chunks.js';

/** GLSL keywords that should appear in valid shader strings */
const GLSL_KEYWORDS = ['void', 'float', 'vec2', 'vec3', 'vec4', 'gl_Position', 'gl_FragColor'];
const VERTEX_KEYWORDS = ['void', 'gl_Position'];
const FRAGMENT_KEYWORDS = ['void', 'gl_FragColor'];

function expectValidGlsl(shader: string, keywords: string[] = GLSL_KEYWORDS) {
  expect(shader).toBeTruthy();
  expect(typeof shader).toBe('string');
  expect(shader.length).toBeGreaterThan(10);

  const hasAtLeastOne = keywords.some((kw) => shader.includes(kw));
  expect(hasAtLeastOne).toBe(true);
}

function expectVertexShader(shader: string) {
  expectValidGlsl(shader, VERTEX_KEYWORDS);
  expect(shader).toContain('gl_Position');
}

function expectFragmentShader(shader: string) {
  expectValidGlsl(shader, FRAGMENT_KEYWORDS);
  expect(shader).toContain('gl_FragColor');
}

describe('Terrain shaders', () => {
  it('exports valid terrain vertex shader', () => {
    expectVertexShader(terrainVertexShader);
    expect(terrainVertexShader).toContain('biomeTypes');
  });

  it('exports valid terrain fragment shader', () => {
    expectFragmentShader(terrainFragmentShader);
    expect(terrainFragmentShader).toContain('biomeColors');
  });

  it('exports valid simple terrain vertex shader', () => {
    expectVertexShader(simpleTerrainVertexShader);
  });

  it('exports valid simple terrain fragment shader', () => {
    expectFragmentShader(simpleTerrainFragmentShader);
    expect(simpleTerrainFragmentShader).toContain('uGroundColor');
  });
});

describe('Water shaders', () => {
  it('exports valid water vertex shader', () => {
    expectVertexShader(waterVertexShader);
    expect(waterVertexShader).toContain('time');
  });

  it('exports valid water fragment shader', () => {
    expectFragmentShader(waterFragmentShader);
    expect(waterFragmentShader).toContain('fresnel');
  });

  it('exports valid advanced water vertex shader', () => {
    expectVertexShader(advancedWaterVertexShader);
    expect(advancedWaterVertexShader).toContain('uTime');
  });

  it('exports valid advanced water fragment shader', () => {
    expectFragmentShader(advancedWaterFragmentShader);
    expect(advancedWaterFragmentShader).toContain('caustic');
  });
});

describe('Cloud shaders', () => {
  it('exports valid cloud layer vertex shader', () => {
    expectVertexShader(cloudLayerVertexShader);
  });

  it('exports valid cloud layer fragment shader', () => {
    expectFragmentShader(cloudLayerFragmentShader);
    expect(cloudLayerFragmentShader).toContain('uCoverage');
  });

  it('exports valid volumetric cloud vertex shader', () => {
    expectVertexShader(volumetricCloudVertexShader);
  });

  it('exports valid volumetric cloud fragment shader', () => {
    expectFragmentShader(volumetricCloudFragmentShader);
    expect(volumetricCloudFragmentShader).toContain('sampleCloudDensity');
  });
});

describe('Sky shaders', () => {
  it('exports valid sky vertex shader', () => {
    expectVertexShader(skyVertexShader);
  });

  it('exports valid sky fragment shader', () => {
    expectFragmentShader(skyFragmentShader);
    expect(skyFragmentShader).toContain('uSunIntensity');
    expect(skyFragmentShader).toContain('uStarVisibility');
  });
});

describe('Fur shaders', () => {
  it('exports valid fur vertex shader', () => {
    expectVertexShader(furVertexShader);
    expect(furVertexShader).toContain('layerOffset');
  });

  it('exports valid fur fragment shader', () => {
    expectFragmentShader(furFragmentShader);
    expect(furFragmentShader).toContain('colorBase');
  });

  it('has valid default fur config', () => {
    expect(defaultFurConfig.layers).toBeGreaterThan(0);
    expect(defaultFurConfig.spacing).toBeGreaterThan(0);
    expect(defaultFurConfig.colorBase).toHaveLength(3);
    expect(defaultFurConfig.colorTip).toHaveLength(3);
  });
});

describe('God rays shaders', () => {
  it('exports valid god rays vertex shader', () => {
    expectVertexShader(godRaysVertexShader);
  });

  it('exports valid god rays fragment shader', () => {
    expectFragmentShader(godRaysFragmentShader);
    expect(godRaysFragmentShader).toContain('uLightPosition');
  });

  it('exports valid volumetric spotlight vertex shader', () => {
    expectVertexShader(volumetricSpotlightVertexShader);
  });

  it('exports valid volumetric spotlight fragment shader', () => {
    expectFragmentShader(volumetricSpotlightFragmentShader);
    expect(volumetricSpotlightFragmentShader).toContain('uAngle');
  });

  it('exports valid volumetric point light vertex shader', () => {
    expectVertexShader(volumetricPointLightVertexShader);
  });

  it('exports valid volumetric point light fragment shader', () => {
    expectFragmentShader(volumetricPointLightFragmentShader);
    expect(volumetricPointLightFragmentShader).toContain('uRadius');
  });
});

describe('Raymarching shaders', () => {
  it('exports valid raymarching vertex shader', () => {
    expectVertexShader(raymarchingVertexShader);
  });

  it('exports valid raymarching fragment shader', () => {
    expectFragmentShader(raymarchingFragmentShader);
    expect(raymarchingFragmentShader).toContain('sceneSDF');
    expect(raymarchingFragmentShader).toContain('calcNormal');
  });
});

describe('Volumetric shaders', () => {
  it('exports valid volumetric fog vertex shader', () => {
    expectVertexShader(volumetricFogVertexShader);
  });

  it('exports valid volumetric fog fragment shader', () => {
    expectFragmentShader(volumetricFogFragmentShader);
    expect(volumetricFogFragmentShader).toContain('uFogDensity');
  });

  it('exports valid underwater vertex shader', () => {
    expectVertexShader(underwaterVertexShader);
  });

  it('exports valid underwater fragment shader', () => {
    expectFragmentShader(underwaterFragmentShader);
    expect(underwaterFragmentShader).toContain('caustics');
  });

  it('exports valid atmosphere vertex shader', () => {
    expectVertexShader(atmosphereVertexShader);
  });

  it('exports valid atmosphere fragment shader', () => {
    expectFragmentShader(atmosphereFragmentShader);
    expect(atmosphereFragmentShader).toContain('rayleighPhase');
  });

  it('exports valid dust particles vertex shader', () => {
    expectVertexShader(dustParticlesVertexShader);
  });

  it('exports valid dust particles fragment shader', () => {
    expectFragmentShader(dustParticlesFragmentShader);
    expect(dustParticlesFragmentShader).toContain('dustParticle');
  });
});

describe('Volumetric component shaders', () => {
  it('exports valid volumetric fog mesh vertex shader', () => {
    expectVertexShader(volumetricFogMeshVertexShader);
  });

  it('exports valid volumetric fog mesh fragment shader', () => {
    expectFragmentShader(volumetricFogMeshFragmentShader);
    expect(volumetricFogMeshFragmentShader).toContain('uFogColor');
  });

  it('exports valid underwater overlay vertex shader', () => {
    expectVertexShader(underwaterOverlayVertexShader);
  });

  it('exports valid underwater overlay fragment shader', () => {
    expectFragmentShader(underwaterOverlayFragmentShader);
    expect(underwaterOverlayFragmentShader).toContain('uWaterColor');
  });
});

describe('Instancing wind shader', () => {
  it('exports valid instancing wind vertex shader', () => {
    expectVertexShader(instancingWindVertexShader);
    expect(instancingWindVertexShader).toContain('uWindStrength');
  });
});

describe('Shader chunks', () => {
  it('exports noise chunks with valid GLSL', () => {
    expect(NoiseChunks.hash).toContain('float');
    expect(NoiseChunks.hash).toContain('hash');
    expect(NoiseChunks.valueNoise).toContain('noise');
    expect(NoiseChunks.fbm).toContain('fbm');
  });

  it('exports math chunks with valid GLSL', () => {
    expect(MathChunks.fresnel).toContain('fresnel');
    expect(MathChunks.fresnel).toContain('float');
  });
});
