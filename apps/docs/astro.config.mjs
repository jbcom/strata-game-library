// @ts-check

import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import { sidebar } from './sidebar.config.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://strata.game',
  integrations: [
    starlight({
      title: 'Strata',
      description:
        'Layer by Layer, World by World - Procedural 3D graphics library for React Three Fiber',
      customCss: ['./src/styles/custom.css'],
      logo: {
        light: './src/assets/strata-logo.svg',
        dark: './src/assets/strata-logo.svg',
      },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/strata-game-library' }],
      head: [
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
            name: 'twitter:card',
            content: 'summary_large_image',
          },
        },
      ],
      sidebar,
    }),
  ],
});
