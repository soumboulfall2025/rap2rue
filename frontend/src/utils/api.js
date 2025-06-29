// Utilitaire pour obtenir l'URL complète de l'API backend
const API_URL = import.meta.env.VITE_API_URL || 'https://rap2rue-backend.onrender.com';

export function apiUrl(path) {
  // Si path commence déjà par http, ne rien faire
  if (/^https?:\/\//.test(path)) return path;
  // Sinon, préfixer par l'URL de l'API
  return API_URL.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path);
}
