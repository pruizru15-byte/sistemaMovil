import { api } from './api';
import type { Conductor } from './conductores.api';
import type { AsignacionTurno } from './turnos.api';

export type TipoAsistencia = 'entrada' | 'salida';
export type EstadoPuntualidad = 'a_tiempo' | 'tardanza' | 'falta';

export interface Asistencia {
  id: number;
  conductor_id: number;
  asignacion_turno_id?: number | null;
  tipo: TipoAsistencia;
  fecha_hora_servidor: string;
  fecha_hora_dispositivo: string;
  latitud: number;
  longitud: number;
  precision_metros: number;
  distancia_terminal_metros: number;
  dentro_geocerca: boolean;
  es_mock_location: boolean;
  estado_puntualidad: EstadoPuntualidad;
  minutos_diferencia: number;
  ip_origen?: string | null;
  validado: boolean;
  observaciones?: string | null;
  conductor?: Conductor;
  asignacion?: AsignacionTurno;
}

export interface AsistenciasResponse {
  data: Asistencia[];
  summary: {
    total: number;
    a_tiempo: number;
    tardanzas: number;
    faltas: number;
    dentro_geocerca: number;
    porcentaje_geocerca: number;
    terminal_coordenadas: {
      lat: number;
      lng: number;
      radio_metros: number;
    };
  };
}

export const asistenciasApi = {
  getAll: async (params?: {
    fecha?: string;
    conductor_id?: number;
    tipo?: string;
    estado_puntualidad?: string;
  }): Promise<AsistenciasResponse> => {
    const res = await api.get<AsistenciasResponse>('/asistencias', { params });
    return res.data;
  },

  marcar: async (data: {
    conductor_id: number;
    asignacion_turno_id?: number;
    tipo: TipoAsistencia;
    fecha_hora_dispositivo: string;
    latitud: number;
    longitud: number;
    precision_metros: number;
    es_mock_location?: boolean;
    observaciones?: string;
  }): Promise<{
    message: string;
    data: Asistencia;
    geocerca: {
      dentro: boolean;
      distancia_metros: number;
      radio_permitido: number;
      terminal: string;
    };
  }> => {
    const res = await api.post('/asistencias', data);
    return res.data;
  },
};
