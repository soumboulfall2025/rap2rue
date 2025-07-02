import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../utils/api';
import Profile from './Profile';

export default function ArtistProfilePage() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get(apiUrl(`/api/user/${id}`))
      .then(res => setArtist(res.data.user))
      .catch(() => setError("Artiste introuvable"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center mt-10">Chargement…</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!artist) return null;

  return <Profile profileUser={artist} />;
}
