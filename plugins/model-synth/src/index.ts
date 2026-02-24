/**
 * @strata-game-library/model-synth
 *
 * Procedural 3D model generation using Meshy API
 * Companion to @strata-game-library/audio-synth
 *
 * Features:
 * - Text-to-3D model generation (Meshy v2 API)
 * - Automatic character rigging
 * - Texture variant generation
 * - Animation synthesis
 * - GLB/FBX/USDZ export formats
 */

import { AnimationsAPI } from './clients/animations.js';
import { RetextureAPI } from './clients/retexture.js';
import { RiggingAPI } from './clients/rigging.js';
import { type MeshyTask, TextTo3DAPI } from './clients/text-to-3d.js';

export { AnimationsAPI } from './clients/animations.js';
export {
  MeshyAuthError,
  MeshyBaseClient,
  MeshyError,
  type MeshyErrorResponse,
  MeshyPaymentError,
  MeshyRateLimitError,
  RATE_LIMITS,
  type RetryConfig,
} from './clients/base.js';
export { RetextureAPI, type RetextureTaskParams } from './clients/retexture.js';
export { RiggingAPI, type RiggingTask } from './clients/rigging.js';
export {
  type CreateTaskParams,
  type MeshyTask,
  TextTo3DAPI,
} from './clients/text-to-3d.js';

/** Art style options for model generation */
export type ArtStyle =
  | 'realistic'
  | 'cartoon'
  | 'anime'
  | 'sculpture'
  | 'pbr'
  | 'realistic-3D'
  | 'voxel'
  | '3D Printing'
  | 'heroic fantasy'
  | 'dark fantasy';

/** Model category for game assets */
export type ModelCategory = 'character' | 'obstacle' | 'collectible' | 'prop' | 'environment';

/**
 * ModelSynth - Unified API for procedural 3D model generation
 *
 * @example
 * ```typescript
 * import { ModelSynth } from '@strata-game-library/model-synth';
 *
 * const synth = new ModelSynth({ apiKey: process.env.MESHY_API_KEY });
 *
 * // Generate a character with rigging
 * const otter = await synth.character({
 *   prompt: 'cute otter wearing adventure vest',
 *   style: 'cartoon',
 *   rigged: true,
 * });
 *
 * // Generate a prop with texture variants
 * const rock = await synth.prop({
 *   prompt: 'river rock obstacle',
 *   variants: ['mossy', 'crystal', 'cracked'],
 * });
 * ```
 */
export class ModelSynth {
  public text3d: TextTo3DAPI;
  public rigging: RiggingAPI;
  public retexture: RetextureAPI;
  public animations: AnimationsAPI;

  constructor(options: { apiKey: string; baseUrl?: string }) {
    const { apiKey, baseUrl = 'https://api.meshy.ai/openapi/v2' } = options;

    if (!apiKey) {
      throw new Error('Meshy API key is required');
    }

    this.text3d = new TextTo3DAPI(apiKey, baseUrl);
    this.rigging = new RiggingAPI(apiKey);
    this.retexture = new RetextureAPI(apiKey);
    this.animations = new AnimationsAPI(apiKey);
  }

  /**
   * Generate a character model with optional rigging and animations
   */
  async character(options: {
    prompt: string;
    style?: ArtStyle;
    rigged?: boolean;
    animations?: string[];
    polycount?: number;
  }): Promise<MeshyTask> {
    const task = await this.generateModel({
      prompt: options.prompt,
      style: options.style || 'cartoon',
      polycount: options.polycount || 8000,
      tPose: options.rigged,
    });

    // TODO: Add rigging if requested
    // TODO: Add animations if requested

    return task;
  }

  /**
   * Generate a prop/obstacle model
   */
  async prop(options: {
    prompt: string;
    style?: ArtStyle;
    variants?: string[];
    polycount?: number;
  }): Promise<MeshyTask> {
    return this.generateModel({
      prompt: options.prompt,
      style: options.style || 'realistic',
      polycount: options.polycount || 5000,
    });
  }

  /**
   * Generate a collectible model (coins, gems, etc.)
   */
  async collectible(options: {
    prompt: string;
    style?: ArtStyle;
    polycount?: number;
  }): Promise<MeshyTask> {
    return this.generateModel({
      prompt: options.prompt,
      style: options.style || 'cartoon',
      polycount: options.polycount || 2000,
    });
  }

  /**
   * Internal: Generate a model using text-to-3D
   */
  private async generateModel(options: {
    prompt: string;
    style: ArtStyle;
    polycount: number;
    tPose?: boolean;
  }): Promise<MeshyTask> {
    const makeRequest = async (url: string, init: RequestInit) => {
      const response = await fetch(url, init);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      return response.json() as Promise<{ result?: string; id?: string }>;
    };

    const previewTask = await this.text3d.createPreviewTask(
      {
        text_prompt: options.prompt,
        art_style: options.style,
        target_polycount: options.polycount,
        is_a_t_pose: options.tPose,
      },
      makeRequest
    );

    // Poll until complete
    return this.text3d.pollTask(previewTask.id);
  }
}
