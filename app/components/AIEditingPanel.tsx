"use client";
import { useState } from "react";
import { Wand2, Scissors, Palette, Type, Music, Zap, CheckCircle2, Loader2, ChevronRight, Sparkles } from "lucide-react";

const EDIT_FEATURES = [
  {
    id: "auto_cut",
    icon: <Scissors size={18} />,
    label: "Smart Auto-Cuts",
    desc: "AI detects best moments, removes dead air, optimizes pacing",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
  },
  {
    id: "color_grade",
    icon: <Palette size={18} />,
    label: "Cinematic Color Grade",
    desc: "Apply film-grade LUTs, auto-balance exposure & contrast",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.25)",
  },
  {
    id: "captions",
    icon: <Type size={18} />,
    label: "AI Captions & Subtitles",
    desc: "Auto-transcribe speech, styled captions with animations",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
  },
  {
    id: "music",
    icon: <Music size={18} />,
    label: "Background Music Sync",
    desc: "AI-matched royalty-free music that syncs to video beats",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.1)",
    border: "rgba(236,72,153,0.25)",
  },
  {
    id: "enhance",
    icon: <Sparkles size={18} />,
    label: "Visual Enhancement",
    desc: "Upscale, denoise, stabilize shaky footage with AI",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.25)",
  },
  {
    id: "hook",
    icon: <Zap size={18} />,
    label: "Hook Optimizer",
    desc: "Rearrange first 3 seconds for maximum scroll-stop rate",
    color: "#f97316",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.25)",
  },
];

type ProcessState = "idle" | "processing" | "done";

interface AIEditingPanelProps {
  hasVideo: boolean;
}

export default function AIEditingPanel({ hasVideo }: AIEditingPanelProps) {
  const [selected, setSelected] = useState<string[]>(["auto_cut", "captions"]);
  const [state, setState] = useState<ProcessState>("idle");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const steps = ["Analyzing video content...", "Applying smart cuts...", "Color grading...", "Generating captions...", "Syncing audio...", "Finalizing export..."];

  const run = () => {
    if (!hasVideo || selected.length === 0) return;
    setState("processing");
    setProgress(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStep(steps[Math.min(step - 1, steps.length - 1)]);
      setProgress(Math.round((step / steps.length) * 100));
      if (step >= steps.length) {
        clearInterval(interval);
        setTimeout(() => setState("done"), 300);
      }
    }, 900);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-base">AI Editing Tools</h3>
          <p className="text-[#7777aa] text-xs mt-0.5">Select enhancements to apply to your video</p>
        </div>
        <span className="px-2.5 py-1 rounded-lg text-xs font-medium"
          style={{ background: "rgba(124,58,237,0.15)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.25)" }}>
          {selected.length} selected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EDIT_FEATURES.map((f) => {
          const active = selected.includes(f.id);
          return (
            <button key={f.id} onClick={() => toggle(f.id)}
              className="relative flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: active ? f.bg : "rgba(16,16,28,0.6)",
                border: `1px solid ${active ? f.border : "rgba(255,255,255,0.06)"}`,
                boxShadow: active ? `0 0 20px ${f.bg}` : "none",
              }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                style={{ background: active ? f.bg : "rgba(255,255,255,0.04)", color: active ? f.color : "#7777aa", border: `1px solid ${active ? f.border : "transparent"}` }}>
                {f.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-0.5" style={{ color: active ? "#e8e8f0" : "#aaaacc" }}>{f.label}</p>
                <p className="text-xs leading-relaxed" style={{ color: active ? "#7777aa" : "#4a4a6a" }}>{f.desc}</p>
              </div>
              {active && (
                <CheckCircle2 size={16} className="absolute top-3 right-3 flex-shrink-0" style={{ color: f.color }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Processing state */}
      {state === "processing" && (
        <div className="rounded-xl p-4 space-y-3"
          style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="text-purple-400 animate-spin" />
            <span className="text-sm text-purple-300">{currentStep}</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full progress-bar transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-[#7777aa]">
            <span>Processing…</span>
            <span className="font-mono text-purple-400">{progress}%</span>
          </div>
        </div>
      )}

      {state === "done" && (
        <div className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
          <CheckCircle2 size={20} className="text-emerald-400" />
          <div>
            <p className="text-emerald-300 font-medium text-sm">Editing complete!</p>
            <p className="text-[#7777aa] text-xs">Your edited video is ready to preview & download.</p>
          </div>
          <button className="ml-auto flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
            Preview <ChevronRight size={12} />
          </button>
        </div>
      )}

      <button onClick={run} disabled={!hasVideo || selected.length === 0 || state === "processing"}
        className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
        style={{
          background: state === "processing" ? "rgba(124,58,237,0.3)" : "linear-gradient(135deg, #7c3aed, #6366f1)",
          boxShadow: state !== "processing" ? "0 4px 24px rgba(124,58,237,0.4)" : "none",
        }}>
        {state === "processing"
          ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
          : state === "done"
            ? <><CheckCircle2 size={16} /> Re-apply Edits</>
            : <><Wand2 size={16} /> Apply AI Edits</>
        }
      </button>

      {!hasVideo && (
        <p className="text-center text-xs text-[#4a4a6a]">Upload a video first to enable AI editing</p>
      )}
    </div>
  );
}
