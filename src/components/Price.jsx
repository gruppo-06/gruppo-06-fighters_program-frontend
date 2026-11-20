import Icon from './Icon.jsx';
import './Price.css';

const formatter = new Intl.NumberFormat('it-IT');

const ICON_SIZES = { md: 20, lg: 28 };

/**
 * Prezzo / importo in crediti (Figma: Prezzo): icona crediti + numero in Teko.
 *
 * @param {number|null} amount  importo; se null mostra un trattino
 * @param {'md'|'lg'} [size='md']  md = 38px (card, saldo), lg = 60px (banner)
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
