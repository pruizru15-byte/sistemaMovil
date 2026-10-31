# Documentación y gestión de agentes

> Skill para agentes de desarrollo. Versión del paquete: 1.0 — 2026-10-17.

## Propósito y activación
Activar para documentación, tareas, decisiones, contratos, cambios y handoffs entre agentes.

## Contexto obligatorio
- Proyecto académico de asistencia de conductores y turnos, terminal Ate.
- Operación **únicamente LAN Wi-Fi**, sin nube, internet, Firebase, CDNs o APIs pagadas durante la ejecución.
- Un servidor físico Windows/Docker; Laravel API + MySQL; React web y APK con Capacitor.
- Roles: Administrador, Supervisor y Conductor. Administrador con operaciones autorizadas y auditadas; baja lógica de usuarios con historial.
- Consultar siempre `AGENTS.md`, `docs/REQUISITOS.md`, `docs/DECISIONES.md` y contratos antes de implementar.

## Instrucciones de ejecución
1. Mantener `AGENTS.md` como norma raíz y estas skills como procedimientos especializados.
2. Actualizar `docs/REQUISITOS.md`, `docs/ARQUITECTURA.md`, `docs/SEGURIDAD.md`, `docs/API.md`, `docs/DECISIONES.md`, `docs/TESTING.md` cuando cambien contratos.
3. Cada tarea tiene ID, alcance, criterios de aceptación, módulo, riesgos, precondiciones, pruebas y dependencias.
4. Producir ADR con motivación, opciones, decisión y consecuencias antes de variar stack/arquitectura.
5. Registrar cambios en CHANGELOG, sin documentar endpoints inexistentes como operativos.
6. Handoff entre agentes: archivos tocados, decisiones, comandos ejecutados, pruebas, bloqueos, próximos pasos.
7. Referenciar fuentes oficiales fechadas; comprobar versiones actuales con internet durante preparación, nunca requerir web en runtime.
8. Documentación de instalación incluye aprovisionamiento offline, CA TLS, respaldos/restauración y demo de red local.

## Convenciones y contratos
Plantilla tarea: ID, objetivo, alcance/no alcance, archivos previstos, contratos, criterios Given/When/Then, seguridad, tests, salida esperada. Toda afirmación de funcionalidad está respaldada por prueba o marcación PENDIENTE.

## Pruebas obligatorias
Revisión enlaces, coincidencia RF-RNF→módulos→tests, onboarding en equipo nuevo, instalación sin WAN, coherencia de referencias cruzadas.

## Errores y desviaciones prohibidas
No reproducir cambios de stack sin ADR, no citar fuentes sin fecha, no mezclar instrucciones de prototipo con seguridad de release.

## Entregable del agente
- Resumen de archivos modificados y motivo.
- Resultado real de comandos/tests; no inventar pruebas exitosas.
- Riesgos, supuestos y cambios pendientes.
- Correspondencia con RF/RNF y evidencias de aceptación.

## Documentación oficial de referencia
- https://docs.github.com/en/contributing/writing-for-github-docs
- https://keepachangelog.com/en/1.1.0/
- https://adr.github.io/

## Condición de finalización
La funcionalidad cumple sus criterios de aceptación, pasa las pruebas pertinentes y no rompe el funcionamiento sin internet.
