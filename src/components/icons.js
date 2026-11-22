/**
 * Registro delle icone esportate da Figma (src/icons/*.svg).
 * I file vengono caricati come testo al build: il nome del file
 * (senza .svg) diventa la chiave. Per aggiungere un'icona basta
 * copiare il file in src/icons/ con colori impostati a `currentColor`.
 */
const files = import.meta.glob('../icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export const ICONS = Object.fromEntries(
  Object.entries(files).map(([path, source]) => {
    const name = path.split('/').pop().replace('.svg', '');
    const viewBox = source.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 24 24';
    const body = source.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    return [name, { viewBox, body }];
  }),
);

/** Elenco ordinato dei nomi disponibili. */
export const ICON_NAMES = Object.keys(ICONS).sort();
