import { useState, useEffect, type FC, type FormEvent } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import {
  perfilApi,
  type PerfilDetallado,
  type UpdatePerfilDto,
  type UpdatePasswordDto,
} from '../../../shared/services/perfil.api';
import {
  User,
  Shield,
  KeyRound,
  Phone,
  MapPin,
  Mail,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Truck,
  IdCard,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const PerfilPage: FC = () => {
  const { user: authUser } = useAuth();

  const [perfil, setPerfil] = useState<PerfilDetallado | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPerfil, setIsSavingPerfil] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Estados de formulario de datos
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');

  // Estados de formulario de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Mensajes de feedback
  const [perfilSuccess, setPerfilSuccess] = useState<string | null>(null);
  const [perfilError, setPerfilError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setIsLoading(true);
      const data = await perfilApi.getPerfil();
      setPerfil(data);
      setPhone(data.phone || '');
      setAddress(data.address || '');
      setEmail(data.email || '');
    } catch {
      // Fallback a los datos en AuthContext
      if (authUser) {
        setPhone(authUser.phone || '');
        setAddress(authUser.address || '');
        setEmail(authUser.email || '');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePerfil = async (e: FormEvent) => {
    e.preventDefault();
    setPerfilSuccess(null);
    setPerfilError(null);

    try {
      setIsSavingPerfil(true);
      const payload: UpdatePerfilDto = {
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        email: email.trim() || undefined,
      };

      const res = await perfilApi.updatePerfil(payload);
      setPerfilSuccess(res.message || 'Datos actualizados exitosamente.');
      await cargarPerfil();
      setTimeout(() => setPerfilSuccess(null), 4000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setPerfilError(errorObj.message || 'Error al actualizar los datos de contacto.');
    } finally {
      setIsSavingPerfil(false);
    }
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('La confirmación de la contraseña no coincide.');
      return;
    }

    try {
      setIsSavingPassword(true);
      const payload: UpdatePasswordDto = {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      };

      const res = await perfilApi.updatePassword(payload);
      setPasswordSuccess(res.message || 'Contraseña cambiada exitosamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setPasswordError(errorObj.message || 'Error al modificar la contraseña. Verifique la contraseña actual.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const roleBadge = () => {
    const role = perfil?.role || authUser?.role;
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#1D68F2] border border-[#BFDBFE]">
          <Shield className="w-3.5 h-3.5" /> Administrador General
        </span>
      );
    }
    if (role === 'supervisor') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
          <Shield className="w-3.5 h-3.5" /> Supervisor Operativo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF]">
        <Truck className="w-3.5 h-3.5" /> Conductor de Flota
      </span>
    );
  };

  if (isLoading && !authUser) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-3 border-[#1D68F2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#64748B] font-semibold">Cargando perfil de usuario...</p>
      </div>
    );
  }

  const currentUser = perfil || authUser;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ========================================================
          CABECERA DE PERFIL
          ======================================================== */}
      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#E8EFF6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar con Squircle */}
          <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-[#1D68F2] to-[#1557D6] text-white flex items-center justify-center font-black text-2xl shadow-[0_8px_20px_rgba(29,104,242,0.25)] shrink-0">
            {currentUser?.name?.charAt(0)}
            {currentUser?.last_name?.charAt(0)}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#0B1B3D] tracking-tight">
                {currentUser?.name} {currentUser?.last_name}
              </h1>
              {roleBadge()}
            </div>
            <p className="text-xs text-[#64748B] flex items-center gap-2">
              <span className="font-bold text-[#0B1B3D]">DNI:</span> {currentUser?.dni}
              <span className="inline-block w-1 h-1 rounded-full bg-[#CBD5E1]" />
              <span className="text-[#10B981] font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Cuenta Activa (LAN)
              </span>
            </p>
          </div>
        </div>

        <div className="text-xs text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#1D68F2] shrink-0" />
          <span>Servidor local LAN • Terminal de Ate</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ========================================================
            COLUMNA IZQUIERDA / CENTRAL: DATOS PERSONALES
            ======================================================== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjeta de Datos Personales */}
          <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-[#E8EFF6] shadow-xs space-y-5">
            <div className="border-b border-[#F1F5F9] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0B1B3D] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#1D68F2]" /> Datos Personales y Contacto
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Actualiza tu teléfono, dirección y correo electrónico de contacto operativo
                </p>
              </div>
            </div>

            {perfilSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{perfilSuccess}</span>
              </div>
            )}

            {perfilError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{perfilError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePerfil} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DNI (Bloqueado) */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5 flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-[#94A3B8]" />
                    Documento Nacional de Identidad (DNI)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={currentUser?.dni || ''}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#64748B] cursor-not-allowed select-none"
                    />
                    <Lock className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3" />
                  </div>
                  <p className="text-[10px] text-[#94A3B8] mt-1">DNI protegido. Solo modificable por Administración.</p>
                </div>

                {/* Rol (Bloqueado) */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#94A3B8]" />
                    Rol en la Empresa
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={
                        currentUser?.role === 'admin'
                          ? 'Administrador General'
                          : currentUser?.role === 'supervisor'
                          ? 'Supervisor de Turnos'
                          : 'Conductor'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#64748B] cursor-not-allowed select-none capitalize"
                    />
                    <Lock className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3" />
                  </div>
                  <p className="text-[10px] text-[#94A3B8] mt-1">Nivel de privilegios y permisos en el sistema.</p>
                </div>

                {/* Nombres (Bloqueado) */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Nombres</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.name || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#64748B] cursor-not-allowed"
                  />
                </div>

                {/* Apellidos (Bloqueado) */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Apellidos</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.last_name || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#64748B] cursor-not-allowed"
                  />
                </div>

                {/* Teléfono (Editable) */}
                <div>
                  <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#1D68F2]" />
                    Teléfono Móvil
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. 987654321"
                    maxLength={15}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-semibold text-[#0B1B3D] focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 transition-all"
                  />
                </div>

                {/* Correo Electrónico (Editable) */}
                <div>
                  <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#1D68F2]" />
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-semibold text-[#0B1B3D] focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 transition-all"
                  />
                </div>
              </div>

              {/* Dirección (Editable) */}
              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1D68F2]" />
                  Dirección Domiciliaria
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. Principal 123, Distrito"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-semibold text-[#0B1B3D] focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingPerfil}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] shadow-[0_4px_12px_rgba(29,104,242,0.25)] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSavingPerfil ? 'Guardando...' : 'Guardar Cambios de Perfil'}
                </button>
              </div>
            </form>
          </div>

          {/* Tarjeta de Licencia (Solo para Conductores) */}
          {perfil?.conductor && (
            <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-[#E8EFF6] shadow-xs space-y-4">
              <div className="border-b border-[#F1F5F9] pb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0B1B3D] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#9333EA]" /> Datos de Conducción y Brevete
                </h2>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {perfil.conductor.estado.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#FAF5FF] p-3.5 rounded-2xl border border-[#F3E8FF]">
                  <p className="text-[11px] font-semibold text-[#6B21A8]">N° de Licencia</p>
                  <p className="text-sm font-black text-[#581C87] mt-0.5">{perfil.conductor.licencia_numero}</p>
                </div>
                <div className="bg-[#FAF5FF] p-3.5 rounded-2xl border border-[#F3E8FF]">
                  <p className="text-[11px] font-semibold text-[#6B21A8]">Categoría</p>
                  <p className="text-sm font-black text-[#581C87] mt-0.5">{perfil.conductor.licencia_categoria}</p>
                </div>
                <div className="bg-[#FAF5FF] p-3.5 rounded-2xl border border-[#F3E8FF]">
                  <p className="text-[11px] font-semibold text-[#6B21A8] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Vencimiento
                  </p>
                  <p className="text-sm font-black text-[#581C87] mt-0.5">{perfil.conductor.licencia_vencimiento}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            COLUMNA DERECHA: CAMBIO DE CONTRASEÑA Y SEGURIDAD
            ======================================================== */}
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-[#E8EFF6] shadow-xs space-y-5">
            <div className="border-b border-[#F1F5F9] pb-4">
              <h2 className="text-base font-bold text-[#0B1B3D] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#F59E0B]" /> Seguridad y Clave
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Cambia tu clave de acceso en la red local
              </p>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {/* Contraseña Actual */}
              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-semibold text-[#0B1B3D] focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
                />
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-semibold text-[#0B1B3D] focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
                />
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-semibold text-[#0B1B3D] focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingPassword || !currentPassword || !newPassword}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                {isSavingPassword ? 'Cambiando...' : 'Actualizar Contraseña'}
              </button>
            </form>
          </div>

          {/* Políticas de Seguridad LAN */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] p-5 text-xs text-[#64748B] space-y-2.5">
            <h3 className="font-bold text-[#0B1B3D] flex items-center gap-1.5 text-xs">
              <Shield className="w-3.5 h-3.5 text-[#1D68F2]" /> Políticas de Acceso LAN
            </h3>
            <p className="text-[11px] leading-relaxed">
              Las sesiones en red local se autentican mediante tokens seguros de Laravel Sanctum. Si olvidas tu clave, acércate presencialmente a la oficina de supervisión para su restablecimiento asistido.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

