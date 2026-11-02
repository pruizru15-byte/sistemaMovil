import { api } from './api';

export interface NotificacionItem {
  id: number;
  user_id: number | null;
  role_target: 'admin' | 'supervisor' | 'conductor' | 'todos';
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'alerta' | 'incidencia' | 'turno' | 'asistencia';
  leido_en: string | null;
  created_at: string;
}

export interface NotificacionesResponse {
  data: NotificacionItem[];
  unread_count: number;
}

export interface CreateNotificacionDto {
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'alerta' | 'incidencia' | 'turno' | 'asistencia';
  role_target: 'admin' | 'supervisor' | 'conductor' | 'todos';
}

export const notificacionesApi = {
  getNotificaciones: async (): Promise<NotificacionesResponse> => {
    const res = await api.get<NotificacionesResponse>('/notificaciones');
    return res.data;
  },

  markAsRead: async (id: number): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>(`/notificaciones/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/notificaciones/read-all');
    return res.data;
  },

  createNotificacion: async (data: CreateNotificacionDto): Promise<{ message: string; notificacion: NotificacionItem }> => {
    const res = await api.post<{ message: string; notificacion: NotificacionItem }>('/notificaciones', data);
    return res.data;
  },
};
