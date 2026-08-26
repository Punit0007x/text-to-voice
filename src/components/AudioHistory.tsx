import { TTSHistoryItem } from "../types";
import { Play, Download, Trash2, Clock, Volume2, Sparkles, Check, Share2 } from "lucide-react";
import { downloadWav } from "../utils/audioUtils";
import { useState } from "react";

interface AudioHistoryProps {
  history: TTSHistoryItem[];
  onSelectHistoryItem: (item: TTSHistoryItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export default function AudioHistory({
  history,
  onSelectHistoryItem,
  onClearHistory,
  onDeleteItem,
}: AudioHistoryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (history.length === 0) return null;

  const handleCopyText = (item: TTSHistoryItem) => {
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900">Recent Syntheses & Recordings</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {history.length}
          </span>
        </div>
        <button
          type="button"
          id="clear-all-history-btn"
          onClick={onClearHistory}
          className="text-xs font-medium text-slate-500 hover:text-rose-600 transition"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        {history.map((item) => {
          const formattedDate = new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={item.id}
              id={`history-item-${item.id}`}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  id={`play-history-btn-${item.id}`}
                  onClick={() => onSelectHistoryItem(item)}
                  className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs transition"
                  title="Load and play this speech recording"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-800">{item.personaName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      {item.emotion}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{item.speed}x</span>
                    <span className="text-[10px] text-slate-400 font-mono">• {formattedDate}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    "{item.text}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  id={`download-history-btn-${item.id}`}
                  onClick={() =>
                    downloadWav(
                      item.audioBase64,
                      `${item.personaName.toLowerCase()}-voice-${item.id}.wav`
                    )
                  }
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition"
                  title="Download WAV file"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  id={`copy-history-text-btn-${item.id}`}
                  onClick={() => handleCopyText(item)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition"
                  title="Copy text"
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  id={`delete-history-btn-${item.id}`}
                  onClick={() => onDeleteItem(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition"
                  title="Delete from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
