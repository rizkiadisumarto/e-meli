import { createContext, useContext, useRef, useState, useEffect } from 'react';

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  const playMusic = () => {
    const audio = audioRef.current;
    if (!audio || started) return;
    setStarted(true);
    audio.muted = true;
    audio.volume = 0;
    audio.play().then(() => {
      let vol = 0;
      const fade = setInterval(() => {
        vol = Math.min(vol + 0.02, 1);
        audio.volume = vol;
        if (vol >= 1) { audio.muted = false; clearInterval(fade); setIsPlaying(true); }
      }, 50);
      setTimeout(() => { audio.muted = false; }, 1000);
    }).catch(() => {});
  };

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

  const changeSpeed = (rate) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  return (
    <MusicContext.Provider value={{ audioRef, isPlaying, isMuted, playbackRate, playMusic, togglePlay, toggleMute, changeSpeed }}>
      <audio ref={audioRef} src="/hari-merdeka-full.mp3" preload="auto" loop />
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}
