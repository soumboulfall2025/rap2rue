import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { apiUrl } from '../utils/api';
import BuyMusicButton from './BuyMusicButton';
import MusicReviews from './MusicReviews';
import MusicReviewForm from './MusicReviewForm';

export default function Explore() {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buyMsg, setBuyMsg] = useState('');
  const [refreshReviews, setRefreshReviews] = useState({});
  const { user, isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchMusics = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(apiUrl('/api/music'));
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erreur serveur');
        setMusics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMusics();
  }, []);

  const handleBuy = async (musicId) => {
    setBuyMsg('');
    try {
      const res = await fetch(apiUrl(`/api/music/buy/${musicId}`), {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur serveur');
      setBuyMsg('Achat réussi ! Musique débloquée dans ta bibliothèque.');
    } catch (err) {
      setBuyMsg(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-8 text-center">Explorer les musiques</h2>
      {loading && <div className="text-center">Chargement...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {buyMsg && <div className="text-center text-accent font-bold mb-4">{buyMsg}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {musics.map(music => (
            <div key={music._id} className="bg-[#232323] rounded-lg shadow p-4 flex flex-col md:flex-row items-center">
              <img src={music.coverUrl} alt={music.title} className="w-32 h-32 object-cover rounded mb-4 md:mb-0 md:mr-6" />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{music.title}</h3>
                <div className="text-accent font-semibold mb-1">{music.genre}</div>
                <div className="mb-1">Artiste : <span className="font-semibold">{music.artist?.name || 'Inconnu'}</span></div>
                <div className="mb-1">Prix : <span className="font-semibold">{music.price} €</span></div>
                <div className="mb-2 text-sm text-gray-300">{music.description}</div>
                <audio controls src={music.audioUrl} className="w-full mt-2" preload="none">
                  Votre navigateur ne supporte pas l'audio.
                </audio>
                {isAuthenticated && user?.id !== music.artist?._id && !user?.library?.includes(music._id) && (
                  <BuyMusicButton music={music} />
                )}
                <MusicReviews musicId={music._id} refresh={refreshReviews[music._id] || 0} />
                {user?.library?.includes(music._id) && (
                  <MusicReviewForm musicId={music._id} onReviewAdded={() => setRefreshReviews(r => ({ ...r, [music._id]: (r[music._id] || 0) + 1 }))} />
                )}
              </div>
            </div>
        ))}
      </div>
      {musics.length === 0 && !loading && !error && (
        <div className="text-center text-gray-400 mt-8">Aucune musique trouvée.</div>
      )}
    </div>
  );
}
