/** Negozio dei pacchetti (Figma: NEGOZIO). */
import { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import PackCard, { PackContents } from '../../components/PackCard.jsx';
import PackReveal from '../../components/PackReveal.jsx';
import Price from '../../components/Price.jsx';
import { api } from '../../services/api.js';
import { notifyCreditsChanged } from '../../services/auth.js';
import './Negozio.css';

/** Chiave di idempotenza per l'apertura di un pacchetto. */
function newIdempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Negozio() {
  const [packs, setPacks] = useState([]);
  // null finché non arriva la risposta di GET /me/credits
  const [credits, setCredits] = useState(null);
  const [daily, setDaily] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [pendingPackId, setPendingPackId] = useState(null);
  const [error, setError] = useState(null);
  const [opening, setOpening] = useState(null);
  // Una chiave per pacchetto: se la richiesta fallisce, il nuovo tentativo riusa la stessa.
  const idempotencyKeys = useRef(new Map());

  // Il banner in evidenza è sempre il pacchetto più costoso.
  const featured = packs.reduce(
    (mostExpensive, pack) =>
      !mostExpensive || pack.price > mostExpensive.price ? pack : mostExpensive,
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [packsResult, creditsResult, dailyResult] = await Promise.allSettled([
        api.get('/packs'),
        api.get('/me/credits'),
        api.get('/me/credits/daily'),
      ]);
      if (cancelled) return;

      if (packsResult.status === 'fulfilled') {
        setPacks(packsResult.value ?? []);
      } else {
        setError('Impossibile caricare i pacchetti. Riprova più tardi.');
      }
      if (creditsResult.status === 'fulfilled') {
        setCredits(creditsResult.value?.balance ?? null);
      }
      if (dailyResult.status === 'fulfilled') {
        setDaily(dailyResult.value);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDailyBonus() {
    if (claiming || !daily?.claimableToday) return;

    setClaiming(true);
    setError(null);
    try {
      await api.post('/me/credits/daily');

      const [creditsResult, dailyResult] = await Promise.allSettled([
        api.get('/me/credits'),
        api.get('/me/credits/daily'),
      ]);
      if (creditsResult.status === 'fulfilled') setCredits(creditsResult.value.balance);
      if (dailyResult.status === 'fulfilled') setDaily(dailyResult.value);

      notifyCreditsChanged();
    } catch {
      setError('Impossibile ritirare il bonus. Riprova più tardi.');
    } finally {
      setClaiming(false);
    }
  }

  async function handleBuy(pack) {
    if (pendingPackId != null) return;

    let idempotencyKey = idempotencyKeys.current.get(pack.id);
    if (!idempotencyKey) {
      idempotencyKey = newIdempotencyKey();
      idempotencyKeys.current.set(pack.id, idempotencyKey);
    }

    setPendingPackId(pack.id);
    setError(null);
    try {
      const result = await api.post(`/packs/${pack.id}/open`, undefined, {
        headers: { 'Idempotency-Key': idempotencyKey },
      });
      idempotencyKeys.current.delete(pack.id);
      setCredits(result.balance);
      notifyCreditsChanged();
      setOpening(result);
    } catch (err) {
      setError(
        err?.status === 402
          ? 'Crediti insufficienti per questo pacchetto'
          : 'Non è stato possibile aprire il pacchetto. Riprova più tardi.',
      );
    } finally {
      setPendingPackId(null);
    }
  }

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

          {daily && (
            <div className="shop-daily" aria-live="polite">
              {daily.claimableToday ? (
                <>
                  <div className="shop-daily__text">
                    <p className="shop-daily__label">Bonus giornaliero</p>
                    <p className="shop-daily__amount">+{daily.nextAmount} crediti</p>
                  </div>
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={handleDailyBonus}
                    disabled={claiming}
                  >
                    {claiming ? 'Ritiro…' : 'Ritira'}
                  </button>
                </>
              ) : (
                <div className="shop-daily__text">
                  <p className="shop-daily__label">Bonus giornaliero</p>
                  <p className="shop-daily__status">Serie di {daily.streak} giorni</p>
                  <p className="shop-daily__hint">Torna domani</p>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {error && (
        <p className="shop-error" role="alert">
          {error}
        </p>
      )}

      {featured && (
        <section className="shop-featured" aria-labelledby="featured-title">
          {featured.image ? (
            <img className="shop-featured__image" src={featured.image} alt="" />
          ) : (
            <Icon name="image" size={24} className="shop-featured__placeholder-icon" />
          )}
          <p className="eyebrow">Pacchetto in evidenza</p>
          <h2 id="featured-title" className="shop-featured__title">
            {featured.name}
          </h2>
          <p className="shop-featured__description">{featured.description}</p>
          <PackContents contents={featured.contents} className="shop-featured__contents" />
          <div className="shop-featured__actions">
            <Price amount={featured.price} size="lg" />
            <button
              type="button"
              className="button button--lg"
              onClick={() => handleBuy(featured)}
              disabled={pendingPackId === featured.id}
            >
              {pendingPackId === featured.id ? 'Apertura…' : 'Apri ora'}
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
              <PackCard
                {...pack}
                onBuy={() => handleBuy(pack)}
                buying={pendingPackId === pack.id}
              />
            </li>
          ))}
        </ul>
      </section>

      <PackReveal opening={opening} onClose={() => setOpening(null)} />
    </div>
  );
}
