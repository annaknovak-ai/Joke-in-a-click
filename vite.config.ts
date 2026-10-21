import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage } from 'node:http';

type FetchHandler = { fetch: (request: Request) => Promise<Response> };

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

// Dev only: serves api/joke.ts at /api/joke so no Vercel account is needed locally (ADR-1)
function localApi(mode: string): Plugin {
  return {
    name: 'local-api',
    apply: 'serve',
    configureServer(server) {
      // Only the server-side key is exposed to the dev server process, never to the client bundle
      const env = loadEnv(mode, process.cwd(), '');
      if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;

      server.middlewares.use('/api/joke', async (req, res) => {
        try {
          const mod = (await server.ssrLoadModule('/api/joke.ts')) as { default: FetchHandler };
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') headers.set(key, value);
            else if (Array.isArray(value)) headers.set(key, value.join(', '));
          }
          const method = req.method ?? 'GET';
          const body = method === 'GET' || method === 'HEAD' ? undefined : await readBody(req);
          const request = new Request(`http://${req.headers.host ?? 'localhost'}/api/joke`, {
            method,
            headers,
            body,
          });

          const response = await mod.default.fetch(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          console.error('[local-api] handler crashed', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify({ error: 'INTERNAL_ERROR', message: 'אירעה תקלה בשרת' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), localApi(mode)],
  server: {
    // Allow opening the dev server from a phone on the same network
    host: true,
  },
}));
