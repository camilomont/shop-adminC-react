import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0 min-h-[100dvh] w-full bg-ink/25"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`card relative z-10 w-full shadow-soft ${sizeClasses[size]}`}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="modal-title" className="text-base font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted transition hover:bg-canvas hover:text-ink"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5 text-ink/90">{children}</div>
        {footer !== undefined ? (
          <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
            {footer}
          </div>
        ) : (
          <div className="flex justify-end border-t border-line px-6 py-4">
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
