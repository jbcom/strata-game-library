/**
 * Meshy Rigging & Animation API
 * Handles character rigging and animations
 *
 * Extends MeshyBaseClient for shared functionality
 */

import { MeshyBaseClient } from './base.js';

export interface RiggingTaskParams {
  input_task_id: string; // Refine task ID
  height_meters?: number; // Character height (default 1.7m)

  // Extended animation support
  custom_animations?: {
    idle?: boolean;
    attack?: boolean;
    cast?: boolean;
    death?: boolean;
    jump?: boolean;
    dodge?: boolean;
    emote_wave?: boolean;
    emote_talk?: boolean;
  };
  animation_style?: 'realistic' | 'stylized' | 'exaggerated';
  fps?: 30 | 60;
}

export interface RiggingTask {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
  progress?: number;
  created_at: number;
  started_at?: number;
  finished_at?: number;
  expires_at?: number;
  result?: {
    rigged_character_glb_url?: string;
    rigged_character_fbx_url?: string;
    basic_animations?: {
      walking_glb_url?: string;
      walking_fbx_url?: string;
      walking_armature_glb_url?: string;
      running_glb_url?: string;
      running_fbx_url?: string;
      running_armature_glb_url?: string;
    };
  };
  task_error?: {
    message: string;
  };
  preceding_tasks?: number;
}

export class RiggingAPI extends MeshyBaseClient {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.meshy.ai/openapi/v1'); // v1 for rigging
  }

  /**
   * Create rigging task
   * Returns model with basic animations (walking & running)
   */
  async createRiggingTask(params: RiggingTaskParams): Promise<RiggingTask> {
    const data = await this.request<{ result?: string; id?: string }>('/rigging', {
      method: 'POST',
      body: JSON.stringify({
        input_task_id: params.input_task_id,
        height_meters: params.height_meters || 1.7,
        // Extended params (Meshy may or may not support all - graceful fallback)
        ...(params.custom_animations && {
          custom_animations: params.custom_animations,
        }),
        ...(params.animation_style && {
          animation_style: params.animation_style,
        }),
        ...(params.fps && { fps: params.fps }),
      }),
    });

    return {
      id: data.result || data.id || '',
      status: 'PENDING',
      progress: 0,
      created_at: Date.now(),
    };
  }

  /**
   * Get rigging task status
   */
  async getRiggingTask(taskId: string): Promise<RiggingTask> {
    return await this.request<RiggingTask>(`/rigging/${taskId}`);
  }

  /**
   * Poll rigging task until complete
   */
  async pollRiggingTask(taskId: string, maxRetries = 60, intervalMs = 10000): Promise<RiggingTask> {
    for (let i = 0; i < maxRetries; i++) {
      const task = await this.getRiggingTask(taskId);

      if (task.status === 'SUCCEEDED') return task;
      if (task.status === 'FAILED' || task.status === 'CANCELED') {
        throw new Error(`Rigging task ${taskId} failed: ${task.status}`);
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Rigging task ${taskId} timed out`);
  }

  /**
   * Delete rigging task
   */
  async deleteRiggingTask(taskId: string): Promise<void> {
    await this.request(`/rigging/${taskId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Extract animation URLs from completed rigging task
   */
  getAnimationUrls(task: RiggingTask): Record<string, string | undefined> {
    if (task.status !== 'SUCCEEDED') return {};

    const urls: Record<string, string | undefined> = {
      rigged: task.result?.rigged_character_glb_url,
      walking: task.result?.basic_animations?.walking_glb_url,
      running: task.result?.basic_animations?.running_glb_url,
    };

    // Extract any additional animations from result
    if (task.result && typeof task.result === 'object') {
      for (const [key, value] of Object.entries(task.result)) {
        if (key.includes('_glb_url') || key.includes('animation')) {
          urls[key] = value as string;
        }
      }
    }

    return urls;
  }
}
