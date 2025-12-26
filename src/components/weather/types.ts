import type * as THREE from 'three';
import type { WeatherStateConfig } from '../../core/weather';

/**
 * Props for the Rain component.
 * @category World Building
 */
export interface RainProps {
    /** Number of active rain particles. Default: 10000. */
    count?: number;
    /** Size of the area covered by rain. Default: 50. */
    areaSize?: number;
    /** Maximum height from which rain falls. Default: 30. */
    height?: number;
    /** Visual density and opacity of the rain (0-1). Default: 1.0. */
    intensity?: number;
    /** Alias for intensity. @deprecated Use intensity instead. */
    windStrength?: number;
    /** Wind vector affecting rain angle and speed. Default: [0.5, 0, 0.2]. */
    wind?: THREE.Vector3;
    /** Tint color for rain drops. Default: '#aaccff'. */
    color?: THREE.ColorRepresentation;
    /** Vertical length of each rain streak. Default: 0.5. */
    dropLength?: number;
}

/**
 * Props for the Snow component.
 * @category World Building
 */
export interface SnowProps {
    /** Number of active snowflakes. Default: 5000. */
    count?: number;
    /** Size of the area covered by snow. Default: 50. */
    areaSize?: number;
    /** Maximum height from which snow falls. Default: 30. */
    height?: number;
    /** Visual density and opacity of the snow (0-1). Default: 1.0. */
    intensity?: number;
    /** Alias for intensity. @deprecated Use intensity instead. */
    windStrength?: number;
    /** Wind vector affecting snowflake drift. Default: [0.3, 0, 0.1]. */
    wind?: THREE.Vector3;
    /** Tint color for snowflakes. Default: white. */
    color?: THREE.ColorRepresentation;
    /** Average size of each snowflake. Default: 0.15. */
    flakeSize?: number;
}

/**
 * Props for the Lightning component.
 * @category World Building
 */
export interface LightningProps {
    /** Whether the lightning system is active. Default: true. */
    active?: boolean;
    /** Probability of a strike per frame (0-1). Default: 0.1. */
    frequency?: number;
    /** Color of the visible lightning bolt. Default: '#ccccff'. */
    boltColor?: THREE.ColorRepresentation;
    /** Color of the screen-space flash. Default: white. */
    flashColor?: THREE.ColorRepresentation;
    /** Brightness intensity of the flash effect. Default: 2.0. */
    flashIntensity?: number;
    /** Callback fired whenever a lightning bolt strikes. */
    onStrike?: () => void;
}

/**
 * Props for the WeatherSystem component.
 * @category World Building
 */
export interface WeatherSystemProps {
    /** Global weather state configuration. */
    weather?: Partial<WeatherStateConfig>;
    /** Maximum number of rain particles to use. */
    rainCount?: number;
    /** Maximum number of snow particles to use. */
    snowCount?: number;
    /** Size of the coverage area for all effects. */
    areaSize?: number;
    /** Height from which precipitation falls. */
    height?: number;
    /** Whether to enable lightning during storms. Default: true. */
    enableLightning?: boolean;
}
