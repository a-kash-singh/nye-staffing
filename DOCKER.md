# Docker Setup Guide

This guide explains how to run the NYE Staffing platform using Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### Production Mode

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your configuration (especially `JWT_SECRET` and database password)

3. **Start all services:**
   ```bash
   docker compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost (or http://localhost:80)
   - Backend API: http://localhost:3000
   - Database: localhost:5432

### Development Mode

1. **Start in development mode:**
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Database: localhost:5432

## Services

### Database (PostgreSQL)
- **Container:** `nye-staffing-db`
- **Port:** 5432
- **Data:** Persisted in `postgres_data` volume
- **Initialization:** Automatically runs `database/schema.sql` on first start

### Backend API
- **Container:** `nye-staffing-backend`
- **Port:** 3000
- **Health Check:** http://localhost:3000/health
- **Uploads:** Persisted in `backend_uploads` volume

### Frontend (Nginx)
- **Container:** `nye-staffing-frontend`
- **Port:** 80 (production) or 3001 (development)
- **Proxy:** Automatically proxies `/api` requests to backend

## Useful Commands

### View logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Stop services
```bash
docker compose down
```

### Stop and remove volumes (⚠️ deletes data)
```bash
docker compose down -v
```

### Rebuild containers
```bash
docker compose build
docker compose up -d
```

### Execute commands in containers
```bash
# Backend shell
docker compose exec backend sh

# Database shell
docker compose exec db psql -U postgres -d nye_staffing

# Run migrations (if needed)
docker compose exec backend node database/migrate.js
```

### Check service status
```bash
docker compose ps
```

## Environment Variables

Key environment variables (set in `.env` file):

- `DB_PASSWORD` - PostgreSQL password (change from default!)
- `JWT_SECRET` - Secret key for JWT tokens (change from default!)
- `FRONTEND_PORT` - Port for frontend (default: 80)
- `BACKEND_PORT` - Port for backend (default: 3000)
- `DB_PORT` - Port for database (default: 5432)

## Troubleshooting

### Database connection issues
```bash
# Check if database is healthy
docker compose ps db

# View database logs
docker compose logs db

# Test connection
docker compose exec db psql -U postgres -d nye_staffing -c "SELECT 1;"
```

### Backend not starting
```bash
# Check backend logs
docker compose logs backend

# Verify environment variables
docker compose exec backend env | grep DB_
```

### Frontend not loading
```bash
# Check frontend logs
docker compose logs frontend

# Verify nginx configuration
docker compose exec frontend nginx -t
```

### Reset everything
```bash
# Stop and remove everything including volumes
docker compose down -v

# Remove images
docker compose rm -f

# Rebuild and start
docker compose build
docker compose up -d
```

## Creating First Admin User

After starting the services, create an admin user:

```bash
docker compose exec backend node -e "
const axios = require('axios');
axios.post('http://localhost:3000/api/auth/register', {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'password123',
  role: 'admin'
}).then(r => console.log('Admin created:', r.data)).catch(e => console.error('Error:', e.response?.data || e.message));
"
```

Or use curl:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

## Production Considerations

1. **Change default passwords** in `.env` file
2. **Set strong JWT_SECRET**
3. **Use HTTPS** (set up reverse proxy like Traefik or Nginx)
4. **Enable database backups**
5. **Set resource limits** in docker-compose.yml
6. **Use secrets management** for sensitive data
7. **Enable logging** to external service
8. **Set up monitoring** (Prometheus, Grafana, etc.)

## Volume Management

Data is persisted in Docker volumes:
- `postgres_data` - Database files
- `backend_uploads` - Uploaded files (profile photos, etc.)

To backup:
```bash
docker run --rm -v nye-staffing_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

To restore:
```bash
docker run --rm -v nye-staffing_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /
```
