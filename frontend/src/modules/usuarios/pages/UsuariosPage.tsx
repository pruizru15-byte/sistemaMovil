import { useState, useEffect, type FC, type FormEvent } from 'react';
import {
  usersApi,
  type CreateUserDto,
  type UpdateUserDto,
} from '../../../shared/services/users.api';
import type { UserProfile } from '../../../shared/services/auth.api';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Truck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Edit2,
  Power,
  X,
  Save,
} from 'lucide-react';

export const UsuariosPage: FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  // Filtros
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<UserProfile | null>(null);
  const [newPasswordForUser, setNewPasswordForUser] = useState('');

  // Notificaciones
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Formulario de Usuario
  const [formDni, setFormDni] = useState('');
  const [formName, setFormName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'supervisor' | 'conductor'>('conductor');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formLicencia, setFormLicencia] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, [selectedRole, selectedStatus]);

  const cargarUsuarios = async () => {
    try {
      setIsLoading(true);
      const params: { role?: string; is_active?: boolean; search?: string } = {};
      if (selectedRole !== 'todos') params.role = selectedRole;
      if (selectedStatus !== 'todos') params.is_active = selectedStatus === 'activo';
      if (search.trim()) params.search = search.trim();

      const res = await usersApi.getUsers(params);
      setUsers(res.data);
      setTotalUsers(res.total);
    } catch {
      setFeedbackError('Error al cargar la lista de usuarios.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    cargarUsuarios();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormDni('');
    setFormName('');
    setFormLastName('');
    setFormRole('conductor');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormPassword('');
    setFormLicencia('');
    setFeedbackError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setFormDni(u.dni);
    setFormName(u.name);
    setFormLastName(u.last_name);
    setFormRole(u.role);
    setFormEmail(u.email || '');
    setFormPhone(u.phone || '');
    setFormAddress(u.address || '');
    setFormPassword('');
    setFormLicencia('');
    setFeedbackError(null);
    setIsModalOpen(true);
  };

  const openResetModal = (u: UserProfile) => {
    setUserToReset(u);
    setNewPasswordForUser('');
    setIsResetModalOpen(true);
  };

  const handleSaveUser = async (e: FormEvent) => {
    e.preventDefault();
    setFeedbackSuccess(null);
    setFeedbackError(null);

    try {
      setIsSaving(true);
      if (editingUser) {
        // Actualizar
        const payload: UpdateUserDto = {
          name: formName.trim(),
          last_name: formLastName.trim(),
          role: formRole,
          email: formEmail.trim() || undefined,
          phone: formPhone.trim() || undefined,
          address: formAddress.trim() || undefined,
        };
        const res = await usersApi.updateUser(editingUser.id, payload);
        setFeedbackSuccess(res.message);
      } else {
        // Crear
        if (!formDni || formDni.length !== 8) {
          setFeedbackError('El DNI debe tener 8 dígitos exactos.');
          setIsSaving(false);
          return;
        }
        if (!formPassword || formPassword.length < 6) {
          setFeedbackError('La contraseña inicial debe tener al menos 6 caracteres.');
          setIsSaving(false);
          return;
        }

        const payload: CreateUserDto = {
          dni: formDni.trim(),
          name: formName.trim(),
          last_name: formLastName.trim(),
          role: formRole,
          password: formPassword,
          email: formEmail.trim() || undefined,
          phone: formPhone.trim() || undefined,
          address: formAddress.trim() || undefined,
          licencia_numero: formLicencia.trim() || undefined,
        };
        const res = await usersApi.createUser(payload);
        setFeedbackSuccess(res.message);
      }

      setIsModalOpen(false);
      await cargarUsuarios();
      setTimeout(() => setFeedbackSuccess(null), 4000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setFeedbackError(errorObj.message || 'Error al guardar usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (u: UserProfile) => {
    try {
      const res = await usersApi.toggleStatus(u.id);
      setFeedbackSuccess(res.message);
      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, is_active: res.is_active } : item))
      );
      setTimeout(() => setFeedbackSuccess(null), 3500);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setFeedbackError(errorObj.message || 'Error al cambiar estado.');
      setTimeout(() => setFeedbackError(null), 3500);
    }
  };

  const handleConfirmResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!userToReset || newPasswordForUser.length < 6) return;

    try {
      const res = await usersApi.resetPassword(userToReset.id, newPasswordForUser);
      setFeedbackSuccess(res.message);
      setIsResetModalOpen(false);
      setTimeout(() => setFeedbackSuccess(null), 4000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setFeedbackError(errorObj.message || 'Error al restablecer contraseña.');
    }
  };

  const renderRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EFF6FF] text-[#1D68F2] border border-[#BFDBFE]">
          <Shield className="w-3 h-3" /> Admin
        </span>
      );
    }
    if (role === 'supervisor') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
          <Shield className="w-3 h-3" /> Supervisor
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF]">
        <Truck className="w-3 h-3" /> Conductor
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          HEADER & ACCIÓN PRINCIPAL
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B1B3D] tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#1D68F2]" /> Gestión de Usuarios y Roles
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Administración de cuentas de acceso, roles del personal y trazabilidad en red local
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] shadow-[0_4px_12px_rgba(29,104,242,0.25)] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      {/* FEEDBACK NOTIFICATIONS */}
      {feedbackSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {feedbackError && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}

      {/* ========================================================
          TARJETAS KPI RÁPIDAS
          ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E8EFF6] shadow-xs">
          <p className="text-xs font-semibold text-[#64748B]">Total Registrados</p>
          <p className="text-2xl font-black text-[#0B1B3D] mt-1">{totalUsers}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E8EFF6] shadow-xs">
          <p className="text-xs font-semibold text-[#64748B]">Administradores</p>
          <p className="text-2xl font-black text-[#1D68F2] mt-1">
            {users.filter((u) => u.role === 'admin').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E8EFF6] shadow-xs">
          <p className="text-xs font-semibold text-[#64748B]">Supervisores</p>
          <p className="text-2xl font-black text-[#16A34A] mt-1">
            {users.filter((u) => u.role === 'supervisor').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E8EFF6] shadow-xs">
          <p className="text-xs font-semibold text-[#64748B]">Conductores</p>
          <p className="text-2xl font-black text-[#9333EA] mt-1">
            {users.filter((u) => u.role === 'conductor').length}
          </p>
        </div>
      </div>

      {/* ========================================================
          BARRA DE BÚSQUEDA Y FILTROS
          ======================================================== */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8EFF6] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por DNI, nombre, apellido o correo..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#0B1B3D] focus:outline-none focus:border-[#1D68F2]"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#475569]"
          >
            <option value="todos">Todos los Roles</option>
            <option value="admin">Administradores</option>
            <option value="supervisor">Supervisores</option>
            <option value="conductor">Conductores</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#475569]"
          >
            <option value="todos">Todos los Estados</option>
            <option value="activo">Solo Activos</option>
            <option value="inactivo">Solo Inactivos</option>
          </select>
        </div>
      </div>

      {/* ========================================================
          TABLA DE USUARIOS
          ======================================================== */}
      <div className="rounded-[24px] bg-white border border-[#E8EFF6] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E8EFF6]">
              <tr>
                <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px] text-[#64748B]">
                  Usuario / DNI
                </th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-[#64748B]">
                  Rol
                </th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-[#64748B]">
                  Contacto
                </th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-[#64748B]">
                  Estado
                </th>
                <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px] text-[#64748B] text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#64748B]">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#64748B]">
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                    {/* Usuario */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name.charAt(0)}
                          {u.last_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#0B1B3D]">
                            {u.name} {u.last_name}
                          </p>
                          <p className="text-[11px] font-mono text-[#64748B]">DNI: {u.dni}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="py-3.5 px-4">{renderRoleBadge(u.role)}</td>

                    {/* Contacto */}
                    <td className="py-3.5 px-4">
                      <p className="text-[#0B1B3D] font-medium">{u.phone || 'Sin teléfono'}</p>
                      <p className="text-[11px] text-[#64748B]">{u.email || 'Sin correo'}</p>
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                          u.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          title="Editar Usuario"
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1D68F2] hover:bg-[#EBF3FE] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openResetModal(u)}
                          title="Restablecer Contraseña"
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#F59E0B] hover:bg-[#FEF3C7] transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          MODAL CREAR / EDITAR USUARIO
          ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-7 border border-[#E8EFF6] shadow-xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h2 className="text-base font-bold text-[#0B1B3D] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1D68F2]" />
                {editingUser ? 'Editar Cuenta de Usuario' : 'Crear Nuevo Usuario LAN'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#0B1B3D] hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                {/* DNI */}
                <div>
                  <label className="block text-xs font-bold text-[#0B1B3D] mb-1">
                    DNI (8 dígitos) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    maxLength={8}
                    value={formDni}
                    onChange={(e) => setFormDni(e.target.value.replace(/\D/g, ''))}
                    placeholder="70809010"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0B1B3D] focus:border-[#1D68F2] disabled:bg-[#F8FAFC] disabled:cursor-not-allowed"
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-xs font-bold text-[#0B1B3D] mb-1">Rol *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as 'admin' | 'supervisor' | 'conductor')}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0B1B3D] focus:border-[#1D68F2]"
                  >
                    <option value="conductor">Conductor</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                {/* Nombres */}
                <div>
                  <label className="block text-xs font-bold text-[#0B1B3D] mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Carlos"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0B1B3D] focus:border-[#1D68F2]"
                  />
                </div>

                {/* Apellidos */}
                <div>
                  <label className="block text-xs font-bold text-[#0B1B3D] mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    placeholder="Ramírez"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0B1B3D] focus:border-[#1D68F2]"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-xs font-bold text-[#0B1B3D] mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="987654321"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0B1B3D] focus:border-[#1D68F2]"
                  />
                </div>

                {/* Correo */}
                <div>
                  <label className="block text-xs font-bold text-[#0B1B3D] mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="usuario@asistencia.lan"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0B1B3D] focus:border-[#1D68F2]"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] mb-1">Dirección</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Av. Nicolás Ayllón 1200, Ate"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0B1B3D] focus:border-[#1D68F2]"
                />
              </div>

              {/* Contraseña Inicial (Solo en creación) */}
              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-[#0B1B3D] mb-1">
                    Contraseña Temporal Inicial *
                  </label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0B1B3D] focus:border-[#1D68F2]"
                  />
                  <p className="text-[10px] text-[#64748B] mt-1">
                    El usuario deberá cambiar esta clave en su primer inicio de sesión.
                  </p>
                </div>
              )}

              {/* Licencia (si es conductor) */}
              {!editingUser && formRole === 'conductor' && (
                <div>
                  <label className="block text-xs font-bold text-[#0B1B3D] mb-1">
                    N° Licencia de Conducir (Brevete)
                  </label>
                  <input
                    type="text"
                    value={formLicencia}
                    onChange={(e) => setFormLicencia(e.target.value)}
                    placeholder="Q70809010"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0B1B3D] focus:border-[#1D68F2]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Guardando...' : editingUser ? 'Actualizar Usuario' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL RESTABLECER CONTRASEÑA POR ADMIN
          ======================================================== */}
      {isResetModalOpen && userToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 border border-[#E8EFF6] shadow-xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-sm font-bold text-[#0B1B3D] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#F59E0B]" /> Restablecer Contraseña
              </h3>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0B1B3D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              Asigne una nueva contraseña temporal para{' '}
              <strong className="text-[#0B1B3D]">
                {userToReset.name} {userToReset.last_name}
              </strong>{' '}
              (DNI: {userToReset.dni}).
            </p>

            <form onSubmit={handleConfirmResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] mb-1">
                  Nueva Contraseña Temporal *
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordForUser}
                  onChange={(e) => setNewPasswordForUser(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0B1B3D] focus:border-[#F59E0B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] shadow-xs cursor-pointer"
                >
                  Confirmar Reseteo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
