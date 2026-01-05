#!/bin/bash

# Deployment script for BnpWebApp
# Usage: ./deploy.sh [prod|dev]

set -e

ENV=${1:-prod}

echo "🚀 Starting deployment for environment: $ENV"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Pull latest changes from Git (if in a git repository)
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes from Git..."
    git pull origin main || echo "⚠️  Could not pull from Git. Continuing..."
fi

# Build and start containers
if [ "$ENV" = "prod" ]; then
    echo "🏗️  Building and starting production containers..."
    docker compose -f docker-compose.prod.yml up -d --build
    echo "✅ Production deployment complete!"
    echo "🌐 Application is available at http://localhost"
else
    echo "🏗️  Building and starting development containers..."
    docker compose up -d --build
    echo "✅ Development deployment complete!"
    echo "🌐 Application is available at http://localhost:8080"
fi

# Show running containers
echo ""
echo "📊 Running containers:"
docker compose ps

# Show logs
echo ""
echo "📋 Recent logs (press Ctrl+C to exit):"
if [ "$ENV" = "prod" ]; then
    docker compose -f docker-compose.prod.yml logs --tail=50 -f
else
    docker compose logs --tail=50 -f
fi

