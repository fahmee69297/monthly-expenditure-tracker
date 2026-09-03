import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", danger = true, onConfirm, onCancel, busy = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-2xl border border-line bg-panel p-5 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${danger ? "bg-rose-500/10 text-rose-400" : "bg-accent/10 text-accent"}`}>
            <AlertTriangle size={21} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="confirm-title" className="font-bold">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted">{message}</p>
          </div>
          <button type="button" onClick={onCancel} className="tap flex items-center justify-center rounded-xl text-muted hover:bg-panel2 hover:text-white" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" onClick={onCancel} className="ghost-btn">Cancel</button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`min-h-12 rounded-xl px-4 font-semibold text-white disabled:opacity-50 ${danger ? "bg-rose-600 hover:bg-rose-500" : "bg-accent hover:bg-violet-500"}`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
