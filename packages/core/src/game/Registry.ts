/**
 * Generic registry for storing and retrieving game objects by ID.
 *
 * Provides a simple Map-backed store for registering, looking up, and
 * listing game entities such as scenes, modes, items, and other
 * identifiable game objects.
 *
 * @module Registry
 * @category Game Systems
 */

import type { Registry } from './types';

export function createRegistry<T extends { id: string }>(initialItems: T[] = []): Registry<T> {
  const items = new Map<string, T>();

  const register = (item: T) => {
    items.set(item.id, item);
  };

  const get = (id: string) => items.get(id);

  const all = () => Array.from(items.values());

  for (const item of initialItems) {
    register(item);
  }

  return {
    register,
    get,
    all,
  };
}
