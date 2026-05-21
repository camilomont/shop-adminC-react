import { useState } from 'react';
import { Tabs, type TabId } from '../../components/tabs/Tabs';
import { UsersTab } from '../users/UsersTab';
import { ProductsTab } from '../products/ProductsTab';
import { OrdersTab } from '../orders/OrdersTab';

const MODULE_TAGS = [
  { label: 'Usuarios', color: 'bg-sand text-sand-dark' },
  { label: 'Productos', color: 'bg-wheat text-wheat-dark' },
  { label: 'Compras', color: 'bg-linen text-taupe-dark' },
] as const;

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('users');

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <header className="mb-10 rounded-2xl border border-line bg-linen p-6 sm:p-8">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 text-xs font-semibold tracking-wide text-sand-dark">
          <span className="h-1.5 w-1.5 rounded-full bg-taupe-dark" />
          Panel de control
        </p>

        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-[2.35rem]">
          Shop{' '}
          <span className="relative inline-block text-taupe-dark">
            Admin
            <span
              className="absolute -bottom-1 left-0 h-2 w-full rounded-full bg-wheat -z-10"
              aria-hidden
            />
          </span>
        </h1>

        <p className="mt-4 max-w-lg text-base leading-relaxed text-ink/85 sm:text-[1.05rem]">
          Gestión de{' '}
          <span className="font-medium text-sand-dark">usuarios</span>,{' '}
          <span className="font-medium text-wheat-dark">productos</span> y{' '}
          <span className="font-medium text-taupe-dark">compras</span> — todo en un
          solo lugar.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {MODULE_TAGS.map((tag) => (
            <span
              key={tag.label}
              className={`rounded-full px-3 py-1 text-xs font-medium ${tag.color}`}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </header>

      <Tabs active={activeTab} onChange={setActiveTab} />

      <main className="mt-8 space-y-6 pb-16">
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'orders' && <OrdersTab />}
      </main>
    </div>
  );
}
