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
import type { RuntimeShapeRenderContext } from 'strata-game-library/r3f';

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
