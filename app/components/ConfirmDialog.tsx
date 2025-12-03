"use client";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({
  open,
  title = "Är du säker?",
  description,
  confirmLabel = "Ja",
  cancelLabel = "Avbryt",
  loading = false,
  variant = "default",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmClasses =
    variant === "danger"
      ? "bg-red-500 hover:bg-red-400 text-slate-950"
      : "bg-sky-500 hover:bg-sky-400 text-slate-950";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl">
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {description && (
          <p className="mt-2 text-xs text-slate-400">{description}</p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-60 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              "rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-60 " +
              confirmClasses
            }
          >
            {loading ? "Bearbetar…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
