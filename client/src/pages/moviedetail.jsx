import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/movies/${id}`)
      .then(response => setMovie(response.data))
      .catch(error => console.error(error));
  }, [id]);

  if (!movie) return <p style={{ padding: '24px' }}>Cargando...</p>;

  return (
    <div style={{ padding: '24px', maxWidth: '700px' }}>
      <Link to="/" style={{ color: 'var(--accent)' }}>&larr; Volver</Link>
      <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
        <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} alt={movie.title} style={{ width: '250px', borderRadius: '6px' }} />
        <div>
          <h2 style={{ marginBottom: '8px' }}>{movie.title}</h2>
          <p style={{ fontSize: '13px', marginBottom: '12px' }}>
            {movie.release_date?.slice(0, 4)} · {movie.runtime} min · ⭐ {movie.vote_average?.toFixed(1)}
          </p>
          <p style={{ fontSize: '14px', lineHeight: '1.5' }}>{movie.overview}</p>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;