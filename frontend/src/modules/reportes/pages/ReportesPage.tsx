import { useState, useEffect, type FC } from 'react';
import { reportesApi, type ReporteStats } from '../../../shared/services/reportes.api';
import { useAuth } from '../../auth/context/AuthContext';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Clock,
  Bus,
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface ReportLogItem {
  id: number;
  title: string;
  tipo: string;
  fecha: string;
  size: string;
  user: string;
  category: 'asistencias' | 'vehiculos' | 'turnos';
}

export const ReportesPage: FC = () => {
  const { user } = useAuth();

  const [fechaInicio, setFechaInicio] = useState('2026-10-01');
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'pdf'>('excel');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const [stats, setStats] = useState<ReporteStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [reportLogs, setReportLogs] = useState<ReportLogItem[]>([
    { id: 1, title: 'Consolidado_Asistencias_Octubre_2026.csv', tipo: 'Asistencias', fecha: '2026-10-19 10:45', size: '142 KB', user: 'Admin Sistema', category: 'asistencias' },
    { id: 2, title: 'Informe_Mantenimiento_Flota.csv', tipo: 'Flota', fecha: '2026-10-18 18:20', size: '48 KB', user: 'Supervisor Ate', category: 'vehiculos' },
    { id: 3, title: 'Turnos_y_Horarios_RutaAte.csv', tipo: 'Turnos', fecha: '2026-10-17 09:15', size: '98 KB', user: 'Admin Sistema', category: 'turnos' },
  ]);

  useEffect(() => {
    cargarStats();
  }, [fechaInicio, fechaFin]);

  const cargarStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await reportesApi.getStats(fechaInicio, fechaFin);
      setStats(data);
    } catch {
      // Si falla o no hay conexión aún, mantener métricas por defecto
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleExport = async (category: 'asistencias' | 'vehiculos' | 'turnos', label: string) => {
    setIsExporting(label);
    setDownloadSuccess(null);
    setDownloadError(null);

    try {
      await reportesApi.downloadReporte(category, fechaInicio, fechaFin);
      const filename = `Reporte_${label.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
      setDownloadSuccess(`Reporte "${label}" descargado exitosamente.`);

      // Agregar a la tabla de historial
      const newLog: ReportLogItem = {
        id: Date.now(),
        title: filename,
        tipo: category.charAt(0).toUpperCase() + category.slice(1),
        fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
        size: '120 KB',
        user: user?.full_name || user?.name || 'Usuario LAN',
        category,
      };
      setReportLogs((prev) => [newLog, ...prev]);

      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch {
      setDownloadError(`Error al generar la descarga de ${label}. Verifique los filtros.`);
      setTimeout(() => setDownloadError(null), 5000);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B1B3D] tracking-tight">
            Reportes Operativos y Auditoría
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Consolidación de métricas, exportación de asistencias y auditoría local sin conexión externa
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white border border-[#E8EFF6] rounded-full shadow-xs">
          <button
            onClick={() => setSelectedFormat('excel')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFormat === 'excel'
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B1B3D]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> CSV / Excel
          </button>
          <button
            onClick={() => setSelectedFormat('pdf')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFormat === 'pdf'
                ? 'bg-[#DC2626] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B1B3D]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-2xl bg-[#EAF8F1] border border-[#A7F3D0] flex items-center gap-2.5 text-xs font-bold text-[#047857] animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {downloadError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs font-bold text-red-700 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Asistencias en Período</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B1B3D]">
            {stats ? stats.total_asistencias : '---'}
          </p>
          <p className="text-[11px] font-semibold text-[#64748B] mt-2">
            Registros validados en LAN
          </p>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Tasa de Puntualidad</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#EAF8F1] text-[#10B981] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B1B3D]">
            {stats ? `${stats.tasa_puntualidad}%` : '---'}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[11px] font-semibold text-[#10B981]">Con tolerancia de 15m</span>
          </div>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Cumplimiento Geocerca</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B1B3D]">
            {stats ? `${stats.cumplimiento_gps}%` : '---'}
          </p>
          <p className="text-[11px] font-semibold text-[#64748B] mt-2">
            En radio Terminal Ate
          </p>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Servicios Concluidos</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B1B3D]">
            {stats ? stats.servicios_completados : '---'}
          </p>
          <p className="text-[11px] font-semibold text-[#64748B] mt-2">
            Rutas ejecutadas
          </p>
        </div>
      </div>

      {/* Rango de Fechas */}
      <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0B1B3D]">Período de Liquidación y Auditoría</h3>
            <p className="text-[11px] text-[#64748B]">Seleccione el intervalo para la generación y consolidación</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#64748B]">Desde:</span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#64748B]">Hasta:</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] text-xs font-semibold text-[#0B1B3D]"
            />
          </div>
          <button
            onClick={cargarStats}
            disabled={isLoadingStats}
            title="Actualizar métricas"
            className="p-2 rounded-xl bg-[#F1F5F9] text-[#64748B] hover:text-[#1D68F2] hover:bg-[#EBF3FE] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Módulos de Generación Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Reporte 1: Asistencias */}
        <div className="p-6 rounded-[28px] bg-white border border-[#E8EFF6] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-[16px] bg-[#EAF8F1] text-[#10B981] flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0B1B3D] mb-1">
              Asistencia y Tardanzas
            </h3>
            <p className="text-xs text-[#64748B] mb-5 leading-relaxed">
              Consolidado con hora de servidor, tolerancia de 15 minutos, validación de geocerca Haversine y registro de IP LAN.
            </p>
          </div>
          <button
            onClick={() => handleExport('asistencias', 'Asistencias y Puntualidad')}
            disabled={isExporting !== null}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting === 'Asistencias y Puntualidad' ? 'Descargando...' : 'Descargar Archivo CSV'}
          </button>
        </div>

        {/* Reporte 2: Flota y Mantenimiento */}
        <div className="p-6 rounded-[28px] bg-white border border-[#E8EFF6] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-[16px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center mb-4">
              <Bus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0B1B3D] mb-1">
              Rendimiento de Unidades
            </h3>
            <p className="text-xs text-[#64748B] mb-5 leading-relaxed">
              Historial de vehículos, estado de SOAT y revisión técnica, capacidad de pasajeros y estado operativo actual.
            </p>
          </div>
          <button
            onClick={() => handleExport('vehiculos', 'Rendimiento de Unidades')}
            disabled={isExporting !== null}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting === 'Rendimiento de Unidades' ? 'Descargando...' : 'Descargar Archivo CSV'}
          </button>
        </div>

        {/* Reporte 3: Turnos y Horarios */}
        <div className="p-6 rounded-[28px] bg-white border border-[#E8EFF6] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-[16px] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0B1B3D] mb-1">
              Cumplimiento de Turnos
            </h3>
            <p className="text-xs text-[#64748B] mb-5 leading-relaxed">
              Matriz de asignación de choferes por ruta, rotación de horarios mañana/tarde/noche y estado de programación.
            </p>
          </div>
          <button
            onClick={() => handleExport('turnos', 'Cumplimiento de Turnos')}
            disabled={isExporting !== null}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting === 'Cumplimiento de Turnos' ? 'Descargando...' : 'Descargar Archivo CSV'}
          </button>
        </div>
      </div>

      {/* Historial de Descargas Recientes */}
      <div className="rounded-[28px] bg-white border border-[#E8EFF6] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#E8EFF6] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0B1B3D]">Historial de Descargas Generadas</h3>
            <p className="text-xs text-[#64748B]">Auditoría de archivos producidos en el servidor local</p>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-[#64748B]">
            {reportLogs.length} Archivos disponibles
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#E8EFF6] bg-[#F8FAFC]">
            <tr>
              <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Nombre del Archivo</th>
              <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Categoría</th>
              <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Fecha / Hora</th>
              <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Tamaño</th>
              <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Generado Por</th>
              <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px] text-[#64748B] text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {reportLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-3.5 px-5 font-bold text-[#0B1B3D] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1D68F2]" />
                  <span>{log.title}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF3FE] text-[#1D68F2]">
                    {log.tipo}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-[#64748B]">{log.fecha}</td>
                <td className="py-3.5 px-4 font-mono text-[#64748B]">{log.size}</td>
                <td className="py-3.5 px-4 font-semibold text-[#0B1B3D]">{log.user}</td>
                <td className="py-3.5 px-5 text-right">
                  <button
                    onClick={() => handleExport(log.category, log.tipo)}
                    className="px-3 py-1 rounded-xl text-xs font-bold text-[#1D68F2] hover:bg-[#EBF3FE] transition-colors cursor-pointer"
                  >
                    Re-descargar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
