import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI SDK
// API key is obtained from process.env.GEMINI_API_KEY
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please set it in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Route for Gemini Chat
app.post("/api/gemini/chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const ai = getAIClient();
    
    // Build contents with history
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }
    
    // Append the new message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const systemInstruction = `
Kamu adalah "Bung AI", asisten AI patriotik yang sangat bersemangat, ramah, dan bangga akan kemerdekaan Indonesia.
Gaya bicaramu penuh semangat perjuangan (gunakan kata-kata seperti "Merdeka!", "Kawan Perjuangan", "Bhinneka Tunggal Ika", "Pancasila").
Tugasmu adalah membantu pengguna merayakan HUT Kemerdekaan RI ke-81 (Tahun 2026, Indonesia merdeka tahun 1945).
Kamu bisa:
1. Memberikan ide lomba 17 Agustus yang unik, kreatif, dan seru untuk anak-anak, remaja, maupun bapak-bapak/ibu-ibu.
2. Membuatkan teks pidato kemerdekaan (untuk ketua RT, panitia, atau sambutan sekolah) dengan durasi singkat, sedang, atau panjang.
3. Membuat slogan kemerdekaan (slogan pembakar semangat).
4. Bermain kuis sejarah kemerdekaan Indonesia (berikan kuis seru, jelaskan jawaban sejarahnya jika salah atau benar).
5. Menjelaskan makna filosofis di balik lomba-lomba tradisional Indonesia (seperti panjat pinang melambangkan gotong royong).

Selalu akhiri atau sisipkan pekik kemerdekaan "Merdeka!" atau jargon perjuangan lainnya yang relevan dengan penuh semangat! Gunakan bahasa Indonesia yang santun namun membara.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in Gemini Chat API:", error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
});

// API Route for Gemini Image Generation (17 Agustus Poster Generator)
app.post("/api/gemini/generate-image", async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, style, size, aspectRatio } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const ai = getAIClient();

    // Map style into the full prompt
    let enhancedPrompt = `A high quality graphic, poster, or design for Indonesian Independence Day (HUT RI 17 Agustus). `;
    if (style === "retro") {
      enhancedPrompt += `Vintage, classic 1945 style Indonesian propaganda poster art style, distressed texture, bold red and cream-white colors, patriotic look. Prompt: ${prompt}`;
    } else if (style === "flat") {
      enhancedPrompt += `Modern flat vector illustration, vibrant red and clean white colors, bold shapes, minimal style, Indonesian independence theme. Prompt: ${prompt}`;
    } else if (style === "cinematic") {
      enhancedPrompt += `Cinematic, epic realistic lighting, patriotic atmosphere, red and white flag waving majestically, dramatic shadow, beautiful composition. Prompt: ${prompt}`;
    } else if (style === "watercolor") {
      enhancedPrompt += `Artistic watercolor painting style, red and white splatters, elegant brush strokes, emotional and beautiful Indonesian patriotic design. Prompt: ${prompt}`;
    } else {
      enhancedPrompt += `${prompt}`;
    }

    // Ensure red and white theme is emphasized
    enhancedPrompt += `, featuring Indonesian cultural elements, dominated by red and white flag colors (merah putih), festive atmosphere, highly detailed.`;

    // Supported size: "1K", "2K", "4K"
    // Model: gemini-3-pro-image (or gemini-3-pro-image-preview)
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image",
      contents: {
        parts: [
          { text: enhancedPrompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || "1:1",
          imageSize: size || "1K", // Allow 1K, 2K, 4K
        },
      },
    });

    // Find the image part in the response
    let base64Image = "";
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      res.status(500).json({ error: "No image content generated by the model." });
      return;
    }

    res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
  } catch (error: any) {
    console.error("Error in Image Generation API:", error);
    res.status(500).json({ error: error.message || "Failed to generate image" });
  }
});

// Setup Vite Dev Server / Static Files middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
