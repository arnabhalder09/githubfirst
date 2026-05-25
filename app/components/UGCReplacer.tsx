"use client";
import { useState } from "react";
import { User, MessageSquare, PenLine, Sparkles, ChevronDown, CheckCircle2, Loader2, RefreshCw, Video } from "lucide-react";

const CHARACTERS = [
  { id: "emma", name: "Emma", type: "Female · 25-30 · Energetic", style: "bg-gradient-to-br from-pink-500 to-purple-600" },
  { id: "jake", name: "Jake", type: "Male · 28-35 · Confident", style: "bg-gradient-to-br from-blue-500 to-indigo-600" },
  { id: "sofia", name: "Sofia", type: "Female · 20-25 · Authentic", style: "bg-gradient-to-br from-orange-500 to-pink-600" },
  { id: "marcus", name: "Marcus", type: "Male · 30-40 · Professional", style: "bg-gradient-to-br from-teal-500 to-cyan-600" },
  { id: "lily", name: "Lily", type: "Female · 22-28 · Trendy", style: "bg-gradient-to-br from-violet-500 to-fuchsia-600" },
  { id: "alex", name: "Alex", type: "Non-binary · 25-32 · Natural", style: "bg-gradient-to-br from-emerald-500 to-teal-600" },
];

const ORIGINAL_SCRIPT = `Hey guys! So I've been using this for about three weeks now and honestly?
I'm absolutely obsessed. Like, I cannot imagine my morning routine without it anymore.

The results were noticeable within the first few days — my skin just feels
so much smoother and more hydrated.

If you're on the fence, just try it. You can thank me later. Link in bio!`;

type DialogueMode = "same" | "new";
type GenState = "idle" | "generating" | "done";

interface UGCReplacerProps {
  hasVideo: boolean;
}

export default function UGCReplacer({ hasVideo }: UGCReplacerProps) {
  const [selectedChar, setSelectedChar] = useState<string>("emma");
  const [dialogueMode, setDialogueMode] = useState<DialogueMode>("same");
  const [newScript, setNewScript] = useState(ORIGINAL_SCRIPT);
  const [genState, setGenState] = useState<GenState>("idle");
  const [genProgress, setGenProgress] = useState(0);
  const [genStep, setGenStep] = useState("");

  const steps = [
    "Extracting original dialogue...",
    "Cloning voice patterns...",
    "Generating character performance...",
    "Lip-sync alignment...",
    "Compositing scene...",
    "Rendering final video...",
  ];

  const generate = () => {
    if (!hasVideo) return;
    setGenState("generating");
    setGenProgress(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setGenStep(steps[Math.min(step - 1, steps.length - 1)]);
      setGenProgress(Math.round((step / steps.length) * 100));
      if (step >= steps.length) {
        clearInterval(interval);
        setTimeout(() => setGenState("done"), 400);
      }
    }, 1100);
  };

  const selectedCharData = CHARACTERS.find(c => c.id === selectedChar);

  return (
    <div className="space-y-6">
      {/* Section: Choose Character */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <User size={15} className="text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Choose New UGC Character</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CHARACTERS.map(char => (
            <button key={char.id} onClick={() => setSelectedChar(char.id)}
              className="relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background: selectedChar === char.id ? "rgba(124,58,237,0.12)" : "rgba(16,16,28,0.6)",
                border: `1px solid ${selectedChar === char.id ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.05)"}`,
                boxShadow: selectedChar === char.id ? "0 0 16px rgba(124,58,237,0.2)" : "none",
              }}>
              <div className={`w-11 h-11 rounded-full ${char.style} flex items-center justify-center text-white font-bold text-base relative`}>
                {char.name[0]}
                {selectedChar === char.id && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                    <CheckCircle2 size={10} className="text-white" />
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="text-white text-xs font-medium leading-tight">{char.name}</p>
                <p className="text-[10px] text-[#7777aa] leading-tight mt-0.5">{char.type.split("·")[0].trim()}</p>
              </div>
            </button>
          ))}
        </div>
        {selectedCharData && (
          <p className="text-[11px] text-[#7777aa] mt-2 text-center">{selectedCharData.type}</p>
        )}
      </div>

      {/* Section: Dialogue Mode */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={15} className="text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Dialogue Mode</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button onClick={() => setDialogueMode("same")}
            className="flex flex-col items-start gap-1.5 p-3.5 rounded-xl transition-all duration-200"
            style={{
              background: dialogueMode === "same" ? "rgba(16,185,129,0.1)" : "rgba(16,16,28,0.6)",
              border: `1px solid ${dialogueMode === "same" ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.06)"}`,
            }}>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${dialogueMode === "same" ? "border-emerald-400 bg-emerald-400" : "border-[#4a4a6a]"}`}>
                {dialogueMode === "same" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-white text-xs font-medium">Same Dialogue</span>
            </div>
            <p className="text-[11px] text-[#7777aa] pl-6">Keep exact original script & timing</p>
          </button>

          <button onClick={() => setDialogueMode("new")}
            className="flex flex-col items-start gap-1.5 p-3.5 rounded-xl transition-all duration-200"
            style={{
              background: dialogueMode === "new" ? "rgba(124,58,237,0.1)" : "rgba(16,16,28,0.6)",
              border: `1px solid ${dialogueMode === "new" ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.06)"}`,
            }}>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${dialogueMode === "new" ? "border-purple-400 bg-purple-400" : "border-[#4a4a6a]"}`}>
                {dialogueMode === "new" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-white text-xs font-medium">New Script</span>
            </div>
            <p className="text-[11px] text-[#7777aa] pl-6">Write or AI-generate a fresh script</p>
          </button>
        </div>

        {/* Script Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#7777aa]">
              <PenLine size={12} />
              <span>{dialogueMode === "same" ? "Original Script (read-only)" : "New Script — Edit Below"}</span>
            </div>
            {dialogueMode === "new" && (
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg transition-all hover:scale-105"
                  style={{ background: "rgba(124,58,237,0.12)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.2)" }}>
                  <Sparkles size={10} /> AI Rewrite
                </button>
                <button onClick={() => setNewScript(ORIGINAL_SCRIPT)}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg transition-all text-[#7777aa] hover:text-white"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <RefreshCw size={10} /> Reset
                </button>
              </div>
            )}
          </div>

          <textarea
            value={dialogueMode === "same" ? ORIGINAL_SCRIPT : newScript}
            onChange={(e) => dialogueMode === "new" && setNewScript(e.target.value)}
            readOnly={dialogueMode === "same"}
            rows={7}
            className="w-full rounded-xl px-4 py-3 text-sm leading-relaxed resize-none transition-all"
            style={{
              background: dialogueMode === "same" ? "rgba(8,8,16,0.6)" : "rgba(16,16,28,0.8)",
              border: `1px solid ${dialogueMode === "same" ? "rgba(255,255,255,0.05)" : "rgba(124,58,237,0.25)"}`,
              color: dialogueMode === "same" ? "#7777aa" : "#e8e8f0",
              fontFamily: "system-ui, sans-serif",
            }}
            placeholder="Write your new script here…"
          />
          {dialogueMode === "new" && (
            <p className="text-[11px] text-[#4a4a6a] text-right">{newScript.length} chars</p>
          )}
        </div>
      </div>

      {/* Generating progress */}
      {genState === "generating" && (
        <div className="rounded-xl p-4 space-y-3"
          style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="text-purple-400 animate-spin" />
            <span className="text-sm text-purple-300">{genStep}</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full progress-bar transition-all duration-500"
              style={{ width: `${genProgress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-[#7777aa]">
            <span>Generating character performance…</span>
            <span className="font-mono text-purple-400">{genProgress}%</span>
          </div>
        </div>
      )}

      {genState === "done" && (
        <div className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)" }}>
          <CheckCircle2 size={20} className="text-emerald-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-emerald-300 font-medium text-sm">Character replacement complete!</p>
            <p className="text-[#7777aa] text-xs mt-0.5">
              {selectedCharData?.name} now delivers your ad with {dialogueMode === "same" ? "the original" : "your new"} script.
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white transition-all hover:scale-105"
            style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <Video size={12} /> Preview
          </button>
        </div>
      )}

      <button onClick={generate} disabled={!hasVideo || genState === "generating"}
        className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
        style={{
          background: genState === "generating" ? "rgba(124,58,237,0.3)" : "linear-gradient(135deg, #7c3aed, #a855f7)",
          boxShadow: genState !== "generating" ? "0 4px 24px rgba(124,58,237,0.4)" : "none",
        }}>
        {genState === "generating"
          ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
          : genState === "done"
            ? <><RefreshCw size={16} /> Regenerate</>
            : <><Sparkles size={16} /> Replace UGC Character</>
        }
      </button>

      {!hasVideo && (
        <p className="text-center text-xs text-[#4a4a6a]">Upload a video first to replace characters</p>
      )}
    </div>
  );
}
