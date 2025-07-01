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
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-12 p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold mb-2">Choisissez votre rôle</h2>
      <div className="flex gap-4">
        <label className={`flex-1 p-3 border rounded cursor-pointer ${role==='fan' ? 'border-accent bg-accent/10' : 'border-gray-300'}`}>
          <input type="radio" name="role" value="fan" checked={role==='fan'} onChange={() => setRole('fan')} className="mr-2" />
          Fan
        </label>
        <label className={`flex-1 p-3 border rounded cursor-pointer ${role==='artist' ? 'border-accent bg-accent/10' : 'border-gray-300'}`}>
          <input type="radio" name="role" value="artist" checked={role==='artist'} onChange={() => setRole('artist')} className="mr-2" />
          Artiste
        </label>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" className="bg-accent text-white px-4 py-2 rounded w-full" disabled={loading}>{loading ? 'Enregistrement...' : 'Valider'}</button>
    </form>
  );
}
