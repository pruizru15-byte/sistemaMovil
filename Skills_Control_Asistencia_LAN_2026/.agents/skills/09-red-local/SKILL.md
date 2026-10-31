# LAN, Docker, despliegue offline

> Skill para agentes de desarrollo. Versión del paquete: 1.0 — 2026-10-17.

## Propósito y activación
Activar para red Wi-Fi, Docker Compose, TLS local, disponibilidad, puertos y respaldo.

## Contexto obligatorio
- Proyecto académico de asistencia de conductores y turnos, terminal Ate.
- Operación **únicamente LAN Wi-Fi**, sin nube, internet, Firebase, CDNs o APIs pagadas durante la ejecución.
- Un servidor físico Windows/Docker; Laravel API + MySQL; React web y APK con Capacitor.
- Roles: Administrador, Supervisor y Conductor. Administrador con operaciones autorizadas y auditadas; baja lógica de usuarios con historial.
- Consultar siempre `AGENTS.md`, `docs/REQUISITOS.md`, `docs/DECISIONES.md` y contratos antes de implementar.

## Instrucciones de ejecución
1. Servidor Windows + Docker Desktop; preparar imágenes/dependencias durante instalación con internet opcional, operación normal 100% offline.
2. Servicios separados: reverse proxy TLS, PHP-FPM Laravel, MySQL, Reverb/worker, phpMyAdmin sólo localhost/admin.
3. Fijar IP servidor por reserva DHCP; usar nombre DNS local si router lo permite; clientes en misma subred y sin aislamiento AP.
4. Restringir MySQL a red Docker interna; sólo 443 para clientes, panel admin aislado, firewall perfil privado.
5. Crear CA local con mkcert o equivalente y distribuir cert raíz de manera controlada; hostname/IP en SAN; rotación y expiración documentadas.
6. Recursos JS, CSS, iconos y fuentes embebidos; ninguna dependencia CDN en runtime.
7. Usar healthchecks, volúmenes persistentes, restart policies, backups y restauración ensayada.
8. Exportar imágenes/paquetes para instalación offline; separar `.env.dev` y `.env.prod` sin commitear secretos.
9. Supervisar energía/suspensión Windows, puertos, DNS y conectividad wifi.

## Convenciones y contratos
`compose.yaml` versión vigente; sin `container_name` innecesario. APP_URL y SAN coherentes, WSS para WebSockets. Se recomienda localhost solamente para phpMyAdmin y credenciales no root.

## Pruebas obligatorias
Desconectar WAN, 3 dispositivos simultáneos, ping/reverse proxy, login, marcado, dashboard, reinicio de Docker, apagado PC, backup/restore, certificado expirado, cambio IP.

## Errores y desviaciones prohibidas
No usar localhost desde móvil para alcanzar servidor, `0.0.0.0` como URL cliente, `http://` en release, o volúmenes efímeros para MySQL.

## Entregable del agente
- Resumen de archivos modificados y motivo.
- Resultado real de comandos/tests; no inventar pruebas exitosas.
- Riesgos, supuestos y cambios pendientes.
- Correspondencia con RF/RNF y evidencias de aceptación.

## Documentación oficial de referencia
- https://docs.docker.com/compose/
- https://caddyserver.com/docs/
- https://developer.android.com/privacy-and-security/security-config

## Condición de finalización
La funcionalidad cumple sus criterios de aceptación, pasa las pruebas pertinentes y no rompe el funcionamiento sin internet.
