import React, { useState } from "react";
import { useSelector } from "react-redux";
import { apiUrl } from "../utils/api";
import { useOutletContext } from 'react-router-dom';

function BuyMusicButton({ music }) {
  const user = useSelector((state) => state.user.user);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [_, setGlobalLoading] = useOutletContext?.() || [null, null];

  const handleBuy = async () => {
    setLoading(true);
    setFeedback("");
    if (setGlobalLoading) setGlobalLoading(true);
    try {
      const res = await fetch(apiUrl("/api/payment/paydunya"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({
          items: [
            {
              musicId: music._id,
              name: music.title,
              price: music.price,
              quantity: 1,
              description: music.description,
            },
          ],
          amount: music.price,
          address: user.address || "",
        }),
      });
      const data = await res.json();
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl; // Redirection PayDunya
      } else {
        setFeedback((data.message || "Erreur lors de la création du paiement.") + (data.error ? `\n${data.error}` : ""));
      }
    } catch (e) {
      setFeedback("Erreur serveur.");
    }
    setLoading(false);
    if (setGlobalLoading) setGlobalLoading(false);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="px-6 py-2 rounded bg-accent text-[#18181b] font-bold hover:bg-accent transition"
      >
        {loading ? "Redirection..." : "Acheter"}
      </button>
      {feedback && (
        <div className="mt-2 text-sm text-center text-red-500 bg-[#232323] rounded px-2 py-1 w-full max-w-xs">{feedback}</div>
      )}
    </div>
  );
}

export default BuyMusicButton;