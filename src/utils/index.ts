/**
 * Utility exports
 */

// Optional package loader utilities
export type { OptionalPackageStatus } from './optional-loader';
export {
    clearOptionalPackageCache,
    getOptionalPackagesStatus,
    isOptionalPackageAvailable,
    loadOptionalPackage,
    mergeOptionalExports,
    probeOptionalPackage,
} from './optional-loader';
export type { BiomeType, StandardTextureType, TerrainTextures } from './texture-loader';
export {
    clearTextureCache,
    createTerrainMaterial,
    loadBiomeTextures,
    loadTexture,
    loadTextureSet,
    preloadBiomeTextures,
    TEXTURE_PROVIDER_PATTERNS,
} from './texture-loader';
