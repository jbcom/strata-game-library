/**
 * Meshy Base Client
 *
 * Shared authentication, rate limiting, error handling, and retries.
 * All Meshy APIs extend this base class.
 *
 * Per Meshy API docs:
 * - Rate Limits: https://docs.meshy.ai/en/api/rate-limits
 * - Error Codes: https://docs.meshy.ai/en/api/errors
 */

import type { RequestInit, Response } from 'node-fetch';

/**
 * Meshy rate limits per tier
 */
export const RATE_LIMITS = {
  pro: {
    requestsPerSecond: 20,
    queueTasks: 10,
  },
  studio: {
    requestsPerSecond: 20,
    queueTasks: 20,
  },
  enterprise: {
    requestsPerSecond: 100,
    queueTasks: 50,
  },
} as const;

/** Error response data from Meshy API */
export interface MeshyErrorResponse {
  message?: string;
  code?: string;
  details?: unknown;
}

/**
 * Meshy error types
 */
export class MeshyError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseBody?: MeshyErrorResponse
  ) {
    super(message);
    this.name = 'MeshyError';
  }
}

export class MeshyRateLimitError extends MeshyError {
  constructor(message: string, responseBody?: MeshyErrorResponse) {
    super(message, 429, responseBody);
    this.name = 'MeshyRateLimitError';
  }
}

export class MeshyAuthError extends MeshyError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'MeshyAuthError';
  }
}

export class MeshyPaymentError extends MeshyError {
  constructor(message: string) {
    super(message, 402);
    this.name = 'MeshyPaymentError';
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // ms
  maxDelay: number; // ms
  retryOn: number[]; // Status codes to retry
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryOn: [429, 500, 502, 503, 504], // Rate limit + server errors
};

/**
 * Base Meshy API Client
 * All Meshy APIs (text_to_3d, rigging, retexture) extend this
 */
export abstract class MeshyBaseClient {
  protected apiKey: string;
  protected baseUrl: string;
  protected retryConfig: RetryConfig;

  // Rate limiting
  private requestTimes: number[] = [];
  private readonly rateLimitWindow = 1000; // 1 second

  constructor(
    apiKey: string,
    baseUrl: string = 'https://api.meshy.ai/openapi/v2',
    retryConfig: Partial<RetryConfig> = {}
  ) {
    if (!apiKey) {
      throw new Error('Meshy API key is required');
    }

    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Make authenticated request with retry logic
   */
  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const fetch = (await import('node-fetch')).default;

    // Rate limiting check
    await this.checkRateLimit();

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        // Handle errors
        if (!response.ok) {
          await this.handleErrorResponse(response as Response, attempt);
        }

        // Success - record request time for rate limiting
        this.requestTimes.push(Date.now());

        return (await response.json()) as T;
      } catch (error) {
        lastError = error as Error;

        // Check if we should retry
        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.calculateBackoff(attempt);
          console.warn(
            `Retry attempt ${attempt + 1}/${this.retryConfig.maxRetries} after ${delay}ms`
          );
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Handle error responses per Meshy docs
   */
  private async handleErrorResponse(response: Response, attempt: number): Promise<never> {
    const body = await response.text();
    let errorData: MeshyErrorResponse;

    try {
      errorData = JSON.parse(body) as MeshyErrorResponse;
    } catch {
      errorData = { message: body };
    }

    const message = errorData.message || `HTTP ${response.status}`;

    switch (response.status) {
      case 400:
        throw new MeshyError(`Bad Request: ${message}`, 400, errorData);

      case 401:
        throw new MeshyAuthError(`Unauthorized: ${message}`);

      case 402:
        throw new MeshyPaymentError(`Payment Required: ${message}`);

      case 403:
        throw new MeshyError(
          `Forbidden: ${message}. Check CORS if calling from browser.`,
          403,
          errorData
        );

      case 404:
        throw new MeshyError(`Not Found: ${message}`, 404, errorData);

      case 429:
        // Rate limit - check if we should retry
        if (attempt < this.retryConfig.maxRetries) {
          console.warn(`Rate limited. Will retry...`);
          throw new MeshyRateLimitError(message, errorData);
        }
        throw new MeshyRateLimitError(`Rate Limit Exceeded: ${message}`, errorData);

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors - retryable
        if (attempt < this.retryConfig.maxRetries) {
          throw new MeshyError(`Server Error: ${message}`, response.status, errorData);
        }
        throw new MeshyError(`Server Error (final): ${message}`, response.status, errorData);

      default:
        throw new MeshyError(`Unexpected error: ${message}`, response.status, errorData);
    }
  }

  /**
   * Check rate limit before making request
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();

    // Remove requests outside the window
    this.requestTimes = this.requestTimes.filter((time) => now - time < this.rateLimitWindow);

    // Check if we're at limit (assume Pro tier: 20 req/s)
    const requestsInWindow = this.requestTimes.length;
    if (requestsInWindow >= RATE_LIMITS.pro.requestsPerSecond) {
      const oldestRequest = this.requestTimes[0];
      const waitTime = this.rateLimitWindow - (now - oldestRequest);

      if (waitTime > 0) {
        console.warn(`Rate limit approaching, waiting ${waitTime}ms...`);
        await this.sleep(waitTime + 100); // Add buffer
      }
    }
  }

  /**
   * Calculate exponential backoff with jitter
   */
  private calculateBackoff(attempt: number): number {
    const exponential = this.retryConfig.baseDelay * 2 ** attempt;
    const jitter = Math.random() * 0.3 * exponential; // ±30% jitter
    const delay = Math.min(exponential + jitter, this.retryConfig.maxDelay);
    return Math.floor(delay);
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Download file from URL (common across all APIs)
   */
  protected async downloadFile(url: string, outputPath: string): Promise<void> {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download from ${url}: ${response.status}`);
    }

    const buffer = await response.buffer();
    const fs = await import('fs');
    const path = await import('path');

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, buffer);
  }
}
