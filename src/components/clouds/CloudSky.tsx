import { useMemo } from 'react';
import { createDefaultCloudSkyConfig } from '../../core/clouds';
import { CloudLayer } from './CloudLayer';
import type { CloudSkyProps } from './types';

/**
 * Composite Multi-Layer Cloud Sky.
 *
 * Coordinates multiple cloud layers with unified global wind and day/night settings.
 * Simplifies complex atmospheric setups into a single managed component.
 *
 * @category World Building
 * @example
 * ```tsx
 * <CloudSky
 *   wind={{ speed: 0.05 }}
 *   dayNight={{ sunAngle: 45 }}
 * />
 * ```
 */
export function CloudSky({
    config: configProp,
    wind: windOverride,
    dayNight: dayNightOverride,
}: CloudSkyProps) {
    const config = useMemo(() => {
        return configProp
            ? { ...createDefaultCloudSkyConfig(), ...configProp }
            : createDefaultCloudSkyConfig();
    }, [configProp]);

    const finalWind = useMemo(() => {
        return windOverride ? { ...config.wind, ...windOverride } : config.wind;
    }, [config.wind, windOverride]);

    const finalDayNight = useMemo(() => {
        return dayNightOverride ? { ...config.dayNight, ...dayNightOverride } : config.dayNight;
    }, [config.dayNight, dayNightOverride]);

    return (
        <group>
            {config.layers.map((layer, index) => (
                <CloudLayer
                    key={`cloud-layer-${index}-${layer.altitude ?? 0}`}
                    {...layer}
                    wind={finalWind}
                    dayNight={finalDayNight}
                />
            ))}
        </group>
    );
}
