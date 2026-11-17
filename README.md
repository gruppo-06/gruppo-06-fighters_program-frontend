# Fighters Program

Frontend del gioco di carte collezionabili online. Progetto **Vite + React (JavaScript)** multi-page:

- **Area pubblica**: pagine HTML statiche (ottimizzate per la SEO) che possono contenere piccole "isole" React.
- **Area giocatore**: una Single Page Application React con `react-router-dom`, servita da `app.html` sotto il percorso `/app/*`.

> Lo stato attuale è solo lo **scaffold**: pagine e rotte sono segnaposto da implementare.
> Il nome "Fighters Program" e il dominio `example.com` nei meta tag sono provvisori.

## Requisiti

- Node.js 20.19+ (consigliato 22 o superiore)
- npm 10+

## Installazione

```bash
npm install
cp .env.example .env   # poi imposta VITE_API_URL
```

Su Windows (PowerShell) al posto di `cp`: `Copy-Item .env.example .env`.

## Script npm

| Comando                | Cosa fa                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `npm run dev`          | Avvia il server di sviluppo su http://localhost:5173            |
| `npm run build`        | Crea la build di produzione in `dist/`                          |
| `npm run preview`      | Serve localmente la build di `dist/` per provarla               |
| `npm run lint`         | Controlla il codice con ESLint                                  |
| `npm run format`       | Formatta tutti i file con Prettier                              |
| `npm run format:check` | Verifica la formattazione senza modificare i file (utile in CI) |

In sviluppo:

- sito pubblico: http://localhost:5173/ , http://localhost:5173/catalogo.html , …
- area giocatore: http://localhost:5173/app/login , http://localhost:5173/app/dashboard , …

## Struttura del progetto

```
.
├── index.html, gioco.html, …, 404.html   # pagine pubbliche statiche
├── app.html                              # pagina che ospita la SPA dell'area giocatore
├── public/                               # file copiati così come sono nella build
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/cards/                     # immagini delle carte
├── src/
│   ├── styles/                           # CSS globale (mobile-first, nessun framework)
│   │   ├── main.css                      # entry: importa i tre file sotto
│   │   ├── variables.css                 # design token (colori, font, spaziature)
│   │   ├── reset.css
│   │   └── base.css                      # stili base + header/footer del sito
│   ├── components/                       # componenti React condivisi (Card, CardGrid, …)
│   ├── data/                             # dati finti per lo sviluppo
│   ├── pages/                            # script d'ingresso delle isole delle pagine statiche
│   │   ├── mountIsland.jsx               # helper per montare un'isola
│   │   └── catalogo.jsx                  # isola di catalogo.html
│   ├── app/                              # SPA dell'area giocatore
│   │   ├── main.jsx                      # entry della SPA
│   │   ├── router.jsx                    # definizione delle rotte
│   │   ├── layout/                       # layout con navbar
│   │   └── routes/                       # un componente per ogni rotta
│   └── services/
│       └── api.js                        # client fetch verso il backend
├── vite.config.js                        # registro delle pagine (build.rollupOptions.input)
├── eslint.config.js
└── .prettierrc.json5
```

## Aggiungere una nuova pagina statica

1. Copia una pagina esistente semplice (es. `gioco.html`) nella root, ad esempio `torneo.html`.
2. Aggiorna `<title>`, `meta description`, `link rel="canonical"` e i meta **Open Graph**
   (`og:title`, `og:description`, `og:url`). Mantieni l'HTML semantico (`header`, `main`, `section`, un solo `h1`).
3. Aggiungi il link nella navigazione (`<nav class="site-nav">`) di **tutte** le pagine e imposta
   `aria-current="page"` sul link della pagina corrente.
4. **Registra la pagina in `vite.config.js`**, nell'oggetto `pages`:
   ```js
   torneo: 'torneo.html',
   ```
   Se dimentichi questo passaggio la pagina funziona con `npm run dev` ma **non finisce nella build**.

### Aggiungere un'isola React a una pagina statica

1. Nell'HTML inserisci un contenitore e lo script d'ingresso:
   ```html
   <div id="torneo-root"></div>
   <script type="module" src="/src/pages/torneo.jsx"></script>
   ```
2. Crea `src/pages/torneo.jsx`:
   ```jsx
   import Classifica from '../components/Classifica.jsx';
   import { mountIsland } from './mountIsland.jsx';

   mountIsland('torneo-root', <Classifica />);
   ```

Il contenuto importante per la SEO va scritto nell'HTML, non nell'isola: i motori di ricerca
potrebbero non eseguire il JavaScript. Vedi `catalogo.html` + `src/pages/catalogo.jsx` come esempio.

## Aggiungere una rotta all'area giocatore

1. Crea il componente in `src/app/routes/`, es. `Classifica.jsx`:
   ```jsx
   export default function Classifica() {
     return <h1>Classifica</h1>;
   }
   ```
2. Registralo in `src/app/router.jsx`, dentro `children`:
   ```jsx
   { path: 'classifica', element: <Classifica /> },
   ```
   I path si scrivono **senza** `/app`: il prefisso è aggiunto da `basename`.
   La rotta sarà quindi raggiungibile a `/app/classifica`.
3. Se deve comparire nella navbar, aggiungila a `NAV_LINKS` in `src/app/layout/AppLayout.jsx`.

Dentro la SPA usa sempre `<Link>` / `<NavLink>` di `react-router-dom` (non `<a>`), tranne per i link
verso il sito pubblico.

### Nota sul deploy

La SPA usa URL "puliti" (`/app/collezione`), ma il file fisico è `app.html`. In dev e in preview
questo è gestito da un piccolo plugin in `vite.config.js`. **In produzione** il server deve avere
una regola equivalente: tutte le richieste a `/app/*` devono restituire `app.html`
(es. Netlify `_redirects`: `/app/*  /app.html  200`). Il server deve inoltre servire `404.html`
per le pagine inesistenti.

## Backend e variabili d'ambiente

Tutte le chiamate al backend passano da `src/services/api.js`:

```js
import { api, ApiError } from '../services/api.js';

const carte = await api.get('/cards');
await api.post('/decks', { name: 'Il mio mazzo', cards: [1, 2, 3] });
```

L'URL base si imposta con `VITE_API_URL` nel file `.env` (mai committato). Solo le variabili con
prefisso `VITE_` sono visibili nel codice frontend, quindi **non mettere segreti nel `.env` del frontend**.
Se aggiungi una nuova variabile, documentala in `.env.example`.

## Convenzioni di stile

- **CSS mobile-first**: scrivi gli stili per lo schermo piccolo e usa `@media (min-width: …)` per quelli più grandi.
- Usa le custom properties di `src/styles/variables.css` invece di valori fissi (colori, spaziature, font).
- Gli stili di un componente stanno in un file `.css` accanto al componente (es. `Card.jsx` + `Card.css`).
- Componenti React in **PascalCase** (`CardGrid.jsx`), un componente per file, estensione `.jsx`.
- Prima di aprire una pull request esegui `npm run lint` e `npm run format`.

## Git: branch e commit

Non si lavora direttamente su `main`: ogni modifica passa da un branch e da una pull request.

### Nomi dei branch

| Prefisso    | Uso                                                          | Esempio                  |
| ----------- | ------------------------------------------------------------ | ------------------------ |
| `feature/`  | nuova funzionalità o pagina                                  | `feature/pagina-negozio` |
| `fix/`      | correzione di un bug                                         | `fix/navbar-mobile`      |
| `style/`    | modifiche solo grafiche / CSS                                | `style/colori-rarita`    |
| `docs/`     | documentazione                                               | `docs/readme-deploy`     |
| `refactor/` | riorganizzazione del codice senza cambiarne il comportamento | `refactor/api-client`    |
| `chore/`    | configurazione, dipendenze, tooling                          | `chore/aggiorna-vite`    |

Nomi in minuscolo, parole separate da trattini.

### Messaggi di commit

Formato [Conventional Commits](https://www.conventionalcommits.org/it/): `tipo: descrizione breve`
(all'imperativo, in minuscolo, senza punto finale).

| Tipo        | Quando usarlo                                    |
| ----------- | ------------------------------------------------ |
| `feat:`     | nuova funzionalità                               |
| `fix:`      | correzione di un bug                             |
| `style:`    | CSS, aspetto grafico, formattazione              |
| `docs:`     | documentazione                                   |
| `refactor:` | modifica del codice senza cambiare comportamento |
| `chore:`    | configurazione, dipendenze, script               |

Esempi:

```
feat: aggiungi filtro per fazione nel catalogo
fix: correggi overflow della navbar su mobile
style: aggiorna i colori delle carte leggendarie
docs: spiega come aggiungere una rotta
```
