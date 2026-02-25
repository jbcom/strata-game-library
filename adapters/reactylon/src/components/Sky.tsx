/**
 * StrataSky - Babylon.js procedural sky component via Reactylon.
 *
 * Wraps Strata's core sky shader algorithms and renders them using
 * Babylon.js ShaderMaterial. Supports day/night cycles, weather effects,
 * and star visibility.
 *
 * @example
 * ```tsx
 * import { StrataSky } from '@strata-game-library/reactylon';
 *
 * function SkyScene() {
 *   return (
 *     <StrataSky
 *       timeOfDay={{ sunAngle: 60, sunIntensity: 0.8 }}
 *       weather={{ intensity: 0.2 }}
 *     />
 *   );
 * }
 * ```
 */

import { forwardRef, useEffect, useMemo, useRef } from 'react';
import {
  createBabylonSkyShaderMaterial,
  type BabylonSkyMaterialHandle,
} from '../materials/skyMaterial.js';

/** Time of day configuration for the sky. */
export interface TimeOfDayState {
  /** Sun intensity (0-1). 0 = night, 1 = maximum brightness. */
  sunIntensity?: number;
  /** Sun angle in degrees (0 = horizon, 90 = zenith/noon). */
  sunAngle?: number;
  /** Ambient light level (0-1). */
  ambientLight?: number;
  /** Star visibility (0-1). */
  starVisibility?: number;
  /** Fog density (0-1). */
  fogDensity?: number;
}

/** Weather configuration for the sky. */
export interface WeatherState {
  /** Weather intensity (0-1). 0 = clear, 1 = stormy. */
  intensity?: number;
}

/** Props for the StrataSky component. */
export interface StrataSkyProps {
  /** Time of day settings. */
  timeOfDay?: TimeOfDayState;
  /** Weather settings. */
  weather?: WeatherState;
  /** Size of the sky plane [width, height]. Default: [200, 100] */
  size?: [number, number];
  /** Distance of the sky plane from the camera. Default: 50 */
  distance?: number;
  /** Whether the sky is visible. Default: true */
  visible?: boolean;
}

const defaultTimeOfDay: Required<TimeOfDayState> = {
  sunIntensity: 1.0,
  sunAngle: 60,
  ambientLight: 0.8,
  starVisibility: 0,
  fogDensity: 0,
};

const defaultWeather: Required<WeatherState> = {
  intensity: 0,
};

/**
 * Procedural sky component with dynamic day/night cycles for Babylon.js.
 *
 * Uses Strata's atmospheric scattering shader adapted for Babylon.js.
 * Automatically updates time uniforms for smooth sky animation.
 */
export const StrataSky = forwardRef<unknown, StrataSkyProps>(
  function StrataSky(
    {
      timeOfDay: timeOfDayProp = {},
      weather: weatherProp = {},
      size = [200, 100],
      distance = 50,
      visible = true,
    },
    _ref,
  ) {
    const handleRef = useRef<BabylonSkyMaterialHandle | null>(null);
    const animationRef = useRef<number>(0);
    const startTimeRef = useRef<number>(performance.now());

    const timeOfDay = useMemo(
      () => ({ ...defaultTimeOfDay, ...timeOfDayProp }),
      [
        timeOfDayProp.sunIntensity,
        timeOfDayProp.sunAngle,
        timeOfDayProp.ambientLight,
        timeOfDayProp.starVisibility,
        timeOfDayProp.fogDensity,
      ],
    );

    const weather = useMemo(
      () => ({ ...defaultWeather, ...weatherProp }),
      [weatherProp.intensity],
    );

    const materialHandle = useMemo(() => {
      return createBabylonSkyShaderMaterial({
        timeOfDay,
        weather,
      });
    }, [timeOfDay, weather]);

    handleRef.current = materialHandle;

    // Sync timeOfDay and weather changes to the handle
    useEffect(() => {
      handleRef.current?.updateTimeOfDay(timeOfDay);
    }, [timeOfDay]);

    useEffect(() => {
      handleRef.current?.updateWeather(weather);
    }, [weather]);

    // Animation loop
    useEffect(() => {
      if (!visible) return;

      startTimeRef.current = performance.now();

      const animate = () => {
        const elapsed = (performance.now() - startTimeRef.current) / 1000;
        handleRef.current?.updateTime(elapsed);
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        handleRef.current?.dispose();
      };
    }, [visible]);

    if (!visible) return null;

    return (
      <div
        data-strata-sky="true"
        data-distance={String(distance)}
        data-size={size.join(',')}
        style={{ display: 'none' }}
      />
    );
  },
);

StrataSky.displayName = 'StrataSky';

/**
 * Generate time of day state from a decimal hour (0-24).
 *
 * @param hour - Hour of the day (0-24, where 12.0 is noon).
 * @returns Fully populated TimeOfDayState.
 */
export function createTimeOfDay(hour: number): Required<TimeOfDayState> {
  const normalizedHour = ((hour % 24) + 24) % 24;

  const sunAngle = Math.max(
    0,
    Math.sin(((normalizedHour - 6) / 12) * Math.PI) * 90,
  );

  let sunIntensity = 0;
  if (normalizedHour >= 6 && normalizedHour <= 18) {
    sunIntensity = Math.sin(((normalizedHour - 6) / 12) * Math.PI);
  }

  const starVisibility = Math.max(0, 1 - sunIntensity * 2);
  const ambientLight = 0.2 + sunIntensity * 0.6;

  return {
    sunIntensity,
    sunAngle,
    ambientLight,
    starVisibility,
    fogDensity: 0,
  };
}
