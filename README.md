---
title: monetra-instrument - Service README
generated_by: archai-docgen
---

# monetra-instrument

## Descripción del servicio

`monetra-instrument` es una aplicación web React que proporciona una plataforma de evaluación y análisis con múltiples interfaces especializadas. El sistema incluye funcionalidades para:

- **Landing Page**: Página de entrada principal del sistema
- **Dashboard**: Panel de control con visualización de datos
- **Benchmark**: Herramienta de evaluación comparativa
- **Expert Evaluation**: Interfaz para evaluación de expertos
- **User Evaluation**: Sistema de evaluación para usuarios
- **OAuth Integration**: Autenticación mediante OAuth

La aplicación está diseñada como una SPA (Single Page Application) con React Router para la navegación entre diferentes módulos de evaluación y análisis.

## Tech stack

- **Framework Frontend**: React 18.3.1
- **Build Tool**: Vite 6.0.6
- **Routing**: React Router DOM 6.28.0
- **Visualización de Datos**: Chart.js 4.4.0
- **Lenguaje**: JavaScript (ES Modules)
- **Styling**: CSS personalizado

## Prerequisitos

- **Node.js**: versión 16.x o superior
- **npm**: versión 7.x o superior (incluido con Node.js)
- Navegador web moderno con soporte para ES6+

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

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Acceder a la aplicación**:
   - Abrir el navegador en `http://localhost:5173` (puerto por defecto de Vite)
   - La aplicación se recargará automáticamente al hacer cambios en el código

5. **Build de producción** (opcional):
   ```bash
   npm run build
   npm run preview
   ```

## Variables de entorno requeridas

Basado en la estructura del proyecto, se recomienda configurar las siguientes variables de entorno en un archivo `.env` en la raíz del proyecto:

```env
# URL del API backend
VITE_API_URL=<url_del_backend>

# OAuth Configuration
VITE_OAUTH_CLIENT_ID=<client_id>
VITE_OAUTH_REDIRECT_URI=<redirect_uri>
VITE_OAUTH_PROVIDER_URL=<provider_url>

# Opcional: Configuración adicional
VITE_APP_ENV=development
```

> **Nota**: Vite requiere que las variables de entorno expuestas al cliente comiencen con el prefijo `VITE_`

## Dependencias externas

El servicio requiere las siguientes dependencias externas:

1. **API Backend**: 
   - Servicio REST API configurado en `src/services/api.js`
   - Endpoints para benchmark, evaluaciones y dashboard

2. **Proveedor OAuth**:
   - Servicio de autenticación OAuth para el callback en `OAuthCallback.jsx`
   - Gestión de sesiones mediante `src/services/session.js`

3. **CDN/Assets** (si aplica):
   - Chart.js para renderizado de gráficos
   - Fuentes o recursos estáticos externos

## Scripts disponibles

- **`npm run dev`**: Inicia el servidor de desarrollo con hot-reload en modo desarrollo
- **`npm run build`**: Genera el build optimizado de producción en la carpeta `dist/`
- **`npm run preview`**: Previsualiza el build de producción localmente

## Limitaciones y Supuestos

**Limitaciones:**
- No se encontró archivo de configuración de variables de entorno (`.env.example`), por lo que las variables sugeridas son estimaciones basadas en la estructura del proyecto
- No se tiene visibilidad del contenido completo de los archivos de servicio (`api.js`, `session.js`), lo que limita la documentación exacta de los endpoints y configuraciones
- No se identificaron tests en la estructura del proyecto

**Supuestos:**
- Se asume que existe un backend API REST que debe estar corriendo para el funcionamiento completo
- Se asume autenticación OAuth basada en el componente `OAuthCallback.jsx`
- El archivo `INSTRUMENTO_GUIA.md` probablemente contiene documentación adicional específica del dominio
- Los archivos HTML estáticos (`benchmark.html`, `dashboard.html`, etc.) pueden ser versiones legacy o alternativas sin React
- Se asume que la aplicación requiere conectividad a internet para funcionalidades de OAuth y API

---

**Documentación generada automáticamente. Para contribuir o reportar issues, consultar las guías de contribución del proyecto.**
