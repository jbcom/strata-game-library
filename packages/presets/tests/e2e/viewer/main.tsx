import { OrbitControls, PerspectiveCamera, Stage } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ALL_THEMES,
  createBuilding,
  createCollectible,
  createEquipment,
  createObstacle,
  createQuadruped,
} from '../../../src';

function PresetViewer() {
  const [type, setType] = useState('creature');
  const [form, setForm] = useState('otter');
  const [params, setParams] = useState<any>(null);

  useEffect(() => {
    let newParams;
    if (type === 'creature') newParams = createQuadruped(form as any);
    else if (type === 'building') newParams = createBuilding(form as any);
    else if (type === 'collectible') newParams = createCollectible(form as any);
    else if (type === 'obstacle') newParams = createObstacle(form as any);
    else if (type === 'equipment') newParams = createEquipment(form as any);
    setParams(newParams);

    // Set data attribute for Playwright to find
    document.body.setAttribute('data-preset-params', JSON.stringify(newParams));
    document.body.setAttribute('data-ready', 'true');
  }, [type, form]);

  return (
    <>
      <div className="controls">
        <select value={type} onChange={(e) => setType(e.target.value)} id="type-select">
          <option value="creature">Creature</option>
          <option value="building">Building</option>
          <option value="collectible">Collectible</option>
          <option value="obstacle">Obstacle</option>
          <option value="equipment">Equipment</option>
        </select>
        <input
          id="form-input"
          value={form}
          onChange={(e) => setForm(e.target.value)}
          placeholder="Form name (otter, hut, etc.)"
        />
      </div>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} />
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5}>
            {/* Minimal visual representation for E2E testing */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={params?.color || 'orange'} />
            </mesh>
          </Stage>
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
    </>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<PresetViewer />);
