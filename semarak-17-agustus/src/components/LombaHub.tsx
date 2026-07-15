import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, HelpCircle, Calendar, Plus, User, Trash2, Award, Users, ChevronRight } from "lucide-react";
import { Lomba, Participant, ScoreEntry } from "../types";

const INITIAL_LOMBA: Lomba[] = [
  {
    id: "mewarnai-anak-anak",
    name: "Mewarnai Anak-Anak",
    icon: "🎨",
    description: "Lomba kreativitas mewarnai gambar bertema kemerdekaan untuk anak-anak tingkat PAUD, TK, dan SD.",
    rules: [
      "Kategori umur: PAUD sampai kelas 3 SD.",
      "Membawa meja lipat dan alat mewarnai sendiri (krayon/pensil warna).",
      "Kertas gambar bertema 17 Agustus disediakan oleh panitia.",
      "Waktu pengerjaan maksimal 90 menit.",
      "Keputusan juri menentukan kerapian, kerapian gradasi warna, dan kreativitas tidak dapat diganggu gugat."
    ],
    history: "Lomba mewarnai anak-anak memupuk imajinasi kreatif dan rasa cinta tanah air sejak usia dini. Melalui goresan warna Merah Putih dan tema kemerdekaan, anak-anak belajar menghargai perjuangan dan keindahan NKRI dengan penuh keceriaan.",
    schedule: "17 Agustus, Pukul 08:00 WIB - Balai RT",
    participants: [],
    scores: []
  },
  {
    id: "balap-karung",
    name: "Balap Karung",
    icon: "🏃‍♂️",
    description: "Beradu cepat menuju garis finis menggunakan karung goni sambil melompat-lompat seru.",
    rules: [
      "Peserta wajib menggunakan karung goni yang disediakan panitia.",
      "Kaki peserta harus berada di dalam karung dan tangan memegang ujung atas karung.",
      "Peserta bergerak dengan melompat atau berlari kecil di dalam karung.",
      "Jika terjatuh, peserta boleh berdiri dan melanjutkan perlombaan dari titik jatuh.",
      "Peserta pertama yang melintasi garis finis dinyatakan sebagai pemenang."
    ],
    history: "Lomba balap karung mengingatkan bangsa Indonesia pada masa sulit di bawah penjajahan Jepang, di mana bahan sandang sangat langka sehingga rakyat menggunakan karung goni kasar sebagai pakaian sehari-hari. Perlombaan melompat melambangkan kegembiraan rakyat saat berhasil lepas dari kesengsaraan tersebut.",
    schedule: "17 Agustus, Pukul 09:30 WIB - Sektor A",
    participants: [],
    scores: []
  },
  {
    id: "lepas-pasang-bendera",
    name: "Lepas Pasang Bendera",
    icon: "🚩",
    description: "Adu kecepatan memasang dan melepaskan bendera Merah Putih kecil pada tiang/sedotan dalam botol secara estafet.",
    rules: [
      "Setiap tim terdiri dari 3 orang peserta.",
      "Peserta pertama berlari membawa bendera lalu menancapkannya ke dalam botol.",
      "Peserta kedua berlari mengambil bendera tersebut dan memberikannya ke peserta ketiga.",
      "Peserta ketiga berlari mengembalikan bendera ke tempat semula.",
      "Tim dengan waktu tercepat menyelesaikan seluruh estafet dinyatakan sebagai pemenang."
    ],
    history: "Lomba lepas pasang bendera ini melambangkan ketangkasan, kegesitan, dan kedisiplinan para pejuang kemerdekaan saat mengibarkan bendera Merah Putih di seluruh penjuru negeri, menunjukkan semangat gotong royong dan kesigapan dalam menjaga kehormatan bangsa.",
    schedule: "17 Agustus, Pukul 10:30 WIB - Lapangan Utama",
    participants: [],
    scores: []
  },
  {
    id: "makan-kerupuk",
    name: "Makan Kerupuk",
    icon: "🍘",
    description: "Adu cepat menghabiskan kerupuk putih yang digantung pada seutas tali tanpa bantuan tangan.",
    rules: [
      "Tangan peserta diikat di belakang punggung.",
      "Peserta hanya boleh menggigit kerupuk menggunakan mulut.",
      "Dilarang menyentuh kerupuk atau tali penggantung dengan bagian tubuh lain.",
      "Peserta pertama yang berhasil menghabiskan seluruh kerupuk adalah pemenangnya."
    ],
    history: "Makan kerupuk melambangkan kesederhanaan dan keprihatinan masyarakat Indonesia di masa perjuangan, di mana kerupuk dan nasi merupakan makanan pokok yang sering disantap saat krisis ekonomi perjuangan. Kini kita bersyukur atas melimpahnya pangan.",
    schedule: "17 Agustus, Pukul 08:30 WIB - Sektor B",
    participants: [],
    scores: []
  },
  {
    id: "lari-kelereng",
    name: "Lari Kelereng",
    icon: "🥄",
    description: "Menjaga keseimbangan kelereng di atas sendok yang digigit sambil melaju cepat ke garis finis.",
    rules: [
      "Kelereng diletakkan di atas sendok makan.",
      "Gagang sendok digigit oleh peserta menggunakan mulut.",
      "Tangan diletakkan di belakang punggung.",
      "Peserta harus berjalan cepat/berlari menuju garis putar dan kembali ke garis finis tanpa menjatuhkan kelereng.",
      "Jika kelereng jatuh, peserta harus mengulang dari garis start."
    ],
    history: "Lomba ini melatih fokus, konsentrasi penuh, ketenangan, dan keseimbangan hidup. Menjaga kelereng agar tidak jatuh di tengah hiruk-pikuk melambangkan fokus perjuangan bangsa Indonesia untuk mempertahankan kemerdekaan di tengah badai cobaan.",
    schedule: "17 Agustus, Pukul 11:00 WIB - Sektor C",
    participants: [],
    scores: []
  }
];

export default function LombaHub() {
  const [lombaList, setLombaList] = useState<Lomba[]>([]);
  const [selectedLombaId, setSelectedLombaId] = useState<string>("mewarnai-anak-anak");
  const [regName, setRegName] = useState("");
  const [regRT, setRegRT] = useState("RT 01");
  const [regSuccess, setRegSuccess] = useState(false);
  const [scoreTeamName, setScoreTeamName] = useState("");
  const [scoreValue, setScoreValue] = useState<number>(0);

  useEffect(() => {
    // Load database from Local Storage
    const savedLomba = localStorage.getItem("sejarah_lomba_db_v2");
    if (savedLomba) {
      try {
        setLombaList(JSON.parse(savedLomba));
      } catch (e) {
        setLombaList(INITIAL_LOMBA);
      }
    } else {
      // Seed default score board
      const seeded = INITIAL_LOMBA.map((l) => {
        const defaultScores: ScoreEntry[] = [
          { id: `${l.id}-rt01`, lombaId: l.id, teamName: "RT 01", score: 80 },
          { id: `${l.id}-rt02`, lombaId: l.id, teamName: "RT 02", score: 95 },
          { id: `${l.id}-rt03`, lombaId: l.id, teamName: "RT 03", score: 110 },
          { id: `${l.id}-rt04`, lombaId: l.id, teamName: "RT 04", score: 75 },
        ];
        return { ...l, scores: defaultScores };
      });
      setLombaList(seeded);
      localStorage.setItem("sejarah_lomba_db_v2", JSON.stringify(seeded));
    }
  }, []);

  const saveToStorage = (updatedList: Lomba[]) => {
    setLombaList(updatedList);
    localStorage.setItem("sejarah_lomba_db_v2", JSON.stringify(updatedList));
  };

  const selectedLomba = lombaList.find((l) => l.id === selectedLombaId) || INITIAL_LOMBA[0];

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;

    const newParticipant: Participant = {
      id: `p-${Date.now()}`,
      name: regName,
      lombaId: selectedLombaId,
      rt: regRT,
      registeredAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = lombaList.map((l) => {
      if (l.id === selectedLombaId) {
        return {
          ...l,
          participants: [...(l.participants || []), newParticipant],
        };
      }
      return l;
    });

    saveToStorage(updated);
    setRegName("");
    setRegSuccess(true);
    setTimeout(() => setRegSuccess(false), 3000);
  };

  const handleDeleteParticipant = (pId: string) => {
    const updated = lombaList.map((l) => {
      if (l.id === selectedLombaId) {
        return {
          ...l,
          participants: l.participants.filter((p) => p.id !== pId),
        };
      }
      return l;
    });
    saveToStorage(updated);
  };

  const handleAddScore = (e: FormEvent) => {
    e.preventDefault();
    if (!scoreTeamName.trim()) return;

    const newScore: ScoreEntry = {
      id: `s-${Date.now()}`,
      lombaId: selectedLombaId,
      teamName: scoreTeamName,
      score: Number(scoreValue) || 0,
    };

    const updated = lombaList.map((l) => {
      if (l.id === selectedLombaId) {
        return {
          ...l,
          scores: [...(l.scores || []), newScore],
        };
      }
      return l;
    });

    saveToStorage(updated);
    setScoreTeamName("");
    setScoreValue(0);
  };

  const handleUpdateScore = (scoreId: string, delta: number) => {
    const updated = lombaList.map((l) => {
      if (l.id === selectedLombaId) {
        return {
          ...l,
          scores: l.scores.map((s) => {
            if (s.id === scoreId) {
              return { ...s, score: Math.max(0, s.score + delta) };
            }
            return s;
          }),
        };
      }
      return l;
    });
    saveToStorage(updated);
  };

  const handleResetScores = () => {
    const updated = lombaList.map((l) => {
      if (l.id === selectedLombaId) {
        return {
          ...l,
          scores: [
            { id: `${l.id}-rt01`, lombaId: l.id, teamName: "RT 01", score: 0 },
            { id: `${l.id}-rt02`, lombaId: l.id, teamName: "RT 02", score: 0 },
            { id: `${l.id}-rt03`, lombaId: l.id, teamName: "RT 03", score: 0 },
            { id: `${l.id}-rt04`, lombaId: l.id, teamName: "RT 04", score: 0 },
          ],
        };
      }
      return l;
    });
    saveToStorage(updated);
  };

  // Sort scores descending
  const sortedScores = selectedLomba.scores ? [...selectedLomba.scores].sort((a, b) => b.score - a.score) : [];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8" id="lombahub-section">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-black text-neutral-800 uppercase tracking-tight">
          Pusat <span className="text-red-600">Lomba Kemerdekaan</span>
        </h2>
        <p className="text-neutral-500 mt-2 text-sm md:text-base max-w-2xl mx-auto">
          Daftarkan dirimu ke lomba pilihan warga, ketahui filosofi mulia di balik setiap tantangan, dan pantau papan skor live lingkungan RT!
        </p>
      </div>

      {/* Grid of Lomba tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {lombaList.map((l) => (
          <button
            key={l.id}
            id={`tab-lomba-${l.id}`}
            onClick={() => {
              setSelectedLombaId(l.id);
            }}
            className={`px-4 py-3.5 rounded-2xl text-center border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              selectedLombaId === l.id
                ? "bg-red-50 border-red-600 shadow-lg shadow-red-100"
                : "bg-white border-neutral-100 hover:border-red-200 hover:bg-neutral-50"
            }`}
          >
            <span className="text-3xl">{l.icon}</span>
            <span className={`text-xs md:text-sm font-bold truncate w-full ${selectedLombaId === l.id ? "text-red-600" : "text-neutral-700"}`}>
              {l.name}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Details & History */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Card info */}
          <motion.div
            key={selectedLomba.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-100 shadow-xl shadow-neutral-100/40 relative overflow-hidden"
          >
            {/* Corner tag */}
            <div className="absolute top-0 right-0 bg-red-600 text-white font-bold text-xs px-4 py-2.5 rounded-bl-2xl uppercase tracking-wider">
              {selectedLomba.name}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{selectedLomba.icon}</span>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-neutral-800">{selectedLomba.name}</h3>
                <div className="flex items-center gap-1 text-red-600 text-xs font-semibold uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{selectedLomba.schedule}</span>
                </div>
              </div>
            </div>

            <p className="text-neutral-600 text-sm md:text-base leading-relaxed mb-6">
              {selectedLomba.description}
            </p>

            <hr className="border-neutral-100 mb-6" />

            <h4 className="font-bold text-neutral-800 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Aturan Resmi Lomba:</span>
            </h4>
            <ul className="space-y-2.5 mb-6">
              {selectedLomba.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-neutral-600 text-sm md:text-base">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-50 text-red-600 font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>

            <div className="p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border border-red-100/50">
              <h4 className="font-black text-red-700 text-sm uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Filosofi Sejarah Pejuang:</span>
              </h4>
              <p className="text-neutral-700 text-xs md:text-sm leading-relaxed italic">
                "{selectedLomba.history}"
              </p>
            </div>
          </motion.div>

          {/* Registration Form */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-xl shadow-neutral-100/40">
            <h3 className="text-lg font-black text-neutral-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-red-600" />
              <span>Formulir Pendaftaran Warga</span>
            </h3>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 text-sm outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Lingkungan RT</label>
                  <select
                    value={regRT}
                    onChange={(e) => setRegRT(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 text-sm outline-none transition-all"
                  >
                    <option>RT 01</option>
                    <option>RT 02</option>
                    <option>RT 03</option>
                    <option>RT 04</option>
                    <option>RT 05</option>
                    <option>RT 06</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all text-sm tracking-wide uppercase cursor-pointer"
              >
                Gabung Lomba Sekarang
              </button>

              <AnimatePresence>
                {regSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold text-center border border-emerald-100"
                  >
                    🎉 Pendaftaran Berhasil! Nama Anda telah dicatat di data warga. Merdeka!
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        {/* Right Column - Participant List & Scoreboard */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Scoreboard */}
          <div className="bg-gradient-to-b from-neutral-900 to-neutral-800 text-white rounded-3xl p-6 border border-neutral-800 shadow-2xl relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full filter blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Papan Skor RT {selectedLomba.name}</span>
              </h3>
              <button
                onClick={handleResetScores}
                className="text-[10px] uppercase font-bold text-neutral-400 hover:text-red-400 border border-neutral-700 hover:border-red-500/30 px-2.5 py-1 rounded-lg transition-all"
              >
                Reset
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {sortedScores.map((score, index) => {
                const colors = [
                  "from-amber-400 to-yellow-500", // Gold
                  "from-neutral-300 to-neutral-400", // Silver
                  "from-amber-600 to-amber-700", // Bronze
                ];
                return (
                  <div key={score.id} className="flex items-center justify-between bg-white/5 border border-white/5 p-3.5 rounded-2xl hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      {index < 3 ? (
                        <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${colors[index]} text-black text-xs font-black flex items-center justify-center`}>
                          {index + 1}
                        </span>
                      ) : (
                        <span className="w-6 h-6 text-neutral-500 text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                      )}
                      <span className="font-bold text-sm">{score.teamName}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateScore(score.id, -5)}
                          className="w-7 h-7 rounded-lg bg-neutral-700/60 hover:bg-neutral-600 flex items-center justify-center text-xs font-bold transition-all select-none cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono text-base font-black w-10 text-center text-amber-300">
                          {score.score}
                        </span>
                        <button
                          onClick={() => handleUpdateScore(score.id, 5)}
                          className="w-7 h-7 rounded-lg bg-neutral-700/60 hover:bg-neutral-600 flex items-center justify-center text-xs font-bold transition-all select-none cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Score addition form */}
            <form onSubmit={handleAddScore} className="grid grid-cols-3 gap-2 p-2 bg-white/5 rounded-2xl mb-4 border border-white/5">
              <input
                type="text"
                placeholder="Tambah RT (misal RT 05)"
                value={scoreTeamName}
                onChange={(e) => setScoreTeamName(e.target.value)}
                className="col-span-2 px-3 py-1.5 bg-neutral-800 border border-neutral-700 text-xs rounded-xl focus:outline-none focus:border-red-500 text-white"
                required
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-1.5 px-2 rounded-xl transition-all uppercase cursor-pointer"
              >
                Tambah
              </button>
            </form>

          </div>

          {/* Registered Participants list */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-xl shadow-neutral-100/40">
            <h3 className="text-lg font-black text-neutral-800 mb-3.5 flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              <span>Daftar Peserta Terdaftar ({selectedLomba.participants?.length || 0})</span>
            </h3>

            {(!selectedLomba.participants || selectedLomba.participants.length === 0) ? (
              <div className="p-8 text-center text-neutral-400 text-xs border-2 border-dashed border-neutral-100 rounded-2xl">
                Belum ada warga terdaftar untuk lomba ini. Jadilah yang pertama!
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {selectedLomba.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-all border border-neutral-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-neutral-800">{participant.name}</p>
                        <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">{participant.rt} — Jam {participant.registeredAt}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteParticipant(participant.id)}
                      className="text-neutral-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
