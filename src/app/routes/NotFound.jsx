/** Rotta di fallback: qualsiasi percorso /app/* non ancora implementato. */
export default function NotFound() {
  return (
    <section className="container app-page">
      <h1>Pagina non trovata</h1>
      <p>
        Questa sezione non esiste ancora. <a href="/">Torna alla home</a>
      </p>
    </section>
  );
}
