import { useAnimations, useGLTF } from '@react-three/drei';
import {
  type CreatureRuntimeAssembly,
  type CreatureRuntimeRigBindingPlan,
  createCreatureRigBindingPlan,
} from '@strata-game-library/core/compose';
import { useEffect, useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { AnimationClip } from 'three';
import type {
  RuntimeCreatureAnimationRetargetDirection,
  RuntimeCreatureAnimationRetargetMetadata,
  RuntimeCreatureAnimationRetargetOptions,
  RuntimeCreaturePose,
  RuntimeCreaturePoseApplication,
  RuntimeCreaturePoseOptions,
  RuntimeCreaturePoseQuaternion,
  RuntimeCreaturePoseScale,
  RuntimeCreaturePoseVector,
} from './types';

export interface RuntimeCreatureAssetProps {
  creature: CreatureRuntimeAssembly;
  animation?: string;
  retargetAnimation?: boolean | RuntimeCreatureAnimationRetargetOptions;
  castShadow?: boolean;
  receiveShadow?: boolean;
  onRigBinding?: (plan: CreatureRuntimeRigBindingPlan) => void;
}

interface RuntimeCreatureAssetModelProps extends RuntimeCreatureAssetProps {
  model: string;
}

interface RuntimeCreatureGltf {
  scene: THREE.Object3D;
  animations?: THREE.AnimationClip[];
}

function isMesh(object: THREE.Object3D): object is THREE.Mesh {
  return 'isMesh' in object && object.isMesh === true;
}

function isBone(object: THREE.Object3D): object is THREE.Bone {
  return 'isBone' in object && object.isBone === true;
}

function isSourceBoneList(source: THREE.Object3D | readonly string[]): source is readonly string[] {
  return Array.isArray(source);
}

function normalizeRetargetOptions(
  options: boolean | RuntimeCreatureAnimationRetargetOptions | undefined
): RuntimeCreatureAnimationRetargetOptions {
  return typeof options === 'object' ? options : {};
}

function shouldUseRigBinding(binding: CreatureRuntimeRigBindingPlan['bindings'][number]) {
  return binding.status !== 'missing';
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceTrackNameTarget(trackName: string, targetMap: Map<string, string>): string {
  let retargeted = trackName;
  const sortedTargets = [...targetMap.entries()]
    .filter(([from, to]) => from !== to)
    .sort(([left], [right]) => right.length - left.length);

  for (const [from, to] of sortedTargets) {
    retargeted = retargeted.replace(
      new RegExp(`(^|[./\\[:])${escapeRegExp(from)}(?=([.\\]/]|$))`, 'g'),
      `$1${to}`
    );
  }

  return retargeted;
}

export function collectRuntimeCreatureSourceBoneNames(scene: THREE.Object3D): string[] {
  const names = new Set<string>();

  scene.traverse((object) => {
    if (isBone(object)) {
      names.add(object.name);
    }
  });

  return [...names];
}

export function createRuntimeCreatureAssetRigBinding(
  creature: CreatureRuntimeAssembly,
  source: THREE.Object3D | readonly string[]
): CreatureRuntimeRigBindingPlan {
  const sourceBoneNames = isSourceBoneList(source)
    ? source
    : collectRuntimeCreatureSourceBoneNames(source);

  return createCreatureRigBindingPlan(creature, sourceBoneNames);
}

export function createRuntimeCreatureAnimationTrackNameMap(
  rigBinding: CreatureRuntimeRigBindingPlan,
  options: RuntimeCreatureAnimationRetargetOptions = {}
): Map<string, string> {
  const direction: RuntimeCreatureAnimationRetargetDirection =
    options.direction ?? 'runtime-to-source';
  const includeUnverified = options.includeUnverified ?? true;
  const targetMap = new Map<string, string>();

  for (const binding of rigBinding.bindings) {
    if (!shouldUseRigBinding(binding)) {
      continue;
    }

    if (binding.status === 'unverified' && !includeUnverified) {
      continue;
    }

    if (direction === 'runtime-to-source') {
      targetMap.set(binding.runtimeBoneId, binding.sourceBone);
      targetMap.set(binding.boneId, binding.sourceBone);
    } else {
      targetMap.set(binding.sourceBone, binding.runtimeBoneId);
    }
  }

  return targetMap;
}

export function retargetRuntimeCreatureAnimationClip(
  clip: THREE.AnimationClip,
  rigBinding: CreatureRuntimeRigBindingPlan,
  options: RuntimeCreatureAnimationRetargetOptions = {}
): THREE.AnimationClip {
  const direction: RuntimeCreatureAnimationRetargetDirection =
    options.direction ?? 'runtime-to-source';
  const targetMap = createRuntimeCreatureAnimationTrackNameMap(rigBinding, {
    ...options,
    direction,
  });
  let renamedTracks = 0;
  let preservedTracks = 0;
  const tracks = clip.tracks.map((track) => {
    const nextName = replaceTrackNameTarget(track.name, targetMap);
    const clone = track.clone();

    if (nextName === track.name) {
      preservedTracks += 1;
    } else {
      renamedTracks += 1;
      clone.name = nextName;
    }

    return clone;
  });
  const retargeted = new AnimationClip(
    options.name ?? clip.name,
    clip.duration,
    tracks,
    clip.blendMode
  );
  const metadata: RuntimeCreatureAnimationRetargetMetadata = {
    direction,
    renamedTracks,
    preservedTracks,
    trackNameMap: Object.fromEntries(targetMap),
  };

  retargeted.userData = {
    ...clip.userData,
    strataRuntimeRetarget: metadata,
  };

  return retargeted;
}

function findRuntimeCreaturePoseBinding(
  rigBinding: CreatureRuntimeRigBindingPlan,
  key: string
): CreatureRuntimeRigBindingPlan['bindings'][number] | undefined {
  return rigBinding.bindings.find(
    (binding) =>
      binding.runtimeBoneId === key || binding.boneId === key || binding.sourceBone === key
  );
}

function shouldUsePoseBinding(
  binding: CreatureRuntimeRigBindingPlan['bindings'][number],
  options: RuntimeCreaturePoseOptions
) {
  return (
    shouldUseRigBinding(binding) &&
    (binding.status !== 'unverified' || options.includeUnverified !== false)
  );
}

function vectorTuple(value: RuntimeCreaturePoseVector): [number, number, number] {
  return Array.isArray(value) ? value : [value.x, value.y, value.z];
}

function quaternionTuple(value: RuntimeCreaturePoseQuaternion): [number, number, number, number] {
  return Array.isArray(value) ? value : [value.x, value.y, value.z, value.w];
}

function scaleTuple(value: RuntimeCreaturePoseScale): [number, number, number] {
  if (typeof value === 'number') {
    return [value, value, value];
  }

  return vectorTuple(value);
}

/**
 * Creates aliases from runtime/logical/source bone names to Three objects.
 */
export function createRuntimeCreaturePoseTargetMap(
  root: THREE.Object3D,
  rigBinding: CreatureRuntimeRigBindingPlan,
  options: RuntimeCreaturePoseOptions = {}
): Map<string, THREE.Object3D> {
  const objectsByName = new Map<string, THREE.Object3D>();
  const targets = new Map<string, THREE.Object3D>();

  root.traverse((object) => {
    if (!object.name || objectsByName.has(object.name)) {
      return;
    }

    objectsByName.set(object.name, object);
    targets.set(object.name, object);
  });

  for (const binding of rigBinding.bindings) {
    if (!shouldUsePoseBinding(binding, options)) {
      continue;
    }

    const object =
      objectsByName.get(binding.sourceBone) ??
      objectsByName.get(binding.runtimeBoneId) ??
      objectsByName.get(binding.boneId);

    if (!object) {
      continue;
    }

    targets.set(binding.runtimeBoneId, object);
    targets.set(binding.boneId, object);
    targets.set(binding.sourceBone, object);
  }

  return targets;
}

/**
 * Applies a runtime creature pose to matching Three rig objects.
 */
export function applyRuntimeCreaturePose(
  root: THREE.Object3D,
  rigBinding: CreatureRuntimeRigBindingPlan,
  pose: RuntimeCreaturePose,
  options: RuntimeCreaturePoseOptions = {}
): RuntimeCreaturePoseApplication[] {
  const targets = createRuntimeCreaturePoseTargetMap(root, rigBinding, options);
  const applications: RuntimeCreaturePoseApplication[] = [];

  for (const [key, transform] of Object.entries(pose)) {
    const object = targets.get(key);

    if (!object) {
      continue;
    }

    const applied: RuntimeCreaturePoseApplication['applied'] = [];

    if (transform.position) {
      object.position.set(...vectorTuple(transform.position));
      applied.push('position');
    }

    if (transform.rotation) {
      object.quaternion.set(...quaternionTuple(transform.rotation));
      applied.push('rotation');
    }

    if (transform.scale !== undefined) {
      object.scale.set(...scaleTuple(transform.scale));
      applied.push('scale');
    }

    applications.push({
      key,
      object,
      binding: findRuntimeCreaturePoseBinding(rigBinding, key),
      transform,
      applied,
    });
  }

  return applications;
}

function cloneRuntimeCreatureAsset(
  scene: THREE.Object3D,
  castShadow: boolean,
  receiveShadow: boolean
): THREE.Object3D {
  const clone = scene.clone(true);

  clone.traverse((object) => {
    if (!isMesh(object)) {
      return;
    }

    object.castShadow = castShadow;
    object.receiveShadow = receiveShadow;
  });

  return clone;
}

function RuntimeCreatureAssetModel({
  creature,
  model,
  animation,
  retargetAnimation,
  castShadow = true,
  receiveShadow = true,
  onRigBinding,
}: RuntimeCreatureAssetModelProps) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(model) as RuntimeCreatureGltf;
  const object = useMemo(
    () => cloneRuntimeCreatureAsset(gltf.scene, castShadow, receiveShadow),
    [castShadow, gltf.scene, receiveShadow]
  );
  const clipName = animation ? (creature.asset?.animationClips[animation] ?? animation) : undefined;
  const rigBinding = useMemo(
    () => createRuntimeCreatureAssetRigBinding(creature, object),
    [creature, object]
  );
  const animationClips = useMemo(() => {
    const clips = gltf.animations ?? [];

    if (!retargetAnimation) {
      return clips;
    }

    const retargetOptions = normalizeRetargetOptions(retargetAnimation);

    return clips.map((clip) =>
      retargetRuntimeCreatureAnimationClip(clip, rigBinding, retargetOptions)
    );
  }, [gltf.animations, retargetAnimation, rigBinding]);
  const { actions } = useAnimations(animationClips, group);

  useEffect(() => {
    if (!clipName) {
      return undefined;
    }

    const action = actions[clipName];

    if (!action) {
      return undefined;
    }

    action.reset().fadeIn(0.15).play();

    return () => {
      action.fadeOut(0.15);
    };
  }, [actions, clipName]);

  useEffect(() => {
    onRigBinding?.(rigBinding);
  }, [onRigBinding, rigBinding]);

  object.userData = {
    ...object.userData,
    strataRuntimeKind: 'creature-asset',
    strataRuntimeCreature: creature,
    strataRuntimeAssetModel: model,
    strataRuntimeAnimation: clipName,
    strataRuntimeRigBinding: rigBinding,
  };

  return (
    <group
      ref={group}
      name={`${creature.id}:asset`}
      userData={{
        strataRuntimeKind: 'creature-asset',
        strataRuntimeCreature: creature,
        strataRuntimeAssetModel: model,
        strataRuntimeAnimation: clipName,
        strataRuntimeRigBinding: rigBinding,
      }}
    >
      <primitive object={object} />
    </group>
  );
}

/**
 * Renders an asset-backed creature model from a runtime creature asset binding.
 */
export function RuntimeCreatureAsset(props: RuntimeCreatureAssetProps) {
  const model = props.creature.asset?.model;

  if (!model) {
    throw new Error(
      `RuntimeCreatureAsset requires creature "${props.creature.id}" to include asset.model`
    );
  }

  return <RuntimeCreatureAssetModel {...props} model={model} />;
}
