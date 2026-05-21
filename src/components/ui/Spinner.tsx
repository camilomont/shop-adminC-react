interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = 'Cargando...' }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-lavender-dark" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
