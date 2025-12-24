# BuildBrainOS — AI Co-Pilot for Construction (Scaffold)

This repository contains a full-stack scaffold for BuildBrain: an AI-driven construction operations platform (blueprints, compliance, bidding, payments, safety).

This scaffold provides directory layout, CI, license, a concise TODO list, development/prod notes, and a full Prisma MongoDB schema for initial development.

Quick start (local scaffold creation):

1. Generate placeholder structure (if you haven't already):

```bash
bash buildbrainos_create_structure.sh
```

2. Start local dev stack (example):

```bash
cd infra/docker
docker-compose up --build
```

3. See `TODO.md` for high-level milestones and next steps.

Files added/updated by this commit:
- `README.md`, `TODO.md`, `LICENSE`, `CODEOWNERS`, `.github/workflows/ci.yml`
- `DEV_PROD.md` (development & production notes)
- `data/mongodb/schema.prisma` and `services/payment-service/prisma/schema.prisma` (full Prisma schemas)

Next steps: wire up environment variables, provision dev infra, run Prisma migrations, and implement service endpoints.
