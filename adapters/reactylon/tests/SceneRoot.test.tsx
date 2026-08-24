import { cleanup, render } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  asScene,
  constructedNodes,
  createFakeScene,
  FakeTransformNode,
  reactylonMock,
  resetSceneMocks,
  sceneHolder,
} from './_sceneMock.js';

vi.mock('reactylon', () => reactylonMock);
vi.mock('@babylonjs/core/Meshes/transformNode.js', () => ({
  TransformNode: FakeTransformNode,
}));

const { SceneRoot } = await import('../src/mount/SceneRoot.js');

afterEach(() => {
  cleanup();
  resetSceneMocks();
});

type Phase = 'menu' | 'combat' | 'gameover';

function Harness({ phase, match = 'combat' }: { phase: Phase; match?: Phase }) {
  return (
    <SceneRoot activeKey={phase} matchKey={match}>
      {(root) => (
        <div data-testid="subtree" data-root={(root as unknown as { name: string }).name} />
      )}
    </SceneRoot>
  );
}

describe('SceneRoot — phase gating', () => {
  it('renders nothing and builds no node while the key does not match', () => {
    sceneHolder.current = asScene(createFakeScene());
    const { container } = render(<Harness phase="menu" />);
    expect(container.firstChild).toBeNull();
    expect(constructedNodes).toHaveLength(0);
  });

  it('mounts a scene-scoped TransformNode and renders children when the key matches', () => {
    const scene = createFakeScene();
    sceneHolder.current = asScene(scene);
    const { getByTestId } = render(<Harness phase="combat" />);

    expect(constructedNodes).toHaveLength(1);
    expect(constructedNodes[0].name).toBe('strata-scene-root-combat');
    expect(constructedNodes[0].scene).toBe(scene);
    expect(getByTestId('subtree').getAttribute('data-root')).toBe('strata-scene-root-combat');
  });

  it('renders nothing while no scene is available yet', () => {
    sceneHolder.current = null;
    const { container } = render(<Harness phase="combat" />);
    expect(container.firstChild).toBeNull();
    expect(constructedNodes).toHaveLength(0);
  });
});

describe('SceneRoot — disposal', () => {
  it('disposes the subtree recursively when the phase leaves', () => {
    sceneHolder.current = asScene(createFakeScene());
    const { container, rerender } = render(<Harness phase="combat" />);
    expect(constructedNodes[0].disposed).toBe(false);

    rerender(<Harness phase="menu" />);
    expect(constructedNodes[0].disposed).toBe(true);
    // dispose(doNotRecurse=false, disposeMaterialAndTextures=true): Babylon
    // has no GC for scene nodes, so children and their GPU resources must go
    // with the root or they render and consume memory forever.
    expect(constructedNodes[0].disposeArgs).toEqual([false, true]);
    expect(container.firstChild).toBeNull();
  });

  it('disposes on unmount', () => {
    sceneHolder.current = asScene(createFakeScene());
    const { unmount } = render(<Harness phase="combat" />);
    unmount();
    expect(constructedNodes[0].disposed).toBe(true);
  });

  it('builds a fresh node per phase entry and disposes the previous one', () => {
    sceneHolder.current = asScene(createFakeScene());
    const { rerender } = render(<Harness phase="combat" />);
    rerender(<Harness phase="menu" />);
    rerender(<Harness phase="combat" />);

    expect(constructedNodes).toHaveLength(2);
    expect(constructedNodes[0].disposed).toBe(true);
    expect(constructedNodes[1].disposed).toBe(false);
  });

  it('names the node from the match key, so concurrent roots stay distinguishable', () => {
    sceneHolder.current = asScene(createFakeScene());
    render(
      <>
        <Harness phase="combat" match="combat" />
        <SceneRoot activeKey={0} matchKey={0}>
          {() => null}
        </SceneRoot>
      </>
    );
    const names = constructedNodes.map((node) => node.name);
    expect(names).toContain('strata-scene-root-combat');
    expect(names).toContain('strata-scene-root-0');
  });
});

describe('SceneRoot — StrictMode safety', () => {
  it('keeps a live, rendered root after StrictMode remounts the effect', () => {
    sceneHolder.current = asScene(createFakeScene());
    const { getByTestId } = render(
      <StrictMode>
        <Harness phase="combat" />
      </StrictMode>
    );

    // StrictMode runs mount -> cleanup -> mount. The cleanup must clear the
    // published root ONLY if it is still its own node; an unconditional
    // reset would blank the newer node and leave the subtree unmounted.
    expect(getByTestId('subtree')).toBeTruthy();

    const live = constructedNodes.filter((node) => !node.disposed);
    expect(live).toHaveLength(1);
    expect(getByTestId('subtree').getAttribute('data-root')).toBe(live[0].name);
  });

  it('disposes every superseded node under StrictMode — no orphans left in the scene', () => {
    sceneHolder.current = asScene(createFakeScene());
    const { unmount } = render(
      <StrictMode>
        <Harness phase="combat" />
      </StrictMode>
    );
    unmount();
    expect(constructedNodes.length).toBeGreaterThan(0);
    expect(constructedNodes.every((node) => node.disposed)).toBe(true);
  });
});
