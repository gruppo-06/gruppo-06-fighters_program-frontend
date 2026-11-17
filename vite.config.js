import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = fileURLToPath(new URL('.', import.meta.url));

/**
 * Pagine HTML del sito. Ogni nuova pagina statica va aggiunta qui,
 * altrimenti non finisce nella build (vedi README).
 */
const pages = {
  // Area pubblica (statica, indicizzabile)
  index: 'index.html',
  gioco: 'gioco.html',
  regolamento: 'regolamento.html',
  fazioni: 'fazioni.html',
  catalogo: 'catalogo.html',
  news: 'news.html',
  faq: 'faq.html',
  contatti: 'contatti.html',
  privacy: 'privacy.html',
  404: '404.html',
  // Area giocatore (SPA React)
  app: 'app.html',
};

/**
 * La SPA vive sotto /app/* ma il file fisico è app.html.
 * In dev e in preview riscriviamo /app e /app/qualsiasi-cosa verso app.html,
 * così il refresh su una rotta (es. /app/collezione) funziona.
 * In produzione serve la stessa regola sul server/hosting (vedi README).
 */
function spaFallback() {
  const rewrite = (req, _res, next) => {
    const path = req.url.split('?')[0];
    if (path === '/app' || (path.startsWith('/app/') && !path.includes('.'))) {
      req.url = '/app.html';
    }
    next();
  };
  return {
    name: 'spa-fallback-app',
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

export default defineConfig({
  plugins: [react(), spaFallback()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries(pages).map(([name, file]) => [name, resolve(root, file)]),
      ),
    },
  },
});
