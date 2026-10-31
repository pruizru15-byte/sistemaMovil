# GPS, geocerca y antifraude

> Skill para agentes de desarrollo. Versión del paquete: 1.0 — 2026-10-17.

## Propósito y activación
Activar para capturar ubicación, calcular geocercas, validar marcados y mock locations.

## Contexto obligatorio
- Proyecto académico de asistencia de conductores y turnos, terminal Ate.
- Operación **únicamente LAN Wi-Fi**, sin nube, internet, Firebase, CDNs o APIs pagadas durante la ejecución.
- Un servidor físico Windows/Docker; Laravel API + MySQL; React web y APK con Capacitor.
- Roles: Administrador, Supervisor y Conductor. Administrador con operaciones autorizadas y auditadas; baja lógica de usuarios con historial.
- Consultar siempre `AGENTS.md`, `docs/REQUISITOS.md`, `docs/DECISIONES.md` y contratos antes de implementar.

## Instrucciones de ejecución
1. Android: usar proveedor GPS/LocationManager mediante plugin Capacitor nativo propio o verificado, sin dependencia de APIs cloud obligatorias.
2. Solicitar permisos en contexto, ubicación precisa; informar si permisos, GNSS o precisión no disponibles.
3. Registrar coordenadas, precisión horizontal, timestamp de captura y evaluación de `isMock`/`LocationCompat.isMock` con procedencia; evitar confiar ciegamente en boolean del cliente.
4. Backend mantiene lat/lon y radio configurable de terminal; usar Haversine y considerar incertidumbre `accuracy_m`.
5. Rechazar muestras obsoletas, de precisión insuficiente, fuera de radio, duplicadas o imposibles según reglas configurables.
6. No exigir que internet esté disponible; el GPS puede tardar más o perder calidad indoor: manejar timeout amigable y reintento.
7. La hora oficial de marcación es del servidor, no del móvil. Auditar rechazo sin almacenar más localización de la necesaria.
8. La simulación no es infaliblemente detectable; reportar límites y diseñar controles complementarios razonables.
9. Web browser GPS sólo consulta/demo; si antifraude es condición, registro admitido únicamente en Android nativo.

## Convenciones y contratos
Contrato ejemplo POST `/api/v1/asistencias/marcaciones` {request_id, tipo, location:{lat,lon,accuracy_m,captured_at,mock_detected}}; el servidor calcula distancia y permisos. El estado mock proviene de plugin nativo y puede ser manipulado: no es prueba criptográfica.

## Pruebas obligatorias
Radio dentro/fuera/borde, precisión 5/1000 m, mock true, sin señal, denegación, ubicación caduca, replay de request_id, hora móvil modificada, Android 8/10/14/16 y sin internet WAN.

## Errores y desviaciones prohibidas
No usar Google Maps API para validar geocerca, ni Wi-Fi como prueba inequívoca de presencia, ni declarar imposible el GPS falso.

## Entregable del agente
- Resumen de archivos modificados y motivo.
- Resultado real de comandos/tests; no inventar pruebas exitosas.
- Riesgos, supuestos y cambios pendientes.
- Correspondencia con RF/RNF y evidencias de aceptación.

## Documentación oficial de referencia
- https://developer.android.com/reference/android/location/Location
- https://capacitorjs.com/docs/apis/geolocation
- https://developer.android.com/develop/sensors-and-location/location

## Condición de finalización
La funcionalidad cumple sus criterios de aceptación, pasa las pruebas pertinentes y no rompe el funcionamiento sin internet.
