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
  type RuntimePhysicsProfile,
  resolvePropComposition,
} from '@strata-game-library/core/compose';
import type { CSSProperties } from 'react';
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
  RuntimePropInteractionPanelContext,
  RuntimePropInteractionPanelProps,
  RuntimePropInteractionPanelResultContext,
  RuntimePropObjectPhysicsAdapterOptions,
  RuntimePropPhysicsAdapter,
  RuntimePropPhysicsAdapterContext,
  RuntimePropPhysicsApplication,
  RuntimePropPhysicsApplicationOptions,
  RuntimePropPhysicsEffect,
  RuntimePropPhysicsHandle,
  RuntimePropPhysicsHandleAttachOptions,
  RuntimePropPhysicsObjectState,
  RuntimePropProps,
  RuntimePropRapierBodyType,
  RuntimePropRapierPhysicsHandleOptions,
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
  strataRuntimePhysicsHandle?: RuntimePropPhysicsHandle;
  strataRuntimePhysicsState?: RuntimePropPhysicsObjectState;
}

/**
 * Default Strata mode to Rapier `RigidBodyType` numeric mappings.
 */
export const RUNTIME_PROP_RAPIER_BODY_TYPES = {
  dynamic: 0,
  static: 1,
  kinematic: 2,
} as const;

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

function getRuntimePropPhysicsHandle(
  context: RuntimePropPhysicsAdapterContext,
  options: RuntimePropObjectPhysicsAdapterOptions
): RuntimePropPhysicsHandle | undefined {
  if (options.resolveHandle) {
    return options.resolveHandle(context) ?? undefined;
  }

  const handleKey = options.handleKey ?? 'strataRuntimePhysicsHandle';
  const userData = context.object.userData as RuntimePropObjectUserData &
    Record<string, RuntimePropPhysicsHandle | undefined>;

  return userData[handleKey];
}

/**
 * Attaches an engine-owned physics handle to a runtime prop object.
 */
export function attachRuntimePropPhysicsHandle<TObject extends THREE.Object3D>(
  object: TObject,
  handle: RuntimePropPhysicsHandle,
  options: RuntimePropPhysicsHandleAttachOptions = {}
): TObject {
  const handleKey = options.handleKey ?? 'strataRuntimePhysicsHandle';

  object.userData = {
    ...object.userData,
    [handleKey]: handle,
  };

  return object;
}

/**
 * Creates a prop physics adapter that delegates to handles stored on object `userData`.
 */
export function createRuntimePropObjectPhysicsAdapter(
  options: RuntimePropObjectPhysicsAdapterOptions = {}
): RuntimePropPhysicsAdapter {
  return {
    setMode: (context) => {
      getRuntimePropPhysicsHandle(context, options)?.setMode?.(context.effect.mode, context);
    },
    setColliderEnabled: (enabled, context) => {
      getRuntimePropPhysicsHandle(context, options)?.setColliderEnabled?.(enabled, context);
    },
    wakeBody: (context) => {
      getRuntimePropPhysicsHandle(context, options)?.wakeBody?.(context);
    },
  };
}

function resolveRuntimePropRapierBodyType(
  mode: RuntimePhysicsProfile['mode'],
  options: RuntimePropRapierPhysicsHandleOptions
): RuntimePropRapierBodyType | undefined {
  if (!mode) {
    return undefined;
  }

  return {
    ...RUNTIME_PROP_RAPIER_BODY_TYPES,
    ...options.bodyTypes,
  }[mode];
}

/**
 * Creates a Rapier-backed runtime prop physics handle.
 */
export function createRuntimePropRapierPhysicsHandle(
  options: RuntimePropRapierPhysicsHandleOptions
): RuntimePropPhysicsHandle {
  return {
    setMode: (mode) => {
      const bodyType = resolveRuntimePropRapierBodyType(mode, options);

      if (bodyType !== undefined) {
        options.body?.setBodyType?.(bodyType, options.wakeUp ?? true);
      }
    },
    setColliderEnabled: (enabled) => {
      for (const collider of options.colliders ?? []) {
        collider?.setEnabled?.(enabled);
      }

      if (options.disableBodyWhenColliderDisabled) {
        options.body?.setEnabled?.(enabled);
      }
    },
    wakeBody: () => {
      options.body?.wakeUp?.();
    },
  };
}

/**
 * Attaches a Rapier-backed physics handle to a runtime prop object.
 */
export function attachRuntimePropRapierPhysicsHandle<TObject extends THREE.Object3D>(
  object: TObject,
  options: RuntimePropRapierPhysicsHandleOptions,
  attachOptions: RuntimePropPhysicsHandleAttachOptions = {}
): TObject {
  return attachRuntimePropPhysicsHandle(
    object,
    createRuntimePropRapierPhysicsHandle(options),
    attachOptions
  );
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

const INTERACTION_PANEL_STYLE: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.78))',
  border: '1px solid rgba(148, 163, 184, 0.22)',
  borderRadius: 16,
  boxShadow: '0 18px 48px rgba(2, 6, 23, 0.36)',
  color: '#e2e8f0',
  display: 'grid',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  gap: 10,
  maxWidth: 360,
  padding: 14,
};

const INTERACTION_BUTTON_STYLE: CSSProperties = {
  background: 'rgba(14, 165, 233, 0.16)',
  border: '1px solid rgba(125, 211, 252, 0.28)',
  borderRadius: 12,
  color: '#e0f2fe',
  cursor: 'pointer',
  display: 'flex',
  fontFamily: 'inherit',
  justifyContent: 'space-between',
  gap: 12,
  padding: '10px 12px',
  textAlign: 'left',
};

const INTERACTION_BUTTON_DISABLED_STYLE: CSSProperties = {
  cursor: 'default',
  opacity: 0.52,
};

function formatRuntimePropInteractionState(state: PropRuntimeInteractionState): string {
  const flags = [
    state.open !== undefined ? `Open: ${state.open ? 'yes' : 'no'}` : undefined,
    state.active !== undefined ? `Active: ${state.active ? 'yes' : 'no'}` : undefined,
    state.occupied !== undefined ? `Occupied: ${state.occupied ? 'yes' : 'no'}` : undefined,
    state.collected !== undefined ? `Collected: ${state.collected ? 'yes' : 'no'}` : undefined,
    state.contents ? `Contents: ${state.contents.length}` : undefined,
  ].filter((entry): entry is string => entry !== undefined);

  return flags.length > 0 ? flags.join(' / ') : 'Idle';
}

function formatRuntimePropInteractionStatus(result: PropRuntimeInteractionResult | undefined) {
  if (!result) {
    return 'Ready';
  }

  return result.status === 'executed'
    ? `Executed ${result.action?.label ?? result.action?.id ?? 'action'}`
    : `Skipped: ${result.status}`;
}

function isRuntimePropInteractionActionDisabled(
  action: PropRuntimeInteractionAction,
  state: PropRuntimeInteractionState
) {
  return !action.enabled || (state.disabledActionIds ?? []).includes(action.id);
}

/**
 * Renders a prefabbed interaction control panel for a runtime prop.
 */
export function RuntimePropInteractionPanel({
  prop,
  initialState,
  actions,
  title,
  emptyLabel = 'No interactions available',
  showState = true,
  showStatus = true,
  showReset = true,
  className,
  style,
  buttonStyle,
  actionFilter,
  actionLabel,
  actionDisabled,
  onInteraction,
  onStateChange,
}: RuntimePropInteractionPanelProps) {
  const controller = useRuntimePropInteractionController(prop, { initialState });
  const context: RuntimePropInteractionPanelContext = {
    runtime: controller.runtime,
    state: controller.state,
  };
  const availableActions = (actions ?? controller.runtime.interactionActions).filter((action) =>
    actionFilter ? actionFilter(action, context) : true
  );
  const [lastResult, setLastResult] = useState<PropRuntimeInteractionResult>();
  const executePanelAction = (action: PropRuntimeInteractionAction) => {
    const result = controller.execute(action);
    const resultContext: RuntimePropInteractionPanelResultContext = {
      runtime: controller.runtime,
      state: result.nextState,
      result,
    };

    setLastResult(result);
    onInteraction?.(result, resultContext);
    onStateChange?.(result.nextState, resultContext);
  };
  const resetPanelState = () => {
    const nextState = controller.reset();

    setLastResult(undefined);
    onStateChange?.(nextState, { runtime: controller.runtime, state: nextState });
  };

  return (
    <div
      className={className}
      data-strata-runtime-prop-interactions={controller.runtime.id}
      style={{ ...INTERACTION_PANEL_STYLE, ...style }}
    >
      <div>
        <div style={{ fontSize: 11, letterSpacing: '0.12em', opacity: 0.68 }}>
          PROP INTERACTIONS
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
          {title ?? controller.runtime.name}
        </div>
      </div>

      {showState && (
        <div style={{ fontSize: 12, opacity: 0.82 }}>
          {formatRuntimePropInteractionState(controller.state)}
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {availableActions.length > 0 ? (
          availableActions.map((action) => {
            const disabled =
              isRuntimePropInteractionActionDisabled(action, controller.state) ||
              actionDisabled?.(action, context) === true;

            return (
              <button
                disabled={disabled}
                key={action.id}
                onClick={() => executePanelAction(action)}
                style={{
                  ...INTERACTION_BUTTON_STYLE,
                  ...(disabled ? INTERACTION_BUTTON_DISABLED_STYLE : {}),
                  ...buttonStyle,
                }}
                type="button"
              >
                <span>{actionLabel ? actionLabel(action, context) : action.label}</span>
                <span style={{ opacity: 0.72, textTransform: 'uppercase' }}>{action.type}</span>
              </button>
            );
          })
        ) : (
          <div style={{ fontSize: 12, opacity: 0.72 }}>{emptyLabel}</div>
        )}
      </div>

      {(showStatus || showReset) && (
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 10,
            justifyContent: 'space-between',
          }}
        >
          {showStatus && (
            <div style={{ fontSize: 11, letterSpacing: '0.08em', opacity: 0.7 }}>
              {formatRuntimePropInteractionStatus(lastResult)}
            </div>
          )}
          {showReset && (
            <button
              onClick={resetPanelState}
              style={{
                background: 'transparent',
                border: '1px dashed rgba(148, 163, 184, 0.28)',
                borderRadius: 999,
                color: 'inherit',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 11,
                padding: '6px 10px',
              }}
              type="button"
            >
              Reset interactions
            </button>
          )}
        </div>
      )}
    </div>
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
