# ###########################################################
# Dockerfile para EIBELSTORE
# ###########################################################

# -----------------------------------------------------------
# ETAPA 1: Construcción (Build)
# -----------------------------------------------------------
# Usamos una imagen ligera de Node.js llamada 'alpine'.
# 'as build' nos permite ponerle un nombre a esta etapa para 
# luego copiar archivos de aquí a la imagen final.
FROM node:20-alpine as build

# Definimos el directorio de trabajo dentro del contenedor.
# Es como hacer 'cd /app' dentro de una computadora virtual.
WORKDIR /app

# Copiamos los archivos que definen las librerías necesarias.
# Copiamos tanto los de la raíz como los del backend.
COPY package*.json ./
COPY backend/package*.json ./backend/

# Instalamos todas las dependencias del backend.
# 'npm install' es el comando que descarga todo lo necesario 
# para que el código de JavaScript funcione.
WORKDIR /app/backend
RUN npm install

# Ahora subimos de nuevo a la raíz para copiar TODO el código.
WORKDIR /app
COPY . .

# -----------------------------------------------------------
# ETAPA 2: Imagen Final (Producción)
# -----------------------------------------------------------
# Usamos otra vez la imagen limpia de Node para que el 
# resultado sea lo más pequeño y seguro posible.
FROM node:20-alpine

# Creamos el directorio de trabajo final.
WORKDIR /app

# Desde la etapa de 'build', copiamos solo lo que realmente 
# necesitamos para ejecutar la aplicación.
# Esto evita que la imagen final pese gigabytes con archivos temporales.
COPY --from=build /app/backend ./backend
COPY --from=build /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/css ./css
COPY --from=build /app/js ./js
COPY --from=build /app/assets ./assets
COPY --from=build /app/image ./image
COPY --from=build /app/*.html ./
COPY --from=build /app/package.json ./

# Definimos variables de entorno. 
# NODE_ENV=production le dice a Node que optimice el rendimiento.
ENV NODE_ENV=production
ENV PORT=3000

# El contenedor escuchará en el puerto 3000.
# Es como abrir una ventana específica para que entre el tráfico web.
EXPOSE 3000

# Nos movemos a la carpeta del backend antes de arrancar.
WORKDIR /app/backend

# El comando final que arranca tu servidor.
# 'npm start' ejecutará 'node server.js' automáticamente.
CMD ["npm", "start"]
