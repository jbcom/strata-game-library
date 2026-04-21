import type { ThreeEvent } from '@react-three/fiber';
import {
  type CreatePropInput,
  executePropInteractionAction,
  type PropComposition,
  type PropRuntimeAssembly,
  type PropRuntimeInteractionAction,
  type PropRuntimeNode,
  resolvePropComposition,
} from '@strata-game-library/core/compose';
import { useMemo } from 'react';
import type * as THREE from 'three';
import { resolveRuntimeMaterial } from './materials';
import { RuntimeAssetMesh } from './RuntimeAssetMesh';
import { RuntimeGeometry } from './RuntimeGeometry';
import type { RuntimeMaterialOptions, RuntimePropInput, RuntimePropProps } from './types';

function isPropComposition(input: RuntimePropInput): input is PropComposition {
  return typeof input === 'object' && 'runtime' in input;
}

function isPropRuntimeAssembly(input: RuntimePropInput): input is PropRuntimeAssembly {
  return typeof input === 'object' && 'kind' in input && input.kind === 'prop';
}

function resolveRuntimeProp(input: RuntimePropInput): PropRuntimeAssembly {
  if (isPropRuntimeAssembly(input)) {
    return input;
  }

  if (isPropComposition(input)) {
    return input.runtime;
  }

  return resolvePropComposition(input as string | CreatePropInput).runtime;
}

function createMaterialCache(
  runtime: PropRuntimeAssembly,
  options: RuntimeMaterialOptions
): Record<string, THREE.Material> {
  return Object.fromEntries(
    Object.values(runtime.materialSlots).map((slot) => [
      slot.id,
      resolveRuntimeMaterial(slot.id, slot.material, options),
    ])
  );
}

function getNodeMaterial(
  node: PropRuntimeNode,
  runtime: PropRuntimeAssembly,
  materials: Record<string, THREE.Material>
) {
  const material = materials[node.materialSlot];
  const slot = runtime.materialSlots[node.materialSlot];

  if (!material || !slot) {
    throw new Error(
      `Missing runtime material slot "${node.materialSlot}" for prop "${runtime.id}"`
    );
  }

  return { material, slot };
}

export function getDefaultRuntimePropInteractionAction(
  runtime: PropRuntimeAssembly,
  node: PropRuntimeNode
): PropRuntimeInteractionAction | undefined {
  return (
    runtime.interactionActions.find(
      (action) => action.enabled && action.nodeIds.includes(node.id)
    ) ?? runtime.interactionActions.find((action) => action.nodeIds.includes(node.id))
  );
}

/**
 * Renders a core `PropRuntimeAssembly` or prop definition through React Three Fiber.
 */
export function RuntimeProp({
  prop,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  castShadow = true,
  receiveShadow = true,
  transparentVolumetrics,
  materialOverrides,
  assetMaterialMode,
  renderNode,
  onNodeClick,
  interactionState,
  selectInteractionAction,
  onInteraction,
}: RuntimePropProps) {
  const runtime = useMemo(() => resolveRuntimeProp(prop), [prop]);
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
  const handleNodeClick =
    onNodeClick || onInteraction
      ? (node: PropRuntimeNode, event: ThreeEvent<MouseEvent>) => {
          onNodeClick?.(node, event);

          if (!onInteraction) {
            return;
          }

          const selectedAction = selectInteractionAction
            ? selectInteractionAction(node, runtime)
            : getDefaultRuntimePropInteractionAction(runtime, node);

          if (!selectedAction) {
            return;
          }

          onInteraction(executePropInteractionAction(runtime, selectedAction, interactionState), {
            runtime,
            node,
            event,
          });
        }
      : undefined;

  return (
    <group name={runtime.id} position={position} rotation={rotation} scale={groupScale}>
      {runtime.nodes.map((node) => {
        const { material, slot } = getNodeMaterial(node, runtime, materials);
        const custom = renderNode?.(node, { material, materialSlot: slot });

        if (custom !== undefined) {
          return <group key={node.id}>{custom}</group>;
        }

        if (node.shape === 'mesh' && node.mesh) {
          return (
            <RuntimeAssetMesh
              key={node.id}
              node={node}
              material={material}
              materialSlot={slot}
              materialMode={assetMaterialMode}
              castShadow={castShadow}
              receiveShadow={receiveShadow}
              onClick={
                handleNodeClick
                  ? (event: ThreeEvent<MouseEvent>) => handleNodeClick(node, event)
                  : undefined
              }
            />
          );
        }

        return (
          // biome-ignore lint/a11y/noStaticElementInteractions: R3F meshes use pointer events in a 3D scene, not DOM semantics.
          <mesh
            key={node.id}
            name={node.id}
            position={node.position}
            quaternion={node.rotation}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
            userData={{ runtimeNode: node, runtimeMaterialSlot: slot }}
            onClick={
              handleNodeClick
                ? (event: ThreeEvent<MouseEvent>) => handleNodeClick(node, event)
                : undefined
            }
          >
            <RuntimeGeometry shape={node.shape} size={node.size} />
            <primitive object={material} attach="material" />
          </mesh>
        );
      })}
    </group>
  );
}
