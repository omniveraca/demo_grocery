/// <reference types="vitest/config" />
import { copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const siteBase = '/demo_grocery/';

function githubPages(): Plugin {
  return {
    name: 'github-pages',
    closeBundle() {
      const index = path.resolve('dist/index.html');
      if (existsSync(index)) {
        copyFileSync(index, path.resolve('dist/404.html'));
      }
    },
  };
}

export default defineConfig({
  base: siteBase,
  plugins: [react(), githubPages()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
