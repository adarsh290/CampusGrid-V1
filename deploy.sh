#!/bin/bash

# CampusGrid-V1 Deployment Script for Fedora
echo "🚀 Starting CampusGrid-V1 Deployment..."

# 1. Ensure storage directory exists
echo "📁 Setting up storage directory..."
mkdir -p storage
touch storage/test.txt
echo "This is a test file for CampusGrid" > storage/test.txt

# 2. Check for Docker
if ! [ -x "$(command -v docker)" ]; then
  echo "❌ Error: Docker is not installed. Please install it with: sudo dnf install docker"
  exit 1
fi

# 3. Configure Firewall for Fedora
echo "🛡️ Configuring Fedora Firewall (Port 8080)..."
sudo firewall-cmd --permanent --add-port=8080/tcp > /dev/null 2>&1
sudo firewall-cmd --reload > /dev/null 2>&1

# 4. Start the Application
echo "📦 Building and starting containers..."

# Determine which docker compose command to use
if docker compose version > /dev/null 2>&1; then
  DOCKER_COMPOSE="docker compose"
elif docker-compose version > /dev/null 2>&1; then
  DOCKER_COMPOSE="docker-compose"
else
  echo "❌ Error: Neither 'docker compose' nor 'docker-compose' was found."
  exit 1
fi

if ! $DOCKER_COMPOSE up --build -d; then
  echo "❌ Error: Docker Compose failed to start."
  echo "🔍 Let's check the container status and logs to see what happened:"
  $DOCKER_COMPOSE ps
  $DOCKER_COMPOSE logs --tail=20
  exit 1
fi

echo "⏳ Waiting for database and backend to initialize..."
# Wait for backend to be healthy
for i in {1..30}; do
  if $DOCKER_COMPOSE ps | grep -q "healthy"; then
    echo "✅ Backend is healthy!"
    break
  fi
  echo -n "."
  sleep 2
  if [ $i -eq 30 ]; then
    echo "⚠️ Warning: Backend is taking a long time to start. Checking logs..."
    $DOCKER_COMPOSE logs backend | tail -n 20
  fi
done

# 5. Seed initial data
echo "🌱 Seeding initial database data..."
$DOCKER_COMPOSE exec backend node dist/backend/scripts/seed.js

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "🌐 Your website should be live at:"
hostname -I | tr ' ' '\n' | grep -v '^$' | while read ip; do
  echo "   👉 http://$ip:8080"
done
echo ""
echo "📂 Put your game files in the 'storage' folder in this directory."
echo "📝 Note: If you can't connect, try running: sudo setenforce 0 (to test if SELinux is blocking)"
