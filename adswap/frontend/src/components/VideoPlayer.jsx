import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

const GEN_MESSAGES = [
  "Casting a new presenter…",
  "Generating the avatar…",
  "Framing the shot…",
  "Animating the scene…",
  "Adding natural motion…",
  "Rendering the clip…",
];

function GeneratingTile() {
  const [msg, setMsg] = useState(0);
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const m = setInterval(() => setMsg((p) => (p + 1) % GEN_MESSAGES.length), 2500);
    const s = setInterval(() => setSecs((p) => p + 1), 1000);
    return () => {
      clearInterval(m);
      clearInterval(s);
    };
  }, []);
  return (
    <div className="shimmer relative w-full h-full overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800">
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
        <span className="text-3xl animate-bounce">🎬</span>
        <span className="text-sm font-medium text-neutral-200">{GEN_MESSAGES[msg]}</span>
        <div className="w-32 h-1 rounded-full bg-neutral-700/70 overflow-hidden">
          <div className="bar-indeterminate h-full w-2/5 rounded-full bg-brand" />
        </div>
        <span className="text-xs tabular-nums text-neutral-500">{secs}s</span>
      </div>
    </div>
  );
}

export default function VideoPlayer({ variation }) {
  const videoUrl = variation.video_url ? api.mediaUrl(variation.video_url) : null;
  const posterUrl = variation.thumbnail_url ? api.mediaUrl(variation.thumbnail_url) : undefined;

  return (
    <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900">
      <div className="aspect-video bg-black flex items-center justify-center">
        {videoUrl ? (
          <video src={videoUrl} poster={posterUrl} controls className="w-full h-full object-contain" />
        ) : (
          <GeneratingTile />
        )}
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <span className="text-sm truncate">{variation.label}</span>
        {videoUrl && (
          <a
            href={videoUrl}
            download
            className="shrink-0 text-xs px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
          >
            Download
          </a>
        )}
      </div>
      {variation.note && (
        <p className="px-3 pb-3 -mt-1 text-xs text-amber-400/90">{variation.note}</p>
      )}
    </div>
  );
}
