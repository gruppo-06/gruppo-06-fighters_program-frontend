/** Accesso e registrazione del giocatore. */
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login, register } from '../../services/auth.js';
import './Accesso.css';

const MODES = {
  login: { title: 'Bentornato', action: 'Accedi', switchLabel: 'Non hai un account? Registrati' },
  register: {
    title: 'Unisciti al torneo',
    action: 'Crea account',
    switchLabel: 'Hai già un account? Accedi',
  },
};

export default function Accesso() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ nickname: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const texts = MODES[mode];

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.nickname, form.email, form.password);
      }
      navigate(location.state?.from ?? '/collezione', { replace: true });
    } catch (failure) {
      setError(messageOf(failure, mode));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="access">
      <a className="access__logo" href="/">
        <img src="/images/logo.webp" alt="Fighters Program – Home" width="192" height="64" />
      </a>
      <section className="access__panel" aria-labelledby="access-title">
        <p className="eyebrow">Area giocatore</p>
        <h1 id="access-title" className="access__title">
          {texts.title}
        </h1>
        <form className="access__form" onSubmit={submit}>
          {mode === 'register' && (
            <label className="access__field">
              <span>Nickname</span>
              <input
                value={form.nickname}
                onChange={update('nickname')}
                minLength={3}
                maxLength={20}
                autoComplete="username"
                required
              />
            </label>
          )}
          <label className="access__field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              autoComplete="email"
              required
            />
          </label>
          <label className="access__field">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              minLength={mode === 'register' ? 8 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>
          {error && (
            <p className="access__error" role="alert">
              {error}
            </p>
          )}
          <button className="button button--lg access__submit" type="submit" disabled={busy}>
            {busy ? 'Attendere…' : texts.action}
          </button>
        </form>
        <button
          className="access__switch"
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError(null);
          }}
        >
          {texts.switchLabel}
        </button>
      </section>
    </main>
  );
}

function messageOf(failure, mode) {
  if (failure.status === 401) return 'Email o password non corretti.';
  if (failure.status === 409) return 'Nickname o email già in uso.';
  if (failure.status === 400) {
    return mode === 'register'
      ? 'Controlla i dati: nickname da 3 a 20 caratteri, password di almeno 8.'
      : 'Controlla email e password.';
  }
  return 'Il server non risponde. Riprova tra poco.';
}
