/**
 * Debug Panel Tests
 *
 * Tests for leva debug panel integration and preset hooks.
 *
 * @module core/debug/__tests__/panel.test
 * @vitest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function extractValues(schema: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema)) {
        if (typeof value === 'object' && value !== null && 'value' in value) {
            result[key] = (value as { value: unknown }).value;
        } else if (
            typeof value === 'object' &&
            value !== null &&
            'type' in value &&
            (value as { type: string }).type === 'folder'
        ) {
            const folderValue = value as unknown as { schema: Record<string, unknown> };
            if (folderValue.schema) {
                Object.assign(result, extractValues(folderValue.schema));
            }
        } else {
            result[key] = value;
        }
    }
    return result;
}

vi.mock('leva', () => ({
    useControls: vi.fn(
        (
            nameOrSchema: string | Record<string, unknown>,
            schemaOrDeps?: Record<string, unknown> | unknown[]
        ) => {
            const schema =
                typeof nameOrSchema === 'string'
                    ? (schemaOrDeps as Record<string, unknown>)
                    : nameOrSchema;
            return extractValues(schema || {});
        }
    ),
    useCreateStore: vi.fn(() => ({ getData: vi.fn() })),
    folder: vi.fn((schema: unknown, options?: unknown) => ({
        type: 'folder',
        schema,
        options,
    })),
    button: vi.fn((onClick: () => void) => ({ type: 'button', onClick })),
    Leva: vi.fn(() => null),
    LevaPanel: vi.fn(() => null),
}));

import { button, folder, useControls } from 'leva';
import {
    createDebugButton,
    createDebugPanel,
    useCameraDebug,
    useDebugControls,
    useDebugFolder,
    useLightingDebug,
    usePhysicsDebug,
    usePostProcessingDebug,
} from '../panel';

describe('createDebugPanel', () => {
    describe('ideal case', () => {
        it('creates a debug panel instance with default config', () => {
            const { result } = renderHook(() => createDebugPanel());
            expect(result.current).toBeDefined();
            expect(result.current.store).toBeDefined();
            expect(result.current.config).toEqual({});
            expect(result.current.levaProps).toBeDefined();
        });

        it('creates a debug panel with custom config', () => {
            const { result } = renderHook(() =>
                createDebugPanel({
                    name: 'Game Debug',
                    collapsed: true,
                    position: 'top-right',
                })
            );
            expect(result.current.config.name).toBe('Game Debug');
            expect(result.current.config.collapsed).toBe(true);
            expect(result.current.config.position).toBe('top-right');
            expect(result.current.levaProps.titleBar.title).toBe('Game Debug');
            expect(result.current.levaProps.collapsed).toBe(true);
        });
    });

    describe('normal usage', () => {
        it('accepts position configuration', () => {
            const { result } = renderHook(() => createDebugPanel({ position: 'bottom-left' }));
            expect(result.current.config.position).toBe('bottom-left');
        });

        it('accepts theme configuration', () => {
            const { result } = renderHook(() =>
                createDebugPanel({
                    theme: {
                        colors: { accent1: '#ff0000' },
                    },
                })
            );
            expect(result.current.config.theme?.colors?.accent1).toBe('#ff0000');
        });
    });

    describe('edge cases', () => {
        it('handles empty config object', () => {
            const { result } = renderHook(() => createDebugPanel({}));
            expect(result.current.store).toBeDefined();
            expect(result.current.config).toEqual({});
        });

        it('handles undefined config', () => {
            const { result } = renderHook(() => createDebugPanel(undefined));
            expect(result.current.store).toBeDefined();
        });
    });
});

describe('useDebugControls', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('ideal case', () => {
        it('returns control values from schema', () => {
            const { result } = renderHook(() =>
                useDebugControls({
                    enabled: true,
                    value: { value: 50, min: 0, max: 100 },
                })
            );

            expect(useControls).toHaveBeenCalled();
            expect(result.current).toBeDefined();
        });

        it('handles boolean controls', () => {
            const { result } = renderHook(() =>
                useDebugControls({
                    wireframe: false,
                    showGrid: true,
                })
            );

            expect(result.current.wireframe).toBe(false);
            expect(result.current.showGrid).toBe(true);
        });
    });

    describe('normal usage', () => {
        it('handles number controls with options', () => {
            const { result } = renderHook(() =>
                useDebugControls({
                    speed: { value: 5, min: 0, max: 10, step: 0.5 },
                })
            );

            expect(result.current.speed).toBe(5);
        });

        it('handles vector controls', () => {
            const { result } = renderHook(() =>
                useDebugControls({
                    position: { value: { x: 1, y: 2, z: 3 } },
                })
            );

            expect(result.current.position).toEqual({ x: 1, y: 2, z: 3 });
        });
    });

    describe('edge cases', () => {
        it('handles empty schema', () => {
            const { result } = renderHook(() => useDebugControls({}));
            expect(result.current).toBeDefined();
        });

        it('passes dependencies array', () => {
            const deps = [1, 2, 3];
            renderHook(() => useDebugControls({ value: 1 }, deps));
            expect(useControls).toHaveBeenCalledWith({ value: 1 }, deps);
        });
    });
});

describe('useDebugFolder', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('ideal case', () => {
        it('creates a folder with schema', () => {
            renderHook(() =>
                useDebugFolder('Player', {
                    health: { value: 100, min: 0, max: 100 },
                })
            );

            expect(folder).toHaveBeenCalled();
            expect(useControls).toHaveBeenCalled();
        });
    });

    describe('normal usage', () => {
        it('creates collapsed folder when specified', () => {
            renderHook(() => useDebugFolder('Settings', { volume: { value: 0.5 } }, true));

            expect(folder).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({ collapsed: true })
            );
        });

        it('creates expanded folder by default', () => {
            renderHook(() => useDebugFolder('World', { gravity: { value: -9.81 } }));

            expect(folder).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({ collapsed: false })
            );
        });
    });

    describe('edge cases', () => {
        it('handles empty folder name', () => {
            renderHook(() => useDebugFolder('', { value: 1 }));
            expect(folder).toHaveBeenCalled();
        });

        it('handles complex nested schemas', () => {
            renderHook(() =>
                useDebugFolder('Complex', {
                    position: { value: { x: 0, y: 0, z: 0 } },
                    rotation: { value: { x: 0, y: 0, z: 0 } },
                    scale: { value: 1 },
                })
            );

            expect(folder).toHaveBeenCalled();
        });
    });
});

describe('useCameraDebug', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('ideal case', () => {
        it('returns default camera values', () => {
            const { result } = renderHook(() => useCameraDebug());

            expect(result.current).toMatchObject({
                fov: 75,
                near: 0.1,
                far: 1000,
                zoom: 1,
            });
        });
    });

    describe('normal usage', () => {
        it('accepts custom defaults', () => {
            const { result } = renderHook(() =>
                useCameraDebug({
                    fov: 60,
                    near: 0.5,
                    far: 500,
                })
            );

            expect(result.current.fov).toBe(60);
            expect(result.current.near).toBe(0.5);
            expect(result.current.far).toBe(500);
        });
    });

    describe('edge cases', () => {
        it('handles partial defaults', () => {
            const { result } = renderHook(() => useCameraDebug({ fov: 90 }));
            expect(result.current.fov).toBe(90);
        });
    });
});

describe('usePhysicsDebug', () => {
    describe('ideal case', () => {
        it('returns default physics values', () => {
            const { result } = renderHook(() => usePhysicsDebug());

            expect(result.current.timeScale).toBe(1);
            expect(result.current.showColliders).toBe(false);
        });
    });

    describe('normal usage', () => {
        it('accepts custom gravity', () => {
            const { result } = renderHook(() =>
                usePhysicsDebug({
                    gravity: { x: 0, y: -20, z: 0 },
                })
            );

            expect(result.current.gravity).toEqual({ x: 0, y: -20, z: 0 });
        });
    });
});

describe('useLightingDebug', () => {
    describe('ideal case', () => {
        it('returns default lighting values', () => {
            const { result } = renderHook(() => useLightingDebug());

            expect(result.current.ambientIntensity).toBe(0.5);
            expect(result.current.sunIntensity).toBe(1);
            expect(result.current.shadowsEnabled).toBe(true);
        });
    });
});

describe('usePostProcessingDebug', () => {
    describe('ideal case', () => {
        it('returns default post-processing values', () => {
            const { result } = renderHook(() => usePostProcessingDebug());

            expect(result.current.bloomEnabled).toBe(true);
            expect(result.current.bloomIntensity).toBe(1);
        });
    });

    describe('normal usage', () => {
        it('accepts custom bloom settings', () => {
            const { result } = renderHook(() =>
                usePostProcessingDebug({
                    bloomEnabled: false,
                    bloomIntensity: 2,
                })
            );

            expect(result.current.bloomEnabled).toBe(false);
            expect(result.current.bloomIntensity).toBe(2);
        });
    });
});

describe('createDebugButton', () => {
    describe('ideal case', () => {
        it('creates a button with click handler', () => {
            const onClick = vi.fn();
            createDebugButton(onClick);

            expect(button).toHaveBeenCalledWith(onClick);
        });
    });
});
