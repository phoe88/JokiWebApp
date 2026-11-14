import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Serves api/*.js during `vite dev` the way Vercel does in production, so features
 * that call /api work locally. Server-only variables come from .env.local.
 */
function vercelApiInDev() {
  return {
    name: 'vercel-api-in-dev',
    apply: 'serve',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''), { ...process.env });
      server.middlewares.use(async (req, res, next) => {
        const match = req.url.match(/^\/api\/([\w-]+)(?:\?|$)/);
        if (!match) return next();
        try {
          const handlers = await server.ssrLoadModule(`/api/${match[1]}.js`);
          const handler = handlers[req.method];
          if (!handler) {
            res.statusCode = 405;
            return res.end();
          }
          const request = new Request(new URL(req.url, `http://${req.headers.host}`), {
            method: req.method,
            headers: req.headers,
          });
          const response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((value, name) => res.setHeader(name, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), vercelApiInDev()],
});
