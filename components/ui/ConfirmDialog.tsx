import { MaterialSymbol } from "./MaterialSymbols";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-surface w-[85%] max-w-sm rounded-[28px] p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center">
            <MaterialSymbol name="delete" className="text-3xl text-on-error-container" />
          </div>
          <div className="space-y-1">
            <h2 className="text-title-lg text-on-surface font-medium">{title}</h2>
            <p className="text-body-md text-on-surface-variant">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full h-12 rounded-full bg-error text-on-error font-semibold text-body-lg hover:bg-error/90 transition-colors"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="w-full h-12 rounded-full text-on-surface-variant font-semibold text-body-lg hover:bg-surface-container-high transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
