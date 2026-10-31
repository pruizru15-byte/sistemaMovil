import { useState, type FC } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { ConductoresPage } from '../../conductores/pages/ConductoresPage';
import { VehiculosPage } from '../../vehiculos/pages/VehiculosPage';
import { TurnosPage } from '../../turnos/pages/TurnosPage';
import { RutasServiciosPage } from '../../rutas/pages/RutasServiciosPage';
import { AsistenciasPage } from '../../asistencia/pages/AsistenciasPage';
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
  Edit3,
} from 'lucide-react';

export const DashboardPage: FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeSection, setActiveSection] = useState<string>('dashboard');

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
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell, badge: 3, show: true },
    { id: 'configuracion', label: 'Configuración', icon: Settings, show: isAdmin },
    { id: 'perfil', label: 'Mi perfil', icon: User, show: true },
  ];

  // Datos para el gráfico de barras semanal (exacto al mockup)
  const weekData = [
    { day: 'Lun 13', asistencias: 75, programadas: 90 },
    { day: 'Mar 14', asistencias: 82, programadas: 96 },
    { day: 'Mié 15', asistencias: 96, programadas: 120, current: true },
    { day: 'Jue 16', asistencias: 68, programadas: 92 },
    { day: 'Vie 17', asistencias: 88, programadas: 104 },
    { day: 'Sáb 18', asistencias: 72, programadas: 84 },
    { day: 'Dom 19', asistencias: 70, programadas: 80 },
  ];

  return (
    <div className="min-h-screen flex bg-[#EDF3F8] text-[#0F172A] font-sans">
      {/* ========================================================
          BARRA LATERAL / SIDEBAR (Exacta al Mockup Oficial)
          ======================================================== */}
      <aside className="w-64 bg-white border-r border-[#E8EFF6] hidden md:flex flex-col justify-between shrink-0 shadow-xs">
        <div>
          {/* Logo Superior con Squircle Azul */}
          <div className="p-6 flex items-center gap-3.5 border-b border-[#F1F5F9]">
            <div className="w-11 h-11 rounded-[16px] bg-[#1D68F2] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(29,104,242,0.3)] shrink-0">
              <Bus className="w-6 h-6" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="font-extrabold text-[15px] text-[#0B1B3D] tracking-tight leading-tight">
                Control de Asistencia
              </h2>
              <p className="text-[11px] font-medium text-[#64748B]">Transporte de Personal</p>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="p-3.5 space-y-1">
            {navItems.filter((i) => i.show).map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1D68F2] text-white shadow-[0_6px_18px_rgba(29,104,242,0.25)]'
                      : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0B1B3D]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.4 : 2} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-[10px] flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tarjeta Inferior de Estado LAN (Mockup Oficial) */}
        <div className="p-4 m-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF6] flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#10B981] ring-4 ring-[#10B981]/20 animate-pulse shrink-0" />
          <div className="text-[11px] leading-tight">
            <p className="font-bold text-[#0B1B3D]">Sistema en red local</p>
            <p className="text-[#64748B] font-medium mt-0.5">Conectado y operativo</p>
          </div>
        </div>
      </aside>

      {/* ========================================================
          ÁREA PRINCIPAL DE CONTENIDO
          ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Cabecera Superior (Top Bar) */}
        <header className="h-16 px-6 sm:px-8 bg-white border-b border-[#E8EFF6] flex items-center justify-between gap-4 shrink-0">
          {/* Buscador Estilo Pill */}
          <div className="relative max-w-md w-full hidden sm:block">
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

          {/* Acciones de la Derecha */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {/* Campana de Notificaciones con Badge */}
            <button
              onClick={() => setActiveSection('notificaciones')}
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#475569] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-black flex items-center justify-center">
                3
              </span>
            </button>

            {/* Switch de Tema Claro / Oscuro */}
            <button
              onClick={toggleTheme}
              className="w-14 h-7 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] p-0.5 flex items-center justify-between px-1.5 relative cursor-pointer"
              title="Cambiar tema"
            >
              <Sun className={`w-3.5 h-3.5 text-[#F59E0B] z-10 transition-opacity ${theme === 'light' ? 'opacity-100' : 'opacity-40'}`} />
              <Moon className={`w-3.5 h-3.5 text-[#6366F1] z-10 transition-opacity ${theme === 'dark' ? 'opacity-100' : 'opacity-40'}`} />
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-[#1D68F2] shadow-sm transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>

            {/* Separador */}
            <div className="h-7 w-[1px] bg-[#E8EFF6]" />

            {/* Perfil de Usuario */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1D68F2] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
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
                className="p-2 rounded-xl text-[#94A3B8] hover:text-[#EF4444] hover:bg-red-50 transition-colors ml-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ========================================================
            CUERPO DE LA APLICACIÓN
            ======================================================== */}
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
          {/* Vistas Secundarias Conectadas */}
          {activeSection === 'conductores' && <ConductoresPage />}
          {activeSection === 'vehiculos' && <VehiculosPage />}
          {activeSection === 'turnos' && <TurnosPage />}
          {activeSection === 'rutas' && <RutasServiciosPage />}
          {activeSection === 'asistencias' && <AsistenciasPage />}

          {/* Mensaje Informativo para Secciones en Construcción */}
          {activeSection !== 'conductores' &&
           activeSection !== 'vehiculos' &&
           activeSection !== 'turnos' &&
           activeSection !== 'rutas' &&
           activeSection !== 'asistencias' &&
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
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white border border-[#E8EFF6] text-xs font-bold text-[#334155] shadow-xs shrink-0">
                  <Calendar className="w-4 h-4 text-[#1D68F2]" />
                  <span>Miércoles, 15 de enero de 2025 · 07:02 - Sistema operativo</span>
                </div>
              </div>

              {/* ========================================================
                  4 TARJETAS KPI SUPERIORES (Exactas al Mockup)
                  ======================================================== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* KPI 1: Usuarios Activos / Conductores */}
                <div
                  onClick={() => setActiveSection('conductores')}
                  className="p-5 rounded-[24px] bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(29,104,242,0.04)] hover:shadow-[0_15px_30px_rgba(29,104,242,0.08)] hover:border-[#BFDBFE] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#64748B]">
                        {isAdmin ? 'Usuarios activos' : 'Conductores programados'}
                      </p>
                      <div className="mt-2 flex items-baseline gap-2.5">
                        <span className="text-3xl font-extrabold text-[#0B1B3D]">
                          {isAdmin ? '128' : '92'}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#10B981]">
                          <TrendingUp className="w-3.5 h-3.5" /> 12%
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-[16px] bg-[#EBF3FE] text-[#1D68F2] flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-[#94A3B8] mt-3">
                    {isAdmin ? 'de 150 registrados' : 'de 100 conductores'}
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
                        <span className="text-3xl font-extrabold text-[#0B1B3D]">96</span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#10B981]">
                          <TrendingUp className="w-3.5 h-3.5" /> 8%
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-[16px] bg-[#EAF8F1] text-[#10B981] flex items-center justify-center shrink-0">
                      <ClipboardCheck className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-[#94A3B8] mt-3">
                    de 120 programadas
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
                          {isAdmin ? '24' : '14'}
                        </span>
                        {!isAdmin && (
                          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#10B981]">
                            <TrendingUp className="w-3.5 h-3.5" /> 7%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-[16px] bg-[#F3ECFD] text-[#8B5CF6] flex items-center justify-center shrink-0">
                      {isAdmin ? <Calendar className="w-6 h-6" /> : <RouteIcon className="w-6 h-6" />}
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-[#94A3B8] mt-3">
                    {isAdmin ? 'Hoy, 3 turnos rotativos' : 'de 16 rutas programadas'}
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
                        <span className="text-3xl font-extrabold text-[#0B1B3D]">18</span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#10B981]">
                          <TrendingUp className="w-3.5 h-3.5" /> 95%
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-[16px] bg-[#E8F4FE] text-[#0284C7] flex items-center justify-center shrink-0">
                      <Bus className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-[#94A3B8] mt-3">
                    de 19 unidades en flota
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
                    {/* Tooltip flotante en Miércoles (Fiel al Mockup) */}
                    <div className="absolute top-1 left-[32%] sm:left-[35%] -translate-x-1/2 p-2.5 rounded-xl bg-white border border-[#E8EFF6] shadow-[0_10px_25px_rgba(0,0,0,0.08)] z-10 text-[11px] pointer-events-none">
                      <p className="font-bold text-[#0B1B3D]">Mié 15 de ene</p>
                      <div className="flex items-center gap-1.5 text-[#1D68F2] font-semibold mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[#1D68F2]" />
                        <span>Asistencias: <strong>96</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#64748B] font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#BFDBFE]" />
                        <span>Programadas: 120</span>
                      </div>
                    </div>

                    {weekData.map((d) => (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="w-full max-w-[36px] flex items-end gap-1 h-full">
                          {/* Barra Asistencias */}
                          <div
                            className={`w-1/2 rounded-t-lg transition-all ${
                              d.current ? 'bg-[#1D68F2] shadow-sm' : 'bg-[#1D68F2]/90 hover:bg-[#1D68F2]'
                            }`}
                            style={{ height: `${(d.asistencias / 120) * 100}%` }}
                          />
                          {/* Barra Programadas */}
                          <div
                            className="w-1/2 rounded-t-lg bg-[#BFDBFE] transition-all hover:bg-[#93C5FD]"
                            style={{ height: `${(d.programadas / 120) * 100}%` }}
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
                        <span className="text-2xl font-black text-[#0B1B3D]">150</span>
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
                      <span className="font-bold text-[#64748B]">5 · 3.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-[#0B1B3D]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                        <span>Supervisores</span>
                      </div>
                      <span className="font-bold text-[#64748B]">18 · 12.0%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-[#0B1B3D]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#818CF8]" />
                        <span>Conductores</span>
                      </div>
                      <span className="font-bold text-[#64748B]">92 · 61.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-[#0B1B3D]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]" />
                        <span>Usuarios generales</span>
                      </div>
                      <span className="font-bold text-[#64748B]">35 · 23.3%</span>
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
                        <tr>
                          <td className="py-3 font-mono font-medium text-[#64748B]">06:50</td>
                          <td className="py-3 font-bold text-[#0B1B3D]">María López</td>
                          <td className="py-3">
                            <span className="inline-flex items-center gap-1.5 text-[#8B5CF6] font-bold">
                              <Edit3 className="w-3.5 h-3.5" /> Actualización de usuario
                            </span>
                          </td>
                          <td className="py-3 text-[#64748B]">Datos del conductor</td>
                          <td className="py-3 text-right">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#DEF7EC] text-[#03543F]">
                              Exitoso
                            </span>
                          </td>
                        </tr>
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
      </div>
    </div>
  );
};
