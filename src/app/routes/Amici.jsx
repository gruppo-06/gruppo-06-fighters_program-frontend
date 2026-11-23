/** Amici: richieste di amicizia ricevute e inviate, lista degli amici e sfide rapide. */
import { useCallback, useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../components/Avatar.jsx';
import { ApiError, api } from '../../services/api.js';
import './Amici.css';

const LOAD_ERROR = 'Impossibile caricare gli amici. Riprova più tardi.';
const ACTION_ERROR = 'Operazione non riuscita. Riprova più tardi.';

const dateFormatter = new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' });

const formatDate = (value) => dateFormatter.format(new Date(value));

function requestErrorMessage(error) {
  if (!(error instanceof ApiError)) return ACTION_ERROR;
  if (error.status === 404) return 'Giocatore non trovato';
  if (error.status === 400) return 'Non puoi aggiungere te stesso';
  if (error.status === 409) return "Siete già amici o c'è già una richiesta in sospeso";
  return ACTION_ERROR;
}

export default function Amici() {
  const navigate = useNavigate();
  // null finché non arrivano le risposte del backend
  const [friends, setFriends] = useState(null);
  const [requests, setRequests] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [busyKey, setBusyKey] = useState(null);

  // In caso di errore restano le liste già caricate (o vuote) e compare l'avviso generale
  const loadAll = useCallback(
    () =>
      Promise.all([api.get('/me/friends'), api.get('/me/friends/requests')]).then(
        ([friendList, requestList]) => {
          setFriends(friendList);
          setRequests(requestList);
          setLoadError(false);
        },
        () => {
          setFriends((current) => current ?? []);
          setRequests((current) => current ?? { incoming: [], outgoing: [] });
          setLoadError(true);
        },
      ),
    [],
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function runAction(key, action) {
    setBusyKey(key);
    setActionError(null);
    try {
      await action();
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : ACTION_ERROR);
    } finally {
      setBusyKey(null);
      loadAll();
    }
  }

  const accept = (request) =>
    runAction(request.id, () => api.post(`/me/friends/requests/${request.id}/accept`));
  const decline = (request) =>
    runAction(request.id, () => api.post(`/me/friends/requests/${request.id}/decline`));

  function remove(friend) {
    if (!window.confirm(`Rimuovere @${friend.nickname} dagli amici?`)) return;
    runAction(friend.nickname, () =>
      api.delete(`/me/friends/${encodeURIComponent(friend.nickname)}`),
    );
  }

  return (
    <div className="container amici">
      <h1 className="amici-title">Amici</h1>

      {loadError && (
        <p className="amici-alert" role="alert">
          {LOAD_ERROR}
        </p>
      )}
      {actionError && (
        <p className="amici-alert" role="alert">
          {actionError}
        </p>
      )}

      {/* ---------- Aggiungi un amico ---------- */}
      <section className="amici-section" aria-labelledby="add-title">
        <h2 id="add-title" className="amici-section__title">
          Aggiungi un amico
        </h2>
        <AddFriendForm onSent={loadAll} />
      </section>

      {/* ---------- Richieste ricevute ---------- */}
      <section className="amici-section" aria-labelledby="incoming-title">
        <h2 id="incoming-title" className="amici-section__title">
          Richieste ricevute
        </h2>
        <RequestList
          requests={requests?.incoming}
          emptyText="Nessuna richiesta ricevuta."
          renderItem={(request) => (
            <li key={request.id} className="amici-row">
              <div className="amici-row__info">
                <p className="amici-row__title">@{request.nickname}</p>
                <p className="amici-row__meta">Richiesta del {formatDate(request.createdAt)}</p>
              </div>
              <div className="amici-row__actions">
                <button
                  className="button"
                  type="button"
                  disabled={busyKey === request.id}
                  onClick={() => accept(request)}
                >
                  Accetta
                </button>
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={busyKey === request.id}
                  onClick={() => decline(request)}
                >
                  Rifiuta
                </button>
              </div>
            </li>
          )}
        />
      </section>

      {/* ---------- Richieste inviate ---------- */}
      <section className="amici-section" aria-labelledby="outgoing-title">
        <h2 id="outgoing-title" className="amici-section__title">
          Richieste inviate
        </h2>
        <RequestList
          requests={requests?.outgoing}
          emptyText="Nessuna richiesta inviata."
          renderItem={(request) => (
            <li key={request.id} className="amici-row">
              <div className="amici-row__info">
                <p className="amici-row__title">@{request.nickname}</p>
                <p className="amici-row__meta">Richiesta del {formatDate(request.createdAt)}</p>
              </div>
              <div className="amici-row__actions">
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={busyKey === request.id}
                  onClick={() => decline(request)}
                >
                  Annulla
                </button>
              </div>
            </li>
          )}
        />
      </section>

      {/* ---------- I tuoi amici ---------- */}
      <section className="amici-section" aria-labelledby="friends-title">
        <h2 id="friends-title" className="amici-section__title">
          I tuoi amici
        </h2>
        {friends === null ? (
          <p className="amici-status">Caricamento…</p>
        ) : friends.length === 0 ? (
          <p className="amici-empty">
            Non hai ancora nessun amico. Invia una richiesta per iniziare.
          </p>
        ) : (
          <ul className="amici-grid" role="list">
            {friends.map((friend) => (
              <li key={friend.nickname} className="amici-card">
                <Avatar size={56} />
                <div className="amici-card__info">
                  <p className="amici-card__name">@{friend.nickname}</p>
                  <p className="amici-card__meta">amici dal {formatDate(friend.since)}</p>
                </div>
                <div className="amici-card__actions">
                  <button
                    className="button"
                    type="button"
                    disabled={busyKey === friend.nickname}
                    onClick={() =>
                      navigate(`/sfide?avversario=${encodeURIComponent(friend.nickname)}`)
                    }
                  >
                    Sfida
                  </button>
                  <button
                    className="button button--secondary"
                    type="button"
                    disabled={busyKey === friend.nickname}
                    onClick={() => remove(friend)}
                  >
                    Rimuovi
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function AddFriendForm({ onSent }) {
  const nicknameId = useId();
  const [nickname, setNickname] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const request = await api.post('/me/friends/requests', { nickname: nickname.trim() });
      setNickname('');
      setFeedback({ tone: 'success', text: `Richiesta inviata a @${request.nickname}.` });
    } catch (error) {
      setFeedback({ tone: 'error', text: requestErrorMessage(error) });
    } finally {
      setBusy(false);
      onSent();
    }
  }

  return (
    <form className="amici-form" onSubmit={submit}>
      <label className="amici-field" htmlFor={nicknameId}>
        <span>Nickname del giocatore</span>
        <input
          id={nicknameId}
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          minLength={3}
          maxLength={20}
          required
          disabled={busy}
        />
      </label>
      <button className="button" type="submit" disabled={busy}>
        {busy ? 'Invio in corso…' : 'Invia richiesta'}
      </button>
      {feedback && (
        <p
          className={`amici-feedback amici-feedback--${feedback.tone}`}
          role={feedback.tone === 'error' ? 'alert' : 'status'}
        >
          {feedback.text}
        </p>
      )}
    </form>
  );
}

function RequestList({ requests, emptyText, renderItem }) {
  if (requests === undefined) {
    return <p className="amici-status">Caricamento…</p>;
  }
  if (requests.length === 0) {
    return <p className="amici-empty">{emptyText}</p>;
  }
  return (
    <ul className="amici-list" role="list">
      {requests.map(renderItem)}
    </ul>
  );
}
