import Icon from './Icon.jsx';
import './Price.css';

// 'always': in italiano i numeri di 4 cifre resterebbero senza punto (1030 invece di 1.030)
const formatter = new Intl.NumberFormat('it-IT', { useGrouping: 'always' });

const ICON_SIZES = { sm: 14, md: 20, lg: 28, xl: 30 };

/**
 * Prezzo / importo in crediti (Figma: Prezzo): icona crediti + numero in Teko.
 *
 * @param {number|null} amount  importo; se null mostra un trattino
 * @param {'sm'|'md'|'lg'|'xl'} [size='md']  sm = 16px (testo), md = 38px (card, saldo),
 *   lg = 60px (banner), xl = 72px (modale)
 */
export default function Price({ amount, size = 'md', className = '' }) {
  return (
    <p className={`price price--${size} ${className}`.trim()}>
      <Icon name="credits" size={ICON_SIZES[size]} className="price__icon" />
      <span className="price__value">{amount == null ? '–' : formatter.format(amount)}</span>
      <span className="visually-hidden"> crediti</span>
    </p>
  );
}
