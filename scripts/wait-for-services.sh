#!/usr/bin/env bash
# Simple health-check loop for local services
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
echo "Waiting for gateway (http://localhost:3000/health) ..."
for i in {1..30}; do
  if curl -sS http://localhost:3000/health >/dev/null 2>&1; then
    echo "gateway ready"
    break
  fi
  sleep 2
done

echo "Waiting for auth-service (http://localhost:4001/health) ..."
for i in {1..30}; do
  if curl -sS http://localhost:4001/health >/dev/null 2>&1; then
    echo "auth ready"
    break
  fi
  sleep 2
done

echo "Waiting for payment-service (http://localhost:5001/health) ..."
for i in {1..30}; do
  if curl -sS http://localhost:5001/health >/dev/null 2>&1; then
    echo "payment ready"
    break
  fi
  sleep 2
done

echo "Waiting for user-service (http://localhost:4002/health) ..."
for i in {1..30}; do
  if curl -sS http://localhost:4002/health >/dev/null 2>&1; then
    echo "user-service ready"
    break
  fi
  sleep 2
done

echo "Waiting for marketplace-service (http://localhost:4006/health) ..."
for i in {1..30}; do
  if curl -sS http://localhost:4006/health >/dev/null 2>&1; then
    echo "marketplace ready"
    break
  fi
  sleep 2
done

echo "Waiting for mongo (tcp://localhost:27017) ..."
for i in {1..30}; do
  if bash -c "</dev/tcp/localhost/27017" >/dev/null 2>&1; then
    echo "mongo ready"
    break
  fi
  sleep 2
done

echo "All checks attempted. If services are still starting, give them a moment and re-check logs."
