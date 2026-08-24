import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDist = join(root, 'packages/strata-game-library/dist');
const internalRoot = join(publicDist, 'internal');

const privatePackages = {
  '@strata-game-library/core': { source: 'packages/core', target: 'core' },
  '@strata-game-library/shaders': { source: 'packages/shaders', target: 'shaders' },
  '@strata-game-library/presets': { source: 'packages/presets', target: 'presets' },
  '@strata-game-library/r3f': { source: 'adapters/r3f', target: 'r3f' },
  '@strata-game-library/reactylon': { source: 'adapters/reactylon', target: 'reactylon' },
  '@strata-game-library/pixi': { source: 'adapters/pixi', target: 'pixi' },
  '@strata-game-library/audio-synth': { source: 'plugins/audio-synth', target: 'audio-synth' },
  '@strata-game-library/model-synth': { source: 'plugins/model-synth', target: 'model-synth' },
  '@strata-game-library/capacitor': { source: 'plugins/capacitor', target: 'capacitor' },
  '@strata-game-library/react-native': { source: 'plugins/react-native', target: 'react-native' },
  '@strata-game-library/astro': { source: 'plugins/astro', target: 'astro' },
  '@strata-game-library/yuka': { source: 'adapters/yuka', target: 'yuka' },
};

const manifests = await Promise.all(
  Object.entries(privatePackages).map(async ([name, packageInfo]) => [
    name,
    { ...packageInfo, manifest: JSON.parse(await readFile(join(root, packageInfo.source, 'package.json'), 'utf8')) },
  ])
);
const packages = new Map(manifests);

function exportedTypeFile(packageInfo, subpath) {
  const key = subpath ? `./${subpath}` : '.';
  const entry = packageInfo.manifest.exports[key] ?? packageInfo.manifest.exports['.'];
  const types = typeof entry === 'string' ? entry : entry?.types;
  if (!types) throw new Error(`No declaration target for ${packageInfo.manifest.name}${subpath ? `/${subpath}` : ''}`);
  return join(internalRoot, packageInfo.target, types.replace(/^\.\/dist\//, '').replace(/^\.\//, ''));
}

function privateSpecifierReplacement(currentFile, specifier) {
  const match = [...packages.keys()].sort((a, b) => b.length - a.length).find(
    (name) => specifier === name || specifier.startsWith(`${name}/`)
  );
  if (!match) return specifier;
  const packageInfo = packages.get(match);
  const target = exportedTypeFile(packageInfo, specifier.slice(match.length).replace(/^\//, ''));
  let path = relative(dirname(currentFile), target).replace(/\\/g, '/').replace(/\.d\.ts$/, '.js');
  if (!path.startsWith('.')) path = `./${path}`;
  return path;
}

async function rewriteDeclarations(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewriteDeclarations(entryPath);
      continue;
    }
    if (!entry.name.endsWith('.d.ts')) continue;
    const contents = await readFile(entryPath, 'utf8');
    const rewritten = contents.replace(/(\bfrom\s+|\bimport\s*(?:\(\s*)?)(['"])(@strata-game-library\/[A-Za-z0-9@._/-]+)\2/g, (whole, prefix, quote, specifier) =>
      `${prefix}${quote}${privateSpecifierReplacement(entryPath, specifier)}${quote}`
    );
    if (/\b(?:from\s+|import\s*(?:\(\s*)?)['"]@strata-game-library\//.test(rewritten)) {
      throw new Error(`Unresolved private workspace import in ${entryPath}`);
    }
    const nodeNextSafe = rewritten.replace(
      /(\b(?:from\s+|import\s*(?:\(\s*)?)["'])(\.\.?\/[^"']+?)(["'])/g,
      (whole, prefix, specifier, quote) =>
        `${prefix}${/\.[cm]?[jt]sx?$/.test(specifier) ? specifier : `${specifier}.js`}${quote}`
    );
    await writeFile(entryPath, nodeNextSafe);
  }
}

await rm(internalRoot, { recursive: true, force: true });
for (const packageInfo of packages.values()) {
  // Preserve each private module's declaration chunk graph. Filtering individual
  // files here would omit directories before their nested declarations are
  // visited, leaving public declaration imports dangling.
  await cp(join(root, packageInfo.source, 'dist'), join(internalRoot, packageInfo.target), {
    recursive: true,
  });
}
await mkdir(internalRoot, { recursive: true });
await rewriteDeclarations(internalRoot);
await rewriteDeclarations(publicDist);
