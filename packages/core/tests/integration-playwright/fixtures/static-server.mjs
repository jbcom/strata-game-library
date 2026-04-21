#!/usr/bin/env node

import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, relative, resolve, sep } from 'node:path';

const root = resolve(process.cwd());
const workspaceRoot = resolve(root, '../..');
const port = Number(process.env.PORT ?? 3000);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.wasm', 'application/wasm'],
]);

function sendText(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
    'Content-Type': 'text/plain; charset=utf-8',
  });
  response.end(body);
}

function resolveRequestPath(requestUrl) {
  let pathname;

  try {
    const url = new URL(requestUrl ?? '/', `http://localhost:${port}`);
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return undefined;
  }

  const requestRoot = pathname.startsWith('/__workspace/') ? workspaceRoot : root;
  const requestPath = pathname.startsWith('/__workspace/')
    ? pathname.slice('/__workspace'.length)
    : pathname;
  const filePath = resolve(requestRoot, `.${requestPath}`);
  const rootRelativePath = relative(requestRoot, filePath);

  if (rootRelativePath === '..' || rootRelativePath.startsWith(`..${sep}`)) {
    return undefined;
  }

  return filePath;
}

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendText(response, 405, 'Method not allowed');
    return;
  }

  let filePath = resolveRequestPath(request.url);
  if (!filePath) {
    sendText(response, 400, 'Bad request');
    return;
  }

  try {
    let fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      filePath = join(filePath, 'index.html');
      fileStat = await stat(filePath);
    }

    if (!fileStat.isFile()) {
      sendText(response, 404, 'Not found');
      return;
    }

    response.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
      'Content-Length': fileStat.size,
      'Content-Type': contentTypes.get(extname(filePath)) ?? 'application/octet-stream',
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    createReadStream(filePath)
      .on('error', () => {
        if (!response.headersSent) {
          sendText(response, 500, 'Internal server error');
        } else {
          response.destroy();
        }
      })
      .pipe(response);
  } catch {
    sendText(response, 404, 'Not found');
  }
});

server.listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
