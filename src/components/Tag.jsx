import './Tag.css';

/**
 * Etichetta piccola colorata (Figma: Tag).
 * @param {'neutral'|'outline'|'elemento'|'comune'|'rara'|'epica'|'leggendaria'|'alert'|'success'} [tone='neutral']
 */
export default function Tag({ tone = 'neutral', className = '', children }) {
  return <span className={`tag tag--${tone} ${className}`.trim()}>{children}</span>;
}
