import { useState, type FC, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conductoresApi, type Conductor } from '../../../shared/services/conductores.api';
import { useAuth } from '../../auth/context/AuthContext';
import {
  Users,
  Search,
  Plus,
  Phone,
  AlertCircle,
  X,
  UserCheck,
  CheckCircle2,
  Clock,
  Shield,
  Award,
} from 'lucide-react';

export const ConductoresPage: FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConductor, setSelectedConductor] = useState<Conductor | null>(null);

  // Formulario nuevo conductor
  const [formData, setFormData] = useState({
    dni: '',
    name: '',
    last_name: '',
    phone: '',
    address: '',
    licencia_conducir: '',
    categoria_licencia: 'A-IIIa',
    licencia_vencimiento: '2028-12-31',
    experiencia_anos: 5,
    estado_operativo: 'disponible',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    notas: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['conductores', searchTerm, filterEstado],
    queryFn: () => conductoresApi.getAll({ search: searchTerm, estado: filterEstado }),
  });

  const createMutation = useMutation({
    mutationFn: (newCond: typeof formData) => conductoresApi.create(newCond),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const e = err as { message?: string };
      setFormError(e.message || 'Error al guardar conductor.');
    },
  });

  const resetForm = () => {
    setFormData({
      dni: '',
      name: '',
      last_name: '',
      phone: '',
      address: '',
      licencia_conducir: '',
      categoria_licencia: 'A-IIIa',
      licencia_vencimiento: '2028-12-31',
      experiencia_anos: 5,
      estado_operativo: 'disponible',
      contacto_emergencia_nombre: '',
      contacto_emergencia_telefono: '',
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
      case 'disponible':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DEF7EC] text-[#03543F] border border-[#DEF7EC]">
            ● Disponible
          </span>
        );
      case 'en_servicio':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF3FE] text-[#1D68F2] border border-[#BFDBFE]">
            ● En servicio
          </span>
        );
      case 'descanso':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            ● Descanso
          </span>
        );
      case 'suspendido':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
            ● Suspendido
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
            Gestión de Conductores
          </h1>
          <p className="text-xs font-medium text-[#64748B] mt-0.5">
            Fichas del personal operativo, licencias MTC y condición de servicio en Terminal Ate
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'supervisor') && (
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] shadow-[0_6px_18px_rgba(29,104,242,0.25)] transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Nuevo Conductor
          </button>
        )}
      </div>

      {/* ========================================================
          4 TARJETAS KPI (ESTILO MOCKUP OFICIAL)
          ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Conductores */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B]">Total Registrados</p>
              <p className="text-3xl font-extrabold text-[#0B1B3D] mt-2">
                {data?.stats.total ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-[16px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#94A3B8] mt-3">
            Nómina activa en base
          </span>
        </div>

        {/* Disponibles */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B]">Disponibles</p>
              <p className="text-3xl font-extrabold text-[#10B981] mt-2">
                {data?.stats.disponibles ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-[16px] bg-[#EAF8F1] text-[#10B981] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#10B981] mt-3">
            Listos para asignación
          </span>
        </div>

        {/* En Servicio */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B]">En Servicio</p>
              <p className="text-3xl font-extrabold text-[#1D68F2] mt-2">
                {data?.stats.en_servicio ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-[16px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#1D68F2] mt-3">
            Operando en ruta
          </span>
        </div>

        {/* En Descanso */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B]">En Descanso</p>
              <p className="text-3xl font-extrabold text-[#F59E0B] mt-2">
                {data?.stats.descanso ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-[16px] bg-[#FEF3C7] text-[#F59E0B] flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#F59E0B] mt-3">
            Jornada libre o pausa
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
            { id: 'disponible', label: 'Disponibles' },
            { id: 'en_servicio', label: 'En Servicio' },
            { id: 'descanso', label: 'En Descanso' },
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
            placeholder="Buscar por DNI, nombre o brevete..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs bg-[#F8FAFD] border border-[#E2E8F0] placeholder-[#94A3B8] text-[#0F172A] focus:outline-none focus:border-[#1D68F2] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* ========================================================
          TABLA DE CONDUCTORES (TARJETA BLANCA CON ESQUINAS 28px)
          ======================================================== */}
      <div className="rounded-[28px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)] overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-3 border-[#1D68F2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#94A3B8] font-medium">Cargando nómina de conductores...</p>
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="p-16 text-center text-[#94A3B8]">
            <Users className="w-12 h-12 mx-auto mb-2 text-[#CBD5E1]" />
            <p className="text-sm font-bold text-[#0B1B3D]">No se encontraron conductores</p>
            <p className="text-xs mt-1">Pruebe cambiando los términos de búsqueda o filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F1F5F9] text-[#64748B] font-bold">
                  <th className="px-6 py-4">Conductor</th>
                  <th className="px-6 py-4">DNI</th>
                  <th className="px-6 py-4">Brevete MTC</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Condición</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFD]">
                {data.data.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8FAFD] transition-colors">
                    {/* Conductor */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#EBF3FE] text-[#1D68F2] font-black flex items-center justify-center shrink-0 shadow-2xs">
                          {c.user.name[0]}
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-[#0B1B3D]">
                            {c.user.name} {c.user.last_name}
                          </p>
                          <p className="text-[11px] font-medium text-[#94A3B8]">
                            {c.experiencia_anos} años de experiencia
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* DNI */}
                    <td className="px-6 py-4 font-mono font-bold text-[#0F172A]">
                      {c.user.dni}
                    </td>

                    {/* Brevete */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-bold font-mono text-xs text-[#0B1B3D]">
                          {c.licencia_conducir}
                        </p>
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-[#EDF2F7] text-[#475569] font-bold">
                          Cat. {c.categoria_licencia}
                        </span>
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1.5 font-semibold text-[#334155]">
                          <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />
                          {c.user.phone || 'Sin teléfono'}
                        </p>
                        <p className="text-[11px] text-[#94A3B8] truncate max-w-[180px]">
                          {c.user.address || 'Ate, Lima'}
                        </p>
                      </div>
                    </td>

                    {/* Condición */}
                    <td className="px-6 py-4">
                      {getEstadoBadge(c.estado_operativo)}
                    </td>

                    {/* Acción */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedConductor(c)}
                        className="px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#1D68F2] hover:bg-[#EBF3FE] hover:border-[#BFDBFE] transition-all cursor-pointer"
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL DETALLE DE FICHA (ESTILO GLASSMORPHISM FLOTANTE)
          ======================================================== */}
      {selectedConductor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[32px] p-7 bg-white border border-[#E8EFF6] shadow-[0_25px_60px_rgba(0,0,0,0.15)] space-y-5 animate-scaleUp">
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-[18px] bg-[#1D68F2] text-white flex items-center justify-center shadow-[0_6px_16px_rgba(29,104,242,0.3)] shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0B1B3D]">
                    {selectedConductor.user.name} {selectedConductor.user.last_name}
                  </h3>
                  <p className="text-xs font-mono font-medium text-[#64748B]">
                    DNI: {selectedConductor.user.dni}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConductor(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#0B1B3D] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ficha de Detalles */}
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                <p className="font-bold text-[#64748B] mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#1D68F2]" /> Licencia de Conducir
                </p>
                <p className="font-extrabold text-sm font-mono text-[#0B1B3D]">
                  {selectedConductor.licencia_conducir}
                </p>
                <p className="font-semibold text-[#334155] mt-1">
                  Categoría: {selectedConductor.categoria_licencia}
                </p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Vence: {selectedConductor.licencia_vencimiento || '2028-12-31'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                <p className="font-bold text-[#64748B] mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#10B981]" /> Condición Operativa
                </p>
                <div className="my-1.5">{getEstadoBadge(selectedConductor.estado_operativo)}</div>
                <p className="font-semibold text-[#334155] mt-1">
                  Experiencia: {selectedConductor.experiencia_anos} años
                </p>
              </div>

              <div className="col-span-2 p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                <p className="font-bold text-[#64748B] mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#F59E0B]" /> Contacto de Emergencia
                </p>
                <p className="font-bold text-[#0B1B3D]">
                  {selectedConductor.contacto_emergencia_nombre || 'No registrado'}
                </p>
                <p className="text-[#64748B] mt-0.5">
                  Tel: {selectedConductor.contacto_emergencia_telefono || 'Sin teléfono asignado'}
                </p>
              </div>

              {selectedConductor.notas && (
                <div className="col-span-2 p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6]">
                  <p className="font-bold text-[#64748B] mb-1">Notas Operativas</p>
                  <p className="text-[#334155] leading-relaxed italic">
                    &ldquo;{selectedConductor.notas}&rdquo;
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedConductor(null)}
              className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-[#1D68F2] hover:bg-[#1557D6] shadow-[0_6px_16px_rgba(29,104,242,0.25)] transition-all cursor-pointer"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL REGISTRO NUEVO CONDUCTOR
          ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[32px] p-7 bg-white border border-[#E8EFF6] shadow-[0_25px_60px_rgba(0,0,0,0.15)] space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[16px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0B1B3D]">
                    Registrar Nuevo Conductor
                  </h3>
                  <p className="text-xs font-medium text-[#64748B]">
                    Crea el usuario y la ficha operativa MTC
                  </p>
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
                  <label className="block font-bold text-[#1E293B] mb-1.5">DNI *</label>
                  <input
                    type="text"
                    maxLength={8}
                    required
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })}
                    placeholder="8 dígitos"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] font-mono text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Teléfono</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ej. 987654321"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Juan Carlos"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Ej. Pérez Mendoza"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Brevete MTC *</label>
                  <input
                    type="text"
                    required
                    value={formData.licencia_conducir}
                    onChange={(e) => setFormData({ ...formData, licencia_conducir: e.target.value.toUpperCase() })}
                    placeholder="Ej. Q12345678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] font-mono text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Categoría MTC</label>
                  <select
                    value={formData.categoria_licencia}
                    onChange={(e) => setFormData({ ...formData, categoria_licencia: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                  >
                    <option value="A-IIb">A-IIb (Urbano)</option>
                    <option value="A-IIIa">A-IIIa (Interurbano / Buses)</option>
                    <option value="A-IIIb">A-IIIb (Pesado)</option>
                    <option value="A-IIIc">A-IIIc (Especial Flota)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Condición Operativa</label>
                  <select
                    value={formData.estado_operativo}
                    onChange={(e) => setFormData({ ...formData, estado_operativo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10 capitalize"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="en_servicio">En servicio</option>
                    <option value="descanso">Descanso</option>
                    <option value="vacaciones">Vacaciones</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1.5">Años de Experiencia</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.experiencia_anos}
                    onChange={(e) => setFormData({ ...formData, experiencia_anos: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] bg-[#FAFCFF] focus:bg-white focus:outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/10"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E293B] mb-1.5">Dirección de Domicilio</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ej. Av. Nicolás Ayllón 1234, Ate Vitarte"
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
                  {createMutation.isPending ? 'Guardando...' : 'Guardar Conductor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
