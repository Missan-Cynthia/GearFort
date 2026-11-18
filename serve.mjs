import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const types = {
  html:'text/html; charset=utf-8', css:'text/css; charset=utf-8',
  js:'text/javascript; charset=utf-8', png:'image/png',
  webmanifest:'application/manifest+json; charset=utf-8'
};
const host = process.env.GAME_HOST || '127.0.0.1';
const port = Number(process.env.GAME_PORT || 4173);

createServer(async (request,response) => {
  const path = new URL(request.url,'http://localhost').pathname;
  const file = path === '/' ? 'index.html' : path.slice(1);
  const type = file.match(/^[\w-]+\.(html|css|js|png|webmanifest)$/)?.[1];
  try {
    if (!type) throw new Error('Not found');
    const content = await readFile(new URL(file,import.meta.url));
    response.writeHead(200,{'Content-Type':types[type],'Cache-Control':'no-cache'});
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end();
  }
}).listen(port,host,() => console.log(`Local: http://${host}:${port}`));
