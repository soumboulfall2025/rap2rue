import { useSelector } from 'react-redux';
import ArtistFollowButton from './ArtistFollowButton';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../utils/api';
import { io } from 'socket.io-client';

export default function Profile({ onEditProfile, onChangePassword, profileUser }) {
  const { user, role, isAuthenticated } = useSelector((state) => state.user);
  // On affiche le profil de profileUser si fourni, sinon celui de l'utilisateur connecté
  const displayedUser = profileUser || user;
  const isOwnProfile = !profileUser || (user && profileUser && user._id === profileUser._id);
  const [followers, setFollowers] = useState(0);
  const [followed, setFollowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'artist') return;
    axios.get(apiUrl(`/api/user/${user._id}/followers`)).then(res => setFollowers(res.data.followers));
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(apiUrl(`/api/user/${user._id}`), { headers: { Authorization: 'Bearer ' + token } })
        .then(res => {
          if (res.data && res.data.user && Array.isArray(res.data.user.followers)) {
            setFollowed(res.data.user.followers.includes(JSON.parse(atob(token.split('.')[1])).id));
          }
        });
    }
    const s = io(import.meta.env.VITE_REACT_APP_SOCKET_URL || 'http://localhost:5000');
    setSocket(s);
    return () => s.disconnect();
  }, [user]);

  useEffect(() => {
    if (!socket || !user || user.role !== 'artist') return;
    const handleFollow = (data) => {
      if (data.artistId === user._id) setFollowers(data.followers);
    };
    socket.on('artist_follow', handleFollow);
    return () => socket.off('artist_follow', handleFollow);
  }, [socket, user]);

  const handleFollow = async () => {
    if (!user) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(apiUrl(`/api/user/${user._id}/follow`), {}, { headers: { Authorization: 'Bearer ' + token } });
      setFollowed(res.data.followed);
      setFollowers(res.data.followers);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="text-center mt-10 text-lg">Veuillez vous connecter pour accéder à votre profil.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-[#18181b] to-[#232323] p-0 animate-fade-in">
      <div className="flex flex-col items-center w-full max-w-md bg-[#232323]/90 rounded-2xl shadow-2xl p-6 border border-white/10 mt-6 mb-6 mx-2">
        {/* Avatar moderne */}
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1db954] to-[#232323] flex items-center justify-center mb-4 shadow-lg border-4 border-accent overflow-hidden">
          <svg className="w-16 h-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold mb-1 text-accent text-center tracking-tight break-words">{displayedUser?.name}</h2>
        <div className="text-gray-400 text-base mb-1 break-words">{displayedUser?.email}</div>
        <div className="mb-4 text-accent font-bold uppercase tracking-wider text-xs">{displayedUser?.role}</div>
        {/* Bouton s'abonner si artiste et pas soi-même */}
        {displayedUser.role === 'artist' && !isOwnProfile && (
          <ArtistFollowButton artistId={displayedUser._id} />
        )}
        {/* Ancien bouton s'abonner pour soi-même supprimé */}
        {/* Actions profil (édition, mdp) seulement pour soi-même */}
        {isOwnProfile && (
          <div className="flex flex-col gap-3 w-full">
            <button className="w-full py-2 rounded-full bg-accent text-[#18181b] font-bold shadow hover:bg-accent transition text-base" onClick={onEditProfile}>
              Modifier le profil
            </button>
            <button className="w-full py-2 rounded-full border border-accent text-accent font-bold shadow hover:bg-accent hover:text-[#18181b] transition text-base" onClick={onChangePassword}>
              Changer le mot de passe
            </button>
          </div>
        )}
        {/* Stats utilisateur (mobile friendly) */}
        <div className="mt-6 flex flex-row gap-8 justify-center w-full">
          <div className="text-center flex-1">
            <div className="text-xl font-bold text-accent">0</div>
            <div className="text-xs text-gray-400">Achats</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-xl font-bold text-accent">0</div>
            <div className="text-xs text-gray-400">Musiques uploadées</div>
          </div>
        </div>
      </div>
    </div>
  );
}
