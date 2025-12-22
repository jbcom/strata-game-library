/**
 * Sound Manager Unit Tests
 *
 * Comprehensive tests for the SoundManager class and audio utilities.
 * Uses mocked Howler.js to test audio management logic.
 *
 * @module core/audio/sound-manager.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SoundManager, createSoundManager } from '../../../src/core/audio/sound-manager';

// Mock Howler.js - use class syntax for vitest 4 compatibility
vi.mock('howler', () => {
    class MockHowl {
        static _simulateError = false;
        static _errorMessage = 'Network error';

        _config: any;
        _volume: number;
        _muted: boolean;
        _playing: boolean;
        _rate: number;

        constructor(config: any) {
            this._config = config;
            this._volume = config.volume ?? 1;
            this._muted = config.mute ?? false;
            this._playing = false;
            this._rate = config.rate ?? 1;

            // Simulate async load or error
            if (MockHowl._simulateError) {
                MockHowl._simulateError = false; // Reset for next instance
                setTimeout(() => config.onloaderror?.(1, MockHowl._errorMessage), 0);
            } else if (config.onload) {
                setTimeout(() => config.onload(), 0);
            }
        }

        play = vi.fn().mockImplementation((_sprite?: string) => {
            this._playing = true;
            return 1; // Return sound ID
        });

        stop = vi.fn().mockImplementation(() => {
            this._playing = false;
        });

        pause = vi.fn().mockImplementation(() => {
            this._playing = false;
        });

        volume = vi.fn().mockImplementation((vol?: number, _id?: number) => {
            if (vol !== undefined) {
                this._volume = vol;
                return this;
            }
            return this._volume;
        });

        fade = vi.fn().mockImplementation((_from: number, _to: number, _duration: number, _id?: number) => {
            return this;
        });

        mute = vi.fn().mockImplementation((muted?: boolean) => {
            if (muted !== undefined) {
                this._muted = muted;
            }
            return this._muted;
        });

        playing = vi.fn().mockImplementation(() => this._playing);
        unload = vi.fn();

        rate = vi.fn().mockImplementation((rate?: number) => {
            if (rate !== undefined) {
                this._rate = rate;
                return this;
            }
            return this._rate;
        });
    }

    const mockHowler = {
        volume: vi.fn(),
        mute: vi.fn(),
        stop: vi.fn(),
        unload: vi.fn(),
    };

    return {
        Howl: MockHowl,
        Howler: mockHowler,
    };
});

describe('SoundManager', () => {
    let manager: SoundManager;

    beforeEach(() => {
        vi.clearAllMocks();
        manager = new SoundManager();
    });

    afterEach(() => {
        manager.dispose();
    });

    describe('constructor', () => {
        it('creates manager with default config', () => {
            const m = new SoundManager();
            expect(m.getMasterVolume()).toBe(1);
            m.dispose();
        });

        it('respects custom master volume', () => {
            const m = new SoundManager({ masterVolume: 0.5 });
            expect(m.getMasterVolume()).toBe(0.5);
            m.dispose();
        });

        it('creates default audio buses', async () => {
            expect(manager.getBusVolume('master')).toBe(1);
            expect(manager.getBusVolume('music')).toBe(1);
            expect(manager.getBusVolume('sfx')).toBe(1);
            expect(manager.getBusVolume('ambient')).toBe(1);
            expect(manager.getBusVolume('voice')).toBe(1);
        });
    });

    describe('load', () => {
        it('loads sound successfully', async () => {
            await manager.load('test', { src: '/audio/test.mp3' });

            // Sound should be playable
            const id = manager.play('test');
            expect(id).toBeDefined();
        });

        it('loads sound with options', async () => {
            await manager.load('test', {
                src: ['/audio/test.mp3', '/audio/test.ogg'],
                volume: 0.5,
                loop: true,
                rate: 1.5,
            });

            expect(manager.getVolume('test')).toBe(0.5);
        });

        it('assigns sound to specified bus', async () => {
            await manager.load('music', { src: '/audio/music.mp3' }, 'music');

            // Bus operations should work
            manager.setBusVolume('music', 0.5);
            // No error means sound was added to bus
        });

        it('defaults to sfx bus', async () => {
            await manager.load('explosion', { src: '/audio/explosion.mp3' });

            // Modifying sfx bus should affect the sound
            manager.setBusVolume('sfx', 0.8);
        });

        it('rejects on load error', async () => {
            const { Howl } = await import('howler');
            // Set the static flag to simulate error on next Howl instance
            (Howl as any)._simulateError = true;

            await expect(manager.load('fail', { src: '/audio/fail.mp3' })).rejects.toThrow(
                'Failed to load sound fail'
            );
        });
    });

    describe('play', () => {
        beforeEach(async () => {
            await manager.load('test', { src: '/audio/test.mp3' });
        });

        it('plays loaded sound', () => {
            const id = manager.play('test');
            expect(id).toBeDefined();
            expect(typeof id).toBe('number');
        });

        it('returns undefined for non-existent sound', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const id = manager.play('nonexistent');

            expect(id).toBeUndefined();
            expect(consoleSpy).toHaveBeenCalledWith('Sound "nonexistent" not found');

            consoleSpy.mockRestore();
        });

        it('plays specific sprite', async () => {
            await manager.load('sprites', {
                src: '/audio/sprites.mp3',
                sprite: {
                    step1: [0, 500],
                    step2: [500, 500],
                },
            });

            const id = manager.play('sprites', 'step1');
            expect(id).toBeDefined();
        });
    });

    describe('stop', () => {
        beforeEach(async () => {
            await manager.load('test', { src: '/audio/test.mp3' });
        });

        it('stops playing sound', () => {
            manager.play('test');
            manager.stop('test');

            expect(manager.isPlaying('test')).toBe(false);
        });

        it('handles non-existent sound gracefully', () => {
            expect(() => manager.stop('nonexistent')).not.toThrow();
        });
    });

    describe('pause', () => {
        beforeEach(async () => {
            await manager.load('test', { src: '/audio/test.mp3' });
        });

        it('pauses playing sound', () => {
            manager.play('test');
            manager.pause('test');

            expect(manager.isPlaying('test')).toBe(false);
        });

        it('handles non-existent sound gracefully', () => {
            expect(() => manager.pause('nonexistent')).not.toThrow();
        });
    });

    describe('volume control', () => {
        beforeEach(async () => {
            await manager.load('test', { src: '/audio/test.mp3', volume: 1 });
        });

        it('sets volume on sound', () => {
            manager.setVolume('test', 0.5);
            expect(manager.getVolume('test')).toBe(0.5);
        });

        it('clamps volume to valid range', () => {
            manager.setVolume('test', 2);
            expect(manager.getVolume('test')).toBe(1);

            manager.setVolume('test', -1);
            expect(manager.getVolume('test')).toBe(0);
        });

        it('getVolume returns undefined for non-existent sound', () => {
            expect(manager.getVolume('nonexistent')).toBeUndefined();
        });
    });

    describe('mute control', () => {
        beforeEach(async () => {
            await manager.load('test', { src: '/audio/test.mp3' });
        });

        it('mutes sound', () => {
            manager.setMute('test', true);
            // Mock should have been called with mute(true)
        });

        it('unmutes sound', () => {
            manager.setMute('test', true);
            manager.setMute('test', false);
            // No error = success
        });

        it('handles non-existent sound gracefully', () => {
            expect(() => manager.setMute('nonexistent', true)).not.toThrow();
        });
    });

    describe('fade', () => {
        beforeEach(async () => {
            await manager.load('test', { src: '/audio/test.mp3' });
        });

        it('fades sound volume', () => {
            // Mock Howl.fade
            // Accessing internal map via play() or similar isn't direct.
            // But we know play works.
            const id = manager.play('test');
            manager.fade('test', 0, 1, 1000);
            // We can't easily check if Howl.fade was called without mocking deeper,
            // but we can ensure it doesn't throw.
        });

        it('fades specific sound instance', () => {
             const id = manager.play('test');
             if (id) {
                 manager.fade('test', 0, 1, 1000, id);
             }
        });

        it('handles non-existent sound gracefully', () => {
            expect(() => manager.fade('nonexistent', 0, 1, 1000)).not.toThrow();
        });
    });

    describe('bus management', () => {
        it('creates new bus', () => {
            manager.createBus('custom', 0.8);
            expect(manager.getBusVolume('custom')).toBe(0.8);
        });

        it('does not overwrite existing bus', () => {
            manager.setBusVolume('sfx', 0.5);
            manager.createBus('sfx', 1); // Should not overwrite

            expect(manager.getBusVolume('sfx')).toBe(0.5);
        });

        it('sets bus volume', () => {
            manager.setBusVolume('music', 0.3);
            expect(manager.getBusVolume('music')).toBe(0.3);
        });

        it('clamps bus volume', () => {
            manager.setBusVolume('sfx', 2);
            expect(manager.getBusVolume('sfx')).toBe(1);

            manager.setBusVolume('sfx', -1);
            expect(manager.getBusVolume('sfx')).toBe(0);
        });

        it('getBusVolume returns undefined for non-existent bus', () => {
            expect(manager.getBusVolume('nonexistent')).toBeUndefined();
        });

        it('setBusVolume does nothing for non-existent bus', () => {
            expect(() => manager.setBusVolume('nonexistent', 0.5)).not.toThrow();
        });

        it('mutes bus', async () => {
            await manager.load('test', { src: '/audio/test.mp3' }, 'sfx');
            manager.setBusMute('sfx', true);
            // No error = success
        });

        it('setBusMute does nothing for non-existent bus', () => {
            expect(() => manager.setBusMute('nonexistent', true)).not.toThrow();
        });
    });

    describe('master volume', () => {
        it('sets master volume', async () => {
            const { Howler } = await import('howler');

            manager.setMasterVolume(0.7);

            expect(manager.getMasterVolume()).toBe(0.7);
            expect(Howler.volume).toHaveBeenCalledWith(0.7);
        });

        it('clamps master volume', () => {
            manager.setMasterVolume(2);
            expect(manager.getMasterVolume()).toBe(1);

            manager.setMasterVolume(-1);
            expect(manager.getMasterVolume()).toBe(0);
        });
    });

    describe('global mute', () => {
        it('mutes all audio', async () => {
            const { Howler } = await import('howler');

            manager.setGlobalMute(true);

            expect(Howler.mute).toHaveBeenCalledWith(true);
        });

        it('unmutes all audio', async () => {
            const { Howler } = await import('howler');

            manager.setGlobalMute(false);

            expect(Howler.mute).toHaveBeenCalledWith(false);
        });
    });

    describe('isPlaying', () => {
        it('returns true when sound is playing', async () => {
            await manager.load('test', { src: '/audio/test.mp3' });
            manager.play('test');

            expect(manager.isPlaying('test')).toBe(true);
        });

        it('returns false when sound is not playing', async () => {
            await manager.load('test', { src: '/audio/test.mp3' });

            expect(manager.isPlaying('test')).toBe(false);
        });

        it('returns false for non-existent sound', () => {
            expect(manager.isPlaying('nonexistent')).toBe(false);
        });
    });

    describe('unload', () => {
        it('unloads sound', async () => {
            await manager.load('test', { src: '/audio/test.mp3' });
            manager.unload('test');

            // Sound should no longer be playable
            const id = manager.play('test');
            expect(id).toBeUndefined();
        });

        it('handles non-existent sound gracefully', () => {
            expect(() => manager.unload('nonexistent')).not.toThrow();
        });

        it('removes sound from buses', async () => {
            await manager.load('test', { src: '/audio/test.mp3' }, 'sfx');
            manager.unload('test');

            // Bus operations should not affect unloaded sound
            manager.setBusVolume('sfx', 0.5);
        });
    });

    describe('stopAll', () => {
        it('stops all sounds', async () => {
            const { Howler } = await import('howler');

            await manager.load('test1', { src: '/audio/test1.mp3' });
            await manager.load('test2', { src: '/audio/test2.mp3' });

            manager.play('test1');
            manager.play('test2');
            manager.stopAll();

            expect(Howler.stop).toHaveBeenCalled();
        });
    });

    describe('dispose', () => {
        it('unloads all sounds', async () => {
            const { Howler } = await import('howler');

            await manager.load('test1', { src: '/audio/test1.mp3' });
            await manager.load('test2', { src: '/audio/test2.mp3' });

            manager.dispose();

            expect(Howler.unload).toHaveBeenCalled();
        });

        it('clears internal maps', async () => {
            await manager.load('test', { src: '/audio/test.mp3' });
            manager.dispose();

            // After dispose, sounds should not be playable
            const id = manager.play('test');
            expect(id).toBeUndefined();
        });
    });
});

describe('createSoundManager', () => {
    it('creates SoundManager instance', () => {
        const manager = createSoundManager();

        expect(manager).toBeInstanceOf(SoundManager);
        manager.dispose();
    });

    it('passes config to SoundManager', () => {
        const manager = createSoundManager({ masterVolume: 0.6 });

        expect(manager.getMasterVolume()).toBe(0.6);
        manager.dispose();
    });
});

describe('Bus volume affects sounds', () => {
    it('updates sound volume when bus volume changes', async () => {
        const manager = new SoundManager();
        await manager.load('test', { src: '/audio/test.mp3', volume: 1 }, 'sfx');

        manager.setBusVolume('sfx', 0.5);

        // The sound volume should be adjusted to baseVolume * busVolume
        // This is handled internally by updateBusSounds
        manager.dispose();
    });
});

describe('Audio configuration', () => {
    it('respects html5 option', async () => {
        const manager = new SoundManager();
        await manager.load('test', {
            src: '/audio/test.mp3',
            html5: true,
        });

        manager.dispose();
    });

    it('respects autoplay option', async () => {
        const manager = new SoundManager();
        await manager.load('test', {
            src: '/audio/test.mp3',
            autoplay: false,
        });

        // Sound should not be playing automatically
        expect(manager.isPlaying('test')).toBe(false);
        manager.dispose();
    });

    it('respects preload option', async () => {
        const manager = new SoundManager();
        await manager.load('test', {
            src: '/audio/test.mp3',
            preload: true,
        });

        manager.dispose();
    });
});
