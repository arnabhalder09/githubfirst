"use client";
import { useState, useRef, useCallback } from "react";

export type JobStatus = "idle" | "submitting" | "processing" | "done" | "error";

export interface JobResult {
  jobId: string | null;
  status: JobStatus;
  progress: number;
  stepLabel: string;
  videoUrl: string | null;
  error: string | null;
}

const POLL_INTERVAL = 3000;

const STEP_LABELS: Record<string, string> = {
  queued:     "Queued — waiting for GPU...",
  pending:    "Queued — waiting for GPU...",
  processing: "Generating your video...",
  rendering:  "Rendering final output...",
  completed:  "Done!",
  failed:     "Generation failed",
};

export function useHiggsfieldJob(endpoint = "/api/higgsfield/generate") {
  const [result, setResult] = useState<JobResult>({
    jobId: null, status: "idle", progress: 0, stepLabel: "", videoUrl: null, error: null,
  });
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCount = useRef(0);

  const stopPolling = () => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
  };

  const poll = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/higgsfield/jobs/${jobId}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const apiStatus: string = data.status ?? "processing";
      const stepLabel = STEP_LABELS[apiStatus] ?? "Processing...";

      // Estimate progress from poll count (capped at 90 until done)
      pollCount.current++;
      const progress = apiStatus === "completed"
        ? 100
        : Math.min(15 + pollCount.current * 5, 90);

      if (apiStatus === "completed") {
        const videoUrl = data.result_url ?? data.video_url ?? data.url ?? null;
        setResult({ jobId, status: "done", progress: 100, stepLabel, videoUrl, error: null });
        stopPolling();
      } else if (apiStatus === "failed") {
        setResult(r => ({ ...r, status: "error", stepLabel, error: data.error_message ?? "Generation failed" }));
        stopPolling();
      } else {
        setResult(r => ({ ...r, status: "processing", progress, stepLabel }));
        pollTimer.current = setTimeout(() => poll(jobId), POLL_INTERVAL);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      setResult(r => ({ ...r, status: "error", error }));
      stopPolling();
    }
  }, []);

  const generate = useCallback(async (payload: Record<string, unknown>) => {
    stopPolling();
    pollCount.current = 0;
    setResult({ jobId: null, status: "submitting", progress: 5, stepLabel: "Submitting to Higgsfield...", videoUrl: null, error: null });

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? `API error ${res.status}`);

      const jobId = data.id ?? data.job_id ?? data.jobId;
      if (!jobId) throw new Error("No job ID returned from API");

      setResult(r => ({ ...r, jobId, status: "processing", progress: 10, stepLabel: "Queued — waiting for GPU..." }));
      pollTimer.current = setTimeout(() => poll(jobId), POLL_INTERVAL);
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      setResult({ jobId: null, status: "error", progress: 0, stepLabel: "", videoUrl: null, error });
    }
  }, [poll]);

  const reset = useCallback(() => {
    stopPolling();
    pollCount.current = 0;
    setResult({ jobId: null, status: "idle", progress: 0, stepLabel: "", videoUrl: null, error: null });
  }, []);

  return { result, generate, reset };
}
