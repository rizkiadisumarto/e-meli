import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Send, Sparkles, Smile, MessageSquarePlus, Trash2 } from "lucide-react";
import { GreetingCard } from "../types";

const DEFAULT_WISHES: GreetingCard[] = [];

export default function GreetingsWall() {
  const [wishes, setWishes] = useState<GreetingCard[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState<"red" | "white" | "gold">("red");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Hapus semua kartu ucapan yang sudah di kirim sebelumnya untuk memulai dari kosong
    localStorage.removeItem("sejarah_greetings_wall");
    setWishes([]);
  }, []);

  const saveToStorage = (updated: GreetingCard[]) => {
    setWishes(updated);
    localStorage.setItem("sejarah_greetings_wall", JSON.stringify(updated));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const newWish: GreetingCard = {
      id: `wish-${Date.now()}`,
      name: name,
      message: message,
      theme: theme,
      likes: 0,
      createdAt: "Baru saja"
    };

    const updated = [newWish, ...wishes];
    saveToStorage(updated);
    
    setName("");
    setMessage("");
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleLike = (id: string) => {
    const updated = wishes.map((w) => {
      if (w.id === id) {
        return { ...w, likes: w.likes + 1 };
      }
      return w;
    });
    saveToStorage(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus ucapan ini?")) {
      const updated = wishes.filter((w) => w.id !== id);
      saveToStorage(updated);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8" id="greetings-section">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-black text-neutral-800 uppercase tracking-tight">
          Panggung <span className="text-red-600">Suara Rakyat</span>
        </h2>
        <p className="text-neutral-500 mt-2 text-sm md:text-base max-w-2xl mx-auto">
          Kirimkan harapan luhur, pekik kemerdekaan, ucapan selamat HUT RI, atau sekadar pantun pembakar semangat untuk dibaca seluruh warga!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 md:p-8 border border-neutral-100 shadow-xl shadow-neutral-100/40">
          <h3 className="text-lg font-black text-neutral-800 mb-4.5 flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-red-600" />
            <span>Kirim Ucapan Baru</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Nama Warga / Tokoh</label>
              <input
                type="text"
                placeholder="Misal: Bu RT Amalia, Pemuda Karang Taruna"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 text-sm outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Pesan Harapan / Jargon</label>
              <textarea
                rows={4}
                placeholder="Tuliskan ucapan HUT RI atau harapan terbaik Anda..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 text-sm outline-none transition-all resize-none leading-relaxed"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Pilih Warna Kertas</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "red", label: "Merah Pejuang", bg: "bg-red-500 border-red-600 text-white" },
                  { id: "white", label: "Putih Suci", bg: "bg-white border-neutral-200 text-neutral-800" },
                  { id: "gold", label: "Emas Jaya", bg: "bg-amber-400 border-amber-500 text-neutral-900" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id as any)}
                    className={`py-2 px-1 rounded-xl text-center border font-bold text-[10px] tracking-tight cursor-pointer ${
                      theme === item.id ? "ring-2 ring-red-500 ring-offset-2 scale-95" : ""
                    } ${item.bg}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 px-4 rounded-xl shadow-md transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Sematkan Ucapan</span>
            </button>

            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold text-center border border-emerald-100"
                >
                  🎉 Berhasil disematkan di Panggung Suara Rakyat! Merdeka!
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Wishes wall scroll section */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-2 scrollbar-thin">
            <AnimatePresence>
              {wishes.length > 0 ? (
                wishes.map((wish) => {
                  let noteStyle = "";
                  let nameStyle = "";
                  let msgStyle = "";
                  let iconStyle = "";

                  if (wish.theme === "red") {
                    noteStyle = "bg-gradient-to-br from-red-600 to-red-500 border-red-700 text-white shadow-red-500/10";
                    nameStyle = "text-red-100";
                    msgStyle = "text-white";
                    iconStyle = "text-red-100 hover:text-white";
                  } else if (wish.theme === "gold") {
                    noteStyle = "bg-gradient-to-br from-amber-400 to-amber-300 border-amber-400 text-neutral-900 shadow-amber-400/10";
                    nameStyle = "text-amber-900";
                    msgStyle = "text-neutral-900";
                    iconStyle = "text-amber-900 hover:text-amber-950";
                  } else {
                    noteStyle = "bg-white border-neutral-100 text-neutral-800 shadow-neutral-100/30";
                    nameStyle = "text-neutral-400";
                    msgStyle = "text-neutral-700";
                    iconStyle = "text-neutral-400 hover:text-red-600";
                  }

                  return (
                    <motion.div
                      key={wish.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className={`p-5 rounded-2xl border-2 shadow-lg flex flex-col justify-between relative overflow-hidden group ${noteStyle}`}
                    >
                      {/* Folded paper corner decoration */}
                      <div className="absolute top-0 right-0 w-6 h-6 bg-black/5 rounded-bl-xl pointer-events-none" />

                      <div>
                        <div className="flex justify-between items-start mb-2.5">
                          <span className="font-black text-sm tracking-wide block uppercase">
                            {wish.name}
                          </span>
                          <span className={`text-[9px] font-semibold ${nameStyle}`}>
                            {wish.createdAt}
                          </span>
                        </div>
                        
                        <p className={`text-xs md:text-sm leading-relaxed mb-4 ${msgStyle}`}>
                          "{wish.message}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-black/5 mt-auto">
                        <button
                          onClick={() => handleLike(wish.id)}
                          className={`flex items-center gap-1.5 text-xs font-extrabold select-none transition-all cursor-pointer ${iconStyle}`}
                        >
                          <Heart className="w-4 h-4 fill-current" />
                          <span>{wish.likes}</span>
                        </button>

                        {/* Allow deleting new local items or any item */}
                        <button
                          onClick={() => handleDelete(wish.id)}
                          className={`opacity-0 group-hover:opacity-100 transition-all p-1 rounded hover:bg-black/5 cursor-pointer ${iconStyle}`}
                          title="Hapus Ucapan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-1 md:col-span-2 py-16 px-4 text-center text-neutral-400 bg-white border-2 border-dashed border-neutral-200 rounded-3xl flex flex-col items-center justify-center">
                  <Smile className="w-12 h-12 text-neutral-300 mb-3 animate-bounce" />
                  <p className="font-bold text-neutral-700 text-sm mb-1">Belum Ada Ucapan Tersemat</p>
                  <p className="text-xs text-neutral-400 max-w-xs">
                    Semua ucapan sebelumnya telah dibersihkan. Jadilah yang pertama mengirimkan pesan/harapan kemerdekaan Anda!
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
