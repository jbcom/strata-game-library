import { spawnSync } from 'node:child_process';
import { getPublishablePackages } from './workspace-packages.mjs';

function command(commandName, args, options = {}) {
  const result = spawnSync(commandName, args, {
    encoding: 'utf8',
    stdio: 'inherit',
    ...options,
  });

  if (result.status !== 0) {
    throw new Error(`${commandName} ${args.join(' ')} exited with status ${result.status}`);
  }
}

function versionExists(name, version) {
  return (
    spawnSync('npm', ['view', `${name}@${version}`, 'version'], {
      encoding: 'utf8',
      stdio: 'ignore',
    }).status === 0
  );
}

function publicationOrder(packages) {
  const byName = new Map(packages.map((item) => [item.manifest.name, item]));
  const remaining = new Set(byName.keys());
  const ordered = [];

  while (remaining.size > 0) {
    const ready = [...remaining]
      .filter((name) => {
        const manifest = byName.get(name).manifest;
        const dependencies = {
          ...manifest.dependencies,
          ...manifest.optionalDependencies,
        };
        return Object.keys(dependencies).every(
          (dependency) => !remaining.has(dependency) || dependency === name
        );
      })
      .sort();

    if (ready.length === 0) {
      throw new Error(`Workspace package dependency cycle: ${[...remaining].sort().join(', ')}`);
    }

    for (const name of ready) {
      ordered.push(byName.get(name));
      remaining.delete(name);
    }
  }

  return ordered;
}

const packages = publicationOrder(await getPublishablePackages());
const dryRun = process.env.PUBLISH_DRY_RUN === '1';
let published = 0;

for (const { directory, manifest } of packages) {
  const specifier = `${manifest.name}@${manifest.version}`;
  if (versionExists(manifest.name, manifest.version)) {
    console.log(`Already published: ${specifier}`);
    continue;
  }

  const args = ['--dir', directory, 'publish', '--access', 'public', '--no-git-checks'];
  if (process.env.CI) args.push('--provenance');
  if (dryRun) args.push('--dry-run');

  console.log(`${dryRun ? 'Would publish' : 'Publishing'}: ${specifier}`);
  command('pnpm', args);
  published += 1;
}

console.log(
  `${dryRun ? 'Validated' : 'Published'} ${published} package${published === 1 ? '' : 's'}; ${packages.length - published} already existed.`
);
