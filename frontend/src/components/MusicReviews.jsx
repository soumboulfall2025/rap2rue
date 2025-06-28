import React, { useEffect, useState } from "react";

function MusicReviews({ musicId, refresh }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/music/${musicId}/reviews`);
        const data = await res.json();
        if (res.ok) setReviews(data);
      } catch {}
      setLoading(false);
    };
    fetchReviews();
  }, [musicId, refresh]);

  if (loading) return <div className="text-gray-400 text-sm">Chargement des avis...</div>;
  if (!reviews.length) return <div className="text-gray-400 text-sm">Aucun avis pour ce projet.</div>;

  return (
    <div className="mt-4">
      <div className="font-bold mb-2">Avis des fans :</div>
      <div className="space-y-2">
        {reviews.map((r, i) => (
          <div key={i} className="bg-[#232323] rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-accent">{r.user?.name || 'Anonyme'}</span>
              <span className="text-yellow-400">{Array(r.note).fill('⭐').join('')}</span>
            </div>
            <div className="text-gray-200 text-sm">{r.comment}</div>
            <div className="text-xs text-gray-400 mt-1">{new Date(r.date).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MusicReviews;
