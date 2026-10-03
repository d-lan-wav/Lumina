import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import useDragScroll from '../hooks/useDragScroll';

function Home() {
  const [movies, setMovies] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  const trackRef = useRef(null);
  const heroRef = useRef(null);
  const dragHandlers = useDragScroll(trackRef);

  useEffect(() => {
    axios.get('http://localhost:3000/api/movies/popular')
      .then(response => setMovies(response.data.results))
      .catch(error => console.error(error));
  }, []);

    useEffect(() => {
    axios.get('http://localhost:3000/api/movies/now-playing')
      .then(response => setNowPlaying(response.data.results))
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    if (!query) {
      setSearchResults(null);
      return;
    }
    axios.get(`http://localhost:3000/api/movies/search/${encodeURIComponent(query)}`)
      .then(response => setSearchResults(response.data.results))
      .catch(error => console.error(error));
  }, [query]);

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

  const displayedMovies = searchResults ?? movies;

  useEffect(() => {
    const cards = document.querySelectorAll('.movie-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });
    cards.forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, [displayedMovies]);

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
            </Link>
          ))}
          <div style={{ flexShrink: 0, width: '28px' }} />
        </div>
      </div>

      <h1 style={{ fontSize: 'clamp(34px, 10vw, 120px)', fontWeight: 500, letterSpacing: '-0.02em', padding: '24px 48px', margin: 0, lineHeight: 1 }}>LUMINA.</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', padding: '0 48px 48px' }}>
        {displayedMovies.map(movie => (
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
    </div>
  );
}

export default Home;