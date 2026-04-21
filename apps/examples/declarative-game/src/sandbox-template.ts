import { createSandboxGame } from 'strata-game-library';

export const sandboxTemplate = createSandboxGame({
  name: 'Sandbox Template',
  version: '1.0.0',
  world: { regions: {}, connections: [] },
  scenes: {
    world: {
      render: () => null, // Add sandbox world here
    },
  },
  modes: {
    creative: { systems: [] },
    survival: { systems: [] },
  },
});
