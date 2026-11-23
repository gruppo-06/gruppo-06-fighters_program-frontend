/** Pass Battaglia (Figma: PASS) — Anteprima. */
import Placeholder from '../../components/Placeholder.jsx';
import Price from '../../components/Price.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import { PREVIEW_PASS } from '../../data/previewPass.js';
import './Pass.css';

/** Calcola la percentuale di XP per la barra di avanzamento. */
function getXpPercent(pass) {
  const xpIntoCurrentLevel = pass.currentXP - (pass.xpTotalForCurrentLevel - pass.xpForNextLevel);
  return (xpIntoCurrentLevel / pass.xpForNextLevel) * 100;
}

/** Determina lo stato di un livello: 'claimed' | 'current' | 'locked'. */
function getLevelState(level, pass) {
  if (level < pass.currentLevel) return 'claimed';
  if (level === pass.currentLevel) return 'current';
  return 'locked';
}

/** Renderizza una ricompensa (free o premium). */
function Reward({ reward, state, isPremium }) {
  const isClaimed = state === 'claimed';
  const isCurrent = state === 'current';
  const isLocked = state === 'locked';
  const premiumLocked = isPremium && PREVIEW_PASS.isPremiumUnlocked === false && !isClaimed;

  let iconName = 'gift';
  let iconColor = 'var(--color-text-secondary)';
  let label = reward.label;

  if (reward.type === 'credits') {
    iconName = 'credits';
    iconColor = 'var(--color-accent-link)';
  } else if (reward.type === 'pack') {
    iconName = 'package';
    iconColor = 'var(--color-rarity-rara)';
  } else if (reward.type === 'skin') {
    iconName = 'shirt';
    iconColor = 'var(--color-rarity-epica)';
  }

  return (
    <div
      className={`pass-reward ${isPremium ? 'pass-reward--premium' : ''} ${isClaimed ? 'is-claimed' : ''} ${isCurrent ? 'is-current' : ''} ${isLocked ? 'is-locked' : ''} ${premiumLocked ? 'is-premium-locked' : ''}`}
    >
      <div className="pass-reward__icon" aria-hidden="true">
        <svg
          className="svg-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: iconColor }}
        >
          {iconName === 'credits' && (
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
              fill="currentColor"
            />
          )}
          {iconName === 'package' && (
            <path
              d="M20 8h-3V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v4H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-8 10H6V14h6v4zm0-6H6v-4h6v4zm8 6H14V14h6v4zm0-6H14v-4h6v4z"
              fill="currentColor"
            />
          )}
          {iconName === 'shirt' && (
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4-11c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v5H8V9c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8h-4v5z"
              fill="currentColor"
            />
          )}
        </svg>
        {isClaimed && (
          <svg
            className="pass-reward__check"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {premiumLocked && (
          <svg
            className="pass-reward__lock"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <p className="pass-reward__label">{label}</p>
      {isPremium && premiumLocked && <span className="pass-reward__premium-badge">Premium</span>}
    </div>
  );
}

export default function Pass() {
  const pass = PREVIEW_PASS;
  const xpPercent = getXpPercent(pass);
  const xpIntoCurrentLevel = pass.currentXP - (pass.xpTotalForCurrentLevel - pass.xpForNextLevel);

  return (
    <div className="container pass">
      <Placeholder
        eyebrow="Anteprima — dati di esempio"
        title="Pass Battaglia"
        description="Completa sfide, guadagna XP e sblocca ricompense gratuite e premium. La Stagione 1 dura 30 livelli."
      >
        {/* ---------- Header Pass ---------- */}
        <header className="pass-header">
          <div className="pass-header__info">
            <p className="eyebrow">Stagione {pass.season}</p>
            <h1 className="pass-header__title">{pass.title}</h1>
            <div className="pass-header__level">
              <span className="pass-header__level-label">Livello</span>
              <span className="pass-header__level-value">
                {pass.currentLevel} / {pass.maxLevel}
              </span>
            </div>
          </div>
          <div className="pass-header__xp">
            <ProgressBar
              value={xpPercent}
              label={`Esperienza: ${xpIntoCurrentLevel} su ${pass.xpForNextLevel} XP`}
              className="pass-header__progress"
            />
            <p className="pass-header__xp-text">
              {xpIntoCurrentLevel.toLocaleString('it-IT')} /{' '}
              {pass.xpForNextLevel.toLocaleString('it-IT')} XP al livello {pass.currentLevel + 1}
            </p>
          </div>
        </header>

        {/* ---------- Track orizzontale dei livelli ---------- */}
        <section className="pass-track" aria-labelledby="track-title">
          <h2 id="track-title" className="visually-hidden">
            Ricompense per livello
          </h2>
          <div className="pass-track__scroller" role="list" aria-label="Livelli del pass battaglia">
            {pass.levels.map((levelData) => {
              const state = getLevelState(levelData.level, pass);
              return (
                <div key={levelData.level} className="pass-level" role="listitem">
                  <div className="pass-level__number">{levelData.level}</div>
                  <div className="pass-level__rewards">
                    <Reward reward={levelData.free} state={state} isPremium={false} />
                    <Reward reward={levelData.premium} state={state} isPremium={true} />
                  </div>
                  <div className="pass-level__labels">
                    <span className="pass-level__label pass-level__label--free">Gratis</span>
                    <span className="pass-level__label pass-level__label--premium">Premium</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------- Sblocca Premium ---------- */}
        <section className="pass-premium" aria-labelledby="premium-title">
          <h2 id="premium-title" className="visually-hidden">
            Sblocca Premium
          </h2>
          <div className="pass-premium__card">
            <div className="pass-premium__content">
              <p className="eyebrow">Pass Premium</p>
              <h3 className="pass-premium__title">Sblocca tutte le ricompense Premium</h3>
              <p className="pass-premium__description">
                Ottieni accesso immediato a skin esclusive, pacchetti rari e crediti extra a ogni
                livello.
              </p>
            </div>
            <div className="pass-premium__actions">
              <Price amount={pass.premiumPrice} size="lg" />
              <button type="button" className="button button--lg" disabled aria-disabled="true">
                Sblocca Premium — In arrivo
              </button>
            </div>
          </div>
        </section>
      </Placeholder>
    </div>
  );
}
