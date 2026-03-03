# 1. Image de base (Node.js 20)
FROM node:20-alpine

# 2. Créer le dossier de travail
WORKDIR /usr/src/app

# 3. Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# 4. Installer les dépendances
RUN npm install

# 5. Copier tout le reste du code
COPY . .

# 6. Générer le client Prisma et compiler NestJS
RUN npx prisma generate
RUN npm run build

# 7. Exposer le port de l'application
EXPOSE 5000

# 8. Commande de démarrage
CMD ["npm", "run", "start:prod"]
