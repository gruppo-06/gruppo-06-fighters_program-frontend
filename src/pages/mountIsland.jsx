import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Monta un componente React ("isola") dentro un elemento di una pagina statica.
 * Se l'elemento non esiste non fa nulla, così lo script non rompe la pagina.
 *
 * @param {string} elementId id del <div> contenitore nell'HTML
 * @param {import('react').ReactNode} element componente da montare
 */
export function mountIsland(elementId, element) {
  const container = document.getElementById(elementId);
  if (!container) {
    console.warn(`[isola] Elemento #${elementId} non trovato: isola non montata.`);
    return;
  }
  createRoot(container).render(<StrictMode>{element}</StrictMode>);
}
