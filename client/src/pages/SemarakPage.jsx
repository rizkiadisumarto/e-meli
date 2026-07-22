import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Flag, Calendar, Heart, Volume2, Sun, Moon, X, Shield, Crown, PenLine, Users,
  Home, Sparkles, Camera, Info, ChevronRight, Wallet, CreditCard, BarChart3,
  FileText, MapPin, Phone, Mail, Clock, Gamepad2, Star, BookOpen, Coffee,
  Download, FileDown, Trophy, Play, PlayCircle, ZoomIn, ZoomOut, ChevronLeft, ChevronRight as ChevronRightIcon
} from "lucide-react";
import { useMusic } from "../context/MusicContext";
import "./SemarakPage.css";

// ==================== LIGHTBOX COMPONENT ====================
function PhotoLightbox({ photos, currentIndex, isOpen, onClose }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setScale(1);
  }, [currentIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.95)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          background: "rgba(255,255,255,0.2)",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
          color: "#fff",
        }}
      >
        <X size={20} />
      </button>

      {/* Zoom controls */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          display: "flex",
          gap: "0.5rem",
          zIndex: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
          }}
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={() => setScale((s) => Math.min(3, s + 0.25))}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
          }}
        >
          <ZoomIn size={18} />
        </button>
        <span style={{ color: "#fff", fontSize: "0.75rem", display: "flex", alignItems: "center", padding: "0 0.5rem" }}>
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Photo */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "auto",
        }}
      >
        <img
          src={photos[currentIndex]}
          alt={`Foto ${currentIndex + 1}`}
          style={{
            maxWidth: "100%",
            maxHeight: "85vh",
            objectFit: "contain",
            transform: `scale(${scale})`,
            transition: "transform 0.3s ease, opacity 0.5s ease-in-out",
            cursor: scale > 1 ? "grab" : "zoom-in",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setScale(scale === 1 ? 1.5 : 1);
          }}
        />
      </div>

      {/* Counter */}
      <div
        style={{
          position: "absolute",
          bottom: "1rem",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          padding: "0.5rem 1rem",
          borderRadius: "9999px",
          color: "#fff",
          fontSize: "0.8rem",
          fontWeight: 600,
        }}
      >
        {currentIndex + 1} / {photos.length}
      </div>
    </motion.div>
  );
}

// ==================== FLOATING ANIMATION COMPONENTS ====================
function FloatingEmoji({ emoji, delay, duration, left, size }) {
  return (
    <div style={{
      position: "fixed",
      left: `${left}%`,
      bottom: "-50px",
      fontSize: `${size}px`,
      animation: `floatUp ${duration}s ${delay}s infinite linear`,
      pointerEvents: "none",
      zIndex: 0,
      opacity: 0.6
    }}>{emoji}</div>
  );
}

function ConfettiParticle({ delay, left, color }) {
  return (
    <div style={{
      position: "fixed",
      left: `${left}%`,
      top: "-10px",
      width: "8px",
      height: "8px",
      backgroundColor: color,
      animation: `confettiFall 8s ${delay}s infinite linear`,
      pointerEvents: "none",
      zIndex: 0,
      borderRadius: Math.random() > 0.5 ? "50%" : "0"
    }} />
  );
}

function FloatingElements({ active }) {
  const emojis = ["🇮🇩", "🦅", "⭐", "🎉", "🎊", "🏅", "❤️", "🔥"];
  const colors = ["#dc2626", "#d97706", "#2563eb", "#059669", "#7c3aed", "#f43f5e"];

  if (!active) return (
    <style>{`
      @keyframes floatUp {
        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.6; }
        90% { opacity: 0.6; }
        100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
      }
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 5px rgba(220,38,38,0.3); }
        50% { box-shadow: 0 0 20px rgba(220,38,38,0.6); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes bounce-soft {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
    `}</style>
  );

  return (
    <>
      {emojis.map((e, i) => (
        <FloatingEmoji key={`e-${i}`} emoji={e} delay={i * 3} duration={25 + Math.random() * 15} left={5 + i * 12} size={20 + Math.random() * 15} />
      ))}
      {Array.from({ length: 15 }, (_, i) => (
        <ConfettiParticle key={`c-${i}`} delay={i * 1} left={Math.random() * 100} color={colors[i % colors.length]} />
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(220,38,38,0.3); }
          50% { box-shadow: 0 0 20px rgba(220,38,38,0.6); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}

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
        <p style={{ fontSize: "0.875rem", color: "#dc2626", fontWeight: 600, marginBottom: "0.75rem" }}>
          Gemah Ripah Loh Jinawi
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--sd-text-muted, #737373)", lineHeight: 1.6, marginBottom: "1rem", fontStyle: "italic" }}>
          "Alhamdulillahi rabbil 'alamin. Tiada kata yang paling pantas untuk diucapkan selain puji dan syukur ke hadirat Allah SWT, karena atas izin dan kasih sayang-Nya, langkah perjuangan kita membuahkan hasil manis yang membanggakan."
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
function Countdown({ animationsStarted }) {
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
      <motion.div
        initial={animationsStarted ? { opacity: 0, y: 15 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={animationsStarted ? { duration: 0.6 } : { duration: 0 }}
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
          <div className="semarak-countdown-grid" style={{ maxWidth: "28rem", margin: "0 auto" }}>
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
function TeksProklamasi({ animationsStarted }) {
  return (
    <div style={{ width: "100%", maxWidth: "48rem", margin: "0 auto", padding: "0 clamp(0.75rem, 3vw, 1.25rem)" }}>
      <motion.div
        initial={animationsStarted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={animationsStarted ? { duration: 0.6, delay: 0.2 } : { duration: 0 }}
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
  const [isExpanded, setIsExpanded] = useState(false);
  const { isPlaying, playbackRate, playMusic, togglePlay, changeSpeed } = useMusic();

  useEffect(() => {
    if (startTrigger) playMusic();
  }, [startTrigger]);

  return (
    <div className="semarak-music-player" style={{ position: "fixed", bottom: "1rem", right: "1rem", zIndex: 50 }}>
      {isExpanded && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ backgroundColor: "var(--sd-bg-card, #fff)", borderRadius: "0.75rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: "1px solid var(--sd-border, #e5e5e5)", padding: "0.75rem", marginBottom: "0.5rem", maxWidth: "12rem" }}>
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
          {/* Speed Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.55rem", color: "var(--sd-text-muted, #737373)", marginRight: "0.25rem" }}>Speed:</span>
            {[0.5, 1, 1.5, 2].map(rate => (
              <button key={rate} onClick={() => changeSpeed(rate)}
                style={{ fontSize: "0.55rem", padding: "0.15rem 0.375rem", borderRadius: "0.25rem", border: "none", cursor: "pointer", fontWeight: 600, backgroundColor: playbackRate === rate ? "#dc2626" : "var(--sd-bg-secondary, #e5e5e5)", color: playbackRate === rate ? "#fff" : "var(--sd-text-muted, #737373)" }}>
                {rate}x
              </button>
            ))}
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

// ==================== VIDEO GRID ====================
function VideoGrid() {
  const { isPlaying, togglePlay } = useMusic();
  const [playingIdx, setPlayingIdx] = useState(null);
  const videoRefs = useRef([]);

  const videos = [
    { src: "/hall-of-fame/video 1.mp4", label: "Video 1" },
    { src: "/hall-of-fame/video 2.mp4", label: "Video 2" },
    { src: "/hall-of-fame/video 3.mp4", label: "Video 3" },
    { src: "/hall-of-fame/video 4.mp4", label: "Video 4" },
  ];

  const handlePlay = useCallback((idx) => {
    // Pause other videos
    videoRefs.current.forEach((v, i) => {
      if (v && i !== idx) v.pause();
    });
    // Pause music if playing
    if (isPlaying) togglePlay();
    setPlayingIdx(idx);
  }, [isPlaying, togglePlay]);

  const handlePause = useCallback(() => {
    setPlayingIdx(null);
  }, []);

  return (
    <div className="semarak-video-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
      {videos.map((video, idx) => (
        <div key={idx} className="semarak-video-card" style={{ borderRadius: "0.75rem", overflow: "hidden", border: "1px solid var(--sd-border, #e5e5e5)", backgroundColor: "#000", transition: "transform 0.2s, box-shadow 0.2s", transform: playingIdx === idx ? "scale(1.02)" : "scale(1)", boxShadow: playingIdx === idx ? "0 8px 24px rgba(220,38,38,0.3)" : "none" }}>
          <video
            ref={el => videoRefs.current[idx] = el}
            src={video.src}
            controls
            preload="metadata"
            onPlay={() => handlePlay(idx)}
            onPause={handlePause}
            className="semarak-video"
            style={{ width: "100%", aspectRatio: "9/16", objectFit: "cover", display: "block" }}
          />
          <div style={{ padding: "0.5rem 0.75rem", backgroundColor: "var(--sd-bg-card, #fff)", textAlign: "center" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--sd-text, #262626)" }}>{video.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== HALL OF FAME ====================
function HallOfFame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
          <p style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)", color: "rgba(255,255,255,0.8)", marginTop: "0.25rem" }}>Malam Tirakat 16 Agustus & HUT RI Ke-80 - 17 Agustus 2025</p>
        </div>

        <div style={{ padding: "clamp(1rem, 3vw, 2rem)" }}>
          <div
            className="semarak-hall-image"
            style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "0.75rem", overflow: "hidden", backgroundColor: "var(--sd-bg-secondary, #f5f5f5)", cursor: "zoom-in" }}
            onClick={() => setLightboxOpen(true)}
          >
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
              Momen-momen indah perayaan Malam Tirakat & HUT RI Ke-80 bersama warga Melimewah
            </p>
          </div>

          {/* Video Highlights */}
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <span style={{ display: "inline-block", backgroundColor: "#dc2626", color: "#fff", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.25rem 0.75rem", borderRadius: "9999px", marginBottom: "0.5rem" }}>&#127909; Video Highlights</span>
              <h3 style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", fontWeight: 800, color: "var(--sd-text, #262626)", margin: "0.5rem 0 0" }}>Dokumentasi Video Perayaan</h3>
            </div>
            <VideoGrid />
          </div>

          {/* Susunan Panitia Inti */}
          <div style={{ marginTop: "1.5rem", padding: "clamp(1rem, 3vw, 1.5rem)", backgroundColor: "var(--sd-bg-secondary, #fafafa)", borderRadius: "0.75rem", border: "1px solid var(--sd-border, #e5e5e5)" }}>
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <span style={{ display: "inline-block", backgroundColor: "#dc2626", color: "#fff", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.25rem 0.75rem", borderRadius: "9999px", marginBottom: "0.5rem" }}>Panitia Inti</span>
              <h3 style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", fontWeight: 800, color: "var(--sd-text, #262626)", margin: "0.5rem 0 0" }}>Susunan Pengurus Malam Tirakat & HUT RI Ke-80 Tahun 2025</h3>
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

      <PhotoLightbox
        photos={photos}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}

// ==================== LAPORAN KEGIATAN ====================
function LaporanKegiatan() {
  const laporan = [
    {
      title: "Laporan Event 17-an Gang Melimewah 2025",
      desc: "Laporan lengkap pelaksanaan perayaan Malam Tirakat 16 Agustus & 17 Agustus di Gang Melimewah tahun 2025.",
      file: "/laporan/Laporan-Event-17an-2025.pdf",
      icon: "🏁",
      color: "#dc2626",
    },
    {
      title: "Laporan Malam Tirakatan Agustus 2025",
      desc: "Laporan kegiatan malam tirakatan 16 Agustus menjelang HUT RI Ke-80 tahun 2025.",
      file: "/laporan/Laporan-Tirakatan-2025.pdf",
      icon: "🌙",
      color: "#7c3aed",
    },
    {
      title: "Laporan Ringkas Transparan 17-an 2025",
      desc: "Ringkasan transparan keuangan dan pelaksanaan event Malam Tirakat 16 Agustus & 17 Agustus 2025.",
      file: "/laporan/Laporan-Ringkas-17an-2025.pdf",
      icon: "📊",
      color: "#2563eb",
    },
    {
      title: "Laporan Rincian Malam Tirakatan 2025",
      desc: "Rincian detail kegiatan dan anggaran malam tirakatan 16 Agustus & HUT RI 17 Agustus 2025.",
      file: "/laporan/Laporan-Tirakatan-Rincian-2025.pdf",
      icon: "📋",
      color: "#059669",
    },
  ];

  return (
    <div style={{ width: "100%", maxWidth: "56rem", margin: "0 auto", padding: "0 clamp(0.75rem, 3vw, 1.25rem)" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
        style={{ background: "var(--sd-bg-card, #fff)", borderRadius: "clamp(0.75rem, 2vw, 1.25rem)", border: "1px solid var(--sd-border, #e5e5e5)", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", overflow: "hidden" }}>

        <div style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", padding: "clamp(1rem, 3vw, 1.5rem) clamp(1rem, 3vw, 2rem)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-2rem", right: "-2rem", width: "6rem", height: "6rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)" }} />
          <div style={{ position: "absolute", bottom: "-1rem", left: "-1rem", width: "4rem", height: "4rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)" }} />
          <div style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "0.5rem" }}>&#128196;</div>
          <h2 style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Laporan Kegiatan</h2>
          <p style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)", color: "rgba(255,255,255,0.8)", marginTop: "0.25rem" }}>Dokumen transparansi kegiatan komunitas</p>
        </div>

        <div style={{ padding: "clamp(1rem, 3vw, 2rem)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {laporan.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                style={{ backgroundColor: "var(--sd-bg-secondary, #fafafa)", border: "1px solid var(--sd-border, #e5e5e5)", borderRadius: "0.75rem", padding: "1.25rem", transition: "all 0.2s", display: "flex", flexDirection: "column" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.5rem", backgroundColor: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sd-text, #262626)", margin: 0, lineHeight: 1.4 }}>{item.title}</h4>
                  </div>
                </div>
                <p style={{ fontSize: "0.7rem", color: "var(--sd-text-muted, #737373)", margin: "0 0 1rem", lineHeight: 1.5, flex: 1 }}>{item.desc}</p>
                <a href={item.file} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", backgroundColor: item.color, color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", textDecoration: "none", transition: "opacity 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
                  <Download style={{ width: "0.875rem", height: "0.875rem" }} />
                  Lihat Laporan
                </a>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: "1.25rem", padding: "clamp(0.75rem, 2vw, 1rem)", backgroundColor: "var(--sd-badge-bg, #f0f9ff)", border: "1px solid var(--sd-border, #bae6fd)", borderRadius: "0.75rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.25rem", lineHeight: 1, flexShrink: 0 }}>&#128220;</span>
            <div>
              <p style={{ fontSize: "clamp(0.65rem, 1.5vw, 0.8rem)", fontWeight: 700, color: "var(--sd-text, #262626)", margin: "0 0 0.25rem" }}>Transparansi Keuangan</p>
              <p style={{ fontSize: "clamp(0.6rem, 1.3vw, 0.7rem)", color: "var(--sd-text-muted, #737373)", margin: 0, lineHeight: 1.6 }}>
                Seluruh laporan kegiatan dan keuangan komunitas dapat diakses oleh semua warga untuk menjaga transparansi dan akuntabilitas.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== TAB: FITUR ====================
function FiturTab() {
  const features = [
    { icon: <BarChart3 size={24} />, title: "Dashboard Real-time", desc: "Pantau kondisi keuangan komunitas secara langsung dalam satu tampilan.", color: "#dc2626" },
    { icon: <Wallet size={24} />, title: "Kelola Transaksi", desc: "Catat pemasukan dan pengeluaran dengan mudah, lengkap bukti foto.", color: "#d97706" },
    { icon: <Users size={24} />, title: "Data Anggota", desc: "Kelola data seluruh warga dengan informasi kontak dan status.", color: "#2563eb" },
    { icon: <CreditCard size={24} />, title: "Iuran Bulanan", desc: "Tracking pembayaran iuran per bulan, siapa sudah bayar dan belum.", color: "#059669" },
    { icon: <Calendar size={24} />, title: "Manajemen Event", desc: "Atur acara komunitas dari perencanaan, anggaran, hingga pelaporan.", color: "#7c3aed" },
    { icon: <FileText size={24} />, title: "Laporan Keuangan", desc: "Generate laporan lengkap periode tertentu untuk transparansi.", color: "#0891b2" },
  ];

  return (
    <div style={{ padding: "clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1.25rem)" }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "clamp(1.125rem, 3vw, 1.5rem)", fontWeight: 900, color: "var(--sd-text)", margin: "0 0 0.375rem" }}>Fitur <span style={{ color: "#dc2626" }}>E-Meli</span></h2>
        <p style={{ color: "var(--sd-text-muted)", fontSize: "0.8rem", margin: 0 }}>Sistem manajemen keuangan komunitas yang transparan dan modern</p>
      </div>
      <div className="semarak-feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", maxWidth: "56rem", margin: "0 auto" }}>
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }}
            style={{ backgroundColor: "var(--sd-bg-card)", border: "1px solid var(--sd-border)", borderRadius: "0.75rem", padding: "1.25rem", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.5rem", backgroundColor: `${f.color}12`, display: "flex", alignItems: "center", justifyContent: "center", color: f.color, marginBottom: "0.75rem" }}>{f.icon}</div>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--sd-text)", margin: "0 0 0.25rem" }}>{f.title}</h3>
            <p style={{ fontSize: "0.7rem", color: "var(--sd-text-muted)", margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ==================== URAIAN LOMBA ====================
function UraianLomba() {
  return (
    <div style={{ backgroundColor: "var(--sd-bg-card)", border: "1px solid var(--sd-border)", borderRadius: "1rem", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, #dc2626, #fbbf24, #dc2626)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />
      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>&#127941;</div>
        <h3 style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)", fontWeight: 900, color: "var(--sd-text)", margin: "0 0 0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Uraian Lomba-Lomba</h3>
        <p style={{ fontSize: "0.7rem", color: "var(--sd-text-muted)", margin: 0 }}>Gebyar Kemerdekaan Gang Meli Mewah 2025</p>
      </div>

      {/* Kategori 2-4 Tahun */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#000", padding: "0.5rem 1rem", borderRadius: "0.5rem 0.5rem 0 0", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Kategori Anak-Anak 2-4 Tahun
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.65rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--sd-bg-secondary, #fafafa)" }}>
                <th style={{ padding: "0.5rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", fontWeight: 700, width: "40px" }}>No</th>
                <th style={{ padding: "0.5rem", textAlign: "left", borderBottom: "1px solid var(--sd-border)", fontWeight: 700 }}>Uraian Lomba</th>
                <th style={{ padding: "0.5rem", textAlign: "left", borderBottom: "1px solid var(--sd-border)", fontWeight: 700 }}>Kebutuhan Lomba</th>
                <th style={{ padding: "0.5rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", fontWeight: 700 }}>Keterangan</th>
                <th style={{ padding: "0.5rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", fontWeight: 700 }}>Waktu Pelaksanaan</th>
                <th style={{ padding: "0.5rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", fontWeight: 700 }}>Juara</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)", fontWeight: 600 }}>Mewarnai</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)" }}>Meja Portable, Crayon/Pensil Warna</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>Milik Pribadi</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", color: "#dc2626", fontWeight: 600 }} rowSpan={1}>16 Agustus Lepas Ashar</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1, 2, 3</td></tr>
              <tr><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>2</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)", fontWeight: 600 }}>Balap Kelereng</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)" }}>Kelereng, Sendok Plastik</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>Panitia</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", color: "#dc2626", fontWeight: 600 }} rowSpan={2}>17 Agustus</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1, 2, 3</td></tr>
              <tr><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>3</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)", fontWeight: 600 }}>Memindahkan Bendera Merah Putih</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)" }}>Botol Bekas Sirup, Sedotan, Bendera Plastik</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>Panitia</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1, 2, 3</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Kategori 5-7 Tahun */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ background: "linear-gradient(135deg, #34d399, #10b981)", color: "#000", padding: "0.5rem 1rem", borderRadius: "0.5rem 0.5rem 0 0", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Kategori Anak-Anak 5-7 Tahun
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.65rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--sd-bg-secondary, #fafafa)" }}>
                <th style={{ padding: "0.5rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", fontWeight: 700, width: "40px" }}>No</th>
                <th style={{ padding: "0.5rem", textAlign: "left", borderBottom: "1px solid var(--sd-border)", fontWeight: 700 }}>Uraian Lomba</th>
                <th style={{ padding: "0.5rem", textAlign: "left", borderBottom: "1px solid var(--sd-border)", fontWeight: 700 }}>Kebutuhan Lomba</th>
                <th style={{ padding: "0.5rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", fontWeight: 700 }}>Keterangan</th>
                <th style={{ padding: "0.5rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", fontWeight: 700 }}>Waktu Pelaksanaan</th>
                <th style={{ padding: "0.5rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", fontWeight: 700 }}>Juara</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)", fontWeight: 600 }}>Mewarnai</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)" }}>Meja Portable, Crayon/Pensil Warna</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>Milik Pribadi</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", color: "#dc2626", fontWeight: 600 }}>16 Agustus Lepas Ashar</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1, 2, 3</td></tr>
              <tr><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>2</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)", fontWeight: 600 }}>Makan Kerupuk</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)" }}>Tali Rafia, Kerupuk</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>Panitia</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", color: "#dc2626", fontWeight: 600 }} rowSpan={4}>17 Agustus</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1, 2, 3</td></tr>
              <tr><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>3</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)", fontWeight: 600 }}>Balap Kelereng</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)" }}>Kelereng, Sendok Plastik</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>Panitia</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1, 2, 3</td></tr>
              <tr><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>4</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)", fontWeight: 600 }}>Memindahkan Bendera Merah Putih</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)" }}>Botol Bekas Sirup, Sedotan, Bendera Plastik</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>Panitia</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1, 2, 3</td></tr>
              <tr><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>5</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)", fontWeight: 600 }}>Joged Balon</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)" }}>Balon</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>Panitia</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Kategori 8-10 & 11-13 Tahun */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ background: "linear-gradient(135deg, #60a5fa, #3b82f6)", color: "#fff", padding: "0.5rem 1rem", borderRadius: "0.5rem 0.5rem 0 0", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Kategori Anak-Anak 8-10 & 11-13 Tahun
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.65rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--sd-bg-secondary, #fafafa)" }}>
                <th style={{ padding: "0.5rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", fontWeight: 700, width: "40px" }}>No</th>
                <th style={{ padding: "0.5rem", textAlign: "left", borderBottom: "1px solid var(--sd-border)", fontWeight: 700 }}>Uraian Lomba</th>
                <th style={{ padding: "0.5rem", textAlign: "left", borderBottom: "1px solid var(--sd-border)", fontWeight: 700 }}>Kebutuhan Lomba</th>
                <th style={{ padding: "0.5rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", fontWeight: 700 }}>Keterangan</th>
                <th style={{ padding: "0.5rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", fontWeight: 700 }}>Waktu Pelaksanaan</th>
                <th style={{ padding: "0.5rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", fontWeight: 700 }}>Juara</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)", fontWeight: 600 }}>Makan Kerupuk</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)" }}>Tali Rafia, Kerupuk</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>Panitia</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)", color: "#dc2626", fontWeight: 600 }} rowSpan={5}>17 Agustus</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1, 2, 3</td></tr>
              <tr><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>2</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)", fontWeight: 600 }}>Balap Kelereng</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)" }}>Kelereng, Sendok Plastik</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>Panitia</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1, 2, 3</td></tr>
              <tr><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>3</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)", fontWeight: 600 }}>Memindahkan Bendera Merah Putih</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)" }}>Botol Bekas Sirup, Sedotan, Bendera Plastik</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>Panitia</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1, 2, 3</td></tr>
              <tr><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>4</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)", fontWeight: 600 }}>Memasukkan Paku ke Botol</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)" }}>Botol Bekas Sirup, Paku, Tali Rafia</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>Panitia</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1, 2, 3</td></tr>
              <tr><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>5</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)", fontWeight: 600 }}>Joged Balon</td><td style={{ padding: "0.4rem", borderBottom: "1px solid var(--sd-border)" }}>Balon</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>Panitia</td><td style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border)" }}>1</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Tambahan */}
      <div style={{ padding: "0.75rem 1rem", backgroundColor: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "0.5rem", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
        <span style={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}>&#127881;</span>
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--sd-text)", margin: "0 0 0.25rem" }}>Catatan Penting</p>
          <p style={{ fontSize: "0.65rem", color: "var(--sd-text-muted)", margin: 0, lineHeight: 1.5 }}>
            Semua kebutuhan lomba disediakan oleh Panitia kecuali yang bertuliskan "Milik Pribadi". Pendaftaran GRATIS untuk seluruh warga Gang Meli Mewah.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== TAB: ARSIP (Hall of Fame) ====================
function ArsipTab() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem 1rem 1rem" }}>
        <img
          src="/logo-hut-ri80.jpg"
          alt="Logo HUT RI Ke-80"
          style={{ width: "clamp(160px, 30vw, 260px)", height: "auto", borderRadius: "16px", filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.3))", animation: "logoSpin 3s ease-in-out infinite" }}
        />
      </div>
      <style>{`
        @keyframes logoSpin {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(5deg) scale(1.05); }
          50% { transform: rotate(0deg) scale(1); }
          75% { transform: rotate(-5deg) scale(1.05); }
          100% { transform: rotate(0deg) scale(1); }
        }
      `}</style>
      <HallOfFame />
      <div style={{ height: "1.5rem" }} />
      <UraianLomba />
      <div style={{ height: "1.5rem" }} />
      <LaporanKegiatan />
    </div>
  );
}

// ==================== DATABASE 2024 TAB ====================
function Database2024Tab() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const photos = [
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.45%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.46%20PM%20(1).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.46%20PM%20(2).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.46%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.47%20PM%20(1).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.47%20PM%20(2).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.47%20PM%20(3).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.47%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.48%20PM%20(1).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.48%20PM%20(2).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.48%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.49%20PM%20(1).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.49%20PM%20(2).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.49%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.50%20PM%20(1).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.50%20PM%20(2).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.50%20PM%20(3).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.50%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.51%20PM%20(1).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.51%20PM%20(2).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.51%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.52%20PM%20(1).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.52%20PM%20(2).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.52%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.53.53%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.24%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.25%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.26%20PM%20(1).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.26%20PM%20(2).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.26%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.27%20PM%20(1).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.29%20PM%20(1).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.29%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.30%20PM%20(1).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.30%20PM%20(2).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.30%20PM%20(3).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.30%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.31%20PM%20(1).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.31%20PM%20(2).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.36%20PM%20(1).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.36%20PM%20(2).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.36%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.37%20PM%20(1).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.37%20PM%20(2).jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2010.59.37%20PM.jpeg",
    "/hall-of-fame%202024/WhatsApp%20Image%202026-07-22%20at%2011.04.25%20PM.jpeg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
        setIsTransitioning(false);
      }, 1500);
    }, 4000);
    return () => clearInterval(interval);
  }, [photos.length]);

  return (
    <div>
      {/* Logo HUT RI 79 with animation */}
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem 1rem 1rem" }}>
        <motion.img
          src="/logohutri79.jpeg"
          alt="Logo HUT RI Ke-79"
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: [1, 1.08, 1, 1.05, 1],
            rotate: [0, 5, -5, 3, 0],
            y: [0, -10, 0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ width: "clamp(160px, 30vw, 260px)", height: "auto", borderRadius: "16px", filter: "drop-shadow(0 6px 20px rgba(220,38,38,0.4))" }}
        />
      </div>
      <style>{`
        @keyframes glowPulse {
          0% { box-shadow: 0 0 20px rgba(220,38,38,0.3); }
          50% { box-shadow: 0 0 40px rgba(220,38,38,0.6); }
          100% { box-shadow: 0 0 20px rgba(220,38,38,0.3); }
        }
      `}</style>

      {/* Hall of Fame 2024 */}
      <div style={{ width: "100%", maxWidth: "56rem", margin: "0 auto", padding: "0 clamp(0.75rem, 3vw, 1.25rem)" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          style={{ background: "var(--sd-bg-card, #fff)", borderRadius: "clamp(0.75rem, 2vw, 1.25rem)", border: "1px solid var(--sd-border, #e5e5e5)", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", overflow: "hidden" }}>

          <div style={{ background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)", padding: "clamp(1rem, 3vw, 1.5rem) clamp(1rem, 3vw, 2rem)", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-2rem", right: "-2rem", width: "6rem", height: "6rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)" }} />
            <div style={{ position: "absolute", bottom: "-1rem", left: "-1rem", width: "4rem", height: "4rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)" }} />
            <div style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "0.5rem" }}>&#127942;</div>
            <h2 style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Hall of Fame 2024</h2>
            <p style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)", color: "rgba(255,255,255,0.8)", marginTop: "0.25rem" }}>Malam Tirakat 16 Agustus &amp; HUT RI Ke-79 - 17 Agustus 2024</p>
          </div>

          <div style={{ padding: "clamp(1rem, 3vw, 2rem)" }}>
            <div
              style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "0.75rem", overflow: "hidden", backgroundColor: "var(--sd-bg-secondary, #f5f5f5)", animation: "glowPulse 3s ease-in-out infinite", cursor: "zoom-in" }}
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={photos[currentIndex]}
                alt={`Hall of Fame 2024 - ${currentIndex + 1}`}
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
                Momen-momen indah perayaan Malam Tirakat &amp; HUT RI Ke-79 bersama warga Melimewah
              </p>
            </div>

            {/* Susunan Panitia Inti */}
            <div style={{ marginTop: "1.5rem", padding: "clamp(1rem, 3vw, 1.5rem)", backgroundColor: "var(--sd-bg-secondary, #fafafa)", borderRadius: "0.75rem", border: "1px solid var(--sd-border, #e5e5e5)" }}>
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <span style={{ display: "inline-block", backgroundColor: "#dc2626", color: "#fff", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.25rem 0.75rem", borderRadius: "9999px", marginBottom: "0.5rem" }}>Panitia Inti</span>
                <h3 style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", fontWeight: 800, color: "var(--sd-text, #262626)", margin: "0.5rem 0 0" }}>Susunan Pengurus Malam Tirakat &amp; HUT RI Ke-79 Tahun 2024</h3>
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

            {/* Uraian Lomba-Lomba 2024 */}
            <div style={{ marginTop: "1.5rem", backgroundColor: "var(--sd-bg-secondary, #fafafa)", borderRadius: "0.75rem", border: "1px solid var(--sd-border, #e5e5e5)", padding: "clamp(1rem, 3vw, 1.5rem)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, #dc2626, #fbbf24, #dc2626)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />
              <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>&#127941;</div>
                <h3 style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", fontWeight: 900, color: "var(--sd-text, #262626)", margin: "0 0 0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Uraian Lomba-Lomba</h3>
                <p style={{ fontSize: "0.65rem", color: "var(--sd-text-muted, #737373)", margin: 0 }}>Gebyar Kemerdekaan Gang Meli Mewah 2024</p>
              </div>

              {/* Kategori 2-4 Tahun */}
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#000", padding: "0.5rem 1rem", borderRadius: "0.5rem 0.5rem 0 0", fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Kategori Anak-Anak 2-4 Tahun
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.6rem" }}>
                    <thead>
                      <tr style={{ backgroundColor: "var(--sd-bg-card, #fff)" }}>
                        <th style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700, width: "35px" }}>No</th>
                        <th style={{ padding: "0.4rem", textAlign: "left", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700 }}>Uraian Lomba</th>
                        <th style={{ padding: "0.4rem", textAlign: "left", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700 }}>Kebutuhan</th>
                        <th style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700 }}>Ket</th>
                        <th style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700 }}>Waktu</th>
                        <th style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700 }}>Juara</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 600 }}>Mewarnai</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Meja Portable, Crayon</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Pribadi</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", color: "#dc2626", fontWeight: 600 }} rowSpan={1}>16 Agustus</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1, 2, 3</td></tr>
                      <tr><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>2</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 600 }}>Balap Kelereng</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Kelereng, Sendok</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Panitia</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", color: "#dc2626", fontWeight: 600 }} rowSpan={2}>17 Agustus</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1, 2, 3</td></tr>
                      <tr><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>3</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 600 }}>Memindahkan Bendera</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Botol, Sedotan, Bendera</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Panitia</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1, 2, 3</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Kategori 5-7 Tahun */}
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ background: "linear-gradient(135deg, #34d399, #10b981)", color: "#000", padding: "0.5rem 1rem", borderRadius: "0.5rem 0.5rem 0 0", fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Kategori Anak-Anak 5-7 Tahun
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.6rem" }}>
                    <thead>
                      <tr style={{ backgroundColor: "var(--sd-bg-card, #fff)" }}>
                        <th style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700, width: "35px" }}>No</th>
                        <th style={{ padding: "0.4rem", textAlign: "left", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700 }}>Uraian Lomba</th>
                        <th style={{ padding: "0.4rem", textAlign: "left", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700 }}>Kebutuhan</th>
                        <th style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700 }}>Ket</th>
                        <th style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700 }}>Waktu</th>
                        <th style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700 }}>Juara</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 600 }}>Mewarnai</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Meja Portable, Crayon</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Pribadi</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", color: "#dc2626", fontWeight: 600 }}>16 Agustus</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1, 2, 3</td></tr>
                      <tr><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>2</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 600 }}>Makan Kerupuk</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Tali Rafia, Kerupuk</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Panitia</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", color: "#dc2626", fontWeight: 600 }} rowSpan={4}>17 Agustus</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1, 2, 3</td></tr>
                      <tr><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>3</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 600 }}>Balap Kelereng</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Kelereng, Sendok</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Panitia</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1, 2, 3</td></tr>
                      <tr><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>4</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 600 }}>Memindahkan Bendera</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Botol, Sedotan, Bendera</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Panitia</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1, 2, 3</td></tr>
                      <tr><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>5</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 600 }}>Joged Balon</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Balon</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Panitia</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Kategori 8-10 & 11-13 Tahun */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ background: "linear-gradient(135deg, #60a5fa, #3b82f6)", color: "#fff", padding: "0.5rem 1rem", borderRadius: "0.5rem 0.5rem 0 0", fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Kategori Anak-Anak 8-10 &amp; 11-13 Tahun
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.6rem" }}>
                    <thead>
                      <tr style={{ backgroundColor: "var(--sd-bg-card, #fff)" }}>
                        <th style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700, width: "35px" }}>No</th>
                        <th style={{ padding: "0.4rem", textAlign: "left", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700 }}>Uraian Lomba</th>
                        <th style={{ padding: "0.4rem", textAlign: "left", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700 }}>Kebutuhan</th>
                        <th style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700 }}>Ket</th>
                        <th style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700 }}>Waktu</th>
                        <th style={{ padding: "0.4rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 700 }}>Juara</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 600 }}>Makan Kerupuk</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Tali Rafia, Kerupuk</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Panitia</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)", color: "#dc2626", fontWeight: 600 }} rowSpan={5}>17 Agustus</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1, 2, 3</td></tr>
                      <tr><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>2</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 600 }}>Balap Kelereng</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Kelereng, Sendok</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Panitia</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1, 2, 3</td></tr>
                      <tr><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>3</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 600 }}>Memindahkan Bendera</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Botol, Sedotan, Bendera</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Panitia</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1, 2, 3</td></tr>
                      <tr><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>4</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 600 }}>Memasukkan Paku ke Botol</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Botol, Paku, Tali</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Panitia</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1, 2, 3</td></tr>
                      <tr><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>5</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)", fontWeight: 600 }}>Joged Balon</td><td style={{ padding: "0.35rem", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Balon</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>Panitia</td><td style={{ padding: "0.35rem", textAlign: "center", borderBottom: "1px solid var(--sd-border, #e5e5e5)" }}>1</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info Tambahan */}
              <div style={{ padding: "0.6rem 0.75rem", backgroundColor: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "0.5rem", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.9rem", lineHeight: 1, flexShrink: 0 }}>&#127881;</span>
                <div>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--sd-text, #262626)", margin: "0 0 0.15rem" }}>Catatan Penting</p>
                  <p style={{ fontSize: "0.55rem", color: "var(--sd-text-muted, #737373)", margin: 0, lineHeight: 1.4 }}>
                    Semua kebutuhan lomba disediakan oleh Panitia kecuali yang bertuliskan "Milik Pribadi". Pendaftaran GRATIS untuk seluruh warga Gang Meli Mewah.
                  </p>
                </div>
              </div>
            </div>

            {/* Laporan Kegiatan 2024 */}
            <div style={{ marginTop: "1.5rem", padding: "clamp(1rem, 3vw, 1.5rem)", backgroundColor: "var(--sd-bg-secondary, #fafafa)", borderRadius: "0.75rem", border: "1px solid var(--sd-border, #e5e5e5)" }}>
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <span style={{ display: "inline-block", backgroundColor: "#2563eb", color: "#fff", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.25rem 0.75rem", borderRadius: "9999px", marginBottom: "0.5rem" }}>&#128196; Laporan Kegiatan</span>
                <h3 style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", fontWeight: 800, color: "var(--sd-text, #262626)", margin: "0.5rem 0 0" }}>Dokumen Transparansi Kegiatan 2024</h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem" }}>
                <motion.a
                  href="/laporan%202024/Laporan_Rundown_Persiapan_Lomba_17an.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  style={{ backgroundColor: "var(--sd-bg-card, #fff)", border: "1px solid var(--sd-border, #e5e5e5)", borderRadius: "0.75rem", padding: "1rem", textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.5rem", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "linear-gradient(135deg, #dc2626, #b91c1c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><FileText size={14} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--sd-text, #262626)" }}>Rundown Persiapan Lomba 17-an</div>
                      <div style={{ fontSize: "0.55rem", color: "var(--sd-text-muted, #737373)" }}>PDF Document</div>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.6rem", color: "var(--sd-text-muted, #737373)", margin: 0, lineHeight: 1.4 }}>Jadwal dan rundown persiapan lomba 17 Agustus 2024</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#2563eb", fontSize: "0.6rem", fontWeight: 600, marginTop: "auto" }}>
                    <Download size={12} /> <span>Buka Dokumen</span>
                  </div>
                </motion.a>

                <motion.a
                  href="/laporan%202024/Laporan_Lomba_17_Agustus_2024.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  style={{ backgroundColor: "var(--sd-bg-card, #fff)", border: "1px solid var(--sd-border, #e5e5e5)", borderRadius: "0.75rem", padding: "1rem", textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.5rem", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "linear-gradient(135deg, #059669, #047857)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><FileText size={14} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--sd-text, #262626)" }}>Laporan Lomba 17 Agustus 2024</div>
                      <div style={{ fontSize: "0.55rem", color: "var(--sd-text-muted, #737373)" }}>PDF Document</div>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.6rem", color: "var(--sd-text-muted, #737373)", margin: 0, lineHeight: 1.4 }}>Laporan lengkap hasil perlombaan 17 Agustus 2024</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#059669", fontSize: "0.6rem", fontWeight: 600, marginTop: "auto" }}>
                    <Download size={12} /> <span>Buka Dokumen</span>
                  </div>
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <PhotoLightbox
        photos={photos}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}

// ==================== DATABASE 2023 TAB ====================
function Database2023Tab() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isPlaying, togglePlay } = useMusic();
  const [musicWasPlaying, setMusicWasPlaying] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleVideoPlay = () => {
    if (isPlaying) {
      setMusicWasPlaying(true);
      togglePlay();
    }
  };

  const handleVideoPause = () => {
    if (musicWasPlaying) {
      togglePlay();
      setMusicWasPlaying(false);
    }
  };

  const handleVideoEnded = () => {
    if (musicWasPlaying) {
      togglePlay();
      setMusicWasPlaying(false);
    }
  };

  const photos = [
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.41.13%20PM.jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.41.14%20PM.jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.41.15%20PM.jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.41.15%20PM%20(1).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.41.15%20PM%20(2).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.41.32%20PM.jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.05%20PM.jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.44%20PM.jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.45%20PM.jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.45%20PM%20(1).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.45%20PM%20(2).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.45%20PM%20(3).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.46%20PM.jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.46%20PM%20(1).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.46%20PM%20(2).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.46%20PM%20(3).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.47%20PM.jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.47%20PM%20(1).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.47%20PM%20(2).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.47%20PM%20(3).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.48%20PM.jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.48%20PM%20(1).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.48%20PM%20(2).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.49%20PM.jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.49%20PM%20(1).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.50%20PM.jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.50%20PM%20(1).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.51%20PM.jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.51%20PM%20(1).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.51%20PM%20(2).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.51%20PM%20(3).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.43.31%20PM.jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.43.32%20PM.jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.43.32%20PM%20(1).jpeg",
    "/hall-of-fame%202023/WhatsApp%20Image%202026-07-22%20at%2010.43.32%20PM%20(2).jpeg",
  ];

  const videos = [
    "/hall-of-fame%202023/WhatsApp%20Video%202026-07-22%20at%2010.41.31%20PM.mp4",
    "/hall-of-fame%202023/WhatsApp%20Video%202026-07-22%20at%2010.42.43%20PM.mp4",
    "/hall-of-fame%202023/WhatsApp%20Video%202026-07-22%20at%2010.42.52%20PM.mp4",
    "/hall-of-fame%202023/WhatsApp%20Video%202026-07-22%20at%2010.42.52%20PM%20(1).mp4",
    "/hall-of-fame%202023/WhatsApp%20Video%202026-07-22%20at%2010.42.58%20PM.mp4",
    "/hall-of-fame%202023/WhatsApp%20Video%202026-07-22%20at%2010.43.27%20PM.mp4",
    "/hall-of-fame%202023/WhatsApp%20Video%202026-07-22%20at%2010.43.28%20PM.mp4",
    "/hall-of-fame%202023/WhatsApp%20Video%202026-07-22%20at%2010.43.31%20PM.mp4",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
        setIsTransitioning(false);
      }, 1500);
    }, 4000);
    return () => clearInterval(interval);
  }, [photos.length]);

  return (
    <div>
      {/* Logo HUT RI 78 with animation */}
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem 1rem 1rem" }}>
        <motion.img
          src="/logohutri78.jpeg"
          alt="Logo HUT RI Ke-78"
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: [1, 1.08, 1, 1.05, 1],
            rotate: [0, 5, -5, 3, 0],
            y: [0, -10, 0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ width: "clamp(160px, 30vw, 260px)", height: "auto", borderRadius: "16px", filter: "drop-shadow(0 6px 20px rgba(220,38,38,0.4))" }}
        />
      </div>

      {/* Hall of Fame 2023 */}
      <div style={{ width: "100%", maxWidth: "56rem", margin: "0 auto", padding: "0 clamp(0.75rem, 3vw, 1.25rem)" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          style={{ background: "var(--sd-bg-card, #fff)", borderRadius: "clamp(0.75rem, 2vw, 1.25rem)", border: "1px solid var(--sd-border, #e5e5e5)", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", overflow: "hidden" }}>

          <div style={{ background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)", padding: "clamp(1rem, 3vw, 1.5rem) clamp(1rem, 3vw, 2rem)", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-2rem", right: "-2rem", width: "6rem", height: "6rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)" }} />
            <div style={{ position: "absolute", bottom: "-1rem", left: "-1rem", width: "4rem", height: "4rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)" }} />
            <div style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "0.5rem" }}>&#127942;</div>
            <h2 style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Hall of Fame 2023</h2>
            <p style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)", color: "rgba(255,255,255,0.8)", marginTop: "0.25rem" }}>Malam Tirakat 16 Agustus &amp; HUT RI Ke-78 - 17 Agustus 2023</p>
          </div>

          <div style={{ padding: "clamp(1rem, 3vw, 2rem)" }}>
            <div
              style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "0.75rem", overflow: "hidden", backgroundColor: "var(--sd-bg-secondary, #f5f5f5)", animation: "glowPulse 3s ease-in-out infinite", cursor: "zoom-in" }}
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={photos[currentIndex]}
                alt={`Hall of Fame 2023 - ${currentIndex + 1}`}
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
                Momen-momen indah perayaan Malam Tirakat &amp; HUT RI Ke-78 bersama warga Melimewah
              </p>
            </div>

            {/* Video Highlights */}
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <span style={{ display: "inline-block", backgroundColor: "#dc2626", color: "#fff", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.25rem 0.75rem", borderRadius: "9999px", marginBottom: "0.5rem" }}>&#127909; Video Highlights</span>
                <h3 style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", fontWeight: 800, color: "var(--sd-text, #262626)", margin: "0.5rem 0 0" }}>Dokumentasi Video Perayaan 2023</h3>
              </div>
              <style>{`
                .video-grid-2023 { display: grid; grid-template-columns: 1fr; gap: 1rem; }
                @media (min-width: 640px) { .video-grid-2023 { grid-template-columns: repeat(2, 1fr); } }
                .video-card-2023 video { width: 100%; display: block; background: #000; border-radius: 0.5rem 0.5rem 0 0; }
              `}</style>
              <div className="video-grid-2023">
                {videos.map((video, idx) => (
                  <motion.div
                    key={idx}
                    className="video-card-2023"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                    style={{ backgroundColor: "var(--sd-bg-secondary, #fafafa)", borderRadius: "0.75rem", border: "1px solid var(--sd-border, #e5e5e5)", overflow: "hidden" }}
                  >
                    <video
                      controls
                      preload="metadata"
                      playsInline
                      onPlay={handleVideoPlay}
                      onPause={handleVideoPause}
                      onEnded={handleVideoEnded}
                    >
                      <source src={video} type="video/mp4" />
                    </video>
                    <div style={{ padding: "clamp(0.5rem, 2vw, 0.75rem)" }}>
                      <p style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.7rem)", color: "var(--sd-text-muted, #737373)", margin: 0, textAlign: "center" }}>Video {idx + 1}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Susunan Panitia Inti */}
            <div style={{ marginTop: "1.5rem", padding: "clamp(1rem, 3vw, 1.5rem)", backgroundColor: "var(--sd-bg-secondary, #fafafa)", borderRadius: "0.75rem", border: "1px solid var(--sd-border, #e5e5e5)" }}>
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <span style={{ display: "inline-block", backgroundColor: "#dc2626", color: "#fff", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.25rem 0.75rem", borderRadius: "9999px", marginBottom: "0.5rem" }}>Panitia Inti</span>
                <h3 style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", fontWeight: 800, color: "var(--sd-text, #262626)", margin: "0.5rem 0 0" }}>Susunan Pengurus Malam Tirakat &amp; HUT RI Ke-78 Tahun 2023</h3>
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

            {/* Poster Lomba 2023 */}
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <span style={{ display: "inline-block", backgroundColor: "#dc2626", color: "#fff", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.25rem 0.75rem", borderRadius: "9999px", marginBottom: "0.5rem" }}>&#127991; Poster Lomba</span>
                <h3 style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", fontWeight: 800, color: "var(--sd-text, #262626)", margin: "0.5rem 0 0" }}>Poster Perlombaan HUT RI Ke-78</h3>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <img
                  src="/laporan%202023/WhatsApp%20Image%202026-07-22%20at%2010.42.06%20PM.jpeg"
                  alt="Poster Lomba HUT RI 78"
                  style={{ width: "100%", maxWidth: "400px", height: "auto", borderRadius: "0.75rem", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
                />
              </div>
            </div>

            {/* Laporan Kegiatan 2023 */}
            <div style={{ marginTop: "1.5rem", padding: "clamp(1rem, 3vw, 1.5rem)", backgroundColor: "var(--sd-bg-secondary, #fafafa)", borderRadius: "0.75rem", border: "1px solid var(--sd-border, #e5e5e5)" }}>
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <span style={{ display: "inline-block", backgroundColor: "#2563eb", color: "#fff", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.25rem 0.75rem", borderRadius: "9999px", marginBottom: "0.5rem" }}>&#128196; Laporan Kegiatan</span>
                <h3 style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", fontWeight: 800, color: "var(--sd-text, #262626)", margin: "0.5rem 0 0" }}>Dokumen Transparansi Kegiatan 2023</h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem" }}>
                <motion.a
                  href="/laporan%202023/Laporan_Keuangan_HUT78_Gang_Meli.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  style={{ backgroundColor: "var(--sd-bg-card, #fff)", border: "1px solid var(--sd-border, #e5e5e5)", borderRadius: "0.75rem", padding: "1rem", textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.5rem", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "linear-gradient(135deg, #dc2626, #b91c1c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><FileText size={14} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--sd-text, #262626)" }}>Laporan Keuangan HUT 78</div>
                      <div style={{ fontSize: "0.55rem", color: "var(--sd-text-muted, #737373)" }}>PDF Document</div>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.6rem", color: "var(--sd-text-muted, #737373)", margin: 0, lineHeight: 1.4 }}>Laporan transparansi keuangan perayaan HUT RI Ke-78 Gang Melimewah</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#2563eb", fontSize: "0.6rem", fontWeight: 600, marginTop: "auto" }}>
                    <Download size={12} /> <span>Buka Dokumen</span>
                  </div>
                </motion.a>

                <motion.a
                  href="/laporan%202023/Rekap_Bagan_Badminton_Lengkap.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  style={{ backgroundColor: "var(--sd-bg-card, #fff)", border: "1px solid var(--sd-border, #e5e5e5)", borderRadius: "0.75rem", padding: "1rem", textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.5rem", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "linear-gradient(135deg, #059669, #047857)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><FileText size={14} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--sd-text, #262626)" }}>Rekap Bagan Badminton</div>
                      <div style={{ fontSize: "0.55rem", color: "var(--sd-text-muted, #737373)" }}>PDF Document</div>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.6rem", color: "var(--sd-text-muted, #737373)", margin: 0, lineHeight: 1.4 }}>Rekap bagan lengkap perlombaan badminton HUT RI Ke-78</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#059669", fontSize: "0.6rem", fontWeight: 600, marginTop: "auto" }}>
                    <Download size={12} /> <span>Buka Dokumen</span>
                  </div>
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <PhotoLightbox
        photos={photos}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}

// ==================== DATABASE 2022 TAB ====================
function Database2022Tab() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isPlaying, togglePlay } = useMusic();
  const [musicWasPlaying, setMusicWasPlaying] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleVideoPlay = () => {
    if (isPlaying) {
      setMusicWasPlaying(true);
      togglePlay();
    }
  };

  const handleVideoPause = () => {
    if (musicWasPlaying) {
      togglePlay();
      setMusicWasPlaying(false);
    }
  };

  const handleVideoEnded = () => {
    if (musicWasPlaying) {
      togglePlay();
      setMusicWasPlaying(false);
    }
  };

  const photos = [
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.21.41%20AM.jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.21.41%20AM%20(1).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.21.42%20AM.jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.21.42%20AM%20(1).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.21.42%20AM%20(2).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.21.53%20AM.jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.21.53%20AM%20(1).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.21.53%20AM%20(2).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.21.54%20AM.jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.21.54%20AM%20(1).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.21.54%20AM%20(2).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.21.55%20AM.jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.21.55%20AM%20(1).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.15%20AM.jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.15%20AM%20(1).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.15%20AM%20(2).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.15%20AM%20(3).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.16%20AM.jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.16%20AM%20(1).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.17%20AM.jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.17%20AM%20(1).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.17%20AM%20(2).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.17%20AM%20(3).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.18%20AM.jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.18%20AM%20(1).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.19%20AM.jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.19%20AM%20(1).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.19%20AM%20(2).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.20%20AM.jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.20%20AM%20(1).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.20%20AM%20(2).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.20%20AM%20(3).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.21%20AM.jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.21%20AM%20(1).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.21%20AM%20(2).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.22%20AM.jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.22%20AM%20(1).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.22%20AM%20(2).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.22%20AM%20(3).jpeg",
    "/hall-of-fame%202022/WhatsApp%20Image%202026-07-23%20at%201.22.23%20AM.jpeg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
        setIsTransitioning(false);
      }, 1500);
    }, 4000);
    return () => clearInterval(interval);
  }, [photos.length]);

  return (
    <div>
      {/* Logo HUT RI 77 with animation */}
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem 1rem 1rem" }}>
        <motion.img
          src="/logohutri77.jpeg"
          alt="Logo HUT RI Ke-77"
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: [1, 1.08, 1, 1.05, 1],
            rotate: [0, 5, -5, 3, 0],
            y: [0, -10, 0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ width: "clamp(160px, 30vw, 260px)", height: "auto", borderRadius: "16px", filter: "drop-shadow(0 6px 20px rgba(220,38,38,0.4))" }}
        />
      </div>

      {/* Hall of Fame 2022 */}
      <div style={{ width: "100%", maxWidth: "56rem", margin: "0 auto", padding: "0 clamp(0.75rem, 3vw, 1.25rem)" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          style={{ background: "var(--sd-bg-card, #fff)", borderRadius: "clamp(0.75rem, 2vw, 1.25rem)", border: "1px solid var(--sd-border, #e5e5e5)", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", overflow: "hidden" }}>

          <div style={{ background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)", padding: "clamp(1rem, 3vw, 1.5rem) clamp(1rem, 3vw, 2rem)", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-2rem", right: "-2rem", width: "6rem", height: "6rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)" }} />
            <div style={{ position: "absolute", bottom: "-1rem", left: "-1rem", width: "4rem", height: "4rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)" }} />
            <div style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "0.5rem" }}>&#127942;</div>
            <h2 style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Hall of Fame 2022</h2>
            <p style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)", color: "rgba(255,255,255,0.8)", marginTop: "0.25rem" }}>Malam Tirakat 16 Agustus &amp; HUT RI Ke-77 - 17 Agustus 2022</p>
          </div>

          <div style={{ padding: "clamp(1rem, 3vw, 2rem)" }}>
            <div
              style={{ position: "relative", width: "100%", maxHeight: "500px", borderRadius: "0.75rem", overflow: "hidden", backgroundColor: "#000", display: "flex", justifyContent: "center", alignItems: "center", cursor: "zoom-in" }}
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={photos[currentIndex]}
                alt={`Hall of Fame 2022 - ${currentIndex + 1}`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "500px",
                  objectFit: "contain",
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
                Momen-momen indah perayaan Malam Tirakat &amp; HUT RI Ke-77 bersama warga Melimewah
              </p>
            </div>

            {/* Video Highlights */}
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <span style={{ display: "inline-block", backgroundColor: "#dc2626", color: "#fff", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.25rem 0.75rem", borderRadius: "9999px", marginBottom: "0.5rem" }}>&#127909; Video Highlights</span>
                <h3 style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", fontWeight: 800, color: "var(--sd-text, #262626)", margin: "0.5rem 0 0" }}>Dokumentasi Video Perayaan 2022</h3>
              </div>
              <style>{`
                .video-grid-2022 { display: grid; grid-template-columns: 1fr; gap: 1rem; }
                @media (min-width: 640px) { .video-grid-2022 { grid-template-columns: repeat(2, 1fr); } }
                .video-card-2022 video { width: 100%; display: block; background: #000; border-radius: 0.5rem 0.5rem 0 0; }
              `}</style>
              <div className="video-grid-2022">
                {[
                  "/hall-of-fame%202022/WhatsApp%20Video%202026-07-23%20at%201.21.53%20AM.mp4",
                  "/hall-of-fame%202022/WhatsApp%20Video%202026-07-23%20at%201.22.14%20AM.mp4",
                  "/hall-of-fame%202022/WhatsApp%20Video%202026-07-23%20at%201.22.16%20AM.mp4",
                  "/hall-of-fame%202022/WhatsApp%20Video%202026-07-23%20at%201.22.18%20AM.mp4",
                ].map((video, idx) => (
                  <motion.div
                    key={idx}
                    className="video-card-2022"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                    style={{ backgroundColor: "var(--sd-bg-secondary, #fafafa)", borderRadius: "0.75rem", border: "1px solid var(--sd-border, #e5e5e5)", overflow: "hidden" }}
                  >
                    <video
                      controls
                      preload="metadata"
                      playsInline
                      onPlay={handleVideoPlay}
                      onPause={handleVideoPause}
                      onEnded={handleVideoEnded}
                    >
                      <source src={video} type="video/mp4" />
                    </video>
                    <div style={{ padding: "clamp(0.5rem, 2vw, 0.75rem)" }}>
                      <p style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.7rem)", color: "var(--sd-text-muted, #737373)", margin: 0, textAlign: "center" }}>Video {idx + 1}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Susunan Panitia Inti */}
            <div style={{ marginTop: "1.5rem", padding: "clamp(1rem, 3vw, 1.5rem)", backgroundColor: "var(--sd-bg-secondary, #fafafa)", borderRadius: "0.75rem", border: "1px solid var(--sd-border, #e5e5e5)" }}>
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <span style={{ display: "inline-block", backgroundColor: "#dc2626", color: "#fff", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.25rem 0.75rem", borderRadius: "9999px", marginBottom: "0.5rem" }}>Panitia Inti</span>
                <h3 style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", fontWeight: 800, color: "var(--sd-text, #262626)", margin: "0.5rem 0 0" }}>Susunan Pengurus Malam Tirakat &amp; HUT RI Ke-77 Tahun 2022</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", backgroundColor: "var(--sd-bg-card, #fff)", borderRadius: "0.5rem", border: "1px solid var(--sd-border, #e5e5e5)" }}>
                  <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "linear-gradient(135deg, #dc2626, #b91c1c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><Shield size={18} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "var(--sd-text-muted, #737373)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pembina</div>
                    <div style={{ fontSize: "clamp(0.8rem, 2vw, 0.95rem)", fontWeight: 700, color: "var(--sd-text, #262626)" }}>Bapak Benny</div>
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

            {/* Laporan Kegiatan 2022 */}
            <div style={{ marginTop: "1.5rem", padding: "clamp(1rem, 3vw, 1.5rem)", backgroundColor: "var(--sd-bg-secondary, #fafafa)", borderRadius: "0.75rem", border: "1px solid var(--sd-border, #e5e5e5)" }}>
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <span style={{ display: "inline-block", backgroundColor: "#2563eb", color: "#fff", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.25rem 0.75rem", borderRadius: "9999px", marginBottom: "0.5rem" }}>&#128196; Laporan Kegiatan</span>
                <h3 style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", fontWeight: 800, color: "var(--sd-text, #262626)", margin: "0.5rem 0 0" }}>Dokumen Transparansi Kegiatan 2022</h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem" }}>
                <motion.a
                  href="/laporan%202022/Laporan_Pesta_Rakyat_Gang_Meli.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  style={{ backgroundColor: "var(--sd-bg-card, #fff)", border: "1px solid var(--sd-border, #e5e5e5)", borderRadius: "0.75rem", padding: "1rem", textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.5rem", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "linear-gradient(135deg, #dc2626, #b91c1c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><FileText size={14} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--sd-text, #262626)" }}>Laporan Pesta Rakyat</div>
                      <div style={{ fontSize: "0.55rem", color: "var(--sd-text-muted, #737373)" }}>PDF Document</div>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.6rem", color: "var(--sd-text-muted, #737373)", margin: 0, lineHeight: 1.4 }}>Laporan pesta rakyat perayaan HUT RI Ke-77 Gang Melimewah</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#2563eb", fontSize: "0.6rem", fontWeight: 600, marginTop: "auto" }}>
                    <Download size={12} /> <span>Buka Dokumen</span>
                  </div>
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <PhotoLightbox
        photos={photos}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}

// ==================== GAME: TAP MERDEKA ====================
function GameTab() {
  const [gameState, setGameState] = useState("idle"); // idle, playing, finished
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState([]);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem("tap_merdeka_best");
    return saved ? parseInt(saved) : 0;
  });
  const [combo, setCombo] = useState(0);
  const [lastHit, setLastHit] = useState(null);
  const gameRef = useRef(null);
  const targetIdRef = useRef(0);

  const emojis = [
    { emoji: "🇮🇩", points: 10, size: 40 },
    { emoji: "🦅", points: 15, size: 35 },
    { emoji: "⭐", points: 20, size: 30 },
    { emoji: "🎉", points: 25, size: 32 },
    { emoji: "🔥", points: 30, size: 28 },
    { emoji: "💣", points: -20, size: 35 }, // bomb - lose points
  ];

  const spawnTarget = () => {
    const rect = gameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const type = emojis[Math.floor(Math.random() * emojis.length)];
    const id = targetIdRef.current++;
    const x = Math.random() * (rect.width - 60) + 10;
    const y = Math.random() * (rect.height - 60) + 10;
    setTargets(prev => [...prev, { id, x, y, ...type, born: Date.now() }]);
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== id));
    }, 1500);
  };

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
    setCombo(0);
    targetIdRef.current = 0;
  };

  const endGame = () => {
    setGameState("finished");
    setTargets([]);
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("tap_merdeka_best", score);
    }
  };

  const hitTarget = (id, points, emoji) => {
    if (gameState !== "playing") return;
    setTargets(prev => prev.filter(t => t.id !== id));
    if (points < 0) {
      setScore(prev => Math.max(0, prev + points));
      setCombo(0);
      setLastHit({ emoji: "💥", points });
    } else {
      const newCombo = combo + 1;
      const bonus = newCombo >= 5 ? 2 : newCombo >= 3 ? 1.5 : 1;
      const finalPoints = Math.round(points * bonus);
      setScore(prev => prev + finalPoints);
      setCombo(newCombo);
      setLastHit({ emoji: "✨", points: finalPoints });
    }
    setTimeout(() => setLastHit(null), 500);
  };

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) { endGame(); return; }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Spawn targets
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      const count = timeLeft > 20 ? 2 : timeLeft > 10 ? 3 : 4;
      for (let i = 0; i < count; i++) setTimeout(spawnTarget, i * 200);
    }, 800);
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  return (
    <div style={{ padding: "clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1.25rem)" }}>
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "clamp(1.125rem, 3vw, 1.5rem)", fontWeight: 900, color: "var(--sd-text)", margin: "0 0 0.25rem" }}>Tap <span style={{ color: "#dc2626" }}>Merdeka!</span></h2>
        <p style={{ color: "var(--sd-text-muted)", fontSize: "0.75rem", margin: 0 }}>Tap emoji sebanyak mungkin dalam 30 detik!</p>
      </div>

      {/* Score & Timer Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "500px", margin: "0 auto 0.75rem", padding: "0.75rem 1rem", backgroundColor: "var(--sd-bg-card)", border: "1px solid var(--sd-border)", borderRadius: "0.75rem" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.6rem", color: "var(--sd-text-muted)", textTransform: "uppercase" }}>Skor</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#dc2626" }}>{score}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.6rem", color: "var(--sd-text-muted)", textTransform: "uppercase" }}>Waktu</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 900, color: timeLeft <= 10 ? "#dc2626" : "var(--sd-text)" }}>{timeLeft}s</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.6rem", color: "var(--sd-text-muted)", textTransform: "uppercase" }}>Combo</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 900, color: combo >= 5 ? "#d97706" : combo >= 3 ? "#059669" : "var(--sd-text)" }}>{combo}x</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.6rem", color: "var(--sd-text-muted)", textTransform: "uppercase" }}>Terbaik</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#7c3aed" }}>{bestScore}</div>
        </div>
      </div>

      {/* Game Area */}
      <div ref={gameRef} className="semarak-game-area" style={{ position: "relative", width: "100%", maxWidth: "500px", height: "clamp(300px, 50vh, 450px)", margin: "0 auto", backgroundColor: "var(--sd-bg-card)", border: "2px dashed var(--sd-border)", borderRadius: "1rem", overflow: "hidden", touchAction: "none", userSelect: "none" }}>
        {gameState === "idle" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <div style={{ fontSize: "4rem", animation: "bounce-soft 2s ease-in-out infinite" }}>🇮🇩</div>
            <p style={{ fontSize: "0.85rem", color: "var(--sd-text-muted)", textAlign: "center", padding: "0 1rem" }}>Tap emoji 🇮🇩🦅⭐🎉🔥 untuk dapat skor!<br/>Hindari bom 💣!</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
              style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff", border: "none", borderRadius: "9999px", padding: "0.75rem 2rem", fontSize: "0.9rem", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(220,38,38,0.4)" }}>
              MULAI BERMAIN
            </motion.button>
          </div>
        )}
        {gameState === "finished" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
            <div style={{ fontSize: "3rem" }}>{score >= 200 ? "🏆" : score >= 100 ? "🎉" : "💪"}</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--sd-text)", margin: 0 }}>SELESAI!</h3>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#dc2626" }}>{score} Poin</div>
            {score >= bestScore && score > 0 && <p style={{ fontSize: "0.75rem", color: "#d97706", fontWeight: 700, margin: 0 }}>🏆 Skor Tertinggi Baru!</p>}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
              style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff", border: "none", borderRadius: "9999px", padding: "0.625rem 1.5rem", fontSize: "0.85rem", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(220,38,38,0.4)" }}>
              MAIN LAGI
            </motion.button>
          </div>
        )}
        {targets.map(target => (
          <motion.div key={target.id} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
            onClick={() => hitTarget(target.id, target.points, target.emoji)}
            onTouchStart={(e) => { e.preventDefault(); hitTarget(target.id, target.points, target.emoji); }}
            style={{ position: "absolute", left: target.x, top: target.y, fontSize: `${target.size}px`, cursor: "pointer", zIndex: 10, filter: target.points < 0 ? "drop-shadow(0 0 8px rgba(220,38,38,0.8))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))", transition: "transform 0.1s" }}>
            {target.emoji}
          </motion.div>
        ))}
        {lastHit && (
          <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -30 }} style={{ position: "absolute", left: "50%", top: "50%", transform: "translateX(-50%)", fontSize: "1.5rem", fontWeight: 900, color: lastHit.points > 0 ? "#059669" : "#dc2626", pointerEvents: "none", zIndex: 20 }}>
            {lastHit.emoji} {lastHit.points > 0 ? "+" : ""}{lastHit.points}
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0.75rem", marginTop: "0.75rem", fontSize: "0.7rem", color: "var(--sd-text-muted)" }}>
        {emojis.map((e, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <span style={{ fontSize: "1rem" }}>{e.emoji}</span>
            <span>{e.points > 0 ? `+${e.points}` : e.points}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ==================== TAB: TIRAKATAN ====================
function TirakatanTab() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date("August 16, 2026 19:00:00").getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); clearInterval(interval); }
      else setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const rundown = [
    { time: "19:00", activity: "Persiapan & Penerimaan Tamu", icon: "📋" },
    { time: "19:30", activity: "Pembukaan & Doa Bersama", icon: "🤲" },
    { time: "20:00", activity: "Tausiyah / Ceramah Agama", icon: "📖" },
    { time: "20:45", activity: "Tilawah & Sholawat Bersama", icon: "🕌" },
    { time: "21:30", activity: "Ramah Tamah & Makan Bersama", icon: "🍛" },
    { time: "22:00", activity: "Doa Penutup & Foto Bersama", icon: "📸" },
  ];

  return (
    <div style={{ padding: "clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1.25rem)", maxWidth: "56rem", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🌙</div>
        <h2 style={{ fontSize: "clamp(1.25rem, 4vw, 1.75rem)", fontWeight: 900, color: "var(--sd-text)", margin: "0 0 0.375rem" }}>Malam <span style={{ color: "#dc2626" }}>Tirakatan</span></h2>
        <p style={{ color: "var(--sd-text-muted)", fontSize: "0.8rem", margin: 0 }}>Malam Sebelum Dirgahayu RI Ke-81</p>
      </div>

      {/* Countdown to Tirakatan */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b)", borderRadius: "1rem", padding: "1.5rem", textAlign: "center", marginBottom: "1.5rem", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-1rem", right: "-1rem", width: "4rem", height: "4rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: "-1rem", left: "-1rem", width: "3rem", height: "3rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.05)" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.25rem 0.75rem", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", fontSize: "0.65rem", fontWeight: 600, marginBottom: "1rem" }}>
          <Moon size={12} /> 16 Agustus 2026 Malam
        </div>
        <p style={{ fontSize: "0.8rem", opacity: 0.8, marginBottom: "1rem" }}>Menuju Malam Tirakatan</p>
        <div className="semarak-countdown-grid" style={{ maxWidth: "28rem", margin: "0 auto" }}>
          {[{ val: timeLeft.days, label: "Hari" }, { val: timeLeft.hours, label: "Jam" }, { val: timeLeft.minutes, label: "Menit" }, { val: timeLeft.seconds, label: "Detik" }].map((b, i) => (
            <div key={i}>
              <div style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "0.5rem", padding: "0.75rem 0.5rem", backdropFilter: "blur(4px)" }}>
                <div style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 900 }}>{String(b.val).padStart(2, "0")}</div>
              </div>
              <div style={{ fontSize: "0.6rem", opacity: 0.7, marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{b.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Info Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ backgroundColor: "var(--sd-bg-card)", border: "1px solid var(--sd-border)", borderRadius: "0.75rem", padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", backgroundColor: "#fbbf2420", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}><Coffee size={18} /></div>
            <div>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--sd-text)", margin: 0 }}>Waktu & Tempat</h3>
            </div>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--sd-text-muted)", lineHeight: 1.7 }}>
            <p style={{ margin: "0 0 0.375rem" }}><strong style={{ color: "var(--sd-text)" }}>Tanggal:</strong> 16 Agustus 2026</p>
            <p style={{ margin: "0 0 0.375rem" }}><strong style={{ color: "var(--sd-text)" }}>Waktu:</strong> 19:00 - Selesai</p>
            <p style={{ margin: 0 }}><strong style={{ color: "var(--sd-text)" }}>Lokasi:</strong> Halaman GG. Melimewah</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ backgroundColor: "var(--sd-bg-card)", border: "1px solid var(--sd-border)", borderRadius: "0.75rem", padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", backgroundColor: "#dc262620", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626" }}><Star size={18} /></div>
            <div>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--sd-text)", margin: 0 }}>Yang Perlu Dibawa</h3>
            </div>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--sd-text-muted)", lineHeight: 1.7 }}>
            <p style={{ margin: "0 0 0.375rem" }}>✅ Tikar / Kursi lipat</p>
            <p style={{ margin: "0 0 0.375rem" }}>✅ Sajadah / Mukena</p>
            <p style={{ margin: "0 0 0.375rem" }}>✅ Air mineral / Makanan ringan</p>
            <p style={{ margin: 0 }}>✅ Semangat kemerdekaan!</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ backgroundColor: "var(--sd-bg-card)", border: "1px solid var(--sd-border)", borderRadius: "0.75rem", padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", backgroundColor: "#05966920", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}><BookOpen size={18} /></div>
            <div>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--sd-text)", margin: 0 }}>Makna Tirakatan</h3>
            </div>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--sd-text-muted)", lineHeight: 1.7, margin: 0 }}>
            Tirakatan adalah tradisi malam menjelang 17 Agustus sebagai wujud rasa syukur dan mengenang jasa para pahlawan.
          </p>
        </motion.div>
      </div>

      {/* Rundown Acara */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ backgroundColor: "var(--sd-bg-card)", border: "1px solid var(--sd-border)", borderRadius: "0.75rem", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--sd-border)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Clock size={16} style={{ color: "#dc2626" }} />
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--sd-text)", margin: 0 }}>Rundown Acara</h3>
        </div>
        <div style={{ padding: "0.5rem" }}>
          {rundown.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
              className="semarak-rundown-item"
              style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 1rem", borderRadius: "0.5rem", marginBottom: i < rundown.length - 1 ? "0.25rem" : 0, transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--sd-bg-secondary, #f5f5f5)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
              <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", backgroundColor: "#dc262615", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--sd-text)", margin: 0 }}>{item.activity}</p>
              </div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#dc2626", flexShrink: 0 }}>{item.time}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ==================== TAB: TENTANG ====================
function TentangTab() {
  return (
    <div style={{ padding: "clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1.25rem)", maxWidth: "56rem", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "clamp(1.125rem, 3vw, 1.5rem)", fontWeight: 900, color: "var(--sd-text)", margin: "0 0 0.375rem" }}>Tentang <span style={{ color: "#dc2626" }}>Kami</span></h2>
        <p style={{ color: "var(--sd-text-muted)", fontSize: "0.8rem", margin: 0 }}>Mengenal lebih dekat GG. Melimewah</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {/* About Card */}
        <div style={{ backgroundColor: "var(--sd-bg-card)", border: "1px solid var(--sd-border)", borderRadius: "0.75rem", padding: "1.5rem", maxWidth: "56rem", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "linear-gradient(135deg, #dc2626, #b91c1c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Shield size={18} /></div>
            <div>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--sd-text)", margin: 0 }}>GG. Melimewah</h3>
              <p style={{ fontSize: "0.65rem", color: "var(--sd-text-muted)", margin: 0 }}>Komunitas Warga</p>
            </div>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--sd-text-muted)", lineHeight: 1.7, margin: 0 }}>
            Komunitas warga GG. Melimewah yang selalu menjaga semangat kekeluargaan dan gotong royong.
            Dengan sistem E-Meli, seluruh transaksi keuangan komunitas menjadi transparan dan dapat diakses oleh semua anggota.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "1rem" }}>
            {["Transparan", "Gotong Royong", "Modern"].map((tag, i) => (
              <span key={i} style={{ backgroundColor: "var(--sd-badge-bg)", border: "1px solid var(--sd-badge-border)", color: "var(--sd-badge-text)", fontSize: "0.6rem", fontWeight: 700, padding: "0.25rem 0.5rem", borderRadius: "9999px" }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN PAGE ====================
export default function SemarakPage() {
  const [dark, setDark] = useDarkMode();
  const [musicStarted, setMusicStarted] = useState(false);
  const [animationsStarted, setAnimationsStarted] = useState(false);
  const [activeTab, setActiveTab] = useState("beranda");

  const tabs = [
    { id: "beranda", label: "Home", icon: <Home size={16} /> },
    { id: "tirakatan", label: "Tirakatan", icon: <Moon size={16} /> },
    { id: "arsip", label: "Database 2025", icon: <Camera size={16} /> },
    { id: "database2024", label: "Database 2024", icon: <Camera size={16} /> },
    { id: "database2023", label: "Database 2023", icon: <Camera size={16} /> },
    { id: "database2022", label: "Database 2022", icon: <Camera size={16} /> },
    { id: "fitur", label: "Fitur", icon: <Sparkles size={16} /> },
    { id: "game", label: "Game", icon: <Gamepad2 size={16} /> },
    { id: "tentang", label: "Tentang", icon: <Info size={16} /> },
  ];

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
      <WelcomePopup onClose={() => { setMusicStarted(true); setAnimationsStarted(true); }} />
      <FloatingElements active={animationsStarted} />
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
      <div className="semarak-hero" style={{ position: "relative", background: "linear-gradient(-45deg, #b91c1c, #dc2626, #d97706, #b91c1c)", backgroundSize: "400% 400%", animation: animationsStarted ? "gradientShift 15s ease infinite" : "none", color: "#fff", padding: "clamp(2rem, 5vw, 4rem) 1rem", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", color: "#fca5a5", opacity: 0.2, pointerEvents: "none", fontSize: "clamp(2.5rem, 8vw, 4.5rem)", userSelect: "none", animation: animationsStarted ? "bounce-soft 5s ease-in-out infinite" : "none" }}>🇮🇩</div>
        <div style={{ position: "absolute", bottom: "0.75rem", right: "0.75rem", color: "#fca5a5", opacity: 0.2, pointerEvents: "none", fontSize: "clamp(2.5rem, 8vw, 4.5rem)", userSelect: "none", animation: animationsStarted ? "bounce-soft 5s ease-in-out infinite 1s" : "none" }}>🦅</div>
        <div style={{ position: "absolute", top: "50%", left: "10%", width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.05)", animation: animationsStarted ? "floatBubble 10s ease-in-out infinite" : "none" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "15%", width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", animation: animationsStarted ? "floatBubble 12s ease-in-out infinite 2s" : "none" }} />
        <div style={{ maxWidth: "48rem", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <motion.img
            key={animationsStarted ? "logo-animated" : "logo-static"}
            initial={animationsStarted ? { scale: 0, rotate: -180 } : { scale: 1, rotate: 0 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={animationsStarted ? { type: "spring", stiffness: 100, damping: 10, delay: 0.2 } : { duration: 0 }}
            src="/logo-hut-ri81.jpeg" alt="Logo HUT RI Ke-81" style={{ display: "block", width: "clamp(100px, 20vw, 180px)", maxWidth: "180px", height: "auto", margin: "0 auto 1rem", borderRadius: "12px", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.35))" }} />
          <motion.span
            initial={animationsStarted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={animationsStarted ? { delay: 0.4 } : { duration: 0 }}
            style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.25rem 0.75rem", borderRadius: "9999px", display: "inline-block", marginBottom: "0.5rem", animation: animationsStarted ? "pulse-glow 4s ease-in-out infinite" : "none" }}>Dirgahayu Republik Indonesia</motion.span>
          <motion.h2
            initial={animationsStarted ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={animationsStarted ? { delay: 0.5 } : { duration: 0 }}
            style={{ fontSize: "clamp(1.5rem, 6vw, 3.75rem)", fontWeight: 900, letterSpacing: "-0.025em", textTransform: "uppercase", lineHeight: 1.2, marginBottom: "0.5rem" }}>Selamat Datang Warga<br />Melimewah</motion.h2>
          <motion.p
            initial={animationsStarted ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={animationsStarted ? { delay: 0.6 } : { duration: 0 }}
            style={{ color: "#fecaca", fontSize: "clamp(0.7rem, 2.5vw, 1.125rem)", maxWidth: "36rem", margin: "0 auto", fontWeight: 500, lineHeight: 1.6, padding: "0 0.5rem" }}>Sambut kemerdekaan RI ke-81 dengan berkarya dan mempererat silaturahmi!</motion.p>
          <motion.div
            initial={animationsStarted ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={animationsStarted ? { delay: 0.7, type: "spring" } : { duration: 0 }}>
            <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#fff", color: "#b91c1c", fontWeight: 900, padding: "0.625rem 1.5rem", borderRadius: "9999px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "0.5rem", textDecoration: "none", transition: "all 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 15px 25px rgba(0,0,0,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)"; }}>
              Masuk ke Dashboard E-Meli
            </Link>
          </motion.div>
        </div>
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes floatBubble {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.1); }
          }
        `}</style>
      </div>

      {/* Running Text */}
      <div className="semarak-marquee" style={{ backgroundColor: "#dc2626", overflow: "hidden", whiteSpace: "nowrap", padding: "0.5rem 0" }}>
        <div style={{ display: "inline-block", animation: animationsStarted ? "marquee 30s linear infinite" : "none", color: "#fff", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em" }}>
          <span style={{ margin: "0 3rem" }}>MERDEKA!</span>
          <span style={{ margin: "0 3rem" }}>DIRGAHAYU REPUBLIK INDONESIA KE-81</span>
          <span style={{ margin: "0 3rem" }}>17 AGUSTUS 2026</span>
          <span style={{ margin: "0 3rem" }}>SEKALI MERDEKA TETAP MERDEKA</span>
          <span style={{ margin: "0 3rem" }}>BHINNEKA TUNGGAL IKA</span>
          <span style={{ margin: "0 3rem" }}>GG. MELIMEWAH BERSATU</span>
          <span style={{ margin: "0 3rem" }}>MERDEKA!</span>
          <span style={{ margin: "0 3rem" }}>DIRGAHAYU REPUBLIK INDONESIA KE-81</span>
          <span style={{ margin: "0 3rem" }}>17 AGUSTUS 2026</span>
          <span style={{ margin: "0 3rem" }}>SEKALI MERDEKA TETAP MERDEKA</span>
          <span style={{ margin: "0 3rem" }}>BHINNEKA TUNGGAL IKA</span>
          <span style={{ margin: "0 3rem" }}>GG. MELIMEWAH BERSATU</span>
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* Tab Navigation */}
      <motion.div
        initial={animationsStarted ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={animationsStarted ? { delay: 0.8 } : { duration: 0 }}
        style={{ backgroundColor: "var(--sd-bg-card)", borderBottom: "1px solid var(--sd-border)", position: "sticky", top: 0, zIndex: 40, transition: "background-color 0.3s" }}>
        <div className="semarak-tabs">
          {tabs.map((tab, i) => (
            <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="semarak-tab-btn"
              initial={animationsStarted ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={animationsStarted ? { delay: 0.9 + i * 0.1 } : { duration: 0 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: activeTab === tab.id ? "#dc2626" : "transparent",
                color: activeTab === tab.id ? "#fff" : "var(--sd-text-muted)",
                boxShadow: activeTab === tab.id ? "0 4px 12px rgba(220,38,38,0.3)" : "none"
              }}>
              {tab.icon}
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main sections */}
      <main style={{ flex: 1, paddingBottom: "3rem" }}>
        {activeTab === "beranda" && (
          <>
            <Countdown animationsStarted={animationsStarted} />
            <TeksProklamasi animationsStarted={animationsStarted} />

            {/* Coming Soon: Hall of Fame & Susunan Panitia */}
            <div style={{ width: "100%", maxWidth: "56rem", margin: "0 auto", padding: "1.5rem clamp(0.75rem, 3vw, 1.25rem)" }}>
              <div className="semarak-coming-soon-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
                {/* Hall of Fame Coming Soon */}
                <div style={{ backgroundColor: "var(--sd-bg-card)", border: "1px solid var(--sd-border)", borderRadius: "1rem", padding: "2rem 1.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, #dc2626, #d97706, #dc2626)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>&#127942;</div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--sd-text)", margin: "0 0 0.375rem" }}>Hall of Fame</h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--sd-text-muted)", margin: "0 0 1rem" }}>Momen-momen perayaan HUT RI Ke-81</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 1rem", borderRadius: "9999px", backgroundColor: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                    <span style={{ animation: "pulse 2s infinite" }}>&#128337;</span> COMING SOON
                  </div>
                </div>

                {/* Susunan Panitia Coming Soon */}
                <div style={{ backgroundColor: "var(--sd-bg-card)", border: "1px solid var(--sd-border)", borderRadius: "1rem", padding: "2rem 1.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, #d97706, #dc2626, #d97706)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>&#129333;</div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--sd-text)", margin: "0 0 0.375rem" }}>Susunan Panitia Inti</h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--sd-text-muted)", margin: "0 0 1rem" }}>Pengurus HUT RI Ke-81 Tahun 2026</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 1rem", borderRadius: "9999px", backgroundColor: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.2)", color: "#d97706", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                    <span style={{ animation: "pulse 2s infinite" }}>&#128337;</span> COMING SOON
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
        {activeTab === "tirakatan" && <TirakatanTab />}
        {activeTab === "arsip" && <ArsipTab />}
        {activeTab === "database2024" && <Database2024Tab />}
        {activeTab === "database2023" && <Database2023Tab />}
        {activeTab === "database2022" && <Database2022Tab />}
        {activeTab === "fitur" && <FiturTab />}
        {activeTab === "game" && <GameTab />}
        {activeTab === "tentang" && <TentangTab />}
      </main>

      {/* Music Player */}
      <MusicPlayer startTrigger={musicStarted} />

      {/* Footer */}
      <footer className="semarak-footer" style={{ backgroundColor: "var(--sd-bg-card)", borderTop: "1px solid var(--sd-border)", padding: "1.25rem", textAlign: "center", userSelect: "none", marginTop: "auto", transition: "background-color 0.3s" }}>
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
