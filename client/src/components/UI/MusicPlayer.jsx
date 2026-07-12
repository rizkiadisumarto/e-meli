import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Play muted first (browsers allow this), then unmute after 1 second
    audio.volume = 0.3;
    audio.muted = true;
    audio.play().then(() => {
      setIsPlaying(true);
      setTimeout(() => {
        audio.muted = false;
        setIsMuted(false);
      }, 1000);
    }).catch(() => {
      // If blocked, try on first user interaction
      const unlock = () => {
        audio.volume = 0.3;
        audio.muted = true;
        audio.play().then(() => {
          setIsPlaying(true);
          setTimeout(() => {
            audio.muted = false;
            setIsMuted(false);
          }, 1000);
        }).catch(() => {});
        document.removeEventListener('click', unlock);
      };
      document.addEventListener('click', unlock, { once: true });
    });

    const handleEnded = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.volume = 0.3;
        audio.muted = false;
        await audio.play();
        setIsPlaying(true);
        setIsMuted(false);
      }
    } catch (err) {
      console.error('Audio play error:', err);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      className="music-player"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
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
      <audio ref={audioRef} src="/indonesia-raya.ogg" preload="auto" loop />

      {showTooltip && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.5rem 0.75rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fade-in 0.2s ease'
        }}>
          Indonesia Raya
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '9999px',
        padding: '0.4rem 0.5rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <button
          onClick={togglePlay}
          title={isPlaying ? 'Pause' : 'Play Indonesia Raya'}
          style={{
            background: isPlaying ? 'var(--primary)' : 'transparent',
            border: 'none',
            color: isPlaying ? '#fff' : 'var(--primary)',
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
            color: 'var(--text-muted)',
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
      </div>
    </div>
  );
};

export default MusicPlayer;
