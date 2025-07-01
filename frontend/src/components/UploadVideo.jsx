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
      formData.append('upload_preset', 'ml_default'); // adapte selon ta config Cloudinary
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
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold">Uploader une vidéo</h2>
      <input type="text" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2" required />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2" />
      <input type="file" accept="video/*" onChange={e => setFile(e.target.files[0])} className="w-full" required />
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">Vidéo uploadée avec succès !</div>}
      <button type="submit" className="bg-black text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Upload...' : 'Uploader'}</button>
    </form>
  );
}
