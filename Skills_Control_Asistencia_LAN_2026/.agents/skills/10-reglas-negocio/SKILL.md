# Reglas funcionales y permisos

> Skill para agentes de desarrollo. Versión del paquete: 1.0 — 2026-10-17.

## Propósito y activación
Activar ante historias RF, roles, calendario, turnos, marcaciones, vehículos, rutas, perfil y reportes.

## Contexto obligatorio
- Proyecto académico de asistencia de conductores y turnos, terminal Ate.
- Operación **únicamente LAN Wi-Fi**, sin nube, internet, Firebase, CDNs o APIs pagadas durante la ejecución.
- Un servidor físico Windows/Docker; Laravel API + MySQL; React web y APK con Capacitor.
- Roles: Administrador, Supervisor y Conductor. Administrador con operaciones autorizadas y auditadas; baja lógica de usuarios con historial.
- Consultar siempre `AGENTS.md`, `docs/REQUISITOS.md`, `docs/DECISIONES.md` y contratos antes de implementar.

## Instrucciones de ejecución
1. Roles: Admin, Supervisor, Conductor; admin gestiona y desactiva, supervisor agenda/monitorea, conductor consulta y ejecuta lo asignado.
2. Auth: DNI único + contraseña; recuperación asistida sin correo; perfil propio editable con campos sensibles protegidos.
3. Conductores: estado activo, perfil, asignaciones y disponibilidad. Vehículos: unidad, placa, estado, no doble asignación activa conflictiva.
4. Turnos: fecha, hora, conductor, unidad, ruta, supervisor, estado, historial; validar solapamientos y cambios de última hora.
5. Asistencia: entrada/salida GPS, turno y ubicación permitida, tolerancia configurable, puntual/tarde/ausente; no corregir sin traza.
6. Servicios/rutas: ruta asignada por supervisor; conductor marca inicio/fin y reporta incidencias, no edita rutas oficiales.
7. Reportes: exportar CSV UTF-8 y Excel con filtros, sin fórmulas inyectables, permiso estricto.
8. Notificaciones: WebSockets LAN para app activa y persistencia de notificaciones leídas/no leídas; no prometer push con APK cerrada sin infraestructura adicional.
9. Dashboard: resumen en tiempo real de día/turno, ausencias y tardanzas recalculadas desde fuente de verdad.
10. Configuración: terminal, geocerca, precisión, tolerancia, políticas y auditoría.

## Convenciones y contratos
API valida transición de estados. Registrar quién/cuándo cambió cada asignación. Eliminación histórica lógica. Fechas con reloj servidor, zona America/Lima por terminal. No modificar registros históricos sin motivo y auditoría.

## Pruebas obligatorias
Matrices por rol y recurso; solapamientos, turno inexistente, GPS falso, cambio tardío de unidad, concurrencia, reasignación, doble marcado, perfil ajeno, exportación no autorizada.

## Errores y desviaciones prohibidas
No hacer conductor admin, no permitir editar DNI/rol libremente, no programar notificaciones de nube, no guardar datos de todos los usuarios en dispositivo conductor.

## Entregable del agente
- Resumen de archivos modificados y motivo.
- Resultado real de comandos/tests; no inventar pruebas exitosas.
- Riesgos, supuestos y cambios pendientes.
- Correspondencia con RF/RNF y evidencias de aceptación.

## Documentación oficial de referencia
- https://laravel.com/docs/13.x/authorization
- https://laravel.com/docs/13.x/broadcasting
- https://owasp.org/www-project-api-security/

## Condición de finalización
La funcionalidad cumple sus criterios de aceptación, pasa las pruebas pertinentes y no rompe el funcionamiento sin internet.
