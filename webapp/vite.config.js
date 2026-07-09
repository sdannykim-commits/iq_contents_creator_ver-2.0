import { defineConfig } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dev-only endpoint: the app POSTs the finished MP4 here and we write it straight into
// webapp/output/ — so rendering drops the file into a fixed folder instead of forcing a
// manual browser download each time. Only runs under `npm run dev` (has Node/fs access).
function saveRenderPlugin() {
  return {
    name: 'iqspark-save-render',
    configureServer(server) {
      server.middlewares.use('/api/save-render', (req, res, next) => {
        if (req.method !== 'POST') return next();

        const raw = req.headers['x-filename'] || `iqspark_${Date.now()}.mp4`;
        // Sanitize: strip any path components / unsafe chars so we only ever write into output/.
        const filename = String(raw).replace(/[^a-zA-Z0-9._-]/g, '_') || `render_${Date.now()}.mp4`;
        // Optional dated subfolder (yyyymmdd) — digits only, so it can never escape output/.
        const subdir = String(req.headers['x-subdir'] || '').replace(/[^0-9]/g, '').slice(0, 8);

        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
          try {
            const outDir = path.resolve(__dirname, 'output', subdir);
            fs.mkdirSync(outDir, { recursive: true });
            fs.writeFileSync(path.join(outDir, filename), Buffer.concat(chunks));
            res.statusCode = 200;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ ok: true, path: `output/${subdir ? subdir + '/' : ''}${filename}` }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: e.message }));
          }
        });
        req.on('error', (e) => {
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: e.message }));
        });
      });
    }
  };
}

export default defineConfig({
  root: '.',
  plugins: [
    ViteEjsPlugin(),
    saveRenderPlugin()
  ],
  server: {
    port: 5173,
    open: true,
    headers: {
      // Required for ffmpeg.wasm SharedArrayBuffer
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    },
    // CORS bypass proxy for Anthropic API
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  }
});
