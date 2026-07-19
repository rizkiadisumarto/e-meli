import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flag, Trophy, Sparkles, MessageSquare, Image as ImageIcon, Volume2, VolumeX, Heart, Star, Calendar } from "lucide-react";

import Countdown from "./components/Countdown";
import MiniGames from "./components/MiniGames";
import GreetingsWall from "./components/GreetingsWall";
import PanitiaInti from "./components/PanitiaInti";

const hutRiLogo = new URL("./assets/images/hut_ri_81_logo_1783879706658.jpg", import.meta.url).href;

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-red-200 text-neutral-800" id="main-app">
      
      {/* Red & White Festive Ribbon Header */}
      <div className="w-full bg-red-600 text-white py-2 px-4 flex justify-between items-center text-xs font-bold border-b border-red-700 select-none">
        <div className="flex items-center gap-2 mx-auto md:mx-0">
          <Flag className="w-4 h-4 animate-bounce text-white" />
          <span className="uppercase tracking-wider">HUT RI Ke-81 — Sekali Merdeka Tetap Merdeka!</span>
        </div>
      </div>

      {/* Main Responsive Header */}
      <header className="bg-white border-b border-neutral-150/80 sticky top-0 z-40 shadow-sm shadow-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand (Official HUT RI 81 Logo of 2026) */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center">
              {/* Golden/Red Glowing Ring of Honor */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-500 to-amber-500 opacity-20 blur-sm animate-pulse" />
              
              {/* Premium Official Logo Container */}
              <div className="relative w-14 h-14 overflow-hidden bg-white border border-neutral-150 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                <img
                  src={hutRiLogo}
                  alt="HUT RI 81 Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black font-display tracking-tight text-neutral-900 uppercase leading-none mb-1">
                Semarak <span className="text-red-600">17 Agustus</span>
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded tracking-wider">HUT RI 81</span>
                <p className="text-[10px] md:text-xs text-neutral-500 font-bold tracking-wide uppercase">
                  Portal Perayaan GG MELI MEWAH • 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="flex-1 pb-16">
        <div className="space-y-6">
          
          {/* Hero Festive Banner */}
          <div className="relative bg-gradient-to-br from-red-700 via-red-600 to-amber-600 text-white py-12 md:py-16 px-6 text-center overflow-hidden">
            {/* Floating abstract patriotic sparks */}
            <div className="absolute top-4 left-6 text-red-300 opacity-20 pointer-events-none text-7xl select-none">🇲🇨</div>
            <div className="absolute bottom-4 right-10 text-red-300 opacity-20 pointer-events-none text-7xl select-none">🦅</div>
            
            <div className="max-w-3xl mx-auto relative z-10 space-y-4">
              <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] md:text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full inline-block">
                Dirgahayu Republik Indonesia
              </span>
              <h2 className="text-3xl md:text-6xl font-black font-display tracking-tight leading-tight uppercase">
                Selamat Datang Warga<br />Meli Mewah
              </h2>
              <p className="text-red-100 text-xs md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
                Sambut kemerdekaan Republik Indonesia ke-81 dengan berkarya, berlomba dengan sportif, dan mempererat silaturahmi antar warga!
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          <Countdown />

          {/* Mini games arena */}
          <MiniGames />

          {/* Panitia Inti */}
          <PanitiaInti />

          {/* Sticky Greetings wall */}
          <GreetingsWall />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-150 py-8 text-center select-none mt-auto">
        <div className="max-w-6xl mx-auto px-4 space-y-4 text-neutral-400 text-xs font-medium">
          <div className="flex justify-center items-center gap-2">
            <span className="text-red-600 text-lg">🇲🇨</span>
            <span className="uppercase tracking-widest text-neutral-600 font-extrabold">Bhinneka Tunggal Ika</span>
            <span className="text-red-600 text-lg">🇲🇨</span>
          </div>
          
          <p className="max-w-md mx-auto leading-relaxed">
            Portal digital perayaan warga dikembangkan dengan penuh cinta tanah air. Semoga semangat kepahlawanan 1945 terus mengalir di nadi generasi bangsa.
          </p>

          <hr className="border-neutral-100 max-w-xs mx-auto" />

          <p className="text-[10px] text-neutral-400">
            © 2026 Semarak 17 Agustus • Semua Hak Cipta Dilindungi Undang-Undang.
          </p>
        </div>
      </footer>

    </div>
  );
}
