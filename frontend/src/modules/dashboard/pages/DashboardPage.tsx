import { useState, useEffect, type FC } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { ConductoresPage } from '../../conductores/pages/ConductoresPage';
import { VehiculosPage } from '../../vehiculos/pages/VehiculosPage';
import { TurnosPage } from '../../turnos/pages/TurnosPage';
import { RutasServiciosPage } from '../../rutas/pages/RutasServiciosPage';
import { AsistenciasPage } from '../../asistencia/pages/AsistenciasPage';
import { ReportesPage } from '../../reportes/pages/ReportesPage';
import { PerfilPage } from '../../perfil/pages/PerfilPage';
import { UsuariosPage } from '../../usuarios/pages/UsuariosPage';
import { ConfiguracionPage } from '../../configuracion/pages/ConfiguracionPage';
import { NotificacionesPage } from '../../notificaciones/pages/NotificacionesPage';
import { dashboardApi, type DashboardStats } from '../../../shared/services/dashboard.api';
import { notificacionesApi } from '../../../shared/services/notificaciones.api';
import {
  Bus,
  LayoutDashboard,
  Users,
  UserCheck,
  Truck,
  Calendar,
  ClipboardCheck,
  Route as RouteIcon,
  FileText,
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Search,
  Wifi,
  Database,
  Server,
  Radio,
  TrendingUp,
  LogIn,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const DashboardPage: FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Cerrar menú móvil al presionar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then(setDashboardStats)
      .catch(() => {});

    notificacionesApi
      .getNotificaciones()
      .then((res) => setUnreadCount(res.unread_count))
      .catch(() => {});
  }, [activeSection]);

  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor';

  // Menú de navegación exactamente como en los mockups
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { id: 'usuarios', label: 'Usuarios', icon: Users, show: isAdmin },
    { id: 'conductores', label: 'Conductores', icon: UserCheck, show: isAdmin || isSupervisor },
    { id: 'vehiculos', label: 'Vehículos', icon: Truck, show: isAdmin || isSupervisor },
    { id: 'turnos', label: 'Turnos', icon: Calendar, show: true },
    { id: 'asistencias', label: 'Asistencias', icon: ClipboardCheck, show: true },
    { id: 'rutas', label: 'Rutas y servicios', icon: RouteIcon, show: true },
    { id: 'reportes', label: 'Reportes', icon: FileText, show: isAdmin || isSupervisor },
    {
      id: 'notificaciones',
      label: 'Notificaciones',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
      show: true,
    },
    { id: 'configuracion', label: 'Configuración', icon: Settings, show: isAdmin },
    { id: 'perfil', label: 'Mi perfil', icon: User, show: true },
  ];

  // Datos para el gráfico de barras semanal
  const weekDataDefault = [
    { day: 'Lun 13', asistencias: 75, programadas: 90 },
    { day: 'Mar 14', asistencias: 82, programadas: 96 },
    { day: 'Mié 15', asistencias: 96, programadas: 120, current: true },
    { day: 'Jue 16', asistencias: 68, programadas: 92 },
    { day: 'Vie 17', asistencias: 88, programadas: 104 },
    { day: 'Sáb 18', asistencias: 72, programadas: 84 },
    { day: 'Dom 19', asistencias: 70, programadas: 80 },
  ];

  const displayWeekData =
    dashboardStats?.semana && dashboardStats.semana.length > 0
      ? dashboardStats.semana
      : weekDataDefault;

  const maxWeekScale = Math.max(
    ...displayWeekData.map((d) => Math.max(d.asistencias, d.programadas)),
    100
  );

  const fechaActualLegible = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const currentNavItem = navItems.find((i) => i.id === activeSection) || navItems[0];
  const CurrentIcon = currentNavItem.icon;

  return (
    <div className="min-h-screen flex bg-[#EDF3F8] text-[#0F172A] font-sans relative overflow-x-hidden">
      {/* ========================================================
          CAJÓN LATERAL MÓVIL (Off-Canvas Drawer con animación suave)
          ======================================================== */}
      {/* Backdrop oscuro translúcido */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer deslizable para teléfonos y tablets */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-[#E8EFF6] shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navegación móvil"
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Cabecera del Cajón */}
          <div className="p-5 flex items-center justify-between border-b border-[#F1F5F9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-[#1D68F2] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(29,104,242,0.3)] shrink-0">
                <Bus className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-[#0B1B3D] tracking-tight leading-tight">
                  Control Asistencia
                </h2>
                <p className="text-[10px] font-medium text-[#64748B]">Transporte de Personal</p>
              </div>
            </div>
            {/* Botón Cerrar (X) con área táctil >=44px */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#0B1B3D] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              title="Cerrar menú lateral"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menú de Navegación Móvil (Scrollable) */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1">
            <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#94A3B8]">
              Módulos del Sistema
            </p>
            {navItems.filter((i) => i.show).map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer min-h-[48px] ${
                    isActive
                      ? 'bg-[#1D68F2] text-white shadow-[0_4px_14px_rgba(29,104,242,0.25)]'
                      : 'text-[#334155] hover:bg-[#F8FAFD] hover:text-[#0B1B3D]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.4 : 2} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white text-[#1D68F2]' : 'bg-[#EF4444] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Pie del Cajón Móvil */}
        <div className="p-4 border-t border-[#F1F5F9] bg-[#F8FAFD]/60 space-y-3 shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-[#E8EFF6] text-[11px]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] ring-3 ring-[#10B981]/20 animate-pulse shrink-0" />
            <div className="leading-tight">
              <span className="font-bold text-[#0B1B3D]">Red local LAN</span>
              <p className="text-[10px] text-[#64748B]">Sistema en línea</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#1D68F2] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0B1B3D] truncate">
                  {user?.name} {user?.last_name}
                </p>
                <p className="text-[10px] font-semibold text-[#64748B] capitalize truncate">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-2 rounded-xl text-[#94A3B8] hover:text-[#EF4444] hover:bg-red-50 transition-colors cursor-pointer shrink-0"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================
          BARRA LATERAL DESKTOP (Colapsable / Encojible a modo icono)
          ======================================================== */}
      <aside
        className={`bg-white border-r border-[#E8EFF6] hidden md:flex flex-col justify-between shrink-0 shadow-xs transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo Superior con botón de encojer/expandir */}
          <div
            className={`p-4 border-b border-[#F1F5F9] flex items-center ${
              isSidebarCollapsed ? 'justify-center flex-col gap-2' : 'justify-between gap-3'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-[16px] bg-[#1D68F2] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(29,104,242,0.3)] shrink-0">
                <Bus className="w-6 h-6" strokeWidth={2.2} />
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <h2 className="font-extrabold text-[15px] text-[#0B1B3D] tracking-tight leading-tight truncate">
                    Control de Asistencia
                  </h2>
                  <p className="text-[11px] font-medium text-[#64748B] truncate">Transporte de Personal</p>
                </div>
              )}
            </div>

            {/* Botón para encoger / expandir la barra lateral */}
            <button
              onClick={toggleSidebarCollapse}
              className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#0B1B3D] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Expandir barra lateral' : 'Encoger barra lateral'}
              aria-label={isSidebarCollapsed ? 'Expandir barra lateral' : 'Encoger barra lateral'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Menú de Navegación Desktop */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1">
            {navItems.filter((i) => i.show).map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-2xl text-xs font-bold transition-all cursor-pointer relative ${
                    isSidebarCollapsed ? 'justify-center py-3 px-2' : 'justify-between px-4 py-3'
                  } ${
                    isActive
                      ? 'bg-[#1D68F2] text-white shadow-[0_6px_18px_rgba(29,104,242,0.25)]'
                      : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0B1B3D]'
                  }`}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3.5'}`}>
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.4 : 2} />
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </div>

                  {/* Badge en modo expandido */}
                  {!isSidebarCollapsed && item.badge && (
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                        isActive ? 'bg-white text-[#1D68F2]' : 'bg-[#EF4444] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Dot indicador en modo encogido */}
                  {isSidebarCollapsed && item.badge && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-2 ring-white" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tarjeta Inferior de Estado LAN */}
        <div className="p-3 border-t border-[#F1F5F9] shrink-0">
          {!isSidebarCollapsed ? (
            <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6] flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#10B981] ring-4 ring-[#10B981]/20 animate-pulse shrink-0" />
              <div className="text-[11px] leading-tight">
                <p className="font-bold text-[#0B1B3D]">Sistema en red local</p>
                <p className="text-[#64748B] font-medium mt-0.5">Conectado y operativo</p>
              </div>
            </div>
          ) : (
            <div
              className="flex justify-center p-2 rounded-xl bg-[#F8FAFD] border border-[#E8EFF6]"
              title="Sistema en red local: Conectado y operativo"
            >
              <div className="w-3 h-3 rounded-full bg-[#10B981] ring-4 ring-[#10B981]/20 animate-pulse" />
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================
          ÁREA PRINCIPAL DE CONTENIDO
          ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Cabecera Superior (Top Bar Responsive) */}
        <header className="h-16 px-4 sm:px-8 bg-white border-b border-[#E8EFF6] flex items-center justify-between gap-3 shrink-0 sticky top-0 z-20 shadow-xs">
          {/* Lado Izquierdo: Botón Hamburguesa en Móvil + Módulo Actual */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Botón Hamburguesa Móvil (Área táctil >=44px) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden w-11 h-11 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6] flex items-center justify-center text-[#0B1B3D] hover:bg-[#F1F5F9] active:scale-95 transition-all cursor-pointer shrink-0"
              title="Abrir menú de módulos"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Módulo Activo en Pantallas Móviles */}
            <div className="flex items-center gap-2.5 md:hidden min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
                <CurrentIcon className="w-4 h-4" strokeWidth={2.4} />
              </div>
              <span className="text-sm font-extrabold text-[#0B1B3D] truncate max-w-[150px] sm:max-w-xs">
                {currentNavItem.label}
              </span>
            </div>

            {/* Buscador Estilo Pill (Desktop) */}
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Buscar usuarios, vehículos, rutas o reportes..."
                className="w-full pl-11 pr-20 py-2.5 rounded-full text-xs bg-[#F8FAFD] border border-[#E2E8F0] placeholder-[#94A3B8] text-[#0F172A] focus:outline-none focus:border-[#1D68F2] focus:bg-white transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-[#EDF2F7] text-[10px] font-bold text-[#64748B]">
                Ctrl + K
              </span>
            </div>
          </div>

          {/* Acciones de la Derecha */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Campana de Notificaciones con Badge */}
            <button
              onClick={() => setActiveSection('notificaciones')}
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#475569] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              title="Notificaciones"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-black flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Switch de Tema Claro / Oscuro */}
            <button
              onClick={toggleTheme}
              className="w-13 sm:w-14 h-7 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] p-0.5 flex items-center justify-between px-1.5 relative cursor-pointer"
              title="Cambiar tema"
              aria-label="Cambiar tema"
            >
              <Sun className={`w-3.5 h-3.5 text-[#F59E0B] z-10 transition-opacity ${theme === 'light' ? 'opacity-100' : 'opacity-40'}`} />
              <Moon className={`w-3.5 h-3.5 text-[#6366F1] z-10 transition-opacity ${theme === 'dark' ? 'opacity-100' : 'opacity-40'}`} />
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-[#1D68F2] shadow-sm transition-transform ${
                  theme === 'dark' ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>

            {/* Separador */}
            <div className="h-7 w-[1px] bg-[#E8EFF6] hidden sm:block" />

            {/* Perfil de Usuario */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setActiveSection('perfil')}
                className="w-9 h-9 rounded-full bg-[#1D68F2] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 hover:ring-2 hover:ring-[#1D68F2]/30 transition-all cursor-pointer"
                title="Ver mi perfil"
              >
                <User className="w-4 h-4" />
              </button>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#0B1B3D] leading-tight">
                  {user?.name} {user?.last_name}
                </p>
                <p className="text-[10px] font-semibold text-[#64748B] capitalize">
                  {user?.role === 'admin'
                    ? 'Administrador del sistema'
                    : user?.role === 'supervisor'
                    ? 'Supervisor de operaciones'
                    : 'Conductor de flota'}
                </p>
              </div>

              {/* Botón Salir */}
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-2 rounded-xl text-[#94A3B8] hover:text-[#EF4444] hover:bg-red-50 transition-colors ml-0.5 cursor-pointer"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ========================================================
            CUERPO DE LA APLICACIÓN (con padding inferior para barra móvil)
            ======================================================== */}
        <main className="p-4 sm:p-8 pb-24 md:pb-8 flex-1 overflow-y-auto space-y-6">
          {/* Vistas Secundarias Conectadas */}
          {activeSection === 'usuarios' && <UsuariosPage />}
          {activeSection === 'conductores' && <ConductoresPage />}
          {activeSection === 'vehiculos' && <VehiculosPage />}
          {activeSection === 'turnos' && <TurnosPage />}
          {activeSection === 'rutas' && <RutasServiciosPage />}
          {activeSection === 'asistencias' && <AsistenciasPage />}
          {activeSection === 'reportes' && <ReportesPage />}
          {activeSection === 'notificaciones' && <NotificacionesPage />}
          {activeSection === 'configuracion' && <ConfiguracionPage />}
          {activeSection === 'perfil' && <PerfilPage />}

          {/* Mensaje Informativo para Secciones en Construcción */}
          {activeSection !== 'usuarios' &&
           activeSection !== 'conductores' &&
           activeSection !== 'vehiculos' &&
           activeSection !== 'turnos' &&
           activeSection !== 'rutas' &&
           activeSection !== 'asistencias' &&
           activeSection !== 'reportes' &&
           activeSection !== 'notificaciones' &&
           activeSection !== 'configuracion' &&
           activeSection !== 'perfil' &&
           activeSection !== 'dashboard' && (
            <div className="p-12 text-center rounded-[28px] bg-white border border-[#E8EFF6] shadow-sm max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-[20px] bg-[#E1EDFD] text-[#1D68F2] flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-[#0B1B3D] capitalize mb-1">
                Módulo: {activeSection}
              </h2>
              <p className="text-xs text-[#64748B] mb-5">
                Panel preparado para la siguiente fase de desarrollo de reportes y configuración LAN.
              </p>
              <button
                onClick={() => setActiveSection('dashboard')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D6] shadow-md transition-all cursor-pointer"
              >
                Volver al Dashboard
              </button>
            </div>
          )}

          {/* VISTA PRINCIPAL: DASHBOARD (Fiel a los Mockups de Referencia) */}
          {activeSection === 'dashboard' && (
            <>
              {/* Título de la Página y Fecha */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#0B1B3D] tracking-tight">
                    {isAdmin
                      ? 'Panel de control - Administrador'
                      : isSupervisor
                      ? 'Panel de control - Supervisor'
                      : 'Panel de control - Conductor'}
                  </h1>
                  <p className="text-xs font-medium text-[#64748B] mt-0.5">
                    {isAdmin
                      ? 'Gestión general del sistema en red local'
                      : isSupervisor
                      ? 'Monitoreo operativo y control diario'
                      : 'Consulta de asignación, servicios y marcación GPS'}
                  </p>
                </div>

                {/* Pill de Fecha */}
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white border border-[#E8EFF6] text-xs font-bold text-[#334155] shadow-xs shrink-0 capitalize">
                  <Calendar className="w-4 h-4 text-[#1D68F2]" />
                  <span>{fechaActualLegible} · Sistema Operativo LAN</span>
                </div>
              </div>

              {/* ========================================================
                  4 TARJETAS KPI SUPERIORES (En vivo con la base de datos)
                  ======================================================== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* KPI 1: Usuarios Activos / Conductores */}
                <div
                  onClick={() => setActiveSection(isAdmin ? 'usuarios' : 'conductores')}
                  className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] hover:shadow-[0_15px_30px_rgba(29,104,242,0.08)] hover:border-[#BFDBFE] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#64748B]">
                        {isAdmin ? 'Usuarios activos' : 'Conductores programados'}
                      </p>
                      <div className="mt-2 flex items-baseline gap-2.5">
                        <span className="text-3xl font-extrabold text-[#0B1B3D]">
                          {isAdmin
                            ? dashboardStats?.usuarios_activos ?? 128
                            : dashboardStats?.conductores_programados ?? 92}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#10B981]">
                          <TrendingUp className="w-3.5 h-3.5" /> En línea
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-[16px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-[#94A3B8] mt-3">
                    {isAdmin
                      ? `de ${dashboardStats?.usuarios_total ?? 150} registrados`
                      : `de ${dashboardStats?.conductores_total ?? 100} conductores`}
                  </p>
                </div>

                {/* KPI 2: Asistencias de Hoy */}
                <div
                  onClick={() => setActiveSection('asistencias')}
                  className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] hover:shadow-[0_15px_30px_rgba(29,104,242,0.08)] hover:border-[#BFDBFE] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#64748B]">Asistencias de hoy</p>
                      <div className="mt-2 flex items-baseline gap-2.5">
                        <span className="text-3xl font-extrabold text-[#0B1B3D]">
                          {dashboardStats?.asistencias_hoy ?? 96}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#10B981]">
                          <TrendingUp className="w-3.5 h-3.5" /> Hoy
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-[16px] bg-[#EAF8F1] text-[#10B981] flex items-center justify-center shrink-0">
                      <ClipboardCheck className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-[#94A3B8] mt-3">
                    de {dashboardStats?.programadas_hoy ?? 120} programadas
                  </p>
                </div>

                {/* KPI 3: Turnos / Rutas en Servicio */}
                <div
                  onClick={() => setActiveSection(isAdmin ? 'turnos' : 'rutas')}
                  className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] hover:shadow-[0_15px_30px_rgba(29,104,242,0.08)] hover:border-[#BFDBFE] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#64748B]">
                        {isAdmin ? 'Turnos programados' : 'Rutas en servicio'}
                      </p>
                      <div className="mt-2 flex items-baseline gap-2.5">
                        <span className="text-3xl font-extrabold text-[#0B1B3D]">
                          {isAdmin
                            ? dashboardStats?.turnos_hoy ?? 24
                            : dashboardStats?.servicios_activos ?? 14}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#10B981]">
                          <TrendingUp className="w-3.5 h-3.5" /> Activo
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-[16px] bg-[#F3ECFD] text-[#8B5CF6] flex items-center justify-center shrink-0">
                      {isAdmin ? <Calendar className="w-6 h-6" /> : <RouteIcon className="w-6 h-6" />}
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-[#94A3B8] mt-3">
                    {isAdmin ? 'Hoy, turnos rotativos' : 'Rutas en ejecución'}
                  </p>
                </div>

                {/* KPI 4: Vehículos Operativos */}
                <div
                  onClick={() => setActiveSection('vehiculos')}
                  className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] hover:shadow-[0_15px_30px_rgba(29,104,242,0.08)] hover:border-[#BFDBFE] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#64748B]">Vehículos operativos</p>
                      <div className="mt-2 flex items-baseline gap-2.5">
                        <span className="text-3xl font-extrabold text-[#0B1B3D]">
                          {dashboardStats?.vehiculos_operativos ?? 18}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#10B981]">
                          <TrendingUp className="w-3.5 h-3.5" /> Disponible
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-[16px] bg-[#E8F4FE] text-[#0284C7] flex items-center justify-center shrink-0">
                      <Bus className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-[#94A3B8] mt-3">
                    de {dashboardStats?.vehiculos_total ?? 19} unidades en flota
                  </p>
                </div>
              </div>

              {/* ========================================================
                  SECCIÓN CENTRAL: GRÁFICO COMPARATIVO + DONUT ROLES
                  ======================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Gráfico de Barras: Asistencias de la semana (8 Cols) */}
                <div className="lg:col-span-8 p-6 sm:p-7 rounded-[28px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <h3 className="text-base font-extrabold text-[#0B1B3D]">
                        Asistencias de la semana
                      </h3>
                      <p className="text-xs font-medium text-[#64748B]">
                        Comparativa de asistencias registradas por día
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <div className="flex items-center gap-2 text-[#0B1B3D]">
                        <span className="w-3 h-3 rounded-full bg-[#1D68F2]" />
                        <span>Asistencias</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#64748B]">
                        <span className="w-3 h-3 rounded-full bg-[#BFDBFE]" />
                        <span>Programadas</span>
                      </div>
                    </div>
                  </div>

                  {/* Visualizador de Barras Semanales */}
                  <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-[#F1F5F9] pb-2 relative">
                    {displayWeekData.map((d) => (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                        {/* Tooltip al hacer hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 p-2 rounded-xl bg-white border border-[#E8EFF6] shadow-lg z-20 text-[10px] pointer-events-none whitespace-nowrap">
                          <p className="font-bold text-[#0B1B3D]">{d.day}</p>
                          <p className="text-[#1D68F2] font-semibold">Asistencias: {d.asistencias}</p>
                          <p className="text-[#64748B]">Programadas: {d.programadas}</p>
                        </div>

                        <div className="w-full max-w-[36px] flex items-end gap-1 h-full">
                          {/* Barra Asistencias */}
                          <div
                            className={`w-1/2 rounded-t-lg transition-all ${
                              d.current ? 'bg-[#1D68F2] shadow-sm' : 'bg-[#1D68F2]/90 hover:bg-[#1D68F2]'
                            }`}
                            style={{ height: `${Math.min(100, Math.max(8, (d.asistencias / maxWeekScale) * 100))}%` }}
                          />
                          {/* Barra Programadas */}
                          <div
                            className="w-1/2 rounded-t-lg bg-[#BFDBFE] transition-all hover:bg-[#93C5FD]"
                            style={{ height: `${Math.min(100, Math.max(8, (d.programadas / maxWeekScale) * 100))}%` }}
                          />
                        </div>
                        <span className={`text-[11px] font-bold ${d.current ? 'text-[#1D68F2]' : 'text-[#64748B]'}`}>
                          {d.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Donut Chart: Distribución de Roles (4 Cols) */}
                <div className="lg:col-span-4 p-6 sm:p-7 rounded-[28px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)] flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B1B3D]">
                      Distribución de roles
                    </h3>
                    <p className="text-xs font-medium text-[#64748B] mb-4">
                      Usuarios registrados en el sistema
                    </p>

                    {/* Donut circular */}
                    <div className="relative w-36 h-36 mx-auto my-3 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="12" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1D68F2" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="98" strokeLinecap="round" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#38BDF8" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="200" strokeLinecap="round" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#818CF8" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="235" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-black text-[#0B1B3D]">
                          {dashboardStats?.roles?.total ?? 150}
                        </span>
                        <span className="text-[10px] font-bold text-[#64748B]">Usuarios</span>
                      </div>
                    </div>
                  </div>

                  {/* Leyenda de Roles con Conteo y % */}
                  <div className="space-y-2 pt-3 border-t border-[#F1F5F9] text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-[#0B1B3D]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1D68F2]" />
                        <span>Administradores</span>
                      </div>
                      <span className="font-bold text-[#64748B]">
                        {dashboardStats?.roles?.admin.count ?? 5} · {dashboardStats?.roles?.admin.pct ?? 3.3}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-[#0B1B3D]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                        <span>Supervisores</span>
                      </div>
                      <span className="font-bold text-[#64748B]">
                        {dashboardStats?.roles?.supervisor.count ?? 18} · {dashboardStats?.roles?.supervisor.pct ?? 12.0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-[#0B1B3D]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#818CF8]" />
                        <span>Conductores</span>
                      </div>
                      <span className="font-bold text-[#64748B]">
                        {dashboardStats?.roles?.conductor.count ?? 92} · {dashboardStats?.roles?.conductor.pct ?? 61.3}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  FILA INFERIOR: ACTIVIDAD RECIENTE + ESTADO DEL SISTEMA
                  ======================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Tabla de Actividad Reciente (8 Cols) */}
                <div className="lg:col-span-8 p-6 sm:p-7 rounded-[28px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)]">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-base font-extrabold text-[#0B1B3D]">
                        Actividad reciente
                      </h3>
                      <p className="text-xs font-medium text-[#64748B]">
                        Últimos eventos registrados en el sistema
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSection('asistencias')}
                      className="px-3 py-1.5 rounded-xl bg-[#F8FAFD] text-[#1D68F2] text-xs font-bold hover:bg-[#EBF3FE] transition-colors cursor-pointer"
                    >
                      Ver todos
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#F1F5F9] text-[#64748B]">
                          <th className="pb-3 font-bold">Hora</th>
                          <th className="pb-3 font-bold">Usuario</th>
                          <th className="pb-3 font-bold">Acción</th>
                          <th className="pb-3 font-bold">Detalle</th>
                          <th className="pb-3 font-bold text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F8FAFD]">
                        {dashboardStats?.actividades_recientes && dashboardStats.actividades_recientes.length > 0 ? (
                          dashboardStats.actividades_recientes.map((act, idx) => (
                            <tr key={idx}>
                              <td className="py-3 font-mono font-medium text-[#64748B]">{act.hora}</td>
                              <td className="py-3 font-bold text-[#0B1B3D]">{act.usuario}</td>
                              <td className="py-3">
                                <span className="inline-flex items-center gap-1.5 text-[#10B981] font-bold">
                                  <LogIn className="w-3.5 h-3.5" /> {act.accion}
                                </span>
                              </td>
                              <td className="py-3 text-[#64748B]">{act.detalle}</td>
                              <td className="py-3 text-right">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#DEF7EC] text-[#03543F]">
                                  {act.estado}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <>
                            <tr>
                              <td className="py-3 font-mono font-medium text-[#64748B]">07:02</td>
                              <td className="py-3 font-bold text-[#0B1B3D]">Carlos Mendoza</td>
                              <td className="py-3">
                                <span className="inline-flex items-center gap-1.5 text-[#10B981] font-bold">
                                  <LogIn className="w-3.5 h-3.5" /> Registro de asistencia
                                </span>
                              </td>
                              <td className="py-3 text-[#64748B]">Ingreso - Turno Mañana</td>
                              <td className="py-3 text-right">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#DEF7EC] text-[#03543F]">
                                  Exitoso
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 font-mono font-medium text-[#64748B]">06:58</td>
                              <td className="py-3 font-bold text-[#0B1B3D]">Ana Torres</td>
                              <td className="py-3">
                                <span className="inline-flex items-center gap-1.5 text-[#1D68F2] font-bold">
                                  <LogIn className="w-3.5 h-3.5" /> Inicio de sesión
                                </span>
                              </td>
                              <td className="py-3 text-[#64748B]">Acceso al sistema</td>
                              <td className="py-3 text-right">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#DEF7EC] text-[#03543F]">
                                  Exitoso
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 font-mono font-medium text-[#64748B]">06:55</td>
                              <td className="py-3 font-bold text-[#0B1B3D]">Luis Ramírez</td>
                              <td className="py-3">
                                <span className="inline-flex items-center gap-1.5 text-[#10B981] font-bold">
                                  <LogIn className="w-3.5 h-3.5" /> Registro de asistencia
                                </span>
                              </td>
                              <td className="py-3 text-[#64748B]">Ingreso - Turno Mañana</td>
                              <td className="py-3 text-right">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#DEF7EC] text-[#03543F]">
                                  Exitoso
                                </span>
                              </td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Estado del Sistema LAN (4 Cols) */}
                <div className="lg:col-span-4 p-6 sm:p-7 rounded-[28px] bg-white border border-[#E8EFF6] shadow-[0_10px_30px_rgba(29,104,242,0.04)] space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B1B3D]">
                      Estado del sistema
                    </h3>
                    <p className="text-xs font-medium text-[#64748B]">
                      Componentes principales en red local
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1D68F2] flex items-center justify-center">
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-[#0B1B3D]">Servidor local</p>
                          <p className="text-[10px] text-[#64748B]">192.168.1.10</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DEF7EC] text-[#03543F]">
                        ● En línea
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1D68F2] flex items-center justify-center">
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-[#0B1B3D]">Base de datos MySQL</p>
                          <p className="text-[10px] text-[#64748B]">v8.0.36</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DEF7EC] text-[#03543F]">
                        ● Operativa
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1D68F2] flex items-center justify-center">
                          <Wifi className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-[#0B1B3D]">Red Wi-Fi</p>
                          <p className="text-[10px] text-[#64748B]">Red local estable</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DEF7EC] text-[#03543F]">
                        ● Conectada
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1D68F2] flex items-center justify-center">
                          <Radio className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-[#0B1B3D]">GPS de vehículos</p>
                          <p className="text-[10px] text-[#64748B]">18 de 19 en línea</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DEF7EC] text-[#03543F]">
                        ● Activo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        {/* ========================================================
            BARRA DE NAVEGACIÓN INFERIOR MÓVIL (Touch-Friendly Native Style)
            ======================================================== */}
        <nav
          className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-[#E8EFF6] px-2 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around"
          aria-label="Navegación inferior móvil"
        >
          {[
            { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
            { id: 'asistencias', label: 'Asistencia', icon: ClipboardCheck },
            { id: 'turnos', label: 'Turnos', icon: Calendar },
            { id: 'rutas', label: 'Rutas', icon: RouteIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSection(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[48px] rounded-2xl text-[10px] font-bold transition-all cursor-pointer ${
                  isActive ? 'text-[#1D68F2]' : 'text-[#64748B] hover:text-[#0B1B3D]'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-[#EBF3FE] shadow-xs' : ''}`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="mt-0.5 truncate">{tab.label}</span>
              </button>
            );
          })}

          {/* Botón para Abrir el Menú Lateral Completo (Módulos) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[48px] rounded-2xl text-[10px] font-bold transition-all cursor-pointer ${
              isMobileMenuOpen || !['dashboard', 'asistencias', 'turnos', 'rutas'].includes(activeSection)
                ? 'text-[#1D68F2]'
                : 'text-[#64748B] hover:text-[#0B1B3D]'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all relative ${
                isMobileMenuOpen || !['dashboard', 'asistencias', 'turnos', 'rutas'].includes(activeSection)
                  ? 'bg-[#EBF3FE] shadow-xs'
                  : ''
              }`}
            >
              <Menu className="w-5 h-5" strokeWidth={2.2} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-2 ring-white" />
              )}
            </div>
            <span className="mt-0.5 truncate">Módulos</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
