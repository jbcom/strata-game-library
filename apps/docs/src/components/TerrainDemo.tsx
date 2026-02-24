import { useState, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Noise helpers
// ---------------------------------------------------------------------------

/** Attempt a smooth pseudo-random hash for 2D coordinates. */
function hash2D(x: number, y: number): number {
  let n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  n = n - Math.floor(n);
  return n;
}

/** Hermite interpolation (smooth-step). */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Simple value-noise implementation for 2D. */
function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = smoothstep(fx);
  const sy = smoothstep(fy);

  const n00 = hash2D(ix, iy);
  const n10 = hash2D(ix + 1, iy);
  const n01 = hash2D(ix, iy + 1);
  const n11 = hash2D(ix + 1, iy + 1);

  const nx0 = n00 + (n10 - n00) * sx;
  const nx1 = n01 + (n11 - n01) * sx;
  return nx0 + (nx1 - nx0) * sy;
}

/**
 * Fractal Brownian Motion -- sums several octaves of value-noise to create
 * natural-looking terrain heightfields.
 */
function fbm(x: number, y: number, octaves: number): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxAmplitude = 0;

  for (let i = 0; i < octaves; i++) {
    value += valueNoise(x * frequency, y * frequency) * amplitude;
    maxAmplitude += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return value / maxAmplitude; // normalized to [0, 1]
}

// ---------------------------------------------------------------------------
// Biome color palette
// ---------------------------------------------------------------------------

interface BiomeColor {
  r: number;
  g: number;
  b: number;
}

const BIOME_DEEP_WATER: BiomeColor = { r: 0.04, g: 0.15, b: 0.42 };
const BIOME_SHALLOW_WATER: BiomeColor = { r: 0.07, g: 0.3, b: 0.58 };
const BIOME_SAND: BiomeColor = { r: 0.82, g: 0.75, b: 0.55 };
const BIOME_GRASS: BiomeColor = { r: 0.18, g: 0.52, b: 0.15 };
const BIOME_FOREST: BiomeColor = { r: 0.1, g: 0.38, b: 0.1 };
const BIOME_ROCK: BiomeColor = { r: 0.42, g: 0.38, b: 0.34 };
const BIOME_SNOW: BiomeColor = { r: 0.92, g: 0.94, b: 0.96 };

/** Linearly interpolate between two biome colors. */
function lerpColor(a: BiomeColor, b: BiomeColor, t: number): BiomeColor {
  const clamped = Math.max(0, Math.min(1, t));
  return {
    r: a.r + (b.r - a.r) * clamped,
    g: a.g + (b.g - a.g) * clamped,
    b: a.b + (b.b - a.b) * clamped,
  };
}

/**
 * Map a normalized height (0-1) to a biome color with smooth transitions.
 */
function heightToColor(h: number): BiomeColor {
  if (h < 0.18) {
    return lerpColor(BIOME_DEEP_WATER, BIOME_SHALLOW_WATER, h / 0.18);
  }
  if (h < 0.25) {
    return lerpColor(BIOME_SHALLOW_WATER, BIOME_SAND, (h - 0.18) / 0.07);
  }
  if (h < 0.32) {
    return lerpColor(BIOME_SAND, BIOME_GRASS, (h - 0.25) / 0.07);
  }
  if (h < 0.52) {
    return lerpColor(BIOME_GRASS, BIOME_FOREST, (h - 0.32) / 0.2);
  }
  if (h < 0.7) {
    return lerpColor(BIOME_FOREST, BIOME_ROCK, (h - 0.52) / 0.18);
  }
  return lerpColor(BIOME_ROCK, BIOME_SNOW, (h - 0.7) / 0.3);
}

// ---------------------------------------------------------------------------
// Terrain generation
// ---------------------------------------------------------------------------

interface TerrainData {
  geometry: THREE.PlaneGeometry;
  heightMap: Float32Array;
}

const TERRAIN_SIZE = 48;
const TERRAIN_SEGMENTS = 140;
const HEIGHT_SCALE = 8;
const NOISE_SCALE = 0.065;
const NOISE_OCTAVES = 7;

/**
 * Apply a simple thermal-erosion-like pass: each vertex's height is slightly
 * pulled towards the average of its neighbors, smoothing harsh spikes while
 * preserving the overall shape.
 */
function applyErosion(
  positions: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  segments: number,
  iterations: number,
): void {
  const count = segments + 1;
  for (let iter = 0; iter < iterations; iter++) {
    for (let iy = 1; iy < count - 1; iy++) {
      for (let ix = 1; ix < count - 1; ix++) {
        const idx = iy * count + ix;
        const current = positions.getZ(idx);

        const up = positions.getZ((iy - 1) * count + ix);
        const down = positions.getZ((iy + 1) * count + ix);
        const left = positions.getZ(iy * count + ix - 1);
        const right = positions.getZ(iy * count + ix + 1);
        const avg = (up + down + left + right) / 4;

        // Blend towards average by a small factor
        positions.setZ(idx, current + (avg - current) * 0.25);
      }
    }
  }
}

/**
 * Build the full terrain geometry with heightfield, erosion, and vertex colors.
 */
function buildTerrain(): TerrainData {
  const geo = new THREE.PlaneGeometry(
    TERRAIN_SIZE,
    TERRAIN_SIZE,
    TERRAIN_SEGMENTS,
    TERRAIN_SEGMENTS,
  );

  const positions = geo.attributes.position;
  const vertexCount = positions.count;
  const colorArray = new Float32Array(vertexCount * 3);
  const heightMap = new Float32Array(vertexCount);

  // --- Pass 1: generate raw heightfield ---
  for (let i = 0; i < vertexCount; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);

    // Primary terrain noise
    const rawNoise = fbm(x * NOISE_SCALE, y * NOISE_SCALE, NOISE_OCTAVES);

    // Ridge noise for mountain chains -- fold the noise around 0.5
    const ridgeNoise =
      1 - Math.abs(fbm(x * NOISE_SCALE * 1.3 + 100, y * NOISE_SCALE * 1.3 + 100, 5) - 0.5) * 2;

    // Combine with weighting
    const combined = rawNoise * 0.7 + ridgeNoise * ridgeNoise * 0.3;

    // Radial falloff -- gently pull edges down for an island feel
    const dx = x / (TERRAIN_SIZE * 0.5);
    const dy = y / (TERRAIN_SIZE * 0.5);
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);
    const falloff = Math.max(0, 1 - distFromCenter * distFromCenter * 0.8);

    const height = combined * falloff * HEIGHT_SCALE - HEIGHT_SCALE * 0.15;
    positions.setZ(i, height);
    heightMap[i] = height;
  }

  // --- Pass 2: erosion smoothing ---
  applyErosion(positions, TERRAIN_SEGMENTS, 3);

  // --- Pass 3: compute normalized heights and assign biome colors ---
  let minH = Infinity;
  let maxH = -Infinity;
  for (let i = 0; i < vertexCount; i++) {
    const z = positions.getZ(i);
    if (z < minH) minH = z;
    if (z > maxH) maxH = z;
  }
  const range = maxH - minH || 1;

  for (let i = 0; i < vertexCount; i++) {
    const z = positions.getZ(i);
    const normalized = (z - minH) / range;
    heightMap[i] = z;

    // Small noise to break up biome edges
    const x = positions.getX(i);
    const y = positions.getY(i);
    const colorJitter = (valueNoise(x * 0.8, y * 0.8) - 0.5) * 0.04;

    const color = heightToColor(normalized + colorJitter);
    colorArray[i * 3] = color.r;
    colorArray[i * 3 + 1] = color.g;
    colorArray[i * 3 + 2] = color.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
  geo.computeVertexNormals();

  return { geometry: geo, heightMap };
}

// ---------------------------------------------------------------------------
// React components
// ---------------------------------------------------------------------------

/**
 * The main terrain mesh. Procedurally generated with multi-octave noise,
 * thermal erosion, biome vertex-coloring, and a subtle animation.
 */
function ProceduralTerrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.LineSegments>(null);

  const { geometry } = useMemo(() => buildTerrain(), []);

  // Wireframe overlay geometry
  const wireframeGeo = useMemo(() => {
    return new THREE.WireframeGeometry(geometry);
  }, [geometry]);

  // Gentle undulation -- very slow sinusoidal pitch wobble
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(t * 0.08) * 0.012;
    }
    if (wireRef.current) {
      wireRef.current.rotation.z = Math.sin(t * 0.08) * 0.012;
    }
  });

  return (
    <group rotation={[-Math.PI / 2.3, 0, 0]} position={[0, -3, 0]}>
      {/* Solid terrain */}
      <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.82}
          metalness={0.05}
          flatShading={false}
        />
      </mesh>

      {/* Subtle wireframe overlay for visual texture */}
      <lineSegments ref={wireRef} geometry={wireframeGeo}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.018} />
      </lineSegments>
    </group>
  );
}

/**
 * Animated water surface sitting at a fixed level.
 */
function WaterSurface() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.position.y = -2.1 + Math.sin(t * 0.4) * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.3, 0, 0]} position={[0, -2.1, 0]}>
      <planeGeometry args={[56, 56]} />
      <meshStandardMaterial
        color="#0c6ea8"
        transparent
        opacity={0.55}
        roughness={0.08}
        metalness={0.85}
      />
    </mesh>
  );
}

/**
 * Atmospheric particles drifting slowly through the scene.
 */
function AtmosphericParticles({ count = 300 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = Math.random() * 14 - 4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#a0d8ef"
        transparent
        opacity={0.45}
        sizeAttenuation
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------

/**
 * Interactive 3D terrain demo for the Strata documentation site.
 *
 * Showcases procedural terrain generation with multi-octave noise,
 * thermal erosion, biome-based vertex coloring, animated water, and
 * atmospheric particles -- all rendered with React Three Fiber.
 */
export default function TerrainDemo() {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <div
      className="showcase-demo"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Canvas
        camera={{ position: [18, 12, 18], fov: 45 }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        {/* Lighting */}
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[15, 20, 10]}
          intensity={1.2}
          color="#fff8e7"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight
          position={[-10, 12, -8]}
          intensity={0.25}
          color="#7eb8da"
        />
        <hemisphereLight
          color="#87ceeb"
          groundColor="#3a2f1a"
          intensity={0.2}
        />

        {/* Scene */}
        <ProceduralTerrain />
        <WaterSurface />
        <AtmosphericParticles />

        {/* Depth fog */}
        <fog attach="fog" args={['#0a0f1e', 20, 50]} />

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={isHovered ? 0 : 0.4}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 5}
        />
      </Canvas>

      <div className="showcase-demo-badge">
        Interactive — drag to rotate
      </div>
    </div>
  );
}
