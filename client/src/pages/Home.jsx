import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useDragScroll from '../hooks/useDragScroll';
import useReveal from '../hooks/useReveal';
import HeartButton from '../components/HeartButton';

const MIN_VOTES = 50;   // descarta películas con muy pocos votos
const MAX_PAGES = 500;  // límite de TMDB

function Home() {
  const [movies, setMovies] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const trackRef = useRef(null);
  const heroRef = useRef(null);
  const sentinelRef = useRef(null);
  const dragHandlers = useDragScroll(trackRef);

    // Carga una página de populares cada vez que cambia "page"
    useEffect(() => {
      axios.get(`/api/movies/popular?page=${page}`)
        .then(response => {
          const { results, total_pages, page: returnedPage } = response.data;

          // Si el servidor devuelve otra página que la pedida (ruta vieja que ignora ?page=),
          // paramos aquí para no entrar en un bucle infinito
          if (returnedPage !== page) {
            console.warn(`Pedí la página ${page} pero el servidor devolvió la ${returnedPage}`);
            setHasMore(false);
            return;
          }

          setMovies(previous => {
            const seen = new Set(previous.map(movie => movie.id));
            const fresh = results.filter(
              movie => movie.poster_path && movie.vote_count >= MIN_VOTES && !seen.has(movie.id)
            );
           return [...previous, ...fresh];
          });
          setHasMore(page < Math.min(total_pages, MAX_PAGES));
        })
        .catch(error => {
          console.error(error);
          setHasMore(false); // si falla, no seguimos pidiendo en bucle
        })
        .finally(() => setLoading(false));
    }, [page]);

  useEffect(() => {
    axios.get('/api/movies/now-playing')
      .then(response => setNowPlaying(response.data.results))
      .catch(error => console.error(error));
  }, []);

  // Un solo observador vigila el div del final de la lista
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
  }, [hasMore, loading, movies.length]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (heroRef.current) {
          heroRef.current.style.transform = `translateY(${y * 0.3}px)`;
          heroRef.current.style.filter = `blur(${Math.min(y / 30, 10)}px)`;
          heroRef.current.style.opacity = Math.max(1 - y / 500, 0);
        }
        ticking = false;
      });
      ticking = true;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useReveal(movies);

  const featured = nowPlaying.filter(movie => movie.poster_path).slice(0, 10);

  return (
    <div>
      <div ref={heroRef} style={{ willChange: 'transform, filter, opacity' }}>
        <div ref={trackRef} className="chain" {...dragHandlers}>
          <div style={{ flexShrink: 0, width: '42%' }} />
          {featured.map(movie => (
            <Link key={movie.id} to={`/movie/${movie.id}`} className="poster" draggable="false">
              <div className="poster-glow" />
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                draggable="false"
              />
              <div className="poster-info">
                <span className="poster-bar" />
                <h3>{movie.title}</h3>
                <p className="poster-meta">{movie.release_date?.slice(0, 4)} · ⭐ {movie.vote_average?.toFixed(1)}</p>
                <p className="poster-synopsis">{movie.overview}</p>
              </div>
              <HeartButton movie={movie} />
            </Link>
          ))}
          <div style={{ flexShrink: 0, width: '28px' }} />
        </div>
      </div>

      <h1 style={{
        position: 'relative',
        top: '-1.5cm',
        fontSize: 'calc(clamp(34px, 10vw, 120px) + 1cm)',
        fontFamily: "'Bodoni Moda', serif",
        fontWeight: 500,
        letterSpacing: '0.01em',
        padding: '24px 48px',
        margin: 0,
        lineHeight: 1
      }}>LUMINA.</h1>

      <div style={{ padding: '48px', background: 'var(--surface)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
          {movies.map(movie => (
            <Link key={movie.id} to={`/movie/${movie.id}`} className="movie-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                loading="lazy"
                decoding="async"
                style={{ width: '100%' }}
              />
              <div className="movie-overlay">
                <p style={{ fontWeight: 500, marginBottom: '4px' }}>{movie.title}</p>
                <p style={{ fontSize: '12px', marginBottom: '4px' }}>{movie.release_date?.slice(0, 4)} · ⭐ {movie.vote_average?.toFixed(1)}</p>
                <p style={{ fontSize: '12px' }}>{movie.overview?.slice(0, 100)}...</p>
              </div>
              <HeartButton movie={movie} />
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

export default Home;