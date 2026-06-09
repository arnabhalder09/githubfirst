import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar.jsx";

const STATUS_BADGE = {
  pending: "bg-neutral-700 text-neutral-200",
  processing: "bg-amber-500/20 text-amber-300",
  complete: "bg-emerald-500/20 text-emerald-300",
  failed: "bg-red-500/20 text-red-300",
};

export default function JobCard({ job }) {
  return (
    <Link
      to={`/results/${job.id}`}
      className="block rounded-xl border border-neutral-800 bg-neutral-900 p-5 hover:border-brand/60 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium truncate">{job.filename}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {job.num_variations} variations · {job.avatar_style.replace(/_/g, " ")}
          </p>
        </div>
        <span
          className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
            STATUS_BADGE[job.status] ?? STATUS_BADGE.pending
          }`}
        >
          {job.status}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <ProgressBar value={job.progress} status={job.status} />
        <span className="text-xs tabular-nums text-neutral-400 w-10 text-right">
          {Math.round(job.progress)}%
        </span>
      </div>

      <p className="mt-2 text-xs text-neutral-500">
        {job.status === "failed" ? job.error : job.stage.replace(/_/g, " ")}
      </p>
    </Link>
  );
}
