# Testing, QA y criterios de aceptación

> Skill para agentes de desarrollo. Versión del paquete: 1.0 — 2026-10-17.

## Propósito y activación
Activar antes y después de implementar funcionalidades, errores o releases.

## Contexto obligatorio
- Proyecto académico de asistencia de conductores y turnos, terminal Ate.
- Operación **únicamente LAN Wi-Fi**, sin nube, internet, Firebase, CDNs o APIs pagadas durante la ejecución.
- Un servidor físico Windows/Docker; Laravel API + MySQL; React web y APK con Capacitor.
- Roles: Administrador, Supervisor y Conductor. Administrador con operaciones autorizadas y auditadas; baja lógica de usuarios con historial.
- Consultar siempre `AGENTS.md`, `docs/REQUISITOS.md`, `docs/DECISIONES.md` y contratos antes de implementar.

## Instrucciones de ejecución
1. Escribir casos antes de programar a partir de RF/RNF con Given/When/Then.
2. Pirámide: unitarias PHP/Vitest, integración Laravel/MySQL, contratos API, E2E Playwright web y pruebas Android manuales/automatizadas apropiadas.
3. Ejecutar lint, typecheck, format check, tests, build y migraciones cada PR.
4. Medir RNF-03 marcado GPS+validación ≤3s en condiciones LAN realistas; separar obtención GNSS del tiempo de transacción y documentar ambos; no afirmar que siempre cumple.
5. Realizar amenazas de seguridad: IDOR, CSRF, rate limit, token robado, mock location, replay, concurrencia.
6. Matriz de prueba sin WAN, Wi-Fi intermitente, servidor caído, permisos GPS, precisión, Android 8+.
7. Evidencias fechadas, entorno, comandos, métricas y fallos; bloquear release ante crítico.
8. Revisar cobertura significativa de lógica crítica, sin usar un porcentaje global como garantía.

## Convenciones y contratos
Definition of Done: RF/RNF actualizado, tests verdes, integración probada, cambios documentados, sin warnings graves, sin dependencias externas runtime. CI local opcional ejecutable en Docker.

## Pruebas obligatorias
Ejecutar `composer test`/`php artisan test`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`; confirmar scripts reales en package.json. Auditoría accesibilidad y apk de prueba.

## Errores y desviaciones prohibidas
No inventar salidas de test. No dar tarea terminada sólo por compilar. No modificar pruebas para ocultar regresiones.

## Entregable del agente
- Resumen de archivos modificados y motivo.
- Resultado real de comandos/tests; no inventar pruebas exitosas.
- Riesgos, supuestos y cambios pendientes.
- Correspondencia con RF/RNF y evidencias de aceptación.

## Documentación oficial de referencia
- https://playwright.dev/docs/intro
- https://vitest.dev/guide/
- https://laravel.com/docs/13.x/testing

## Condición de finalización
La funcionalidad cumple sus criterios de aceptación, pasa las pruebas pertinentes y no rompe el funcionamiento sin internet.
