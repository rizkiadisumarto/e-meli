import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, LogOut, Shield, Check, Landmark, Users, Key, AlertCircle, X } from "lucide-react";
import { UserSession } from "../types";

interface LoginPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionChange: (session: UserSession | null) => void;
}

export default function LoginPanel({ isOpen, onClose, onSessionChange }: LoginPanelProps) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"warga" | "panitia" | "rt">("warga");
  const [rtNumber, setRtNumber] = useState("04");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sejarah_user_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSession(parsed);
        onSessionChange(parsed);
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  }, [onSessionChange]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nama lengkap tidak boleh kosong.");
      return;
    }

    // Optional PIN verification for administrative roles to make it feel authentic & fun
    if (role === "rt" && pin !== "1945") {
      setError("PIN Verifikasi Ketua RT salah! (Petunjuk: Tahun kemerdekaan RI)");
      return;
    }
    if (role === "panitia" && pin !== "1708") {
      setError("PIN Verifikasi Panitia salah! (Petunjuk: Tanggal & bulan kemerdekaan, misal '1708')");
      return;
    }

    const newSession: UserSession = {
      name: name.trim(),
      role: role,
      rtNumber: rtNumber
    };

    localStorage.setItem("sejarah_user_session", JSON.stringify(newSession));
    setSession(newSession);
    onSessionChange(newSession);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem("sejarah_user_session");
    setSession(null);
    onSessionChange(null);
    setName("");
    setPin("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-neutral-100 relative z-10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 p-1.5 rounded-full hover:bg-neutral-50 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {session ? (
          /* Logged In State */
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-neutral-800 uppercase tracking-tight">
                Koneksi Warga Aktif!
              </h3>
              <p className="text-sm text-neutral-500">
                Halo, <span className="font-extrabold text-neutral-700">{session.name}</span>. Anda saat ini masuk di portal warga.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <span className="font-bold text-neutral-400 w-24">Peran Portal:</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {session.role === "rt" ? "Ketua RT" : session.role === "panitia" ? "Panitia Lomba" : "Warga Meli Mewah"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="font-bold text-neutral-400 w-24">Wilayah Tugas:</span>
                <span className="text-neutral-700 font-bold">RT 0{session.rtNumber} / RW 08 Meli Mewah</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer"
              >
                Tutup Jendela
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Sesi</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login Form State */
          <div>
            {/* Header branding */}
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6 pt-8 text-center space-y-1">
              <h3 className="text-lg font-black uppercase tracking-wider">Portal RT Meli Mewah</h3>
              <p className="text-xs text-red-100">Koneksikan identitas warga Anda untuk interaksi penuh</p>
            </div>

            <form onSubmit={handleLogin} className="p-6 md:p-8 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold text-center">
                  🎉 Berhasil Masuk! Selamat datang di Semarak 17 Agustus.
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 tracking-wider">Nama Lengkap Warga</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Contoh: Budi Santoso, Amalia"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 text-sm outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 tracking-wider">Peran Anda</label>
                  <select
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value as any);
                      setError("");
                    }}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs font-bold text-neutral-700 bg-white outline-none transition-all"
                  >
                    <option value="warga">Warga Biasa</option>
                    <option value="panitia">Panitia HUT</option>
                    <option value="rt">Ketua RT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 tracking-wider">Nomor RT</label>
                  <select
                    value={rtNumber}
                    onChange={(e) => setRtNumber(e.target.value)}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs font-bold text-neutral-700 bg-white outline-none transition-all"
                  >
                    <option value="01">RT 01</option>
                    <option value="02">RT 02</option>
                    <option value="03">RT 03</option>
                    <option value="04">RT 04</option>
                    <option value="05">RT 05</option>
                  </select>
                </div>
              </div>

              {/* Password/PIN fields for administrators to make it authentic and immersive */}
              {role !== "warga" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 pt-1"
                >
                  <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 tracking-wider">
                    PIN Verifikasi Peran ({role === "rt" ? "Tahun Kemerdekaan RI" : "Tgl&Bln Kemerdekaan (1708)"})
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                    <input
                      type="password"
                      placeholder={role === "rt" ? "MIsal: 1945" : "Misal: 1708"}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 text-sm outline-none transition-all"
                      required
                    />
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 px-4 rounded-xl shadow-md transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Masuk Sekarang</span>
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
