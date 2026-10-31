# Backend Laravel y API REST

> Skill para agentes de desarrollo. Versión del paquete: 1.0 — 2026-10-17.

## Propósito y activación
Activar para endpoints, reglas servidor, validaciones, transacciones, eventos y procesos.

## Contexto obligatorio
- Proyecto académico de asistencia de conductores y turnos, terminal Ate.
- Operación **únicamente LAN Wi-Fi**, sin nube, internet, Firebase, CDNs o APIs pagadas durante la ejecución.
- Un servidor físico Windows/Docker; Laravel API + MySQL; React web y APK con Capacitor.
- Roles: Administrador, Supervisor y Conductor. Administrador con operaciones autorizadas y auditadas; baja lógica de usuarios con historial.
- Consultar siempre `AGENTS.md`, `docs/REQUISITOS.md`, `docs/DECISIONES.md` y contratos antes de implementar.

## Instrucciones de ejecución
1. Laravel 13.x con PHP 8.3+ compatible; usar controladores delgados, Form Requests, Services/Actions, Resources y Policies.
2. Agrupar módulos: Auth, Usuarios, Conductores, Vehiculos, Turnos, Asistencias, RutasServicios, Reportes, Notificaciones, Perfil, Configuracion (Dashboard como consultas).
3. Publicar `/api/v1` con respuestas JSON estables, paginación y códigos HTTP correctos.
4. Validar TODOS los campos en servidor, normalizar errores de dominio y capturar excepciones sin filtrar secretos.
5. Usar transacciones de MySQL para marcar asistencia o reasignar turnos.
6. Idempotencia por UUID del intento, índice único y hora del servidor; proteger doble clic/reintentos.
7. Event/broadcast tras commit para dashboard; Laravel Reverb en LAN; si socket falla, ofrecer refetch.
8. Fechas guardadas UTC; presentación en America/Lima; negocio con zona configurada del terminal.

## Convenciones y contratos
Controlador→Request→Action/Service→Eloquent/DB→Resource. Autorización Policy o Gate en cada recurso, `auth` y throttle. OpenAPI documentado. Eloquent relaciones, eager loading y consultas limitadas. No usar `APP_DEBUG=true` en despliegue.

## Pruebas obligatorias
Pest/PHPUnit: éxito/error, validación, auth, permisos, duplicados, transacciones, condiciones de carrera, difusión de eventos y exportación.

## Errores y desviaciones prohibidas
No usar validación exclusivamente cliente, SQL interpolado, controladores de cientos de líneas o rutas administrativas sin autorización.

## Entregable del agente
- Resumen de archivos modificados y motivo.
- Resultado real de comandos/tests; no inventar pruebas exitosas.
- Riesgos, supuestos y cambios pendientes.
- Correspondencia con RF/RNF y evidencias de aceptación.

## Documentación oficial de referencia
- https://laravel.com/docs/13.x
- https://laravel.com/docs/13.x/validation
- https://laravel.com/docs/13.x/authorization

## Condición de finalización
La funcionalidad cumple sus criterios de aceptación, pasa las pruebas pertinentes y no rompe el funcionamiento sin internet.
