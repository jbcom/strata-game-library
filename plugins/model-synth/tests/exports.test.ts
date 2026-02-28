/**
 * Package exports verification tests
 *
 * Ensures all public API exports from the package are accessible
 * and have the expected types.
 */
import { describe, expect, it } from 'vitest';
import type { AnimationTask, AnimationTaskParams } from '../src/clients/animations.js';
import { OTTER_ANIMATIONS, ROCK_ANIMATIONS } from '../src/clients/animations.js';
import type {
  ArtStyle,
  CreateTaskParams,
  MeshyErrorResponse,
  MeshyTask,
  ModelCategory,
  RetextureTaskParams,
  RetryConfig,
  RiggingTask,
} from '../src/index.js';
import {
  AnimationsAPI,
  MeshyAuthError,
  MeshyBaseClient,
  MeshyError,
  MeshyPaymentError,
  MeshyRateLimitError,
  ModelSynth,
  RATE_LIMITS,
  RetextureAPI,
  RiggingAPI,
  TextTo3DAPI,
} from '../src/index.js';
import type {
  AssetManifest,
  ModelAsset,
  SpriteAsset,
  TextureAsset,
} from '../src/schemas/manifest.js';
import {
  AssetManifestSchema,
  ModelAssetSchema,
  SpriteAssetSchema,
  TextureAssetSchema,
} from '../src/schemas/manifest.js';

describe('Package exports - classes', () => {
  it('exports ModelSynth class', () => {
    expect(ModelSynth).toBeDefined();
    expect(typeof ModelSynth).toBe('function');
  });

  it('exports TextTo3DAPI class', () => {
    expect(TextTo3DAPI).toBeDefined();
    expect(typeof TextTo3DAPI).toBe('function');
  });

  it('exports RiggingAPI class', () => {
    expect(RiggingAPI).toBeDefined();
    expect(typeof RiggingAPI).toBe('function');
  });

  it('exports RetextureAPI class', () => {
    expect(RetextureAPI).toBeDefined();
    expect(typeof RetextureAPI).toBe('function');
  });

  it('exports AnimationsAPI class', () => {
    expect(AnimationsAPI).toBeDefined();
    expect(typeof AnimationsAPI).toBe('function');
  });

  it('exports MeshyBaseClient abstract class', () => {
    expect(MeshyBaseClient).toBeDefined();
    expect(typeof MeshyBaseClient).toBe('function');
  });
});

describe('Package exports - error classes', () => {
  it('exports MeshyError class', () => {
    expect(MeshyError).toBeDefined();
    const err = new MeshyError('test', 500);
    expect(err).toBeInstanceOf(Error);
  });

  it('exports MeshyAuthError class', () => {
    expect(MeshyAuthError).toBeDefined();
    const err = new MeshyAuthError('test');
    expect(err).toBeInstanceOf(MeshyError);
  });

  it('exports MeshyPaymentError class', () => {
    expect(MeshyPaymentError).toBeDefined();
    const err = new MeshyPaymentError('test');
    expect(err).toBeInstanceOf(MeshyError);
  });

  it('exports MeshyRateLimitError class', () => {
    expect(MeshyRateLimitError).toBeDefined();
    const err = new MeshyRateLimitError('test');
    expect(err).toBeInstanceOf(MeshyError);
  });
});

describe('Package exports - constants', () => {
  it('exports RATE_LIMITS', () => {
    expect(RATE_LIMITS).toBeDefined();
    expect(RATE_LIMITS).toHaveProperty('pro');
    expect(RATE_LIMITS).toHaveProperty('studio');
    expect(RATE_LIMITS).toHaveProperty('enterprise');
  });

  it('exports OTTER_ANIMATIONS from animations client', () => {
    expect(OTTER_ANIMATIONS).toBeDefined();
    expect(OTTER_ANIMATIONS).toHaveProperty('idle');
    expect(OTTER_ANIMATIONS).toHaveProperty('run');
  });

  it('exports ROCK_ANIMATIONS from animations client', () => {
    expect(ROCK_ANIMATIONS).toBeDefined();
    expect(Object.keys(ROCK_ANIMATIONS)).toHaveLength(0);
  });
});

describe('Package exports - schemas', () => {
  it('exports ModelAssetSchema', () => {
    expect(ModelAssetSchema).toBeDefined();
    expect(ModelAssetSchema.safeParse).toBeTypeOf('function');
  });

  it('exports TextureAssetSchema', () => {
    expect(TextureAssetSchema).toBeDefined();
    expect(TextureAssetSchema.safeParse).toBeTypeOf('function');
  });

  it('exports SpriteAssetSchema', () => {
    expect(SpriteAssetSchema).toBeDefined();
    expect(SpriteAssetSchema.safeParse).toBeTypeOf('function');
  });

  it('exports AssetManifestSchema', () => {
    expect(AssetManifestSchema).toBeDefined();
    expect(AssetManifestSchema.safeParse).toBeTypeOf('function');
  });
});

describe('Package exports - type compatibility', () => {
  it('MeshyTask type is compatible', () => {
    const task: MeshyTask = {
      id: 'test',
      status: 'PENDING',
      created_at: '0',
      finished_at: 0,
    };
    expect(task.id).toBe('test');
  });

  it('CreateTaskParams type is compatible', () => {
    const params: CreateTaskParams = {
      text_prompt: 'test prompt',
      art_style: 'cartoon',
      ai_model: 'meshy-5',
    };
    expect(params.text_prompt).toBe('test prompt');
  });

  it('RiggingTask type is compatible', () => {
    const task: RiggingTask = {
      id: 'rig-test',
      status: 'PENDING',
      created_at: 0,
    };
    expect(task.id).toBe('rig-test');
  });

  it('RetextureTaskParams type is compatible', () => {
    const params: RetextureTaskParams = {
      input_task_id: 'task-123',
      text_style_prompt: 'mossy',
    };
    expect(params.input_task_id).toBe('task-123');
  });

  it('RetryConfig type is compatible', () => {
    const config: RetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      retryOn: [429, 500],
    };
    expect(config.maxRetries).toBe(3);
  });

  it('MeshyErrorResponse type is compatible', () => {
    const response: MeshyErrorResponse = {
      message: 'error',
      code: 'ERR_001',
      details: { field: 'prompt' },
    };
    expect(response.message).toBe('error');
  });

  it('AnimationTask type is compatible', () => {
    const task: AnimationTask = {
      id: 'anim-test',
      status: 'PENDING',
      created_at: 0,
    };
    expect(task.id).toBe('anim-test');
  });

  it('AnimationTaskParams type is compatible', () => {
    const params: AnimationTaskParams = {
      rig_task_id: 'rig-123',
      action_id: 14,
    };
    expect(params.rig_task_id).toBe('rig-123');
  });

  it('ArtStyle type accepts valid values', () => {
    const style: ArtStyle = 'realistic';
    expect(style).toBe('realistic');
  });

  it('ModelCategory type accepts valid values', () => {
    const cat: ModelCategory = 'character';
    expect(cat).toBe('character');
  });
});
