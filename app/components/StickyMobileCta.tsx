import { ArrowDown } from "lucide-react";

export default function StickyMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden">
      <a
        href="#quote-form"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
      >
        Get My Free Quote
        <ArrowDown className="h-4 w-4" />
      </a>
    </div>
  );
}
