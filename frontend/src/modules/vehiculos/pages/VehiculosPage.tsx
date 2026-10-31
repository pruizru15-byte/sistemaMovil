import { useState, type FC, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiculosApi, type Vehiculo } from '../../../shared/services/vehiculos.api';
import { useAuth } from '../../auth/context/AuthContext';
import {
  Truck,
  Search,
  Plus,
  Wrench,
  Gauge,
  Users,
  ShieldCheck,
  AlertCircle,
  X,
  Bus,
  CheckCircle2,
} from 'lucide-react';

export const VehiculosPage: FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);

  const [formData, setFormData] = useState({
    numero_unidad: '',
    placa: '',
    marca: 'Mercedes-Benz',
    modelo: 'OF-1721',
    anio_fabricacion: 2023,
    capacidad_pasajeros: 45,
    estado: 'operativo',
    kilometraje: 15000,
    soat_vencimiento: '2027-12-31',
    revision_tecnica_vencimiento: '2027-11-30',
    notas: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['vehiculos', searchTerm, filterEstado],
    queryFn: () => vehiculosApi.getAll({ search: searchTerm, estado: filterEstado }),
  });

  const createMutation = useMutation({
    mutationFn: (newVeh: typeof formData) => vehiculosApi.create(newVeh),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const e = err as { message?: string };
      setFormError(e.message || 'Error al guardar vehículo.');
    },
  });

  const resetForm = () => {
    setFormData({
      numero_unidad: '',
      placa: '',
      marca: 'Mercedes-Benz',
      modelo: 'OF-1721',
      anio_fabricacion: 2023,
      capacidad_pasajeros: 45,
      estado: 'operativo',
      kilometraje: 15000,
      soat_vencimiento: '2027-12-31',
      revision_tecnica_vencimiento: '2027-11-30',
      notas: '',
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
      case 'operativo':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DEF7EC] text-[#03543F] border border-[#DEF7EC]">
            ● Operativo
          </span>
        );
      case 'en_ruta':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF3FE] text-[#1D68F2] border border-[#BFDBFE]">
            ● En ruta
          </span>
        );
      case 'mantenimiento':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            ● En taller
          </span>
        );
      case 'fuera_servicio':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
            ● Fuera de servicio
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
            Gestión de Vehículos y Flota
          </h1>
          <p className="text-xs font-medium text-[#64748B] mt-0.5">
            Control de unidades de transporte, capacidad, SOAT e inspección técnica en Terminal Ate
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'supervisor') && (
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] shadow-[0_6px_18px_rgba(29,104,242,0.25)] transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Nueva Unidad
          </button>
        )}
      </div>

      {/* ========================================================
          4 TARJETAS KPI (ESTILO MOCKUP OFICIAL)
          ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Flota Total */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B]">Flota Total</p>
              <p className="text-3xl font-extrabold text-[#0B1B3D] mt-2">
                {data?.stats.total ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-[16px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
              <Bus className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#94A3B8] mt-3">
            Unidades registradas en base
          </span>
        </div>

        {/* Operativos */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B]">Operativos</p>
              <p className="text-3xl font-extrabold text-[#10B981] mt-2">
                {data?.stats.operativos ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-[16px] bg-[#EAF8F1] text-[#10B981] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#10B981] mt-3">
            Listos para servicio
          </span>
        </div>

        {/* En Ruta */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B]">En Ruta</p>
              <p className="text-3xl font-extrabold text-[#1D68F2] mt-2">
                {data?.stats.en_ruta ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-[16px] bg-[#E8F4FE] text-[#0284C7] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#1D68F2] mt-3">
            Cubriendo servicios activos
          </span>
        </div>

        {/* En Taller */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B]">En Taller</p>
              <p className="text-3xl font-extrabold text-[#F59E0B] mt-2">
                {data?.stats.mantenimiento ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-[16px] bg-[#FEF3C7] text-[#F59E0B] flex items-center justify-center shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#F59E0B] mt-3">
            Mantenimiento preventivo
          </span>
        </div>
      </div>

      {/* ========================================================
          BARRA DE FILTROS Y BÚSQUEDA
          ======================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.03)]">
        {/* Pestañas de Estado (Pill Tabs) */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'operativo', label: 'Operativos' },
            { id: 'en_ruta', label: 'En Ruta' },
            { id: 'mantenimiento', label: 'En Taller' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterEstado(st.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterEstado === st.id
                  ? 'bg-[#1D68F2] text-white shadow-[0_4px_12px_rgba(29,104,242,0.25)]'
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B1B3D]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Buscador Estilo Pill */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa o número de unidad..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs bg-[#F8FAFD] border border-[#E2E8F0] placeholder-[#94A3B8] text-[#0F172A] focus:outline-none focus:border-[#1D68F2] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* ========================================================
          GRID DE TARJETAS DE VEHÍCULOS
          ======================================================== */}
      {isLoading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-3 border-[#1D68F2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#94A3B8] font-medium">Cargando flota de vehículos...</p>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="p-16 text-center text-[#94A3B8] bg-white rounded-[28px] border border-[#E8EFF6]">
          <Truck className="w-12 h-12 mx-auto mb-2 text-[#CBD5E1]" />
          <p className="text-sm font-bold text-[#0B1B3D]">No se encontraron vehículos</p>
          <p className="text-xs mt-1">Pruebe cambiando los términos de búsqueda o filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.data.map((veh) => (
            <div
              key={veh.id}
              className="p-6 rounded-[28px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] hover:shadow-[0_15px_30px_rgba(29,104,242,0.08)] hover:border-[#BFDBFE] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-xs font-black px-3 py-1 rounded-xl bg-[#EBF3FE] text-[#1D68F2] inline-block">
                      {veh.numero_unidad}
                    </span>
                    <h3 className="font-extrabold text-base text-[#0B1B3D] mt-2">
                      {veh.marca} {veh.modelo}
                    </h3>
                    <p className="font-mono font-bold text-xs text-[#64748B] mt-0.5">
                      Placa: {veh.placa} · Año {veh.anio_fabricacion}
                    </p>
                  </div>
                  <div>{getEstadoBadge(veh.estado)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs py-3.5 my-2 border-y border-[#F1F5F9]">
                  <div className="flex items-center gap-2 text-[#334155] font-medium">
                    <Users className="w-4 h-4 text-[#94A3B8]" />
                    <span>{veh.capacidad_pasajeros} Asientos</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#334155] font-medium">
                    <Gauge className="w-4 h-4 text-[#94A3B8]" />
                    <span>{veh.kilometraje.toLocaleString()} km</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#334155] font-medium">
                    <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                    <span className="text-[11px] truncate">SOAT: {veh.soat_vencimiento || 'Al día'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#334155] font-medium">
                    <Wrench className="w-4 h-4 text-[#1D68F2]" />
                    <span className="text-[11px] truncate">Rev.: {veh.revision_tecnica_vencimiento || 'Vigente'}</span>
                  </div>
                </div>

                {veh.notas && (
                  <p className="text-[11px] italic text-[#94A3B8] line-clamp-1 mb-2">
                    &ldquo;{veh.notas}&rdquo;
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedVehiculo(veh)}
                className="w-full mt-3 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#1D68F2] hover:bg-[#EBF3FE] hover:border-[#BFDBFE] transition-all cursor-pointer"
              >
                Ver Ficha Técnica
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          MODAL FICHA TÉCNICA
          ======================================================== */}
      {selectedVehiculo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[32px] p-7 bg-white border border-[#E8EFF6] shadow-[0_25px_60px_rgba(0,0,0,0.15)] space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[16px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
                  <Bus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0B1B3D]">{selectedVehiculo.numero_unidad}</h3>
                  <p className="text-xs font-mono font-bold text-[#64748B]">Placa: {selectedVehiculo.placa}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVehiculo(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#0B1B3D] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                <span className="font-bold text-[#64748B]">Condición de Operación:</span>
                <div>{getEstadoBadge(selectedVehiculo.estado)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                  <p className="font-bold text-[#64748B]">Marca y Modelo</p>
                  <p className="font-bold text-[#0B1B3D] mt-0.5">{selectedVehiculo.marca} {selectedVehiculo.modelo}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                  <p className="font-bold text-[#64748B]">Capacidad</p>
                  <p className="font-bold text-[#0B1B3D] mt-0.5">{selectedVehiculo.capacidad_pasajeros} pasajeros</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                  <p className="font-bold text-[#64748B]">Kilometraje</p>
                  <p className="font-bold text-[#0B1B3D] mt-0.5">{selectedVehiculo.kilometraje.toLocaleString()} km</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                  <p className="font-bold text-[#64748B]">Año Fabricación</p>
                  <p className="font-bold text-[#0B1B3D] mt-0.5">{selectedVehiculo.anio_fabricacion}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                <p className="font-bold text-[#64748B] mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" /> Documentos de Circulación MTC
                </p>
                <div className="space-y-1 text-slate-700">
                  <p className="flex justify-between"><span>Vencimiento SOAT:</span> <span className="font-bold text-[#0B1B3D]">{selectedVehiculo.soat_vencimiento || '2027-12-31'}</span></p>
                  <p className="flex justify-between"><span>Revisión Técnica:</span> <span className="font-bold text-[#0B1B3D]">{selectedVehiculo.revision_tecnica_vencimiento || '2027-11-30'}</span></p>
                </div>
              </div>

              {selectedVehiculo.notas && (
                <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                  <p className="font-bold text-[#64748B] mb-1">Notas Operativas</p>
                  <p className="text-[#334155] leading-relaxed italic">&ldquo;{selectedVehiculo.notas}&rdquo;</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedVehiculo(null)}
              className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-[#1D68F2] hover:bg-[#1557D6] shadow-[0_6px_16px_rgba(29,104,242,0.25)] transition-all cursor-pointer"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL NUEVA UNIDAD
          ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[32px] p-7 bg-white border border-[#E8EFF6] shadow-[0_25px_60px_rgba(0,0,0,0.15)] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[16px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0B1B3D]">Registrar Nueva Unidad</h3>
                  <p className="text-xs font-medium text-[#64748B]">Agrega un bus a la flota operativa de Ate</p>
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
              <div className="p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 bg-red-50 text-red-700 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Número de Unidad *</label>
                  <input
                    type="text"
                    required
                    value={formData.numero_unidad}
                    onChange={(e) => setFormData({ ...formData, numero_unidad: e.target.value })}
                    placeholder="Ej. Unidad 20"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Placa de Rodaje *</label>
                  <input
                    type="text"
                    required
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                    placeholder="Ej. ABC-120"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] font-mono text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Marca</label>
                  <input
                    type="text"
                    required
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Modelo</label>
                  <input
                    type="text"
                    required
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Año</label>
                  <input
                    type="number"
                    value={formData.anio_fabricacion}
                    onChange={(e) => setFormData({ ...formData, anio_fabricacion: parseInt(e.target.value) || 2023 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Capacidad</label>
                  <input
                    type="number"
                    value={formData.capacidad_pasajeros}
                    onChange={(e) => setFormData({ ...formData, capacidad_pasajeros: parseInt(e.target.value) || 40 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Kilometraje</label>
                  <input
                    type="number"
                    value={formData.kilometraje}
                    onChange={(e) => setFormData({ ...formData, kilometraje: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                  />
                </div>
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
                  {createMutation.isPending ? 'Guardando...' : 'Guardar Unidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
