"use client";
import { useState } from "react";
import { PenLine, Sparkles, Copy, Check, RefreshCw, ChevronRight, Lightbulb } from "lucide-react";

const TONES = ["Energetic", "Authentic", "Professional", "Funny", "Urgent", "Emotional"];
const CTAS = ["Link in bio", "Shop now", "Try it free", "Get 20% off", "DM me", "Comment below"];

const DEFAULT_SCRIPT = `[HOOK - 0:00-0:03]
Hey, stop scrolling — I need to show you something.

[PROBLEM - 0:03-0:10]
I spent months trying everything to fix [problem]. Nothing worked.
I was honestly ready to give up.

[SOLUTION - 0:10-0:25]
Then I found [product name]. And within just [timeframe],
I started noticing a real difference.

[PROOF - 0:25-0:40]
Look — [show result]. I'm not exaggerating, this actually happened.
People keep asking me what changed. It's this.

[CTA - 0:40-0:45]
[CTA text]. Thank me later. 🔥`;

export default function ScriptEditor() {
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [tone, setTone] = useState("Authentic");
  const [cta, setCta] = useState("Link in bio");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const copyScript = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rewrite = () => {
    setLoading(true);
    setTimeout(() => {
      setScript(`[HOOK - 0:00-0:03]
Wait — you NEED to see this. ${tone === "Funny" ? "I cannot believe this actually works." : "This changed everything for me."}

[PROBLEM - 0:03-0:10]
If you're struggling with [problem], you're not alone.
I was literally in the exact same spot six months ago.

[SOLUTION - 0:10-0:25]
Someone in my comments mentioned [product name] and I was skeptical.
But after just [timeframe]? Completely different story.

[PROOF - 0:25-0:40]
${tone === "Energetic" ? "THE RESULTS ARE INSANE." : "The results speak for themselves."}
I have receipts — and I'm sharing them right now.

[CTA - 0:40-0:45]
${cta} to get yours. Don't sleep on this.`);
      setLoading(false);
    }, 1400);
  };

  const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
  const estDuration = Math.round(wordCount / 2.5);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <PenLine size={15} className="text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Script Editor</h3>
        </div>
        <p className="text-xs text-[#7777aa]">Write, edit or AI-generate your ad script with timed sections</p>
      </div>

      {/* Tone & CTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-[#7777aa] mb-2 block">Tone</label>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map(t => (
              <button key={t} onClick={() => setTone(t)}
                className="px-2.5 py-1 rounded-lg text-xs transition-all"
                style={{
                  background: tone === t ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${tone === t ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: tone === t ? "#c084fc" : "#7777aa",
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-[#7777aa] mb-2 block">Call to Action</label>
          <div className="flex flex-wrap gap-1.5">
            {CTAS.map(c => (
              <button key={c} onClick={() => setCta(c)}
                className="px-2.5 py-1 rounded-lg text-xs transition-all"
                style={{
                  background: cta === c ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${cta === c ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.06)"}`,
                  color: cta === c ? "#6ee7b7" : "#7777aa",
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Script textarea */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-[#7777aa]">Script with Timing Sections</label>
          <div className="flex items-center gap-2">
            <button onClick={copyScript}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg transition-all text-[#7777aa] hover:text-white"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {copied ? <><Check size={10} className="text-emerald-400" /> Copied!</> : <><Copy size={10} /> Copy</>}
            </button>
            <button onClick={() => setScript(DEFAULT_SCRIPT)}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg transition-all text-[#7777aa] hover:text-white"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <RefreshCw size={10} /> Reset
            </button>
          </div>
        </div>
        <textarea value={script} onChange={e => setScript(e.target.value)} rows={12}
          className="w-full rounded-xl px-4 py-3 text-sm leading-relaxed resize-none font-mono"
          style={{
            background: "rgba(16,16,28,0.9)",
            border: "1px solid rgba(124,58,237,0.2)",
            color: "#e8e8f0",
            letterSpacing: "0.01em",
          }}
        />
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-3 text-[11px] text-[#4a4a6a]">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>~{estDuration}s read</span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-xl p-3.5 flex gap-3"
        style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
        <Lightbulb size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-[#7777aa] leading-relaxed">
          <span className="text-amber-400 font-medium">Pro tip: </span>
          The first 3 seconds are critical. Use a strong hook question or surprising statement.
          Keep the problem-solution gap under 15 seconds for maximum retention.
        </div>
      </div>

      <button onClick={rewrite} disabled={loading}
        className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
        style={{
          background: loading ? "rgba(124,58,237,0.3)" : "linear-gradient(135deg, #7c3aed, #6366f1)",
          boxShadow: !loading ? "0 4px 24px rgba(124,58,237,0.4)" : "none",
        }}>
        {loading
          ? <><RefreshCw size={16} className="animate-spin" /> Rewriting…</>
          : <><Sparkles size={16} /> AI Rewrite Script ({tone} tone)</>
        }
      </button>
    </div>
  );
}
