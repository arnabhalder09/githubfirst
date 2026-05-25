"use client";
import { useState } from "react";
import { Video, Wand2, Sparkles, Loader2, CheckCircle2, Film, RefreshCw, ChevronDown } from "lucide-react";

const STYLES = [
  { id: "ugc", label: "UGC Style", desc: "Authentic user-generated feel" },
  { id: "studio", label: "Studio Ad", desc: "Polished professional look" },
  { id: "tiktok", label: "TikTok Native", desc: "Vertical, trending format" },
  { id: "testimonial", label: "Testimonial", desc: "Trust-building review style" },
];

const DURATIONS = ["15s", "30s", "45s", "60s"];
const ASPECT_RATIOS = ["9:16 (TikTok)", "1:1 (Instagram)", "16:9 (YouTube)", "4:5 (Feed)"];

type GenState = "idle" | "generating" | "done";

export default function GeneratePanel() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("ugc");
  const [duration, setDuration] = useState("30s");
  const [aspect, setAspect] = useState("9:16 (TikTok)");
  const [state, setState] = useState<GenState>("idle");
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");

  const steps = [
    "Generating storyboard...",
    "Creating character...",
    "Rendering scene...",
    "Adding voiceover...",
    "Compositing video...",
    "Encoding output...",
  ];

  const generate = () => {
    if (!prompt.trim()) return;
    setState("generating");
    setProgress(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setStep(steps[Math.min(i - 1, steps.length - 1)]);
      setProgress(Math.round((i / steps.length) * 100));
      if (i >= steps.length) {
        clearInterval(interval);
        setTimeout(() => setState("done"), 400);
      }
    }, 1000);
  };

  const PROMPT_EXAMPLES = [
    "Energetic woman trying a skincare serum for the first time, amazed by results, 'link in bio' CTA",
    "Guy unboxing fitness supplement, authentic reaction, explaining benefits to camera",
    "Mom sharing her go-to productivity app, casual home setting, genuine recommendation",
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Wand2 size={15} className="text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Generate From Scratch</h3>
        </div>
        <p className="text-xs text-[#7777aa]">Describe your ad and AI will generate a full UGC video</p>
      </div>

      {/* Prompt */}
      <div>
        <label className="text-xs text-[#7777aa] mb-2 block">Ad Description / Script Idea</label>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4}
          placeholder="Describe your ad... e.g. 'Enthusiastic 25-year-old woman trying a new protein shake for the first time, sharing her honest reaction, ending with a call to action'"
          className="w-full rounded-xl px-4 py-3 text-sm leading-relaxed resize-none transition-all"
          style={{
            background: "rgba(16,16,28,0.8)",
            border: "1px solid rgba(124,58,237,0.2)",
            color: "#e8e8f0",
          }}
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[11px] text-[#4a4a6a]">{prompt.length}/500</p>
          <button className="flex items-center gap-1 text-[11px] text-[#7777aa] hover:text-purple-400 transition-colors">
            <Sparkles size={10} /> Enhance with AI
          </button>
        </div>
      </div>

      {/* Examples */}
      <div>
        <p className="text-[11px] text-[#4a4a6a] mb-2">Quick examples:</p>
        <div className="space-y-1.5">
          {PROMPT_EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => setPrompt(ex)}
              className="w-full text-left text-[11px] px-3 py-2 rounded-lg transition-all text-[#7777aa] hover:text-white"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <label className="text-xs text-[#7777aa] mb-2 block">Video Style</label>
        <div className="grid grid-cols-2 gap-2">
          {STYLES.map(s => (
            <button key={s.id} onClick={() => setStyle(s.id)}
              className="flex flex-col items-start p-3 rounded-xl transition-all duration-200"
              style={{
                background: style === s.id ? "rgba(124,58,237,0.12)" : "rgba(16,16,28,0.6)",
                border: `1px solid ${style === s.id ? "rgba(168,85,247,0.35)" : "rgba(255,255,255,0.05)"}`,
              }}>
              <div className="flex items-center gap-2 mb-0.5">
                <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${style === s.id ? "border-purple-400 bg-purple-400" : "border-[#4a4a6a]"}`}>
                  {style === s.id && <div className="w-1 h-1 rounded-full bg-white" />}
                </div>
                <span className="text-xs font-medium" style={{ color: style === s.id ? "#e8e8f0" : "#aaaacc" }}>{s.label}</span>
              </div>
              <p className="text-[11px] text-[#7777aa] pl-5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Duration & Aspect */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-[#7777aa] mb-2 block">Duration</label>
          <div className="flex gap-1.5 flex-wrap">
            {DURATIONS.map(d => (
              <button key={d} onClick={() => setDuration(d)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: duration === d ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${duration === d ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: duration === d ? "#c084fc" : "#7777aa",
                }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-[#7777aa] mb-2 block">Aspect Ratio</label>
          <div className="space-y-1">
            {ASPECT_RATIOS.slice(0, 3).map(a => (
              <button key={a} onClick={() => setAspect(a)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: aspect === a ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${aspect === a ? "rgba(168,85,247,0.3)" : "transparent"}`,
                  color: aspect === a ? "#c084fc" : "#7777aa",
                }}>
                <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${aspect === a ? "border-purple-400 bg-purple-400" : "border-[#4a4a6a]"}`}>
                  {aspect === a && <div className="w-1 h-1 rounded-full bg-white" />}
                </div>
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generation progress */}
      {state === "generating" && (
        <div className="rounded-xl p-4 space-y-3"
          style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="text-purple-400 animate-spin" />
            <span className="text-sm text-purple-300">{step}</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full progress-bar transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-[#7777aa] text-right font-mono">{progress}%</p>
        </div>
      )}

      {state === "done" && (
        <div className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(16,185,129,0.25)" }}>
          <div className="p-4 flex items-start gap-3" style={{ background: "rgba(16,185,129,0.07)" }}>
            <CheckCircle2 size={20} className="text-emerald-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-emerald-300 font-medium text-sm">Video generated successfully!</p>
              <p className="text-[#7777aa] text-xs mt-0.5">Your AI-generated {duration} {style} ad is ready.</p>
            </div>
          </div>
          <div className="p-3 flex gap-2" style={{ background: "rgba(8,8,16,0.8)" }}>
            <button className="flex-1 py-2 rounded-lg text-xs font-medium text-white transition-all hover:scale-105"
              style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <Film size={12} className="inline mr-1.5" /> Preview
            </button>
            <button className="flex-1 py-2 rounded-lg text-xs font-medium text-white transition-all hover:scale-105"
              style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
              Download
            </button>
          </div>
        </div>
      )}

      <button onClick={generate} disabled={!prompt.trim() || state === "generating"}
        className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
        style={{
          background: state === "generating" ? "rgba(124,58,237,0.3)" : "linear-gradient(135deg, #7c3aed, #6366f1)",
          boxShadow: state !== "generating" ? "0 4px 24px rgba(124,58,237,0.4)" : "none",
        }}>
        {state === "generating"
          ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
          : state === "done"
            ? <><RefreshCw size={16} /> Regenerate</>
            : <><Video size={16} /> Generate AI Video</>
        }
      </button>
    </div>
  );
}
