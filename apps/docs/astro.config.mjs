// @ts-check

import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import { sidebar } from './sidebar.config.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://strata.game',
  integrations: [
    starlight({
      title: 'Strata',
      description:
        'Layer by Layer, World by World — The complete game framework for procedural 3D worlds in React Three Fiber',
      customCss: ['./src/styles/custom.css'],
      logo: {
        light: './src/assets/strata-logo.svg',
        dark: './src/assets/strata-logo.svg',
        replacesTitle: true,
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/jbcom/strata-game-library' },
      ],
      head: [
        // Font preloading for Space Grotesk
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: '',
          },
        },
        // Open Graph
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://strata.game/og-image.png',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:type',
            content: 'website',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:site_name',
            content: 'Strata Game Library',
          },
        },
        // Twitter
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:card',
            content: 'summary_large_image',
          },
        },
        // Theme color
        {
          tag: 'meta',
          attrs: {
            name: 'theme-color',
            content: '#0b1120',
          },
        },
      ],
      sidebar,
      components: {
        // Override Starlight components for custom rendering
        // We can add custom component overrides here as needed
      },
    }),
    react(),
  ],
  vite: {
    ssr: {
      // Three.js and R3F need to be externalized in SSR
      noExternal: ['@react-three/fiber', '@react-three/drei', 'three'],
    },
  },
});
