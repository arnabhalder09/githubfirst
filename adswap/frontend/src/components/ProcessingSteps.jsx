// Animated pipeline stepper. Maps the backend job.stage to a checklist so the
// user sees each stage (audio → transcript → scene analysis → generation)
// activate, spin, and complete in real time.

const STEPS = [
  { key: "extracting_audio", label: "Extracting audio", hint: "ffmpeg" },
  { key: "transcribing", label: "Transcribing speech", hint: "Whisper" },
  { key: "analyzing_scenes", label: "Analyzing scene structure", hint: "Claude" },
  { key: "generating", label: "Generating variations", hint: "Higgsfield" },
];

// Stage order as emitted by the backend pipeline.
const ORDER = [
  "queued",
  "extracting_audio",
  "transcribing",
  "analyzing_scenes",
  "generating",
  "complete",
];

function Marker({ state }) {
  if (state === "done") {
    return (
      <span className="grid place-items-center h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
        ✓
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="grid place-items-center h-7 w-7 rounded-full bg-brand/20">
        <span className="h-4 w-4 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </span>
    );
  }
  return <span className="grid place-items-center h-7 w-7 rounded-full bg-neutral-800 text-neutral-600 text-xs">•</span>;
}

export default function ProcessingSteps({ job }) {
  const current = ORDER.indexOf(job.stage);
  const total = job.num_variations;
  const doneVars = job.variations.filter((v) => v.status === "complete").length;

  return (
    <ol className="mt-5 space-y-2.5">
      {STEPS.map((step) => {
        const idx = ORDER.indexOf(step.key);
        const state =
          job.status === "complete" || current > idx
            ? "done"
            : current === idx
              ? "active"
              : "pending";

        const showCount = step.key === "generating" && state !== "pending";
        return (
          <li
            key={step.key}
            className={`flex items-center gap-3 transition-opacity ${
              state === "pending" ? "opacity-50" : "opacity-100"
            }`}
          >
            <Marker state={state} />
            <div className="flex-1 min-w-0">
              <span className={state === "active" ? "text-white" : "text-neutral-300"}>
                {step.label}
                {showCount && (
                  <span className="text-neutral-500"> · {doneVars}/{total}</span>
                )}
              </span>
            </div>
            <span className="text-xs text-neutral-600">{step.hint}</span>
          </li>
        );
      })}
    </ol>
  );
}
