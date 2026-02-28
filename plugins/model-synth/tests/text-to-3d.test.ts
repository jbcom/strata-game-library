/**
 * TextTo3DAPI tests
 *
 * Tests the text-to-3D model generation client including preview tasks,
 * refine tasks, polling, deletion, and listing.
 * All HTTP calls are mocked via globalThis.fetch.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateTaskParams, MeshyTask } from '../src/clients/text-to-3d.js';
import { TextTo3DAPI } from '../src/clients/text-to-3d.js';

describe('TextTo3DAPI', () => {
  let originalFetch: typeof globalThis.fetch;
  let api: TextTo3DAPI;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    api = new TextTo3DAPI('test-api-key');
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('throws when API key is empty', () => {
      expect(() => new TextTo3DAPI('')).toThrow('Meshy API key is required');
    });

    it('uses default base URL', () => {
      const client = new TextTo3DAPI('key');
      expect(client).toBeDefined();
    });

    it('accepts a custom base URL', () => {
      const client = new TextTo3DAPI('key', 'https://custom.api.com/v3');
      expect(client).toBeDefined();
    });
  });

  describe('createPreviewTask()', () => {
    it('sends correct request with all parameters', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'task-abc' });
      const params: CreateTaskParams = {
        text_prompt: 'a cute otter',
        art_style: 'cartoon',
        ai_model: 'meshy-5',
        topology: 'quad',
        target_polycount: 10000,
        should_remesh: true,
        symmetry_mode: 'symmetric',
        is_a_t_pose: true,
        moderation: 'strict',
      };

      const task = await api.createPreviewTask(params, mockMakeRequest);

      expect(mockMakeRequest).toHaveBeenCalledTimes(1);
      const [url, options] = mockMakeRequest.mock.calls[0];
      expect(url).toContain('/text-to-3d');

      const body = JSON.parse(options.body);
      expect(body.mode).toBe('preview');
      expect(body.prompt).toBe('a cute otter');
      expect(body.art_style).toBe('cartoon');
      expect(body.ai_model).toBe('meshy-5');
      expect(body.topology).toBe('quad');
      expect(body.target_polycount).toBe(10000);
      expect(body.should_remesh).toBe(true);
      expect(body.symmetry_mode).toBe('symmetric');
      expect(body.is_a_t_pose).toBe(true);
      expect(body.moderation).toBe('strict');

      expect(task.id).toBe('task-abc');
      expect(task.status).toBe('PENDING');
      expect(task.progress).toBe(0);
      expect(task.model_urls).toBeNull();
    });

    it('applies default values for optional parameters', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'task-def' });

      await api.createPreviewTask({ text_prompt: 'a rock' }, mockMakeRequest);

      const body = JSON.parse(mockMakeRequest.mock.calls[0][1].body);
      expect(body.art_style).toBe('realistic');
      expect(body.ai_model).toBe('meshy-5');
      expect(body.topology).toBe('triangle');
      expect(body.target_polycount).toBe(30000);
      expect(body.should_remesh).toBe(true);
      expect(body.symmetry_mode).toBe('auto');
      expect(body.is_a_t_pose).toBe(false);
      expect(body.moderation).toBe(false);
    });

    it('sets Authorization header', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'task-001' });

      await api.createPreviewTask({ text_prompt: 'test' }, mockMakeRequest);

      const headers = mockMakeRequest.mock.calls[0][1].headers;
      expect(headers.Authorization).toBe('Bearer test-api-key');
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('extracts task ID from result field', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'from-result' });

      const task = await api.createPreviewTask({ text_prompt: 'test' }, mockMakeRequest);
      expect(task.id).toBe('from-result');
    });

    it('extracts task ID from id field when result is missing', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ id: 'from-id' });

      const task = await api.createPreviewTask({ text_prompt: 'test' }, mockMakeRequest);
      expect(task.id).toBe('from-id');
    });

    it('throws when no task ID is returned', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({});

      await expect(api.createPreviewTask({ text_prompt: 'test' }, mockMakeRequest)).rejects.toThrow(
        'No task ID returned from createPreviewTask'
      );
    });

    it('returns task with correct initial fields', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'task-xyz' });

      const task = await api.createPreviewTask({ text_prompt: 'test' }, mockMakeRequest);

      expect(task.id).toBe('task-xyz');
      expect(task.status).toBe('PENDING');
      expect(task.progress).toBe(0);
      expect(task.model_urls).toBeNull();
      expect(task.finished_at).toBe(0);
      expect(task.created_at).toBeDefined();
    });

    it('passes art_style value through to request body', async () => {
      // Test representative styles to verify pass-through behavior.
      // createPreviewTask has an internal 1s delay, so we test a subset.
      const styles = ['realistic', 'voxel', 'dark fantasy'] as const;

      for (const style of styles) {
        const mockMakeRequest = vi.fn().mockResolvedValue({ result: `task-${style}` });
        const task = await api.createPreviewTask(
          { text_prompt: 'test', art_style: style },
          mockMakeRequest
        );
        expect(task.id).toBe(`task-${style}`);

        const body = JSON.parse(mockMakeRequest.mock.calls[0][1].body);
        expect(body.art_style).toBe(style);
      }
    }, 15000);
  });

  describe('createRefineTask()', () => {
    it('sends correct request with preview task ID', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'refine-001' });

      const task = await api.createRefineTask('preview-123', mockMakeRequest);

      expect(mockMakeRequest).toHaveBeenCalledTimes(1);
      const body = JSON.parse(mockMakeRequest.mock.calls[0][1].body);
      expect(body.mode).toBe('refine');
      expect(body.preview_task_id).toBe('preview-123');
      expect(body.enable_pbr).toBe(false);
      expect(body.ai_model).toBe('meshy-5');

      expect(task.id).toBe('refine-001');
      expect(task.status).toBe('PENDING');
    });

    it('includes optional PBR and texture params', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'refine-002' });

      await api.createRefineTask('preview-456', mockMakeRequest, {
        enable_pbr: true,
        texture_prompt: 'worn leather texture',
        ai_model: 'meshy-4',
      });

      const body = JSON.parse(mockMakeRequest.mock.calls[0][1].body);
      expect(body.enable_pbr).toBe(true);
      expect(body.texture_prompt).toBe('worn leather texture');
      expect(body.ai_model).toBe('meshy-4');
    });

    it('handles id field in response', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ id: 'refine-from-id' });

      const task = await api.createRefineTask('preview-789', mockMakeRequest);
      expect(task.id).toBe('refine-from-id');
    });

    it('returns empty string id when neither result nor id present', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({});

      const task = await api.createRefineTask('preview-000', mockMakeRequest);
      expect(task.id).toBe('');
    });

    it('works without optional params', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'refine-003' });

      const task = await api.createRefineTask('preview-111', mockMakeRequest);

      const body = JSON.parse(mockMakeRequest.mock.calls[0][1].body);
      expect(body.texture_prompt).toBeUndefined();
      expect(task.id).toBe('refine-003');
    });
  });

  describe('getTask()', () => {
    it('fetches task status successfully', async () => {
      const mockTask: MeshyTask = {
        id: 'task-123',
        status: 'SUCCEEDED',
        progress: 100,
        model_urls: { glb: 'https://cdn.meshy.ai/model.glb' },
        created_at: '1700000000',
        finished_at: 1700001000,
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTask),
      }) as typeof fetch;

      const task = await api.getTask('task-123', false);

      expect(task.id).toBe('task-123');
      expect(task.status).toBe('SUCCEEDED');
      expect(task.model_urls?.glb).toBe('https://cdn.meshy.ai/model.glb');
    });

    it('sends Authorization header', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi
          .fn()
          .mockResolvedValue({ id: 'x', status: 'PENDING', created_at: '0', finished_at: 0 }),
      }) as typeof fetch;

      await api.getTask('task-456', false);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/text-to-3d/task-456'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        })
      );
    });

    it('throws on non-retryable error when retryOn404 is false', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('Server Error'),
      }) as typeof fetch;

      await expect(api.getTask('task-789', false)).rejects.toThrow('Failed to get task');
    });

    it('retries on 404 when retryOn404 is true (default)', async () => {
      const notFoundResponse = {
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue('Not Found'),
      };
      const successResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: 'task-retry',
          status: 'IN_PROGRESS',
          created_at: '0',
          finished_at: 0,
        }),
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce(notFoundResponse)
        .mockResolvedValueOnce(successResponse) as typeof fetch;

      const task = await api.getTask('task-retry');

      expect(task.status).toBe('IN_PROGRESS');
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it('throws after max 404 retries exhausted', async () => {
      // getTask with retryOn404=true does 3 retries with delays of 2s, 4s, 6s
      const notFoundResponse = {
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue('Not Found'),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(notFoundResponse) as typeof fetch;

      await expect(api.getTask('missing-task', true)).rejects.toThrow();
      // 1 initial + 3 retries = 4 total fetch calls
      expect(globalThis.fetch).toHaveBeenCalledTimes(4);
    }, 30000);
  });

  describe('pollTask()', () => {
    it('returns immediately when task is already SUCCEEDED', async () => {
      const succeededTask: MeshyTask = {
        id: 'task-done',
        status: 'SUCCEEDED',
        progress: 100,
        model_urls: { glb: 'https://cdn.meshy.ai/done.glb', fbx: 'https://cdn.meshy.ai/done.fbx' },
        created_at: '0',
        finished_at: 1700001000,
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(succeededTask),
      }) as typeof fetch;

      const result = await api.pollTask('task-done', 5, 10);

      expect(result.status).toBe('SUCCEEDED');
      expect(result.model_urls?.glb).toBe('https://cdn.meshy.ai/done.glb');
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('polls multiple times until SUCCEEDED', async () => {
      const pendingTask: MeshyTask = {
        id: 'task-poll',
        status: 'IN_PROGRESS',
        progress: 50,
        model_urls: null,
        created_at: '0',
        finished_at: 0,
      };
      const succeededTask: MeshyTask = {
        id: 'task-poll',
        status: 'SUCCEEDED',
        progress: 100,
        model_urls: { glb: 'https://cdn.meshy.ai/poll.glb' },
        created_at: '0',
        finished_at: 1700001000,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(pendingTask) })
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(pendingTask) })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const result = await api.pollTask('task-poll', 10, 10);

      expect(result.status).toBe('SUCCEEDED');
      expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    });

    it('throws on FAILED status', async () => {
      const failedTask: MeshyTask = {
        id: 'task-fail',
        status: 'FAILED',
        created_at: '0',
        finished_at: 0,
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(failedTask),
      }) as typeof fetch;

      await expect(api.pollTask('task-fail', 5, 10)).rejects.toThrow(
        'Task task-fail failed with status: FAILED'
      );
    });

    it('throws on EXPIRED status', async () => {
      const expiredTask: MeshyTask = {
        id: 'task-expired',
        status: 'EXPIRED',
        created_at: '0',
        finished_at: 0,
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(expiredTask),
      }) as typeof fetch;

      await expect(api.pollTask('task-expired', 5, 10)).rejects.toThrow(
        'Task task-expired failed with status: EXPIRED'
      );
    });

    it('throws on timeout after max retries', async () => {
      const pendingTask: MeshyTask = {
        id: 'task-timeout',
        status: 'PENDING',
        created_at: '0',
        finished_at: 0,
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(pendingTask),
      }) as typeof fetch;

      await expect(api.pollTask('task-timeout', 3, 10)).rejects.toThrow(
        'Task task-timeout timed out'
      );
    });
  });

  describe('deleteTask()', () => {
    it('sends DELETE request with correct URL and auth', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: true }) as typeof fetch;

      await api.deleteTask('task-to-delete');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/text-to-3d/task-to-delete'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        })
      );
    });

    it('throws on failure', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue('not found'),
      }) as typeof fetch;

      await expect(api.deleteTask('missing-task')).rejects.toThrow(
        'Failed to delete task missing-task'
      );
    });
  });

  describe('listTasks()', () => {
    it('lists tasks with default pagination', async () => {
      const mockTasks: MeshyTask[] = [
        { id: 'task-1', status: 'SUCCEEDED', created_at: '0', finished_at: 1 },
        { id: 'task-2', status: 'PENDING', created_at: '0', finished_at: 0 },
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTasks),
      }) as typeof fetch;

      const tasks = await api.listTasks();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].id).toBe('task-1');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page_num=1'),
        expect.any(Object)
      );
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page_size=100'),
        expect.any(Object)
      );
    });

    it('lists tasks with custom pagination', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      }) as typeof fetch;

      await api.listTasks(3, 25);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page_num=3'),
        expect.any(Object)
      );
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page_size=25'),
        expect.any(Object)
      );
    });

    it('sends Authorization header', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      }) as typeof fetch;

      await api.listTasks();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        })
      );
    });

    it('throws on failure', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('Server Error'),
      }) as typeof fetch;

      await expect(api.listTasks()).rejects.toThrow('Failed to list tasks');
    });
  });
});
