# Frontend React y TypeScript

> Skill para agentes de desarrollo. Versión del paquete: 1.0 — 2026-10-17.

## Propósito y activación
Activar para componentes React, rutas, formularios, estados y consumo de API.

## Contexto obligatorio
- Proyecto académico de asistencia de conductores y turnos, terminal Ate.
- Operación **únicamente LAN Wi-Fi**, sin nube, internet, Firebase, CDNs o APIs pagadas durante la ejecución.
- Un servidor físico Windows/Docker; Laravel API + MySQL; React web y APK con Capacitor.
- Roles: Administrador, Supervisor y Conductor. Administrador con operaciones autorizadas y auditadas; baja lógica de usuarios con historial.
- Consultar siempre `AGENTS.md`, `docs/REQUISITOS.md`, `docs/DECISIONES.md` y contratos antes de implementar.

## Instrucciones de ejecución
1. React 19.3.x, TypeScript strict y Vite estable verificada, con lockfile reproducible.
2. Estructura `src/app/{router,providers,layouts}`, `src/modules/<feature>/{pages,components,hooks,services,schemas,types,styles}`, `src/shared`.
3. Páginas orquestan; componentes muestran; hooks manejan interacción; `*.api.ts` encapsula HTTP.
4. TanStack Query para estado remoto; React Hook Form + Zod para datos de entrada; minimizar estado global.
5. Abort/cancel consultas y manejar loading, vacío, error, expiración y reconexión LAN.
6. Centralizar rutas tipadas y guardas visuales por rol, sin confundirlas con autorización real.
7. Asegurar accesibilidad teclado, focus y navegación móvil.

## Convenciones y contratos
TypeScript sin `any` injustificado, componentes funcionales, props tipadas, CSS Modules local. Alias `@/`. Axios con instancia única, timeout y normalización de errores. No incrustar URL/IP por archivo: configuración validada en arranque. No guardar tokens persistentes web en localStorage.

## Pruebas obligatorias
`npm run typecheck`, lint, tests de componentes, tests de formularios, rutas por rol y compilación `npm run build`; prueba móvil 360px y escritorio.

## Errores y desviaciones prohibidas
No usar llamadas fetch directas en JSX, estilos inline dispersos, CDN runtime, acceso a MySQL ni confiar en guards de frontend.

## Entregable del agente
- Resumen de archivos modificados y motivo.
- Resultado real de comandos/tests; no inventar pruebas exitosas.
- Riesgos, supuestos y cambios pendientes.
- Correspondencia con RF/RNF y evidencias de aceptación.

## Documentación oficial de referencia
- https://react.dev/versions
- https://www.typescriptlang.org/docs/
- https://vite.dev/guide/
- https://tanstack.com/query/latest/docs/framework/react/overview

## Condición de finalización
La funcionalidad cumple sus criterios de aceptación, pasa las pruebas pertinentes y no rompe el funcionamiento sin internet.
