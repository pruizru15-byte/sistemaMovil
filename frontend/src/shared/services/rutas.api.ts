import { api } from './api';

export interface Ruta {
  id: number;
  codigo_ruta: string;
  nombre: string;
  origen: string;
  destino: string;
  distancia_km: number;
  tiempo_estimado_minutos: number;
  paraderos_json?: string[] | null;
  color?: string | null;
  is_active: boolean;
  servicios_activos_count?: number;
  created_at: string;
}

export interface RutasResponse {
  data: Ruta[];
  summary: {
    total: number;
    activas: number;
  };
}

export const rutasApi = {
  getAll: async (params?: { search?: string; is_active?: boolean }): Promise<RutasResponse> => {
    const res = await api.get<RutasResponse>('/rutas', { params });
    return res.data;
  },

  getById: async (id: number): Promise<{ data: Ruta }> => {
    const res = await api.get<{ data: Ruta }>(`/rutas/${id}`);
    return res.data;
  },

  create: async (data: Partial<Ruta>): Promise<{ message: string; data: Ruta }> => {
    const res = await api.post('/rutas', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Ruta>): Promise<{ message: string; data: Ruta }> => {
    const res = await api.put(`/rutas/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete(`/rutas/${id}`);
    return res.data;
  },
};
