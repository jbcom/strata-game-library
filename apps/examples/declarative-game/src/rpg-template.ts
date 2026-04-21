import { createRPGGame } from 'strata-game-library';

export const rpgTemplate = createRPGGame({
  name: 'RPG Template',
  version: '1.0.0',
  world: { regions: {}, connections: [] },
  scenes: {
    gameplay: {
      render: () => null, // Add RPG world here
    },
  },
  modes: {
    exploration: { systems: [] },
    combat: { systems: [] },
    dialogue: { systems: [] },
  },
});
