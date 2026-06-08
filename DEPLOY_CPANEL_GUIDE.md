# 🚀 Guía de Despliegue - AsoCaprinos Frontend en cPanel

> **Estructura**: `app.asocabravenezuela.com` (Frontend) apunta a `api.asocabravenezuela.com` (Backend)

> **TL;DR**: Compila el proyecto, sube la carpeta `browser/` a `app.asocabravenezuela.com`, configura `.htaccess`, ¡listo!

---

## 📋 Índice Rápido

1. [Preparación](#paso-1-preparación)
2. [Configurar Subdominio](#paso-2-configurar-subdominio)
3. [Configurar Entornos](#paso-3-configurar-entornos)
4. [Compilar Proyecto](#paso-4-compilar-proyecto)
5. [Subir a cPanel](#paso-5-subir-a-cpanel)
6. [Verificar](#paso-6-verificar)
7. [Solución de Problemas](#-solución-de-problemas)

---

## ✅ Requisitos Previos

| Requisito | Versión | Verificación |
|-----------|---------|--------------|
| Node.js | 18+ | `node --version` |
| Angular CLI | 20+ | `ng version` |
| pnpm/npm | 9+ | `pnpm --version` |
| API Backend | Desplegada | `https://api.asocabravenezuela.com/api/documentation` |

### 🗂️ Estructura de Subdominios

```
/home/tu_usuario/
├── 📁 api.asocabravenezuela.com/     ← Backend Laravel
├── 📁 app.asocabravenezuela.com/     ← Frontend Angular (tú estás aquí)
│   ├── index.html
│   ├── main-*.js
│   └── assets/
└── 📁 public_html/                   ← Landing page estática
```

| Subdominio | Proyecto | Document Root cPanel |
|------------|----------|---------------------|
| `api.asocabravenezuela.com` | Backend | `api.asocabravenezuela.com/public` |
| `app.asocabravenezuela.com` | Frontend | `app.asocabravenezuela.com` |
| `asocabravenezuela.com` | Landing | `public_html` |

---

## Paso 1: Preparación

### 1.1 Verificar que el proyecto compila localmente

```powershell
# En tu máquina local (PowerShell)
cd d:\Projects\AsoCabra\AsoCaprinosFRONT

# Instalar dependencias
npm install

# Compilar para producción
npm run build:prod
```

**Debe completarse sin errores y crear la carpeta `dist/`.**

---

## Paso 2: Configurar Subdominio en cPanel

1. Ve a **cPanel > Subdomains**
2. Crea subdominio: `app`
3. **Document Root**: `app.asocabravenezuela.com`
4. Click **Create**

> El subdominio `app` apuntará automáticamente a la carpeta `app.asocabravenezuela.com/`

---

## Paso 3: Configurar Entornos

### 3.1 Archivos de entorno

Verifica que existan estos archivos en `src/environments/`:

```
src/environments/
├── environment.ts              ← Producción (usado en build:prod)
└── environment.development.ts  ← Desarrollo local
```

### 3.2 Configurar URL del API (CRÍTICO)

Edita `src/environments/environment.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.asocabravenezuela.com',  // ← Tu API backend
  apiPrefix: '/api',
  apiVersion: 'v1',
  appName: 'AsoCaprinos',
  version: '1.0.0',
  defaultLanguage: 'es',
  // ... resto de configuración
};
```

> ⚠️ **CRÍTICO**: La URL debe ser `https://api.asocabravenezuela.com`, NO localhost.

### 3.3 Verificar angular.json

Asegúrate de tener esta configuración para producción:

```json
"production": {
  "baseHref": "/",
  "outputHashing": "all",
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "500kB",
      "maximumError": "1MB"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "4kB",
      "maximumError": "12kB"
    }
  ]
}
```

> Para subdominio raíz (`app.asocabravenezuela.com`), usa `"baseHref": "/"`

---

## Paso 4: Compilar Proyecto

### 4.1 Build de producción

```powershell
# En tu máquina local
cd d:\Projects\AsoCabra\AsoCaprinosFRONT

# Instalar dependencias (si es primera vez)
pnpm install

# Compilar para producción
pnpm run build:prod
```

**Resultado esperado:**
```
dist/management-system-asocaprinos-2/
├── browser/              ← ✅ SOLO SUBIR EL CONTENIDO DE ESTA CARPETA
│   ├── index.html
│   ├── main-*.js
│   ├── polyfills-*.js
│   ├── styles-*.css
│   ├── chunk-*.js
│   └── assets/
└── server/               ← ❌ NO subir (SSR)
```

### 4.2 Verificar el build

```powershell
# El build crea estos archivos optimizados:
ls dist/management-system-asocaprinos-2/browser/

# Debe incluir:
# - index.html
# - main-*.js (con hash)
# - styles-*.css (con hash)
# - assets/
```

> 💡 **El hash en los nombres** (ej: `main-A1B2C3.js`) permite cacheo eficiente.

---

## Paso 5: Subir a cPanel

### 5.1 ¿Qué subir?

**SOLO el contenido de la carpeta `browser/`**

```
dist/management-system-asocaprinos-2/browser/
├── index.html          ← Sube esto
├── main-*.js           ← Sube esto
├── polyfills-*.js      ← Sube esto
├── styles-*.css        ← Sube esto
├── chunk-*.js          ← Sube esto
└── assets/             ← Sube esto
```

### 5.2 Estructura final en el servidor

```
/home/tu_usuario/
└── 📁 app.asocabravenezuela.com/     ← Frontend Angular
    ├── 📄 index.html                 ← Página principal
    ├── 📄 .htaccess                  ← Configuración Apache
    ├── 📁 assets/                    ← Recursos estáticos
    └── 📄 ... archivos JS/CSS        ← Compilados por Angular
```

### 5.3 Subir vía cPanel File Manager

1. **Comprimir build localmente:**
```powershell
# En PowerShell - SOLO la carpeta browser/
Compress-Archive -Path "dist\management-system-asocaprinos-2\browser\*" -DestinationPath "AsoCaprinosFRONT-Deploy.zip" -Force
```

2. **En cPanel:**
   - Ve a **File Manager**
   - Navega a `app.asocabravenezuela.com/`
   - **Elimina** archivos anteriores (si es actualización)
   - Sube `AsoCaprinosFRONT-Deploy.zip`
   - Extrae el contenido
   - Verifica que `index.html` quede en: `app.asocabravenezuela.com/index.html`

### 5.4 Crear archivo .htaccess (IMPORTANTE)

En `app.asocabravenezuela.com/`, crea archivo `.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Redirigir HTTP a HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Si el archivo o directorio existe, servirlo directamente
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]
    
    # Redirigir todo a index.html (SPA behavior)
    RewriteRule ^ index.html [L]
</IfModule>

# Compresión gzip
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>

# Cache de archivos estáticos
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

> ⚠️ **Este .htaccess es CRÍTICO** para que Angular Router funcione correctamente.

---

## Paso 6: Verificar

### 6.1 Checklist de verificación

| Prueba | URL | Estado |
|--------|-----|--------|
| App carga | `https://app.asocabravenezuela.com` | ⬜ |
| Login funciona | Intentar login con credenciales | ⬜ |
| Navegación SPA | Refrescar página en ruta diferente (ej: `/Animals`) | ⬜ |
| Sin errores 404 | Inspeccionar > Console | ⬜ |
| HTTPS activo | Candado verde en navegador | ⬜ |
| API conecta | DevTools > Network > peticiones API | ⬜ |

### 6.2 Probar navegación SPA

1. Abre la app: `https://app.asocabravenezuela.com`
2. Navega a cualquier ruta (ej: `/Animals`, `/Farms`)
3. **Presiona F5 (refrescar)**
4. **Esperado**: La página recarga sin error 404

> Si obtienes 404 al refrescar, el `.htaccess` no está funcionando o está en la carpeta incorrecta.

### 6.3 Verificar conexión con API

Abre DevTools (F12) > Network, haz login y verifica:
- Las peticiones van a `https://api.asocabravenezuela.com/api/v1/...`
- No hay errores CORS
- Respuestas HTTP 200/201

---

## 🔧 Solución de Problemas

### Error 404 al refrescar página

| Causa | Solución |
|-------|----------|
| Falta .htaccess | Crear archivo `.htaccess` con rewrite rules |
| mod_rewrite desactivado | Contactar hosting para habilitar |
| Ruta incorrecta | Verificar que `.htaccess` esté en `app.asocabravenezuela.com/` |

### La app carga pero no conecta con API

| Síntoma | Causa | Solución |
|---------|-------|----------|
| "Network Error" | CORS | Agregar dominio frontend a CORS del API |
| "404 Not Found" | URL API incorrecta | Verificar `environment.ts` > `apiUrl` |
| "401 Unauthorized" | Token expirado | Limpiar localStorage, re-login |

### Error "Failed to load module"

```
# Verificar que todos los archivos JS/CSS se copiaron:
ls dist/management-system-asocaprinos-2/browser/

# Deben existir archivos como:
# - main-*.js
# - polyfills-*.js
# - runtime-*.js
# - styles-*.css
```

### Cache de navegador

Después de cada despliegue, los usuarios pueden ver la versión antigua:

```html
<!-- Opción 1: Agregar versión en index.html (antes del cierre de </head>) -->
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

```typescript
// Opción 2: Agregar timestamp a las peticiones API
const apiUrl = `${environment.apiUrl}/api/v1?nocache=${Date.now()}`;
```

---

## 📁 Estructura Final Esperada

```
/home/tu_usuario/
├── 📁 api.asocabravenezuela.com/     [Backend Laravel]
│   └── ...
├── 📁 app.asocabravenezuela.com/     [Frontend Angular]
│   ├── 📄 .htaccess                  [configuración Apache]
│   ├── 📄 index.html                 [SPA entry point]
│   ├── 📁 assets/                    [imágenes, fuentes, iconos]
│   ├── 📄 main-XXXXXXXX.js           [JS principal con hash]
│   ├── 📄 polyfills-XXXXXXXX.js      [polyfills con hash]
│   ├── 📄 styles-XXXXXXXX.css        [CSS con hash]
│   └── 📄 ... otros chunks de Angular
└── 📁 public_html/                   [Landing page estática]
    └── 📄 index.html
```

> Los archivos con hash (ej: `main-A1B2C3D4.js`) permiten que el navegador cachee eficientemente.

---

## 🔄 Flujo de Trabajo para Actualizaciones

```powershell
# 1. Actualizar código
git pull

# 2. Actualizar dependencias (si cambió package.json)
npm install

# 3. Compilar producción
npm run build:prod

# 4. Crear ZIP del build (SOLO carpeta browser/)
Compress-Archive -Path "dist\management-system-asocaprinos-2\browser\*" -DestinationPath "AsoCaprinosFRONT-v2.zip" -Force

# 5. Subir a cPanel (File Manager o FTP)
#    - Reemplazar contenido de app.asocabravenezuela.com/
#    - Mantener .htaccess (o subirlo de nuevo)
```

---

## 🔒 Seguridad Post-Despliegue

- ✅ **SSL activo**: `https://` obligatorio (configurar en cPanel > SSL/TLS)
- ✅ **Proteger archivos sensibles**: No subir `environment.ts` con datos reales a repositorios públicos
- ✅ **Content Security Policy**: Considerar agregar headers CSP en `.htaccess`

---

## 📝 Notas Importantes

### Angular como SPA (Single Page Application)

Angular es una SPA: solo hay un `index.html` real. Todas las rutas (`/Animals`, `/Fairs`, etc.) son manejadas por JavaScript en el cliente.

**Por eso el `.htaccess` redirige todo a `index.html`:**
```apache
# Esta regla es ESENCIAL:
RewriteRule ^ index.html [L]
```

### Compatibilidad con navegadores

El build de producción genera código compatible con:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

---

## 🆘 Contacto y Soporte

Si tienes problemas:

1. Verifica la consola del navegador (F12) por errores de JavaScript
2. Revisa que el API responde correctamente
3. Confirma que el `.htaccess` está en el lugar correcto

**✨ ¡Listo! Tu aplicación Angular debería estar funcionando en `https://app.asocabravenezuela.com`**

¿Problemas? Revisa el paso 6 de verificación y la sección de solución de problemas.
