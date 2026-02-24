/**
 * Re-exports WorldGraph from the canonical world/ module.
 *
 * The world/WorldGraph module is the canonical implementation.
 * This file exists for backward compatibility with imports from game/.
 */
export { createWorldGraph, isWorldGraph, WorldGraph } from '../world/WorldGraph';
