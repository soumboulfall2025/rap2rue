import React from 'react';
import ReactPlayer from 'react-player';

export default function TestPlayer() {
  return (
    <div style={{ background: 'black', height: 400 }}>
      <ReactPlayer
        url="https://res.cloudinary.com/dtfcsz1km/video/upload/v1751413884/bgayxdcjkrbtallowu0c.mp4"
        playing
        controls
        width="100%"
        height="100%"
        muted
      />
    </div>
  );
}
