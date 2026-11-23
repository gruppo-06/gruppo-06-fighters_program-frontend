import { ICONS } from './icons.js';
import './Icon.css';

/**
 * Icona SVG inserita inline nel DOM: eredita il colore da CSS
 * tramite `currentColor` (es. `color: var(--color-accent-link)`).
 *
 * @param {string} name   nome del file senza .svg (es. "search")
 * @param {number|string} [size=24]  lato in px (o qualsiasi unità CSS)
 * @param {string} [label] testo per screen reader; se assente l'icona è decorativa
 */
export default function Icon({ name, size = 24, label, className = '', ...rest }) {
  const icon = ICONS[name];
  if (!icon) {
    if (import.meta.env.DEV) console.warn(`<Icon>: icona "${name}" non trovata in src/icons/`);
    return null;
  }

  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };

  return (
    <svg
      className={`svg-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      {...a11y}
      {...rest}
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
