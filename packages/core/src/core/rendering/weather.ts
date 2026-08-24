/**
 * Core Weather and Environmental Simulation.
 *
 * Provides pure TypeScript state management for dynamic weather systems,
 * including transitions between weather types, wind simulation, and atmospheric conditions.
 *
 * @packageDocumentation
 * @module core/weather
 * @category World Building
 */

import * as THREE from 'three';

export type WeatherType = 'clear' | 'rain' | 'snow' | 'storm' | 'fog';

export interface WeatherStateConfig {
  type: WeatherType;
  intensity: number;
  windDirection: THREE.Vector3;
  windIntensity: number;
  temperature: number;
  visibility: number;
  cloudCoverage: number;
  precipitationRate: number;
}

export interface WeatherTransition {
  from: WeatherStateConfig;
  to: WeatherStateConfig;
  duration: number;
  elapsed: number;
}

/**
 * Core weather system class for environmental simulation.
 * @category World Building
 */
export class WeatherSystemCore {
  private currentState: WeatherStateConfig;
  private transition: WeatherTransition | null = null;
  private listeners: ((state: WeatherStateConfig) => void)[] = [];

  constructor(initialState: Partial<WeatherStateConfig> = {}) {
    this.currentState = {
      type: 'clear',
      intensity: 0,
      windDirection: new THREE.Vector3(1, 0, 0),
      windIntensity: 0,
      temperature: 20,
      visibility: 1,
      cloudCoverage: 0,
      precipitationRate: 0,
      ...initialState,
    };
  }

  getState(): WeatherStateConfig {
    return { ...this.currentState };
  }

  transitionTo(targetState: Partial<WeatherStateConfig>, duration: number = 5): void {
    const to: WeatherStateConfig = {
      ...this.currentState,
      ...targetState,
    };

    this.transition = {
      from: { ...this.currentState },
      to,
      duration,
      elapsed: 0,
    };
  }

  update(deltaTime: number): void {
    if (!this.transition) return;

    this.transition.elapsed += deltaTime;
    const progress = Math.min(this.transition.elapsed / this.transition.duration, 1);
    const t = smoothStep(progress);

    this.currentState = blendWeatherStates(this.transition.from, this.transition.to, t);

    if (progress >= 1) {
      this.currentState = { ...this.transition.to };
      this.transition = null;
    }

    this.notifyListeners();
  }

  setImmediate(state: Partial<WeatherStateConfig>): void {
    this.transition = null;
    this.currentState = {
      ...this.currentState,
      ...state,
    };
    this.notifyListeners();
  }

  isTransitioning(): boolean {
    return this.transition !== null;
  }

  getTransitionProgress(): number {
    if (!this.transition) return 1;
    return Math.min(this.transition.elapsed / this.transition.duration, 1);
  }

  subscribe(listener: (state: WeatherStateConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  getPrecipitationType(): 'none' | 'rain' | 'snow' {
    if (this.currentState.type === 'clear' || this.currentState.type === 'fog') {
      return 'none';
    }
    if (this.currentState.temperature <= 0) {
      return 'snow';
    }
    return 'rain';
  }

  shouldShowLightning(): boolean {
    return this.currentState.type === 'storm' && this.currentState.intensity > 0.5;
  }

  getWindVector(): THREE.Vector3 {
    return this.currentState.windDirection
      .clone()
      .normalize()
      .multiplyScalar(this.currentState.windIntensity);
  }
}

function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

function blendWeatherStates(
  from: WeatherStateConfig,
  to: WeatherStateConfig,
  t: number
): WeatherStateConfig {
  return {
    type: t < 0.5 ? from.type : to.type,
    intensity: lerp(from.intensity, to.intensity, t),
    windDirection: new THREE.Vector3().lerpVectors(from.windDirection, to.windDirection, t),
    windIntensity: lerp(from.windIntensity, to.windIntensity, t),
    temperature: lerp(from.temperature, to.temperature, t),
    visibility: lerp(from.visibility, to.visibility, t),
    cloudCoverage: lerp(from.cloudCoverage, to.cloudCoverage, t),
    precipitationRate: lerp(from.precipitationRate, to.precipitationRate, t),
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function createWeatherSystem(initialState?: Partial<WeatherStateConfig>): WeatherSystemCore {
  return new WeatherSystemCore(initialState);
}

export interface WindSimulationConfig {
  direction: THREE.Vector3;
  intensity: number;
  gustFrequency: number;
  gustIntensity: number;
}

export class WindSimulation {
  private config: WindSimulationConfig;
  private time: number = 0;
  private currentGust: number = 0;

  constructor(config: Partial<WindSimulationConfig> = {}) {
    this.config = {
      direction: new THREE.Vector3(1, 0, 0.2).normalize(),
      intensity: 1,
      gustFrequency: 0.5,
      gustIntensity: 0.3,
      ...config,
    };
  }

  update(deltaTime: number): void {
    this.time += deltaTime;
    const gustPhase = this.time * this.config.gustFrequency * Math.PI * 2;
    this.currentGust = (Math.sin(gustPhase) * 0.5 + 0.5) * this.config.gustIntensity;
  }

  getWindVector(): THREE.Vector3 {
    const totalIntensity = this.config.intensity + this.currentGust;
    return this.config.direction.clone().multiplyScalar(totalIntensity);
  }

  setDirection(direction: THREE.Vector3): void {
    this.config.direction = direction.clone().normalize();
  }

  setIntensity(intensity: number): void {
    this.config.intensity = intensity;
  }

  getConfig(): WindSimulationConfig {
    return { ...this.config };
  }
}

export function createWindSimulation(config?: Partial<WindSimulationConfig>): WindSimulation {
  return new WindSimulation(config);
}

export interface TemperatureConfig {
  baseTemperature: number;
  altitude: number;
  lapseRate: number;
  timeOfDay: number;
  season: number;
}

export function calculateTemperature(config: TemperatureConfig): number {
  const altitudeEffect = -config.altitude * config.lapseRate * 0.0065;
  const normalizedTime = (config.timeOfDay / 24) * Math.PI * 2;
  const timeEffect = Math.sin(normalizedTime - Math.PI / 2) * 5;
  const seasonEffect = Math.cos((config.season / 12) * Math.PI * 2) * 15;
  return config.baseTemperature + altitudeEffect + timeEffect + seasonEffect;
}

export function getPrecipitationType(temperature: number): 'none' | 'rain' | 'snow' | 'sleet' {
  if (temperature <= -2) return 'snow';
  if (temperature <= 2) return 'sleet';
  return 'rain';
}

/**
 * @deprecated Use `WeatherSystemCore` instead. This alias will be removed in v2.0.
 * @category World Building
 */
export { WeatherSystemCore as WeatherSystem };

/**
 * Type alias for backwards compatibility.
 * @deprecated Use `WeatherSystemCore` instead.
 */
export type WeatherSystemType = WeatherSystemCore;
