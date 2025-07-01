import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../store/userSlice";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/api";

export default function Register() {
  const [role, setRole] = useState("fan");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur serveur");
      localStorage.setItem("token", data.token);
      dispatch(login({ user: data.user, role: data.user.role }));
      // Redirection vers la connexion après inscription
      navigate("/login");
    } catch (err) {
      setError(err.message);
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
        <h2 className="text-2xl font-bold mb-6 text-center">Inscription</h2>
        <div className="mb-4 flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => setRole("fan")}
            className={`px-4 py-2 rounded border border-accent font-bold transition ${
              role === "fan"
                ? "bg-accent text-[#18181b]"
                : "text-accent"
            }`}
          >
            Fan
          </button>
          <button
            type="button"
            onClick={() => setRole("artist")}
            className={`px-4 py-2 rounded border border-accent font-bold transition ${
              role === "artist"
                ? "bg-accent text-[#18181b]"
                : "text-accent"
            }`}
          >
            Artiste
          </button>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm" htmlFor="name">
            Nom
          </label>
          <input
            id="name"
            type="text"
            className="w-full px-3 py-2 rounded bg-[#18181b] border border-accent text-white focus:outline-none focus:ring-2 focus:ring-accent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-3 py-2 rounded bg-[#18181b] border border-accent text-white focus:outline-none focus:ring-2 focus:ring-accent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-sm" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 rounded bg-[#18181b] border border-accent text-white focus:outline-none focus:ring-2 focus:ring-accent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <div className="text-right mt-1">
            <a
              href="/forgot-password"
              className="text-accent text-xs hover:underline"
            >
              Mot de passe oublié&nbsp;?
            </a>
          </div>
        </div>
        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
        )}
        <button
          type="submit"
          className="w-full py-2 rounded bg-accent text-[#18181b] font-bold hover:bg-[#1ed760cc] transition"
          disabled={loading}
        >
          {loading ? "Inscription..." : "S'inscrire"}
        </button>
      </form>
    </div>
  );
}
