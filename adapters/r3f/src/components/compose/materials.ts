import {
  createMaterialProceduralPlan,
  inferMaterialTraits,
  type MaterialDefinition,
  type MaterialProceduralLayer,
  type MaterialProceduralPlan,
  type MaterialProceduralUniform,
  type MaterialTrait,
} from '@strata-game-library/core/compose';
import * as THREE from 'three';
import type { RuntimeMaterialOptions } from './types';

function toColorRepresentation(color: MaterialDefinition['baseColor']): THREE.ColorRepresentation {
  return color;
}

function cloneMaterialTraits(traits: MaterialDefinition['traits']): MaterialDefinition['traits'] {
  return traits?.map((trait) => ({
    ...trait,
    channels: [...trait.channels],
    tags: trait.tags ? [...trait.tags] : undefined,
  }));
}

function resolveMaterialTraits(definition: MaterialDefinition): MaterialTrait[] {
  return cloneMaterialTraits(definition.traits) ?? inferMaterialTraits(definition);
}

function toUniformValue(uniform: MaterialProceduralUniform): number | THREE.Color {
  if (uniform.type !== 'color') {
    return Number(uniform.value);
  }

  return Array.isArray(uniform.value)
    ? new THREE.Color(uniform.value[0], uniform.value[1], uniform.value[2])
    : new THREE.Color(uniform.value);
}

function insertAfter(
  source: string,
  token: string,
  insertion: string,
  missingToken: 'prepend' | 'unchanged' = 'unchanged'
): string {
  if (!insertion.trim()) {
    return source;
  }

  if (!source.includes(token)) {
    return missingToken === 'prepend' ? `${insertion}\n${source}` : source;
  }

  return source.replace(token, `${token}\n${insertion}`);
}

function layerMaskName(layer: MaterialProceduralLayer): string {
  return `${layer.functionName}_mask`;
}

function targetColorExpression(layer: MaterialProceduralLayer, maskName: string): string {
  if (layer.color !== undefined) {
    return `${layer.functionName}_color`;
  }

  if (layer.secondaryColor !== undefined) {
    return `${layer.functionName}_secondaryColor`;
  }

  return `diffuseColor.rgb * (1.0 + ${maskName} * 0.2)`;
}

function createProceduralChannelInjection(plan: MaterialProceduralPlan): string {
  const maskDeclarations = plan.layers
    .map(
      (layer) =>
        `  float ${layerMaskName(layer)} = ${layer.functionName}(vStrataProceduralPosition, normalize(vStrataProceduralNormal), vStrataProceduralUv);`
    )
    .join('\n');
  const colorLayers = plan.layers.filter((layer) => layer.channels.includes('baseColor'));
  const colorApplication = colorLayers
    .map((layer) => {
      const maskName = layerMaskName(layer);
      return `  diffuseColor.rgb = mix(diffuseColor.rgb, ${targetColorExpression(layer, maskName)}, ${maskName});`;
    })
    .join('\n');

  return [maskDeclarations, colorApplication].filter(Boolean).join('\n');
}

function createProceduralScalarInjection(
  plan: MaterialProceduralPlan,
  channel: 'roughness' | 'metalness' | 'opacity' | 'emissive' | 'normal'
): string {
  return plan.layers
    .filter((layer) => layer.channels.includes(channel))
    .map((layer) => {
      const maskName = layerMaskName(layer);

      switch (channel) {
        case 'roughness':
          return `  roughnessFactor = clamp(roughnessFactor + ${maskName} * 0.35, 0.0, 1.0);`;
        case 'metalness':
          return `  metalnessFactor = clamp(metalnessFactor - ${maskName} * 0.25, 0.0, 1.0);`;
        case 'opacity':
          return `  diffuseColor.a = clamp(diffuseColor.a * (1.0 - ${maskName} * 0.35), 0.0, 1.0);`;
        case 'emissive':
          return `  totalEmissiveRadiance = mix(totalEmissiveRadiance, totalEmissiveRadiance + vec3(${maskName} * 0.2), ${maskName});`;
        case 'normal':
          return `  normal = normalize(mix(normal, normalize(normal + vec3(${maskName} * 0.08, 0.0, 0.0)), ${maskName}));`;
      }

      return '';
    })
    .join('\n');
}

function applyProceduralPlanToShader(
  shader: THREE.WebGLProgramParametersWithUniforms,
  plan: MaterialProceduralPlan
): void {
  for (const uniform of plan.uniforms) {
    shader.uniforms[uniform.name] = { value: toUniformValue(uniform) };
  }

  const vertexVaryings = /* glsl */ `
varying vec3 vStrataProceduralPosition;
varying vec3 vStrataProceduralNormal;
varying vec2 vStrataProceduralUv;
`.trim();
  const fragmentPreamble = /* glsl */ `
${vertexVaryings}
${plan.shaderChunk}
`.trim();

  shader.vertexShader = insertAfter(
    shader.vertexShader,
    '#include <common>',
    vertexVaryings,
    'prepend'
  );
  shader.vertexShader = insertAfter(
    shader.vertexShader,
    '#include <begin_vertex>',
    '  vStrataProceduralUv = uv;'
  );
  shader.vertexShader = insertAfter(
    shader.vertexShader,
    '#include <defaultnormal_vertex>',
    '  vStrataProceduralNormal = normalize(transformedNormal);'
  );
  shader.vertexShader = insertAfter(
    shader.vertexShader,
    '#include <worldpos_vertex>',
    '  vStrataProceduralPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;'
  );
  shader.fragmentShader = insertAfter(
    shader.fragmentShader,
    '#include <common>',
    fragmentPreamble,
    'prepend'
  );
  shader.fragmentShader = insertAfter(
    shader.fragmentShader,
    '#include <color_fragment>',
    createProceduralChannelInjection(plan)
  );
  shader.fragmentShader = insertAfter(
    shader.fragmentShader,
    '#include <roughnessmap_fragment>',
    createProceduralScalarInjection(plan, 'roughness')
  );
  shader.fragmentShader = insertAfter(
    shader.fragmentShader,
    '#include <metalnessmap_fragment>',
    createProceduralScalarInjection(plan, 'metalness')
  );
  shader.fragmentShader = insertAfter(
    shader.fragmentShader,
    '#include <alphamap_fragment>',
    createProceduralScalarInjection(plan, 'opacity')
  );
  shader.fragmentShader = insertAfter(
    shader.fragmentShader,
    '#include <emissivemap_fragment>',
    createProceduralScalarInjection(plan, 'emissive')
  );
  shader.fragmentShader = insertAfter(
    shader.fragmentShader,
    '#include <normal_fragment_maps>',
    createProceduralScalarInjection(plan, 'normal')
  );
}

function enableProceduralMaterial(
  material: THREE.MeshStandardMaterial,
  plan: MaterialProceduralPlan
): void {
  const previousOnBeforeCompile = material.onBeforeCompile.bind(material);
  const previousCacheKey = material.customProgramCacheKey.bind(material);
  const hasOpacityLayers = plan.layers.some((layer) => layer.channels.includes('opacity'));

  material.defines = {
    ...material.defines,
    USE_UV: '',
  };
  material.onBeforeCompile = (shader, renderer) => {
    previousOnBeforeCompile(shader, renderer);
    applyProceduralPlanToShader(shader, plan);
  };
  material.customProgramCacheKey = () =>
    `${previousCacheKey()}:strata-procedural:${plan.layers
      .map((layer) => `${layer.id}:${layer.algorithm}:${layer.channels.join(',')}`)
      .join('|')}`;

  if (hasOpacityLayers) {
    material.transparent = true;
  }

  material.needsUpdate = true;
}

/**
 * Converts a core composition material definition into a Three.js material.
 */
export function createRuntimeMaterial(
  definition: MaterialDefinition,
  options: RuntimeMaterialOptions = {}
): THREE.Material {
  const volumetricTransparency =
    options.transparentVolumetrics && definition.type === 'volumetric'
      ? (definition.volumetric?.transparency ?? 0.65)
      : undefined;
  const parameters: THREE.MeshStandardMaterialParameters = {
    color: toColorRepresentation(definition.baseColor),
    roughness: definition.roughness,
    metalness: definition.metalness,
  };

  if (definition.normalScale !== undefined) {
    parameters.normalScale = new THREE.Vector2(definition.normalScale, definition.normalScale);
  }

  if (volumetricTransparency !== undefined) {
    parameters.transparent = true;
    parameters.opacity = volumetricTransparency;
  }

  const material = new THREE.MeshStandardMaterial(parameters);
  const traits = resolveMaterialTraits(definition);
  const procedural =
    traits.length > 0
      ? createMaterialProceduralPlan(definition, { traits, includeShaderChunk: true })
      : undefined;

  if (traits.length > 0 || procedural) {
    material.userData = {
      ...material.userData,
      strataMaterialTraits: traits,
      strataMaterialProceduralPlan: procedural,
    };
  }

  if (procedural && procedural.layers.length > 0 && procedural.shaderChunk) {
    enableProceduralMaterial(material, procedural);
  }

  return material;
}

/**
 * Resolves an override-aware material for a runtime material slot.
 */
export function resolveRuntimeMaterial(
  slotId: string,
  definition: MaterialDefinition,
  options: RuntimeMaterialOptions = {}
): THREE.Material {
  const override =
    options.materialOverrides?.[slotId] ?? options.materialOverrides?.[definition.id];

  if (override instanceof THREE.Material) {
    return override;
  }

  return createRuntimeMaterial(override ?? definition, options);
}
