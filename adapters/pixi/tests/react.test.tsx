/**
 * tests/react.test.tsx — usePixiMount under React 19 StrictMode.
 *
 * The load-bearing scenario: StrictMode's mount→cleanup→mount cycle must
 * leave exactly ONE live Pixi app on ONE fresh canvas, with every
 * superseded app destroyed and its canvas removed (the illinois-jim
 * WEBGL_lose_context regression, exercised through the hook).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { __mockState, pixiMock } from './_pixi-mock';

vi.mock('pixi.js', () => pixiMock());

import { act, type ReactElement, StrictMode, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { usePixiMount } from '../src/react';
import type { PixiMountHandle } from '../src/index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Holder object (not a bare let) so TS control-flow narrowing doesn't
// pin the value to null across the closure assignments below.
const captured: { handle: PixiMountHandle | null } = { handle: null };

function Stage(): ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);
  captured.handle = usePixiMount(hostRef);
  return <div data-testid="host" ref={hostRef} />;
}

async function flush(): Promise<void> {
  // Let the async mountPixi promise chain settle inside act().
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  __mockState.reset();
  captured.handle = null;
  document.body.innerHTML = '';
});

describe('usePixiMount', () => {
  it('StrictMode double-mount leaves exactly one live app on one fresh canvas', async () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    let root: Root | null = null;
    await act(async () => {
      root = createRoot(el);
      root.render(
        <StrictMode>
          <Stage />
        </StrictMode>,
      );
    });
    await flush();

    const host = el.querySelector('[data-testid="host"]');
    expect(host).toBeTruthy();
    // Exactly one canvas lives in the host…
    expect(host?.querySelectorAll('canvas').length).toBe(1);
    // …the hook returned its handle…
    expect(captured.handle).not.toBeNull();
    expect(captured.handle?.canvas.parentElement).toBe(host);
    // …and every app except the live one was destroyed.
    const live = __mockState.apps.filter((a) => !a.destroyed);
    expect(live.length).toBe(1);

    await act(async () => {
      root?.unmount();
    });
    // Full unmount: nothing live, no canvas left behind.
    expect(__mockState.apps.every((a) => a.destroyed)).toBe(true);
    expect(document.querySelectorAll('canvas').length).toBe(0);
  });

  it('passes a canvas ref through as options.canvas (single-mount trees)', async () => {
    // (captured.handle already reset by beforeEach)
    function CanvasStage(): ReactElement {
      const canvasRef = useRef<HTMLCanvasElement | null>(null);
      captured.handle = usePixiMount(canvasRef);
      return <canvas ref={canvasRef} />;
    }
    const el = document.createElement('div');
    document.body.appendChild(el);
    let root: Root | null = null;
    await act(async () => {
      root = createRoot(el);
      root.render(<CanvasStage />);
    });
    await flush();

    const canvas = el.querySelector('canvas');
    expect(captured.handle?.canvas).toBe(canvas);
    // Provided canvas: destroy must NOT remove it from the DOM.
    await act(async () => {
      root?.unmount();
    });
    expect(__mockState.apps.every((a) => a.destroyed)).toBe(true);
  });
});
