/** Pannello segnaposto per le pagine non ancora progettate: si riconosce subito dal bordo tratteggiato e dal badge. */
import { useId } from 'react';
import './Placeholder.css';

export default function Placeholder({ eyebrow, title, description, children }) {
  const titleId = useId();

  return (
    <section className="placeholder" aria-labelledby={titleId}>
      <span className="placeholder__badge">In arrivo</span>
      <header className="placeholder__header">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={titleId} className="placeholder__title">
          {title}
        </h2>
      </header>
      <p className="placeholder__description">{description}</p>
      {children && <div className="placeholder__content">{children}</div>}
    </section>
  );
}
