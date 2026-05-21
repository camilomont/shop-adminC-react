export type TabId = 'users' | 'products' | 'orders';

interface TabItem {
  id: TabId;
  label: string;
}

const TABS: TabItem[] = [
  { id: 'users', label: 'Usuarios' },
  { id: 'products', label: 'Productos' },
  { id: 'orders', label: 'Compras' },
];

interface TabsProps {
  active: TabId;
  onChange: (id: TabId) => void;
}

export function Tabs({ active, onChange }: TabsProps) {
  return (
    <nav
      className="flex gap-1 border-b border-line"
      aria-label="Secciones principales"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'border-lavender-dark text-ink'
                : 'border-transparent text-muted hover:border-line hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
