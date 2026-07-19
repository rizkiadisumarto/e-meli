import { motion } from "motion/react";
import { Users, Shield, Crown, FileText, Wallet } from "lucide-react";

const panitia = [
  { name: "Bapak Hairul", role: "Pembina", icon: <Shield className="w-5 h-5" />, color: "bg-red-50 text-red-600 border-red-200" },
  { name: "Bapak Arief", role: "Ketua Panitia", icon: <Crown className="w-5 h-5" />, color: "bg-amber-50 text-amber-600 border-amber-200" },
  { name: "Bapak Yusuf", role: "Sekretaris", icon: <FileText className="w-5 h-5" />, color: "bg-blue-50 text-blue-600 border-blue-200" },
  { name: "Bapak Ucup", role: "Bendahara", icon: <Wallet className="w-5 h-5" />, color: "bg-green-50 text-green-600 border-green-200" },
];

export default function PanitiaInti() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8" id="panitia-inti">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <Users className="w-4 h-4" />
          Panitia Inti
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-2">
          Susunan <span className="text-red-600">Panitia</span>
        </h2>
        <p className="text-neutral-500 text-sm max-w-xl mx-auto">
          Tim inti yang bertanggung jawab atas kelancaran kegiatan perayaan HUT RI
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {panitia.map((person, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`bg-white rounded-2xl border ${person.color} p-6 text-center shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className={`w-14 h-14 rounded-full ${person.color} flex items-center justify-center mx-auto mb-3 border`}>
              {person.icon}
            </div>
            <h3 className="font-bold text-neutral-900 mb-1">{person.name}</h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{person.role}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
