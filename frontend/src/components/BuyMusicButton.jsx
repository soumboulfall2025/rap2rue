import React, { useState } from "react";
import { useSelector } from "react-redux";
import { apiUrl } from "../utils/api";

function BuyMusicButton({ music }) {
  const user = useSelector((state) => state.user.user);
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
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
        alert(data.message || "Erreur lors de la création du paiement.");
      }
    } catch (e) {
      alert("Erreur serveur.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="px-6 py-2 rounded bg-accent text-[#18181b] font-bold hover:bg-white transition"
    >
      {loading ? "Redirection..." : "Acheter"}
    </button>
  );
}

export default BuyMusicButton;