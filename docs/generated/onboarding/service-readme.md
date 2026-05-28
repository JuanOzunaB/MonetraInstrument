---
title: monetra-instrument - Service README
generated_by: archai-docgen
---

# monetra-instrument

## Descripción del servicio

**monetra-instrument** es una aplicación web interactiva desarrollada con React que proporciona una plataforma de evaluación y análisis con múltiples interfaces especializadas. El servicio incluye módulos para evaluaciones de usuarios y expertos, visualización de dashboards, benchmarking y gestión de autenticación mediante OAuth.

La aplicación está diseñada como una Single Page Application (SPA) que permite a diferentes tipos de usuarios interactuar con herramientas de evaluación y análisis, presentando datos mediante visualizaciones con Chart.js y facilitando la gestión de sesiones de usuario.

## Tech stack

- **Frontend Framework**: React 18.3.1
- **Routing**: React Router DOM 6.28.0
- **Build Tool**: Vite 6.0.6
- **Visualización de Datos**: Chart.js 4.4.0
- **Lenguaje**: JavaScript (ES Modules)
- **Styling**: CSS personalizado

## Prerequisitos

Antes de ejecutar este proyecto, asegúrate de tener instalado:

- **Node.js**: Versión 16.x o superior
- **npm**: Versión 7.x o superior (incluido con Node.js)
- **Git**: Para clonar el repositorio
- Un navegador web moderno (Chrome, Firefox, Safari, Edge)

## Cómo correr localmente

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd monetra-instrument
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Acceder a la aplicación**:
   
   Abre tu navegador y navega a `http://localhost:5173` (puerto por defecto de Vite)

5. **Para generar build de producción**:
   ```bash
   npm run build
   ```

6. **Para previsualizar el build de producción**:
   ```bash
   npm run preview
   ```

## Variables de entorno requeridas

Basándose en la estructura del proyecto con servicios de API y OAuth, se recomienda configurar las siguientes variables de entorno en un archivo `.env` en la raíz del proyecto:

```
VITE_API_BASE_URL=<url-del-backend-api>
VITE_OAUTH_CLIENT_ID=<client-id-oauth>
VITE_OAUTH_REDIRECT_URI=<redirect-uri-callback>
VITE_OAUTH_PROVIDER_URL=<url-proveedor-oauth>
```

**Nota**: Vite requiere el prefijo `VITE_` para exponer variables de entorno al código del cliente.

## Dependencias externas

### Servicios/APIs Externos:
- **Servicio de Autenticación OAuth**: Requerido para el flujo de autenticación implementado en `OAuthCallback.jsx`
- **API Backend**: El servicio consume endpoints externos configurados en `src/services/api.js`

### Bibliotecas de Terceros:
- **Chart.js**: Biblioteca de visualización de datos para gráficos interactivos
- **React Router DOM**: Manejo de rutas y navegación SPA
- **Vite**: Herramienta de build y desarrollo rápido

## Scripts disponibles

- **`npm run dev`**: Inicia el servidor de desarrollo con hot-reload en modo desarrollo
- **`npm run build`**: Genera el build optimizado para producción en la carpeta `dist/`
- **`npm run preview`**: Inicia un servidor local para previsualizar el build de producción

## Limitaciones y Supuestos

**Limitaciones conocidas**:
- La configuración específica de las variables de entorno OAuth no está documentada en los archivos proporcionados
- No se incluyen tests automatizados en el proyecto actual
- La estructura de los endpoints de la API no está documentada explícitamente en el código fuente proporcionado

**Supuestos asumidos**:
- Se asume que existe un backend/API REST que proporciona los datos para las evaluaciones, benchmarks y dashboards
- Se asume la existencia de un proveedor OAuth configurado para manejar la autenticación de usuarios
- La aplicación está diseñada para ser desplegada como aplicación estática (SPA)
- Los archivos HTML individuales (`benchmark.html`, `dashboard.html`, etc.) pueden ser puntos de entrada alternativos o legacy, aunque la aplicación principal está construida con React
- El archivo `INSTRUMENTO_GUIA.md` contiene documentación adicional sobre el funcionamiento del instrumento de evaluación
