import {
  MATERIALS,
  resolveCreatureComposition,
  resolvePropComposition,
} from '@strata-game-library/core/compose';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createRuntimeMaterial } from '../materials';
import {
  collectRuntimeCreatureSourceBoneNames,
  createRuntimeCreatureAssetRigBinding,
} from '../RuntimeCreatureAsset';
import { createRuntimeGeometry } from '../RuntimeGeometry';
import { getDefaultRuntimePropInteractionAction } from '../RuntimeProp';

describe('R3F runtime composition components', () => {
  it('exports runtime composition renderers', async () => {
    const compose = await import('../index');

    expect(compose.RuntimeProp).toBeDefined();
    expect(compose.RuntimeCreature).toBeDefined();
    expect(compose.RuntimeCreatureAsset).toBeDefined();
    expect(compose.RuntimeAssetMesh).toBeDefined();
    expect(compose.RuntimeGeometry).toBeDefined();
    expect(compose.createRuntimeMaterial).toBeTypeOf('function');
    expect(compose.resolveRuntimeMaterial).toBeTypeOf('function');
    expect(compose.createRuntimeCreatureAssetRigBinding).toBeTypeOf('function');
    expect(compose.getDefaultRuntimePropInteractionAction).toBeTypeOf('function');
  });

  it('creates Three materials from core material definitions', () => {
    const material = createRuntimeMaterial(MATERIALS.wood_oak);

    expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect((material as THREE.MeshStandardMaterial).roughness).toBe(MATERIALS.wood_oak.roughness);
    expect(material.userData.strataMaterialTraits[0]?.type).toBe('grain');
    expect(material.userData.strataMaterialProceduralPlan.layers[0]?.algorithm).toBe(
      'directional-noise'
    );
    expect(material.userData.strataMaterialProceduralPlan.shaderChunk).toContain(
      'strataProceduralNoise'
    );
  });

  it('injects procedural material plans into Three shader compilation', () => {
    const material = createRuntimeMaterial(MATERIALS.wood_oak) as THREE.MeshStandardMaterial;
    const plan = material.userData.strataMaterialProceduralPlan;
    const functionName = plan.layers[0]?.functionName;

    if (!functionName) {
      throw new Error('Expected wood_oak to produce a procedural shader layer');
    }

    const shader = {
      uniforms: {},
      vertexShader: `
#include <common>
void main() {
#include <begin_vertex>
#include <defaultnormal_vertex>
#include <worldpos_vertex>
}
`,
      fragmentShader: `
#include <common>
void main() {
  vec4 diffuseColor = vec4(1.0);
  float roughnessFactor = 0.5;
  float metalnessFactor = 0.0;
  vec3 totalEmissiveRadiance = vec3(0.0);
  vec3 normal = vec3(0.0, 0.0, 1.0);
#include <color_fragment>
#include <roughnessmap_fragment>
#include <metalnessmap_fragment>
#include <alphamap_fragment>
#include <emissivemap_fragment>
#include <normal_fragment_maps>
}
`,
    } as Parameters<THREE.Material['onBeforeCompile']>[0];

    material.onBeforeCompile(shader, {} as Parameters<THREE.Material['onBeforeCompile']>[1]);

    expect(shader.uniforms[`${functionName}_scale`]?.value).toBe(plan.layers[0]?.scale);
    expect(shader.uniforms[`${functionName}_color`]?.value).toBeInstanceOf(THREE.Color);
    expect(shader.vertexShader).toContain('vStrataProceduralPosition');
    expect(shader.fragmentShader).toContain(`float ${functionName}`);
    expect(shader.fragmentShader).toContain('diffuseColor.rgb = mix');
    expect(shader.fragmentShader).toContain('roughnessFactor = clamp');
    expect(shader.fragmentShader).toContain('normal = normalize');
    expect(material.customProgramCacheKey()).toContain('strata-procedural');
  });

  it('accepts resolved core runtime composition outputs', () => {
    const prop = resolvePropComposition('crate_wooden');
    const creature = resolveCreatureComposition('otter_river', {}, () => 0.5);

    expect(prop.runtime.nodes.length).toBeGreaterThan(0);
    expect(creature.runtime.bones.length).toBeGreaterThan(0);
  });

  it('orients capsule geometry along the longest runtime axis', () => {
    const geometry = createRuntimeGeometry('capsule', [4, 1, 1]);

    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    const size = new THREE.Vector3();
    bounds?.getSize(size);

    expect(size.x).toBeGreaterThan(size.y);
    expect(size.x).toBeGreaterThan(size.z);
    geometry.dispose();
  });

  it('preserves mesh sources for R3F asset-backed prop nodes', () => {
    const prop = resolvePropComposition({
      id: 'asset_prop',
      components: [
        {
          shape: 'mesh',
          mesh: '/models/crate.glb',
          size: [1, 1, 1],
          position: [0, 0, 0],
          material: 'wood_oak',
        },
      ],
    });

    expect(prop.runtime.nodes[0]?.shape).toBe('mesh');
    expect(prop.runtime.nodes[0]?.mesh).toBe('/models/crate.glb');
  });

  it('maps R3F runtime prop nodes to core interaction actions', () => {
    const prop = resolvePropComposition('crate_wooden');
    const node = prop.runtime.nodes[0];

    expect(node).toBeDefined();
    if (!node) {
      throw new Error('Expected crate_wooden to resolve at least one runtime node');
    }

    expect(getDefaultRuntimePropInteractionAction(prop.runtime, node)?.id).toBe(
      'crate_wooden:interaction:container'
    );
  });

  it('preserves creature asset bindings for R3F asset-backed rendering', () => {
    const creature = resolveCreatureComposition('otter_river', {
      assets: {
        model: '/models/otter.glb',
        animationClips: { idle: 'Idle' },
        boneMap: {
          spine_mid: 'Spine',
          head: 'Head',
        },
      },
    });
    const rig = new THREE.Group();
    const spine = new THREE.Bone();
    const head = new THREE.Bone();

    spine.name = 'Spine';
    head.name = 'Head';
    rig.add(spine, head);

    const binding = createRuntimeCreatureAssetRigBinding(creature.runtime, rig);

    expect(creature.runtime.asset?.model).toBe('/models/otter.glb');
    expect(creature.runtime.asset?.animationClips.idle).toBe('Idle');
    expect(collectRuntimeCreatureSourceBoneNames(rig)).toEqual(['Spine', 'Head']);
    expect(binding.bindings.find((entry) => entry.boneId === 'spine_mid')).toMatchObject({
      sourceBone: 'Spine',
      explicit: true,
      status: 'matched',
    });
    expect(binding.bindings.find((entry) => entry.boneId === 'head')).toMatchObject({
      sourceBone: 'Head',
      explicit: true,
      status: 'matched',
    });
  });
});
