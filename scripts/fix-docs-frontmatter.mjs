#!/usr/bin/env node
/**
 * Adds Starlight-compatible YAML frontmatter to TypeDoc-generated markdown files
 * that are missing it. Starlight requires every .md file in the content collection
 * to have a `---\ntitle: ...\n---` block at the top.
 *
 * Usage: node scripts/fix-docs-frontmatter.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const docsRoot = join(repoRoot, 'apps/docs/src/content/docs');

function findMdFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...findMdFiles(fullPath));
    } else if (entry.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function deriveTitle(filePath) {
  const name = basename(filePath, '.md');

  if (name === 'README') {
    const pkg = basename(dirname(filePath));
    return pkg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  if (name === 'globals') return 'API Reference';
  if (name === 'index') {
    const parent = basename(dirname(filePath));
    return parent.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return name;
}

function hasFrontmatter(content) {
  return content.trimStart().startsWith('---');
}

const files = findMdFiles(docsRoot);
let fixed = 0;
let skipped = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf-8');

  if (hasFrontmatter(content)) {
    skipped++;
    continue;
  }

  const title = deriveTitle(file);
  const frontmatter = `---\ntitle: "${title}"\n---\n\n`;
  writeFileSync(file, frontmatter + content);
  fixed++;
}

console.log(`Done. Fixed: ${fixed}, Already had frontmatter: ${skipped}, Total: ${files.length}`);
