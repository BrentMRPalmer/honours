import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['better-sqlite3', 'pg-native'],
    },
  },
  resolve: {
    alias: {
      '@/common': path.resolve(__dirname, './src/common'),
      '@': path.resolve(__dirname, './src/electron'),
    },
  },
});
