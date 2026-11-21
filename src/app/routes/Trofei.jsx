/** Trofei e profilo del giocatore (Figma: TROFEI). */
import { useState } from 'react';
import Avatar from '../../components/Avatar.jsx';
import Chip, { ChipSelect } from '../../components/Chip.jsx';
import GoalCard from '../../components/GoalCard.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import RewardTile from '../../components/RewardTile.jsx';
import StatBox from '../../components/StatBox.jsx';
import Tag from '../../components/Tag.jsx';
import TrophyCard from '../../components/TrophyCard.jsx';
import {
  mockGoalIds,
  mockPlayer,
  mockTrophies,
  REWARD_TYPES,
  TROPHY_CATEGORIES,
  TROPHY_TIERS,
} from '../../data/mockTrophies.js';
import './Trofei.css';

// useGrouping 'always': in italiano Intl non separa le migliaia sotto 10.000 ("1850" → "1.850")
const formatter = new Intl.NumberFormat('it-IT', { useGrouping: 'always' });

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tutti' },
  { value: 'unlocked', label: 'Sbloccati' },
  { value: 'in-progress', label: 'In corso' },
  { value: 'locked', label: 'Bloccati' },
];

const categoryLabel = (id) => TROPHY_CATEGORIES.find((category) => category.id === id)?.label;

export default function Trofei() {
  // TODO: caricare profilo e trofei dal backend (es. api.get('/me/trophies')) quando l'endpoint esiste
  const player = mockPlayer;
  const trophies = mockTrophies;
  const goals = mockGoalIds
    .map((id) => trophies.find((trophy) => trophy.id === id))
    .filter(Boolean);

  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  const visibleTrophies = trophies.filter(
    (trophy) =>
      (category === 'all' || trophy.category === category) &&
      (status === 'all' || trophy.status === status),
  );

  const xpPercent = (player.xp / player.xpNextLevel) * 100;
  const xpMissing = player.xpNextLevel - player.xp;

  return (
    <div className="container trophies">
      {/* ---------- Profilo giocatore ---------- */}
      <section className="trophies-profile" aria-labelledby="profile-title">
        <Avatar src={player.avatar} size={120} className="trophies-profile__avatar" />
        <div className="trophies-profile__level">
          <p className="eyebrow">Trofei · Profilo giocatore</p>
          <div className="trophies-profile__name">
            <h1 id="profile-title">
              <span className="visually-hidden">Trofei di </span>@{player.username}
            </h1>
            <Tag tone="outline">
              Liv. {player.level} · {player.levelTitle}
            </Tag>
          </div>
          <ProgressBar
            value={xpPercent}
            label={`Esperienza: ${player.xp} su ${player.xpNextLevel} XP`}
          />
          <p className="trophies-profile__xp">
            {formatter.format(player.xp)} / {formatter.format(player.xpNextLevel)} XP · mancano{' '}
            {formatter.format(xpMissing)} XP al livello {player.level + 1}
          </p>
        </div>
        <div className="trophies-profile__stats">
          <StatBox value={`${player.trophiesUnlocked}/${player.trophiesTotal}`} label="trofei" />
          <StatBox value={formatter.format(player.wins)} label="vittorie" />
          <StatBox value={formatter.format(player.creditsWon)} label="crediti vinti" />
        </div>
      </section>

      {/* ---------- Prossimi traguardi ---------- */}
      <section className="trophies-goals" aria-labelledby="goals-title">
        <header className="section-header">
          <p className="eyebrow">Quasi fatto</p>
          <h2 id="goals-title" className="section-header__title">
            Prossimi traguardi
          </h2>
        </header>
        <ul className="trophies-goals__list" role="list">
          {goals.map((trophy) => (
            <li key={trophy.id}>
              <GoalCard
                tag={`${categoryLabel(trophy.category)} · ${TROPHY_TIERS[trophy.tier]}`}
                title={trophy.title}
                description={trophy.description}
                progress={trophy.progress}
                reward={trophy.reward}
                image={trophy.image}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Tutti i trofei ---------- */}
      <section className="trophies-all" aria-labelledby="all-title">
        <h2 id="all-title" className="visually-hidden">
          Tutti i trofei
        </h2>
        <div className="trophies-filters">
          <div className="trophies-filters__categories" role="group" aria-label="Categoria">
            <Chip selected={category === 'all'} onClick={() => setCategory('all')}>
              Tutti · {trophies.length}
            </Chip>
            {TROPHY_CATEGORIES.map(({ id, label }) => (
              <Chip key={id} selected={category === id} onClick={() => setCategory(id)}>
                {label}
              </Chip>
            ))}
          </div>
          <ChipSelect
            prefix="Mostra:"
            label="Mostra trofei"
            value={status}
            options={STATUS_OPTIONS}
            onChange={setStatus}
          />
        </div>

        {visibleTrophies.length > 0 ? (
          <ul className="trophies-grid" role="list">
            {visibleTrophies.map((trophy) => (
              <li key={trophy.id}>
                <TrophyCard
                  status={trophy.status}
                  category={`${TROPHY_TIERS[trophy.tier]} · ${categoryLabel(trophy.category)}`}
                  title={trophy.title}
                  description={trophy.description}
                  progress={trophy.progress}
                  reward={trophy.reward}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="trophies-empty">Nessun trofeo corrisponde ai filtri selezionati.</p>
        )}
      </section>

      {/* ---------- Ricompense ---------- */}
      <section className="trophies-rewards" aria-labelledby="rewards-title">
        <div className="trophies-rewards__text">
          <p className="eyebrow">Ricompense</p>
          <h2 id="rewards-title" className="section-header__title">
            Cosa puoi vincere
          </h2>
          <p className="trophies-rewards__description">
            I crediti vinti rientrano nel ciclo pacchetti → collezione → sfide.
          </p>
        </div>
        <ul className="trophies-rewards__list" role="list">
          {REWARD_TYPES.map((reward) => (
            <li key={reward.id}>
              <RewardTile {...reward} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
