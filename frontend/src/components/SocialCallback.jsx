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
