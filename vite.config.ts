import { createServer, defineConfig, loadEnv, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import type { IncomingMessage } from 'node:http';

type FetchHandler = { fetch: (request: Request) => Promise<Response> };

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

// Routes /api/joke to the Web-standard handler exported by api/joke.ts
function mountApi(middlewares: Connect.Server, loadHandler: () => Promise<FetchHandler>) {
  middlewares.use('/api/joke', async (req, res) => {
    try {
      const handler = await loadHandler();
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

      const response = await handler.fetch(request);
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
}

// Local only: serves api/joke.ts at /api/joke in `vite` and `vite preview`, so no Vercel account is needed (ADR-1, ADR-7)
function localApi(mode: string): Plugin {
  function loadServerKey() {
    // Only the server-side key is exposed to the server process, never to the client bundle
    const env = loadEnv(mode, process.cwd(), '');
    if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
  }

  return {
    name: 'local-api',
    configureServer(server) {
      loadServerKey();
      mountApi(server.middlewares, async () => (await server.ssrLoadModule('/api/joke.ts')).default as FetchHandler);
    },
    configurePreviewServer(server) {
      loadServerKey();
      // The preview server cannot load TypeScript, so a small internal Vite server loads the handler once
      let handler: Promise<FetchHandler> | undefined;
      mountApi(server.middlewares, () => {
        handler ??= createServer({
          configFile: false,
          logLevel: 'error',
          server: { middlewareMode: true, hmr: false, ws: false },
          appType: 'custom',
        }).then(async (vite) => (await vite.ssrLoadModule('/api/joke.ts')).default as FetchHandler);
        return handler;
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    localApi(mode),
    VitePWA({
      // No update prompt in the design: a new version takes over on the next app launch (ADR-6)
      registerType: 'prompt',
      injectRegister: 'auto',
      manifest: {
        name: 'בדיחה בלחיצה',
        short_name: 'בדיחה בלחיצה',
        lang: 'he',
        dir: 'rtl',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        theme_color: '#F7AEB8',
        background_color: '#FFF4ED',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell only: no runtime caching, so /api/joke always goes to the network
        globPatterns: ['**/*.{html,js,css,png,jpg,woff2,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  server: {
    // Allow opening the dev server from a phone on the same network
    host: true,
  },
}));
