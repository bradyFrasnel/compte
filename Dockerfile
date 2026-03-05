FROM node:20-alpine

WORKDIR /usr/src/app

# Installation des dépendances
COPY package*.json ./
COPY prisma ./prisma/ 
RUN npm install

# Copie du code source
COPY . .

# Génération du client Prisma
RUN npx prisma generate

# !!! AJOUTE CETTE LIGNE ICI POUR CRÉER LES TABLES !!!
RUN npx prisma db push

# Création du dossier /dist
RUN npm run build

EXPOSE 5000 

CMD ["node", "dist/src/main"]