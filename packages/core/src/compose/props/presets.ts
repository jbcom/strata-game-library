import type { PropDefinition } from './types';

export const PROPS: Record<string, PropDefinition> = {
  crate_wooden: {
    id: 'crate_wooden',
    name: 'Wooden Crate',
    components: [
      // Wood panels (6 sides)
      { shape: 'box', size: [1, 0.05, 1], position: [0, -0.475, 0], material: 'wood_oak' },
      { shape: 'box', size: [1, 0.05, 1], position: [0, 0.475, 0], material: 'wood_oak' },
      { shape: 'box', size: [0.05, 0.9, 1], position: [-0.475, 0, 0], material: 'wood_oak' },
      { shape: 'box', size: [0.05, 0.9, 1], position: [0.475, 0, 0], material: 'wood_oak' },
      {
        shape: 'box',
        size: [0.9, 0.9, 0.05],
        position: [0, 0, -0.475],
        material: 'wood_oak',
      },
      { shape: 'box', size: [0.9, 0.9, 0.05], position: [0, 0, 0.475], material: 'wood_oak' },
      // Metal bands
      {
        shape: 'box',
        size: [1.05, 0.03, 0.02],
        position: [0, 0.3, 0.49],
        material: 'metal_iron',
      },
      {
        shape: 'box',
        size: [1.05, 0.03, 0.02],
        position: [0, -0.3, 0.49],
        material: 'metal_iron',
      },
      {
        shape: 'box',
        size: [0.02, 0.03, 1.05],
        position: [0.49, 0.3, 0],
        material: 'metal_iron',
      },
      {
        shape: 'box',
        size: [0.02, 0.03, 1.05],
        position: [0.49, -0.3, 0],
        material: 'metal_iron',
      },
    ],
    physics: { type: 'dynamic', mass: 25, friction: 0.6 },
    interaction: { type: 'container', capacity: 10 },
    audio: { impact: 'wood_thud', interaction: 'crate_open' },
  },
  chair_wooden: {
    id: 'chair_wooden',
    name: 'Wooden Chair',
    components: [
      // Seat
      {
        shape: 'box',
        size: [0.45, 0.03, 0.45],
        position: [0, 0.45, 0],
        material: 'wood_oak',
      },
      // Backrest
      {
        shape: 'box',
        size: [0.45, 0.5, 0.03],
        position: [0, 0.72, -0.21],
        material: 'wood_oak',
      },
      // Legs
      {
        shape: 'box',
        size: [0.03, 0.45, 0.03],
        position: [-0.19, 0.225, 0.19],
        material: 'wood_oak',
      },
      {
        shape: 'box',
        size: [0.03, 0.45, 0.03],
        position: [0.19, 0.225, 0.19],
        material: 'wood_oak',
      },
      {
        shape: 'box',
        size: [0.03, 0.45, 0.03],
        position: [-0.19, 0.225, -0.19],
        material: 'wood_oak',
      },
      {
        shape: 'box',
        size: [0.03, 0.45, 0.03],
        position: [0.19, 0.225, -0.19],
        material: 'wood_oak',
      },
    ],
    physics: { type: 'dynamic', mass: 5, friction: 0.5 },
    interaction: { type: 'seat' },
  },
};
