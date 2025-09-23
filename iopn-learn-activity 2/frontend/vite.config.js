// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    cors: true,
    allowedHosts: [
      'localhost',
      '.trycloudflare.com',  // This allows ALL cloudflare tunnels
      'wallpaper-greatest-possibly-were.trycloudflare.com' // Your specific URL
    ]
  }
});