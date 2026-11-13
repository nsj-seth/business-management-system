import { useEffect, useRef } from 'react';
import { Button } from './Button';

export function ConfirmDialog({ isOpen, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, isLoading = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);
  return <dialog ref={ref} aria-labelledby="confirm-title" aria-describedby="confirm-message" onCancel={event => { event.preventDefault(); if (!isLoading) onCancel(); }} onClick={event => { if (event.target === ref.current && !isLoading) onCancel(); }} className="m-auto w-[calc(100%_-_2rem)] max-w-sm rounded-2xl border border-border bg-surface text-text-primary p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm">
    <div className="p-6"><h3 id="confirm-title" className="text-lg font-semibold mb-2">{title}</h3><p id="confirm-message" className="text-sm text-text-muted mb-6 leading-relaxed">{message}</p><div className="flex justify-end gap-2"><Button variant="secondary" disabled={isLoading} onClick={onCancel}>Cancel</Button><Button onClick={onConfirm} isLoading={isLoading}>{confirmLabel}</Button></div></div>
  </dialog>;
}
