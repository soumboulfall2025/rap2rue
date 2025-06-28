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
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-accent">Dashboard Admin</h2>
      {loading && <div className="text-center text-accent animate-pulse">Chargement...</div>}
      {error && <div className="text-center text-red-500 font-semibold">{error}</div>}
      {success && <div className="text-center text-green-500 font-semibold">{success}</div>}
      {stats && (
        <div className="mb-8 flex flex-wrap gap-8 justify-center">
          <div className="bg-[#232323] rounded-xl p-6 shadow text-center">
            <div className="text-2xl font-bold text-accent">Utilisateurs</div>
            <div className="text-3xl font-extrabold">{stats.userCount}</div>
          </div>
          <div className="bg-[#232323] rounded-xl p-6 shadow text-center">
            <div className="text-2xl font-bold text-accent">Musiques</div>
            <div className="text-3xl font-extrabold">{stats.musicCount}</div>
          </div>
          <div className="bg-[#232323] rounded-xl p-6 shadow text-center">
            <div className="text-2xl font-bold text-accent">Avis</div>
            <div className="text-3xl font-extrabold">{stats.reviewCount}</div>
          </div>
        </div>
      )}
      <h3 className="text-2xl font-bold text-accent mt-8 mb-4">Utilisateurs</h3>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-[#18181b] rounded-xl shadow-lg">
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
              <tr key={u._id} className="border-b border-gray-700">
                <td className="px-4 py-2 text-gray-200">{u.name}</td>
                <td className="px-4 py-2 text-gray-300">{u.email}</td>
                <td className="px-4 py-2 text-gray-300">{u.role}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleDeleteUser(u._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm mr-2">Supprimer</button>
                  {u.role !== 'admin' && (
                    <button onClick={() => handlePromoteUser(u._id)} className="bg-green-600 hover:bg-[#1db954] text-white px-3 py-1 rounded text-sm">Promouvoir admin</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="text-2xl font-bold text-accent mt-8 mb-4">Musiques</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#18181b] rounded-xl shadow-lg">
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
              <tr key={m._id} className="border-b border-gray-700">
                <td className="px-4 py-2 text-gray-200">{m.title}</td>
                <td className="px-4 py-2 text-gray-300">{m.artist?.name || m.artist?.toString() || "-"}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleDeleteMusic(m._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm mr-2">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
