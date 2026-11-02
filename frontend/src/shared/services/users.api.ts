import { api } from './api';
import type { UserProfile } from './auth.api';

export interface UserPaginatedResponse {
  current_page: number;
  data: UserProfile[];
  total: number;
  last_page: number;
  per_page: number;
}

export interface CreateUserDto {
  dni: string;
  name: string;
  last_name: string;
  role: 'admin' | 'supervisor' | 'conductor';
  password: string;
  email?: string;
  phone?: string;
  address?: string;
  licencia_numero?: string;
  licencia_categoria?: string;
  licencia_vencimiento?: string;
}

export interface UpdateUserDto {
  name: string;
  last_name: string;
  role: 'admin' | 'supervisor' | 'conductor';
  email?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
}

export const usersApi = {
  getUsers: async (params?: {
    role?: string;
    is_active?: boolean;
    search?: string;
    page?: number;
  }): Promise<UserPaginatedResponse> => {
    const q = new URLSearchParams();
    if (params?.role) q.append('role', params.role);
    if (params?.is_active !== undefined) q.append('is_active', String(params.is_active));
    if (params?.search) q.append('search', params.search);
    if (params?.page) q.append('page', String(params.page));

    const res = await api.get<UserPaginatedResponse>(`/users?${q.toString()}`);
    return res.data;
  },

  createUser: async (data: CreateUserDto): Promise<{ message: string; user: UserProfile }> => {
    const res = await api.post<{ message: string; user: UserProfile }>('/users', data);
    return res.data;
  },

  updateUser: async (id: number, data: UpdateUserDto): Promise<{ message: string; user: UserProfile }> => {
    const res = await api.put<{ message: string; user: UserProfile }>(`/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(`/users/${id}`);
    return res.data;
  },

  toggleStatus: async (id: number): Promise<{ message: string; is_active: boolean }> => {
    const res = await api.post<{ message: string; is_active: boolean }>(`/users/${id}/toggle-status`);
    return res.data;
  },

  resetPassword: async (id: number, password: string): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>(`/users/${id}/reset-password`, { password });
    return res.data;
  },
};
