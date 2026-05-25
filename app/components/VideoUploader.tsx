"use client";
import { useState, useRef, useCallback } from "react";
import { Upload, Film, FileVideo, X, CheckCircle2, AlertCircle } from "lucide-react";

interface VideoUploaderProps {
  onVideoUploaded: (file: File, url: string) => void;
}

export default function VideoUploader({ onVideoUploaded }: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) {
      setUploadState("error");
      return;
    }
    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(1) + " MB");
    setUploadState("uploading");
    setUploadProgress(0);

    // Simulate upload progress
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setUploadState("done");
          const url = URL.createObjectURL(file);
          onVideoUploaded(file, url);
        }, 400);
      }
      setUploadProgress(Math.min(p, 100));
    }, 120);
  }, [onVideoUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setUploadState("idle");
    setUploadProgress(0);
    setFileName("");
    setFileSize("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <div
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${isDragging ? "drop-zone-active" : "border-[#2a2a4a] hover:border-[#4a4a7a]"}
          ${uploadState === "done" ? "border-emerald-500/50" : ""}
          ${uploadState === "error" ? "border-red-500/50" : ""}
        `}
        style={{ background: isDragging ? "rgba(124,58,237,0.06)" : "rgba(16,16,28,0.6)" }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => uploadState === "idle" && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={handleChange} />

        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          {uploadState === "idle" && (
            <>
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 float-anim transition-all duration-300
                ${isDragging ? "scale-110" : ""}`}
                style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.1))", border: "1px solid rgba(124,58,237,0.3)" }}>
                <Upload size={36} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {isDragging ? "Drop your video here" : "Upload Your Winning Ad"}
              </h3>
              <p className="text-[#7777aa] text-sm mb-6 max-w-xs leading-relaxed">
                Drag & drop your video or click to browse. Supports MP4, MOV, WebM, AVI up to 2GB.
              </p>
              <div className="flex items-center gap-4">
                <button className="px-6 py-3 rounded-xl font-medium text-white text-sm shimmer-btn transition-all hover:scale-105"
                  style={{ boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }}
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                  <span className="flex items-center gap-2"><FileVideo size={16} /> Choose File</span>
                </button>
                <span className="text-[#4a4a6a] text-xs">or drag & drop</span>
              </div>
            </>
          )}

          {uploadState === "uploading" && (
            <div className="w-full max-w-sm">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
                <Film size={28} className="text-purple-400" style={{ animation: "spin 1s linear infinite" }} />
              </div>
              <p className="text-white font-medium mb-1">{fileName}</p>
              <p className="text-[#7777aa] text-xs mb-5">{fileSize} · Uploading...</p>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full progress-bar transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-purple-400 text-xs mt-2 text-right font-mono">{Math.round(uploadProgress)}%</p>
            </div>
          )}

          {uploadState === "done" && (
            <div className="w-full max-w-sm">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <CheckCircle2 size={30} className="text-emerald-400" />
              </div>
              <p className="text-white font-semibold mb-1">Video Uploaded!</p>
              <p className="text-emerald-400 text-sm mb-1">{fileName}</p>
              <p className="text-[#7777aa] text-xs mb-5">{fileSize} · Ready for AI processing</p>
              <button onClick={(e) => { e.stopPropagation(); reset(); }}
                className="flex items-center gap-2 mx-auto text-xs text-[#7777aa] hover:text-white transition-colors px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <X size={12} /> Upload different video
              </button>
            </div>
          )}

          {uploadState === "error" && (
            <div className="text-center">
              <AlertCircle size={36} className="text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-medium mb-1">Invalid file type</p>
              <p className="text-[#7777aa] text-sm mb-4">Please upload a video file (MP4, MOV, WebM, AVI)</p>
              <button onClick={(e) => { e.stopPropagation(); reset(); }}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors">Try again</button>
            </div>
          )}
        </div>
      </div>

      {/* Format tags */}
      {uploadState === "idle" && (
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          {["MP4", "MOV", "WebM", "AVI", "MKV"].map(fmt => (
            <span key={fmt} className="px-2.5 py-1 rounded-md text-[11px] text-[#7777aa]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {fmt}
            </span>
          ))}
          <span className="text-[11px] text-[#4a4a6a]">Up to 2GB</span>
        </div>
      )}
    </div>
  );
}
