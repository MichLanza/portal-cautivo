# Usa una imagen oficial de Node.js como base
FROM node:20-alpine AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias de producción y desarrollo
RUN npm install --production=false

# Copia el resto del código fuente
COPY . .

# Compila TypeScript a JavaScript
RUN npm run build

# --- Fase final: solo lo necesario para producción ---
FROM node:20-alpine

WORKDIR /app

# Copia solo node_modules y el código compilado desde el builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env ./

# Expone el puerto (ajusta si usas otro)
EXPOSE 3000

# Usa NODE_ENV=production para optimizar dependencias
ENV NODE_ENV=production

# Comando para arrancar la app
CMD ["node", "dist/server.js"]