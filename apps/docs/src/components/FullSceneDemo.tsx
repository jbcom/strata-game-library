import { useState, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Terrain grid dimensions in world units. */
const TERRAIN_SIZE = 40;

/** Number of subdivision segments along each terrain axis. */
const TERRAIN_SEGMENTS = 80;

/** Water surface elevation (world-space Y). */
const WATER_LEVEL = -0.6;

/** Height above which snow biome begins (normalised 0-1). */
const SNOW_THRESHOLD = 0.78;

/** Height below which terrain is considered submerged (normalised 0-1). */
const WATER_THRESHOLD = 0.3;

/** Maximum grass blade instances to place on the terrain. */
const MAX_GRASS_INSTANCES = 3000;

/** Number of atmospheric particle sprites. */
const PARTICLE_COUNT = 300;

/** Sun position vector for golden-hour lighting. */
const SUN_POSITION = new THREE.Vector3(100, 30, 50);

/** Warm sky/fog colour derived from golden-hour palette. */
const SKY_COLOR = '#f5deb3';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Multi-octave sinusoidal terrain noise.
 * Returns a height value roughly in the range [-3.5, 3.5].
 */
function terrainNoise(x: number, z: number): number {
  let h = 0;
  h += Math.sin(x * 0.3) * Math.cos(z * 0.3) * 2.0;
  h += Math.sin(x * 0.7 + 1.3) * Math.cos(z * 0.5 + 0.7) * 1.0;
  h += Math.sin(x * 1.5 + 2.1) * Math.cos(z * 1.2 + 1.4) * 0.5;
  h += Math.sin(x * 3.0 + 0.8) * Math.cos(z * 2.8 + 0.5) * 0.2;
  return h;
}

/**
 * Normalise a raw terrain height into [0, 1] for biome classification.
 */
function normaliseHeight(rawHeight: number): number {
  return (rawHeight + 3.7) / 7.4;
}

/**
 * Deterministic pseudo-random number from two integers (Mulberry32-style).
 * Returns a value in [0, 1).
 */
function seededRandom(a: number, b: number): number {
  let seed = (a * 73856093) ^ (b * 19349663);
  seed = ((seed >> 16) ^ seed) * 0x45d9f3b;
  seed = ((seed >> 16) ^ seed) * 0x45d9f3b;
  seed = (seed >> 16) ^ seed;
  return (seed & 0x7fffffff) / 0x7fffffff;
}

// ---------------------------------------------------------------------------
// Terrain
// ---------------------------------------------------------------------------

interface TerrainData {
  geometry: THREE.PlaneGeometry;
  /** Per-vertex positions after displacement (already set on geometry). */
  positions: THREE.BufferAttribute;
}

/**
 * Procedural terrain mesh with vertex-colour biome zones.
 *
 * Uses a rotated PlaneGeometry (face-up) with sinusoidal multi-octave height
 * displacement and per-vertex colours that transition through water, sand,
 * grass, rock, and snow biomes.
 */
function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);

  const terrainData = useMemo<TerrainData>(() => {
    const geo = new THREE.PlaneGeometry(
      TERRAIN_SIZE,
      TERRAIN_SIZE,
      TERRAIN_SEGMENTS,
      TERRAIN_SEGMENTS,
    );

    const positions = geo.attributes.position as THREE.BufferAttribute;
    const vertexCount = positions.count;
    const colorArray = new Float32Array(vertexCount * 3);

    for (let i = 0; i < vertexCount; i++) {
      const x = positions.getX(i);
      const z = positions.getY(i); // PlaneGeometry lies in XY; we rotate later

      const height = terrainNoise(x, z);
      positions.setZ(i, height);

      // Biome colouring ---------------------------------------------------
      const n = normaliseHeight(height);

      let r: number;
      let g: number;
      let b: number;

      if (n < 0.2) {
        // Deep water bed
        r = 0.08;
        g = 0.28;
        b = 0.48;
      } else if (n < WATER_THRESHOLD) {
        // Shallow / sand
        const t = (n - 0.2) / 0.1;
        r = 0.08 + t * 0.68;
        g = 0.28 + t * 0.42;
        b = 0.48 - t * 0.05;
      } else if (n < 0.42) {
        // Beach / sand
        r = 0.76;
        g = 0.7;
        b = 0.5;
      } else if (n < 0.65) {
        // Grass / vegetation
        const t = (n - 0.42) / 0.23;
        r = 0.18 + t * 0.05;
        g = 0.52 + t * 0.13;
        b = 0.14 + t * 0.04;
      } else if (n < SNOW_THRESHOLD) {
        // Rock
        const t = (n - 0.65) / 0.13;
        r = 0.35 + t * 0.15;
        g = 0.33 + t * 0.12;
        b = 0.28 + t * 0.12;
      } else {
        // Snow / peaks
        const t = Math.min((n - SNOW_THRESHOLD) / 0.22, 1);
        r = 0.7 + t * 0.25;
        g = 0.68 + t * 0.27;
        b = 0.65 + t * 0.3;
      }

      colorArray[i * 3] = r;
      colorArray[i * 3 + 1] = g;
      colorArray[i * 3 + 2] = b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    geo.computeVertexNormals();

    return { geometry: geo, positions };
  }, []);

  // Gentle ambient sway
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.08) * 0.012;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={terrainData.geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -2, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        vertexColors
        roughness={0.85}
        metalness={0.05}
        flatShading={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Water
// ---------------------------------------------------------------------------

/**
 * Transparent animated water surface.
 *
 * A simple flat PlaneGeometry positioned at WATER_LEVEL, tinted a translucent
 * blue-green, with a gentle vertical oscillation.
 */
function Water() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.position.y =
        WATER_LEVEL - 2 + Math.sin(t * 0.4) * 0.06;
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, WATER_LEVEL - 2, 0]}
    >
      <planeGeometry args={[TERRAIN_SIZE + 10, TERRAIN_SIZE + 10]} />
      <meshStandardMaterial
        color="#1a8faa"
        transparent
        opacity={0.55}
        roughness={0.05}
        metalness={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Grass / Vegetation
// ---------------------------------------------------------------------------

/** Per-instance transform helper reused during placement. */
const _matrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _euler = new THREE.Euler();

interface GrassPlacement {
  positions: Float32Array;
  count: number;
}

/**
 * Collect valid placement positions from terrain vertex data.
 * A vertex is eligible if its normalised height is above water and below snow.
 */
function collectGrassPositions(): GrassPlacement {
  const halfSize = TERRAIN_SIZE / 2;
  const step = TERRAIN_SIZE / TERRAIN_SEGMENTS;
  const candidates: number[] = [];

  for (let ix = 0; ix <= TERRAIN_SEGMENTS; ix++) {
    for (let iz = 0; iz <= TERRAIN_SEGMENTS; iz++) {
      const x = -halfSize + ix * step;
      const z = -halfSize + iz * step;
      const h = terrainNoise(x, z);
      const n = normaliseHeight(h);

      if (n > WATER_THRESHOLD + 0.08 && n < SNOW_THRESHOLD - 0.06) {
        // Use seeded random to decide whether to keep this candidate
        if (seededRandom(ix, iz) < 0.5) {
          candidates.push(x, h, z);
        }
      }
    }
  }

  // Cap to MAX_GRASS_INSTANCES
  const usableCount = Math.min(
    Math.floor(candidates.length / 3),
    MAX_GRASS_INSTANCES,
  );
  const positions = new Float32Array(usableCount * 3);

  for (let i = 0; i < usableCount * 3; i++) {
    positions[i] = candidates[i];
  }

  return { positions, count: usableCount };
}

/**
 * Instanced grass blades scattered across the mid-elevation terrain.
 *
 * Each blade is a thin tapered triangle with a slight random tilt and scale
 * variation. Wind is simulated by oscillating each instance's rotation per
 * frame based on its world-space position.
 */
function Grass() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { bladeGeometry, placement } = useMemo(() => {
    // Blade geometry: a simple tapered triangle
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -0.04, 0, 0,    // base left
       0.04, 0, 0,    // base right
       0.0,  0.35, 0, // tip
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();

    const pl = collectGrassPositions();

    return { bladeGeometry: geo, placement: pl };
  }, []);

  // Set initial instance transforms
  useMemo(() => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    for (let i = 0; i < placement.count; i++) {
      const x = placement.positions[i * 3];
      const h = placement.positions[i * 3 + 1];
      const z = placement.positions[i * 3 + 2];

      const yRot = seededRandom(i, i + 7) * Math.PI * 2;
      const tilt = (seededRandom(i + 3, i + 11) - 0.5) * 0.3;
      const scaleY = 0.7 + seededRandom(i + 5, i + 13) * 0.6;

      _position.set(x, h - 2, -z); // z is negated because terrain rotates
      _euler.set(tilt, yRot, 0);
      _quaternion.setFromEuler(_euler);
      _scale.set(1, scaleY, 1);
      _matrix.compose(_position, _quaternion, _scale);

      mesh.setMatrixAt(i, _matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placement]);

  // Wind animation
  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = state.clock.elapsedTime;

    for (let i = 0; i < placement.count; i++) {
      const x = placement.positions[i * 3];
      const h = placement.positions[i * 3 + 1];
      const z = placement.positions[i * 3 + 2];

      const windStrength =
        Math.sin(time * 1.5 + x * 0.8) * 0.15 +
        Math.sin(time * 2.3 + z * 0.6) * 0.08;

      const yRot = seededRandom(i, i + 7) * Math.PI * 2;
      const tilt = (seededRandom(i + 3, i + 11) - 0.5) * 0.3 + windStrength;
      const scaleY = 0.7 + seededRandom(i + 5, i + 13) * 0.6;

      _position.set(x, h - 2, -z);
      _euler.set(tilt, yRot, 0);
      _quaternion.setFromEuler(_euler);
      _scale.set(1, scaleY, 1);
      _matrix.compose(_position, _quaternion, _scale);

      mesh.setMatrixAt(i, _matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[bladeGeometry, undefined, placement.count]}
      frustumCulled={false}
    >
      <meshStandardMaterial
        color="#3a7d2c"
        roughness={0.8}
        metalness={0.0}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// Atmospheric Particles
// ---------------------------------------------------------------------------

/**
 * Floating atmospheric particles (dust / fireflies) that slowly orbit the
 * scene.  Rendered as a single Points object for minimal draw-call overhead.
 */
function AtmosphericParticles({ count = PARTICLE_COUNT }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (seededRandom(i, 0) - 0.5) * 36;
      arr[i * 3 + 1] = seededRandom(i, 1) * 12 - 3;
      arr[i * 3 + 2] = (seededRandom(i, 2) - 0.5) * 36;
    }
    return arr;
  }, [count]);

  const sizes = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = 0.03 + seededRandom(i, 3) * 0.06;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
      pointsRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.05) * 0.02;
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
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#ffe4b5"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Lighting Rig
// ---------------------------------------------------------------------------

/**
 * Golden-hour directional and ambient lights, positioned to match the Sky's
 * sun angle.
 */
function GoldenHourLighting() {
  return (
    <>
      {/* Key light (sun direction) */}
      <directionalLight
        position={[100, 30, 50]}
        intensity={1.8}
        color="#fff0d4"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={80}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      {/* Fill light from opposite side */}
      <directionalLight
        position={[-60, 20, -40]}
        intensity={0.35}
        color="#93c5fd"
      />
      {/* Warm ambient base */}
      <ambientLight intensity={0.45} color="#ffecd2" />
      {/* Hemisphere light for sky-ground colour bleed */}
      <hemisphereLight
        args={['#fdb97d', '#3a6b35', 0.3]}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Scene (inner Canvas contents)
// ---------------------------------------------------------------------------

/**
 * All 3D content composed together.  Separated so that the Canvas provider
 * boundary is clear.
 */
function Scene({ autoRotateSpeed }: { autoRotateSpeed: number }) {
  return (
    <>
      <GoldenHourLighting />

      {/* Sky dome */}
      <Sky
        sunPosition={SUN_POSITION}
        turbidity={8}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Depth fog matching golden-hour sky colour */}
      <fog attach="fog" args={[SKY_COLOR, 25, 55]} />

      {/* Terrain */}
      <Terrain />

      {/* Water */}
      <Water />

      {/* Vegetation */}
      <Grass />

      {/* Atmospheric particles */}
      <AtmosphericParticles />

      {/* Camera controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={autoRotateSpeed}
        maxPolarAngle={Math.PI / 2.3}
        minPolarAngle={Math.PI / 5}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Exported Component
// ---------------------------------------------------------------------------

/**
 * Full-scene demo for the Strata documentation site.
 *
 * Combines procedural terrain, animated water, instanced grass with wind,
 * golden-hour sky and lighting, and floating atmospheric particles into a
 * single cohesive miniature world.
 *
 * The scene auto-rotates until the user hovers / drags, then resumes when
 * the pointer leaves.
 */
export default function FullSceneDemo() {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const autoRotateSpeed = isHovered ? 0 : 0.4;

  return (
    <div
      className="showcase-demo"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Canvas
        camera={{ position: [15, 10, 15], fov: 45 }}
        dpr={[1, 1.5]}
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ background: '#e8d5b7' }}
      >
        <Scene autoRotateSpeed={autoRotateSpeed} />
      </Canvas>
      <div className="showcase-demo-badge">
        Interactive — drag to rotate
      </div>
    </div>
  );
}
