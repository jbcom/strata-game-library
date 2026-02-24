import { createGame, createRPGState, StrataGame } from '@jbcom/strata/api';
import React from 'react';

const myGame = createGame({
  name: 'My Declarative Game',
  version: '1.0.0',
  content: {
    materials: [],
    creatures: [],
    props: [],
    items: [],
  },
  world: {
    regions: {
      start: {
        name: 'Start Region',
        center: [0, 0, 0],
        radius: 50,
      },
    },
    connections: [],
  },
  scenes: {
    main: {
      id: 'main',
      render: () => (
        <>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <mesh>
            <boxGeometry />
            <meshStandardMaterial color="orange" />
          </mesh>
        </>
      ),
      ui: () => <div>Welcome to my Game!</div>,
    },
  },
  initialScene: 'main',
  modes: {
    exploration: {
      id: 'exploration',
      systems: [],
      inputMap: {},
      ui: () => <div>Exploration Mode Active</div>,
    },
  },
  defaultMode: 'exploration',
  statePreset: 'rpg',
  initialState: createRPGState({
    player: { name: 'Explorer', level: 1, experience: 0, health: 100, maxHealth: 100, stats: {} },
  }),
  controls: {},
});

export default function App() {
  return <StrataGame game={myGame}>{/* Additional custom components can go here */}</StrataGame>;
}
