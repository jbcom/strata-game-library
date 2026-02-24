/**
 * Model synth client tests
 *
 * Tests the Meshy API client classes with mocked fetch.
 * Validates request construction, error handling, and exports.
 */
import { describe, expect, it, vi } from 'vitest';
import { TextTo3DAPI } from '../src/clients/text-to-3d.js';
import {
  MeshyAuthError,
  MeshyError,
  MeshyPaymentError,
  MeshyRateLimitError,
  ModelSynth,
  RATE_LIMITS,
} from '../src/index.js';

describe('Error classes', () => {
  it('MeshyError has correct properties', () => {
    const err = new MeshyError('test error', 400, { message: 'bad request' });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(MeshyError);
    expect(err.name).toBe('MeshyError');
    expect(err.message).toBe('test error');
    expect(err.statusCode).toBe(400);
    expect(err.responseBody).toEqual({ message: 'bad request' });
  });

  it('MeshyAuthError has correct status code', () => {
    const err = new MeshyAuthError('unauthorized');
    expect(err).toBeInstanceOf(MeshyError);
    expect(err.name).toBe('MeshyAuthError');
    expect(err.statusCode).toBe(401);
  });

  it('MeshyPaymentError has correct status code', () => {
    const err = new MeshyPaymentError('payment required');
    expect(err).toBeInstanceOf(MeshyError);
    expect(err.name).toBe('MeshyPaymentError');
    expect(err.statusCode).toBe(402);
  });

  it('MeshyRateLimitError has correct status code', () => {
    const err = new MeshyRateLimitError('rate limited');
    expect(err).toBeInstanceOf(MeshyError);
    expect(err.name).toBe('MeshyRateLimitError');
    expect(err.statusCode).toBe(429);
  });
});

describe('RATE_LIMITS', () => {
  it('has pro tier limits', () => {
    expect(RATE_LIMITS.pro.requestsPerSecond).toBe(20);
    expect(RATE_LIMITS.pro.queueTasks).toBe(10);
  });

  it('has studio tier limits', () => {
    expect(RATE_LIMITS.studio.requestsPerSecond).toBe(20);
    expect(RATE_LIMITS.studio.queueTasks).toBe(20);
  });

  it('has enterprise tier limits', () => {
    expect(RATE_LIMITS.enterprise.requestsPerSecond).toBe(100);
    expect(RATE_LIMITS.enterprise.queueTasks).toBe(50);
  });
});

describe('TextTo3DAPI', () => {
  it('requires an API key', () => {
    expect(() => new TextTo3DAPI('')).toThrow('Meshy API key is required');
  });

  it('constructs with default base URL', () => {
    const api = new TextTo3DAPI('test-key');
    expect(api).toBeDefined();
  });

  it('constructs with custom base URL', () => {
    const api = new TextTo3DAPI('test-key', 'https://custom.api.com/v2');
    expect(api).toBeDefined();
  });

  it('createPreviewTask sends correct request', async () => {
    const api = new TextTo3DAPI('test-key');
    const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'task-123' });

    const task = await api.createPreviewTask(
      {
        text_prompt: 'a cute otter',
        art_style: 'cartoon',
        target_polycount: 5000,
      },
      mockMakeRequest
    );

    expect(mockMakeRequest).toHaveBeenCalledTimes(1);
    const [url, options] = mockMakeRequest.mock.calls[0];
    expect(url).toContain('/text-to-3d');
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Bearer test-key');

    const body = JSON.parse(options.body);
    expect(body.prompt).toBe('a cute otter');
    expect(body.art_style).toBe('cartoon');
    expect(body.target_polycount).toBe(5000);
    expect(body.mode).toBe('preview');

    expect(task.id).toBe('task-123');
    expect(task.status).toBe('PENDING');
  });

  it('createPreviewTask throws when no task ID is returned', async () => {
    const api = new TextTo3DAPI('test-key');
    const mockMakeRequest = vi.fn().mockResolvedValue({});

    await expect(api.createPreviewTask({ text_prompt: 'test' }, mockMakeRequest)).rejects.toThrow(
      'No task ID returned'
    );
  });

  it('createRefineTask sends correct request', async () => {
    const api = new TextTo3DAPI('test-key');
    const mockMakeRequest = vi.fn().mockResolvedValue({ result: 'refine-456' });

    const task = await api.createRefineTask('preview-123', mockMakeRequest, {
      enable_pbr: true,
      texture_prompt: 'high quality materials',
    });

    expect(mockMakeRequest).toHaveBeenCalledTimes(1);
    const [, options] = mockMakeRequest.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.mode).toBe('refine');
    expect(body.preview_task_id).toBe('preview-123');
    expect(body.enable_pbr).toBe(true);

    expect(task.id).toBe('refine-456');
    expect(task.status).toBe('PENDING');
  });

  it('getTask fetches task status', async () => {
    const api = new TextTo3DAPI('test-key');
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: 'task-123',
        status: 'SUCCEEDED',
        model_urls: { glb: 'https://example.com/model.glb' },
      }),
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as typeof fetch;

    try {
      const task = await api.getTask('task-123', false);
      expect(task.id).toBe('task-123');
      expect(task.status).toBe('SUCCEEDED');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/text-to-3d/task-123'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
          }),
        })
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('getTask throws on non-404 error', async () => {
    const api = new TextTo3DAPI('test-key');
    const mockResponse = {
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue('Internal Server Error'),
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as typeof fetch;

    try {
      await expect(api.getTask('task-123', false)).rejects.toThrow('Failed to get task');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('ModelSynth', () => {
  it('requires an API key', () => {
    expect(() => new ModelSynth({ apiKey: '' })).toThrow('Meshy API key is required');
  });

  it('creates sub-API instances', () => {
    const synth = new ModelSynth({ apiKey: 'test-key' }); // pragma: allowlist secret
    expect(synth.text3d).toBeDefined();
    expect(synth.rigging).toBeDefined();
    expect(synth.retexture).toBeDefined();
    expect(synth.animations).toBeDefined();
  });

  it('accepts custom base URL', () => {
    const synth = new ModelSynth({ apiKey: 'test-key', baseUrl: 'https://custom.api.com/v3' }); // pragma: allowlist secret
    expect(synth).toBeDefined();
  });
});
