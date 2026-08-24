/**
 * A minimal fake Babylon Scene + Engine sufficient to exercise the mount
 * primitives in jsdom. Babylon's real Engine needs WebGL, which jsdom has
 * no implementation of.
 */

import type { Scene } from '@babylonjs/core/scene';
import { vi } from 'vitest';

export interface FakeObserver {
  callback: () => void;
}

export interface FakeScene {
  deltaMs: number;
  observers: FakeObserver[];
  onBeforeRenderObservable: {
    add: (callback: () => void) => FakeObserver;
    remove: (observer: FakeObserver) => boolean;
  };
  getEngine: () => { getDeltaTime: () => number };
  /** Drive one frame through every registered observer. */
  tick: () => void;
}

export function createFakeScene(deltaMs = 16): FakeScene {
  const observers: FakeObserver[] = [];
  const scene: FakeScene = {
    deltaMs,
    observers,
    onBeforeRenderObservable: {
      add: (callback: () => void) => {
        const observer: FakeObserver = { callback };
        observers.push(observer);
        return observer;
      },
      remove: (observer: FakeObserver) => {
        const index = observers.indexOf(observer);
        if (index === -1) return false;
        observers.splice(index, 1);
        return true;
      },
    },
    getEngine: () => ({ getDeltaTime: () => scene.deltaMs }),
    tick: () => {
      for (const observer of [...observers]) observer.callback();
    },
  };
  return scene;
}

export function asScene(scene: FakeScene): Scene {
  return scene as unknown as Scene;
}

/** Mutable holder read by the mocked `useScene`. */
export const sceneHolder: { current: Scene | null } = { current: null };

export const reactylonMock = {
  useScene: () => sceneHolder.current,
};

/** Records constructed TransformNodes so tests can assert on disposal. */
export interface FakeNode {
  name: string;
  scene: unknown;
  disposed: boolean;
  disposeArgs: [boolean | undefined, boolean | undefined] | null;
}

export const constructedNodes: FakeNode[] = [];

export class FakeTransformNode {
  name: string;
  scene: unknown;
  disposed = false;
  disposeArgs: [boolean | undefined, boolean | undefined] | null = null;

  constructor(name: string, scene: unknown) {
    this.name = name;
    this.scene = scene;
    constructedNodes.push(this as unknown as FakeNode);
  }

  dispose(doNotRecurse?: boolean, disposeMaterialAndTextures?: boolean): void {
    this.disposed = true;
    this.disposeArgs = [doNotRecurse, disposeMaterialAndTextures];
  }
}

export function resetSceneMocks(): void {
  constructedNodes.length = 0;
  sceneHolder.current = null;
  vi.clearAllMocks();
}
