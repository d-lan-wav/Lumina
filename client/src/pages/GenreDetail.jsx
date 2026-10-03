import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import useReveal from '../hooks/useReveal';

function GenreGrid({ id }) {
  const [genreName, setGenreName] = useState('');
  const [pages, setPages] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    axios.get('http://localhost:3000/api/genres')
      .then(response => {
        const genre = response.data.find(g => String(g.id) === id);
        setGenreName(genre ? genre.name : '');
      })
      .catch(error => console.error(error));
  }, [id]);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/genres/${id}/movies?page=${page}`)
      .then(response => {
        const withPoster = response.data.results.filter(movie => movie.poster_path);
        setPages(previous => ({ ...previous, [page]: withPoster }));
        setTotalPages(response.data.total_pages);
      })
      .catch(error => console.error(error));
  }, [id, page]);

  const movies = Object.values(pages).flat();
  useReveal(pages);

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(34px, 8vw, 96px)', fontWeight: 500, letterSpacing: '-0.02em', padding: '48px 48px 24px', lineHeight: 1 }}>
        {genreName ? `${genreName}.` : ''}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', padding: '24px 48px' }}>
        {movies.map(movie => (
          <Link key={movie.id} to={`/movie/${movie.id}`} className="movie-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} alt={movie.title} style={{ width: '100%' }} />
            <div className="movie-overlay">
              <p style={{ fontWeight: 500, marginBottom: '4px' }}>{movie.title}</p>
              <p style={{ fontSize: '12px', marginBottom: '4px' }}>{movie.release_date?.slice(0, 4)} · ⭐ {movie.vote_average?.toFixed(1)}</p>
              <p style={{ fontSize: '12px' }}>{movie.overview?.slice(0, 100)}...</p>
            </div>
          </Link>
        ))}
      </div>

      {page < totalPages && (
        <div style={{ textAlign: 'center', padding: '0 48px 64px' }}>
          <button className="load-more" onClick={() => setPage(page + 1)}>Cargar más</button>
        </div>
      )}
    </div>
  );
}

function GenreDetail() {
  const { id } = useParams();
  return <GenreGrid key={id} id={id} />;
}

export default GenreDetail;