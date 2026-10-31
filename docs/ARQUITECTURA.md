# Arquitectura técnica

```text
[React Web Supervisor/Admin]     [React + Capacitor APK Conductor]
             \                            /
              \  HTTPS / WSS / Wi-Fi LAN /
                [Reverse proxy local]
                   |          |
              [Laravel API] [Reverb]
                   |
              [MySQL Docker]
```

Sin acceso directo a MySQL desde clientes. React estático alojado localmente; APK empaqueta frontend. Servidor con IP reservada y certificado local de confianza. Modulos backend/Front separados por responsabilidad, interfaz JSON `/api/v1`.

## Árbol esperado
`frontend/src/app`, `frontend/src/modules`, `frontend/src/shared`, `frontend/src/styles`; `backend/app/Modules`, `backend/app/Shared`; `mobile/` Android; `docker/`, `docs/`, `.agents/skills/`.

## Dependencias
Componentes de UI no llaman a MySQL. API centraliza acciones. No importar internals de módulos sin contrato. Los WebSockets son canal de actualización no fuente de verdad.
