import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DOCS_ROOT = resolve(import.meta.dirname, '../../src/content/docs');

/** Recursively collect all .md and .mdx files */
function collectMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectMarkdownFiles(full));
    } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
      files.push(full);
    }
  }
  return files;
}

const allDocs = collectMarkdownFiles(DOCS_ROOT);

describe('Documentation content', () => {
  it('has content files', () => {
    expect(allDocs.length).toBeGreaterThan(0);
  });

  it('has at least 100 documentation pages', () => {
    // We expect 312+ pages from the full TypeDoc + manual docs
    expect(allDocs.length).toBeGreaterThanOrEqual(100);
  });

  it('every markdown file has frontmatter', () => {
    const missing: string[] = [];
    for (const file of allDocs) {
      const content = readFileSync(file, 'utf-8');
      if (!content.startsWith('---')) {
        missing.push(file.replace(DOCS_ROOT, ''));
      }
    }
    expect(missing).toEqual([]);
  });

  it('every markdown file has a title in frontmatter', () => {
    const missing: string[] = [];
    for (const file of allDocs) {
      const content = readFileSync(file, 'utf-8');
      const frontmatterEnd = content.indexOf('---', 3);
      if (frontmatterEnd === -1) continue;
      const frontmatter = content.slice(0, frontmatterEnd);
      if (!frontmatter.includes('title:')) {
        missing.push(file.replace(DOCS_ROOT, ''));
      }
    }
    expect(missing).toEqual([]);
  });
});

describe('Sidebar configuration', () => {
  it('exports a valid sidebar array', async () => {
    const { sidebar } = await import('../../sidebar.config.mjs');
    expect(Array.isArray(sidebar)).toBe(true);
    expect(sidebar.length).toBeGreaterThan(0);
  });

  it('every sidebar section has a label and items', async () => {
    const { sidebar } = await import('../../sidebar.config.mjs');
    for (const section of sidebar) {
      expect(section).toHaveProperty('label');
      expect(section).toHaveProperty('items');
      expect(Array.isArray(section.items)).toBe(true);
    }
  });

  it('all internal sidebar links start with /', async () => {
    const { sidebar } = await import('../../sidebar.config.mjs');
    const badLinks: string[] = [];
    for (const section of sidebar) {
      for (const item of section.items) {
        if (item.link && !item.link.startsWith('/') && !item.link.startsWith('http')) {
          badLinks.push(`${section.label} > ${item.label}: ${item.link}`);
        }
      }
    }
    expect(badLinks).toEqual([]);
  });
});

describe('Key documentation sections exist', () => {
  const requiredSections = [
    'getting-started',
    'core',
    'shaders',
    'presets',
    'api',
  ];

  for (const section of requiredSections) {
    it(`has ${section} section`, () => {
      const sectionPath = join(DOCS_ROOT, section);
      expect(statSync(sectionPath).isDirectory()).toBe(true);
    });
  }

  it('has landing page (index.mdx)', () => {
    const indexPath = join(DOCS_ROOT, 'index.mdx');
    expect(statSync(indexPath).isFile()).toBe(true);
  });
});
