---
title: monetra-instrument - Service README
generated_by: archai-docgen
---

# monetra-instrument

## Descripción del servicio

**monetra-instrument** es una aplicación web de tipo Single Page Application (SPA) desarrollada con React que proporciona una plataforma completa de evaluación, análisis y visualización de datos. El sistema está diseñado para facilitar la recolección y análisis de información a través de múltiples interfaces especializadas:

- **Landing Page**: Página de presentación y entrada al sistema
- **Dashboard**: Panel centralizado de control y visualización de métricas clave
- **Benchmark**: Herramienta de comparación y análisis de rendimiento entre diferentes métricas o entidades
- **Expert Evaluation**: Interfaz especializada para evaluaciones realizadas por usuarios expertos
- **User Evaluation**: Sistema de evaluación orientado a usuarios finales
- **OAuth Callback**: Gestión de flujos de autenticación OAuth2

La arquitectura del proyecto está organizada siguiendo patrones modernos de React, con separación clara entre componentes de presentación (pages) y lógica de negocio (services). Utiliza Chart.js para generar visualizaciones interactivas y React Router para la navegación fluida entre secciones.

## Tech stack

### Core
- **React**: 18.3.1 - Biblioteca principal para construcción de UI
- **React DOM**: 18.3.1 - Renderizado de componentes React
- **JavaScript (ES Modules)**: Lenguaje de desarrollo

### Routing & Navigation
- **React Router DOM**: 6.28.0 - Enrutamiento cliente para SPA

### Visualización
- **Chart.js**: 4.4.0 - Biblioteca de gráficos interactivos

### Build & Development
- **Vite**: 6.0.6 - Build tool y dev server de nueva generación
- **@vitejs/plugin-react**: 4.3.4 - Plugin oficial de React para Vite

## Prerequisitos

### Software Requerido
- **Node.js**: versión 16.x o superior (recomendado v18.x LTS o v20.x)
- **npm**: versión 8.x o superior (incluido con Node.js)
  - Alternativamente: **yarn** 1.22.x o **pnpm** 8.x

### Entorno
- Sistema operativo: Windows, macOS o Linux
- Navegador web moderno:
  - Chrome/Edge 90+
  - Firefox 88+
  - Safari 14+
- Conexión a internet (solo para instalación inicial de dependencias)

### Conocimientos Técnicos (para desarrollo)
- JavaScript ES6+
- React Hooks y componentes funcionales
- Conceptos básicos de HTTP/REST APIs
- Manejo de autenticación OAuth2

## Cómo correr localmente

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd monetra-instrument
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local` en la raíz del proyecto:
```bash
cp .env.example .env.local  # Si existe archivo de ejemplo
# O crear manualmente con las variables necesarias
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en:
- **URL local**: `http://localhost:5173`
- **URL red**: `http://192.168.x.x:5173` (para acceso desde otros dispositivos)

Vite mostrará las URLs exactas en la terminal. El servidor incluye Hot Module Replacement (HMR) para recarga instantánea de cambios.

### 5. Compilar para producción (opcional)
```bash
# Generar build optimizado
npm run build

# Previsualizar build localmente
npm run preview
```

El build de producción se genera en la carpeta `dist/` lista para deployment.

## Variables de entorno requeridas

Crear archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# ===== API Configuration =====
VITE_API_BASE_URL=https://api.example.com
VITE_API_TIMEOUT=30000

# ===== OAuth Configuration =====
VITE_OAUTH_CLIENT_ID=your_client_id_here
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/oauth/callback
VITE_OAUTH_PROVIDER=google
VITE_OAUTH_SCOPE=openid profile email

# ===== Application Settings =====
VITE_APP_ENV=development
VITE_APP_NAME=Monetra Instrument
VITE_APP_VERSION=1.0.0

# ===== Feature Flags (opcional) =====
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

**Notas importantes**:
- Todas las variables expuestas al cliente **deben** comenzar con `VITE_`
- No incluir información sensible (tokens, secrets) que no deba ser pública
- Los archivos `.env.local` están en `.gitignore` por seguridad
- Consultar con el equipo los valores específicos para cada entorno

## Dependencias externas

### Servicios Backend Requeridos
- **API REST Backend**: Servicio que maneja la lógica de negocio, almacenamiento de evaluaciones y datos de benchmark
- **Proveedor OAuth2**: Servicio de autenticación (Google, GitHub, Auth0, etc.)
- **Base de datos** (indirecta): A través del backend API para persistencia

### Bibliotecas NPM
```json
{
  "chart.js": "Renderizado de gráficos interactivos",
  "react-router-dom": "Sistema de enrutamiento SPA",
  "react": "Framework UI principal",
  "react-dom": "Integración React con DOM"
}
```

### Recursos Externos
- **CDN**: No se utilizan CDNs externos (todas las dependencias via npm)
- **Fuentes/Iconos**: No detectadas en configuración (posiblemente en archivos CSS)
- **Analytics**: Dependiente de configuración (Google Analytics, etc.)

### Conexiones de Red
- API Backend para operaciones CRUD
- Proveedor OAuth para autenticación
- Posibles servicios de métricas/logging (según configuración)

## Scripts disponibles

### Desarrollo
```bash
# Iniciar servidor de desarrollo con HMR
npm run dev
```
Inicia Vite dev server en `http://localhost:5173` con Hot Module Replacement para desarrollo rápido.

### Producción
```bash
# Compilar aplicación optimizada
npm run build
```
Genera build de producción en carpeta `dist/` con:
- Minificación de código
- Tree-shaking de dependencias no usadas
- Optimización de assets
- Source maps (configurable)

```bash
# Previsualizar build de producción
npm run preview
```
Sirve la carpeta `dist/` localmente para validar el build antes del deployment real.

### Scripts Adicionales Recomendados
```bash
# Linting (si se configura ESLint)
npm run lint

# Testing (si se configura Vitest/Jest)
npm run test

# Type checking (si se migra a TypeScript)
npm run type-check
```

## Limitaciones y Supuestos

### Limitaciones Conocidas

1. **Ausencia de Testing**: No se detectan configuraciones de testing (Vitest, Jest, React Testing Library) en el proyecto actual
2. **Documentación API**: No existe especificación OpenAPI/Swagger del contrato de API en el repositorio
3. **Variables de Entorno**: Falta archivo `.env.example` con plantilla de variables requeridas
4. **TypeScript**: El proyecto no utiliza TypeScript, lo que reduce la seguridad de tipos en tiempo de desarrollo
5. **Linting/Formatting**: No se detectan configuraciones de ESLint o Prettier en package.json
6. **CI/CD**: No hay evidencia de pipelines de integración continua en el repositorio
7. **Accesibilidad**: No se puede verificar cumplimiento de estándares WCAG sin análisis del código fuente
8. **Internacionalización**: No se detecta sistema i18n para múltiples idiomas

### Supuestos Realizados

1. **Backend Separado**: Se asume la existencia de un backend API REST independiente manejando lógica de negocio
2. **Autenticación OAuth2**: La presencia de `OAuthCallback.jsx` sugiere implementación de flujo OAuth2 estándar
3. **Archivos HTML Legacy**: Los archivos `*.html` en raíz pueden ser versiones previas o templates de migración
4. **Documento INSTRUMENTO_GUIA.md**: Se presume contiene documentación específica del dominio o instrucciones de uso
5. **API Endpoints**: Los servicios en `src/services/api.js` implementan llamadas HTTP a endpoints predefinidos
6. **Session Management**: `src/services/session.js` maneja almacenamiento de tokens/estado de usuario (localStorage/sessionStorage)
7. **Vite Configuration**: `vite.config.js` contiene configuración específica de proxy, alias y optimizaciones
8. **Visualizaciones**: Chart.js se utiliza en múltiples páginas para mostrar gráficos de benchmark y métricas

### Recomendaciones

- Agregar suite de testing completa (Vitest + React Testing Library)
- Implementar ESLint y Prettier para consistencia de código
- Crear archivo `.env.example` documentando todas las variables
- Considerar migración gradual a TypeScript
- Documentar API con OpenAPI/Swagger
- Implementar CI/CD con GitHub Actions o similar
- Agregar logs y monitoreo (Sentry, LogRocket)

---

**Nota**: Esta documentación fue generada automáticamente mediante análisis estático del repositorio. Se recomienda validación y actualización continua por el equipo de desarrollo según evolucione el proyecto.
