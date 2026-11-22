/**
 * Definizione delle rotte della single page application.
 * Tutte le rotte vivono sotto /app (es. /app/dashboard): il prefisso è
 * gestito da `basename`, quindi qui i path si scrivono senza /app.
 *
 * Per aggiungere una rotta: crea il componente in ./routes/ e aggiungi
 * una voce in `children` (e, se serve, un link in layout/AppLayout.jsx).
 */
import { Navigate, createBrowserRouter } from 'react-router-dom';
import AppLayout from './layout/AppLayout.jsx';
import RequireAuth from './RequireAuth.jsx';
import Accesso from './routes/Accesso.jsx';
import Collezione from './routes/Collezione.jsx';
import Negozio from './routes/Negozio.jsx';
import NotFound from './routes/NotFound.jsx';
import Partita from './routes/Partita.jsx';
import Trofei from './routes/Trofei.jsx';

export const router = createBrowserRouter(
  [
    { path: '/accesso', element: <Accesso /> },
    // Partita: schermata a tutta pagina, fuori da AppLayout (niente navbar)
    {
      path: '/partita',
      element: (
        <RequireAuth>
          <Partita />
        </RequireAuth>
      ),
    },
    {
      path: '/',
      element: (
        <RequireAuth>
          <AppLayout />
        </RequireAuth>
      ),
      children: [
        { index: true, element: <Navigate to="/collezione" replace /> },
        { path: 'negozio', element: <Negozio /> },
        { path: 'collezione', element: <Collezione /> },
        { path: 'trofei', element: <Trofei /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: '/app' },
);
