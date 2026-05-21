import type { AlertType } from '../../types';

interface AlertBannerProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

export function AlertBanner({ type, message, onClose }: AlertBannerProps) {
  if (!type || !message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm ${
        isSuccess ? 'bg-mint text-mint-dark' : 'bg-peach text-peach-dark'
      }`}
    >
      <p className="font-medium">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md px-1.5 text-current/60 transition hover:text-current"
          aria-label="Cerrar mensaje"
        >
          ✕
        </button>
      )}
    </div>
  );
}
