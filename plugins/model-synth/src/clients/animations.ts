/**
 * Meshy Animation API
 * Apply 600+ animations from the animation library to rigged characters
 * https://docs.meshy.ai/en/api/rigging-and-animation
 * https://docs.meshy.ai/en/api/animation-library
 */

import { MeshyBaseClient } from './base.js';

export interface AnimationTaskParams {
  rig_task_id: string; // From rigging task
  action_id: number; // 0-600+ from animation library
  post_process?: {
    operation_type: 'change_fps' | 'fbx2usdz' | 'extract_armature';
    fps?: 24 | 25 | 30 | 60;
  };
}

export interface AnimationTask {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
  progress?: number;
  created_at: number;
  started_at?: number;
  finished_at?: number;
  expires_at?: number;
  result?: {
    animation_glb_url?: string;
    animation_fbx_url?: string;
    processed_usdz_url?: string;
    processed_armature_fbx_url?: string;
    processed_animation_fps_fbx_url?: string;
  };
  task_error?: {
    message: string;
  };
  preceding_tasks?: number;
}

/**
 * Animation Library IDs for Otter River Rush
 * Selected from 600+ available animations
 */
export const OTTER_ANIMATIONS = {
  // Core movement
  idle: 0, // Idle
  walk: 30, // Casual_Walk
  run: 14, // Run_02
  runFast: 16, // RunFast

  // Game actions
  jump: 466, // Regular_Jump
  collect: 284, // Collect_Object ⭐ Perfect for coins!

  // Reactions
  hit: 178, // Hit_Reaction
  death: 8, // Dead
  victory: 59, // Victory_Cheer
  happy: 44, // Happy_jump_f

  // Dodge/evade
  dodgeLeft: 158, // Roll_Dodge
  dodgeRight: 159, // Roll_Dodge_1
  slideLeft: 516, // slide_light
  slideRight: 517, // slide_right
} as const;

export const ROCK_ANIMATIONS = {
  // No animations needed for static obstacles
} as const;

export class AnimationsAPI extends MeshyBaseClient {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.meshy.ai/openapi/v1');
  }

  /**
   * Create animation task
   * Apply specific animation from library to rigged character
   */
  async createAnimationTask(params: AnimationTaskParams): Promise<AnimationTask> {
    const data = await this.request<{ result?: string; id?: string }>('/animations', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    return {
      id: data.result || data.id || '',
      status: 'PENDING',
      progress: 0,
      created_at: Date.now(),
    };
  }

  /**
   * Get animation task status
   */
  async getAnimationTask(taskId: string): Promise<AnimationTask> {
    return await this.request<AnimationTask>(`/animations/${taskId}`);
  }

  /**
   * Poll animation task until complete
   */
  async pollAnimationTask(
    taskId: string,
    maxRetries = 60,
    intervalMs = 10000
  ): Promise<AnimationTask> {
    for (let i = 0; i < maxRetries; i++) {
      const task = await this.getAnimationTask(taskId);

      if (task.status === 'SUCCEEDED') return task;
      if (task.status === 'FAILED' || task.status === 'CANCELED') {
        throw new Error(`Animation task ${taskId} failed: ${task.status}`);
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Animation task ${taskId} timed out`);
  }

  /**
   * Delete animation task
   */
  async deleteAnimationTask(taskId: string): Promise<void> {
    await this.request(`/animations/${taskId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Extract animation GLB URL
   */
  getAnimationGLB(task: AnimationTask): string | null {
    return task.result?.animation_glb_url || null;
  }
}
