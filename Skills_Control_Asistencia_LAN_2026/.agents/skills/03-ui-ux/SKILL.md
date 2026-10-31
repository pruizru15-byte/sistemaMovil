# Diseño UI UX y temas

> Skill para agentes de desarrollo. Versión del paquete: 1.0 — 2026-10-17.

## Propósito y activación
Activar para diseñar o modificar componentes visuales, iconografía, navegación y accesibilidad.

## Contexto obligatorio
- Proyecto académico de asistencia de conductores y turnos, terminal Ate.
- Operación **únicamente LAN Wi-Fi**, sin nube, internet, Firebase, CDNs o APIs pagadas durante la ejecución.
- Un servidor físico Windows/Docker; Laravel API + MySQL; React web y APK con Capacitor.
- Roles: Administrador, Supervisor y Conductor. Administrador con operaciones autorizadas y auditadas; baja lógica de usuarios con historial.
- Consultar siempre `AGENTS.md`, `docs/REQUISITOS.md`, `docs/DECISIONES.md` y contratos antes de implementar.

## Instrucciones de ejecución
1. Diseñar tokens semánticos en `styles/tokens.css`, `themes.css`, `globals.css`.
2. Fondo claro #F4F7FB, superficie #FFFFFF, texto #0F172A; oscuro fondo #0B1220, superficie #151F30, texto #F8FAFC.
3. Primario #2563EB, primario oscuro #60A5FA; éxito #16A34A, alerta #D97706, error #DC2626; verificar contraste en cada uso.
4. Elementos táctiles mínimo 48×48 CSS px aproximados en WebView con viewport correcto; respetar densidad, zoom y safe areas.
5. Crear Button, Input, Select, Modal, DataTable, DatePicker, Toast, Spinner y Badge reutilizables.
6. CSS variables + Tailwind v4 como utilidades; CSS Modules para estilos complejos específicos.
7. Fuente Inter alojada localmente, fallback system-ui; no descargar recursos al ejecutar.
8. Estados hover/focus/disabled/loading/error claros, navegación por teclado y mensajes comprensibles.

## Convenciones y contratos
Usar tokens `--color-bg`, `--color-surface`, `--color-text`, `--color-border`, `--color-primary`; preferir `data-theme=light|dark` sin colores hardcoded en módulos. Persistir preferencia por usuario de forma segura. Componentes de marca sólo en shared.

## Pruebas obligatorias
Auditoría WCAG 2.2 AA objetivo, contraste, lectores de pantalla, modo oscuro, reduced motion, responsive 320–1440px, Android con teclado y gesto atrás.

## Errores y desviaciones prohibidas
No utilizar 20 sistemas de estilos, Tailwind con colores divergentes, botones pequeños, iconos sin etiquetas o contraste insuficiente.

## Entregable del agente
- Resumen de archivos modificados y motivo.
- Resultado real de comandos/tests; no inventar pruebas exitosas.
- Riesgos, supuestos y cambios pendientes.
- Correspondencia con RF/RNF y evidencias de aceptación.

## Documentación oficial de referencia
- https://tailwindcss.com/docs/installation/using-vite
- https://www.w3.org/TR/WCAG22/
- https://developer.android.com/design/ui/mobile/guides/foundations/accessibility

## Condición de finalización
La funcionalidad cumple sus criterios de aceptación, pasa las pruebas pertinentes y no rompe el funcionamiento sin internet.
