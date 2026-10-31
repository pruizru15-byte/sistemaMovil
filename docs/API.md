# Contratos API iniciales (diseño, no implementados)

Prefijo `/api/v1`; JSON, errores normalizados `{code,message,details?,request_id}` y autorización Laravel Policies.

| Método | Ruta | Roles |
|---|---|---|
| POST | /auth/login | Público con limitación |
| POST | /auth/logout | Autenticado |
| POST | /auth/password-change | Autenticado |
| POST | /auth/reset-admin | Admin con verificación y auditoría |
| GET/PATCH | /me | Propietario |
| GET | /me/turnos | Conductor |
| POST | /asistencias/marcaciones | Conductor APK validada |
| GET | /asistencias | Supervisor/Admin (alcance) |
| CRUD | /turnos | Supervisor/Admin |
| CRUD | /vehiculos | Supervisor/Admin |
| CRUD | /rutas | Supervisor/Admin |
| POST | /servicios/{id}/inicio | Conductor asignado |
| POST | /servicios/{id}/fin | Conductor asignado |
| POST | /incidencias | Conductor asignado |
| GET | /reportes/asistencias | Supervisor/Admin |
| GET | /notificaciones | Autenticado por usuario |

El endpoint de marcación debe usar request_id UUID, coordenadas frescas y precisión, y nunca aceptar cliente como autoridad de la hora o radio. Contratos finales requieren OpenAPI y tests.
