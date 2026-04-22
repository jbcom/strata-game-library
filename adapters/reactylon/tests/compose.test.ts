import {
  AnimationGroup,
  Bone,
  Matrix,
  MeshBuilder,
  NullEngine,
  PBRMaterial,
  PhysicsMotionType,
  Scene,
  Skeleton,
  Space,
} from '@babylonjs/core';
import {
  createMaterialVariant,
  MATERIALS,
  resolveCreatureComposition,
  resolvePropComposition,
} from '@strata-game-library/core/compose';
import { describe, expect, it, vi } from 'vitest';
import {
  applyBabylonPropInteractionPhysicsEffects,
  applyBabylonRuntimeCreatureIKPose,
  BABYLON_RUNTIME_PROCEDURAL_PLUGIN_NAME,
  createBabylonRuntimeMaterial,
  createReactylonRuntimeMaterialDescriptor,
  getBabylonRuntimeProceduralMaterialPlugin,
  instantiateBabylonRuntimeCreature,
  instantiateBabylonRuntimeCreatureAsset,
  instantiateBabylonRuntimeProp,
  instantiateBabylonRuntimePropAsync,
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
    expect(descriptor.traits?.[0]?.type).toBe('grain');
    expect(descriptor.procedural?.layers[0]?.algorithm).toBe('directional-noise');
    expect(descriptor.procedural?.shaderChunk).toContain('strataProceduralNoise');
    expect(descriptor.proceduralBake?.targets[0]).toMatchObject({
      channel: 'baseColor',
      map: 'diffuse',
      colorSpace: 'srgb',
    });
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
    const descriptor = resolveReactylonRuntimeCreature(
      resolveCreatureComposition('otter_river', {
        assets: {
          model: '/models/otter.glb',
          animationClips: { idle: 'Idle' },
          boneMap: {
            spine_mid: 'Spine',
            head: 'Head',
          },
        },
      }),
      {
        transparentVolumetrics: true,
      }
    );

    expect(descriptor.kind).toBe('creature');
    expect(descriptor.bones.length).toBeGreaterThan(0);
    expect(descriptor.animations.length).toBeGreaterThan(0);
    expect(descriptor.animationGraph.initialState).toBe('idle');
    expect(descriptor.animationGraph.blendGroups[0]).toMatchObject({
      id: 'locomotion',
      states: ['walk', 'run', 'swim'],
    });
    expect(descriptor.ikRig.coverage.ready).toBe(descriptor.ikRig.coverage.total);
    expect(descriptor.ikRig.chains[0]).toMatchObject({
      solver: 'single-bone',
      status: 'ready',
    });
    expect(descriptor.asset?.model).toBe('/models/otter.glb');
    expect(descriptor.asset?.animationClips.idle).toBe('Idle');
    expect(
      descriptor.rigBinding.bindings.find((binding) => binding.boneId === 'spine_mid')
    ).toMatchObject({
      sourceBone: 'Spine',
      explicit: true,
      status: 'unverified',
    });
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
    expect(material.metadata.strataMaterialProceduralPlan).toBe(descriptor.procedural);
    expect(material.metadata.strataMaterialProceduralBakePlan).toBe(descriptor.proceduralBake);
    expect(material.metadata.strataBabylonProceduralPlugin).toBe(
      BABYLON_RUNTIME_PROCEDURAL_PLUGIN_NAME
    );

    const plugin = getBabylonRuntimeProceduralMaterialPlugin(material);
    const customCode = plugin?.getCustomCode('fragment');

    expect(plugin?.plan).toBe(descriptor.procedural);
    expect(plugin?.getUniforms().fragment).toContain('_scale');
    expect(customCode?.CUSTOM_FRAGMENT_DEFINITIONS).toContain('strataProceduralNoise');
    expect(customCode?.CUSTOM_FRAGMENT_UPDATE_ALBEDO).toContain('surfaceAlbedo');
    expect(customCode?.CUSTOM_FRAGMENT_UPDATE_METALLICROUGHNESS).toContain('metallicRoughness.g');

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
    expect(instance.root.metadata.strataRuntimeInteractionActions[0]?.id).toBe(
      'crate_wooden:interaction:container'
    );
    expect(instance.meshes[0]?.metadata.strataRuntimeKind).toBe('prop-node');
    expect(instance.meshes[0]?.metadata.strataRuntimeInteractionActions[0]?.action).toBe(
      'open-container'
    );
    const interaction = instance.executeInteraction('crate_wooden:interaction:container');

    expect(interaction.nextState.open).toBe(true);
    expect(instance.interactionState.open).toBe(true);
    expect(instance.root.metadata.strataRuntimeInteractionState.open).toBe(true);
    expect(instance.meshes[0]?.metadata.strataRuntimeInteractionState.open).toBe(true);
    expect(instance.resetInteractionState().open).toBeUndefined();

    instance.dispose();
    scene.dispose();
    engine.dispose();
  });

  it('applies native Babylon prop physics interaction effects', () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const descriptor = resolveReactylonRuntimeProp({
      id: 'door_oak',
      name: 'Oak Door',
      components: [
        {
          shape: 'box',
          size: [1, 2, 0.2],
          position: [0, 0, 0],
          material: 'wood_oak',
        },
      ],
      interaction: { type: 'door' },
    });
    const instance = instantiateBabylonRuntimeProp(scene, descriptor);
    const setMotionType = vi.fn();
    const mesh = instance.meshes[0];

    if (!mesh) {
      throw new Error('Expected door_oak to instantiate at least one mesh');
    }

    Object.defineProperty(mesh, 'physicsBody', {
      configurable: true,
      value: { setMotionType },
    });

    const result = instance.executeInteraction('door_oak:interaction:door');

    expect(setMotionType).toHaveBeenCalledWith(PhysicsMotionType.ANIMATED);
    expect(result.effects).toContainEqual({
      type: 'physics',
      operation: 'set-mode',
      nodeIds: descriptor.nodes.map((node) => node.id),
      mode: 'kinematic',
    });
    expect(mesh.metadata.strataRuntimePhysicsState).toMatchObject({
      mode: 'kinematic',
      lastOperation: 'set-mode',
    });
    expect(
      instance.root.metadata.strataRuntimePhysicsStateByNode[descriptor.nodes[0]?.id ?? '']
    ).toMatchObject({
      mode: 'kinematic',
    });
    expect(applyBabylonPropInteractionPhysicsEffects).toBeTypeOf('function');

    instance.dispose();
    scene.dispose();
    engine.dispose();
  });

  it('toggles Babylon mesh collisions for collectible prop effects', () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const descriptor = resolveReactylonRuntimeProp({
      id: 'coin_gold',
      name: 'Gold Coin',
      components: [
        {
          shape: 'sphere',
          size: [0.25, 0.25, 0.25],
          position: [0, 0, 0],
          material: 'metal_gold',
        },
      ],
      interaction: { type: 'collectible' },
    });
    const instance = instantiateBabylonRuntimeProp(scene, descriptor);
    const mesh = instance.meshes[0];

    if (!mesh) {
      throw new Error('Expected coin_gold to instantiate at least one mesh');
    }

    mesh.checkCollisions = true;
    mesh.isPickable = true;

    instance.executeInteraction('coin_gold:interaction:collectible');

    expect(mesh.checkCollisions).toBe(false);
    expect(mesh.isPickable).toBe(false);
    expect(mesh.metadata.strataRuntimePhysicsState).toMatchObject({
      colliderEnabled: false,
      lastOperation: 'disable-collider',
    });

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

  it('loads asset-backed prop nodes through the async Babylon asset pipeline', async () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const descriptor = resolveReactylonRuntimeProp({
      id: 'async_mesh_prop',
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
    const instance = await instantiateBabylonRuntimePropAsync(scene, descriptor, {
      assetLoader: async (source, context) => {
        expect(source).toBe('assets/crate.glb');
        expect(context.kind).toBe('prop-node');
        return [
          MeshBuilder.CreateBox(`loaded:${context.propNode?.id}`, { size: 1 }, context.scene),
        ];
      },
    });
    const loaded = instance.meshes[0];

    expect(loaded?.name).toBe(`loaded:${descriptor.nodes[0]?.id}`);
    expect(loaded?.parent?.name).toBe(`${descriptor.nodes[0]?.id}:asset`);
    expect(loaded?.metadata.strataRuntimeMeshSource).toBe('assets/crate.glb');
    expect(loaded?.material).toBe(instance.materials[descriptor.nodes[0]?.materialSlot ?? '']);

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
    expect(instance.root.metadata.strataRuntimeAnimationGraph).toBe(descriptor.animationGraph);
    expect(instance.root.metadata.strataRuntimeIKRig).toBe(descriptor.ikRig);
    expect(instance.meshes).toHaveLength(descriptor.bones.length);
    expect(instance.skeletons).toEqual([]);
    expect(instance.animationGroups).toEqual([]);
    expect(instance.rigBinding.unverified).toHaveLength(descriptor.bones.length);
    expect(instance.playAnimation('idle')).toBe(false);
    expect(instance.meshes[0]?.metadata.strataRuntimeKind).toBe('creature-bone');
    expect(instance.meshes[0]?.metadata.strataRuntimeRigBoneBinding).toMatchObject({
      boneId: descriptor.bones[0]?.boneId,
      status: 'unverified',
    });

    instance.dispose();
    scene.dispose();
    engine.dispose();
  });

  it('applies core IK target poses to native Babylon creature meshes', () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const descriptor = resolveReactylonRuntimeCreature('otter_river');
    const instance = instantiateBabylonRuntimeCreature(scene, descriptor);
    const chain = descriptor.ikRig.ready[0];

    if (!chain) {
      throw new Error('Expected otter_river to provide at least one ready IK chain');
    }

    const base = chain.bones[0]?.position;

    if (!base) {
      throw new Error('Expected ready IK chain to include at least one bone');
    }

    const result = instance.applyIKPose({
      [chain.id]: [base[0] + 0.01, base[1], base[2]],
    });
    const application = result.applications[0];

    if (!application) {
      throw new Error('Expected IK pose to apply to at least one Babylon target');
    }

    expect(result.pose.chains[0]?.chain.id).toBe(chain.id);
    expect(application.binding?.runtimeBoneId).toBe(application.key);

    if (application.target instanceof Bone) {
      throw new Error('Expected primitive creature IK pose to target a Babylon mesh');
    }

    expect(application.target.position.asArray()).toEqual(application.position);
    expect(instance.root.metadata.strataRuntimeIKPose).toBe(result.pose);
    expect(instance.root.metadata.strataRuntimeIKPoseApplications[0]).toMatchObject({
      key: application.key,
      position: application.position,
    });
    expect(applyBabylonRuntimeCreatureIKPose).toBeTypeOf('function');

    instance.dispose();
    scene.dispose();
    engine.dispose();
  });

  it('loads asset-backed creatures through the async Babylon asset pipeline', async () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const animationGroup = new AnimationGroup('Idle', scene);
    const skeleton = new Skeleton('OtterRig', 'otter-rig', scene);
    new Bone('Spine', skeleton, null, Matrix.Identity());
    new Bone('Head', skeleton, null, Matrix.Identity());
    const frontLeg = new Bone('LegFrontL', skeleton, null, Matrix.Identity());
    const start = vi.spyOn(animationGroup, 'start');
    const descriptor = resolveReactylonRuntimeCreature(
      resolveCreatureComposition('otter_river', {
        assets: {
          model: '/models/otter.glb',
          animationClips: { idle: 'Idle' },
          boneMap: {
            spine_mid: 'Spine',
            head: 'Head',
            leg_front_l: 'LegFrontL',
          },
        },
      })
    );
    const instance = await instantiateBabylonRuntimeCreatureAsset(scene, descriptor, {
      animation: 'idle',
      assetLoader: async (source, context) => {
        expect(source).toBe('/models/otter.glb');
        expect(context.kind).toBe('creature-asset');
        return {
          meshes: [MeshBuilder.CreateBox('loaded:otter', { size: 1 }, context.scene)],
          animationGroups: [animationGroup],
          skeletons: [skeleton],
        };
      },
    });
    const loaded = instance.meshes[0];

    expect(loaded?.name).toBe('loaded:otter');
    expect(loaded?.parent).toBe(instance.root);
    expect(loaded?.metadata.strataRuntimeAssetModel).toBe('/models/otter.glb');
    expect(loaded?.metadata.strataRuntimeAnimation).toBe('Idle');
    expect(loaded?.metadata.strataRuntimeAnimationGraph).toBe(descriptor.animationGraph);
    expect(loaded?.metadata.strataRuntimeIKRig).toBe(descriptor.ikRig);
    expect(loaded?.metadata.strataRuntimeKind).toBe('creature-asset');
    expect(loaded?.metadata.strataRuntimeRigBinding).toBe(instance.rigBinding);
    expect(instance.root.metadata.strataRuntimeRigBinding).toBe(instance.rigBinding);
    expect(instance.skeletons).toEqual([skeleton]);
    expect(instance.animationGroups).toEqual([animationGroup]);
    expect(
      instance.rigBinding.bindings.find((binding) => binding.boneId === 'spine_mid')
    ).toMatchObject({
      sourceBone: 'Spine',
      explicit: true,
      status: 'matched',
    });
    expect(instance.rigBinding.bindings.find((binding) => binding.boneId === 'head')).toMatchObject(
      {
        sourceBone: 'Head',
        explicit: true,
        status: 'matched',
      }
    );
    expect(start).toHaveBeenCalledWith(true);
    expect(instance.playAnimation('idle', false)).toBe(true);
    expect(start).toHaveBeenCalledWith(false);

    const ikChain = descriptor.ikRig.ready.find((chain) => chain.targetBoneId === 'leg_front_l');

    if (!ikChain) {
      throw new Error('Expected otter_river to expose a front-left leg IK chain');
    }

    const base = ikChain.bones[0]?.position;

    if (!base) {
      throw new Error('Expected front-left leg IK chain to include a bone');
    }

    const ikPose = instance.applyIKPose({
      [ikChain.id]: [base[0] + 0.01, base[1], base[2]],
    });
    const frontLegApplication = ikPose.applications.find(
      (application) => application.binding?.boneId === 'leg_front_l'
    );

    expect(frontLegApplication?.target).toBe(frontLeg);

    const frontLegPosition = frontLeg.getPosition(Space.LOCAL).asArray();
    expect(frontLegPosition[0]).toBeCloseTo(frontLegApplication?.position[0] ?? 0);
    expect(frontLegPosition[1]).toBeCloseTo(frontLegApplication?.position[1] ?? 0);
    expect(frontLegPosition[2]).toBeCloseTo(frontLegApplication?.position[2] ?? 0);

    instance.dispose();
    scene.dispose();
    engine.dispose();
  });
});
