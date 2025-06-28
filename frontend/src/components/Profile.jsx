import { useSelector } from 'react-redux';

export default function Profile() {
  const { user, role, isAuthenticated } = useSelector((state) => state.user);

  if (!isAuthenticated) {
    return <div className="text-center mt-10 text-lg">Veuillez vous connecter pour accéder à votre profil.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-[#232323] p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Mon profil</h2>
        <div className="mb-4">
          <span className="block text-sm text-gray-400">Nom</span>
          <span className="block text-lg font-semibold">{user?.name}</span>
        </div>
        <div className="mb-4">
          <span className="block text-sm text-gray-400">Email</span>
          <span className="block text-lg font-semibold">{user?.email}</span>
        </div>
        <div className="mb-6">
          <span className="block text-sm text-gray-400">Rôle</span>
          <span className="block text-lg font-semibold capitalize">{role}</span>
        </div>
        {/* Pour la suite : bouton modifier, upload avatar, etc. */}
      </div>
    </div>
  );
}
