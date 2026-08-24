import { describe, expect, it } from 'vitest';
import * as materials from '../index';

/**
 * The public surface of `src/compose/materials`, as re-exported through
 * `src/compose/index.ts` and in turn the package root. Consumers outside this
 * repository (adapters/r3f, adapters/reactylon) import these names, so this
 * list is a compatibility contract: adding to it is a feature, removing from
 * or renaming within it is a breaking change.
 */
const PUBLIC_EXPORTS = [
  'MATERIALS',
  'cloneMaterialDefinition',
  'createFurMaterial',
  'createMaterialProceduralBakeArtifacts',
  'createMaterialProceduralBakeBasisUniversalKtx2Encoder',
  'createMaterialProceduralBakeBrowserImageEncoder',
  'createMaterialProceduralBakeExportPlan',
  'createMaterialProceduralBakePlan',
  'createMaterialProceduralPlan',
  'createMaterialTrait',
  'createMaterialVariant',
  'createMaterialVariants',
  'createMetalMaterial',
  'createOrganicMaterial',
  'createShellMaterial',
  'createVolumetricMaterial',
  'createWoodMaterial',
  'encodeMaterialProceduralBakeExportPlan',
  'encodeMaterialProceduralBakeImagePng',
  'encodeMaterialProceduralBakeRasterPng',
  'inferMaterialTraits',
  'rasterizeMaterialProceduralBakePlan',
  'resolveMaterialDefinition',
] as const;

describe('materials public API', () => {
  it('exports exactly the documented surface, with nothing missing', () => {
    for (const name of PUBLIC_EXPORTS) {
      expect(Object.keys(materials)).toContain(name);
    }
  });

  it('exports nothing beyond the documented surface', () => {
    expect(Object.keys(materials).sort()).toEqual([...PUBLIC_EXPORTS].sort());
  });

  it('exposes every non-registry export as a callable function', () => {
    const surface: Record<string, unknown> = { ...materials };

    for (const name of PUBLIC_EXPORTS) {
      if (name === 'MATERIALS') {
        continue;
      }
      expect(typeof surface[name]).toBe('function');
    }
  });

  it('wires the barrel to the same implementations the submodules export', async () => {
    const [presets, traits, procedural, bake, png, bakeExport, variants] = await Promise.all([
      import('../presets'),
      import('../traits'),
      import('../procedural'),
      import('../bake'),
      import('../png'),
      import('../bake-export'),
      import('../variants'),
    ]);

    expect(materials.MATERIALS).toBe(presets.MATERIALS);
    expect(materials.resolveMaterialDefinition).toBe(presets.resolveMaterialDefinition);
    expect(materials.inferMaterialTraits).toBe(traits.inferMaterialTraits);
    expect(materials.createMaterialProceduralPlan).toBe(procedural.createMaterialProceduralPlan);
    expect(materials.rasterizeMaterialProceduralBakePlan).toBe(
      bake.rasterizeMaterialProceduralBakePlan
    );
    expect(materials.encodeMaterialProceduralBakeImagePng).toBe(
      png.encodeMaterialProceduralBakeImagePng
    );
    expect(materials.createMaterialProceduralBakeArtifacts).toBe(
      bakeExport.createMaterialProceduralBakeArtifacts
    );
    expect(materials.createMaterialVariants).toBe(variants.createMaterialVariants);
  });

  it('runs the full preset-to-png pipeline through the public API alone', () => {
    const plan = materials.createMaterialProceduralBakePlan('wood_oak', {
      inferTraits: true,
      channels: ['baseColor'],
      textureSize: [4, 4],
    });
    const raster = materials.rasterizeMaterialProceduralBakePlan(plan);
    const encoded = materials.encodeMaterialProceduralBakeRasterPng(raster);

    expect(plan.targets).toHaveLength(1);
    expect(raster.images[0].data).toHaveLength(4 * 4 * 4);
    expect(encoded[0].fileName).toBe('wood_oak.baseColor.png');
    expect(encoded[0].data[0]).toBe(137);
  });
});
