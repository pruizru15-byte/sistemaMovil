import { api } from './api';

export type EstadoVehiculo = 'operativo' | 'en_ruta' | 'mantenimiento' | 'fuera_servicio';

export interface Vehiculo {
  id: number;
  numero_unidad: string;
  placa: string;
  marca: string;
  modelo: string;
  anio_fabricacion: number;
  capacidad_pasajeros: number;
  estado: EstadoVehiculo;
  kilometraje: number;
  soat_vencimiento: string | null;
  revision_tecnica_vencimiento: string | null;
  notas: string | null;
  created_at: string;
}

export interface VehiculosStats {
  total: number;
  operativos: number;
  en_ruta: number;
  mantenimiento: number;
  fuera_servicio: number;
}

export interface VehiculosResponse {
  data: Vehiculo[];
  stats: VehiculosStats;
}

export const vehiculosApi = {
  getAll: async (params?: { search?: string; estado?: string }): Promise<VehiculosResponse> => {
    const res = await api.get<VehiculosResponse>('/vehiculos', { params });
    return res.data;
  },

  getById: async (id: number): Promise<Vehiculo> => {
    const res = await api.get<Vehiculo>(`/vehiculos/${id}`);
    return res.data;
  },

  create: async (data: Record<string, unknown>): Promise<{ message: string; vehiculo: Vehiculo }> => {
    const res = await api.post('/vehiculos', data);
    return res.data;
  },

  update: async (id: number, data: Record<string, unknown>): Promise<{ message: string; vehiculo: Vehiculo }> => {
    const res = await api.put(`/vehiculos/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete(`/vehiculos/${id}`);
    return res.data;
  },
};
