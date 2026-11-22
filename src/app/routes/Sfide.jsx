/** Sfide tra giocatori: lancia una sfida, sfide ricevute, inviate e storico (Figma: SFIDE). */
import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Tag from '../../components/Tag.jsx';
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

const dateFormatter = new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' });

const formatDate = (value) => dateFormatter.format(new Date(value));

/** Valore del select dei mazzi: il primo mazzo è preselezionato. */
const defaultDeckValue = (decks) => (decks[0] ? String(decks[0].id) : '');

function challengeErrorMessage(error) {
  if (!(error instanceof ApiError)) return ACTION_ERROR;
  if (error.status === 404) return 'Giocatore non trovato';
  if (error.status === 400) return 'Non puoi sfidare te stesso';
  if (error.status === 422) return error.message;
  return ACTION_ERROR;
}

export default function Sfide() {
  const navigate = useNavigate();
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

      {/* ---------- Lancia una sfida ---------- */}
      <section className="sfide-section" aria-labelledby="challenge-title">
        <h2 id="challenge-title" className="sfide-section__title">
          Lancia una sfida
        </h2>
        <ChallengeForm decks={decks} onSent={loadLists} />
      </section>

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

function ChallengeForm({ decks, onSent }) {
  const nicknameId = useId();
  const deckSelectId = useId();
  const [nickname, setNickname] = useState('');
  const [chosenDeck, setChosenDeck] = useState('');
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
        <p className="sfide-row__title">@{match.challengerNickname} ti sfida</p>
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
        <p className="sfide-row__title">Hai sfidato @{match.opponentNickname}</p>
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
