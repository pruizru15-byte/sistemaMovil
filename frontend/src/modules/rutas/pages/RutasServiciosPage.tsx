import { useState, type FC, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rutasApi, type Ruta } from '../../../shared/services/rutas.api';
import { serviciosApi, type Incidencia, type TipoIncidencia, type PrioridadIncidencia } from '../../../shared/services/servicios.api';
import { conductoresApi } from '../../../shared/services/conductores.api';
import { vehiculosApi } from '../../../shared/services/vehiculos.api';
import { useAuth } from '../../auth/context/AuthContext';
import {
  Route as RouteIcon,
  Navigation,
  Bus,
  AlertTriangle,
  Users,
  Plus,
  Clock,
  MapPin,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';

export const RutasServiciosPage: FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'rutas' | 'alertas' | 'servicios'>('rutas');
  const [isNewRutaModalOpen, setIsNewRutaModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedRuta, setSelectedRuta] = useState<Ruta | null>(null);

  // Formulario nueva ruta
  const [rutaForm, setRutaForm] = useState({
    codigo_ruta: '',
    nombre: '',
    origen: 'Terminal de Ate',
    destino: '',
    distancia_km: 18.5,
    tiempo_estimado_minutos: 45,
    color: '#1D68F2',
    is_active: true,
  });

  // Formulario nueva incidencia / alerta
  const [alertForm, setAlertForm] = useState({
    conductor_id: 1,
    vehiculo_id: 1,
    ruta_id: 1,
    tipo: 'mecanica' as TipoIncidencia,
    prioridad: 'alta' as PrioridadIncidencia,
    titulo: '',
    descripcion: '',
    ubicacion_referencia: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Queries
  const { data: rutasData, isLoading: isLoadingRutas } = useQuery({
    queryKey: ['rutas'],
    queryFn: () => rutasApi.getAll(),
  });

  const { data: serviciosData } = useQuery({
    queryKey: ['servicios'],
    queryFn: () => serviciosApi.getAll(),
  });

  const { data: incidenciasData } = useQuery({
    queryKey: ['incidencias'],
    queryFn: () => serviciosApi.getIncidencias(),
  });

  const { data: conductoresData } = useQuery({
    queryKey: ['conductores-list'],
    queryFn: () => conductoresApi.getAll(),
  });

  const { data: vehiculosData } = useQuery({
    queryKey: ['vehiculos-list'],
    queryFn: () => vehiculosApi.getAll(),
  });

  // Mutaciones
  const createRutaMutation = useMutation({
    mutationFn: (newRuta: typeof rutaForm) => rutasApi.create(newRuta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rutas'] });
      setIsNewRutaModalOpen(false);
      setFormError(null);
    },
    onError: (err: unknown) => {
      const e = err as { message?: string };
      setFormError(e.message || 'Error al guardar ruta.');
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: (newAlert: typeof alertForm) => serviciosApi.crearIncidencia(newAlert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidencias'] });
      setIsAlertModalOpen(false);
      setFormError(null);
    },
    onError: (err: unknown) => {
      const e = err as { message?: string };
      setFormError(e.message || 'Error al reportar alerta.');
    },
  });

  const atenderAlertMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: 'en_atencion' | 'resuelta' }) =>
      serviciosApi.atenderIncidencia(id, { estado }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidencias'] });
    },
  });

  const handleRutaSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    createRutaMutation.mutate(rutaForm);
  };

  const handleAlertSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    createAlertMutation.mutate(alertForm);
  };

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'critica':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#FEE2E2] text-[#DC2626] animate-pulse">
            Crítica
          </span>
        );
      case 'alta':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#FEF3C7] text-[#D97706]">
            Alta
          </span>
        );
      case 'media':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#EBF3FE] text-[#1D68F2]">
            Media
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#F1F5F9] text-[#64748B]">
            Baja
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B1B3D] tracking-tight">
            Panel de Control de Transporte
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Monitoreo en vivo de rutas, servicios en tránsito y alertas operativas de flota LAN
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormError(null);
              setIsAlertModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#DC2626] bg-[#FEE2E2] hover:bg-[#FCDAD7] border border-[#FECACA] shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            Reportar Alerta
          </button>

          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <button
              onClick={() => {
                setFormError(null);
                setIsNewRutaModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nueva Ruta
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards: Squircle Icons & Clean Mockup Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Unidades en Ruta */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Unidades en Ruta</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center">
              <Bus className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B1B3D]">{serviciosData?.summary.en_ruta ?? 0}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#10B981]">Operando actualmente</span>
          </div>
        </div>

        {/* KPI 2: Rutas Activas */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Rutas Activas</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#EAF8F1] text-[#10B981] flex items-center justify-center">
              <RouteIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B1B3D]">{rutasData?.summary.activas ?? 0}</p>
          <p className="text-[11px] font-semibold text-[#64748B] mt-2">
            De <strong className="text-[#0B1B3D]">{rutasData?.summary.total ?? 0}</strong> corredores registrados
          </p>
        </div>

        {/* KPI 3: Alertas Abiertas */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Alertas Operativas</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#DC2626]">{incidenciasData?.summary.abiertas ?? 0}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`w-2 h-2 rounded-full ${(incidenciasData?.summary.abiertas ?? 0) > 0 ? 'bg-[#EF4444] animate-ping' : 'bg-[#10B981]'}`} />
            <span className={`text-[11px] font-semibold ${(incidenciasData?.summary.abiertas ?? 0) > 0 ? 'text-[#DC2626]' : 'text-[#10B981]'}`}>
              {(incidenciasData?.summary.abiertas ?? 0) > 0 ? 'Requieren intervención' : 'Flota sin novedades'}
            </span>
          </div>
        </div>

        {/* KPI 4: Pasajeros Hoy */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Aforo Estimado</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#F3ECFD] text-[#8B5CF6] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B1B3D]">
            {serviciosData?.data.reduce((sum, s) => sum + (s.pasajeros_transportados || 0), 0) ?? 0}
          </p>
          <p className="text-[11px] font-semibold text-[#64748B] mt-2">
            Pasajeros trasladados hoy
          </p>
        </div>
      </div>

      {/* Selector de Pestañas Tipo Píldora (Mockup Style) */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-[#E8EFF6] rounded-full w-fit shadow-xs">
        <button
          onClick={() => setActiveTab('rutas')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'rutas'
              ? 'bg-[#1D68F2] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1B3D] hover:bg-[#F1F5F9]'
          }`}
        >
          <RouteIcon className="w-4 h-4" />
          Rutas de Transporte ({rutasData?.data.length ?? 0})
        </button>

        <button
          onClick={() => setActiveTab('alertas')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'alertas'
              ? 'bg-[#DC2626] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1B3D] hover:bg-[#F1F5F9]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Alertas e Incidencias ({incidenciasData?.summary.abiertas ?? 0})
        </button>

        <button
          onClick={() => setActiveTab('servicios')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'servicios'
              ? 'bg-[#1D68F2] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1B3D] hover:bg-[#F1F5F9]'
          }`}
        >
          <Bus className="w-4 h-4" />
          Servicios en Tránsito ({serviciosData?.summary.en_ruta ?? 0})
        </button>
      </div>

      {/* Pestaña 1: Rutas de Transporte */}
      {activeTab === 'rutas' && (
        <div className="space-y-4">
          {isLoadingRutas ? (
            <div className="text-center py-16 bg-white rounded-[28px] border border-[#E8EFF6]">
              <div className="w-9 h-9 border-3 border-[#1D68F2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-[#64748B]">Cargando red de rutas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rutasData?.data.map((ruta) => (
                <div
                  key={ruta.id}
                  onClick={() => setSelectedRuta(ruta)}
                  className="p-6 rounded-[28px] bg-white border border-[#E8EFF6] hover:border-[#BFDBFE] hover:shadow-[0_12px_32px_rgba(29,104,242,0.08)] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Header de la tarjeta */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-xs"
                          style={{ backgroundColor: ruta.color || '#1D68F2' }}
                        />
                        <span className="text-xs font-black tracking-wider uppercase text-[#0B1B3D] font-mono bg-[#F8FAFC] px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
                          {ruta.codigo_ruta}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          ruta.is_active
                            ? 'bg-[#DEF7EC] text-[#03543F]'
                            : 'bg-[#F1F5F9] text-[#64748B]'
                        }`}
                      >
                        {ruta.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#0B1B3D] group-hover:text-[#1D68F2] transition-colors mb-3">
                      {ruta.nombre}
                    </h3>

                    {/* Origen y Destino */}
                    <div className="space-y-2.5 text-xs text-[#64748B] mb-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">
                          <strong className="text-[#0B1B3D]">Origen:</strong> {ruta.origen}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#EAF8F1] text-[#10B981] flex items-center justify-center shrink-0">
                          <Navigation className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">
                          <strong className="text-[#0B1B3D]">Destino:</strong> {ruta.destino}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pie de Métricas de Ruta */}
                  <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-[#64748B]">
                      <RouteIcon className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>{ruta.distancia_km} km</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#64748B]">
                      <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>{ruta.tiempo_estimado_minutos} min</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#1D68F2] font-bold bg-[#EBF3FE] px-2.5 py-1 rounded-full">
                      <Bus className="w-3.5 h-3.5" />
                      <span>{ruta.servicios_activos_count ?? 0} buses</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pestaña 2: Alertas Operativas en Vivo */}
      {activeTab === 'alertas' && (
        <div className="space-y-3.5">
          {!incidenciasData?.data || incidenciasData.data.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[28px] border border-[#E8EFF6]">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#EAF8F1] text-[#10B981] flex items-center justify-center mb-3">
                <CheckCircle className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-[#0B1B3D]">No hay incidentes reportados</p>
              <p className="text-xs text-[#64748B] mt-1">Todas las unidades operan con normalidad en ruta.</p>
            </div>
          ) : (
            incidenciasData.data.map((alert: Incidencia) => (
              <div
                key={alert.id}
                className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {getPrioridadBadge(alert.prioridad)}
                    <span className="text-xs font-bold uppercase text-[#64748B] tracking-wider">
                      {alert.tipo} • {new Date(alert.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        alert.estado === 'abierta'
                          ? 'bg-[#FEE2E2] text-[#DC2626]'
                          : alert.estado === 'en_atencion'
                          ? 'bg-[#FEF3C7] text-[#D97706]'
                          : 'bg-[#DEF7EC] text-[#03543F]'
                      }`}
                    >
                      {alert.estado === 'abierta'
                        ? 'Abierta'
                        : alert.estado === 'en_atencion'
                        ? 'En Atención'
                        : 'Resuelta'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#0B1B3D]">{alert.titulo}</h4>
                  <p className="text-xs text-[#64748B]">{alert.descripcion}</p>

                  <div className="flex flex-wrap items-center gap-4 pt-1.5 text-xs text-[#64748B]">
                    {alert.ruta && (
                      <span className="flex items-center gap-1.5 font-bold text-[#1D68F2]">
                        <RouteIcon className="w-3.5 h-3.5" /> {alert.ruta.codigo_ruta} - {alert.ruta.nombre}
                      </span>
                    )}
                    {alert.vehiculo && (
                      <span className="flex items-center gap-1.5 font-mono font-bold text-[#0B1B3D] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
                        <Bus className="w-3.5 h-3.5 text-[#64748B]" /> {alert.vehiculo.placa}
                      </span>
                    )}
                    {alert.ubicacion_referencia && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#10B981]" /> {alert.ubicacion_referencia}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {alert.estado === 'abierta' && (
                    <button
                      onClick={() => atenderAlertMutation.mutate({ id: alert.id, estado: 'en_atencion' })}
                      className="px-4 py-2 text-xs font-bold bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      Tomar Caso
                    </button>
                  )}
                  {alert.estado === 'en_atencion' && (
                    <button
                      onClick={() => atenderAlertMutation.mutate({ id: alert.id, estado: 'resuelta' })}
                      className="px-4 py-2 text-xs font-bold bg-[#10B981] hover:bg-[#059669] text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      Marcar Resuelta
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pestaña 3: Servicios en Tránsito */}
      {activeTab === 'servicios' && (
        <div className="space-y-3.5">
          {!serviciosData?.data || serviciosData.data.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[28px] border border-[#E8EFF6]">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center mb-3">
                <Bus className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-[#0B1B3D]">No hay unidades en servicio en este momento</p>
              <p className="text-xs text-[#64748B] mt-1">Los conductores asignados aparecerán al iniciar su recorrido.</p>
            </div>
          ) : (
            serviciosData.data.map((serv) => (
              <div
                key={serv.id}
                className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#EBF3FE] text-[#1D68F2]">
                      {serv.estado === 'en_ruta' ? 'En Tránsito' : serv.estado}
                    </span>
                    <span className="text-xs font-bold text-[#1D68F2]">
                      {serv.ruta?.codigo_ruta} - {serv.ruta?.nombre}
                    </span>
                  </div>

                  <p className="text-xs text-[#64748B]">
                    Conductor:{' '}
                    <strong className="text-[#0B1B3D]">
                      {serv.conductor?.user.name} {serv.conductor?.user.last_name}
                    </strong>{' '}
                    • Unidad:{' '}
                    <strong className="font-mono text-[#0B1B3D] bg-[#F1F5F9] px-2 py-0.5 rounded">
                      {serv.vehiculo?.placa}
                    </strong>{' '}
                    ({serv.vehiculo?.marca})
                  </p>

                  <div className="flex items-center gap-5 mt-2.5 text-xs text-[#94A3B8]">
                    <span>
                      Inicio: <strong className="text-[#0B1B3D]">{new Date(serv.hora_inicio_real).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                    </span>
                    <span>
                      Km Inicial: <strong className="text-[#0B1B3D]">{serv.km_inicio}</strong>
                    </span>
                    {serv.pasajeros_transportados !== null && (
                      <span className="text-[#10B981] font-semibold">
                        Pasajeros: {serv.pasajeros_transportados}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Registrar Nueva Ruta */}
      {isNewRutaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-[32px] border border-[#E8EFF6] bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8EFF6]">
              <div>
                <h2 className="text-lg font-bold text-[#0B1B3D]">Registrar Nueva Ruta Operativa</h2>
                <p className="text-xs text-[#64748B]">Defina el corredor vial, terminales y tiempos de tránsito</p>
              </div>
              <button
                onClick={() => setIsNewRutaModalOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0B1B3D] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3.5 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] flex items-center gap-2 text-xs font-bold text-[#DC2626]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRutaSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                    Código de Ruta
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: RUTA-06"
                    value={rutaForm.codigo_ruta}
                    onChange={(e) => setRutaForm({ ...rutaForm, codigo_ruta: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs uppercase font-mono font-bold text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                    Nombre Descriptivo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Ate - San Isidro Express"
                    value={rutaForm.nombre}
                    onChange={(e) => setRutaForm({ ...rutaForm, nombre: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                    Origen
                  </label>
                  <input
                    type="text"
                    required
                    value={rutaForm.origen}
                    onChange={(e) => setRutaForm({ ...rutaForm, origen: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                    Destino
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Av. Javier Prado / La Marina"
                    value={rutaForm.destino}
                    onChange={(e) => setRutaForm({ ...rutaForm, destino: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                    Distancia (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={rutaForm.distancia_km}
                    onChange={(e) => setRutaForm({ ...rutaForm, distancia_km: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                    Tiempo Est. (min)
                  </label>
                  <input
                    type="number"
                    required
                    value={rutaForm.tiempo_estimado_minutos}
                    onChange={(e) => setRutaForm({ ...rutaForm, tiempo_estimado_minutos: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                    Color Distintivo
                  </label>
                  <input
                    type="color"
                    value={rutaForm.color}
                    onChange={(e) => setRutaForm({ ...rutaForm, color: e.target.value })}
                    className="w-full h-10 rounded-xl border border-[#E2E8F0] cursor-pointer p-1 bg-[#FAFCFF]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8EFF6]">
                <button
                  type="button"
                  onClick={() => setIsNewRutaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createRutaMutation.isPending}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                >
                  {createRutaMutation.isPending ? 'Guardando...' : 'Crear Ruta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reportar Alerta */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-[32px] border border-[#E8EFF6] bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8EFF6]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0B1B3D]">Reportar Incidencia en Ruta</h2>
                  <p className="text-xs text-[#64748B]">Notifique averías, bloqueos o retrasos a la central LAN</p>
                </div>
              </div>
              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0B1B3D] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAlertSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                    Tipo de Alerta
                  </label>
                  <select
                    value={alertForm.tipo}
                    onChange={(e) => setAlertForm({ ...alertForm, tipo: e.target.value as TipoIncidencia })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2]"
                  >
                    <option value="mecanica">Falla Mecánica</option>
                    <option value="trafico">Congestión / Tráfico</option>
                    <option value="accidente">Accidente de Tránsito</option>
                    <option value="retraso">Retraso Operativo</option>
                    <option value="desvio">Desvío de Tráfico</option>
                    <option value="otro">Otro Incidente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                    Prioridad
                  </label>
                  <select
                    value={alertForm.prioridad}
                    onChange={(e) => setAlertForm({ ...alertForm, prioridad: e.target.value as PrioridadIncidencia })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2]"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                    Conductor
                  </label>
                  <select
                    value={alertForm.conductor_id}
                    onChange={(e) => setAlertForm({ ...alertForm, conductor_id: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2]"
                  >
                    {conductoresData?.data.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.user.name} {c.user.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                    Vehículo
                  </label>
                  <select
                    value={alertForm.vehiculo_id}
                    onChange={(e) => setAlertForm({ ...alertForm, vehiculo_id: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2]"
                  >
                    {vehiculosData?.data.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.placa} ({v.modelo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                  Título Breve
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Falla en frenos - Cruce Puruchuco"
                  value={alertForm.titulo}
                  onChange={(e) => setAlertForm({ ...alertForm, titulo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                  Ubicación de Referencia
                </label>
                <input
                  type="text"
                  placeholder="Ej: Carretera Central km 8.5"
                  value={alertForm.ubicacion_referencia}
                  onChange={(e) => setAlertForm({ ...alertForm, ubicacion_referencia: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                  Descripción Detallada
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalle lo sucedido y acciones preventivas..."
                  value={alertForm.descripcion}
                  onChange={(e) => setAlertForm({ ...alertForm, descripcion: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-medium text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8EFF6]">
                <button
                  type="button"
                  onClick={() => setIsAlertModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createAlertMutation.isPending}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                >
                  {createAlertMutation.isPending ? 'Enviando...' : 'Emitir Alerta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalle de Ruta */}
      {selectedRuta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[32px] border border-[#E8EFF6] bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8EFF6]">
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full shadow-xs"
                  style={{ backgroundColor: selectedRuta.color || '#1D68F2' }}
                />
                <h3 className="text-base font-bold text-[#0B1B3D]">
                  {selectedRuta.codigo_ruta} - {selectedRuta.nombre}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRuta(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0B1B3D] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Origen:</span>
                <span className="font-bold text-[#0B1B3D]">{selectedRuta.origen}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Destino:</span>
                <span className="font-bold text-[#0B1B3D]">{selectedRuta.destino}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Distancia:</span>
                <span className="font-black text-[#0B1B3D]">{selectedRuta.distancia_km} km</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Tiempo de recorrido:</span>
                <span className="font-bold text-[#0B1B3D]">{selectedRuta.tiempo_estimado_minutos} minutos</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Unidades activas:</span>
                <span className="font-black text-[#1D68F2] bg-[#EBF3FE] px-2.5 py-0.5 rounded-full">
                  {selectedRuta.servicios_activos_count ?? 0}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedRuta(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] shadow-sm transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
