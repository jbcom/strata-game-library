/**
 * Shader exports
 */

export type { CloudLayerUniforms, VolumetricCloudUniforms } from './clouds';
// Cloud shaders
export {
    cloudLayerFragmentShader,
    cloudLayerVertexShader,
    createCloudLayerUniforms,
    createVolumetricCloudUniforms,
    volumetricCloudFragmentShader,
    volumetricCloudVertexShader,
} from './clouds';
export type { FurConfig } from './fur';
// Fur/shell shaders
export { createFurUniforms, defaultFurConfig, furFragmentShader, furVertexShader } from './fur';
export type {
    GodRaysUniforms,
    VolumetricPointLightUniforms,
    VolumetricSpotlightUniforms,
} from './godRays';
// God rays shaders
export {
    createGodRaysUniforms,
    createVolumetricPointLightUniforms,
    createVolumetricSpotlightUniforms,
    godRaysFragmentShader,
    godRaysVertexShader,
    volumetricPointLightFragmentShader,
    volumetricPointLightVertexShader,
    volumetricSpotlightFragmentShader,
    volumetricSpotlightVertexShader,
} from './godRays';

// Instancing wind shader
export { instancingWindVertexShader } from './instancing-wind';
export type {
    CrystalMaterialOptions,
    DissolveMaterialOptions,
    ForcefieldMaterialOptions,
    GlitchMaterialOptions,
    GradientMaterialOptions,
    HologramMaterialOptions,
    OutlineMaterialOptions,
    ScanlineMaterialOptions,
    ToonMaterialOptions,
} from './materials';
// Custom shader materials
export {
    createCrystalMaterial,
    createDissolveMaterial,
    createForcefieldMaterial,
    createGlitchMaterial,
    createGradientMaterial,
    createHologramMaterial,
    createOutlineMaterial,
    createScanlineMaterial,
    createToonMaterial,
} from './materials';
// Ray marching shaders
export { raymarchingFragmentShader, raymarchingVertexShader } from './raymarching';
export type { SkyUniforms } from './sky';
// Sky shaders
export { createSkyUniforms, skyFragmentShader, skyVertexShader } from './sky';
// Terrain shaders
export {
    createSimpleTerrainUniforms,
    createTerrainUniforms,
    simpleTerrainFragmentShader,
    simpleTerrainVertexShader,
    terrainFragmentShader,
    terrainVertexShader,
} from './terrain';
// Volumetric shaders
export {
    atmosphereShader,
    dustParticlesShader,
    underwaterShader,
    volumetricFogShader,
} from './volumetrics';
export type {
    UnderwaterOverlayUniforms,
    VolumetricFogMeshUniforms,
} from './volumetrics-components';
// Volumetric component shaders
export {
    createUnderwaterOverlayUniforms,
    createVolumetricFogMeshUniforms,
    underwaterOverlayFragmentShader,
    underwaterOverlayVertexShader,
    volumetricFogMeshFragmentShader,
    volumetricFogMeshVertexShader,
} from './volumetrics-components';
// Water shaders
export {
    advancedWaterFragmentShader,
    advancedWaterVertexShader,
    createAdvancedWaterUniforms,
    createWaterUniforms,
    waterFragmentShader,
    waterVertexShader,
} from './water';
