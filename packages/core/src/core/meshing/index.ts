/**
 * Mesh extraction from implicit surfaces.
 *
 * Renderer-free and domain-neutral: marching cubes turns any signed-distance
 * function into geometry, whether that field describes terrain, a metaball, or
 * a procedural prop. It lives here rather than under `terrain` for exactly that
 * reason — terrain is one caller, not the owner.
 *
 * @packageDocumentation
 * @module core/meshing
 * @category World Building
 */

export type { MarchingCubesOptions, MarchingCubesResult } from "./marching-cubes.js";
export { createGeometryFromMarchingCubes, marchingCubes } from "./marching-cubes.js";
