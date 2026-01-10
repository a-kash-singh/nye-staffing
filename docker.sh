#!/bin/bash

# NYE Staffing Docker Helper Script

set -e

COMMAND=${1:-help}

case "$COMMAND" in
  up)
    echo "Starting NYE Staffing platform..."
    docker compose up -d
    echo "Services started! Frontend: http://localhost, Backend: http://localhost:3000"
    ;;
  down)
    echo "Stopping NYE Staffing platform..."
    docker compose down
    ;;
  restart)
    echo "Restarting NYE Staffing platform..."
    docker compose restart
    ;;
  logs)
    SERVICE=${2:-}
    if [ -z "$SERVICE" ]; then
      docker compose logs -f
    else
      docker compose logs -f "$SERVICE"
    fi
    ;;
  build)
    echo "Building containers..."
    docker compose build
    ;;
  rebuild)
    echo "Rebuilding containers..."
    docker compose down
    docker compose build --no-cache
    docker compose up -d
    ;;
  dev)
    echo "Starting in development mode..."
    docker compose -f docker-compose.dev.yml up -d
    echo "Services started! Frontend: http://localhost:3001, Backend: http://localhost:3000"
    ;;
  dev-down)
    echo "Stopping development services..."
    docker compose -f docker-compose.dev.yml down
    ;;
  ps)
    docker compose ps
    ;;
  shell-backend)
    docker compose exec backend sh
    ;;
  shell-db)
    docker compose exec db psql -U postgres -d nye_staffing
    ;;
  create-admin)
    echo "Creating admin user..."
    docker compose exec backend node -e "
    const axios = require('axios');
    axios.post('http://localhost:3000/api/auth/register', {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    }).then(r => console.log('✅ Admin created:', r.data.user.email)).catch(e => console.error('❌ Error:', e.response?.data?.error || e.message));
    "
    ;;
  clean)
    echo "⚠️  This will remove all containers, volumes, and data!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      docker compose down -v
      docker compose -f docker-compose.dev.yml down -v
      echo "✅ Cleaned up!"
    else
      echo "Cancelled."
    fi
    ;;
  help|*)
    echo "NYE Staffing Docker Helper"
    echo ""
    echo "Usage: ./docker.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up              Start all services (production)"
    echo "  down            Stop all services"
    echo "  restart         Restart all services"
    echo "  logs [service]  View logs (all or specific service)"
    echo "  build           Build containers"
    echo "  rebuild         Rebuild containers from scratch"
    echo "  dev             Start in development mode"
    echo "  dev-down        Stop development services"
    echo "  ps              Show running containers"
    echo "  shell-backend   Open shell in backend container"
    echo "  shell-db        Open PostgreSQL shell"
    echo "  create-admin    Create default admin user"
    echo "  clean           Remove all containers and volumes"
    echo "  help            Show this help message"
    ;;
esac
