"use client";
import { Film, Cpu, Circle } from "lucide-react";

export default function Header() {
  return (
    <header className="relative z-50 flex items-center justify-between px-5 py-3"
      style={{ background: "rgba(5,5,7,0.96)", borderBottom: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(20px)" }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #6d28d9, #9333ea)", boxShadow: "0 0 16px rgba(109,40,217,0.5)" }}>
          <Film size={15} className="text-white" />
        </div>
        <div className="leading-none">
          <div className="text-white font-bold text-base tracking-tight">HIGGSFIELD</div>
          <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: "rgba(200,150,255,0.6)" }}>AI Video Studio</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-1">
        {["Studio", "Library", "Models", "API", "Pricing"].map(item => (
          <button key={item}
            className="px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ color: item === "Studio" ? "#e879f9" : "rgba(180,180,200,0.7)" }}>
            {item}
          </button>
        ))}
      </nav>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(150,150,170,0.7)" }}>
          <Circle size={7} className="text-emerald-400 fill-emerald-400 animate-blink" />
          <span>GPU Online</span>
        </div>
        <button className="px-4 py-2 rounded-lg text-xs font-semibold text-white btn-primary">
          New Generation
        </button>
      </div>
    </header>
  );
}
