import { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

const MusicContext = createContext(null);

const PLAYLIST = [
  { title: 'Song of Victory - Asian Para Games 2018', src: '/Song Of Victory  Official Theme Song Asian Para Games 2018.mp3' },
  { title: 'Song of Victory - Indonesian Version', src: '/Song of Victory (Indonesian Version) - Official Song Asian Para Games 2018.mp3' },
  { title: 'Dance Tonight - BCL feat. Jflow', src: '/Dance Tonight - Bunga Citra Lestari feat. Jflow.mp3' },
  { title: 'Bright As The Sun - Asian Games 2018', src: '/Energy18 - Bright As The Sun - Official Song Asian Games 2018.mp3' },
];

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [started, setStarted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTitle, setCurrentTitle] = useState(PLAYLIST[0].title);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      setCurrentTrack(prev => {
        const next = (prev + 1) % PLAYLIST.length;
        setCurrentTitle(PLAYLIST[next].title);
        return next;
      });
    };
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !started) return;
    const wasPlaying = isPlaying;
    audio.src = PLAYLIST[currentTrack].src;
    audio.load();
    if (wasPlaying) {
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  }, [currentTrack]);

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

  const nextTrack = useCallback(() => {
    setCurrentTrack(prev => (prev + 1) % PLAYLIST.length);
  }, []);

  const prevTrack = useCallback(() => {
    setCurrentTrack(prev => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  }, []);

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
    <MusicContext.Provider value={{ audioRef, isPlaying, isMuted, playbackRate, playMusic, togglePlay, toggleMute, changeSpeed, nextTrack, prevTrack, currentTitle, playlist: PLAYLIST }}>
      <audio ref={audioRef} src={PLAYLIST[0].src} preload="auto" />
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}
