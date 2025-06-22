# Portal Cautivo Omada

Este proyecto es un backend en Node.js (TypeScript) para gestionar un portal cautivo usando la API de Omada Hotspot.

## Características
- Autenticación de usuarios en el hotspot de Omada
- Autorización de clientes en la red WiFi
- Integración con la API de Omada Controller

## Estructura del proyecto
```
src/
  app.ts                # Configuración principal de la app
  server.ts             # Arranque del servidor
  config/database.ts    # Configuración de base de datos (si aplica)
  controllers/          # Controladores de rutas
  entities/             # Definiciones de tipos y respuestas
  public/index.html     # Página de inicio (portal cautivo)
  routes/               # Definición de rutas
  services/OmadaHotspotApi.ts # Lógica de integración con Omada
```
## Variables de entorno

```
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
DB_TYPE=
DB_TRUST_SERVER_CERTIFICATE=
OMADA_BASE_URL=
OMADA_CONTROLLER_ID=
OMADA_USER=
OMADA_PASSWORD=
```

## Instalación
1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables necesarias en los archivos de configuración

## Uso
1. Inicia el servidor:
   ```bash
   npm start
   ```
2. Accede al portal cautivo desde un navegador conectado a la red WiFi gestionada por Omada

## Endpoints principales
- `/api/auth/login` — Login de usuario en el hotspot
- `/api/auth/authorize` — Autoriza un cliente en la red

## Notas
- Asegúrate de tener acceso al Omada Controller y los permisos necesarios
- El proyecto está pensado para uso educativo y de integración

## Licencia
MIT