# 🚀 Guía Maestra de Despliegue en cPanel con Git (PopyDev)

Esta guía explica paso a paso cómo montar cualquier proyecto nuevo (sitio estático, SPA con React/Vue o aplicación Full-Stack con Laravel y MySQL) en tu cPanel utilizando el flujo profesional de **Git Push Deployment** y tu configuración SSH ya establecida.

---

## 1. Dónde ubicar la nueva página en tu Hosting

Antes de empezar, define dónde vivirá la nueva web:

| Destino | Cuándo usarlo | Ruta típica en cPanel | URL pública |
| :--- | :--- | :--- | :--- |
| **Dominio Principal** | Si va a reemplazar la página principal de la web. | `/storage/popydev/public_html` | `https://popydev.com` |
| **Subdominio (Recomendado)** | Para no chocar con páginas existentes (ej. sistemas, blogs, tiendas). | `/storage/popydev/subdominio.popydev.com` | `https://app.popydev.com` |
| **Subcarpeta** | Para páginas secundarias o respaldos (como hicimos con el portafolio). | `/storage/popydev/public_html/nombre-carpeta` | `https://popydev.com/nombre-carpeta` |

> [!TIP]
> **Para crear un subdominio en cPanel:**
> Ve a **cPanel > Domains (Dominios) > Create a New Domain**.
> Desmarca la opción *"Share document root"*, ingresa `sistema2.popydev.com` y cPanel creará una carpeta aislada para ella.

---

## 2. Los dos tipos de arquitectura

### Tipo A: Frontend Estático o SPA (React, Vite, Vue, HTML/CSS)
- Todo el código compilado (`dist/` o `build/`) vive en la carpeta pública del dominio o subdominio.
- Requiere un `.htaccess` para que React Router no de error 404 al recargar pantalla.

### Tipo B: Full-Stack (Laravel + React + MySQL)
- **Regla de oro de seguridad:** El código PHP (`app/`, `config/`, `.env`, `storage/`) se coloca **FUERA** de la web pública (en `/storage/popydev/nombre_backend/`).
- En la carpeta pública solo va: el `index.html` de React, los `assets/`, el `index.php` de arranque y el `.htaccess`.

---

## 3. Paso a Paso para un Nuevo Proyecto

### FASE 1: Preparación Local del Proyecto

#### 1. Configurar `.gitignore`
Crea un archivo `.gitignore` en la raíz de tu proyecto para no subir archivos pesados ni credenciales:
```gitignore
# Entorno y credenciales
.env
.env.backup
.env.production

# Dependencias (NUNCA subirlas a Git)
node_modules/
vendor/

# Bases de datos locales
*.sqlite
*.sqlite-journal

# Temporales y logs
*.log
.DS_Store
Thumbs.db
.vscode/
.idea/
```
*(Si vas a desplegar un frontend compilado en un cPanel sin Node.js, asegúrate de NO ignorar `dist` o coméntalo).*

#### 2. Compilar el Frontend
Si usas Vite o React:
```bash
npm run build
```
Verifica que la carpeta `dist/` se haya creado con `index.html` y los archivos dentro de `assets/`.

#### 3. Crear el archivo `.cpanel.yml`
En la raíz de tu proyecto crea el archivo `.cpanel.yml` adaptado a la ruta de tu proyecto:

**Ejemplo para Full-Stack (Laravel + React):**
```yaml
---
deployment:
  tasks:
    - export BACKENDPATH=/storage/popydev/mi_backend
    - export DEPLOYPATH=/storage/popydev/public_html
    - /bin/mkdir -p $BACKENDPATH
    - /bin/cp -R backend/* $BACKENDPATH/
    - /bin/mkdir -p $BACKENDPATH/storage $BACKENDPATH/bootstrap/cache
    - /bin/chmod -R 775 $BACKENDPATH/storage $BACKENDPATH/bootstrap/cache
    - /bin/mkdir -p $DEPLOYPATH
    - /bin/cp -R frontend/dist/* $DEPLOYPATH/
    - /bin/cp deployment/cpanel/public_html/index.php $DEPLOYPATH/index.php
    - /bin/cp deployment/cpanel/public_html/.htaccess $DEPLOYPATH/.htaccess
```

**Ejemplo para Sitio Estático o SPA puro (React / HTML):**
```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/storage/popydev/public_html
    - /bin/mkdir -p $DEPLOYPATH
    - /bin/cp -R dist/* $DEPLOYPATH/
    - /bin/cp .htaccess $DEPLOYPATH/.htaccess
```

---

### FASE 2: Subir a GitHub

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
# 1. Inicializar repositorio
git init
git branch -M main

# 2. Agregar archivos y hacer el primer commit
git add .
git commit -m "feat: version lista para despliegue"

# 3. Vincular con GitHub
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

---

### FASE 3: Configurar el Repositorio en cPanel

1. Entra a tu **cPanel** > **Git™ Version Control**.
2. Haz clic en **Create**.
3. Selecciona la opción de repositorio **VACÍO** (no marques clonar):
   - **Repository Name:** Nombre descriptivo (ej: `otra-pagina`).
   - **Repository Path:** `/storage/popydev/repositories/otra-pagina`
4. Haz clic en **Create**.
5. Ve a **Manage** y copia el **Clone URL**. Tendrá este formato:
   `ssh://popydev@popydev.com:2321/storage/popydev/repositories/otra-pagina`

---

### FASE 4: Enviar el Código a cPanel (Push Deployment)

Como tu clave SSH ya está autorizada en cPanel, en tu terminal solo ejecutas:

```bash
# Agregar cPanel como remoto de producción
git remote add production ssh://popydev@popydev.com:2321/storage/popydev/repositories/otra-pagina

# Desplegar
git push -u production main
```

Al recibir el push, cPanel ejecutará `.cpanel.yml` y colocará los archivos en las carpetas indicadas.

---

### FASE 5: Base de Datos y Backend (Solo si usa Laravel / MySQL)

#### 1. Crear Base de Datos
- En cPanel ve a **MySQL Database Wizard**.
- Crea la base de datos (ej. `popydev_nueva_bd`).
- Crea el usuario (ej. `popydev_nuevo_user`) y clave fuerte.
- Asigna **ALL PRIVILEGES**.

#### 2. Subir dependencias de Laravel (`vendor`)
Como `vendor` no va en Git:
- En tu PC comprime la carpeta `backend/vendor` en un zip (`tar.exe -a -cf backend_vendor.zip -C backend vendor`).
- Súbelo por Administrador de Archivos a la carpeta de tu backend en cPanel y dale **Extract**.
- *(O si tienes SSH: `scp -P 2321 backend_vendor.zip popydev@popydev.com:/storage/popydev/mi_backend/` y descomprímelo).*

#### 3. Configurar `.env`
En la carpeta privada del backend crea el `.env`:
```env
APP_NAME="Mi Nueva App"
APP_ENV=production
APP_KEY=base64:TU_KEY_AQUI
APP_DEBUG=false
APP_URL=https://tudominio.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=popydev_nueva_bd
DB_USERNAME=popydev_nuevo_user
DB_PASSWORD=TuPasswordSeguro

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

#### 4. Migrar la Base de Datos
Por SSH o en la Terminal de cPanel:
```bash
ssh -p 2321 popydev@popydev.com
cd /storage/popydev/mi_backend
php artisan migrate --seed --force
```

---

### FASE 6: El `.htaccess` Maestro (SPA Routing y PHP)

En la carpeta pública del sitio (`public_html` o la carpeta del subdominio) coloca este archivo `.htaccess`:

```apache
# 1. Asegurar que sirva index.html por defecto para React
DirectoryIndex index.html index.php

<IfModule mod_rewrite.c>
    RewriteEngine On

    # Pasar cabeceras de autorización a Laravel
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Si tienes una carpeta de respaldo (ej. /portafolio), no interferir
    RewriteRule ^portafolio(/.*)?$ - [L]

    # Enrutar llamadas a la API hacia Laravel index.php
    RewriteRule ^(api|sanctum)(/.*)?$ index.php [L,QSA]

    # Servir archivos estáticos reales (JS, CSS, imágenes) directamente
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # SPA Fallback: Cualquier otra ruta interna de React -> index.html
    RewriteRule ^ index.html [L]
</IfModule>

# Bloquear archivos ocultos sensibles (.env, .git, etc.)
<FilesMatch "^\.">
    Require all denied
</FilesMatch>
```

---

## 4. Cheat Sheet de Comandos Rápidos

| Acción | Comando |
| :--- | :--- |
| **Push a GitHub** | `git push origin main` |
| **Push y despliegue a cPanel** | `git push production main` |
| **Conectarse a cPanel por SSH** | `ssh -p 2321 popydev@popydev.com` |
| **Subir archivos pesados por SSH** | `scp -P 2321 archivo.zip popydev@popydev.com:/storage/popydev/ruta/` |
| **Limpiar caché de Laravel en servidor** | `php artisan config:clear && php artisan cache:clear` |
| **Ver logs de error de Laravel** | `tail -n 50 /storage/popydev/backend/storage/logs/laravel.log` |
| **Cambiar versión de PHP por SSH** | `uapi LangPHP php_set_vhost_versions vhost=tudominio.com version=ea-php82` |

---

## 5. Solución a Errores Típicos

1. **Error: Host key verification failed / Permission denied**
   - Asegúrate de usar el puerto `2321`: `ssh://popydev@popydev.com:2321/...`
   - Tu clave pública `id_ed25519` ya está registrada y autorizada en cPanel.

2. **Error: 404 al recargar pantallas secundarias en React (ej. /dashboard)**
   - Falta la regla `RewriteRule ^ index.html [L]` en tu `.htaccess`.

3. **Error: Composer detected issues in your platform (PHP version)**
   - El hosting tiene todos los módulos completos (`mbstring`, `iconv`, `pdo_mysql`) en la versión **`ea-php82`**. Si usas PHP 8.2, asegúrate de que el vhost esté en `ea-php82`.

4. **Error: 500 Internal Server Error en Laravel**
   - Verifica permisos de carpetas: `chmod -R 775 storage bootstrap/cache`.
   - Verifica que exista el archivo `.env` con su `APP_KEY`.

