import { useEffect, useState } from 'react';
import BuyMusicButton from './BuyMusicButton';

export default function Library() {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLibrary = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/auth/library', {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erreur serveur');
        setMusics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h2 className="text-4xl font-extrabold mb-10 text-center tracking-tight text-white drop-shadow-lg">Ma bibliothèque</h2>
      {loading && <div className="text-center text-accent animate-pulse">Chargement...</div>}
      {error && <div className="text-center text-red-500 font-semibold">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {musics.map((music, idx) => (
          <div
            key={music._id}
            className="bg-gradient-to-br from-[#232323] to-[#18181b] rounded-2xl shadow-xl p-6 flex flex-col items-center hover:scale-[1.03] hover:shadow-2xl transition-transform duration-300 border border-white/5 group animate-fade-in"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <img src={music.coverUrl} alt={music.title} className="w-36 h-36 object-cover rounded-xl mb-4 shadow-lg group-hover:ring-4 group-hover:ring-accent/40 transition-all duration-300" />
            <div className="w-full flex flex-col items-center">
              <h3 className="text-2xl font-bold mb-1 text-center group-hover:text-accent transition-colors duration-200">{music.title}</h3>
              <div className="text-accent font-semibold mb-1 uppercase tracking-wider">{music.genre}</div>
              <div className="mb-1 text-sm text-gray-300">Artiste : <span className="font-semibold text-white">{music.artist?.name || 'Inconnu'}</span></div>
              <div className="mb-1 text-sm">Prix : <span className="font-semibold text-accent">{music.price} €</span></div>
              <div className="mb-2 text-xs text-gray-400 text-center">{music.description}</div>
              <audio controls src={music.audioUrl} className="w-full mt-2 rounded-lg" preload="none">
                Votre navigateur ne supporte pas l'audio.
              </audio>
              {/* Optionnel : proposer le rachat si la musique n'est plus dans la bibliothèque */}
              {/* <BuyMusicButton music={music} /> */}
            </div>
          </div>
        ))}
      </div>
      {musics.length === 0 && !loading && !error && (
        <div className="text-center text-gray-400 mt-12 text-lg">Aucune musique achetée pour le moment.</div>
      )}
    </div>
  );
}
