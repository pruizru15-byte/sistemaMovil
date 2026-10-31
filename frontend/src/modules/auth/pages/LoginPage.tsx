import { useState, type FC, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { PasswordResetModal } from '../components/PasswordResetModal';
import {
  Bus,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Users,
  Calendar,
  BarChart2,
  Check,
  AlertCircle,
} from 'lucide-react';

interface LoginPageProps {
  onSuccessLogin?: () => void;
}

export const LoginPage: FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login } = useAuth();

  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (dni.length !== 8) {
      setError('El DNI debe contener 8 dígitos numéricos.');
      return;
    }
    if (!password) {
      setError('Por favor, ingresa tu contraseña.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(dni, password, remember);
      if (onSuccessLogin) {
        onSuccessLogin();
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoDni: string, demoPass: string) => {
    setDni(demoDni);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#EDF3F8]">
      {/* Formas orgánicas de fondo (Curvas en tonos celestes suaves según el mockup) */}
      <div className="absolute top-0 right-0 w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-blue-100/60 to-transparent -translate-y-1/3 translate-x-1/4 pointer-events-none blur-2xl" />
      <div className="absolute bottom-0 left-0 w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-blue-100/50 to-transparent translate-y-1/3 -translate-x-1/4 pointer-events-none blur-2xl" />

      {/* Patrones de puntos decorativos */}
      <div className="absolute top-10 right-14 hidden lg:grid grid-cols-5 gap-2 opacity-30 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        ))}
      </div>
      <div className="absolute bottom-12 left-12 hidden lg:grid grid-cols-5 gap-2 opacity-30 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        ))}
      </div>

      {/* Contenedor Principal Centrado */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LADO IZQUIERDO: Características con Iconos en Squircles */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-8 pr-2">
          {/* Item 1: Gestión de turnos */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#E1EDFD] text-[#1D68F2] shadow-xs shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0B1B3D]">Gestión de turnos</h3>
              <p className="text-xs text-[#64748B] mt-0.5 leading-snug">
                Organiza y asigna horarios de trabajo.
              </p>
            </div>
          </div>

          {/* Item 2: Control de asistencia */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#E1EDFD] text-[#1D68F2] shadow-xs shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0B1B3D]">Control de asistencia</h3>
              <p className="text-xs text-[#64748B] mt-0.5 leading-snug">
                Registra ingresos y salidas en tiempo real.
              </p>
            </div>
          </div>

          {/* Item 3: Operación eficiente */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#E1EDFD] text-[#1D68F2] shadow-xs shrink-0">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0B1B3D]">Operación eficiente</h3>
              <p className="text-xs text-[#64748B] mt-0.5 leading-snug">
                Información confiable para una mejor gestión.
              </p>
            </div>
          </div>
        </div>

        {/* CENTRO: Tarjeta de Login Principal */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full max-w-[440px] bg-white rounded-[28px] sm:rounded-[32px] p-7 sm:p-10 shadow-[0_20px_50px_rgba(29,104,242,0.08),0_4px_16px_rgba(0,0,0,0.02)] border border-[#E8EFF6]">
            {/* Logo Squircle Azul */}
            <div className="flex flex-col items-center text-center mb-7">
              <div className="w-16 h-16 rounded-[20px] bg-[#1D68F2] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(29,104,242,0.3)] mb-4">
                <Bus className="w-8 h-8" strokeWidth={2.2} />
              </div>
              <h1 className="text-[26px] sm:text-[28px] font-extrabold text-[#0B1B3D] tracking-tight">
                Control de Asistencia
              </h1>
              <p className="text-sm font-medium text-[#64748B] mt-1">
                Acceso al sistema
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo DNI */}
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                  DNI
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    value={dni}
                    onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ingresa tu DNI"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-3 focus:ring-[#1D68F2]/10 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-3 focus:ring-[#1D68F2]/10 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#475569] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checkbox y Olvidaste */}
              <div className="flex items-center justify-between text-xs pt-1 pb-1">
                <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-[#1E293B]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1D68F2] focus:ring-[#1D68F2] border-[#CBD5E1]"
                  />
                  Recordarme
                </label>

                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="font-semibold text-[#1D68F2] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón Iniciar Sesión */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] flex items-center justify-center gap-2 shadow-[0_8px_18px_rgba(29,104,242,0.25)] transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    Iniciar sesión
                  </>
                )}
              </button>
            </form>

            {/* Conectado a red local */}
            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-[#10B981]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>Conectado a red local</span>
            </div>

            {/* Separador */}
            <div className="my-5 border-t border-[#EDF2F7]" />

            {/* Selector rápido para pruebas demo */}
            <div className="text-center mb-4">
              <p className="text-[11px] font-semibold text-[#94A3B8] mb-2">
                Acceso rápido demo (Terminal Ate):
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fillCredentials('00000001', 'Admin123!')}
                  className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-[11px] font-medium text-[#475569] hover:bg-[#F1F5F9] transition-colors"
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('00000002', 'Super123!')}
                  className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-[11px] font-medium text-[#475569] hover:bg-[#F1F5F9] transition-colors"
                >
                  📋 Supervisor
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('00000003', 'Cond123!')}
                  className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-[11px] font-medium text-[#475569] hover:bg-[#F1F5F9] transition-colors"
                >
                  🚌 Conductor
                </button>
              </div>
            </div>

            {/* Footer de la tarjeta */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#94A3B8]">
              <Users className="w-3.5 h-3.5" />
              <span>Acceso para conductores, supervisores y administradores</span>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: Tarjeta Flotante "Asistencia registrada" e Ilustración */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-start items-start relative pl-4">
          {/* Card Flotante (Mockup Asistencia Registrada) */}
          <div className="w-full max-w-[260px] bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-[0_15px_35px_rgba(29,104,242,0.1)] border border-[#E8EFF6] mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0B1B3D] leading-tight">
                  Asistencia registrada
                </p>
                <p className="text-[11px] text-[#64748B] font-medium">07:02</p>
              </div>
            </div>
            {/* Líneas skeleton decorativas tal como en el mockup */}
            <div className="mt-3 space-y-1.5 pl-11">
              <div className="h-1.5 bg-[#E2E8F0] rounded-full w-3/4" />
              <div className="h-1.5 bg-[#F1F5F9] rounded-full w-1/2" />
            </div>
          </div>

          {/* Tarjeta decorativa de Terminal y Buses */}
          <div className="w-full max-w-[260px] rounded-2xl p-4 bg-gradient-to-br from-blue-50/80 to-white/90 border border-blue-100 shadow-sm text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#1D68F2] font-bold">
              <Bus className="w-4 h-4" />
              <span>Flota Terminal Ate</span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Monitoreo perimetral y despacho operativo de unidades en red LAN local.
            </p>
            <div className="pt-2 border-t border-blue-100/60 flex items-center justify-between text-[10px] font-semibold text-[#10B981]">
              <span>● Servidor LAN Operativo</span>
              <span>100% Offline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Recuperación Asistida */}
      <PasswordResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};
