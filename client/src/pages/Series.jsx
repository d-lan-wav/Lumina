import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useReveal from '../hooks/useReveal';
import HeartButton from '../components/HeartButton';

const MIN_VOTES = 20;   // las series tienen menos votos que las películas
const MAX_PAGES = 500;  // límite de TMDB

function Series() {
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const sentinelRef = useRef(null);

  useEffect(() => {
    axios.get(`/api/tv/popular?page=${page}`)
      .then(response => {
        const { results, total_pages, page: returnedPage } = response.data;

        if (returnedPage !== page) {
          console.warn(`Pedí la página ${page} pero el servidor devolvió la ${returnedPage}`);
          setHasMore(false);
          return;
        }

        setShows(previous => {
          const seen = new Set(previous.map(show => show.id));
          const fresh = results.filter(
            show => show.poster_path && show.vote_count >= MIN_VOTES && !seen.has(show.id)
          );
          return [...previous, ...fresh];
        });
        setHasMore(page < Math.min(total_pages, MAX_PAGES));
      })
      .catch(error => {
        console.error(error);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !hasMore || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        setLoading(true);
        setPage(previous => previous + 1);
      }
    }, { rootMargin: '600px 0px' });

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, shows.length]);

  useReveal(shows);

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(34px, 8vw, 96px)', fontWeight: 500, letterSpacing: '-0.02em', padding: '48px 48px 24px', lineHeight: 1 }}>
        Series.
      </h1>

      <div style={{ padding: '24px 48px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
          {shows.map(show => (
            <Link key={show.id} to={`/serie/${show.id}`} className="movie-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img
                src={`https://image.tmdb.org/t/p/w300${show.poster_path}`}
                alt={show.name}
                loading="lazy"
                decoding="async"
                style={{ width: '100%' }}
              />
              <div className="movie-overlay">
                <p style={{ fontWeight: 500, marginBottom: '4px' }}>{show.name}</p>
                <p style={{ fontSize: '12px', marginBottom: '4px' }}>{show.first_air_date?.slice(0, 4)} · ⭐ {show.vote_average?.toFixed(1)}</p>
                <p style={{ fontSize: '12px' }}>{show.overview?.slice(0, 100)}...</p>
              </div>
              <HeartButton movie={show} type="tv" />
            </Link>
          ))}
        </div>

        <div ref={sentinelRef} style={{ height: '1px' }} />
        {loading && (
          <p style={{ textAlign: 'center', padding: '24px 0 0', fontSize: '13px', color: 'var(--muted)' }}>Cargando…</p>
        )}
      </div>
    </div>
  );
}

export default Series;