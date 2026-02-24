/**
 * Meshy Retexture API
 * Retexturing existing models with AI-generated textures
 * https://docs.meshy.ai/en/api/retexture
 *
 * Extends MeshyBaseClient for shared functionality
 */

import { MeshyBaseClient } from './base.js';

export interface RetextureTaskParams {
  /**
   * Input - either input_task_id OR model_url (not both!)
   */
  input_task_id?: string; // Task ID from text-to-3d or previous task
  model_url?: string; // Publicly accessible GLB/FBX/OBJ URL or Data URI

  /**
   * Style - either text_style_prompt OR image_style_url (not both!)
   */
  text_style_prompt?: string; // Text description (e.g., "green moss covering, wet appearance")
  image_style_url?: string; // Image URL or Data URI to guide texturing

  /**
   * Advanced controls
   */
  ai_model?: 'meshy-4' | 'meshy-5'; // Default: meshy-5
  enable_original_uv?: boolean; // Keep original UV mapping (default: true)
  enable_pbr?: boolean; // Generate PBR textures (default: false)
}

export interface RetextureTask {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED';
  progress?: number;
  model_urls?: {
    glb?: string;
    fbx?: string;
    usdz?: string;
  } | null;
  texture_urls?: Array<{
    base_color?: string;
    metallic?: string;
    normal?: string;
    roughness?: string;
  }> | null;
  created_at: number;
  finished_at?: number;
  started_at?: number;
  expires_at?: number;
}

export class RetextureAPI extends MeshyBaseClient {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.meshy.ai/openapi/v1');
  }

  /**
   * Create retexture task (aligned with actual API)
   * Generate new textures for existing model
   */
  async createRetextureTask(
    params: RetextureTaskParams,
    makeRequestWithRetry: (
      url: string,
      options: RequestInit
    ) => Promise<{ result?: string; id?: string }>
  ): Promise<RetextureTask> {
    // Validate inputs per API docs
    if (!params.input_task_id && !params.model_url) {
      throw new Error('Either input_task_id or model_url is required');
    }

    if (!params.text_style_prompt && !params.image_style_url) {
      throw new Error('Either text_style_prompt or image_style_url is required');
    }

    const requestBody: Record<string, string | boolean | undefined> = {};

    // Input: task_id or model_url
    if (params.input_task_id) {
      requestBody.input_task_id = params.input_task_id;
    } else {
      requestBody.model_url = params.model_url;
    }

    // Style: text or image
    if (params.text_style_prompt) {
      requestBody.text_style_prompt = params.text_style_prompt;
    } else {
      requestBody.image_style_url = params.image_style_url;
    }

    // Optional params
    if (params.ai_model) {
      requestBody.ai_model = params.ai_model;
    }
    if (params.enable_original_uv !== undefined) {
      requestBody.enable_original_uv = params.enable_original_uv;
    }
    if (params.enable_pbr !== undefined) {
      requestBody.enable_pbr = params.enable_pbr;
    }

    const data = await makeRequestWithRetry(`${this.baseUrl}/retexture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const taskId = data.result || data.id;

    if (!taskId) {
      throw new Error('No task ID returned from createRetextureTask');
    }

    return {
      id: taskId,
      status: 'PENDING',
      progress: 0,
      model_urls: null,
      texture_urls: null,
      created_at: Date.now(),
    };
  }

  /**
   * Get retexture task status
   */
  async getRetextureTask(taskId: string): Promise<RetextureTask> {
    return await this.request<RetextureTask>(`/retexture/${taskId}`);
  }

  /**
   * Poll retexture task until complete
   */
  async pollRetextureTask(
    taskId: string,
    maxRetries = 60,
    intervalMs = 10000
  ): Promise<RetextureTask> {
    for (let i = 0; i < maxRetries; i++) {
      const task = await this.getRetextureTask(taskId);

      if (task.status === 'SUCCEEDED') return task;
      if (task.status === 'FAILED' || task.status === 'EXPIRED') {
        throw new Error(`Retexture task ${taskId} failed: ${task.status}`);
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Retexture task ${taskId} timed out`);
  }

  /**
   * Delete retexture task
   */
  async deleteRetextureTask(taskId: string): Promise<void> {
    await this.request(`/retexture/${taskId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Extract GLB URL from retexture task
   */
  getGLBUrl(task: RetextureTask): string | null {
    return task.model_urls?.glb || null;
  }

  /**
   * Extract texture URLs for advanced usage
   */
  getTextureUrls(task: RetextureTask) {
    return task.texture_urls || null;
  }
}
