import { ProceduralSky } from '@jbcom/strata';
import { OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { folder, useControls } from 'leva';

/**
 * Sky & Volumetrics Showcase
 *
 * Demonstrates procedural sky system with:
 * - Day/night cycle simulation
 * - Dynamic sun positioning
 * - Star visibility at night
 * - Fog density controls
 * - Weather effects
 */

function Scene() {
  const { sunAngle, sunIntensity, ambientLight, starVisibility, fogDensity, weatherIntensity } =
    useControls({
      'Time of Day': folder({
        sunAngle: {
          value: 60,
          min: 0,
          max: 180,
          step: 1,
          label: 'Sun Angle (°)',
        },
        sunIntensity: { value: 1.0, min: 0, max: 1, step: 0.01, label: 'Sun Intensity' },
        ambientLight: { value: 0.8, min: 0, max: 1, step: 0.01, label: 'Ambient Light' },
        starVisibility: { value: 0, min: 0, max: 1, step: 0.01, label: 'Star Visibility' },
      }),
      Atmosphere: folder({
        fogDensity: { value: 0, min: 0, max: 1, step: 0.01, label: 'Fog Density' },
        weatherIntensity: {
          value: 0,
          min: 0,
          max: 1,
          step: 0.01,
          label: 'Weather Intensity',
        },
      }),
    });

  // Presets for quick testing
  const { preset } = useControls({
    preset: {
      value: 'custom',
      options: {
        Custom: 'custom',
        Dawn: 'dawn',
        Noon: 'noon',
        Sunset: 'sunset',
        Night: 'night',
        Stormy: 'stormy',
      },
    },
  });

  // Preset configurations
  const PRESETS = {
    dawn: {
      sunAngle: 10,
      sunIntensity: 0.4,
      ambientLight: 0.3,
      starVisibility: 0.5,
      fogDensity: 0.3,
    },
    noon: {
      sunAngle: 90,
      sunIntensity: 1.0,
      ambientLight: 1.0,
      starVisibility: 0,
      fogDensity: 0,
    },
    sunset: {
      sunAngle: 15,
      sunIntensity: 0.8,
      ambientLight: 0.4,
      starVisibility: 0.2,
      fogDensity: 0.2,
    },
    night: {
      sunAngle: 0,
      sunIntensity: 0,
      ambientLight: 0.1,
      starVisibility: 1.0,
      fogDensity: 0.1,
    },
    stormy: {
      sunAngle: 45,
      sunIntensity: 0.3,
      ambientLight: 0.3,
      starVisibility: 0,
      fogDensity: 0.8,
      weather: { intensity: 0.8 },
    },
  };

  let timeOfDay = { sunAngle, sunIntensity, ambientLight, starVisibility, fogDensity };
  let weather = { intensity: weatherIntensity };

  // Apply preset overrides
  if (preset !== 'custom' && PRESETS[preset as keyof typeof PRESETS]) {
    const p = PRESETS[preset as keyof typeof PRESETS];
    timeOfDay = { ...timeOfDay, ...p };
    if ('weather' in p) {
      weather = p.weather;
    }
  }

  // Calculate sun position in a more natural arc
  const sunAngleRad = (timeOfDay.sunAngle * Math.PI) / 180;
  const sunPosition: [number, number, number] = [
    Math.cos(sunAngleRad) * 50,
    Math.sin(sunAngleRad) * 50,
    20, // Slight offset on Z for better shadows
  ];

  return (
    <>
      {/* Directional light representing the sun */}
      <directionalLight
        position={sunPosition}
        intensity={timeOfDay.sunIntensity * 2}
        color="#fffef0"
      />

      {/* Ambient lighting */}
      <ambientLight intensity={timeOfDay.ambientLight * 0.5} />

      {/* Procedural sky */}
      <ProceduralSky timeOfDay={timeOfDay} weather={weather} size={[300, 150]} distance={100} />

      {/* Reference ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2a4a2a" roughness={0.9} />
      </mesh>

      {/* Reference cube */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8a8a8a" />
      </mesh>

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={100}
      />

      {/* Stats - for development/demo only */}
      {import.meta.env.DEV && <Stats />}
    </>
  );
}

export function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [10, 5, 10], fov: 60 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
