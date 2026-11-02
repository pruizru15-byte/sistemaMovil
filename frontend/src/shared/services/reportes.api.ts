import { api } from './api';

export interface ReporteStats {
  total_asistencias: number;
  tasa_puntualidad: number;
  cumplimiento_gps: number;
  servicios_completados: number;
  horas_estimadas: number;
  fecha_inicio: string;
  fecha_fin: string;
}

export const reportesApi = {
  getStats: async (fechaInicio?: string, fechaFin?: string): Promise<ReporteStats> => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);

    const res = await api.get<ReporteStats>(`/reportes/stats?${params.toString()}`);
    return res.data;
  },

  downloadReporte: async (
    tipo: 'asistencias' | 'vehiculos' | 'turnos',
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<void> => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);

    const endpoint = `/reportes/${tipo}/export?${params.toString()}`;
    const res = await api.get(endpoint, {
      responseType: 'blob',
    });

    // Crear enlace de descarga en el navegador
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    const defaultFilename = `Reporte_${tipo}_${fechaInicio || 'export'}.csv`;
    link.setAttribute('download', defaultFilename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

