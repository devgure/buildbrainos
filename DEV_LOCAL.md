# Local Development Quickstart (BuildBrainOS)

This document describes how to run tests and the full local dev stack, including Prisma migrations and troubleshooting tips.

Prerequisites
- Docker Desktop (with WSL2 backend on Windows)
- Node.js (v18+) and npm (optional if using containers)
- Python 3.11 (for AI agents tests)

Payment-service tests (Node/Jest)

1. Install deps and run tests:

```powershell
cd services/payment-service
npm install
npm test
```

Note: tests mock the Prisma client so they run without a DB.

Blueprint-agent tests (Python/pytest)

```powershell
cd ai-agents/blueprint-agent
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m pytest -q
```

Run full local dev stack (includes local Mongo for Prisma)

```powershell
# from repo root
# builds and starts services using local mongo override
make dev-local
```

This will:
- Start services defined in `infra/docker/docker-compose.yml` plus `infra/docker/docker-compose.override.yml` (which contains a `mongo` service)
- Exec into the `payment-service` container and run `npm install`, `npx prisma generate` and `npx prisma migrate deploy` (if migrations present)

If you don't have `npm` locally, the Makefile `dev-local` target runs install and migrations inside the container.

Testing webhooks locally

- Start `payment-service` (via the compose stack) and POST to the test endpoint (no signature required):

```powershell
curl -X POST http://localhost:5001/webhook-test -H "Content-Type: application/json" -d "{\"type\":\"payment_intent.succeeded\",\"data\":{\"object\":{\"id\":\"pi_mock\",\"amount\":1000,\"currency\":\"usd\",\"status\":\"succeeded\"}},\"account\":null}"
```

Troubleshooting

- Docker CLI not found: ensure Docker Desktop is installed and that `docker`/`docker compose` are available in PATH. Restart terminal after install.
- Port conflicts: check with `Get-NetTCPConnection -LocalPort <port>` on PowerShell.
- Prisma errors/migrations: ensure `DATABASE_URL` points to `mongodb://mongo:27017/buildbrain` when using the compose override, or set your own DB and run migrations locally.
- npm missing: `dev-local` runs `npm` inside the container so you don't need it locally.

CI

A GitHub Actions workflow has been added at `.github/workflows/ci.yml` to run:
- `services/payment-service` tests with Node/Jest
- `ai-agents/blueprint-agent` tests with Python/pytest

If you'd like, I can extend CI to build Docker images or run integration tests.
