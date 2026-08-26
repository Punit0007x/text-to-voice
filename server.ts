import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy/Safe Gemini AI initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Convert Raw PCM (24000Hz, 16-bit Mono Little-Endian) to standard RIFF/WAV Buffer
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  // RIFF chunk descriptor
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);

  // "fmt " sub-chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 = Linear PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  // "data" sub-chunk
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

const PERSONA_CONFIGS: Record<
  string,
  {
    name: string;
    sublabel: string;
    description: string;
    accentStyle: string;
    recommendedVoice: "Kore" | "Zephyr" | "Aoede" | "Fenrir" | "Puck";
    tags: string[];
  }
> = {
  priya: {
    name: "Priya",
    sublabel: "Urban & Professional",
    description: "Fluent, polished contemporary Indian English accent. Ideal for presentations, guides, and corporate narrations.",
    accentStyle: "authentic Indian English urban accent (clear Bengaluru/Mumbai metro diction, natural cadence, professional and articulate intonation)",
    recommendedVoice: "Kore",
    tags: ["Professional", "Guides", "Explainer"],
  },
  ananya: {
    name: "Ananya",
    sublabel: "Warm & Conversational",
    description: "Friendly, lively everyday Indian female voice with genuine human warmth and approachable cadence.",
    accentStyle: "lively and friendly Indian English accent (conversational flow, warm vocal color, natural casual inflection)",
    recommendedVoice: "Zephyr",
    tags: ["Casual", "Podcast", "Friendly"],
  },
  meera: {
    name: "Meera",
    sublabel: "Calm & Storyteller",
    description: "Soothing, lyrical, and gentle Indian accent with deep warmth. Perfect for audiobooks, meditation, and storytelling.",
    accentStyle: "gentle, soothing, rhythmic Indian English accent (poetic cadence, soft and empathetic tone, calm pacing)",
    recommendedVoice: "Kore",
    tags: ["Audiobooks", "Relaxation", "Documentary"],
  },
  kavita: {
    name: "Kavita",
    sublabel: "Dynamic & Expressive",
    description: "High-energy, confident Indian female voice with vibrant cadence and sharp clarity.",
    accentStyle: "dynamic, vibrant, high-energy Indian English female accent (engaging inflections, expressive and upbeat cadence)",
    recommendedVoice: "Zephyr",
    tags: ["Commercials", "Announcements", "Events"],
  },
  shreya: {
    name: "Shreya",
    sublabel: "Hinglish & Colloquial",
    description: "Authentic bilingual Indian English & Hindi code-switching tone with colloquial rhythm and natural colloquial flair.",
    accentStyle: "authentic contemporary Indian Hinglish accent (natural colloquial Indian expressions, organic rhythm, conversational)",
    recommendedVoice: "Kore",
    tags: ["Hinglish", "Youth", "Social Media"],
  },
};

// API Route: List available voices and styles
app.get("/api/voices", (_req, res) => {
  res.json({
    personas: PERSONA_CONFIGS,
    emotions: [
      { id: "natural", label: "Natural Conversational", prompt: "in a completely natural, relaxed human conversational style with gentle pauses" },
      { id: "professional", label: "Professional & Polished", prompt: "in a crisp, authoritative, clear professional style with confident inflection" },
      { id: "warm", label: "Warm & Empathetic", prompt: "with deep kindness, emotional warmth, soft vocal resonance, and empathy" },
      { id: "cheerful", label: "Cheerful & Upbeat", prompt: "with joyful energy, bright smile in the voice, and lively rhythm" },
      { id: "calm", label: "Calm & Soothing", prompt: "with a soft, grounded, serene, and tranquil meditative cadence" },
      { id: "dramatic", label: "Engaging & Storytelling", prompt: "with rich narrative expression, dramatic pauses, and vivid vocal color" },
    ],
    speeds: [
      { id: "0.85", label: "Deliberate / Slow (0.85x)", prompt: "at a deliberate, relaxed, clear, slower pace" },
      { id: "1.0", label: "Natural Speed (1.0x)", prompt: "at a standard natural conversational tempo" },
      { id: "1.15", label: "Brisk / Energetic (1.15x)", prompt: "at a lively, slightly brisk, fast-paced cadence" },
    ],
  });
});

// API Route: TTS Synthesis
app.post("/api/tts", async (req, res) => {
  try {
    const {
      text,
      persona = "priya",
      emotion = "natural",
      speed = "1.0",
      customInstructions = "",
    } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Please provide valid text to convert." });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 5000) {
      return res.status(400).json({ error: "Text exceeds the 5000 character limit for a single synthesis." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in the environment. Please check your AI Studio settings.",
      });
    }

    const selectedPersona = PERSONA_CONFIGS[persona] || PERSONA_CONFIGS.priya;

    // Emotion description map
    const emotionPrompts: Record<string, string> = {
      natural: "in a completely natural, relaxed human conversational style with organic breathing rhythm and authentic pauses",
      professional: "in a crisp, polished, articulate, professional presentation style with confident diction",
      warm: "with deep empathy, genuine warmth, friendly smile, and gentle resonance",
      cheerful: "with enthusiastic, bright, uplifting energy and buoyant rhythm",
      calm: "with a soothing, soft, peaceful, and rhythmic storyteller cadence",
      dramatic: "with expressive vocal dynamics, immersive storytelling inflection, and captivating rhythm",
    };

    const speedPrompts: Record<string, string> = {
      "0.85": "at a calm, articulate, slightly slower pace with deliberate clarity",
      "1.0": "at an authentic natural conversational tempo",
      "1.15": "at an upbeat, brisk, energetic pace",
    };

    const emotionDesc = emotionPrompts[emotion] || emotionPrompts.natural;
    const speedDesc = speedPrompts[speed] || speedPrompts["1.0"];
    const extraGuidance = customInstructions ? ` Additional custom nuance: ${customInstructions.trim()}.` : "";

    // Detailed prompt to direct the neural voice synthesis model
    const speechPrompt = `You are a native Indian female speaker voicing text with complete authenticity.
VOICE INSTRUCTIONS:
- Accent & Voice: Speak in an authentic ${selectedPersona.accentStyle}.
- Tone & Emotion: Deliver ${emotionDesc}.
- Pacing: Speak ${speedDesc}.${extraGuidance}
- Pronunciation & Nuance: Use genuine Indian English phonetics, natural syllable timing, authentic stress on words, subtle human breathing cadence, and natural pitch contours. Avoid robotic monotone or foreign non-Indian accents.

Read the following text with maximum human naturalness:
"${trimmedText}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [
        {
          parts: [{ text: speechPrompt }],
        },
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: selectedPersona.recommendedVoice,
            },
          },
        },
      },
    });

    const candidatePart = response.candidates?.[0]?.content?.parts?.[0];
    const rawBase64 = candidatePart?.inlineData?.data;

    if (!rawBase64) {
      return res.status(502).json({
        error: "The AI speech model did not return audio data. Please try again with different phrasing.",
      });
    }

    // Convert raw PCM buffer to WAV
    const pcmBuffer = Buffer.from(rawBase64, "base64");
    const wavBuffer = pcmToWav(pcmBuffer, 24000, 1, 16);
    const wavBase64 = wavBuffer.toString("base64");

    // Estimate duration: 24000 samples/sec * 2 bytes/sample = 48000 bytes/sec
    const durationSeconds = Math.round((pcmBuffer.length / 48000) * 10) / 10;

    res.json({
      success: true,
      audioBase64: wavBase64,
      mimeType: "audio/wav",
      sampleRate: 24000,
      durationSeconds,
      persona: selectedPersona.name,
      personaId: persona,
      textLength: trimmedText.length,
      wordCount: trimmedText.split(/\s+/).filter(Boolean).length,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to synthesize speech";
    console.error("TTS Synthesis Error:", err);
    res.status(500).json({ error: errorMsg });
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Indian Female Voice TTS" });
});

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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TTS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
