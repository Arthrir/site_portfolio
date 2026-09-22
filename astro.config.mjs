import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://arthurdx.com',
  // Passage en SSR pour que la traduction via Cookie marche instantanément
  output: 'server',
  adapter: vercel(),
  server: {
    watch: {
      usePolling: true,
    },
  },
});