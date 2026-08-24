/**
 * PixiReactMount unit contract.
 *
 * @pixi/react is mocked only at its Application boundary. The browser gate
 * exercises the actual reconciler and GPU; these tests pin fleet policy,
 * option mapping, resize ordering and StrictMode cleanup deterministically.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { __mockState, FakeResizeObserver, pixiMock } from './_pixi-mock';

vi.mock('pixi.js', () => pixiMock());

vi.mock('@pixi/react', async () => {
  const React = await vi.importActual<typeof import('react')>('react');
  const Pixi = await import('pixi.js');

  const Application = React.forwardRef(function MockPixiReactApplication(
    props: {
      children?: React.ReactNode;
      className?: string;
      onInit?: (app: InstanceType<typeof Pixi.Application>) => void;
      [key: string]: unknown;
    },
    forwardedRef: React.ForwardedRef<{
      getApplication(): InstanceType<typeof Pixi.Application> | null;
      getCanvas(): HTMLCanvasElement | null;
    }>,
  ): React.ReactElement {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const appRef = React.useRef<InstanceType<typeof Pixi.Application> | null>(null);
    React.useImperativeHandle(forwardedRef, () => ({
      getApplication: () => appRef.current,
      getCanvas: () => canvasRef.current,
    }));

    React.useLayoutEffect(() => {
      const canvas = canvasRef.current;
      if (canvas === null) throw new Error('mock @pixi/react canvas missing');
      const app = new Pixi.Application();
      appRef.current = app;
      let active = true;
      const { children: _children, className: _className, onInit, ...initOptions } = props;
      void app.init({ ...initOptions, canvas }).then(() => {
        if (active) onInit?.(app);
      });
      return () => {
        active = false;
        app.destroy();
      };
    }, []);

    return <canvas ref={canvasRef} className={props.className} />;
  });

  return { Application };
});

import { act, type ReactElement, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  PixiReactMount,
  type PixiReactMountHandle,
} from '../src/pixi-react';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function sizedHost(width: number, height: number): HTMLDivElement {
  const host = document.createElement('div');
  Object.defineProperty(host, 'clientWidth', { configurable: true, value: width });
  Object.defineProperty(host, 'clientHeight', { configurable: true, value: height });
  document.body.appendChild(host);
  return host;
}

async function render(element: ReactElement, host: HTMLElement): Promise<Root> {
  const root = createRoot(host);
  await act(async () => root.render(element));
  await flush();
  return root;
}

beforeEach(() => {
  __mockState.reset();
  FakeResizeObserver.reset();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: FakeResizeObserver,
  });
  Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 3 });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => ({ matches: true })),
  });
});

describe('PixiReactMount', () => {
  it('delegates Application ownership instead of importing the imperative mount or constructing one', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/pixi-react.tsx'), 'utf8');
    expect(source).not.toMatch(/import\s+\{[^}]*\bmountPixi\b[^}]*\}/s);
    expect(source).not.toMatch(/\bnew\s+Application\s*\(/);
    expect(source.match(/<PixiReactApplication\b/g)).toHaveLength(1);
  });

  it('keeps one Application/canvas under StrictMode and preserves fleet options', async () => {
    const host = sizedHost(640, 360);
    const ready: PixiReactMountHandle[] = [];
    const resized: Array<[number, number]> = [];
    const root = await render(
      <StrictMode>
        <PixiReactMount
          className="fleet-canvas"
          background={0x123456}
          maxResolution={2}
          onReady={(handle) => ready.push(handle)}
          onResize={(width, height) => resized.push([width, height])}
        />
      </StrictMode>,
      host,
    );

    expect(host.querySelectorAll('canvas')).toHaveLength(1);
    expect(__mockState.apps.filter((app) => !app.destroyed)).toHaveLength(1);
    expect(ready).toHaveLength(1);
    expect(ready[0]?.canvas).toBe(host.querySelector('canvas'));
    expect(ready[0]?.reduceMotion).toBe(true);
    expect(ready[0]?.width).toBe(640);
    expect(ready[0]?.height).toBe(360);
    expect(resized).toEqual([[640, 360]]);

    const live = __mockState.apps.find((app) => !app.destroyed);
    expect(live?.initOptions).toMatchObject({
      width: 800,
      height: 450,
      background: 0x123456,
      antialias: true,
      resolution: 2,
      autoDensity: true,
      roundPixels: false,
    });
    expect(live?.resizeCalls).toEqual([[640, 360]]);
    expect(live?.resizeListenerCount).toBe(1);
    expect(ready[0]?.canvas.style.display).toBe('block');
    expect(ready[0]?.canvas.style.width).toBe('100%');
    expect(ready[0]?.canvas.style.height).toBe('100%');

    const observer = FakeResizeObserver.instances.find((candidate) => !candidate.disconnected);
    expect(observer?.observed).toEqual([host]);
    observer?.fire(701.8, 401.9);
    expect(live?.resizeCalls.at(-1)).toEqual([701, 401]);
    expect(resized.at(-1)).toEqual([701, 401]);
    expect(ready[0]?.width).toBe(701);
    expect(ready[0]?.height).toBe(401);

    await act(async () => root.unmount());
    expect(__mockState.apps.every((app) => app.destroyed)).toBe(true);
    expect(live?.resizeListenerCount).toBe(0);
    expect(FakeResizeObserver.instances.every((candidate) => candidate.disconnected)).toBe(true);
    expect(document.querySelectorAll('canvas')).toHaveLength(0);
  });

  it('manual mode dedupes resize and invokes reflow after renderer resize', async () => {
    const host = sizedHost(500, 300);
    let handle: PixiReactMountHandle | null = null;
    const callbackSnapshots: Array<{ size: [number, number]; lastRendererCall: [number, number] }> = [];
    const root = await render(
      <PixiReactMount
        pixelSnap={true}
        reduceMotion={false}
        resizeMode="manual"
        onReady={(value) => {
          handle = value;
        }}
        onResize={(width, height) => {
          const live = __mockState.apps.find((app) => !app.destroyed);
          callbackSnapshots.push({
            size: [width, height],
            lastRendererCall: live?.resizeCalls.at(-1) ?? [-1, -1],
          });
        }}
      />,
      host,
    );

    expect(handle).not.toBeNull();
    expect(FakeResizeObserver.instances).toHaveLength(0);
    const live = __mockState.apps.find((app) => !app.destroyed);
    expect(live?.initOptions).toMatchObject({ antialias: false, resolution: 1, roundPixels: true });
    expect((handle as PixiReactMountHandle | null)?.reduceMotion).toBe(false);

    (handle as PixiReactMountHandle | null)?.resize(333.9, 222.9);
    (handle as PixiReactMountHandle | null)?.resize(333, 222);
    expect(live?.resizeCalls).toEqual([[333, 222]]);
    expect(callbackSnapshots).toEqual([
      { size: [333, 222], lastRendererCall: [333, 222] },
    ]);

    await act(async () => root.unmount());
  });

  it('resizeTo uses the explicit target without creating a second observer', async () => {
    const host = sizedHost(500, 300);
    const target = sizedHost(720, 405);
    let handle: PixiReactMountHandle | null = null;
    const root = await render(
      <PixiReactMount
        resizeMode="resizeTo"
        resizeTarget={target}
        onReady={(value) => {
          handle = value;
        }}
      />,
      host,
    );

    const live = __mockState.apps.find((app) => !app.destroyed);
    expect(FakeResizeObserver.instances).toHaveLength(0);
    expect((handle as PixiReactMountHandle | null)?.width).toBe(720);
    expect((handle as PixiReactMountHandle | null)?.height).toBe(405);
    expect(live?.resizeCalls).toEqual([[720, 405]]);

    await act(async () => root.unmount());
  });
});
