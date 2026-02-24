import { OrbitControls, Sky } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { VegetationExamples } from './examples/vegetation/VegetationExamples';

function App() {
  // Just show one example for now as a placeholder
  const result = VegetationExamples.Example_CompleteVegetationScene();
  const { grass, trees, rocks } = result.layers;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas shadows camera={{ position: [50, 50, 50], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[100, 100, 50]} intensity={1} castShadow />
        <Sky />
        <primitive object={grass} />
        <primitive object={trees} />
        <primitive object={rocks} />
        <OrbitControls />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          top: '80px',
          left: '20px',
          background: 'rgba(0,0,0,0.7)',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '300px',
        }}
      >
        <h2>API Showcase</h2>
        <p>
          This is a placeholder for the full API showcase. Check the source code for comprehensive
          examples of every Strata API.
        </p>
        <a
          href="https://github.com/jbcom/nodejs-strata-examples/tree/main/api-showcase"
          style={{ color: '#06b6d4' }}
        >
          View Source
        </a>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('container')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
