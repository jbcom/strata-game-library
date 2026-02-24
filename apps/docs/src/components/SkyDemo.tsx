import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';

/** Speed of the day/night cycle. A full revolution takes ~35 seconds. */
const CYCLE_SPEED = 0.18;

/** Radius of the sun's orbital path. */
const SUN_ORBIT_RADIUS = 100;

/** Number of volumetric atmosphere particles. */
const PARTICLE_COUNT = 300;

/* -------------------------------------------------------------------------- */
/*  Color helpers                                                             */
/* -------------------------------------------------------------------------- */

const DAY_FOG = new THREE.Color('#87ceeb');
const SUNSET_FOG = new THREE.Color('#e8734a');
const NIGHT_FOG = new THREE.Color('#0b0d1a');
const DAWN_FOG = new THREE.Color('#c97b5e');

const DAY_AMBIENT = new THREE.Color('#b0d4f1');
const NIGHT_AMBIENT = new THREE.Color('#111122');

const DAY_DIRECTIONAL = new THREE.Color('#fff5e6');
const SUNSET_DIRECTIONAL = new THREE.Color('#ff8844');
const NIGHT_DIRECTIONAL = new THREE.Color('#223355');

/**
 * Compute a blended fog color based on the sun's vertical position.
 * The sun's y-coordinate is normalised to [-1, 1] where positive = daytime.
 */
function computeFogColor(sunY: number): THREE.Color {
  const normalized = THREE.MathUtils.clamp(sunY / SUN_ORBIT_RADIUS, -1, 1);

  if (normalized > 0.3) {
    // Daytime
    return DAY_FOG;
  } else if (normalized > 0.0) {
    // Sunrise / sunset band
    const t = normalized / 0.3;
    return new THREE.Color().lerpColors(SUNSET_FOG, DAY_FOG, t);
  } else if (normalized > -0.2) {
    // Dusk / dawn twilight
    const t = (normalized + 0.2) / 0.2;
    return new THREE.Color().lerpColors(NIGHT_FOG, DAWN_FOG, t);
  }
  // Night
  return NIGHT_FOG;
}

function computeAmbientColor(sunY: number): THREE.Color {
  const t = THREE.MathUtils.clamp(sunY / SUN_ORBIT_RADIUS, 0, 1);
  return new THREE.Color().lerpColors(NIGHT_AMBIENT, DAY_AMBIENT, t);
}

function computeDirectionalColor(sunY: number): THREE.Color {
  const normalized = THREE.MathUtils.clamp(sunY / SUN_ORBIT_RADIUS, -1, 1);
  if (normalized > 0.25) return DAY_DIRECTIONAL;
  if (normalized > 0) {
    const t = normalized / 0.25;
    return new THREE.Color().lerpColors(SUNSET_DIRECTIONAL, DAY_DIRECTIONAL, t);
  }
  const t = THREE.MathUtils.clamp((normalized + 0.3) / 0.3, 0, 1);
  return new THREE.Color().lerpColors(NIGHT_DIRECTIONAL, SUNSET_DIRECTIONAL, t);
}

/* -------------------------------------------------------------------------- */
/*  Animated atmosphere — fog + lights that react to the sun                  */
/* -------------------------------------------------------------------------- */

function Atmosphere() {
  const fogRef = useRef<THREE.Fog>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const sunY = Math.sin(time * CYCLE_SPEED) * SUN_ORBIT_RADIUS;

    if (fogRef.current) {
      fogRef.current.color.copy(computeFogColor(sunY));
      // Pull fog closer at night for depth
      const nightFactor = THREE.MathUtils.clamp(1 - sunY / SUN_ORBIT_RADIUS, 0.5, 1);
      fogRef.current.near = 10 + nightFactor * 5;
      fogRef.current.far = 60 - nightFactor * 15;
    }

    if (ambientRef.current) {
      ambientRef.current.color.copy(computeAmbientColor(sunY));
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        0.08,
        0.6,
        THREE.MathUtils.clamp(sunY / SUN_ORBIT_RADIUS, 0, 1),
      );
    }

    if (directionalRef.current) {
      directionalRef.current.color.copy(computeDirectionalColor(sunY));
      directionalRef.current.intensity = THREE.MathUtils.lerp(
        0.05,
        1.2,
        THREE.MathUtils.clamp(sunY / SUN_ORBIT_RADIUS + 0.1, 0, 1),
      );
      // Keep the directional light aligned with the sun
      const sunX = Math.cos(time * CYCLE_SPEED) * SUN_ORBIT_RADIUS;
      directionalRef.current.position.set(sunX, Math.max(sunY, 5), 0);
    }
  });

  return (
    <>
      <fog ref={fogRef} attach="fog" args={['#87ceeb', 15, 55]} />
      <ambientLight ref={ambientRef} intensity={0.5} />
      <directionalLight ref={directionalRef} position={[100, 100, 0]} intensity={1} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Animated sky dome that follows the day/night cycle                        */
/* -------------------------------------------------------------------------- */

function AnimatedSky() {
  const skyRef = useRef<typeof Sky>(null);
  const [sunPosition, setSunPosition] = useState<[number, number, number]>([100, 100, 0]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const x = Math.cos(time * CYCLE_SPEED) * SUN_ORBIT_RADIUS;
    const y = Math.sin(time * CYCLE_SPEED) * SUN_ORBIT_RADIUS;
    setSunPosition([x, y, 0]);
  });

  return (
    <Sky
      ref={skyRef as never}
      sunPosition={sunPosition}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
      rayleigh={2}
      turbidity={8}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Stars that fade in at night                                               */
/* -------------------------------------------------------------------------- */

function NightStars() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    const sunY = Math.sin(time * CYCLE_SPEED) * SUN_ORBIT_RADIUS;

    // Fade stars in when sun dips below horizon, fully visible at sunY = -30
    const starOpacity = THREE.MathUtils.clamp(-sunY / 30, 0, 1);
    groupRef.current.visible = starOpacity > 0.01;

    // Animate material opacity on child meshes
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Points) {
        const material = child.material as THREE.PointsMaterial;
        material.opacity = starOpacity;
        material.transparent = true;
      }
    });

    // Slow stellar rotation
    groupRef.current.rotation.y = time * 0.005;
  });

  return (
    <group ref={groupRef}>
      <Stars radius={200} depth={80} count={4000} factor={4} saturation={0.2} fade speed={0.5} />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ground terrain silhouette                                                 */
/* -------------------------------------------------------------------------- */

function GroundTerrain() {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const size = 120;
    const segments = 64;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const positions = geo.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getY(i);

      // Gentle rolling hills with a distant mountain ridge
      let height = 0;
      height += Math.sin(x * 0.08) * Math.cos(z * 0.06) * 3;
      height += Math.sin(x * 0.15 + 1.5) * Math.cos(z * 0.12 + 0.8) * 1.5;
      height += Math.sin(x * 0.3 + 0.3) * Math.cos(z * 0.25 + 2.0) * 0.6;

      // Push edges down to avoid visible seams
      const distFromCenter = Math.sqrt(x * x + z * z) / (size * 0.5);
      const edgeFade = THREE.MathUtils.smoothstep(distFromCenter, 0.6, 1.0);
      height *= 1 - edgeFade;
      height -= edgeFade * 2;

      positions.setZ(i, height);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -5, 0]}
      receiveShadow
    >
      <meshStandardMaterial color="#1a1a2e" roughness={0.95} metalness={0.0} />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Volumetric atmosphere particles (floating dust / mist)                    */
/* -------------------------------------------------------------------------- */

function VolumetricParticles({ count = PARTICLE_COUNT }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const posArray = new Float32Array(count * 3);
    const sizeArray = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute in a wide area around the camera
      posArray[i * 3] = (Math.random() - 0.5) * 80;
      posArray[i * 3 + 1] = Math.random() * 25 - 3;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 80;

      sizeArray[i] = Math.random() * 0.15 + 0.03;
    }

    return { positions: posArray, sizes: sizeArray };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.elapsedTime;
    const sunY = Math.sin(time * CYCLE_SPEED) * SUN_ORBIT_RADIUS;

    // Drift particles slowly
    pointsRef.current.rotation.y = time * 0.008;
    pointsRef.current.position.y = Math.sin(time * 0.15) * 0.5;

    // Tint particles based on time of day
    const material = pointsRef.current.material as THREE.PointsMaterial;
    const normalizedSunY = THREE.MathUtils.clamp(sunY / SUN_ORBIT_RADIUS, -1, 1);

    if (normalizedSunY > 0.2) {
      material.color.setHex(0xddddff); // Day: pale blue mist
    } else if (normalizedSunY > -0.05) {
      material.color.setHex(0xffaa66); // Sunset: amber dust
    } else {
      material.color.setHex(0x334466); // Night: dark blue
    }

    material.opacity = THREE.MathUtils.lerp(
      0.15,
      0.4,
      THREE.MathUtils.clamp(normalizedSunY + 0.5, 0, 1),
    );
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#ddddff"
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main exported component                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Interactive sky and atmosphere demo for the Strata documentation site.
 *
 * Features:
 * - Animated day/night cycle with procedural sky
 * - Atmospheric scattering via drei's Sky component
 * - Stars that fade in at night
 * - Dynamic fog tinted by time of day
 * - Volumetric-style floating particles
 * - Dark terrain silhouette for context
 * - OrbitControls with auto-rotate (pauses on hover)
 */
export default function SkyDemo() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="showcase-demo"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 8, 35], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0b0d1a' }}
      >
        <Atmosphere />
        <AnimatedSky />
        <NightStars />
        <GroundTerrain />
        <VolumetricParticles />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={isHovered ? 0 : 0.3}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>
      <div className="showcase-demo-badge">Interactive — drag to rotate</div>
    </div>
  );
}
