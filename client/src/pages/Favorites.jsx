import { Link } from 'react-router-dom';
import useFavorites from '../hooks/useFavorites';
import HeartButton from '../components/HeartButton';

function Favorites({ type = 'movie' }) {
  const { favs } = useFavorites();
  const isTv = type === 'tv';
  const items = favs.filter(fav => fav.type === type);

  return (
    <main className="favorites-page">
      <h1 className="favorites-title">{isTv ? 'Series favoritas' : 'Favoritos'}</h1>
      {items.length === 0 ? (
        <p className="favorites-empty">
          {isTv
            ? 'Aún no tienes series favoritas. Toca el corazón en una serie.'
            : 'Aún no tienes favoritos. Toca el corazón en una película.'}
        </p>
      ) : (
        <div className="favorites-grid">
          {items.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              to={`${isTv ? '/serie' : '/movie'}/${item.id}`}
              className="favorite-card"
            >
              {item.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                  alt={item.title}
                  loading="lazy"
                />
              )}
              <HeartButton movie={item} type={type} />
              <span className="favorite-name">{item.title}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export default Favorites;