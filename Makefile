# Minimal Makefile for local dev
.PHONY: dev up build lint

dev:
	@echo "Start local dev services via docker-compose"
	@echo "Starting root docker-compose (build & detach)"
	docker compose up --build -d
	@echo "Waiting for services to become healthy..."
	./scripts/wait-for-services.sh || true

up:
	cd infra/docker && docker-compose up -d

build:
	docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml build

dev-local:
	@echo "Build and start local dev stack with local Mongo and run Prisma migrations for payment-service"
	docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml up -d --build
	docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml exec payment-service sh -c "npm install --no-audit --no-fund || true && npx prisma generate || true && npx prisma migrate deploy || true"


lint:
	echo "Add linter steps"
