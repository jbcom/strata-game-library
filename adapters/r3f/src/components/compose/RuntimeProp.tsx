import type { ThreeEvent } from '@react-three/fiber';
import {
  type CreatePropInput,
  createPropInteractionController,
  executePropInteractionAction,
  type PropComposition,
  type PropRuntimeAssembly,
  type PropRuntimeInteractionAction,
  type PropRuntimeInteractionResult,
  type PropRuntimeInteractionState,
  type PropRuntimeNode,
  resolvePropComposition,
} from '@strata-game-library/core/compose';
import { useEffect, useMemo, useRef, useState } from 'react';
import type * as THREE from 'three';
import { resolveRuntimeMaterial } from './materials';
import { RuntimeAssetMesh } from './RuntimeAssetMesh';
import { RuntimeGeometry } from './RuntimeGeometry';
import type {
  RuntimeMaterialOptions,
  RuntimePropInput,
  RuntimePropInteractionControllerOptions,
  RuntimePropInteractionControllerState,
  RuntimePropPhysicsApplication,
  RuntimePropPhysicsApplicationOptions,
  RuntimePropPhysicsEffect,
  RuntimePropPhysicsObjectState,
  RuntimePropProps,
} from './types';

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

interface RuntimePropObjectUserData {
  runtimeNode?: PropRuntimeNode;
  strataRuntimeNode?: PropRuntimeNode;
  strataRuntimePhysicsState?: RuntimePropPhysicsObjectState;
}

function getObjectRuntimeNode(object: THREE.Object3D): PropRuntimeNode | undefined {
  const userData = object.userData as RuntimePropObjectUserData;

  return userData.runtimeNode ?? userData.strataRuntimeNode;
}

function collectRuntimePropObjectsByNode(root: THREE.Object3D): Map<string, THREE.Object3D[]> {
  const objects = new Map<string, THREE.Object3D[]>();

  root.traverse((object) => {
    const node = getObjectRuntimeNode(object);

    if (!node) {
      return;
    }

    const entries = objects.get(node.id) ?? [];
    entries.push(object);
    objects.set(node.id, entries);
  });

  return objects;
}

function isRuntimePropPhysicsEffect(
  effect: PropRuntimeInteractionResult['effects'][number]
): effect is RuntimePropPhysicsEffect {
  return effect.type === 'physics';
}

function nextRuntimePropPhysicsState(
  object: THREE.Object3D,
  effect: RuntimePropPhysicsEffect
): RuntimePropPhysicsObjectState {
  const userData = object.userData as RuntimePropObjectUserData;
  const previous = userData.strataRuntimePhysicsState;
  const state: RuntimePropPhysicsObjectState = {
    ...previous,
    lastOperation: effect.operation,
  };

  switch (effect.operation) {
    case 'set-mode':
      state.mode = effect.mode;
      break;
    case 'disable-collider':
      state.colliderEnabled = false;
      break;
    case 'enable-collider':
      state.colliderEnabled = true;
      break;
    case 'wake-body':
      state.awake = true;
      break;
  }

  object.userData = {
    ...object.userData,
    strataRuntimePhysicsState: state,
  };

  return state;
}

export function applyRuntimePropInteractionPhysicsEffects(
  root: THREE.Object3D,
  runtime: PropRuntimeAssembly,
  result: PropRuntimeInteractionResult,
  options: RuntimePropPhysicsApplicationOptions = {}
): RuntimePropPhysicsApplication[] {
  const nodes = new Map(runtime.nodes.map((node) => [node.id, node]));
  const objectsByNode = collectRuntimePropObjectsByNode(root);
  const applications: RuntimePropPhysicsApplication[] = [];

  for (const effect of result.effects) {
    if (!isRuntimePropPhysicsEffect(effect)) {
      continue;
    }

    for (const nodeId of effect.nodeIds) {
      const node = nodes.get(nodeId);

      if (!node) {
        continue;
      }

      for (const object of objectsByNode.get(nodeId) ?? []) {
        const state = nextRuntimePropPhysicsState(object, effect);
        const application = { effect, node, object, state };
        const context = { runtime, result, ...application };

        applications.push(application);

        switch (effect.operation) {
          case 'set-mode':
            options.adapter?.setMode?.(context);
            break;
          case 'disable-collider':
            options.adapter?.setColliderEnabled?.(false, context);
            break;
          case 'enable-collider':
            options.adapter?.setColliderEnabled?.(true, context);
            break;
          case 'wake-body':
            options.adapter?.wakeBody?.(context);
            break;
        }
      }
    }
  }

  return applications;
}

/**
 * Creates a React state bridge around the core prop interaction controller.
 */
export function useRuntimePropInteractionController(
  prop: RuntimePropInput,
  options: RuntimePropInteractionControllerOptions = {}
): RuntimePropInteractionControllerState {
  const runtime = useMemo(() => resolveRuntimeProp(prop), [prop]);
  const initialStateRef = useRef(options.initialState);

  initialStateRef.current = options.initialState;

  const controller = useMemo(
    () => createPropInteractionController(runtime, initialStateRef.current),
    [runtime]
  );
  const [state, setReactState] = useState(() => controller.getState());

  useEffect(() => {
    setReactState(controller.getState());
  }, [controller]);

  const setState = (nextState: PropRuntimeInteractionState) => {
    const resolvedState = controller.setState(nextState);

    setReactState(resolvedState);

    return resolvedState;
  };
  const reset = (nextState?: PropRuntimeInteractionState) => {
    const resolvedState = controller.reset(nextState);

    setReactState(resolvedState);

    return resolvedState;
  };
  const execute = (action: string | PropRuntimeInteractionAction) => {
    const result = controller.execute(action);

    setReactState(result.nextState);

    return result;
  };

  return { runtime, state, setState, reset, execute };
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
  applyPhysicsEffects = true,
  physicsAdapter,
}: RuntimePropProps) {
  const groupRef = useRef<THREE.Group>(null);
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

          const result = executePropInteractionAction(runtime, selectedAction, interactionState);
          const physicsApplications =
            applyPhysicsEffects && groupRef.current
              ? applyRuntimePropInteractionPhysicsEffects(groupRef.current, runtime, result, {
                  adapter: physicsAdapter,
                })
              : [];

          onInteraction(result, {
            runtime,
            node,
            event,
            physicsApplications,
          });
        }
      : undefined;

  return (
    <group
      ref={groupRef}
      name={runtime.id}
      position={position}
      rotation={rotation}
      scale={groupScale}
      userData={{ runtimeProp: runtime }}
    >
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
