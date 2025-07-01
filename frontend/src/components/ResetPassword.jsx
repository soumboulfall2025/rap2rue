import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/api";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback("");
    if (password.length < 6) {
      setFeedback("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setFeedback("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/auth/reset-password/${token}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur serveur");
      setFeedback("Mot de passe réinitialisé ! Redirection...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <form
        onSubmit={handleSubmit}
        className="bg-[#232323] p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Nouveau mot de passe</h2>
        <div className="mb-4">
          <label className="block mb-1 text-sm" htmlFor="password">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 rounded bg-[#18181b] border border-accent text-white focus:outline-none focus:ring-2 focus:ring-accent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-sm" htmlFor="confirm">
            Confirmer le mot de passe
          </label>
          <input
            id="confirm"
            type="password"
            className="w-full px-3 py-2 rounded bg-[#18181b] border border-accent text-white focus:outline-none focus:ring-2 focus:ring-accent"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        {feedback && (
          <div className="mb-4 text-accent text-sm text-center">{feedback}</div>
        )}
        <button
          type="submit"
          className="w-full py-2 rounded bg-accent text-[#18181b] font-bold hover:bg-[#1ed760cc] transition"
          disabled={loading}
        >
          {loading ? "Envoi..." : "Réinitialiser"}
        </button>
      </form>
    </div>
  );
}
