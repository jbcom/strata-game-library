/**
 * Procedural shader-layer planning for material traits.
 *
 * Turns a material's traits into a deterministic set of GLSL layers: one
 * noise-based mask function per trait, the uniforms that drive it, and a
 * channel-to-layer index the bake pipeline consumes. Emits shader source only —
 * no rasterization, no renderer objects.
 *
 * @module MaterialProcedural
 * @category Entities & Simulation
 */

import { cloneMaterialTrait, resolveMaterialDefinition } from './presets';
import { inferMaterialTraits } from './traits';
import type {
  MaterialDefinition,
  MaterialProceduralAlgorithm,
  MaterialProceduralColor,
  MaterialProceduralLayer,
  MaterialProceduralPlan,
  MaterialProceduralPlanOptions,
  MaterialProceduralUniform,
  MaterialTrait,
  MaterialTraitChannel,
  MaterialTraitType,
} from './types';

export function proceduralAlgorithmForTrait(type: MaterialTraitType): MaterialProceduralAlgorithm {
  switch (type) {
    case 'grain':
      return 'directional-noise';
    case 'fiber':
      return 'strand-noise';
    case 'scratches':
      return 'scratch-lines';
    case 'wear':
      return 'edge-wear';
    case 'patina':
      return 'oxidation-noise';
    case 'veins':
      return 'branching-veins';
    case 'mottle':
      return 'cellular-mottle';
    case 'absorption':
      return 'depth-absorption';
  }
}

export function sanitizeShaderIdentifier(value: string): string {
  const sanitized = value.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^[^a-zA-Z_]+/, '');
  return sanitized || 'layer';
}

export function createChannelLayers(): Record<MaterialTraitChannel, string[]> {
  return {
    baseColor: [],
    roughness: [],
    metalness: [],
    normal: [],
    opacity: [],
    emissive: [],
  };
}

export function proceduralExpression(
  algorithm: MaterialProceduralAlgorithm,
  scaleUniform: string,
  seedUniform: string,
  intensityUniform: string
): string {
  switch (algorithm) {
    case 'directional-noise':
      return `clamp((sin((position.x + strataProceduralNoise(position * ${scaleUniform} * 0.35)) * ${scaleUniform} * 12.0 + ${seedUniform}) * 0.5 + 0.5) * ${intensityUniform}, 0.0, 1.0)`;
    case 'strand-noise':
      return `clamp(pow(abs(sin((uv.y + strataProceduralNoise(position * ${scaleUniform})) * ${scaleUniform} * 24.0 + ${seedUniform})), 3.0) * ${intensityUniform}, 0.0, 1.0)`;
    case 'scratch-lines':
      return `step(1.0 - ${intensityUniform} * 0.35, strataProceduralNoise(vec3(uv * ${scaleUniform} * 40.0, ${seedUniform})))`;
    case 'edge-wear':
      return `clamp(smoothstep(0.35, 1.0, 1.0 - abs(normal.y)) * strataProceduralNoise(position * ${scaleUniform} + ${seedUniform}) * ${intensityUniform}, 0.0, 1.0)`;
    case 'oxidation-noise':
      return `clamp(smoothstep(0.25, 0.85, strataProceduralNoise(position * ${scaleUniform} + ${seedUniform})) * ${intensityUniform}, 0.0, 1.0)`;
    case 'branching-veins':
      return `clamp(smoothstep(0.65, 0.95, sin((position.x + position.z) * ${scaleUniform} * 8.0 + strataProceduralNoise(position * ${scaleUniform}) * 3.14159 + ${seedUniform})) * ${intensityUniform}, 0.0, 1.0)`;
    case 'cellular-mottle':
      return `clamp(abs(strataProceduralNoise(floor(position * ${scaleUniform} * 8.0) + ${seedUniform}) - 0.5) * 2.0 * ${intensityUniform}, 0.0, 1.0)`;
    case 'depth-absorption':
      return `clamp(smoothstep(0.0, 1.0, position.y * ${scaleUniform} + strataProceduralNoise(position * ${scaleUniform} + ${seedUniform})) * ${intensityUniform}, 0.0, 1.0)`;
  }
}

export function proceduralShaderPreamble(): string {
  return /* glsl */ `
float strataProceduralHash(vec3 value) {
  return fract(sin(dot(value, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

float strataProceduralNoise(vec3 value) {
  vec3 cell = floor(value);
  vec3 local = fract(value);
  vec3 curve = local * local * (3.0 - 2.0 * local);

  float n000 = strataProceduralHash(cell + vec3(0.0, 0.0, 0.0));
  float n100 = strataProceduralHash(cell + vec3(1.0, 0.0, 0.0));
  float n010 = strataProceduralHash(cell + vec3(0.0, 1.0, 0.0));
  float n110 = strataProceduralHash(cell + vec3(1.0, 1.0, 0.0));
  float n001 = strataProceduralHash(cell + vec3(0.0, 0.0, 1.0));
  float n101 = strataProceduralHash(cell + vec3(1.0, 0.0, 1.0));
  float n011 = strataProceduralHash(cell + vec3(0.0, 1.0, 1.0));
  float n111 = strataProceduralHash(cell + vec3(1.0, 1.0, 1.0));

  float x00 = mix(n000, n100, curve.x);
  float x10 = mix(n010, n110, curve.x);
  float x01 = mix(n001, n101, curve.x);
  float x11 = mix(n011, n111, curve.x);
  float y0 = mix(x00, x10, curve.y);
  float y1 = mix(x01, x11, curve.y);

  return mix(y0, y1, curve.z);
}
`.trim();
}

export function proceduralLayerShader(layer: MaterialProceduralLayer): string {
  const scaleUniform = `${layer.functionName}_scale`;
  const seedUniform = `${layer.functionName}_seed`;
  const intensityUniform = `${layer.functionName}_intensity`;
  const expression = proceduralExpression(
    layer.algorithm,
    scaleUniform,
    seedUniform,
    intensityUniform
  );

  return /* glsl */ `
uniform float ${scaleUniform};
uniform float ${seedUniform};
uniform float ${intensityUniform};

float ${layer.functionName}(vec3 position, vec3 normal, vec2 uv) {
  return ${expression};
}
`.trim();
}

export function serializeProceduralColor(
  color: MaterialTrait['color']
): MaterialProceduralColor | undefined {
  if (color === undefined) {
    return undefined;
  }

  if (typeof color === 'string') {
    return color;
  }

  return [color.r, color.g, color.b];
}

/**
 * Converts procedural material traits into a deterministic shader/texture layer plan.
 */
export function createMaterialProceduralPlan(
  material: string | MaterialDefinition,
  options: MaterialProceduralPlanOptions = {}
): MaterialProceduralPlan {
  const resolved = resolveMaterialDefinition(material);
  const traits =
    options.traits?.map(cloneMaterialTrait) ??
    (resolved.traits ? resolved.traits.map(cloneMaterialTrait) : undefined) ??
    (options.inferTraits ? inferMaterialTraits(resolved) : []);
  const channelLayers = createChannelLayers();
  const layers = traits.map<MaterialProceduralLayer>((trait, index) => {
    const layerId = `${options.idPrefix ?? resolved.id}:procedural:${trait.id}`;
    const functionName = `strata_${sanitizeShaderIdentifier(layerId)}`;
    const color = serializeProceduralColor(trait.color);
    const secondaryColor = serializeProceduralColor(trait.secondaryColor);
    const uniforms: MaterialProceduralUniform[] = [
      { name: `${functionName}_scale`, type: 'float', value: trait.scale },
      { name: `${functionName}_seed`, type: 'float', value: trait.seed },
      { name: `${functionName}_intensity`, type: 'float', value: trait.intensity },
    ];

    if (color !== undefined) {
      uniforms.push({ name: `${functionName}_color`, type: 'color', value: color });
    }

    if (secondaryColor !== undefined) {
      uniforms.push({
        name: `${functionName}_secondaryColor`,
        type: 'color',
        value: secondaryColor,
      });
    }

    const layer: MaterialProceduralLayer = {
      id: layerId,
      traitId: trait.id,
      type: trait.type,
      algorithm: proceduralAlgorithmForTrait(trait.type),
      functionName,
      channels: [...trait.channels],
      intensity: trait.intensity,
      scale: trait.scale,
      seed: trait.seed,
      color,
      secondaryColor,
      uniforms,
    };

    for (const channel of layer.channels) {
      channelLayers[channel].push(layer.id);
    }

    return {
      ...layer,
      seed: layer.seed + index * 101,
      uniforms: layer.uniforms.map((uniform) =>
        uniform.name.endsWith('_seed') && typeof uniform.value === 'number'
          ? { ...uniform, value: uniform.value + index * 101 }
          : uniform
      ),
    };
  });
  const uniforms = layers.flatMap((layer) => layer.uniforms);
  const shaderChunk =
    options.includeShaderChunk === false || layers.length === 0
      ? ''
      : [proceduralShaderPreamble(), ...layers.map(proceduralLayerShader)].join('\n\n');

  return {
    materialId: resolved.id,
    layers,
    channelLayers,
    uniforms,
    shaderChunk,
  };
}
