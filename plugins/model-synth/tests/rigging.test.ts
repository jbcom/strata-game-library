/**
 * RiggingAPI tests
 *
 * Tests the Meshy rigging and animation API client including task creation,
 * polling, deletion, and URL extraction from completed tasks.
 * All HTTP calls are mocked via globalThis.fetch.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RiggingTask } from '../src/clients/rigging.js';
import { RiggingAPI } from '../src/clients/rigging.js';

describe('RiggingAPI', () => {
  let originalFetch: typeof globalThis.fetch;
  let api: RiggingAPI;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    api = new RiggingAPI('test-rig-key');
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('constructor', () => {
    it('throws when API key is empty', () => {
      expect(() => new RiggingAPI('')).toThrow('Meshy API key is required');
    });

    it('uses v1 API base URL', () => {
      const client = new RiggingAPI('key');
      expect(client).toBeDefined();
    });
  });

  describe('createRiggingTask()', () => {
    it('sends correct request with required params', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ result: 'rig-task-001' }),
      }) as typeof fetch;

      const task = await api.createRiggingTask({
        input_task_id: 'refine-task-123',
      });

      expect(task.id).toBe('rig-task-001');
      expect(task.status).toBe('PENDING');
      expect(task.progress).toBe(0);
      expect(task.created_at).toBeDefined();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/rigging'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-rig-key',
          }),
        })
      );

      const callArgs = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.input_task_id).toBe('refine-task-123');
      expect(body.height_meters).toBe(1.7);
    });

    it('sends custom height', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ result: 'rig-task-002' }),
      }) as typeof fetch;

      await api.createRiggingTask({
        input_task_id: 'refine-task-456',
        height_meters: 0.6,
      });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.height_meters).toBe(0.6);
    });

    it('includes custom animations when provided', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ result: 'rig-task-003' }),
      }) as typeof fetch;

      await api.createRiggingTask({
        input_task_id: 'refine-task-789',
        custom_animations: {
          idle: true,
          attack: true,
          jump: true,
          death: false,
        },
      });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.custom_animations).toEqual({
        idle: true,
        attack: true,
        jump: true,
        death: false,
      });
    });

    it('includes animation_style when provided', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ result: 'rig-task-004' }),
      }) as typeof fetch;

      await api.createRiggingTask({
        input_task_id: 'refine-000',
        animation_style: 'exaggerated',
      });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.animation_style).toBe('exaggerated');
    });

    it('includes fps when provided', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ result: 'rig-task-005' }),
      }) as typeof fetch;

      await api.createRiggingTask({
        input_task_id: 'refine-111',
        fps: 60,
      });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.fps).toBe(60);
    });

    it('extracts task ID from id field', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'rig-from-id' }),
      }) as typeof fetch;

      const task = await api.createRiggingTask({ input_task_id: 'x' });
      expect(task.id).toBe('rig-from-id');
    });

    it('returns empty string id when neither result nor id present', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      }) as typeof fetch;

      const task = await api.createRiggingTask({ input_task_id: 'x' });
      expect(task.id).toBe('');
    });
  });

  describe('getRiggingTask()', () => {
    it('fetches task by ID', async () => {
      const mockTask: RiggingTask = {
        id: 'rig-get-001',
        status: 'IN_PROGRESS',
        progress: 45,
        created_at: 1700000000,
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTask),
      }) as typeof fetch;

      const task = await api.getRiggingTask('rig-get-001');

      expect(task.id).toBe('rig-get-001');
      expect(task.status).toBe('IN_PROGRESS');
      expect(task.progress).toBe(45);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/rigging/rig-get-001'),
        expect.any(Object)
      );
    });

    it('returns completed task with result URLs', async () => {
      const mockTask: RiggingTask = {
        id: 'rig-complete',
        status: 'SUCCEEDED',
        progress: 100,
        created_at: 1700000000,
        finished_at: 1700001000,
        result: {
          rigged_character_glb_url: 'https://cdn.meshy.ai/rigged.glb',
          rigged_character_fbx_url: 'https://cdn.meshy.ai/rigged.fbx',
          basic_animations: {
            walking_glb_url: 'https://cdn.meshy.ai/walk.glb',
            walking_fbx_url: 'https://cdn.meshy.ai/walk.fbx',
            running_glb_url: 'https://cdn.meshy.ai/run.glb',
            running_fbx_url: 'https://cdn.meshy.ai/run.fbx',
          },
        },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTask),
      }) as typeof fetch;

      const task = await api.getRiggingTask('rig-complete');
      expect(task.result?.rigged_character_glb_url).toBe('https://cdn.meshy.ai/rigged.glb');
      expect(task.result?.basic_animations?.walking_glb_url).toBe('https://cdn.meshy.ai/walk.glb');
    });
  });

  describe('pollRiggingTask()', () => {
    it('returns immediately when task is SUCCEEDED', async () => {
      const succeededTask: RiggingTask = {
        id: 'rig-done',
        status: 'SUCCEEDED',
        progress: 100,
        created_at: 1700000000,
        result: {
          rigged_character_glb_url: 'https://cdn.meshy.ai/model.glb',
        },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(succeededTask),
      }) as typeof fetch;

      const result = await api.pollRiggingTask('rig-done', 5, 10);
      expect(result.status).toBe('SUCCEEDED');
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('polls until SUCCEEDED', async () => {
      const pendingTask: RiggingTask = {
        id: 'rig-wait',
        status: 'IN_PROGRESS',
        progress: 30,
        created_at: 1700000000,
      };
      const doneTask: RiggingTask = {
        ...pendingTask,
        status: 'SUCCEEDED',
        progress: 100,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(pendingTask) })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(doneTask),
        }) as typeof fetch;

      const result = await api.pollRiggingTask('rig-wait', 5, 10);
      expect(result.status).toBe('SUCCEEDED');
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it('throws on FAILED status', async () => {
      const failedTask: RiggingTask = {
        id: 'rig-fail',
        status: 'FAILED',
        created_at: 1700000000,
        task_error: { message: 'Model not suitable for rigging' },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(failedTask),
      }) as typeof fetch;

      await expect(api.pollRiggingTask('rig-fail', 5, 10)).rejects.toThrow(
        'Rigging task rig-fail failed: FAILED'
      );
    });

    it('throws on CANCELED status', async () => {
      const canceledTask: RiggingTask = {
        id: 'rig-cancel',
        status: 'CANCELED',
        created_at: 1700000000,
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(canceledTask),
      }) as typeof fetch;

      await expect(api.pollRiggingTask('rig-cancel', 5, 10)).rejects.toThrow(
        'Rigging task rig-cancel failed: CANCELED'
      );
    });

    it('throws on timeout', async () => {
      const pendingTask: RiggingTask = {
        id: 'rig-timeout',
        status: 'PENDING',
        created_at: 1700000000,
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(pendingTask),
      }) as typeof fetch;

      await expect(api.pollRiggingTask('rig-timeout', 2, 10)).rejects.toThrow(
        'Rigging task rig-timeout timed out'
      );
    });
  });

  describe('deleteRiggingTask()', () => {
    it('sends DELETE request', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      }) as typeof fetch;

      await api.deleteRiggingTask('rig-delete-001');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/rigging/rig-delete-001'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('getAnimationUrls()', () => {
    it('returns empty object for non-succeeded tasks', () => {
      const task: RiggingTask = {
        id: 'rig-pending',
        status: 'PENDING',
        created_at: 1700000000,
      };

      const urls = api.getAnimationUrls(task);
      expect(urls).toEqual({});
    });

    it('returns empty object for IN_PROGRESS task', () => {
      const task: RiggingTask = {
        id: 'rig-progress',
        status: 'IN_PROGRESS',
        created_at: 1700000000,
      };

      const urls = api.getAnimationUrls(task);
      expect(urls).toEqual({});
    });

    it('extracts all animation URLs from succeeded task', () => {
      const task: RiggingTask = {
        id: 'rig-success',
        status: 'SUCCEEDED',
        created_at: 1700000000,
        result: {
          rigged_character_glb_url: 'https://cdn.meshy.ai/rigged.glb',
          rigged_character_fbx_url: 'https://cdn.meshy.ai/rigged.fbx',
          basic_animations: {
            walking_glb_url: 'https://cdn.meshy.ai/walk.glb',
            walking_fbx_url: 'https://cdn.meshy.ai/walk.fbx',
            running_glb_url: 'https://cdn.meshy.ai/run.glb',
            running_fbx_url: 'https://cdn.meshy.ai/run.fbx',
          },
        },
      };

      const urls = api.getAnimationUrls(task);

      expect(urls.rigged).toBe('https://cdn.meshy.ai/rigged.glb');
      expect(urls.walking).toBe('https://cdn.meshy.ai/walk.glb');
      expect(urls.running).toBe('https://cdn.meshy.ai/run.glb');
    });

    it('handles task with no result', () => {
      const task: RiggingTask = {
        id: 'rig-no-result',
        status: 'SUCCEEDED',
        created_at: 1700000000,
      };

      const urls = api.getAnimationUrls(task);
      expect(urls.rigged).toBeUndefined();
      expect(urls.walking).toBeUndefined();
      expect(urls.running).toBeUndefined();
    });

    it('handles task with partial result', () => {
      const task: RiggingTask = {
        id: 'rig-partial',
        status: 'SUCCEEDED',
        created_at: 1700000000,
        result: {
          rigged_character_glb_url: 'https://cdn.meshy.ai/rigged.glb',
        },
      };

      const urls = api.getAnimationUrls(task);
      expect(urls.rigged).toBe('https://cdn.meshy.ai/rigged.glb');
      expect(urls.walking).toBeUndefined();
    });

    it('extracts additional animation URLs with _glb_url suffix', () => {
      const task: RiggingTask = {
        id: 'rig-extra',
        status: 'SUCCEEDED',
        created_at: 1700000000,
        result: {
          rigged_character_glb_url: 'https://cdn.meshy.ai/rigged.glb',
          basic_animations: {
            walking_glb_url: 'https://cdn.meshy.ai/walk.glb',
            running_glb_url: 'https://cdn.meshy.ai/run.glb',
          },
        },
      };

      const urls = api.getAnimationUrls(task);
      // The result object includes rigged_character_glb_url directly
      expect(urls.rigged_character_glb_url).toBe('https://cdn.meshy.ai/rigged.glb');
    });
  });
});
