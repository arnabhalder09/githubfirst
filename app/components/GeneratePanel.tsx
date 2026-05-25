"use client";
import { useState } from "react";
import { Video, Loader2, CheckCircle2, RefreshCw, AlertCircle, Zap, Sparkles } from "lucide-react";
import { MARKETING_PRESETS, VIRAL_HOOKS } from "@/lib/higgsfield";
import { useHiggsfieldJob } from "@/app/hooks/useHiggsfieldJob";

const ASPECT_RATIOS = ["9:16", "1:1", "16:9", "4:5"] as const;
const DURATIONS = [5, 10, 15] as const;

export default function GeneratePanel() {
  const [prompt, setPrompt] = useState("");
  const [preset, setPreset] = useState<string>(MARKETING_PRESETS[0].mode);
  const [hookId, setHookId] = useState<string | null>(null);
  const [aspect, setAspect] = useState<typeof ASPECT_RATIOS[number]>("9:16");
  const [duration, setDuration] = useState<typeof DURATIONS[number]>(15);

  const { result, generate, reset } = useHiggsfieldJob();
  const busy = result.status === "submitting" || result.status === "processing";

  const run = () => {
    if (!prompt.trim() && !hookId) return;
    generate({
      preset,
      hookId: hookId ?? undefined,
      prompt: prompt.trim() || undefined,
      aspectRatio: aspect,
      duration,
    });
  };

  const EXAMPLES = [
    "Energetic woman trying a new skincare serum, amazed by results, 'link in bio' CTA",
    "Guy unboxing fitness supplement, authentic reaction, explaining key benefits",
    "Mom sharing her go-to productivity app, casual home setting, genuine recommendation",
  ];

  return (
    <div className="space-y-5">
      {/* Preset selector */}
      <div>
        <label className="text-[11px] uppercase tracking-wider mb-2 block" style={{ color: "#555566" }}>
          Video Preset — powered by Higgsfield Marketing Studio
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {MARKETING_PRESETS.map(p => {
            const active = preset === p.mode;
            return (
              <button key={p.slug} onClick={() => setPreset(p.mode)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: active ? "rgba(109,40,217,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "rgba(147,51,234,0.4)" : "rgba(255,255,255,0.06)"}`,
                }}>
                <span className="text-base">{p.emoji}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium leading-tight truncate" style={{ color: active ? "#e2e2f0" : "#aaaacc" }}>{p.mode}</p>
                  <p className="text-[10px] leading-tight truncate" style={{ color: "#555577" }}>{p.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Viral hooks */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Zap size={12} className="text-amber-400" />
          <label className="text-[11px] uppercase tracking-wider" style={{ color: "#555566" }}>Viral Hook (optional)</label>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setHookId(null)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              background: hookId === null ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${hookId === null ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`,
              color: hookId === null ? "#e2e2f0" : "#888899",
            }}>
            None
          </button>
          {VIRAL_HOOKS.map(h => (
            <button key={h.id} onClick={() => setHookId(hookId === h.id ? null : h.id)}
              title={h.prompt}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                background: hookId === h.id ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${hookId === h.id ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.06)"}`,
                color: hookId === h.id ? "#fbbf24" : "#888899",
              }}>
              <span>{h.type === "stunt" ? "🎬" : "✨"}</span>
              {h.name}
            </button>
          ))}
        </div>
        {hookId && (
          <p className="text-[11px] mt-1.5 leading-relaxed px-1" style={{ color: "#666677" }}>
            {VIRAL_HOOKS.find(h => h.id === hookId)?.prompt}
          </p>
        )}
      </div>

      {/* Prompt */}
      <div>
        <label className="text-[11px] uppercase tracking-wider mb-2 block" style={{ color: "#555566" }}>Ad Description / Script Idea</label>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4}
          placeholder="Describe your ad... e.g. 'Enthusiastic woman tries a new protein shake for the first time, shares honest reaction, CTA at end'"
          className="w-full rounded-xl px-4 py-3 text-sm leading-relaxed resize-none"
          style={{ background: "rgba(16,16,28,0.8)", border: "1px solid rgba(109,40,217,0.2)", color: "#e2e2f0" }}
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-[11px]" style={{ color: "#444455" }}>{prompt.length}/500</p>
          <button className="flex items-center gap-1 text-[11px] transition-colors hover:text-purple-300"
            style={{ color: "#666688" }}>
            <Sparkles size={10} /> AI enhance
          </button>
        </div>
      </div>

      {/* Quick examples */}
      <div>
        <p className="text-[11px] mb-2" style={{ color: "#444455" }}>Quick examples:</p>
        <div className="space-y-1">
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => setPrompt(ex)}
              className="w-full text-left text-[11px] px-3 py-2 rounded-lg transition-all"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "#888899" }}>
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Duration & aspect */}
      <div className="flex gap-5">
        <div>
          <label className="text-[11px] uppercase tracking-wider mb-2 block" style={{ color: "#555566" }}>Duration</label>
          <div className="flex gap-1.5">
            {DURATIONS.map(d => (
              <button key={d} onClick={() => setDuration(d)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: duration === d ? "rgba(109,40,217,0.2)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${duration === d ? "rgba(147,51,234,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: duration === d ? "#c084fc" : "#888899",
                }}>
                {d}s
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-wider mb-2 block" style={{ color: "#555566" }}>Aspect Ratio</label>
          <div className="flex gap-1.5">
            {ASPECT_RATIOS.map(a => (
              <button key={a} onClick={() => setAspect(a)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: aspect === a ? "rgba(109,40,217,0.2)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${aspect === a ? "rgba(147,51,234,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: aspect === a ? "#c084fc" : "#888899",
                }}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress / result */}
      <JobFeedback result={result} onReset={reset} />

      <button onClick={run} disabled={(!prompt.trim() && !hookId) || busy}
        className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed btn-primary">
        {busy
          ? <><Loader2 size={16} className="animate-spin" /> Generating with Higgsfield…</>
          : result.status === "done"
            ? <><RefreshCw size={16} /> Regenerate</>
            : <><Video size={16} /> Generate AI Video</>
        }
      </button>

      <p className="text-center text-[11px]" style={{ color: "#444455" }}>
        Engine: <span style={{ color: "#a855f7" }}>Higgsfield Marketing Studio</span> · Model: <span style={{ color: "#a855f7" }}>marketing_studio_video</span>
      </p>
    </div>
  );
}

function JobFeedback({ result, onReset }: { result: ReturnType<typeof useHiggsfieldJob>["result"]; onReset: () => void }) {
  if (result.status === "idle") return null;

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
        <div className="flex justify-between text-[11px]" style={{ color: "#444455" }}>
          {result.jobId && <span className="font-mono truncate max-w-[200px]">Job: {result.jobId}</span>}
          <span className="font-mono ml-auto" style={{ color: "#a855f7" }}>{result.progress}%</span>
        </div>
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <div className="rounded-xl p-4 flex items-start gap-3"
        style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
        <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-red-300 text-sm font-medium">Generation failed</p>
          <p className="text-[11px] mt-0.5 break-words" style={{ color: "#888899" }}>{result.error}</p>
        </div>
        <button onClick={onReset} className="text-[11px] text-red-400 hover:text-red-300 transition-colors flex-shrink-0">Retry</button>
      </div>
    );
  }

  if (result.status === "done" && result.videoUrl) {
    return (
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(16,185,129,0.25)" }}>
        <div className="p-4 flex items-center gap-3" style={{ background: "rgba(16,185,129,0.07)" }}>
          <CheckCircle2 size={18} className="text-emerald-400" />
          <div className="flex-1">
            <p className="text-emerald-300 font-medium text-sm">Video ready!</p>
            <p className="text-[11px]" style={{ color: "#888899" }}>Generated by Higgsfield Marketing Studio</p>
          </div>
        </div>
        <div className="p-3 flex gap-2" style={{ background: "rgba(5,5,7,0.8)" }}>
          <a href={result.videoUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 py-2 rounded-lg text-xs font-medium text-white text-center transition-all hover:scale-[1.02]"
            style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}>
            Preview
          </a>
          <a href={result.videoUrl} download
            className="flex-1 py-2 rounded-lg text-xs font-medium text-white text-center transition-all hover:scale-[1.02]"
            style={{ background: "rgba(109,40,217,0.2)", border: "1px solid rgba(109,40,217,0.3)" }}>
            Download
          </a>
          <button onClick={onReset}
            className="px-3 py-2 rounded-lg text-xs btn-ghost transition-all" style={{ color: "#888899" }}>
            <RefreshCw size={12} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
