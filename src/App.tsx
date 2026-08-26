import { useState, useEffect } from "react";
import { PERSONAS, SAMPLE_PRESETS, EMOTIONS } from "./data/personas";
import { PersonaConfig, SamplePreset, TTSHistoryItem } from "./types";
import PersonaSelector from "./components/PersonaSelector";
import ToneControls from "./components/ToneControls";
import TextInputStudio from "./components/TextInputStudio";
import AudioPlayer from "./components/AudioPlayer";
import AudioHistory from "./components/AudioHistory";
import PronunciationGuideModal from "./components/PronunciationGuideModal";
import { speakWithBrowserVoice } from "./utils/audioUtils";
import { Sparkles, Mic, Volume2, Info, Radio, ShieldCheck, Heart } from "lucide-react";

export default function App() {
  // State
  const [selectedPersona, setSelectedPersona] = useState<PersonaConfig>(PERSONAS[0]);
  const [selectedEmotion, setSelectedEmotion] = useState<string>("natural");
  const [selectedSpeed, setSelectedSpeed] = useState<string>("1.0");
  const [customInstructions, setCustomInstructions] = useState<string>("");
  const [text, setText] = useState<string>(SAMPLE_PRESETS[0].text);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isBrowserSpeaking, setIsBrowserSpeaking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active audio generation state
  const [currentAudio, setCurrentAudio] = useState<{
    audioBase64: string;
    personaName: string;
    emotionLabel: string;
    durationSeconds: number;
    wordCount: number;
    textSnippet: string;
  } | null>(null);

  // History state with local persistence
  const [history, setHistory] = useState<TTSHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("tts_history_items");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Guide modal
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Save history on changes
  useEffect(() => {
    try {
      localStorage.setItem("tts_history_items", JSON.stringify(history.slice(0, 15)));
    } catch (e) {
      console.warn("Unable to save to localStorage", e);
    }
  }, [history]);

  // Handle Quick Sample selection from Persona cards
  const handleQuickSample = (sampleText: string, persona: PersonaConfig) => {
    setText(sampleText);
    setSelectedPersona(persona);
    setError(null);
  };

  // Handle Scenario preset selection
  const handleSelectSamplePreset = (preset: SamplePreset) => {
    setText(preset.text);
    const targetPersona = PERSONAS.find((p) => p.id === preset.recommendedPersona) || PERSONAS[0];
    setSelectedPersona(targetPersona);
    setSelectedEmotion(preset.recommendedEmotion);
    setError(null);
  };

  // Primary Neural AI Synthesis Call
  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      setError("Please type or paste some text to synthesize.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          persona: selectedPersona.id,
          emotion: selectedEmotion,
          speed: selectedSpeed,
          customInstructions: customInstructions.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate speech.");
      }

      const emotionObj = EMOTIONS.find((e) => e.id === selectedEmotion);
      const emotionLabel = emotionObj ? emotionObj.label : "Natural";

      const newAudioItem = {
        audioBase64: data.audioBase64,
        personaName: selectedPersona.name,
        emotionLabel: `${emotionLabel} (${selectedSpeed}x)`,
        durationSeconds: data.durationSeconds || 0,
        wordCount: data.wordCount || text.split(/\s+/).filter(Boolean).length,
        textSnippet: text.trim(),
      };

      setCurrentAudio(newAudioItem);

      // Add to history
      const historyEntry: TTSHistoryItem = {
        id: `gen-${Date.now()}`,
        text: text.trim(),
        personaId: selectedPersona.id,
        personaName: selectedPersona.name,
        emotion: emotionLabel,
        speed: selectedSpeed,
        audioBase64: data.audioBase64,
        mimeType: data.mimeType || "audio/wav",
        durationSeconds: data.durationSeconds || 0,
        wordCount: data.wordCount || 0,
        timestamp: Date.now(),
        engine: "neural-ai",
      };

      setHistory((prev) => [historyEntry, ...prev.filter((item) => item.id !== historyEntry.id)].slice(0, 15));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error synthesizing speech. Please try again.";
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Browser Web Speech fallback playback
  const handleBrowserPlay = () => {
    if (!text.trim()) return;
    setIsBrowserSpeaking(true);
    try {
      speakWithBrowserVoice(
        text,
        parseFloat(selectedSpeed) || 1.0,
        () => setIsBrowserSpeaking(false),
        () => setIsBrowserSpeaking(false)
      );
    } catch (err) {
      console.warn(err);
      setIsBrowserSpeaking(false);
      setError("Device speech synthesis is unavailable. Please use the AI Neural Speech synthesis.");
    }
  };

  // Load from history
  const handleSelectHistoryItem = (item: TTSHistoryItem) => {
    setCurrentAudio({
      audioBase64: item.audioBase64,
      personaName: item.personaName,
      emotionLabel: `${item.emotion} (${item.speed}x)`,
      durationSeconds: item.durationSeconds,
      wordCount: item.wordCount,
      textSnippet: item.text,
    });
    setText(item.text);
    const personaMatch = PERSONAS.find((p) => p.id === item.personaId);
    if (personaMatch) {
      setSelectedPersona(personaMatch);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("tts_history_items");
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 antialiased py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top App Header */}
        <header className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center text-white shadow-sm">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  Indian Female Voice TTS
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300/60 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  Neural Human Accent
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Authentic Indian English & Hinglish text-to-speech with natural cadence, regional nuances, and human emotion.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="header-accent-tips-btn"
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-amber-50 hover:text-amber-900 rounded-xl border border-slate-200 transition"
            >
              <Info className="w-3.5 h-3.5 text-amber-600" />
              Pronunciation Guide
            </button>
          </div>
        </header>

        {/* 1. Voice Persona Selector */}
        <section aria-label="Select Voice Persona">
          <PersonaSelector
            selectedPersona={selectedPersona}
            onSelect={setSelectedPersona}
            onQuickSample={handleQuickSample}
          />
        </section>

        {/* 2. Tone, Emotion & Speed Controls */}
        <section aria-label="Tone and Emotion Controls">
          <ToneControls
            selectedEmotion={selectedEmotion}
            onEmotionChange={setSelectedEmotion}
            selectedSpeed={selectedSpeed}
            onSpeedChange={setSelectedSpeed}
            customInstructions={customInstructions}
            onCustomInstructionsChange={setCustomInstructions}
          />
        </section>

        {/* 3. Text Input Studio & Convert Button */}
        <section aria-label="Text Input Studio">
          <TextInputStudio
            text={text}
            onTextChange={setText}
            selectedPersona={selectedPersona}
            selectedEmotion={selectedEmotion}
            selectedSpeed={selectedSpeed}
            onSelectSamplePreset={handleSelectSamplePreset}
            onOpenGuide={() => setIsGuideOpen(true)}
            onGenerate={handleGenerateSpeech}
            onBrowserPlay={handleBrowserPlay}
            isGenerating={isGenerating}
            isBrowserSpeaking={isBrowserSpeaking}
            error={error}
          />
        </section>

        {/* 4. Active Audio Output Player with Waveform Visualizer */}
        {currentAudio && (
          <section aria-label="Audio Playback and Visualizer" className="animate-fadeIn">
            <AudioPlayer
              audioBase64={currentAudio.audioBase64}
              personaName={currentAudio.personaName}
              emotionLabel={currentAudio.emotionLabel}
              durationSeconds={currentAudio.durationSeconds}
              wordCount={currentAudio.wordCount}
              textSnippet={currentAudio.textSnippet}
            />
          </section>
        )}

        {/* 5. Generation History */}
        <section aria-label="Speech History">
          <AudioHistory
            history={history}
            onSelectHistoryItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
            onDeleteItem={handleDeleteHistoryItem}
          />
        </section>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            24kHz Studio Quality Audio
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Full Indian Phonetics & Cadence
          </span>
          <span>•</span>
          <span>5 Authentic Female Personas</span>
        </footer>
      </div>

      {/* Guide Modal */}
      <PronunciationGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
