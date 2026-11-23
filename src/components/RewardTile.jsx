import Icon from './Icon.jsx';
import './RewardTile.css';

/**
 * Tipo di ricompensa con immagine, titolo e descrizione (Figma: RewardTile).
 * Senza `image` mostra il segnaposto tratteggiato.
 */
export default function RewardTile({ title, description, image }) {
  return (
    <div className="reward-tile">
      {image ? (
        <img className="reward-tile__image" src={image} alt="" />
      ) : (
        <div className="reward-tile__image reward-tile__image--placeholder">
          <Icon name="image" size={24} />
        </div>
      )}
      <h3 className="reward-tile__title">{title}</h3>
      <p className="reward-tile__description">{description}</p>
    </div>
  );
}
