/** Negozio dei pacchetti (Figma: NEGOZIO). */
import { useEffect, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import PackCard from '../../components/PackCard.jsx';
import Price from '../../components/Price.jsx';
import Tag from '../../components/Tag.jsx';
import { mockPacks } from '../../data/mockPacks.js';
import { api } from '../../services/api.js';
import './Negozio.css';

const HOUR = 60 * 60 * 1000;

/** "2g 14h" a partire dal timestamp di fine offerta. */
function formatTimeLeft(endsAt, now) {
  const hours = Math.max(0, Math.floor((endsAt - now) / HOUR));
  const days = Math.floor(hours / 24);
  return days > 0 ? `${days}g ${hours % 24}h` : `${hours}h`;
}

export default function Negozio() {
  // TODO: caricare i pacchetti dal backend (es. api.get('/packs')) quando l'endpoint esiste
  const packs = mockPacks;
  const featured = packs.find((pack) => pack.featured);

  // null finché non arriva la risposta di GET /me (o se non autenticato)
  const [credits, setCredits] = useState(null);
  const [now] = useState(Date.now);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/me')
      .then((user) => !cancelled && setCredits(user?.credits ?? null))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // TODO: aprire la modale "Dettaglio pacchetto" (Figma 258:6200)
  function handleBuy() {}

  // TODO: riscattare il bonus giornaliero (endpoint da concordare con il backend)
  function handleDailyBonus() {}

  return (
    <div className="container shop">
      <header className="shop-header">
        <div className="shop-header__title">
          <p className="eyebrow">Negozio</p>
          <h1>Apri. Scopri. Colleziona.</h1>
        </div>
        <div className="shop-balance">
          <div>
            <p className="shop-balance__label">Saldo</p>
            <Price amount={credits} />
          </div>
          <button type="button" className="button button--secondary" onClick={handleDailyBonus}>
            Bonus giornaliero +50
          </button>
        </div>
      </header>

      {featured && (
        <section className="shop-featured" aria-labelledby="featured-title">
          {featured.image ? (
            <img className="shop-featured__image" src={featured.image} alt="" />
          ) : (
            <Icon name="image" size={24} className="shop-featured__placeholder-icon" />
          )}
          {featured.endsAt && (
            <Tag tone="leggendaria">
              Tempo limitato · termina tra {formatTimeLeft(featured.endsAt, now)}
            </Tag>
          )}
          <h2 id="featured-title" className="shop-featured__title">
            {featured.name}
          </h2>
          <p className="shop-featured__description">
            {featured.featuredDescription ?? featured.description}
          </p>
          <div className="shop-featured__actions">
            <Price amount={featured.price} size="lg" />
            <button type="button" className="button button--lg" onClick={() => handleBuy(featured)}>
              Apri ora
              <Icon name="arrow-right" size={16} />
            </button>
          </div>
        </section>
      )}

      <section className="shop-catalog" aria-labelledby="catalog-title">
        <header className="section-header">
          <p className="eyebrow">Catalogo</p>
          <h2 id="catalog-title" className="section-header__title">
            Tutti i pacchetti
          </h2>
        </header>
        <ul className="shop-catalog__grid" role="list">
          {packs.map((pack) => (
            <li key={pack.id}>
              <PackCard {...pack} onBuy={() => handleBuy(pack)} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
