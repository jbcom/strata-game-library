import { createPlatformerGame } from 'strata-game-library';

export const platformerTemplate = createPlatformerGame({
  name: 'Platformer Template',
  version: '1.0.0',
  world: { regions: {}, connections: [] },
  scenes: {
    level1: {
      render: () => null, // Add level 1 here
    },
  },
  modes: {
    platforming: { systems: [] },
  },
});
