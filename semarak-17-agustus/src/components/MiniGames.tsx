import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Play, RotateCcw, AlertTriangle, HelpCircle, Swords, Volume2 } from "lucide-react";

// Web Audio API Synthesizer for retro crunch/bite/triumph sound effects
const playSound = (type: "crunch" | "triumph" | "pull") => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    if (type === "crunch") {
      // Short high-frequency noise burst for eating cracker
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } else if (type === "pull") {
      // Low bass drum-like thud for pulling rope
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === "triumph") {
      // Fanfare notes (Merdeka scale)
      const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.15);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.15);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + index * 0.15 + 0.02);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + index * 0.15 + 0.14);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.15);
        osc.stop(ctx.currentTime + index * 0.15 + 0.15);
      });
    }
  } catch (e) {
    console.error("Audio API error:", e);
  }
};

export default function MiniGames() {
  const [activeGame, setActiveGame] = useState<"kerupuk" | "tambang" | "karung" | "kelereng">("kerupuk");

  // Game 3: Balap Karung States
  const [karungPlayerPos, setKarungPlayerPos] = useState(0);
  const [karungAiPos, setKarungAiPos] = useState(0);
  const [karungStatus, setKarungStatus] = useState<"idle" | "playing" | "player-win" | "ai-win">("idle");
  const [karungIndicator, setKarungIndicator] = useState(0); // -100 to 100
  const [karungDifficulty, setKarungDifficulty] = useState<"mudah" | "sedang" | "sulit">("sedang");
  const [isStumbled, setIsStumbled] = useState(false);

  // Game 4: Balap Kelereng States
  const [kelerengPlayerPos, setKelerengPlayerPos] = useState(0);
  const [kelerengAiPos, setKelerengAiPos] = useState(0);
  const [kelerengStatus, setKelerengStatus] = useState<"idle" | "playing" | "player-win" | "ai-win">("idle");
  const [kelerengBalance, setKelerengBalance] = useState(0); // -100 to 100
  const [kelerengDifficulty, setKelerengDifficulty] = useState<"mudah" | "sedang" | "sulit">("sedang");
  const [isKelerengDropped, setIsKelerengDropped] = useState(false);

  // Game 1: Makan Kerupuk States
  const [kerupukBites, setKerupukBites] = useState(0);
  const [kerupukLevel, setKerupukLevel] = useState(1);
  const [kerupukScore, setKerupukScore] = useState(0);
  const [kerupukHighScore, setKerupukHighScore] = useState(0);
  const [isKerupukWin, setIsKerupukWin] = useState(false);
  const [swingSpeed, setSwingSpeed] = useState(3); // duration in seconds of swing animation
  const [swingX, setSwingX] = useState(0);

  // Swing motion simulator for clicking coordination
  useEffect(() => {
    let frameId: number;
    let start: number | null = null;
    
    if (activeGame === "kerupuk" && !isKerupukWin) {
      const updateSwing = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        // Swing left/right with sine wave
        const speedMultiplier = 0.001 * (1.5 + kerupukLevel * 0.8);
        const currentX = Math.sin(elapsed * speedMultiplier) * 75; // -75 to 75px swing
        setSwingX(currentX);
        frameId = requestAnimationFrame(updateSwing);
      };
      frameId = requestAnimationFrame(updateSwing);
    }
    return () => cancelAnimationFrame(frameId);
  }, [activeGame, isKerupukWin, kerupukLevel]);

  // Load high scores
  useEffect(() => {
    const kHS = localStorage.getItem("high_score_kerupuk");
    if (kHS) setKerupukHighScore(Number(kHS));
  }, []);

  const handleBiteKerupuk = () => {
    if (isKerupukWin) return;

    // Accuracy factor: if cracker is swinging far, it's harder to bite!
    const distance = Math.abs(swingX);
    const biteStrength = distance < 25 ? 10 : distance < 50 ? 5 : 2; // closer to center = more bite!

    playSound("crunch");
    setKerupukBites((prev) => {
      const next = prev + biteStrength;
      if (next >= 100) {
        setIsKerupukWin(true);
        playSound("triumph");
        const finalScore = Math.max(10, 1000 - (kerupukLevel * 100)); // fewer bites = higher score
        setKerupukScore(finalScore);
        if (finalScore > kerupukHighScore) {
          setKerupukHighScore(finalScore);
          localStorage.setItem("high_score_kerupuk", String(finalScore));
        }
        return 100;
      }
      return next;
    });
  };

  const handleNextKerupukLevel = () => {
    setKerupukBites(0);
    setIsKerupukWin(false);
    setKerupukLevel((prev) => prev + 1);
  };

  const handleResetKerupuk = () => {
    setKerupukBites(0);
    setIsKerupukWin(false);
    setKerupukLevel(1);
    setKerupukScore(0);
  };

  // Game 2: Tarik Tambang States
  const [ropePosition, setRopePosition] = useState(0); // -100 to 100 (player is +ve, AI is -ve)
  const [tambangDifficulty, setTambangDifficulty] = useState<"mudah" | "sedang" | "sulit">("sedang");
  const [tambangStatus, setTambangStatus] = useState<"idle" | "playing" | "player-win" | "ai-win">("idle");
  const [aiTimer, setAiTimer] = useState<NodeJS.Timeout | null>(null);

  const startTambang = () => {
    setRopePosition(0);
    setTambangStatus("playing");
    playSound("pull");
  };

  // AI Pulling loop
  useEffect(() => {
    if (activeGame === "tambang" && tambangStatus === "playing") {
      const aiPullForce = tambangDifficulty === "mudah" ? 2.5 : tambangDifficulty === "sedang" ? 4.5 : 7.0;
      const pullInterval = setInterval(() => {
        setRopePosition((prev) => {
          const next = prev - (Math.random() * aiPullForce);
          if (next <= -100) {
            clearInterval(pullInterval);
            setTambangStatus("ai-win");
            return -100;
          }
          return next;
        });
      }, 100);
      return () => clearInterval(pullInterval);
    }
  }, [activeGame, tambangStatus, tambangDifficulty]);

  const handlePlayerPull = () => {
    if (tambangStatus !== "playing") return;

    playSound("pull");
    setRopePosition((prev) => {
      const next = prev + 6.5; // pull force
      if (next >= 100) {
        setTambangStatus("player-win");
        playSound("triumph");
        return 100;
      }
      return next;
    });
  };

  const handleResetTambang = () => {
    setRopePosition(0);
    setTambangStatus("idle");
  };

  // --- Game 3: Balap Karung Logic ---
  // Swing indicator loop
  useEffect(() => {
    if (activeGame === "karung" && karungStatus === "playing") {
      let direction = 1;
      const speed = karungDifficulty === "mudah" ? 6 : karungDifficulty === "sedang" ? 9 : 12;
      const swingInterval = setInterval(() => {
        setKarungIndicator((prev) => {
          let next = prev + direction * speed;
          if (next >= 100) {
            next = 100;
            direction = -1;
          } else if (next <= -100) {
            next = -100;
            direction = 1;
          }
          return next;
        });
      }, 30);
      return () => clearInterval(swingInterval);
    }
  }, [activeGame, karungStatus, karungDifficulty]);

  // AI progress loop
  useEffect(() => {
    if (activeGame === "karung" && karungStatus === "playing") {
      const aiSpeed = karungDifficulty === "mudah" ? 2.0 : karungDifficulty === "sedang" ? 3.5 : 5.0;
      const aiInterval = setInterval(() => {
        setKarungAiPos((prev) => {
          const next = prev + (Math.random() * aiSpeed + 1);
          if (next >= 100) {
            clearInterval(aiInterval);
            setKarungStatus("ai-win");
            return 100;
          }
          return next;
        });
      }, 250);
      return () => clearInterval(aiInterval);
    }
  }, [activeGame, karungStatus, karungDifficulty]);

  const handleKarungJump = () => {
    if (karungStatus !== "playing" || isStumbled) return;

    const absVal = Math.abs(karungIndicator);
    playSound("pull");

    if (absVal < 25) {
      // Perfect jump!
      setKarungPlayerPos((prev) => {
        const next = prev + 12;
        if (next >= 100) {
          setKarungStatus("player-win");
          playSound("triumph");
          return 100;
        }
        return next;
      });
    } else if (absVal < 60) {
      // Good jump
      setKarungPlayerPos((prev) => {
        const next = prev + 6;
        if (next >= 100) {
          setKarungStatus("player-win");
          playSound("triumph");
          return 100;
        }
        return next;
      });
    } else {
      // Miss - stumble!
      setIsStumbled(true);
      playSound("crunch"); // sound of falling
      setTimeout(() => {
        setIsStumbled(false);
      }, 1000);
    }
  };

  const startKarung = () => {
    setKarungPlayerPos(0);
    setKarungAiPos(0);
    setKarungStatus("playing");
    setKarungIndicator(0);
    setIsStumbled(false);
  };

  const handleResetKarung = () => {
    setKarungPlayerPos(0);
    setKarungAiPos(0);
    setKarungStatus("idle");
    setKarungIndicator(0);
  };

  // --- Game 4: Balap Kelereng Logic ---
  // Balance drift and check loop
  useEffect(() => {
    if (activeGame === "kelereng" && kelerengStatus === "playing" && !isKelerengDropped) {
      const driftRate = kelerengDifficulty === "mudah" ? 4 : kelerengDifficulty === "sedang" ? 7 : 10;
      const balanceInterval = setInterval(() => {
        setKelerengBalance((prev) => {
          const drift = (Math.random() * driftRate - driftRate / 2) + (prev * 0.05);
          const next = prev + drift;

          if (Math.abs(next) >= 95) {
            // Drop marble!
            setIsKelerengDropped(true);
            playSound("crunch"); // drop sound
            setKelerengPlayerPos((pos) => Math.max(0, pos - 10)); // setback penalty
            setTimeout(() => {
              setIsKelerengDropped(false);
              setKelerengBalance(0);
            }, 1200);
            return 0;
          }
          return next;
        });
      }, 100);
      return () => clearInterval(balanceInterval);
    }
  }, [activeGame, kelerengStatus, kelerengDifficulty, isKelerengDropped]);

  // AI progress loop
  useEffect(() => {
    if (activeGame === "kelereng" && kelerengStatus === "playing") {
      const aiSpeed = kelerengDifficulty === "mudah" ? 2.2 : kelerengDifficulty === "sedang" ? 3.8 : 5.5;
      const aiInterval = setInterval(() => {
        setKelerengAiPos((prev) => {
          const next = prev + (Math.random() * aiSpeed + 1);
          if (next >= 100) {
            clearInterval(aiInterval);
            setKelerengStatus("ai-win");
            return 100;
          }
          return next;
        });
      }, 250);
      return () => clearInterval(aiInterval);
    }
  }, [activeGame, kelerengStatus, kelerengDifficulty]);

  const handleKelerengStep = () => {
    if (kelerengStatus !== "playing" || isKelerengDropped) return;

    playSound("pull");
    // Wobble effect: stepping makes it unstable!
    const wobble = Math.random() * 40 - 20;
    setKelerengBalance((prev) => {
      const next = prev + wobble;
      return Math.min(100, Math.max(-100, next));
    });

    setKelerengPlayerPos((prev) => {
      const next = prev + 8;
      if (next >= 100) {
        setKelerengStatus("player-win");
        playSound("triumph");
        return 100;
      }
      return next;
    });
  };

  const handleKelerengBalance = (direction: "left" | "right") => {
    if (kelerengStatus !== "playing" || isKelerengDropped) return;
    playSound("pull");
    setKelerengBalance((prev) => {
      const correction = direction === "left" ? -25 : 25;
      const next = prev + correction;
      return Math.min(100, Math.max(-100, next));
    });
  };

  const startKelereng = () => {
    setKelerengPlayerPos(0);
    setKelerengAiPos(0);
    setKelerengStatus("playing");
    setKelerengBalance(0);
    setIsKelerengDropped(false);
  };

  const handleResetKelereng = () => {
    setKelerengPlayerPos(0);
    setKelerengAiPos(0);
    setKelerengStatus("idle");
    setKelerengBalance(0);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8" id="minigames-section">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-black text-neutral-800 uppercase tracking-tight">
          Arena <span className="text-red-600">Pesta Rakyat</span>
        </h2>
        <p className="text-neutral-500 mt-2 text-sm md:text-base max-w-2xl mx-auto">
          Nikmati simulasi lomba tradisional legendaris langsung dari browser Anda. Raih skor tertinggi dan buktikan ketangkasan Anda!
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-neutral-100 mb-8 max-w-2xl mx-auto pb-4">
        {[
          { id: "kerupuk", label: "Makan Kerupuk Clicker", icon: "🍘" },
          { id: "tambang", label: "Tarik Tambang", icon: "💪" },
          { id: "karung", label: "Balap Karung Rhythm", icon: "👜" },
          { id: "kelereng", label: "Balap Kelereng Balance", icon: "🥄" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveGame(tab.id as any);
              // reset states when changing game
              handleResetTambang();
              handleResetKarung();
              handleResetKelereng();
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-black uppercase tracking-wider transition-all cursor-pointer border ${
              activeGame === tab.id
                ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-500/10"
                : "bg-white text-neutral-500 border-neutral-200 hover:text-neutral-800 hover:border-neutral-300"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content wrapper */}
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-xl p-6 md:p-8 max-w-3xl mx-auto relative overflow-hidden">
        {/* Background glow flags */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-600 via-white to-red-600" />

        {/* GAME 1: MAKAN KERUPUK */}
        {activeGame === "kerupuk" && (
          <div className="text-center space-y-6">
            <div className="flex justify-between items-center bg-neutral-50 px-4 py-2 rounded-2xl border border-neutral-150 text-xs md:text-sm">
              <span className="font-bold text-neutral-500">Tingkat Kesulitan: <span className="text-red-600">Level {kerupukLevel}</span></span>
              <span className="font-bold text-neutral-600">Skor Tertinggi: <span className="text-amber-600">🏆 {kerupukHighScore}</span></span>
            </div>

            {/* Eating Playground */}
            <div className="h-[280px] bg-sky-50 rounded-2xl relative border-2 border-sky-100 overflow-hidden flex flex-col items-center justify-between p-4">
              
              {/* String attachment */}
              <div className="absolute top-0 w-2 h-4 bg-amber-800 rounded-b" />
              
              {/* swinging cracker assembly */}
              <motion.div
                style={{ x: swingX }}
                className="absolute top-4 flex flex-col items-center origin-top"
              >
                {/* String */}
                <div className="w-[1.5px] h-28 bg-neutral-600" />
                
                {/* Cracker (size depends on bites) */}
                <motion.div
                  className="relative cursor-pointer select-none active:scale-95"
                  onClick={handleBiteKerupuk}
                  title="Klik untuk menggigit!"
                >
                  <div
                    style={{
                      transform: `scale(${Math.max(0.1, 1 - kerupukBites / 100)})`,
                      transition: "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    }}
                    className="w-20 h-20 rounded-full bg-yellow-50 border-4 border-amber-200/70 shadow-lg flex items-center justify-center relative"
                  >
                    {/* Cracker porous patterns */}
                    <div className="absolute top-2 left-4 w-3 h-3 rounded-full border border-amber-200/40" />
                    <div className="absolute bottom-3 right-4 w-4 h-4 rounded-full border border-amber-200/40" />
                    <div className="absolute top-6 right-5 w-2 h-2 rounded-full border border-amber-200/40" />
                    <div className="absolute top-8 left-6 w-4 h-4 rounded-full border border-amber-200/40" />
                    
                    {/* Bite marks based on crunch progress */}
                    {kerupukBites > 15 && <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-sky-50 -mr-2 -mt-2" />}
                    {kerupukBites > 45 && <div className="absolute bottom-0 left-0 w-10 h-10 rounded-full bg-sky-50 -ml-3 -mb-3" />}
                    {kerupukBites > 75 && <div className="absolute top-1/2 left-0 w-8 h-8 rounded-full bg-sky-50 -ml-4" />}
                  </div>
                </motion.div>
              </motion.div>

              {/* Accuracy Target lines */}
              <div className="absolute bottom-1/3 inset-x-0 h-1 border-t-2 border-dashed border-red-500/20 flex justify-center items-center pointer-events-none">
                <span className="bg-red-500/10 text-red-600 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                  Zona Gigit Sempurna
                </span>
              </div>

              {/* Swing position marker indicator bar */}
              <div className="w-full max-w-xs bg-black/10 h-2 rounded-full relative mb-1">
                <div className="absolute left-1/2 -translate-x-1/2 w-12 h-full bg-emerald-500 rounded-full" />
                <motion.div
                  style={{ left: `calc(50% + ${swingX / 1.6}px)` }}
                  className="absolute w-3.5 h-3.5 -top-[3px] -translate-x-1/2 bg-red-600 rounded-full shadow-md"
                />
              </div>
            </div>

            {/* Instruction or victory screen */}
            <AnimatePresence mode="wait">
              {isKerupukWin ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-5 bg-gradient-to-br from-red-600 to-red-500 text-white rounded-2xl shadow-xl"
                >
                  <h4 className="text-xl font-extrabold mb-1 flex items-center justify-center gap-2">
                    🏆 KERUPUK HABIS! MERDEKA!
                  </h4>
                  <p className="text-xs opacity-90 max-w-md mx-auto mb-4">
                    Hebat sekali! Anda berhasil menaklukkan kerupuk level {kerupukLevel} dengan keseimbangan mulut pejuang!
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={handleResetKerupuk}
                      className="px-4 py-2 border border-white/40 hover:bg-white/10 rounded-xl font-bold text-xs transition-all uppercase cursor-pointer"
                    >
                      Ulangi Lomba
                    </button>
                    <button
                      onClick={handleNextKerupukLevel}
                      className="px-5 py-2 bg-white text-red-600 hover:bg-neutral-100 rounded-xl font-extrabold text-xs transition-all uppercase cursor-pointer"
                    >
                      Naik Level {kerupukLevel + 1}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between items-center text-xs font-semibold text-neutral-500 mb-1">
                      <span>Progres Makan</span>
                      <span>{kerupukBites}% Habis</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden border border-neutral-200">
                      <div
                        style={{ width: `${kerupukBites}%` }}
                        className="bg-gradient-to-r from-red-600 to-amber-500 h-full transition-all duration-150"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleBiteKerupuk}
                    className="w-full max-w-sm bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 active:scale-95 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-red-500/10 transition-all text-base uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Volume2 className="w-5 h-5" />
                    <span>GIGIT KERUPUK! (Klik/Tap) 🍘</span>
                  </button>

                  <p className="text-[11px] text-neutral-400 italic">
                    Tip Pejuang: Klik saat titik merah berada di tengah area hijau (zona gigit sempurna) agar gigitannya lebih besar!
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* GAME 2: TARIK TAMBANG */}
        {activeGame === "tambang" && (
          <div className="text-center space-y-6">
            <div className="flex justify-between items-center bg-neutral-50 px-4 py-2 rounded-2xl border border-neutral-150 text-xs md:text-sm">
              <div className="flex gap-1">
                {["mudah", "sedang", "sulit"].map((diff) => (
                  <button
                    key={diff}
                    disabled={tambangStatus === "playing"}
                    onClick={() => setTambangDifficulty(diff as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      tambangDifficulty === diff
                        ? "bg-red-600 text-white"
                        : "bg-neutral-200 text-neutral-500 hover:bg-neutral-300"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
              <span className="font-bold text-neutral-600">Lomba: <span className="text-red-600">Tarik Tambang Tradisional</span></span>
            </div>

            {/* Playground Arena */}
            <div className="h-[220px] bg-amber-50/70 rounded-2xl relative border-2 border-amber-100 overflow-hidden flex flex-col justify-between p-4">
              
              {/* Garis Tengah Batas Penentuan */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-dashed bg-red-600/30 -translate-x-1/2 flex items-center justify-center">
                <div className="absolute top-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                  <span>🏁 GARIS BATAS</span>
                </div>
              </div>

              {/* Tali Tambang Visual */}
              <div className="absolute top-1/2 left-0 right-0 h-2 bg-amber-700/60 -translate-y-1/2 flex items-center justify-center z-0">
                <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(255,255,255,0.25)_5px,rgba(255,255,255,0.25)_10px)]" />
              </div>

              {/* Pita Merah di Tengah Tali yang bergerak sesuai ropePosition */}
              <motion.div
                style={{ x: `${(ropePosition / 100) * 120}px` }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                transition={{ type: "spring", stiffness: 120 }}
              >
                <span className="text-3xl animate-bounce drop-shadow-md">🎀</span>
                <span className="text-[7px] bg-red-600 text-white px-1 rounded font-black uppercase tracking-wider">PITA</span>
              </motion.div>

              {/* Characters Visualizer (Player RT vs Tim Gang Sebelah) */}
              <div className="flex justify-between w-full h-full items-center relative z-10 px-4 md:px-12">
                
                {/* AI Team pulling (left side) */}
                <motion.div
                  style={{ x: `${(ropePosition / 100) * 40}px` }}
                  className="flex flex-col items-center"
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <div className="flex items-end gap-1">
                    <span className="text-4xl animate-pulse">👨‍🦱💪</span>
                    <span className="text-3xl">👨‍🦲</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-neutral-800 text-white px-2 py-0.5 rounded-full mt-1">Tim Gang Sebelah</span>
                </motion.div>

                {/* Player Team pulling (right side) */}
                <motion.div
                  style={{ x: `${(ropePosition / 100) * 40}px` }}
                  className="flex flex-col items-center"
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <div className="flex items-end gap-1">
                    <span className="text-3xl">👩‍🦰</span>
                    <span className="text-4xl animate-pulse">👩‍💼💪</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-full mt-1">Tim Gang Meli Mewah</span>
                </motion.div>

              </div>

              {/* Danger alerts */}
              {ropePosition < -50 && (
                <div className="absolute inset-x-0 bottom-4 flex justify-center animate-pulse">
                  <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Lawan hampir menarik tambang! Tarik lebih kuat! 🪢
                  </span>
                </div>
              )}
            </div>

            {/* Game Controls & States */}
            <AnimatePresence mode="wait">
              {tambangStatus === "idle" ? (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center p-4 bg-neutral-50 rounded-2xl border border-neutral-100"
                >
                  <h4 className="font-bold text-sm text-neutral-700 mb-2">Siap untuk Lomba Tarik Tambang?</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                    Tekan tombol mulai dan klik tombol TARIK secepat mungkin untuk menarik tali tambang ke pihak tim kita sebelum lawan menariknya!
                  </p>
                  <button
                    onClick={startTambang}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Mulai Pertandingan! 🪢
                  </button>
                </motion.div>
              ) : tambangStatus === "playing" ? (
                <div className="space-y-4">
                  {/* Pull strength indicator bar */}
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between items-center text-xs font-semibold text-neutral-500 mb-1">
                      <span>Tim Gang Sebelah</span>
                      <span>Tim Gang Meli Mewah</span>
                    </div>
                    <div className="w-full bg-neutral-200 h-3 rounded-full overflow-hidden border border-neutral-300 relative">
                      <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-red-600/50" />
                      <div
                        style={{
                          left: ropePosition >= 0 ? "50%" : `calc(50% - ${Math.abs(ropePosition) / 2}%)`,
                          width: `${Math.abs(ropePosition) / 2}%`,
                          backgroundColor: ropePosition >= 0 ? "#10b981" : "#ef4444"
                        }}
                        className="absolute h-full transition-all duration-100"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handlePlayerPull}
                    className="w-full max-w-sm bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 active:scale-95 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-red-500/10 transition-all text-base uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer select-none mx-auto"
                  >
                    <Swords className="w-5 h-5" />
                    <span>TARIK SEKUAT TENAGA! 🪢</span>
                  </button>
                </div>
              ) : (
                <motion.div
                  key="finish"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-6 rounded-2xl shadow-xl text-white ${
                    tambangStatus === "player-win" ? "bg-emerald-600" : "bg-red-700"
                  }`}
                >
                  {tambangStatus === "player-win" ? (
                    <div>
                      <h4 className="text-xl font-black mb-1">🥇 TIM KITA MENANG! MERDEKA!</h4>
                      <p className="text-xs opacity-90 mb-4 max-w-sm mx-auto">
                        Hebat! Kekuatan tarikan jemari lincah Anda berhasil menarik tali tambang melampaui garis batas tim kita, mengalahkan Tim Gang Sebelah pada tingkat kesulitan {tambangDifficulty}!
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xl font-black mb-1">💀 KITA TERTARIK LAWAN!</h4>
                      <p className="text-xs opacity-90 mb-4 max-w-sm mx-auto">
                        Aduh! Tim Gang Sebelah berhasil menarik pita merah ke sisi mereka pada tingkat kesulitan {tambangDifficulty}. Mari coba lagi dan tarik lebih sekuat tenaga!
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleResetTambang}
                    className="px-6 py-2.5 bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Tanding Ulang ⚔️
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* GAME 3: BALAP KARUNG RHYTHM */}
        {activeGame === "karung" && (
          <div className="text-center space-y-6">
            <div className="flex justify-between items-center bg-neutral-50 px-4 py-2 rounded-2xl border border-neutral-150 text-xs md:text-sm">
              <div className="flex gap-1">
                {["mudah", "sedang", "sulit"].map((diff) => (
                  <button
                    key={diff}
                    disabled={karungStatus === "playing"}
                    onClick={() => setKarungDifficulty(diff as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      karungDifficulty === diff
                        ? "bg-red-600 text-white"
                        : "bg-neutral-200 text-neutral-500 hover:bg-neutral-300"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
              <span className="font-bold text-neutral-600">Lomba: <span className="text-red-600">Balap Karung Tradisional</span></span>
            </div>

            {/* Arena Balap Karung */}
            <div className="h-[220px] bg-amber-50 rounded-2xl relative border-2 border-amber-100 overflow-hidden flex flex-col justify-between p-4 animate-fade-in">
              {/* Garis Finish */}
              <div className="absolute right-12 top-0 bottom-0 w-2 bg-gradient-to-r from-red-600 to-white flex items-center justify-center">
                <span className="absolute -rotate-90 text-[8px] font-black text-white bg-red-600 px-1 py-0.5 rounded shadow whitespace-nowrap">FINISH</span>
              </div>

              {/* Lintasan Balap */}
              <div className="flex-1 flex flex-col justify-around relative z-10">
                {/* Lintasan AI */}
                <div className="border-b border-dashed border-amber-200/50 pb-2 relative w-full h-1/2 flex items-center">
                  <div className="absolute left-0 right-12 h-1 bg-black/5 rounded" />
                  <motion.div
                    animate={{ x: `${karungAiPos * 0.8}%` }}
                    transition={{ type: "spring", stiffness: 80 }}
                    className="absolute flex flex-col items-center"
                  >
                    <span className="text-3xl animate-bounce">🏃‍♂️👜</span>
                    <span className="text-[8px] bg-neutral-800 text-white px-1.5 py-0.5 rounded-full mt-0.5 font-bold">Lawan ({Math.round(karungAiPos)}%)</span>
                  </motion.div>
                </div>

                {/* Lintasan Player */}
                <div className="relative w-full h-1/2 flex items-center pt-2">
                  <div className="absolute left-0 right-12 h-1 bg-black/5 rounded" />
                  <motion.div
                    animate={{ x: `${karungPlayerPos * 0.8}%` }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="absolute flex flex-col items-center"
                  >
                    <span className={`text-3xl ${isStumbled ? "rotate-90 translate-y-2 opacity-60" : "animate-bounce"}`}>🏃‍♀️👜</span>
                    <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded-full mt-0.5 font-bold">Kita ({Math.round(karungPlayerPos)}%)</span>
                  </motion.div>
                </div>
              </div>

              {/* Rhythmic Swing Bar */}
              {karungStatus === "playing" && (
                <div className="w-full max-w-sm mx-auto bg-neutral-900/10 h-7 rounded-full relative flex items-center justify-center overflow-hidden border border-neutral-300">
                  {/* Good zone (yellow) */}
                  <div className="absolute inset-y-0 w-3/5 bg-amber-400/30 rounded" />
                  {/* Perfect zone (green) */}
                  <div className="absolute inset-y-0 w-1/5 bg-emerald-500/40 rounded" />
                  <span className="absolute text-[8px] text-neutral-500 font-extrabold uppercase tracking-widest z-10">ZONA LOMPAT SEMPURNA (TENGAH)</span>
                  
                  {/* Swinging pointer */}
                  <motion.div
                    style={{ left: `calc(50% + ${karungIndicator * 0.45}%)` }}
                    className="absolute w-4 h-full bg-red-600 border-x-2 border-white shadow-md cursor-pointer z-20"
                  />
                </div>
              )}
            </div>

            {/* Controls */}
            <AnimatePresence mode="wait">
              {karungStatus === "idle" ? (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center p-4 bg-neutral-50 rounded-2xl border border-neutral-100"
                >
                  <h4 className="font-bold text-sm text-neutral-700 mb-2">Siap untuk Lomba Balap Karung?</h4>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto mb-4">
                    Tekan tombol Lompat saat indikator merah tepat berada di tengah zona hijau untuk melompat sejauh mungkin! Hati-hati, jika melompat saat di luar zona, Anda akan terjatuh!
                  </p>
                  <button
                    onClick={startKarung}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Mulai Balapan! 👜
                  </button>
                </motion.div>
              ) : karungStatus === "playing" ? (
                <div className="space-y-4">
                  {isStumbled ? (
                    <div className="bg-amber-100 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 max-w-sm mx-auto animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-bold">Aduh! Anda Terjatuh! Berdiri kembali dalam 1 detik...</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleKarungJump}
                      className="w-full max-w-sm bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 active:scale-95 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-red-500/10 transition-all text-base uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer select-none mx-auto"
                    >
                      <span>LOMPAT SEKARANG! 👜</span>
                    </button>
                  )}
                  <p className="text-[10px] text-neutral-400 italic">
                    Tip: Perhatikan ritme ayunan jarum penunjuk, ketuk tepat saat di tengah-tengah!
                  </p>
                </div>
              ) : (
                <motion.div
                  key="finish"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-6 rounded-2xl shadow-xl text-white ${
                    karungStatus === "player-win" ? "bg-emerald-600" : "bg-red-700"
                  }`}
                >
                  {karungStatus === "player-win" ? (
                    <div>
                      <h4 className="text-xl font-black mb-1">🥇 JUARA BALAP KARUNG!</h4>
                      <p className="text-xs opacity-90 mb-4 max-w-sm mx-auto">
                        Luar biasa! Ritme lompatan Anda sangat stabil dan berhasil mencapai garis finish mendahului lawan tingkat kesulitan {karungDifficulty}!
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xl font-black mb-1">💀 KALAH CEPAT!</h4>
                      <p className="text-xs opacity-90 mb-4 max-w-sm mx-auto">
                        Sayang sekali, lawan berhasil melompat lebih cepat dan mencapai finish. Jaga ritme lompatan Anda agar tidak terjatuh!
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleResetKarung}
                    className="px-6 py-2.5 bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Main Lagi 👜
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* GAME 4: BALAP KELERENG BALANCE */}
        {activeGame === "kelereng" && (
          <div className="text-center space-y-6">
            <div className="flex justify-between items-center bg-neutral-50 px-4 py-2 rounded-2xl border border-neutral-150 text-xs md:text-sm">
              <div className="flex gap-1">
                {["mudah", "sedang", "sulit"].map((diff) => (
                  <button
                    key={diff}
                    disabled={kelerengStatus === "playing"}
                    onClick={() => setKelerengDifficulty(diff as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      kelerengDifficulty === diff
                        ? "bg-red-600 text-white"
                        : "bg-neutral-200 text-neutral-500 hover:bg-neutral-300"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
              <span className="font-bold text-neutral-600">Lomba: <span className="text-red-600">Balap Kelereng Sendok</span></span>
            </div>

            {/* Arena Balap Kelereng */}
            <div className="h-[220px] bg-sky-50 rounded-2xl relative border-2 border-sky-100 overflow-hidden flex flex-col justify-between p-4 animate-fade-in">
              {/* Garis Finish */}
              <div className="absolute right-12 top-0 bottom-0 w-2 bg-gradient-to-r from-red-600 to-white flex items-center justify-center">
                <span className="absolute -rotate-90 text-[8px] font-black text-white bg-red-600 px-1 py-0.5 rounded shadow whitespace-nowrap">FINISH</span>
              </div>

              {/* Lintasan */}
              <div className="flex-1 flex flex-col justify-around relative z-10">
                {/* Lintasan AI */}
                <div className="border-b border-dashed border-sky-200 pb-2 relative w-full h-1/2 flex items-center">
                  <div className="absolute left-0 right-12 h-1 bg-black/5 rounded" />
                  <motion.div
                    animate={{ x: `${kelerengAiPos * 0.8}%` }}
                    transition={{ type: "spring", stiffness: 80 }}
                    className="absolute flex flex-col items-center"
                  >
                    <span className="text-3xl animate-pulse">🥄🟢</span>
                    <span className="text-[8px] bg-neutral-800 text-white px-1.5 py-0.5 rounded-full mt-0.5 font-bold">Lawan ({Math.round(kelerengAiPos)}%)</span>
                  </motion.div>
                </div>

                {/* Lintasan Player */}
                <div className="relative w-full h-1/2 flex items-center pt-2">
                  <div className="absolute left-0 right-12 h-1 bg-black/5 rounded" />
                  <motion.div
                    animate={{ x: `${kelerengPlayerPos * 0.8}%` }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="absolute flex flex-col items-center"
                  >
                    <span className="text-3xl">🥄🔴</span>
                    <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded-full mt-0.5 font-bold">Kita ({Math.round(kelerengPlayerPos)}%)</span>
                  </motion.div>
                </div>
              </div>

              {/* Balance Spoon Indicator */}
              {kelerengStatus === "playing" && (
                <div className="w-full max-w-xs mx-auto bg-neutral-900/10 h-6 rounded-full relative flex items-center justify-center border border-neutral-300">
                  <div className="absolute left-1/2 -translate-x-1/2 w-8 h-full bg-emerald-500/50" />
                  <span className="absolute text-[8px] text-neutral-500 font-extrabold uppercase tracking-widest">Keseimbangan Kelereng</span>
                  
                  {/* Balance Marker */}
                  <motion.div
                    style={{ left: `calc(50% + ${kelerengBalance * 0.45}%)` }}
                    className="absolute w-4 h-4 bg-amber-500 rounded-full border border-white shadow-md"
                  />
                </div>
              )}
            </div>

            {/* Controls */}
            <AnimatePresence mode="wait">
              {kelerengStatus === "idle" ? (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center p-4 bg-neutral-50 rounded-2xl border border-neutral-100"
                >
                  <h4 className="font-bold text-sm text-neutral-700 mb-2">Siap untuk Lomba Balap Kelereng?</h4>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto mb-4">
                    Jalan maju selangkah demi selangkah. Namun, setiap langkah akan membuat kelereng Anda goyah ke kiri atau kanan! Gunakan tombol penyeimbang untuk meluruskan kelereng sebelum terjatuh!
                  </p>
                  <button
                    onClick={startKelereng}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Mulai Balapan! 🥄
                  </button>
                </motion.div>
              ) : kelerengStatus === "playing" ? (
                <div className="space-y-4 max-w-md mx-auto">
                  {isKelerengDropped ? (
                    <div className="bg-red-100 border border-red-200 text-red-800 text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 max-w-sm mx-auto animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-bold">Kelereng Jatuh! Mengambil kembali kelereng & penalti jarak...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleKelerengBalance("left")}
                        className="bg-neutral-800 hover:bg-neutral-900 text-white font-black py-3 px-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        ◀ Seimbangkan Kiri
                      </button>
                      <button
                        onClick={kelerengStatus === "playing" && !isKelerengDropped ? handleKelerengStep : undefined}
                        className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-black py-3 px-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer scale-105 shadow-md shadow-red-500/10"
                      >
                        🚶 MAJU JALAN!
                      </button>
                      <button
                        onClick={() => handleKelerengBalance("right")}
                        className="bg-neutral-800 hover:bg-neutral-900 text-white font-black py-3 px-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Seimbangkan Kanan ▶
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-neutral-400 italic">
                    Tip: Selalu jaga indikator oranye tetap di tengah (zona hijau) sebelum menekan MAJU JALAN!
                  </p>
                </div>
              ) : (
                <motion.div
                  key="finish"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-6 rounded-2xl shadow-xl text-white ${
                    kelerengStatus === "player-win" ? "bg-emerald-600" : "bg-red-700"
                  }`}
                >
                  {kelerengStatus === "player-win" ? (
                    <div>
                      <h4 className="text-xl font-black mb-1">🥇 JUARA BALAP KELERENG!</h4>
                      <p className="text-xs opacity-90 mb-4 max-w-sm mx-auto">
                        Luar biasa! Konsentrasi tinggi Anda berhasil membawa kelereng sampai ke garis finish mendahului lawan tingkat kesulitan {kelerengDifficulty}!
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xl font-black mb-1">💀 KALAH CEPAT!</h4>
                      <p className="text-xs opacity-90 mb-4 max-w-sm mx-auto">
                        Sayang sekali, lawan melangkah lebih konsisten dan mencapai finish terlebih dahulu. Jaga keseimbangan sendok Anda!
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleResetKelereng}
                    className="px-6 py-2.5 bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Main Lagi 🥄
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
