import { PERSONAS } from "../data/personas";
import { PersonaConfig } from "../types";
import { Check, Sparkles, Volume2, Mic } from "lucide-react";

interface PersonaSelectorProps {
  selectedPersona: PersonaConfig;
  onSelect: (persona: PersonaConfig) => void;
  onQuickSample: (sampleText: string, persona: PersonaConfig) => void;
}

export default function PersonaSelector({
  selectedPersona,
  onSelect,
  onQuickSample,
}: PersonaSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-600" />
            Select Indian Female Voice Persona
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Crafted with authentic Indian accents, regional nuances, and human-like emotional intonation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {PERSONAS.map((persona) => {
          const isSelected = selectedPersona.id === persona.id;
          return (
            <div
              key={persona.id}
              id={`persona-card-${persona.id}`}
              onClick={() => onSelect(persona)}
              className={`relative text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? "bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
                  : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
              }`}
            >
              {/* Active Badge */}
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}

              <div>
                {/* Avatar and Name */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${persona.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-xs`}
                  >
                    {persona.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-1">
                      {persona.name}
                    </h4>
                    <p className="text-[11px] font-medium text-amber-700 leading-tight">
                      {persona.sublabel}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                  {persona.description}
                </p>

                {/* Accent Tag */}
                <div className="mb-3">
                  <span className="inline-block text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                    {persona.accentStyle}
                  </span>
                </div>
              </div>

              {/* Quick Sample Button */}
              <button
                type="button"
                id={`try-sample-btn-${persona.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(persona);
                  onQuickSample(persona.samplePhrase, persona);
                }}
                className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 transition-colors"
                title="Load sample introduction text"
              >
                <Volume2 className="w-3 h-3 text-amber-600" />
                Try Sample Intro
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
