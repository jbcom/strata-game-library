/**
 * RetextureAPI tests
 *
 * Tests the Meshy retexture API client including task creation with input
 * validation, polling, deletion, and URL extraction helpers.
 * All HTTP calls are mocked via globalThis.fetch.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RetextureTaskParams } from '../src/clients/retexture.js';
import { RetextureAPI } from '../src/clients/retexture.js';

describe('RetextureAPI', () => {
  let originalFetch: typeof globalThis.fetch;
  let api: RetextureAPI;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    api = new RetextureAPI('test-retex-key');
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('constructor', () => {
    it('throws when API key is empty', () => {
      expect(() => new RetextureAPI('')).toThrow('Meshy API key is required');
    });

    it('creates instance with valid key', () => {
      const client = new RetextureAPI('key');
      expect(client).toBeDefined();
    });
  });

  describe('createRetextureTask()', () => {
    it('sends request with input_task_id and text_style_prompt', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'retex-001' });

      const task = await api.createRetextureTask(
        {
          input_task_id: 'text3d-task-123',
          text_style_prompt: 'mossy green texture',
        },
        mockMakeRequest
      );

      expect(task.id).toBe('retex-001');
      expect(task.status).toBe('PENDING');
      expect(task.progress).toBe(0);
      expect(task.model_urls).toBeNull();
      expect(task.texture_urls).toBeNull();

      const [url, options] = mockMakeRequest.mock.calls[0];
      expect(url).toContain('/retexture');

      const body = JSON.parse(options.body);
      expect(body.input_task_id).toBe('text3d-task-123');
      expect(body.text_style_prompt).toBe('mossy green texture');
      expect(body.model_url).toBeUndefined();
      expect(body.image_style_url).toBeUndefined();
    });

    it('sends request with model_url and image_style_url', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'retex-002' });

      await api.createRetextureTask(
        {
          model_url: 'https://example.com/model.glb',
          image_style_url: 'https://example.com/style.png',
        },
        mockMakeRequest
      );

      const body = JSON.parse(mockMakeRequest.mock.calls[0][1].body);
      expect(body.model_url).toBe('https://example.com/model.glb');
      expect(body.image_style_url).toBe('https://example.com/style.png');
      expect(body.input_task_id).toBeUndefined();
      expect(body.text_style_prompt).toBeUndefined();
    });

    it('includes optional ai_model parameter', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'retex-003' });

      await api.createRetextureTask(
        {
          input_task_id: 'task-x',
          text_style_prompt: 'rusty metal',
          ai_model: 'meshy-4',
        },
        mockMakeRequest
      );

      const body = JSON.parse(mockMakeRequest.mock.calls[0][1].body);
      expect(body.ai_model).toBe('meshy-4');
    });

    it('includes enable_original_uv parameter', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'retex-004' });

      await api.createRetextureTask(
        {
          input_task_id: 'task-y',
          text_style_prompt: 'shiny',
          enable_original_uv: false,
        },
        mockMakeRequest
      );

      const body = JSON.parse(mockMakeRequest.mock.calls[0][1].body);
      expect(body.enable_original_uv).toBe(false);
    });

    it('includes enable_pbr parameter', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'retex-005' });

      await api.createRetextureTask(
        {
          input_task_id: 'task-z',
          text_style_prompt: 'metallic',
          enable_pbr: true,
        },
        mockMakeRequest
      );

      const body = JSON.parse(mockMakeRequest.mock.calls[0][1].body);
      expect(body.enable_pbr).toBe(true);
    });

    it('sets Authorization header', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'retex-006' });

      await api.createRetextureTask(
        {
          input_task_id: 'task-auth',
          text_style_prompt: 'test',
        },
        mockMakeRequest
      );

      const headers = mockMakeRequest.mock.calls[0][1].headers;
      expect(headers.Authorization).toBe('Bearer test-retex-key');
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('throws when neither input_task_id nor model_url is provided', async () => {
      const mockMakeRequest = vi.fn();

      await expect(
        api.createRetextureTask(
          { text_style_prompt: 'test' } as RetextureTaskParams,
          mockMakeRequest
        )
      ).rejects.toThrow('Either input_task_id or model_url is required');

      expect(mockMakeRequest).not.toHaveBeenCalled();
    });

    it('throws when neither text_style_prompt nor image_style_url is provided', async () => {
      const mockMakeRequest = vi.fn();

      await expect(
        api.createRetextureTask(
          { input_task_id: 'task-no-style' } as RetextureTaskParams,
          mockMakeRequest
        )
      ).rejects.toThrow('Either text_style_prompt or image_style_url is required');

      expect(mockMakeRequest).not.toHaveBeenCalled();
    });

    it('throws when no task ID is returned', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({});

      await expect(
        api.createRetextureTask(
          { input_task_id: 'task-x', text_style_prompt: 'test' },
          mockMakeRequest
        )
      ).rejects.toThrow('No task ID returned from createRetextureTask');
    });

    it('extracts task ID from id field when result is missing', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ id: 'retex-from-id' });

      const task = await api.createRetextureTask(
        { input_task_id: 'task-a', text_style_prompt: 'test' },
        mockMakeRequest
      );

      expect(task.id).toBe('retex-from-id');
    });

    it('does not include undefined optional params in request body', async () => {
      const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'retex-007' });

      await api.createRetextureTask(
        {
          input_task_id: 'task-minimal',
          text_style_prompt: 'simple',
        },
        mockMakeRequest
      );

      const body = JSON.parse(mockMakeRequest.mock.calls[0][1].body);
      expect(body).not.toHaveProperty('ai_model');
      expect(body).not.toHaveProperty('enable_original_uv');
      expect(body).not.toHaveProperty('enable_pbr');
    });
  });

  describe('getRetextureTask()', () => {
    it('fetches task by ID', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: 'retex-get-001',
          status: 'IN_PROGRESS',
          progress: 60,
          created_at: 1700000000,
        }),
      }) as typeof fetch;

      const task = await api.getRetextureTask('retex-get-001');

      expect(task.id).toBe('retex-get-001');
      expect(task.status).toBe('IN_PROGRESS');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/retexture/retex-get-001'),
        expect.any(Object)
      );
    });

    it('returns completed task with model and texture URLs', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: 'retex-done',
          status: 'SUCCEEDED',
          model_urls: {
            glb: 'https://cdn.meshy.ai/retextured.glb',
            fbx: 'https://cdn.meshy.ai/retextured.fbx',
          },
          texture_urls: [
            {
              base_color: 'https://cdn.meshy.ai/base.png',
              normal: 'https://cdn.meshy.ai/normal.png',
              roughness: 'https://cdn.meshy.ai/rough.png',
            },
          ],
          created_at: 1700000000,
          finished_at: 1700001000,
        }),
      }) as typeof fetch;

      const task = await api.getRetextureTask('retex-done');
      expect(task.status).toBe('SUCCEEDED');
      expect(task.model_urls?.glb).toBe('https://cdn.meshy.ai/retextured.glb');
      expect(task.texture_urls?.[0]?.base_color).toBe('https://cdn.meshy.ai/base.png');
    });
  });

  describe('pollRetextureTask()', () => {
    it('returns immediately when task is SUCCEEDED', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: 'retex-poll-done',
          status: 'SUCCEEDED',
          model_urls: { glb: 'https://cdn.meshy.ai/done.glb' },
          created_at: 1700000000,
        }),
      }) as typeof fetch;

      const result = await api.pollRetextureTask('retex-poll-done', 5, 10);
      expect(result.status).toBe('SUCCEEDED');
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('polls until SUCCEEDED', async () => {
      const pending = {
        id: 'retex-poll-wait',
        status: 'IN_PROGRESS',
        progress: 40,
        created_at: 1700000000,
      };
      const done = {
        id: 'retex-poll-wait',
        status: 'SUCCEEDED',
        model_urls: { glb: 'https://cdn.meshy.ai/wait.glb' },
        created_at: 1700000000,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(pending) })
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(done) }) as typeof fetch;

      const result = await api.pollRetextureTask('retex-poll-wait', 5, 10);
      expect(result.status).toBe('SUCCEEDED');
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it('throws on FAILED status', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: 'retex-fail',
          status: 'FAILED',
          created_at: 1700000000,
        }),
      }) as typeof fetch;

      await expect(api.pollRetextureTask('retex-fail', 5, 10)).rejects.toThrow(
        'Retexture task retex-fail failed: FAILED'
      );
    });

    it('throws on EXPIRED status', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: 'retex-expired',
          status: 'EXPIRED',
          created_at: 1700000000,
        }),
      }) as typeof fetch;

      await expect(api.pollRetextureTask('retex-expired', 5, 10)).rejects.toThrow(
        'Retexture task retex-expired failed: EXPIRED'
      );
    });

    it('throws on timeout', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: 'retex-timeout',
          status: 'PENDING',
          created_at: 1700000000,
        }),
      }) as typeof fetch;

      await expect(api.pollRetextureTask('retex-timeout', 2, 10)).rejects.toThrow(
        'Retexture task retex-timeout timed out'
      );
    });
  });

  describe('deleteRetextureTask()', () => {
    it('sends DELETE request', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      }) as typeof fetch;

      await api.deleteRetextureTask('retex-del-001');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/retexture/retex-del-001'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('getGLBUrl()', () => {
    it('returns GLB URL from completed task', () => {
      const url = api.getGLBUrl({
        id: 'retex-glb',
        status: 'SUCCEEDED',
        model_urls: {
          glb: 'https://cdn.meshy.ai/model.glb',
          fbx: 'https://cdn.meshy.ai/model.fbx',
        },
        created_at: 1700000000,
      });

      expect(url).toBe('https://cdn.meshy.ai/model.glb');
    });

    it('returns null when model_urls is null', () => {
      const url = api.getGLBUrl({
        id: 'retex-no-urls',
        status: 'PENDING',
        model_urls: null,
        created_at: 1700000000,
      });

      expect(url).toBeNull();
    });

    it('returns null when model_urls is undefined', () => {
      const url = api.getGLBUrl({
        id: 'retex-no-urls',
        status: 'PENDING',
        created_at: 1700000000,
      });

      expect(url).toBeNull();
    });

    it('returns null when glb field is missing', () => {
      const url = api.getGLBUrl({
        id: 'retex-no-glb',
        status: 'SUCCEEDED',
        model_urls: { fbx: 'https://cdn.meshy.ai/model.fbx' },
        created_at: 1700000000,
      });

      expect(url).toBeNull();
    });
  });

  describe('getTextureUrls()', () => {
    it('returns texture URLs from completed task', () => {
      const textures = api.getTextureUrls({
        id: 'retex-tex',
        status: 'SUCCEEDED',
        texture_urls: [
          {
            base_color: 'https://cdn.meshy.ai/base.png',
            normal: 'https://cdn.meshy.ai/normal.png',
            roughness: 'https://cdn.meshy.ai/rough.png',
            metallic: 'https://cdn.meshy.ai/metal.png',
          },
        ],
        created_at: 1700000000,
      });

      expect(textures).toHaveLength(1);
      expect(textures![0].base_color).toBe('https://cdn.meshy.ai/base.png');
      expect(textures![0].normal).toBe('https://cdn.meshy.ai/normal.png');
    });

    it('returns null when texture_urls is null', () => {
      const textures = api.getTextureUrls({
        id: 'retex-no-tex',
        status: 'PENDING',
        texture_urls: null,
        created_at: 1700000000,
      });

      expect(textures).toBeNull();
    });

    it('returns null when texture_urls is undefined', () => {
      const textures = api.getTextureUrls({
        id: 'retex-no-tex',
        status: 'PENDING',
        created_at: 1700000000,
      });

      expect(textures).toBeNull();
    });

    it('returns empty array when texture_urls is empty', () => {
      const textures = api.getTextureUrls({
        id: 'retex-empty',
        status: 'SUCCEEDED',
        texture_urls: [],
        created_at: 1700000000,
      });

      expect(textures).toEqual([]);
    });
  });
});
