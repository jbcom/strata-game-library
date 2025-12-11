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

const ParticleDemo = lazy(() => import('./pages/demos/ParticleDemo'));
const WeatherDemo = lazy(() => import('./pages/demos/WeatherDemo'));
const CloudsDemo = lazy(() => import('./pages/demos/CloudsDemo'));
const CameraDemo = lazy(() => import('./pages/demos/CameraDemo'));
const DecalsDemo = lazy(() => import('./pages/demos/DecalsDemo'));
const LODDemo = lazy(() => import('./pages/demos/LODDemo'));
const GodRaysDemo = lazy(() => import('./pages/demos/GodRaysDemo'));
const InputDemo = lazy(() => import('./pages/demos/InputDemo'));
const AIDemo = lazy(() => import('./pages/demos/AIDemo'));
const AudioDemo = lazy(() => import('./pages/demos/AudioDemo'));
const PhysicsDemo = lazy(() => import('./pages/demos/PhysicsDemo'));
const PostProcessingDemo = lazy(() => import('./pages/demos/PostProcessingDemo'));

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
          <Route path="/demos/particles" element={<ParticleDemo />} />
          <Route path="/demos/weather" element={<WeatherDemo />} />
          <Route path="/demos/clouds" element={<CloudsDemo />} />
          <Route path="/demos/camera" element={<CameraDemo />} />
          <Route path="/demos/decals" element={<DecalsDemo />} />
          <Route path="/demos/lod" element={<LODDemo />} />
          <Route path="/demos/god-rays" element={<GodRaysDemo />} />
          <Route path="/demos/input" element={<InputDemo />} />
          <Route path="/demos/ai" element={<AIDemo />} />
          <Route path="/demos/audio" element={<AudioDemo />} />
          <Route path="/demos/physics" element={<PhysicsDemo />} />
          <Route path="/demos/postprocessing" element={<PostProcessingDemo />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
