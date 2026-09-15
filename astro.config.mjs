import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import vercel from '@astrojs/vercel';

export default defineConfig({
  // Passage en SSR pour que la traduction via Cookie marche instantanément
  output: 'server',
  adapter: vercel(),
  server: {
    watch: {
      usePolling: true,
    },
  },
});