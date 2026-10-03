require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.get('/api/movies/popular', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en-US' : 'es-ES';
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, language: lang }
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

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));