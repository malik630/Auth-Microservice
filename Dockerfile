FROM node:18-alpine

# Mettre à jour les packages de sécurité
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Générer le client Prisma
RUN npx prisma generate

# Copier le code source
COPY --chown=nextjs:nodejs . .

# Exposer le port
EXPOSE 3000

# Utiliser l'utilisateur non-root
USER nextjs

# Utiliser dumb-init pour gérer les signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["npm", "start"]