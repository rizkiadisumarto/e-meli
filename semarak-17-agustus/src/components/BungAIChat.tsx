import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, Sparkles, RefreshCw, Flag, Award, HelpCircle } from "lucide-react";
import { ChatMessage } from "../types";

export default function BungAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const threadEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTED_PROMPTS = [
    { text: "Tuliskan naskah pidato singkat ketua RT 🎤", prompt: "Buatkan naskah pidato sambutan singkat, bersemangat, dan khidmat untuk Ketua RT dalam acara pembukaan perlombaan HUT RI 17 Agustus." },
    { text: "Ide lomba kreatif untuk warga 💡", prompt: "Berikan ide lomba 17 Agustus yang unik, hemat biaya, dan seru untuk kalangan bapak-bapak, ibu-ibu, dan anak-anak." },
    { text: "Beri kuis sejarah kemerdekaan! 🇮🇩", prompt: "Berikan saya kuis seru tentang sejarah kemerdekaan Indonesia. Berikan satu pertanyaan pilihan ganda terlebih dahulu!" },
    { text: "Slogan pembakar semangat 🔥", prompt: "Buatkan 5 slogan kemerdekaan RI ke-81 yang sangat membakar semangat kemerdekaan, modern, dan patriotik." }
  ];

  // Initialize with a welcome message from Bung AI
  useEffect(() => {
    const savedMessages = localStorage.getItem("bung_ai_chat_history");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        setWelcomeMessage();
      }
    } else {
      setWelcomeMessage();
    }
  }, []);

  const setWelcomeMessage = () => {
    const welcome: ChatMessage = {
      id: "welcome",
      role: "model",
      text: "Merdeka! Halo Kawan Perjuangan! Saya **Bung AI**, asisten kemerdekaan setiamu. 🇮🇩\n\nSaya siap membantumu menyemarakkan acara 17 Agustusan! Kamu butuh naskah pidato ketua RT? Ide lomba yang anti-mainstream? Atau ingin menguji wawasan kebangsaanmu dengan kuis sejarah? Tanyakan saja pada saya!\n\n**Sekali Merdeka, Tetap Merdeka!** Bagaimana saya bisa membantumu hari ini?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages([welcome]);
    localStorage.setItem("bung_ai_chat_history", JSON.stringify([welcome]));
  };

  useEffect(() => {
    // Scroll to bottom on new messages
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (userPromptText: string) => {
    if (!userPromptText.trim() || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: userPromptText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    localStorage.setItem("bung_ai_chat_history", JSON.stringify(updatedHistory));
    setInput("");
    setIsLoading(true);

    try {
      // Send chat history and current message to the backend
      // Filter out welcome message from the actual model call if necessary,
      // but sending everything is perfectly fine and preserves context!
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userPromptText,
          history: updatedHistory.slice(0, -1).map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Layanan Bung AI sedang padat pejuang. Silakan coba beberapa saat lagi!");
      }

      const data = await response.json();
      
      const modelMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: "model",
        text: data.text || "Merdeka! Maaf, ada kendala jaringan perjuangan.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      const finalHistory = [...updatedHistory, modelMsg];
      setMessages(finalHistory);
      localStorage.setItem("bung_ai_chat_history", JSON.stringify(finalHistory));
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Gagal menghubungi server Bung AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus riwayat obrolan dengan Bung AI?")) {
      localStorage.removeItem("bung_ai_chat_history");
      setWelcomeMessage();
    }
  };

  const formatText = (text: string) => {
    // Basic Markdown support for bold text and paragraphs
    return text.split("\n").map((para, i) => {
      let formatted = para;
      
      // Bold match **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      formatted = formatted.replace(boldRegex, "<strong>$1</strong>");

      return (
        <p
          key={i}
          className="mb-2 last:mb-0 leading-relaxed text-sm md:text-base text-neutral-800"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8" id="bungai-chat-section">
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-2xl overflow-hidden flex flex-col h-[650px] md:h-[700px]">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-red-700 to-red-600 text-white p-4 md:p-5 flex items-center justify-between border-b border-red-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border-2 border-red-500 flex items-center justify-center shadow-md">
                <span className="text-2xl">🇮🇩</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-red-700 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm md:text-base tracking-wide uppercase">Bung AI</h3>
                <span className="bg-white/20 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider text-red-100">Patriot</span>
              </div>
              <p className="text-[10px] md:text-xs text-red-100 font-medium">Asisten Cerdas Semangat Merah Putih</p>
            </div>
          </div>

          <button
            onClick={handleResetChat}
            className="p-2 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            title="Mulai Ulang Obrolan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-neutral-50/50">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-2.5 max-w-[85%] md:max-w-[75%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
                    isUser ? "bg-red-600 text-white" : "bg-white text-red-600 border border-neutral-200"
                  }`}>
                    {isUser ? "Me" : "RI"}
                  </div>

                  {/* Bubble Container */}
                  <div className="flex flex-col">
                    <div className={`p-3.5 md:p-4 rounded-2xl shadow-sm border ${
                      isUser 
                        ? "bg-red-600 border-red-700 text-white rounded-tr-none" 
                        : "bg-white border-neutral-100 text-neutral-800 rounded-tl-none"
                    }`}>
                      {isUser ? (
                        <p className="text-sm md:text-base leading-relaxed break-words">{msg.text}</p>
                      ) : (
                        <div className="break-words font-sans">{formatText(msg.text)}</div>
                      )}
                    </div>
                    {/* Timestamp */}
                    <span className={`text-[9px] text-neutral-400 mt-1 ${isUser ? "text-right mr-1" : "ml-1"}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isLoading && (
            <div className="flex items-start gap-2.5 max-w-[75%] mr-auto">
              <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 shrink-0 flex items-center justify-center text-xs font-bold text-red-600">
                RI
              </div>
              <div className="bg-white border border-neutral-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" />
                </span>
                <span className="text-xs text-neutral-400 font-semibold tracking-wide animate-pulse">Bung AI sedang menulis naskah...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl text-center max-w-md mx-auto">
              ⚠️ {error}
            </div>
          )}
          
          <div ref={threadEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        {messages.length <= 1 && !isLoading && (
          <div className="px-4 py-2 border-t border-neutral-100 bg-white">
            <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Saran Ide Perjuangan:</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  className="px-3 py-2 text-left bg-neutral-50 hover:bg-red-50 hover:border-red-200 border border-neutral-100 rounded-xl text-neutral-700 hover:text-red-700 text-[11px] md:text-xs font-semibold leading-tight transition-all cursor-pointer truncate"
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="p-3.5 md:p-4 bg-white border-t border-neutral-100 flex gap-2"
        >
          <input
            type="text"
            placeholder="Tanyakan ide lomba, mintalah pidato ketua RT, atau ajak cerdas cermat..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 md:py-3 border border-neutral-200 rounded-2xl focus:border-red-600 focus:ring-2 focus:ring-red-100 text-sm outline-none transition-all outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 md:px-5 py-2.5 md:py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-md disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
