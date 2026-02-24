import { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRASS_COUNT = 6000;
const TREE_COUNT = 25;
const ROCK_COUNT = 18;

const FIELD_RADIUS = 14;
const TREE_INNER_RADIUS = 8;
const TREE_OUTER_RADIUS = 13;

/** Seeded-ish deterministic random for reproducible layouts. */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ---------------------------------------------------------------------------
// Ground
// ---------------------------------------------------------------------------

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <circleGeometry args={[FIELD_RADIUS + 2, 64]} />
      <meshStandardMaterial color="#3a5a20" roughness={0.95} metalness={0.0} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Grass (GPU-instanced)
// ---------------------------------------------------------------------------

interface GrassInstance {
  x: number;
  z: number;
  height: number;
  rotationY: number;
  colorOffset: number;
}

function useGrassInstances(count: number): GrassInstance[] {
  return useMemo(() => {
    const instances: GrassInstance[] = [];
    for (let i = 0; i < count; i++) {
      const angle = seededRandom(i * 2) * Math.PI * 2;
      const radius = Math.sqrt(seededRandom(i * 2 + 1)) * FIELD_RADIUS;
      instances.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        height: 0.25 + seededRandom(i * 3 + 7) * 0.35,
        rotationY: seededRandom(i * 5 + 13) * Math.PI * 2,
        colorOffset: seededRandom(i * 7 + 19) * 0.15 - 0.075,
      });
    }
    return instances;
  }, [count]);
}

function GrassField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const instances = useGrassInstances(GRASS_COUNT);

  /** A single grass blade: a narrow triangle tapering to a point. */
  const bladeGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const halfWidth = 0.025;
    // Three vertices: bottom-left, bottom-right, top-center
    const vertices = new Float32Array([
      -halfWidth, 0, 0,
       halfWidth, 0, 0,
       0, 1, 0,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  /** Pre-computed base transforms (position + static rotation + scale). */
  const baseMatrices = useMemo(() => {
    const dummy = new THREE.Object3D();
    const matrices = new Float32Array(GRASS_COUNT * 16);
    const tempMatrix = new THREE.Matrix4();

    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      dummy.position.set(inst.x, 0, inst.z);
      dummy.rotation.set(0, inst.rotationY, 0);
      dummy.scale.set(1, inst.height / 0.5, 1); // normalize to blade height
      dummy.updateMatrix();
      tempMatrix.copy(dummy.matrix);
      tempMatrix.toArray(matrices, i * 16);
    }
    return matrices;
  }, [instances]);

  /** Set per-instance colors on mount. */
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const color = new THREE.Color();
    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      const g = 0.45 + inst.colorOffset;
      color.setRGB(0.18 + inst.colorOffset * 0.5, g, 0.08);
      mesh.setColorAt(i, color);
    }
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [instances]);

  /** Animate wind: tilt each blade based on world position + time. */
  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();
    const baseMatrix = new THREE.Matrix4();

    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];

      // Wind wave: sine based on position offset + time
      const windStrength =
        Math.sin(inst.x * 0.5 + time * 1.8) * 0.15 +
        Math.sin(inst.z * 0.3 + time * 1.2) * 0.1 +
        Math.sin((inst.x + inst.z) * 0.8 + time * 2.5) * 0.05;

      // Reconstruct transform from base, then apply wind tilt on Z axis
      baseMatrix.fromArray(baseMatrices, i * 16);
      dummy.matrix.copy(baseMatrix);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

      // Apply wind as a lean on the local X axis (forward/back sway)
      dummy.rotation.setFromQuaternion(dummy.quaternion);
      dummy.rotation.x += windStrength;
      dummy.rotation.z += windStrength * 0.3;

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[bladeGeometry, undefined, GRASS_COUNT]}
      frustumCulled={false}
    >
      <meshStandardMaterial
        color="#4a7c2e"
        roughness={0.8}
        metalness={0.0}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// Trees (individual mesh groups with randomized placement)
// ---------------------------------------------------------------------------

interface TreeData {
  x: number;
  z: number;
  scale: number;
  rotationY: number;
  trunkHeight: number;
  canopyRadius: number;
  canopyHeight: number;
  trunkColor: string;
  canopyColor: string;
}

function useTrees(count: number): TreeData[] {
  return useMemo(() => {
    const trees: TreeData[] = [];
    for (let i = 0; i < count; i++) {
      const angle = seededRandom(i * 11 + 100) * Math.PI * 2;
      const radius =
        TREE_INNER_RADIUS +
        seededRandom(i * 13 + 200) * (TREE_OUTER_RADIUS - TREE_INNER_RADIUS);
      const scale = 0.7 + seededRandom(i * 17 + 300) * 0.6;

      // Slight color variation per tree
      const greenVal = Math.round(80 + seededRandom(i * 19 + 400) * 50);
      const brownR = Math.round(90 + seededRandom(i * 23 + 500) * 30);
      const brownG = Math.round(55 + seededRandom(i * 29 + 600) * 20);

      trees.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        scale,
        rotationY: seededRandom(i * 31 + 700) * Math.PI * 2,
        trunkHeight: 0.8 + seededRandom(i * 37 + 800) * 0.4,
        canopyRadius: 0.6 + seededRandom(i * 41 + 900) * 0.4,
        canopyHeight: 1.2 + seededRandom(i * 43 + 1000) * 0.6,
        trunkColor: `rgb(${brownR}, ${brownG}, 28)`,
        canopyColor: `rgb(38, ${greenVal}, 28)`,
      });
    }
    return trees;
  }, [count]);
}

function Tree({ data }: { data: TreeData }) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group
      ref={groupRef}
      position={[data.x, 0, data.z]}
      rotation={[0, data.rotationY, 0]}
      scale={data.scale}
    >
      {/* Trunk */}
      <mesh position={[0, data.trunkHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, data.trunkHeight, 6]} />
        <meshStandardMaterial color={data.trunkColor} roughness={0.9} />
      </mesh>
      {/* Canopy */}
      <mesh position={[0, data.trunkHeight + data.canopyHeight * 0.35, 0]} castShadow>
        <coneGeometry args={[data.canopyRadius, data.canopyHeight, 7]} />
        <meshStandardMaterial color={data.canopyColor} roughness={0.85} metalness={0.0} />
      </mesh>
    </group>
  );
}

function Trees() {
  const trees = useTrees(TREE_COUNT);
  return (
    <>
      {trees.map((tree, i) => (
        <Tree key={i} data={tree} />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Rocks (GPU-instanced low-poly icosahedra)
// ---------------------------------------------------------------------------

interface RockData {
  x: number;
  z: number;
  scale: [number, number, number];
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  colorShift: number;
}

function useRocks(count: number): RockData[] {
  return useMemo(() => {
    const rocks: RockData[] = [];
    for (let i = 0; i < count; i++) {
      const angle = seededRandom(i * 53 + 2000) * Math.PI * 2;
      const radius = Math.sqrt(seededRandom(i * 59 + 2100)) * FIELD_RADIUS * 0.85;
      const baseScale = 0.15 + seededRandom(i * 61 + 2200) * 0.35;

      rocks.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        scale: [
          baseScale * (0.8 + seededRandom(i * 67 + 2300) * 0.5),
          baseScale * (0.6 + seededRandom(i * 71 + 2400) * 0.4),
          baseScale * (0.8 + seededRandom(i * 73 + 2500) * 0.5),
        ],
        rotationX: seededRandom(i * 79 + 2600) * Math.PI * 2,
        rotationY: seededRandom(i * 83 + 2700) * Math.PI * 2,
        rotationZ: seededRandom(i * 89 + 2800) * 0.4,
        colorShift: seededRandom(i * 97 + 2900) * 0.12 - 0.06,
      });
    }
    return rocks;
  }, [count]);
}

function Rocks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const rocks = useRocks(ROCK_COUNT);

  const rockGeometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(1, 0);
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < rocks.length; i++) {
      const rock = rocks[i];
      dummy.position.set(rock.x, rock.scale[1] * 0.3, rock.z);
      dummy.rotation.set(rock.rotationX, rock.rotationY, rock.rotationZ);
      dummy.scale.set(...rock.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const grey = 0.45 + rock.colorShift;
      color.setRGB(grey, grey - 0.02, grey - 0.04);
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [rocks]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[rockGeometry, undefined, ROCK_COUNT]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color="#7a7a72"
        roughness={0.92}
        metalness={0.05}
      />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// Scene (combines all elements inside the Canvas)
// ---------------------------------------------------------------------------

function Scene({ isHovered }: { isHovered: boolean }) {
  return (
    <>
      {/* Lighting -- warm afternoon sun */}
      <ambientLight intensity={0.35} color="#ffeedd" />
      <directionalLight
        position={[8, 12, 4]}
        intensity={1.4}
        color="#fff0d4"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={40}
        shadow-camera-near={0.5}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      {/* Fill light from opposite side */}
      <directionalLight position={[-6, 5, -8]} intensity={0.25} color="#b0c4de" />
      {/* Subtle hemisphere light for sky/ground bounce */}
      <hemisphereLight args={['#87ceeb', '#3a5a20', 0.3]} />

      {/* Fog for atmospheric depth */}
      <fog attach="fog" args={['#c8dbb0', 18, 38]} />

      {/* Scene objects */}
      <Ground />
      <GrassField />
      <Trees />
      <Rocks />

      {/* Controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={isHovered ? 0 : 0.4}
        maxPolarAngle={Math.PI / 2.3}
        minPolarAngle={Math.PI / 5}
        target={[0, 0.5, 0]}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Exported component
// ---------------------------------------------------------------------------

/**
 * Interactive 3D vegetation demo for the Strata documentation site.
 *
 * Renders a grassy field with GPU-instanced grass blades (wind-animated),
 * low-poly trees, and scattered rocks under warm afternoon lighting.
 */
export default function VegetationDemo() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="showcase-demo"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Canvas
        camera={{ position: [10, 6, 10], fov: 45 }}
        dpr={[1, 1.5]}
        shadows
        style={{ background: 'linear-gradient(to bottom, #87ceeb, #c8dbb0)' }}
        gl={{ antialias: true }}
      >
        <Scene isHovered={isHovered} />
      </Canvas>
      <div className="showcase-demo-badge">Interactive — drag to rotate</div>
    </div>
  );
}
