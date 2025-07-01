import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../store/userSlice";
import { apiUrl } from "../utils/api";

export default function SocialCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      // Récupérer le profil utilisateur avec le token
      fetch(apiUrl("/api/auth/me"), {
        headers: { Authorization: "Bearer " + token },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.user) {
            dispatch(login({ user: data.user, role: data.user.role }));
            navigate("/explore");
          } else {
            navigate("/login");
          }
        })
        .catch(() => navigate("/login"));
    } else {
      navigate("/login");
    }
  }, [dispatch, navigate, location]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
      <div className="text-2xl font-bold mb-4">Connexion en cours...</div>
      <div className="text-gray-400">Merci de patienter.</div>
    </div>
  );
}
