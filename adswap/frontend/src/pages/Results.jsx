import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, AVATAR_STYLES } from "../lib/api.js";
import ProgressBar from "../components/ProgressBar.jsx";
import ProcessingSteps from "../components/ProcessingSteps.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";

export default function Results() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [remixStyle, setRemixStyle] = useState("realistic_female");
  const [remixing, setRemixing] = useState(false);

  useEffect(() => {
    let active = true;
    const load = () =>
      api
        .getJob(id)
        .then((data) => {
          if (!active) return;
          setJob(data);
        })
        .catch((e) => active && setError(e.message));
    load();
    // Poll every 3s until the job reaches a terminal state.
    const t = setInterval(() => {
      if (job && (job.status === "complete" || job.status === "failed")) return;
      load();
    }, 3000);
    return () => {
      active = false;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, job?.status]);

  const remix = async () => {
    setRemixing(true);
    try {
      const { job_id } = await api.remix(id, { avatarStyle: remixStyle });
      window.location.href = `/results/${job_id}`;
    } catch (e) {
      setError(e.message);
      setRemixing(false);
    }
  };

  if (error) return <p className="mx-auto max-w-4xl px-6 py-12 text-red-400">{error}</p>;
  if (!job) return <p className="mx-auto max-w-4xl px-6 py-12 text-neutral-500">Loading…</p>;

  const done = job.status === "complete";

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{job.filename}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {job.num_variations} variations · {job.avatar_style.replace(/_/g, " ")} ·{" "}
            <span className="capitalize">{job.status}</span>
          </p>
        </div>
        {done && (
          <a
            href={api.downloadAllUrl(id)}
            className="rounded-lg bg-brand hover:bg-brand-dark px-4 py-2 text-sm font-medium transition-colors"
          >
            Download all (.zip)
          </a>
        )}
      </div>

      {!done && job.status !== "failed" && (
        <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-center gap-3">
            <ProgressBar value={job.progress} status={job.status} />
            <span className="text-sm tabular-nums w-12 text-right">
              {Math.round(job.progress)}%
            </span>
          </div>
          <ProcessingSteps job={job} />
        </div>
      )}

      {job.status === "failed" && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
          Job failed: {job.error}
        </div>
      )}

      {(job.transcript || job.scene_analysis) && (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {job.transcript?.text && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <h3 className="text-sm font-medium text-neutral-300">📝 Detected script</h3>
              <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                {job.transcript.text}
              </p>
            </div>
          )}
          {job.scene_analysis && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <h3 className="text-sm font-medium text-neutral-300">🧠 Scene structure</h3>
              {job.scene_analysis.summary && (
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  {job.scene_analysis.summary}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                {job.scene_analysis.tone && (
                  <span>
                    Tone: <span className="text-neutral-300">{job.scene_analysis.tone}</span>
                  </span>
                )}
                {job.scene_analysis.cta_timestamps?.length > 0 && (
                  <span>
                    CTA:{" "}
                    <span className="text-neutral-300">
                      {job.scene_analysis.cta_timestamps
                        .map((t) => `${Number(t).toFixed(1)}s`)
                        .join(", ")}
                    </span>
                  </span>
                )}
              </div>

              {job.scene_analysis.segments?.length > 0 && (
                <ol className="mt-4 space-y-3">
                  {job.scene_analysis.segments.map((s, i) => {
                    const isBroll = s.type === "product_broll";
                    return (
                      <li key={i} className="flex gap-3">
                        <span className="shrink-0 mt-0.5 text-[11px] tabular-nums text-neutral-500 w-20">
                          {Number(s.start ?? 0).toFixed(1)}–{Number(s.end ?? 0).toFixed(1)}s
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {s.label && (
                              <span className="text-xs font-medium text-neutral-200">
                                {s.label}
                              </span>
                            )}
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                isBroll
                                  ? "bg-amber-500/15 text-amber-300"
                                  : "bg-brand/15 text-brand"
                              }`}
                            >
                              {isBroll ? "B-roll" : "talking"}
                            </span>
                          </div>
                          {s.description && (
                            <p className="text-sm text-neutral-400 mt-0.5">{s.description}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          )}
        </div>
      )}

      {job.variations.length > 0 && (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {job.variations.map((v) => (
            <VideoPlayer key={v.id} variation={v} />
          ))}
        </div>
      )}

      {done && (
        <div className="mt-10 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="font-medium">Remix with a different avatar</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Re-run the same source video with a new cast.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select
              value={remixStyle}
              onChange={(e) => setRemixStyle(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-neutral-950 py-2 px-3 text-sm focus:border-brand outline-none"
            >
              {AVATAR_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              onClick={remix}
              disabled={remixing}
              className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {remixing ? "Starting…" : "Remix"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
