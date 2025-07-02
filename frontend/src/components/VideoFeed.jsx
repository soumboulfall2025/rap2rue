import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VideoSocialActions from './VideoSocialActions';
import { useSelector } from 'react-redux';
import UploadVideo from './UploadVideo';

// Correction : API_URL doit être juste l'URL racine, le chemin /api/video est ajouté dans la requête
const API_URL = import.meta.env.VITE_API_URL || 'https://rap2rue-backend.onrender.com';

export default function VideoFeed() {
  const [videos, setVideos] = useState([]);
  const [current, setCurrent] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const user = useSelector(state => state.user.user);

  useEffect(() => {
    const url = API_URL + '/api/video?page=' + page + '&limit=10';
    console.log('API_URL utilisée:', url); // DEBUG
    axios.get(url)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        console.log('Vidéos reçues du backend:', data); // DEBUG
        if (page === 1) setVideos(data);
        else setVideos(v => [...v, ...data]);
        if (data.length < 10) setHasMore(false);
      })
      .catch(() => setVideos([]));

    // Rafraîchissement automatique si une vidéo vient d'être validée dans un autre onglet
    const onStorage = (e) => {
      if (e.key === 'reels_refresh') {
        setPage(1);
        axios.get(API_URL + `?page=1&limit=10`).then(res => {
          const data = Array.isArray(res.data) ? res.data : [];
          setVideos(data);
          setCurrent(0);
          setHasMore(data.length === 10);
        });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [page]);

  // Gestion du scroll pour effet TikTok + pagination
  useEffect(() => {
    const handleScroll = (e) => {
      if (e.deltaY > 0 && current < videos.length - 1) setCurrent(c => c + 1);
      else if (e.deltaY > 0 && current === videos.length - 1 && hasMore) setPage(p => p + 1);
      if (e.deltaY < 0 && current > 0) setCurrent(c => c - 1);
    };
    window.addEventListener('wheel', handleScroll);
    return () => window.removeEventListener('wheel', handleScroll);
  }, [current, videos.length, hasMore]);

  // Gestion du swipe mobile pour effet TikTok + pagination
  useEffect(() => {
    let touchStartY = null;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e) => {
      if (touchStartY === null) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      if (diff > 50 && current < videos.length - 1) setCurrent(c => c + 1);
      else if (diff > 50 && current === videos.length - 1 && hasMore) setPage(p => p + 1);
      if (diff < -50 && current > 0) setCurrent(c => c - 1);
      touchStartY = null;
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [current, videos.length, hasMore]);

  // Ajout d'un effet pour recharger les vidéos après upload
  useEffect(() => {
    if (showUpload === false) {
      setPage(1);
      // Forcer le rechargement du feed après upload
      axios.get(API_URL + `?page=1&limit=10`).then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setVideos(data);
        setCurrent(0);
        setHasMore(data.length === 10);
      });
    }
  }, [showUpload]);

  if (!Array.isArray(videos) || !videos.length) return <div className="flex justify-center items-center h-screen">Aucune vidéo</div>;

  const video = videos[current] || {};
  const isValidUrl = video.url && (video.url.startsWith('http://') || video.url.startsWith('https://')) && (video.url.endsWith('.mp4') || video.url.includes('cloudinary') || video.url.includes('video'));

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white relative">
      {/* Bouton flottant d'upload pour artistes */}
      {user && (user.role === 'artist' || user.role === 'admin') && (
        <button
          className="fixed bottom-24 right-6 z-40 bg-[#1DB954] text-black p-5 rounded-full shadow-2xl border-4 border-white/10 hover:bg-red-600 hover:text-white transition text-3xl flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-[#1DB954]/50"
          onClick={() => setShowUpload(true)}
          aria-label="Uploader une vidéo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      )}
      {/* Message si non artiste/admin */}
      {user && user.role !== 'artist' && user.role !== 'admin' && (
        <div className="fixed bottom-24 right-6 z-40 bg-gray-800 text-white px-4 py-2 rounded-xl shadow-lg text-sm opacity-80">
          Seuls les artistes ou admins peuvent uploader des vidéos.
        </div>
      )}
      {/* Modale d'upload vidéo */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-[#121212] rounded-2xl shadow-2xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Uploader une nouvelle vidéo</h2>
            <UploadVideo onUpload={() => setShowUpload(false)} />
            <button
              onClick={() => setShowUpload(false)}
              className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
      {/* Lecteur vidéo principal */}
      <div className="w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl mb-4 relative min-h-[300px] flex items-center justify-center">
        {isValidUrl ? (
          <video
            key={video._id || video.url}
            src={video.url}
            controls
            autoPlay
            muted
            style={{ width: '100%', maxHeight: 500, background: 'black' }}
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-8">
            <div className="text-red-500 text-lg font-bold mb-2">Vidéo non disponible ou format non supporté</div>
            <div className="text-xs break-all text-gray-400 mb-2">{video.url ? video.url : 'Aucune URL vidéo trouvée.'}</div>
            {video.url && (
              <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-accent underline text-sm">Tester la vidéo dans un nouvel onglet</a>
            )}
          </div>
        )}
        {/* Overlay TikTok social actions */}
        {isValidUrl && <VideoSocialActions video={video} />}
      </div>
      {/* Informations et actions sur la vidéo */}
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
        <div className="text-3xl font-bold">{video.title}</div>
        <div className="text-lg text-gray-400">{video.description}</div>
        <div className="flex flex-wrap gap-2">
          <div className="text-sm text-gray-500">Artiste : {video.artist?.name || 'Inconnu'}</div>
          <div className="text-sm text-gray-500">Date : {new Date(video.createdAt).toLocaleString()}</div>
          <div className="text-sm text-gray-500">ID : {video._id}</div>
          <div className="text-sm text-gray-500">isValidated : {video.isValidated ? 'true' : 'false'}</div>
        </div>
        {/* VideoSocialActions supprimé ici, car déplacé en overlay */}
      </div>
    </div>
  );
}
