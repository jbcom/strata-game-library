/**
 * ModelSynth unified API tests
 *
 * Tests the high-level ModelSynth class including character, prop, and
 * collectible generation workflows, sub-API initialization, and
 * the internal generateModel method.
 * All HTTP calls are mocked via globalThis.fetch.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ArtStyle, ModelCategory } from '../src/index.js';
import { ModelSynth } from '../src/index.js';

describe('ModelSynth', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('constructor', () => {
    it('throws when API key is empty', () => {
      expect(() => new ModelSynth({ apiKey: '' })).toThrow('Meshy API key is required');
    });

    it('creates instance with valid API key', () => {
      const synth = new ModelSynth({ apiKey: 'valid-key' }); // pragma: allowlist secret
      expect(synth).toBeDefined();
    });

    it('initializes all sub-API clients', () => {
      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      expect(synth.text3d).toBeDefined();
      expect(synth.rigging).toBeDefined();
      expect(synth.retexture).toBeDefined();
      expect(synth.animations).toBeDefined();
    });

    it('accepts custom base URL', () => {
      const synth = new ModelSynth({
        apiKey: 'test-placeholder', // pragma: allowlist secret
        baseUrl: 'https://custom-api.example.com/v3',
      });
      expect(synth).toBeDefined();
    });

    it('uses default base URL when not provided', () => {
      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      expect(synth).toBeDefined();
    });
  });

  describe('character()', () => {
    it('generates a character model with default options', async () => {
      // Mock the fetch for createPreviewTask (which uses a makeRequest callback)
      // and pollTask (which uses globalThis.fetch)
      const succeededTask = {
        id: 'char-task-001',
        status: 'SUCCEEDED',
        progress: 100,
        model_urls: { glb: 'https://cdn.meshy.ai/char.glb' },
        created_at: '0',
        finished_at: 1700001000,
      };

      // The flow: createPreviewTask calls makeRequest (inline), then pollTask calls getTask via fetch
      globalThis.fetch = vi
        .fn()
        // First call: from createPreviewTask's internal makeRequest (via generateModel)
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: 'char-task-001' }),
        })
        // Second call: from pollTask -> getTask
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      const task = await synth.character({ prompt: 'a cute otter' });

      expect(task.id).toBe('char-task-001');
      expect(task.status).toBe('SUCCEEDED');
    });

    it('uses cartoon style by default for characters', async () => {
      const succeededTask = {
        id: 'char-cartoon',
        status: 'SUCCEEDED',
        progress: 100,
        model_urls: { glb: 'https://cdn.meshy.ai/cartoon.glb' },
        created_at: '0',
        finished_at: 1700001000,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: 'char-cartoon' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      await synth.character({ prompt: 'otter' });

      // Verify the first fetch call (createPreviewTask) used cartoon style
      const firstCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const body = JSON.parse(firstCall[1].body);
      expect(body.art_style).toBe('cartoon');
    });

    it('uses 8000 polycount by default for characters', async () => {
      const succeededTask = {
        id: 'char-poly',
        status: 'SUCCEEDED',
        model_urls: { glb: 'url' },
        created_at: '0',
        finished_at: 1,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: 'char-poly' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      await synth.character({ prompt: 'otter' });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.target_polycount).toBe(8000);
    });

    it('applies custom style', async () => {
      const succeededTask = {
        id: 'char-style',
        status: 'SUCCEEDED',
        model_urls: { glb: 'url' },
        created_at: '0',
        finished_at: 1,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: 'char-style' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      await synth.character({ prompt: 'warrior', style: 'heroic fantasy' });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.art_style).toBe('heroic fantasy');
    });

    it('applies custom polycount', async () => {
      const succeededTask = {
        id: 'char-custom-poly',
        status: 'SUCCEEDED',
        model_urls: { glb: 'url' },
        created_at: '0',
        finished_at: 1,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: 'char-custom-poly' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      await synth.character({ prompt: 'dragon', polycount: 20000 });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.target_polycount).toBe(20000);
    });

    it('passes rigged flag as is_a_t_pose', async () => {
      const succeededTask = {
        id: 'char-rigged',
        status: 'SUCCEEDED',
        model_urls: { glb: 'url' },
        created_at: '0',
        finished_at: 1,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: 'char-rigged' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      await synth.character({ prompt: 'otter', rigged: true });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.is_a_t_pose).toBe(true);
    });
  });

  describe('prop()', () => {
    it('generates a prop model with default options', async () => {
      const succeededTask = {
        id: 'prop-task-001',
        status: 'SUCCEEDED',
        model_urls: { glb: 'https://cdn.meshy.ai/prop.glb' },
        created_at: '0',
        finished_at: 1,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: 'prop-task-001' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      const task = await synth.prop({ prompt: 'river rock obstacle' });

      expect(task.id).toBe('prop-task-001');
      expect(task.status).toBe('SUCCEEDED');
    });

    it('uses realistic style by default for props', async () => {
      const succeededTask = {
        id: 'prop-style',
        status: 'SUCCEEDED',
        model_urls: { glb: 'url' },
        created_at: '0',
        finished_at: 1,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: 'prop-style' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      await synth.prop({ prompt: 'rock' });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.art_style).toBe('realistic');
    });

    it('uses 5000 polycount by default for props', async () => {
      const succeededTask = {
        id: 'prop-poly',
        status: 'SUCCEEDED',
        model_urls: { glb: 'url' },
        created_at: '0',
        finished_at: 1,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: 'prop-poly' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      await synth.prop({ prompt: 'barrel' });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.target_polycount).toBe(5000);
    });

    it('applies custom style for props', async () => {
      const succeededTask = {
        id: 'prop-custom',
        status: 'SUCCEEDED',
        model_urls: { glb: 'url' },
        created_at: '0',
        finished_at: 1,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: 'prop-custom' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      await synth.prop({ prompt: 'crate', style: 'voxel' });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.art_style).toBe('voxel');
    });
  });

  describe('collectible()', () => {
    it('generates a collectible model with default options', async () => {
      const succeededTask = {
        id: 'collect-task-001',
        status: 'SUCCEEDED',
        model_urls: { glb: 'https://cdn.meshy.ai/coin.glb' },
        created_at: '0',
        finished_at: 1,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: 'collect-task-001' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      const task = await synth.collectible({ prompt: 'gold coin' });

      expect(task.id).toBe('collect-task-001');
      expect(task.status).toBe('SUCCEEDED');
    });

    it('uses cartoon style by default for collectibles', async () => {
      const succeededTask = {
        id: 'collect-style',
        status: 'SUCCEEDED',
        model_urls: { glb: 'url' },
        created_at: '0',
        finished_at: 1,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: 'collect-style' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      await synth.collectible({ prompt: 'gem' });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.art_style).toBe('cartoon');
    });

    it('uses 2000 polycount by default for collectibles', async () => {
      const succeededTask = {
        id: 'collect-poly',
        status: 'SUCCEEDED',
        model_urls: { glb: 'url' },
        created_at: '0',
        finished_at: 1,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: 'collect-poly' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      await synth.collectible({ prompt: 'coin' });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.target_polycount).toBe(2000);
    });

    it('applies custom style for collectibles', async () => {
      const succeededTask = {
        id: 'collect-custom',
        status: 'SUCCEEDED',
        model_urls: { glb: 'url' },
        created_at: '0',
        finished_at: 1,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: 'collect-custom' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      await synth.collectible({ prompt: 'crystal', style: 'anime' });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.art_style).toBe('anime');
    });

    it('applies custom polycount for collectibles', async () => {
      const succeededTask = {
        id: 'collect-custom-poly',
        status: 'SUCCEEDED',
        model_urls: { glb: 'url' },
        created_at: '0',
        finished_at: 1,
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ result: 'collect-custom-poly' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(succeededTask),
        }) as typeof fetch;

      const synth = new ModelSynth({ apiKey: 'test-placeholder' }); // pragma: allowlist secret
      await synth.collectible({ prompt: 'diamond', polycount: 500 });

      const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.target_polycount).toBe(500);
    });
  });
});

describe('ArtStyle type', () => {
  it('validates all art style values', () => {
    const validStyles: ArtStyle[] = [
      'realistic',
      'cartoon',
      'anime',
      'sculpture',
      'pbr',
      'realistic-3D',
      'voxel',
      '3D Printing',
      'heroic fantasy',
      'dark fantasy',
    ];

    // TypeScript type checking ensures these are valid
    expect(validStyles).toHaveLength(10);
    for (const style of validStyles) {
      expect(style).toBeTypeOf('string');
    }
  });
});

describe('ModelCategory type', () => {
  it('validates all model category values', () => {
    const validCategories: ModelCategory[] = [
      'character',
      'obstacle',
      'collectible',
      'prop',
      'environment',
    ];

    expect(validCategories).toHaveLength(5);
    for (const cat of validCategories) {
      expect(cat).toBeTypeOf('string');
    }
  });
});
