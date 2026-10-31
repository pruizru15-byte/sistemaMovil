import { useState, type FC } from 'react';
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
} from 'lucide-react';

export const ReportesPage: FC = () => {
  const [fechaInicio, setFechaInicio] = useState('2026-10-01');
  const [fechaFin, setFechaFin] = useState('2026-10-19');
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'pdf'>('excel');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleExport = (reportName: string) => {
    setDownloadSuccess(`Exportando ${reportName} (${selectedFormat.toUpperCase()}) en red local...`);
    setTimeout(() => {
      setDownloadSuccess(null);
    }, 4000);
  };

  const reportLogs = [
    { id: 1, title: 'Consolidado_Asistencias_Octubre_2026.xlsx', tipo: 'Asistencias', fecha: '2026-10-19 10:45', size: '142 KB', user: 'Admin Sistema' },
    { id: 2, title: 'Informe_Mantenimiento_Flota_Semana42.pdf', tipo: 'Flota', fecha: '2026-10-18 18:20', size: '2.4 MB', user: 'Supervisor Ate' },
    { id: 3, title: 'Turnos_y_Horarios_RutaAte_S15.xlsx', tipo: 'Turnos', fecha: '2026-10-17 09:15', size: '98 KB', user: 'Admin Sistema' },
    { id: 4, title: 'Auditoria_Geocercas_GPS_Septiembre.pdf', tipo: 'Seguridad', fecha: '2026-10-15 14:00', size: '1.8 MB', user: 'Admin Sistema' },
  ];

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
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Informes Generados</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B1B3D]">128</p>
          <p className="text-[11px] font-semibold text-[#64748B] mt-2">
            Descargas este mes
          </p>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Tasa de Puntualidad</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#EAF8F1] text-[#10B981] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B1B3D]">94.2%</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[11px] font-semibold text-[#10B981]">+2.1% vs mes anterior</span>
          </div>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Cumplimiento GPS</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B1B3D]">98.5%</p>
          <p className="text-[11px] font-semibold text-[#64748B] mt-2">
            En geocerca Ate (300m)
          </p>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Horas Operadas</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B1B3D]">1,840 h</p>
          <p className="text-[11px] font-semibold text-[#64748B] mt-2">
            En 6 rutas autorizadas
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
            <h3 className="text-xs font-bold text-[#0B1B3D]">Período de Liquidación</h3>
            <p className="text-[11px] text-[#64748B]">Seleccione el intervalo para la generación de reportes</p>
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
            onClick={() => handleExport('Asistencias y Puntualidad')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Exportar Reporte
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
              Historial de kilometraje, estado de SOAT y revisión técnica, servicios concluidos y registro de incidencias mecánicas.
            </p>
          </div>
          <button
            onClick={() => handleExport('Rendimiento de Unidades')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Exportar Reporte
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
              Matriz de asignación de choferes por ruta, rotación de horarios mañana/tarde/noche y tasa de ausentismo justificado.
            </p>
          </div>
          <button
            onClick={() => handleExport('Cumplimiento de Turnos')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Exportar Reporte
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
            4 Archivos disponibles
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
                    onClick={() => handleExport(log.title)}
                    className="px-3 py-1 rounded-xl text-xs font-bold text-[#1D68F2] hover:bg-[#EBF3FE] transition-colors cursor-pointer"
                  >
                    Descargar
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
