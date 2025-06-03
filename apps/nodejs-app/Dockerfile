FROM node:18

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Crear directorio de uploads
RUN mkdir -p /app/public/uploads/publicaciones \
    && chown -R node:node /app

# Cambiar al usuario node para mayor seguridad
USER node

# Puerto de la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "app.js"]