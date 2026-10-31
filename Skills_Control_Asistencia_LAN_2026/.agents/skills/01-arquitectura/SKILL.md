# Arquitectura modular

> Skill para agentes de desarrollo. Versión del paquete: 1.0 — 2026-10-17.

## Propósito y activación
Activar ante decisiones de estructura, límites, integración, refactorización o nuevos módulos.

## Contexto obligatorio
- Proyecto académico de asistencia de conductores y turnos, terminal Ate.
- Operación **únicamente LAN Wi-Fi**, sin nube, internet, Firebase, CDNs o APIs pagadas durante la ejecución.
- Un servidor físico Windows/Docker; Laravel API + MySQL; React web y APK con Capacitor.
- Roles: Administrador, Supervisor y Conductor. Administrador con operaciones autorizadas y auditadas; baja lógica de usuarios con historial.
- Consultar siempre `AGENTS.md`, `docs/REQUISITOS.md`, `docs/DECISIONES.md` y contratos antes de implementar.

## Instrucciones de ejecución
1. Identificar RF/RNF, actor, límites del cambio y flujos de datos antes de tocar código.
2. Mantener monolito modular Laravel y frontend feature-first, sin microservicios.
3. Definir interfaces entre módulos; dependencias desde vistas → casos de uso/servicios → acceso a datos, nunca al revés.
4. Crear ADR breve cuando se cambia una decisión técnica y solicitar aprobación antes de cambios estructurales.
5. Alinear contrato JSON de API, errores, autorización, logs y esquema.
6. Mantener diagramas C4 simplificados contexto/contenedores/componentes en docs.
7. Evitar dos backends, duplicaciones de entidades y dependencias circulares.

## Convenciones y contratos
Separar presentación/dominio/infraestructura. No importar directamente internos de otros módulos; utilizar servicios públicos. Backend controla permisos y estados. API prefijo `/api/v1`. Todo endpoint tiene dueño, versión y pruebas. Una sola fuente de verdad MySQL. Docker Compose monta datos persistentes.

## Pruebas obligatorias
Pruebas de arquitectura: imports circulares, smoke de Docker, rutas públicas/privadas, contratos, validaciones de permisos, LAN sin WAN y regeneración desde clon limpio.

## Errores y desviaciones prohibidas
No agregar Kubernetes, colas cloud, Redis obligatorio ni segundo ORM sin ADR. No desarrollar módulos fuera de alcance. No duplicar lógica de asistencia en React.

## Entregable del agente
- Resumen de archivos modificados y motivo.
- Resultado real de comandos/tests; no inventar pruebas exitosas.
- Riesgos, supuestos y cambios pendientes.
- Correspondencia con RF/RNF y evidencias de aceptación.

## Documentación oficial de referencia
- https://laravel.com/docs/13.x/structure
- https://react.dev/learn/thinking-in-react
- https://docs.docker.com/compose/

## Condición de finalización
La funcionalidad cumple sus criterios de aceptación, pasa las pruebas pertinentes y no rompe el funcionamiento sin internet.
