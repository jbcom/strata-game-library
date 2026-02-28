/**
 * Tests for the CSS token and style exports.
 *
 * Validates that all CSS files exist, have valid content, and contain
 * expected design tokens and selectors.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';

const CSS_DIR = resolve(__dirname, '../src/css');

describe('CSS files existence', () => {
	const cssFiles = ['tokens.css', 'components.css', 'starlight.css'];

	it.each(cssFiles)('%s should exist in src/css/', (filename) => {
		const filepath = resolve(CSS_DIR, filename);
		expect(existsSync(filepath)).toBe(true);
	});

	it.each(cssFiles)('%s should have non-empty content', (filename) => {
		const filepath = resolve(CSS_DIR, filename);
		const content = readFileSync(filepath, 'utf-8');
		expect(content.trim().length).toBeGreaterThan(0);
	});
});

describe('tokens.css', () => {
	let content: string;

	beforeAll(() => {
		content = readFileSync(resolve(CSS_DIR, 'tokens.css'), 'utf-8');
	});

	describe('dark mode tokens (:root)', () => {
		it('should define --sl-color-accent-low', () => {
			expect(content).toContain('--sl-color-accent-low');
		});

		it('should define --sl-color-accent', () => {
			expect(content).toContain('--sl-color-accent:');
		});

		it('should define --sl-color-accent-high', () => {
			expect(content).toContain('--sl-color-accent-high');
		});

		it('should define --sl-color-text-accent', () => {
			expect(content).toContain('--sl-color-text-accent');
		});

		it('should define background tokens', () => {
			expect(content).toContain('--sl-color-bg:');
			expect(content).toContain('--sl-color-bg-nav');
			expect(content).toContain('--sl-color-bg-sidebar');
		});

		it('should define text/gray tokens', () => {
			expect(content).toContain('--sl-color-white');
			expect(content).toContain('--sl-color-gray-1');
			expect(content).toContain('--sl-color-gray-2');
			expect(content).toContain('--sl-color-gray-3');
			expect(content).toContain('--sl-color-gray-4');
			expect(content).toContain('--sl-color-gray-5');
			expect(content).toContain('--sl-color-gray-6');
		});
	});

	describe('typography tokens', () => {
		it('should define --sl-font with Space Grotesk', () => {
			expect(content).toContain('--sl-font:');
			expect(content).toContain('Space Grotesk');
		});

		it('should define --sl-font-mono with JetBrains Mono', () => {
			expect(content).toContain('--sl-font-mono:');
			expect(content).toContain('JetBrains Mono');
		});

		it('should import Google Fonts', () => {
			expect(content).toContain('@import url(');
			expect(content).toContain('fonts.googleapis.com');
		});
	});

	describe('strata-specific tokens', () => {
		it('should define --strata-gradient', () => {
			expect(content).toContain('--strata-gradient:');
		});

		it('should define --strata-gradient-subtle', () => {
			expect(content).toContain('--strata-gradient-subtle:');
		});

		it('should define --strata-glow', () => {
			expect(content).toContain('--strata-glow:');
		});

		it('should define --strata-border', () => {
			expect(content).toContain('--strata-border:');
		});

		it('should define --strata-radius', () => {
			expect(content).toContain('--strata-radius:');
		});
	});

	describe('light mode overrides', () => {
		it('should have a light mode section', () => {
			expect(content).toContain("[data-theme='light']");
		});

		it('should override accent tokens in light mode', () => {
			// Match that the light mode block redefines accent colors
			const lightModeMatch = content.match(
				/\[data-theme='light'\]\s*\{[^}]*--sl-color-accent-low/,
			);
			expect(lightModeMatch).not.toBeNull();
		});

		it('should override background tokens in light mode', () => {
			const lightModeMatch = content.match(
				/\[data-theme='light'\]\s*\{[^}]*--sl-color-bg:/,
			);
			expect(lightModeMatch).not.toBeNull();
		});
	});

	describe('global styles', () => {
		it('should set heading font family', () => {
			expect(content).toContain('h1, h2, h3, h4, h5, h6');
			expect(content).toContain('font-weight: 700');
		});

		it('should define selection color', () => {
			expect(content).toContain('::selection');
		});

		it('should define scrollbar styles', () => {
			expect(content).toContain('::-webkit-scrollbar');
			expect(content).toContain('::-webkit-scrollbar-track');
			expect(content).toContain('::-webkit-scrollbar-thumb');
		});
	});
});

describe('starlight.css', () => {
	let content: string;

	beforeAll(() => {
		content = readFileSync(resolve(CSS_DIR, 'starlight.css'), 'utf-8');
	});

	describe('header/nav styles', () => {
		it('should style the header with backdrop-filter', () => {
			expect(content).toContain('header.header');
			expect(content).toContain('backdrop-filter');
		});

		it('should style the site-title', () => {
			expect(content).toContain('.site-title');
			expect(content).toContain('text-transform: uppercase');
		});
	});

	describe('hero section', () => {
		it('should have hero styles', () => {
			expect(content).toContain('.hero');
		});

		it('should define heroMesh animation keyframes', () => {
			expect(content).toContain('@keyframes heroMesh');
		});

		it('should style hero h1 with gradient background', () => {
			expect(content).toContain('.hero h1');
			expect(content).toContain('background-clip: text');
		});

		it('should style hero tagline', () => {
			expect(content).toContain('.hero .tagline');
		});

		it('should style hero CTA buttons', () => {
			expect(content).toContain('.hero .action');
			expect(content).toContain('.hero .action.primary');
		});

		it('should have light mode hero overrides', () => {
			expect(content).toContain(":root[data-theme='light'] .hero h1");
		});
	});

	describe('sidebar styles', () => {
		it('should style the sidebar navigation', () => {
			expect(content).toContain('nav.sidebar');
		});

		it('should highlight current page in sidebar', () => {
			expect(content).toContain("aria-current='page'");
		});
	});

	describe('content area styles', () => {
		it('should add gradient underline to h2 headings', () => {
			expect(content).toContain('main h2');
			expect(content).toContain('main h2::after');
		});

		it('should style pagination links', () => {
			expect(content).toContain('a.pagination-link');
		});

		it('should style table of contents', () => {
			expect(content).toContain('starlight-toc');
		});

		it('should style aside/callout elements', () => {
			expect(content).toContain('.starlight-aside');
		});

		it('should style search dialog', () => {
			expect(content).toContain('dialog[aria-label="Search"]');
		});

		it('should style footer', () => {
			expect(content).toContain('.site-footer');
		});
	});

	describe('responsive styles', () => {
		it('should have responsive breakpoints', () => {
			expect(content).toContain('@media (max-width: 768px)');
		});

		it('should adjust hero padding on mobile', () => {
			const mobileSection = content.slice(content.indexOf('@media (max-width: 768px)'));
			expect(mobileSection).toContain('.hero');
		});
	});
});

describe('components.css', () => {
	let content: string;

	beforeAll(() => {
		content = readFileSync(resolve(CSS_DIR, 'components.css'), 'utf-8');
	});

	describe('card components', () => {
		it('should define .card styles', () => {
			expect(content).toContain('.card');
		});

		it('should define card hover effects', () => {
			expect(content).toContain('.card:hover');
		});

		it('should define link card styles', () => {
			expect(content).toContain('.sl-link-card');
		});
	});

	describe('code block styles', () => {
		it('should style expressive-code blocks', () => {
			expect(content).toContain('.expressive-code');
		});

		it('should apply font-family to code blocks', () => {
			expect(content).toContain('.expressive-code pre');
			expect(content).toContain('var(--sl-font-mono)');
		});
	});

	describe('table styles', () => {
		it('should style tables with border-collapse: separate', () => {
			expect(content).toContain('border-collapse: separate');
		});

		it('should style table headers', () => {
			expect(content).toContain('table th');
		});

		it('should style table hover', () => {
			expect(content).toContain('table tr:hover td');
		});
	});

	describe('badge styles', () => {
		it('should define .badge base styles', () => {
			expect(content).toContain('.badge');
		});

		it('should define badge color variants', () => {
			expect(content).toContain('.badge-teal');
			expect(content).toContain('.badge-amber');
			expect(content).toContain('.badge-green');
		});

		it('should have light mode badge overrides', () => {
			expect(content).toContain(":root[data-theme='light'] .badge-teal");
			expect(content).toContain(":root[data-theme='light'] .badge-amber");
			expect(content).toContain(":root[data-theme='light'] .badge-green");
		});
	});

	describe('feature grid', () => {
		it('should define .feature-grid layout', () => {
			expect(content).toContain('.feature-grid');
			expect(content).toContain('grid-template-columns');
		});

		it('should define .feature-card styles', () => {
			expect(content).toContain('.feature-card');
		});

		it('should define featured card variant', () => {
			expect(content).toContain('.feature-card.featured');
		});

		it('should define .feature-icon styles', () => {
			expect(content).toContain('.feature-icon');
		});

		it('should define .feature-tag styles', () => {
			expect(content).toContain('.feature-tag');
		});
	});

	describe('mission block', () => {
		it('should define .mission-block styles', () => {
			expect(content).toContain('.mission-block');
		});

		it('should style blockquote inside mission block', () => {
			expect(content).toContain('.mission-block blockquote');
		});
	});

	describe('package grid', () => {
		it('should define .package-grid layout', () => {
			expect(content).toContain('.package-grid');
		});

		it('should define .package-card styles', () => {
			expect(content).toContain('.package-card');
		});

		it('should define package badge styles', () => {
			expect(content).toContain('.package-badge');
			expect(content).toContain('.package-badge.new');
		});

		it('should define package primary variant', () => {
			expect(content).toContain('.package-primary');
		});
	});

	describe('stats grid', () => {
		it('should define .stats-grid layout', () => {
			expect(content).toContain('.stats-grid');
		});

		it('should define .stat-number with gradient text', () => {
			expect(content).toContain('.stat-number');
			expect(content).toContain('background-clip: text');
		});

		it('should define .stat-label and .stat-detail', () => {
			expect(content).toContain('.stat-label');
			expect(content).toContain('.stat-detail');
		});
	});

	describe('layer stack', () => {
		it('should define .layer-stack layout', () => {
			expect(content).toContain('.layer-stack');
		});

		it('should define layer color variants (0-4)', () => {
			expect(content).toContain('.layer-0');
			expect(content).toContain('.layer-1');
			expect(content).toContain('.layer-2');
			expect(content).toContain('.layer-3');
			expect(content).toContain('.layer-4');
		});

		it('should have light mode layer overrides', () => {
			expect(content).toContain(":root[data-theme='light'] .layer-0");
			expect(content).toContain(":root[data-theme='light'] .layer-4");
		});
	});

	describe('demo containers', () => {
		it('should define .strata-demo-container styles', () => {
			expect(content).toContain('.strata-demo-container');
		});

		it('should define .strata-demo-badge styles', () => {
			expect(content).toContain('.strata-demo-badge');
		});

		it('should define .showcase-demo styles', () => {
			expect(content).toContain('.showcase-demo');
		});

		it('should define showcase demo badge', () => {
			expect(content).toContain('.showcase-demo-badge');
		});

		it('should define demo actions', () => {
			expect(content).toContain('.demo-actions');
		});

		it('should define showcase feature pills', () => {
			expect(content).toContain('.showcase-features');
			expect(content).toContain('.showcase-features .pill');
		});
	});

	describe('comparison section', () => {
		it('should define comparison layout', () => {
			expect(content).toContain('.comparison-section');
			expect(content).toContain('.comparison-header');
			expect(content).toContain('.comparison-grid');
		});

		it('should define before/after comparison styles', () => {
			expect(content).toContain('.comparison-before');
			expect(content).toContain('.comparison-after');
		});

		it('should define VS badge', () => {
			expect(content).toContain('.comparison-vs');
		});
	});

	describe('scroll animations', () => {
		it('should define fadeSlideUp animation', () => {
			expect(content).toContain('@keyframes fadeSlideUp');
		});

		it('should respect prefers-reduced-motion', () => {
			expect(content).toContain('prefers-reduced-motion: no-preference');
		});
	});

	describe('responsive styles', () => {
		it('should have 768px breakpoint', () => {
			expect(content).toContain('@media (max-width: 768px)');
		});

		it('should have 480px breakpoint', () => {
			expect(content).toContain('@media (max-width: 480px)');
		});

		it('should collapse feature grid to single column on mobile', () => {
			const mobileSection = content.slice(content.indexOf('@media (max-width: 768px)'));
			expect(mobileSection).toContain('.feature-grid');
			expect(mobileSection).toContain('grid-template-columns: 1fr');
		});
	});

	describe('callout styles', () => {
		it('should define .callout base styles', () => {
			expect(content).toContain('.callout');
		});

		it('should define .callout-highlight variant', () => {
			expect(content).toContain('.callout-highlight');
		});
	});

	describe('horizontal rule styles', () => {
		it('should style hr with gradient', () => {
			expect(content).toContain('hr');
			expect(content).toContain('linear-gradient');
		});
	});
});

describe('CSS file consistency', () => {
	const cssFiles = [
		{ name: 'tokens.css', path: resolve(CSS_DIR, 'tokens.css') },
		{ name: 'components.css', path: resolve(CSS_DIR, 'components.css') },
		{ name: 'starlight.css', path: resolve(CSS_DIR, 'starlight.css') },
	];

	it.each(cssFiles)('$name should be valid CSS (no unclosed braces)', ({ path }) => {
		const content = readFileSync(path, 'utf-8');
		// Strip comments first
		const noComments = content.replace(/\/\*[\s\S]*?\*\//g, '');
		const openBraces = (noComments.match(/\{/g) || []).length;
		const closeBraces = (noComments.match(/\}/g) || []).length;
		expect(openBraces).toBe(closeBraces);
	});

	it.each(cssFiles)(
		'$name should reference strata design tokens',
		({ name, path }) => {
			const content = readFileSync(path, 'utf-8');
			// All CSS files should reference the strata tokens (directly or transitively)
			if (name === 'tokens.css') {
				// Tokens defines them
				expect(content).toContain('--strata-');
			} else {
				// Other files use them
				expect(content).toContain('var(--strata-');
			}
		},
	);
});
