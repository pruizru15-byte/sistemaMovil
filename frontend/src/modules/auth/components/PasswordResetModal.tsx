import { useState, type FC, type FormEvent } from 'react';
import { authApi } from '../../../shared/services/auth.api';
import { ShieldAlert, X, CheckCircle2, User, Send } from 'lucide-react';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordResetModal: FC<PasswordResetModalProps> = ({ isOpen, onClose }) => {
  const [dni, setDni] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (dni.length !== 8) {
      setError('El DNI debe contener exactamente 8 dígitos.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await authApi.requestPasswordReset(dni, notes);
      setMessage(res.message);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-[32px] p-7 shadow-[0_25px_60px_rgba(11,27,61,0.18)] border border-[#E8EFF6] dark:border-slate-800 bg-white dark:bg-[#1E293B] text-[#0B1B3D] dark:text-white">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8EFF6] dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0B1B3D] dark:text-white">Recuperación de Acceso</h3>
              <p className="text-xs text-[#64748B]">Protocolo Offline LAN Terminal de Ate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-slate-800 hover:text-[#0B1B3D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {message ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#EAF8F1] flex items-center justify-center text-[#10B981]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-sm text-[#0B1B3D] dark:text-white">Solicitud Recibida en Servidor</h4>
            <p className="text-xs leading-relaxed text-[#64748B]">
              {message}
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] shadow-sm transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#EBF3FE] border border-[#BFDBFE] text-xs text-[#1D68F2]">
              Por políticas de seguridad en red Wi-Fi LAN, la verificación de credenciales es <strong>asistida presencialmente</strong> por el Administrador o Supervisor.
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl text-xs font-bold bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626]">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1.5 text-[#334155] dark:text-slate-300">
                Ingresa tu DNI registrado
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  maxLength={8}
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej. 00000003"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#FAFCFF] dark:bg-slate-900 text-sm font-semibold text-[#0B1B3D] dark:text-white focus:outline-hidden focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-[#334155] dark:text-slate-300">
                Motivo o referencia (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Ej. Olvido de contraseña / Turno mañana"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#FAFCFF] dark:bg-slate-900 text-xs font-medium text-[#0B1B3D] dark:text-white focus:outline-hidden focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-[#E2E8F0] dark:border-slate-700 text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Enviando...' : 'Solicitar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
