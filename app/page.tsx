"use client";
import { useState } from "react";
import Header from "./components/Header";
import VideoUploader from "./components/VideoUploader";
import VideoPlayer from "./components/VideoPlayer";
import AIEditingPanel from "./components/AIEditingPanel";
import UGCReplacer from "./components/UGCReplacer";
import GeneratePanel from "./components/GeneratePanel";
import ScriptEditor from "./components/ScriptEditor";
import {
  Upload, Wand2, Users, Video, PenLine,
  ChevronRight, Aperture, Camera, Sliders,
  Download, Share2, MoreHorizontal
} from "lucide-react";

type Tab = "upload" | "edit" | "ugc" | "generate" | "script";

const TABS: { id: Tab; icon: React.ReactNode; label: string; badge?: string }[] = [
  { id: "upload",   icon: <Upload size={14} />,  label: "Upload" },
  { id: "edit",     icon: <Wand2 size={14} />,   label: "AI Edit",     badge: "NEW" },
  { id: "ugc",      icon: <Users size={14} />,   label: "UGC Swap" },
  { id: "generate", icon: <Video size={14} />,   label: "Generate" },
  { id: "script",   icon: <PenLine size={14} />, label: "Script" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>("");
  const hasVideo = !!videoUrl;

  const handleVideoUploaded = (file: File, url: string) => {
    setVideoUrl(url);
    setVideoName(file.name);
    setActiveTab("edit");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050507" }}>
      <Header />

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: "calc(100vh - 53px)" }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-[400px] xl:w-[440px] flex-shrink-0 flex flex-col overflow-hidden"
          style={{ borderRight: "1px solid rgba(255,255,255,0.05)", background: "rgba(8,8,12,0.9)" }}>

          {/* Tabs */}
          <div className="flex border-b overflow-x-auto flex-shrink-0"
            style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(5,5,7,0.95)" }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-3 text-[11px] font-medium whitespace-nowrap transition-all border-b-2 relative
                  ${activeTab === tab.id ? "tab-active" : "border-transparent text-[#888899] hover:text-[#ccccdd]"}`}>
                {tab.icon}
                {tab.label}
                {tab.badge && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(147,51,234,0.2)", color: "#e879f9", border: "1px solid rgba(147,51,234,0.3)" }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "upload" && (
              <div className="space-y-5">
                <SectionHeader
                  title="Upload Ad Video"
                  desc="Upload your winning ad to start AI editing or character replacement"
                />
                <VideoUploader onVideoUploaded={handleVideoUploaded} />
                {!hasVideo && (
                  <>
                    <div className="flex items-center gap-3 my-2">
                      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                      <span className="text-[11px]" style={{ color: "#555566" }}>or</span>
                      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                    </div>
                    <button onClick={() => setActiveTab("generate")}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl btn-ghost transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: "rgba(147,51,234,0.12)", border: "1px solid rgba(147,51,234,0.2)" }}>
                          <Aperture size={15} className="text-purple-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-white text-xs font-medium">Generate from scratch</p>
                          <p className="text-[11px]" style={{ color: "#888899" }}>Create a new AI ad video</p>
                        </div>
                      </div>
                      <ChevronRight size={14} style={{ color: "#555566" }} className="group-hover:text-purple-400 transition-colors" />
                    </button>
                  </>
                )}
              </div>
            )}

            {activeTab === "edit" && (
              <div className="space-y-5">
                <SectionHeader title="AI Video Editing" desc="Select the enhancements you want applied" />
                <AIEditingPanel hasVideo={hasVideo} />
              </div>
            )}

            {activeTab === "ugc" && (
              <div className="space-y-5">
                <SectionHeader title="UGC Character Swap" desc="Replace the creator with an AI character — same or new script" />
                <UGCReplacer hasVideo={hasVideo} />
              </div>
            )}

            {activeTab === "generate" && (
              <div className="space-y-5">
                <SectionHeader title="AI Video Generation" desc="Generate a cinematic UGC ad from a text description" />
                <GeneratePanel />
              </div>
            )}

            {activeTab === "script" && (
              <div className="space-y-5">
                <SectionHeader title="Script Studio" desc="Write and AI-enhance your ad script with timing sections" />
                <ScriptEditor />
              </div>
            )}
          </div>
        </aside>

        {/* ── MAIN CANVAS ── */}
        <main className="flex-1 flex flex-col overflow-y-auto">

          {/* Canvas toolbar */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-2.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(5,5,7,0.95)" }}>
            <div className="flex items-center gap-2">
              <Camera size={13} style={{ color: "#888899" }} />
              <span className="text-xs font-medium" style={{ color: "#888899" }}>
                {hasVideo ? videoName : "No video loaded"}
              </span>
            </div>
            {hasVideo && (
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium btn-ghost" style={{ color: "#888899" }}>
                  <Sliders size={12} /> Adjust
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium btn-ghost" style={{ color: "#888899" }}>
                  <Share2 size={12} /> Share
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white btn-primary">
                  <Download size={12} /> Export
                </button>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center btn-ghost" style={{ color: "#888899" }}>
                  <MoreHorizontal size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Canvas area */}
          <div className="flex-1 flex items-center justify-center p-6"
            style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(109,40,217,0.04) 0%, transparent 70%)" }}>
            {hasVideo ? (
              <div className="w-full max-w-3xl">
                <VideoPlayer src={videoUrl!} title={videoName} />
              </div>
            ) : (
              <EmptyCanvas
                onUpload={() => setActiveTab("upload")}
                onGenerate={() => setActiveTab("generate")}
              />
            )}
          </div>

          {/* Bottom capability cards */}
          <div className="flex-shrink-0 border-t p-4" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(5,5,7,0.8)" }}>
            <p className="text-[11px] mb-3" style={{ color: "#555566" }}>CAPABILITIES</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: <Wand2 size={14} />, title: "Smart Edit", desc: "Auto-cuts, captions, color", tab: "edit" as Tab, color: "#a855f7" },
                { icon: <Users size={14} />, title: "UGC Swap", desc: "Replace creators with AI", tab: "ugc" as Tab, color: "#22d3ee" },
                { icon: <Video size={14} />, title: "AI Generate", desc: "Text → video in 90s", tab: "generate" as Tab, color: "#f472b6" },
                { icon: <PenLine size={14} />, title: "Script Studio", desc: "Rewrite with AI assist", tab: "script" as Tab, color: "#fbbf24" },
              ].map(c => (
                <button key={c.tab} onClick={() => setActiveTab(c.tab)}
                  className="flex items-center gap-3 p-3 rounded-xl btn-ghost text-left group transition-all hover:scale-[1.02]">
                  <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{ background: `${c.color}18`, border: `1px solid ${c.color}30`, color: c.color }}>
                    {c.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">{c.title}</p>
                    <p className="text-[10px] truncate" style={{ color: "#888899" }}>{c.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white mb-0.5">{title}</h2>
      <p className="text-[11px] leading-relaxed" style={{ color: "#888899" }}>{desc}</p>
    </div>
  );
}

function EmptyCanvas({ onUpload, onGenerate }: { onUpload: () => void; onGenerate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 py-16">
      {/* Cinematic circle logo */}
      <div className="relative animate-float">
        <div className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.2), rgba(147,51,234,0.1))", border: "1px solid rgba(147,51,234,0.25)", boxShadow: "0 0 60px rgba(109,40,217,0.2)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.3), rgba(147,51,234,0.2))", border: "1px solid rgba(147,51,234,0.35)" }}>
            <Video size={26} className="text-purple-300" />
          </div>
        </div>
        {/* Ring */}
        <div className="absolute inset-0 rounded-full"
          style={{ border: "1px solid rgba(147,51,234,0.15)", transform: "scale(1.3)", animation: "pulse-ring 2.5s ease-in-out infinite" }} />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold grad-text">Higgsfield AI Studio</h2>
        <p className="text-sm max-w-sm leading-relaxed" style={{ color: "#888899" }}>
          Upload your winning ad to edit, swap UGC creators, or generate a new video entirely with AI
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onUpload}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white btn-primary">
          <Upload size={15} /> Upload Ad
        </button>
        <button onClick={onGenerate}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium btn-ghost transition-all hover:scale-[1.02]"
          style={{ color: "#ccccdd" }}>
          <Aperture size={15} /> Generate New
        </button>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
        {["Smart Auto-Cuts", "AI Color Grade", "UGC Character Swap", "Lip-sync", "Script Rewrite", "Caption Gen"].map(f => (
          <span key={f} className="px-2.5 py-1 rounded-full text-[11px]"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#888899" }}>
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
