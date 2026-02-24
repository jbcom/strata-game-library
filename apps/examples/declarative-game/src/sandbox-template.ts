import { createGame } from '@jbcom/strata/api';

export const sandboxTemplate = createGame({
  name: 'Sandbox Template',
  version: '1.0.0',
  content: {
    materials: [],
    creatures: [],
    props: [],
    items: [],
  },
  world: { regions: {}, connections: [] },
  scenes: {
    world: {
      id: 'world',
      render: () => null, // Add sandbox world here
    },
  },
  initialScene: 'world',
  modes: {
    creative: { id: 'creative', systems: [], inputMap: {} },
    survival: { id: 'survival', systems: [], inputMap: {} },
  },
  defaultMode: 'creative',
  statePreset: 'sandbox',
  controls: {},
});
