import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Panel({ title, children, action, className = '' }: PanelProps) {
  return (
    <section className={`card p-6 sm:p-7 ${className}`}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
