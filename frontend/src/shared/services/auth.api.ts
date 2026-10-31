import { api } from './api';

export interface UserProfile {
  id: number;
  dni: string;
  name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  photo_url: string | null;
  role: 'admin' | 'supervisor' | 'conductor';
  is_active: boolean;
  password_must_change: boolean;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: UserProfile;
}

export const authApi = {
  login: async (dni: string, password: string, deviceName = 'web-lan'): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/login', {
      dni,
      password,
      device_name: deviceName,
    });
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<UserProfile> => {
    const res = await api.get<UserProfile>('/me');
    return res.data;
  },

  requestPasswordReset: async (dni: string, notes?: string): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/auth/password-reset-request', {
      dni,
      notes,
    });
    return res.data;
  },
};
