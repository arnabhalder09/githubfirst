"use client";
import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from "lucide-react";

export default function VideoPlayer({ src, title }: { src: string; title?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    playing ? v.pause() : v.play();
    setPlaying(!playing);
  };

  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => playing && setShowControls(false), 3000);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      setCurrentTime(v.currentTime);
      setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", () => setDuration(v.duration));
    v.addEventListener("ended", () => setPlaying(false));
    return () => {
      v.removeEventListener("timeupdate", onTime);
    };
  }, [src]);

  return (
    <div className="rounded-2xl overflow-hidden relative scanline"
      style={{ background: "#000", boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(109,40,217,0.1)" }}>

      {/* Letterbox bars */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "7%", background: "#000", zIndex: 3 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "7%", background: "#000", zIndex: 3 }} />

      <div className="relative" style={{ aspectRatio: "16/9" }}
        onMouseMove={resetHideTimer}
        onMouseLeave={() => playing && setShowControls(false)}>

        <video ref={videoRef} src={src} className="w-full h-full object-contain" onClick={toggle} />

        {/* Center play overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 z-10
          ${!playing ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <button onClick={toggle}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(109,40,217,0.75)", backdropFilter: "blur(10px)", boxShadow: "0 0 40px rgba(109,40,217,0.6)" }}>
            <Play size={22} className="text-white ml-1" />
          </button>
        </div>

        {/* Controls bar */}
        <div className={`absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300
          ${showControls ? "opacity-100" : "opacity-0"}`}
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)", padding: "32px 16px 12px" }}>

          {/* Progress bar */}
          <div className="w-full h-1 rounded-full mb-3 cursor-pointer group"
            style={{ background: "rgba(255,255,255,0.15)" }}
            onClick={(e) => {
              const v = videoRef.current;
              if (!v) return;
              const rect = e.currentTarget.getBoundingClientRect();
              v.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
            }}>
            <div className="h-full rounded-full relative bar-fill"
              style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover:opacity-100"
                style={{ boxShadow: "0 0 8px rgba(147,51,234,0.8)" }} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => { if (videoRef.current) { videoRef.current.currentTime = 0; setPlaying(false); } }}
                className="text-white/50 hover:text-white transition-colors">
                <RotateCcw size={13} />
              </button>
              <button onClick={toggle} className="text-white hover:text-purple-300 transition-colors">
                {playing ? <Pause size={17} /> : <Play size={17} />}
              </button>
              <button onClick={() => { if (videoRef.current) { videoRef.current.muted = !muted; setMuted(!muted); } }}
                className="text-white/50 hover:text-white transition-colors">
                {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>
              <span className="text-white/50 text-[11px] font-mono">
                {fmt(currentTime)} / {fmt(duration)}
              </span>
            </div>
            <button className="text-white/50 hover:text-white transition-colors"
              onClick={() => videoRef.current?.requestFullscreen()}>
              <Maximize2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
