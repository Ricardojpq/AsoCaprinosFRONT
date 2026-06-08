# ✅ Checklist Pre-Despliegue - AsoCaprinos Frontend

> **Instrucciones**: Revisa cada ítem antes de desplegar a producción. Marca con `[x]` cuando esté completado.

---

## 🔧 1. Configuración del Proyecto

### Archivos Esenciales
- [ ] **`angular.json`** configurado correctamente
- [ ] **`package.json`** tiene todas las dependencias necesarias
- [ ] **`src/environments/environment.ts`** configurado para producción
- [ ] **`.gitignore`** excluye correctamente: `node_modules/`, `dist/`, `.env`

### Entornos Configurados

Verifica que existan y estén configurados:

- [ ] `src/environments/environment.ts` (producción)
  ```typescript
  production: true,
  apiUrl: 'https://api.tudominio.com'  // ← URL real del API
  ```
- [ ] `src/environments/environment.development.ts` (desarrollo)
  ```typescript
  production: false,
  apiUrl: 'http://localhost:8000'  // ← URL local del API
  ```

---

## 🧪 2. Pruebas Locales

### Build de Producción
- [ ] El proyecto compila sin errores:
  ```bash
  npm run build:prod
  ```
- [ ] Se genera la carpeta `dist/management-system-asocaprinos-2/`
- [ ] No hay archivos faltantes en el build

### Funcionalidad Local
- [ ] Login funciona con API local
- [ ] Navegación entre páginas funciona
- [ ] CRUD de animales opera correctamente
- [ ] No hay errores en la consola del navegador

---

## 🔗 3. Conexión con API

### Backend Verificado
- [ ] API está desplegada y accesible
- [ ] Swagger UI carga: `https://api.tudominio.com/api/documentation`
- [ ] Login en API funciona (probar con Postman/cURL)
- [ ] CORS configurado correctamente para dominio del frontend

### URL Configurada
- [ ] `environment.ts` apunta a URL de producción del API
- [ ] La URL incluye protocolo `https://`
- [ ] No hay `/` al final de la URL del API

---

## 📂 4. Archivos de Build

### Verificar Contenido del Build

Después de `npm run build:prod`, verifica que existan:

```
dist/management-system-asocaprinos-2/
├── index.html              [✅ Debe existir]
├── main-*.js               [✅ Debe existir]
├── polyfills-*.js          [✅ Debe existir]
├── runtime-*.js            [✅ Debe existir]
├── styles-*.css            [✅ Debe existir]
├── favicon.ico             [✅ Debe existir]
└── assets/                 [✅ Debe existir]
    ├── images/
    └── icons/
```

### Archivos a Incluir en ZIP
- [ ] `index.html`
- [ ] `main-*.js`
- [ ] `polyfills-*.js`
- [ ] `runtime-*.js`
- [ ] `styles-*.css`
- [ ] `favicon.ico`
- [ ] `assets/` (completa)
- [ ] Otros archivos `.js` y `.css` generados

### Archivos a EXCLUIR
- [ ] `environment.ts` original (ya está compilado dentro del JS)
- [ ] Archivos de mapa `*.js.map` (opcional, ocupan espacio)

---

## 🌐 5. Configuración de Dominio

### cPanel Preparado
- [ ] Dominio o subdominio apuntando al hosting
- [ ] SSL/TLS configurado (HTTPS obligatorio)
- [ ] Acceso a File Manager disponible

### Estructura de Carpetas
- [ ] `public_html/` existe y está vacío o con backup previo
- [ ] Se tiene acceso para subir archivos

---

## 📝 6. Archivo .htaccess

### Configuración Correcta
- [ ] Archivo `.htaccess` preparado con:
  - Rewrite rules para SPA (todo a index.html)
  - Compresión gzip habilitada
  - Headers de cache para archivos estáticos

**Contenido mínimo requerido:**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
```

---

## ✅ 7. Pruebas Post-Deploy Esperadas

| Prueba | Descripción | Estado |
|--------|-------------|--------|
| App carga | La página principal carga sin error 500 | ⬜ |
| Login funciona | Autenticación con API exitosa | ⬜ |
| Navegación SPA | `/Animals` carga correctamente | ⬜ |
| Refresh SPA | F5 en `/Fairs` no da 404 | ⬜ |
| HTTPS activo | Candado verde en navegador | ⬜ |
| Sin errores JS | Consola del navegador limpia | ⬜ |

---

## 🔒 8. Seguridad

### Configuración Segura
- [ ] `production: true` en `environment.ts`
- [ ] No hay credenciales hardcodeadas en el código
- [ ] No hay claves de API expuestas
- [ ] HTTPS habilitado en el servidor

### Datos Sensibles
- [ ] No se sube `.env` o archivos de configuración local
- [ ] No se suben archivos de IDE (`.idea/`, `.vscode/`)

---

## 📊 Resumen Final

| Aspecto | Estado |
|---------|--------|
| Build exitoso | ⬜ OK / ⬜ Revisar |
| Entornos configurados | ⬜ OK / ⬜ Revisar |
| API conectada | ⬜ OK / ⬜ Revisar |
| Archivos listos | ⬜ OK / ⬜ Revisar |
| .htaccess preparado | ⬜ OK / ⬜ Revisar |
| Seguridad | ⬜ OK / ⬜ Revisar |

**¿Listo para desplegar?** Solo procede si todos los checks críticos están marcados.

---

## 🆘 Si Algo Falla en Producción

### Problemas Comunes

| Síntoma | Diagnóstico | Solución Rápida |
|---------|-------------|-----------------|
| Página en blanco | Error en build | Revisar consola del navegador (F12) |
| 404 en rutas | .htaccess no funciona | Verificar que existe y tiene rewrite rules |
| No conecta con API | CORS o URL incorrecta | Verificar `environment.ts` y CORS del backend |
| Logo/íconos no cargan | Ruta de assets incorrecta | Verificar que carpeta `assets/` se subió |
| Versión antigua mostrada | Cache del navegador | Hard refresh: Ctrl+F5 o limpiar cache |

### Comandos de Emergencia

```bash
# Si necesitas hacer rollback rápido:
# 1. Renombrar carpeta actual como backup
# 2. Subir versión anterior
# 3. Verificar .htaccess
```

---

## 📞 Checklist de Verificación Post-Deploy

Después de desplegar, verifica inmediatamente:

- [ ] La aplicación carga en el navegador
- [ ] Puedes hacer login con credenciales de prueba
- [ ] Puedes navegar a `/Animals` y carga
- [ ] Presionar F5 en `/Animals` no da error 404
- [ ] No hay errores rojos en la consola (F12)
- [ ] Los estilos se ven correctamente

---

**Fecha de revisión**: ___/___/______  
**Revisado por**: ________________  
**Versión a desplegar**: ___________

