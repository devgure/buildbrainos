This folder is a placeholder for Prisma migration artifacts.

To create migrations locally:

1. Ensure `DATABASE_URL` points to a running MongoDB (e.g. mongodb://localhost:27017/buildbraindb)
2. From a service folder (e.g. `services/user-service`) run:
   ```bash
   npx prisma generate --schema=prisma/schema.prisma
   npx prisma migrate dev --schema=prisma/schema.prisma --name init
   ```

In CI/production run:
  npx prisma migrate deploy --schema=prisma/schema.prisma

The repo intentionally does not include generated client files or binary migration state to avoid platform-specific artifacts.
