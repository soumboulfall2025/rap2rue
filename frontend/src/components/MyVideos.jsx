import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function MyVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get('/api/video/my', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
      .then(res => setVideos(res.data))
      .catch(() => setError('Erreur lors du chargement des vidéos'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette vidéo ?')) return;
    try {
      await axios.delete(`/api/video/${id}`, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      setVideos(videos => videos.filter(v => v._id !== id));
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  const handleEdit = (video) => {
    setEditId(video._id);
    setEditTitle(video.title);
    setEditDesc(video.description || '');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/api/video/${editId}`, {
        title: editTitle,
        description: editDesc
      }, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      setVideos(videos => videos.map(v => v._id === editId ? { ...v, title: editTitle, description: editDesc } : v));
      setEditId(null);
    } catch {
      alert('Erreur lors de la modification');
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!videos.length) return <div>Aucune vidéo publiée.</div>;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 text-accent">Vos vidéos TikTok</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map(video => (
          <div key={video._id} className="bg-[#232323] rounded-xl p-4 shadow-lg">
            <video src={video.url} controls className="w-full rounded mb-2" />
            <div className="font-semibold text-white">{video.title}</div>
            <div className="text-gray-400 text-sm mb-1">{video.description}</div>
            <div className="text-xs text-gray-500">{new Date(video.createdAt).toLocaleString()}</div>
            <button onClick={() => handleDelete(video._id)} className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">Supprimer</button>
            <button onClick={() => handleEdit(video)} className="mt-2 ml-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">Éditer</button>
            {editId === video._id && (
              <form onSubmit={handleEditSubmit} className="mt-2 space-y-2">
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full border p-1 rounded" />
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full border p-1 rounded" />
                <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Valider</button>
                <button type="button" onClick={() => setEditId(null)} className="ml-2 text-xs">Annuler</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
