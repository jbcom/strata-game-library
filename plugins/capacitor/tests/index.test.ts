import { describe, expect, it } from 'vitest';
import { hello, version } from '../src/index.js';

describe('plugin', () => {
  it('should return version', () => {
    expect(version).toBe('0.0.1');
  });

  it('should return hello message', () => {
    expect(hello()).toBe('Hello from Strata Capacitor Plugin');
  });
});
