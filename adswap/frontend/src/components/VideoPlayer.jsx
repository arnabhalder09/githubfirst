import { api } from "../lib/api.js";

export default function VideoPlayer({ variation }) {
  const videoUrl = variation.video_url ? api.mediaUrl(variation.video_url) : null;
  const posterUrl = variation.thumbnail_url ? api.mediaUrl(variation.thumbnail_url) : undefined;

  return (
    <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900">
      <div className="aspect-video bg-black flex items-center justify-center">
        {videoUrl ? (
          <video src={videoUrl} poster={posterUrl} controls className="w-full h-full object-contain" />
        ) : (
          <span className="text-neutral-600 text-sm">Generating…</span>
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
    </div>
  );
}
