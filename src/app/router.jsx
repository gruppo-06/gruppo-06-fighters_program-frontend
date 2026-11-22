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
import Amici from './routes/Amici.jsx';
import AperturaPacchetto from './routes/AperturaPacchetto.jsx';
import Collezione from './routes/Collezione.jsx';
import Negozio from './routes/Negozio.jsx';
import NotFound from './routes/NotFound.jsx';
import Mazzi from './routes/Mazzi.jsx';
import MazzoEditor from './routes/mazzi/MazzoEditor.jsx';
import Partita from './routes/Partita.jsx';
import Scambi from './routes/Scambi.jsx';
import Sfide from './routes/Sfide.jsx';
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
    // Apertura pacchetto: come Partita, a tutta pagina e fuori da AppLayout
    {
      path: '/negozio/apertura',
      element: (
        <RequireAuth>
          <AperturaPacchetto />
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
        { path: 'mazzi', element: <Mazzi /> },
        // :deckId è l'id del mazzo, oppure "nuovo" (NEW_DECK_ID) per crearne uno
        { path: 'mazzi/:deckId', element: <MazzoEditor /> },
        { path: 'scambi', element: <Scambi /> },
        { path: 'sfide', element: <Sfide /> },
        { path: 'amici', element: <Amici /> },
        { path: 'trofei', element: <Trofei /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: '/app' },
);
