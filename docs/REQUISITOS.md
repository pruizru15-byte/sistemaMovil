# Requisitos y alcance

## Funcionales originales
- RF-01 Login DNI + contraseña y recuperación local asistida.
- RF-02 Captura y validación GPS por geocerca terminal Ate; móvil Android con detección de mock location.
- RF-03 Calendario semanal, unidad y horarios por conductor.
- RF-04 Alertas locales sobre modificaciones: WebSockets mientras app conectada; historial persistente al reconectar. **No push FCM sin internet**.
- RF-05 Supervisor gestiona turnos y asignaciones.
- RF-06 Dashboard puntualidad, tardanza, ausencia con refresco en tiempo real.
- RF-07 Exportación CSV/Excel con autorización.

## Ampliaciones funcionales consensuadas
- Conductores: rutas asignadas, inicio/fin de servicio, incidencias y consulta de vehículo.
- Perfil: edición de datos permitidos, foto y contraseña; DNI y rol sólo administración autorizada.
- Administración: usuarios/roles/configuración con desactivación lógica y auditoría.

## No funcionales
- RNF-01 Controles táctiles >=48dp y legibilidad.
- RNF-02 Detectar y rechazar ubicaciones señaladas como mock en Android; registrar limitaciones antifraude.
- RNF-03 Objetivo de procesamiento de marcado + validación <=3s en entorno de prueba definido; tiempo de adquisición GPS se medirá aparte, no se garantiza sin test.
- RNF-04 Android >=8.0/API26.
- RNF-05 **Adaptado**: datos/APIs alojados en PC servidor local en LAN, sin nube, con respaldo y disponibilidad mientras servidor y Wi-Fi estén activos.

## Exclusiones
No tracking continuo, no mapas externos, no app iOS obligatoria, no SMS/email cloud, no trabajo fuera LAN, no pagos, no infraestructura multinodo. Internet sólo para instalar herramientas o consultar docs de desarrollo.
