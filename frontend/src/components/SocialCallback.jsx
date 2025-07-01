import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../store/userSlice";
import { apiUrl } from "../utils/api";
import ChooseRole from "./ChooseRole";

export default function SocialCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [needRole, setNeedRole] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const errorMsg = params.get("error");
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
      return;
    }
    if (token) {
      localStorage.setItem("token", token);
      // Récupérer le profil utilisateur avec le token
      fetch(apiUrl("/api/auth/me"), {
        headers: { Authorization: "Bearer " + token },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);
            if (!data.user.role || !["fan", "artist"].includes(data.user.role)) {
              setNeedRole(true);
            } else {
              dispatch(login({ user: data.user, role: data.user.role }));
              navigate("/explore");
            }
          } else {
            navigate("/login");
          }
        })
        .catch(() => navigate("/login"));
    } else {
      navigate("/login");
    }
  }, [dispatch, navigate, location]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <div className="bg-red-600/90 text-white rounded-xl px-6 py-4 shadow-lg text-center max-w-md animate-fade-in">
          <div className="text-xl font-bold mb-2">
            Erreur lors de la connexion Google
          </div>
          <div
            className="text-base"
            dangerouslySetInnerHTML={{ __html: error }}
          />
          <button
            className="mt-4 bg-accent text-black px-4 py-2 rounded font-bold"
            onClick={() => navigate("/login")}
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  if (needRole && user) {
    return (
      <ChooseRole
        onRoleSet={(role) => {
          dispatch(login({ user: { ...user, role }, role }));
          navigate("/explore");
        }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
      <div className="text-2xl font-bold mb-4">Connexion en cours...</div>
      <div className="text-gray-400">Merci de patienter.</div>
    </div>
  );
}
