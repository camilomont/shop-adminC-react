import { useCallback, useEffect, useRef, useState } from 'react';
import * as productsApi from '../../api/products';
import { ApiError } from '../../api/client';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { Button } from '../../components/ui/Button';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import { Modal } from '../../components/modal/Modal';
import { Panel } from '../../components/ui/Panel';
import { useAlert } from '../../hooks/useAlert';
import type { Product, ProductFormValues } from '../../types';
import { formatPrice, validatePrice, validateRequired } from '../../utils/validation';

const emptyForm: ProductFormValues = {
  productId: '',
  name: '',
  price: '',
  imageUrl: '',
};

export function ProductsTab() {
  const { alert, showSuccess, showError, clearAlert } = useAlert();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<ProductFormValues>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<ProductFormValues>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', imageUrl: '' });
  const [editErrors, setEditErrors] = useState<{
    name?: string;
    price?: string;
  }>({});
  const editFileRef = useRef<HTMLInputElement>(null);
  const [editUploading, setEditUploading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(
    async (options?: { keepAlert?: boolean }) => {
      setLoading(true);
      if (!options?.keepAlert) clearAlert();
      try {
        const data = await productsApi.listProducts();
        setProducts(data);
      } catch (err) {
        showError(err instanceof ApiError ? err.message : 'No se pudieron cargar los productos.');
      } finally {
        setLoading(false);
      }
    },
    [clearAlert, showError],
  );

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function validateCreate(): boolean {
    const errors: Partial<ProductFormValues> = {};
    const idErr = validateRequired(form.productId, 'ID de producto');
    const nameErr = validateRequired(form.name, 'Nombre');
    const priceErr = validatePrice(form.price);
    if (idErr) errors.productId = idErr;
    if (nameErr) errors.name = nameErr;
    if (priceErr) errors.price = priceErr;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleImageUpload(
    file: File,
    onUrl: (url: string) => void,
    setUploadState: (v: boolean) => void,
  ) {
    if (!file.type.startsWith('image/')) {
      showError('Selecciona un archivo de imagen válido (JPEG, PNG, WebP, etc.).');
      return;
    }
    setUploadState(true);
    clearAlert();
    try {
      const imageUrl = await productsApi.uploadProductImage(file);
      onUrl(imageUrl);
      showSuccess('Imagen subida correctamente. URL lista para el producto.');
    } catch (err) {
      showError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo subir la imagen. Intenta de nuevo.',
      );
    } finally {
      setUploadState(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!validateCreate()) return;
    setSaving(true);
    clearAlert();
    try {
      const payload: Product = {
        productId: form.productId.trim(),
        name: form.name.trim(),
        price: Number(form.price),
      };
      if (form.imageUrl.trim()) payload.imageUrl = form.imageUrl.trim();
      await productsApi.createProduct(payload);
      showSuccess('Producto creado correctamente.');
      setForm(emptyForm);
      setFormErrors({});
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadProducts({ keepAlert: true });
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Error al crear el producto.');
    } finally {
      setSaving(false);
    }
  }

  function openEdit(product: Product) {
    setEditProduct(product);
    setEditForm({
      name: product.name,
      price: String(product.price),
      imageUrl: product.imageUrl ?? '',
    });
    setEditErrors({});
  }

  function validateEdit(): boolean {
    const errors: { name?: string; price?: string } = {};
    const nameErr = validateRequired(editForm.name, 'Nombre');
    const priceErr = validatePrice(editForm.price);
    if (nameErr) errors.name = nameErr;
    if (priceErr) errors.price = priceErr;
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleEditSave() {
    if (!editProduct || !validateEdit()) return;
    setSaving(true);
    clearAlert();
    try {
      const payload: Pick<Product, 'name' | 'price' | 'imageUrl'> = {
        name: editForm.name.trim(),
        price: Number(editForm.price),
      };
      if (editForm.imageUrl.trim()) payload.imageUrl = editForm.imageUrl.trim();
      await productsApi.updateProduct(editProduct.productId, payload);
      showSuccess('Producto actualizado correctamente.');
      setEditProduct(null);
      await loadProducts({ keepAlert: true });
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Error al actualizar el producto.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    clearAlert();
    try {
      await productsApi.deleteProduct(deleteTarget.productId);
      showSuccess('Producto eliminado correctamente.');
      setDeleteTarget(null);
      await loadProducts({ keepAlert: true });
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Error al eliminar el producto.');
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Product>[] = [
    {
      key: 'productId',
      header: 'ID',
      render: (p) => <span className="id-chip">{p.productId}</span>,
    },
    { key: 'name', header: 'Nombre', render: (p) => p.name },
    { key: 'price', header: 'Precio', render: (p) => formatPrice(p.price) },
    {
      key: 'image',
      header: 'Imagen',
      render: (p) =>
        p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            className="h-12 w-12 rounded-lg border border-line object-cover"
          />
        ) : (
          <span className="text-xs text-muted">Sin imagen</span>
        ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'whitespace-nowrap',
      render: (p) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="edit" onClick={() => openEdit(p)}>
            Editar
          </Button>
          <Button variant="delete" onClick={() => setDeleteTarget(p)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AlertBanner type={alert.type} message={alert.message} onClose={clearAlert} />

      <Panel title="Crear producto">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="ID de producto"
              value={form.productId}
              onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
              error={formErrors.productId}
              placeholder="prod_001"
            />
            <Input
              label="Nombre"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              error={formErrors.name}
            />
            <Input
              label="Precio"
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              error={formErrors.price}
            />
          </div>

          <div className="rounded-xl border border-line bg-sky/40 p-4">
            <p className="mb-3 text-sm font-medium text-sky-dark">Imagen del producto (S3)</p>
            <div className="flex flex-wrap items-end gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleImageUpload(file, (url) => setForm((f) => ({ ...f, imageUrl: url })), setUploading);
                }}
              />
              <Button
                type="button"
                variant="upload"
                loading={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                Subir imagen
              </Button>
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Vista previa"
                  className="h-14 w-14 rounded-lg border border-line object-cover"
                />
              )}
            </div>
            <div className="mt-3">
              <Input
                label="URL de imagen (autollenada)"
                value={form.imageUrl}
                readOnly
                placeholder="Sube una imagen o pega una URL"
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              />
            </div>
          </div>

          <Button type="submit" variant="create" loading={saving}>
            Crear producto
          </Button>
        </form>
      </Panel>

      <Panel
        title="Listado de productos"
        action={
          <Button variant="secondary" onClick={() => void loadProducts()} disabled={loading}>
            Refrescar
          </Button>
        }
      >
        {loading ? (
          <Spinner label="Cargando productos..." />
        ) : (
          <DataTable columns={columns} data={products} rowKey={(p) => p.productId} />
        )}
      </Panel>

      <Modal
        open={!!editProduct}
        title="Editar producto"
        onClose={() => setEditProduct(null)}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditProduct(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="edit" onClick={() => void handleEditSave()} loading={saving}>
              Guardar cambios
            </Button>
          </>
        }
      >
        {editProduct && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              ID: <span className="id-chip">{editProduct.productId}</span>
            </p>
            <Input
              label="Nombre"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              error={editErrors.name}
            />
            <Input
              label="Precio"
              type="number"
              min={0}
              step="0.01"
              value={editForm.price}
              onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
              error={editErrors.price}
            />
            <div className="flex flex-wrap items-end gap-3">
              <input
                ref={editFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    void handleImageUpload(
                      file,
                      (url) => setEditForm((f) => ({ ...f, imageUrl: url })),
                      setEditUploading,
                    );
                }}
              />
              <Button
                variant="upload"
                loading={editUploading}
                onClick={() => editFileRef.current?.click()}
              >
                Subir imagen
              </Button>
              {editForm.imageUrl && (
                <img
                  src={editForm.imageUrl}
                  alt="Vista previa"
                  className="h-14 w-14 rounded-lg border border-line object-cover"
                />
              )}
            </div>
            <Input
              label="URL de imagen"
              value={editForm.imageUrl}
              onChange={(e) => setEditForm((f) => ({ ...f, imageUrl: e.target.value }))}
            />
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar producto"
        message={
          deleteTarget
            ? `¿Confirmas eliminar el producto "${deleteTarget.name}" (${deleteTarget.productId})?`
            : ''
        }
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
