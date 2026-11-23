/** Punto d'ingresso della single page application dell'area giocatore*/
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.jsx';

createRoot(document.getElementById('app-root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
