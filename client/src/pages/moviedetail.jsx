import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    setMovie(null);
    axios.get(`http://localhost:3000/api/movies/${id}`)
      .then(response => setMovie(response.data))
      .catch(error => console.error(error));
  }, [id]);

  if (!movie) return <p className="detail-loading">Cargando…</p>;

  const goBack = () => (location.key === 'default' ? navigate('/') : navigate(-1));

  const crew = movie.credits?.crew ?? [];
  const director = crew.find(person => person.job === 'Director');
  const composer = crew.find(person => person.job === 'Original Music Composer');
  const cast = (movie.credits?.cast ?? []).slice(0, 4);

  const releaseDate = movie.release_date
    ? new Date(`${movie.release_date}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const facts = [
    { label: 'Estreno', value: releaseDate },
    { label: 'Director', value: director?.name },
    { label: 'Música', value: composer?.name },
    { label: 'Género', value: movie.genres?.map(genre => genre.name).join(', ') },
    { label: 'Duración', value: movie.runtime ? `${movie.runtime} min` : null },
    { label: 'Valoración', value: movie.vote_average ? `⭐ ${movie.vote_average.toFixed(1)}` : null }
  ].filter(fact => fact.value);

  return (
    <div className="detail">
      <div
        className="detail-bg"
        style={movie.backdrop_path ? { backgroundImage: `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})` } : undefined}
      />
      <div className="detail-shade" />
            <div className="detail-shade" />
      <div className="detail-veil" />

      <div className="detail-main">
        <button className="detail-back" onClick={goBack}>← Volver</button>
        <span className="detail-bar" />
        <h1 className="detail-title">{movie.title}</h1>
        {movie.tagline && <p className="detail-tagline">{movie.tagline}</p>}
        <p className="detail-synopsis">{movie.overview}</p>
      </div>

      <aside className="detail-facts">
        {facts.map(fact => (
          <div key={fact.label} className="fact">
            <span className="fact-label">{fact.label}</span>
            <span className="fact-value">{fact.value}</span>
          </div>
        ))}
      </aside>

      {cast.length > 0 && (
        <div className="detail-cast">
          <span className="fact-label">Reparto</span>
          <p>{cast.map(person => person.name).join(' · ')}</p>
        </div>
      )}
    </div>
  );
}

export default MovieDetail;