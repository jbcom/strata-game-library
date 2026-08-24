import { cleanup, render } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { asScene, createFakeScene, reactylonMock, sceneHolder } from './_sceneMock.js';

vi.mock('reactylon', () => reactylonMock);

const { MAX_FRAME_DELTA_SECONDS, useBeforeRender } = await import(
  '../src/mount/useBeforeRender.js'
);

afterEach(() => {
  cleanup();
  sceneHolder.current = null;
});

function Probe({ onFrame, deps }: { onFrame: (d: number) => void; deps?: unknown[] }) {
  useBeforeRender((delta) => onFrame(delta), deps);
  return null;
}

describe('useBeforeRender', () => {
  it('registers an observer on the active scene and calls back per frame', () => {
    const scene = createFakeScene(16);
    sceneHolder.current = asScene(scene);
    const onFrame = vi.fn();

    render(<Probe onFrame={onFrame} />);
    expect(scene.observers).toHaveLength(1);

    scene.tick();
    scene.tick();
    expect(onFrame).toHaveBeenCalledTimes(2);
  });

  it('converts the engine delta from milliseconds to seconds', () => {
    const scene = createFakeScene(20);
    sceneHolder.current = asScene(scene);
    const onFrame = vi.fn();

    render(<Probe onFrame={onFrame} />);
    scene.tick();
    expect(onFrame).toHaveBeenCalledWith(0.02);
  });

  it('clamps a backgrounded-tab spike to the frame-delta ceiling', () => {
    // A tab restored after 8 seconds reports an 8000ms delta. Unclamped,
    // that tunnels physics and NaNs springs.
    const scene = createFakeScene(8000);
    sceneHolder.current = asScene(scene);
    const onFrame = vi.fn();

    render(<Probe onFrame={onFrame} />);
    scene.tick();
    expect(onFrame).toHaveBeenCalledWith(MAX_FRAME_DELTA_SECONDS);
    expect(MAX_FRAME_DELTA_SECONDS).toBe(0.05);
  });

  it('passes the active scene as the second callback argument', () => {
    const scene = createFakeScene();
    sceneHolder.current = asScene(scene);
    const seen: unknown[] = [];

    function SceneProbe() {
      useBeforeRender((_delta, activeScene) => seen.push(activeScene));
      return null;
    }
    render(<SceneProbe />);
    scene.tick();
    expect(seen[0]).toBe(scene);
  });

  it('removes the observer on unmount — no leak, no post-unmount calls', () => {
    const scene = createFakeScene();
    sceneHolder.current = asScene(scene);
    const onFrame = vi.fn();

    const { unmount } = render(<Probe onFrame={onFrame} />);
    expect(scene.observers).toHaveLength(1);

    unmount();
    expect(scene.observers).toHaveLength(0);
    scene.tick();
    expect(onFrame).not.toHaveBeenCalled();
  });

  it('calls the latest callback without re-registering the observer', () => {
    const scene = createFakeScene();
    sceneHolder.current = asScene(scene);
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = render(<Probe onFrame={first} />);
    const observerAfterMount = scene.observers[0];

    rerender(<Probe onFrame={second} />);
    // Same observer instance: a prop change must not churn the observable.
    expect(scene.observers).toHaveLength(1);
    expect(scene.observers[0]).toBe(observerAfterMount);

    scene.tick();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('re-registers when an explicit dep changes', () => {
    const scene = createFakeScene();
    sceneHolder.current = asScene(scene);
    const onFrame = vi.fn();

    const { rerender } = render(<Probe onFrame={onFrame} deps={['a']} />);
    const first = scene.observers[0];

    rerender(<Probe onFrame={onFrame} deps={['b']} />);
    expect(scene.observers).toHaveLength(1);
    expect(scene.observers[0]).not.toBe(first);
  });

  it('is inert while no scene is available, and attaches once one appears', () => {
    sceneHolder.current = null;
    const onFrame = vi.fn();
    const { rerender } = render(<Probe onFrame={onFrame} />);
    expect(onFrame).not.toHaveBeenCalled();

    const scene = createFakeScene();
    sceneHolder.current = asScene(scene);
    rerender(<Probe onFrame={onFrame} deps={['scene-arrived']} />);
    scene.tick();
    expect(onFrame).toHaveBeenCalledTimes(1);
  });

  it('leaves exactly one live observer under StrictMode double-invocation', () => {
    const scene = createFakeScene();
    sceneHolder.current = asScene(scene);
    const onFrame = vi.fn();

    render(
      <StrictMode>
        <Probe onFrame={onFrame} />
      </StrictMode>
    );
    // StrictMode mounts, unmounts, and remounts effects. A cleanup that did
    // not remove its own observer would leave two and double-tick the sim.
    expect(scene.observers).toHaveLength(1);
    scene.tick();
    expect(onFrame).toHaveBeenCalledTimes(1);
  });

  it('detaches cleanly from an old scene when the scene itself swaps', () => {
    const first = createFakeScene();
    sceneHolder.current = asScene(first);
    const onFrame = vi.fn();
    const { rerender } = render(<Probe onFrame={onFrame} />);
    expect(first.observers).toHaveLength(1);

    const second = createFakeScene();
    sceneHolder.current = asScene(second);
    rerender(<Probe onFrame={onFrame} deps={['swap']} />);

    expect(first.observers).toHaveLength(0);
    expect(second.observers).toHaveLength(1);
  });
});
