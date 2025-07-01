import { useState } from 'react';

export default function ChangePasswordModal({ onClose, onSave }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setError('');
    onSave({ currentPassword, newPassword });
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60">
      <div className="bg-[#232323] rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-2 animate-fade-in flex flex-col items-center">
        <h2 className="text-xl font-bold text-accent mb-4">Changer le mot de passe</h2>
        <input
          className="w-full mb-3 px-4 py-2 rounded bg-[#18181b] text-white border border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          type="password"
          placeholder="Mot de passe actuel"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
        />
        <input
          className="w-full mb-3 px-4 py-2 rounded bg-[#18181b] text-white border border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
        <input
          className="w-full mb-3 px-4 py-2 rounded bg-[#18181b] text-white border border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          type="password"
          placeholder="Confirmer le nouveau mot de passe"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex gap-3 mt-4 w-full">
          <button
            className="flex-1 py-2 rounded-full bg-accent text-[#18181b] font-bold shadow hover:bg-accent transition"
            onClick={handleSave}
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
