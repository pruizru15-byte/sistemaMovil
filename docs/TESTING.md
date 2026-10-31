# Matriz de validación

- LAN offline: desconectar internet, conectar 2 teléfonos y un PC al Wi-Fi, verificar login, GPS, marcado, dashboard y reportes.
- Seguridad: políticas/IDOR, CSRF, contraseñas, tokens revocados, HTTPS y secretos fuera de repositorio.
- Ubicación: dentro/fuera radio, mock Android, baja precisión, permisos denegados, posición antigua, GPS apagado.
- Integridad: doble marcado, concurrencia, turno solapado, desactivación con historial, respaldo y restauración.
- UX: 48dp, lector, contraste claro/oscuro, pantalla estrecha y conexión intermitente.
- RNF-03: medir percentiles y registrar condiciones del servidor y Wi-Fi. La adquisición GNSS no se presupone <=3s.
- Android 8/API26: instalación real o emulador, TLS CA y flujo completo.
