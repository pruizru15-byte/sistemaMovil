import { api } from './api';
import type { UserProfile } from './auth.api';

export type EstadoOperativo = 'disponible' | 'en_servicio' | 'descanso' | 'vacaciones' | 'suspendido';

export interface Conductor {
  id: number;
  user_id: number;
  licencia_conducir: string;
  categoria_licencia: string;
  licencia_vencimiento: string | null;
  experiencia_anos: number;
  estado_operativo: EstadoOperativo;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  notas: string | null;
  created_at: string;
  user: UserProfile;
}

export interface ConductoresStats {
  total: number;
  disponibles: number;
  en_servicio: number;
  descanso: number;
  suspendidos: number;
}

export interface ConductoresResponse {
  data: Conductor[];
  stats: ConductoresStats;
}

export const conductoresApi = {
  getAll: async (params?: { search?: string; estado?: string }): Promise<ConductoresResponse> => {
    const res = await api.get<ConductoresResponse>('/conductores', { params });
    return res.data;
  },

  getById: async (id: number): Promise<Conductor> => {
    const res = await api.get<Conductor>(`/conductores/${id}`);
    return res.data;
  },

  create: async (data: Record<string, unknown>): Promise<{ message: string; conductor: Conductor }> => {
    const res = await api.post('/conductores', data);
    return res.data;
  },

  update: async (id: number, data: Record<string, unknown>): Promise<{ message: string; conductor: Conductor }> => {
    const res = await api.put(`/conductores/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete(`/conductores/${id}`);
    return res.data;
  },
};
