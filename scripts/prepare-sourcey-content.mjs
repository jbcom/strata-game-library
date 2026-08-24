import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sourceRoot = join(root, 'apps/docs/src/content/docs');
const destinationRoot = join(root, 'docs');
const manifestPath = join(destinationRoot, '.sourcey-legacy-manifest.json');
const siteBase = 'https://strata.game';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => !entry.name.startsWith('.'))
      .map(async (entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? walk(path) : [path];
      })
  );
  return files.flat();
}

function routeFor(relativePath) {
  const withoutExtension = relativePath.replace(/\.(md|mdx)$/i, '');
  const route = withoutExtension.replace(/(^|\/)index$/, '');
  return `/${route}`.replace(/\/$/, '') || '/';
}

function semanticMarkdown(markdown) {
  const transformProse = (prose) => {
    const frontmatter = prose.match(/^(---\s*\n[\s\S]*?\n---\s*\n)/);
    const metadata = frontmatter?.[1] ?? '';
    const body = prose.slice(metadata.length).replace(/^(?:\s*import\s+[^\n]+;\s*)+/, '');
    return `${metadata}${body}`
    .replace(/<\/?(?:CardGrid|Card|LinkCard|div|span)\b[^>]*>/g, '')
    .replace(/^\s*<[A-Z][A-Za-z0-9]*(?:\s[^>]*)?\/>\s*$/gm, '')
    .replace(/<a\s+href="([^"]+)"[^>]*>/g, '[$1](')
    .replace(/<\/a>/g, ')');
  };

  return markdown
    .split(/(```[\s\S]*?```)/g)
    .map((part, index) => (index % 2 === 1 ? part : transformProse(part)))
    .join('')
    .replaceAll('https://jonbogaty.com/strata-game-library', siteBase);
}

const sourceFiles = (await walk(sourceRoot)).filter((file) => /\.(md|mdx)$/i.test(file));
const routes = new Map(
  sourceFiles.map((file) => {
    const relativePath = relative(sourceRoot, file).replaceAll('\\', '/');
    return [routeFor(relativePath), relativePath];
  })
);
const redirects = new Map([
  ['/api', '/packages'],
  ['/api/', '/packages'],
  ['/api/types', '/packages'],
  ['/api/types/', '/packages'],
]);
const currentRoutes = new Set(["/", "/introduction", "/quickstart", "/architecture", "/packages", "/contributing", "/security"]);

function rewriteLinks(markdown) {
  return markdown.replace(/\]\((\/[^)\s#?]*)([^)]*)\)/g, (full, path, suffix) => {
    const normalized = path.replace(/\/$/, '') || '/';
    const mapped = redirects.get(path) ?? redirects.get(normalized) ?? normalized;
    if (currentRoutes.has(mapped) || routes.has(mapped)) {
      return `](${siteBase}${mapped === '/' ? '/' : `${mapped}/`}${suffix})`;
    }
    return full;
  });
}

let previous = [];
try {
  previous = JSON.parse(await readFile(manifestPath, 'utf8'));
} catch {
  // The first preparation run has no manifest.
}

for (const generatedFile of previous) {
  await rm(join(destinationRoot, generatedFile), { force: true });
}

const generated = [];
for (const sourceFile of sourceFiles) {
  const relativePath = relative(sourceRoot, sourceFile).replaceAll('\\', '/');
  if (relativePath === 'index.mdx') continue;

  const destinationRelative = relativePath.replace(/\.mdx$/i, '.md');
  const destination = join(destinationRoot, destinationRelative);
  const source = await readFile(sourceFile, 'utf8');
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, rewriteLinks(semanticMarkdown(source)));
  generated.push(destinationRelative);
}

await writeFile(manifestPath, `${JSON.stringify(generated.sort(), null, 2)}\n`);
console.log(`Prepared ${generated.length} legacy Sourcey pages from ${sourceFiles.length} authored files.`);
