import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'create' | 'edit' | 'delete' | 'upload' | 'secondary' | 'ghost';

const variantClasses: Record<Variant, string> = {
  create: 'bg-lavender text-lavender-dark hover:bg-[#E2DAF2] focus:ring-lavender-dark/20',
  edit: 'bg-mint text-mint-dark hover:bg-[#D4EDE4] focus:ring-mint-dark/20',
  delete: 'bg-peach text-peach-dark hover:bg-[#F9D9D3] focus:ring-peach-dark/20',
  upload: 'bg-sky text-sky-dark hover:bg-[#D6E8F6] focus:ring-sky-dark/20',
  secondary:
    'border border-line bg-white text-ink hover:bg-canvas focus:ring-muted/20',
  ghost: 'bg-transparent text-muted hover:bg-canvas hover:text-ink focus:ring-muted/15',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'secondary',
  type = 'button',
  children,
  loading,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const spinnerBorder =
    variant === 'secondary' || variant === 'ghost'
      ? 'border-muted/30 border-t-ink'
      : 'border-current/25 border-t-current';

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className={`h-3.5 w-3.5 animate-spin rounded-full border-2 ${spinnerBorder}`} />
      )}
      {children}
    </button>
  );
}
