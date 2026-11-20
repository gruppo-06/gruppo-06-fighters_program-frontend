import './Avatar.css';

/**
 * Immagine profilo circolare (Figma: Avatar).
 * Senza `src` mostra un cerchio vuoto come segnaposto.
 */
export default function Avatar({ src, alt = '', size = 40 }) {
  return (
    <span className="avatar" style={{ '--avatar-size': `${size}px` }}>
      {src && <img src={src} alt={alt} width={size} height={size} />}
    </span>
  );
}
