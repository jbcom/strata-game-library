/**
 * Meshy Text-to-3D API
 * Handles preview and refine tasks for text-based 3D model generation
 */

import { MeshyBaseClient } from './base.js';

export interface CreateTaskParams {
  text_prompt: string;
  art_style?:
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
  ai_model?: 'meshy-4' | 'meshy-5' | 'latest';
  topology?: 'triangle' | 'quad';
  target_polycount?: number;
  should_remesh?: boolean;
  symmetry_mode?: 'auto' | 'symmetric' | 'asymmetric';
  is_a_t_pose?: boolean;
  moderation?: boolean | 'strict';
}

export interface MeshyTask {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED';
  progress?: number;
  model_urls?: {
    glb?: string;
    fbx?: string;
    usdz?: string;
    obj?: string;
    mtl?: string;
  } | null;
  model_url?: string;
  created_at: string;
  finished_at: number;
}

export class TextTo3DAPI extends MeshyBaseClient {
  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl || 'https://api.meshy.ai/openapi/v2');
  }

  /**
   * Create a preview task (fast, lower quality)
   */
  async createPreviewTask(
    params: CreateTaskParams,
    makeRequestWithRetry: (
      url: string,
      options: RequestInit
    ) => Promise<{ result?: string; id?: string }>
  ): Promise<MeshyTask> {
    const data = await makeRequestWithRetry(`${this.baseUrl}/text-to-3d`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'preview',
        prompt: params.text_prompt,
        art_style: params.art_style || 'realistic',
        ai_model: params.ai_model || 'meshy-5',
        topology: params.topology || 'triangle',
        target_polycount: params.target_polycount || 30000,
        should_remesh: params.should_remesh !== false,
        symmetry_mode: params.symmetry_mode || 'auto',
        is_a_t_pose: params.is_a_t_pose || false,
        moderation: params.moderation || false,
      }),
    });

    const taskId = data.result || data.id;

    if (!taskId) {
      throw new Error('No task ID returned from createPreviewTask');
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      id: taskId,
      status: 'PENDING',
      progress: 0,
      model_urls: null,
      created_at: String(Date.now()),
      finished_at: 0,
    };
  }

  /**
   * Create a refine task from preview (high quality, longer generation)
   */
  async createRefineTask(
    previewTaskId: string,
    makeRequestWithRetry: (
      url: string,
      options: RequestInit
    ) => Promise<{ result?: string; id?: string }>,
    params?: {
      enable_pbr?: boolean;
      texture_prompt?: string;
      ai_model?: string;
    }
  ): Promise<MeshyTask> {
    const data = await makeRequestWithRetry(`${this.baseUrl}/text-to-3d`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'refine',
        preview_task_id: previewTaskId,
        enable_pbr: params?.enable_pbr || false,
        ai_model: params?.ai_model || 'meshy-5',
        texture_prompt: params?.texture_prompt,
      }),
    });

    return {
      id: data.result || data.id || '',
      status: 'PENDING',
      progress: 0,
      model_urls: null,
      created_at: String(Date.now()),
      finished_at: 0,
    };
  }

  /**
   * Get task status
   */
  async getTask(taskId: string, retryOn404 = true): Promise<MeshyTask> {
    const maxRetries = retryOn404 ? 3 : 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const response = await fetch(`${this.baseUrl}/text-to-3d/${taskId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (response.ok) {
        return response.json() as Promise<MeshyTask>;
      }

      if (response.status === 404 && attempt < maxRetries) {
        const waitMs = 2000 * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      const error = await response.text();
      throw new Error(`Failed to get task: ${response.status} - ${error}`);
    }

    throw new Error(`Task not found after ${maxRetries + 1} attempts`);
  }

  /**
   * Poll task until complete
   */
  async pollTask(taskId: string, maxRetries = 60, intervalMs = 10000): Promise<MeshyTask> {
    for (let i = 0; i < maxRetries; i++) {
      const task = await this.getTask(taskId);

      if (task.status === 'SUCCEEDED') return task;
      if (task.status === 'FAILED' || task.status === 'EXPIRED') {
        throw new Error(`Task ${taskId} failed with status: ${task.status}`);
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Task ${taskId} timed out`);
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/text-to-3d/${taskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete task ${taskId}: ${response.status} - ${error}`);
    }
  }

  /**
   * List tasks with pagination
   */
  async listTasks(pageNum: number = 1, pageSize: number = 100): Promise<MeshyTask[]> {
    const url = `${this.baseUrl}/text-to-3d?page_num=${pageNum}&page_size=${pageSize}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to list tasks: ${response.status} - ${error}`);
    }

    return response.json() as Promise<MeshyTask[]>;
  }
}
