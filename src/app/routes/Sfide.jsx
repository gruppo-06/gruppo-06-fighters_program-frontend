/** Sfide tra giocatori: lancia una sfida, sfide ricevute, inviate e storico (Figma: SFIDE). */
import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Placeholder from '../../components/Placeholder.jsx';
import Price from '../../components/Price.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import Tag from '../../components/Tag.jsx';
import { previewDailyChallenges } from '../../data/previewDailyChallenges.js';
import { ApiError, api } from '../../services/api.js';
import './Sfide.css';

const INCOMING_POLL_MS = 10_000;
const LOAD_ERROR = 'Impossibile caricare le sfide. Riprova più tardi.';
const ACTION_ERROR = 'Operazione non riuscita. Riprova più tardi.';

const STATUS_LABELS = {
  PENDING: 'In attesa',
  FINISHED: 'Conclusa',
};

const RESULTS = {
  WIN: { label: 'Vittoria', className: 'sfide-result--win' },
  LOSS: { label: 'Sconfitta', className: 'sfide-result--loss' },
  DRAW: { label: 'Pareggio', className: 'sfide-result--draw' },
};

const MODE_OPTIONS = [
  { value: 'BASE', label: 'Base', hint: 'Solo attacco e difesa' },
  { value: 'ADVANCED', label: 'Avanzata', hint: 'Velocità, schivata e colpi critici' },
];

const MODE_TAGS = {
  BASE: { label: 'Base', tone: 'outline' },
  ADVANCED: { label: 'Avanzata', tone: 'epica' },
};

const ADVANCED_DISABLED_MESSAGE = 'The advanced mode is not enabled';

const dateFormatter = new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' });

const formatDate = (value) => dateFormatter.format(new Date(value));

/** Valore del select dei mazzi: il primo mazzo è preselezionato. */
const defaultDeckValue = (decks) => (decks[0] ? String(decks[0].id) : '');

function quickMatchErrorMessage(error) {
  if (!(error instanceof ApiError)) return ACTION_ERROR;
  if (error.status === 409) return 'Nessun avversario disponibile al momento, riprova tra poco';
  if (error.status === 400) return error.message;
  if (error.status === 422) return 'Il mazzo non è valido';
  return ACTION_ERROR;
}

function challengeErrorMessage(error) {
  if (!(error instanceof ApiError)) return ACTION_ERROR;
  if (error.status === 404) return 'Giocatore non trovato';
  if (error.status === 400 && error.message === ADVANCED_DISABLED_MESSAGE) {
    return 'La modalità avanzata non è attiva sul server';
  }
  if (error.status === 400) return 'Non puoi sfidare te stesso';
  if (error.status === 422) return error.message;
  return ACTION_ERROR;
}

export default function Sfide() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillNickname = searchParams.get('avversario') ?? '';
  // null finché non arrivano le risposte del backend
  const [decks, setDecks] = useState(null);
  const [incoming, setIncoming] = useState(null);
  const [outgoing, setOutgoing] = useState(null);
  const [history, setHistory] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // In caso di errore la lista resta vuota e compare l'avviso generale
  const loadInto = useCallback(
    (path, setter, pick = (data) => data) =>
      api.get(path).then(
        (data) => setter(pick(data)),
        () => {
          setter([]);
          setLoadError(true);
        },
      ),
    [],
  );

  const loadLists = useCallback(
    () =>
      Promise.all([
        loadInto('/matches/incoming', setIncoming),
        loadInto('/matches/outgoing', setOutgoing),
        loadInto('/matches/history', setHistory, (page) => page.content),
      ]),
    [loadInto],
  );

  useEffect(() => {
    loadInto('/me/decks', setDecks);
    loadLists();
  }, [loadInto, loadLists]);

  useEffect(() => {
    const id = setInterval(() => loadInto('/matches/incoming', setIncoming), INCOMING_POLL_MS);
    return () => clearInterval(id);
  }, [loadInto]);

  async function runAction(matchId, action, onDone) {
    setBusyId(matchId);
    setActionError(null);
    try {
      const result = await action();
      onDone?.(result);
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : ACTION_ERROR);
    } finally {
      setBusyId(null);
      loadLists();
    }
  }

  const accept = (match, deckId) =>
    runAction(
      match.id,
      () => api.post(`/matches/${match.id}/accept`, { deckId }),
      () => navigate(`/partita?match=${match.id}`),
    );
  const decline = (match) => runAction(match.id, () => api.post(`/matches/${match.id}/decline`));
  const cancel = (match) => runAction(match.id, () => api.post(`/matches/${match.id}/cancel`));

  return (
    <div className="container sfide">
      <h1 className="sfide-title">Sfide</h1>

      {loadError && (
        <p className="sfide-alert" role="alert">
          {LOAD_ERROR}
        </p>
      )}
      {actionError && (
        <p className="sfide-alert" role="alert">
          {actionError}
        </p>
      )}

      {/* ---------- Partita rapida ---------- */}
      <QuickMatch decks={decks} />

      {/* ---------- Lancia una sfida ---------- */}
      <section className="sfide-section" aria-labelledby="challenge-title">
        <h2 id="challenge-title" className="sfide-section__title">
          Lancia una sfida
        </h2>
        <ChallengeForm decks={decks} onSent={loadLists} initialNickname={prefillNickname} />
      </section>

      {/* ---------- Sfide giornaliere (anteprima) ---------- */}
      <DailyChallengesPreview />

      {/* ---------- Sfide ricevute ---------- */}
      <section className="sfide-section" aria-labelledby="incoming-title">
        <h2 id="incoming-title" className="sfide-section__title">
          Sfide ricevute
        </h2>
        <MatchList
          matches={incoming}
          emptyText="Nessuna sfida ricevuta."
          renderItem={(match) => (
            <IncomingRow
              key={match.id}
              match={match}
              decks={decks ?? []}
              busy={busyId === match.id}
              onAccept={accept}
              onDecline={decline}
            />
          )}
        />
      </section>

      {/* ---------- Sfide inviate ---------- */}
      <section className="sfide-section" aria-labelledby="outgoing-title">
        <h2 id="outgoing-title" className="sfide-section__title">
          Sfide inviate
        </h2>
        <MatchList
          matches={outgoing}
          emptyText="Nessuna sfida inviata."
          renderItem={(match) => (
            <OutgoingRow
              key={match.id}
              match={match}
              busy={busyId === match.id}
              onCancel={cancel}
            />
          )}
        />
      </section>

      {/* ---------- Storico ---------- */}
      <section className="sfide-section" aria-labelledby="history-title">
        <h2 id="history-title" className="sfide-section__title">
          Storico
        </h2>
        <MatchList
          matches={history}
          emptyText="Nessuna partita nello storico."
          renderItem={(entry) => <HistoryRow key={entry.matchId} entry={entry} />}
        />
      </section>
    </div>
  );
}

function ModeTag({ mode }) {
  const { label, tone } = MODE_TAGS[mode] ?? MODE_TAGS.BASE;
  return (
    <Tag tone={tone} className="sfide-row__mode">
      {label}
    </Tag>
  );
}

function ModeFieldset({ name, value, onChange, disabled }) {
  return (
    <fieldset className="sfide-mode">
      <legend>Modalità</legend>
      <div className="sfide-mode__options">
        {MODE_OPTIONS.map((option) => (
          <label key={option.value} className="sfide-mode__option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              disabled={disabled}
            />
            <span className="sfide-mode__name">{option.label}</span>
            <span className="sfide-mode__hint">{option.hint}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function QuickMatch({ decks }) {
  const navigate = useNavigate();
  const deckSelectId = useId();
  const modeName = useId();
  const [chosenDeck, setChosenDeck] = useState('');
  const [mode, setMode] = useState('BASE');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const list = decks ?? [];
  const deckValue = chosenDeck || defaultDeckValue(list);
  const deck = list.find((item) => String(item.id) === deckValue);

  async function start(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const match = await api.post('/matches/quick', { deckId: deck.id, mode });
      navigate(`/partita?match=${match.id}`);
    } catch (err) {
      setError(quickMatchErrorMessage(err));
      setBusy(false);
    }
  }

  return (
    <section className="sfide-section sfide-quick" aria-labelledby="quick-title">
      <h2 id="quick-title" className="sfide-quick__title">
        Partita rapida
      </h2>
      <p className="sfide-quick__hint">
        Il server sceglie un avversario a caso e la partita parte subito.
      </p>
      {decks === null && <p className="sfide-status">Caricamento dei mazzi…</p>}
      {decks !== null && decks.length === 0 && (
        <p className="sfide-empty">
          Non hai ancora nessun mazzo. Crealo nella pagina <Link to="/mazzi">Mazzi</Link> per
          giocare.
        </p>
      )}
      {decks !== null && decks.length > 0 && (
        <form className="sfide-form sfide-quick__form" onSubmit={start}>
          <label className="sfide-field" htmlFor={deckSelectId}>
            <span>Mazzo</span>
            <select
              id={deckSelectId}
              value={deckValue}
              onChange={(event) => setChosenDeck(event.target.value)}
              disabled={busy}
            >
              {list.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name} ({item.cardCount} carte)
                </option>
              ))}
            </select>
          </label>
          <ModeFieldset name={modeName} value={mode} onChange={setMode} disabled={busy} />
          <button className="button button--lg sfide-quick__start" type="submit" disabled={busy}>
            {busy ? 'Ricerca in corso…' : 'Gioca ora'}
          </button>
          {error && (
            <p className="sfide-feedback sfide-feedback--error" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}

function DailyChallengesPreview() {
  return (
    <Placeholder
      eyebrow="Sfide giornaliere"
      title="Sfide giornaliere in arrivo"
      description="Ogni giorno trovi nuovi obiettivi da completare: quando li porti a termine ritiri un premio in crediti. Ecco come li vedrai."
    >
      <p className="sfide-preview-label">Anteprima — dati di esempio</p>
      <ul className="sfide-goals" role="list">
        {previewDailyChallenges.map((goal) => (
          <li key={goal.id} className="sfide-goal">
            <div className="sfide-goal__head">
              <p className="sfide-goal__title">{goal.title}</p>
              <Price amount={goal.reward} size="sm" />
            </div>
            <ProgressBar
              value={(goal.progress / goal.target) * 100}
              label={`Avanzamento: ${goal.progress} su ${goal.target}`}
            />
            <div className="sfide-goal__foot">
              <p className="sfide-goal__count">
                {goal.progress}/{goal.target}
              </p>
              <button className="button button--secondary" type="button" disabled title="In arrivo">
                Ritira
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Placeholder>
  );
}

function ChallengeForm({ decks, onSent, initialNickname }) {
  const nicknameId = useId();
  const deckSelectId = useId();
  const modeName = useId();
  const [nickname, setNickname] = useState(initialNickname);
  const [chosenDeck, setChosenDeck] = useState('');
  const [mode, setMode] = useState('BASE');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (decks === null) {
    return <p className="sfide-status">Caricamento dei mazzi…</p>;
  }

  if (decks.length === 0) {
    return (
      <p className="sfide-empty">
        Non hai ancora nessun mazzo. Crealo nella pagina <Link to="/mazzi">Mazzi</Link> per lanciare
        una sfida.
      </p>
    );
  }

  const deckValue = chosenDeck || defaultDeckValue(decks);
  const deck = decks.find((item) => String(item.id) === deckValue);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const match = await api.post('/matches', {
        opponentNickname: nickname.trim(),
        deckId: deck.id,
        mode,
      });
      setNickname('');
      setFeedback({ tone: 'success', text: `Sfida inviata a @${match.opponentNickname}.` });
      onSent();
    } catch (error) {
      setFeedback({ tone: 'error', text: challengeErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="sfide-form" onSubmit={submit}>
      <label className="sfide-field" htmlFor={nicknameId}>
        <span>Nickname dell&apos;avversario</span>
        <input
          id={nicknameId}
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          minLength={3}
          maxLength={20}
          required
        />
      </label>
      <label className="sfide-field" htmlFor={deckSelectId}>
        <span>Mazzo</span>
        <select
          id={deckSelectId}
          value={deckValue}
          onChange={(event) => setChosenDeck(event.target.value)}
        >
          {decks.map((item) => (
            <option key={item.id} value={String(item.id)}>
              {item.name} ({item.cardCount} carte)
            </option>
          ))}
        </select>
      </label>
      <ModeFieldset name={modeName} value={mode} onChange={setMode} disabled={busy} />
      <button className="button" type="submit" disabled={busy}>
        {busy ? 'Invio in corso…' : 'Lancia la sfida'}
      </button>
      {feedback && (
        <p
          className={`sfide-feedback sfide-feedback--${feedback.tone}`}
          role={feedback.tone === 'error' ? 'alert' : 'status'}
        >
          {feedback.text}
        </p>
      )}
    </form>
  );
}

function IncomingRow({ match, decks, busy, onAccept, onDecline }) {
  const deckSelectId = useId();
  const [chosenDeck, setChosenDeck] = useState('');
  const deckValue = chosenDeck || defaultDeckValue(decks);
  const deck = decks.find((item) => String(item.id) === deckValue);

  return (
    <li className="sfide-row">
      <div className="sfide-row__info">
        <p className="sfide-row__title">
          @{match.challengerNickname} ti sfida <ModeTag mode={match.mode} />
        </p>
        <p className="sfide-row__meta">
          {formatDate(match.createdAt)} · {STATUS_LABELS[match.status] ?? match.status}
        </p>
      </div>
      <div className="sfide-row__actions">
        <label className="sfide-field" htmlFor={deckSelectId}>
          <span>Mazzo</span>
          <select
            id={deckSelectId}
            value={deckValue}
            onChange={(event) => setChosenDeck(event.target.value)}
            disabled={busy || decks.length === 0}
          >
            {decks.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.name} ({item.cardCount} carte)
              </option>
            ))}
          </select>
        </label>
        <button
          className="button"
          type="button"
          disabled={busy || !deck}
          onClick={() => onAccept(match, deck.id)}
        >
          Accetta
        </button>
        <button
          className="button button--secondary"
          type="button"
          disabled={busy}
          onClick={() => onDecline(match)}
        >
          Rifiuta
        </button>
      </div>
    </li>
  );
}

function OutgoingRow({ match, busy, onCancel }) {
  return (
    <li className="sfide-row">
      <div className="sfide-row__info">
        <p className="sfide-row__title">
          Hai sfidato @{match.opponentNickname} <ModeTag mode={match.mode} />
        </p>
        <p className="sfide-row__meta">
          {formatDate(match.createdAt)} · {STATUS_LABELS[match.status] ?? match.status}
        </p>
      </div>
      <div className="sfide-row__actions">
        {match.status === 'PENDING' && (
          <button
            className="button button--secondary"
            type="button"
            disabled={busy}
            onClick={() => onCancel(match)}
          >
            Annulla
          </button>
        )}
        {match.status === 'FINISHED' && (
          <Link className="button" to={`/partita?match=${match.id}`}>
            Guarda la partita
          </Link>
        )}
      </div>
    </li>
  );
}

function HistoryRow({ entry }) {
  const result = RESULTS[entry.result] ?? { label: entry.result, className: '' };
  return (
    <li className="sfide-row">
      <div className="sfide-row__info">
        <p className="sfide-row__title">
          <Tag className={result.className}>{result.label}</Tag> contro @{entry.opponentNickname}
        </p>
        <p className="sfide-row__meta">{formatDate(entry.finishedAt)}</p>
      </div>
      <div className="sfide-row__actions">
        <Link className="button button--secondary" to={`/partita?match=${entry.matchId}`}>
          Rivedi
        </Link>
      </div>
    </li>
  );
}

function MatchList({ matches, emptyText, renderItem }) {
  if (matches === null) {
    return <p className="sfide-status">Caricamento…</p>;
  }
  if (matches.length === 0) {
    return <p className="sfide-empty">{emptyText}</p>;
  }
  return (
    <ul className="sfide-list" role="list">
      {matches.map(renderItem)}
    </ul>
  );
}
