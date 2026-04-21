import { MeshBuilder, NullEngine, PBRMaterial, Scene } from '@babylonjs/core';
import {
  createMaterialVariant,
  MATERIALS,
  resolvePropComposition,
} from '@strata-game-library/core/compose';
import { describe, expect, it } from 'vitest';
import {
  createBabylonRuntimeMaterial,
  createReactylonRuntimeMaterialDescriptor,
  instantiateBabylonRuntimeCreature,
  instantiateBabylonRuntimeProp,
  resolveReactylonRuntimeCreature,
  resolveReactylonRuntimeProp,
} from '../src/components/compose';

describe('Reactylon runtime composition descriptors', () => {
  it('creates serializable material descriptors from runtime slots', () => {
    const prop = resolvePropComposition('crate_wooden');
    const slot = Object.values(prop.runtime.materialSlots)[0];
    const descriptor = createReactylonRuntimeMaterialDescriptor(slot);

    expect(descriptor.id).toBe(slot.id);
    expect(descriptor.materialId).toBe(slot.materialId);
    expect(descriptor.baseColor).toBe(MATERIALS.wood_oak.baseColor);
    expect(descriptor.physics?.density).toBeGreaterThan(0);
    expect(descriptor.transparent).toBe(false);
  });

  it('resolves prop runtime descriptors with material overrides and transforms', () => {
    const descriptor = resolveReactylonRuntimeProp('crate_wooden', {
      position: [1, 2, 3],
      scale: 2,
      materialOverrides: {
        wood_oak: createMaterialVariant('wood_oak', {
          id: 'reactylon_showcase_wood',
          baseColor: '#c48a42',
        }),
      },
    });
    const woodSlot = Object.values(descriptor.materialSlots).find(
      (slot) => slot.materialId === 'reactylon_showcase_wood'
    );

    expect(descriptor.kind).toBe('prop');
    expect(descriptor.nodes.length).toBeGreaterThan(0);
    expect(descriptor.position).toEqual([1, 2, 3]);
    expect(descriptor.scale).toEqual([2, 2, 2]);
    expect(descriptor.interactionActions[0]?.action).toBe('open-container');
    expect(descriptor.interactionActions[0]?.nodeIds).toHaveLength(descriptor.nodes.length);
    expect(woodSlot?.baseColor).toBe('#c48a42');
  });

  it('resolves creature runtime descriptors with bones and animation metadata', () => {
    const descriptor = resolveReactylonRuntimeCreature('otter_river', {
      transparentVolumetrics: true,
    });

    expect(descriptor.kind).toBe('creature');
    expect(descriptor.bones.length).toBeGreaterThan(0);
    expect(descriptor.animations.length).toBeGreaterThan(0);
    expect(descriptor.resolvedScale).toBeGreaterThan(0);
    expect(descriptor.scale).toEqual([1, 1, 1]);
    expect(descriptor.spawn.biomes).toContain('marsh');
    expect(Object.keys(descriptor.materialSlots).length).toBeGreaterThan(0);
  });

  it('creates native Babylon materials from runtime material descriptors', () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const prop = resolvePropComposition('crate_wooden');
    const slot = Object.values(prop.runtime.materialSlots)[0];
    const descriptor = createReactylonRuntimeMaterialDescriptor(slot);
    const material = createBabylonRuntimeMaterial(descriptor, scene);

    expect(material).toBeInstanceOf(PBRMaterial);
    expect(material.albedoColor.toHexString().toLowerCase()).toBe(
      String(MATERIALS.wood_oak.baseColor).toLowerCase()
    );
    expect(material.metadata.strataRuntimeMaterial.id).toBe(descriptor.id);

    scene.dispose();
    engine.dispose();
  });

  it('instantiates prop runtime descriptors as native Babylon meshes', () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const descriptor = resolveReactylonRuntimeProp('crate_wooden', {
      position: [1, 2, 3],
      scale: [2, 2, 2],
    });
    const instance = instantiateBabylonRuntimeProp(scene, descriptor);

    expect(instance.kind).toBe('prop');
    expect(instance.root.position.asArray()).toEqual([1, 2, 3]);
    expect(instance.root.scaling.asArray()).toEqual([2, 2, 2]);
    expect(instance.meshes).toHaveLength(descriptor.nodes.length);
    expect(Object.keys(instance.materials)).toEqual(Object.keys(descriptor.materialSlots));
    expect(instance.meshes[0]?.metadata.strataRuntimeKind).toBe('prop-node');

    instance.dispose();
    scene.dispose();
    engine.dispose();
  });

  it('supports custom Babylon mesh factories for asset-backed prop nodes', () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const descriptor = resolveReactylonRuntimeProp({
      id: 'mesh_prop',
      components: [
        {
          shape: 'mesh',
          mesh: 'assets/crate.glb',
          size: [2, 1, 1],
          position: [0, 0, 0],
          material: 'wood_oak',
        },
      ],
    });
    const instance = instantiateBabylonRuntimeProp(scene, descriptor, {
      createNodeMesh: (node, context) => {
        const mesh = MeshBuilder.CreateBox(`asset:${node.id}`, { size: 1 }, context.scene);
        mesh.metadata = { source: node.mesh };
        return mesh;
      },
    });

    expect(instance.meshes[0]?.name).toBe(`asset:${descriptor.nodes[0]?.id}`);
    expect(instance.meshes[0]?.metadata.source).toBe('assets/crate.glb');
    expect(instance.meshes[0]?.metadata.strataRuntimeMeshSource).toBe('assets/crate.glb');

    instance.dispose();
    scene.dispose();
    engine.dispose();
  });

  it('instantiates creature runtime descriptors as native Babylon meshes', () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const descriptor = resolveReactylonRuntimeCreature('otter_river');
    const instance = instantiateBabylonRuntimeCreature(scene, descriptor);

    expect(instance.kind).toBe('creature');
    expect(instance.root.metadata.strataRuntimeKind).toBe('creature');
    expect(instance.meshes).toHaveLength(descriptor.bones.length);
    expect(instance.meshes[0]?.metadata.strataRuntimeKind).toBe('creature-bone');

    instance.dispose();
    scene.dispose();
    engine.dispose();
  });
});
