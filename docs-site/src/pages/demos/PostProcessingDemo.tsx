import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshReflectorMaterial, Text3D, Center } from '@react-three/drei';
import {
    Box,
    Typography,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Switch,
    FormControlLabel,
    Divider,
} from '@mui/material';
import * as THREE from 'three';
import {
    CinematicEffects,
    DreamyEffects,
    HorrorEffects,
    NeonEffects,
    RealisticEffects,
    VintageEffects,
} from '@jbcom/strata';
import DemoLayout from '../../components/DemoLayout';

type EffectPreset = 'none' | 'cinematic' | 'dreamy' | 'horror' | 'neon' | 'realistic' | 'vintage';

const presetDescriptions: Record<EffectPreset, string> = {
    none: 'No post-processing effects applied',
    cinematic: 'Film-like look with bloom, vignette, and chromatic aberration',
    dreamy: 'Soft, ethereal appearance with high bloom and reduced saturation',
    horror: 'Dark, desaturated, noisy atmosphere',
    neon: 'High bloom, saturated colors for cyberpunk aesthetics',
    realistic: 'Subtle, physically-based rendering enhancements',
    vintage: 'Old film look with sepia tones and vignette',
};

function RotatingBox({ position, color }: { position: [number, number, number]; color: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.5;
            meshRef.current.rotation.y += delta * 0.3;
        }
    });

    return (
        <mesh ref={meshRef} position={position} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
        </mesh>
    );
}

function RotatingSphere({ position, color, emissive = false }: { position: [number, number, number]; color: string; emissive?: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.3;
        }
    });

    return (
        <mesh ref={meshRef} position={position} castShadow>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial 
                color={color} 
                metalness={0.8} 
                roughness={0.1}
                emissive={emissive ? color : '#000000'}
                emissiveIntensity={emissive ? 2 : 0}
            />
        </mesh>
    );
}

function GlowingTorus({ position, color }: { position: [number, number, number]; color: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.2;
            meshRef.current.rotation.z += delta * 0.4;
        }
    });

    return (
        <mesh ref={meshRef} position={position} castShadow>
            <torusGeometry args={[0.6, 0.2, 16, 32]} />
            <meshStandardMaterial 
                color={color} 
                metalness={0.9} 
                roughness={0.05}
                emissive={color}
                emissiveIntensity={1.5}
            />
        </mesh>
    );
}

function Floor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <MeshReflectorMaterial
                blur={[300, 100]}
                resolution={1024}
                mixBlur={1}
                mixStrength={40}
                roughness={1}
                depthScale={1.2}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.4}
                color="#101010"
                metalness={0.8}
                mirror={0.5}
            />
        </mesh>
    );
}

function Scene() {
    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ff6600" />
            <spotLight 
                position={[0, 10, 0]} 
                angle={0.3} 
                penumbra={1} 
                intensity={1.5} 
                castShadow
            />

            <RotatingBox position={[-3, 0, 0]} color="#ff4488" />
            <RotatingBox position={[3, 0, 0]} color="#44ff88" />
            <RotatingSphere position={[0, 0.5, 2]} color="#4488ff" />
            <RotatingSphere position={[-2, 0.5, -2]} color="#ffff44" emissive />
            <RotatingSphere position={[2, 0.5, -2]} color="#ff44ff" emissive />
            <GlowingTorus position={[0, 1, -1]} color="#00ffff" />

            <Floor />
        </>
    );
}

interface EffectsProps {
    preset: EffectPreset;
    bloomIntensity: number;
    vignetteDarkness: number;
    enabled: boolean;
}

function Effects({ preset, bloomIntensity, vignetteDarkness, enabled }: EffectsProps) {
    if (!enabled || preset === 'none') return null;

    switch (preset) {
        case 'cinematic':
            return (
                <CinematicEffects 
                    bloomIntensity={bloomIntensity} 
                    vignetteDarkness={vignetteDarkness}
                />
            );
        case 'dreamy':
            return (
                <DreamyEffects 
                    bloomIntensity={bloomIntensity * 2}
                    saturation={-0.2}
                />
            );
        case 'horror':
            return (
                <HorrorEffects 
                    vignetteDarkness={vignetteDarkness * 1.5}
                    desaturation={-0.5}
                />
            );
        case 'neon':
            return (
                <NeonEffects 
                    bloomIntensity={bloomIntensity * 3}
                    saturation={0.3}
                />
            );
        case 'realistic':
            return (
                <RealisticEffects 
                    bloomIntensity={bloomIntensity * 0.5}
                    ssao
                />
            );
        case 'vintage':
            return (
                <VintageEffects 
                    sepiaIntensity={0.4}
                    vignetteDarkness={vignetteDarkness}
                />
            );
        default:
            return null;
    }
}

export default function PostProcessingDemo() {
    const [preset, setPreset] = useState<EffectPreset>('cinematic');
    const [bloomIntensity, setBloomIntensity] = useState(1);
    const [vignetteDarkness, setVignetteDarkness] = useState(0.4);
    const [enabled, setEnabled] = useState(true);

    return (
        <DemoLayout title="Post-Processing Effects">
            <Box sx={{ display: 'flex', height: '100%', gap: 2 }}>
                <Paper
                    sx={{
                        width: 320,
                        p: 3,
                        bgcolor: 'rgba(10, 10, 15, 0.9)',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                    }}
                >
                    <Typography variant="h6" color="primary">
                        Effect Controls
                    </Typography>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={enabled}
                                onChange={(e) => setEnabled(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Enable Effects"
                    />

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                    <FormControl fullWidth>
                        <InputLabel>Preset</InputLabel>
                        <Select
                            value={preset}
                            label="Preset"
                            onChange={(e) => setPreset(e.target.value as EffectPreset)}
                        >
                            <MenuItem value="none">None</MenuItem>
                            <MenuItem value="cinematic">Cinematic</MenuItem>
                            <MenuItem value="dreamy">Dreamy</MenuItem>
                            <MenuItem value="horror">Horror</MenuItem>
                            <MenuItem value="neon">Neon</MenuItem>
                            <MenuItem value="realistic">Realistic</MenuItem>
                            <MenuItem value="vintage">Vintage</MenuItem>
                        </Select>
                    </FormControl>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: -1 }}>
                        {presetDescriptions[preset]}
                    </Typography>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                    <Box>
                        <Typography gutterBottom>Bloom Intensity</Typography>
                        <Slider
                            value={bloomIntensity}
                            onChange={(_, v) => setBloomIntensity(v as number)}
                            min={0}
                            max={3}
                            step={0.1}
                            valueLabelDisplay="auto"
                            disabled={preset === 'none' || !enabled}
                        />
                    </Box>

                    <Box>
                        <Typography gutterBottom>Vignette Darkness</Typography>
                        <Slider
                            value={vignetteDarkness}
                            onChange={(_, v) => setVignetteDarkness(v as number)}
                            min={0}
                            max={1}
                            step={0.05}
                            valueLabelDisplay="auto"
                            disabled={preset === 'none' || !enabled}
                        />
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                    <Typography variant="body2" color="text.secondary">
                        <strong>Tips:</strong><br />
                        • Cinematic: Great for story-driven games<br />
                        • Dreamy: Perfect for fantasy scenes<br />
                        • Horror: Adds unease and tension<br />
                        • Neon: Ideal for cyberpunk aesthetics<br />
                        • Realistic: Subtle PBR enhancements<br />
                        • Vintage: Nostalgic film look
                    </Typography>
                </Paper>

                <Box sx={{ flex: 1, borderRadius: 2, overflow: 'hidden' }}>
                    <Canvas
                        shadows
                        camera={{ position: [0, 3, 8], fov: 50 }}
                        gl={{ 
                            antialias: true,
                            toneMapping: THREE.ACESFilmicToneMapping,
                            toneMappingExposure: 1,
                        }}
                    >
                        <Suspense fallback={null}>
                            <Scene />
                            <Effects 
                                preset={preset}
                                bloomIntensity={bloomIntensity}
                                vignetteDarkness={vignetteDarkness}
                                enabled={enabled}
                            />
                            <OrbitControls 
                                enablePan={false}
                                minDistance={3}
                                maxDistance={15}
                                maxPolarAngle={Math.PI / 2}
                            />
                        </Suspense>
                    </Canvas>
                </Box>
            </Box>
        </DemoLayout>
    );
}
