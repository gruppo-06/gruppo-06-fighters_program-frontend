/** Negozio dei pacchetti (Figma: NEGOZIO). */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import PackCard, { PackContents } from '../../components/PackCard.jsx';
import Price from '../../components/Price.jsx';
import { ApiError, api } from '../../services/api.js';
import { toFighter } from '../../services/cards.js';
import { notifyCreditsChanged } from '../../services/auth.js';
import { useCredits } from '../useCredits.js';
import DettaglioPacchetto from './negozio/DettaglioPacchetto.jsx';
import './Negozio.css';

/** Chiave di idempotenza per l'apertura di un pacchetto. */
function newIdempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Negozio() {
  const navigate = useNavigate();
  const [packs, setPacks] = useState([]);
  const credits = useCredits();
  const [daily, setDaily] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [purchasingPackId, setPurchasingPackId] = useState(null);
  const [purchaseError, setPurchaseError] = useState(null);
  const [error, setError] = useState(null);
  // Una chiave per pacchetto: se la richiesta fallisce per rete, il nuovo tentativo riusa la stessa.
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
      const [packsResult, dailyResult] = await Promise.allSettled([
        api.get('/packs'),
        api.get('/me/credits/daily'),
      ]);
      if (cancelled) return;

      if (packsResult.status === 'fulfilled') {
        setPacks(packsResult.value ?? []);
      } else {
        setError('Impossibile caricare i pacchetti. Riprova più tardi.');
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
      notifyCreditsChanged();

      const [dailyResult] = await Promise.allSettled([api.get('/me/credits/daily')]);
      if (dailyResult.status === 'fulfilled') setDaily(dailyResult.value);
    } catch {
      setError('Impossibile ritirare il bonus. Riprova più tardi.');
    } finally {
      setClaiming(false);
    }
  }

  async function handlePurchase(pack) {
    if (purchasingPackId != null) return;

    let idempotencyKey = idempotencyKeys.current.get(pack.id);
    if (!idempotencyKey) {
      idempotencyKey = newIdempotencyKey();
      idempotencyKeys.current.set(pack.id, idempotencyKey);
    }

    setPurchasingPackId(pack.id);
    setPurchaseError(null);
    try {
      // Le carte già possedute servono a capire quali sono nuove
      const collection = await api.get('/me/collection?size=100');
      const ownedCodes = new Set(
        collection.content.filter((item) => item.quantity > 0).map((item) => item.code),
      );

      const result = await api.post(`/packs/${pack.id}/open`, undefined, {
        headers: { 'Idempotency-Key': idempotencyKey },
      });
      idempotencyKeys.current.delete(pack.id);

      const codes = [...new Set(result.cards.map((card) => card.code))];
      const details = new Map();
      const settled = await Promise.allSettled(
        codes.map((code) => api.get(`/cards/${encodeURIComponent(code)}`)),
      );
      settled.forEach((detail, index) => {
        if (detail.status === 'fulfilled') details.set(codes[index], detail.value);
      });

      const cards = result.cards.map((card) => ({
        ...toFighter(details.get(card.code) ?? card),
        isNew: !ownedCodes.has(card.code),
      }));

      notifyCreditsChanged();
      navigate('/negozio/apertura', {
        state: {
          opening: { id: result.openingId, pack, cards, trophy: null, balance: result.balance },
        },
      });
    } catch (err) {
      if (err instanceof ApiError) idempotencyKeys.current.delete(pack.id);
      setPurchaseError(
        err?.status === 402
          ? 'Crediti insufficienti per questo pacchetto'
          : 'Non è stato possibile aprire il pacchetto. Riprova più tardi.',
      );
    } finally {
      setPurchasingPackId(null);
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
              onClick={() => setSelectedPack(featured)}
            >
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
              <PackCard
                {...pack}
                onBuy={() => setSelectedPack(pack)}
                buying={purchasingPackId === pack.id}
              />
            </li>
          ))}
        </ul>
      </section>

      {selectedPack && (
        <DettaglioPacchetto
          pack={selectedPack}
          credits={credits}
          purchasing={purchasingPackId === selectedPack.id}
          error={purchaseError}
          onClose={() => {
            setSelectedPack(null);
            setPurchaseError(null);
          }}
          onPurchase={handlePurchase}
        />
      )}
    </div>
  );
}
