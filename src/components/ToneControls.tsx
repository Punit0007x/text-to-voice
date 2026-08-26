import { useState } from "react";
import { EMOTIONS } from "../data/personas";
import { EmotionConfig } from "../types";
import {
  Sliders,
  Smile,
  Briefcase,
  Heart,
  Sparkles,
  Wind,
  BookOpen,
  Gauge,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ToneControlsProps {
  selectedEmotion: string;
  onEmotionChange: (emotionId: string) => void;
  selectedSpeed: string;
  onSpeedChange: (speed: string) => void;
  customInstructions: string;
  onCustomInstructionsChange: (val: string) => void;
}

export default function ToneControls({
  selectedEmotion,
  onEmotionChange,
  selectedSpeed,
  onSpeedChange,
  customInstructions,
  onCustomInstructionsChange,
}: ToneControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getIcon = (name: string) => {
    switch (name) {
      case "Smile":
        return <Smile className="w-3.5 h-3.5" />;
      case "Briefcase":
        return <Briefcase className="w-3.5 h-3.5" />;
      case "Heart":
        return <Heart className="w-3.5 h-3.5" />;
      case "Sparkles":
        return <Sparkles className="w-3.5 h-3.5" />;
      case "Wind":
        return <Wind className="w-3.5 h-3.5" />;
      case "BookOpen":
        return <BookOpen className="w-3.5 h-3.5" />;
      default:
        return <Smile className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900">Emotion, Cadence & Pacing</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">Fine-tuned human delivery</span>
      </div>

      {/* Emotion Chips */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-2">
          Emotional Style & Tone
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {EMOTIONS.map((emotion: EmotionConfig) => {
            const isSelected = selectedEmotion === emotion.id;
            return (
              <button
                key={emotion.id}
                type="button"
                id={`emotion-btn-${emotion.id}`}
                onClick={() => onEmotionChange(emotion.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-amber-500 text-white border-amber-600 shadow-xs font-semibold"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-medium"
                }`}
                title={emotion.description}
              >
                <span className={isSelected ? "text-white" : "text-amber-600"}>
                  {getIcon(emotion.iconName)}
                </span>
                <span className="text-xs truncate">{emotion.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Speed & Advanced Drawer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
        {/* Speaking Pace */}
        <div>
          <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-slate-500" />
              Speaking Speed
            </span>
            <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
              {selectedSpeed === "0.85" ? "0.85x (Deliberate)" : selectedSpeed === "1.15" ? "1.15x (Brisk)" : "1.0x (Natural)"}
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: "0.85", label: "Slow (0.85x)" },
              { val: "1.0", label: "Natural (1.0x)" },
              { val: "1.15", label: "Brisk (1.15x)" },
            ].map((spd) => (
              <button
                key={spd.val}
                type="button"
                id={`speed-btn-${spd.val}`}
                onClick={() => onSpeedChange(spd.val)}
                className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                  selectedSpeed === spd.val
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt Toggle */}
        <div className="flex flex-col justify-end">
          <button
            type="button"
            id="toggle-custom-nuance-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-medium text-slate-700 transition"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Custom Indian Nuance / Direction
            </span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Advanced Custom Nuance Input */}
      {showAdvanced && (
        <div className="pt-2 animate-fadeIn">
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Additional Voice Direction (Optional)</span>
              <span className="text-[11px] text-slate-400">e.g., flight announcement, gentle laugh</span>
            </div>
            <input
              id="custom-voice-instructions"
              type="text"
              value={customInstructions}
              onChange={(e) => onCustomInstructionsChange(e.target.value)}
              placeholder="e.g. Add a warm smile on the welcome, sound like a courteous flight attendant..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
