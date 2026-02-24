import type { Plugin } from 'vite';

export function strataVitePlugin(): Plugin {
	return {
		name: 'strata-vite-plugin',
		config() {
			return {
				optimizeDeps: {
					include: ['three'],
				},
			};
		},
	};
}
