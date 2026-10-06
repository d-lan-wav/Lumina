import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import useReveal from '../hooks/useReveal';
import HeartButton from '../components/HeartButton';

const DEPARTMENTS = { Acting: 'Actuación', Directing: 'Dirección' };

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const isTv = searchParams.get('tipo') === 'tv';
  const personId = isTv ? null : searchParams.get('persona');
  const noun = isTv ? 'series' : 'películas';
  const itemType = isTv ? 'tv' : 'movie';

  const [results, setResults] = useState(null);
  const [people, setPeople] = useState([]);
  const [personData, setPersonData] = useState(null);

  // Búsqueda por título (y por persona, solo en películas), al cambiar el texto
  useEffect(() => {
    let cancelled = false;
    setResults(null);
    setPeople([]);
    if (!query) return;

    axios.get(`/api/${isTv ? 'tv' : 'movies'}/search/${encodeURIComponent(query)}`)
      .then(response => {
        if (!cancelled) setResults(response.data.results.filter(item => item.poster_path));
      })
      .catch(error => console.error(error));

    if (!isTv) {
      axios.get(`/api/people/search/${encodeURIComponent(query)}`)
        .then(response => {
          if (!cancelled) setPeople(response.data);
        })
        .catch(error => console.error(error));
    }

    return () => {
      cancelled = true;
    };
  }, [query, isTv]);

  // Películas de una persona, cuando se elige una
  useEffect(() => {
    let cancelled = false;
    setPersonData(null);
    if (!personId) return;

    axios.get(`/api/people/${personId}/movies`)
      .then(response => {
        if (!cancelled) setPersonData(response.data);
      })
      .catch(error => console.error(error));

    return () => {
      cancelled = true;
    };
  }, [personId]);

  const showingPerson = Boolean(personId);
  const list = showingPerson ? (personData ? personData.results : null) : results;

  useReveal(list, '.result-strip');

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(34px, 8vw, 96px)', fontWeight: 500, letterSpacing: '-0.02em', padding: '48px 48px 12px', lineHeight: 1 }}>
        Resultados.
      </h1>

      {showingPerson && (
        <Link to={`/buscar?q=${encodeURIComponent(query)}`} className="search-back">
          ← Volver a resultados
        </Link>
      )}

      <p style={{ padding: '0 48px 32px', fontSize: '14px', color: 'var(--muted)' }}>
        {!showingPerson && !query && 'Escribe algo en el buscador.'}
        {!showingPerson && query && results === null && 'Buscando…'}
        {!showingPerson && query && results && results.length === 0 && `No encontramos resultados para “${query}”.`}
        {!showingPerson && query && results && results.length > 0 && `${results.length} ${noun} para “${query}”`}
        {showingPerson && personData === null && 'Buscando…'}
        {showingPerson && personData && personData.results.length === 0 && `No encontramos películas de ${personData.person.name}.`}
        {showingPerson && personData && personData.results.length > 0 && `${personData.results.length} películas de ${personData.person.name}`}
      </p>

      {!showingPerson && people.length > 0 && (
        <div className="people-row">
          {people.map(person => (
            <Link
              key={person.id}
              to={`/buscar?q=${encodeURIComponent(query)}&persona=${person.id}`}
              className="person-chip"
            >
              {person.profile_path ? (
                <img
                  className="person-photo"
                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                  alt=""
                />
              ) : (
                <div className="person-photo empty">{person.name.charAt(0)}</div>
              )}
              <span>
                <span className="person-name">{person.name}</span>
                <span className="person-role">{DEPARTMENTS[person.known_for_department]}</span>
              </span>
            </Link>
          ))}
        </div>
      )}

      {list && list.map(item => (
        <Link
          key={item.id}
          to={`${isTv ? '/serie' : '/movie'}/${item.id}`}
          className="result-strip"
        >
          <div
            className="result-bg"
            style={item.backdrop_path ? { backgroundImage: `url(https://image.tmdb.org/t/p/w780${item.backdrop_path})` } : undefined}
          />
          <div className="result-shade" />
          <img
            className="result-poster"
            src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
            alt={item.title ?? item.name}
          />
          <div className="result-info">
            <span className="result-bar" />
            <h2>{item.title ?? item.name}</h2>
            <p className="result-meta">
              {(item.release_date ?? item.first_air_date)?.slice(0, 4)} · ⭐ {item.vote_average?.toFixed(1)}
            </p>
            <p className="result-synopsis">{item.overview}</p>
          </div>
          <HeartButton movie={item} type={itemType} />
        </Link>
      ))}
    </div>
  );
}

export default Search;