# Client dell'API

Tutto quello che serve per parlare con il backend: entità TypeScript e una funzione per ogni endpoint.
I tipi sono **generati dal contratto OpenAPI del backend**, quindi non vanno mai scritti a mano.

## Avviare il backend in locale

Dal repo `gruppo-06-fighters_program-backend`:

```bash
cd fighters-program
docker compose up -d
export JWT_SECRET="$(openssl rand -base64 48)"
sh ./mvnw -pl application -am spring-boot:run
```

Il backend risponde su http://localhost:8080 (Swagger: http://localhost:8080/swagger-ui.html) e accetta chiamate
dal dev server di Vite (`http://localhost:5173`). Se il backend è altrove, copia `.env.example` in `.env.local` e
cambia `VITE_API_URL`.

## Usarlo in un componente

```tsx
import { useEffect, useState } from 'react'

import { api, ApiRequestError, type Card } from '../api'

export function CardList() {
  const [cards, setCards] = useState<Card[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.cards
      .list({ faction: 'Africana', size: 20 })
      .then((page) => setCards(page.content))
      .catch((caught: unknown) => setError(caught instanceof ApiRequestError ? caught.message : 'Errore'))
  }, [])

  if (error) return <p>{error}</p>
  return <ul>{cards.map((card) => <li key={card.code}>{card.name}</li>)}</ul>
}
```

## Login e sessione

```ts
await api.auth.register({ nickname: 'alice', email: 'alice@example.com', password: 'almeno-8-caratteri' })
await api.auth.login({ email: 'alice@example.com', password: 'almeno-8-caratteri' })
api.auth.isLoggedIn() // true
await api.auth.me()   // profilo dell'utente
api.auth.logout()
```

- Il token resta salvato nel `localStorage` e viene aggiunto da solo a ogni chiamata.
- Quando scade, o il backend lo rifiuta, viene cancellato e su `window` parte l'evento `SESSION_EXPIRED_EVENT`:
  ascoltalo per tornare alla pagina di login.

```ts
import { SESSION_EXPIRED_EVENT } from '../api'

window.addEventListener(SESSION_EXPIRED_EVENT, () => navigate('/login'))
```

## Errori

Ogni funzione, se il backend risponde con un errore, lancia un `ApiRequestError` con gli stessi campi del backend:

| Campo | Esempio |
|---|---|
| `status` | `422` (`0` se il backend non risponde) |
| `code` | `INVALID_DECK`, `VALIDATION_ERROR`, `UNAUTHORIZED`, `CONFLICT`, `NOT_FOUND`, `NETWORK_ERROR` |
| `message` | testo in inglese, da non mostrare così com'è all'utente |
| `details` | elenco dei problemi, es. le violazioni del mazzo o i campi non validi |

L'elenco completo dei codici è nel README del backend, sezione "Formato degli errori".

## Tutte le chiamate

| Funzione | Endpoint |
|---|---|
| `api.auth.register(request)` | `POST /api/auth/register` |
| `api.auth.login(request)` | `POST /api/auth/login` |
| `api.auth.me()` | `GET /api/me` |
| `api.cards.list(filter)`, `api.cards.get(code)` | `GET /api/cards`, `GET /api/cards/{code}` (senza login) |
| `api.collection.list(filter)`, `api.collection.progress()` | `GET /api/me/collection`, `GET /api/me/collection/progress` |
| `api.decks.list()`, `get(id)`, `create(request)`, `update(id, request)`, `remove(id)` | `/api/me/decks` |
| `api.decks.validate({ cards })` | `POST /api/me/decks/validate`: verifica senza salvare, ideale mentre l'utente costruisce il mazzo |
| `api.matches.challenge({ opponentNickname, deckId })` | `POST /api/matches` |
| `api.matches.incoming()`, `outgoing()` | sfide ricevute e inviate |
| `api.matches.accept(id, { deckId })` | accetta: il server gioca la partita e restituisce il replay |
| `api.matches.decline(id)`, `cancel(id)` | rifiuta (sfidato) o annulla (sfidante) |
| `api.matches.replay(id)` | mazzi e log turno per turno (`log` è `null` finché la partita non è finita) |
| `api.matches.history({ page, size })` | storico con esito `WIN`, `LOSS`, `DRAW` |

Le entità (`Card`, `CollectionEntry`, `Deck`, `MatchReplay`, `TurnLog`, ...) sono in `types.ts`.

## Quando il backend cambia

Con il backend acceso:

```bash
npm run api:update   # scarica openapi.json e rigenera src/api/schema.d.ts
npm run typecheck    # segnala ogni punto del frontend da aggiornare
```

Per un endpoint nuovo aggiungi la funzione nel file della sua area (es. `decks.ts`) e un test in `create-api.test.ts`.

## Test

```bash
npm test               # test unitari, senza backend
npm run test:contract  # gioca una partita vera contro il backend acceso
```
