import { api } from './api';
import type { Conductor } from './conductores.api';
import type { Vehiculo } from './vehiculos.api';
import type { Ruta } from './rutas.api';

export type EstadoServicio = 'en_ruta' | 'completado' | 'cancelado';
export type TipoIncidencia = 'mecanica' | 'trafico' | 'accidente' | 'retraso' | 'desvio' | 'otro';
export type PrioridadIncidencia = 'baja' | 'media' | 'alta' | 'critica';
export type EstadoIncidencia = 'abierta' | 'en_atencion' | 'resuelta';

export interface Incidencia {
  id: number;
  servicio_id?: number | null;
  conductor_id: number;
  vehiculo_id: number;
  ruta_id?: number | null;
  tipo: TipoIncidencia;
  prioridad: PrioridadIncidencia;
  titulo: string;
  descripcion: string;
  ubicacion_referencia?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  estado: EstadoIncidencia;
  fecha_hora: string;
  conductor?: Conductor;
  vehiculo?: Vehiculo;
  ruta?: Ruta;
}

export interface Servicio {
  id: number;
  asignacion_turno_id: number;
  conductor_id: number;
  vehiculo_id: number;
  ruta_id: number;
  hora_inicio_real: string;
  hora_fin_real?: string | null;
  km_inicio: number;
  km_fin?: number | null;
  pasajeros_transportados?: number | null;
  estado: EstadoServicio;
  observaciones?: string | null;
  conductor?: Conductor;
  vehiculo?: Vehiculo;
  ruta?: Ruta;
  incidencias?: Incidencia[];
}

export interface ServiciosResponse {
  data: Servicio[];
  summary: {
    total: number;
    en_ruta: number;
    completados: number;
    cancelados: number;
  };
}

export interface IncidenciasResponse {
  data: Incidencia[];
  summary: {
    total: number;
    abiertas: number;
    en_atencion: number;
    resueltas: number;
  };
}

export const serviciosApi = {
  getAll: async (params?: { estado?: string; ruta_id?: number }): Promise<ServiciosResponse> => {
    const res = await api.get<ServiciosResponse>('/servicios', { params });
    return res.data;
  },

  iniciar: async (data: {
    asignacion_turno_id: number;
    km_inicio: number;
    observaciones?: string;
  }): Promise<{ message: string; data: Servicio }> => {
    const res = await api.post('/servicios', data);
    return res.data;
  },

  finalizar: async (
    id: number,
    data: { km_fin: number; pasajeros_transportados?: number; observaciones?: string }
  ): Promise<{ message: string; data: Servicio }> => {
    const res = await api.post(`/servicios/${id}/finalizar`, data);
    return res.data;
  },

  getIncidencias: async (params?: { estado?: string; prioridad?: string }): Promise<IncidenciasResponse> => {
    const res = await api.get<IncidenciasResponse>('/incidencias', { params });
    return res.data;
  },

  crearIncidencia: async (data: {
    servicio_id?: number;
    conductor_id: number;
    vehiculo_id: number;
    ruta_id?: number;
    tipo: TipoIncidencia;
    prioridad: PrioridadIncidencia;
    titulo: string;
    descripcion: string;
    ubicacion_referencia?: string;
    latitud?: number;
    longitud?: number;
  }): Promise<{ message: string; data: Incidencia }> => {
    const res = await api.post('/incidencias', data);
    return res.data;
  },

  atenderIncidencia: async (
    id: number,
    data: { estado: 'en_atencion' | 'resuelta'; observaciones?: string }
  ): Promise<{ message: string; data: Incidencia }> => {
    const res = await api.post(`/incidencias/${id}/atender`, data);
    return res.data;
  },
};
