import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useDragScroll from '../hooks/useDragScroll';

function GenreRow({ genre }) {
  const [movies, setMovies] = useState([]);
  const trackRef = useRef(null);
  const dragHandlers = useDragScroll(trackRef);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/genres/${genre.id}/movies`)
      .then(response => setMovies(response.data.results.filter(movie => movie.poster_path)))
      .catch(error => console.error(error));
  }, [genre.id]);

  return (
    <section className="genre-row">
      <div ref={trackRef} className="row-track" {...dragHandlers}>
        {movies.map(movie => (
          <Link key={movie.id} to={`/movie/${movie.id}`} className="poster row-poster" draggable="false">
            <img
              src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
              alt={movie.title}
              loading="lazy"
              draggable="false"
            />
            <div className="poster-info">
              <span className="poster-bar" />
              <h3>{movie.title}</h3>
              <p className="poster-meta">{movie.release_date?.slice(0, 4)} · ⭐ {movie.vote_average?.toFixed(1)}</p>
            </div>
          </Link>
        ))}
        <div style={{ flexShrink: 0, width: '28px' }} />
      </div>

      <div className="row-side">
        <h2>{genre.name}</h2>
        <Link to={`/categoria/${genre.id}`} className="row-more">Ver todo →</Link>
      </div>
    </section>
  );
}

export default GenreRow;