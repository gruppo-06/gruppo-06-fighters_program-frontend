import { NavLink, Outlet } from 'react-router-dom';
import './AppLayout.css';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/negozio', label: 'Negozio' },
  { to: '/collezione', label: 'Collezione' },
  { to: '/mazzi', label: 'Mazzi' },
  { to: '/scambi', label: 'Scambi' },
  { to: '/sfide', label: 'Sfide' },
  { to: '/profilo', label: 'Profilo' },
  { to: '/impostazioni', label: 'Impostazioni' },
];

/** Layout comune dell'area giocatore: navbar + contenuto della rotta attiva. */
export default function AppLayout() {
  return (
    <>
      <header className="app-header">
        <div className="container app-header__inner">
          {/* <a> normale (non <Link>): il sito pubblico è fuori dalla SPA */}
          <a className="site-logo" href="/">
            Fighters Program
          </a>
          <NavLink className="app-header__login" to="/login">
            Accedi
          </NavLink>
          <nav className="app-nav" aria-label="Area giocatore">
            <ul role="list">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to}>{label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="container app-main">
        <Outlet />
      </main>
    </>
  );
}
