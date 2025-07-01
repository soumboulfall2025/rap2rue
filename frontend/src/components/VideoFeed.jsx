import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import axios from 'axios';
import VideoSocialActions from './VideoSocialActions';

const API_URL = import.meta.env.VITE_API_URL || 'https://rap2rue-backend.onrender.com/api/video';

export default function VideoFeed() {
  const [videos, setVideos] = useState([]);
  const [current, setCurrent] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    axios.get(API_URL + `?page=${page}&limit=10`)
      .then(res => {
        if (page === 1) setVideos(res.data);
        else setVideos(v => [...v, ...res.data]);
        if (res.data.length < 10) setHasMore(false);
      })
      .catch(() => setVideos([]));
  }, [page]);

  // Gestion du scroll pour effet TikTok + pagination
  useEffect(() => {
    const handleScroll = (e) => {
      if (e.deltaY > 0 && current < videos.length - 1) setCurrent(c => c + 1);
      else if (e.deltaY > 0 && current === videos.length - 1 && hasMore) setPage(p => p + 1);
      if (e.deltaY < 0 && current > 0) setCurrent(c => c - 1);
    };
    window.addEventListener('wheel', handleScroll);
    return () => window.removeEventListener('wheel', handleScroll);
  }, [current, videos.length, hasMore]);

  // Gestion du swipe mobile pour effet TikTok + pagination
  useEffect(() => {
    let touchStartY = null;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e) => {
      if (touchStartY === null) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      if (diff > 50 && current < videos.length - 1) setCurrent(c => c + 1);
      else if (diff > 50 && current === videos.length - 1 && hasMore) setPage(p => p + 1);
      if (diff < -50 && current > 0) setCurrent(c => c - 1);
      touchStartY = null;
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [current, videos.length, hasMore]);

  if (!videos.length) return <div className="flex justify-center items-center h-screen">Aucune vidéo</div>;

  const video = videos[current];

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white relative">
      <ReactPlayer
        url={video.url}
        playing
        controls={false}
        width="100vw"
        height="100vh"
        style={{ objectFit: 'cover' }}
      />
      <div className="absolute bottom-10 left-5">
        <div className="font-bold text-lg">{video.title}</div>
        <div className="text-sm opacity-80">par {video.artist?.name}</div>
        <div className="text-xs mt-2 max-w-xs line-clamp-2">{video.description}</div>
        <VideoSocialActions videoId={video._id} />
      </div>
      <div className="absolute top-5 right-5 text-lg">{current + 1} / {videos.length}</div>
      {!hasMore && current === videos.length - 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-gray-400 text-sm">Fin du feed</div>
      )}
    </div>
  );
}
