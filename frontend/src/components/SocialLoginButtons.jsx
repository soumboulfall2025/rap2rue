import React from "react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://rap2rue-backend.onrender.com";

export default function SocialLoginButtons() {
  return (
    <div className="flex flex-col gap-2 my-4">
      <a
        href={`${BACKEND_URL}/api/auth/google`}
        className="w-full flex items-center justify-center gap-2 py-2 rounded bg-white text-[#18181b] font-bold border border-gray-300 hover:bg-gray-100 transition"
      >
        <img src="/google.svg" alt="Google" className="w-5 h-5" />
        Se connecter avec Google
      </a>
      <a
        href={`${BACKEND_URL}/api/auth/facebook`}
        className="w-full flex items-center justify-center gap-2 py-2 rounded bg-[#1877f2] text-white font-bold border border-[#1877f2] hover:bg-[#145db2] transition"
      >
        <img src="/facebook.svg" alt="Facebook" className="w-5 h-5" />
        Se connecter avec Facebook
      </a>
    </div>
  );
}
