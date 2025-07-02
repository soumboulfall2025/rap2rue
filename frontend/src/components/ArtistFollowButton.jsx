import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { apiUrl } from '../utils/api';

/**
 * Bouton d'abonnement artiste avec compteur d'abonnés temps réel
 * Props : artistId, initialFollowers, isFollowed, hideCount (optionnel)
 */
export default function ArtistFollowButton({ artistId, initialFollowers = 0, isFollowed = false, hideCount = false }) {
  const [followers, setFollowers] = useState(initialFollowers);
  const [followed, setFollowed] = useState(isFollowed);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    setFollowers(initialFollowers);
    setFollowed(isFollowed);
  }, [initialFollowers, isFollowed]);

  useEffect(() => {
    const s = io(import.meta.env.VITE_REACT_APP_SOCKET_URL || 'http://localhost:5000');
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!socket || !artistId) return;
    const handleFollow = (data) => {
      if (data.artistId === artistId) setFollowers(data.followers);
    };
    socket.on('artist_follow', handleFollow);
    return () => socket.off('artist_follow', handleFollow);
  }, [socket, artistId]);

  const handleFollow = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(apiUrl(`/api/user/${artistId}/follow`), {}, { headers: { Authorization: 'Bearer ' + token } });
      setFollowed(res.data.followed);
      setFollowers(res.data.followers);
      // L'event temps réel sera émis côté backend
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`px-3 py-1 rounded-full font-bold shadow text-xs transition ${followed ? 'bg-white text-[#1db954]' : 'bg-[#1db954] text-white'}`}
      >
        {followed ? 'Abonné' : 'S’abonner'}
      </button>
      {!hideCount && (
        <span className="text-white/80 text-xs">{followers} abonné{followers > 1 ? 's' : ''}</span>
      )}
    </div>
  );
}
