export default function ProgressBar({ value = 0, status }) {
  const color =
    status === "failed"
      ? "bg-red-500"
      : status === "complete"
        ? "bg-emerald-500"
        : "bg-brand";
  return (
    <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-500`}
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </div>
  );
}
