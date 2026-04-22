import {
  executePropInteractionAction,
  MATERIALS,
  resolveCreatureComposition,
  resolvePropComposition,
} from '@strata-game-library/core/compose';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { createElement } from 'react';
import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { createRuntimeMaterial } from '../materials';
import {
  applyRuntimeCreaturePose,
  collectRuntimeCreatureSourceBoneNames,
  createRuntimeCreatureAnimationController,
  createRuntimeCreatureAnimationStateController,
  createRuntimeCreatureAnimationTrackNameMap,
  createRuntimeCreatureAssetRigBinding,
  createRuntimeCreaturePoseTargetMap,
  crossFadeRuntimeCreatureAnimationAction,
  playRuntimeCreatureAnimationAction,
  resolveRuntimeCreatureAnimationClipName,
  retargetRuntimeCreatureAnimationClip,
  stopRuntimeCreatureAnimationAction,
} from '../RuntimeCreatureAsset';
import { createRuntimeGeometry } from '../RuntimeGeometry';
import {
  applyRuntimePropInteractionPhysicsEffects,
  attachRuntimePropCannonPhysicsHandle,
  attachRuntimePropPhysicsHandle,
  attachRuntimePropRapierPhysicsHandle,
  createRuntimePropCannonPhysicsHandle,
  createRuntimePropObjectPhysicsAdapter,
  createRuntimePropRapierPhysicsHandle,
  getDefaultRuntimePropInteractionAction,
  RUNTIME_PROP_CANNON_BODY_TYPES,
  RUNTIME_PROP_RAPIER_BODY_TYPES,
  RuntimePropInteractionPanel,
  useRuntimePropInteractionController,
} from '../RuntimeProp';

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
    expect(compose.createRuntimeCreatureAnimationTrackNameMap).toBeTypeOf('function');
    expect(compose.retargetRuntimeCreatureAnimationClip).toBeTypeOf('function');
    expect(compose.resolveRuntimeCreatureAnimationClipName).toBeTypeOf('function');
    expect(compose.playRuntimeCreatureAnimationAction).toBeTypeOf('function');
    expect(compose.crossFadeRuntimeCreatureAnimationAction).toBeTypeOf('function');
    expect(compose.stopRuntimeCreatureAnimationAction).toBeTypeOf('function');
    expect(compose.createRuntimeCreatureAnimationController).toBeTypeOf('function');
    expect(compose.createRuntimeCreatureAnimationStateController).toBeTypeOf('function');
    expect(compose.createRuntimeCreaturePoseTargetMap).toBeTypeOf('function');
    expect(compose.applyRuntimeCreaturePose).toBeTypeOf('function');
    expect(compose.getDefaultRuntimePropInteractionAction).toBeTypeOf('function');
    expect(compose.applyRuntimePropInteractionPhysicsEffects).toBeTypeOf('function');
    expect(compose.attachRuntimePropPhysicsHandle).toBeTypeOf('function');
    expect(compose.createRuntimePropObjectPhysicsAdapter).toBeTypeOf('function');
    expect(compose.RUNTIME_PROP_CANNON_BODY_TYPES).toBeDefined();
    expect(compose.createRuntimePropCannonPhysicsHandle).toBeTypeOf('function');
    expect(compose.attachRuntimePropCannonPhysicsHandle).toBeTypeOf('function');
    expect(compose.RUNTIME_PROP_RAPIER_BODY_TYPES).toBeDefined();
    expect(compose.createRuntimePropRapierPhysicsHandle).toBeTypeOf('function');
    expect(compose.attachRuntimePropRapierPhysicsHandle).toBeTypeOf('function');
    expect(compose.RuntimePropInteractionPanel).toBeTypeOf('function');
    expect(compose.useRuntimePropInteractionController).toBeTypeOf('function');
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
    expect(material.userData.strataMaterialProceduralBakePlan.targets[0]).toMatchObject({
      channel: 'baseColor',
      map: 'diffuse',
      colorSpace: 'srgb',
    });
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

  it('applies R3F prop physics interaction effects to runtime objects', () => {
    const prop = resolvePropComposition({
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
    const node = prop.runtime.nodes[0];

    if (!node) {
      throw new Error('Expected door_oak to resolve at least one runtime node');
    }

    const root = new THREE.Group();
    const mesh = new THREE.Mesh();
    const setMode = vi.fn();

    mesh.userData.runtimeNode = node;
    root.add(mesh);

    const result = executePropInteractionAction(prop.runtime, 'door_oak:interaction:door');
    const applications = applyRuntimePropInteractionPhysicsEffects(root, prop.runtime, result, {
      adapter: { setMode },
    });

    expect(applications).toHaveLength(1);
    expect(mesh.userData.strataRuntimePhysicsState).toMatchObject({
      mode: 'kinematic',
      lastOperation: 'set-mode',
    });
    expect(setMode).toHaveBeenCalledWith(
      expect.objectContaining({
        object: mesh,
        node,
        effect: expect.objectContaining({ operation: 'set-mode', mode: 'kinematic' }),
      })
    );
  });

  it('applies R3F prop physics effects through object physics handles', () => {
    const prop = resolvePropComposition({
      id: 'key_garden',
      name: 'Garden Key',
      components: [
        {
          shape: 'box',
          size: [0.1, 0.02, 0.24],
          position: [0, 0, 0],
          material: 'metal_iron',
        },
      ],
      interaction: { type: 'collectible', contents: ['garden-key'] },
    });
    const node = prop.runtime.nodes[0];

    if (!node) {
      throw new Error('Expected key_garden to resolve at least one runtime node');
    }

    const root = new THREE.Group();
    const mesh = new THREE.Mesh();
    const setColliderEnabled = vi.fn();
    const wakeBody = vi.fn();

    mesh.userData.runtimeNode = node;
    attachRuntimePropPhysicsHandle(mesh, { setColliderEnabled, wakeBody });
    root.add(mesh);

    const result = executePropInteractionAction(prop.runtime, 'key_garden:interaction:collectible');
    const applications = applyRuntimePropInteractionPhysicsEffects(root, prop.runtime, result, {
      adapter: createRuntimePropObjectPhysicsAdapter(),
    });

    expect(applications).toHaveLength(1);
    expect(mesh.userData.strataRuntimePhysicsState).toMatchObject({
      colliderEnabled: false,
      lastOperation: 'disable-collider',
    });
    expect(setColliderEnabled).toHaveBeenCalledWith(
      false,
      expect.objectContaining({
        object: mesh,
        node,
        effect: expect.objectContaining({ operation: 'disable-collider' }),
      })
    );
    expect(wakeBody).not.toHaveBeenCalled();
  });

  it('adapts R3F prop physics effects to Rapier body and collider handles', () => {
    const door = resolvePropComposition({
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
    const doorNode = door.runtime.nodes[0];

    if (!doorNode) {
      throw new Error('Expected door_oak to resolve at least one runtime node');
    }

    const doorRoot = new THREE.Group();
    const doorMesh = new THREE.Mesh();
    const setBodyType = vi.fn();
    const wakeUp = vi.fn();

    doorMesh.userData.runtimeNode = doorNode;
    attachRuntimePropRapierPhysicsHandle(doorMesh, { body: { setBodyType, wakeUp } });
    doorRoot.add(doorMesh);

    applyRuntimePropInteractionPhysicsEffects(
      doorRoot,
      door.runtime,
      executePropInteractionAction(door.runtime, 'door_oak:interaction:door'),
      { adapter: createRuntimePropObjectPhysicsAdapter() }
    );

    expect(setBodyType).toHaveBeenCalledWith(RUNTIME_PROP_RAPIER_BODY_TYPES.kinematic, true);
    expect(wakeUp).not.toHaveBeenCalled();

    const key = resolvePropComposition({
      id: 'rapier_key',
      name: 'Rapier Key',
      components: [
        {
          shape: 'box',
          size: [0.1, 0.02, 0.24],
          position: [0, 0, 0],
          material: 'metal_iron',
        },
      ],
      interaction: { type: 'collectible', contents: ['rapier-key'] },
    });
    const keyNode = key.runtime.nodes[0];

    if (!keyNode) {
      throw new Error('Expected rapier_key to resolve at least one runtime node');
    }

    const keyRoot = new THREE.Group();
    const keyMesh = new THREE.Mesh();
    const setBodyEnabled = vi.fn();
    const setColliderEnabled = vi.fn();
    const handle = createRuntimePropRapierPhysicsHandle({
      body: { setEnabled: setBodyEnabled },
      colliders: [{ setEnabled: setColliderEnabled }],
      disableBodyWhenColliderDisabled: true,
    });

    keyMesh.userData.runtimeNode = keyNode;
    attachRuntimePropPhysicsHandle(keyMesh, handle);
    keyRoot.add(keyMesh);

    applyRuntimePropInteractionPhysicsEffects(
      keyRoot,
      key.runtime,
      executePropInteractionAction(key.runtime, 'rapier_key:interaction:collectible'),
      { adapter: createRuntimePropObjectPhysicsAdapter() }
    );

    expect(setColliderEnabled).toHaveBeenCalledWith(false);
    expect(setBodyEnabled).toHaveBeenCalledWith(false);
  });

  it('adapts R3F prop physics effects to Cannon body handles', () => {
    const door = resolvePropComposition({
      id: 'cannon_door',
      name: 'Cannon Door',
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
    const doorNode = door.runtime.nodes[0];

    if (!doorNode) {
      throw new Error('Expected cannon_door to resolve at least one runtime node');
    }

    const doorRoot = new THREE.Group();
    const doorMesh = new THREE.Mesh();
    const wakeUp = vi.fn();
    const body = { type: RUNTIME_PROP_CANNON_BODY_TYPES.dynamic, wakeUp };

    doorMesh.userData.runtimeNode = doorNode;
    attachRuntimePropCannonPhysicsHandle(doorMesh, { body });
    doorRoot.add(doorMesh);

    applyRuntimePropInteractionPhysicsEffects(
      doorRoot,
      door.runtime,
      executePropInteractionAction(door.runtime, 'cannon_door:interaction:door'),
      { adapter: createRuntimePropObjectPhysicsAdapter() }
    );

    expect(body.type).toBe(RUNTIME_PROP_CANNON_BODY_TYPES.kinematic);
    expect(wakeUp).toHaveBeenCalledTimes(1);

    const key = resolvePropComposition({
      id: 'cannon_key',
      name: 'Cannon Key',
      components: [
        {
          shape: 'box',
          size: [0.1, 0.02, 0.24],
          position: [0, 0, 0],
          material: 'metal_iron',
        },
      ],
      interaction: { type: 'collectible', contents: ['cannon-key'] },
    });
    const keyNode = key.runtime.nodes[0];

    if (!keyNode) {
      throw new Error('Expected cannon_key to resolve at least one runtime node');
    }

    const keyRoot = new THREE.Group();
    const keyMesh = new THREE.Mesh();
    const keyBody = { collisionFilterMask: 0xffff };
    const handle = createRuntimePropCannonPhysicsHandle({ body: keyBody });

    keyMesh.userData.runtimeNode = keyNode;
    attachRuntimePropPhysicsHandle(keyMesh, handle);
    keyRoot.add(keyMesh);

    applyRuntimePropInteractionPhysicsEffects(
      keyRoot,
      key.runtime,
      executePropInteractionAction(key.runtime, 'cannon_key:interaction:collectible'),
      { adapter: createRuntimePropObjectPhysicsAdapter() }
    );

    expect(keyBody.collisionFilterMask).toBe(0);
  });

  it('manages R3F runtime prop interaction state with a hook', () => {
    const prop = resolvePropComposition('crate_wooden');
    const { result } = renderHook(() => useRuntimePropInteractionController(prop.runtime));

    expect(result.current.runtime.id).toBe('crate_wooden');
    expect(result.current.state.open).toBeUndefined();

    act(() => {
      const interaction = result.current.execute('crate_wooden:interaction:container');

      expect(interaction.nextState.open).toBe(true);
    });

    expect(result.current.state.open).toBe(true);

    act(() => {
      const resetState = result.current.reset();

      expect(resetState.open).toBeUndefined();
    });

    expect(result.current.state.open).toBeUndefined();
  });

  it('renders a prefabbed R3F prop interaction panel', () => {
    const prop = resolvePropComposition('crate_wooden');
    const onInteraction = vi.fn();
    const onStateChange = vi.fn();

    render(
      createElement(RuntimePropInteractionPanel, {
        prop: prop.runtime,
        onInteraction,
        onStateChange,
      })
    );

    expect(screen.getByText('Wooden Crate')).toBeDefined();
    expect(screen.getByText('Idle')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /Open Wooden Crate/i }));

    expect(onInteraction).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'executed' }),
      expect.objectContaining({
        runtime: prop.runtime,
        state: expect.objectContaining({ open: true }),
      })
    );
    expect(screen.getByText('Open: yes')).toBeDefined();
    expect(screen.getByText('Executed Open Wooden Crate')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /Reset interactions/i }));

    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({ runtime: prop.runtime, state: expect.objectContaining({}) })
    );
    expect(screen.getByText('Idle')).toBeDefined();
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

  it('retargets R3F creature animation tracks through rig bindings', () => {
    const creature = resolveCreatureComposition('otter_river', {
      assets: {
        model: '/models/otter.glb',
        boneMap: {
          spine_mid: 'Spine',
          head: 'Head',
        },
      },
    });
    const binding = createRuntimeCreatureAssetRigBinding(creature.runtime, ['Spine', 'Head']);
    const clip = new THREE.AnimationClip('Idle', 1, [
      new THREE.VectorKeyframeTrack(
        'otter_river:bone:spine_mid.position',
        [0, 1],
        [0, 0, 0, 1, 1, 1]
      ),
      new THREE.QuaternionKeyframeTrack('head.quaternion', [0, 1], [0, 0, 0, 1, 0, 0, 0, 1]),
      new THREE.NumberKeyframeTrack('Tail.scale[x]', [0, 1], [1, 1]),
    ]);

    const targetMap = createRuntimeCreatureAnimationTrackNameMap(binding);
    const retargeted = retargetRuntimeCreatureAnimationClip(clip, binding);

    expect(targetMap.get('otter_river:bone:spine_mid')).toBe('Spine');
    expect(targetMap.get('head')).toBe('Head');
    expect(retargeted.name).toBe('Idle');
    expect(retargeted.tracks.map((track) => track.name)).toEqual([
      'Spine.position',
      'Head.quaternion',
      'Tail.scale[x]',
    ]);
    expect(retargeted.userData.strataRuntimeRetarget).toMatchObject({
      direction: 'runtime-to-source',
      renamedTracks: 2,
      preservedTracks: 1,
    });

    const sourceClip = new THREE.AnimationClip('AssetIdle', 1, [
      new THREE.VectorKeyframeTrack('Armature/Spine.position', [0, 1], [0, 0, 0, 1, 1, 1]),
      new THREE.QuaternionKeyframeTrack(
        '.bones[Head].quaternion',
        [0, 1],
        [0, 0, 0, 1, 0, 0, 0, 1]
      ),
    ]);
    const runtimeClip = retargetRuntimeCreatureAnimationClip(sourceClip, binding, {
      direction: 'source-to-runtime',
    });

    expect(runtimeClip.tracks.map((track) => track.name)).toEqual([
      'Armature/otter_river:bone:spine_mid.position',
      '.bones[otter_river:bone:head].quaternion',
    ]);
  });

  it('controls R3F creature animation actions through logical clip aliases', () => {
    const creature = resolveCreatureComposition('otter_river', {
      assets: {
        model: '/models/otter.glb',
        animationClips: {
          idle: 'Idle',
          leap: 'Jump',
        },
      },
    });
    const mixer = new THREE.AnimationMixer(new THREE.Group());
    const idleAction = mixer.clipAction(new THREE.AnimationClip('Idle', 1, []));
    const jumpAction = mixer.clipAction(new THREE.AnimationClip('Jump', 1, []));
    const actions = {
      Idle: idleAction,
      Jump: jumpAction,
    };

    const played = playRuntimeCreatureAnimationAction(actions, creature.runtime, 'idle', {
      clampWhenFinished: true,
      fadeInDuration: 0,
      loop: false,
      timeScale: 1.5,
    });
    const controller = createRuntimeCreatureAnimationController(creature.runtime, actions);
    const crossFadeFrom = vi.spyOn(idleAction, 'crossFadeFrom');

    expect(resolveRuntimeCreatureAnimationClipName(creature.runtime, 'idle')).toBe('Idle');
    expect(played).toBe(idleAction);
    expect(idleAction.clampWhenFinished).toBe(true);
    expect(idleAction.enabled).toBe(true);
    expect(idleAction.timeScale).toBe(1.5);
    expect(controller.getAction('leap')).toBe(jumpAction);
    expect(controller.play('leap', { reset: false })).toBe(jumpAction);
    expect(controller.current).toBe(jumpAction);
    expect(controller.crossFade('idle', { duration: 0.35, warp: true })).toBe(idleAction);
    expect(crossFadeFrom).toHaveBeenCalledWith(jumpAction, 0.35, true);
    expect(controller.stop('leap')).toBe(true);
    expect(controller.current).toBe(idleAction);
    expect(controller.stop('missing')).toBe(false);
    expect(
      crossFadeRuntimeCreatureAnimationAction(actions, creature.runtime, 'leap', {
        from: 'idle',
      })
    ).toBe(jumpAction);

    controller.play('idle');
    controller.play('leap');
    controller.stopAll();

    expect(controller.current).toBeUndefined();
    expect(stopRuntimeCreatureAnimationAction(idleAction)).toBe(idleAction);

    const stateController = createRuntimeCreatureAnimationStateController(controller, {
      calm: {
        animation: 'idle',
        playback: { loop: true },
      },
      leap: {
        animation: 'leap',
        transition: { duration: 0.4, warp: true },
      },
    });
    const jumpCrossFadeFrom = vi.spyOn(jumpAction, 'crossFadeFrom');

    expect(stateController.getState('calm')?.animation).toBe('idle');
    expect(stateController.enter('calm')).toBe(idleAction);
    expect(stateController.currentState).toBe('calm');
    expect(stateController.enter('leap')).toBe(jumpAction);
    expect(jumpCrossFadeFrom).toHaveBeenCalledWith(idleAction, 0.4, true);
    expect(stateController.currentState).toBe('leap');
    expect(stateController.enter('missing')).toBeUndefined();
    expect(stateController.currentState).toBe('leap');

    const guardedController = createRuntimeCreatureAnimationController(creature.runtime, actions);
    const guardedStates = createRuntimeCreatureAnimationStateController(guardedController, {
      calm: { animation: 'idle' },
      lockedLeap: {
        animation: 'leap',
        guard: ({ currentState, nextState, definition }) =>
          currentState === 'calm' && nextState === 'lockedLeap' && definition.animation === 'leap',
      },
    });

    expect(guardedStates.canEnter('missing')).toBe(false);
    expect(guardedStates.canEnter('lockedLeap')).toBe(false);
    expect(guardedStates.enter('lockedLeap')).toBeUndefined();
    expect(guardedStates.enter('calm')).toBe(idleAction);
    expect(guardedStates.canEnter('lockedLeap')).toBe(true);
    expect(guardedStates.enter('lockedLeap', { mode: 'play' })).toBe(jumpAction);
  });

  it('applies R3F creature poses through rig binding aliases', () => {
    const creature = resolveCreatureComposition('otter_river', {
      assets: {
        model: '/models/otter.glb',
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
    const targets = createRuntimeCreaturePoseTargetMap(rig, binding);
    const applications = applyRuntimeCreaturePose(rig, binding, {
      spine_mid: { position: [1, 2, 3] },
      head: { rotation: [0, 0, 0, 1], scale: 1.5 },
    });

    expect(targets.get('otter_river:bone:spine_mid')).toBe(spine);
    expect(targets.get('spine_mid')).toBe(spine);
    expect(targets.get('Spine')).toBe(spine);
    expect(applications).toHaveLength(2);
    expect(spine.position.toArray()).toEqual([1, 2, 3]);
    expect(head.quaternion.toArray()).toEqual([0, 0, 0, 1]);
    expect(head.scale.toArray()).toEqual([1.5, 1.5, 1.5]);
    expect(applications.map((application) => application.applied)).toEqual([
      ['position'],
      ['rotation', 'scale'],
    ]);
  });
});
