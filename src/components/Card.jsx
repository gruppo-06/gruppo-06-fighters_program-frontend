import './Card.css';

const RARITY_LABELS = {
  common: 'Comune',
  rare: 'Rara',
  epic: 'Epica',
  legendary: 'Leggendaria',
};

/**
 * Singola carta da gioco.
 * Componente condiviso: usato sia nelle isole delle pagine statiche
 * (es. catalogo) sia nella SPA dell'area giocatore (es. collezione, mazzi).
 */
export default function Card({ card }) {
  const { name, faction, rarity, cost, attack, defense, image } = card;

  return (
    <article className={`card card--${rarity}`}>
      <header className="card__header">
        <h3 className="card__name">{name}</h3>
        <span className="card__cost" aria-label={`Costo ${cost}`}>
          {cost}
        </span>
      </header>

      <div className="card__art">
        {image ? <img src={image} alt="" loading="lazy" /> : <span aria-hidden="true">?</span>}
      </div>

      <dl className="card__meta">
        <div>
          <dt>Fazione</dt>
          <dd>{faction}</dd>
        </div>
        <div>
          <dt>Rarità</dt>
          <dd>{RARITY_LABELS[rarity] ?? rarity}</dd>
        </div>
      </dl>

      <footer className="card__stats">
        <span aria-label={`Attacco ${attack}`}>⚔ {attack}</span>
        <span aria-label={`Difesa ${defense}`}>🛡 {defense}</span>
      </footer>
    </article>
  );
}
