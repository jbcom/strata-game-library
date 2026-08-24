import { extend } from '@pixi/react';
import { Graphics } from 'pixi.js';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  PixiReactMount,
  type PixiReactMountHandle,
} from '../../src/pixi-react';

extend({ Graphics });

interface ReadyRecord {
  readonly app: PixiReactMountHandle['app'];
  readonly canvas: HTMLCanvasElement;
  readonly canvasId: number;
}

interface ResizeRecord {
  readonly callbackWidth: number;
  readonly callbackHeight: number;
  readonly rendererWidth: number;
  readonly rendererHeight: number;
}

interface FixtureSnapshot {
  readonly readyCount: number;
  readonly liveReadyApplications: number;
  readonly liveCanvasCount: number;
  readonly currentCanvasId: number | null;
  readonly currentContextLosses: number;
  readonly reusedReadyCanvas: boolean;
  readonly width: number | null;
  readonly height: number | null;
  readonly resizeRecords: ResizeRecord[];
}

interface FixtureBridge {
  clearResizeRecords(): void;
  getSnapshot(): FixtureSnapshot;
  resize(width: number, height: number): void;
}

declare global {
  interface Window {
    __PIXI_REACT_MOUNT_FIXTURE__?: FixtureBridge;
  }
}

const readyRecords: ReadyRecord[] = [];
const resizeRecords: ResizeRecord[] = [];
let currentHandle: PixiReactMountHandle | null = null;
let currentCanvas: HTMLCanvasElement | null = null;
let nextCanvasId = 1;
let currentContextLosses = 0;

function applicationIsLive(record: ReadyRecord): boolean {
  const stage = record.app.stage as { destroyed?: boolean };
  return record.app.renderer !== null && record.app.renderer !== undefined && stage.destroyed !== true;
}

window.__PIXI_REACT_MOUNT_FIXTURE__ = {
  clearResizeRecords(): void {
    resizeRecords.length = 0;
  },
  getSnapshot(): FixtureSnapshot {
    const uniqueCanvases = new Set(readyRecords.map((record) => record.canvas));
    return {
      readyCount: readyRecords.length,
      liveReadyApplications: readyRecords.filter(applicationIsLive).length,
      liveCanvasCount: document.querySelectorAll('#fixture-stage canvas').length,
      currentCanvasId:
        currentCanvas === null
          ? null
          : (readyRecords.find((record) => record.canvas === currentCanvas)?.canvasId ?? null),
      currentContextLosses,
      reusedReadyCanvas: uniqueCanvases.size < readyRecords.length,
      width: currentHandle?.width ?? null,
      height: currentHandle?.height ?? null,
      resizeRecords: [...resizeRecords],
    };
  },
  resize(width: number, height: number): void {
    if (currentHandle === null) throw new Error('PixiReactMount is not ready');
    currentHandle.resize(width, height);
  },
};

if (new URLSearchParams(window.location.search).has('muted')) {
  document.documentElement.dataset.audioMode = 'muted-test';
}

function Fixture(): React.ReactElement {
  const [mounted, setMounted] = useState(true);
  const [generation, setGeneration] = useState(1);
  const handleRef = useRef<PixiReactMountHandle | null>(null);

  return (
    <>
      <div id="fixture-stage" data-testid="pixi-react-mount-stage">
        {mounted ? (
          <PixiReactMount
            key={generation}
            className="fixture-canvas"
            background={0x102030}
            maxResolution={2}
            resizeMode="observer"
            onReady={(handle) => {
              handleRef.current = handle;
              currentHandle = handle;
              currentCanvas = handle.canvas;
              currentContextLosses = 0;
              const record: ReadyRecord = {
                app: handle.app,
                canvas: handle.canvas,
                canvasId: nextCanvasId,
              };
              nextCanvasId += 1;
              readyRecords.push(record);
              handle.canvas.addEventListener('webglcontextlost', () => {
                if (currentCanvas === handle.canvas) currentContextLosses += 1;
              });
              document.documentElement.dataset.fixtureReady = String(record.canvasId);
            }}
            onResize={(width, height) => {
              const handle = handleRef.current;
              resizeRecords.push({
                callbackWidth: width,
                callbackHeight: height,
                rendererWidth: handle?.app.screen.width ?? width,
                rendererHeight: handle?.app.screen.height ?? height,
              });
            }}
          >
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear().rect(40, 40, 240, 140).fill(0x4fd1c5);
              }}
            />
          </PixiReactMount>
        ) : null}
      </div>
      <div id="fixture-controls">
        <button
          id="unmount"
          type="button"
          onClick={() => {
            currentHandle = null;
            currentCanvas = null;
            handleRef.current = null;
            delete document.documentElement.dataset.fixtureReady;
            setMounted(false);
          }}
        >
          Unmount
        </button>
        <button
          id="remount"
          type="button"
          onClick={() => {
            setGeneration((value) => value + 1);
            setMounted(true);
          }}
        >
          Remount
        </button>
      </div>
    </>
  );
}

const rootElement = document.getElementById('fixture-root');
if (rootElement === null) throw new Error('missing #fixture-root');
createRoot(rootElement).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
