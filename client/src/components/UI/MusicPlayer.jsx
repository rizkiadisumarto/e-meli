import { useState } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

const MusicPlayer = () => {
  const { isPlaying, isMuted, playbackRate, togglePlay, toggleMute, changeSpeed } = useMusic();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);

  return (
    <div
      className="music-player"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => { setShowTooltip(false); setShowSpeed(false); }}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
    >
      {showTooltip && (
        <div style={{
          background: 'var(--bg-card, #fff)',
          border: '1px solid var(--border-color, #e5e5e5)',
          borderRadius: '8px',
          padding: '0.5rem 0.75rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted, #737373)',
          whiteSpace: 'nowrap',
          boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1))',
          animation: 'fade-in 0.2s ease'
        }}>
          Hari Merdeka
        </div>
      )}

      {showSpeed && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'var(--glass-bg, rgba(255,255,255,0.9))',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--glass-border, #e5e5e5)',
          borderRadius: '8px',
          padding: '0.375rem 0.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          {[0.5, 1, 1.5, 2].map(rate => (
            <button key={rate} onClick={() => changeSpeed(rate)}
              style={{ fontSize: '0.6rem', padding: '0.15rem 0.375rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontWeight: 600, backgroundColor: playbackRate === rate ? '#dc2626' : 'transparent', color: playbackRate === rate ? '#fff' : 'var(--text-muted, #737373)' }}>
              {rate}x
            </button>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        background: 'var(--glass-bg, rgba(255,255,255,0.9))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border, #e5e5e5)',
        borderRadius: '9999px',
        padding: '0.4rem 0.5rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <button
          onClick={togglePlay}
          title={isPlaying ? 'Pause' : 'Play Hari Merdeka'}
          style={{
            background: isPlaying ? '#dc2626' : 'transparent',
            border: 'none',
            color: isPlaying ? '#fff' : '#dc2626',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
        </button>

        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted, #737373)',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        <button
          onClick={() => setShowSpeed(!showSpeed)}
          title="Playback Speed"
          style={{
            background: showSpeed ? '#dc2626' : 'transparent',
            border: 'none',
            color: showSpeed ? '#fff' : 'var(--text-muted, #737373)',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.6rem',
            fontWeight: 700,
            transition: 'all 0.2s ease'
          }}
        >
          {playbackRate}x
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;
