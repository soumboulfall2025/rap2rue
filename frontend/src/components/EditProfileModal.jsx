import { useState } from 'react';

export default function EditProfileModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [preview, setPreview] = useState(user?.avatar || '');

  // Gestion de l'upload d'avatar (base64)
  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60">
      <div className="bg-[#232323] rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-2 animate-fade-in flex flex-col items-center">
        <h2 className="text-xl font-bold text-accent mb-4">Modifier le profil</h2>
        <div className="flex flex-col items-center mb-4 w-full">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-[#18181b] border-2 border-accent flex items-center justify-center overflow-hidden mb-2">
              {preview ? (
                <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <span className="text-xs text-accent underline">Changer l'avatar</span>
          </label>
        </div>
        <input
          className="w-full mb-3 px-4 py-2 rounded bg-[#18181b] text-white border border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          type="text"
          placeholder="Nom"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="w-full mb-3 px-4 py-2 rounded bg-[#18181b] text-white border border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <div className="flex gap-3 mt-4 w-full">
          <button
            className="flex-1 py-2 rounded-full bg-accent text-[#18181b] font-bold shadow hover:bg-accent transition"
            onClick={() => onSave({ name, email, avatar })}
          >
            Enregistrer
          </button>
          <button
            className="flex-1 py-2 rounded-full border border-accent text-accent font-bold shadow hover:bg-accent hover:text-[#18181b] transition"
            onClick={onClose}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
