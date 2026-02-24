import type * as THREE from 'three';
import type {
  CloudLayerConfig,
  CloudSkyConfig,
  DayNightConfig,
  WindConfig,
} from '../../core/clouds';

/**
 * Props for the CloudLayer component.
 * @category World Building
 */
export interface CloudLayerProps extends Partial<CloudLayerConfig> {
  /** Wind configuration for cloud movement animation. */
  wind?: Partial<WindConfig>;
  /** Day/night cycle configuration for cloud lighting and color adaptation. */
  dayNight?: Partial<DayNightConfig>;
  /** Size of the cloud plane [width, height]. Default: [200, 200]. */
  size?: [number, number];
}

/**
 * Props for the VolumetricClouds component.
 * @category World Building
 */
export interface VolumetricCloudsProps {
  /** Base altitude where clouds start. Default: 50. */
  cloudBase?: number;
  /** Total height/thickness of the cloud volume. Default: 50. */
  cloudHeight?: number;
  /** Cloud coverage density (0-1). Default: 0.5. */
  coverage?: number;
  /** Cloud internal density multiplier. Default: 1.0. */
  density?: number;
  /** Primary cloud color. Default: white. */
  cloudColor?: THREE.Color;
  /** Cloud shadow color. Default: slate blue. */
  shadowColor?: THREE.Color;
  /** Wind configuration for movement animation. */
  wind?: Partial<WindConfig>;
  /** Day/night cycle configuration for light intensity and angle. */
  dayNight?: Partial<DayNightConfig>;
  /** Raymarching steps. Higher = better quality, lower performance. Default: 32. */
  steps?: number;
  /** Light sampling steps for internal shadows. Default: 4. */
  lightSteps?: number;
  /** Radius of the cloud dome sphere. Default: 500. */
  radius?: number;
}

/**
 * Props for the CloudSky composite component.
 * @category World Building
 */
export interface CloudSkyProps {
  /** Preset configuration containing multiple layers and global settings. */
  config?: Partial<CloudSkyConfig>;
  /** Global wind override for all cloud layers. */
  wind?: Partial<WindConfig>;
  /** Global day/night override for all cloud layers. */
  dayNight?: Partial<DayNightConfig>;
}
