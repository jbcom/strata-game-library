import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, normalize, relative, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'docs/dist');
const baseUrl = (process.env.DOCS_BASE_URL ?? '/strata-game-library').replace(/\/$/, '');
const errors = [];

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(path)));
    else files.push(path);
  }
  return files;
}

async function exists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

function candidatePaths(urlPath, htmlFile) {
  const withoutSuffix = decodeURIComponent(urlPath.split(/[?#]/, 1)[0]);
  const outputPath = withoutSuffix.startsWith(`${baseUrl}/`)
    ? withoutSuffix.slice(baseUrl.length)
    : withoutSuffix;
  const path = outputPath.startsWith('/')
    ? join(root, outputPath)
    : resolve(dirname(htmlFile), withoutSuffix);
  if (outputPath.endsWith('/')) return [join(path, 'index.html')];
  return [path, `${path}.html`, join(path, 'index.html')];
}

const htmlFiles = (await filesUnder(root)).filter((file) => file.endsWith('.html'));
for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, 'utf8');
  const page = `/${relative(root, htmlFile).replaceAll('\\', '/')}`;
  const links = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)].map(
    (match) => match[1]
  );

  for (const link of links) {
    if (/^(?:[a-z]+:|\/\/|#)/i.test(link)) continue;
    if (link.startsWith('/') && !link.startsWith(`${baseUrl}/`)) {
      errors.push(`${page}: root-absolute link escapes the configured base: ${link}`);
      continue;
    }
    const candidates = candidatePaths(link, htmlFile).map((path) => normalize(path));
    if (!candidates.some((path) => path.startsWith(root))) {
      errors.push(`${page}: link escapes the built site: ${link}`);
      continue;
    }
    if (!(await Promise.any(candidates.map(async (path) => ((await exists(path)) ? path : Promise.reject()))).catch(() => false))) {
      errors.push(`${page}: unresolved local link: ${link}`);
    }
  }
}

if (errors.length > 0) {
  throw new Error(`Documentation link validation failed:\n- ${errors.join('\n- ')}`);
}

console.log(`Validated local links in ${htmlFiles.length} generated HTML pages.`);
