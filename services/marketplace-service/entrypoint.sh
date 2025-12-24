#!/bin/sh
set -e
if [ -f ./prisma/schema.prisma ]; then
  echo "Running prisma generate for marketplace-service"
  npx prisma generate --schema=prisma/schema.prisma || true
  if [ -n "$DATABASE_URL" ]; then
    echo "Deploying migrations for marketplace-service"
    npx prisma migrate deploy --schema=prisma/schema.prisma || true
  fi
fi

exec node dist/main.js
