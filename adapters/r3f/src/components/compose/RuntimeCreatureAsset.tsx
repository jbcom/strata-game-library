import { useAnimations, useGLTF } from '@react-three/drei';
import {
  type CreatureRuntimeAssembly,
  type CreatureRuntimeRigBindingPlan,
  createCreatureRigBindingPlan,
} from '@strata-game-library/core/compose';
import { useEffect, useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { AnimationClip, LoopOnce, LoopRepeat } from 'three';
import type {
  RuntimeCreatureAnimationActionContext,
  RuntimeCreatureAnimationActionMap,
  RuntimeCreatureAnimationController,
  RuntimeCreatureAnimationCrossFadeOptions,
  RuntimeCreatureAnimationPlaybackOptions,
  RuntimeCreatureAnimationRetargetDirection,
  RuntimeCreatureAnimationRetargetMetadata,
  RuntimeCreatureAnimationRetargetOptions,
  RuntimeCreatureAnimationStopOptions,
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
  animationPlayback?: RuntimeCreatureAnimationPlaybackOptions;
  retargetAnimation?: boolean | RuntimeCreatureAnimationRetargetOptions;
  castShadow?: boolean;
  receiveShadow?: boolean;
  onRigBinding?: (plan: CreatureRuntimeRigBindingPlan) => void;
  onAnimationController?: (controller: RuntimeCreatureAnimationController) => void;
  onAnimationAction?: (
    action: THREE.AnimationAction,
    context: RuntimeCreatureAnimationActionContext
  ) => void;
}

interface RuntimeCreatureAssetModelProps extends RuntimeCreatureAssetProps {
  model: string;
}

interface RuntimeCreatureGltf {
  scene: THREE.Object3D;
  animations?: THREE.AnimationClip[];
}

const DEFAULT_RUNTIME_CREATURE_ANIMATION_FADE_DURATION = 0.15;

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

/**
 * Resolves a runtime logical animation id to the source Three.js clip name.
 */
export function resolveRuntimeCreatureAnimationClipName(
  creature: CreatureRuntimeAssembly,
  animation: string
): string {
  return creature.asset?.animationClips[animation] ?? animation;
}

function getRuntimeCreatureAnimationAction(
  actions: RuntimeCreatureAnimationActionMap,
  creature: CreatureRuntimeAssembly,
  animation: string
): THREE.AnimationAction | undefined {
  const clipName = resolveRuntimeCreatureAnimationClipName(creature, animation);

  return actions[clipName] ?? actions[animation] ?? undefined;
}

/**
 * Starts a Three.js animation action through runtime creature clip aliases.
 */
export function playRuntimeCreatureAnimationAction(
  actions: RuntimeCreatureAnimationActionMap,
  creature: CreatureRuntimeAssembly,
  animation: string,
  options: RuntimeCreatureAnimationPlaybackOptions = {}
): THREE.AnimationAction | undefined {
  const action = getRuntimeCreatureAnimationAction(actions, creature, animation);

  if (!action) {
    return undefined;
  }

  if (options.reset !== false) {
    action.reset();
  }

  if (options.timeScale !== undefined) {
    action.timeScale = options.timeScale;
  }

  if (options.clampWhenFinished !== undefined) {
    action.clampWhenFinished = options.clampWhenFinished;
  }

  if (options.loop !== undefined || options.repetitions !== undefined) {
    const shouldLoop = options.loop !== false;
    action.setLoop(
      shouldLoop ? LoopRepeat : LoopOnce,
      options.repetitions ?? (shouldLoop ? Infinity : 1)
    );
  }

  action.enabled = true;

  if ((options.fadeInDuration ?? 0) > 0) {
    action.fadeIn(options.fadeInDuration ?? 0);
  }

  action.play();

  return action;
}

/**
 * Cross-fades a runtime creature animation action through logical clip aliases.
 */
export function crossFadeRuntimeCreatureAnimationAction(
  actions: RuntimeCreatureAnimationActionMap,
  creature: CreatureRuntimeAssembly,
  animation: string,
  options: RuntimeCreatureAnimationCrossFadeOptions = {}
): THREE.AnimationAction | undefined {
  const action = playRuntimeCreatureAnimationAction(actions, creature, animation, options);
  const from =
    typeof options.from === 'string'
      ? getRuntimeCreatureAnimationAction(actions, creature, options.from)
      : options.from;

  if (action && from && from !== action) {
    action.crossFadeFrom(from, options.duration ?? 0.2, options.warp ?? false);
  }

  return action;
}

/**
 * Stops a Three.js animation action with an optional fade-out.
 */
export function stopRuntimeCreatureAnimationAction(
  action: THREE.AnimationAction,
  options: RuntimeCreatureAnimationStopOptions = {}
): THREE.AnimationAction {
  if ((options.fadeOutDuration ?? 0) > 0) {
    action.fadeOut(options.fadeOutDuration ?? 0);
  } else {
    action.stop();
  }

  return action;
}

/**
 * Creates an imperative controller around runtime creature animation actions.
 */
export function createRuntimeCreatureAnimationController(
  creature: CreatureRuntimeAssembly,
  actions: RuntimeCreatureAnimationActionMap
): RuntimeCreatureAnimationController {
  const controller: RuntimeCreatureAnimationController = {
    creature,
    actions,
    resolveClipName: (animation) => resolveRuntimeCreatureAnimationClipName(creature, animation),
    getAction: (animation) => getRuntimeCreatureAnimationAction(actions, creature, animation),
    play: (animation, options) => {
      const action = playRuntimeCreatureAnimationAction(actions, creature, animation, options);

      if (action) {
        controller.current = action;
      }

      return action;
    },
    crossFade: (animation, options) => {
      const action = crossFadeRuntimeCreatureAnimationAction(actions, creature, animation, {
        ...options,
        from: options?.from ?? controller.current,
      });

      if (action) {
        controller.current = action;
      }

      return action;
    },
    stop: (animation, options) => {
      const action = controller.getAction(animation);

      if (!action) {
        return false;
      }

      stopRuntimeCreatureAnimationAction(action, options);

      if (controller.current === action) {
        controller.current = undefined;
      }

      return true;
    },
    stopAll: (options) => {
      const uniqueActions = new Set<THREE.AnimationAction>();

      for (const action of Object.values(actions)) {
        if (action) {
          uniqueActions.add(action);
        }
      }

      for (const action of uniqueActions) {
        stopRuntimeCreatureAnimationAction(action, options);
      }

      if (controller.current && uniqueActions.has(controller.current)) {
        controller.current = undefined;
      }
    },
  };

  return controller;
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
  animationPlayback,
  retargetAnimation,
  castShadow = true,
  receiveShadow = true,
  onRigBinding,
  onAnimationController,
  onAnimationAction,
}: RuntimeCreatureAssetModelProps) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(model) as RuntimeCreatureGltf;
  const object = useMemo(
    () => cloneRuntimeCreatureAsset(gltf.scene, castShadow, receiveShadow),
    [castShadow, gltf.scene, receiveShadow]
  );
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
  const animationController = useMemo(
    () => createRuntimeCreatureAnimationController(creature, actions),
    [actions, creature]
  );
  const clipName = animation ? animationController.resolveClipName(animation) : undefined;

  useEffect(() => {
    if (!animation) {
      return undefined;
    }

    const action = animationController.play(animation, {
      fadeInDuration: DEFAULT_RUNTIME_CREATURE_ANIMATION_FADE_DURATION,
      fadeOutDuration: DEFAULT_RUNTIME_CREATURE_ANIMATION_FADE_DURATION,
      ...animationPlayback,
    });

    if (!action) {
      return undefined;
    }

    onAnimationAction?.(action, {
      creature,
      animation,
      clipName: animationController.resolveClipName(animation),
    });

    return () => {
      stopRuntimeCreatureAnimationAction(action, {
        fadeOutDuration:
          animationPlayback?.fadeOutDuration ?? DEFAULT_RUNTIME_CREATURE_ANIMATION_FADE_DURATION,
      });
    };
  }, [animation, animationController, animationPlayback, creature, onAnimationAction]);

  useEffect(() => {
    onRigBinding?.(rigBinding);
  }, [onRigBinding, rigBinding]);

  useEffect(() => {
    onAnimationController?.(animationController);
  }, [animationController, onAnimationController]);

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
