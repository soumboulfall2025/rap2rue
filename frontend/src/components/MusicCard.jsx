import React, { useRef, useState, useEffect } from 'react';
import BuyMusicButton from './BuyMusicButton';

/**
 * Card musique façon Spotify
 * Props : music { cover, title, artist, onPlay, onLike, liked, isBought, audioUrl, _id }
 */
export default function MusicCard({ music, onPlay, onLike, liked, onPause, isActive, price, description }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const previewLimit = 30; // 30 secondes max si non acheté

  useEffect(() => {
    function handleTimeUpdate() {
      if (window._audio && window._audio.src === music.audioUrl && isActive) {
        setCurrentTime(window._audio.currentTime);
        setDuration(window._audio.duration || 0);
        if (!music.isBought && window._audio.currentTime >= previewLimit) {
          window._audio.pause();
          window._audio.currentTime = 0;
        }
      }
    }
    if (isActive && window._audio) {
      window._audio.addEventListener('timeupdate', handleTimeUpdate);
      // Mise à jour initiale
      setCurrentTime(window._audio.currentTime);
      setDuration(window._audio.duration || 0);
    }
    return () => {
      if (window._audio) {
        window._audio.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [isActive, music.audioUrl, music.isBought]);

  const formatTime = s => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // Seul l'admin peut écouter l'intégralité, tous les autres (fans/artistes) sont limités à 30s
  const isAdmin = music.userRole === 'admin';

  return (
    <div className={`bg-[#181818] rounded-xl shadow-lg p-4 flex flex-col items-center w-full max-w-xs mx-auto hover:scale-105 transition-transform duration-200 ${isActive ? 'ring-4 ring-[#1ed760]' : ''}`}>
      <div className="w-28 h-28 mb-3 rounded-xl overflow-hidden shadow-md">
        <img
          src={music.cover || '/default-cover.png'}
          alt={music.title}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="text-white text-center w-full">
        <div className="font-bold text-lg truncate" title={music.title}>{music.title}</div>
        <div className="text-gray-400 text-sm truncate" title={music.artist}>{music.artist}</div>
        {price && <div className="text-accent font-semibold mt-1">{price} F CFA</div>}
        {description && <div className="text-xs text-gray-400 mt-1 line-clamp-2">{description}</div>}
      </div>
      <div className="flex gap-3 mt-3 justify-center w-full flex-wrap">
        {/* Si la musique n'est pas achetée, afficher le bouton Acheter */}
        {music._id && (!music.isBought) && (
          <BuyMusicButton music={music} />
        )}
        <button
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 shadow-md focus:outline-none"
          onClick={onPlay}
          title={music.isBought ? 'Écouter' : 'Écouter un extrait (30s)'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5v14l11-7z" fill="white" />
          </svg>
        </button>
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-md focus:outline-none"
          onClick={onPause}
          title="Pause"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
            <rect x="6" y="5" width="4" height="14" fill="white" />
            <rect x="14" y="5" width="4" height="14" fill="white" />
          </svg>
        </button>
        <button
          className={`rounded-full p-2 shadow-md focus:outline-none ${liked ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-300'}`}
          onClick={onLike}
          title={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.015-4.5-4.5-4.5-1.74 0-3.223 1.01-4 2.475C11.223 4.76 9.74 3.75 8 3.75 5.515 3.75 3.5 5.765 3.5 8.25c0 7.22 8.25 11.25 8.25 11.25s8.25-4.03 8.25-11.25z" />
          </svg>
        </button>
      </div>
      <div className="w-full mt-2 flex flex-col items-center">
        <input
          type="range"
          min={0}
          max={isAdmin ? (duration || 1) : previewLimit}
          value={currentTime}
          onChange={e => {
            let val = Number(e.target.value);
            // Empêche le seek au-delà de 30s si non admin
            if (!isAdmin && val > previewLimit) val = previewLimit;
            if (window._audio && window._audio.src === music.audioUrl && isActive) {
              window._audio.currentTime = val;
              setCurrentTime(val);
              // Si on tente de seek au-delà de 30s, on stoppe
              if (!isAdmin && val >= previewLimit) {
                window._audio.pause();
                window._audio.currentTime = 0;
              }
            }
          }}
          className="w-full accent-green-500"
        />
        <div className="flex justify-between w-full text-xs text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(isAdmin ? duration : previewLimit)}</span>
        </div>
        {!isAdmin && (
          <div className="text-xs text-yellow-400 mt-1 text-center w-full">
            Pré-écoute limitée à 30 secondes. Seul l'administrateur peut écouter l'intégralité.
          </div>
        )}
      </div>
    </div>
  );
}
