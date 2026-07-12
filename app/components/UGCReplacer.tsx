"use client";
import { useState } from "react";
import {
  User, FileText, Clock, Copy, CheckCircle2, RefreshCw,
  Video, AlertCircle, Loader2, ChevronRight,
} from "lucide-react";
import { useHiggsfieldJob } from "@/app/hooks/useHiggsfieldJob";

const CHARACTERS = [
  { id: "emma",   name: "Emma",   type: "Female · 25-30 · Energetic",   style: "from-pink-500 to-purple-600" },
  { id: "jake",   name: "Jake",   type: "Male · 28-35 · Confident",     style: "from-blue-500 to-indigo-600" },
  { id: "sofia",  name: "Sofia",  type: "Female · 20-25 · Authentic",   style: "from-orange-500 to-pink-600" },
  { id: "marcus", name: "Marcus", type: "Male · 30-40 · Professional",  style: "from-teal-500 to-cyan-600" },
  { id: "lily",   name: "Lily",   type: "Female · 22-28 · Trendy",      style: "from-violet-500 to-fuchsia-600" },
  { id: "alex",   name: "Alex",   type: "Non-binary · 25-32 · Natural", style: "from-emerald-500 to-teal-600" },
];

interface UGCReplacerProps {
  hasVideo: boolean;
  videoDuration: number;
}

export default function UGCReplacer({ hasVideo, videoDuration }: UGCReplacerProps) {
  const [selectedChar, setSelectedChar] = useState("emma");
  const [script, setScript] = useState("");
  const { result, generate, reset } = useHiggsfieldJob("/api/higgsfield/ugc-copy");

  const busy = result.status === "submitting" || result.status === "processing";
  const selectedCharData = CHARACTERS.find(c => c.id === selectedChar);
  const durationLabel = videoDuration > 0 ? `${videoDuration}s` : null;
  const canGenerate = hasVideo && script.trim().length > 0 && !busy;

  const run = () => {
    if (!canGenerate) return;
    generate({
      script: script.trim(),
      characterId: selectedChar,
      duration: videoDuration > 0 ? videoDuration : 15,
      aspectRatio: "9:16",
    });
  };

  return (
    <div className="space-y-5">

      {/* Workflow summary badge */}
      <div className="flex flex-col gap-2 p-3 rounded-xl text-[11px]"
        style={{ background: "rgba(109,40,217,0.06)", border: "1px solid rgba(109,40,217,0.15)" }}>
        <p style={{ color: "#a78bfa" }} className="font-medium">UGC Copy Workflow</p>
        <div className="flex items-center gap-1.5 flex-wrap" style={{ color: "#555566" }}>
          <span className="flex items-center gap-1"><FileText size={10} /> Same script</span>
          <ChevronRight size={10} />
          <span className="flex items-center gap-1"><User size={10} /> New character</span>
          <ChevronRight size={10} />
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {durationLabel ? `${durationLabel} duration` : "Matched duration"}
          </span>
        </div>
      </div>

      {/* Duration match indicator */}
      {hasVideo && durationLabel && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
          <span className="text-[11px]" style={{ color: "#6ee7b7" }}>
            Original duration detected: <strong>{durationLabel}</strong> — new video will match exactly
          </span>
        </div>
      )}

      {/* Step 1: Script */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: "#7c3aed" }}>1</span>
          <div className="flex items-center gap-1.5">
            <FileText size={12} style={{ color: "#a855f7" }} />
            <label className="text-[11px] uppercase tracking-wider" style={{ color: "#555566" }}>
              Original Script
            </label>
          </div>
        </div>
        <textarea
          value={script}
          onChange={e => setScript(e.target.value)}
          placeholder={"Paste the dialogue from the original UGC video here…\n\nThe exact same words will be spoken by the new character."}
          rows={6}
          className="w-full rounded-xl px-4 py-3 text-xs leading-relaxed resize-none"
          style={{
            background: "rgba(16,16,28,0.8)",
            border: `1px solid ${script.trim() ? "rgba(109,40,217,0.3)" : "rgba(255,255,255,0.06)"}`,
            color: "#e2e2f0",
          }}
        />
        {script.trim() && (
          <p className="text-[11px] mt-1 text-right" style={{ color: "#555566" }}>
            {script.trim().split(/\s+/).length} words · {durationLabel ?? "duration TBD"}
          </p>
        )}
      </div>

      {/* Step 2: Character */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: "#7c3aed" }}>2</span>
          <div className="flex items-center gap-1.5">
            <User size={12} style={{ color: "#a855f7" }} />
            <label className="text-[11px] uppercase tracking-wider" style={{ color: "#555566" }}>
              New AI Character
            </label>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CHARACTERS.map(char => {
            const active = selectedChar === char.id;
            return (
              <button key={char.id} onClick={() => setSelectedChar(char.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-[1.03]"
                style={{
                  background: active ? "rgba(109,40,217,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "rgba(147,51,234,0.4)" : "rgba(255,255,255,0.05)"}`,
                  boxShadow: active ? "0 0 16px rgba(109,40,217,0.2)" : "none",
                }}>
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${char.style} flex items-center justify-center text-white font-bold text-base relative`}>
                  {char.name[0]}
                  {active && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "#9333ea" }}>
                      <CheckCircle2 size={10} className="text-white" />
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium leading-tight" style={{ color: active ? "#e2e2f0" : "#aaaacc" }}>{char.name}</p>
                  <p className="text-[10px] leading-tight mt-0.5" style={{ color: "#555566" }}>{char.type.split("·")[0].trim()}</p>
                </div>
              </button>
            );
          })}
        </div>
        {selectedCharData && (
          <p className="text-[11px] text-center mt-1.5" style={{ color: "#555566" }}>{selectedCharData.type}</p>
        )}
      </div>

      {/* Job feedback */}
      {result.status !== "idle" && (
        <JobFeedback result={result} onReset={reset} charName={selectedCharData?.name ?? ""} />
      )}

      {/* Generate */}
      <button onClick={run} disabled={!canGenerate}
        className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed btn-primary">
        {busy
          ? <><Loader2 size={16} className="animate-spin" /> Generating copy…</>
          : result.status === "done"
            ? <><RefreshCw size={16} /> Regenerate</>
            : <><Copy size={16} /> Copy with New Character</>
        }
      </button>

      {/* Helper hints */}
      {!hasVideo && (
        <p className="text-center text-[11px]" style={{ color: "#444455" }}>
          Upload a video first to start the copy workflow
        </p>
      )}
      {hasVideo && !script.trim() && (
        <p className="text-center text-[11px]" style={{ color: "#444455" }}>
          Paste the original script above to enable generation
        </p>
      )}

      <p className="text-center text-[11px]" style={{ color: "#333344" }}>
        Engine: <span style={{ color: "#a855f7" }}>Higgsfield Marketing Studio</span> · UGC mode
      </p>
    </div>
  );
}

function JobFeedback({ result, onReset, charName }: {
  result: ReturnType<typeof useHiggsfieldJob>["result"];
  onReset: () => void;
  charName: string;
}) {
  if (result.status === "submitting" || result.status === "processing") {
    return (
      <div className="rounded-xl p-4 space-y-3"
        style={{ background: "rgba(109,40,217,0.07)", border: "1px solid rgba(109,40,217,0.2)" }}>
        <div className="flex items-center gap-2">
          <Loader2 size={13} className="text-purple-400 animate-spin" />
          <span className="text-sm" style={{ color: "#c084fc" }}>{result.stepLabel}</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full bar-fill transition-all duration-700" style={{ width: `${result.progress}%` }} />
        </div>
      </div>
    );
  }
  if (result.status === "error") {
    return (
      <div className="rounded-xl p-3 flex items-start gap-2"
        style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
        <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs flex-1" style={{ color: "#888899" }}>{result.error}</p>
        <button onClick={onReset} className="ml-auto text-xs text-red-400 hover:text-red-300">Retry</button>
      </div>
    );
  }
  if (result.status === "done" && result.videoUrl) {
    return (
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(16,185,129,0.25)" }}>
        <div className="p-3 flex items-center gap-3" style={{ background: "rgba(16,185,129,0.07)" }}>
          <CheckCircle2 size={16} className="text-emerald-400" />
          <div>
            <p className="text-emerald-300 text-sm font-medium">{charName} copy ready!</p>
            <p className="text-[11px]" style={{ color: "#888899" }}>Same script · Same duration · New character</p>
          </div>
        </div>
        <div className="p-3 flex gap-2" style={{ background: "rgba(5,5,7,0.8)" }}>
          <a href={result.videoUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 py-2 rounded-lg text-xs font-medium text-white text-center transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
            style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <Video size={12} /> Preview
          </a>
          <a href={result.videoUrl} download
            className="flex-1 py-2 rounded-lg text-xs font-medium text-white text-center transition-all hover:scale-[1.02]"
            style={{ background: "rgba(109,40,217,0.2)", border: "1px solid rgba(109,40,217,0.3)" }}>
            Download
          </a>
          <button onClick={onReset}
            className="px-3 py-2 rounded-lg text-xs btn-ghost" style={{ color: "#888899" }}>
            <RefreshCw size={12} />
          </button>
        </div>
      </div>
    );
  }
  return null;
}
