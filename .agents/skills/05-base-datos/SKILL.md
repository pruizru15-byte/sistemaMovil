# Base de datos MySQL y migraciones

> Skill para agentes de desarrollo. Versión del paquete: 1.0 — 2026-10-17.

## Propósito y activación
Activar al crear tablas, relaciones, índices, consultas, reportes y backups.

## Contexto obligatorio
- Proyecto académico de asistencia de conductores y turnos, terminal Ate.
- Operación **únicamente LAN Wi-Fi**, sin nube, internet, Firebase, CDNs o APIs pagadas durante la ejecución.
- Un servidor físico Windows/Docker; Laravel API + MySQL; React web y APK con Capacitor.
- Roles: Administrador, Supervisor y Conductor. Administrador con operaciones autorizadas y auditadas; baja lógica de usuarios con historial.
- Consultar siempre `AGENTS.md`, `docs/REQUISITOS.md`, `docs/DECISIONES.md` y contratos antes de implementar.

## Instrucciones de ejecución
1. MySQL 8/InnoDB con charset `utf8mb4`; usar phpMyAdmin sólo como herramienta administrativa.
2. Entidades iniciales: usuarios, roles, permisos, conductores, vehiculos, terminales, zonas_geograficas, rutas, paradas(opcional), turnos, asignaciones_turno, servicios, asistencias, incidencias, notificaciones, auditorias, recuperaciones, configuraciones.
3. Definir PK estables, FK, timestamps, índices compuestos por conductor/fecha/estado y claves únicas para idempotencia.
4. Guardar GPS lat/lon DECIMAL apropiado, accuracy_m, captured_at, distance_m y resultado; no recopilar trayectoria continua por defecto.
5. Versionar migraciones y seeders demo no sensibles; revisar antes de migraciones destructivas.
6. Respetar relaciones históricas: `deleted_at` en usuarios; no cascada destructiva de asistencias.
7. Prever exportación, backup, restauración, retención y cifrado del medio de respaldo.

## Convenciones y contratos
Campos de auditoría creador/modificador cuando corresponda. No cambiar esquema a mano en phpMyAdmin. MySQL nunca expuesto a Wi-Fi; sólo red Docker interna. Credenciales distintas por servicio y mínimo privilegio.

## Pruebas obligatorias
Migrar desde cero, rollback si viable, seed demo, FK, integridad, concurrencia, backup/restauración con verificaciones, explain para consultas de dashboard.

## Errores y desviaciones prohibidas
No usar phpMyAdmin como base de datos; no guardar contraseñas reversibles, claves hardcoded, borrar historia ni permitir FK huérfanas.

## Entregable del agente
- Resumen de archivos modificados y motivo.
- Resultado real de comandos/tests; no inventar pruebas exitosas.
- Riesgos, supuestos y cambios pendientes.
- Correspondencia con RF/RNF y evidencias de aceptación.

## Documentación oficial de referencia
- https://dev.mysql.com/doc/refman/8.0/en/
- https://laravel.com/docs/13.x/migrations
- https://laravel.com/docs/13.x/eloquent-relationships

## Condición de finalización
La funcionalidad cumple sus criterios de aceptación, pasa las pruebas pertinentes y no rompe el funcionamiento sin internet.
