import { useState } from 'react';
import { apiUrl } from '../utils/api';
import { useOutletContext } from 'react-router-dom';

export default function UploadMusic() {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [cover, setCover] = useState(null);
  const [audio, setAudio] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [globalLoading] = useOutletContext?.() || [null];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title || !genre || !price || !description || !cover || !audio) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    if (parseInt(price, 10) < 2000) {
      setError('Le prix minimum est de 2000 F CFA.');
      return;
    }
    setLoading(true);
    if (globalLoading) globalLoading(true);
    // Préparation du formData pour upload
    const formData = new FormData();
    formData.append('title', title);
    formData.append('genre', genre);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('cover', cover);
    formData.append('audio', audio);
    try {
      const res = await fetch(apiUrl('/api/music/upload'), {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur serveur');
      setSuccess('Upload réussi !');
      setTitle(''); setGenre(''); setPrice(''); setDescription(''); setCover(null); setAudio(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (globalLoading) globalLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] relative">
      <form onSubmit={handleSubmit} className="bg-[#232323] p-8 rounded-lg shadow-lg w-full max-w-md" encType="multipart/form-data">
        <h2 className="text-2xl font-bold mb-6 text-center">Uploader une musique</h2>
        <div className="mb-4">
          <label className="block mb-1 text-sm">Titre</label>
          <input type="text" className="w-full px-3 py-2 rounded bg-[#18181b] border border-accent text-white" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm">Genre</label>
          <input type="text" className="w-full px-3 py-2 rounded bg-[#18181b] border border-accent text-white" value={genre} onChange={e => setGenre(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm">Prix (F CFA)</label>
          <input
            type="number"
            min="2000"
            step="1"
            className="w-full px-3 py-2 rounded bg-[#18181b] border border-accent text-white"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm">Description</label>
          <textarea className="w-full px-3 py-2 rounded bg-[#18181b] border border-accent text-white" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm">Image de couverture</label>
          <input type="file" accept="image/*" className="w-full text-white" onChange={e => setCover(e.target.files[0])} />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-sm">Fichier audio</label>
          <input type="file" accept="audio/*" className="w-full text-white" onChange={e => setAudio(e.target.files[0])} />
        </div>
        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
        {success && <div className="mb-4 text-green-500 text-sm text-center">{success}</div>}
        <button type="submit" className="w-full py-2 rounded bg-accent text-[#18181b] font-bold hover:bg-[#1ed760cc] transition" disabled={loading}>
          {loading ? 'Upload...' : 'Uploader'}
        </button>
      </form>
      {/* Bouton flottant pour upload mobile */}
      <button
        type="button"
        onClick={handleSubmit}
        className="fixed bottom-20 right-6 z-50 bg-accent text-[#18181b] rounded-full shadow-lg p-4 flex items-center justify-center hover:bg-[#1ed760cc] transition md:hidden"
        style={{ boxShadow: '0 4px 24px 0 rgba(30,215,96,0.2)' }}
        aria-label="Uploader la musique"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
