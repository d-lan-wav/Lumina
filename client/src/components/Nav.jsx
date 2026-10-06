import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// --- Logo: anillo con rayos animados ---
const N = 30;   // cantidad de rayos
const K = 14;   // ondas que caben en el círculo
const D = 1.6;  // segundos por ciclo de cada rayo (más alto = más lento)

// Se calcula una sola vez, fuera del componente, para no repetirlo en cada render
const RAYS = Array.from({ length: N }, (_, i) => {
  const a = (i / N) * Math.PI * 2;
  return {
    x1: 50 + 27 * Math.cos(a),
    y1: 50 + 27 * Math.sin(a),
    x2: 50 + 50 * Math.cos(a),
    y2: 50 + 50 * Math.sin(a),
    delay: -((i * K) / N) * D, // desfase: crea la onda
  };
});

function RingLogo() {
  return (
    <svg className="ring-logo" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="4.5" />
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        {RAYS.map((r, i) => (
          <line
            key={i}
            x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
            style={{ animationDelay: `${r.delay}s`, animationDuration: `${D}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

// --- Iconos del botón de tema ---
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="1.8" x2="12" y2="4.4" />
        <line x1="12" y1="19.6" x2="12" y2="22.2" />
        <line x1="1.8" y1="12" x2="4.4" y2="12" />
        <line x1="19.6" y1="12" x2="22.2" y2="12" />
        <line x1="17.37" y1="6.63" x2="19.21" y2="4.79" />
        <line x1="6.63" y1="6.63" x2="4.79" y2="4.79" />
        <line x1="17.37" y1="17.37" x2="19.21" y2="19.21" />
        <line x1="6.63" y1="17.37" x2="4.79" y2="19.21" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
    </svg>
  );
}

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [query, setQuery] = useState('');
  const [genres, setGenres] = useState([]);
  const [tvGenres, setTvGenres] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // Modo series: rutas /series, /series/..., /serie/:id, o el buscador con ?tipo=tv
  const isSeries =
    location.pathname.startsWith('/serie') ||
    (location.pathname === '/buscar' && new URLSearchParams(location.search).get('tipo') === 'tv');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    axios.get('/api/genres')
      .then(response => setGenres(response.data))
      .catch(error => console.error(error));
    axios.get('/api/genres/tv')
      .then(response => setTvGenres(response.data))
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setMenuOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.add('theme-fade');
    setTheme(theme === 'dark' ? 'light' : 'dark');
    window.setTimeout(() => root.classList.remove('theme-fade'), 350);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/buscar?q=${encodeURIComponent(q)}${isSeries ? '&tipo=tv' : ''}`);
    } else {
      navigate(isSeries ? '/series' : '/');
    }
    closeMenu();
  };

  const genreList = isSeries ? tvGenres : genres;

  return (
    <header ref={headerRef} className="site-header">
      <nav className="site-nav">
        <div className="nav-left">
          <Link to="/" aria-label="Ir al inicio" className="logo-link" onClick={closeMenu}>
            <RingLogo />
          </Link>
          <button
            className={`menu-toggle ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
          >
            Categoría <span className="plus">+</span>
          </button>
          <Link
            to={isSeries ? '/series/favoritos' : '/favoritos'}
            className="menu-toggle"
            onClick={closeMenu}
          >
            Favoritos
          </Link>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            className="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="búsqueda"
          />
        </form>

        <div className="nav-right">
          <div className="mode-toggle" role="group" aria-label="Tipo de contenido">
            <Link to="/" className={`mode-link ${!isSeries ? 'active' : ''}`} onClick={closeMenu}>
              Películas
            </Link>
            <Link to="/series" className={`mode-link ${isSeries ? 'active' : ''}`} onClick={closeMenu}>
              Series
            </Link>
          </div>
          <button className="theme-btn" onClick={toggleTheme} aria-label="Cambiar entre modo claro y oscuro">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </nav>

      <div className={`menu-panel ${menuOpen ? 'open' : ''}`}>
        <div className="menu-grid">
          <Link
            to={isSeries ? '/series/categorias' : '/categorias'}
            className="menu-link all"
            onClick={closeMenu}
          >
            Ver todas →
          </Link>
          {genreList.map(genre => (
            <Link
              key={genre.id}
              to={isSeries ? `/series/categoria/${genre.id}` : `/categoria/${genre.id}`}
              className="menu-link"
              onClick={closeMenu}
            >
              {genre.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Nav;