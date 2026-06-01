---
title: monetra-instrument - Service README
generated_by: archai-docgen
---

# monetra-instrument

Aplicación web desarrollada en React para la evaluación y análisis de instrumentos financieros, con capacidades de benchmarking, evaluación de expertos y usuarios, además de un dashboard de visualización de datos.

## Descripción del servicio

**monetra-instrument** es una aplicación frontend moderna construida con React y Vite que proporciona una plataforma integral para:

- **Evaluación de Instrumentos Financieros**: Permite a usuarios y expertos evaluar diferentes instrumentos del mercado financiero
- **Dashboard Interactivo**: Visualización de datos mediante gráficos interactivos utilizando Chart.js
- **Sistema de Benchmarking**: Comparación y análisis de rendimiento de instrumentos
- **Autenticación OAuth**: Integración con sistema de autenticación mediante OAuth 2.0
- **Gestión de Sesiones**: Control de sesiones de usuario para experiencia personalizada

La aplicación utiliza una arquitectura basada en componentes React con enrutamiento del lado del cliente, ofreciendo una experiencia de usuario fluida y responsiva.

## Tech stack

- **Framework Frontend**: React 18.3.1
- **Bundler/Build Tool**: Vite 6.0.6
- **Enrutamiento**: React Router DOM 6.28.0
- **Visualización de Datos**: Chart.js 4.4.0
- **Lenguaje**: JavaScript (ES Modules)
- **Estilos**: CSS puro
- **Autenticación**: OAuth 2.0

## Prerequisitos

Antes de ejecutar este proyecto localmente, asegúrate de tener instalado:

- **Node.js**: versión 16.x o superior (recomendado 18.x o 20.x)
- **npm**: versión 8.x o superior (incluido con Node.js)
- **Git**: para clonar el repositorio
- Un navegador web moderno (Chrome, Firefox, Safari, Edge)

## Cómo correr localmente

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd monetra-instrument
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear un archivo `.env` en la raíz del proyecto (ver sección "Variables de entorno requeridas")

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Acceder a la aplicación**
   
   Abre tu navegador en `http://localhost:5173` (puerto por defecto de Vite)

6. **Build de producción** (opcional)
   ```bash
   npm run build
   npm run preview
   ```

## Variables de entorno requeridas

Aunque no se especifican explícitamente en el código proporcionado, basándose en la estructura del proyecto se requieren las siguientes variables de entorno:

```env
# API Backend
VITE_API_BASE_URL=<url-del-backend-api>

# OAuth Configuration
VITE_OAUTH_CLIENT_ID=<client-id-oauth>
VITE_OAUTH_REDIRECT_URI=<redirect-uri>
VITE_OAUTH_AUTHORIZATION_URL=<authorization-endpoint>
VITE_OAUTH_TOKEN_URL=<token-endpoint>

# Environment
VITE_APP_ENV=development|production
```

**Nota**: Vite requiere que las variables de entorno expuestas al cliente comiencen con el prefijo `VITE_`.

## Dependencias externas

### APIs y Servicios Backend

- **API REST Backend**: El servicio se comunica con un backend a través del módulo `services/api.js`
- **Servicio de Autenticación OAuth**: Proveedor de identidad para autenticación de usuarios
- **Endpoints requeridos**:
  - Endpoints de evaluación de usuarios
  - Endpoints de evaluación de expertos
  - Endpoints de benchmarking
  - Endpoints de dashboard/métricas

### Bibliotecas de Terceros

- **Chart.js**: Para renderizado de gráficos y visualizaciones
- **React Router**: Para navegación SPA
- **OAuth Provider**: Servicio externo de autenticación (debe ser configurado)

### Recursos Estáticos

- Fuentes web (si las hay)
- CDNs para recursos adicionales (si se utilizan)

## Scripts disponibles

```bash
# Iniciar servidor de desarrollo con hot-reload
npm run dev

# Generar build optimizado para producción
npm run build

# Previsualizar build de producción localmente
npm run preview
```

### Detalles de los scripts:

- **`dev`**: Inicia Vite en modo desarrollo en `http://localhost:5173` con hot module replacement (HMR)
- **`build`**: Compila y optimiza la aplicación para producción en el directorio `dist/`
- **`preview`**: Sirve el build de producción localmente para pruebas previas al despliegue

## Limitaciones y Supuestos

### Limitaciones Conocidas:

1. **Código Backend No Disponible**: La documentación asume la existencia de un backend compatible pero no se tiene acceso al código del mismo
2. **Variables de Entorno Inferidas**: Las variables de entorno son suposiciones basadas en la estructura del proyecto, no están explícitamente definidas
3. **Autenticación OAuth**: Se asume implementación OAuth 2.0 pero no se conocen los detalles específicos del proveedor
4. **Endpoints API**: No se tienen especificaciones detalladas de los contratos de API

### Supuestos Asumidos:

1. El backend API está desplegado y accesible
2. El proyecto sigue las convenciones estándar de React/Vite
3. La autenticación OAuth está correctamente configurada en el proveedor
4. Existe documentación separada para el instrumento/guía (archivo `INSTRUMENTO_GUIA.md`)
5. Los archivos HTML en raíz son puntos de entrada alternativos o legacy
6. El servicio de sesiones maneja tokens y persistencia de autenticación
7. Chart.js se utiliza para visualizaciones en Dashboard y Benchmark

### Recomendaciones:

- Revisar el archivo `INSTRUMENTO_GUIA.md` para documentación adicional específica del dominio
- Solicitar documentación de la API backend para integración completa
- Definir explícitamente todas las variables de entorno en un archivo `.env.example`
- Documentar los flujos de autenticación OAuth en detalle
