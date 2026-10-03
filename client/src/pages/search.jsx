import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import useReveal from '../hooks/useReveal';

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setResults(null);
    if (!query) return;
    axios.get(`http://localhost:3000/api/movies/search/${encodeURIComponent(query)}`)
      .then(response => {
        if (!cancelled) setResults(response.data.results.filter(movie => movie.poster_path));
      })
      .catch(error => console.error(error));
    return () => {
      cancelled = true;
    };
  }, [query]);

  useReveal(results, '.result-strip');

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(34px, 8vw, 96px)', fontWeight: 500, letterSpacing: '-0.02em', padding: '48px 48px 12px', lineHeight: 1 }}>
        Resultados.
      </h1>
      <p style={{ padding: '0 48px 32px', fontSize: '14px', color: 'var(--muted)' }}>
        {!query && 'Escribe algo en el buscador.'}
        {query && results === null && 'Buscando…'}
        {query && results && results.length === 0 && `No encontramos resultados para “${query}”.`}
        {query && results && results.length > 0 && `${results.length} películas para “${query}”`}
      </p>

      {results && results.map(movie => (
        <Link key={movie.id} to={`/movie/${movie.id}`} className="result-strip">
          <div
            className="result-bg"
            style={movie.backdrop_path ? { backgroundImage: `url(https://image.tmdb.org/t/p/w780${movie.backdrop_path})` } : undefined}
          />
          <div className="result-shade" />
          <img
            className="result-poster"
            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
            alt={movie.title}
          />
          <div className="result-info">
            <span className="result-bar" />
            <h2>{movie.title}</h2>
            <p className="result-meta">{movie.release_date?.slice(0, 4)} · ⭐ {movie.vote_average?.toFixed(1)}</p>
            <p className="result-synopsis">{movie.overview}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default Search;