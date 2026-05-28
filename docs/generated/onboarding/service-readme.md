---
title: monetra-instrument - Service README
generated_by: archai-docgen
---

# monetra-instrument

## Descripción del servicio

**monetra-instrument** es una aplicación web moderna desarrollada con React que proporciona herramientas de evaluación y benchmarking. El sistema incluye múltiples interfaces especializadas para diferentes tipos de usuarios y evaluaciones:

- **Landing**: Página de inicio y presentación del servicio
- **Dashboard**: Panel de control principal con visualización de datos
- **User Eval**: Interfaz de evaluación para usuarios estándar
- **Expert Eval**: Interfaz especializada para evaluaciones de expertos
- **Benchmark**: Sistema de comparación y análisis de métricas de rendimiento
- **OAuth Callback**: Gestión de autenticación mediante OAuth

La aplicación utiliza un sistema de gestión de sesiones y servicios API centralizados, proporcionando una experiencia fluida y segura para la evaluación y análisis de instrumentos.

## Tech stack

- **Framework Frontend**: React 18.3.1
- **Build Tool**: Vite 6.0.6
- **Routing**: React Router DOM 6.28.0
- **Visualización de Datos**: Chart.js 4.4.0
- **Lenguaje**: JavaScript (ES Modules)
- **Gestión de Estado**: React hooks nativos
- **Estilos**: CSS personalizado

## Prerequisitos

- **Node.js**: versión 16.x o superior
- **npm**: versión 8.x o superior (o yarn/pnpm como alternativa)
- Navegador web moderno con soporte para ES6+
- Conexión a internet para autenticación OAuth

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

3. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Acceder a la aplicación**
   
   Abrir el navegador en la URL proporcionada por Vite (típicamente `http://localhost:5173`)

5. **Build para producción (opcional)**
   ```bash
   npm run build
   npm run preview
   ```

## Variables de entorno requeridas

Aunque no se especifican explícitamente en los archivos proporcionados, basándose en la estructura del proyecto (OAuth, API services), las siguientes variables son probablemente necesarias:

```env
VITE_API_URL=<url-del-backend-api>
VITE_OAUTH_CLIENT_ID=<client-id-oauth>
VITE_OAUTH_REDIRECT_URI=<redirect-uri-callback>
VITE_OAUTH_PROVIDER_URL=<url-proveedor-oauth>
```

**Nota**: Crear un archivo `.env.local` en la raíz del proyecto con estas variables antes de ejecutar la aplicación.

## Dependencias externas

### Servicios Backend
- **API REST**: Sistema de backend para gestión de datos de evaluaciones y benchmarks
- **Proveedor OAuth**: Servicio de autenticación externa (Google, GitHub, Auth0, etc.)

### CDN y Recursos
- Chart.js para renderizado de gráficos
- Recursos estáticos servidos por el servidor de producción

### Navegadores Soportados
- Chrome/Edge (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)

## Scripts disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| **dev** | `npm run dev` | Inicia el servidor de desarrollo de Vite con hot-reload |
| **build** | `npm run build` | Compila la aplicación para producción en la carpeta `/dist` |
| **preview** | `npm run preview` | Previsualiza el build de producción localmente |

### Ejemplos de uso

```bash
# Desarrollo
npm run dev

# Generar build optimizado
npm run build

# Previsualizar build antes de deploy
npm run preview
```

## Limitaciones y Supuestos

### Limitaciones Conocidas
1. **Documentación de API**: No se proporcionan detalles sobre los endpoints específicos del backend en los archivos analizados
2. **Variables de Entorno**: Las variables de entorno son inferidas basándose en la estructura del proyecto, no están documentadas explícitamente
3. **Configuración OAuth**: Los detalles específicos del proveedor OAuth y flujo de autenticación no están disponibles en el código proporcionado
4. **Testing**: No se identifican frameworks de testing ni scripts de pruebas en el package.json

### Supuestos Asumidos
1. El proyecto requiere un backend API separado que no está incluido en este repositorio
2. La autenticación OAuth está completamente configurada en el backend
3. Los archivos HTML individuales (benchmark.html, dashboard.html, etc.) podrían ser páginas estáticas legacy o puntos de entrada alternativos
4. El archivo `INSTRUMENTO_GUIA.md` contiene documentación adicional específica del dominio de negocio
5. La aplicación está diseñada como SPA (Single Page Application) con múltiples rutas

### Recomendaciones
- Documentar explícitamente las variables de entorno requeridas
- Agregar tests unitarios y de integración
- Incluir ejemplos de respuestas de API
- Documentar el flujo completo de autenticación OAuth
- Considerar agregar TypeScript para mayor type-safety
