import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import {
    calculateTemperature,
    createWeatherSystem,
    createWindSimulation,
    getPrecipitationType,
    WeatherSystem,
    type WeatherType,
    WindSimulation,
} from '../core/weather';

describe('WeatherSystem', () => {
    describe('instantiation', () => {
        it('should create a WeatherSystem with default state', () => {
            const weather = new WeatherSystem();
            expect(weather).toBeDefined();
            const state = weather.getState();
            expect(state.type).toBe('clear');
        });

        it('should create a WeatherSystem with initial type', () => {
            const weather = new WeatherSystem({ type: 'rain' });
            expect(weather.getState().type).toBe('rain');
        });

        it('should create a WeatherSystem with custom intensity', () => {
            const weather = new WeatherSystem({ type: 'rain', intensity: 0.8 });
            expect(weather.getState().intensity).toBeCloseTo(0.8, 2);
        });

        it('should create a WeatherSystem with wind settings', () => {
            const weather = new WeatherSystem({
                windDirection: new THREE.Vector3(1, 0, 0),
                windIntensity: 5.0,
            });
            expect(weather.getState().windDirection.x).toBe(1);
            expect(weather.getState().windIntensity).toBe(5.0);
        });

        it('should create a WeatherSystem with temperature', () => {
            const weather = new WeatherSystem({ temperature: 25 });
            expect(weather.getState().temperature).toBe(25);
        });
    });

    describe('weather transitions', () => {
        it('should transition to new weather condition', () => {
            const weather = new WeatherSystem({ type: 'clear' });
            weather.transitionTo({ type: 'rain' }, 1.0);
            expect(weather.isTransitioning()).toBe(true);
        });

        it('should complete transition after duration', () => {
            const weather = new WeatherSystem({ type: 'clear' });
            weather.transitionTo({ type: 'rain' }, 0.5);
            weather.update(0.5);
            expect(weather.getState().type).toBe('rain');
        });

        it('should return transition progress', () => {
            const weather = new WeatherSystem({ type: 'clear' });
            weather.transitionTo({ type: 'rain' }, 1.0);
            weather.update(0.5);
            expect(weather.getTransitionProgress()).toBeCloseTo(0.5, 1);
        });

        it('should transition to snow condition', () => {
            const weather = new WeatherSystem({ type: 'clear' });
            weather.transitionTo({ type: 'snow' }, 2.0);
            expect(weather.isTransitioning()).toBe(true);
        });

        it('should transition to fog condition', () => {
            const weather = new WeatherSystem({ type: 'clear' });
            weather.transitionTo({ type: 'fog' }, 1.5);
            expect(weather.isTransitioning()).toBe(true);
        });
    });

    describe('weather state', () => {
        it('should return current weather state', () => {
            const weather = new WeatherSystem({ type: 'rain', intensity: 0.7 });
            const state = weather.getState();
            expect(state.type).toBe('rain');
            expect(state.intensity).toBeCloseTo(0.7, 2);
        });

        it('should update weather state on tick', () => {
            const weather = new WeatherSystem({});
            expect(() => weather.update(0.016)).not.toThrow();
        });

        it('should set state immediately', () => {
            const weather = new WeatherSystem({ type: 'clear' });
            weather.setImmediate({ type: 'storm', intensity: 0.9 });
            expect(weather.getState().type).toBe('storm');
            expect(weather.getState().intensity).toBeCloseTo(0.9, 2);
        });

        it('should get precipitation type based on temperature', () => {
            const weather = new WeatherSystem({ type: 'rain', temperature: 10 });
            expect(weather.getPrecipitationType()).toBe('rain');
        });

        it('should return snow for cold temperatures', () => {
            const weather = new WeatherSystem({ type: 'rain', temperature: -5 });
            expect(weather.getPrecipitationType()).toBe('snow');
        });
    });

    describe('wind vector', () => {
        it('should calculate wind vector', () => {
            const weather = new WeatherSystem({
                windDirection: new THREE.Vector3(1, 0, 0),
                windIntensity: 5.0,
            });
            const wind = weather.getWindVector();
            expect(wind.length()).toBeCloseTo(5.0, 1);
        });
    });

    describe('event subscription', () => {
        it('should subscribe to state changes', () => {
            const weather = new WeatherSystem({});
            const callback = vi.fn();
            const unsubscribe = weather.subscribe(callback);
            expect(typeof unsubscribe).toBe('function');
        });

        it('should unsubscribe from state changes', () => {
            const weather = new WeatherSystem({});
            const callback = vi.fn();
            const unsubscribe = weather.subscribe(callback);
            unsubscribe();
            weather.setImmediate({ type: 'rain' });
        });
    });
});

describe('WindSimulation', () => {
    it('should create a WindSimulation with defaults', () => {
        const wind = new WindSimulation();
        expect(wind).toBeDefined();
    });

    it('should create a WindSimulation with custom direction', () => {
        const wind = new WindSimulation({
            direction: new THREE.Vector3(1, 0, 0.5).normalize(),
        });
        const config = wind.getConfig();
        expect(config.direction.length()).toBeCloseTo(1.0, 5);
    });

    it('should update wind simulation', () => {
        const wind = new WindSimulation({ intensity: 5.0 });
        expect(() => wind.update(0.016)).not.toThrow();
    });

    it('should return wind vector', () => {
        const wind = new WindSimulation({ intensity: 5.0 });
        const windVector = wind.getWindVector();
        expect(windVector).toBeInstanceOf(THREE.Vector3);
    });

    it('should set direction', () => {
        const wind = new WindSimulation();
        wind.setDirection(new THREE.Vector3(0, 0, 1));
        const config = wind.getConfig();
        expect(config.direction.z).toBeCloseTo(1.0, 5);
    });

    it('should set intensity', () => {
        const wind = new WindSimulation();
        wind.setIntensity(10);
        const config = wind.getConfig();
        expect(config.intensity).toBe(10);
    });

    it('should apply gustiness', () => {
        const wind = new WindSimulation({
            intensity: 5.0,
            gustIntensity: 2.0,
            gustFrequency: 0.5,
        });
        wind.update(1.0);
        const vector = wind.getWindVector();
        expect(vector).toBeDefined();
    });
});

describe('calculateTemperature', () => {
    it('should calculate base temperature', () => {
        const temp = calculateTemperature({
            baseTemperature: 20,
            altitude: 0,
            lapseRate: 1,
            timeOfDay: 12,
            season: 6,
        });
        expect(temp).toBeDefined();
    });

    it('should reduce temperature with altitude', () => {
        const tempLow = calculateTemperature({
            baseTemperature: 20,
            altitude: 0,
            lapseRate: 1,
            timeOfDay: 12,
            season: 6,
        });
        const tempHigh = calculateTemperature({
            baseTemperature: 20,
            altitude: 1000,
            lapseRate: 1,
            timeOfDay: 12,
            season: 6,
        });
        expect(tempHigh).toBeLessThan(tempLow);
    });

    it('should vary with time of day', () => {
        const tempNoon = calculateTemperature({
            baseTemperature: 20,
            altitude: 0,
            lapseRate: 1,
            timeOfDay: 12,
            season: 6,
        });
        const tempMidnight = calculateTemperature({
            baseTemperature: 20,
            altitude: 0,
            lapseRate: 1,
            timeOfDay: 0,
            season: 6,
        });
        expect(tempNoon).not.toBe(tempMidnight);
    });

    it('should vary with season', () => {
        const tempSummer = calculateTemperature({
            baseTemperature: 20,
            altitude: 0,
            lapseRate: 1,
            timeOfDay: 12,
            season: 6,
        });
        const tempWinter = calculateTemperature({
            baseTemperature: 20,
            altitude: 0,
            lapseRate: 1,
            timeOfDay: 12,
            season: 0,
        });
        expect(tempSummer).not.toBe(tempWinter);
    });
});

describe('getPrecipitationType', () => {
    it('should return snow for cold temperatures', () => {
        expect(getPrecipitationType(-5)).toBe('snow');
    });

    it('should return sleet for near-freezing temperatures', () => {
        expect(getPrecipitationType(0)).toBe('sleet');
    });

    it('should return rain for warm temperatures', () => {
        expect(getPrecipitationType(10)).toBe('rain');
    });
});

describe('createWeatherSystem', () => {
    it('should create weather system with factory function', () => {
        const weather = createWeatherSystem({
            type: 'clear',
            intensity: 0.5,
        });
        expect(weather).toBeInstanceOf(WeatherSystem);
    });

    it('should create weather system without arguments', () => {
        const weather = createWeatherSystem();
        expect(weather).toBeInstanceOf(WeatherSystem);
    });
});

describe('createWindSimulation', () => {
    it('should create wind simulation with factory function', () => {
        const wind = createWindSimulation({
            intensity: 5.0,
        });
        expect(wind).toBeInstanceOf(WindSimulation);
    });
});

describe('WeatherType types', () => {
    it('should accept clear type', () => {
        const type: WeatherType = 'clear';
        expect(type).toBe('clear');
    });

    it('should accept rain type', () => {
        const type: WeatherType = 'rain';
        expect(type).toBe('rain');
    });

    it('should accept snow type', () => {
        const type: WeatherType = 'snow';
        expect(type).toBe('snow');
    });

    it('should accept fog type', () => {
        const type: WeatherType = 'fog';
        expect(type).toBe('fog');
    });

    it('should accept storm type', () => {
        const type: WeatherType = 'storm';
        expect(type).toBe('storm');
    });
});
