import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import HeartButton from '../components/HeartButton';

const STATUS = {
  'Returning Series': 'En emisión',
  'In Production': 'En producción',
  Ended: 'Finalizada',
  Canceled: 'Cancelada',
  Planned: 'Planeada',
  Pilot: 'Piloto'
};

function SerieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setShow(null);
    setPlaying(false);
    axios.get(`/api/tv/${id}`)
      .then(response => setShow(response.data))
      .catch(error => console.error(error));
  }, [id]);

  useEffect(() => {
    if (!playing) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setPlaying(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [playing]);

  if (!show) return <p className="detail-loading">Cargando…</p>;

  const goBack = () => (location.key === 'default' ? navigate('/series') : navigate(-1));

  const cast = (show.credits?.cast ?? []).slice(0, 4);

  const videos = show.videos?.results ?? [];
  const youtubeVideos = videos.filter(
    video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
  );
  const trailer =
    youtubeVideos.find(video => video.type === 'Trailer' && video.official) ||
    youtubeVideos.find(video => video.type === 'Trailer') ||
    youtubeVideos[0];

  const firstAir = show.first_air_date
    ? new Date(`${show.first_air_date}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const facts = [
    { label: 'Estreno', value: firstAir },
    { label: 'Creador', value: show.created_by?.map(person => person.name).join(', ') },
    { label: 'Género', value: show.genres?.map(genre => genre.name).join(', ') },
    { label: 'Temporadas', value: show.number_of_seasons ? String(show.number_of_seasons) : null },
    { label: 'Episodios', value: show.number_of_episodes ? String(show.number_of_episodes) : null },
    { label: 'Estado', value: STATUS[show.status] ?? show.status },
    { label: 'Valoración', value: show.vote_average ? `⭐ ${show.vote_average.toFixed(1)}` : null }
  ].filter(fact => fact.value);

  return (
    <div className="detail">
      <div
        className="detail-bg"
        style={show.backdrop_path ? { backgroundImage: `url(https://image.tmdb.org/t/p/w1280${show.backdrop_path})` } : undefined}
      />
      <div className="detail-shade" />
      <div className="detail-veil" />

      <div className="detail-main">
        <div className="detail-top">
          <button className="detail-back" onClick={goBack}>← Volver</button>
          <HeartButton movie={show} type="tv" />
        </div>
        <span className="detail-bar" />
        <h1 className="detail-title">{show.name}</h1>
        {show.tagline && <p className="detail-tagline">{show.tagline}</p>}
        <p className="detail-synopsis">{show.overview}</p>
      </div>

      <aside className="detail-facts">
        {facts.map(fact => (
          <div key={fact.label} className="fact">
            <span className="fact-label">{fact.label}</span>
            <span className="fact-value">{fact.value}</span>
          </div>
        ))}
      </aside>

      {cast.length > 0 && (
        <div className="detail-cast">
          <span className="fact-label">Reparto</span>
          <p>{cast.map(person => person.name).join(' · ')}</p>
        </div>
      )}

      {trailer && (
        <button className="detail-trailer" onClick={() => setPlaying(true)} aria-label="Ver tráiler">
          <img src={`https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`} alt="" />
          <span className="trailer-shade" />
          <span className="trailer-play">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
            </svg>
          </span>
          <span className="trailer-label">Ver tráiler</span>
        </button>
      )}

      {playing && trailer && (
        <div className="trailer-modal" onClick={() => setPlaying(false)}>
          <div className="trailer-frame" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0`}
              title={`Tráiler de ${show.name}`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
            <button className="trailer-close" onClick={() => setPlaying(false)} aria-label="Cerrar">×</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SerieDetail;