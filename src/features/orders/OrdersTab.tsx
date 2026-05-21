import { useCallback, useEffect, useRef, useState } from 'react';
import * as ordersApi from '../../api/orders';
import * as usersApi from '../../api/users';
import * as productsApi from '../../api/products';
import { ApiError } from '../../api/client';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { Button } from '../../components/ui/Button';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { Panel } from '../../components/ui/Panel';
import { useAlert } from '../../hooks/useAlert';
import type { OrderFormValues, Purchase, User, Product } from '../../types';
import {
  formatDate,
  validateQuantity,
  validateRequired,
} from '../../utils/validation';

const emptyForm: OrderFormValues = { userId: '', productId: '', quantity: '1' };

type ListViewMode = 'idle' | 'user' | 'all';

export function OrdersTab() {
  const { alert, showSuccess, showError, clearAlert } = useAlert();
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [listUserId, setListUserId] = useState('');
  const [listViewMode, setListViewMode] = useState<ListViewMode>('idle');
  const [listFetched, setListFetched] = useState(false);
  const [form, setForm] = useState<OrderFormValues>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<OrderFormValues>>({});
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const listRequestRef = useRef(0);

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const [u, p] = await Promise.all([usersApi.listUsers(), productsApi.listProducts()]);
      setUsers(u);
      setProducts(p);
    } catch {
      showError('No se pudo cargar el catálogo para validar compras.');
    } finally {
      setCatalogLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const fetchOrdersForUser = useCallback(
    async (userId: string, options?: { notify?: boolean }) => {
      const id = userId.trim();
      if (!id) return;

      const requestId = ++listRequestRef.current;
      setLoadingList(true);

      try {
        const data = await ordersApi.listOrders(id);
        if (requestId !== listRequestRef.current) return;

        setOrders(data);
        setListFetched(true);
        setListViewMode('user');

        if (options?.notify) {
          if (data.length === 0) {
            showSuccess(`No hay compras registradas para ${id}.`);
          } else {
            showSuccess(`${data.length} compra(s) cargada(s) para ${id}.`);
          }
        }
      } catch (err) {
        if (requestId !== listRequestRef.current) return;
        setOrders([]);
        setListFetched(true);
        showError(err instanceof ApiError ? err.message : 'No se pudieron cargar las compras.');
      } finally {
        if (requestId === listRequestRef.current) {
          setLoadingList(false);
        }
      }
    },
    [showError, showSuccess],
  );

  const fetchAllOrders = useCallback(
    async (options?: { notify?: boolean }) => {
      if (users.length === 0) {
        showError('No hay usuarios para consultar compras.');
        return;
      }

      const requestId = ++listRequestRef.current;
      setLoadingList(true);
      setListViewMode('all');
      setListUserId('');

      try {
        const data = await ordersApi.listAllOrders(users);
        if (requestId !== listRequestRef.current) return;

        setOrders(data);
        setListFetched(true);

        if (options?.notify) {
          if (data.length === 0) {
            showSuccess('Ningún usuario tiene compras registradas.');
          } else {
            const usersWithOrders = new Set(data.map((o) => o.userId)).size;
            showSuccess(
              `${data.length} compra(s) de ${usersWithOrders} usuario(s) cargadas.`,
            );
          }
        }
      } catch (err) {
        if (requestId !== listRequestRef.current) return;
        setOrders([]);
        setListFetched(true);
        showError(err instanceof ApiError ? err.message : 'No se pudieron cargar las compras.');
      } finally {
        if (requestId === listRequestRef.current) {
          setLoadingList(false);
        }
      }
    },
    [users, showError, showSuccess],
  );

  useEffect(() => {
    if (catalogLoading || listViewMode !== 'user') return;

    const id = listUserId.trim();
    if (!id) {
      setOrders([]);
      setListFetched(false);
      setListViewMode('idle');
      return;
    }

    void fetchOrdersForUser(id);
  }, [listUserId, catalogLoading, listViewMode, fetchOrdersForUser]);

  function handleListUserChange(userId: string) {
    setListUserId(userId);
    if (userId.trim()) {
      setListViewMode('user');
    } else if (listViewMode === 'user') {
      setListViewMode('idle');
      setOrders([]);
      setListFetched(false);
    }
  }

  function validateForm(): boolean {
    const errors: Partial<OrderFormValues> = {};
    const userErr = validateRequired(form.userId, 'ID de usuario');
    const productErr = validateRequired(form.productId, 'ID de producto');
    const qtyErr = validateQuantity(form.quantity);
    if (userErr) errors.userId = userErr;
    if (productErr) errors.productId = productErr;
    if (qtyErr) errors.quantity = qtyErr;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function userExists(userId: string): boolean {
    return users.some((u) => u.userId === userId.trim());
  }

  function productExists(productId: string): boolean {
    return products.some((p) => p.productId === productId.trim());
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    const userId = form.userId.trim();
    const productId = form.productId.trim();

    if (!userExists(userId)) {
      showError(`El usuario "${userId}" no existe. Verifica el ID en la pestaña Usuarios.`);
      return;
    }
    if (!productExists(productId)) {
      showError(
        `El producto "${productId}" no existe. Verifica el ID en la pestaña Productos.`,
      );
      return;
    }

    setSaving(true);
    clearAlert();
    try {
      await ordersApi.createOrder(userId, {
        productId,
        quantity: Number(form.quantity),
      });
      showSuccess('Compra registrada correctamente.');
      setForm(emptyForm);
      setFormErrors({});
      setListUserId(userId);
      setListViewMode('user');
      await fetchOrdersForUser(userId);
      await loadCatalog();
    } catch (err) {
      if (err instanceof ApiError) {
        const hint =
          err.status >= 500
            ? ' Error interno del servidor.'
            : err.status === 404
              ? ' Recurso no encontrado.'
              : err.status === 400
                ? ' Datos inválidos.'
                : '';
        showError(`${err.message}${hint}`);
      } else {
        showError('No se pudo registrar la compra.');
      }
    } finally {
      setSaving(false);
    }
  }

  function handleRefreshClick() {
    clearAlert();
    if (listViewMode === 'all') {
      void fetchAllOrders({ notify: true });
      return;
    }
    const id = listUserId.trim();
    if (!id) return;
    void fetchOrdersForUser(id, { notify: true });
  }

  function handleShowAllClick() {
    clearAlert();
    void fetchAllOrders({ notify: true });
  }

  function getEmptyMessage(): string {
    if (loadingList) return 'Cargando compras...';
    if (listViewMode === 'all' && listFetched && orders.length === 0) {
      return 'Ningún usuario tiene compras registradas.';
    }
    if (listViewMode === 'idle') {
      return 'Selecciona un usuario o pulsa «Mostrar todo» para ver compras.';
    }
    if (listViewMode === 'user' && listFetched && orders.length === 0) {
      return 'No hay compras para este usuario.';
    }
    return 'Cargando compras...';
  }

  const columns: Column<Purchase>[] = [
    { key: 'userId', header: 'Usuario', render: (o) => <span className="id-chip">{o.userId}</span> },
    {
      key: 'productId',
      header: 'Producto',
      render: (o) => <span className="id-chip">{o.productId}</span>,
    },
    { key: 'quantity', header: 'Cantidad', render: (o) => o.quantity },
    { key: 'date', header: 'Fecha', render: (o) => formatDate(o.purchaseDate) },
  ];

  const showingAll = listViewMode === 'all';

  return (
    <div className="space-y-6">
      <AlertBanner type={alert.type} message={alert.message} onClose={clearAlert} />

      {catalogLoading && (
        <p className="text-sm text-muted">Cargando catálogo para validaciones...</p>
      )}

      <Panel title="Registrar compra">
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UserSelect
            label="Usuario"
            value={form.userId}
            users={users}
            onChange={(userId) => setForm((f) => ({ ...f, userId }))}
            error={formErrors.userId}
            placeholder="Selecciona usuario"
          />
          <ProductSelect
            label="Producto"
            value={form.productId}
            products={products}
            onChange={(productId) => setForm((f) => ({ ...f, productId }))}
            error={formErrors.productId}
            placeholder="Selecciona producto"
          />
          <Input
            label="Cantidad"
            type="number"
            min={1}
            step={1}
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            error={formErrors.quantity}
          />
          <div className="flex items-end">
            <Button type="submit" variant="create" loading={saving} className="w-full sm:w-auto">
              Registrar compra
            </Button>
          </div>
        </form>
      </Panel>

      <Panel title="Compras por usuario">
        <div className="mb-5 flex flex-wrap items-end gap-3">
          <UserSelect
            label="Usuario para listar"
            value={listUserId}
            users={users}
            onChange={handleListUserChange}
            className="min-w-[200px] flex-1"
            placeholder={showingAll ? 'Viendo todos los usuarios' : 'Selecciona un usuario'}
            disabled={showingAll}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant={showingAll ? 'create' : 'secondary'}
              onClick={handleShowAllClick}
              disabled={loadingList || catalogLoading || users.length === 0}
              loading={loadingList && showingAll}
            >
              Mostrar todo
            </Button>
            <Button
              variant="secondary"
              onClick={handleRefreshClick}
              disabled={
                loadingList ||
                catalogLoading ||
                (listViewMode !== 'all' && !listUserId.trim())
              }
            >
              Refrescar lista
            </Button>
          </div>
        </div>

        {showingAll && listFetched && orders.length > 0 && (
          <p className="mb-4 text-sm text-muted">
            Mostrando {orders.length} compra(s) de todos los usuarios, ordenadas por fecha.
          </p>
        )}

        {loadingList ? (
          <Spinner label={showingAll ? 'Cargando todas las compras...' : 'Cargando compras...'} />
        ) : (
          <DataTable
            columns={columns}
            data={orders}
            rowKey={(o) => `${o.userId}-${o.productId}-${o.purchaseDate ?? 'na'}`}
            emptyMessage={getEmptyMessage()}
          />
        )}
      </Panel>
    </div>
  );
}

interface UserSelectProps {
  label: string;
  value: string;
  users: User[];
  onChange: (userId: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function UserSelect({
  label,
  value,
  users,
  onChange,
  error,
  placeholder = 'Selecciona',
  className = '',
  disabled,
}: UserSelectProps) {
  const selectId = label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={selectId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`input-minimal cursor-pointer disabled:cursor-not-allowed ${error ? 'input-minimal-error' : ''}`}
      >
        <option value="">{placeholder}</option>
        {users.map((u) => (
          <option key={u.userId} value={u.userId}>
            {u.name} ({u.userId})
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-peach-dark">{error}</p>}
    </div>
  );
}

interface ProductSelectProps {
  label: string;
  value: string;
  products: Product[];
  onChange: (productId: string) => void;
  error?: string;
  placeholder?: string;
}

function ProductSelect({
  label,
  value,
  products,
  onChange,
  error,
  placeholder = 'Selecciona',
}: ProductSelectProps) {
  const selectId = label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-minimal cursor-pointer ${error ? 'input-minimal-error' : ''}`}
      >
        <option value="">{placeholder}</option>
        {products.map((p) => (
          <option key={p.productId} value={p.productId}>
            {p.name} ({p.productId})
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-peach-dark">{error}</p>}
    </div>
  );
}
