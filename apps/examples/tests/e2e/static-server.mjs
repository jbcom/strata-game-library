import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const port = Number(process.env.EXAMPLES_SMOKE_PORT ?? 4174);
const examples = new Set([
  'api-showcase',
  'basic-terrain',
  'sky-volumetrics',
  'vegetation-showcase',
  'water-scene',
  'world-topology',
]);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

function sendText(response, status, text) {
  response.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
  response.end(text);
}

function resolveExampleFile(urlPath) {
  const [example, ...rest] = urlPath.replace(/^\/+/, '').split('/');

  if (!examples.has(example)) {
    return null;
  }

  const relativeFile = rest.join('/') || 'index.html';
  const distRoot = path.join(root, example, 'dist');
  const filePath = path.resolve(distRoot, relativeFile);

  if (!filePath.startsWith(`${distRoot}${path.sep}`) && filePath !== distRoot) {
    return null;
  }

  return filePath;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`);
  const filePath = resolveExampleFile(url.pathname);

  if (!filePath) {
    sendText(response, 404, 'Unknown example');
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      sendText(response, 404, 'Not found');
      return;
    }

    response.writeHead(200, {
      'content-length': fileStat.size,
      'content-type': contentTypes.get(path.extname(filePath)) ?? 'application/octet-stream',
    });
    createReadStream(filePath).pipe(response);
  } catch {
    sendText(response, 404, 'Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Example smoke server listening on http://127.0.0.1:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
