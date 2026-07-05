.PHONY: install dev build lint typecheck test backup restore clean

# ── Install dependencies ────────────────────────────────
install:
	npm install

# ── Run all services (Docker Compose) ───────────────────
dev:
	docker compose up --build -d
	@echo "Services started. Use 'make logs' to follow logs."

logs:
	docker compose logs -f

# ── Build all workspaces ────────────────────────────────
build:
	npm run build:frontend
	npm run build:backend

# ── Lint ────────────────────────────────────────────────
lint:
	npm run lint

# ── TypeScript type checking ────────────────────────────
typecheck:
	npm run typecheck

# ── Run tests ───────────────────────────────────────────
test:
	npm run test -w services/backend

test:watch:
	npm run test:watch -w services/backend

# ── Database backup ─────────────────────────────────────
backup:
	./scripts/backup.sh

# ── Database restore ────────────────────────────────────
restore:
	@test -n "$(BACKUP)" || (echo "Usage: make restore BACKUP=<path>"; exit 1)
	./scripts/restore.sh "$(BACKUP)"

# ── Clean build artifacts ───────────────────────────────
clean:
	rm -rf services/frontend/dist
	rm -rf services/backend/dist
	rm -rf node_modules
	rm -rf services/frontend/node_modules
	rm -rf services/backend/node_modules
	rm -rf *.tsbuildinfo
	@echo "Cleaned all builds, node_modules, and cache files."

# ── Docker management ───────────────────────────────────
down:
	docker compose down

ps:
	docker compose ps

prune:
	docker system prune -af --volumes
