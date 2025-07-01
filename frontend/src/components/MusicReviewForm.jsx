import React, { useState } from "react";
import { useSelector } from "react-redux";
import { apiUrl } from "../utils/api";

function MusicReviewForm({ musicId, onReviewAdded }) {
  const user = useSelector((state) => state.user.user);
  const [note, setNote] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(apiUrl(`/api/music/${musicId}/review`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ note, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Merci pour ton avis !");
        setComment("");
        if (onReviewAdded) onReviewAdded();
      } else {
        setMsg(data.message || "Erreur lors de l'envoi de l'avis.");
      }
    } catch (e) {
      setMsg("Erreur serveur.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-[#18181b] p-4 rounded-xl shadow">
      <div className="mb-2 font-bold">Laisser un avis :</div>
      <div className="flex items-center gap-2 mb-2">
        <label>Note :</label>
        <select value={note} onChange={e => setNote(Number(e.target.value))} className="rounded px-2 py-1">
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
        </select>
      </div>
      <textarea
        className="w-full rounded p-2 mb-2 bg-[#232323] text-white"
        rows={2}
        placeholder="Ton avis..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        required
      />
      <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-accent text-[#18181b] font-bold hover:bg-accent transition">
        {loading ? "Envoi..." : "Envoyer"}
      </button>
      {msg && <div className="mt-2 text-accent font-bold">{msg}</div>}
    </form>
  );
}

export default MusicReviewForm;
