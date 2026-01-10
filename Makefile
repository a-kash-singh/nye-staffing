.PHONY: help up down restart logs build rebuild dev dev-down ps shell-backend shell-db create-admin clean

help: ## Show this help message
	@echo "NYE Staffing Platform - Docker Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

up: ## Start all services (production)
	docker compose up -d
	@echo "✅ Services started! Frontend: http://localhost, Backend: http://localhost:3000"

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose restart

logs: ## View logs from all services
	docker compose logs -f

build: ## Build containers
	docker compose build

rebuild: ## Rebuild containers from scratch
	docker compose down
	docker compose build --no-cache
	docker compose up -d

dev: ## Start in development mode
	docker compose -f docker-compose.dev.yml up -d
	@echo "✅ Services started! Frontend: http://localhost:3001, Backend: http://localhost:3000"

dev-down: ## Stop development services
	docker compose -f docker-compose.dev.yml down

ps: ## Show running containers
	docker compose ps

shell-backend: ## Open shell in backend container
	docker compose exec backend sh

shell-db: ## Open PostgreSQL shell
	docker compose exec db psql -U postgres -d nye_staffing

create-admin: ## Create default admin user
	@docker compose exec backend node -e "const axios = require('axios'); axios.post('http://localhost:3000/api/auth/register', { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' }).then(r => console.log('✅ Admin created:', r.data.user.email)).catch(e => console.error('❌ Error:', e.response?.data?.error || e.message));"

clean: ## Remove all containers and volumes (WARNING: deletes data)
	@echo "⚠️  This will remove all containers, volumes, and data!"
	@read -p "Are you sure? (yes/no): " confirm && [ "$$confirm" = "yes" ] || exit 1
	docker compose down -v
	docker compose -f docker-compose.dev.yml down -v
	@echo "✅ Cleaned up!"
