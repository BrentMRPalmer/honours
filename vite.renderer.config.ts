import react from '@vitejs/plugin-react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import reactCompiler from 'babel-plugin-react-compiler';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  root: './src/renderer',
  plugins: [
    import('@tailwindcss/vite').then((tailwindcss) => tailwindcss.default()),
    [reactCompiler],
    react(),
  ],
  resolve: {
    alias: {
      '@/common': path.resolve(__dirname, './src/common'),
      '@': path.resolve(__dirname, './src/renderer'),
    },
  },
});
