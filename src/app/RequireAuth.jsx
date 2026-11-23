import { Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from '../services/auth.js';

/** Mostra la rotta solo a un giocatore autenticato; altrimenti porta all'accesso e poi torna qui. */
export default function RequireAuth({ children }) {
  const location = useLocation();
  if (!isLoggedIn()) {
    return <Navigate to="/accesso" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}
