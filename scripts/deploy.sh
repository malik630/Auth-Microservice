#!/bin/bash

echo "🚀 Déployement du microservice d'authentification..."

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

# Vérifier que docker-compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Créer les dossiers nécessaires
mkdir -p logs
mkdir -p docker/nginx/ssl
mkdir -p docker/postgres

# Générer le client Prisma
echo "📦 Génération du client Prisma..."
npm run generate

# Construire les images Docker
echo "🏗️ Construction des images Docker..."
docker-compose build --no-cache

# Lancer les services
echo "▶️ Démarrage des services..."
docker-compose up -d

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente de PostgreSQL..."
sleep 10

# Exécuter les migrations
echo "🔄 Exécution des migrations..."
docker-compose exec auth-microservice npm run migrate

# Créer le super admin
echo "👑 Création du super admin..."
docker-compose exec auth-microservice npm run seed

echo "✅ Déployement terminé !"
echo "🌐 API disponible sur: http://localhost:3000"
echo "📊 Health check: http://localhost:3000/health"