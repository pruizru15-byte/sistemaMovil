import { api } from './api';
import type { UserProfile } from './auth.api';

export interface ConductorInfo {
  id: number;
  licencia_numero: string;
  licencia_categoria: string;
  licencia_vencimiento: string;
  estado: string;
}

export interface PerfilDetallado extends UserProfile {
  conductor?: ConductorInfo | null;
}

export interface UpdatePerfilDto {
  phone?: string;
  address?: string;
  email?: string;
  photo_url?: string;
}

export interface UpdatePasswordDto {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export const perfilApi = {
  getPerfil: async (): Promise<PerfilDetallado> => {
    const res = await api.get<PerfilDetallado>('/perfil');
    return res.data;
  },

  updatePerfil: async (data: UpdatePerfilDto): Promise<{ message: string; user: UserProfile }> => {
    const res = await api.put<{ message: string; user: UserProfile }>('/perfil', data);
    return res.data;
  },

  updatePassword: async (data: UpdatePasswordDto): Promise<{ message: string }> => {
    const res = await api.put<{ message: string }>('/perfil/password', data);
    return res.data;
  },
};

