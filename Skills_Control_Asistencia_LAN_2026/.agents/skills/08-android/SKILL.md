# Android con Capacitor

> Skill para agentes de desarrollo. Versión del paquete: 1.0 — 2026-10-17.

## Propósito y activación
Activar para APK, plugin nativo, build, permisos, almacenamiento seguro y compatibilidad.

## Contexto obligatorio
- Proyecto académico de asistencia de conductores y turnos, terminal Ate.
- Operación **únicamente LAN Wi-Fi**, sin nube, internet, Firebase, CDNs o APIs pagadas durante la ejecución.
- Un servidor físico Windows/Docker; Laravel API + MySQL; React web y APK con Capacitor.
- Roles: Administrador, Supervisor y Conductor. Administrador con operaciones autorizadas y auditadas; baja lógica de usuarios con historial.
- Consultar siempre `AGENTS.md`, `docs/REQUISITOS.md`, `docs/DECISIONES.md` y contratos antes de implementar.

## Instrucciones de ejecución
1. Reutilizar React y capa de servicios; encapsular plataforma en `shared/platform` y plugin nativo sólo cuando indispensable.
2. Capacitor 8 estable; `minSdkVersion` 26 para requisito Android 8+, validar target SDK y compatibilidad de cada plugin.
3. Elegir acceso a servidor local por base URL editable en aprovisionamiento y protegida contra servidores no autorizados.
4. Empaquetar assets web en APK (no apuntar a dev server en release).
5. Instalar certificado raíz de CA local con procedimiento documentado; Android trust anchors requieren configuración y pruebas, nunca bypass de SSL.
6. Manejar permisos de ubicación, precisión reducida, interrupción de red y reconexión; sin supuesta garantía de push con app cerrada en Wi-Fi aislada.
7. Usar almacenamiento de credenciales respaldado por Android Keystore; nunca poner contraseñas en Preferences plano.
8. Gradle/JDK/SDK según docs verificadas; versionCode, firma privada del release, builds debug/release y exportación APK firmada.
9. Mantener módulo `mobile/android` o Android generado en raíz Capacitor de forma consistente, no ambas copias.

## Convenciones y contratos
Misma semántica de API, pantallas sensibles a safe areas y botón volver. `CAPACITOR_SERVER_URL` de desarrollo nunca en release. No pedir permisos excesivos. No geolocalización en segundo plano por defecto.

## Pruebas obligatorias
Instalación/arranque Android 8 y versiones recientes, HTTPS CA, modo avión con Wi-Fi local habilitada, permisos concedidos/denegados, reconexión, mock location, cierre y reinicio, build firmado.

## Errores y desviaciones prohibidas
No usar Firebase o SDK con llamadas WAN obligatorias. No falsear seguridad de SSL. No asumir que browser web puede leer `isMock`.

## Entregable del agente
- Resumen de archivos modificados y motivo.
- Resultado real de comandos/tests; no inventar pruebas exitosas.
- Riesgos, supuestos y cambios pendientes.
- Correspondencia con RF/RNF y evidencias de aceptación.

## Documentación oficial de referencia
- https://capacitorjs.com/docs
- https://capacitorjs.com/docs/android
- https://developer.android.com/guide

## Condición de finalización
La funcionalidad cumple sus criterios de aceptación, pasa las pruebas pertinentes y no rompe el funcionamiento sin internet.
