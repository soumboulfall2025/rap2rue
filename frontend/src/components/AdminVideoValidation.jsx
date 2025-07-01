import React, { useEffect, useState } from 'react';
import { FaUser, FaCheckCircle, FaClock } from 'react-icons/fa';
import { apiUrl } from '../utils/api';

const AdminVideoValidation = ({ cardStyle }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  // Récupère les vidéos non validées
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/video/all?validated=false'), {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Erreur inconnue');
      }
      setVideos(await res.json());
    } catch (err) {
      setFeedback(err.message || "Erreur lors du chargement des vidéos.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Valide une vidéo
  const validateVideo = async (id) => {
    try {
      const res = await fetch(apiUrl(`/api/video/${id}/validate`), {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      if (!res.ok) throw new Error();
      setFeedback('Vidéo validée !');
      setVideos(videos.filter(v => v._id !== id));
      // Force le rafraîchissement du feed public (Reels) si ouvert dans un autre onglet
      if (window.localStorage) {
        window.localStorage.setItem('reels_refresh', Date.now().toString());
      }
    } catch (err) {
      setFeedback("Erreur lors de la validation.");
    }
  };

  if (loading) return <div>Chargement…</div>;

  if (!cardStyle) {
    // fallback simple
    return (
      <div>
        <h2>Vidéos à valider</h2>
        {feedback && <div style={{ color: 'green', marginBottom: 10 }}>{feedback}</div>}
        {videos.length === 0 ? (
          <div>Aucune vidéo en attente de validation.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {videos.map(video => (
              <li key={video._id} style={{ marginBottom: 20, border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
                <video src={video.url} controls width="300" style={{ display: 'block', marginBottom: 8 }} />
                <div><b>{video.title}</b></div>
                <div>{video.description}</div>
                <button onClick={() => validateVideo(video._id)} style={{ marginTop: 8, background: '#1db954', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>
                  Valider
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Version "cool" façon Spotify/Snapchat
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {feedback && <div className="col-span-full text-[#1DB954] font-bold mb-2">{feedback}</div>}
      {videos.length === 0 ? (
        <div className="col-span-full text-gray-400 text-center py-8">Aucune vidéo en attente de validation.</div>
      ) : (
        videos.map(video => (
          <div key={video._id} className="bg-[#232323] rounded-2xl shadow-xl p-4 flex flex-col gap-3 border-2 border-[#1DB954]/30 hover:scale-[1.025] transition-transform">
            <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
              <video src={video.url} controls className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-[#1DB954] text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <FaClock className="inline mr-1" /> En attente
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <FaUser className="text-[#1DB954]" />
              <span className="text-white font-semibold">{video.artist?.name || 'Artiste inconnu'}</span>
            </div>
            <div className="text-lg font-bold text-white">{video.title}</div>
            <div className="text-gray-400 text-sm mb-2">{video.description}</div>
            <button onClick={() => validateVideo(video._id)} className="bg-[#1DB954] hover:bg-green-500 text-black font-bold px-4 py-2 rounded-full flex items-center gap-2 justify-center transition">
              <FaCheckCircle /> Valider
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminVideoValidation;
