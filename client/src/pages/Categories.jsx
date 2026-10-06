import { useState, useEffect } from 'react';
import axios from 'axios';
import GenreRow from '../components/GenreRow';

function Categories({ type = 'movie' }) {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    setGenres([]);
    axios.get(type === 'tv' ? '/api/genres/tv' : '/api/genres')
      .then(response => setGenres(response.data))
      .catch(error => console.error(error));
  }, [type]);

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(34px, 8vw, 96px)', fontWeight: 500, letterSpacing: '-0.02em', padding: '48px 48px 24px', lineHeight: 1 }}>
        Categorías.
      </h1>
      {genres.map(genre => (
        <GenreRow key={`${type}-${genre.id}`} genre={genre} type={type} />
      ))}
    </div>
  );
}

export default Categories;