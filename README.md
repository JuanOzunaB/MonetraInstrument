---
title: monetra-instrument - Service README
generated_by: archai-docgen
---

# monetra-instrument

## Descripción del servicio

**monetra-instrument** es una aplicación web interactiva desarrollada con React que proporciona herramientas de evaluación y visualización de datos. El servicio ofrece múltiples interfaces especializadas:

- **Landing**: Página de inicio y presentación del instrumento
- **Dashboard**: Panel de control principal para visualización de métricas
- **Benchmark**: Herramienta de comparación y análisis de rendimiento
- **ExpertEval**: Módulo de evaluación para usuarios expertos
- **UserEval**: Sistema de evaluación para usuarios estándar

La aplicación implementa autenticación OAuth y gestión de sesiones, proporcionando una experiencia segura y personalizada para diferentes tipos de usuarios.

## Tech stack

- **Frontend Framework**: React 18.3.1
- **Routing**: React Router DOM 6.28.0
- **Visualización de Datos**: Chart.js 4.4.0
- **Build Tool**: Vite 6.0.6
- **Bundler de Desarrollo**: Vite con plugin React
- **Lenguaje**: JavaScript (ES Modules)
- **Estilos**: CSS personalizado

## Prerequisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Node.js**: versión 16.x o superior (recomendado 18.x+)
- **npm**: versión 8.x o superior (incluido con Node.js)
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet para descargar dependencias

## Cómo correr localmente

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd monetra-instrument
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno** (ver sección siguiente)
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Acceder a la aplicación**
   
   Abre tu navegador en `http://localhost:5173` (puerto por defecto de Vite)

6. **Comandos adicionales**
   ```bash
   # Construir para producción
   npm run build
   
   # Previsualizar build de producción
   npm run preview
   ```

## Variables de entorno requeridas

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# API Configuration
VITE_API_BASE_URL=<url-del-backend-api>
VITE_API_TIMEOUT=30000

# OAuth Configuration
VITE_OAUTH_CLIENT_ID=<client-id-oauth>
VITE_OAUTH_REDIRECT_URI=<redirect-uri-callback>
VITE_OAUTH_PROVIDER_URL=<url-proveedor-oauth>

# Environment
VITE_ENV=development

# Optional: Analytics
VITE_ANALYTICS_ID=<analytics-tracking-id>
```

**Nota**: Todas las variables de entorno deben tener el prefijo `VITE_` para ser accesibles en el código del cliente.

## Dependencias externas

### Servicios Externos

1. **API Backend**: 
   - Servicio REST para datos de evaluaciones y benchmarks
   - Endpoints esperados en `/src/services/api.js`

2. **Proveedor OAuth**: 
   - Sistema de autenticación para login de usuarios
   - Callback manejado en `/src/pages/OAuthCallback.jsx`

3. **Session Management**: 
   - Sistema de gestión de sesiones implementado en `/src/services/session.js`

### Dependencias NPM

- **chart.js**: Librería de visualización de gráficos
- **react-router-dom**: Navegación entre páginas
- **react & react-dom**: Framework base

## Scripts disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| **dev** | `npm run dev` | Inicia el servidor de desarrollo con hot-reload en puerto 5173 |
| **build** | `npm run build` | Genera build optimizado para producción en carpeta `dist/` |
| **preview** | `npm run preview` | Previsualiza el build de producción localmente |

### Uso de Scripts

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Previsualización local del build
npm run preview
```

## Limitaciones y Supuestos

### Supuestos Asumidos

1. **Backend API**: Se asume la existencia de un servicio backend REST disponible y funcional
2. **OAuth Provider**: Se presupone un proveedor OAuth configurado externamente
3. **Variables de Entorno**: Los valores específicos de configuración deben ser proporcionados por el equipo de operaciones
4. **Documentación INSTRUMENTO_GUIA.md**: Se asume que existe documentación adicional sobre el uso del instrumento en este archivo

### Limitaciones Conocidas

1. **Archivos HTML estáticos**: Existen múltiples archivos HTML (`benchmark.html`, `dashboard.html`, etc.) que podrían ser redundantes con las páginas React
2. **Configuración OAuth**: No se incluyen detalles específicos del flujo OAuth ni del proveedor utilizado
3. **Endpoints API**: No se documenta la estructura específica de los endpoints del backend
4. **Testing**: No se identificaron scripts de testing en el `package.json`
5. **Linting/Formatting**: No se observan herramientas de linting (ESLint, Prettier) configuradas
6. **Variables de Entorno**: Los valores reales deben obtenerse del equipo o documentación interna

**Nota**: Esta documentación fue generada automáticamente basándose en la estructura del repositorio. Se recomienda validar y complementar con información específica del dominio y requisitos del negocio.
