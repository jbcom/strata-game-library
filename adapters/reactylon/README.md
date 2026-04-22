# @strata-game-library/reactylon

Babylon.js and Reactylon adapter for Strata runtime plans.

This package exposes marker React components for Reactylon scenes and direct Babylon helpers for teams that want to own their `Scene`, loaders, physics, and animation systems.

## Direct Babylon Runtime Composition

```ts
import type { Scene } from '@babylonjs/core';
import { resolveCreatureComposition } from 'strata-game-library/compose';
import {
  instantiateBabylonRuntimeCreatureAsset,
  resolveReactylonRuntimeCreature,
} from 'strata-game-library/reactylon';

export async function spawnOtter(scene: Scene) {
  const creature = resolveCreatureComposition('otter_river', {
    assets: {
      model: '/models/otter.glb',
      animationClips: {
        idle: 'Idle',
        walk: 'Walk',
      },
      boneMap: {
        spine_mid: 'Spine',
        head: 'Head',
        leg_front_l: 'LegFrontL',
      },
    },
  });
  const descriptor = resolveReactylonRuntimeCreature(creature);
  const instance = await instantiateBabylonRuntimeCreatureAsset(scene, descriptor, {
    animation: 'idle',
  });

  const graph = instance.createAnimationGraphController({
    guards: {
      canMove: () => true,
    },
  });
  graph.enter('idle');
  graph.trigger('move');

  const frontLeg = descriptor.ikRig.ready.find((chain) => chain.targetBoneId === 'leg_front_l');
  const base = frontLeg?.bones[0]?.position;

  if (frontLeg && base) {
    instance.applyIKPose({
      [frontLeg.id]: [base[0] + 0.1, base[1] - 0.15, base[2]],
    });
  }

  return instance;
}
```

## Public Helpers

- `StrataRuntimeProp` and `StrataRuntimeCreature` produce serializable descriptors for Reactylon-owned scenes.
- `resolveReactylonRuntimeProp()` and `resolveReactylonRuntimeCreature()` convert core composition results into Babylon-friendly descriptors.
- `createBabylonRuntimeMaterial()` converts runtime material slots into Babylon PBR materials and attaches Strata procedural material metadata when present.
- `instantiateBabylonRuntimeProp()` and `instantiateBabylonRuntimePropAsync()` instantiate primitive or asset-backed prop nodes with interaction and physics-effect metadata.
- `instantiateBabylonRuntimeCreature()` and `instantiateBabylonRuntimeCreatureAsset()` instantiate primitive or asset-backed creatures with core animation graph, IK rig, rig binding, and material metadata.
- `createBabylonRuntimeCreatureAnimationGraphController()` drives Babylon `AnimationGroup`s from core animation graph events with logical clip resolution and named transition/state guards.
- `applyBabylonRuntimeCreatureIKPose()` applies core IK target plans to primitive creature meshes or loaded Babylon skeleton bones by runtime bone id, logical bone id, or source rig bone name.
