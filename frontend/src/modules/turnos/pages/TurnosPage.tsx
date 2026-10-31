import { useState, type FC, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { turnosApi, type AsignacionTurno } from '../../../shared/services/turnos.api';
import { conductoresApi } from '../../../shared/services/conductores.api';
import { vehiculosApi } from '../../../shared/services/vehiculos.api';
import { rutasApi } from '../../../shared/services/rutas.api';
import { useAuth } from '../../auth/context/AuthContext';
import {
  Calendar,
  Clock,
  Plus,
  Bus,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
} from 'lucide-react';

export const TurnosPage: FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedFecha, setSelectedFecha] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTurnoId, setSelectedTurnoId] = useState<number | undefined>(undefined);
  const [selectedEstado, setSelectedEstado] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState<AsignacionTurno | null>(null);

  // Formulario nueva asignación
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    turno_id: 1,
    conductor_id: 1,
    vehiculo_id: 1,
    ruta_id: 1,
    observaciones: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Queries
  const { data: turnosData } = useQuery({
    queryKey: ['turnos'],
    queryFn: () => turnosApi.getTurnos(),
  });

  const { data: asignacionesData, isLoading } = useQuery({
    queryKey: ['asignaciones-turno', selectedFecha, selectedTurnoId, selectedEstado],
    queryFn: () =>
      turnosApi.getAsignaciones({
        fecha: selectedFecha || undefined,
        turno_id: selectedTurnoId,
        estado: selectedEstado === 'todos' ? undefined : selectedEstado,
      }),
  });

  const { data: conductoresData } = useQuery({
    queryKey: ['conductores-list'],
    queryFn: () => conductoresApi.getAll(),
  });

  const { data: vehiculosData } = useQuery({
    queryKey: ['vehiculos-list'],
    queryFn: () => vehiculosApi.getAll(),
  });

  const { data: rutasData } = useQuery({
    queryKey: ['rutas-list'],
    queryFn: () => rutasApi.getAll(),
  });

  // Mutaciones
  const createMutation = useMutation({
    mutationFn: (newAsig: typeof formData) => turnosApi.createAsignacion(newAsig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones-turno'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setFormError(e.response?.data?.message || e.message || 'Error al guardar asignación.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AsignacionTurno> }) =>
      turnosApi.updateAsignacion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones-turno'] });
      setSelectedAsignacion(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => turnosApi.deleteAsignacion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones-turno'] });
      setSelectedAsignacion(null);
    },
  });

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      turno_id: turnosData?.data[0]?.id || 1,
      conductor_id: conductoresData?.data[0]?.id || 1,
      vehiculo_id: vehiculosData?.data[0]?.id || 1,
      ruta_id: rutasData?.data[0]?.id || 1,
      observaciones: '',
    });
    setFormError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    createMutation.mutate(formData);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'programado':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF3FE] text-[#1D68F2] border border-[#BFDBFE]">
            ● Programado
          </span>
        );
      case 'en_curso':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] animate-pulse">
            ● En Curso
          </span>
        );
      case 'completado':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DEF7EC] text-[#03543F] border border-[#DEF7EC]">
            ● Completado
          </span>
        );
      case 'cancelado':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
            ● Cancelado
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          ENCABEZADO Y ACCIÓN
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#0B1B3D] tracking-tight">
            Turnos y Asignaciones
          </h1>
          <p className="text-xs font-medium text-[#64748B] mt-0.5">
            Programación de jornadas, vinculación conductor-vehículo y control operativo en Terminal Ate
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'supervisor') && (
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] shadow-[0_6px_18px_rgba(29,104,242,0.25)] transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Nueva Asignación
          </button>
        )}
      </div>

      {/* ========================================================
          4 TARJETAS KPI (ESTILO MOCKUP OFICIAL)
          ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Asignaciones */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B]">Total Asignaciones</p>
              <p className="text-3xl font-extrabold text-[#0B1B3D] mt-2">
                {asignacionesData?.summary.total ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-[16px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#1D68F2] mt-3">
            Jornada seleccionada
          </span>
        </div>

        {/* Programados */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B]">Programados</p>
              <p className="text-3xl font-extrabold text-[#0284C7] mt-2">
                {asignacionesData?.summary.programados ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-[16px] bg-[#E8F4FE] text-[#0284C7] flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#64748B] mt-3">
            Listos para salida
          </span>
        </div>

        {/* En Curso */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B]">En Curso</p>
              <p className="text-3xl font-extrabold text-[#F59E0B] mt-2">
                {asignacionesData?.summary.en_curso ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-[16px] bg-[#FEF3C7] text-[#F59E0B] flex items-center justify-center shrink-0">
              <Bus className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#F59E0B] mt-3">
            Operando en ruta
          </span>
        </div>

        {/* Completados */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B]">Completados</p>
              <p className="text-3xl font-extrabold text-[#10B981] mt-2">
                {asignacionesData?.summary.completados ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-[16px] bg-[#EAF8F1] text-[#10B981] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#10B981] mt-3">
            Jornada concluida
          </span>
        </div>
      </div>

      {/* ========================================================
          BARRA DE FILTROS Y BÚSQUEDA
          ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.03)]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Fecha */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8FAFD] border border-[#E2E8F0]">
            <Calendar className="w-4 h-4 text-[#1D68F2]" />
            <input
              type="date"
              value={selectedFecha}
              onChange={(e) => setSelectedFecha(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#0B1B3D] focus:outline-none cursor-pointer"
            />
          </div>

          {/* Turno */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8FAFD] border border-[#E2E8F0]">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={selectedTurnoId ?? ''}
              onChange={(e) => setSelectedTurnoId(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-transparent text-xs font-bold text-[#0B1B3D] focus:outline-none cursor-pointer"
            >
              <option value="">Todos los turnos</option>
              {turnosData?.data.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} ({t.hora_inicio.slice(0, 5)} - {t.hora_fin.slice(0, 5)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pestañas de Estado (Pill Tabs) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['todos', 'programado', 'en_curso', 'completado', 'cancelado'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedEstado(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer ${
                selectedEstado === st
                  ? 'bg-[#1D68F2] text-white shadow-[0_4px_12px_rgba(29,104,242,0.25)]'
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B1B3D]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================
          GRID DE ASIGNACIONES (TARJETAS BLANCAS 28px)
          ======================================================== */}
      {isLoading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-3 border-[#1D68F2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#94A3B8] font-medium">Cargando asignaciones del turno...</p>
        </div>
      ) : !asignacionesData?.data || asignacionesData.data.length === 0 ? (
        <div className="p-16 text-center text-[#94A3B8] bg-white rounded-[28px] border border-[#E8EFF6]">
          <Calendar className="w-12 h-12 mx-auto mb-2 text-[#CBD5E1]" />
          <p className="text-sm font-bold text-[#0B1B3D]">No hay asignaciones para esta fecha</p>
          <p className="text-xs mt-1">Seleccione otra fecha o cree una nueva asignación de turno.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {asignacionesData.data.map((asig) => (
            <div
              key={asig.id}
              onClick={() => setSelectedAsignacion(asig)}
              className="p-6 rounded-[28px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] hover:shadow-[0_15px_30px_rgba(29,104,242,0.08)] hover:border-[#BFDBFE] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-2xs"
                      style={{ backgroundColor: asig.ruta?.color || '#1D68F2' }}
                    />
                    <span className="text-xs font-black uppercase tracking-wider text-[#0B1B3D]">
                      {asig.ruta?.codigo_ruta || 'RUTA'}
                    </span>
                  </div>
                  {getEstadoBadge(asig.estado)}
                </div>

                <h3 className="text-base font-extrabold text-[#0B1B3D] mb-1">
                  {asig.ruta?.nombre || 'Ruta sin nombre'}
                </h3>
                <p className="text-xs text-[#64748B] font-medium mb-4 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1D68F2]" />
                  {asig.ruta?.origen} → {asig.ruta?.destino}
                </p>

                <div className="space-y-2.5 pt-3.5 border-t border-[#F1F5F9] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#64748B]">
                      <User className="w-4 h-4 text-[#94A3B8]" /> Conductor:
                    </span>
                    <span className="font-extrabold text-[#0B1B3D]">
                      {asig.conductor?.user.name} {asig.conductor?.user.last_name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#64748B]">
                      <Bus className="w-4 h-4 text-[#94A3B8]" /> Vehículo:
                    </span>
                    <span className="font-mono font-bold text-[#0B1B3D]">
                      {asig.vehiculo?.placa} ({asig.vehiculo?.modelo})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#64748B]">
                      <Clock className="w-4 h-4 text-[#94A3B8]" /> Turno:
                    </span>
                    <span className="font-bold text-[#1D68F2]">
                      {asig.turno?.nombre} ({asig.turno?.hora_inicio.slice(0, 5)} - {asig.turno?.hora_fin.slice(0, 5)})
                    </span>
                  </div>
                </div>
              </div>

              {asig.observaciones && (
                <div className="mt-4 p-3 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6] text-[11px] text-[#64748B] italic">
                  &ldquo;{asig.observaciones}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          MODAL NUEVA ASIGNACIÓN
          ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[32px] p-7 bg-white border border-[#E8EFF6] shadow-[0_25px_60px_rgba(0,0,0,0.15)] overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[16px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#0B1B3D]">Programar Asignación de Turno</h2>
                  <p className="text-xs font-medium text-[#64748B]">Asigne chofer y bus a una ruta de Terminal Ate</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#0B1B3D] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 bg-red-50 text-red-700 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1E293B] mb-1.5">Fecha de Operación *</label>
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1E293B] mb-1.5">Turno Rotativo *</label>
                <select
                  required
                  value={formData.turno_id}
                  onChange={(e) => setFormData({ ...formData, turno_id: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                >
                  {turnosData?.data.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} ({t.hora_inicio.slice(0, 5)} - {t.hora_fin.slice(0, 5)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1E293B] mb-1.5">Ruta Operativa *</label>
                <select
                  required
                  value={formData.ruta_id}
                  onChange={(e) => setFormData({ ...formData, ruta_id: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                >
                  {rutasData?.data.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.codigo_ruta} - {r.nombre} ({r.distancia_km} km)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1E293B] mb-1.5">Conductor Asignado *</label>
                <select
                  required
                  value={formData.conductor_id}
                  onChange={(e) => setFormData({ ...formData, conductor_id: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                >
                  {conductoresData?.data.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.user.name} {c.user.last_name} (Lic: {c.licencia_conducir})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1E293B] mb-1.5">Vehículo / Unidad Asignada *</label>
                <select
                  required
                  value={formData.vehiculo_id}
                  onChange={(e) => setFormData({ ...formData, vehiculo_id: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                >
                  {vehiculosData?.data.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.placa} - {v.marca} {v.modelo} (Cap: {v.capacidad_pasajeros} pas.)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1E293B] mb-1.5">Observaciones</label>
                <textarea
                  rows={2}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Ej. Salida puntual desde terminal puerta 2..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-[#E2E8F0] font-bold text-xs text-[#475569] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-3 rounded-2xl text-white font-bold text-xs bg-[#1D68F2] hover:bg-[#1557D6] shadow-[0_6px_16px_rgba(29,104,242,0.25)] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {createMutation.isPending ? 'Guardando...' : 'Crear Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL DETALLE ASIGNACIÓN
          ======================================================== */}
      {selectedAsignacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[32px] p-7 bg-white border border-[#E8EFF6] shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
              <div>
                <h3 className="font-extrabold text-base text-[#0B1B3D]">
                  Asignación #{selectedAsignacion.id}
                </h3>
                <p className="text-xs font-medium text-[#64748B]">Fecha: {selectedAsignacion.fecha}</p>
              </div>
              <button
                onClick={() => setSelectedAsignacion(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#0B1B3D] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                <span className="font-bold text-[#64748B]">Estado:</span>
                <div>{getEstadoBadge(selectedAsignacion.estado)}</div>
              </div>

              <div className="flex justify-between p-3 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                <span className="font-bold text-[#64748B]">Ruta:</span>
                <span className="font-bold text-[#0B1B3D]">{selectedAsignacion.ruta?.codigo_ruta} - {selectedAsignacion.ruta?.nombre}</span>
              </div>

              <div className="flex justify-between p-3 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                <span className="font-bold text-[#64748B]">Turno:</span>
                <span className="font-bold text-[#1D68F2]">{selectedAsignacion.turno?.nombre} ({selectedAsignacion.turno?.hora_inicio.slice(0, 5)} - {selectedAsignacion.turno?.hora_fin.slice(0, 5)})</span>
              </div>

              <div className="flex justify-between p-3 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                <span className="font-bold text-[#64748B]">Conductor:</span>
                <span className="font-bold text-[#0B1B3D]">{selectedAsignacion.conductor?.user.name} {selectedAsignacion.conductor?.user.last_name}</span>
              </div>

              <div className="flex justify-between p-3 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                <span className="font-bold text-[#64748B]">Unidad / Placa:</span>
                <span className="font-mono font-bold text-[#0B1B3D]">{selectedAsignacion.vehiculo?.placa}</span>
              </div>
            </div>

            {(user?.role === 'admin' || user?.role === 'supervisor') && (
              <div className="mt-6 flex items-center justify-between gap-2 pt-4 border-t border-[#F1F5F9]">
                <button
                  onClick={() => deleteMutation.mutate(selectedAsignacion.id)}
                  className="px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-colors cursor-pointer"
                >
                  Cancelar Turno
                </button>

                <div className="flex items-center gap-2">
                  {selectedAsignacion.estado === 'programado' && (
                    <button
                      onClick={() => updateMutation.mutate({ id: selectedAsignacion.id, data: { estado: 'en_curso' } })}
                      className="px-4 py-2.5 text-xs font-bold bg-[#F59E0B] text-white rounded-2xl shadow-sm hover:bg-[#D97706] cursor-pointer"
                    >
                      Marcar En Curso
                    </button>
                  )}
                  {selectedAsignacion.estado === 'en_curso' && (
                    <button
                      onClick={() => updateMutation.mutate({ id: selectedAsignacion.id, data: { estado: 'completado' } })}
                      className="px-4 py-2.5 text-xs font-bold bg-[#10B981] text-white rounded-2xl shadow-sm hover:bg-[#059669] cursor-pointer"
                    >
                      Marcar Completado
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
