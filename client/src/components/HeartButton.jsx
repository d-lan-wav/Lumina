import { useIsFavorite, toggleFavorite } from '../hooks/useFavorites';

function HeartButton({ movie, type = 'movie' }) {
  const active = useIsFavorite(movie.id, type);

  const handleClick = (e) => {
    e.preventDefault();  // si el corazón está dentro de un <Link>, no navega
    e.stopPropagation();
    toggleFavorite(movie, type);
  };

  return (
    <button
      className={`heart-btn ${active ? 'active' : ''}`}
      onClick={handleClick}
      aria-label={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-pressed={active}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.8 4.5 6.5 4.5c2 0 3.6 1.1 4.5 2.6.9-1.5 2.5-2.6 4.5-2.6 3.7 0 5.6 3.9 4.1 7.3C19.5 16.4 12 21 12 21z"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default HeartButton;