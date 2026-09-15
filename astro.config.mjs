import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  // Passage en SSR pour que la traduction via Cookie marche instantanément
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    watch: {
      usePolling: true,
    },
  },
});