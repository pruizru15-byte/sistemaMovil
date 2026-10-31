# Seguridad, autenticación y autorizaciones

> Skill para agentes de desarrollo. Versión del paquete: 1.0 — 2026-10-17.

## Propósito y activación
Activar para toda ruta sensible, DNI, sesiones, permisos, contraseñas, GPS, archivos y auditorías.

## Contexto obligatorio
- Proyecto académico de asistencia de conductores y turnos, terminal Ate.
- Operación **únicamente LAN Wi-Fi**, sin nube, internet, Firebase, CDNs o APIs pagadas durante la ejecución.
- Un servidor físico Windows/Docker; Laravel API + MySQL; React web y APK con Capacitor.
- Roles: Administrador, Supervisor y Conductor. Administrador con operaciones autorizadas y auditadas; baja lógica de usuarios con historial.
- Consultar siempre `AGENTS.md`, `docs/REQUISITOS.md`, `docs/DECISIONES.md` y contratos antes de implementar.

## Instrucciones de ejecución
1. Modelar amenazas LAN: dispositivos ajenos, sniffing Wi-Fi, usuario interno abusivo, pérdida de teléfono, GPS falso, CSRF y acceso phpMyAdmin.
2. Laravel Sanctum: web primera parte con cookies de sesión HttpOnly/Secure/SameSite + protección CSRF; móvil tokens revocables guardados en Keystore mediante plugin auditado.
3. No usar token API permanente en frontend web ni localStorage.
4. Hash de contraseña Argon2id; throttling inicio de sesión; mensajes no enumerables, cierre/revocación y rotación de tokens.
5. Recuperación sin correo: flujo administrativo con identidad comprobada, credencial temporal de un uso y caducidad; auditoría, cambio obligatorio y revocación.
6. Denegar por defecto; Policies en backend con matriz roles/recursos/propiedad.
7. Administrador puede administrar pero cambios destructivos auditan y requieren confirmación; usuarios históricos se desactivan.
8. HTTPS en LAN con CA local instalada en dispositivos; pinning sólo si existe plan de rotación; sin HTTP en producción.
9. Validación de inputs, escaping, CSP, CSRF, rate limits, logs sin contraseñas ni coordenadas innecesarias.
10. Realizar revisión OWASP ASVS 5.0.0 y MASVS para Android, sin prometer certificación automática.

## Convenciones y contratos
Secrets sólo `.env` ignorado; `.env.example` sin secretos. Firewall local y puertos mínimos. RBAC por API y ownership: conductor accede sólo a sus datos. Respuestas de error no revelan DNI existentes.

## Pruebas obligatorias
Ataques IDOR/BOLA, elevación de rol, brute force, recuperación fraudulenta, CSRF, XSS, expiración y revocación, tráfico LAN interceptado, acceso base de datos y logs.

## Errores y desviaciones prohibidas
No desactivar TLS o validación de certificados, no crear contraseña universal, no poner secretos en APK, no fiarse de rol enviado desde frontend.

## Entregable del agente
- Resumen de archivos modificados y motivo.
- Resultado real de comandos/tests; no inventar pruebas exitosas.
- Riesgos, supuestos y cambios pendientes.
- Correspondencia con RF/RNF y evidencias de aceptación.

## Documentación oficial de referencia
- https://owasp.org/www-project-application-security-verification-standard/
- https://mas.owasp.org/MASVS/
- https://laravel.com/docs/13.x/sanctum

## Condición de finalización
La funcionalidad cumple sus criterios de aceptación, pasa las pruebas pertinentes y no rompe el funcionamiento sin internet.
