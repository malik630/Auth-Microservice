-- Script d'initialisation de la base de données
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Créer l'utilisateur pour l'application
CREATE USER authuser WITH PASSWORD 'authpassword';
GRANT ALL PRIVILEGES ON DATABASE defaultdb TO authuser;