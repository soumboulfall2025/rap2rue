import React, { useState } from 'react';
import axios from 'axios';

export default function ChooseRole({ onRoleSet }) {
  const [role, setRole] = useState('fan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.patch('/api/auth/social-role', { role }, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      if (onRoleSet) onRoleSet(role);
    } catch (err) {
      setError('Erreur lors de la mise à jour du rôle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-12 p-6 bg-[#18181b] rounded-xl shadow space-y-4 border border-[#232323] animate-fade-in">
      <h2 className="text-xl font-bold mb-2 text-accent">Choisissez votre rôle</h2>
      <div className="flex gap-4">
        <label className={`flex-1 p-3 border rounded cursor-pointer text-white text-center transition-all duration-150 ${role==='fan' ? 'border-accent bg-accent/10' : 'border-gray-700 bg-[#232323]'}`}> 
          <input type="radio" name="role" value="fan" checked={role==='fan'} onChange={() => setRole('fan')} className="mr-2 accent-[#1db954]" />
          Fan
        </label>
        <label className={`flex-1 p-3 border rounded cursor-pointer text-white text-center transition-all duration-150 ${role==='artist' ? 'border-accent bg-accent/10' : 'border-gray-700 bg-[#232323]'}`}> 
          <input type="radio" name="role" value="artist" checked={role==='artist'} onChange={() => setRole('artist')} className="mr-2 accent-[#1db954]" />
          Artiste
        </label>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" className="bg-accent text-black px-4 py-2 rounded w-full font-bold hover:bg-[#17a74a] transition" disabled={loading}>{loading ? 'Enregistrement...' : 'Valider'}</button>
    </form>
  );
}
