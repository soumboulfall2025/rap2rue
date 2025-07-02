import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
import { logout } from './store/userSlice';
import { apiUrl } from './utils/api';
import { login } from './store/userSlice';
import logo from './assets/react.jpeg';
import background from './assets/background.jpeg';
import EditProfileModal from './components/EditProfileModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import SocialCallback from './components/SocialCallback';
import VideoFeed from './components/VideoFeed';

function App() {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const [showWelcome, setShowWelcome] = useState(false);
  // Loader global (affiché lors des actions longues)
  const [globalLoading, setGlobalLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  const navigate = useNavigate();
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [feedback, setFeedback] = useState(null); // message de succès/erreur
  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    if (!localStorage.getItem('hasVisited')) {
      setShowWelcome(true);
      localStorage.setItem('hasVisited', 'true');
      setTimeout(() => setShowWelcome(false), 3500);
    }
  }, []);

  // Handler pour modifier le profil
  async function handleEditProfile(data) {
    setGlobalLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(apiUrl('/api/auth/profile'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Erreur lors de la modification du profil');
      dispatch(login({ user: result.user, role: result.user.role }));
      setFeedback({ type: 'success', message: 'Profil modifié avec succès.' });
      setShowEditProfileModal(false);
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    } finally {
      setGlobalLoading(false);
    }
  }
  // Handler pour changer le mot de passe
  async function handleChangePassword(data) {
    setGlobalLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(apiUrl('/api/auth/password'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Erreur lors du changement de mot de passe');
      setFeedback({ type: 'success', message: 'Mot de passe modifié avec succès.' });
      setShowChangePasswordModal(false);
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    } finally {
      setGlobalLoading(false);
    }
  }

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  return (
      <div
        className="fixed inset-0 min-h-screen w-screen text-white font-sans flex flex-col overflow-hidden"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'var(--bg-main)',
          color: 'var(--text-main)',
        }}
      >
        {/* Bouton flottant action principale mobile */}
        {(user && user.role === 'artist' && location.pathname !== '/upload') && (
        <button
          className="fixed bottom-24 right-6 z-[300] bg-[#1DB954] text-black p-5 rounded-full shadow-2xl border-4 border-white/10 hover:bg-red-600 hover:text-white transition text-3xl flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-[#1DB954]/50 md:hidden"
          aria-label="Uploader une musique"
          onClick={() => {
            navigate('/upload');
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
        )}
        {/* Loader plein écran */}
        {globalLoading && (
          <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-[200]">
            <div className="loader"></div>
            <div className="loader-message">Chargement…</div>
          </div>
        )}
        {/* Barre de navigation sticky, bord à bord (desktop uniquement) */}
        <nav className="flex items-center justify-between w-full px-8 py-5 border-b border-white/10 bg-[#18181b]/80 backdrop-blur sticky top-0 z-50 shadow-lg">
          <div className="flex items-center">
            <span className="text-3xl font-extrabold tracking-widest text-accent drop-shadow">RAP2RUE</span>
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
                {user.role === 'admin' && (
                  <Link to="/admin" className="nav-link text-center">Admin</Link>
                )}
              </>
            )}
            <Link to="/reels" className="nav-link text-center">Reels</Link>
            <div className="flex justify-center"><UserStatus /></div>
          </div>
        </nav>
        {/* Notification popup pour nouveaux visiteurs */}
        {showWelcome && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-accent text-[#18181b] px-6 py-3 rounded-xl shadow-lg z-[100] font-bold text-lg animate-fade-in">
            Bienvenue sur RAP2RUE&nbsp;! Découvre, écoute et soutiens le rap.
          </div>
        )}
        {/* Feedback global */}
        {feedback && (
          <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-[200] font-bold text-lg animate-fade-in ${feedback.type === 'success' ? 'bg-[#1DB954] text-black' : 'bg-red-500 text-white'}`}>
            {feedback.message}
          </div>
        )}
        {/* Routes principales, occupe tout l'espace restant */}
        <div className="flex-1 w-full h-full overflow-y-auto bg-[#101010] md:bg-transparent rounded-t-3xl md:rounded-none shadow-2xl md:shadow-none mt-2 md:mt-0">
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile 
                  onEditProfile={() => setShowEditProfileModal(true)}
                  onChangePassword={() => setShowChangePasswordModal(true)}
                />
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/social-callback" element={<SocialCallback />} />
            <Route path="/reels" element={<VideoFeed />} />
          </Routes>
        </div>
        {/* Bottom bar mobile only, dynamique selon l'état utilisateur */}
        <nav className="fixed bottom-0 left-0 w-full bg-[#18181b] border-t border-white/10 flex justify-between items-center px-2 py-2 z-50 shadow-2xl md:hidden">
          <MobileNavLink to="/" label="Accueil" icon={<svg className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M3 12l2-2m0 0l7-7 7 7m-9 2v8m0 0h4m-4 0a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2z' /></svg>} />
          <MobileNavLink to="/explore" label="Explorer" icon={<svg className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M12 8v4l3 3' /></svg>} />
          <MobileNavLink to="/reels" label="Reels" icon={<svg className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><rect x='4' y='4' width='16' height='16' rx='4' /><path d='M8 12h8M12 8v8' /></svg>} />
          {!user && (
            <>
              <MobileNavLink to="/login" label="Connexion" icon={<svg className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M15 12H3m6-6l-6 6 6 6' /></svg>} />
              <MobileNavLink to="/register" label="Inscription" icon={<svg className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' /></svg>} />
            </>
          )}
          {user && (
            <>
              <MobileNavLink to="/profile" label="Profil" icon={<svg className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M5.121 17.804A13.937 13.937 0 0 1 12 15c2.5 0 4.847.655 6.879 1.804' /><path strokeLinecap='round' strokeLinejoin='round' d='M15 11a3 3 0 1 0-6 0 3 3 0 0 0 6 0z' /></svg>} />
              <MobileNavLink to="/library" label="Bibliothèque" icon={<svg className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M8 17l4 4 4-4m0-5V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v9m0 0l4 4 4-4' /></svg>} />
              {user && user.role === 'admin' && (
                <MobileNavLink to="/admin" label="Admin" icon={
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                    <circle cx="12" cy="12" r="10" stroke="#1DB954" strokeWidth="2" fill="none" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
                  </svg>
                } />
              )}
              {user && user.role === 'artist' && (
                <MobileNavLink to="/dashboard" label="Dashboard" icon={
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                    <rect x="3" y="13" width="4" height="8" rx="1" />
                    <rect x="9" y="9" width="4" height="12" rx="1" />
                    <rect x="15" y="5" width="4" height="16" rx="1" />
                  </svg>
                } />
              )}
              <MobileNavAction
                label="Déconnexion"
                icon={<svg className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M17 16l4-4m0 0l-4-4m4 4H7' /><path strokeLinecap='round' strokeLinejoin='round' d='M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z' /></svg>}
                onClick={() => dispatch(logout())}
              />
            </>
          )}
        </nav>
        {/* Modale édition profil */}
        {showEditProfileModal && (
          <EditProfileModal
            user={user}
            onClose={() => setShowEditProfileModal(false)}
            onSave={handleEditProfile}
          />
        )}
        {/* Modale changement mot de passe */}
        {showChangePasswordModal && (
          <ChangePasswordModal
            onClose={() => setShowChangePasswordModal(false)}
            onSave={handleChangePassword}
          />
        )}
      </div>
  )
}

function MobileNavLink({ to, label, icon }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`mobile-nav-link flex flex-col items-center justify-center flex-1 text-white hover:text-[#1DB954] transition focus:outline-none focus:ring-2 focus:ring-[#1DB954] ${isActive ? 'text-[#1DB954] font-bold' : ''}`}
    >
      <span className="text-2xl mb-0.5">{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  );
}

function MobileNavAction({ label, icon, onClick, color = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mobile-nav-action flex flex-col items-center justify-center text-white hover:text-red-500 transition focus:outline-none focus:ring-2 focus:ring-red-500 bg-transparent border-0 ${color}`}
      aria-label={label}
      style={{ background: 'transparent' }}
    >
      <span className="text-2xl mb-0.5">{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
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
