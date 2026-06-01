---
title: monetra-instrument - Service README
generated_by: archai-docgen
---

# monetra-instrument

## Descripción del servicio

**monetra-instrument** es una aplicación web desarrollada en React que proporciona una plataforma interactiva para la evaluación y análisis de instrumentos financieros. El sistema incluye múltiples interfaces especializadas:

- **Landing Page**: Página de inicio y presentación del servicio
- **Dashboard**: Panel principal de visualización y control
- **Benchmark**: Herramienta de análisis comparativo de métricas
- **Expert Evaluation**: Interfaz para evaluaciones especializadas por expertos
- **User Evaluation**: Sistema de evaluación para usuarios finales
- **OAuth Integration**: Autenticación mediante OAuth2

La aplicación utiliza React Router para navegación SPA (Single Page Application) y Chart.js para visualización de datos financieros y métricas de evaluación.

## Tech stack

- **Framework Frontend**: React 18.3.1
- **Build Tool**: Vite 6.0.6
- **Routing**: React Router DOM 6.28.0
- **Visualización de Datos**: Chart.js 4.4.0
- **Lenguaje**: JavaScript (ES Modules)
- **Autenticación**: OAuth 2.0

## Prerequisitos

Antes de ejecutar este proyecto, asegúrate de tener instalado:

- **Node.js**: v18.0.0 o superior (recomendado v20+)
- **npm**: v9.0.0 o superior (incluido con Node.js)
- **Git**: Para clonar el repositorio
- **Navegador moderno**: Chrome, Firefox, Safari o Edge (últimas versiones)

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
   cp .env.example .env
   # Edita el archivo .env con tus credenciales
   ```

4. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

5. **Acceder a la aplicación**:
   - La aplicación estará disponible en `http://localhost:5173`
   - Vite mostrará la URL exacta en la consola

6. **Build para producción** (opcional):
   ```bash
   npm run build
   npm run preview
   ```

## Variables de entorno requeridas

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# API Configuration
VITE_API_BASE_URL=https://api.monetra.com
VITE_API_TIMEOUT=30000

# OAuth Configuration
VITE_OAUTH_CLIENT_ID=your_client_id_here
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/oauth/callback
VITE_OAUTH_AUTHORIZATION_URL=https://oauth.provider.com/authorize
VITE_OAUTH_TOKEN_URL=https://oauth.provider.com/token

# Session Configuration
VITE_SESSION_STORAGE_KEY=monetra_session
VITE_SESSION_TIMEOUT=3600000

# Environment
VITE_ENV=development
```

**Nota**: Todas las variables deben tener el prefijo `VITE_` para ser accesibles en el código del cliente.

## Dependencias externas

El servicio depende de los siguientes sistemas externos:

1. **API Backend de Monetra**:
   - Endpoint base configurado en `VITE_API_BASE_URL`
   - Proporciona datos de instrumentos, evaluaciones y benchmarks
   - Requiere autenticación mediante tokens OAuth

2. **Proveedor OAuth 2.0**:
   - Sistema de autenticación externo
   - Endpoints de autorización y token requeridos
   - Gestión de sesiones de usuario

3. **CDN de Assets** (si aplica):
   - Recursos estáticos y multimedia
   - Fuentes y estilos externos

4. **Servicios de Analytics** (opcionales):
   - Tracking de métricas de uso
   - Monitoreo de errores

## Scripts disponibles

```bash
# Desarrollo - Inicia servidor con hot reload
npm run dev

# Producción - Construye la aplicación optimizada
npm run build

# Preview - Previsualiza el build de producción localmente
npm run preview
```

### Detalles de los scripts:

- **`dev`**: Ejecuta Vite en modo desarrollo con HMR (Hot Module Replacement) en el puerto 5173
- **`build`**: Genera los archivos estáticos optimizados en la carpeta `/dist`
- **`preview`**: Sirve la versión de producción localmente para testing previo al deployment

## Limitaciones y Supuestos

### Limitaciones conocidas:

1. **Estructura parcial**: La documentación se genera basándose únicamente en la estructura de archivos y el `package.json`. No se tiene acceso al código fuente completo de los componentes React.

2. **Variables de entorno**: Las variables sugeridas son estimaciones basadas en patrones comunes de aplicaciones React con OAuth. Deberán ajustarse según la implementación real del backend.

3. **Dependencias externas**: Los servicios externos mencionados son inferidos por la estructura del proyecto. La integración exacta debe verificarse en el código fuente.

### Supuestos asumidos:

1. Se asume que existe un backend API REST para Monetra que maneja la lógica de negocio.

2. Se asume integración OAuth 2.0 basándose en la existencia de `OAuthCallback.jsx` y `session.js`.

3. Se asume que Chart.js se utiliza para visualización de datos financieros y métricas de evaluación.

4. Se asume que el archivo `INSTRUMENTO_GUIA.md` contiene documentación adicional sobre el dominio del negocio.

5. La presencia de múltiples archivos HTML (`benchmark.html`, `dashboard.html`, etc.) sugiere que pueden ser entry points alternativos o legacy, aunque Vite está configurado para una SPA.

**Recomendación**: Validar y actualizar esta documentación con información específica del equipo de desarrollo y la documentación interna del proyecto.
