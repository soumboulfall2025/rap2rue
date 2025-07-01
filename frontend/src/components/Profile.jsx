import { useSelector } from 'react-redux';

export default function Profile({ onEditProfile, onChangePassword }) {
  const { user, role, isAuthenticated } = useSelector((state) => state.user);

  if (!isAuthenticated) {
    return <div className="text-center mt-10 text-lg">Veuillez vous connecter pour accéder à votre profil.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-[#18181b] to-[#232323] p-0 animate-fade-in">
      <div className="flex flex-col items-center w-full max-w-md bg-[#232323]/90 rounded-2xl shadow-2xl p-6 border border-white/10 mt-6 mb-6 mx-2">
        {/* Avatar moderne */}
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1db954] to-[#232323] flex items-center justify-center mb-4 shadow-lg border-4 border-accent overflow-hidden">
          <svg className="w-16 h-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold mb-1 text-accent text-center tracking-tight break-words">{user?.name}</h2>
        <div className="text-gray-400 text-base mb-1 break-words">{user?.email}</div>
        <div className="mb-4 text-accent font-bold uppercase tracking-wider text-xs">{role}</div>
        <div className="flex flex-col gap-3 w-full">
          <button className="w-full py-2 rounded-full bg-accent text-[#18181b] font-bold shadow hover:bg-accent transition text-base" onClick={onEditProfile}>
            Modifier le profil
          </button>
          <button className="w-full py-2 rounded-full border border-accent text-accent font-bold shadow hover:bg-accent hover:text-[#18181b] transition text-base" onClick={onChangePassword}>
            Changer le mot de passe
          </button>
        </div>
        {/* Stats utilisateur (mobile friendly) */}
        <div className="mt-6 flex flex-row gap-8 justify-center w-full">
          <div className="text-center flex-1">
            <div className="text-xl font-bold text-accent">0</div>
            <div className="text-xs text-gray-400">Achats</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-xl font-bold text-accent">0</div>
            <div className="text-xs text-gray-400">Musiques uploadées</div>
          </div>
        </div>
      </div>
    </div>
  );
}
