import React, { useState } from 'react';
import axios from 'axios';

export default function UploadVideo({ onUpload }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Sélectionne une vidéo');
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      // 1. Upload sur Cloudinary (ou autre)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'Rap2rue'); // preset Cloudinary correct
      const res = await axios.post('https://api.cloudinary.com/v1_1/dtfcsz1km/video/upload', formData);
      const url = res.data.secure_url;
      // 2. Envoi au backend
      await axios.post(
        '/api/video',
        { title, description, url },
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }
      );
      setTitle(''); setDescription(''); setFile(null); setSuccess(true);
      if (onUpload) onUpload();
    } catch (err) {
      setError('Erreur upload vidéo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-[#18181b] rounded-xl shadow max-w-md mx-auto border border-[#232323] animate-fade-in">
      <h2 className="text-xl font-bold text-accent mb-2">Uploader une vidéo</h2>
      <input type="text" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-700 bg-[#232323] text-white p-2 rounded" required />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-700 bg-[#232323] text-white p-2 rounded" />
      <input type="file" accept="video/*" onChange={e => setFile(e.target.files[0])} className="w-full text-white" required />
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-400">Vidéo uploadée avec succès !</div>}
      <button type="submit" className="bg-accent text-black px-4 py-2 rounded w-full font-bold hover:bg-[#17a74a] transition" disabled={loading}>{loading ? 'Upload...' : 'Uploader'}</button>
    </form>
  );
}
