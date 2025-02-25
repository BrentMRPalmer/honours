import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['sqlite3'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/electron'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
});
