import { Button } from './Button';

export function ConfirmDialog({ isOpen, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, isLoading = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-surface border border-border rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-muted mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}