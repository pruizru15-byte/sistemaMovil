import { useState, useEffect, type FC, type FormEvent } from 'react';
import {
  notificacionesApi,
  type NotificacionItem,
  type CreateNotificacionDto,
} from '../../../shared/services/notificaciones.api';
import { useAuth } from '../../auth/context/AuthContext';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  Calendar,
  CheckCircle2,
  Plus,
  X,
  Send,
  Filter,
  Flame,
  Clock,
} from 'lucide-react';

export const NotificacionesPage: FC = () => {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('todos');
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Modal para crear comunicado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTitulo, setFormTitulo] = useState('');
  const [formMensaje, setFormMensaje] = useState('');
  const [formTipo, setFormTipo] = useState<'info' | 'alerta' | 'incidencia' | 'turno' | 'asistencia'>('info');
  const [formTarget, setFormTarget] = useState<'todos' | 'conductor' | 'supervisor' | 'admin'>('todos');

  const canCreate = user?.role === 'admin' || user?.role === 'supervisor';

  const loadNotificaciones = async () => {
    setIsLoading(true);
    try {
      const data = await notificacionesApi.getNotificaciones();
      setNotificaciones(data.data || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      setFeedbackError('No se pudieron cargar las notificaciones.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotificaciones();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificacionesApi.markAsRead(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leido_en: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      setFeedbackError('Error al actualizar notificación.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificacionesApi.markAllAsRead();
      setNotificaciones((prev) =>
        prev.map((n) => ({ ...n, leido_en: n.leido_en || new Date().toISOString() }))
      );
      setUnreadCount(0);
      setFeedbackSuccess('Todas las notificaciones fueron marcadas como leídas.');
      setTimeout(() => setFeedbackSuccess(null), 3000);
    } catch {
      setFeedbackError('Error al marcar notificaciones.');
    }
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim() || !formMensaje.trim()) {
      setFeedbackError('Por favor complete el título y mensaje.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dto: CreateNotificacionDto = {
        titulo: formTitulo.trim(),
        mensaje: formMensaje.trim(),
        tipo: formTipo,
        role_target: formTarget,
      };
      await notificacionesApi.createNotificacion(dto);
      setFeedbackSuccess('Comunicado emitido a la red LAN correctamente.');
      setIsModalOpen(false);
      setFormTitulo('');
      setFormMensaje('');
      setFormTipo('info');
      setFormTarget('todos');
      await loadNotificaciones();
      setTimeout(() => setFeedbackSuccess(null), 4000);
    } catch {
      setFeedbackError('Error al emitir el comunicado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrado
  const filteredList = notificaciones.filter((item) => {
    if (filterType === 'unread') return !item.leido_en;
    if (filterType === 'alertas') return item.tipo === 'alerta' || item.tipo === 'incidencia';
    if (filterType === 'operaciones') return item.tipo === 'turno' || item.tipo === 'asistencia';
    if (filterType === 'info') return item.tipo === 'info';
    return true;
  });

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'alerta':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          label: 'Alerta',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          bgIcon: 'bg-amber-100',
        };
      case 'incidencia':
        return {
          icon: <Flame className="w-4 h-4 text-red-600" />,
          label: 'Incidencia',
          badgeClass: 'bg-red-50 text-red-700 border-red-200',
          bgIcon: 'bg-red-100',
        };
      case 'turno':
        return {
          icon: <Calendar className="w-4 h-4 text-indigo-600" />,
          label: 'Turno',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          bgIcon: 'bg-indigo-100',
        };
      case 'asistencia':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          label: 'Asistencia GPS',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          bgIcon: 'bg-emerald-100',
        };
      default:
        return {
          icon: <Info className="w-4 h-4 text-[#1D68F2]" />,
          label: 'Informativo',
          badgeClass: 'bg-blue-50 text-[#1D68F2] border-blue-200',
          bgIcon: 'bg-blue-100',
        };
    }
  };

  const getTargetBadge = (target: string) => {
    switch (target) {
      case 'conductor':
        return 'Conductores';
      case 'supervisor':
        return 'Supervisores';
      case 'admin':
        return 'Administradores';
      default:
        return 'Todos';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Feedback */}
      {feedbackSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackSuccess}</span>
          </div>
          <button onClick={() => setFeedbackSuccess(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {feedbackError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>{feedbackError}</span>
          </div>
          <button onClick={() => setFeedbackError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#0B1B3D] tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-[#1D68F2]" />
            Notificaciones y Avisos LAN
          </h1>
          <p className="text-xs font-medium text-[#64748B] mt-0.5">
            Comunicación operativa local e historial de alertas del sistema
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-bold text-[#334155] shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-[#1D68F2]" />
              <span>Marcar todas como leídas</span>
            </button>
          )}

          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#1D68F2] hover:bg-[#1557D6] text-xs font-bold text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Comunicado</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="p-4 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.03)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#64748B] flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          <button
            onClick={() => setFilterType('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'todos'
                ? 'bg-[#1D68F2] text-white shadow-xs'
                : 'bg-[#F8FAFD] text-[#64748B] hover:text-[#0B1B3D]'
            }`}
          >
            Todas ({notificaciones.length})
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'unread'
                ? 'bg-[#1D68F2] text-white shadow-xs'
                : 'bg-[#F8FAFD] text-[#64748B] hover:text-[#0B1B3D]'
            }`}
          >
            No leídas ({unreadCount})
          </button>
          <button
            onClick={() => setFilterType('alertas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'alertas'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-[#F8FAFD] text-[#64748B] hover:text-[#0B1B3D]'
            }`}
          >
            Alertas e incidencias
          </button>
          <button
            onClick={() => setFilterType('operaciones')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'operaciones'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-[#F8FAFD] text-[#64748B] hover:text-[#0B1B3D]'
            }`}
          >
            Turnos y asistencias
          </button>
          <button
            onClick={() => setFilterType('info')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'info'
                ? 'bg-[#1D68F2] text-white shadow-xs'
                : 'bg-[#F8FAFD] text-[#64748B] hover:text-[#0B1B3D]'
            }`}
          >
            Informativos
          </button>
        </div>

        <div className="text-[11px] font-semibold text-[#94A3B8]">
          Mostrando {filteredList.length} avisos
        </div>
      </div>

      {/* Lista de Notificaciones */}
      {isLoading ? (
        <div className="p-12 text-center rounded-[24px] bg-white border border-[#E8EFF6]">
          <div className="w-8 h-8 border-3 border-[#1D68F2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-[#64748B]">Cargando notificaciones de la red local...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-12 text-center rounded-[28px] bg-white border border-[#E8EFF6] shadow-sm">
          <div className="w-16 h-16 rounded-[22px] bg-[#E1EDFD] text-[#1D68F2] flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 opacity-70" />
          </div>
          <h3 className="text-base font-extrabold text-[#0B1B3D]">No hay notificaciones para mostrar</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
            {filterType === 'unread'
              ? '¡Excelente! Has revisado todas tus alertas y notificaciones.'
              : 'No se encontraron avisos con el filtro seleccionado.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => {
            const badge = getTipoBadge(item.tipo);
            const isUnread = !item.leido_en;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-[24px] border transition-all flex flex-col sm:flex-row items-start justify-between gap-4 ${
                  isUnread
                    ? 'bg-white border-[#BFDBFE] shadow-[0_6px_20px_rgba(29,104,242,0.06)]'
                    : 'bg-[#FBFDFE] border-[#E8EFF6] shadow-xs opacity-90'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Ícono de Tipo */}
                  <div className={`w-11 h-11 rounded-[16px] ${badge.bgIcon} flex items-center justify-center shrink-0 mt-0.5`}>
                    {badge.icon}
                  </div>

                  {/* Contenido */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.badgeClass}`}>
                        {badge.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        Para: {getTargetBadge(item.role_target)}
                      </span>
                      {isUnread && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#1D68F2] bg-blue-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1D68F2]" />
                          Nueva
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-extrabold text-[#0B1B3D] leading-snug">
                      {item.titulo}
                    </h4>

                    <p className="text-xs text-[#475569] leading-relaxed whitespace-pre-line">
                      {item.mensaje}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {item.leido_en && (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Leída
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acción individual */}
                {isUnread && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="self-end sm:self-center shrink-0 px-3.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[11px] font-bold text-[#334155] shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-[#1D68F2]" />
                    <span>Marcar leída</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          MODAL: NUEVO COMUNICADO / NOTIFICACIÓN
          ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1B3D]/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-[#E8EFF6] space-y-5">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#0B1B3D] flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#1D68F2]" />
                  Emitir Comunicado LAN
                </h3>
                <p className="text-xs text-[#64748B]">Envío de avisos operacionales a la flota en red local</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F8FAFD] hover:bg-[#E8EFF6] flex items-center justify-center text-[#64748B] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Título del comunicado *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cambio de ruta por mantenimiento vial"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#0B1B3D] focus:outline-none focus:ring-2 focus:ring-[#1D68F2]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Tipo de aviso
                  </label>
                  <select
                    value={formTipo}
                    onChange={(e) =>
                      setFormTipo(e.target.value as 'info' | 'alerta' | 'incidencia' | 'turno' | 'asistencia')
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#0B1B3D] focus:outline-none focus:ring-2 focus:ring-[#1D68F2]"
                  >
                    <option value="info">Informativo</option>
                    <option value="alerta">Alerta operativa</option>
                    <option value="incidencia">Incidencia urgente</option>
                    <option value="turno">Turnos y rutas</option>
                    <option value="asistencia">Asistencia GPS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Destinatarios
                  </label>
                  <select
                    value={formTarget}
                    onChange={(e) =>
                      setFormTarget(e.target.value as 'todos' | 'conductor' | 'supervisor' | 'admin')
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#0B1B3D] focus:outline-none focus:ring-2 focus:ring-[#1D68F2]"
                  >
                    <option value="todos">Toda la organización (Todos)</option>
                    <option value="conductor">Sólo Conductores</option>
                    <option value="supervisor">Sólo Supervisores</option>
                    <option value="admin">Sólo Administradores</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Mensaje detallado *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escriba los detalles de la indicación, horario o aviso..."
                  value={formMensaje}
                  onChange={(e) => setFormMensaje(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-medium text-[#0B1B3D] focus:outline-none focus:ring-2 focus:ring-[#1D68F2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] hover:bg-slate-50 text-xs font-bold text-[#64748B] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#1D68F2] hover:bg-[#1557D6] text-xs font-bold text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Transmitiendo...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Emitir a la Red LAN
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

