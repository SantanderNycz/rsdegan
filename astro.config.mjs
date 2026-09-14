// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Domínio canónico do site — ajustar quando o domínio final estiver definido.
// Usado por: sitemap, Open Graph, canonical, JSON-LD.
const SITE = 'https://rsdegan.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  image: {
    // Sharp gera AVIF/WebP em build; sem serviço remoto (deploy estático na Vercel).
    responsiveStyles: true,
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
