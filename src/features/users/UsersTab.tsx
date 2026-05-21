import { useCallback, useEffect, useState } from 'react';
import * as usersApi from '../../api/users';
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
import type { User, UserFormValues } from '../../types';
import { isValidEmail, validateRequired } from '../../utils/validation';

const emptyForm: UserFormValues = { userId: '', name: '', email: '' };

export function UsersTab() {
  const { alert, showSuccess, showError, clearAlert } = useAlert();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UserFormValues>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<UserFormValues>>({});

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [editErrors, setEditErrors] = useState<{ name?: string; email?: string }>({});

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = useCallback(
    async (options?: { keepAlert?: boolean }) => {
      setLoading(true);
      if (!options?.keepAlert) clearAlert();
      try {
        const data = await usersApi.listUsers();
        setUsers(data);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'No se pudieron cargar los usuarios.';
        showError(msg);
      } finally {
        setLoading(false);
      }
    },
    [clearAlert, showError],
  );

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function validateCreate(): boolean {
    const errors: Partial<UserFormValues> = {};
    const userIdErr = validateRequired(form.userId, 'ID de usuario');
    const nameErr = validateRequired(form.name, 'Nombre');
    const emailReq = validateRequired(form.email, 'Email');
    if (userIdErr) errors.userId = userIdErr;
    if (nameErr) errors.name = nameErr;
    if (emailReq) errors.email = emailReq;
    else if (!isValidEmail(form.email)) errors.email = 'Ingresa un email válido.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!validateCreate()) return;
    setSaving(true);
    clearAlert();
    try {
      await usersApi.createUser({
        userId: form.userId.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
      });
      showSuccess('Usuario creado correctamente.');
      setForm(emptyForm);
      setFormErrors({});
      await loadUsers({ keepAlert: true });
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Error al crear el usuario.');
    } finally {
      setSaving(false);
    }
  }

  function openEdit(user: User) {
    setEditUser(user);
    setEditForm({ name: user.name, email: user.email });
    setEditErrors({});
  }

  function validateEdit(): boolean {
    const errors: { name?: string; email?: string } = {};
    const nameErr = validateRequired(editForm.name, 'Nombre');
    const emailReq = validateRequired(editForm.email, 'Email');
    if (nameErr) errors.name = nameErr;
    if (emailReq) errors.email = emailReq;
    else if (!isValidEmail(editForm.email)) errors.email = 'Ingresa un email válido.';
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleEditSave() {
    if (!editUser || !validateEdit()) return;
    setSaving(true);
    clearAlert();
    try {
      await usersApi.updateUser(editUser.userId, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
      });
      showSuccess('Usuario actualizado correctamente.');
      setEditUser(null);
      await loadUsers({ keepAlert: true });
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Error al actualizar el usuario.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    clearAlert();
    try {
      await usersApi.deleteUser(deleteTarget.userId);
      showSuccess('Usuario eliminado correctamente.');
      setDeleteTarget(null);
      await loadUsers({ keepAlert: true });
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Error al eliminar el usuario.');
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<User>[] = [
    { key: 'userId', header: 'ID', render: (u) => <span className="id-chip">{u.userId}</span> },
    { key: 'name', header: 'Nombre', render: (u) => u.name },
    { key: 'email', header: 'Email', render: (u) => u.email },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'whitespace-nowrap',
      render: (u) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="edit" onClick={() => openEdit(u)}>
            Editar
          </Button>
          <Button variant="delete" onClick={() => setDeleteTarget(u)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AlertBanner type={alert.type} message={alert.message} onClose={clearAlert} />

      <Panel title="Crear usuario">
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="ID de usuario"
            value={form.userId}
            onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
            error={formErrors.userId}
            placeholder="usr_001"
          />
          <Input
            label="Nombre"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={formErrors.name}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={formErrors.email}
          />
          <div className="flex items-end">
            <Button type="submit" variant="create" loading={saving} className="w-full sm:w-auto">
              Crear usuario
            </Button>
          </div>
        </form>
      </Panel>

      <Panel
        title="Listado de usuarios"
        action={
          <Button variant="secondary" onClick={() => void loadUsers()} disabled={loading}>
            Refrescar
          </Button>
        }
      >
        {loading ? (
          <Spinner label="Cargando usuarios..." />
        ) : (
          <DataTable columns={columns} data={users} rowKey={(u) => u.userId} />
        )}
      </Panel>

      <Modal
        open={!!editUser}
        title="Editar usuario"
        onClose={() => setEditUser(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditUser(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="edit" onClick={() => void handleEditSave()} loading={saving}>
              Guardar cambios
            </Button>
          </>
        }
      >
        {editUser && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              ID: <span className="id-chip">{editUser.userId}</span>
            </p>
            <Input
              label="Nombre"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              error={editErrors.name}
            />
            <Input
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              error={editErrors.email}
            />
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar usuario"
        message={
          deleteTarget
            ? `¿Confirmas eliminar al usuario "${deleteTarget.name}" (${deleteTarget.userId})? Esta acción no se puede deshacer.`
            : ''
        }
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
