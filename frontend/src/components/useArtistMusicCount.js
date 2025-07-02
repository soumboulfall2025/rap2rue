import { useEffect, useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../utils/api';

// Hook pour récupérer dynamiquement le nombre de musiques uploadées par un artiste
export default function useArtistMusicCount(artistId) {
  const [musicCount, setMusicCount] = useState(0);

  useEffect(() => {
    if (!artistId) return;
    let isMounted = true;
    axios.get(apiUrl(`/api/music?artist=${artistId}`))
      .then(res => {
        if (isMounted) setMusicCount(Array.isArray(res.data) ? res.data.length : 0);
      })
      .catch(() => isMounted && setMusicCount(0));
    return () => { isMounted = false; };
  }, [artistId]);

  return musicCount;
}
