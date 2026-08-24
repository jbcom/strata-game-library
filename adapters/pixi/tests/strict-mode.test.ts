/**
 * tests/strict-mode.test.ts — the fresh-canvas-per-Application contract.
 *
 * Lifted from illinois-jim-and-the-shrine-of-catastrophe's
 * tests/browser/pixiStrictMode.test.ts (adapted from real-Chromium to this
 * package's jsdom+mock harness; the WebGL-limit assertions that need a
 * real GPU stay in illinois-jim).
 *
 * Regression it pins: React StrictMode double-mounts effects (mount →
 * cleanup → mount). The first mount initialises a Pixi Application
 * (acquiring a WebGL2 context on a canvas), then cleanup destroys it.
 * Pixi's GL teardown loses the context (`WEBGL_lose_context.loseContext()`),
 * and a WebGL context is bound to its canvas ELEMENT for the element's
 * lifetime: `getContext('webgl2')` on that same element afterwards returns
 * the *lost* context forever. `gl.createShader()` then returns null, and
 * `gl.shaderSource(null, …)` throws inside Pixi's `GlLimitsSystem.
 * contextChange → checkMaxIfStatementsInShader` — a black canvas.
 *
 * The fix is structural: each mount creates and OWNS its own <canvas>
 * inside a stable host container, and removes it on destroy. The host div
 * is reused across remounts; the canvas element never is — so every
 * Application boots onto a virgin, never-lost context. These tests pin
 * that contract: a destroyed mount's canvas must be gone, and a second
 * mount on the same host must mint a NEW canvas.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { __mockState, pixiMock } from './_pixi-mock';

vi.mock('pixi.js', () => pixiMock());

import { mountPixi } from '../src/index';

function makeHost(): HTMLDivElement {
  const host = document.createElement('div');
  Object.defineProperty(host, 'clientWidth', { value: 320, configurable: true });
  Object.defineProperty(host, 'clientHeight', { value: 180, configurable: true });
  document.body.appendChild(host);
  return host;
}

beforeEach(() => {
  __mockState.reset();
  document.body.innerHTML = '';
});

describe('Pixi mount under StrictMode-style remounts', () => {
  it('reusing the host (not the canvas) across mounts yields a working mount', async () => {
    const host = makeHost();

    // First mount: mountPixi mints its own canvas inside the host.
    const a = await mountPixi({ container: host });
    expect(a.app).toBeTruthy();
    expect(a.canvas.parentElement).toBe(host);
    const firstCanvas = a.canvas;

    // StrictMode teardown: dispose the first app. Its canvas (and now-lost
    // GL context) must be removed from the host entirely.
    a.destroy();
    expect(firstCanvas.parentElement).toBeNull();

    // Second mount on the SAME host — must boot onto a brand-new canvas.
    // Without the fix this booted onto the first canvas's lost context and
    // threw in checkMaxIfStatementsInShader.
    const b = await mountPixi({ container: host });
    expect(b.app).toBeTruthy();
    expect(b.canvas).not.toBe(firstCanvas);
    expect(b.canvas.parentElement).toBe(host);
    // Exactly one live app: #1 destroyed, #2 healthy.
    expect(__mockState.apps.map((r) => r.destroyed)).toEqual([true, false]);
    // The second Application was initialised onto the NEW element.
    expect(__mockState.apps[1]?.initOptions?.canvas).toBe(b.canvas);

    b.destroy();
    host.remove();
  });

  it('a fresh host per mount is always safe', async () => {
    const host = makeHost();
    const r1 = await mountPixi({ container: host });
    expect(r1.app).toBeTruthy();
    r1.destroy();
    host.remove();
    expect(__mockState.apps.every((r) => r.destroyed)).toBe(true);
  });
});
