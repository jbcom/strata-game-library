#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ignoredDirs = new Set(['docs', 'dist', 'node_modules', 'scripts']);
const scannedExtensions = new Set(['.json', '.md', '.ts', '.tsx']);
const legacyPackageName = ['@jbcom', 'strata'].join('/');
const buildableExamples = [
  'api-showcase',
  'basic-terrain',
  'sky-volumetrics',
  'vegetation-showcase',
  'water-scene',
  'world-topology',
];
const failures = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      files.push(...(await walk(path.join(dir, entry.name))));
      continue;
    }

    if (entry.isFile() && scannedExtensions.has(path.extname(entry.name))) {
      files.push(path.join(dir, entry.name));
    }
  }

  return files;
}

function relative(file) {
  return path.relative(root, file);
}

async function verifyLegacyImports(files) {
  for (const file of files) {
    const source = await readFile(file, 'utf8');

    if (source.includes(legacyPackageName)) {
      failures.push(`${relative(file)} still references ${legacyPackageName}`);
    }
  }
}

async function verifyExamplePackages() {
  const entries = await readdir(root, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || ignoredDirs.has(entry.name) || entry.name === 'scripts') continue;

    const packageJsonPath = path.join(root, entry.name, 'package.json');

    try {
      await stat(packageJsonPath);
    } catch {
      continue;
    }

    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    const dependencyGroups = [
      packageJson.dependencies ?? {},
      packageJson.devDependencies ?? {},
      packageJson.peerDependencies ?? {},
    ];
    const hasUmbrellaDependency = dependencyGroups.some((deps) => 'strata-game-library' in deps);

    if (!hasUmbrellaDependency) {
      failures.push(`${relative(packageJsonPath)} is missing strata-game-library dependency`);
    }
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: 'inherit',
      shell: false,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

async function verifyExampleBundles() {
  for (const example of buildableExamples) {
    const viteConfig = path.join(root, example, 'vite.config.ts');
    const indexHtml = path.join(root, example, 'index.html');

    try {
      await stat(viteConfig);
      await stat(indexHtml);
    } catch {
      failures.push(`${example} is missing vite.config.ts or index.html for bundle verification`);
      continue;
    }

    console.log(`Building example bundle: ${example}`);
    await run('pnpm', [
      'exec',
      'vite',
      'build',
      example,
      '--config',
      `${example}/vite.config.ts`,
      '--logLevel',
      'warn',
    ]);
  }
}

const files = await walk(root);
await verifyLegacyImports(files);
await verifyExamplePackages();

if (failures.length > 0) {
  console.error('Example verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

await verifyExampleBundles();

console.log(`Example verification passed for ${files.length} source/doc/package files.`);
