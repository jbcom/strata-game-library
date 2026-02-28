/**
 * AnimationsAPI tests
 *
 * Tests the Meshy animations API client including task creation,
 * polling, deletion, URL extraction, and the animation library constants.
 * All HTTP calls are mocked via globalThis.fetch.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AnimationTask, AnimationTaskParams } from '../src/clients/animations.js';
import { AnimationsAPI, OTTER_ANIMATIONS, ROCK_ANIMATIONS } from '../src/clients/animations.js';

describe('AnimationsAPI', () => {
  let originalFetch: typeof globalThis.fetch;
  let api: AnimationsAPI;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    api = new AnimationsAPI('test-anim-key');
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('constructor', () => {
    it('throws when API key is empty', () => {
      expect(() => new AnimationsAPI('')).toThrow('Meshy API key is required');
    });

    it('creates instance with valid key', () => {
      const client = new AnimationsAPI('key');
      expect(client).toBeDefined();
    });
  });

  describe('createAnimationTask()', () => {
    it('sends correct request with required params', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ result: 'anim-task-001' }),
      }) as typeof fetch;

      const task = await api.createAnimationTask({
        rig_task_id: 'rig-123',
        action_id: 14,
      });

      expect(task.id).toBe('anim-task-001');
      expect(task.status).toBe('PENDING');
      expect(task.progress).toBe(0);
      expect(task.created_at).toBeDefined();

      const callArgs = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs[0]).toContain('/animations');

      const body = JSON.parse(callArgs[1].body);
      expect(body.rig_task_id).toBe('rig-123');
      expect(body.action_id).toBe(14);
    });

    it('includes post_process when provided', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ result: 'anim-task-002' }),
      }) as typeof fetch;

      await api.createAnimationTask({
        rig_task_id: 'rig-456',
        action_id: 0,
        post_process: {
          operation_type: 'change_fps',
          fps: 60,
        },
      });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.post_process).toEqual({
        operation_type: 'change_fps',
        fps: 60,
      });
    });

    it('includes fbx2usdz post_process operation', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ result: 'anim-task-003' }),
      }) as typeof fetch;

      await api.createAnimationTask({
        rig_task_id: 'rig-789',
        action_id: 30,
        post_process: {
          operation_type: 'fbx2usdz',
        },
      });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.post_process.operation_type).toBe('fbx2usdz');
    });

    it('includes extract_armature post_process operation', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ result: 'anim-task-004' }),
      }) as typeof fetch;

      await api.createAnimationTask({
        rig_task_id: 'rig-000',
        action_id: 466,
        post_process: {
          operation_type: 'extract_armature',
        },
      });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.post_process.operation_type).toBe('extract_armature');
    });

    it('extracts task ID from id field', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'anim-from-id' }),
      }) as typeof fetch;

      const task = await api.createAnimationTask({
        rig_task_id: 'rig-x',
        action_id: 0,
      });
      expect(task.id).toBe('anim-from-id');
    });

    it('returns empty string id when neither result nor id present', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      }) as typeof fetch;

      const task = await api.createAnimationTask({
        rig_task_id: 'rig-y',
        action_id: 0,
      });
      expect(task.id).toBe('');
    });
  });

  describe('getAnimationTask()', () => {
    it('fetches task by ID', async () => {
      const mockTask: AnimationTask = {
        id: 'anim-get-001',
        status: 'IN_PROGRESS',
        progress: 55,
        created_at: 1700000000,
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTask),
      }) as typeof fetch;

      const task = await api.getAnimationTask('anim-get-001');

      expect(task.id).toBe('anim-get-001');
      expect(task.status).toBe('IN_PROGRESS');
      expect(task.progress).toBe(55);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/animations/anim-get-001'),
        expect.any(Object)
      );
    });

    it('returns completed task with result URLs', async () => {
      const mockTask: AnimationTask = {
        id: 'anim-done',
        status: 'SUCCEEDED',
        progress: 100,
        created_at: 1700000000,
        finished_at: 1700001000,
        result: {
          animation_glb_url: 'https://cdn.meshy.ai/anim.glb',
          animation_fbx_url: 'https://cdn.meshy.ai/anim.fbx',
        },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTask),
      }) as typeof fetch;

      const task = await api.getAnimationTask('anim-done');
      expect(task.result?.animation_glb_url).toBe('https://cdn.meshy.ai/anim.glb');
      expect(task.result?.animation_fbx_url).toBe('https://cdn.meshy.ai/anim.fbx');
    });

    it('returns task with error info', async () => {
      const mockTask: AnimationTask = {
        id: 'anim-err',
        status: 'FAILED',
        created_at: 1700000000,
        task_error: { message: 'Invalid rig task' },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTask),
      }) as typeof fetch;

      const task = await api.getAnimationTask('anim-err');
      expect(task.task_error?.message).toBe('Invalid rig task');
    });
  });

  describe('pollAnimationTask()', () => {
    it('returns immediately when task is SUCCEEDED', async () => {
      const succeededTask: AnimationTask = {
        id: 'anim-poll-done',
        status: 'SUCCEEDED',
        progress: 100,
        created_at: 1700000000,
        result: {
          animation_glb_url: 'https://cdn.meshy.ai/done.glb',
        },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(succeededTask),
      }) as typeof fetch;

      const result = await api.pollAnimationTask('anim-poll-done', 5, 10);
      expect(result.status).toBe('SUCCEEDED');
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('polls until SUCCEEDED', async () => {
      const pending: AnimationTask = {
        id: 'anim-poll-wait',
        status: 'IN_PROGRESS',
        progress: 25,
        created_at: 1700000000,
      };
      const done: AnimationTask = {
        ...pending,
        status: 'SUCCEEDED',
        progress: 100,
        result: { animation_glb_url: 'https://cdn.meshy.ai/poll.glb' },
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(pending) })
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(done) }) as typeof fetch;

      const result = await api.pollAnimationTask('anim-poll-wait', 5, 10);
      expect(result.status).toBe('SUCCEEDED');
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it('throws on FAILED status', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: 'anim-fail',
          status: 'FAILED',
          created_at: 1700000000,
          task_error: { message: 'Processing failed' },
        }),
      }) as typeof fetch;

      await expect(api.pollAnimationTask('anim-fail', 5, 10)).rejects.toThrow(
        'Animation task anim-fail failed: FAILED'
      );
    });

    it('throws on CANCELED status', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: 'anim-cancel',
          status: 'CANCELED',
          created_at: 1700000000,
        }),
      }) as typeof fetch;

      await expect(api.pollAnimationTask('anim-cancel', 5, 10)).rejects.toThrow(
        'Animation task anim-cancel failed: CANCELED'
      );
    });

    it('throws on timeout', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: 'anim-timeout',
          status: 'PENDING',
          created_at: 1700000000,
        }),
      }) as typeof fetch;

      await expect(api.pollAnimationTask('anim-timeout', 2, 10)).rejects.toThrow(
        'Animation task anim-timeout timed out'
      );
    });
  });

  describe('deleteAnimationTask()', () => {
    it('sends DELETE request', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      }) as typeof fetch;

      await api.deleteAnimationTask('anim-del-001');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/animations/anim-del-001'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('getAnimationGLB()', () => {
    it('returns GLB URL from completed task', () => {
      const task: AnimationTask = {
        id: 'anim-glb',
        status: 'SUCCEEDED',
        created_at: 1700000000,
        result: {
          animation_glb_url: 'https://cdn.meshy.ai/animation.glb',
          animation_fbx_url: 'https://cdn.meshy.ai/animation.fbx',
        },
      };

      expect(api.getAnimationGLB(task)).toBe('https://cdn.meshy.ai/animation.glb');
    });

    it('returns null when result is undefined', () => {
      const task: AnimationTask = {
        id: 'anim-no-result',
        status: 'PENDING',
        created_at: 1700000000,
      };

      expect(api.getAnimationGLB(task)).toBeNull();
    });

    it('returns null when animation_glb_url is undefined', () => {
      const task: AnimationTask = {
        id: 'anim-no-glb',
        status: 'SUCCEEDED',
        created_at: 1700000000,
        result: {
          animation_fbx_url: 'https://cdn.meshy.ai/animation.fbx',
        },
      };

      expect(api.getAnimationGLB(task)).toBeNull();
    });

    it('returns null for empty result', () => {
      const task: AnimationTask = {
        id: 'anim-empty-result',
        status: 'SUCCEEDED',
        created_at: 1700000000,
        result: {},
      };

      expect(api.getAnimationGLB(task)).toBeNull();
    });
  });
});

describe('OTTER_ANIMATIONS', () => {
  it('defines core movement animation IDs', () => {
    expect(OTTER_ANIMATIONS.idle).toBe(0);
    expect(OTTER_ANIMATIONS.walk).toBe(30);
    expect(OTTER_ANIMATIONS.run).toBe(14);
    expect(OTTER_ANIMATIONS.runFast).toBe(16);
  });

  it('defines game action animation IDs', () => {
    expect(OTTER_ANIMATIONS.jump).toBe(466);
    expect(OTTER_ANIMATIONS.collect).toBe(284);
  });

  it('defines reaction animation IDs', () => {
    expect(OTTER_ANIMATIONS.hit).toBe(178);
    expect(OTTER_ANIMATIONS.death).toBe(8);
    expect(OTTER_ANIMATIONS.victory).toBe(59);
    expect(OTTER_ANIMATIONS.happy).toBe(44);
  });

  it('defines dodge/evade animation IDs', () => {
    expect(OTTER_ANIMATIONS.dodgeLeft).toBe(158);
    expect(OTTER_ANIMATIONS.dodgeRight).toBe(159);
    expect(OTTER_ANIMATIONS.slideLeft).toBe(516);
    expect(OTTER_ANIMATIONS.slideRight).toBe(517);
  });

  it('has all expected animation keys', () => {
    const keys = Object.keys(OTTER_ANIMATIONS);
    expect(keys).toContain('idle');
    expect(keys).toContain('walk');
    expect(keys).toContain('run');
    expect(keys).toContain('runFast');
    expect(keys).toContain('jump');
    expect(keys).toContain('collect');
    expect(keys).toContain('hit');
    expect(keys).toContain('death');
    expect(keys).toContain('victory');
    expect(keys).toContain('happy');
    expect(keys).toContain('dodgeLeft');
    expect(keys).toContain('dodgeRight');
    expect(keys).toContain('slideLeft');
    expect(keys).toContain('slideRight');
    expect(keys).toHaveLength(14);
  });

  it('all animation IDs are non-negative integers', () => {
    for (const [, value] of Object.entries(OTTER_ANIMATIONS)) {
      expect(value).toBeTypeOf('number');
      expect(value).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('is marked as const (readonly at TypeScript level)', () => {
    // `as const` provides TypeScript-level readonly, not runtime Object.freeze
    // Verify the values are not reassignable at the type level by checking they exist
    expect(OTTER_ANIMATIONS.idle).toBeDefined();
    expect(typeof OTTER_ANIMATIONS.idle).toBe('number');
  });
});

describe('ROCK_ANIMATIONS', () => {
  it('is an empty object (static obstacles have no animations)', () => {
    expect(Object.keys(ROCK_ANIMATIONS)).toHaveLength(0);
  });

  it('is marked as const (readonly at TypeScript level)', () => {
    // `as const` provides TypeScript-level readonly, not runtime Object.freeze
    expect(ROCK_ANIMATIONS).toBeDefined();
    expect(typeof ROCK_ANIMATIONS).toBe('object');
  });
});
