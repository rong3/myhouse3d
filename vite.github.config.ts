import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(__dirname, 'github-pages'),
  base: '/myhouse3d/',
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss()] } },
  resolve: { alias: { '@': path.resolve(__dirname) } },
  build: { outDir: path.resolve(__dirname, 'pages-dist'), emptyOutDir: true },
});
