/**
 * Model synth client tests
 *
 * Tests the Meshy API client classes with mocked fetch.
 * Validates request construction, error handling, and exports.
 */
import { describe, expect, it, vi } from 'vitest';
import { TextTo3DAPI } from '../src/clients/text-to-3d.js';
import {
  type AnimationTask,
  type CharacterAnimationRequest,
  type CreateRefineTaskParams,
  MeshyAuthError,
  MeshyError,
  MeshyPaymentError,
  MeshyRateLimitError,
  type MeshyTask,
  ModelSynth,
  RATE_LIMITS,
  type RiggingTask,
} from '../src/index.js';

const completedModelTask = {
  id: 'model-task-123',
  status: 'SUCCEEDED',
  progress: 100,
  model_urls: { glb: 'https://example.com/model.glb' },
  created_at: '1000',
  finished_at: 2000,
} satisfies MeshyTask;

type GenerateModelOptions = {
  prompt: string;
  style: string;
  polycount: number;
  tPose?: boolean;
  refine?: boolean;
  refineOptions?: CreateRefineTaskParams;
};

const pendingRiggingTask = {
  id: 'rig-task-123',
  status: 'PENDING',
  progress: 0,
  created_at: 1000,
} satisfies RiggingTask;

const completedRiggingTask = {
  id: 'rig-task-123',
  status: 'SUCCEEDED',
  progress: 100,
  created_at: 1000,
  finished_at: 2000,
  result: {
    rigged_character_glb_url: 'https://example.com/rigged.glb',
    basic_animations: {
      walking_glb_url: 'https://example.com/walk.glb',
      running_glb_url: 'https://example.com/run.glb',
    },
  },
} satisfies RiggingTask;

function stubGenerateModel(synth: ModelSynth) {
  return vi
    .spyOn(
      synth as unknown as {
        generateModel(options: GenerateModelOptions): Promise<MeshyTask>;
      },
      'generateModel'
    )
    .mockResolvedValue(completedModelTask);
}

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
      target_formats: ['glb', 'fbx'],
      auto_size: true,
    });

    expect(mockMakeRequest).toHaveBeenCalledTimes(1);
    const [, options] = mockMakeRequest.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.mode).toBe('refine');
    expect(body.preview_task_id).toBe('preview-123');
    expect(body.enable_pbr).toBe(true);
    expect(body.texture_prompt).toBe('high quality materials');
    expect(body.target_formats).toEqual(['glb', 'fbx']);
    expect(body.auto_size).toBe(true);

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

  it('refines generated models when requested', async () => {
    const synth = new ModelSynth({ apiKey: 'test-key' }); // pragma: allowlist secret
    const completedPreviewTask = {
      ...completedModelTask,
      id: 'preview-task-123',
      model_urls: { glb: 'https://example.com/preview.glb' },
    } satisfies MeshyTask;
    const completedRefineTask = {
      ...completedModelTask,
      id: 'refine-task-456',
      model_urls: { glb: 'https://example.com/refined.glb' },
    } satisfies MeshyTask;
    const createPreviewTask = vi
      .spyOn(synth.text3d, 'createPreviewTask')
      .mockResolvedValue({ ...completedPreviewTask, status: 'PENDING', progress: 0 });
    const createRefineTask = vi
      .spyOn(synth.text3d, 'createRefineTask')
      .mockResolvedValue({ ...completedRefineTask, status: 'PENDING', progress: 0 });
    const pollTask = vi
      .spyOn(synth.text3d, 'pollTask')
      .mockResolvedValueOnce(completedPreviewTask)
      .mockResolvedValueOnce(completedRefineTask);
    const generateModel = (
      synth as unknown as {
        generateModel(
          options: GenerateModelOptions
        ): Promise<MeshyTask & { previewTask?: MeshyTask }>;
      }
    ).generateModel.bind(synth);

    const task = await generateModel({
      prompt: 'stylized otter adventurer',
      style: 'cartoon',
      polycount: 8000,
      tPose: true,
      refine: true,
      refineOptions: { target_formats: ['glb'], auto_size: true },
    });

    expect(createPreviewTask).toHaveBeenCalledWith(
      expect.objectContaining({
        text_prompt: 'stylized otter adventurer',
        is_a_t_pose: true,
      }),
      expect.any(Function)
    );
    expect(pollTask).toHaveBeenNthCalledWith(1, 'preview-task-123');
    expect(createRefineTask).toHaveBeenCalledWith('preview-task-123', expect.any(Function), {
      target_formats: ['glb'],
      auto_size: true,
    });
    expect(pollTask).toHaveBeenNthCalledWith(2, 'refine-task-456');
    expect(task.id).toBe('refine-task-456');
    expect(task.previewTask?.id).toBe('preview-task-123');
  });

  it('rigs generated characters when requested', async () => {
    const synth = new ModelSynth({ apiKey: 'test-key' }); // pragma: allowlist secret
    const generateModel = stubGenerateModel(synth);
    const createRiggingTask = vi
      .spyOn(synth.rigging, 'createRiggingTask')
      .mockResolvedValue(pendingRiggingTask);
    const pollRiggingTask = vi
      .spyOn(synth.rigging, 'pollRiggingTask')
      .mockResolvedValue(completedRiggingTask);

    const result = await synth.character({
      prompt: 'stylized otter adventurer',
      rigged: true,
      heightMeters: 1.2,
      animationStyle: 'stylized',
      fps: 30,
      poll: { maxRetries: 1, intervalMs: 0 },
    });

    expect(generateModel).toHaveBeenCalledWith({
      prompt: 'stylized otter adventurer',
      style: 'cartoon',
      polycount: 8000,
      tPose: true,
      refine: true,
      refineOptions: {
        target_formats: ['glb'],
        auto_size: true,
      },
    });
    expect(createRiggingTask).toHaveBeenCalledWith({
      input_task_id: 'model-task-123',
      height_meters: 1.2,
      custom_animations: undefined,
      animation_style: 'stylized',
      fps: 30,
    });
    expect(pollRiggingTask).toHaveBeenCalledWith('rig-task-123', 1, 0);
    expect(result.riggingTask).toBe(completedRiggingTask);
    expect(result.riggedModelUrls?.rigged).toBe('https://example.com/rigged.glb');
    expect(result.riggedModelUrls?.walking).toBe('https://example.com/walk.glb');
  });

  it('rigs and applies requested character animations', async () => {
    const synth = new ModelSynth({ apiKey: 'test-key' }); // pragma: allowlist secret
    const generateModel = stubGenerateModel(synth);
    vi.spyOn(synth.rigging, 'createRiggingTask').mockResolvedValue(pendingRiggingTask);
    vi.spyOn(synth.rigging, 'pollRiggingTask').mockResolvedValue(completedRiggingTask);
    const createAnimationTask = vi
      .spyOn(synth.animations, 'createAnimationTask')
      .mockResolvedValueOnce({
        id: 'anim-idle',
        status: 'PENDING',
        progress: 0,
        created_at: 1000,
      } satisfies AnimationTask)
      .mockResolvedValueOnce({
        id: 'anim-jump',
        status: 'PENDING',
        progress: 0,
        created_at: 1000,
      } satisfies AnimationTask);
    vi.spyOn(synth.animations, 'pollAnimationTask')
      .mockResolvedValueOnce({
        id: 'anim-idle',
        status: 'SUCCEEDED',
        progress: 100,
        created_at: 1000,
        finished_at: 2000,
        result: { animation_glb_url: 'https://example.com/idle.glb' },
      } satisfies AnimationTask)
      .mockResolvedValueOnce({
        id: 'anim-jump',
        status: 'SUCCEEDED',
        progress: 100,
        created_at: 1000,
        finished_at: 2000,
        result: { animation_glb_url: 'https://example.com/jump.glb' },
      } satisfies AnimationTask);

    const result = await synth.character({
      prompt: 'animated otter adventurer',
      animations: [
        'idle',
        { name: 'jump60', actionId: 466, postProcess: { operation_type: 'change_fps', fps: 60 } },
      ],
      poll: { maxRetries: 2, intervalMs: 0 },
    });

    expect(generateModel).toHaveBeenCalledWith({
      prompt: 'animated otter adventurer',
      style: 'cartoon',
      polycount: 8000,
      tPose: true,
      refine: true,
      refineOptions: {
        target_formats: ['glb'],
        auto_size: true,
      },
    });
    expect(createAnimationTask).toHaveBeenNthCalledWith(1, {
      rig_task_id: 'rig-task-123',
      action_id: 0,
      post_process: undefined,
    });
    expect(createAnimationTask).toHaveBeenNthCalledWith(2, {
      rig_task_id: 'rig-task-123',
      action_id: 466,
      post_process: { operation_type: 'change_fps', fps: 60 },
    });
    expect(result.animationUrls).toEqual({
      idle: 'https://example.com/idle.glb',
      jump60: 'https://example.com/jump.glb',
    });
    expect(result.animationTasks?.idle.id).toBe('anim-idle');
    expect(result.animationTasks?.jump60.id).toBe('anim-jump');
  });

  it('rejects unknown named character animations before rigging', async () => {
    const synth = new ModelSynth({ apiKey: 'test-key' }); // pragma: allowlist secret
    const generateModel = stubGenerateModel(synth);
    const createRiggingTask = vi.spyOn(synth.rigging, 'createRiggingTask');

    await expect(
      synth.character({
        prompt: 'otter adventurer',
        animations: ['unknown' as CharacterAnimationRequest],
      })
    ).rejects.toThrow('Unknown character animation "unknown"');
    expect(generateModel).not.toHaveBeenCalled();
    expect(createRiggingTask).not.toHaveBeenCalled();
  });
});
