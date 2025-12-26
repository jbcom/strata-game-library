import { describe, expect, it, vi } from 'vitest';
import { createGameStore } from '../store';
import type { PersistenceAdapter, SaveData } from '../types';

describe('GameStore Security', () => {
    it('should reject loading state with invalid checksum', async () => {
        const mockPersistence: PersistenceAdapter = {
            save: vi.fn().mockResolvedValue(true),
            load: vi.fn().mockImplementation(async (_key) => {
                return {
                    version: 1,
                    timestamp: Date.now(),
                    state: { count: 999 }, // Modified state
                    checksum: 'invalid-checksum', // Checksum doesn't match
                } as SaveData<any>;
            }),
            delete: vi.fn().mockResolvedValue(true),
            listSaves: vi.fn().mockResolvedValue([]),
            getSaveInfo: vi.fn().mockResolvedValue(null),
        };

        const store = createGameStore(
            { count: 0 },
            {
                persistenceAdapter: mockPersistence,
                enablePersistence: true,
            }
        );

        // Try to load the tampered data
        const success = await store.getState().load('tampered');

        // Should return false due to checksum mismatch
        expect(success).toBe(false);
    });
});
