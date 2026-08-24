/**
 * StrataCanvas contract, in jsdom. The r3f `<Canvas>` is mocked to a
 * prop-recording passthrough because jsdom has no WebGL.
 */

import type { CanvasProps, RootState } from '@react-three/fiber';
import { cleanup, render } from '@testing-library/react';
import { StrictMode, useEffect } from 'react';
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';

const recordedCanvasProps: CanvasProps[] = [];
let mountCount = 0;

vi.mock('@react-three/fiber', () => ({
  Canvas: (props: CanvasProps) => {
    recordedCanvasProps.push(props);
    useEffect(() => {
      mountCount += 1;
    }, []);
    return <canvas data-testid="mock-canvas" />;
  },
}));

const { StrataCanvas } = await import('../StrataCanvas.js');
const { STRATA_CANVAS_HOST_CLASS } = await import('../hostStyle.js');

afterEach(() => {
  cleanup();
  recordedCanvasProps.length = 0;
  mountCount = 0;
  vi.restoreAllMocks();
});

function lastCanvasProps(): CanvasProps {
  const props = recordedCanvasProps.at(-1);
  if (!props) throw new Error('Canvas never rendered');
  return props;
}

/** Drive the recorded onCreated with a fake RootState around a real jsdom
 * canvas, so the context-loss listeners attach to a dispatchable element. */
function createdWithCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const state = { gl: { domElement: canvas } } as unknown as RootState;
  lastCanvasProps().onCreated?.(state);
  return canvas;
}

describe('StrataCanvas — phase gating', () => {
  it('renders nothing while inactive: no host div, no Canvas, no GL context', () => {
    const { container } = render(
      <StrataCanvas active={false}>
        <group />
      </StrataCanvas>
    );
    expect(container.firstChild).toBeNull();
    expect(recordedCanvasProps).toHaveLength(0);
  });

  it('mounts when active flips true and tears down when it flips back', () => {
    const { container, rerender } = render(
      <StrataCanvas active={false}>
        <group />
      </StrataCanvas>
    );
    expect(container.firstChild).toBeNull();

    rerender(
      <StrataCanvas active>
        <group />
      </StrataCanvas>
    );
    expect(container.querySelector('[data-testid="mock-canvas"]')).not.toBeNull();

    rerender(
      <StrataCanvas active={false}>
        <group />
      </StrataCanvas>
    );
    expect(container.firstChild).toBeNull();
  });
});

describe('StrataCanvas — host sizing contract', () => {
  it('renders the host div with the contract class and inline style', () => {
    const { container } = render(
      <StrataCanvas active>
        <group />
      </StrataCanvas>
    );
    const host = container.firstChild as HTMLElement;
    expect(host.classList.contains(STRATA_CANVAS_HOST_CLASS)).toBe(true);
    expect(host.style.minHeight).toBe('0px');
    expect(host.style.flex).toBe('1 1 0%');
    expect(host.style.width).toBe('100%');
    expect(host.style.height).toBe('100%');
    expect(host.style.display).toBe('flex');
    expect(host.style.position).toBe('relative');
    expect(host.querySelector('[data-testid="mock-canvas"]')).not.toBeNull();
  });

  it('merges hostProps: extra class and data-* attributes land on the host', () => {
    const { container } = render(
      <StrataCanvas active hostProps={{ className: 'game-shell', 'data-phase': 'combat' }}>
        <group />
      </StrataCanvas>
    );
    const host = container.firstChild as HTMLElement;
    expect(host.classList.contains(STRATA_CANVAS_HOST_CLASS)).toBe(true);
    expect(host.classList.contains('game-shell')).toBe(true);
    expect(host.getAttribute('data-phase')).toBe('combat');
  });

  it('caller hostProps.style overrides the contract defaults it names, keeps the rest', () => {
    const { container } = render(
      <StrataCanvas active hostProps={{ style: { position: 'absolute' } }}>
        <group />
      </StrataCanvas>
    );
    const host = container.firstChild as HTMLElement;
    expect(host.style.position).toBe('absolute');
    expect(host.style.minHeight).toBe('0px');
  });
});

describe('StrataCanvas — quality tier and gl defaults', () => {
  it('maps the quality tier to dpr [1, maxDpr] plus antialias, with ACES/sRGB baked', () => {
    render(
      <StrataCanvas active quality={{ maxDpr: 1.25, antialias: false }} shadows>
        <group />
      </StrataCanvas>
    );
    const props = lastCanvasProps();
    expect(props.dpr).toEqual([1, 1.25]);
    const gl = props.gl as Record<string, unknown>;
    expect(gl.antialias).toBe(false);
    expect(gl.powerPreference).toBe('high-performance');
    expect(gl.toneMapping).toBe(ACESFilmicToneMapping);
    expect(gl.toneMappingExposure).toBe(1.0);
    expect(gl.outputColorSpace).toBe(SRGBColorSpace);
    expect(gl.preserveDrawingBuffer).toBe(false);
    expect(props.shadows).toBe(true);
  });

  it('defaults to the desktop baseline tier when no quality is given', () => {
    render(
      <StrataCanvas active>
        <group />
      </StrataCanvas>
    );
    const props = lastCanvasProps();
    expect(props.dpr).toEqual([1, 2]);
    expect((props.gl as Record<string, unknown>).antialias).toBe(true);
  });

  it('preserveDrawingBuffer and toneMappingExposure reach the gl config', () => {
    render(
      <StrataCanvas active preserveDrawingBuffer toneMappingExposure={1.1}>
        <group />
      </StrataCanvas>
    );
    const gl = lastCanvasProps().gl as Record<string, unknown>;
    expect(gl.preserveDrawingBuffer).toBe(true);
    expect(gl.toneMappingExposure).toBe(1.1);
  });
});

describe('StrataCanvas — WebGL context recovery', () => {
  it('preventDefaults the loss and routes both events to the caller handlers', () => {
    const onLost = vi.fn();
    const onRestored = vi.fn();
    render(
      <StrataCanvas active onContextLost={onLost} onContextRestored={onRestored}>
        <group />
      </StrataCanvas>
    );
    const canvas = createdWithCanvas();

    const lost = new Event('webglcontextlost', { cancelable: true });
    canvas.dispatchEvent(lost);
    // preventDefault is the recovery contract: without it the browser
    // discards the context permanently and never fires a restore.
    expect(lost.defaultPrevented).toBe(true);
    expect(onLost).toHaveBeenCalledWith(canvas);

    canvas.dispatchEvent(new Event('webglcontextrestored'));
    expect(onRestored).toHaveBeenCalledWith(canvas);
  });

  it('restore forces a real remount — preventDefault alone leaves the context empty', async () => {
    render(
      <StrataCanvas active>
        <group />
      </StrataCanvas>
    );
    const canvas = createdWithCanvas();
    expect(mountCount).toBe(1);

    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    canvas.dispatchEvent(new Event('webglcontextrestored'));

    // The state update happens inside a native DOM listener, outside React's
    // synchronous act() batching — flush a tick so the re-render commits.
    await new Promise((resolve) => setTimeout(resolve, 50));

    // A remount recreates the mock Canvas, so its mount effect fires again,
    // proving this is a real GL-context teardown, not just a callback.
    expect(mountCount).toBe(2);
  });

  it('warns rather than throwing when no handlers are supplied', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <StrataCanvas active>
        <group />
      </StrataCanvas>
    );
    const canvas = createdWithCanvas();

    const lost = new Event('webglcontextlost', { cancelable: true });
    canvas.dispatchEvent(lost);
    expect(lost.defaultPrevented).toBe(true);
    canvas.dispatchEvent(new Event('webglcontextrestored'));
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('handlers swapped in after mount are still reached (ref forwarding)', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(
      <StrataCanvas active onContextLost={first}>
        <group />
      </StrataCanvas>
    );
    const canvas = createdWithCanvas();

    rerender(
      <StrataCanvas active onContextLost={second}>
        <group />
      </StrataCanvas>
    );
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(canvas);
  });

  it('chains a caller-supplied onCreated after wiring the listeners', () => {
    const onCreated = vi.fn();
    render(
      <StrataCanvas active onCreated={onCreated}>
        <group />
      </StrataCanvas>
    );
    const canvas = document.createElement('canvas');
    const state = { gl: { domElement: canvas } } as unknown as RootState;
    lastCanvasProps().onCreated?.(state);
    expect(onCreated).toHaveBeenCalledWith(state);
  });
});

describe('StrataCanvas — StrictMode safety', () => {
  it('survives StrictMode double-invocation without duplicating handler calls', () => {
    const onLost = vi.fn();
    render(
      <StrictMode>
        <StrataCanvas active onContextLost={onLost}>
          <group />
        </StrataCanvas>
      </StrictMode>
    );
    // Attach listeners once, from the surviving committed tree.
    const canvas = createdWithCanvas();
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    expect(onLost).toHaveBeenCalledTimes(1);
    expect(onLost).toHaveBeenCalledWith(canvas);
  });

  it('renders exactly one host div under StrictMode', () => {
    const { container } = render(
      <StrictMode>
        <StrataCanvas active>
          <group />
        </StrataCanvas>
      </StrictMode>
    );
    expect(container.querySelectorAll(`.${STRATA_CANVAS_HOST_CLASS}`)).toHaveLength(1);
  });
});
