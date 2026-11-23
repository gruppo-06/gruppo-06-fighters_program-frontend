/**
 * Isola React dell'header delle pagine statiche.
 * Monta la parte che dipende dall'utente (crediti, avatar / "Accedi")
 * dentro <div id="header-user-root">. Il resto dell'header è HTML statico.
 */
import UserMenu from '../components/UserMenu.jsx';
import { mountIsland } from './mountIsland.jsx';

mountIsland('header-user-root', <UserMenu />);
