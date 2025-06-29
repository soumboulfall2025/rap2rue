import { useSelector } from 'react-redux';

export default function Profile() {
  const { user, role, isAuthenticated } = useSelector((state) => state.user);

  if (!isAuthenticated) {
    return <div className="text-center mt-10 text-lg">Veuillez vous connecter pour accéder à votre profil.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-[#18181b] to-[#232323] p-0 animate-fade-in">
      <div className="flex flex-col items-center w-full max-w-md bg-[#232323]/90 rounded-2xl shadow-2xl p-8 border border-white/10">
        {/* Avatar Spotify style */}
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#1db954] to-[#232323] flex items-center justify-center mb-6 shadow-lg border-4 border-accent overflow-hidden">
          <svg className="w-20 h-20 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold mb-2 text-accent text-center tracking-tight">{user?.name}</h2>
        <div className="text-gray-400 text-lg mb-2">{user?.email}</div>
        <div className="mb-6 text-accent font-bold uppercase tracking-wider">{role}</div>
        <div className="flex flex-col gap-3 w-full">
          <button className="w-full py-2 rounded-full bg-accent text-[#18181b] font-bold shadow hover:bg-white transition">
            Modifier le profil
          </button>
          <button className="w-full py-2 rounded-full border border-accent text-accent font-bold shadow hover:bg-accent hover:text-[#18181b] transition">
            Changer le mot de passe
          </button>
        </div>
        {/* Stats utilisateur (à brancher plus tard) */}
        <div className="mt-8 flex flex-row gap-8 justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">0</div>
            <div className="text-xs text-gray-400">Achats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">0</div>
            <div className="text-xs text-gray-400">Musiques uploadées</div>
          </div>
        </div>
      </div>
    </div>
  );
}
