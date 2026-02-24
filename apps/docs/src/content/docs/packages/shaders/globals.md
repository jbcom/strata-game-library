---
title: Globals
---

[**@strata-game-library/shaders**](README.md)

***

# @strata-game-library/shaders

@strata/shaders

GLSL shader collection for Strata 3D.
Provides terrain, water, clouds, volumetric effects, and more.

These shaders are standalone and can be used with any Three.js project.

## Interfaces

- [AdvancedWaterUniforms](interfaces/AdvancedWaterUniforms.md)
- [AtmosphereUniforms](interfaces/AtmosphereUniforms.md)
- [CloudLayerUniforms](interfaces/CloudLayerUniforms.md)
- [CrystalMaterialOptions](interfaces/CrystalMaterialOptions.md)
- [DissolveMaterialOptions](interfaces/DissolveMaterialOptions.md)
- [DustParticlesUniforms](interfaces/DustParticlesUniforms.md)
- [ForcefieldMaterialOptions](interfaces/ForcefieldMaterialOptions.md)
- [FurConfig](interfaces/FurConfig.md)
- [FurUniforms](interfaces/FurUniforms.md)
- [GlitchMaterialOptions](interfaces/GlitchMaterialOptions.md)
- [GodRaysUniforms](interfaces/GodRaysUniforms.md)
- [GradientMaterialOptions](interfaces/GradientMaterialOptions.md)
- [HologramMaterialOptions](interfaces/HologramMaterialOptions.md)
- [InstancingWindUniforms](interfaces/InstancingWindUniforms.md)
- [IUniforms](interfaces/IUniforms.md)
- [OutlineMaterialOptions](interfaces/OutlineMaterialOptions.md)
- [RaymarchingUniforms](interfaces/RaymarchingUniforms.md)
- [ScanlineMaterialOptions](interfaces/ScanlineMaterialOptions.md)
- [SimpleTerrainUniforms](interfaces/SimpleTerrainUniforms.md)
- [SkyUniforms](interfaces/SkyUniforms.md)
- [TerrainUniforms](interfaces/TerrainUniforms.md)
- [ToonMaterialOptions](interfaces/ToonMaterialOptions.md)
- [UnderwaterOverlayUniforms](interfaces/UnderwaterOverlayUniforms.md)
- [UnderwaterUniforms](interfaces/UnderwaterUniforms.md)
- [VolumetricCloudUniforms](interfaces/VolumetricCloudUniforms.md)
- [VolumetricFogMeshUniforms](interfaces/VolumetricFogMeshUniforms.md)
- [VolumetricFogUniforms](interfaces/VolumetricFogUniforms.md)
- [VolumetricPointLightUniforms](interfaces/VolumetricPointLightUniforms.md)
- [VolumetricSpotlightUniforms](interfaces/VolumetricSpotlightUniforms.md)
- [WaterUniforms](interfaces/WaterUniforms.md)

## Type Aliases

- [ColorRepresentation](type-aliases/ColorRepresentation.md)
- [UniformValue](type-aliases/UniformValue.md)
- [Vector2Representation](type-aliases/Vector2Representation.md)
- [Vector3Representation](type-aliases/Vector3Representation.md)

## Variables

- [advancedWaterFragmentShader](variables/advancedWaterFragmentShader.md)
- [advancedWaterVertexShader](variables/advancedWaterVertexShader.md)
- [atmosphereFragmentShader](variables/atmosphereFragmentShader.md)
- [atmosphereShader](variables/atmosphereShader.md)
- [atmosphereVertexShader](variables/atmosphereVertexShader.md)
- [cloudLayerFragmentShader](variables/cloudLayerFragmentShader.md)
- [cloudLayerVertexShader](variables/cloudLayerVertexShader.md)
- [defaultFurConfig](variables/defaultFurConfig.md)
- [dustParticlesFragmentShader](variables/dustParticlesFragmentShader.md)
- [dustParticlesShader](variables/dustParticlesShader.md)
- [dustParticlesVertexShader](variables/dustParticlesVertexShader.md)
- [furFragmentShader](variables/furFragmentShader.md)
- [furVertexShader](variables/furVertexShader.md)
- [godRaysFragmentShader](variables/godRaysFragmentShader.md)
- [godRaysVertexShader](variables/godRaysVertexShader.md)
- [instancingWindVertexShader](variables/instancingWindVertexShader.md)
- [MathChunks](variables/MathChunks.md)
- [NoiseChunks](variables/NoiseChunks.md)
- [noiseSnippet](variables/noiseSnippet.md)
- [raymarchingFragmentShader](variables/raymarchingFragmentShader.md)
- [raymarchingVertexShader](variables/raymarchingVertexShader.md)
- [ShaderChunks](variables/ShaderChunks.md)
- [simpleTerrainFragmentShader](variables/simpleTerrainFragmentShader.md)
- [simpleTerrainVertexShader](variables/simpleTerrainVertexShader.md)
- [skyFragmentShader](variables/skyFragmentShader.md)
- [skyVertexShader](variables/skyVertexShader.md)
- [terrainFragmentShader](variables/terrainFragmentShader.md)
- [terrainVertexShader](variables/terrainVertexShader.md)
- [underwaterFragmentShader](variables/underwaterFragmentShader.md)
- [underwaterOverlayFragmentShader](variables/underwaterOverlayFragmentShader.md)
- [underwaterOverlayVertexShader](variables/underwaterOverlayVertexShader.md)
- [underwaterShader](variables/underwaterShader.md)
- [underwaterVertexShader](variables/underwaterVertexShader.md)
- [volumetricCloudFragmentShader](variables/volumetricCloudFragmentShader.md)
- [volumetricCloudVertexShader](variables/volumetricCloudVertexShader.md)
- [volumetricFogFragmentShader](variables/volumetricFogFragmentShader.md)
- [volumetricFogMeshFragmentShader](variables/volumetricFogMeshFragmentShader.md)
- [volumetricFogMeshVertexShader](variables/volumetricFogMeshVertexShader.md)
- [volumetricFogShader](variables/volumetricFogShader.md)
- [volumetricFogVertexShader](variables/volumetricFogVertexShader.md)
- [volumetricPointLightFragmentShader](variables/volumetricPointLightFragmentShader.md)
- [volumetricPointLightVertexShader](variables/volumetricPointLightVertexShader.md)
- [volumetricSpotlightFragmentShader](variables/volumetricSpotlightFragmentShader.md)
- [volumetricSpotlightVertexShader](variables/volumetricSpotlightVertexShader.md)
- [waterFragmentShader](variables/waterFragmentShader.md)
- [waterVertexShader](variables/waterVertexShader.md)

## Functions

- [createAdvancedWaterUniforms](functions/createAdvancedWaterUniforms.md)
- [createAtmosphereUniforms](functions/createAtmosphereUniforms.md)
- [createCloudLayerUniforms](functions/createCloudLayerUniforms.md)
- [createCrystalMaterial](functions/createCrystalMaterial.md)
- [createDissolveMaterial](functions/createDissolveMaterial.md)
- [createDustParticlesUniforms](functions/createDustParticlesUniforms.md)
- [createForcefieldMaterial](functions/createForcefieldMaterial.md)
- [createFurUniforms](functions/createFurUniforms.md)
- [createGlitchMaterial](functions/createGlitchMaterial.md)
- [createGodRaysUniforms](functions/createGodRaysUniforms.md)
- [createGradientMaterial](functions/createGradientMaterial.md)
- [createHologramMaterial](functions/createHologramMaterial.md)
- [createInstancingWindUniforms](functions/createInstancingWindUniforms.md)
- [createOutlineMaterial](functions/createOutlineMaterial.md)
- [createRaymarchingUniforms](functions/createRaymarchingUniforms.md)
- [createScanlineMaterial](functions/createScanlineMaterial.md)
- [createSimpleTerrainUniforms](functions/createSimpleTerrainUniforms.md)
- [createSkyUniforms](functions/createSkyUniforms.md)
- [createTerrainUniforms](functions/createTerrainUniforms.md)
- [createToonMaterial](functions/createToonMaterial.md)
- [createUnderwaterOverlayUniforms](functions/createUnderwaterOverlayUniforms.md)
- [createUnderwaterUniforms](functions/createUnderwaterUniforms.md)
- [createVolumetricCloudUniforms](functions/createVolumetricCloudUniforms.md)
- [createVolumetricFogMeshUniforms](functions/createVolumetricFogMeshUniforms.md)
- [createVolumetricFogUniforms](functions/createVolumetricFogUniforms.md)
- [createVolumetricPointLightUniforms](functions/createVolumetricPointLightUniforms.md)
- [createVolumetricSpotlightUniforms](functions/createVolumetricSpotlightUniforms.md)
- [createWaterUniforms](functions/createWaterUniforms.md)
