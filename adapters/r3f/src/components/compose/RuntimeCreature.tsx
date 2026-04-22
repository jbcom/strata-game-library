import type { ThreeEvent } from '@react-three/fiber';
import {
  type CreateCreatureInput,
  type CreatureComposition,
  type CreatureRuntimeAssembly,
  type CreatureRuntimeBone,
  resolveCreatureComposition,
} from '@strata-game-library/core/compose';
import { useMemo } from 'react';
import type * as THREE from 'three';
import { resolveRuntimeMaterial } from './materials';
import { RuntimeCreatureAsset } from './RuntimeCreatureAsset';
import { RuntimeGeometry } from './RuntimeGeometry';
import type { RuntimeCreatureInput, RuntimeCreatureProps, RuntimeMaterialOptions } from './types';

function isCreatureComposition(input: RuntimeCreatureInput): input is CreatureComposition {
  return typeof input === 'object' && 'runtime' in input;
}

function isCreatureRuntimeAssembly(input: RuntimeCreatureInput): input is CreatureRuntimeAssembly {
  return typeof input === 'object' && 'kind' in input && input.kind === 'creature';
}

function resolveRuntimeCreature(input: RuntimeCreatureInput): CreatureRuntimeAssembly {
  if (isCreatureRuntimeAssembly(input)) {
    return input;
  }

  if (isCreatureComposition(input)) {
    return input.runtime;
  }

  return resolveCreatureComposition(input as string | CreateCreatureInput).runtime;
}

function createMaterialCache(
  runtime: CreatureRuntimeAssembly,
  options: RuntimeMaterialOptions
): Record<string, THREE.Material> {
  return Object.fromEntries(
    Object.values(runtime.materialSlots).map((slot) => [
      slot.id,
      resolveRuntimeMaterial(slot.id, slot.material, options),
    ])
  );
}

function getBoneMaterial(
  bone: CreatureRuntimeBone,
  runtime: CreatureRuntimeAssembly,
  materials: Record<string, THREE.Material>
) {
  const material = materials[bone.materialSlot];
  const slot = runtime.materialSlots[bone.materialSlot];

  if (!material || !slot) {
    throw new Error(
      `Missing runtime material slot "${bone.materialSlot}" for creature "${runtime.id}"`
    );
  }

  return { material, slot };
}

/**
 * Renders a core `CreatureRuntimeAssembly` or creature definition through React Three Fiber.
 */
export function RuntimeCreature({
  creature,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  castShadow = true,
  receiveShadow = true,
  assetMode = 'auto',
  animation,
  onRigBinding,
  transparentVolumetrics,
  materialOverrides,
  renderBone,
  onBoneClick,
}: RuntimeCreatureProps) {
  const runtime = useMemo(() => resolveRuntimeCreature(creature), [creature]);
  const materialOptions = useMemo(
    () => ({ materialOverrides, transparentVolumetrics }),
    [materialOverrides, transparentVolumetrics]
  );
  const materials = useMemo(
    () => createMaterialCache(runtime, materialOptions),
    [runtime, materialOptions]
  );
  const groupScale = (typeof scale === 'number' ? [scale, scale, scale] : scale) as [
    number,
    number,
    number,
  ];
  const shouldRenderAsset =
    assetMode === 'asset' || (assetMode === 'auto' && runtime.asset?.model !== undefined);

  if (shouldRenderAsset) {
    if (!runtime.asset?.model) {
      throw new Error(
        `RuntimeCreature assetMode="asset" requires creature "${runtime.id}" to include asset.model`
      );
    }

    return (
      <group name={runtime.id} position={position} rotation={rotation} scale={groupScale}>
        <RuntimeCreatureAsset
          creature={runtime}
          animation={animation}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
          onRigBinding={onRigBinding}
        />
      </group>
    );
  }

  return (
    <group name={runtime.id} position={position} rotation={rotation} scale={groupScale}>
      {runtime.bones.map((bone) => {
        const { material, slot } = getBoneMaterial(bone, runtime, materials);
        const custom = renderBone?.(bone, { material, materialSlot: slot });

        if (custom !== undefined) {
          return <group key={bone.id}>{custom}</group>;
        }

        return (
          // biome-ignore lint/a11y/noStaticElementInteractions: R3F meshes use pointer events in a 3D scene, not DOM semantics.
          <mesh
            key={bone.id}
            name={bone.id}
            position={bone.position}
            quaternion={bone.rotation}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
            userData={{ runtimeBone: bone, runtimeMaterialSlot: slot }}
            onClick={
              onBoneClick ? (event: ThreeEvent<MouseEvent>) => onBoneClick(bone, event) : undefined
            }
          >
            <RuntimeGeometry shape={bone.shape} size={bone.size} />
            <primitive object={material} attach="material" />
          </mesh>
        );
      })}
    </group>
  );
}
