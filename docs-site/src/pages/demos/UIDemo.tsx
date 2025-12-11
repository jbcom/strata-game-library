import { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { Box, Typography, Paper, Stack, Button, ToggleButton, ToggleButtonGroup, Slider, Chip } from '@mui/material';
import * as THREE from 'three';
import {
    HealthBar,
    Nameplate,
    DamageNumber,
    ProgressBar3D,
    Inventory,
    DialogBox,
    Notification,
    Minimap,
    Crosshair,
    healthBarPresets,
    dialogPresets,
    type InventorySlot,
    type DialogLine,
} from '@jbcom/strata';

interface DamageNumberData {
    id: number;
    position: [number, number, number];
    value: number;
    type: 'normal' | 'critical' | 'heal' | 'miss';
}

function Character({
    health,
    maxHealth,
    onHit,
}: {
    health: number;
    maxHealth: number;
    onHit: (position: THREE.Vector3) => void;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.5;
        }
    });

    const handleClick = (event: THREE.Event) => {
        event.stopPropagation();
        if (meshRef.current) {
            onHit(meshRef.current.position.clone());
        }
    };

    return (
        <group position={[0, 0, 0]}>
            <mesh
                ref={meshRef}
                onClick={handleClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
                <meshStandardMaterial
                    color={hovered ? '#60a5fa' : '#4ade80'}
                    emissive={hovered ? '#60a5fa' : '#000000'}
                    emissiveIntensity={hovered ? 0.2 : 0}
                />
            </mesh>
            <Nameplate
                name="Hero"
                title="The Brave"
                level={42}
                healthBar={{ value: health, maxValue: maxHealth }}
                showHealthBar
                showLevel
                position={[0, 1.8, 0]}
                fadeStart={20}
                fadeEnd={30}
            />
            <ProgressBar3D
                value={health}
                maxValue={maxHealth}
                width={1}
                height={0.08}
                depth={0.02}
                fillColor={health > 50 ? '#4ade80' : health > 25 ? '#fbbf24' : '#ef4444'}
                position={[0, 1.4, 0]}
                billboard
            />
        </group>
    );
}

function Enemy({
    position,
    name,
    health,
    maxHealth,
    onHit,
}: {
    position: [number, number, number];
    name: string;
    health: number;
    maxHealth: number;
    onHit: (pos: THREE.Vector3) => void;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    const handleClick = (event: THREE.Event) => {
        event.stopPropagation();
        if (meshRef.current) {
            onHit(meshRef.current.position.clone());
        }
    };

    return (
        <group position={position}>
            <mesh ref={meshRef} onClick={handleClick} position={[0, 0.4, 0]}>
                <boxGeometry args={[0.6, 0.8, 0.4]} />
                <meshStandardMaterial color="#ef4444" />
            </mesh>
            <HealthBar
                value={health}
                maxValue={maxHealth}
                width={80}
                height={8}
                backgroundColor="rgba(0,0,0,0.7)"
                fillColor="#ef4444"
                position={[0, 1.2, 0]}
                showText
                textFormat="fraction"
                distanceFade={{ start: 15, end: 25 }}
            />
            <Nameplate
                name={name}
                level={Math.floor(Math.random() * 20) + 30}
                nameColor="#ef4444"
                position={[0, 1.5, 0]}
            />
        </group>
    );
}

function Scene({
    health,
    maxHealth,
    enemies,
    onCharacterHit,
    onEnemyHit,
    damageNumbers,
    removeDamageNumber,
}: {
    health: number;
    maxHealth: number;
    enemies: Array<{ id: string; name: string; position: [number, number, number]; health: number; maxHealth: number }>;
    onCharacterHit: (pos: THREE.Vector3) => void;
    onEnemyHit: (id: string, pos: THREE.Vector3) => void;
    damageNumbers: DamageNumberData[];
    removeDamageNumber: (id: number) => void;
}) {
    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1} />
            
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#2d4a3e" />
            </mesh>

            <Character health={health} maxHealth={maxHealth} onHit={onCharacterHit} />

            {enemies.map((enemy) => (
                <Enemy
                    key={enemy.id}
                    position={enemy.position}
                    name={enemy.name}
                    health={enemy.health}
                    maxHealth={enemy.maxHealth}
                    onHit={(pos) => onEnemyHit(enemy.id, pos)}
                />
            ))}

            {damageNumbers.map((dmg) => (
                <DamageNumber
                    key={dmg.id}
                    position={dmg.position}
                    value={dmg.value}
                    type={dmg.type}
                    onComplete={() => removeDamageNumber(dmg.id)}
                />
            ))}

            <OrbitControls
                makeDefault
                enablePan={false}
                maxPolarAngle={Math.PI / 2.1}
                minDistance={3}
                maxDistance={15}
            />
        </>
    );
}

const SAMPLE_DIALOG: DialogLine[] = [
    {
        speaker: 'Hero',
        text: 'Greetings, traveler! Welcome to the UI System demonstration.',
    },
    {
        speaker: 'Guide',
        text: 'This dialog box supports typewriter effects with configurable speed. Click anywhere to advance!',
    },
    {
        speaker: 'Hero',
        text: 'You can also have choices in your dialogs:',
        choices: [
            { id: 'explore', text: 'Tell me more about the UI system' },
            { id: 'skip', text: 'Skip the tutorial' },
        ],
    },
    {
        speaker: 'Guide',
        text: 'The UI system includes health bars, nameplates, damage numbers, inventory, minimap, and more!',
    },
    {
        speaker: 'Hero',
        text: 'Try clicking on the characters to see damage numbers appear and float away.',
    },
];

const SAMPLE_INVENTORY: InventorySlot[] = [
    { id: '1', itemId: 'sword', itemName: 'Steel Sword', quantity: 1, rarity: 'rare' },
    { id: '2', itemId: 'potion', itemName: 'Health Potion', quantity: 5, rarity: 'common' },
    { id: '3', itemId: 'shield', itemName: 'Iron Shield', quantity: 1, rarity: 'uncommon' },
    { id: '4', itemId: 'gem', itemName: 'Magic Gem', quantity: 3, rarity: 'epic' },
    { id: '5', itemId: 'scroll', itemName: 'Ancient Scroll', quantity: 1, rarity: 'legendary' },
    { id: '6' },
    { id: '7' },
    { id: '8', locked: true },
    { id: '9' },
    { id: '10' },
    { id: '11' },
    { id: '12' },
];

export default function UIDemo() {
    const [health, setHealth] = useState(100);
    const maxHealth = 100;
    const [showInventory, setShowInventory] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [showCrosshair, setShowCrosshair] = useState(true);
    const [crosshairType, setCrosshairType] = useState<'cross' | 'dot' | 'circle'>('cross');
    const [notifications, setNotifications] = useState<Array<{ id: number; message: string; type: 'success' | 'warning' | 'error' | 'info' }>>([]);
    const [damageNumbers, setDamageNumbers] = useState<DamageNumberData[]>([]);
    const [enemies, setEnemies] = useState([
        { id: 'goblin1', name: 'Goblin', position: [-3, 0, -2] as [number, number, number], health: 50, maxHealth: 50 },
        { id: 'orc1', name: 'Orc Warrior', position: [3, 0, -3] as [number, number, number], health: 100, maxHealth: 100 },
    ]);
    const [healthBarPreset, setHealthBarPreset] = useState<string>('rpg');
    const [dialogPreset, setDialogPreset] = useState<string>('rpg');
    const damageIdRef = useRef(0);
    const notificationIdRef = useRef(0);

    const addNotification = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info') => {
        const id = notificationIdRef.current++;
        setNotifications((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 4000);
    }, []);

    const handleCharacterHit = useCallback((position: THREE.Vector3) => {
        const damage = Math.floor(Math.random() * 30) + 10;
        const isCrit = Math.random() > 0.7;
        const isHeal = Math.random() > 0.8;
        
        const id = damageIdRef.current++;
        const dmgData: DamageNumberData = {
            id,
            position: [position.x, position.y + 0.5, position.z],
            value: isHeal ? damage : damage,
            type: isHeal ? 'heal' : isCrit ? 'critical' : 'normal',
        };
        
        setDamageNumbers((prev) => [...prev, dmgData]);
        
        if (isHeal) {
            setHealth((h) => Math.min(h + damage, maxHealth));
            addNotification(`Healed for ${damage} HP!`, 'success');
        } else {
            setHealth((h) => Math.max(h - damage, 0));
            if (isCrit) {
                addNotification(`Critical hit! ${damage} damage!`, 'warning');
            }
        }
    }, [addNotification, maxHealth]);

    const handleEnemyHit = useCallback((enemyId: string, position: THREE.Vector3) => {
        const damage = Math.floor(Math.random() * 25) + 15;
        const isCrit = Math.random() > 0.7;
        const isMiss = Math.random() > 0.85;
        
        const id = damageIdRef.current++;
        const dmgData: DamageNumberData = {
            id,
            position: [position.x, position.y + 0.5, position.z],
            value: isMiss ? 0 : damage,
            type: isMiss ? 'miss' : isCrit ? 'critical' : 'normal',
        };
        
        setDamageNumbers((prev) => [...prev, dmgData]);
        
        if (!isMiss) {
            setEnemies((prev) =>
                prev.map((e) =>
                    e.id === enemyId ? { ...e, health: Math.max(e.health - damage, 0) } : e
                )
            );
        }
    }, []);

    const removeDamageNumber = useCallback((id: number) => {
        setDamageNumbers((prev) => prev.filter((d) => d.id !== id));
    }, []);

    const resetDemo = useCallback(() => {
        setHealth(100);
        setEnemies([
            { id: 'goblin1', name: 'Goblin', position: [-3, 0, -2], health: 50, maxHealth: 50 },
            { id: 'orc1', name: 'Orc Warrior', position: [3, 0, -3], health: 100, maxHealth: 100 },
        ]);
        setDamageNumbers([]);
        addNotification('Demo reset!', 'info');
    }, [addNotification]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#0a0a0f' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h4" color="primary.main" gutterBottom>
                    UI System Demo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Click on characters to deal/heal damage. Toggle UI elements with the controls below.
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <Box
                    sx={{
                        width: 300,
                        p: 2,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        overflowY: 'auto',
                    }}
                >
                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                        <Typography variant="subtitle2" color="primary.main" gutterBottom>
                            Player Status
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Health: {health}/{maxHealth}
                            </Typography>
                            <Slider
                                value={health}
                                onChange={(_, v) => setHealth(v as number)}
                                min={0}
                                max={maxHealth}
                                sx={{ color: health > 50 ? 'success.main' : health > 25 ? 'warning.main' : 'error.main' }}
                            />
                        </Box>
                        <Button variant="outlined" size="small" onClick={resetDemo} fullWidth>
                            Reset Demo
                        </Button>
                    </Paper>

                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                        <Typography variant="subtitle2" color="primary.main" gutterBottom>
                            UI Toggles
                        </Typography>
                        <Stack spacing={1}>
                            <Button
                                variant={showInventory ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => setShowInventory(!showInventory)}
                            >
                                {showInventory ? 'Hide' : 'Show'} Inventory
                            </Button>
                            <Button
                                variant={showDialog ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => setShowDialog(!showDialog)}
                            >
                                {showDialog ? 'Hide' : 'Show'} Dialog
                            </Button>
                            <Button
                                variant={showCrosshair ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => setShowCrosshair(!showCrosshair)}
                            >
                                {showCrosshair ? 'Hide' : 'Show'} Crosshair
                            </Button>
                        </Stack>
                    </Paper>

                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                        <Typography variant="subtitle2" color="primary.main" gutterBottom>
                            Crosshair Type
                        </Typography>
                        <ToggleButtonGroup
                            value={crosshairType}
                            exclusive
                            onChange={(_, v) => v && setCrosshairType(v)}
                            size="small"
                            fullWidth
                        >
                            <ToggleButton value="cross">Cross</ToggleButton>
                            <ToggleButton value="dot">Dot</ToggleButton>
                            <ToggleButton value="circle">Circle</ToggleButton>
                        </ToggleButtonGroup>
                    </Paper>

                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                        <Typography variant="subtitle2" color="primary.main" gutterBottom>
                            Health Bar Preset
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                            {Object.keys(healthBarPresets).map((preset) => (
                                <Chip
                                    key={preset}
                                    label={preset}
                                    size="small"
                                    variant={healthBarPreset === preset ? 'filled' : 'outlined'}
                                    color="primary"
                                    onClick={() => setHealthBarPreset(preset)}
                                />
                            ))}
                        </Stack>
                    </Paper>

                    <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                        <Typography variant="subtitle2" color="primary.main" gutterBottom>
                            Dialog Preset
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                            {Object.keys(dialogPresets).map((preset) => (
                                <Chip
                                    key={preset}
                                    label={preset}
                                    size="small"
                                    variant={dialogPreset === preset ? 'filled' : 'outlined'}
                                    color="primary"
                                    onClick={() => setDialogPreset(preset)}
                                />
                            ))}
                        </Stack>
                    </Paper>
                </Box>

                <Box sx={{ flex: 1, position: 'relative' }}>
                    <Canvas
                        camera={{ position: [0, 3, 6], fov: 50 }}
                        style={{ background: 'linear-gradient(to bottom, #1a1a2e 0%, #0f0f1a 100%)' }}
                    >
                        <Scene
                            health={health}
                            maxHealth={maxHealth}
                            enemies={enemies}
                            onCharacterHit={handleCharacterHit}
                            onEnemyHit={handleEnemyHit}
                            damageNumbers={damageNumbers}
                            removeDamageNumber={removeDamageNumber}
                        />
                    </Canvas>

                    {showCrosshair && (
                        <Crosshair
                            type={crosshairType}
                            size={crosshairType === 'dot' ? 6 : 24}
                            color="#ffffff"
                            opacity={0.8}
                            dot={crosshairType === 'cross'}
                        />
                    )}

                    <Minimap
                        size={120}
                        borderRadius={60}
                        playerPosition={[0, 0]}
                        playerRotation={0}
                        markers={enemies.map((e) => ({
                            id: e.id,
                            position: [e.position[0] * 5, e.position[2] * 5] as [number, number],
                            type: 'enemy',
                        }))}
                        markerTypes={{
                            enemy: { color: '#ef4444', size: 6 },
                        }}
                        style={{ position: 'fixed', top: 100, right: 20 }}
                    />

                    <Box sx={{ position: 'fixed', top: 100, right: 150 }}>
                        <Stack spacing={1}>
                            {notifications.map((notif) => (
                                <Notification
                                    key={notif.id}
                                    message={notif.message}
                                    type={notif.type}
                                    duration={0}
                                    dismissible
                                    progress={false}
                                    onDismiss={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {showInventory && (
                        <Box sx={{ position: 'fixed', left: 320, top: 100 }}>
                            <Inventory
                                slots={SAMPLE_INVENTORY}
                                columns={4}
                                rows={3}
                                slotSize={52}
                                onSlotClick={(slot) => {
                                    if (slot.itemName) {
                                        addNotification(`Selected: ${slot.itemName}`, 'info');
                                    }
                                }}
                            />
                        </Box>
                    )}

                    {showDialog && (
                        <DialogBox
                            lines={SAMPLE_DIALOG}
                            {...dialogPresets[dialogPreset as keyof typeof dialogPresets]}
                            onDialogComplete={() => {
                                setShowDialog(false);
                                addNotification('Dialog completed!', 'success');
                            }}
                            onChoiceSelect={(choiceId) => {
                                addNotification(`Selected: ${choiceId}`, 'info');
                            }}
                        />
                    )}
                </Box>
            </Box>
        </Box>
    );
}
