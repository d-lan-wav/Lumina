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
      </Routes>
      <Footer />
      <CookieBanner />
    </>
  );
}

export default App;