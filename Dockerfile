FROM node:20-alpine

WORKDIR /usr/src/app

# Installation des dépendances
COPY package*.json ./
COPY prisma ./prisma/ 
RUN npm install

# Copie du code source
COPY . .

# Génération du client Prisma (indispensable pour le build)
RUN npx prisma generate

# Création du dossier /dist
RUN npm run build

# On vérifie que le port correspond à ton main.ts (5000)
EXPOSE 5000 

# On lance le fichier compilé
CMD ["node", "dist/main"]
