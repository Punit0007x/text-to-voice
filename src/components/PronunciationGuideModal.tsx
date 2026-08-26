import { X, Sparkles, Volume2, HelpCircle, CheckCircle2 } from "lucide-react";

interface PronunciationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PronunciationGuideModal({
  isOpen,
  onClose,
}: PronunciationGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="accent-guide-modal"
        className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-xl space-y-5 animate-fadeIn"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tips for Natural Indian Voice Synthesis
              </h3>
              <p className="text-xs text-slate-500">
                How to get the most human, authentic cadence and pronunciation
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-guide-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tips Content */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-600">
          {/* Tip 1 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Use Commas & Ellipses for Human Breathing</span>
            </div>
            <p className="text-slate-600 pl-6 leading-relaxed">
              In natural Indian conversation, speakers take brief micro-pauses between thoughts. Add a comma <code className="bg-white px-1.5 py-0.5 rounded border text-slate-800">,</code> or an ellipsis <code className="bg-white px-1.5 py-0.5 rounded border text-slate-800">...</code> to create genuine human pacing.
            </p>
          </div>

          {/* Tip 2 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Indian Proper Nouns & Regional Cities</span>
            </div>
            <p className="text-slate-600 pl-6 leading-relaxed">
              Words like <em>Namaste, Bengaluru, Indiranagar, Alleppey, Mumbai, Cardamom, Mysore Pak</em> are pronounced with native Indian phonetics and authentic syllable stress.
            </p>
          </div>

          {/* Tip 3 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Hinglish & Conversational Particles</span>
            </div>
            <p className="text-slate-600 pl-6 leading-relaxed">
              Select the <strong>Shreya</strong> persona for casual code-switching with colloquial phrases like <em>"Arre yaar"</em>, <em>"Pakka"</em>, <em>"Chai"</em>, <em>"Accha"</em>, and <em>"Theek hai"</em>.
            </p>
          </div>

          {/* Tip 4 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Selecting the Right Persona</span>
            </div>
            <ul className="list-disc pl-10 space-y-1 text-slate-600 leading-relaxed">
              <li><strong>Priya:</strong> Crisp, corporate presentations and professional guide explainers.</li>
              <li><strong>Ananya:</strong> Warm, upbeat podcast chats and friendly messages.</li>
              <li><strong>Meera:</strong> Soft, soothing audiobooks, meditation, and calm storytelling.</li>
              <li><strong>Kavita:</strong> High-impact, energetic announcements and product launches.</li>
            </ul>
          </div>
        </div>

        {/* Footer Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Got it, let's convert text!
          </button>
        </div>
      </div>
    </div>
  );
}
