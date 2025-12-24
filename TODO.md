# BuildBrainOS — Concise TODO Roadmap

Priority items to get an MVP working (mobile-first, core OS + marketplace + payments):

1. Core infra & local dev
   - Provision local Docker Compose (MongoDB, Redis, Qdrant, Gateway)
   - Configure env: `DATABASE_URL`, `QDRANT_URL`, `STRIPE_*`, `AUTH_*`
2. Data & auth
   - Wire Prisma to MongoDB, run initial migrations
   - Implement `auth-service` SSO + RBAC
3. Core services (MVP)
   - `project-service`: CRUD projects, drawings, phases
   - `document-service`: PDF ingestion + OCR → blueprint metadata
   - `compliance-service`: COI OCR + expiry checks
   - `payment-service`: Stripe Connect onboarding + payout flow (PayBrain)
4. Mobile apps
   - Basic Expo app with project list, check-in, photo upload
   - Offline sync (WatermelonDB) basic sync
5. AI agents (MVP agents)
   - `bid-scraper-agent`: daily scrape of public boards → opportunities
   - `blueprint-agent`: simple OCR + LLM extraction for specs
   - `compliance-ocr-agent`: COI expiry detection
6. Marketplace + matching
   - Private bid portal: GC upload → subs apply (DocuSign embed later)
   - AI matching: pre-qual matrix & push notifications
7. Payments & Fintech
   - Implement photo-based verification for PayBrain
   - Integrate Stripe Connect and payouts (staging)
8. Observability & CI
   - Add metrics, alerts, central logging
   - CI for services + agents (unit + lint)

Security & Compliance (ongoing)
 - Secrets management (Vault / AWS Secrets Manager)
 - SOC2 checklist for production

Milestones (90-day plan)
 - Week 1–2: Infra + Prisma schema + auth-service
 - Week 3–6: document-service + blueprint ingestion prototype
 - Week 7–12: mobile basic app + bid-scraper + marketplace MVP
