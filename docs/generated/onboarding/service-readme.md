---
title: monetra-instrument - Service README
generated_by: archai-docgen
---

# monetra-instrument

## Descripción del servicio

**monetra-instrument** es una aplicación web frontend construida con React que proporciona una plataforma de evaluación y benchmarking para instrumentos financieros. El sistema incluye múltiples interfaces especializadas:

- **Landing**: Página de inicio del sistema
- **Dashboard**: Panel principal de control y visualización de datos
- **Benchmark**: Herramienta para comparación y análisis de rendimiento
- **Expert Eval**: Interfaz de evaluación para usuarios expertos
- **User Eval**: Interfaz de evaluación para usuarios generales
- **OAuth Callback**: Manejo de autenticación mediante OAuth

La aplicación utiliza Chart.js para visualización de datos y React Router para navegación entre las diferentes secciones, ofreciendo una experiencia de usuario fluida y moderna.

## Tech stack

- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.0.6
- **Routing**: React Router DOM 6.28.0
- **Visualización de datos**: Chart.js 4.4.0
- **Lenguaje**: JavaScript (ES Modules)
- **Estilos**: CSS personalizado

## Prerequisitos

- **Node.js**: versión 16.x o superior
- **npm**: versión 8.x o superior (incluido con Node.js)
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

3. **Iniciar servidor de desarrollo**:
```bash
npm run dev
```

4. **Acceder a la aplicación**:
   - Abrir el navegador en `http://localhost:5173` (puerto por defecto de Vite)
   - La aplicación se recargará automáticamente al hacer cambios en el código

5. **Build para producción** (opcional):
```bash
npm run build
```

6. **Preview del build de producción** (opcional):
```bash
npm run preview
```

## Variables de entorno requeridas

Basado en la estructura del proyecto, las siguientes variables de entorno pueden ser necesarias:

- **VITE_API_BASE_URL**: URL base del backend API
- **VITE_OAUTH_CLIENT_ID**: Client ID para autenticación OAuth
- **VITE_OAUTH_REDIRECT_URI**: URI de redirección después de OAuth
- **VITE_OAUTH_PROVIDER**: Proveedor de OAuth (Google, GitHub, etc.)

**Nota**: Crear un archivo `.env.local` en la raíz del proyecto con estas variables:

```env
VITE_API_BASE_URL=https://api.ejemplo.com
VITE_OAUTH_CLIENT_ID=tu_client_id
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/oauth/callback
VITE_OAUTH_PROVIDER=google
```

## Dependencias externas

- **API Backend**: Servicio REST/GraphQL para gestión de datos (comunicación a través de `src/services/api.js`)
- **Proveedor OAuth**: Servicio de autenticación externa para login de usuarios
- **Chart.js**: Biblioteca de visualización de gráficos
- **React Router**: Sistema de enrutamiento del lado del cliente

## Scripts disponibles

- **`npm run dev`**: Inicia el servidor de desarrollo con hot-reload en modo desarrollo
- **`npm run build`**: Compila la aplicación para producción en la carpeta `dist/`
- **`npm run preview`**: Previsualiza el build de producción localmente antes del despliegue

## Limitaciones y Supuestos

### Supuestos:
- Se asume que existe un backend API REST/GraphQL accesible para las operaciones de datos
- Se presupone la existencia de un servicio OAuth configurado para autenticación
- Los archivos HTML estáticos (`benchmark.html`, `dashboard.html`, etc.) pueden ser versiones legacy o landing pages independientes
- El archivo `INSTRUMENTO_GUIA.md` contiene documentación adicional del dominio/negocio

### Limitaciones:
- El README original está prácticamente vacío, por lo que la configuración específica de variables de entorno es inferida
- No se dispone de información sobre tests unitarios o de integración
- No hay evidencia de configuración de CI/CD en el repositorio
- La estructura de servicios (`api.js`, `session.js`) requiere validación de endpoints específicos
- No se conocen las credenciales o configuración específica del proveedor OAuth utilizado

### Recomendaciones:
- Documentar las variables de entorno en un archivo `.env.example`
- Implementar tests con Jest o Vitest
- Agregar linting con ESLint y formato con Prettier
- Documentar la estructura de respuestas del API en `INSTRUMENTO_GUIA.md`
