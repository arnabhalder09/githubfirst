"use client";
import { useState } from "react";
import { User, MessageSquare, PenLine, Sparkles, CheckCircle2, RefreshCw, Video, AlertCircle, Loader2 } from "lucide-react";
import { useHiggsfieldJob } from "@/app/hooks/useHiggsfieldJob";

const CHARACTERS = [
  { id: "emma",   name: "Emma",   type: "Female · 25-30 · Energetic",    style: "from-pink-500 to-purple-600" },
  { id: "jake",   name: "Jake",   type: "Male · 28-35 · Confident",      style: "from-blue-500 to-indigo-600" },
  { id: "sofia",  name: "Sofia",  type: "Female · 20-25 · Authentic",    style: "from-orange-500 to-pink-600" },
  { id: "marcus", name: "Marcus", type: "Male · 30-40 · Professional",   style: "from-teal-500 to-cyan-600" },
  { id: "lily",   name: "Lily",   type: "Female · 22-28 · Trendy",       style: "from-violet-500 to-fuchsia-600" },
  { id: "alex",   name: "Alex",   type: "Non-binary · 25-32 · Natural",  style: "from-emerald-500 to-teal-600" },
];

const ORIGINAL_SCRIPT = `Hey guys! So I've been using this for about three weeks now and honestly?
I'm absolutely obsessed. Like, I cannot imagine my morning routine without it anymore.

The results were noticeable within the first few days — my skin just feels
so much smoother and more hydrated.

If you're on the fence, just try it. You can thank me later. Link in bio!`;

type DialogueMode = "same" | "new";

interface UGCReplacerProps { hasVideo: boolean }

export default function UGCReplacer({ hasVideo }: UGCReplacerProps) {
  const [selectedChar, setSelectedChar] = useState("emma");
  const [dialogueMode, setDialogueMode] = useState<DialogueMode>("same");
  const [newScript, setNewScript] = useState(ORIGINAL_SCRIPT);
  const { result, generate, reset } = useHiggsfieldJob();
  const busy = result.status === "submitting" || result.status === "processing";

  const selectedCharData = CHARACTERS.find(c => c.id === selectedChar);

  const run = () => {
    if (!hasVideo) return;
    // Seedance 2.0: reference-driven, identity-consistent — best for UGC character replacement
    generate({
      model: "seedance_2_0",
      prompt: dialogueMode === "new"
        ? newScript
        : `A UGC-style ad creator speaking authentically to camera, same script and timing as original, natural and genuine delivery`,
      aspectRatio: "9:16",
      duration: 15,
      characterId: selectedChar,
      dialogueMode,
    });
  };

  return (
    <div className="space-y-5">
      {/* Character picker */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <User size={13} style={{ color: "#a855f7" }} />
          <label className="text-[11px] uppercase tracking-wider" style={{ color: "#555566" }}>Choose AI Character</label>
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

      {/* Dialogue mode */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare size={13} style={{ color: "#a855f7" }} />
          <label className="text-[11px] uppercase tracking-wider" style={{ color: "#555566" }}>Dialogue Mode</label>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {(["same", "new"] as const).map(m => (
            <button key={m} onClick={() => setDialogueMode(m)}
              className="flex flex-col items-start gap-1 p-3 rounded-xl transition-all"
              style={{
                background: dialogueMode === m
                  ? m === "same" ? "rgba(16,185,129,0.08)" : "rgba(109,40,217,0.1)"
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${dialogueMode === m
                  ? m === "same" ? "rgba(16,185,129,0.3)" : "rgba(147,51,234,0.3)"
                  : "rgba(255,255,255,0.06)"}`,
              }}>
              <div className="flex items-center gap-2">
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                  dialogueMode === m
                    ? m === "same" ? "border-emerald-400 bg-emerald-400" : "border-purple-400 bg-purple-400"
                    : "border-[#444455]"
                }`}>
                  {dialogueMode === m && <div className="w-1 h-1 rounded-full bg-white" />}
                </div>
                <span className="text-xs font-medium" style={{ color: dialogueMode === m ? "#e2e2f0" : "#aaaacc" }}>
                  {m === "same" ? "Same Dialogue" : "New Script"}
                </span>
              </div>
              <p className="text-[10px] pl-5" style={{ color: "#555566" }}>
                {m === "same" ? "Keep exact original script" : "Write or rewrite the script"}
              </p>
            </button>
          ))}
        </div>

        {/* Script editor */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "#555566" }}>
              <PenLine size={11} />
              {dialogueMode === "same" ? "Original script (read-only)" : "New script — edit below"}
            </div>
            {dialogueMode === "new" && (
              <button onClick={() => setNewScript(ORIGINAL_SCRIPT)}
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded transition-all"
                style={{ color: "#888899", background: "rgba(255,255,255,0.04)" }}>
                <RefreshCw size={10} /> Reset
              </button>
            )}
          </div>
          <textarea
            value={dialogueMode === "same" ? ORIGINAL_SCRIPT : newScript}
            onChange={e => dialogueMode === "new" && setNewScript(e.target.value)}
            readOnly={dialogueMode === "same"}
            rows={6}
            className="w-full rounded-xl px-4 py-3 text-xs leading-relaxed resize-none"
            style={{
              background: dialogueMode === "same" ? "rgba(8,8,12,0.6)" : "rgba(16,16,28,0.8)",
              border: `1px solid ${dialogueMode === "same" ? "rgba(255,255,255,0.05)" : "rgba(109,40,217,0.25)"}`,
              color: dialogueMode === "same" ? "#555566" : "#e2e2f0",
            }}
          />
        </div>
      </div>

      {/* Job feedback */}
      {result.status !== "idle" && (
        <JobFeedback result={result} onReset={reset} charName={selectedCharData?.name ?? ""} />
      )}

      <button onClick={run} disabled={!hasVideo || busy}
        className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed btn-primary">
        {busy
          ? <><Loader2 size={16} className="animate-spin" /> Replacing character…</>
          : result.status === "done"
            ? <><RefreshCw size={16} /> Regenerate</>
            : <><Sparkles size={16} /> Replace UGC Character</>
        }
      </button>

      <p className="text-center text-[11px]" style={{ color: "#444455" }}>
        Engine: <span style={{ color: "#a855f7" }}>Seedance 2.0</span> · Identity-consistent character generation
      </p>

      {!hasVideo && (
        <p className="text-center text-[11px]" style={{ color: "#444455" }}>Upload a video first to replace characters</p>
      )}
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
        <AlertCircle size={14} className="text-red-400 mt-0.5" />
        <p className="text-xs" style={{ color: "#888899" }}>{result.error}</p>
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
            <p className="text-emerald-300 text-sm font-medium">{charName} replacement ready!</p>
            <p className="text-[11px]" style={{ color: "#888899" }}>Generated by Seedance 2.0</p>
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
