# Development & Production Boilerplate Notes

This file lists recommended dev/prod stack, environment variables, and quick commands.

Tech stack (dev & prod):
- Frontend: React (Next.js for admin), React Native + Expo for mobile
- Backend: NestJS (TypeScript) microservices for core business logic
- AI Agents: Python (FastAPI) for LLM/vision agents
- Datastore: MongoDB (Prisma), Redis (cache), Qdrant (vector DB)
- Orchestration: Docker Compose for local dev, Kubernetes (EKS) for prod
- CI/CD: GitHub Actions → ECR / Docker registry → EKS

Env variables (minimum):
- `DATABASE_URL` (MongoDB connection)
- `QDRANT_URL`
- `REDIS_URL`
- `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`
- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`

Local dev quick commands:

```bash
# create scaffold (if missing)
bash buildbrainos_create_structure.sh

# start local services (example)
cd infra/docker
docker-compose up --build -d

# run a single service (example)
cd services/document-service
npm install
npm run dev
```

Production deploy (summary):
1. Build container images for each service.
2. Push images to container registry.
3. Apply Kubernetes manifests in `infra/k8s` (or use Terraform/EKS module).
4. Run a migration job for Prisma and any DB schema changes.
