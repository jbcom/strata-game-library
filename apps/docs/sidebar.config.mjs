/**
 * Strata Documentation Sidebar Configuration
 *
 * This file defines the sidebar navigation structure for the Starlight docs.
 * Extracted for maintainability as per PR feedback.
 */

export const sidebar = [
  {
    label: 'Getting Started',
    items: [
      { label: 'Introduction', link: '/getting-started/' },
      { label: 'Installation', link: '/getting-started/installation/' },
      { label: 'Quick Start', link: '/getting-started/quick-start/' },
      { label: 'Architecture', link: '/getting-started/architecture/' },
    ],
  },
  {
    label: 'Core Features',
    items: [
      { label: 'Overview', link: '/core/' },
      { label: '🏔️ Terrain', link: '/core/terrain/' },
      { label: '🌊 Water', link: '/core/water/' },
      { label: '🌿 Vegetation', link: '/core/vegetation/' },
      { label: '☀️ Sky & Atmosphere', link: '/core/sky/' },
      { label: '🌫️ Volumetrics', link: '/core/volumetrics/' },
      { label: '🎮 Characters', link: '/core/characters/' },
      { label: '🎨 Ray Marching', link: '/core/raymarching/' },
      { label: '🐕 Fur System', link: '/core/fur/' },
      { label: '🔬 Molecular', link: '/core/molecular/' },
    ],
  },
  {
    label: 'Shaders',
    items: [
      { label: 'Overview', link: '/shaders/' },
      { label: 'Terrain Shaders', link: '/shaders/terrain/' },
      { label: 'Water Shaders', link: '/shaders/water/' },
      { label: 'Sky & Atmosphere', link: '/shaders/sky/' },
      { label: 'Cloud Shaders', link: '/shaders/clouds/' },
      { label: 'Volumetric Effects', link: '/shaders/volumetrics/' },
      { label: 'Material Effects', link: '/shaders/materials/' },
      { label: 'Vegetation Wind', link: '/shaders/vegetation/' },
    ],
  },
  {
    label: 'Presets',
    items: [
      { label: 'Overview', link: '/presets/' },
      { label: 'Terrain Presets', link: '/presets/terrain/' },
      { label: 'Weather Presets', link: '/presets/weather/' },
      { label: 'Water Presets', link: '/presets/water/' },
      { label: 'Vegetation Presets', link: '/presets/vegetation/' },
      { label: 'Cloud Presets', link: '/presets/clouds/' },
      { label: 'Camera Presets', link: '/presets/camera/' },
      { label: 'Animation Presets', link: '/presets/animation/' },
      { label: 'Physics Presets', link: '/presets/physics/' },
      { label: 'Audio Presets', link: '/presets/audio/' },
    ],
  },
  {
    label: 'Mobile Plugins',
    items: [
      { label: 'Overview', link: '/mobile/' },
      { label: 'React Native Plugin', link: '/mobile/react-native/' },
      { label: 'Capacitor Plugin', link: '/mobile/capacitor/' },
    ],
  },
  {
    label: 'Showcase',
    items: [
      { label: 'Live Examples', link: '/showcase/' },
      { label: 'Terrain Demo', link: '/showcase/terrain/' },
      { label: 'Water Demo', link: '/showcase/water/' },
      { label: 'Vegetation Demo', link: '/showcase/vegetation/' },
      { label: 'Sky & Volumetrics Demo', link: '/showcase/sky/' },
      { label: 'Full Scene Demo', link: '/showcase/full-scene/' },
    ],
  },
  {
    label: 'API Reference',
    items: [
      { label: 'Overview', link: '/api/' },
      { label: 'Components', link: '/api/components/' },
      { label: 'Hooks', link: '/api/hooks/' },
      { label: 'Core Functions', link: '/api/functions/' },
      { label: 'Types', link: '/api/types/' },
    ],
  },
  {
    label: 'Guides',
    items: [
      { label: 'Performance Tips', link: '/guides/performance/' },
      { label: 'TypeScript Usage', link: '/guides/typescript/' },
      { label: 'Contributing', link: '/guides/contributing/' },
    ],
  },
  {
    label: 'Enterprise',
    items: [
      { label: 'jbcom Hub', link: 'https://jbcom.github.io', attrs: { target: '_blank' } },
      { label: 'Agentic (AI)', link: 'https://agentic.dev', attrs: { target: '_blank' } },
      { label: 'Extended Data', link: 'https://extendeddata.dev', attrs: { target: '_blank' } },
    ],
  },
];
