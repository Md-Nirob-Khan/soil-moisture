import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import chatHandler from './api/chat.ts';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const projectRoot = fileURLToPath(new URL('.', import.meta.url));
  if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  if (env.GEMINI_MODEL) process.env.GEMINI_MODEL = env.GEMINI_MODEL;

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'agriai-chat-api',
        configureServer(server) {
          server.middlewares.use('/api/chat', (req, res) => {
            void chatHandler(req, res);
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(projectRoot),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
