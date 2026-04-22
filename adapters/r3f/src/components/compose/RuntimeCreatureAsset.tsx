import { useAnimations, useGLTF } from '@react-three/drei';
import {
  type CreatureRuntimeAssembly,
  type CreatureRuntimeRigBindingPlan,
  createCreatureRigBindingPlan,
} from '@strata-game-library/core/compose';
import { useEffect, useMemo, useRef } from 'react';
import type * as THREE from 'three';

export interface RuntimeCreatureAssetProps {
  creature: CreatureRuntimeAssembly;
  animation?: string;
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
  const { actions } = useAnimations(gltf.animations ?? [], group);
  const clipName = animation ? (creature.asset?.animationClips[animation] ?? animation) : undefined;
  const rigBinding = useMemo(
    () => createRuntimeCreatureAssetRigBinding(creature, object),
    [creature, object]
  );

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
