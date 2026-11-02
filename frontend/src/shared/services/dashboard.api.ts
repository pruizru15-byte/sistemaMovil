import { api } from './api';

export interface DayAttendanceStat {
  day: string;
  fecha: string;
  asistencias: number;
  programadas: number;
  current: boolean;
}

export interface ActivityItem {
  hora: string;
  usuario: string;
  accion: string;
  modulo: string;
  detalle: string;
  estado: string;
}

export interface RoleDistribution {
  count: number;
  pct: number;
}

export interface DashboardStats {
  usuarios_activos: number;
  usuarios_total: number;
  conductores_programados: number;
  conductores_total: number;
  asistencias_hoy: number;
  programadas_hoy: number;
  turnos_hoy: number;
  servicios_activos: number;
  vehiculos_operativos: number;
  vehiculos_total: number;
  roles: {
    admin: RoleDistribution;
    supervisor: RoleDistribution;
    conductor: RoleDistribution;
    total: number;
  };
  semana: DayAttendanceStat[];
  actividades_recientes: ActivityItem[];
  timestamp: string;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },
};

