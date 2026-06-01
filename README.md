---
title: monetra-instrument - Service README
generated_by: archai-docgen
---

# monetra-instrument

## Descripción del servicio

**monetra-instrument** es una aplicación web de evaluación y análisis desarrollada con React que proporciona una plataforma integral para gestión de métricas, evaluaciones y visualización de datos. El sistema está diseñado como una Single Page Application (SPA) que integra múltiples módulos especializados:

- **Landing Page**: Página de bienvenida e información del servicio
- **Dashboard**: Panel central de control con métricas y visualizaciones en tiempo real
- **Benchmark**: Módulo de comparación y análisis de rendimiento mediante métricas cuantitativas
- **Expert Evaluation**: Sistema de evaluación cualitativa para perfiles especializados
- **User Evaluation**: Interfaz de evaluación orientada a usuarios finales
- **OAuth Callback**: Handler para flujos de autenticación OAuth 2.0

La aplicación utiliza Chart.js para renderizado de gráficos interactivos y React Router para navegación cliente-side sin recarga de página. Incluye servicios centralizados para comunicación con APIs backend y gestión de sesiones de usuario.

## Tech stack

**Frontend Core**:
- React 18.3.1 (biblioteca UI con hooks)
- React DOM 18.3.1
- JavaScript ES Modules

**Routing & Navigation**:
- React Router DOM 6.28.0

**Visualización de Datos**:
- Chart.js 4.4.0

**Build & Development Tools**:
- Vite 6.0.6 (bundler y dev server)
- @vitejs/plugin-react 4.3.4

**Arquitectura**:
- SPA (Single Page Application)
- Component-based architecture
- Service layer pattern (API y sesión)

## Prerequisitos

**Software requerido**:
- **Node.js**: v16.x o superior (recomendado v18.x LTS o v20.x)
- **npm**: v8.x o superior (incluido con Node.js)
- **Git**: Para clonar el repositorio

**Navegador web moderno** con soporte para:
- ES6+ (ECMAScript 2015+)
- Fetch API
- LocalStorage/SessionStorage
- CSS3 y HTML5

**Opcionales**:
- Editor de código (VS Code, WebStorm, etc.)
- Extensión React Developer Tools para debugging

## Cómo correr localmente

### Instalación inicial

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd monetra-instrument

# 2. Instalar dependencias
npm install
```

### Configuración de variables de entorno

```bash
# 3. Crear archivo de variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales (ver sección siguiente)
```

### Ejecución en modo desarrollo

```bash
# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en:
- **URL**: `http://localhost:5173` (puerto por defecto)
- Vite mostrará la URL exacta en la terminal
- Hot Module Replacement (HMR) habilitado para recarga automática

### Build y preview de producción

```bash
# Compilar para producción
npm run build

# Previsualizar build localmente
npm run preview
```

El build se generará en la carpeta `dist/` lista para deployment.

## Variables de entorno requeridas

Crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# === API Backend Configuration ===
VITE_API_BASE_URL=https://api.example.com
VITE_API_TIMEOUT=30000

# === OAuth 2.0 Configuration ===
VITE_OAUTH_CLIENT_ID=your_client_id_here
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/oauth/callback
VITE_OAUTH_PROVIDER=google
VITE_OAUTH_AUTHORIZATION_URL=https://accounts.google.com/o/oauth2/v2/auth
VITE_OAUTH_SCOPE=openid profile email

# === Application Environment ===
VITE_ENV=development
VITE_APP_NAME=Monetra Instrument
VITE_LOG_LEVEL=debug

# === Feature Flags (opcional) ===
VITE_ENABLE_BENCHMARK=true
VITE_ENABLE_EXPERT_EVAL=true
VITE_ENABLE_USER_EVAL=true
```

**Importante**: 
- Vite requiere el prefijo `VITE_` para exponer variables al código cliente
- No commitear archivos `.env.local` al repositorio
- Para producción, configurar estas variables en el servidor/plataforma de hosting

## Dependencias externas

### Backend API Services
- **REST API Backend**: Servicio principal para lógica de negocio (configurado en `src/services/api.js`)
  - Endpoints para evaluaciones, benchmarks y datos del dashboard
  - Autenticación y autorización de usuarios
- **Proveedor OAuth 2.0**: Google, GitHub, Auth0 u otro proveedor configurado
  - Gestión de tokens de acceso
  - Refresh token handling

### Librerías de Terceros (npm)
- **Chart.js**: Renderizado de gráficos canvas-based (líneas, barras, tortas, etc.)
- **React Router DOM**: Sistema de routing declarativo para SPA

### Servicios de Infraestructura
- **CDN** (en producción): Posible uso de CDN para assets estáticos
- **Session Storage**: Almacenamiento local de sesión en navegador
- **Cookies**: Para tokens de autenticación (si aplica)

### Dependencias del Sistema
- No requiere instalación de software adicional más allá de Node.js

## Scripts disponibles

```bash
# Desarrollo: Inicia servidor con hot-reload en puerto 5173
npm run dev

# Build: Compila y optimiza para producción en carpeta dist/
npm run build

# Preview: Sirve el build de producción localmente
npm run preview
```

### Descripción detallada:

| Script | Comando | Descripción |
|--------|---------|-------------|
| **dev** | `vite` | Inicia servidor de desarrollo con HMR (Hot Module Replacement), source maps y modo watch. Puerto por defecto: 5173 |
| **build** | `vite build` | Compila aplicación optimizada para producción: minificación, tree-shaking, code splitting, hash de assets |
| **preview** | `vite preview` | Sirve el build de producción localmente para testing pre-deployment en puerto 4173 |

### Workflow recomendado:

```bash
# Desarrollo diario
npm run dev

# Antes de crear PR
npm run build  # Verificar que compila sin errores

# Testing de build de producción
npm run build && npm run preview
```

## Limitaciones y Supuestos

### Limitaciones Conocidas:

1. **Documentación de API incompleta**: No se incluye especificación OpenAPI/Swagger del contrato de API backend
2. **Sin tests automatizados**: No se detectan frameworks de testing (Jest, Vitest, React Testing Library) en package.json
3. **Variables de entorno no documentadas**: Falta archivo `.env.example` con template de configuración
4. **Sin manejo de errores global**: No se detecta implementación de Error Boundary o servicio centralizado de logging
5. **Configuración OAuth genérica**: Los detalles específicos del proveedor OAuth no están explícitos en el código analizado
6. **Accesibilidad no verificada**: No hay evidencia de testing o compliance con WCAG
7. **Sin linting configurado**: No se detecta ESLint o Prettier en el proyecto

### Supuestos Asumidos:

1. **Backend separado**: Se asume la existencia de un backend REST API independiente que maneja lógica de negocio y persistencia
2. **Autenticación OAuth 2.0**: Basándose en `OAuthCallback.jsx`, se presume implementación de flujo OAuth estándar
3. **SPA con routing cliente**: La aplicación funciona completamente en el navegador con React Router manejando navegación
4. **Archivos HTML legacy**: Los archivos `.html` en raíz (`benchmark.html`, `dashboard.html`, etc.) pueden ser:
   - Versiones anteriores pre-React
   - Templates para SSR (no implementado actualmente)
   - Páginas de fallback
5. **INSTRUMENTO_GUIA.md**: Se asume que contiene documentación específica del dominio o reglas de negocio
6. **Gestión de sesión**: El servicio `session.js` probablemente maneja tokens JWT y estado de autenticación
7. **API RESTful**: Se presume que el backend sigue convenciones REST estándar
8. **Deployment como SPA estática**: La aplicación se puede deployar en hosting estático (Netlify, Vercel, S3+CloudFront)

### Recomendaciones para Mejoras:

- [ ] Agregar suite de tests (Vitest + React Testing Library)
- [ ] Documentar contrato de API con OpenAPI 3.0
- [ ] Implementar Error Boundaries y logging centralizado
- [ ] Agregar `.env.example` con todas las variables necesarias
- [ ] Configurar ESLint + Prettier para consistencia de código
- [ ] Implementar CI/CD pipeline (GitHub Actions, GitLab CI)
- [ ] Agregar documentación de arquitectura y diagramas de flujo

---

**Nota**: Esta documentación fue generada automáticamente mediante análisis estático del repositorio. Se recomienda validar la información con el equipo de desarrollo y complementar con detalles específicos del contexto de negocio.
