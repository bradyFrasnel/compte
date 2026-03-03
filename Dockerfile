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

# On lance le fichier compilé (chemin correct : dist/src/main.js)
#CMD ["node", "dist/src/main"]
# Remplace la dernière ligne par celle-ci :
CMD npx prisma db push && node dist/main