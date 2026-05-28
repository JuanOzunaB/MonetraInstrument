---
title: monetra-instrument - Service README
generated_by: archai-docgen
---

# monetra-instrument

## Descripción del servicio

**monetra-instrument** es una aplicación web moderna desarrollada con React que proporciona un sistema integral de evaluación y análisis de instrumentos financieros. El servicio ofrece múltiples interfaces especializadas para diferentes tipos de usuarios y casos de uso:

- **Landing**: Página de inicio y presentación del instrumento de evaluación
- **Dashboard**: Panel de control principal con métricas y visualizaciones interactivas
- **Benchmark**: Herramienta de comparación y análisis de rendimiento de instrumentos
- **ExpertEval**: Módulo de evaluación especializado para usuarios expertos con funcionalidades avanzadas
- **UserEval**: Sistema de evaluación para usuarios estándar con interfaz simplificada

La aplicación implementa autenticación OAuth2 para garantizar acceso seguro, gestión de sesiones persistente, y utiliza Chart.js para visualizaciones de datos profesionales. El proyecto está construido con Vite para un desarrollo ágil y builds optimizados.

## Tech stack

- **Frontend Framework**: React 18.3.1
- **Routing**: React Router DOM 6.28.0
- **Visualización de Datos**: Chart.js 4.4.0
- **Build Tool**: Vite 6.0.6
- **Plugin**: @vitejs/plugin-react 4.3.4
- **Lenguaje**: JavaScript ES6+ (ES Modules)
- **Estilos**: CSS3 personalizado
- **Gestión de Estado**: Context API / Props (basado en estructura React estándar)

## Prerequisitos

Para ejecutar este proyecto necesitas tener instalado:

- **Node.js**: versión 18.x o superior (recomendado LTS)
- **npm**: versión 9.x o superior (incluido con Node.js)
- **Git**: para clonar el repositorio
- **Navegador web moderno**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Conexión a internet**: para instalación de dependencias y comunicación con APIs externas

Opcionalmente:
- **Visual Studio Code**: IDE recomendado con extensiones React y ESLint

## Cómo correr localmente

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd monetra-instrument
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto (ver sección "Variables de entorno requeridas"):
   ```bash
   touch .env
   ```
   
   Edita el archivo con las configuraciones necesarias.

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Acceder a la aplicación**
   
   Abre tu navegador en la URL que muestra la consola, típicamente:
   ```
   http://localhost:5173
   ```

6. **Verificar funcionalidad**
   - Navega a cada sección (Landing, Dashboard, Benchmark, etc.)
   - Verifica que las gráficas carguen correctamente
   - Prueba el flujo de autenticación OAuth

**Para producción:**
```bash
# Generar build optimizado
npm run build

# Previsualizar build localmente
npm run preview
```

Los archivos compilados estarán en el directorio `dist/`.

## Variables de entorno requeridas

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# API Configuration
VITE_API_BASE_URL=https://api.ejemplo.com/v1
VITE_API_TIMEOUT=30000

# OAuth 2.0 Configuration
VITE_OAUTH_CLIENT_ID=tu-client-id-oauth
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/oauth/callback
VITE_OAUTH_PROVIDER_URL=https://oauth-provider.ejemplo.com
VITE_OAUTH_SCOPE=read write

# Session Configuration
VITE_SESSION_STORAGE_KEY=monetra_session
VITE_SESSION_TIMEOUT=3600000

# Environment
VITE_ENV=development
NODE_ENV=development

# Feature Flags (Opcional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# Analytics (Opcional)
VITE_ANALYTICS_ID=GA-XXXXXXXXX
```

**⚠️ Importante**: 
- Todas las variables expuestas al cliente **deben** tener el prefijo `VITE_`
- **NO** incluir el archivo `.env` en el control de versiones (ya está en `.gitignore`)
- Para producción, configura estas variables en tu plataforma de deployment

## Dependencias externas

### Servicios Externos Requeridos

1. **API Backend REST**
   - **Propósito**: Proporciona datos de evaluaciones, benchmarks y usuarios
   - **Configuración**: `VITE_API_BASE_URL`
   - **Endpoints esperados**: Definidos en `/src/services/api.js`
   - **Autenticación**: Bearer Token (obtenido vía OAuth)

2. **Proveedor OAuth 2.0**
   - **Propósito**: Autenticación y autorización de usuarios
   - **Configuración**: Variables `VITE_OAUTH_*`
   - **Callback**: Manejado en `/src/pages/OAuthCallback.jsx`
   - **Flujo**: Authorization Code Grant

3. **Sistema de Sesiones**
   - **Propósito**: Persistencia de estado de autenticación
   - **Implementación**: LocalStorage/SessionStorage (ver `/src/services/session.js`)

### Dependencias NPM de Producción

```json
{
  "chart.js": "^4.4.0",        // Visualización de gráficos
  "react": "^18.3.1",           // Framework UI
  "react-dom": "^18.3.1",       // Renderizado React
  "react-router-dom": "^6.28.0" // Routing SPA
}
```

### Dependencias de Desarrollo

```json
{
  "@vitejs/plugin-react": "^4.3.4", // Plugin Vite para React
  "vite": "^6.0.6"                   // Build tool y dev server
}
```

## Scripts disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| **dev** | `npm run dev` | Inicia servidor de desarrollo con HMR (Hot Module Replacement) en puerto 5173 |
| **build** | `npm run build` | Compila y optimiza la aplicación para producción. Output: `dist/` |
| **preview** | `npm run preview` | Sirve el build de producción localmente para testing previo a deployment |

### Detalles de Uso

**Desarrollo:**
```bash
npm run dev
# Vite dev server iniciará en http://localhost:5173
# Hot reload automático al guardar cambios
# Source maps habilitados para debugging
```

**Build de Producción:**
```bash
npm run build
# - Minifica JavaScript y CSS
# - Optimiza assets (tree-shaking, code-splitting)
# - Genera hashes para cache busting
# - Output: directorio dist/
```

**Preview de Producción:**
```bash
npm run preview
# Sirve el contenido de dist/ en http://localhost:4173
# Útil para verificar el build antes de deployment
```

## Limitaciones y Supuestos

### Supuestos Asumidos

1. **Infraestructura Backend**: Se asume la existencia de un servicio backend REST completamente funcional con los endpoints requeridos por `/src/services/api.js`

2. **OAuth Provider**: Se presupone un proveedor OAuth 2.0 configurado externamente con el flujo Authorization Code Grant

3. **Configuración Externa**: Los valores específicos de URLs, credenciales OAuth y endpoints deben ser proporcionados por el equipo de DevOps/Infraestructura

4. **Documentación Adicional**: Se asume que `INSTRUMENTO_GUIA.md` contiene documentación funcional y de negocio complementaria

5. **Archivos HTML**: Los archivos HTML estáticos (`benchmark.html`, `dashboard.html`, etc.) podrían ser:
   - Versiones legacy del proyecto
   - Prototipos estáticos
   - Landing pages independientes
   Se recomienda validar su propósito y consideración en el deployment

### Limitaciones Conocidas

1. **Sin Testing**: No se identificaron frameworks de testing (Jest, Vitest, Testing Library) ni scripts de test en `package.json`

2. **Sin Linting**: No hay configuración de ESLint, Prettier u otras herramientas de calidad de código

3. **Documentación de API**: No se documenta la especificación completa de endpoints, payloads y responses del backend

4. **TypeScript**: El proyecto usa JavaScript puro sin tipado estático, lo que puede dificultar el mantenimiento en equipos grandes

5. **Gestión de Estado**: No se utiliza una librería de estado global (Redux, Zustand, Jotai), lo que puede limitar escalabilidad en features complejas

6. **Archivos Duplicados**: Coexistencia de archivos HTML estáticos y componentes React que podrían generar confusión

7. **Variables de Entorno**: Los valores reales y secretos deben obtenerse de forma segura (vault, secrets manager, equipo de seguridad)

8. **Accesibilidad**: No se identifican herramientas o configuraciones específicas para cumplimiento WCAG

9. **Internacionalización**: No hay evidencia de soporte multi-idioma (i18n)

### Recomendaciones para Mejoras Futuras

- Implementar testing unitario e integración
- Agregar linting y formateo automático
- Considerar migración a TypeScript
- Documentar API contracts (OpenAPI/Swagger)
- Evaluar necesidad de gestión de estado global
- Clarificar propósito de archivos HTML estáticos

---

**Nota**: Esta documentación fue generada automáticamente por `archai-docgen` analizando la estructura del repositorio. Se recomienda validar y complementar con información específica del dominio, requisitos de negocio y estándares del equipo de desarrollo.
