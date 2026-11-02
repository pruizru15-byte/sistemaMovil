import { api } from './api';

export interface GeocercaConfig {
  terminal_nombre: string;
  lat: number;
  lng: number;
  radio_metros: number;
}

export interface ToleranciaConfig {
  tardanza_minutos: number;
  anticipacion_minutos: number;
}

export interface ConfiguracionResponse {
  settings: Record<string, string>;
  geocerca: GeocercaConfig;
  tolerancias: ToleranciaConfig;
}

export interface UpdateConfiguracionDto {
  terminal_nombre?: string;
  geocerca_lat?: number;
  geocerca_lng?: number;
  geocerca_radio_metros?: number;
  tolerancia_tardanza_minutos?: number;
  anticipacion_maxima_minutos?: number;
  empresa_nombre?: string;
}

export const configuracionApi = {
  getConfig: async (): Promise<ConfiguracionResponse> => {
    const res = await api.get<ConfiguracionResponse>('/configuracion');
    return res.data;
  },

  updateConfig: async (data: UpdateConfiguracionDto): Promise<{ message: string }> => {
    const res = await api.put<{ message: string }>('/configuracion', data);
    return res.data;
  },
};
