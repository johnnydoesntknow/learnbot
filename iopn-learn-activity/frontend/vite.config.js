// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    cors: true,
    // Keep your original config even though it doesn't do anything
    allowedHosts: [
      'localhost',
      '.trycloudflare.com',
      'wallpaper-greatest-possibly-were.trycloudflare.com'
    ]
  }
});