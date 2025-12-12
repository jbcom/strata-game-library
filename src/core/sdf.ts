/**
 * Signed Distance Field (SDF) utilities
 *
 * SDFs represent geometry as a function that returns the distance to the nearest surface.
 * Negative values are inside, positive values are outside.
 *
 * These functions are designed to work both on CPU (for marching cubes)
 * and can be ported to GLSL for raymarching.
 *
 * Lifted from Otterfall procedural terrain system.
 */

import * as THREE from 'three';

// ============================================================================
// SDF PRIMITIVES
// ============================================================================

/**
 * Sphere SDF
 * Optimized to avoid allocations for better performance in tight loops
 */
export function sdSphere(p: THREE.Vector3, center: THREE.Vector3, radius: number): number {
    if (radius <= 0) {
        throw new Error('sdSphere: radius must be positive');
    }
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    const dz = p.z - center.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz) - radius;
}

/**
 * Box SDF
 */
export function sdBox(p: THREE.Vector3, center: THREE.Vector3, halfExtents: THREE.Vector3): number {
    if (halfExtents.x <= 0 || halfExtents.y <= 0 || halfExtents.z <= 0) {
        throw new Error('sdBox: halfExtents must be positive');
    }
    const q = new THREE.Vector3(
        Math.abs(p.x - center.x) - halfExtents.x,
        Math.abs(p.y - center.y) - halfExtents.y,
        Math.abs(p.z - center.z) - halfExtents.z
    );
    const outside = new THREE.Vector3(
        Math.max(q.x, 0),
        Math.max(q.y, 0),
        Math.max(q.z, 0)
    ).length();
    const inside = Math.min(Math.max(q.x, Math.max(q.y, q.z)), 0);
    return outside + inside;
}

/**
 * Infinite ground plane SDF (y = height)
 */
export function sdPlane(p: THREE.Vector3, height: number): number {
    return p.y - height;
}

/**
 * Capsule/cylinder SDF
 * Optimized to avoid allocations for better performance in tight loops
 */
export function sdCapsule(
    p: THREE.Vector3,
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number
): number {
    if (radius <= 0) {
        throw new Error('sdCapsule: radius must be positive');
    }
    const pax = p.x - a.x;
    const pay = p.y - a.y;
    const paz = p.z - a.z;
    const bax = b.x - a.x;
    const bay = b.y - a.y;
    const baz = b.z - a.z;
    const baDot = bax * bax + bay * bay + baz * baz;
    const paDot = pax * bax + pay * bay + paz * baz;
    const h = Math.max(0, Math.min(1, baDot > 0 ? paDot / baDot : 0));
    const qx = pax - bax * h;
    const qy = pay - bay * h;
    const qz = paz - baz * h;
    return Math.sqrt(qx * qx + qy * qy + qz * qz) - radius;
}

/**
 * Torus SDF
 * Optimized to avoid allocations for better performance in tight loops
 */
export function sdTorus(
    p: THREE.Vector3,
    center: THREE.Vector3,
    majorRadius: number,
    minorRadius: number
): number {
    if (majorRadius <= 0 || minorRadius <= 0) {
        throw new Error('sdTorus: majorRadius and minorRadius must be positive');
    }
    const qx = p.x - center.x;
    const qy = p.y - center.y;
    const qz = p.z - center.z;
    const qxz = Math.sqrt(qx * qx + qz * qz) - majorRadius;
    return Math.sqrt(qxz * qxz + qy * qy) - minorRadius;
}

/**
 * Cone SDF (tip at origin, pointing up)
 * Optimized to avoid allocations for better performance in tight loops
 */
export function sdCone(
    p: THREE.Vector3,
    center: THREE.Vector3,
    angle: number,
    height: number
): number {
    if (height <= 0) {
        throw new Error('sdCone: height must be positive');
    }
    if (angle <= 0 || angle >= Math.PI / 2) {
        throw new Error('sdCone: angle must be between 0 and PI/2');
    }
    const qx = p.x - center.x;
    const qy = p.y - center.y;
    const qz = p.z - center.z;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const qLen = Math.sqrt(qx * qx + qz * qz);
    const dx = s * qLen - c * qy;
    const dy = c * qLen + s * qy - height;
    const a = Math.max(dx, dy);
    const bx = Math.max(dx, 0);
    const by = Math.max(dy, 0);
    const b = Math.sqrt(bx * bx + by * by);
    return a < 0 ? a : b;
}

// ============================================================================
// SDF OPERATIONS
// ============================================================================

/**
 * Union (combine two shapes)
 */
export function opUnion(d1: number, d2: number): number {
    return Math.min(d1, d2);
}

/**
 * Subtraction (cut shape2 from shape1)
 */
export function opSubtraction(d1: number, d2: number): number {
    return Math.max(d1, -d2);
}

/**
 * Intersection (keep only overlapping parts)
 */
export function opIntersection(d1: number, d2: number): number {
    return Math.max(d1, d2);
}

/**
 * Smooth union (blend two shapes together)
 */
export function opSmoothUnion(d1: number, d2: number, k: number): number {
    if (k <= 0) {
        throw new Error('opSmoothUnion: k must be positive');
    }
    const h = Math.max(k - Math.abs(d1 - d2), 0) / k;
    return Math.min(d1, d2) - h * h * k * 0.25;
}

/**
 * Smooth subtraction
 */
export function opSmoothSubtraction(d1: number, d2: number, k: number): number {
    if (k <= 0) {
        throw new Error('opSmoothSubtraction: k must be positive');
    }
    const h = Math.max(k - Math.abs(-d1 - d2), 0) / k;
    return Math.max(d1, -d2) + h * h * k * 0.25;
}

/**
 * Smooth intersection
 */
export function opSmoothIntersection(d1: number, d2: number, k: number): number {
    if (k <= 0) {
        throw new Error('opSmoothIntersection: k must be positive');
    }
    const h = Math.max(k - Math.abs(d1 - d2), 0) / k;
    return Math.max(d1, d2) + h * h * k * 0.25;
}

// ============================================================================
// NOISE FUNCTIONS (Legacy - prefer @see core/math for new code)
// ============================================================================

/**
 * Simple hash function
 *
 * The constants 127.1 and 43758.5453 are standard values used in procedural noise generation
 * to produce pseudo-random, well-distributed values. These values are commonly found in
 * hash functions for noise algorithms, such as those by Inigo Quilez.
 *
 * @deprecated For new code, use simplex-noise based functions from core/math module
 */
function hash(x: number): number {
    return (((Math.sin(x * 127.1) * 43758.5453) % 1) + 1) % 1;
}

function hash3(x: number, y: number, z: number): number {
    return hash(x + y * 157.0 + z * 113.0);
}

/**
 * 3D Value noise
 *
 * @deprecated For new code, use createNoise3D from core/math module which provides
 * simplex noise with better performance and distribution
 */
export function noise3D(x: number, y: number, z: number): number {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const iz = Math.floor(z);

    const fx = x - ix;
    const fy = y - iy;
    const fz = z - iz;

    // Smoothstep
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const uz = fz * fz * (3 - 2 * fz);

    // 8 corners of the cube
    const n000 = hash3(ix, iy, iz);
    const n100 = hash3(ix + 1, iy, iz);
    const n010 = hash3(ix, iy + 1, iz);
    const n110 = hash3(ix + 1, iy + 1, iz);
    const n001 = hash3(ix, iy, iz + 1);
    const n101 = hash3(ix + 1, iy, iz + 1);
    const n011 = hash3(ix, iy + 1, iz + 1);
    const n111 = hash3(ix + 1, iy + 1, iz + 1);

    // Trilinear interpolation
    const nx00 = n000 * (1 - ux) + n100 * ux;
    const nx10 = n010 * (1 - ux) + n110 * ux;
    const nx01 = n001 * (1 - ux) + n101 * ux;
    const nx11 = n011 * (1 - ux) + n111 * ux;

    const nxy0 = nx00 * (1 - uy) + nx10 * uy;
    const nxy1 = nx01 * (1 - uy) + nx11 * uy;

    return nxy0 * (1 - uz) + nxy1 * uz;
}

/**
 * Fractal Brownian Motion (FBM) - layered noise
 *
 * @deprecated For new code, use fbm3D from core/math module which provides
 * simplex-based FBM with configurable frequency, persistence, and lacunarity
 */
export function fbm(x: number, y: number, z: number, octaves: number = 4): number {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
        value += amplitude * noise3D(x * frequency, y * frequency, z * frequency);
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }

    return value / maxValue;
}

/**
 * Domain warping for more organic shapes
 *
 * @deprecated For new code, use warpedNoise3D from core/math module
 */
export function warpedFbm(x: number, y: number, z: number, octaves: number = 4): number {
    const warpStrength = 0.5;
    const wx = x + fbm(x + 0.0, y + 0.0, z + 0.0, 2) * warpStrength;
    const wy = y + fbm(x + 5.2, y + 1.3, z + 2.8, 2) * warpStrength;
    const wz = z + fbm(x + 9.1, y + 4.7, z + 3.4, 2) * warpStrength;
    return fbm(wx, wy, wz, octaves);
}

// ============================================================================
// TERRAIN SDF
// ============================================================================

/**
 * Biome data for SDF terrain generation
 * Used in terrain height calculations and SDF operations
 */
export interface BiomeData {
    type: 'marsh' | 'forest' | 'desert' | 'tundra' | 'savanna' | 'mountain' | 'scrubland';
    center: THREE.Vector2;
    radius: number;
}

/**
 * Get the dominant biome at a position
 */
export function getBiomeAt(x: number, z: number, biomes: BiomeData[]): BiomeData {
    if (!biomes || biomes.length === 0) {
        throw new Error('getBiomeAt: biomes array cannot be empty');
    }

    let closest = biomes[0];
    let closestDist = Infinity;

    for (const biome of biomes) {
        const dist = Math.sqrt((x - biome.center.x) ** 2 + (z - biome.center.y) ** 2);
        if (dist < closestDist) {
            closestDist = dist;
            closest = biome;
        }
    }

    return closest;
}

/**
 * Terrain height function based on biome
 */
export function getTerrainHeight(x: number, z: number, biomes: BiomeData[]): number {
    if (!biomes || biomes.length === 0) {
        throw new Error('getTerrainHeight: biomes array cannot be empty');
    }
    const biome = getBiomeAt(x, z, biomes);

    // Base noise
    const baseNoise = fbm(x * 0.02, 0, z * 0.02, 3);

    switch (biome.type) {
        case 'mountain': {
            // Tall peaks with ridges
            const mountainNoise = warpedFbm(x * 0.03, 0, z * 0.03, 5);
            const ridges = Math.abs(noise3D(x * 0.05, 0, z * 0.05) - 0.5) * 2;
            return baseNoise * 2 + mountainNoise * 25 + ridges * 10;
        }
        case 'tundra':
            // Gentle rolling hills
            return baseNoise * 3 + fbm(x * 0.05, 0, z * 0.05, 2) * 2;

        case 'forest':
            // Moderate hills
            return baseNoise * 5 + fbm(x * 0.04, 0, z * 0.04, 3) * 3;

        case 'desert': {
            // Dunes
            const duneNoise = Math.sin(x * 0.1 + noise3D(x * 0.02, 0, z * 0.02) * 5);
            return baseNoise * 2 + duneNoise * 3;
        }
        case 'marsh':
            // Very flat with some bumps
            return baseNoise * 0.5 + noise3D(x * 0.1, 0, z * 0.1) * 0.3;

        case 'savanna': {
            // Mostly flat with occasional kopjes
            const kopje = Math.max(0, 1 - fbm(x * 0.08, 0, z * 0.08, 2) * 3);
            return baseNoise * 1.5 + kopje * kopje * 8;
        }
        default:
            return baseNoise * 2;
    }
}

/**
 * Cave system SDF - creates tunnels and caverns
 */
export function sdCaves(x: number, y: number, z: number): number {
    // Worm-like caves using 3D noise
    const caveNoise1 = noise3D(x * 0.05, y * 0.05, z * 0.05);
    const caveNoise2 = noise3D(x * 0.08 + 100, y * 0.08, z * 0.08);

    // Combine to create cave-like structures
    const cave = caveNoise1 * caveNoise2;

    // Threshold to create actual caves
    const caveThreshold = 0.15;

    // Only create caves below a certain height
    const depthFactor = Math.max(0, 1 - y / 10);

    if (cave < caveThreshold && depthFactor > 0.2) {
        // Inside a cave - return negative distance
        return (cave - caveThreshold) * 10 * depthFactor;
    }

    return 1000; // No cave here
}

/**
 * Complete terrain SDF
 * Returns distance to terrain surface (negative = underground)
 */
export function sdTerrain(p: THREE.Vector3, biomes: BiomeData[]): number {
    if (!biomes || biomes.length === 0) {
        throw new Error('sdTerrain: biomes array cannot be empty');
    }
    const x = p.x;
    const y = p.y;
    const z = p.z;

    // Get terrain height at this XZ position
    const terrainHeight = getTerrainHeight(x, z, biomes);

    // Base terrain distance (simple plane)
    let d = y - terrainHeight;

    // Add overhangs using noise
    const overhangNoise = warpedFbm(x * 0.1, y * 0.1, z * 0.1, 3);
    if (y < terrainHeight && y > terrainHeight - 5) {
        // Create overhangs by pushing surface outward in certain areas
        const overhangStrength = (1 - (terrainHeight - y) / 5) * overhangNoise;
        d -= overhangStrength * 2;
    }

    // Carve out caves
    const caveDist = sdCaves(x, y, z);
    d = opSmoothSubtraction(d, -caveDist, 2);

    return d;
}

/**
 * Rock SDF with irregular shape
 * Optimized to avoid allocations for better performance in tight loops
 */
export function sdRock(p: THREE.Vector3, center: THREE.Vector3, baseRadius: number): number {
    if (baseRadius <= 0) {
        throw new Error('sdRock: baseRadius must be positive');
    }
    const qx = p.x - center.x;
    const qy = p.y - center.y;
    const qz = p.z - center.z;

    // Base sphere
    let d = Math.sqrt(qx * qx + qy * qy + qz * qz) - baseRadius;

    // Add noise displacement for irregular shape
    const displacement =
        fbm(qx * 0.5 + center.x, qy * 0.5 + center.y, qz * 0.5 + center.z, 3) * baseRadius * 0.4;

    d += displacement;

    // Flatten bottom
    d = opSmoothUnion(d, qy + baseRadius * 0.3, 0.3);

    return d;
}

// ============================================================================
// GRADIENT / NORMAL CALCULATION
// ============================================================================

/**
 * Calculate the gradient (normal) of an SDF at a point
 * Uses tetrahedron method from marching.js for better accuracy
 * Optimized to minimize allocations
 */
export function calcNormal(
    p: THREE.Vector3,
    sdfFunc: (p: THREE.Vector3) => number,
    epsilon: number = 0.002
): THREE.Vector3 {
    // Tetrahedron method (from marching.js) - more accurate than central differences
    const v1 = new THREE.Vector3(1.0, -1.0, -1.0).multiplyScalar(epsilon);
    const v2 = new THREE.Vector3(-1.0, -1.0, 1.0).multiplyScalar(epsilon);
    const v3 = new THREE.Vector3(-1.0, 1.0, -1.0).multiplyScalar(epsilon);
    const v4 = new THREE.Vector3(1.0, 1.0, 1.0).multiplyScalar(epsilon);

    const temp = new THREE.Vector3();

    temp.copy(p).add(v1);
    const d1 = sdfFunc(temp);

    temp.copy(p).add(v2);
    const d2 = sdfFunc(temp);

    temp.copy(p).add(v3);
    const d3 = sdfFunc(temp);

    temp.copy(p).add(v4);
    const d4 = sdfFunc(temp);

    // Weighted sum
    const normal = new THREE.Vector3()
        .addScaledVector(v1, d1)
        .addScaledVector(v2, d2)
        .addScaledVector(v3, d3)
        .addScaledVector(v4, d4);

    return normal.normalize();
}
