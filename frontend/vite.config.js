import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.FRONTEND_PORT || '3000'),
    proxy: {
      '/api': process.env.BACKEND_URL || `http://127.0.0.1:${process.env.BACKEND_PORT || '4000'}`
    }
  }
});
