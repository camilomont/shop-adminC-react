import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  rowKey: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = 'No hay registros.',
  rowKey,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-canvas/50 px-4 py-12 text-center text-sm text-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-canvas/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-white">
          {data.map((row) => (
            <tr key={rowKey(row)} className="transition-colors hover:bg-canvas/40">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3.5 text-ink ${col.className ?? ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
