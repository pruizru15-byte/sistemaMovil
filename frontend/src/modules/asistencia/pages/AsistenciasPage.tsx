import { useState, type FC, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { asistenciasApi, type Asistencia, type TipoAsistencia } from '../../../shared/services/asistencias.api';
import { conductoresApi } from '../../../shared/services/conductores.api';
import {
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Radio,
  Navigation,
  ShieldCheck,
  X,
  AlertCircle,
  Smartphone,
  Calendar,
  Eye,
} from 'lucide-react';

export const AsistenciasPage: FC = () => {
  const queryClient = useQueryClient();

  const [filterFecha, setFilterFecha] = useState(new Date().toISOString().split('T')[0]);
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [selectedAsistencia, setSelectedAsistencia] = useState<Asistencia | null>(null);

  // Formulario Marcación GPS
  const [checkInData, setCheckInData] = useState({
    conductor_id: 1,
    tipo: 'entrada' as TipoAsistencia,
    latitud: -12.0254, // Por defecto dentro de Terminal Ate
    longitud: -76.9203,
    precision_metros: 12.5,
    es_mock_location: false,
    observaciones: '',
  });

  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);
  const [checkInResult, setCheckInResult] = useState<{
    message: string;
    geocerca: { dentro: boolean; distancia_metros: number; radio_permitido: number; terminal: string };
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Queries
  const { data: asistenciasData, isLoading } = useQuery({
    queryKey: ['asistencias', filterFecha, filterTipo],
    queryFn: () =>
      asistenciasApi.getAll({
        fecha: filterFecha || undefined,
        tipo: filterTipo === 'todos' ? undefined : filterTipo,
      }),
  });

  const { data: conductoresData } = useQuery({
    queryKey: ['conductores-list'],
    queryFn: () => conductoresApi.getAll(),
  });

  // Mutación Marcación
  const checkInMutation = useMutation({
    mutationFn: (payload: typeof checkInData) =>
      asistenciasApi.marcar({
        ...payload,
        fecha_hora_dispositivo: new Date().toISOString(),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
      setCheckInResult(res);
      setFormError(null);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setFormError(e.response?.data?.message || e.message || 'Error al registrar marcación.');
    },
  });

  const handleCaptureRealGps = () => {
    if (!navigator.geolocation) {
      setGpsStatusMessage('Geolocalización no soportada por el navegador.');
      return;
    }
    setGpsStatusMessage('Capturando señal GPS satelital...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCheckInData((prev) => ({
          ...prev,
          latitud: Number(pos.coords.latitude.toFixed(6)),
          longitud: Number(pos.coords.longitude.toFixed(6)),
          precision_metros: Math.round(pos.coords.accuracy),
          es_mock_location: false,
        }));
        setGpsStatusMessage(`GPS obtenido: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)} (±${Math.round(pos.coords.accuracy)}m)`);
      },
      (err) => {
        setGpsStatusMessage(`Error GPS: ${err.message}. Puede usar las opciones de simulación de terminal.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSimulateTerminalAte = () => {
    setCheckInData((prev) => ({
      ...prev,
      latitud: -12.02545,
      longitud: -76.92038,
      precision_metros: 8.0,
      es_mock_location: false,
    }));
    setGpsStatusMessage('Ubicación fijada en Terminal Terrestre de Ate (65m del centro, dentro de geocerca)');
  };

  const handleSimulateFueraGeocerca = () => {
    setCheckInData((prev) => ({
      ...prev,
      latitud: -12.04000,
      longitud: -76.94500,
      precision_metros: 15.0,
      es_mock_location: false,
    }));
    setGpsStatusMessage('Ubicación fijada fuera de geocerca (2.8 km de Terminal Ate)');
  };

  const handleSubmitCheckIn = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setCheckInResult(null);
    checkInMutation.mutate(checkInData);
  };

  const getPuntualidadBadge = (estado: string) => {
    switch (estado) {
      case 'a_tiempo':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#DEF7EC] text-[#03543F]">
            A tiempo
          </span>
        );
      case 'tardanza':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">
            Tardanza
          </span>
        );
      case 'falta':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626]">
            Falta
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-[#64748B]">
            {estado}
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
            Control de Asistencia y Geolocalización
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Marcaciones GPS con validación de Geocerca (Terminal Ate: Radio 300m) y hora oficial de servidor
          </p>
        </div>

        <button
          onClick={() => {
            setCheckInResult(null);
            setFormError(null);
            setIsCheckInModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
          Registrar Marcación GPS
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: % En Geocerca */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">En Geocerca</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#EAF8F1] text-[#10B981] flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B1B3D]">
            {asistenciasData?.summary.porcentaje_geocerca ?? 100}%
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[11px] font-semibold text-[#10B981]">Validación perimetral</span>
          </div>
        </div>

        {/* KPI 2: Presentes Hoy */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Presentes Hoy</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B1B3D]">{asistenciasData?.summary.total ?? 0}</p>
          <p className="text-[11px] font-semibold text-[#64748B] mt-2">
            Marcaciones registradas
          </p>
        </div>

        {/* KPI 3: A Tiempo */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">A Tiempo</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B1B3D]">{asistenciasData?.summary.a_tiempo ?? 0}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
            <span className="text-[11px] font-semibold text-[#0284C7]">Dentro de tolerancia</span>
          </div>
        </div>

        {/* KPI 4: Tardanzas */}
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Tardanzas</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#D97706]">{asistenciasData?.summary.tardanzas ?? 0}</p>
          <p className="text-[11px] font-semibold text-[#D97706] mt-2">
            Superaron tolerancia
          </p>
        </div>
      </div>

      {/* Tarjeta de Geocerca Terminal Ate */}
      <div className="p-6 rounded-[28px] bg-white border border-[#E8EFF6] flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h3 className="text-sm font-bold text-[#0B1B3D]">Geocerca Activa: Terminal Terrestre de Ate</h3>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#DEF7EC] text-[#03543F]">
                Radio: 300 metros
              </span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Coordenadas oficiales: <strong className="text-[#0B1B3D]">Lat -12.025600, Lng -76.920500</strong>. El servidor Laravel calcula la distancia matemática Haversine de manera estricta y offline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#EAF8F1] border border-[#A7F3D0] text-xs font-bold text-[#047857]">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>Anti-Spoofing LAN</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-[24px] bg-white border border-[#E8EFF6] shadow-xs">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="date"
            value={filterFecha}
            onChange={(e) => setFilterFecha(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2]"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFC] rounded-full border border-[#E2E8F0]">
          {['todos', 'entrada', 'salida'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterTipo(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all capitalize cursor-pointer ${
                filterTipo === t
                  ? 'bg-[#1D68F2] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B1B3D] hover:bg-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Asistencias */}
      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-[28px] border border-[#E8EFF6]">
          <div className="w-9 h-9 border-3 border-[#1D68F2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-[#64748B]">Consultando registros de asistencia...</p>
        </div>
      ) : !asistenciasData?.data || asistenciasData.data.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[28px] border border-[#E8EFF6]">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center mb-3">
            <Clock className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-[#0B1B3D]">No hay marcaciones para los filtros seleccionados</p>
          <p className="text-xs text-[#64748B] mt-1">Haga clic en &ldquo;Registrar Marcación GPS&rdquo; para registrar una asistencia.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[28px] bg-white border border-[#E8EFF6] shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E8EFF6] bg-[#F8FAFC]">
              <tr>
                <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Conductor</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Tipo</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Hora Servidor</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Puntualidad</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Distancia Ate</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Geocerca</th>
                <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px] text-[#64748B] text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {asistenciasData.data.map((asist) => (
                <tr key={asist.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[12px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center font-black text-xs shrink-0">
                        {asist.conductor?.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#0B1B3D]">
                          {asist.conductor?.user.name} {asist.conductor?.user.last_name}
                        </p>
                        <p className="text-[11px] text-[#64748B] font-mono">DNI: {asist.conductor?.user.dni}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] ${
                        asist.tipo === 'entrada'
                          ? 'bg-[#EBF3FE] text-[#1D68F2]'
                          : 'bg-[#F3ECFD] text-[#8B5CF6]'
                      }`}
                    >
                      {asist.tipo}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-mono font-bold text-[#0B1B3D]">
                    {new Date(asist.fecha_hora_servidor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>

                  <td className="py-4 px-4">
                    {getPuntualidadBadge(asist.estado_puntualidad)}
                  </td>

                  <td className="py-4 px-4 font-mono font-bold text-[#0B1B3D]">
                    {asist.distancia_terminal_metros} m
                  </td>

                  <td className="py-4 px-4">
                    {asist.dentro_geocerca ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#DEF7EC] text-[#03543F]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Dentro
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626]">
                        <AlertTriangle className="w-3.5 h-3.5" /> Fuera
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => setSelectedAsistencia(asist)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#1D68F2] bg-[#EBF3FE] hover:bg-[#D8E8FD] transition-colors cursor-pointer"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Marcación GPS */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-[32px] border border-[#E8EFF6] bg-white p-7 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8EFF6]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0B1B3D]">Marcación de Asistencia GPS</h2>
                  <p className="text-xs text-[#64748B]">Registro validado con geocerca perimetral de Terminal Ate</p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckInModalOpen(false)}
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

            {checkInResult && (
              <div
                className={`mt-4 p-4 rounded-2xl border text-xs space-y-1.5 ${
                  checkInResult.geocerca.dentro
                    ? 'bg-[#EAF8F1] border-[#A7F3D0] text-[#047857]'
                    : 'bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  {checkInResult.message}
                </div>
                <p>
                  <strong>Distancia calculada:</strong> {checkInResult.geocerca.distancia_metros} metros (Límite:{' '}
                  {checkInResult.geocerca.radio_permitido}m)
                </p>
                <p>
                  <strong>Condición Geocerca:</strong>{' '}
                  {checkInResult.geocerca.dentro ? 'DENTRO DE TERMINAL ATE (VÁLIDO)' : 'FUERA DE GEOCERCA (OBSERVADO)'}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitCheckIn} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                  Conductor que Registra
                </label>
                <select
                  required
                  value={checkInData.conductor_id}
                  onChange={(e) => setCheckInData({ ...checkInData, conductor_id: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2]"
                >
                  {conductoresData?.data.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.user.name} {c.user.last_name} (DNI: {c.user.dni})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                  Tipo de Marcación
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckInData({ ...checkInData, tipo: 'entrada' })}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      checkInData.tipo === 'entrada'
                        ? 'border-[#1D68F2] bg-[#EBF3FE] text-[#1D68F2] shadow-xs'
                        : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    Entrada de Turno
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckInData({ ...checkInData, tipo: 'salida' })}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      checkInData.tipo === 'salida'
                        ? 'border-[#8B5CF6] bg-[#F3ECFD] text-[#8B5CF6] shadow-xs'
                        : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    Salida de Turno
                  </button>
                </div>
              </div>

              {/* Botones de Captura GPS / Simulación Offline */}
              <div className="p-4 rounded-2xl border border-[#E8EFF6] bg-[#F8FAFC] space-y-2.5 text-xs">
                <span className="font-bold text-[#0B1B3D] block">
                  Captura de Coordenadas GPS
                </span>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCaptureRealGps}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D68F2] hover:bg-[#1557D6] text-white font-bold text-[11px] shadow-xs cursor-pointer active:scale-95"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> GPS Dispositivo
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateTerminalAte}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-[11px] shadow-xs cursor-pointer active:scale-95"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Simular Terminal Ate (65m)
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateFueraGeocerca}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#64748B] hover:bg-[#475569] text-white font-bold text-[11px] shadow-xs cursor-pointer active:scale-95"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Simular Fuera (2.8km)
                  </button>
                </div>

                {gpsStatusMessage && (
                  <p className="text-[11px] text-[#1D68F2] font-semibold italic">
                    {gpsStatusMessage}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2.5 pt-2 text-[11px] font-mono">
                  <div>
                    <span className="text-[#64748B] block">Latitud:</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={checkInData.latitud}
                      onChange={(e) => setCheckInData({ ...checkInData, latitud: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border border-[#E2E8F0] bg-white font-bold text-[#0B1B3D]"
                    />
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Longitud:</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={checkInData.longitud}
                      onChange={(e) => setCheckInData({ ...checkInData, longitud: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border border-[#E2E8F0] bg-white font-bold text-[#0B1B3D]"
                    />
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Precisión (m):</span>
                    <input
                      type="number"
                      value={checkInData.precision_metros}
                      onChange={(e) => setCheckInData({ ...checkInData, precision_metros: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border border-[#E2E8F0] bg-white font-bold text-[#0B1B3D]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#334155]">
                  Observaciones (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Ingreso por puerta 2 de Terminal Ate"
                  value={checkInData.observaciones}
                  onChange={(e) => setCheckInData({ ...checkInData, observaciones: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D] focus:outline-hidden focus:border-[#1D68F2]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8EFF6]">
                <button
                  type="button"
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={checkInMutation.isPending}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                >
                  {checkInMutation.isPending ? 'Verificando...' : 'Confirmar Marcación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalle de Asistencia */}
      {selectedAsistencia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[32px] border border-[#E8EFF6] bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8EFF6]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B1B3D]">Auditoría de Marcación</h3>
                  <p className="text-xs text-[#64748B]">ID Asistencia #{selectedAsistencia.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAsistencia(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0B1B3D] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Conductor:</span>
                <span className="font-bold text-[#0B1B3D]">
                  {selectedAsistencia.conductor?.user.name} {selectedAsistencia.conductor?.user.last_name}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Tipo y Puntualidad:</span>
                <div className="flex items-center gap-2">
                  <span className="uppercase font-bold text-[#1D68F2]">{selectedAsistencia.tipo}</span>
                  {getPuntualidadBadge(selectedAsistencia.estado_puntualidad)}
                </div>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Fecha / Hora Servidor:</span>
                <span className="font-mono font-bold text-[#0B1B3D]">
                  {new Date(selectedAsistencia.fecha_hora_servidor).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Hora Dispositivo Móvil:</span>
                <span className="font-mono text-[#64748B]">
                  {new Date(selectedAsistencia.fecha_hora_dispositivo).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Coordenadas Registradas:</span>
                <span className="font-mono font-bold text-[#0B1B3D]">
                  {selectedAsistencia.latitud}, {selectedAsistencia.longitud}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Distancia a Terminal Ate:</span>
                <span className="font-mono font-black text-[#1D68F2]">
                  {selectedAsistencia.distancia_terminal_metros} metros
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Condición Geocerca:</span>
                <span className="font-bold">
                  {selectedAsistencia.dentro_geocerca ? (
                    <span className="text-[#047857]">DENTRO DE PERÍMETRO (VÁLIDO)</span>
                  ) : (
                    <span className="text-[#DC2626]">FUERA DE GEOCERCA (OBSERVADO)</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Dirección IP LAN:</span>
                <span className="font-mono text-[#64748B]">{selectedAsistencia.ip_origen || '192.168.1.50'}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAsistencia(null)}
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
