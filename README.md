---
title: monetra-instrument - Service README
generated_by: archai-docgen
---

# monetra-instrument

## Descripción del servicio

**monetra-instrument** es una aplicación web interactiva desarrollada con React que proporciona una plataforma integral de evaluación y análisis de datos. El sistema está diseñado para facilitar la recopilación, visualización y comparación de métricas mediante múltiples interfaces especializadas:

- **Landing Page**: Página de inicio y presentación del servicio
- **Dashboard**: Panel principal de control con visualización consolidada de datos
- **Benchmark**: Herramienta de análisis comparativo y métricas de rendimiento
- **Expert Evaluation**: Interfaz especializada para evaluaciones conducidas por expertos
- **User Evaluation**: Sistema de evaluación accesible para usuarios finales
- **OAuth Callback**: Gestión segura de autenticación mediante protocolo OAuth

El proyecto implementa Chart.js para visualización avanzada de datos en tiempo real y React Router para navegación fluida tipo SPA. La arquitectura incluye servicios centralizados para gestión de API y sesiones de usuario, garantizando un flujo de datos coherente y mantenible.

## Tech stack

- **Frontend Framework**: React 18.3.1
- **Build Tool & Dev Server**: Vite 6.0.6
- **Routing**: React Router DOM 6.28.0
- **Visualización de Datos**: Chart.js 4.4.0
- **Lenguaje**: JavaScript con ES Modules
- **Bundler Plugin**: @vitejs/plugin-react 4.3.4

## Prerequisitos

- **Node.js**: versión 16.x o superior (recomendado 18.x o 20.x LTS)
- **npm**: versión 8.x o superior (incluido con Node.js) o yarn/pnpm como alternativa
- **Navegador web moderno**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ con soporte completo para ES6+
- **Conexión a internet**: Necesaria para instalación inicial de dependencias
- **Git**: Para clonar el repositorio

## Cómo correr localmente

1. **Clonar el repositorio**:
   ```bash
   git clone <repository-url>
   cd monetra-instrument
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   # Copiar archivo de ejemplo (si existe) o crear nuevo
   cp .env.example .env.local
   # Editar .env.local con tus credenciales
   ```

4. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

5. **Acceder a la aplicación**:
   - Abrir el navegador en `http://localhost:5173` (puerto por defecto de Vite)
   - Vite mostrará la URL exacta y puerto asignado en la terminal
   - El servidor incluye Hot Module Replacement (HMR) para desarrollo ágil

6. **Build de producción** (opcional):
   ```bash
   # Generar build optimizado
   npm run build
   
   # Previsualizar build localmente
   npm run preview
   ```

## Variables de entorno requeridas

Crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# API Configuration
VITE_API_BASE_URL=https://api.example.com/v1
VITE_API_TIMEOUT=30000

# OAuth Configuration
VITE_OAUTH_CLIENT_ID=your_oauth_client_id
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/oauth/callback
VITE_OAUTH_PROVIDER=google
VITE_OAUTH_SCOPE=email profile

# Application Environment
VITE_ENV=development
VITE_APP_NAME=Monetra Instrument
VITE_LOG_LEVEL=debug
```

**⚠️ Nota importante**: 
- Vite requiere el prefijo `VITE_` para exponer variables al código cliente
- Variables sin este prefijo no estarán disponibles en el navegador
- Nunca commitear archivos `.env.local` con credenciales reales
- El archivo `.env.local` debe estar incluido en `.gitignore`

## Dependencias externas

### APIs y Servicios Backend
- **API REST Backend**: Servicio principal configurado en `src/services/api.js` para gestión de datos
- **Proveedor OAuth**: Sistema de autenticación externa (Google, Auth0, etc.)
- **Servicio de almacenamiento**: Backend para persistencia de evaluaciones, benchmarks y sesiones de usuario

### Bibliotecas de Terceros
- **Chart.js (v4.4.0)**: Biblioteca de visualización para renderizado de gráficos interactivos
- **React Router DOM (v6.28.0)**: Sistema de enrutamiento declarativo para Single Page Application

### Recursos y CDNs
- Todas las dependencias se gestionan localmente vía npm (no hay dependencias de CDN externas)
- Los assets estáticos se sirven desde el servidor de desarrollo de Vite

## Scripts disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo con HMR en puerto 5173

# Producción
npm run build        # Compila aplicación optimizada en /dist
npm run preview      # Previsualiza build de producción localmente
```

### Detalles de cada script:

- **`dev`**: 
  - Inicia el servidor de desarrollo de Vite
  - Hot Module Replacement (HMR) activo
  - Source maps para debugging
  - Recarga automática al guardar cambios
  
- **`build`**: 
  - Genera bundle optimizado para producción en carpeta `dist/`
  - Minificación de JS/CSS
  - Tree-shaking de código no utilizado
  - Optimización de assets e imágenes
  
- **`preview`**: 
  - Sirve el build de producción localmente
  - Útil para testing previo al deployment
  - Simula entorno de producción

## Limitaciones y Supuestos

### Limitaciones Conocidas:

1. **Documentación API**: No se incluye especificación detallada del contrato de API (Swagger/OpenAPI) en el repositorio actual
2. **Variables de Entorno**: Ausencia de archivo `.env.example` con plantilla de configuración
3. **Testing**: No se detectan configuraciones de testing (Jest, Vitest, React Testing Library) en package.json
4. **TypeScript**: El proyecto utiliza JavaScript vanilla, sin tipado estático
5. **Linting/Formatting**: No se evidencian configuraciones de ESLint o Prettier en el repositorio
6. **CI/CD**: No se incluyen pipelines de integración continua o deployment automatizado
7. **Documentación OAuth**: Los detalles específicos del proveedor OAuth y flujos de autenticación no están documentados

### Supuestos Asumidos:

1. **Backend Separado**: Se asume la existencia de un backend API REST independiente que maneja lógica de negocio y persistencia
2. **Autenticación OAuth**: Se presume flujo de autenticación mediante OAuth 2.0 basándose en `OAuthCallback.jsx`
3. **Documentación Adicional**: El archivo `INSTRUMENTO_GUIA.md` probablemente contiene documentación específica del dominio y guías de usuario
4. **Archivos HTML Legacy**: Los archivos HTML estáticos (`benchmark.html`, `dashboard.html`, etc.) pueden ser:
   - Versiones legacy previas a la migración React
   - Templates para SSR/SSG
   - Páginas de fallback
5. **Arquitectura SPA**: La aplicación está diseñada como Single Page Application con enrutamiento cliente-side
6. **API RESTful**: Se asume que el backend sigue principios REST con respuestas JSON
7. **Gestión de Sesiones**: El servicio `session.js` maneja tokens JWT o cookies de sesión para autenticación persistente

### Recomendaciones para Mejora:

- Añadir suite de testing con Vitest + React Testing Library
- Implementar TypeScript para mayor robustez y developer experience
- Configurar ESLint y Prettier para consistencia de código
- Crear archivo `.env.example` con variables documentadas
- Agregar especificación OpenAPI del backend
- Implementar pipeline CI/CD para deployment automatizado

---

**Nota**: Esta documentación fue generada automáticamente mediante análisis estático del repositorio. Se recomienda validar, complementar y mantener actualizada con información específica del equipo de desarrollo y requisitos del proyecto.
