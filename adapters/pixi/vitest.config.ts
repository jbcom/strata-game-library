import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The mount lifecycle creates and removes real canvas elements, so these
    // tests need a DOM rather than the default node environment.
    environment: 'jsdom',
    globals: true,
  },
});
