import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Stack, Button, Chip, Divider, IconButton } from '@mui/material';
import {
    GameStateProvider,
    useGameState,
    useSaveLoad,
    useCheckpoint,
    StateDebugger,
} from '@jbcom/strata';

interface DemoState {
    count: number;
    name: string;
    items: string[];
    lastAction: string;
}

const INITIAL_STATE: DemoState = {
    count: 0,
    name: 'Demo',
    items: [],
    lastAction: 'Initialized',
};

function CounterSection() {
    const { state, patchState, undo, redo, canUndo, canRedo, undoStackSize, redoStackSize } = useGameState<DemoState>();

    const increment = () => {
        patchState({ 
            count: state.count + 1, 
            lastAction: `Incremented to ${state.count + 1}` 
        });
    };

    const decrement = () => {
        patchState({ 
            count: state.count - 1, 
            lastAction: `Decremented to ${state.count - 1}` 
        });
    };

    const addItem = () => {
        const newItem = `Item ${state.items.length + 1}`;
        patchState({ 
            items: [...state.items, newItem], 
            lastAction: `Added ${newItem}` 
        });
    };

    const removeItem = () => {
        if (state.items.length > 0) {
            const removed = state.items[state.items.length - 1];
            patchState({ 
                items: state.items.slice(0, -1), 
                lastAction: `Removed ${removed}` 
            });
        }
    };

    return (
        <Paper sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.6)', border: '1px solid', borderColor: 'primary.dark' }}>
            <Typography variant="h6" color="primary.main" gutterBottom>
                Counter with Undo/Redo
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 3 }}>
                <Button 
                    variant="outlined" 
                    onClick={decrement}
                    size="large"
                >
                    -
                </Button>
                <Typography variant="h2" color="primary.main" sx={{ minWidth: 120, textAlign: 'center' }}>
                    {state.count}
                </Typography>
                <Button 
                    variant="outlined" 
                    onClick={increment}
                    size="large"
                >
                    +
                </Button>
            </Box>

            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
                <Button 
                    variant="contained" 
                    onClick={undo} 
                    disabled={!canUndo}
                    color="secondary"
                >
                    ↶ Undo ({undoStackSize})
                </Button>
                <Button 
                    variant="contained" 
                    onClick={redo} 
                    disabled={!canRedo}
                    color="secondary"
                >
                    ↷ Redo ({redoStackSize})
                </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Items List
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                {state.items.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No items yet</Typography>
                ) : (
                    state.items.map((item, i) => (
                        <Chip key={i} label={item} size="small" variant="outlined" color="primary" />
                    ))
                )}
            </Stack>
            <Stack direction="row" spacing={1}>
                <Button variant="outlined" size="small" onClick={addItem}>
                    Add Item
                </Button>
                <Button variant="outlined" size="small" onClick={removeItem} disabled={state.items.length === 0}>
                    Remove Item
                </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                Last Action: {state.lastAction}
            </Typography>
        </Paper>
    );
}

function SaveLoadSection() {
    const { state, setState, resetState } = useGameState<DemoState>();
    const { save, load, listSaves, deleteSave, exportJSON, importJSON } = useSaveLoad<DemoState>();
    const [saves, setSaves] = useState<string[]>([]);
    const [saveStatus, setSaveStatus] = useState<string>('');
    const [exportedJson, setExportedJson] = useState<string>('');

    const refreshSaves = useCallback(async () => {
        const list = await listSaves();
        setSaves(list);
    }, [listSaves]);

    useEffect(() => {
        refreshSaves();
    }, [refreshSaves]);

    const handleSave = async (slot: string) => {
        const success = await save(slot);
        setSaveStatus(success ? `Saved to slot "${slot}"` : 'Save failed');
        refreshSaves();
    };

    const handleLoad = async (slot: string) => {
        const success = await load(slot);
        setSaveStatus(success ? `Loaded from slot "${slot}"` : 'Load failed');
    };

    const handleDelete = async (slot: string) => {
        const success = await deleteSave(slot);
        setSaveStatus(success ? `Deleted slot "${slot}"` : 'Delete failed');
        refreshSaves();
    };

    const handleExport = () => {
        const json = exportJSON();
        setExportedJson(json);
        setSaveStatus('Exported to JSON');
    };

    const handleImport = () => {
        if (exportedJson) {
            const success = importJSON(exportedJson);
            setSaveStatus(success ? 'Imported from JSON' : 'Import failed');
        }
    };

    const handleReset = () => {
        resetState();
        setSaveStatus('State reset to initial');
    };

    return (
        <Paper sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.6)', border: '1px solid', borderColor: 'primary.dark' }}>
            <Typography variant="h6" color="primary.main" gutterBottom>
                Save / Load
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button variant="contained" onClick={() => handleSave('slot1')}>
                    💾 Save Slot 1
                </Button>
                <Button variant="contained" onClick={() => handleSave('slot2')}>
                    💾 Save Slot 2
                </Button>
                <Button variant="outlined" color="warning" onClick={handleReset}>
                    🔄 Reset
                </Button>
            </Stack>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Available Saves:
            </Typography>
            {saves.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No saves yet
                </Typography>
            ) : (
                <Stack spacing={1} sx={{ mb: 2 }}>
                    {saves.map(slot => (
                        <Box key={slot} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={slot} size="small" color="primary" />
                            <Button size="small" onClick={() => handleLoad(slot)}>Load</Button>
                            <Button size="small" color="error" onClick={() => handleDelete(slot)}>Delete</Button>
                        </Box>
                    ))}
                </Stack>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Export / Import JSON
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Button variant="outlined" size="small" onClick={handleExport}>
                    📤 Export
                </Button>
                <Button variant="outlined" size="small" onClick={handleImport} disabled={!exportedJson}>
                    📥 Import
                </Button>
            </Stack>

            {exportedJson && (
                <Paper sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.3)', mt: 1, maxHeight: 100, overflow: 'auto' }}>
                    <Typography variant="caption" component="pre" sx={{ fontSize: '10px', wordBreak: 'break-all' }}>
                        {exportedJson.slice(0, 200)}...
                    </Typography>
                </Paper>
            )}

            {saveStatus && (
                <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                    ✓ {saveStatus}
                </Typography>
            )}
        </Paper>
    );
}

function CheckpointSection() {
    const { state } = useGameState<DemoState>();
    const { createCheckpoint, restoreCheckpoint, listCheckpoints, deleteCheckpoint, hasCheckpoint } = useCheckpoint<DemoState>();
    const [checkpoints, setCheckpoints] = useState<{ name: string; timestamp: number }[]>([]);
    const [status, setStatus] = useState<string>('');

    const refreshCheckpoints = useCallback(() => {
        const list = listCheckpoints();
        setCheckpoints(list.map(cp => ({ name: cp.name, timestamp: cp.timestamp })));
    }, [listCheckpoints]);

    useEffect(() => {
        refreshCheckpoints();
    }, [refreshCheckpoints]);

    const handleCreate = async (name: string) => {
        const success = await createCheckpoint(name, `Created at count ${state.count}`);
        setStatus(success ? `Checkpoint "${name}" created` : 'Failed to create checkpoint');
        refreshCheckpoints();
    };

    const handleRestore = async (name: string) => {
        const success = await restoreCheckpoint(name);
        setStatus(success ? `Restored checkpoint "${name}"` : 'Failed to restore');
    };

    const handleDelete = async (name: string) => {
        const success = await deleteCheckpoint(name);
        setStatus(success ? `Deleted checkpoint "${name}"` : 'Failed to delete');
        refreshCheckpoints();
    };

    return (
        <Paper sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.6)', border: '1px solid', borderColor: 'primary.dark' }}>
            <Typography variant="h6" color="primary.main" gutterBottom>
                Checkpoints
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button variant="outlined" onClick={() => handleCreate('checkpoint_a')}>
                    📍 Create A
                </Button>
                <Button variant="outlined" onClick={() => handleCreate('checkpoint_b')}>
                    📍 Create B
                </Button>
            </Stack>

            {checkpoints.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    No checkpoints created
                </Typography>
            ) : (
                <Stack spacing={1}>
                    {checkpoints.map(cp => (
                        <Box key={cp.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                                label={`${cp.name} (${new Date(cp.timestamp).toLocaleTimeString()})`} 
                                size="small" 
                                color="secondary" 
                            />
                            <Button size="small" onClick={() => handleRestore(cp.name)}>Restore</Button>
                            <Button size="small" color="error" onClick={() => handleDelete(cp.name)}>Delete</Button>
                        </Box>
                    ))}
                </Stack>
            )}

            {status && (
                <Typography variant="caption" color="info.main" sx={{ display: 'block', mt: 2 }}>
                    ✓ {status}
                </Typography>
            )}
        </Paper>
    );
}

function StateInspector() {
    const { state, undoStackSize, redoStackSize, canUndo, canRedo } = useGameState<DemoState>();

    return (
        <Paper sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.6)', border: '1px solid', borderColor: 'primary.dark' }}>
            <Typography variant="h6" color="primary.main" gutterBottom>
                State Inspector
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={2}>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Undo Stack</Typography>
                        <Typography variant="h5" color={canUndo ? 'success.main' : 'text.secondary'}>
                            {undoStackSize}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Redo Stack</Typography>
                        <Typography variant="h5" color={canRedo ? 'success.main' : 'text.secondary'}>
                            {redoStackSize}
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Current State:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)', maxHeight: 200, overflow: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '11px', color: '#e0e0e0' }}>
                    {JSON.stringify(state, null, 2)}
                </pre>
            </Paper>
        </Paper>
    );
}

function StateDemoContent() {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" color="primary.main" gutterBottom>
                State Management Demo
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Interactive demonstration of game state, undo/redo, save/load, and checkpoints.
            </Typography>

            <Stack direction="row" spacing={0.5} sx={{ mb: 3 }}>
                <Chip label="GameState" size="small" variant="outlined" color="primary" />
                <Chip label="UndoStack" size="small" variant="outlined" color="primary" />
                <Chip label="SaveSystem" size="small" variant="outlined" color="primary" />
                <Chip label="Checkpoint" size="small" variant="outlined" color="primary" />
            </Stack>

            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                gap: 3 
            }}>
                <CounterSection />
                <SaveLoadSection />
                <CheckpointSection />
                <StateInspector />
            </Box>

            <Paper sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.6)' }}>
                <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
{`import { GameStateProvider, useGameState, useSaveLoad, useCheckpoint } from '@jbcom/strata';

interface MyState { count: number; items: string[]; }

function App() {
  return (
    <GameStateProvider initialState={{ count: 0, items: [] }}>
      <Counter />
    </GameStateProvider>
  );
}

function Counter() {
  const { state, patchState, undo, redo, canUndo, canRedo } = useGameState<MyState>();
  const { save, load } = useSaveLoad<MyState>();
  
  return (
    <div>
      <button onClick={() => patchState({ count: state.count + 1 })}>+</button>
      <span>{state.count}</span>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
      <button onClick={() => save('slot1')}>Save</button>
      <button onClick={() => load('slot1')}>Load</button>
    </div>
  );
}`}
                </Typography>
            </Paper>
        </Box>
    );
}

export default function StateDemo() {
    return (
        <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: '#0a0a0f' }}>
            <GameStateProvider initialState={INITIAL_STATE}>
                <StateDemoContent />
                <StateDebugger position="bottom-right" collapsed={true} />
            </GameStateProvider>
        </Box>
    );
}
