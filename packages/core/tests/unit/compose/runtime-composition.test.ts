import { describe, expect, it } from 'vitest';
import {
  createCreatureRigBindingPlan,
  createMaterialProceduralBakeArtifacts,
  createMaterialProceduralBakeExportPlan,
  createMaterialProceduralBakePlan,
  createMaterialProceduralPlan,
  createMaterialVariant,
  createMaterialVariants,
  createPropInteractionController,
  encodeMaterialProceduralBakeExportPlan,
  encodeMaterialProceduralBakeRasterPng,
  executePropInteractionAction,
  inferMaterialTraits,
  rasterizeMaterialProceduralBakePlan,
  resolveCreatureComposition,
  resolvePropComposition,
} from '../../../src/compose';

describe('runtime composition assembly', () => {
  it('creates deterministic material variants with physics metadata', () => {
    const variant = createMaterialVariant('wood_oak', {
      id: 'weathered_oak',
      roughnessDelta: 0.2,
      physics: { friction: 0.9 },
    });

    expect(variant.id).toBe('weathered_oak');
    expect(variant.roughness).toBeCloseTo(0.8);
    expect(variant.physics).toEqual({
      density: 700,
      friction: 0.9,
      restitution: 0.25,
    });

    const variants = createMaterialVariants('metal_iron', {
      count: 2,
      idPrefix: 'band_iron',
      roughnessJitter: 0.1,
      rng: () => 1,
    });

    expect(variants.map((material) => material.id)).toEqual(['band_iron_1', 'band_iron_2']);
    expect(variants[0]?.roughness).toBeCloseTo(0.5);
  });

  it('infers serializable procedural material traits', () => {
    const woodTraits = inferMaterialTraits('wood_oak', { seed: 7 });

    expect(woodTraits[0]).toMatchObject({
      id: 'wood_oak:grain:oak',
      type: 'grain',
      seed: 7,
      channels: ['baseColor', 'roughness', 'normal'],
      tags: ['wood', 'oak'],
    });

    const scratched = createMaterialVariant('metal_iron', {
      id: 'scratched_iron',
      appendTraits: inferMaterialTraits('metal_iron', { seed: 11 }),
    });

    expect(scratched.traits?.[0]).toMatchObject({
      id: 'metal_iron:scratches',
      type: 'scratches',
      seed: 34,
    });

    const plan = createMaterialProceduralPlan(scratched);
    expect(plan.materialId).toBe('scratched_iron');
    expect(plan.layers[0]).toMatchObject({
      traitId: 'metal_iron:scratches',
      type: 'scratches',
      algorithm: 'scratch-lines',
      channels: ['roughness', 'normal', 'metalness'],
    });
    expect(plan.channelLayers.roughness).toEqual([plan.layers[0]?.id]);
    expect(plan.uniforms.map((uniform) => uniform.name)).toContain(
      `${plan.layers[0]?.functionName}_intensity`
    );
    expect(plan.shaderChunk).toContain(`float ${plan.layers[0]?.functionName}`);

    const bake = createMaterialProceduralBakePlan(scratched, {
      textureSize: [512, 256],
      channels: ['baseColor', 'roughness', 'normal'],
      format: 'webp',
      filePrefix: 'bakes/scratched_iron',
    });

    expect(bake.targets.map((target) => target.channel)).toEqual(['roughness', 'normal']);
    expect(bake.targets[0]).toMatchObject({
      map: 'roughness',
      textureSize: [512, 256],
      format: 'webp',
      colorSpace: 'linear',
      fileName: 'bakes/scratched_iron.roughness.webp',
    });
    expect(bake.targets[1]).toMatchObject({
      map: 'normal',
      colorSpace: 'normal',
    });
    expect(bake.manifest.targets).toEqual([
      {
        channel: 'roughness',
        map: 'roughness',
        fileName: 'bakes/scratched_iron.roughness.webp',
        colorSpace: 'linear',
      },
      {
        channel: 'normal',
        map: 'normal',
        fileName: 'bakes/scratched_iron.normal.webp',
        colorSpace: 'normal',
      },
    ]);

    const smallBake = createMaterialProceduralBakePlan(scratched, {
      textureSize: [8, 4],
      channels: ['roughness', 'normal'],
    });
    const raster = rasterizeMaterialProceduralBakePlan(smallBake);
    const roughness = raster.images.find((image) => image.channel === 'roughness');
    const normal = raster.images.find((image) => image.channel === 'normal');

    expect(roughness).toMatchObject({
      width: 8,
      height: 4,
      colorSpace: 'linear',
    });
    expect(roughness?.data).toHaveLength(8 * 4 * 4);
    expect(
      new Set(Array.from(roughness?.data.filter((_, index) => index % 4 === 0) ?? [])).size
    ).toBeGreaterThan(1);
    expect(normal).toMatchObject({
      width: 8,
      height: 4,
      colorSpace: 'normal',
    });
    expect(normal?.data[2]).toBe(255);
    expect(
      Array.from(rasterizeMaterialProceduralBakePlan(smallBake).images[0]?.data ?? [])
    ).toEqual(Array.from(roughness?.data ?? []));

    const encoded = encodeMaterialProceduralBakeRasterPng(raster);

    expect(encoded[0]).toMatchObject({
      fileName: 'scratched_iron.roughness.png',
      mimeType: 'image/png',
    });
    expect(Array.from(encoded[0]?.data.slice(0, 8) ?? [])).toEqual([
      137, 80, 78, 71, 13, 10, 26, 10,
    ]);
    expect(Array.from(encodeMaterialProceduralBakeRasterPng(raster)[0]?.data ?? [])).toEqual(
      Array.from(encoded[0]?.data ?? [])
    );

    const pngExports = createMaterialProceduralBakeExportPlan(raster, { format: 'png' });
    const encodedPngExports = encodeMaterialProceduralBakeExportPlan(pngExports);

    expect(encodedPngExports[0]).toMatchObject({
      format: 'png',
      fileName: 'scratched_iron.roughness.png',
      mimeType: 'image/png',
      encoder: 'builtin-png',
    });
    expect(Array.from(encodedPngExports[0]?.data.slice(0, 8) ?? [])).toEqual([
      137, 80, 78, 71, 13, 10, 26, 10,
    ]);

    const webpExports = createMaterialProceduralBakeExportPlan(
      rasterizeMaterialProceduralBakePlan(bake),
      { quality: 0.82 }
    );

    expect(webpExports.requests[0]).toMatchObject({
      format: 'webp',
      fileName: 'bakes/scratched_iron.roughness.webp',
      mimeType: 'image/webp',
      encoder: 'browser-image-encoder',
      options: { quality: 0.82 },
    });
    expect(webpExports.manifest.targets[0]).toMatchObject({
      format: 'webp',
      mimeType: 'image/webp',
      encoder: 'browser-image-encoder',
    });

    const smallWebpExports = createMaterialProceduralBakeExportPlan(raster, {
      format: 'webp',
      quality: 0.82,
    });
    const encodedWebpExports = encodeMaterialProceduralBakeExportPlan(smallWebpExports, {
      encoders: {
        'browser-image-encoder': (request) =>
          new Uint8Array([
            request.width,
            request.height,
            Math.round((request.options.quality ?? 0) * 100),
          ]),
      },
    });

    expect(encodedWebpExports[0]).toMatchObject({
      format: 'webp',
      mimeType: 'image/webp',
      encoder: 'browser-image-encoder',
    });
    expect(Array.from(encodedWebpExports[0]?.data ?? [])).toEqual([8, 4, 82]);

    const ktx2Exports = createMaterialProceduralBakeExportPlan(raster, {
      format: 'ktx2',
      filePrefix: 'gpu/scratched_iron',
      compressionLevel: 4,
      generateMipmaps: true,
    });

    expect(ktx2Exports.requests[0]).toMatchObject({
      format: 'ktx2',
      fileName: 'gpu/scratched_iron.roughness.ktx2',
      mimeType: 'image/ktx2',
      encoder: 'basis-universal-ktx2',
      options: { compressionLevel: 4, generateMipmaps: true },
    });
    expect(Array.from(ktx2Exports.requests[0]?.data ?? [])).toEqual(
      Array.from(raster.images[0]?.data ?? [])
    );

    const encodedKtx2Exports = encodeMaterialProceduralBakeExportPlan(ktx2Exports, {
      encoders: {
        'basis-universal-ktx2': (request) =>
          new Uint8Array([
            request.options.compressionLevel ?? 0,
            request.options.generateMipmaps ? 1 : 0,
          ]),
      },
    });

    expect(encodedKtx2Exports[0]).toMatchObject({
      format: 'ktx2',
      fileName: 'gpu/scratched_iron.roughness.ktx2',
      mimeType: 'image/ktx2',
      encoder: 'basis-universal-ktx2',
    });
    expect(Array.from(encodedKtx2Exports[0]?.data ?? [])).toEqual([4, 1]);
    expect(() => encodeMaterialProceduralBakeExportPlan(ktx2Exports)).toThrow(
      'No procedural bake export encoder registered for "basis-universal-ktx2"'
    );

    const artifacts = createMaterialProceduralBakeArtifacts(scratched, {
      textureSize: [4, 4],
      channels: ['roughness'],
    });

    expect(artifacts.plan.targets).toHaveLength(1);
    expect(artifacts.raster.images[0]?.data).toHaveLength(4 * 4 * 4);
    expect(artifacts.png[0]?.mimeType).toBe('image/png');
    expect(artifacts.exports.requests[0]?.encoder).toBe('builtin-png');
  });

  it('resolves props into adapter-neutral runtime nodes', () => {
    const composition = resolvePropComposition('crate_wooden');
    const { runtime } = composition;

    expect(runtime.kind).toBe('prop');
    expect(runtime.nodes).toHaveLength(composition.components.length);
    expect(runtime.bounds.size.every((size) => size > 0)).toBe(true);
    expect(runtime.physics).toMatchObject({
      mode: 'dynamic',
      mass: 25,
      friction: 0.6,
      source: 'mixed',
    });
    expect(runtime.interaction).toMatchObject({ type: 'container', capacity: 10 });
    expect(runtime.interactionActions[0]).toMatchObject({
      id: 'crate_wooden:interaction:container',
      type: 'container',
      action: 'open-container',
      label: 'Open Wooden Crate',
      enabled: true,
      audio: 'crate_open',
      payload: { capacity: 10 },
    });
    expect(runtime.interactionActions[0]?.nodeIds).toEqual(runtime.nodes.map((node) => node.id));

    const woodNode = runtime.nodes.find((node) => node.materialId === 'wood_oak');
    expect(woodNode).toBeDefined();
    expect(woodNode?.position).toHaveLength(3);
    expect(woodNode?.physics.mass).toBeGreaterThan(0);
    expect(runtime.materialSlots[woodNode?.materialSlot ?? '']?.swappableWith).toContain(
      'wood_pine'
    );
  });

  it('executes prop runtime interaction actions as deterministic state effects', () => {
    const crate = resolvePropComposition('crate_wooden', {
      interaction: { type: 'container', capacity: 10, contents: ['coin', 'potion'] },
    }).runtime;
    const containerResult = executePropInteractionAction(
      crate,
      'crate_wooden:interaction:container'
    );

    expect(containerResult.status).toBe('executed');
    expect(containerResult.nextState.open).toBe(true);
    expect(containerResult.effects).toEqual([
      { type: 'audio', cue: 'crate_open' },
      { type: 'state', key: 'open', value: true },
      { type: 'inventory', operation: 'inspect', items: ['coin', 'potion'] },
    ]);

    const switchProp = resolvePropComposition({
      id: 'lever_a',
      name: 'Lever A',
      components: [
        {
          shape: 'box',
          size: [0.2, 0.8, 0.2],
          position: [0, 0, 0],
          material: 'metal_iron',
        },
      ],
      interaction: { type: 'switch', action: 'raise_gate' },
    }).runtime;
    const switchResult = executePropInteractionAction(switchProp, 'lever_a:interaction:switch', {
      active: false,
    });

    expect(switchResult.nextState.active).toBe(true);
    expect(switchResult.effects).toContainEqual({ type: 'state', key: 'active', value: true });
    expect(switchResult.effects).toContainEqual({ type: 'command', command: 'raise_gate' });

    const door = resolvePropComposition({
      id: 'door_oak',
      name: 'Oak Door',
      components: [
        {
          shape: 'box',
          size: [1, 2, 0.2],
          position: [0, 0, 0],
          material: 'wood_oak',
        },
      ],
      interaction: { type: 'door' },
    }).runtime;
    const doorResult = executePropInteractionAction(door, 'door_oak:interaction:door');

    expect(doorResult.effects).toContainEqual({
      type: 'physics',
      operation: 'set-mode',
      nodeIds: door.nodes.map((node) => node.id),
      mode: 'kinematic',
    });

    const collectible = resolvePropComposition({
      id: 'coin_gold',
      name: 'Gold Coin',
      components: [
        {
          shape: 'sphere',
          size: [0.2, 0.2, 0.2],
          position: [0, 0, 0],
          material: 'metal_gold',
        },
      ],
      interaction: { type: 'collectible', contents: ['coin_gold'] },
    }).runtime;
    const collected = executePropInteractionAction(
      collectible,
      'coin_gold:interaction:collectible'
    );

    expect(collected.status).toBe('executed');
    expect(collected.nextState.collected).toBe(true);
    expect(collected.nextState.disabledActionIds).toEqual(['coin_gold:interaction:collectible']);
    expect(collected.effects).toContainEqual({
      type: 'inventory',
      operation: 'collect',
      items: ['coin_gold'],
    });
    expect(collected.effects).toContainEqual({
      type: 'physics',
      operation: 'disable-collider',
      nodeIds: collectible.nodes.map((node) => node.id),
    });

    expect(
      executePropInteractionAction(collectible, 'coin_gold:interaction:collectible', {
        collected: true,
      }).status
    ).toBe('already-collected');

    const controller = createPropInteractionController(collectible);
    const controlledCollect = controller.execute('coin_gold:interaction:collectible');

    expect(controlledCollect.status).toBe('executed');
    expect(controller.getState().collected).toBe(true);
    expect(controller.execute('coin_gold:interaction:collectible').status).toBe('disabled');
    expect(controller.reset().collected).toBeUndefined();
  });

  it('resolves creatures into runtime bones, materials, animation bindings, and spawn metadata', () => {
    const composition = resolveCreatureComposition('otter_river', {}, () => 0.5);
    const { runtime } = composition;

    expect(runtime.kind).toBe('creature');
    expect(runtime.scale).toBe(1);
    expect(runtime.bones).toHaveLength(composition.skeleton.bones.length);
    expect(runtime.bounds.size.every((size) => size > 0)).toBe(true);
    expect(runtime.physics.mode).toBe('dynamic');
    expect(runtime.physics.mass).toBeGreaterThan(0);
    expect(runtime.physics.source).toBe('material');
    expect(runtime.spawn).toMatchObject({
      biomes: ['marsh'],
      spawnWeight: 0.4,
      packSize: [2, 6],
    });

    const head = runtime.bones.find((bone) => bone.boneId === 'head');
    expect(head).toBeDefined();
    expect(head?.position[0]).toBeGreaterThan(0);
    expect(head?.material.baseColor).toBe('#4a3520');
    expect(runtime.materialSlots[head?.materialSlot ?? '']?.swappableWith).toContain('fur_fox');

    const idle = runtime.animations.find((animation) => animation.name === 'idle');
    expect(idle?.clip).toBe('otter_idle');
    expect(idle?.targetBones).toHaveLength(composition.skeleton.bones.length);
  });

  it('carries creature asset bindings into runtime assemblies', () => {
    const composition = resolveCreatureComposition(
      'otter_river',
      {
        assets: {
          model: '/models/otter.glb',
          rig: '/models/otter-rig.glb',
          animationClips: {
            idle: 'Idle',
            swim: 'Swim',
          },
          boneMap: {
            body: 'Spine',
          },
        },
      },
      () => 0.5
    );

    expect(composition.runtime.asset).toEqual({
      model: '/models/otter.glb',
      rig: '/models/otter-rig.glb',
      animationClips: {
        idle: 'Idle',
        swim: 'Swim',
      },
      boneMap: {
        body: 'Spine',
      },
    });
  });

  it('creates verifiable creature rig binding plans from asset bone maps', () => {
    const composition = resolveCreatureComposition(
      {
        id: 'rigged_creature',
        skeleton: {
          id: 'rigged_skeleton',
          type: 'custom',
          bones: [
            {
              id: 'body',
              shape: 'box',
              size: [1, 1, 1],
              position: [0, 0, 0],
            },
            {
              id: 'head',
              parent: 'body',
              shape: 'sphere',
              size: [0.5, 0.5, 0.5],
              position: [0.5, 0, 0],
            },
          ],
          animationTargets: {
            idle: ['body'],
            look: ['head'],
          },
        },
        covering: {
          skeleton: 'rigged_skeleton',
          regions: {
            '*': { material: 'fur_otter' },
          },
        },
        stats: { health: 10, speed: 3 },
        ai: 'prey',
        animations: {
          idle: 'idle',
          walk: 'walk',
          run: 'run',
          look: 'look',
        },
        assets: {
          model: '/models/rigged.glb',
          rig: '/models/rigged-rig.glb',
          boneMap: {
            body: 'Spine',
          },
        },
        biomes: [],
        spawnWeight: 1,
      },
      {},
      () => 0.5
    );
    const verified = createCreatureRigBindingPlan(composition.runtime, ['Spine', 'UnusedJaw']);
    const body = verified.bindings.find((binding) => binding.boneId === 'body');
    const head = verified.bindings.find((binding) => binding.boneId === 'head');
    const unverified = createCreatureRigBindingPlan(composition.runtime);

    expect(body).toMatchObject({
      sourceBone: 'Spine',
      explicit: true,
      status: 'matched',
      animationTargets: ['idle'],
    });
    expect(head).toMatchObject({
      sourceBone: 'head',
      explicit: false,
      status: 'missing',
      animationTargets: ['look'],
    });
    expect(verified.unmappedSourceBones).toEqual(['UnusedJaw']);
    expect(verified.coverage).toMatchObject({
      total: 2,
      matched: 1,
      missing: 1,
      unverified: 0,
      matchedRatio: 0.5,
    });
    expect(unverified.unverified).toHaveLength(2);
    expect(unverified.coverage.unverified).toBe(2);
  });

  it('estimates capsule runtime volumes by longest axis across props and creatures', () => {
    const longYProp = resolvePropComposition({
      id: 'capsule_y_prop',
      components: [
        {
          shape: 'capsule',
          size: [1, 4, 1],
          position: [0, 0, 0],
          material: 'wood_oak',
        },
      ],
    });
    const longXProp = resolvePropComposition({
      id: 'capsule_x_prop',
      components: [
        {
          shape: 'capsule',
          size: [4, 1, 1],
          position: [0, 0, 0],
          material: 'wood_oak',
        },
      ],
    });
    const creature = resolveCreatureComposition({
      id: 'capsule_creature',
      skeleton: {
        id: 'capsule_skeleton',
        type: 'custom',
        bones: [
          {
            id: 'body',
            shape: 'capsule',
            size: [4, 1, 1],
            position: [0, 0, 0],
          },
        ],
      },
      covering: {
        skeleton: 'capsule_skeleton',
        regions: {
          '*': { material: 'fur_otter' },
        },
      },
      stats: { health: 1, speed: 1 },
      ai: 'prey',
      biomes: [],
      spawnWeight: 1,
    });

    const propVolume = longYProp.runtime.nodes[0]?.volume ?? 0;

    expect(longXProp.runtime.nodes[0]?.volume).toBeCloseTo(propVolume);
    expect(creature.runtime.bones[0]?.volume).toBeCloseTo(propVolume);
  });
});
