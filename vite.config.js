import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Work from main /docs and from the root-page fallback at /gym_workout/docs/.
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
