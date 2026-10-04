import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p>Lumina es un proyecto personal sin fines comerciales.</p>
        <p>Información e imágenes de películas: The Movie Database (TMDB). Este producto usa la API de TMDB pero no está respaldado ni certificado por TMDB.</p>
      </div>
      <Link to="/privacidad">Privacidad</Link>
    </footer>
  );
}

export default Footer;