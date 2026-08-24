import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { getPublishablePackages, workspaceRoot } from './workspace-packages.mjs';

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: workspaceRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
}

function exportTargets(value) {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object') return [];
  return Object.values(value).flatMap(exportTargets);
}

function targetExists(files, target) {
  const normalized = target.replace(/^\.\//, '');
  if (!normalized.includes('*')) return files.has(normalized);

  const [prefix, suffix] = normalized.split('*');
  return [...files].some((file) => file.startsWith(prefix) && file.endsWith(suffix));
}

function metadataErrors(manifest, directory) {
  const errors = [];
  const required = ['name', 'version', 'description', 'license', 'repository', 'homepage', 'bugs'];

  for (const key of required) {
    if (!manifest[key]) errors.push(`${directory}: missing package metadata field ${key}`);
  }

  if (manifest.publishConfig?.access !== 'public') {
    errors.push(`${directory}: publishConfig.access must be public`);
  }
  if (!manifest.files?.length) errors.push(`${directory}: files allowlist is required`);
  if (!manifest.exports) errors.push(`${directory}: exports map is required`);
  if (manifest.packageManager) errors.push(`${directory}: published manifests must not pin a package manager`);

  return errors;
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'strata-pack-'));

try {
  const packages = await getPublishablePackages();
  const errors = [];
  const tarballs = [];

  for (const { directory, manifest } of packages) {
    const displayDirectory = relative(workspaceRoot, directory);
    errors.push(...metadataErrors(manifest, displayDirectory));

    const packed = JSON.parse(
      run('pnpm', ['--dir', directory, 'pack', '--json', '--pack-destination', temporaryDirectory])
    );
    const files = new Set(packed.files.map((file) => file.path));
    tarballs.push(packed.filename);

    for (const requiredFile of ['LICENSE', 'README.md', 'package.json']) {
      if (!files.has(requiredFile)) {
        errors.push(`${displayDirectory}: packed artifact is missing ${requiredFile}`);
      }
    }

    for (const [subpath, conditions] of Object.entries(manifest.exports ?? {})) {
      for (const target of exportTargets(conditions)) {
        if (!targetExists(files, target)) {
          errors.push(`${displayDirectory}: export ${subpath} points to missing packed file ${target}`);
        }
      }
    }

    const packedManifest = JSON.parse(
      run('tar', ['-xOf', packed.filename, 'package/package.json'])
    );
    const packedManifestText = JSON.stringify(packedManifest);
    if (packedManifestText.includes('workspace:')) {
      errors.push(`${displayDirectory}: packed manifest still contains workspace: dependency ranges`);
    }

    for (const file of packed.files.filter((item) => item.path.endsWith('.d.ts'))) {
      const declaration = run('tar', ['-xOf', packed.filename, `package/${file.path}`]);
      if (/\b(?:from\s+|import\s*(?:\(\s*)?)['"]@strata-game-library\//.test(declaration)) {
        errors.push(`${displayDirectory}: packed declaration ${file.path} references a private workspace package`);
      }
    }
  }

  if (errors.length) {
    throw new Error(`Package validation failed:\n- ${errors.join('\n- ')}`);
  }

  const consumerDirectory = join(temporaryDirectory, 'consumer');
  await mkdir(consumerDirectory);
  await writeFile(
    join(consumerDirectory, 'package.json'),
    JSON.stringify({ name: 'strata-package-consumer', private: true, type: 'module' }, null, 2)
  );
  run(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--legacy-peer-deps',
      '--no-audit',
      '--no-fund',
      ...tarballs,
      'react@latest',
      'react-dom@latest',
      'three@latest',
      '@react-three/fiber@latest',
      '@react-three/drei@latest',
      'typescript@latest',
      'zustand@latest',
      'yuka@latest',
    ],
    { cwd: consumerDirectory, stdio: 'pipe' }
  );
  await writeFile(
    join(consumerDirectory, 'consumer.mjs'),
    [
      "import * as strata from 'strata-game-library';",
      "import { normalizeJoystick } from 'strata-game-library/core';",
      "import { YukaEntityManager } from 'strata-game-library/yuka';",
      "if (typeof strata.createGame !== 'function') throw new Error('createGame export is unavailable');",
      "const value = normalizeJoystick({ x: 75, y: 0 }, 100, 0.2);",
      "if (!Number.isFinite(value.x)) throw new Error('core input export is not executable');",
      "if (typeof YukaEntityManager !== 'function') throw new Error('Yuka adapter export is unavailable');",
      "console.log('consumer-smoke-ok');",
    ].join('\n')
  );
  run('node', ['consumer.mjs'], { cwd: consumerDirectory, stdio: 'inherit' });
  await writeFile(
    join(consumerDirectory, 'consumer.ts'),
    [
      "import { createGame } from 'strata-game-library';",
      "import { normalizeJoystick } from 'strata-game-library/core';",
      "import { YukaEntityManager } from 'strata-game-library/yuka';",
      'void createGame;',
      'void normalizeJoystick;',
      'void YukaEntityManager;',
    ].join('\n')
  );
  run('node', ['node_modules/typescript/bin/tsc', '--noEmit', '--skipLibCheck', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', 'consumer.ts'], {
    cwd: consumerDirectory,
    stdio: 'inherit',
  });

  console.log(`Validated ${packages.length} package tarballs and a clean consumer install.`);
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
