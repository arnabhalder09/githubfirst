import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import JobCard from "../components/JobCard.jsx";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = () =>
      api
        .listJobs()
        .then((data) => active && setJobs(data))
        .catch((e) => active && setError(e.message))
        .finally(() => active && setLoading(false));
    load();
    // Poll every 3s so in-progress jobs update live.
    const t = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
        <Link
          to="/"
          className="rounded-lg bg-brand hover:bg-brand-dark px-4 py-2 text-sm font-medium transition-colors"
        >
          New upload
        </Link>
      </div>

      {error && <p className="mt-6 text-red-400">{error}</p>}

      {loading ? (
        <p className="mt-10 text-neutral-500">Loading…</p>
      ) : jobs.length === 0 ? (
        <div className="mt-16 text-center text-neutral-500">
          <div className="text-5xl">🗂️</div>
          <p className="mt-3">No jobs yet. Upload a video to get started.</p>
        </div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
