/**
 * @fileoverview Composition Runtime API Examples
 *
 * Complete examples for the adapter-neutral composition runtime and the R3F
 * renderers that consume it.
 *
 * @module examples/composition
 */

import {
  type CreatureRuntimeBone,
  createMaterialVariant,
  type PropComposition,
  type PropRuntimeNode,
  resolveCreatureComposition,
  resolvePropComposition,
} from 'strata-game-library/compose';
import {
  createRuntimeCreatureAnimationGraphController,
  createRuntimeCreatureIKPose,
  type RuntimeCreatureAnimationController,
  type RuntimeShapeRenderContext,
} from 'strata-game-library/r3f';

function materialOverrideForNode(
  composition: PropComposition,
  componentIndex: number,
  baseColor: string
) {
  const node = composition.runtime.nodes[componentIndex];

  if (!node) {
    return {};
  }

  return {
    [node.materialSlot]: createMaterialVariant(node.material, {
      id: `${node.materialId}_showcase_${componentIndex}`,
      baseColor,
      roughnessDelta: -0.08,
    }),
  };
}

/**
 * Example 1: Runtime Prop Assembly
 *
 * Resolves a declarative prop definition into an adapter-neutral runtime plan,
 * then renders that plan with `RuntimeProp`.
 *
 * @example
 * ```tsx
 * import { resolvePropComposition } from 'strata-game-library/compose';
 * import { RuntimeProp } from 'strata-game-library/r3f';
 *
 * const prop = resolvePropComposition({
 *   id: 'signal_cache',
 *   components: [
 *     { shape: 'box', size: [2, 1.2, 2], position: [0, 0.6, 0], material: 'wood_oak' },
 *     { shape: 'sphere', size: [0.8, 0.8, 0.8], position: [0, 1.55, 0], material: 'crystal_quartz' },
 *   ],
 * });
 *
 * <RuntimeProp prop={prop} transparentVolumetrics />;
 * ```
 *
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/packages/core/src/compose/props/index.ts resolvePropComposition}
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/adapters/r3f/src/components/compose/RuntimeProp.tsx RuntimeProp}
 *
 * @category Basic
 * @apiExample RuntimeProp, resolvePropComposition
 */
export function Example_RuntimePropAssembly() {
  const prop = resolvePropComposition({
    id: 'api_showcase_signal_cache',
    name: 'Signal Cache',
    components: [
      {
        shape: 'box',
        size: [2.2, 1.2, 2.2],
        position: [0, 0.6, 0],
        material: 'wood_oak',
      },
      {
        shape: 'cylinder',
        size: [0.45, 1.8, 0.45],
        position: [0, 1.95, 0],
        material: 'metal_iron',
      },
      {
        shape: 'sphere',
        size: [0.9, 0.9, 0.9],
        position: [0, 3.05, 0],
        material: 'crystal_quartz',
      },
    ],
    physics: {
      type: 'static',
      mass: 72,
      friction: 0.8,
      restitution: 0.05,
    },
    interaction: {
      type: 'switch',
      action: 'activate-signal-cache',
    },
    audio: {
      interaction: 'cache_hum',
    },
  });

  return {
    component: 'RuntimeProp',
    props: {
      prop,
      position: [-2.75, 0, 0] as [number, number, number],
      transparentVolumetrics: true,
      materialOverrides: {
        ...materialOverrideForNode(prop, 0, '#7a4b24'),
        ...materialOverrideForNode(prop, 2, '#89f6ff'),
      },
      renderNode: (node: PropRuntimeNode, { material }: RuntimeShapeRenderContext) => {
        if (node.shape !== 'sphere') {
          return undefined;
        }

        return (
          <mesh position={node.position} quaternion={node.rotation ?? [0, 0, 0, 1]}>
            <sphereGeometry args={[node.size[0] / 2, 32, 20]} />
            <primitive object={material} attach="material" />
          </mesh>
        );
      },
    },
    description: 'Adapter-neutral prop runtime rendered through R3F primitives',
    apiCalls: ['resolvePropComposition', 'RuntimeProp', 'createMaterialVariant'],
    features: [
      'Runtime material slots',
      'Physics metadata derived from definitions and materials',
      'Custom node renderer hook for asset-backed replacement',
      'Volumetric material transparency',
    ],
  };
}

/**
 * Example 2: Runtime Creature and Prop Scene
 *
 * Combines a resolved creature and prop runtime plan in one R3F scene. This is
 * the preferred composition path for examples that need complete game objects
 * without bypassing the core runtime assembly data.
 *
 * @example
 * ```tsx
 * const creature = resolveCreatureComposition('otter_river');
 * const prop = resolvePropComposition('crate_wooden');
 *
 * <RuntimeCreature creature={creature} />
 * <RuntimeProp prop={prop} position={[2, 0, 0]} />
 * ```
 *
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/packages/core/src/compose/creatures/index.ts resolveCreatureComposition}
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/adapters/r3f/src/components/compose/RuntimeCreature.tsx RuntimeCreature}
 *
 * @category Complete
 * @apiExample RuntimeCreature, RuntimeProp, resolveCreatureComposition
 */
export function Example_RuntimeCompositionScene() {
  const creature = resolveCreatureComposition(
    'otter_river',
    {
      id: 'api_showcase_otter',
      name: 'Showcase Otter',
      scale: 1.25,
    },
    () => 0.65
  );
  const perch = resolvePropComposition({
    id: 'api_showcase_perch',
    name: 'Otter Perch',
    components: [
      {
        shape: 'cylinder',
        size: [2.8, 0.35, 2.8],
        position: [0, 0.175, 0],
        material: 'metal_iron',
      },
      {
        shape: 'box',
        size: [1.8, 0.35, 0.65],
        position: [0, 0.55, 0],
        material: 'wood_pine',
      },
    ],
    physics: {
      type: 'static',
      friction: 0.9,
    },
  });
  const furSlots = Object.values(creature.runtime.materialSlots);
  const highlightedFur = createMaterialVariant(furSlots[0]?.material ?? 'fur_otter', {
    id: 'api_showcase_otter_highlight',
    baseColor: '#705336',
    roughnessDelta: -0.04,
  });

  return {
    components: [
      {
        type: 'RuntimeProp',
        props: {
          prop: perch,
          position: [2.5, 0, 0] as [number, number, number],
          materialOverrides: materialOverrideForNode(perch, 1, '#d6a85d'),
        },
      },
      {
        type: 'RuntimeCreature',
        props: {
          creature,
          position: [2.5, 0.65, 0] as [number, number, number],
          materialOverrides: Object.fromEntries(furSlots.map((slot) => [slot.id, highlightedFur])),
          renderBone: (bone: CreatureRuntimeBone, { material }: RuntimeShapeRenderContext) => {
            if (bone.boneId !== 'head') {
              return undefined;
            }

            return (
              <mesh position={bone.position} quaternion={bone.rotation ?? [0, 0, 0, 1]}>
                <sphereGeometry args={[Math.max(...bone.size) / 2, 24, 16]} />
                <primitive object={material} attach="material" />
              </mesh>
            );
          },
        },
      },
    ],
    description:
      'Creature and prop runtime plans rendered together through the consolidated package',
    apiCalls: [
      'resolveCreatureComposition',
      'resolvePropComposition',
      'RuntimeCreature',
      'RuntimeProp',
    ],
    features: [
      'Runtime bone material slots',
      'Deterministic creature scale and material variation',
      'Custom bone renderer hook',
      'Composed scene objects from one npm package',
    ],
  };
}

/**
 * Example 3: Runtime Creature Animation Graph and IK Targets
 *
 * Uses core creature runtime metadata to inspect graph transitions and build a
 * deterministic IK target preview before rendering the creature. Imported
 * assets can use the same graph through `RuntimeCreatureAsset`, while the IK
 * pose can be applied to loaded Three.js bones with `applyRuntimeCreatureIKPose`.
 *
 * @example
 * ```tsx
 * const creature = resolveCreatureComposition('otter_river');
 * const chainTargets = {
 *   leg_front_l_ik: [0.45, -0.15, 0.25],
 *   leg_front_r_ik: [0.45, -0.15, -0.25],
 * };
 * const ikPreview = createRuntimeCreatureIKPose(creature.runtime.ikRig, chainTargets);
 *
 * const graphController = createRuntimeCreatureAnimationGraphController(controller, creature.runtime.animationGraph, {
 *   guards: { canSprint: () => true, canSwim: () => true },
 * });
 * graphController.trigger('sprint');
 * ```
 *
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/adapters/r3f/src/components/compose/RuntimeCreatureAsset.tsx createRuntimeCreatureAnimationGraphController}
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/adapters/r3f/src/components/compose/RuntimeCreatureAsset.tsx createRuntimeCreatureIKPose}
 *
 * @category Advanced
 * @apiExample RuntimeCreature, createRuntimeCreatureAnimationGraphController, createRuntimeCreatureIKPose
 */
export function Example_RuntimeCreatureAnimationGraphAndIK() {
  const creature = resolveCreatureComposition(
    'otter_river',
    {
      id: 'api_showcase_otter_graph_ik',
      name: 'Graph + IK Showcase Otter',
      scale: 1.35,
    },
    () => 0.2
  );
  const graphController = createRuntimeCreatureAnimationGraphController(
    {
      creature: creature.runtime,
      actions: {},
      resolveClipName: (animation: string) => animation,
      getAction: () => undefined,
      play: () => undefined,
      crossFade: () => undefined,
      stop: () => false,
      stopAll: () => undefined,
    } satisfies RuntimeCreatureAnimationController,
    creature.runtime.animationGraph,
    {
      guards: {
        canSprint: ({ controller }) => controller.creature.stats.stamina !== undefined,
        canSwim: ({ controller }) => controller.creature.stats.swimSpeed !== undefined,
      },
    }
  );
  const ikTargets = Object.fromEntries(
    creature.runtime.ikRig.ready.map((chain, index) => {
      const base = chain.bones[0]?.position ?? [0, 0, 0];

      return [
        chain.id,
        [base[0] + 0.1, base[1] - 0.18, base[2] + (index % 2 === 0 ? 0.22 : -0.22)] as [
          number,
          number,
          number,
        ],
      ];
    })
  );
  const ikPreview = createRuntimeCreatureIKPose(creature.runtime.ikRig, ikTargets);
  const posedBones = new Map(
    ikPreview.flatMap((chain) =>
      Object.entries(chain.pose).map(([runtimeBoneId, transform]) => [runtimeBoneId, transform])
    )
  );
  const reachableChains = ikPreview.filter((chain) => chain.reached).length;
  const highlightedFur = createMaterialVariant('fur_otter', {
    id: 'api_showcase_otter_ik_highlight',
    baseColor: '#9b6a38',
    roughnessDelta: -0.05,
  });

  return {
    component: 'RuntimeCreature',
    props: {
      creature,
      position: [1.75, 0.85, 0] as [number, number, number],
      materialOverrides: Object.fromEntries(
        Object.values(creature.runtime.materialSlots).map((slot) => [slot.id, highlightedFur])
      ),
      renderBone: (bone: CreatureRuntimeBone, { material }: RuntimeShapeRenderContext) => {
        const transform = posedBones.get(bone.id);

        if (!transform?.position) {
          return undefined;
        }

        return (
          <mesh position={transform.position} quaternion={bone.rotation ?? [0, 0, 0, 1]}>
            <sphereGeometry args={[Math.max(...bone.size) / 2, 20, 12]} />
            <primitive object={material} attach="material" />
          </mesh>
        );
      },
    },
    description:
      'Core animation graph transitions and IK chain targets previewed through R3F runtime helpers',
    apiCalls: [
      'resolveCreatureComposition',
      'createRuntimeCreatureAnimationGraphController',
      'createRuntimeCreatureIKPose',
      'RuntimeCreature',
    ],
    features: [
      `Animation graph initial state: ${graphController.initialState}`,
      `Available idle events: ${graphController
        .getAvailableTransitions()
        .map((transition) => transition.event)
        .join(', ')}`,
      `Swim transition guard result: ${String(graphController.canTrigger('enter-water'))}`,
      `IK chains previewed: ${ikPreview.length} (${reachableChains} within reach)`,
    ],
  };
}
