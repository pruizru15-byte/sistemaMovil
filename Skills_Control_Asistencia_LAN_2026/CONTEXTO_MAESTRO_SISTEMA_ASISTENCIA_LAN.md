# CONTEXTO MAESTRO DEL SISTEMA — CONTROL DE ASISTENCIA, TURNOS Y RUTAS

> **Versión:** 1.0 · **Fecha de consolidación:** 17 de octubre de 2026  
> **Estado:** Especificación funcional y técnica para guiar el desarrollo; no equivale a software ya implementado.  
> **Idioma del sistema:** Español.  
> **Propósito:** Proyecto académico para respaldar prácticas, con operación local sin contratación de hosting, nube ni servicios de terceros.

## 1. Visión y alcance

Se desarrollará un **sistema de control de asistencia georreferenciada, gestión de turnos, vehículos, rutas y servicios de transporte**, destinado a la operación de conductores, supervisores y administradores, tomando como referencia el **terminal de Ate**.

La aplicación se construirá **primero como web responsive** y luego se empaquetará como **APK Android mediante Capacitor**. Ambas interfaces compartirán la misma API Laravel y la base de datos MySQL, ejecutadas en un equipo servidor conectado a una red Wi-Fi local (LAN). No se construirán dos backends distintos.

### Principios innegociables

- **100 % LAN en operación:** sin dependencia de internet para inicio de sesión, turnos, registros, reportes y consultas dentro de la red.
- **Sin servicios cloud, hosting ni suscripciones.** Los paquetes de desarrollo pueden descargarse usando internet durante la instalación; los recursos necesarios deben quedar alojados localmente para operar offline.
- **Monolito modular:** módulos separados, API compartida y única base de datos transaccional.
- **Seguridad en el backend:** no confiar en controles de interfaz ni en datos GPS enviados por el cliente sin validación.
- **Responsive + Android:** interfaz web adaptable, preparada para empaquetarse con Capacitor.
- **Diseño coherente:** componentes reutilizables, estilos aislados, tokens de color para temas claro y oscuro.
- **Mantenibilidad y calidad:** migraciones versionadas, tests, documentación y control de cambios.

### Lo que no está incluido inicialmente

Nube, acceso remoto por internet, sincronización entre servidores, pagos, gestión financiera, rastreo GPS continuo de toda la flota, mapas de terceros obligatorios y notificaciones push externas. Cualquier ampliación requiere aprobación explícita.

## 2. Actores y permisos

Existen exactamente **tres roles**:

1. **Administrador:** control integral del sistema y sus configuraciones; puede crear, modificar, desactivar y administrar usuarios, supervisores, conductores, unidades, rutas, turnos y asistencias, sujeto a validación, confirmación y auditoría. Para datos históricos usar baja lógica o anulaciones auditadas, no eliminación destructiva indiscriminada.
2. **Supervisor:** gestión operativa de conductores, vehículos, horarios, asignaciones, rutas, asistencia, incidencias y reportes; sin acceso a configuraciones críticas ni administración global de roles.
3. **Conductor:** consulta sus datos y asignaciones; marca asistencia con GPS; registra inicio/fin de servicio e incidencias; consulta rutas, turnos y avisos; edita los campos autorizados de su perfil.

**Reglas especiales de perfil:** el usuario puede actualizar teléfono, dirección, foto y contraseña; los cambios de DNI, rol y otros datos de identidad sujetos a control se reservan al administrador. Nombres/apellidos podrán editarse bajo una política definida (el acuerdo anterior los permitía en Mi Perfil, pero conviene controlar cambios de identidad por auditoría). Cada usuario solo puede modificar su propio perfil salvo el administrador.

### Matriz resumida

| Operación | Administrador | Supervisor | Conductor |
|---|---|---|---|
| Gestionar usuarios/roles/configuración global | Sí | No | No |
| Gestionar conductores/vehículos/rutas/turnos | Sí | Sí, alcance operativo | No |
| Ver asistencia global y reportes | Sí | Sí | No |
| Marcar asistencia propia | Según política de prueba | Según política de prueba | Sí |
| Consultar turnos/rutas propios | Sí | Sí | Sí |
| Registrar inicio/fin de servicio o incidencia propia | Según asignación | Según asignación | Sí |
| Modificar perfil propio | Sí | Sí | Sí |
| Modificar perfil ajeno / desactivar usuarios | Sí | No | No |

**Nota:** la autorización se implementa por permiso y propiedad del recurso en Laravel; ocultar un botón no concede ni revoca permisos.

## 3. Inventario oficial: 11 módulos

| Nº | Módulo | Objetivo y funciones principales |
|---|---|---|
| 01 | **Autenticación y usuarios** | Inicio de sesión con DNI/contraseña; gestión de sesiones; altas, roles, activación/desactivación, restablecimiento administrado de contraseña y auditoría. |
| 02 | **Dashboard** | Indicadores, gráficos, eventos recientes y paneles específicos por rol. |
| 03 | **Conductores** | Fichas de conductor, condición laboral/operativa, asignaciones e historial. |
| 04 | **Vehículos** | Registro de unidades, identificación, capacidad, estado y disponibilidad. |
| 05 | **Gestión de turnos** | Calendario semanal, horarios, asignación de conductores y vehículos, reprogramaciones y conflictos. |
| 06 | **Control de asistencia (GPS)** | Entrada/salida, geocerca del terminal, precisión GPS, validación de horario, puntualidad, tardanza y ausencia. |
| 07 | **Reportes** | Filtros por fecha, conductor, turno, ruta y estados; exportación Excel/CSV. |
| 08 | **Notificaciones** | Avisos internos en LAN para cambios de programación, alertas e incidencias. |
| 09 | **Configuración del sistema** | Parámetros del terminal, coordenadas, radio permitido, tolerancias, políticas y estado del servidor. |
| 10 | **Gestión de rutas y servicios** | Rutas asignadas, inicio/fin de servicio, estados de recorrido e incidencias. |
| 11 | **Mi perfil** | Datos personales permitidos, foto, contacto y cambio de contraseña. |

**Distinción importante:** dashboard y perfil son módulos propios; gestión de rutas y servicios se añadió después del alcance inicial. La lista definitiva para el proyecto contiene **11 módulos**.

## 4. Requisitos funcionales originales

| Código | Requisito | Criterio de trabajo |
|---|---|---|
| RF-01 | Autenticación | Conductor inicia sesión con DNI y contraseña únicos. |
| RF-02 | Marcación georreferenciada | Capturar ubicación del móvil y validar geocerca del terminal de Ate antes de registrar entrada/salida. |
| RF-03 | Rol de turnos | Calendario semanal con horarios y vehículo/unidad asignada. |
| RF-04 | Notificaciones | Informar cambios de último momento; en LAN serán **notificaciones internas** y actualizaciones en tiempo real, con las limitaciones del sistema operativo. |
| RF-05 | Gestión dinámica de turnos | Supervisor programa, modifica y asigna turnos de la flota. |
| RF-06 | Monitoreo de asistencia | Dashboard de puntualidad, tardanza y ausencia con actualización cercana al tiempo real. |
| RF-07 | Reportabilidad | Exportación de consolidados a Excel y CSV. |

### Requisitos añadidos a partir de la definición funcional

- Registro y administración de vehículos y conductores.
- Gestión de rutas y servicios: consulta de ruta asignada, inicio/fin del recorrido e incidencias.
- Perfil editable con campos controlados por rol.
- Panel diferenciado para administrador, supervisor y conductor.
- Recuperación de acceso **asistida por administrador autorizado**, sin correo externo; exigir verificación de identidad, registro de auditoría y cambio de contraseña al siguiente acceso cuando corresponda.

## 5. Requisitos no funcionales

| Código | Categoría | Criterio aplicable a este proyecto |
|---|---|---|
| RNF-01 | UX/UI | Controles táctiles de al menos 48 dp, tipografía legible, accesibilidad, diseño simple para conductores. |
| RNF-02 | Seguridad GPS | Detectar ubicaciones declaradas simuladas en Android y aplicar controles adicionales; **no se puede prometer bloqueo infalible de todo GPS falso**. |
| RNF-03 | Rendimiento | Objetivo: confirmación de marcado + validación geográfica en **máximo 3 s** bajo condiciones LAN de prueba definidas. El requisito original mencionaba 4G/5G, pero se adapta a Wi-Fi local. |
| RNF-04 | Portabilidad | Android **8.0 o superior**, validando compatibilidad real de la versión de Capacitor, plugins, permisos y dispositivos de prueba. |
| RNF-05 | Disponibilidad | API y MySQL en **servidor local**, persistencia mediante volúmenes y respaldos. Depende de energía, router y equipo servidor; no se garantiza alta disponibilidad con un solo equipo. |

Además: HTTPS en red local, funcionamiento sin CDN, control de acceso, integridad transaccional y capacidad de recuperación de respaldos.

## 6. Arquitectura general

```text
                      RED WI-FI LOCAL (LAN)

  [Navegador supervisor/admin]     [App Android conductor]
                 \                      /
                  \ HTTPS + WebSocket /
                   [Router / AP Wi-Fi]
                           |
                [Laptop o PC servidor]
                           |
                    [Docker Compose]
                           |
       +-------------------+--------------------+
       |                   |                    |
 [Reverse proxy TLS]   [Laravel API]      [Reverb/WebSocket]
       |                   |
 [React estático]      [MySQL 8]
                           |
                   [Volumen persistente]

         [phpMyAdmin: acceso solo administrativo]
```

- El servidor tendrá dirección IP local reservada, p. ej. `192.168.1.100` (**ejemplo, no configuración fija confirmada**).
- Los clientes llaman a Laravel **nunca directamente a MySQL**.
- El router debe permitir comunicación entre clientes y servidor (sin aislamiento de clientes que impida el acceso).
- El equipo servidor y el router deberán permanecer encendidos para el funcionamiento LAN.
- La IP, el dominio interno opcional y los certificados se documentarán en el despliegue.
- El paquete Android debe permitir configurar y validar la dirección del servidor local de manera controlada, evitando direcciones rígidas que fallen cuando cambie la LAN.

### Tecnologías acordadas

| Capa | Elección |
|---|---|
| Frontend | React + TypeScript + Vite |
| Estilos | Tailwind CSS + variables CSS + CSS Modules cuando proceda |
| Navegación | React Router |
| Estado remoto | TanStack Query |
| Cliente HTTP | Axios o `fetch` centralizado; escoger uno y mantener consistencia |
| Formularios | React Hook Form + Zod |
| Backend | Laravel modular, API REST |
| Autenticación | Laravel Sanctum, adaptado a web y Android |
| Autorización | Policies, Gates y permisos del backend |
| Base de datos | MySQL 8, administrado con phpMyAdmin |
| Tiempo real | Laravel Reverb / WebSockets dentro de LAN |
| Android | Capacitor y plugins nativos propios/compatibles |
| Infraestructura | Docker Compose en Windows o equipo servidor disponible |
| TLS | Reverse proxy con certificados locales confiables |
| Exportación | CSV y Excel generado en servidor |

**Política de versiones:** antes de crear el proyecto, revisar documentación y compatibilidades oficiales; fijar versiones exactas y lockfiles. Este archivo define familias de tecnología, no presupone que una versión puntual siga siendo la más reciente.

## 7. Estructura de repositorio y modularidad

```text
control-asistencia/
├── AGENTS.md
├── .agents/skills/
│   ├── 01-arquitectura/
│   ├── 02-frontend/
│   ├── 03-ui-ux/
│   ├── 04-backend/
│   ├── 05-base-datos/
│   ├── 06-seguridad/
│   ├── 07-gps/
│   ├── 08-android/
│   ├── 09-red-local/
│   ├── 10-reglas-negocio/
│   ├── 11-testing/
│   └── 12-documentacion/
├── frontend/
│   └── src/
│       ├── app/{router,providers,layouts}/
│       ├── modules/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── conductores/
│       │   ├── vehiculos/
│       │   ├── turnos/
│       │   ├── asistencia/
│       │   ├── reportes/
│       │   ├── notificaciones/
│       │   ├── configuracion/
│       │   ├── rutas-servicios/
│       │   └── perfil/
│       ├── shared/{components,hooks,services,types,utils,constants}/
│       ├── styles/{globals.css,tokens.css,themes.css,typography.css}
│       └── main.tsx
├── backend/
│   ├── app/Modules/
│   ├── app/Shared/
│   ├── database/{migrations,seeders,factories}/
│   ├── routes/api.php
│   └── tests/{Feature,Unit}/
├── mobile/                 # Proyecto Android / código nativo de Capacitor
├── docker/
├── scripts/{backup,restore}/
├── docs/
├── compose.yaml
├── .env.example
└── README.md
```

**Patrón dentro de un módulo frontend:** `components/`, `pages/`, `hooks/`, `services/`, `types/`, `schemas/`, `styles/`. En backend: controladores, validadores, servicios, modelos, políticas y pruebas. Reutilizar componentes genéricos en `shared/`, no copiar entre módulos.

## 8. Diseño UI/UX, componentes y temas

### Identidad visual propuesta

- Aspecto: corporativo, moderno, claro, formal, coherente con operaciones de transporte.
- Fuente: **Inter**, instalada y servida localmente (sin Google Fonts remoto).
- Iconografía: Lucide o equivalente empaquetado en el proyecto.
- Interacción: controles ≥48 dp Android; estados `hover`, `focus`, `disabled`, `loading`, `error`, `success` y vacíos.
- Accesibilidad: etiquetas en formularios, navegación por teclado, contraste revisado, mensajes legibles, no representar significado solamente mediante color.

### Tokens de color

| Uso | Claro | Oscuro |
|---|---|---|
| Fondo | `#F4F7FB` | `#0B1220` |
| Superficie | `#FFFFFF` | `#151F30` |
| Texto principal | `#0F172A` | `#F8FAFC` |
| Texto secundario | `#475569` | `#94A3B8` |
| Bordes | `#CBD5E1` | `#334155` |
| Primario | `#2563EB` | `#60A5FA` |
| Identidad profunda | `#1E3A8A` | según contraste |
| Éxito | `#16A34A` | adaptar a contraste |
| Advertencia | `#D97706` | adaptar a contraste |
| Error | `#DC2626` | adaptar a contraste |

**Normas:** definir tokens semánticos `--color-background`, `--color-surface`, `--color-primary`, `--color-text`, etc. Evitar colores fijos en módulos y CSS inline injustificado. Usar componentes compartidos: botones, inputs, selects, modales, tablas, etiquetas de estado, avisos y tarjetas de métricas.

### Referencias de pantallas acordadas

**Login:** tarjeta central, icono de autobús, título «Control de Asistencia», subtítulo «Acceso al sistema», campos DNI/contraseña, «Recordarme», «¿Olvidaste tu contraseña?», botón «Iniciar sesión» e indicador de conexión LAN. El estado de red debe provenir de comprobación real, no ser decorativo.

**Dashboard administrador:** menú lateral con los 11 módulos; KPIs de usuarios, asistencia, turnos y vehículos; gráfica semanal, distribución de roles, actividad reciente y salud del servidor, MySQL y Wi-Fi; alternancia claro/oscuro.

**Dashboard supervisor:** menú reducido sin administración de roles/configuración crítica; KPIs de conductores programados, asistencias, rutas y vehículos; gráfica de asistencias, estado de rutas, actividad e incidencias/alertas operativas.

**Vista conductor (por diseñar):** priorizar acciones grandes de entrada/salida, turno actual, ruta/unidad, inicio/fin de servicio, incidencias, avisos y perfil.

**Precisión sobre mockups:** las cifras, nombres, fechas e indicadores mostrados en imágenes de ejemplo son ficticios. Tampoco se asumirá que existe «GPS de vehículos» continuo: inicialmente se usa GPS del teléfono al marcar y eventos voluntarios de servicio.

## 9. GPS, geocerca y marcado de asistencia

### Flujo mínimo

1. El conductor autenticado abre la pantalla de asistencia en Android.
2. Se solicitan permisos de ubicación necesarios; se explica por qué se requieren.
3. El plugin nativo obtiene latitud, longitud, exactitud estimada y antigüedad de la lectura.
4. Android señala si la ubicación fue marcada como simulada cuando la plataforma lo permita.
5. Se envía la solicitud a Laravel por **HTTPS de la LAN**.
6. El backend comprueba usuario, rol, turno, ventana horaria, integridad del request, duplicados y distancia al punto del terminal de Ate.
7. Laravel calcula la distancia (por ejemplo, Haversine), evalúa radio configurado y precisión; usa **hora del servidor** para el registro.
8. Crea el marcado en una transacción MySQL, con identificación única e información de auditoría.
9. Devuelve estado de aceptación/rechazo y notifica actualización al dashboard.

### Restricciones importantes

- El GPS/GNSS puede funcionar sin internet; la obtención de coordenadas puede tardar o fallar, especialmente en interiores.
- Estar en la Wi-Fi no prueba por sí solo la presencia geográfica.
- `Location.isMock()` / compatibilidad equivalente detecta ubicaciones **señaladas** como simuladas, pero no todas las falsificaciones. Implementar controles por capas, registrar anomalías y prever revisión manual autorizada.
- La web usa Geolocation API en contexto seguro, pero **no ofrece el mismo control nativo antifraude**; el marcado con requisitos antifraude estrictos se restringirá a APK.
- Radio inicial de 50 o 100 metros fue mencionado como **ejemplo**; debe definirse/configurarse según el lugar real. También están pendientes coordenadas precisas y tolerancias.
- No incorporar Google Maps ni una API de mapas como dependencia operativa obligatoria.
- En la LAN se mide y verifica el objetivo de ≤3 segundos; no garantizarlo sin pruebas.

## 10. Notificaciones y tiempo real

- WebSockets en LAN para actualizaciones del dashboard y avisos en aplicaciones conectadas.
- Guardar notificaciones en MySQL con estado leída/no leída para recuperarlas al reconectar.
- **No prometer push de sistema con la APK cerrada** mediante WebSockets ordinarios. Sin FCM/cloud, notificaciones de sistema con app terminada requieren otro diseño Android, limitaciones y pruebas; el alcance inicial cubre alertas internas y en sesión activa.
- Si se pierde la conexión al servidor local, mostrar estado desconectado y no simular registros como confirmados.

## 11. Seguridad y privacidad

**Referencia de verificación:** OWASP ASVS; adaptar los controles al contexto LAN.

1. **Credenciales:** DNI como identificador, contraseña hasheada (preferentemente Argon2id), políticas de longitud y restricción de intentos.
2. **Autenticación:** Sanctum; sesiones de navegador mediante cookies seguras/HttpOnly/SameSite + protección CSRF. Android utilizará mecanismo de token apropiado, revocable y almacenado con seguridad nativa (no texto plano en almacenamiento web inseguro).
3. **Autorización:** comprobaciones de permiso y propiedad por cada endpoint; principio de mínimo privilegio.
4. **Entrada de datos:** validación backend (Form Requests), límites de tamaño/formato, consultas parametrizadas, escape de salida y protección XSS/CSP.
5. **LAN segura:** HTTPS local con certificados confiables, firewall, control de acceso al Wi-Fi, secretos fuera del repositorio.
6. **MySQL:** conexiones solo desde backend/red Docker; usuarios BD con permisos mínimos; no exponer puerto 3306 a clientes.
7. **phpMyAdmin:** acceso restringido a administrador, preferiblemente solo `localhost` o subred de gestión; nunca abierto a conductores.
8. **Registro de auditoría:** autenticaciones, restablecimientos, cambios de rol, cambios de turnos, edición/anulación de asistencias, configuración GPS y exportaciones sensibles.
9. **Eliminación segura:** usuarios/conductores/vehículos con historial se desactivan o archivan para preservar referencias. Las correcciones de asistencia deben quedar trazadas.
10. **Respaldo:** copias MySQL cifradas o protegidas, guardadas fuera del volumen principal; prueba periódica de restauración.
11. **Datos personales:** recopilar lo necesario y limitar acceso/exportación; definir retención y tratamiento según normativa aplicable.
12. **Disponibilidad y fallos:** errores seguros, mensajes no reveladores, logs sin contraseñas ni secretos y manejo de sesiones expuestas.

**No confundir permisos:** el administrador controla el sistema, pero eso no obliga a permitir borrados físicos de registros auditables.

## 12. Entidades de base de datos (modelo preliminar)

Tablas candidatas:

- `users`, `roles`, `permissions`, `role_user`/asignaciones equivalentes.
- `conductores` (perfil operativo vinculado a usuario).
- `vehiculos`.
- `turnos`, `asignaciones_turno`.
- `rutas`, `servicios`, `asignaciones_servicio`.
- `asistencias` (entrada/salida, timestamp servidor, ubicación y validaciones).
- `incidencias`.
- `notificaciones`, `notificacion_destinatarios`.
- `terminales`, `geocercas`, `configuraciones`.
- `audit_logs`, `password_reset_requests` o equivalente para restablecimiento local.

**Normas de modelo:** claves foráneas, índices por usuario/fecha/turno/estado, restricciones de unicidad e idempotencia, timestamps consistentes, migraciones reversibles cuando sea seguro, operaciones atómicas y datos de prueba sin PII real. El ERD detallado se desarrollará antes de programar módulos dependientes.

## 13. Despliegue local

- Docker Compose levanta Laravel, MySQL, servidor de archivos estáticos/reverse proxy y Reverb. phpMyAdmin solo para administración.
- La aplicación web se sirve como **build de producción**: no depender de Vite dev server durante operación.
- Usar HTTPS en la IP o hostname LAN configurado; establecer confianza de certificados en los equipos de prueba.
- Configurar reserva DHCP/IP fija, comprobar firewall y conexión desde dispositivos conectados a la misma Wi-Fi.
- Persistencia en volúmenes, políticas de inicio/reinicio y recuperación.
- No descargar fuentes, iconos, scripts ni SDK remotos en tiempo de ejecución.
- Mantener una guía de instalación sin internet y otra de actualización/migración.

## 14. Testing y criterios de salida

### Pruebas obligatorias

- Unitarias de reglas de asistencia, distancia, tolerancias y validaciones.
- Integración Laravel + MySQL (duplicados, transacciones, integridad referencial).
- Autorización por rol y por propietario (incluidos intentos de acceso horizontal y vertical).
- Login, bloqueo temporal, cierre de sesión y recuperación administrada.
- UX responsive, teclado, temas, contraste, estados de carga/error y tamaños táctiles.
- Android 8+ con dispositivos reales, GPS activado/desactivado, permisos denegados, precisión baja y ubicación marcada simulada.
- LAN sin internet: login, consulta, marcado, reportes y WebSockets; caída del router/servidor y recuperación de conexión.
- Rendimiento: latencia de marcado (objetivo ≤3 s según condiciones documentadas).
- Exportación CSV/Excel, auditoría, copia y restauración de datos.

### Definition of Done de cada tarea

1. Requisito y módulo identificados.
2. Contrato API/validación y permiso documentados.
3. Componentes reutilizados, estilos con tokens, sin dependencias externas nuevas sin aprobación.
4. Migración y pruebas cuando cambian datos.
5. Pruebas automatizadas pertinentes pasan y pruebas manuales LAN anotadas.
6. Documentación actualizada, cambios revisados y sin secretos ni datos personales reales en commits.

## 15. Guía para agentes de IA

Se definieron **12 skills + `AGENTS.md`**:

1. Arquitectura
2. Frontend
3. UI/UX
4. Backend
5. Base de datos
6. Seguridad
7. GPS
8. Android
9. Red local
10. Reglas de negocio
11. Testing y calidad
12. Documentación

**Instrucción base para todos los agentes:**

> Leer `AGENTS.md`, este contexto y las skills pertinentes. Confirmar módulo/alcance, revisar el código existente, planear interfaces y pruebas, implementar sin apartarse del stack ni introducir nube, validar permisos/seguridad y actualizar documentación. Ante dudas sobre versiones o APIs, consultar documentación oficial actual si el entorno del agente tiene acceso a internet. No confundir acceso a internet durante desarrollo con una dependencia de internet en operación.

### Prohibiciones sin autorización

- Introducir Firebase/FCM, hosting o nube como requisito de funcionamiento.
- Reemplazar React, Laravel o MySQL por otro stack sin aprobación.
- Exponer MySQL/phpMyAdmin a todos los clientes Wi-Fi.
- Usar CDN, Google Fonts o mapas online como dependencia de ejecución.
- Duplicar backend para APK o meter lógica crítica exclusivamente en React.
- Añadir módulos/fun­cionalidades que no fueron aprobados.
- Dar por cumplidos controles de seguridad o rendimiento sin pruebas.

## 16. Decisiones confirmadas vs. pendientes

### Confirmado en conversación

- Proyecto académico, entorno exclusivo de Wi-Fi local, **sin nube**.
- React + TypeScript + Vite, Laravel, MySQL y phpMyAdmin, Docker y Capacitor para APK.
- Tres roles: administrador, supervisor, conductor.
- Once módulos funcionales, incluyendo rutas/servicios y Mi Perfil.
- Login con DNI y contraseña, recuperación local administrada.
- Asistencia con GPS/geocerca, vista de turnos, rutas, vehículos, incidencias y reportes.
- Tema claro/oscuro con paleta corporativa azul; componentes y estilos separados.
- Seguridad en backend, auditoría, acceso por roles.

### Pendiente de precisar antes de implementar funcionalidades específicas

1. Equipo servidor definitivo (laptop Windows, PC o mini PC), router y esquema de IP.
2. Coordenadas reales del terminal de Ate, radio permitido y tolerancia de precisión GPS.
3. Catálogo de rutas, paraderos, vehículos y horarios reales de prueba.
4. Reglas exactas de puntualidad, tardanza, ausencias, cambios de turno y jornadas nocturnas.
5. Flujos y autorizaciones de corrección de marcados, ausencia de GPS, contingencias y restablecimiento de contraseña.
6. Campos obligatorios/editables de cada perfil y formularios.
7. Decisión de permitir o no marcado vía navegador sin antifraude nativo; recomendado: **solo APK para marcados reales**.
8. Estrategia de entrega y confianza de certificados HTTPS LAN en Android.
9. Política de respaldo, frecuencia y retención de datos.
10. Dataset de demostración y casos de prueba; evitar datos personales reales sin autorización.

## 17. Orden de implementación propuesto

1. Inicializar repositorio, `AGENTS.md`, linting, variables de entorno, Docker, HTTPS LAN y conexión MySQL.
2. Definir ERD, migraciones iniciales, usuarios, roles, políticas y autenticación.
3. Construir sistema de diseño, layouts, login, perfil y dashboard base.
4. Crear conductores, vehículos, rutas y turnos; validar asignaciones y conflictos.
5. Implementar marcación web para desarrollo controlado, luego plugin Android y validaciones geográficas robustas.
6. Programar registros de servicios e incidencias.
7. Añadir notificaciones internas y WebSockets.
8. Implementar reportes, auditoría, configuración y respaldos.
9. Empaquetar APK, pruebas Android 8+, pruebas LAN sin internet y endurecimiento de seguridad.
10. Preparar documentación técnica, manual de usuario y demostración académica.

---

**Documento rector del proyecto.** Si una tarea futura contradice este contexto, registrar explícitamente la nueva decisión y actualizar este documento antes de modificar la arquitectura.
