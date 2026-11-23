import Icon from './Icon.jsx';
import './SearchField.css';

/** Campo di ricerca (Figma: SearchField). */
export default function SearchField({ label, className = '', ...inputProps }) {
  return (
    <label className={`search-field ${className}`.trim()}>
      <Icon name="search" size={18} className="search-field__icon" />
      <span className="visually-hidden">{label}</span>
      <input type="search" className="search-field__input" {...inputProps} />
    </label>
  );
}
