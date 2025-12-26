
import * as THREE from 'three';
import type { WeatherStateConfig } from '../../core/weather';
import { Rain } from './Rain';
import { Snow } from './Snow';
import { Lightning } from './Lightning';
import type { WeatherSystemProps } from './types';

/**
 * Unified Weather System Manager.
 *
 * Coordinates rain, snow, and lightning effects based on a global weather state.
 * Automatically handles precipitation type switching and storm logic.
 *
 * @category World Building
 * @example
 * ```tsx
 * <WeatherSystem
 *   weather={{ type: 'storm', intensity: 0.9 }}
 *   enableLightning
 * />
 * ```
 */
export function WeatherSystem({
    weather,
    rainCount = 10000,
    snowCount = 5000,
    areaSize = 50,
    height = 30,
    enableLightning = true,
}: WeatherSystemProps) {
    const state: WeatherStateConfig = {
        type: 'clear',
        intensity: 0,
        windDirection: new THREE.Vector3(1, 0, 0),
        windIntensity: 0,
        temperature: 20,
        visibility: 1,
        cloudCoverage: 0,
        precipitationRate: 0,
        ...weather,
    };

    const wind = state.windDirection.clone().multiplyScalar(state.windIntensity);
    const showRain = (state.type === 'rain' || state.type === 'storm') && state.temperature > 0;
    const showSnow =
        state.type === 'snow' ||
        ((state.type === 'rain' || state.type === 'storm') && state.temperature <= 0);
    const showLightning = enableLightning && state.type === 'storm' && state.intensity > 0.5;

    return (
        <>
            {showRain && (
                <Rain
                    count={Math.floor(rainCount * state.intensity)}
                    areaSize={areaSize}
                    height={height}
                    intensity={state.intensity}
                    wind={wind}
                />
            )}
            {showSnow && (
                <Snow
                    count={Math.floor(snowCount * state.intensity)}
                    areaSize={areaSize}
                    height={height}
                    intensity={state.intensity}
                    wind={wind.clone().multiplyScalar(0.5)}
                />
            )}
            {showLightning && (
                <Lightning
                    active={true}
                    frequency={0.05 + state.intensity * 0.1}
                    flashIntensity={1 + state.intensity}
                />
            )}
        </>
    );
}
