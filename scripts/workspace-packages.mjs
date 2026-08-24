import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Return every publishable package in stable path order.
 */
export async function getPublishablePackages() {
  const packages = [];

  for (const group of ['packages', 'adapters', 'plugins']) {
    const groupPath = join(workspaceRoot, group);
    const entries = await readdir(groupPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const directory = join(groupPath, entry.name);
      const manifestPath = join(directory, 'package.json');

      try {
        const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
        if (!manifest.private) {
          packages.push({ directory, manifest, manifestPath });
        }
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
      }
    }
  }

  return packages.sort((a, b) => a.directory.localeCompare(b.directory));
}
