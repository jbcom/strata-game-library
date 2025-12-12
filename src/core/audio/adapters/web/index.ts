/**
 * Web Audio Context Adapter
 *
 * Handles web-specific audio context management and autoplay unlock.
 *
 * @module core/audio/adapters/web
 * @public
 */

import { Howler } from 'howler';

let audioContextUnlocked = false;
let unlockListenersAttached = false;

/**
 * Checks if the Web Audio context is unlocked and ready.
 *
 * @returns True if audio context is unlocked
 *
 * @example
 * ```typescript
 * if (!isAudioContextUnlocked()) {
 *   console.log('Waiting for user interaction to unlock audio');
 * }
 * ```
 */
export function isAudioContextUnlocked(): boolean {
    return audioContextUnlocked;
}

/**
 * Attempts to unlock the audio context.
 *
 * @returns Promise that resolves when unlocked
 *
 * @example
 * ```typescript
 * await unlockAudioContext();
 * soundManager.play('bgm');
 * ```
 */
export async function unlockAudioContext(): Promise<void> {
    if (audioContextUnlocked) return;

    const ctx = Howler.ctx;
    if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
    }
    audioContextUnlocked = true;
}

/**
 * Sets up automatic audio context unlock on user interaction.
 * Listens for touch/click/keydown events to unlock audio.
 *
 * @example
 * ```typescript
 * setupAutoUnlock();
 * ```
 */
export function setupAutoUnlock(): void {
    if (unlockListenersAttached || typeof window === 'undefined') return;

    const events = ['touchstart', 'touchend', 'click', 'keydown'];
    const unlock = async () => {
        await unlockAudioContext();
        for (const event of events) {
            document.removeEventListener(event, unlock, true);
        }
    };

    for (const event of events) {
        document.addEventListener(event, unlock, true);
    }
    unlockListenersAttached = true;
}

/**
 * Gets the underlying Web Audio context from Howler.
 *
 * @returns The AudioContext or undefined if not available
 *
 * @example
 * ```typescript
 * const ctx = getAudioContext();
 * if (ctx) {
 *   console.log('Sample rate:', ctx.sampleRate);
 * }
 * ```
 */
export function getAudioContext(): AudioContext | undefined {
    return Howler.ctx ?? undefined;
}

/**
 * Suspends the audio context to save resources.
 *
 * @returns Promise that resolves when suspended
 */
export async function suspendAudioContext(): Promise<void> {
    const ctx = Howler.ctx;
    if (ctx && ctx.state === 'running') {
        await ctx.suspend();
    }
}

/**
 * Resumes the audio context after suspension.
 *
 * @returns Promise that resolves when resumed
 */
export async function resumeAudioContext(): Promise<void> {
    const ctx = Howler.ctx;
    if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
        audioContextUnlocked = true;
    }
}
