/** Negozio Skin cosmetiche (Figma: SKIN) — Anteprima. */
import FighterCard from '../../components/FighterCard.jsx';
import Placeholder from '../../components/Placeholder.jsx';
import Price from '../../components/Price.jsx';
import Avatar from '../../components/Avatar.jsx';
import { PREVIEW_CARD_SKINS, PREVIEW_AVATAR_SKINS, ACTIVE_SKINS } from '../../data/previewSkins.js';
import './Skin.css';

/** Crea un fighter fittizio per mostrare l'anteprima della skin carta dentro una FighterCard. */
function createPreviewFighter(skin) {
  return {
    number: 'SKIN',
    name: skin.name,
    role: 'Skin cosmetica',
    region: 'Negozio',
    rarity: 'epica',
    image: null,
    stats: { atk: 0, def: 0, vel: 0, crt: 0 },
    subcards: 0,
    maxSubcards: 0,
  };
}

export default function Skin() {
  const activeCardSkin = PREVIEW_CARD_SKINS.find((s) => s.id === ACTIVE_SKINS.card);
  const activeAvatarSkin = PREVIEW_AVATAR_SKINS.find((s) => s.id === ACTIVE_SKINS.avatar);

  return (
    <div className="container skin">
      <Placeholder
        eyebrow="Anteprima — dati di esempio"
        title="Negozio Skin"
        description="Scegli skin per personalizzare l'aspetto delle tue carte e del tuo avatar. Le skin sono puramente cosmetiche e non influiscono sul gameplay."
      >
        {/* ---------- Skin Carte ---------- */}
        <section className="skin-section" aria-labelledby="card-skins-title">
          <header className="skin-section__header">
            <p className="eyebrow">Skin Carte</p>
            <h2 id="card-skins-title" className="skin-section__title">
              Personalizza le tue carte
            </h2>
          </header>
          <ul className="skin-grid" role="list">
            {PREVIEW_CARD_SKINS.map((skin) => (
              <li key={skin.id} className="skin-tile">
                <article
                  className={`skin-tile__preview skin-tile__preview--card ${skin.id === ACTIVE_SKINS.card ? 'is-active' : ''}`}
                  style={skin.previewStyle}
                >
                  <FighterCard fighter={createPreviewFighter(skin)} owned={true} />
                </article>
                <div className="skin-tile__info">
                  <h3 className="skin-tile__name">{skin.name}</h3>
                  <p className="skin-tile__description">{skin.description}</p>
                  <div className="skin-tile__actions">
                    <Price amount={skin.price} size="md" />
                    <button
                      type="button"
                      className="button button--secondary skin-tile__buy"
                      disabled
                      aria-disabled="true"
                    >
                      In arrivo
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Skin Avatar ---------- */}
        <section className="skin-section" aria-labelledby="avatar-skins-title">
          <header className="skin-section__header">
            <p className="eyebrow">Skin Avatar</p>
            <h2 id="avatar-skins-title" className="skin-section__title">
              Personalizza il tuo profilo
            </h2>
          </header>
          <ul className="skin-grid" role="list">
            {PREVIEW_AVATAR_SKINS.map((skin) => (
              <li key={skin.id} className="skin-tile">
                <article
                  className={`skin-tile__preview skin-tile__preview--avatar ${skin.id === ACTIVE_SKINS.avatar ? 'is-active' : ''}`}
                >
                  <div
                    className="skin-avatar-ring"
                    style={{
                      '--ring-gradient': skin.ringStyle,
                    }}
                    aria-hidden="true"
                  >
                    <Avatar size={80} />
                  </div>
                </article>
                <div className="skin-tile__info">
                  <h3 className="skin-tile__name">{skin.name}</h3>
                  <p className="skin-tile__description">{skin.description}</p>
                  <div className="skin-tile__actions">
                    <Price amount={skin.price} size="md" />
                    <button
                      type="button"
                      className="button button--secondary skin-tile__buy"
                      disabled
                      aria-disabled="true"
                    >
                      In arrivo
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Le tue skin attive ---------- */}
        <section className="skin-active" aria-labelledby="active-title">
          <header className="skin-section__header">
            <p className="eyebrow">Attive ora</p>
            <h2 id="active-title" className="skin-section__title">
              Le tue skin attive
            </h2>
          </header>
          <div className="skin-active__strip">
            {activeCardSkin && (
              <div className="skin-active__item">
                <span className="skin-active__label">Carta</span>
                <div className="skin-active__preview" style={activeCardSkin.previewStyle}>
                  <FighterCard fighter={createPreviewFighter(activeCardSkin)} owned={true} />
                </div>
                <span className="skin-active__name">{activeCardSkin.name}</span>
              </div>
            )}
            {activeAvatarSkin && (
              <div className="skin-active__item">
                <span className="skin-active__label">Avatar</span>
                <div className="skin-active__preview skin-active__preview--avatar">
                  <div
                    className="skin-avatar-ring"
                    style={{ '--ring-gradient': activeAvatarSkin.ringStyle }}
                    aria-hidden="true"
                  >
                    <Avatar size={48} />
                  </div>
                </div>
                <span className="skin-active__name">{activeAvatarSkin.name}</span>
              </div>
            )}
          </div>
        </section>
      </Placeholder>
    </div>
  );
}
