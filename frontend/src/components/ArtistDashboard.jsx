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
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erreur serveur');
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-[#232323] to-[#18181b] rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fade-in">
            <span className="text-5xl font-extrabold text-accent mb-2">{stats.totalTracks}</span>
            <span className="text-lg text-gray-300">Musiques publiées</span>
          </div>
          <div className="bg-gradient-to-br from-[#232323] to-[#18181b] rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fade-in" style={{ animationDelay: '100ms' }}>
            <span className="text-5xl font-extrabold text-accent mb-2">{stats.totalSales}</span>
            <span className="text-lg text-gray-300">Ventes totales</span>
          </div>
          <div className="bg-gradient-to-br from-[#232323] to-[#18181b] rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fade-in" style={{ animationDelay: '200ms' }}>
            <span className="text-5xl font-extrabold text-accent mb-2">{stats.totalStreams}</span>
            <span className="text-lg text-gray-300">Écoutes totales</span>
          </div>
        </div>
      )}
    </div>
  );
}
