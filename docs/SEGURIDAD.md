# Modelo de seguridad mínimo

## Activos
DNI, credenciales, datos personales, asistencias con GPS, horarios y auditorías.

## Amenazas y mitigaciones
- Suplantación: DNI + contraseña robusta, Argon2id, rate limit, sesiones y tokens revocables.
- IDOR y elevación de permisos: Policy en todas las operaciones, filtro por propiedad y rol.
- Captura de tráfico Wi-Fi: TLS local y CA distribuida correctamente; no permitir bypass.
- Teléfono comprometido: Keystore Android, expiración y revocación, protección de pantallas.
- GPS falso: `isMock` cuando disponible y plugin auditado, precisión/antigüedad/radio, trazabilidad; **sin promesa de inmunidad total**.
- Manipulación de horario: usar hora servidor y transacciones/idempotencia.
- Borrado malicioso: desactivación lógica, confirmación, permisos y auditoría.
- Exposición de panel admin: restringir phpMyAdmin y MySQL, firewall privado y credenciales distintas.
- Pérdida de datos: backup con retención y restauración probada.

## Aceptación
Usar OWASP ASVS 5.0.0 y MASVS como listas verificables; registrar controles implementados vs pendientes y resultado de pruebas.
