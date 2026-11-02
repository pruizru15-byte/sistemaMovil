import { useState, useEffect, type FC, type FormEvent } from 'react';
import {
  configuracionApi,
  type UpdateConfiguracionDto,
} from '../../../shared/services/configuracion.api';
import {
  Settings,
  MapPin,
  Clock,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  Crosshair,
  Wifi,
  Database,
} from 'lucide-react';

export const ConfiguracionPage: FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados de configuración
  const [terminalNombre, setTerminalNombre] = useState('Terminal Central de Ate');
  const [geocercaLat, setGeocercaLat] = useState(-12.0256);
  const [geocercaLng, setGeocercaLng] = useState(-76.9205);
  const [geocercaRadio, setGeocercaRadio] = useState(300);

  const [toleranciaTardanza, setToleranciaTardanza] = useState(15);
  const [anticipacionMaxima, setAnticipacionMaxima] = useState(60);
  const [empresaNombre, setEmpresaNombre] = useState('Transportes de Personal Ate S.A.C.');

  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    cargarConfig();
  }, []);

  const cargarConfig = async () => {
    try {
      setIsLoading(true);
      const data = await configuracionApi.getConfig();
      if (data.geocerca) {
        setTerminalNombre(data.geocerca.terminal_nombre || 'Terminal Central de Ate');
        setGeocercaLat(data.geocerca.lat);
        setGeocercaLng(data.geocerca.lng);
        setGeocercaRadio(data.geocerca.radio_metros);
      }
      if (data.tolerancias) {
        setToleranciaTardanza(data.tolerancias.tardanza_minutos);
        setAnticipacionMaxima(data.tolerancias.anticipacion_minutos);
      }
      if (data.settings?.empresa_nombre) {
        setEmpresaNombre(data.settings.empresa_nombre);
      }
    } catch {
      setFeedbackError('Error al cargar la configuración del sistema.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por su navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeocercaLat(Number(pos.coords.latitude.toFixed(6)));
        setGeocercaLng(Number(pos.coords.longitude.toFixed(6)));
      },
      () => {
        alert('No se pudo obtener la ubicación actual.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFeedbackSuccess(null);
    setFeedbackError(null);

    try {
      setIsSaving(true);
      const payload: UpdateConfiguracionDto = {
        terminal_nombre: terminalNombre,
        geocerca_lat: geocercaLat,
        geocerca_lng: geocercaLng,
        geocerca_radio_metros: geocercaRadio,
        tolerancia_tardanza_minutos: toleranciaTardanza,
        anticipacion_maxima_minutos: anticipacionMaxima,
        empresa_nombre: empresaNombre,
      };

      const res = await configuracionApi.updateConfig(payload);
      setFeedbackSuccess(res.message);
      setTimeout(() => setFeedbackSuccess(null), 4000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setFeedbackError(errorObj.message || 'Error al guardar la configuración.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B1B3D] tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-[#1D68F2]" /> Configuración del Sistema
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Parámetros de geocerca GPS, tolerancias horarias y reglas operativas de la red local
          </p>
        </div>
      </div>

      {feedbackSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {feedbackError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* ========================================================
            SECCIÓN 1: GEOCERCA GPS TERMINAL ATE
            ======================================================== */}
        <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-[#E8EFF6] shadow-xs space-y-5">
          <div className="border-b border-[#F1F5F9] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#0B1B3D] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1D68F2]" /> Geocerca del Terminal Principal (GPS)
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Coordenadas centrales y radio en metros para validar la asistencia física de conductores
              </p>
            </div>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EBF3FE] text-[#1D68F2] hover:bg-[#DBEAFE] transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Crosshair className="w-3.5 h-3.5" /> Usar Coordenadas Actuales
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Nombre Terminal */}
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">Nombre del Terminal</label>
              <input
                type="text"
                required
                value={terminalNombre}
                onChange={(e) => setTerminalNombre(e.target.value)}
                placeholder="Terminal Central de Ate"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0B1B3D] focus:border-[#1D68F2]"
              />
            </div>

            {/* Latitud */}
            <div>
              <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">Latitud (Decimal)</label>
              <input
                type="number"
                step="0.000001"
                required
                value={geocercaLat}
                onChange={(e) => setGeocercaLat(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-mono font-bold text-[#0B1B3D] focus:border-[#1D68F2]"
              />
            </div>

            {/* Longitud */}
            <div>
              <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">Longitud (Decimal)</label>
              <input
                type="number"
                step="0.000001"
                required
                value={geocercaLng}
                onChange={(e) => setGeocercaLng(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-mono font-bold text-[#0B1B3D] focus:border-[#1D68F2]"
              />
            </div>

            {/* Radio en metros */}
            <div>
              <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">Radio de Geocerca (Metros)</label>
              <input
                type="number"
                min="50"
                max="5000"
                required
                value={geocercaRadio}
                onChange={(e) => setGeocercaRadio(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-mono font-bold text-[#0B1B3D] focus:border-[#1D68F2]"
              />
            </div>
          </div>

          {/* Gráfico representativo de cobertura */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E1EDFD] text-[#1D68F2] flex items-center justify-center font-bold text-sm shrink-0">
                {geocercaRadio}m
              </div>
              <div>
                <p className="font-bold text-[#0B1B3D]">Perímetro Activo de Marcación</p>
                <p className="text-[11px] text-[#64748B]">
                  Fórmula Haversine calculada en el backend. Marcaciones a más de {geocercaRadio}m serán registradas como &quot;Fuera de Geocerca&quot;.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              Cálculo de Geocerca Activo
            </span>
          </div>
        </div>

        {/* ========================================================
            SECCIÓN 2: TOLERANCIAS HORARIAS Y PUNTUALIDAD
            ======================================================== */}
        <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-[#E8EFF6] shadow-xs space-y-5">
          <div className="border-b border-[#F1F5F9] pb-4">
            <h2 className="text-base font-bold text-[#0B1B3D] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D97706]" /> Tolerancias Horarias y Reglas de Asistencia
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Margen de minutos permitidos para considerar una marcación puntual o tardanza
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">
                Tolerancia de Tardanza (Minutos)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                required
                value={toleranciaTardanza}
                onChange={(e) => setToleranciaTardanza(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-mono font-bold text-[#0B1B3D] focus:border-[#1D68F2]"
              />
              <p className="text-[10px] text-[#64748B] mt-1">
                Pasados estos minutos del inicio del turno, se marcará automáticamente como &quot;Tardanza&quot;.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">
                Anticipación Máxima de Ingreso (Minutos)
              </label>
              <input
                type="number"
                min="10"
                max="180"
                required
                value={anticipacionMaxima}
                onChange={(e) => setAnticipacionMaxima(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-mono font-bold text-[#0B1B3D] focus:border-[#1D68F2]"
              />
              <p className="text-[10px] text-[#64748B] mt-1">
                Tiempo previo al turno en el cual el conductor ya puede registrar su llegada.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            SECCIÓN 3: INFORMACIÓN INSTITUCIONAL Y RED LAN
            ======================================================== */}
        <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-[#E8EFF6] shadow-xs space-y-5">
          <div className="border-b border-[#F1F5F9] pb-4">
            <h2 className="text-base font-bold text-[#0B1B3D] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#10B981]" /> Identidad y Entorno de Red Local
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Datos de la empresa y políticas de funcionamiento autónomo sin internet
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">
              Razón Social de la Empresa
            </label>
            <input
              type="text"
              required
              value={empresaNombre}
              onChange={(e) => setEmpresaNombre(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0B1B3D] focus:border-[#1D68F2]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3">
              <Wifi className="w-6 h-6 text-[#1D68F2] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#0B1B3D]">Modo Wi-Fi LAN Aislado</p>
                <p className="text-[11px] text-[#64748B]">Sin consumo de nube ni APIs de pago</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3">
              <Database className="w-6 h-6 text-[#10B981] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#0B1B3D]">Auditoría y Trazabilidad</p>
                <p className="text-[11px] text-[#64748B]">Desactivación lógica sin borrado físico</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de Guardado */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] shadow-[0_4px_16px_rgba(29,104,242,0.3)] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Guardando Configuración...' : 'Guardar Parámetros del Sistema'}
          </button>
        </div>
      </form>
    </div>
  );
};
