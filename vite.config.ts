import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Express owns the HTTP server in middleware mode, so Vite cannot
      // reliably attach its HMR WebSocket to the preview proxy. Disable the
      // client injection to prevent repeated "WebSocket closed without opened"
      // errors while keeping Vite's middleware and file serving enabled.
      hmr: false,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
