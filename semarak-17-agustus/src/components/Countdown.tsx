import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, Trophy, Heart } from "lucide-react";

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  useEffect(() => {
    // Target: August 17, 2026 (local time is July 2026)
    const targetDate = new Date("August 17, 2026 00:00:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isOver: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeBlocks = [
    { label: "Hari", value: timeLeft.days, color: "from-red-600 to-red-500" },
    { label: "Jam", value: timeLeft.hours, color: "from-red-500 to-red-400" },
    { label: "Menit", value: timeLeft.minutes, color: "from-neutral-100 to-neutral-200 text-red-600" },
    { label: "Detik", value: timeLeft.seconds, color: "from-neutral-200 to-neutral-50", isSec: true },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6" id="countdown-section">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-white border border-red-100 p-6 md:p-8 shadow-xl shadow-red-500/5 text-center"
      >
        {/* Decorative corner patterns */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/5 rounded-br-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500/5 rounded-tl-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm font-medium mb-4">
          <Calendar className="w-4 h-4 text-red-600 animate-pulse" />
          <span>Menuju HUT RI Ke-81 — 17 Agustus 2026</span>
        </div>

        <h2 className="text-2xl md:text-4xl font-black text-neutral-800 tracking-tight uppercase mb-2">
          Hitung Mundur <span className="text-red-600">Hari Merdeka</span>
        </h2>
        
        <p className="text-neutral-500 text-sm md:text-base max-w-lg mx-auto mb-8">
          Mari bersiap menyambut kemeriahan pesta rakyat terbesar dengan semangat gotong royong dan persatuan Indonesia!
        </p>

        {timeLeft.isOver ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="p-6 bg-red-600 text-white rounded-2xl shadow-lg inline-block"
          >
            <h3 className="text-3xl font-extrabold mb-1">DIRGAHAYU REPUBLIK INDONESIA!</h3>
            <p className="text-lg opacity-90">Hari Merdeka Telah Tiba! Sekali Merdeka, Tetap Merdeka!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-2xl mx-auto">
            {timeBlocks.map((block, i) => {
              const isRed = block.color.includes("from-red");
              return (
                <div key={i} className="flex flex-col items-center">
                  <motion.div
                    key={block.value}
                    initial={{ rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 10 }}
                    className={`w-full aspect-square max-h-[120px] rounded-2xl flex flex-col justify-center items-center shadow-lg border relative overflow-hidden ${
                      isRed 
                        ? "bg-gradient-to-br from-red-600 to-red-500 text-white border-red-700" 
                        : "bg-gradient-to-br from-white to-neutral-50 text-neutral-800 border-neutral-200"
                    }`}
                  >
                    {/* Shadow divider for flip card effect */}
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/10 pointer-events-none" />
                    
                    <span className={`text-2xl md:text-5xl font-black tracking-tighter ${block.isSec ? "text-red-500" : ""}`}>
                      {String(block.value).padStart(2, "0")}
                    </span>
                  </motion.div>
                  <span className="text-[10px] md:text-sm font-semibold tracking-wider text-neutral-500 uppercase mt-2">
                    {block.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-red-50 flex flex-wrap justify-center items-center gap-6 md:gap-12 text-xs md:text-sm font-medium text-neutral-600">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>5+ Cabang Perlombaan</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Pesan Damai & Harapan</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
