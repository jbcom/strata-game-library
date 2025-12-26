
import { UnderwaterOverlay } from './UnderwaterOverlay';
import { VolumetricFogMesh } from './VolumetricFogMesh';
import type { VolumetricEffectsProps } from './types';

/**
 * Unified Volumetric Effects Manager.
 *
 * Coordinates localized volumetric fog and screen-space underwater overlays.
 * Simplifies environmental atmosphere management by providing a single point of control.
 *
 * @category Effects & Atmosphere
 * @example
 * ```tsx
 * <VolumetricEffects
 *   enableFog={true}
 *   enableUnderwater={true}
 *   fogSettings={{ density: 0.05 }}
 * />
 * ```
 */
export function VolumetricEffects({
    enableFog = true,
    enableUnderwater = true,
    fogSettings = {},
    underwaterSettings = {},
}: VolumetricEffectsProps) {
    return (
        <>
            {enableFog && (
                <VolumetricFogMesh
                    color={fogSettings.color}
                    density={fogSettings.density}
                    height={fogSettings.height}
                />
            )}

            {enableUnderwater && (
                <UnderwaterOverlay
                    color={underwaterSettings.color}
                    density={underwaterSettings.density}
                    causticStrength={underwaterSettings.causticStrength}
                    waterSurface={underwaterSettings.waterSurface}
                />
            )}
        </>
    );
}
