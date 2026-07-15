import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Flag, Calendar, Heart, Volume2, Sun, Moon, X, Shield, Crown, PenLine, Users
} from "lucide-react";

// ==================== WELCOME POPUP (sekali per sesi) ====================
function WelcomePopup({ onClose }) {
  const [show, setShow] = useState(true);

  const handleClose = () => {
    setShow(false);
    if (onClose) onClose();
  };

  if (!show) return null;

  return (
    <div onClick={handleClose} style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: "var(--sd-bg-card, #fff)", border: "1px solid var(--sd-border, #e5e5e5)", borderRadius: "1rem", padding: "1.5rem", maxWidth: "22rem", width: "90%", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
        <button onClick={handleClose} style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "none", border: "none", cursor: "pointer", color: "var(--sd-text-muted, #737373)" }}>
          <X style={{ width: "1.25rem", height: "1.25rem" }} />
        </button>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🇮🇩</div>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--sd-text, #262626)", marginBottom: "0.375rem", lineHeight: 1.4 }}>
          Negeri Indonesia bak Surgawi
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#dc2626", fontWeight: 600, marginBottom: "1rem" }}>
          Gemah Ripah Loh Jinawi
        </p>
        <button onClick={handleClose} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.5rem 2rem", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
          MERDEKA!
        </button>
      </motion.div>
    </div>
  );
}

// ==================== DARK MODE HOOK ====================
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("semarak_dark_mode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("semarak_dark_mode", dark);
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (localStorage.getItem("semarak_dark_mode") === null) setDark(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return [dark, setDark];
}

// ==================== COUNTDOWN ====================
function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });

  useEffect(() => {
    const targetDate = new Date("August 17, 2026 00:00:00").getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = targetDate - now;
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true }); clearInterval(interval); }
      else setTimeLeft({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000), isOver: false });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const blocks = [
    { label: "Hari", value: timeLeft.days, red: true },
    { label: "Jam", value: timeLeft.hours, red: true },
    { label: "Menit", value: timeLeft.minutes, red: false },
    { label: "Detik", value: timeLeft.seconds, red: false, isSec: true },
  ];

  return (
    <div style={{ width: "100%", maxWidth: "56rem", margin: "0 auto", padding: "1.25rem 1rem" }}>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ position: "relative", overflow: "hidden", borderRadius: "1rem", backgroundColor: "var(--sd-bg-card, #fff)", border: "1px solid var(--sd-border, #fee2e2)", padding: "1rem", textAlign: "center", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "5rem", height: "5rem", backgroundColor: "rgba(239,68,68,0.05)", borderRadius: "0 0 100% 0", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: "5rem", height: "5rem", backgroundColor: "rgba(239,68,68,0.05)", borderRadius: "100% 0 0 0", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.25rem 0.625rem", borderRadius: "9999px", backgroundColor: "var(--sd-badge-bg, #fef2f2)", border: "1px solid var(--sd-badge-border, #fecaca)", color: "var(--sd-badge-text, #b91c1c)", fontSize: "0.7rem", fontWeight: 500, marginBottom: "0.75rem" }}>
          <Calendar style={{ width: "0.875rem", height: "0.875rem", color: "#dc2626", animation: "pulse 2s infinite", flexShrink: 0 }} />
          <span>Menuju HUT RI Ke-81 — 17 Agustus 2026</span>
        </div>
        <h2 style={{ fontSize: "clamp(1.125rem, 4vw, 2.25rem)", fontWeight: 900, color: "var(--sd-text, #262626)", letterSpacing: "-0.025em", textTransform: "uppercase", marginBottom: "0.375rem" }}>
          Hitung Mundur <span style={{ color: "#dc2626" }}>Hari Merdeka</span>
        </h2>
        <p style={{ color: "var(--sd-text-muted, #737373)", fontSize: "clamp(0.7rem, 2vw, 0.875rem)", maxWidth: "32rem", margin: "0 auto 1.25rem", padding: "0 0.5rem" }}>
          Mari bersiap menyambut kemeriahan pesta rakyat terbesar dengan semangat gotong royong dan persatuan Indonesia!
        </p>
        {timeLeft.isOver ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ padding: "1rem 1.5rem", backgroundColor: "#dc2626", color: "#fff", borderRadius: "0.75rem", display: "inline-block" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.25rem" }}>DIRGAHAYU REPUBLIK INDONESIA!</h3>
            <p style={{ fontSize: "0.875rem", opacity: 0.9 }}>Hari Merdeka Telah Tiba! Sekali Merdeka, Tetap Merdeka!</p>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", maxWidth: "28rem", margin: "0 auto" }}>
            {blocks.map((b, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <motion.div key={b.value} initial={{ rotateX: -90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 10 }}
                  style={{ width: "100%", aspectRatio: "1/1", borderRadius: "0.75rem", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", position: "relative", overflow: "hidden", background: b.red ? "linear-gradient(to bottom right, #dc2626, #ef4444)" : "linear-gradient(to bottom right, var(--sd-bg-card, #fff), var(--sd-bg-secondary, #fafafa))", color: b.red ? "#fff" : "var(--sd-text, #262626)", border: `1px solid ${b.red ? "#b91c1c" : "var(--sd-border-light, #e5e5e5)"}` }}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "1px", backgroundColor: "rgba(0,0,0,0.1)", pointerEvents: "none" }} />
                  <span style={{ fontSize: "clamp(1.125rem, 4vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.05em", color: b.isSec ? "#ef4444" : undefined }}>
                    {String(b.value).padStart(2, "0")}
                  </span>
                </motion.div>
                <span style={{ fontSize: "clamp(0.5rem, 1.5vw, 0.75rem)", fontWeight: 600, letterSpacing: "0.05em", color: "var(--sd-text-muted, #737373)", textTransform: "uppercase", marginTop: "0.375rem" }}>{b.label}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--sd-border-light, #fef2f2)", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "1rem", fontSize: "0.75rem", fontWeight: 500, color: "var(--sd-text-muted, #737373)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}><Heart style={{ width: "0.875rem", height: "0.875rem", color: "#f43f5e" }} /><span>Pesan Damai & Harapan</span></div>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== TEKS PROKLAMASI ====================
function TeksProklamasi() {
  return (
    <div style={{ width: "100%", maxWidth: "48rem", margin: "0 auto", padding: "0 clamp(0.75rem, 3vw, 1.25rem)" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
        style={{ background: "var(--sd-bg-card, #fff)", borderRadius: "clamp(0.75rem, 2vw, 1.25rem)", border: "1px solid var(--sd-border, #e5e5e5)", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", overflow: "hidden" }}>

        <div style={{ background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)", padding: "clamp(1rem, 3vw, 1.5rem) clamp(1rem, 3vw, 2rem)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-2rem", right: "-2rem", width: "6rem", height: "6rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)" }} />
          <div style={{ position: "absolute", bottom: "-1rem", left: "-1rem", width: "4rem", height: "4rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)" }} />
          <div style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "0.5rem" }}>&#127470;&#127465;</div>
          <h2 style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Teks Proklamasi</h2>
          <p style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)", color: "rgba(255,255,255,0.8)", marginTop: "0.25rem" }}>17 Agustus 1945</p>
        </div>

        <div style={{ padding: "clamp(1rem, 3vw, 2rem)" }}>
          <div style={{ backgroundColor: "var(--sd-bg-secondary, #fefce8)", border: "1px solid var(--sd-border, #fef3c7)", borderRadius: "0.75rem", padding: "clamp(1rem, 3vw, 1.5rem)", marginBottom: "1.25rem", position: "relative" }}>
            <div style={{ position: "absolute", top: "0.5rem", left: "0.5rem", width: "1.5rem", height: "1.5rem", borderTop: "2px solid #d97706", borderLeft: "2px solid #d97706", opacity: 0.5 }} />
            <div style={{ position: "absolute", bottom: "0.5rem", right: "0.5rem", width: "1.5rem", height: "1.5rem", borderBottom: "2px solid #d97706", borderRight: "2px solid #d97706", opacity: 0.5 }} />
            <p style={{ fontSize: "clamp(0.85rem, 2.5vw, 1.1rem)", lineHeight: 1.8, color: "var(--sd-text, #44403c)", fontStyle: "italic", textAlign: "justify", margin: 0, padding: "0.5rem" }}>
              Kami bangsa Indonesia dengan ini menjatakan kemerdekaan Indonesia.
            </p>
            <p style={{ fontSize: "clamp(0.85rem, 2.5vw, 1.1rem)", lineHeight: 1.8, color: "var(--sd-text, #44403c)", fontStyle: "italic", textAlign: "justify", margin: "1rem 0 0", padding: "0.5rem" }}>
              Hal-hal jang mengenai pemindahan kekoeasaan d.l.l., diselenggarakan dengan tjara saksama dan dalam tempo sesingkat-singkatnya.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "clamp(1.5rem, 5vw, 3rem)", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center", minWidth: "8rem" }}>
              <p style={{ fontSize: "clamp(0.65rem, 1.5vw, 0.75rem)", color: "var(--sd-text-muted, #737373)", marginBottom: "0.5rem" }}>Jakarta, 17 Agustus 1945</p>
              <div style={{ width: "100%", maxWidth: "10rem", height: "1px", backgroundColor: "var(--sd-border, #d4d4d4)", margin: "0 auto 0.5rem" }} />
              <p style={{ fontSize: "clamp(0.75rem, 2vw, 0.9rem)", fontWeight: 700, color: "var(--sd-text, #262626)", margin: 0 }}>Atas nama bangsa Indonesia,</p>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "clamp(1.5rem, 5vw, 3rem)", marginTop: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center", minWidth: "8rem" }}>
              <p style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)", fontWeight: 900, color: "var(--sd-text, #262626)", margin: 0, letterSpacing: "0.02em" }}>SOEKARNO</p>
              <div style={{ width: "100%", height: "1px", backgroundColor: "var(--sd-border, #d4d4d4)", margin: "0.375rem 0" }} />
              <p style={{ fontSize: "clamp(0.6rem, 1.3vw, 0.7rem)", color: "var(--sd-text-muted, #737373)", margin: 0 }}>Presiden</p>
            </div>
            <div style={{ textAlign: "center", minWidth: "8rem" }}>
              <p style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)", fontWeight: 900, color: "var(--sd-text, #262626)", margin: 0, letterSpacing: "0.02em" }}>MOH. HATTA</p>
              <div style={{ width: "100%", height: "1px", backgroundColor: "var(--sd-border, #d4d4d4)", margin: "0.375rem 0" }} />
              <p style={{ fontSize: "clamp(0.6rem, 1.3vw, 0.7rem)", color: "var(--sd-text-muted, #737373)", margin: 0 }}>Wakil Presiden</p>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem", padding: "clamp(0.75rem, 2vw, 1rem)", backgroundColor: "var(--sd-badge-bg, #f0fdf4)", border: "1px solid var(--sd-border, #bbf7d0)", borderRadius: "0.75rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.25rem", lineHeight: 1, flexShrink: 0 }}>&#128220;</span>
            <div>
              <p style={{ fontSize: "clamp(0.65rem, 1.5vw, 0.8rem)", fontWeight: 700, color: "var(--sd-text, #262626)", margin: "0 0 0.25rem" }}>Sejarah Proklamasi</p>
              <p style={{ fontSize: "clamp(0.6rem, 1.3vw, 0.7rem)", color: "var(--sd-text-muted, #737373)", margin: 0, lineHeight: 1.6 }}>
                Teks proklamasi ini ditulis oleh Soekarno dan Mohammad Hatta atas nama bangsa Indonesia.
                Dibacakan pada pukul 10.00 pagi di Jalan Pegangsaan Timur No. 56, Jakarta.
                Peristiwa bersejarah ini menandai dimulainya kehidupan bangsa Indonesia yang merdeka dan berdaulat.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== MUSIC PLAYER ====================
function MusicPlayer({ startTrigger }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [started, setStarted] = useState(false);
  const audioRef = useRef(null);

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

  useEffect(() => {
    if (startTrigger) playMusic();
  }, [startTrigger]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.muted = false; audio.volume = 1; audio.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  return (
    <div style={{ position: "fixed", bottom: "1rem", right: "1rem", zIndex: 50 }}>
      <audio ref={audioRef} src="/hari-merdeka.mp3" loop />
      {isExpanded && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ backgroundColor: "var(--sd-bg-card, #fff)", borderRadius: "0.75rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: "1px solid var(--sd-border, #e5e5e5)", padding: "0.75rem", marginBottom: "0.5rem", maxWidth: "12rem" }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--sd-text, #262626)", marginBottom: "0.125rem" }}>Hari Merdeka</p>
          <p style={{ fontSize: "0.55rem", color: "var(--sd-text-muted, #737373)", marginBottom: "0.5rem" }}>Cipt. H. Mutahar</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button onClick={togglePlay} style={{ width: "2rem", height: "2rem", backgroundColor: "#dc2626", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none" }}>
              {isPlaying
                ? <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                : <svg style={{ width: "1rem", height: "1rem", marginLeft: "2px" }} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ width: "100%", backgroundColor: "var(--sd-bg-secondary, #e5e5e5)", height: "0.375rem", borderRadius: "9999px", overflow: "hidden" }}>
                <div style={{ height: "100%", backgroundColor: "#ef4444", borderRadius: "9999px", width: isPlaying ? "60%" : "0%", transition: "width 0.3s", animation: isPlaying ? "pulse 2s infinite" : undefined }} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
      <button onClick={() => setIsExpanded(!isExpanded)}
        style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none", background: isPlaying ? "#dc2626" : "linear-gradient(to bottom right, #dc2626, #ef4444)", animation: isPlaying ? "pulse 2s infinite" : undefined }}>
        <Volume2 style={{ width: "1.25rem", height: "1.25rem", color: "#fff" }} />
      </button>
    </div>
  );
}

// ==================== HALL OF FAME ====================
function HallOfFame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const photos = Array.from({ length: 65 }, (_, i) => `/hall-of-fame/photo-${String(i + 1).padStart(3, '0')}.jpeg`);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
        setIsTransitioning(false);
      }, 1500);
    }, 5000);
    return () => clearInterval(interval);
  }, [photos.length]);

  return (
    <div style={{ width: "100%", maxWidth: "56rem", margin: "0 auto", padding: "0 clamp(0.75rem, 3vw, 1.25rem)" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
        style={{ background: "var(--sd-bg-card, #fff)", borderRadius: "clamp(0.75rem, 2vw, 1.25rem)", border: "1px solid var(--sd-border, #e5e5e5)", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", overflow: "hidden" }}>

        <div style={{ background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)", padding: "clamp(1rem, 3vw, 1.5rem) clamp(1rem, 3vw, 2rem)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-2rem", right: "-2rem", width: "6rem", height: "6rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)" }} />
          <div style={{ position: "absolute", bottom: "-1rem", left: "-1rem", width: "4rem", height: "4rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)" }} />
          <div style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "0.5rem" }}>&#127942;</div>
          <h2 style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Hall of Fame</h2>
          <p style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)", color: "rgba(255,255,255,0.8)", marginTop: "0.25rem" }}>HUT RI Ke-80 — 17 Agustus 2025</p>
        </div>

        <div style={{ padding: "clamp(1rem, 3vw, 2rem)" }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "0.75rem", overflow: "hidden", backgroundColor: "var(--sd-bg-secondary, #f5f5f5)" }}>
            <img
              src={photos[currentIndex]}
              alt={`Hall of Fame ${currentIndex + 1}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: isTransitioning ? 0 : 1,
                transition: "opacity 1.5s ease-in-out",
              }}
            />
            <div style={{ position: "absolute", bottom: "1rem", left: "50%", transform: "translateX(-50%)", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", padding: "0.375rem 0.75rem", borderRadius: "9999px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "#fff", fontSize: "0.7rem", fontWeight: 600 }}>{currentIndex + 1} / {photos.length}</span>
          </div>
          </div>

          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <p style={{ fontSize: "clamp(0.65rem, 1.5vw, 0.8rem)", color: "var(--sd-text-muted, #737373)", fontStyle: "italic" }}>
              Momen-momen indah perayaan HUT RI Ke-80 bersama warga Melimewah
            </p>
          </div>

          {/* Susunan Panitia Inti */}
          <div style={{ marginTop: "1.5rem", padding: "clamp(1rem, 3vw, 1.5rem)", backgroundColor: "var(--sd-bg-secondary, #fafafa)", borderRadius: "0.75rem", border: "1px solid var(--sd-border, #e5e5e5)" }}>
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <span style={{ display: "inline-block", backgroundColor: "#dc2626", color: "#fff", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.25rem 0.75rem", borderRadius: "9999px", marginBottom: "0.5rem" }}>Panitia Inti</span>
              <h3 style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", fontWeight: 800, color: "var(--sd-text, #262626)", margin: "0.5rem 0 0" }}>Susunan Pengurus HUT RI Ke-80 Tahun 2025</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", backgroundColor: "var(--sd-bg-card, #fff)", borderRadius: "0.5rem", border: "1px solid var(--sd-border, #e5e5e5)" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "linear-gradient(135deg, #dc2626, #b91c1c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><Shield size={18} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "var(--sd-text-muted, #737373)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pembina</div>
                  <div style={{ fontSize: "clamp(0.8rem, 2vw, 0.95rem)", fontWeight: 700, color: "var(--sd-text, #262626)" }}>Bapak Hairul</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", backgroundColor: "var(--sd-bg-card, #fff)", borderRadius: "0.5rem", border: "1px solid var(--sd-border, #e5e5e5)" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "linear-gradient(135deg, #d97706, #b45309)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><Crown size={18} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "var(--sd-text-muted, #737373)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ketua Panitia</div>
                  <div style={{ fontSize: "clamp(0.8rem, 2vw, 0.95rem)", fontWeight: 700, color: "var(--sd-text, #262626)" }}>Bapak Arief</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", backgroundColor: "var(--sd-bg-card, #fff)", borderRadius: "0.5rem", border: "1px solid var(--sd-border, #e5e5e5)" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "linear-gradient(135deg, #059669, #047857)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><PenLine size={18} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "var(--sd-text-muted, #737373)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sekretaris</div>
                  <div style={{ fontSize: "clamp(0.8rem, 2vw, 0.95rem)", fontWeight: 700, color: "var(--sd-text, #262626)" }}>Bapak Yusuf</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", backgroundColor: "var(--sd-bg-card, #fff)", borderRadius: "0.5rem", border: "1px solid var(--sd-border, #e5e5e5)" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><Users size={18} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "var(--sd-text-muted, #737373)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Anggota</div>
                  <div style={{ fontSize: "clamp(0.8rem, 2vw, 0.95rem)", fontWeight: 700, color: "var(--sd-text, #262626)" }}>Seluruh Warga GG. Melimewah</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== MAIN PAGE ====================
export default function SemarakPage() {
  const [dark, setDark] = useDarkMode();
  const [musicStarted, setMusicStarted] = useState(false);

  const vars = dark ? {
    "--sd-bg": "#0a0a0a", "--sd-bg-card": "#171717", "--sd-bg-secondary": "#262626",
    "--sd-text": "#f5f5f5", "--sd-text-muted": "#a3a3a3",
    "--sd-border": "#262626", "--sd-border-light": "#404040",
    "--sd-badge-bg": "rgba(23,23,23,0.5)", "--sd-badge-border": "rgba(127,29,29,0.3)", "--sd-badge-text": "#f87171",
    "--sd-sky-bg": "rgba(8,47,73,0.3)", "--sd-sky-border": "rgba(12,69,110,0.5)",
    "--sd-amber-bg": "rgba(46,27,7,0.2)", "--sd-amber-border": "rgba(120,53,15,0.3)", "--sd-amber-text": "#fcd34d",
    "--sd-red-bg": "rgba(127,29,29,0.3)", "--sd-red-border": "rgba(153,27,27,0.4)", "--sd-red-text": "#fca5a5",
  } : {
    "--sd-bg": "#f8fafc", "--sd-bg-card": "#fff", "--sd-bg-secondary": "#fafafa",
    "--sd-text": "#262626", "--sd-text-muted": "#737373",
    "--sd-border": "#e5e5e5", "--sd-border-light": "#f5f5f5",
    "--sd-badge-bg": "#fef2f2", "--sd-badge-border": "#fecaca", "--sd-badge-text": "#b91c1c",
    "--sd-sky-bg": "#f0f9ff", "--sd-sky-border": "#e0f2fe",
    "--sd-amber-bg": "#fffbeb", "--sd-amber-border": "#fef3c7", "--sd-amber-text": "#92400e",
    "--sd-red-bg": "#fee2e2", "--sd-red-border": "#fecaca", "--sd-red-text": "#991b1b",
  };

  return (
    <div style={{ ...vars, minHeight: "100vh", backgroundColor: "var(--sd-bg)", fontFamily: "ui-sans-serif, system-ui, sans-serif", display: "flex", flexDirection: "column", color: "var(--sd-text)", transition: "background-color 0.3s, color 0.3s" }}>
      <WelcomePopup onClose={() => setMusicStarted(true)} />
      {/* Festive ribbon */}
      <div style={{ width: "100%", backgroundColor: "#dc2626", color: "#fff", padding: "0.5rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.65rem", fontWeight: 700, borderBottom: "1px solid #b91c1c", userSelect: "none" }}>
        <div style={{ display: "flex", alignItems: "gap: 0.375rem", minWidth: 0, gap: "0.375rem" }}>
          <Flag style={{ width: "0.875rem", height: "0.875rem", animation: "bounce 1s infinite", color: "#fff", flexShrink: 0 }} />
          <span style={{ textTransform: "uppercase", letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>HUT RI Ke-81 — Sekali Merdeka Tetap Merdeka!</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0, marginLeft: "0.5rem" }}>
          <button onClick={() => setDark(!dark)} style={{ width: "1.75rem", height: "1.75rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none" }} title={dark ? "Mode Siang" : "Mode Malam"}>
            {dark ? <Sun style={{ width: "0.875rem", height: "0.875rem", color: "#fff" }} /> : <Moon style={{ width: "0.875rem", height: "0.875rem", color: "#fff" }} />}
          </button>
          <Link to="/login" style={{ display: "none", alignItems: "center", gap: "0.375rem", backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "0.375rem 0.75rem", borderRadius: "9999px", fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none" }} className="semarak-hide-mobile">
            Masuk Dashboard
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{ position: "relative", background: "linear-gradient(to bottom right, #b91c1c, #dc2626, #d97706)", color: "#fff", padding: "clamp(2rem, 5vw, 4rem) 1rem", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", color: "#fca5a5", opacity: 0.2, pointerEvents: "none", fontSize: "clamp(2.5rem, 8vw, 4.5rem)", userSelect: "none" }}>🇮🇩</div>
        <div style={{ position: "absolute", bottom: "0.75rem", right: "0.75rem", color: "#fca5a5", opacity: 0.2, pointerEvents: "none", fontSize: "clamp(2.5rem, 8vw, 4.5rem)", userSelect: "none" }}>🦅</div>
        <div style={{ maxWidth: "48rem", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <img src="/logo-hut-ri81.jpeg" alt="Logo HUT RI Ke-81" style={{ display: "block", width: "clamp(100px, 20vw, 180px)", maxWidth: "180px", height: "auto", margin: "0 auto 1rem", borderRadius: "12px", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.35))" }} />
          <span style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.25rem 0.75rem", borderRadius: "9999px", display: "inline-block", marginBottom: "0.5rem" }}>Dirgahayu Republik Indonesia</span>
          <h2 style={{ fontSize: "clamp(1.5rem, 6vw, 3.75rem)", fontWeight: 900, letterSpacing: "-0.025em", textTransform: "uppercase", lineHeight: 1.2, marginBottom: "0.5rem" }}>Selamat Datang Warga<br />Melimewah</h2>
          <p style={{ color: "#fecaca", fontSize: "clamp(0.7rem, 2.5vw, 1.125rem)", maxWidth: "36rem", margin: "0 auto", fontWeight: 500, lineHeight: 1.6, padding: "0 0.5rem" }}>Sambut kemerdekaan RI ke-81 dengan berkarya dan mempererat silaturahmi!</p>
          <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#fff", color: "#b91c1c", fontWeight: 900, padding: "0.625rem 1.5rem", borderRadius: "9999px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "0.5rem", textDecoration: "none" }}>
            Masuk ke Dashboard E-Meli
          </Link>
        </div>
      </div>

      {/* Main sections */}
      <main style={{ flex: 1, paddingBottom: "3rem" }}>
        <Countdown />
        <TeksProklamasi />
        <HallOfFame />
      </main>

      {/* Music Player */}
      <MusicPlayer startTrigger={musicStarted} />

      {/* Footer */}
      <footer style={{ backgroundColor: "var(--sd-bg-card)", borderTop: "1px solid var(--sd-border)", padding: "1.25rem", textAlign: "center", userSelect: "none", marginTop: "auto", transition: "background-color 0.3s" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", color: "var(--sd-text-muted)", fontSize: "0.65rem" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.375rem", marginBottom: "0.5rem" }}>
            <span style={{ color: "#dc2626", fontSize: "0.875rem" }}>🇮🇩</span>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--sd-text)", fontWeight: 800 }}>Bhinneka Tunggal Ika</span>
            <span style={{ color: "#dc2626", fontSize: "0.875rem" }}>🇮🇩</span>
          </div>
          <p style={{ fontSize: "0.55rem", color: "var(--sd-text-muted)" }}>© 2026 Semarak 17 Agustus • GG MELIMEWAH</p>
        </div>
      </footer>
    </div>
  );
}
