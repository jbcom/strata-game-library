import { createGame } from '@jbcom/strata/api';

export const rpgTemplate = createGame({
  name: 'RPG Template',
  version: '1.0.0',
  content: {
    materials: [],
    creatures: [],
    props: [],
    items: [],
  },
  world: { regions: {}, connections: [] },
  scenes: {
    gameplay: {
      id: 'gameplay',
      render: () => null, // Add RPG world here
    },
  },
  initialScene: 'gameplay',
  modes: {
    exploration: { id: 'exploration', systems: [], inputMap: {} },
    combat: { id: 'combat', systems: [], inputMap: {} },
    dialogue: { id: 'dialogue', systems: [], inputMap: {} },
  },
  defaultMode: 'exploration',
  statePreset: 'rpg',
  controls: {},
});
