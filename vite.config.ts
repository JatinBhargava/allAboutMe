import path from 'node:path';
import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { getNowPlaying } from './server/spotify';
import { getActivity } from './server/activity';
import { handleChess } from './server/chess';
import { getLiverpool } from './server/football';
import { getDailyQuestions } from './server/qotd';

/** Serves the /api routes from `vite dev` and `vite preview`, like the Vercel functions do. */
function localApi(env: Record<string, string>): Plugin {
  type Req = { method: string; body: unknown; headers: import('node:http').IncomingHttpHeaders };
  const routes: Record<string, (req: Req) => Promise<{ status: number; body: unknown }>> = {
    '/api/now-playing': () => getNowPlaying(env),
    '/api/activity': async () => ({ status: 200, body: await getActivity(env) }),
    '/api/football': async () => {
      try {
        return { status: 200, body: await getLiverpool() };
      } catch {
        return { status: 502, body: { error: 'unavailable' } };
      }
    },
    '/api/qotd': async () => {
      try {
        return { status: 200, body: await getDailyQuestions() };
      } catch {
        return { status: 502, body: { error: 'unavailable' } };
      }
    },
    '/api/chess': (req) =>
      handleChess(env, {
        method: req.method,
        body: req.body,
        ownerKey: (req.headers['x-chess-owner'] as string | undefined) ?? null,
      }),
  };
  const readJson = async (req: import('node:http').IncomingMessage) => {
    if (req.method !== 'POST') return null;
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    try {
      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      return null;
    }
  };
  const mount = (middlewares: Connect.Server) => {
    for (const [route, run] of Object.entries(routes)) {
      middlewares.use(route, async (req, res) => {
        const result = await run({ method: req.method ?? 'GET', body: await readJson(req), headers: req.headers });
        res.statusCode = result.status;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify(result.body));
      });
    }
  };
  return {
    name: 'local-api',
    configureServer: (server) => mount(server.middlewares),
    configurePreviewServer: (server) => mount(server.middlewares),
  };
}

export default defineConfig(({ mode }) => {
  // '' prefix loads non-VITE_ vars too; they stay server-side (only VITE_* reach the bundle).
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), localApi(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
