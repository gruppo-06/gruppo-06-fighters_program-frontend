import Icon from './Icon.jsx';
import './CreditsPill.css';

const formatter = new Intl.NumberFormat('it-IT');

/** Saldo crediti del giocatore (Figma: CreditsPill). */
export default function CreditsPill({ amount }) {
  return (
    <p className="credits-pill">
      <Icon name="credits" size={16} className="credits-pill__icon" />
      <span>{formatter.format(amount)}</span>
      <span className="visually-hidden"> crediti</span>
    </p>
  );
}
