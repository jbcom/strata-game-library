import { useState, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of segments along each axis of the water plane. */
const WATER_SEGMENTS = 120;

/** World-space size of the water plane. */
const WATER_SIZE = 60;

/** Gerstner wave parameters: [amplitude, frequency, speed, directionX, directionZ, steepness]. */
type GerstnerWaveParams = readonly [number, number, number, number, number, number];

const GERSTNER_WAVES: readonly GerstnerWaveParams[] = [
  //  amp   freq   speed   dirX   dirZ   steepness
  [0.35, 0.8, 1.2, 0.6, 0.8, 0.45],
  [0.20, 1.5, 0.9, -0.4, 0.9, 0.35],
  [0.12, 2.4, 1.6, 0.9, -0.3, 0.28],
  [0.08, 3.6, 2.1, -0.7, -0.7, 0.22],
  [0.05, 5.0, 2.8, 0.3, 0.95, 0.18],
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Evaluate cumulative Gerstner wave displacement at a point.
 * Returns the displaced [x, y, z] in-place via the provided output vector.
 */
function evaluateGerstner(
  baseX: number,
  baseZ: number,
  time: number,
  out: THREE.Vector3,
): void {
  let dx = 0;
  let dy = 0;
  let dz = 0;

  for (let w = 0; w < GERSTNER_WAVES.length; w++) {
    const [amp, freq, speed, dirX, dirZ, steepness] = GERSTNER_WAVES[w];
    const dot = dirX * baseX + dirZ * baseZ;
    const phase = freq * dot - speed * time;
    const cosP = Math.cos(phase);
    const sinP = Math.sin(phase);

    dx += steepness * amp * dirX * cosP;
    dy += amp * sinP;
    dz += steepness * amp * dirZ * cosP;
  }

  out.set(baseX + dx, dy, baseZ + dz);
}

// ---------------------------------------------------------------------------
// Ocean Surface
// ---------------------------------------------------------------------------

function OceanSurface() {
  const meshRef = useRef<THREE.Mesh>(null);

  /** Store the original (flat) XZ positions so displacement is always from rest. */
  const basePositions = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      WATER_SIZE,
      WATER_SIZE,
      WATER_SEGMENTS,
      WATER_SEGMENTS,
    );
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position as THREE.BufferAttribute;
    const base = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      base[i * 2] = pos.getX(i);
      base[i * 2 + 1] = pos.getZ(i);
    }

    // Pre-allocate colour buffer
    const colors = new Float32Array(pos.count * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return { geometry: geo, base };
  }, []);

  const tmpVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const geo = mesh.geometry as THREE.BufferGeometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const col = geo.attributes.color as THREE.BufferAttribute;
    const time = state.clock.elapsedTime;

    const { base } = basePositions;

    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 2];
      const bz = base[i * 2 + 1];

      evaluateGerstner(bx, bz, time, tmpVec);

      pos.setXYZ(i, tmpVec.x, tmpVec.y, tmpVec.z);

      // Depth-based colour: peaks are bright cyan with white foam tint,
      // troughs are deep ocean blue.
      const height = tmpVec.y;
      const t = THREE.MathUtils.clamp((height + 0.5) / 1.2, 0, 1);

      // Deep blue -> mid cyan -> white-ish foam
      const deepR = 0.01;
      const deepG = 0.12;
      const deepB = 0.28;
      const midR = 0.04;
      const midG = 0.52;
      const midB = 0.62;
      const foamR = 0.75;
      const foamG = 0.92;
      const foamB = 0.98;

      let r: number;
      let g: number;
      let b: number;

      if (t < 0.5) {
        const s = t / 0.5;
        r = THREE.MathUtils.lerp(deepR, midR, s);
        g = THREE.MathUtils.lerp(deepG, midG, s);
        b = THREE.MathUtils.lerp(deepB, midB, s);
      } else {
        const s = (t - 0.5) / 0.5;
        r = THREE.MathUtils.lerp(midR, foamR, s * s); // quadratic for foam pop
        g = THREE.MathUtils.lerp(midG, foamG, s * s);
        b = THREE.MathUtils.lerp(midB, foamB, s * s);
      }

      col.setXYZ(i, r, g, b);
    }

    pos.needsUpdate = true;
    col.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={basePositions.geometry} receiveShadow>
      <meshPhysicalMaterial
        vertexColors
        transparent
        opacity={0.88}
        roughness={0.18}
        metalness={0.6}
        clearcoat={0.3}
        clearcoatRoughness={0.2}
        envMapIntensity={0.9}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Foam Particles
// ---------------------------------------------------------------------------

interface FoamParticlesProps {
  count?: number;
}

function FoamParticles({ count = 400 }: FoamParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  /** Each particle stores: baseX, baseZ, phase offset, amplitude scale. */
  const particleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const metadata = new Float32Array(count * 4);

    for (let i = 0; i < count; i++) {
      const bx = (Math.random() - 0.5) * WATER_SIZE * 0.85;
      const bz = (Math.random() - 0.5) * WATER_SIZE * 0.85;

      positions[i * 3] = bx;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = bz;

      metadata[i * 4] = bx;
      metadata[i * 4 + 1] = bz;
      metadata[i * 4 + 2] = Math.random() * Math.PI * 2; // phase
      metadata[i * 4 + 3] = 0.7 + Math.random() * 0.6; // amplitude scale
    }

    return { positions, metadata };
  }, [count]);

  const tmpVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const pts = pointsRef.current;
    if (!pts) return;

    const pos = pts.geometry.attributes.position as THREE.BufferAttribute;
    const { metadata } = particleData;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const bx = metadata[i * 4];
      const bz = metadata[i * 4 + 1];
      const phase = metadata[i * 4 + 2];
      const ampScale = metadata[i * 4 + 3];

      evaluateGerstner(bx, bz, time, tmpVec);

      // Lift particles slightly above the surface
      pos.setXYZ(
        i,
        tmpVec.x + Math.sin(time * 0.3 + phase) * 0.08,
        tmpVec.y * ampScale + 0.06,
        tmpVec.z + Math.cos(time * 0.25 + phase) * 0.08,
      );
    }

    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particleData.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#e0f4ff"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Underwater Caustics Plane
// ---------------------------------------------------------------------------

function CausticsPlane() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const mat = mesh.material as THREE.MeshStandardMaterial;
    // Subtle pulsing emissive for faux caustic shimmer
    const t = state.clock.elapsedTime;
    const intensity = 0.12 + Math.sin(t * 1.3) * 0.04 + Math.sin(t * 2.7) * 0.02;
    mat.emissiveIntensity = intensity;
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -3.5, 0]}
      receiveShadow
    >
      <planeGeometry args={[WATER_SIZE * 1.2, WATER_SIZE * 1.2]} />
      <meshStandardMaterial
        color="#061520"
        emissive="#0ea5e9"
        emissiveIntensity={0.12}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Floating Objects
// ---------------------------------------------------------------------------

function FloatingBuoy({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const tmpVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    const time = state.clock.elapsedTime;
    evaluateGerstner(position[0], position[2], time, tmpVec);

    group.position.set(tmpVec.x, tmpVec.y + 0.15, tmpVec.z);

    // Gentle tilt to follow wave slope
    group.rotation.x = Math.sin(time * 0.8 + position[0]) * 0.15;
    group.rotation.z = Math.cos(time * 0.6 + position[2]) * 0.12;
  });

  return (
    <group ref={groupRef}>
      {/* Buoy body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.5, 12]} />
        <meshStandardMaterial color="#e63946" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Buoy top */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.15, 10, 10]} />
        <meshStandardMaterial color="#f1faee" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Light beacon */}
      <pointLight
        position={[0, 0.5, 0]}
        color="#ffb703"
        intensity={0.8}
        distance={4}
        decay={2}
      />
    </group>
  );
}

function FloatingCrate({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tmpVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = state.clock.elapsedTime;
    evaluateGerstner(position[0], position[2], time, tmpVec);

    mesh.position.set(tmpVec.x, tmpVec.y + 0.1, tmpVec.z);
    mesh.rotation.y = time * 0.15 + position[0];
    mesh.rotation.x = Math.sin(time * 0.7 + position[2] * 0.5) * 0.2;
    mesh.rotation.z = Math.cos(time * 0.5 + position[0] * 0.5) * 0.15;
  });

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[0.5, 0.35, 0.5]} />
      <meshStandardMaterial color="#8B6914" roughness={0.9} metalness={0.0} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Sky Dome
// ---------------------------------------------------------------------------

function SkyDome() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { uniforms, vertexShader, fragmentShader } = useMemo(() => {
    return {
      uniforms: {
        uTopColor: { value: new THREE.Color('#0a0e1a') },
        uHorizonColor: { value: new THREE.Color('#1a2744') },
        uSunColor: { value: new THREE.Color('#ff8c42') },
        uSunDirection: { value: new THREE.Vector3(0.7, 0.2, -0.5).normalize() },
      },
      vertexShader: /* glsl */ `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uTopColor;
        uniform vec3 uHorizonColor;
        uniform vec3 uSunColor;
        uniform vec3 uSunDirection;
        varying vec3 vWorldPosition;

        void main() {
          vec3 dir = normalize(vWorldPosition);
          float y = dir.y;

          // Sky gradient: horizon -> top
          float horizonBlend = smoothstep(-0.02, 0.4, y);
          vec3 skyColor = mix(uHorizonColor, uTopColor, horizonBlend);

          // Sun glow near horizon
          float sunDot = max(dot(dir, uSunDirection), 0.0);
          float sunGlow = pow(sunDot, 8.0) * 0.6;
          float sunCore = pow(sunDot, 64.0) * 1.2;
          skyColor += uSunColor * (sunGlow + sunCore);

          // Warm horizon band
          float horizonGlow = exp(-abs(y) * 6.0) * 0.15;
          skyColor += vec3(0.8, 0.4, 0.15) * horizonGlow;

          gl_FragColor = vec4(skyColor, 1.0);
        }
      `,
    };
  }, []);

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[80, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Spray Particles (at wave crests)
// ---------------------------------------------------------------------------

interface SprayParticlesProps {
  count?: number;
}

function SprayParticles({ count = 150 }: SprayParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * WATER_SIZE * 0.6;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * WATER_SIZE * 0.6;
      sizes[i] = 0.02 + Math.random() * 0.04;
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = Math.random() * 0.06 + 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
      lifetimes[i] = Math.random(); // normalized 0..1
    }

    return { positions, sizes, velocities, lifetimes };
  }, [count]);

  const tmpVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const pts = pointsRef.current;
    if (!pts) return;

    const pos = pts.geometry.attributes.position as THREE.BufferAttribute;
    const dt = state.clock.getDelta();
    const time = state.clock.elapsedTime;
    const { velocities, lifetimes } = data;

    for (let i = 0; i < count; i++) {
      lifetimes[i] += dt * (0.4 + Math.sin(i) * 0.1);

      if (lifetimes[i] > 1) {
        // Respawn on the water surface at a wave peak region
        const bx = (Math.random() - 0.5) * WATER_SIZE * 0.5;
        const bz = (Math.random() - 0.5) * WATER_SIZE * 0.5;
        evaluateGerstner(bx, bz, time, tmpVec);

        // Only spawn if the surface height is above a threshold (wave peak)
        if (tmpVec.y > 0.15) {
          pos.setXYZ(i, tmpVec.x, tmpVec.y + 0.1, tmpVec.z);
          velocities[i * 3] = (Math.random() - 0.5) * 0.03;
          velocities[i * 3 + 1] = Math.random() * 0.05 + 0.02;
          velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
          lifetimes[i] = 0;
        } else {
          // Hide below the surface until a peak spawn is possible
          pos.setY(i, -5);
          lifetimes[i] = 0.85; // retry soon
        }
      } else {
        // Animate: rise then fall
        const x = pos.getX(i) + velocities[i * 3];
        const y = pos.getY(i) + velocities[i * 3 + 1] - lifetimes[i] * 0.03;
        const z = pos.getZ(i) + velocities[i * 3 + 2];
        pos.setXYZ(i, x, y, z);
      }
    }

    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={data.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#ffffff"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Sun Disc (glow sphere near horizon)
// ---------------------------------------------------------------------------

function SunDisc() {
  return (
    <Float speed={0.4} rotationIntensity={0} floatIntensity={0.1}>
      <mesh position={[35, 8, -25]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial color="#ffb347" transparent opacity={0.7} />
      </mesh>
      {/* Sun glow halo */}
      <mesh position={[35, 8, -25]}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial color="#ff8c42" transparent opacity={0.12} />
      </mesh>
    </Float>
  );
}

// ---------------------------------------------------------------------------
// Scene (assembled inside Canvas)
// ---------------------------------------------------------------------------

interface SceneProps {
  isHovered: boolean;
}

function Scene({ isHovered }: SceneProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.25} color="#8cb4d4" />
      <directionalLight
        position={[30, 12, -20]}
        intensity={1.8}
        color="#ffcc80"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-10, 8, 10]} intensity={0.3} color="#4da6c9" />

      {/* Environment */}
      <SkyDome />
      <SunDisc />
      <fog attach="fog" args={['#111d33', 25, 65]} />

      {/* Water */}
      <OceanSurface />
      <FoamParticles count={400} />
      <SprayParticles count={150} />

      {/* Sea floor hint */}
      <CausticsPlane />

      {/* Floating objects */}
      <FloatingBuoy position={[4, 0, 3]} />
      <FloatingBuoy position={[-6, 0, -5]} />
      <FloatingCrate position={[2, 0, -4]} />
      <FloatingCrate position={[-3, 0, 6]} />

      {/* Camera controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={isHovered ? 0 : 0.4}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 5}
        target={[0, -0.5, 0]}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

/**
 * Interactive 3D ocean water demo for the Strata documentation site.
 *
 * Showcases Gerstner wave animation, depth-based colouring, foam particles,
 * spray effects, floating objects, and a golden-hour sky dome with fog blending.
 */
export default function WaterDemo() {
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
        camera={{ position: [14, 7, 14], fov: 50, near: 0.1, far: 150 }}
        dpr={[1, 1.5]}
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ background: '#0a0e1a' }}
      >
        <Scene isHovered={isHovered} />
      </Canvas>
      <div className="showcase-demo-badge">Interactive — drag to rotate</div>
    </div>
  );
}
