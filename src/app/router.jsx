/**
 * Definizione delle rotte della single page application.
 * Tutte le rotte vivono sotto /app (es. /app/dashboard): il prefisso è
 * gestito da `basename`, quindi qui i path si scrivono senza /app.
 *
 * Per aggiungere una rotta: crea il componente in ./routes/ e aggiungi
 * una voce in `children` (e, se serve, un link in layout/AppLayout.jsx).
 */
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './layout/AppLayout.jsx';
import Collezione from './routes/Collezione.jsx';
import Negozio from './routes/Negozio.jsx';
import NotFound from './routes/NotFound.jsx';
import Partita from './routes/Partita.jsx';

export const router = createBrowserRouter(
  [
    // Partita: schermata a tutta pagina, fuori da AppLayout (niente navbar)
    { path: '/partita', element: <Partita /> },
    {
      path: '/',
      element: <AppLayout />,
      children: [
        // TODO: aggiungere qui le rotte dell'area giocatore man mano che vengono implementate
        // (login, registrazione, dashboard, collezione, mazzi, scambi, sfide, trofei, …)
        { path: 'negozio', element: <Negozio /> },
        { path: 'collezione', element: <Collezione /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: '/app' },
);
