import './Avatar.css';

/**
 * Immagine profilo circolare (Figma: Avatar).
 * Senza `src` mostra un cerchio vuoto come segnaposto.
 */
export default function Avatar({ src, alt = '', size = 40, className = '' }) {
  return (
    <span className={`avatar ${className}`.trim()} style={{ '--avatar-size': `${size}px` }}>
      {src && <img src={src} alt={alt} width={size} height={size} />}
    </span>
  );
}
