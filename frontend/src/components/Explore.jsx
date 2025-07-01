import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { apiUrl } from '../utils/api';
import BuyMusicButton from './BuyMusicButton';
import MusicReviews from './MusicReviews';
import MusicReviewForm from './MusicReviewForm';
import MusicCard from './MusicCard';

export default function Explore() {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buyMsg, setBuyMsg] = useState('');
  const [refreshReviews, setRefreshReviews] = useState({});
  const [currentMusicId, setCurrentMusicId] = useState(null);
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {musics.map((music, idx) => (
          <MusicCard
            key={music._id}
            music={{
              ...music,
              cover: music.coverUrl,
              title: music.title,
              artist: music.artist?.name || 'Inconnu',
              price: music.price,
              description: music.description,
              isBought: user?.library?.includes(music._id) || false,
              audioUrl: music.audioUrl,
              _id: music._id,
              userRole: user?.role || 'fan',
            }}
            onPlay={() => setCurrentMusicId(music._id)}
            onPause={() => setCurrentMusicId(null)}
            liked={user?.library?.includes(music._id)}
            isActive={currentMusicId === music._id}
            price={music.price}
            description={music.description}
          />
        ))}
      </div>
      {musics.length === 0 && !loading && !error && (
        <div className="text-center text-gray-400 mt-8">Aucune musique trouvée.</div>
      )}
    </div>
  );
}
