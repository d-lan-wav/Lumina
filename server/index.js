require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.get('/api/movies/popular', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en-US' : 'es-ES';
  // Página entre 1 y 500: TMDB no entrega más allá de la 500
  const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), 500);
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, language: lang, page }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al obtener películas' });
  }
});
app.get('/api/movies/now-playing', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en-US' : 'es-ES';
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
      params: { api_key: TMDB_API_KEY, language: lang, region: req.query.region }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al obtener películas en cartelera' });
  }
});

app.get('/api/movies/search/:query', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en-US' : 'es-ES';
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: { api_key: TMDB_API_KEY, language: lang, query: req.params.query }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al buscar películas' });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en-US' : 'es-ES';
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${req.params.id}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: lang,
        append_to_response: 'credits,videos',
        include_video_language: lang === 'en-US' ? 'en' : 'es,en'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Película no encontrada' });
  }
});

app.get('/api/genres', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en-US' : 'es-ES';
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
      params: { api_key: TMDB_API_KEY, language: lang }
    });
    res.json(response.data.genres);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al obtener géneros' });
  }
});

app.get('/api/genres/:id/movies', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en-US' : 'es-ES';
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        language: lang,
        with_genres: req.params.id,
        sort_by: 'popularity.desc',
        page: req.query.page || 1
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al obtener películas del género' });
  }
});
app.get('/api/people/search/:query', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en-US' : 'es-ES';
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/person`, {
      params: { api_key: TMDB_API_KEY, language: lang, query: req.params.query }
    });
    // Solo actores y directores, máximo 4
    const people = response.data.results
      .filter(person => ['Acting', 'Directing'].includes(person.known_for_department))
      .slice(0, 4)
      .map(person => ({
        id: person.id,
        name: person.name,
        known_for_department: person.known_for_department,
        profile_path: person.profile_path
      }));
    res.json(people);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al buscar personas' });
  }
});

app.get('/api/people/:id/movies', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en-US' : 'es-ES';
  const { id } = req.params;
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Id no válido' });
  }
  try {
    const [personResponse, creditsResponse] = await Promise.all([
      axios.get(`${TMDB_BASE_URL}/person/${id}`, {
        params: { api_key: TMDB_API_KEY, language: lang }
      }),
      axios.get(`${TMDB_BASE_URL}/person/${id}/movie_credits`, {
        params: { api_key: TMDB_API_KEY, language: lang }
      })
    ]);

    // Un Map por id evita repetidas (ej: actor y director de la misma película)
    const byId = new Map();
    for (const movie of creditsResponse.data.cast) byId.set(movie.id, movie);
    for (const movie of creditsResponse.data.crew) {
      if (movie.job === 'Director') byId.set(movie.id, movie);
    }

    const results = [...byId.values()]
      .filter(movie => movie.poster_path)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 40);

    res.json({
      person: { id: personResponse.data.id, name: personResponse.data.name },
      results
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al obtener las películas de la persona' });
  }
});

app.get('/api/tv/popular', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en-US' : 'es-ES';
  const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), 500);
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
      params: { api_key: TMDB_API_KEY, language: lang, page }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al obtener series' });
  }
});

app.get('/api/tv/:id', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en-US' : 'es-ES';
  const { id } = req.params;
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Id no válido' });
  }
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: lang,
        append_to_response: 'credits,videos',
        include_video_language: lang === 'en-US' ? 'en' : 'es,en'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Serie no encontrada' });
  }
});

app.get('/api/genres/tv', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en-US' : 'es-ES';
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/genre/tv/list`, {
      params: { api_key: TMDB_API_KEY, language: lang }
    });
    res.json(response.data.genres);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al obtener géneros de series' });
  }
});

app.get('/api/genres/:id/tv', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en-US' : 'es-ES';
  const { id } = req.params;
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Id no válido' });
  }
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/discover/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        language: lang,
        with_genres: id,
        sort_by: 'popularity.desc',
        page: req.query.page || 1
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al obtener series del género' });
  }
});

app.get('/api/tv/search/:query', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en-US' : 'es-ES';
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
      params: { api_key: TMDB_API_KEY, language: lang, query: req.params.query }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al buscar series' });
  }
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'No encontrado' });
  }
  res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));