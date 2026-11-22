/**
 * Isola React della pagina catalogo.html.
 * Monta la griglia delle carte dentro <div id="catalogo-root">.
 */
import CardGrid from '../components/CardGrid.jsx';
import { mockCards } from '../data/mockCards.js';
import { mountIsland } from './mountIsland.jsx';

// TODO: sostituire i dati finti con una chiamata API (src/services/api.js)
mountIsland('catalogo-root', <CardGrid cards={mockCards} />);
