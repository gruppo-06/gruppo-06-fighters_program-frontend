import './Tag.css';

/**
 * Etichetta piccola colorata (Figma: Tag).
 * @param {'neutral'|'comune'|'rara'|'epica'|'leggendaria'} [tone='neutral']
 */
export default function Tag({ tone = 'neutral', className = '', children }) {
  return <span className={`tag tag--${tone} ${className}`.trim()}>{children}</span>;
}
