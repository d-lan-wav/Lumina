import { Routes, Route } from 'react-router-dom';
import Intro from './components/Intro';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Privacy from './pages/Privacy';
import Categories from './pages/Categories';
import GenreDetail from './pages/GenreDetail';
import Search from './pages/Search';
import CookieBanner from './components/CookieBanner';
import Favorites from './pages/Favorites';
import Series from './pages/Series';
import SerieDetail from './pages/SerieDetail';

function App() {
  return (
    <>
      <Intro />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/privacidad" element={<Privacy />} />
        <Route path="/categorias" element={<Categories />} />
        <Route path="/categoria/:id" element={<GenreDetail />} />
        <Route path="/buscar" element={<Search />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/series" element={<Series />} />
        <Route path="/serie/:id" element={<SerieDetail />} />
        <Route path="/series/categorias" element={<Categories type="tv" />} />
        <Route path="/series/categoria/:id" element={<GenreDetail type="tv" />} />
        <Route path="/series/favoritos" element={<Favorites type="tv" />} />
      </Routes>
      <Footer />
      <CookieBanner />
    </>
  );
}

export default App;