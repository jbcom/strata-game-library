import { createGame } from '@jbcom/strata/api';

export const platformerTemplate = createGame({
  name: 'Platformer Template',
  version: '1.0.0',
  content: {
    materials: [],
    creatures: [],
    props: [],
    items: [],
  },
  world: { regions: {}, connections: [] },
  scenes: {
    level1: {
      id: 'level1',
      render: () => null, // Add level 1 here
    },
  },
  initialScene: 'level1',
  modes: {
    platforming: { id: 'platforming', systems: [], inputMap: {} },
  },
  defaultMode: 'platforming',
  statePreset: 'action',
  controls: {},
});
