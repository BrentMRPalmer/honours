import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/electron'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
});
