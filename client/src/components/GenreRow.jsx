import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useDragScroll from '../hooks/useDragScroll';

function GenreRow({ genre, type = 'movie' }) {
  const isTv = type === 'tv';
  const [items, setItems] = useState([]);
  const trackRef = useRef(null);
  const dragHandlers = useDragScroll(trackRef);

  useEffect(() => {
    setItems([]);
    axios.get(`/api/genres/${genre.id}/${isTv ? 'tv' : 'movies'}`)
      .then(response => setItems(response.data.results.filter(item => item.poster_path)))
      .catch(error => console.error(error));
  }, [genre.id, isTv]);

  return (
    <section className="genre-row">
      <div ref={trackRef} className="row-track" {...dragHandlers}>
        {items.map(item => (
          <Link
            key={item.id}
            to={`${isTv ? '/serie' : '/movie'}/${item.id}`}
            className="poster row-poster"
            draggable="false"
          >
            <img
              src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
              alt={item.title ?? item.name}
              loading="lazy"
              draggable="false"
            />
            <div className="poster-info">
              <span className="poster-bar" />
              <h3>{item.title ?? item.name}</h3>
              <p className="poster-meta">
                {(item.release_date ?? item.first_air_date)?.slice(0, 4)} · ⭐ {item.vote_average?.toFixed(1)}
              </p>
            </div>
          </Link>
        ))}
        <div style={{ flexShrink: 0, width: '28px' }} />
      </div>

      <div className="row-side">
        <h2>{genre.name}</h2>
        <Link to={isTv ? `/series/categoria/${genre.id}` : `/categoria/${genre.id}`} className="row-more">
          Ver todo →
        </Link>
      </div>
    </section>
  );
}

export default GenreRow;