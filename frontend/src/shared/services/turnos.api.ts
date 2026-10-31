import { api } from './api';
import type { Conductor } from './conductores.api';
import type { Vehiculo } from './vehiculos.api';
import type { Ruta } from './rutas.api';

export interface Turno {
  id: number;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
  tolerancia_minutos: number;
  is_active: boolean;
}

export type EstadoAsignacion = 'programado' | 'en_curso' | 'completado' | 'cancelado';

export interface AsignacionTurno {
  id: number;
  fecha: string;
  turno_id: number;
  conductor_id: number;
  vehiculo_id: number;
  ruta_id: number;
  supervisor_id: number;
  estado: EstadoAsignacion;
  observaciones?: string | null;
  turno?: Turno;
  conductor?: Conductor;
  vehiculo?: Vehiculo;
  ruta?: Ruta;
}

export interface AsignacionesResponse {
  data: AsignacionTurno[];
  summary: {
    total: number;
    programados: number;
    en_curso: number;
    completados: number;
    cancelados: number;
  };
}

export const turnosApi = {
  getTurnos: async (): Promise<{ data: Turno[] }> => {
    const res = await api.get<{ data: Turno[] }>('/turnos');
    return res.data;
  },

  getAsignaciones: async (params?: {
    fecha?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    turno_id?: number;
    conductor_id?: number;
    estado?: string;
  }): Promise<AsignacionesResponse> => {
    const res = await api.get<AsignacionesResponse>('/asignaciones-turno', { params });
    return res.data;
  },

  createAsignacion: async (data: {
    fecha: string;
    turno_id: number;
    conductor_id: number;
    vehiculo_id: number;
    ruta_id: number;
    observaciones?: string;
  }): Promise<{ message: string; data: AsignacionTurno }> => {
    const res = await api.post('/asignaciones-turno', data);
    return res.data;
  },

  updateAsignacion: async (id: number, data: Partial<AsignacionTurno>): Promise<{ message: string; data: AsignacionTurno }> => {
    const res = await api.put(`/asignaciones-turno/${id}`, data);
    return res.data;
  },

  deleteAsignacion: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete(`/asignaciones-turno/${id}`);
    return res.data;
  },
};
