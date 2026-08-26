import { useState } from "react";
import { SAMPLE_PRESETS } from "../data/personas";
import { SamplePreset, PersonaConfig } from "../types";
import { estimateSpeechDuration } from "../utils/audioUtils";
import {
  Sparkles,
  Play,
  RotateCw,
  Clipboard,
  Trash2,
  BookOpen,
  Volume2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface TextInputStudioProps {
  text: string;
  onTextChange: (val: string) => void;
  selectedPersona: PersonaConfig;
  selectedEmotion: string;
  selectedSpeed: string;
  onSelectSamplePreset: (sample: SamplePreset) => void;
  onOpenGuide: () => void;
  onGenerate: () => void;
  onBrowserPlay: () => void;
  isGenerating: boolean;
  isBrowserSpeaking: boolean;
  error: string | null;
}

export default function TextInputStudio({
  text,
  onTextChange,
  selectedPersona,
  selectedEmotion,
  selectedSpeed,
  onSelectSamplePreset,
  onOpenGuide,
  onGenerate,
  onBrowserPlay,
  isGenerating,
  isBrowserSpeaking,
  error,
}: TextInputStudioProps) {
  const [copiedNotification, setCopiedNotification] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const speedNum = parseFloat(selectedSpeed) || 1.0;
  const estimatedSeconds = estimateSpeechDuration(text, speedNum);

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onTextChange(clipText);
      }
    } catch {
      // Ignore clipboard read permission failures
    }
  };

  const handleClear = () => {
    onTextChange("");
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Top Header & Presets Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <label htmlFor="tts-text-input" className="text-sm font-bold text-slate-900">
            Script / Text to Convert
          </label>
          <button
            type="button"
            id="open-accent-guide-btn"
            onClick={onOpenGuide}
            className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200/70 transition"
            title="View tips for realistic Indian cadence and pronunciations"
          >
            <BookOpen className="w-3 h-3" />
            Accent & Nuance Tips
          </button>
        </div>

        {/* Sample Templates Dropdown / Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">Try Scenario:</span>
          <select
            id="sample-preset-select"
            defaultValue=""
            onChange={(e) => {
              const preset = SAMPLE_PRESETS.find((p) => p.id === e.target.value);
              if (preset) {
                onSelectSamplePreset(preset);
                e.target.value = "";
              }
            }}
            className="text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
          >
            <option value="" disabled>
              Load Sample Text...
            </option>
            {SAMPLE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.category}: {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          id="tts-text-input"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Enter or paste English or Hinglish text to speak in authentic Indian female voice... (e.g. 'Namaste! Welcome to our Bangalore tech conference. Today we are excited to showcase our latest innovations.')"
          rows={5}
          maxLength={5000}
          className="w-full text-sm sm:text-base text-slate-800 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-4 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition resize-y min-h-[140px]"
        />

        {/* Floating Quick Action Buttons inside textarea */}
        <div className="absolute right-3 bottom-4 flex items-center gap-1.5">
          {text && (
            <button
              type="button"
              id="clear-text-btn"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-slate-700 bg-white/80 backdrop-blur-xs hover:bg-white rounded-lg border border-slate-200/80 transition"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            id="paste-clipboard-btn"
            onClick={handlePaste}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 bg-white/90 backdrop-blur-xs hover:bg-white hover:text-slate-900 rounded-lg border border-slate-200 shadow-2xs transition"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3 h-3 text-slate-500" />
            Paste
          </button>
        </div>
      </div>

      {/* Metadata Stats Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 px-1">
        <div className="flex items-center gap-4">
          <span>
            <strong className="font-semibold text-slate-700">{wordCount}</strong> words
          </span>
          <span>
            <strong className="font-semibold text-slate-700">{charCount}</strong>/5000 chars
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Est. ~{estimatedSeconds}s audio
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <span>Active Persona:</span>
          <span className="font-semibold text-slate-700">{selectedPersona.name} ({selectedPersona.sublabel})</span>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Speech Generation Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Secondary: Browser Web Speech Preview */}
        <button
          type="button"
          id="browser-tts-preview-btn"
          onClick={onBrowserPlay}
          disabled={!text.trim() || isGenerating}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Instant zero-latency preview using your device's built-in Indian speech synthesis"
        >
          <Volume2 className="w-4 h-4 text-slate-600" />
          {isBrowserSpeaking ? "Speaking on Device..." : "Device Speech Preview (Instant)"}
        </button>

        {/* Primary: Neural AI Indian Female Speech Synthesis */}
        <button
          type="button"
          id="generate-neural-tts-btn"
          onClick={onGenerate}
          disabled={!text.trim() || isGenerating}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:via-orange-600 hover:to-rose-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-98"
        >
          {isGenerating ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              Synthesizing {selectedPersona.name}'s Voice...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Convert to Indian Female Voice
            </>
          )}
        </button>
      </div>
    </div>
  );
}
