import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';

export default function UserStatus() {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span>Bonjour, <b>{user?.name || 'Utilisateur'}</b></span>
      <button
        className="px-2 py-1 border border-accent rounded text-accent hover:bg-accent hover:text-[#18181b] transition"
        title="Déconnexion"
        onClick={() => dispatch(logout())}
      >
        Déconnexion
      </button>
    </div>
  );
}
