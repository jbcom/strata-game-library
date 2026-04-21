import { useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { PropRuntimeNode, RuntimeMaterialSlot } from '@strata-game-library/core/compose';
import { useMemo } from 'react';
import type * as THREE from 'three';

export type RuntimeAssetMaterialMode = 'runtime' | 'source';

export interface RuntimeAssetMeshProps {
  node: PropRuntimeNode;
  material: THREE.Material;
  materialSlot: RuntimeMaterialSlot;
  materialMode?: RuntimeAssetMaterialMode;
  castShadow?: boolean;
  receiveShadow?: boolean;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
}

interface RuntimeGltf {
  scene: THREE.Object3D;
}

function isMesh(object: THREE.Object3D): object is THREE.Mesh {
  return 'isMesh' in object && object.isMesh === true;
}

function cloneRuntimeAsset(
  scene: THREE.Object3D,
  material: THREE.Material,
  materialMode: RuntimeAssetMaterialMode,
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

    if (materialMode === 'runtime') {
      object.material = material;
    }
  });

  return clone;
}

/**
 * Renders a static GLB/mesh-backed runtime prop node through Drei's GLTF cache.
 */
export function RuntimeAssetMesh({
  node,
  material,
  materialSlot,
  materialMode = 'runtime',
  castShadow = true,
  receiveShadow = true,
  onClick,
}: RuntimeAssetMeshProps) {
  if (!node.mesh) {
    throw new Error(`RuntimeAssetMesh requires node "${node.id}" to include a mesh source`);
  }

  const gltf = useGLTF(node.mesh) as RuntimeGltf;
  const object = useMemo(
    () => cloneRuntimeAsset(gltf.scene, material, materialMode, castShadow, receiveShadow),
    [castShadow, gltf.scene, material, materialMode, receiveShadow]
  );

  object.userData = {
    ...object.userData,
    runtimeNode: node,
    runtimeMaterialSlot: materialSlot,
    runtimeMeshSource: node.mesh,
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: R3F groups use pointer events in a 3D scene, not DOM semantics.
    <group
      name={node.id}
      position={node.position}
      quaternion={node.rotation}
      scale={node.size}
      userData={{
        runtimeNode: node,
        runtimeMaterialSlot: materialSlot,
        runtimeMeshSource: node.mesh,
      }}
      onClick={onClick}
    >
      <primitive object={object} />
    </group>
  );
}
