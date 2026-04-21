import { useAnimations, useGLTF } from '@react-three/drei';
import type { CreatureRuntimeAssembly } from '@strata-game-library/core/compose';
import { useEffect, useMemo, useRef } from 'react';
import type * as THREE from 'three';

export interface RuntimeCreatureAssetProps {
  creature: CreatureRuntimeAssembly;
  animation?: string;
  castShadow?: boolean;
  receiveShadow?: boolean;
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
}: RuntimeCreatureAssetModelProps) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(model) as RuntimeCreatureGltf;
  const object = useMemo(
    () => cloneRuntimeCreatureAsset(gltf.scene, castShadow, receiveShadow),
    [castShadow, gltf.scene, receiveShadow]
  );
  const { actions } = useAnimations(gltf.animations ?? [], group);
  const clipName = animation ? (creature.asset?.animationClips[animation] ?? animation) : undefined;

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

  object.userData = {
    ...object.userData,
    strataRuntimeKind: 'creature-asset',
    strataRuntimeCreature: creature,
    strataRuntimeAssetModel: model,
    strataRuntimeAnimation: clipName,
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
