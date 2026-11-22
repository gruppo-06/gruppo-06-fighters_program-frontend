import { Link, NavLink, Outlet } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import UserMenu from '../../components/UserMenu.jsx';
import './AppLayout.css';

const NAV_LINKS = [
  { to: '/negozio', label: 'Negozio' },
  { to: '/collezione', label: 'Collezione' },
  { to: '/mazzi', label: 'Mazzi' },
  { to: '/scambi', label: 'Scambi' },
  { to: '/sfide', label: 'Sfide' },
  { to: '/amici', label: 'Amici' },
  { to: '/trofei', label: 'Trofei' },
];

/**
 * Layout comune dell'area giocatore (Figma: Navbar) + contenuto della rotta attiva.
 * Riusa gli stili .site-header / .site-nav del sito pubblico (src/styles/base.css):
 * NavLink imposta aria-current="page" sul link attivo, che accende l'indicatore.
 * Ogni rotta gestisce da sé il proprio .container e le spaziature verticali.
 */
export default function AppLayout() {
  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          {/* <a> normale (non <Link>): il sito pubblico è fuori dalla SPA */}
          <a className="site-logo" href="/">
            <img src="/images/logo.webp" alt="Fighters Program – Home" width="144" height="48" />
          </a>
          <nav className="site-nav" aria-label="Area giocatore">
            <ul role="list">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to}>{label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="site-header__actions">
            <Link className="button" to="/partita">
              <Icon name="play" size={14} />
              Gioca
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}
