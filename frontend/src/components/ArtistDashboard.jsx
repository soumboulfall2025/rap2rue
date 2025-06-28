import React, { useEffect, useState } from "react";
import { apiUrl } from "../utils/api";
import { useSelector } from 'react-redux';

export default function ArtistDashboard() {
  const user = useSelector(state => state.user.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(apiUrl('/api/music/artist-dashboard'), {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
          },
        });
        let data;
        try {
          data = await res.json();
        } catch (jsonErr) {
          throw new Error('Réponse du serveur invalide (JSON)');
        }
        if (!res.ok) throw new Error(data.message || data.error || 'Erreur serveur');
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-4xl font-extrabold mb-10 text-center tracking-tight text-accent drop-shadow-lg animate-fade-in">Dashboard Artiste</h2>
      {loading && <div className="text-center text-accent animate-pulse">Chargement...</div>}
      {error && <div className="text-center text-red-500 font-semibold">{error}</div>}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-gradient-to-br from-[#232323] to-[#18181b] rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fade-in">
            <span className="text-5xl font-extrabold text-accent mb-2">{stats.totalTracks}</span>
            <span className="text-lg text-gray-300">Musiques publiées</span>
          </div>
          <div className="bg-gradient-to-br from-[#232323] to-[#18181b] rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fade-in" style={{ animationDelay: '100ms' }}>
            <span className="text-5xl font-extrabold text-accent mb-2">{stats.totalSales}</span>
            <span className="text-lg text-gray-300">Ventes totales</span>
          </div>
          <div className="bg-gradient-to-br from-[#232323] to-[#18181b] rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fade-in" style={{ animationDelay: '200ms' }}>
            <span className="text-5xl font-extrabold text-accent mb-2">{stats.totalRevenue} FCFA</span>
            <span className="text-lg text-gray-300">Revenu total</span>
          </div>
          <div className="bg-gradient-to-br from-[#232323] to-[#18181b] rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fade-in" style={{ animationDelay: '300ms' }}>
            <span className="text-5xl font-extrabold text-accent mb-2">{stats.totalStreams}</span>
            <span className="text-lg text-gray-300">Écoutes totales</span>
          </div>
        </div>
      )}
      {/* Top musique */}
      {stats && stats.topMusic && (
        <div className="mt-10 text-center">
          <h3 className="text-xl font-bold text-accent mb-2">Top musique (plus vendue)</h3>
          <div className="inline-block bg-[#232323] rounded-xl px-6 py-4 shadow-lg">
            <span className="text-lg font-semibold text-gray-200">{stats.topMusic.title}</span>
            <span className="ml-4 text-accent font-bold">{stats.topMusic.sales} ventes</span>
          </div>
        </div>
      )}
      {/* Liste détaillée des musiques publiées */}
      {stats && stats.musics && stats.musics.length > 0 && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-4 text-accent">Vos musiques publiées</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#18181b] rounded-xl shadow-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-gray-400">Titre</th>
                  <th className="px-4 py-2 text-left text-gray-400">Genre</th>
                  <th className="px-4 py-2 text-left text-gray-400">Prix</th>
                  <th className="px-4 py-2 text-left text-gray-400">Date</th>
                  <th className="px-4 py-2 text-left text-gray-400">Ventes</th>
                  <th className="px-4 py-2 text-left text-gray-400">Revenu</th>
                </tr>
              </thead>
              <tbody>
                {stats.musics.map(music => (
                  <tr key={music._id} className="border-b border-gray-700 hover:bg-[#232323] transition">
                    <td className="px-4 py-2 text-gray-200 font-semibold">{music.title}</td>
                    <td className="px-4 py-2 text-gray-300">{music.genre}</td>
                    <td className="px-4 py-2 text-gray-300">{music.price} FCFA</td>
                    <td className="px-4 py-2 text-gray-400">{new Date(music.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-accent font-bold">{music.sales || 0}</td>
                    <td className="px-4 py-2 text-green-400 font-bold">{music.revenue || 0} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
