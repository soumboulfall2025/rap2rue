import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function VideoSocialActions({ videoId }) {
  const [stats, setStats] = useState({ likes: 0, comments: 0 });
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`/api/video/${videoId}/stats`).then(res => setStats(res.data));
    axios.get(`/api/video/${videoId}/comments`).then(res => setComments(res.data));
    // Vérifie si l'utilisateur a liké (simple, à améliorer avec le backend si besoin)
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`/api/video/my`, { headers: { Authorization: 'Bearer ' + token } })
        .then(res => {
          const v = res.data.find(v => v._id === videoId);
          if (v && v.likes && v.likes.includes(JSON.parse(atob(token.split('.')[1])).id)) setLiked(true);
        });
    }
  }, [videoId]);

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Connecte-toi pour liker');
    setLoading(true);
    try {
      const res = await axios.post(`/api/video/${videoId}/like`, {}, { headers: { Authorization: 'Bearer ' + token } });
      setLiked(res.data.liked);
      setStats(s => ({ ...s, likes: res.data.likes }));
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
      const res = await axios.get(`/api/video/${videoId}/comments`);
      setComments(res.data);
      setStats(s => ({ ...s, comments: res.data.length }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button onClick={handleLike} disabled={loading} className={`mr-4 text-xl ${liked ? 'text-red-500' : 'text-gray-400'}`}>♥ {stats.likes}</button>
      <span className="text-gray-400 text-sm">{stats.comments} commentaires</span>
      <form onSubmit={handleComment} className="mt-2 flex gap-2">
        <input value={comment} onChange={e => setComment(e.target.value)} className="border rounded p-1 flex-1" placeholder="Ajouter un commentaire..." />
        <button type="submit" className="bg-accent text-white px-3 py-1 rounded" disabled={loading}>Envoyer</button>
      </form>
      <div className="mt-2 max-h-32 overflow-y-auto">
        {comments.map((c, i) => (
          <div key={i} className="text-sm text-gray-200 border-b border-gray-700 py-1">
            <span className="font-bold">{c.user?.name || 'Utilisateur'}</span> : {c.text}
          </div>
        ))}
      </div>
    </div>
  );
}
