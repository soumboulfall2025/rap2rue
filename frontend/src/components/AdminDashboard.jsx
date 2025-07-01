import React, { useEffect, useState } from "react";
import { apiUrl } from "../utils/api";
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const user = useSelector(state => state.user.user);
  const [users, setUsers] = useState([]);
  const [musics, setMusics] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const [usersRes, musicsRes, statsRes] = await Promise.all([
          fetch(apiUrl('/api/admin/users'), { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } }),
          fetch(apiUrl('/api/admin/musics'), { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } }),
          fetch(apiUrl('/api/admin/stats'), { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } })
        ]);
        if (!usersRes.ok || !musicsRes.ok || !statsRes.ok) {
          throw new Error("Erreur lors du chargement des données admin.");
        }
        setUsers(await usersRes.json());
        setMusics(await musicsRes.json());
        setStats(await statsRes.json());
      } catch (err) {
        setError("Erreur lors du chargement des données admin.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Actions admin
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    setError(""); setSuccess("");
    try {
      const res = await fetch(apiUrl(`/api/admin/users/${userId}`), {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      if (!res.ok) throw new Error();
      setUsers(users.filter(u => u._id !== userId));
      setSuccess("Utilisateur supprimé.");
    } catch {
      setError("Erreur lors de la suppression de l'utilisateur.");
    }
  };
  const handlePromoteUser = async (userId) => {
    setError(""); setSuccess("");
    try {
      const res = await fetch(apiUrl(`/api/admin/users/${userId}/role`), {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: 'admin' })
      });
      if (!res.ok) throw new Error();
      setUsers(users.map(u => u._id === userId ? { ...u, role: 'admin' } : u));
      setSuccess("Utilisateur promu admin.");
    } catch {
      setError("Erreur lors de la promotion de l'utilisateur.");
    }
  };
  const handleDeleteMusic = async (musicId) => {
    if (!window.confirm('Supprimer cette musique ?')) return;
    setError(""); setSuccess("");
    try {
      const res = await fetch(apiUrl(`/api/admin/musics/${musicId}`), {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      if (!res.ok) throw new Error();
      setMusics(musics.filter(m => m._id !== musicId));
      setSuccess("Musique supprimée.");
    } catch {
      setError("Erreur lors de la suppression de la musique.");
    }
  };

  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="max-w-5xl mx-auto py-6 px-2 md:px-6">
      <div className="sticky top-0 z-10 bg-[#18181b]/90 backdrop-blur rounded-b-2xl shadow-lg mb-8 flex flex-col md:flex-row md:items-center md:justify-between px-4 py-4 border-b border-[#1DB954]/30">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1DB954] tracking-tight mb-2 md:mb-0">Dashboard Admin</h2>
        {loading && <div className="text-accent animate-pulse font-semibold">Chargement...</div>}
        {error && <div className="text-red-500 font-semibold">{error}</div>}
        {success && <div className="text-[#1DB954] font-semibold">{success}</div>}
      </div>
      {stats && (
        <div className="mb-8 flex flex-wrap gap-6 justify-center">
          <div className="bg-[#232323] rounded-2xl p-6 shadow-xl text-center min-w-[140px] flex-1 max-w-xs border-2 border-[#1DB954]/40">
            <div className="text-lg font-bold text-[#1DB954] mb-1">Utilisateurs</div>
            <div className="text-3xl font-extrabold text-white">{stats.userCount}</div>
          </div>
          <div className="bg-[#232323] rounded-2xl p-6 shadow-xl text-center min-w-[140px] flex-1 max-w-xs border-2 border-[#1DB954]/40">
            <div className="text-lg font-bold text-[#1DB954] mb-1">Musiques</div>
            <div className="text-3xl font-extrabold text-white">{stats.musicCount}</div>
          </div>
          <div className="bg-[#232323] rounded-2xl p-6 shadow-xl text-center min-w-[140px] flex-1 max-w-xs border-2 border-[#1DB954]/40">
            <div className="text-lg font-bold text-[#1DB954] mb-1">Avis</div>
            <div className="text-3xl font-extrabold text-white">{stats.reviewCount}</div>
          </div>
        </div>
      )}
      <h3 className="text-2xl font-bold text-[#1DB954] mt-8 mb-4">Utilisateurs</h3>
      <div className="overflow-x-auto mb-8 rounded-xl shadow-lg">
        <table className="min-w-full bg-[#18181b] rounded-xl">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-400">Nom</th>
              <th className="px-4 py-2 text-left text-gray-400">Email</th>
              <th className="px-4 py-2 text-left text-gray-400">Rôle</th>
              <th className="px-4 py-2 text-left text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-gray-500 py-4">Aucun utilisateur</td></tr>
            ) : users.map(u => (
              <tr key={u._id} className="border-b border-gray-700 hover:bg-[#232323]/60 transition">
                <td className="px-4 py-2 text-gray-200 font-semibold">{u.name}</td>
                <td className="px-4 py-2 text-gray-300">{u.email}</td>
                <td className="px-4 py-2 text-gray-300 uppercase">{u.role}</td>
                <td className="px-4 py-2 flex flex-row gap-2">
                  <button onClick={() => handleDeleteUser(u._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm shadow">Supprimer</button>
                  {u.role !== 'admin' && (
                    <button onClick={() => handlePromoteUser(u._id)} className="bg-[#1DB954] hover:bg-green-600 text-black px-3 py-1 rounded-full text-sm shadow font-bold">Promouvoir admin</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="text-2xl font-bold text-[#1DB954] mt-8 mb-4">Musiques</h3>
      {/* Affichage mobile : cards, desktop : tableau */}
      <div className="block md:hidden space-y-4">
        {musics.length === 0 ? (
          <div className="text-center text-gray-500 py-4">Aucune musique</div>
        ) : musics.map(m => (
          <div key={m._id} className="bg-[#232323] rounded-xl shadow-lg p-4 flex flex-col gap-2 border border-[#1DB954]/20">
            <div className="flex flex-row items-center justify-between">
              <div>
                <div className="text-lg font-bold text-white">{m.title}</div>
                <div className="text-sm text-gray-400">{m.artist?.name || m.artist?.toString() || "-"}</div>
                {m.price !== undefined && m.price !== null && m.price !== '' && (
                  <div className="text-accent font-semibold mt-1">{m.price} F CFA</div>
                )}
              </div>
              <button onClick={() => handleDeleteMusic(m._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm shadow">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:block overflow-x-auto rounded-xl shadow-lg">
        <table className="min-w-full bg-[#18181b] rounded-xl">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-400">Titre</th>
              <th className="px-4 py-2 text-left text-gray-400">Artiste</th>
              <th className="px-4 py-2 text-left text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {musics.length === 0 ? (
              <tr><td colSpan={3} className="text-center text-gray-500 py-4">Aucune musique</td></tr>
            ) : musics.map(m => (
              <tr key={m._id} className="border-b border-gray-700 hover:bg-[#232323]/60 transition">
                <td className="px-4 py-2 text-gray-200 font-semibold">{m.title}</td>
                <td className="px-4 py-2 text-gray-300">{m.artist?.name || m.artist?.toString() || "-"}</td>
                <td className="px-4 py-2 text-gray-300 font-semibold">{m.price !== undefined && m.price !== null && m.price !== '' ? `${m.price} F CFA` : '-'}</td>
                <td className="px-4 py-2 flex flex-row gap-2">
                  <button onClick={() => handleDeleteMusic(m._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm shadow">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
