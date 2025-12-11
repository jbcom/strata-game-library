import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';

const TerrainDemo = lazy(() => import('./pages/demos/TerrainDemo'));
const WaterDemo = lazy(() => import('./pages/demos/WaterDemo'));
const SkyDemo = lazy(() => import('./pages/demos/SkyDemo'));
const VegetationDemo = lazy(() => import('./pages/demos/VegetationDemo'));
const VolumetricsDemo = lazy(() => import('./pages/demos/VolumetricsDemo'));
const CharactersDemo = lazy(() => import('./pages/demos/CharactersDemo'));
const FullSceneDemo = lazy(() => import('./pages/demos/FullSceneDemo'));
const GettingStarted = lazy(() => import('./pages/GettingStarted'));
const ApiReference = lazy(() => import('./pages/ApiReference'));

function Loading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0a0a0f'
    }}>
      <div style={{
        width: 60,
        height: 60,
        border: '3px solid rgba(212, 175, 55, 0.2)',
        borderTopColor: '#d4af37',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/getting-started" element={<GettingStarted />} />
          <Route path="/api" element={<ApiReference />} />
          <Route path="/demos/terrain" element={<TerrainDemo />} />
          <Route path="/demos/water" element={<WaterDemo />} />
          <Route path="/demos/sky" element={<SkyDemo />} />
          <Route path="/demos/vegetation" element={<VegetationDemo />} />
          <Route path="/demos/volumetrics" element={<VolumetricsDemo />} />
          <Route path="/demos/characters" element={<CharactersDemo />} />
          <Route path="/demos/full-scene" element={<FullSceneDemo />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
