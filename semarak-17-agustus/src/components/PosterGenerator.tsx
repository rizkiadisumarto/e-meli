import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Image, Sparkles, Download, Share2, Layers, RefreshCcw, Landmark, Palette, Maximize } from "lucide-react";
import { GeneratedPoster } from "../types";

export default function PosterGenerator() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("retro");
  const [size, setSize] = useState("1K");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosters, setGeneratedPosters] = useState<GeneratedPoster[]>([]);
  const [currentPoster, setCurrentPoster] = useState<GeneratedPoster | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const LOADING_MESSAGES = [
    "Menyiapkan kanvas Merah Putih... 🇮🇩",
    "Menggoreskan kuas semangat 1945... 🖌️",
    "Mencampur palet warna keberanian merah dan kesucian putih... 🎨",
    "Menyatukan cita-cita Bhinneka Tunggal Ika... ✨",
    "Mengabadikan karya dalam bentuk karya poster bertenaga AI... 🚀"
  ];

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sejarah_posters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGeneratedPosters(parsed);
        if (parsed.length > 0) {
          setCurrentPoster(parsed[0]);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Seed a default mock poster if empty, to look populated and high quality
      const defaultPoster: GeneratedPoster = {
        id: "default-1",
        url: "https://picsum.photos/seed/merdeka/1024/1024",
        prompt: "Kemeriahan lomba 17 Agustus bersama seluruh masyarakat di depan gapura RT merah putih",
        style: "Retro Propaganda",
        resolution: "1024x1024 (1K)",
        createdAt: new Date().toLocaleDateString("id-ID")
      };
      setGeneratedPosters([defaultPoster]);
      setCurrentPoster(defaultPoster);
    }
  }, []);

  // Loading animation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setLoadingStep(0);

    try {
      const response = await fetch("/api/gemini/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          style,
          size,
          aspectRatio,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal menghasilkan gambar poster. Coba sesuaikan instruksimu.");
      }

      const data = await response.json();

      if (!data.imageUrl) {
        throw new Error("Format respon tidak valid dari pelukis AI.");
      }

      const resolutionText = size === "4K" ? "3840x3840" : size === "2K" ? "2048x2048" : "1024x1024";

      const newPoster: GeneratedPoster = {
        id: `poster-${Date.now()}`,
        url: data.imageUrl,
        prompt: prompt,
        style: style === "retro" ? "Retro Propaganda" : style === "flat" ? "Modern Flat Vector" : style === "cinematic" ? "Cinematic Epic" : "Watercolor Art",
        resolution: `${resolutionText} (${size})`,
        createdAt: new Date().toLocaleDateString("id-ID"),
      };

      const updated = [newPoster, ...generatedPosters];
      setGeneratedPosters(updated);
      setCurrentPoster(newPoster);
      localStorage.setItem("sejarah_posters", JSON.stringify(updated));
      setPrompt("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terdapat gangguan jaringan dalam mencetak poster.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!currentPoster) return;
    const link = document.createElement("a");
    link.href = currentPoster.url;
    link.download = `Poster_17Agustus_${currentPoster.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SAMPLE_PROMPTS = [
    "Karikatur anak-anak ceria sedang lomba balap karung di pedesaan Indonesia",
    "Bung Karno sedang berpidato membara membacakan teks proklamasi",
    "Pahlawan nasional berjejer melambaikan bendera Merah Putih di depan kepulauan Nusantara",
    "Keluarga harmonis menghias gapura bambu lingkungan RT dengan lampion merah putih"
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8" id="poster-generator-section">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-black text-neutral-800 uppercase tracking-tight">
          AI <span className="text-red-600">Studio Poster Booth</span>
        </h2>
        <p className="text-neutral-500 mt-2 text-sm md:text-base max-w-2xl mx-auto">
          Ciptakan poster kemerdekaan, kartu ucapan HUT RI, atau Twibbon patriotik Anda sendiri secara instan dengan teknologi canggih Gemini!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-neutral-100 shadow-xl shadow-neutral-100/40">
          <h3 className="text-lg font-black text-neutral-800 mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600" />
            <span>Kreasikan Ide Desain</span>
          </h3>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Instruksi Desain (Prompt)</label>
              <textarea
                rows={3}
                placeholder="Tuliskan detail gambar poster yang diinginkan, misal: 'Anak-anak riang gembira makan kerupuk di bawah kibaran bendera merah putih'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-2xl focus:border-red-600 focus:ring-2 focus:ring-red-100 text-sm outline-none transition-all resize-none leading-relaxed"
                required
                disabled={isGenerating}
              />
              
              {/* Quick suggestions */}
              <div className="mt-2.5">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Inspirasi Cepat:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_PROMPTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(sample)}
                      disabled={isGenerating}
                      className="px-2.5 py-1 text-[10px] font-medium bg-neutral-50 hover:bg-red-50 hover:text-red-600 border border-neutral-200 rounded-lg text-neutral-600 truncate max-w-[200px] cursor-pointer"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Gaya Poster</label>
                <div className="relative">
                  <Palette className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    disabled={isGenerating}
                    className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs outline-none transition-all cursor-pointer"
                  >
                    <option value="retro">Propaganda Klasik (1945)</option>
                    <option value="flat">Vector Modern (Flat)</option>
                    <option value="cinematic">Cinematic Epic (HD)</option>
                    <option value="watercolor">Watercolor Splatters</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Ukuran / Kualitas</label>
                <div className="relative">
                  <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    disabled={isGenerating}
                    className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 text-xs outline-none transition-all cursor-pointer"
                  >
                    <option value="1K">Kualitas Tinggi (1K HD)</option>
                    <option value="2K">Kualitas Super (2K UHD)</option>
                    <option value="4K">Kualitas Ultra (4K Studio)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Kotak (1:1)", val: "1:1" },
                { label: "Twibbon (3:4)", val: "3:4" },
                { label: "Banner (16:9)", val: "16:9" },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setAspectRatio(item.val)}
                  disabled={isGenerating}
                  className={`py-2 rounded-xl text-center border font-bold text-xs cursor-pointer ${
                    aspectRatio === item.val
                      ? "bg-red-50 border-red-600 text-red-600"
                      : "bg-white border-neutral-150 hover:bg-neutral-50 text-neutral-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-all text-sm uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Image className="w-4 h-4 animate-bounce" />
              <span>Cetak Poster AI</span>
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-800 rounded-xl text-xs font-semibold text-center">
                ⚠️ {error}
              </div>
            )}
          </form>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="bg-neutral-900 rounded-3xl p-4 border border-neutral-800 shadow-2xl flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
            
            {/* Background glowing patriotic flags or light */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-red-600/5 filter blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center p-8 text-center space-y-5"
                >
                  {/* Majestic rotating patriotic circle loader */}
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
                    <div className="absolute inset-4 rounded-full bg-red-500/10 flex items-center justify-center">
                      <span className="text-xl">🇮🇩</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-w-md">
                    <h4 className="text-white font-extrabold text-sm md:text-base animate-pulse">
                      Gemini Sedang Melukis...
                    </h4>
                    <p className="text-neutral-400 text-xs md:text-sm font-semibold italic min-h-[40px]">
                      {LOADING_MESSAGES[loadingStep]}
                    </p>
                  </div>
                </motion.div>
              ) : currentPoster ? (
                <motion.div
                  key={currentPoster.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex flex-col items-center"
                >
                  {/* Poster Image Container */}
                  <div className="relative rounded-2xl overflow-hidden border border-white/15 max-w-md w-full shadow-2xl aspect-square">
                    <img
                      src={currentPoster.url}
                      alt={currentPoster.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-600 px-2 py-0.5 rounded-full inline-block mb-1.5">
                        {currentPoster.style}
                      </span>
                      <p className="text-xs md:text-sm font-semibold line-clamp-2 leading-relaxed">
                        "{currentPoster.prompt}"
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-3 mt-5 w-full max-w-md">
                    <button
                      onClick={handleDownload}
                      className="flex-1 bg-white hover:bg-neutral-100 text-neutral-900 font-extrabold py-3 px-4 rounded-xl text-xs md:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Poster</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentPoster.url);
                        alert("Tautan poster berhasil disalin! Bagikan ke grup WA warga! 🇮🇩");
                      }}
                      className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 p-3 rounded-xl transition-all cursor-pointer"
                      title="Salin Tautan Poster"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 text-center text-[10px] text-neutral-500 font-mono">
                    Resolusi Cetak: {currentPoster.resolution} • Dibuat pada {currentPoster.createdAt}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  className="flex flex-col items-center justify-center text-center p-8 text-neutral-400"
                >
                  <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                    <Image className="w-8 h-8 text-neutral-600" />
                  </div>
                  <p className="text-sm font-bold">Belum Ada Poster Dicetak</p>
                  <p className="text-xs max-w-xs mt-1">
                    Silakan isi form instruksi di sebelah kiri dan klik tombol "Cetak Poster AI" untuk memulai kreasi.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Creation history gallery */}
          {generatedPosters.length > 1 && (
            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-xl shadow-neutral-100/40">
              <h4 className="font-bold text-neutral-800 text-sm uppercase tracking-wider mb-3.5 flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-600" />
                <span>Galeri Kreasi Warga ({generatedPosters.length})</span>
              </h4>

              <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-h-[160px] overflow-y-auto pr-1">
                {generatedPosters.map((poster) => (
                  <button
                    key={poster.id}
                    onClick={() => setCurrentPoster(poster)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 cursor-pointer transition-all ${
                      currentPoster?.id === poster.id
                        ? "border-red-600 scale-95 shadow-md"
                        : "border-transparent hover:border-neutral-200"
                    }`}
                  >
                    <img
                      src={poster.url}
                      alt={poster.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
