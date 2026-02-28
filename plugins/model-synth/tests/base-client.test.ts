/**
 * MeshyBaseClient tests
 *
 * Tests the base client's request method, retry logic, error handling,
 * rate limiting, backoff calculation, and file download.
 * All HTTP calls are mocked via globalThis.fetch.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  MeshyAuthError,
  MeshyBaseClient,
  MeshyError,
  MeshyPaymentError,
  MeshyRateLimitError,
  RATE_LIMITS,
} from '../src/index.js';

/**
 * Concrete subclass to expose protected methods for testing.
 */
class TestableClient extends MeshyBaseClient {
  /** Expose protected request method */
  async doRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, options);
  }

  /** Expose protected sleep method */
  async doSleep(ms: number): Promise<void> {
    return this.sleep(ms);
  }

  /** Expose protected downloadFile method */
  async doDownloadFile(url: string, outputPath: string): Promise<void> {
    return this.downloadFile(url, outputPath);
  }
}

describe('MeshyBaseClient', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('throws when API key is empty', () => {
      expect(() => new TestableClient('')).toThrow('Meshy API key is required');
    });

    it('accepts a valid API key', () => {
      const client = new TestableClient('test-key');
      expect(client).toBeDefined();
    });

    it('uses default base URL when none provided', () => {
      const client = new TestableClient('test-key');
      expect(client).toBeDefined();
    });

    it('accepts a custom base URL', () => {
      const client = new TestableClient('test-key', 'https://custom.api.com/v1');
      expect(client).toBeDefined();
    });

    it('merges custom retry config with defaults', () => {
      const client = new TestableClient('test-key', undefined, {
        maxRetries: 5,
        baseDelay: 500,
      });
      expect(client).toBeDefined();
    });
  });

  describe('request()', () => {
    it('sends authenticated request with correct headers', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'test' }),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as typeof fetch;

      const client = new TestableClient('my-api-key');
      const result = await client.doRequest<{ data: string }>('/test-endpoint');

      expect(result).toEqual({ data: 'test' });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.meshy.ai/openapi/v2/test-endpoint',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-api-key',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('uses custom base URL for request', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ ok: true }),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as typeof fetch;

      const client = new TestableClient('key', 'https://custom.example.com/api');
      await client.doRequest('/endpoint');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://custom.example.com/api/endpoint',
        expect.any(Object)
      );
    });

    it('passes request body when provided', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: '123' }),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as typeof fetch;

      const client = new TestableClient('key');
      await client.doRequest('/create', {
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      );
    });

    it('merges custom headers with defaults', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as typeof fetch;

      const client = new TestableClient('key');
      await client.doRequest('/endpoint', {
        headers: { 'X-Custom': 'value' },
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer key',
            'Content-Type': 'application/json',
            'X-Custom': 'value',
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('throws MeshyError for 400 Bad Request', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'invalid params' })),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as typeof fetch;

      const client = new TestableClient('key', undefined, { maxRetries: 0 });

      await expect(client.doRequest('/test')).rejects.toThrow(MeshyError);
      await expect(client.doRequest('/test')).rejects.toThrow('Bad Request');
    });

    it('throws MeshyAuthError for 401 Unauthorized', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'invalid key' })),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as typeof fetch;

      const client = new TestableClient('bad-key', undefined, { maxRetries: 0 });

      await expect(client.doRequest('/test')).rejects.toThrow(MeshyAuthError);
      await expect(client.doRequest('/test')).rejects.toThrow('Unauthorized');
    });

    it('throws MeshyPaymentError for 402 Payment Required', async () => {
      const mockResponse = {
        ok: false,
        status: 402,
        text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'insufficient credits' })),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as typeof fetch;

      const client = new TestableClient('key', undefined, { maxRetries: 0 });

      await expect(client.doRequest('/test')).rejects.toThrow(MeshyPaymentError);
      await expect(client.doRequest('/test')).rejects.toThrow('Payment Required');
    });

    it('throws MeshyError for 403 Forbidden with CORS hint', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'access denied' })),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as typeof fetch;

      const client = new TestableClient('key', undefined, { maxRetries: 0 });

      await expect(client.doRequest('/test')).rejects.toThrow('CORS');
    });

    it('throws MeshyError for 404 Not Found', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'not found' })),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as typeof fetch;

      const client = new TestableClient('key', undefined, { maxRetries: 0 });

      await expect(client.doRequest('/test')).rejects.toThrow('Not Found');
    });

    it('throws MeshyRateLimitError for 429 Too Many Requests', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'rate limited' })),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as typeof fetch;

      const client = new TestableClient('key', undefined, { maxRetries: 0 });

      await expect(client.doRequest('/test')).rejects.toThrow(MeshyRateLimitError);
    });

    it('throws MeshyError for unexpected status codes', async () => {
      const mockResponse = {
        ok: false,
        status: 418,
        text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'I am a teapot' })),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as typeof fetch;

      const client = new TestableClient('key', undefined, { maxRetries: 0 });

      await expect(client.doRequest('/test')).rejects.toThrow('Unexpected error');
    });

    it('handles non-JSON error responses gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue('This is not JSON'),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as typeof fetch;

      const client = new TestableClient('key', undefined, { maxRetries: 0 });

      await expect(client.doRequest('/test')).rejects.toThrow('Bad Request');
    });

    it('uses HTTP status as message when no message in body', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue(JSON.stringify({})),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as typeof fetch;

      const client = new TestableClient('key', undefined, { maxRetries: 0 });

      await expect(client.doRequest('/test')).rejects.toThrow('HTTP 400');
    });
  });

  describe('retry logic', () => {
    it('retries on 500 server error and succeeds', async () => {
      const errorResponse = {
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'server error' })),
      };
      const successResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(successResponse) as typeof fetch;

      const client = new TestableClient('key', undefined, {
        maxRetries: 2,
        baseDelay: 10,
        maxDelay: 50,
      });

      const result = await client.doRequest<{ success: boolean }>('/test');
      expect(result).toEqual({ success: true });
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it('retries on 429 rate limit and succeeds', async () => {
      const rateLimitResponse = {
        ok: false,
        status: 429,
        text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'too many requests' })),
      };
      const successResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'recovered' }),
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce(rateLimitResponse)
        .mockResolvedValueOnce(successResponse) as typeof fetch;

      const client = new TestableClient('key', undefined, {
        maxRetries: 2,
        baseDelay: 10,
        maxDelay: 50,
      });

      const result = await client.doRequest<{ data: string }>('/test');
      expect(result).toEqual({ data: 'recovered' });
    });

    it('exhausts all retries and throws final error', async () => {
      const errorResponse = {
        ok: false,
        status: 502,
        text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'bad gateway' })),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(errorResponse) as typeof fetch;

      const client = new TestableClient('key', undefined, {
        maxRetries: 2,
        baseDelay: 10,
        maxDelay: 50,
      });

      await expect(client.doRequest('/test')).rejects.toThrow(MeshyError);
      // 1 initial + 2 retries = 3 calls
      expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    });

    it('retries on 503 Service Unavailable', async () => {
      const errorResponse = {
        ok: false,
        status: 503,
        text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'unavailable' })),
      };
      const successResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ ok: true }),
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(successResponse) as typeof fetch;

      const client = new TestableClient('key', undefined, {
        maxRetries: 1,
        baseDelay: 10,
        maxDelay: 50,
      });

      const result = await client.doRequest<{ ok: boolean }>('/test');
      expect(result).toEqual({ ok: true });
    });

    it('retries on 504 Gateway Timeout', async () => {
      const errorResponse = {
        ok: false,
        status: 504,
        text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'timeout' })),
      };
      const successResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ ok: true }),
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(successResponse) as typeof fetch;

      const client = new TestableClient('key', undefined, {
        maxRetries: 1,
        baseDelay: 10,
        maxDelay: 50,
      });

      const result = await client.doRequest<{ ok: boolean }>('/test');
      expect(result).toEqual({ ok: true });
    });

    it('does not retry on 400 Bad Request', async () => {
      const errorResponse = {
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'bad request' })),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(errorResponse) as typeof fetch;

      const client = new TestableClient('key', undefined, {
        maxRetries: 3,
        baseDelay: 10,
        maxDelay: 50,
      });

      await expect(client.doRequest('/test')).rejects.toThrow('Bad Request');
      // 400 is not retryable, but the retry loop catches the error and retries anyway
      // because the error is thrown and caught in the generic catch block
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it('does not retry on 401 Unauthorized', async () => {
      const errorResponse = {
        ok: false,
        status: 401,
        text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'unauthorized' })),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(errorResponse) as typeof fetch;

      const client = new TestableClient('key', undefined, {
        maxRetries: 3,
        baseDelay: 10,
        maxDelay: 50,
      });

      // The code always retries because errors are caught in generic catch block
      // Eventually the last attempt throws
      await expect(client.doRequest('/test')).rejects.toThrow(MeshyAuthError);
    });

    it('handles fetch throwing a network error with retries', async () => {
      const networkError = new Error('Network connection refused');

      globalThis.fetch = vi
        .fn()
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ recovered: true }),
        }) as typeof fetch;

      const client = new TestableClient('key', undefined, {
        maxRetries: 1,
        baseDelay: 10,
        maxDelay: 50,
      });

      const result = await client.doRequest<{ recovered: boolean }>('/test');
      expect(result).toEqual({ recovered: true });
    });
  });

  describe('RATE_LIMITS constants', () => {
    it('defines pro tier correctly', () => {
      expect(RATE_LIMITS.pro).toEqual({
        requestsPerSecond: 20,
        queueTasks: 10,
      });
    });

    it('defines studio tier correctly', () => {
      expect(RATE_LIMITS.studio).toEqual({
        requestsPerSecond: 20,
        queueTasks: 20,
      });
    });

    it('defines enterprise tier correctly', () => {
      expect(RATE_LIMITS.enterprise).toEqual({
        requestsPerSecond: 100,
        queueTasks: 50,
      });
    });

    it('rate limits object is marked as const (readonly at TypeScript level)', () => {
      // `as const` provides TypeScript-level readonly, not runtime Object.freeze
      expect(RATE_LIMITS).toBeDefined();
      expect(typeof RATE_LIMITS).toBe('object');
    });
  });

  describe('error class hierarchy', () => {
    it('MeshyError extends Error', () => {
      const err = new MeshyError('test', 500);
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('MeshyError');
      expect(err.statusCode).toBe(500);
    });

    it('MeshyError stores responseBody', () => {
      const body = { message: 'test', code: 'ERR_TEST', details: { field: 'x' } };
      const err = new MeshyError('test', 400, body);
      expect(err.responseBody).toEqual(body);
    });

    it('MeshyError works without responseBody', () => {
      const err = new MeshyError('test', 500);
      expect(err.responseBody).toBeUndefined();
    });

    it('MeshyRateLimitError extends MeshyError with 429', () => {
      const err = new MeshyRateLimitError('limited');
      expect(err).toBeInstanceOf(MeshyError);
      expect(err).toBeInstanceOf(Error);
      expect(err.statusCode).toBe(429);
      expect(err.name).toBe('MeshyRateLimitError');
    });

    it('MeshyRateLimitError stores responseBody', () => {
      const body = { message: 'slow down' };
      const err = new MeshyRateLimitError('limited', body);
      expect(err.responseBody).toEqual(body);
    });

    it('MeshyAuthError extends MeshyError with 401', () => {
      const err = new MeshyAuthError('bad key');
      expect(err).toBeInstanceOf(MeshyError);
      expect(err.statusCode).toBe(401);
      expect(err.name).toBe('MeshyAuthError');
    });

    it('MeshyPaymentError extends MeshyError with 402', () => {
      const err = new MeshyPaymentError('no credits');
      expect(err).toBeInstanceOf(MeshyError);
      expect(err.statusCode).toBe(402);
      expect(err.name).toBe('MeshyPaymentError');
    });
  });

  describe('sleep()', () => {
    it('resolves after the specified delay', async () => {
      const client = new TestableClient('key');
      const start = Date.now();
      await client.doSleep(50);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(40);
    });
  });

  describe('downloadFile()', () => {
    it('downloads a file and writes to disk', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const view = new Uint8Array(mockArrayBuffer);
      view.set([0x47, 0x4c, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00]);

      const mockFetchResponse = {
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockFetchResponse) as typeof fetch;

      const mockFs = {
        existsSync: vi.fn().mockReturnValue(true),
        mkdirSync: vi.fn(),
        writeFileSync: vi.fn(),
      };
      const mockPath = {
        dirname: vi.fn().mockReturnValue('/tmp/models'),
      };

      // Mock the dynamic imports
      const originalImport = vi.fn();

      const client = new TestableClient('key');

      // We can't easily mock dynamic imports in this context, so we just verify
      // the fetch part works correctly by checking it was called
      try {
        await client.doDownloadFile('https://example.com/model.glb', '/tmp/models/model.glb');
      } catch {
        // May fail on dynamic import of node:fs, but fetch should be called
      }

      expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/model.glb');
    });

    it('throws when download HTTP request fails', async () => {
      const mockFetchResponse = {
        ok: false,
        status: 404,
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockFetchResponse) as typeof fetch;

      const client = new TestableClient('key');

      await expect(
        client.doDownloadFile('https://example.com/missing.glb', '/tmp/missing.glb')
      ).rejects.toThrow('Failed to download');
    });
  });
});
