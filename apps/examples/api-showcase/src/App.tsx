import { AdvancedWater, ProceduralSky, Water } from '@jbcom/strata';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Leva } from 'leva';
import type React from 'react';
import { useState } from 'react';
import type * as THREE from 'three';
import { SkyExamples, VegetationExamples, WaterExamples } from './examples';

interface ExampleResult {
  mesh?: THREE.Mesh;
  layers?: Record<string, THREE.Mesh>;
  material?: THREE.Material;
  component?: string;
  props?: any;
  components?: Array<{ type: string; props: any }>;
}

const ExampleRenderer: React.FC<{ example: () => ExampleResult }> = ({ example }) => {
  const result = example();

  if (result.mesh) {
    return <primitive object={result.mesh} />;
  }

  if (result.layers) {
    return (
      <>
        {Object.values(result.layers).map((mesh, i) => (
          <primitive key={i} object={mesh} />
        ))}
      </>
    );
  }

  if (result.material) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <primitive object={result.material} attach="material" />
      </mesh>
    );
  }

  const Components: Record<string, any> = { Water, AdvancedWater, ProceduralSky };

  if (result.component && Components[result.component]) {
    const Comp = Components[result.component];
    return <Comp {...result.props} />;
  }

  if (result.components) {
    return (
      <>
        {result.components.map((c, i) => {
          if (Components[c.type]) {
            const Comp = Components[c.type];
            return <Comp key={i} {...c.props} />;
          }
          return null;
        })}
      </>
    );
  }

  return null;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vegetation' | 'water' | 'sky'>('vegetation');

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 10,
          display: 'flex',
          gap: '10px',
          background: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '8px',
          backdropFilter: 'blur(4px)',
        }}
      >
        <button
          onClick={() => setActiveTab('vegetation')}
          style={{
            background: activeTab === 'vegetation' ? '#06b6d4' : 'transparent',
            color: '#fff',
            border: '1px solid #06b6d4',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Vegetation
        </button>
        <button
          onClick={() => setActiveTab('water')}
          style={{
            background: activeTab === 'water' ? '#06b6d4' : 'transparent',
            color: '#fff',
            border: '1px solid #06b6d4',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Water
        </button>
        <button
          onClick={() => setActiveTab('sky')}
          style={{
            background: activeTab === 'sky' ? '#06b6d4' : 'transparent',
            color: '#fff',
            border: '1px solid #06b6d4',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Sky
        </button>
      </div>

      <Leva
        theme={{
          colors: {
            accent1: '#06b6d4',
          },
        }}
      />

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[50, 50, 50]} fov={50} />
        <OrbitControls makeDefault />
        <ambientLight intensity={0.5} />
        <pointLight position={[100, 100, 100]} castShadow />

        {activeTab === 'vegetation' && (
          <ExampleRenderer example={VegetationExamples.Example_CompleteVegetationScene} />
        )}
        {activeTab === 'water' && <ExampleRenderer example={WaterExamples.Example_BasicWater} />}
        {activeTab === 'sky' && <ExampleRenderer example={SkyExamples.Example_BasicSky} />}
      </Canvas>
    </div>
  );
};

export default App;
