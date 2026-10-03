import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Nav() {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [query, setQuery] = useState('');
  const [genres, setGenres] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/genres')
      .then(response => setGenres(response.data))
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

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/buscar?q=${encodeURIComponent(q)}` : '/');
    closeMenu();
  };

  return (
    <header ref={headerRef} className="site-header">
      <nav className="site-nav">
        <div className="nav-left">
          <Link to="/" aria-label="Ir al inicio" onClick={closeMenu}>
            <svg className="logo-mark" width="24" height="24" viewBox="0 0 48 48" fill="none">
              <defs>
                <linearGradient id="beam-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#9E1B32" />
                  <stop offset="1" stopColor="#9E1B32" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon className="beam" points="22,8 26,8 40,42 8,42" fill="url(#beam-gradient)" />
              <rect x="19" y="5" width="10" height="3" rx="1.5" fill="var(--text)" />
            </svg>
          </Link>
          <button
            className={`menu-toggle ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
          >
            Categoría <span className="plus">+</span>
          </button>
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

        <button className="theme-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </nav>

      <div className={`menu-panel ${menuOpen ? 'open' : ''}`}>
        <div className="menu-grid">
          <Link to="/categorias" className="menu-link all" onClick={closeMenu}>Ver todas →</Link>
          {genres.map(genre => (
            <Link key={genre.id} to={`/categoria/${genre.id}`} className="menu-link" onClick={closeMenu}>
              {genre.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Nav;