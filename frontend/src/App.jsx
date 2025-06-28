import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './App.css'
import UserStatus from './components/UserStatus';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import UploadMusic from './components/UploadMusic';
import Explore from './components/Explore';
import Library from './components/Library';
import PrivateRoute from './components/PrivateRoute';
import ArtistRoute from './components/ArtistRoute';
import ArtistDashboard from './components/ArtistDashboard';
import AdminDashboard from './components/AdminDashboard';
import logo from './assets/react.jpeg';
import background from './assets/background.jpeg';

function App() {
  const [count, setCount] = useState(0)
  const user = useSelector(state => state.user.user);
  const [navOpen, setNavOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('hasVisited')) {
      setShowWelcome(true);
      localStorage.setItem('hasVisited', 'true');
      setTimeout(() => setShowWelcome(false), 3500);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setNavOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <div
        className="fixed inset-0 min-h-screen w-screen text-white font-sans flex flex-col overflow-hidden"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#101010',
        }}
      >
        {/* Barre de navigation sticky, bord à bord */}
        <nav className="flex items-center justify-between w-full px-8 py-5 border-b border-white/10 bg-[#18181b]/80 backdrop-blur sticky top-0 z-50 shadow-lg">
          <div className="flex items-center">
            <span className="text-3xl font-extrabold tracking-widest text-accent drop-shadow">RAP2RUE</span>
          </div>
          {/* Burger menu mobile */}
          <button className="md:hidden flex items-center px-2 py-1" onClick={() => setNavOpen(!navOpen)} aria-label="Ouvrir le menu">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Liens de navigation mobile (sidebar vert) */}
          <div
            className={`
              fixed md:hidden top-0 right-0 h-full w-2/3 max-w-xs
              bg-[#101010] shadow-2xl flex flex-col items-center space-y-8 pt-24 transition-transform duration-300 z-40
              ${navOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : ''}
              ${!navOpen ? 'translate-x-full opacity-0 pointer-events-none' : ''}
            `.replace(/\s+/g, ' ')}
          >
            <Link to="/" className="nav-link w-full text-center" onClick={() => setNavOpen(false)}>Accueil</Link>
            <Link to="/explore" className="nav-link w-full text-center" onClick={() => setNavOpen(false)}>Explorer</Link>
            {!user && (
              <>
                <Link to="/login" className="nav-link w-full text-center" onClick={() => setNavOpen(false)}>Connexion</Link>
                <Link to="/register" className="nav-link w-full text-center" onClick={() => setNavOpen(false)}>Inscription</Link>
              </>
            )}
            {user && (
              <>
                <Link to="/profile" className="nav-link w-full text-center" onClick={() => setNavOpen(false)}>Profil</Link>
                <Link to="/library" className="nav-link w-full text-center" onClick={() => setNavOpen(false)}>Ma bibliothèque</Link>
                {user.role === 'artist' && (
                  <>
                    <Link to="/upload" className="nav-link w-full text-center" onClick={() => setNavOpen(false)}>Uploader</Link>
                    <Link to="/dashboard" className="nav-link w-full text-center" onClick={() => setNavOpen(false)}>Dashboard</Link>
                  </>
                )}
              </>
            )}
            <div className="w-full flex justify-center"><UserStatus /></div>
          </div>

          {/* Liens de navigation desktop (navbar horizontale) */}
          <div className="hidden md:flex flex-row items-center space-x-6">
            <Link to="/" className="nav-link text-center">Accueil</Link>
            <Link to="/explore" className="nav-link text-center">Explorer</Link>
            {!user && (
              <>
                <Link to="/login" className="nav-link text-center">Connexion</Link>
                <Link to="/register" className="nav-link text-center">Inscription</Link>
              </>
            )}
            {user && (
              <>
                <Link to="/profile" className="nav-link text-center">Profil</Link>
                <Link to="/library" className="nav-link text-center">Ma bibliothèque</Link>
                {user.role === 'artist' && (
                  <>
                    <Link to="/upload" className="nav-link text-center">Uploader</Link>
                    <Link to="/dashboard" className="nav-link text-center">Dashboard</Link>
                  </>
                )}
              </>
            )}
            <div className="flex justify-center"><UserStatus /></div>
          </div>
          {/* Overlay mobile */}
          {navOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setNavOpen(false)}></div>}
        </nav>
        {/* Notification popup pour nouveaux visiteurs */}
        {showWelcome && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-accent text-[#18181b] px-6 py-3 rounded-xl shadow-lg z-[100] font-bold text-lg animate-fade-in">
            Bienvenue sur RAP2RUE&nbsp;! Découvre, écoute et soutiens le rap.
          </div>
        )}
        {/* Routes principales, occupe tout l'espace restant */}
        <div className="flex-1 w-full h-full overflow-y-auto">
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/library" element={
              <PrivateRoute>
                <Library />
              </PrivateRoute>
            } />
            <Route path="/upload" element={
              <ArtistRoute>
                <UploadMusic />
              </ArtistRoute>
            } />
            {user && user.role === 'artist' && (
              <Route path="/dashboard" element={
                <ArtistRoute>
                  <ArtistDashboard />
                </ArtistRoute>
              } />
            )}
            {user && user.role === 'admin' && (
              <Route path="/admin" element={<AdminDashboard />} />
            )}
          </Routes>
        </div>
      </div>
    </Router>
  )
}

// Composant d'accueil modernisé
function Accueil() {
  return (
    <div className="flex flex-col justify-center items-center w-full h-[calc(100vh-80px)] min-h-[400px] bg-[#101010] p-0 m-0">
      <div className="flex flex-col items-center flex-1 w-full">
        <img src={logo} alt="Logo RAP2RUE" className="h-52 w-52 mt-16 mb-20 rounded-full object-cover drop-shadow-2xl border-4 border-[#1DB954]" />
      </div>
      <p className="text-2xl text-gray-300 mb-8 text-center w-full max-w-3xl">La plateforme dédiée à la culture rap : découvre, achète, streams et partage la musique urbaine, soutiens tes artistes préférés et vis une expérience unique, moderne et sécurisée.</p>
      <div className="flex flex-row gap-6 mt-4 w-full justify-center items-center">
        <Link to="/explore" className="px-6 py-3 rounded-full bg-accent text-[#18181b] font-bold text-lg shadow hover:scale-105 hover:bg-white transition text-center uppercase tracking-wider">Explorer</Link>
        <Link to="/register" className="px-6 py-3 rounded-full border border-accent text-accent font-bold text-lg shadow hover:bg-accent hover:text-[#18181b] transition text-center uppercase tracking-wider">Rejoindre</Link>
      </div>
    </div>
  );
}

// Appliquer le même style full-screen à toutes les pages principales
const withFullScreen = (Component) => (props) => (
  <div className="flex flex-col justify-center items-center w-full h-[calc(100vh-80px)] min-h-[400px] bg-[#101010] p-0 m-0">
    <Component {...props} />
  </div>
);

export default App
