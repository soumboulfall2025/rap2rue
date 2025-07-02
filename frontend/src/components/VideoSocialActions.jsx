import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function VideoSocialActions({ video }) {
  const videoId = video?._id;
  const [stats, setStats] = useState({ likes: 0, comments: 0 });
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [animLike, setAnimLike] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connexion socket.io côté client
    const s = io(import.meta.env.VITE_REACT_APP_SOCKET_URL || 'http://localhost:5000');
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!videoId) return;
    axios.get(`/api/video/${videoId}/stats`).then(res => setStats(res.data));
    axios.get(`/api/video/${videoId}/comments`).then(res => setComments(Array.isArray(res.data) ? res.data : []));
    // Vérifie si l'utilisateur a liké (simple, à améliorer avec le backend si besoin)
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`/api/video/my`, { headers: { Authorization: 'Bearer ' + token } })
        .then(res => {
          const list = Array.isArray(res.data) ? res.data : [];
          const v = list.find(v => v._id === videoId);
          if (v && v.likes && v.likes.includes(JSON.parse(atob(token.split('.')[1])).id)) setLiked(true);
        });
    }
  }, [videoId]);

  // Réception des events temps réel
  useEffect(() => {
    if (!socket || !videoId) return;
    const handleLike = (data) => {
      if (data.videoId === videoId) {
        setStats(s => ({ ...s, likes: data.likes }));
      }
    };
    const handleComment = (data) => {
      if (data.videoId === videoId) {
        setComments(data.comments);
        setStats(s => ({ ...s, comments: data.comments.length }));
      }
    };
    socket.on('video_like', handleLike);
    socket.on('video_comment', handleComment);
    return () => {
      socket.off('video_like', handleLike);
      socket.off('video_comment', handleComment);
    };
  }, [socket, videoId]);

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Connecte-toi pour liker');
    setLoading(true);
    try {
      const res = await axios.post(`/api/video/${videoId}/like`, {}, { headers: { Authorization: 'Bearer ' + token } });
      setLiked(res.data.liked);
      setStats(s => ({ ...s, likes: res.data.likes }));
      setAnimLike(true);
      setTimeout(() => setAnimLike(false), 600);
      // Émet l'event like (le backend doit aussi le faire pour tous)
      if (socket) socket.emit('video_like', { videoId, likes: res.data.likes });
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('Connecte-toi pour commenter');
    if (!comment.trim()) return;
    setLoading(true);
    try {
      await axios.post(`/api/video/${videoId}/comment`, { text: comment }, { headers: { Authorization: 'Bearer ' + token } });
      setComment('');
      // On ne fait plus de GET ici, on attend l'event temps réel
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay vertical TikTok à droite */}
      <div className="absolute top-1/2 right-6 -translate-y-1/2 z-30 flex flex-col items-center gap-8 select-none">
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={loading}
          className={`group flex flex-col items-center focus:outline-none`}
        >
          <span className={`transition-transform duration-300 ${animLike ? 'scale-125' : ''}`}>
            {/* Cœur SVG animé */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={liked ? '#1DB954' : 'none'} stroke={liked ? '#1DB954' : '#fff'} strokeWidth="2" className={`w-10 h-10 drop-shadow-lg ${liked ? 'animate-pulse' : ''}`}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.04 3 12.5 3.99 13.07 5.36C13.64 3.99 15.1 3 16.64 3C19.64 3 22.14 5.5 22.14 8.5C22.14 13.5 12 21 12 21Z" /></svg>
          </span>
          <span className="text-[#1DB954] font-bold text-lg mt-1 drop-shadow-lg">{stats.likes}</span>
        </button>
        {/* Commentaires */}
        <button
          onClick={() => setShowComments(true)}
          className="group flex flex-col items-center focus:outline-none"
        >
          {/* Bulle SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" className="w-10 h-10 drop-shadow-lg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <span className="text-white font-bold text-lg mt-1 drop-shadow-lg">{stats.comments}</span>
        </button>
      </div>
      {/* Overlay commentaires slide-in */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="bg-[#1DB954]/95 w-full sm:w-[400px] h-full p-6 flex flex-col animate-slidein-right relative shadow-2xl">
            <button
              className="absolute top-4 right-4 text-white text-2xl hover:text-red-500"
              onClick={() => setShowComments(false)}
              aria-label="Fermer"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4 text-white">Commentaires</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {(Array.isArray(comments) ? comments : []).map((c, i) => (
                <div key={i} className="text-sm text-white border-b border-white/30 pb-2 flex items-center gap-2">
                  <svg xmlns='http://www.w3.org/2000/svg' fill="#1DB954" viewBox='0 0 24 24' stroke="#1DB954" strokeWidth="2" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                  <span className="font-bold text-white">{c.user?.name || 'Utilisateur'}</span> : {c.text}
                </div>
              ))}
              {comments.length === 0 && <div className="text-white/80">Aucun commentaire</div>}
            </div>
            <form onSubmit={handleComment} className="mt-4 flex gap-2">
              <input value={comment} onChange={e => setComment(e.target.value)} className="border border-white/30 rounded p-2 flex-1 bg-[#1DB954]/30 text-white placeholder-white/70" placeholder="Ajouter un commentaire..." />
              <button type="submit" className="bg-white text-[#1DB954] px-4 py-2 rounded font-bold" disabled={loading}>Envoyer</button>
            </form>
          </div>
          {/* Fond noir semi-transparent pour fermer */}
          <div className="flex-1" onClick={() => setShowComments(false)} />
        </div>
      )}
      {/* Animation slide-in (à ajouter dans tailwind.config.js si besoin) */}
      <style>{`
        @keyframes slidein-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slidein-right { animation: slidein-right 0.3s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </>
  );
}
