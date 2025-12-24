#!/bin/bash

# BuildBrainOS Repository Structure Generator
# Creates only empty folders and placeholder files
# Usage: ./generate-buildbrainos.sh

set -e

BASE_DIR="buildbrainos"

echo "Creating BuildBrainOS repository structure..."

# Create base directory
mkdir -p "$BASE_DIR"

# Function to create empty file
create_empty_file() {
    local filepath="$1"
    echo "Creating: $filepath"
    mkdir -p "$(dirname "$filepath")"
    touch "$filepath"
}

# Function to create empty directory
create_empty_dir() {
    local dirpath="$1"
    echo "Creating directory: $dirpath"
    mkdir -p "$dirpath"
}

# Root files
create_empty_file "$BASE_DIR/.gitignore"
create_empty_file "$BASE_DIR/README.md"
create_empty_file "$BASE_DIR/Makefile"
create_empty_file "$BASE_DIR/docker-compose.yml"

# Client
## Mobile
create_empty_file "$BASE_DIR/client/mobile/app.json"
create_empty_file "$BASE_DIR/client/mobile/App.tsx"
create_empty_dir "$BASE_DIR/client/mobile/components"
create_empty_dir "$BASE_DIR/client/mobile/screens"
create_empty_file "$BASE_DIR/client/mobile/screens/Dashboard.tsx"
create_empty_dir "$BASE_DIR/client/mobile/screens/Projects"
create_empty_file "$BASE_DIR/client/mobile/screens/BlueprintViewer.tsx"
create_empty_file "$BASE_DIR/client/mobile/screens/SafetyInspection.tsx"
create_empty_file "$BASE_DIR/client/mobile/screens/BidMarketplace.tsx"
create_empty_dir "$BASE_DIR/client/mobile/lib/database"
create_empty_dir "$BASE_DIR/client/mobile/lib/location"
create_empty_dir "$BASE_DIR/client/mobile/lib/voice"
create_empty_dir "$BASE_DIR/client/mobile/assets"
create_empty_dir "$BASE_DIR/client/mobile/hooks"
create_empty_dir "$BASE_DIR/client/mobile/navigation"
create_empty_file "$BASE_DIR/client/mobile/services/api.ts"
create_empty_dir "$BASE_DIR/client/mobile/i18n"

## Web Mobile
create_empty_dir "$BASE_DIR/client/web-mobile/public"
create_empty_dir "$BASE_DIR/client/web-mobile/src/components"
create_empty_dir "$BASE_DIR/client/web-mobile/src/pages"
create_empty_dir "$BASE_DIR/client/web-mobile/src/hooks"
create_empty_file "$BASE_DIR/client/web-mobile/src/services/api.ts"
create_empty_dir "$BASE_DIR/client/web-mobile/src/i18n"
create_empty_file "$BASE_DIR/client/web-mobile/src/App.tsx"
create_empty_file "$BASE_DIR/client/web-mobile/vite.config.ts"

## Web Desktop
create_empty_dir "$BASE_DIR/client/web-desktop/public"
create_empty_dir "$BASE_DIR/client/web-desktop/src/components"
create_empty_dir "$BASE_DIR/client/web-desktop/src/pages"
create_empty_dir "$BASE_DIR/client/web-desktop/src/layout"
create_empty_file "$BASE_DIR/client/web-desktop/src/services/api.ts"
create_empty_dir "$BASE_DIR/client/web-desktop/src/i18n"
create_empty_file "$BASE_DIR/client/web-desktop/src/App.tsx"
create_empty_file "$BASE_DIR/client/web-desktop/next.config.js"

# Gateway
create_empty_file "$BASE_DIR/gateway/server.js"
create_empty_dir "$BASE_DIR/gateway/routes"
create_empty_file "$BASE_DIR/gateway/routes/auth.js"
create_empty_file "$BASE_DIR/gateway/routes/projects.js"
create_empty_file "$BASE_DIR/gateway/routes/agents.js"
create_empty_file "$BASE_DIR/gateway/middleware/auth.js"
create_empty_dir "$BASE_DIR/gateway/graphql"
create_empty_file "$BASE_DIR/gateway/graphql/schema.graphql"
create_empty_file "$BASE_DIR/gateway/docker-compose.yml"
create_empty_file "$BASE_DIR/gateway/Dockerfile"

# Services
## Auth Service
create_empty_dir "$BASE_DIR/services/auth-service/src/controllers"
create_empty_file "$BASE_DIR/services/auth-service/src/models/user.entity.ts"
create_empty_file "$BASE_DIR/services/auth-service/src/services/auth.service.ts"
create_empty_file "$BASE_DIR/services/auth-service/src/main.ts"
create_empty_file "$BASE_DIR/services/auth-service/package.json"
create_empty_file "$BASE_DIR/services/auth-service/Dockerfile"
create_empty_dir "$BASE_DIR/services/auth-service/k8s"
create_empty_file "$BASE_DIR/services/auth-service/k8s/deployment.yaml"

## User Service
create_empty_file "$BASE_DIR/services/user-service/src/controllers/user.controller.ts"
create_empty_file "$BASE_DIR/services/user-service/src/models/user.entity.ts"
create_empty_file "$BASE_DIR/services/user-service/Dockerfile"

## Project Service
create_empty_file "$BASE_DIR/services/project-service/src/controllers/project.controller.ts"
create_empty_file "$BASE_DIR/services/project-service/src/models/project.entity.ts"
create_empty_file "$BASE_DIR/services/project-service/Dockerfile"

## Document Service
create_empty_file "$BASE_DIR/services/document-service/src/controllers/document.controller.ts"
create_empty_file "$BASE_DIR/services/document-service/src/services/pdf.extractor.ts"
create_empty_file "$BASE_DIR/services/document-service/Dockerfile"

## Compliance Service
create_empty_file "$BASE_DIR/services/compliance-service/src/controllers/compliance.controller.ts"
create_empty_file "$BASE_DIR/services/compliance-service/src/services/ocr.validator.ts"
create_empty_file "$BASE_DIR/services/compliance-service/Dockerfile"

## Marketplace Service
create_empty_file "$BASE_DIR/services/marketplace-service/src/controllers/marketplace.controller.ts"
create_empty_file "$BASE_DIR/services/marketplace-service/src/models/bid.entity.ts"
create_empty_file "$BASE_DIR/services/marketplace-service/Dockerfile"

# payment Service
create_empty_file "$BASE_DIR/services/payment-service/src/controllers/payment.controller.ts"
create_empty_file "$BASE_DIR/services/payment-service/src/models/payment.entity.ts"
create_empty_file "$BASE_DIR/services/payment-service/Dockerfile"

## Notification Service
create_empty_file "$BASE_DIR/services/notification-service/src/services/twilio.service.ts"
create_empty_file "$BASE_DIR/services/notification-service/Dockerfile"

## Analytics Service
create_empty_file "$BASE_DIR/services/analytics-service/src/controllers/analytics.controller.ts"
create_empty_file "$BASE_DIR/services/analytics-service/Dockerfile"

## Shared Types
create_empty_dir "$BASE_DIR/services/shared-types/src/types"
create_empty_file "$BASE_DIR/services/shared-types/src/types/user.interface.ts"
create_empty_file "$BASE_DIR/services/shared-types/src/types/project.interface.ts"
create_empty_file "$BASE_DIR/services/shared-types/src/types/ai-agent.interface.ts"
create_empty_file "$BASE_DIR/services/shared-types/package.json"

# AI Agents
## Blueprint Agent
create_empty_file "$BASE_DIR/ai-agents/blueprint-agent/app.py"
create_empty_file "$BASE_DIR/ai-agents/blueprint-agent/models/blueprint_analyzer.py"
create_empty_file "$BASE_DIR/ai-agents/blueprint-agent/requirements.txt"
create_empty_file "$BASE_DIR/ai-agents/blueprint-agent/Dockerfile"

## Safety Agent
create_empty_file "$BASE_DIR/ai-agents/safety-agent/app.py"
create_empty_file "$BASE_DIR/ai-agents/safety-agent/models/safety_detector.py"
create_empty_file "$BASE_DIR/ai-agents/safety-agent/Dockerfile"

## Compliance OCR Agent
create_empty_file "$BASE_DIR/ai-agents/compliance-ocr-agent/app.py"
create_empty_file "$BASE_DIR/ai-agents/compliance-ocr-agent/models/coi_validator.py"
create_empty_file "$BASE_DIR/ai-agents/compliance-ocr-agent/Dockerfile"

## Bid Scraper Agent
create_empty_file "$BASE_DIR/ai-agents/bid-scraper-agent/scraper.py"
create_empty_file "$BASE_DIR/ai-agents/bid-scraper-agent/models/bid_matcher.py"
create_empty_file "$BASE_DIR/ai-agents/bid-scraper-agent/Dockerfile"

## Scheduler Agent
create_empty_file "$BASE_DIR/ai-agents/scheduler-agent/app.py"
create_empty_file "$BASE_DIR/ai-agents/scheduler-agent/models/scheduler.py"
create_empty_file "$BASE_DIR/ai-agents/scheduler-agent/Dockerfile"

# Orchestration
create_empty_dir "$BASE_DIR/orchestration/workflows"
create_empty_file "$BASE_DIR/orchestration/workflows/rfi_workflow.py"
create_empty_file "$BASE_DIR/orchestration/workflows/sub_onboarding.py"
create_empty_file "$BASE_DIR/orchestration/workflows/safety_alert.py"
create_empty_dir "$BASE_DIR/orchestration/activities"
create_empty_file "$BASE_DIR/orchestration/activities/send_sms.py"
create_empty_file "$BASE_DIR/orchestration/activities/validate_insurance.py"
create_empty_file "$BASE_DIR/orchestration/activities/extract_blueprint.py"
create_empty_file "$BASE_DIR/orchestration/docker-compose.yml"
create_empty_file "$BASE_DIR/orchestration/Dockerfile"

# Data Layer
## MongoDB
create_empty_file "$BASE_DIR/data/mongodb/schema.prisma"
create_empty_dir "$BASE_DIR/data/mongodb/migrations"
create_empty_file "$BASE_DIR/data/mongodb/seed.ts"

## Qdrant
create_empty_file "$BASE_DIR/data/qdrant/config.yaml"
create_empty_dir "$BASE_DIR/data/qdrant/collections"
create_empty_file "$BASE_DIR/data/qdrant/collections/buildbrain.yaml"

## Redis
create_empty_file "$BASE_DIR/data/redis.conf"

## Neo4j
create_empty_dir "$BASE_DIR/data/neo4j"
create_empty_file "$BASE_DIR/data/neo4j/constraints.cql"

# Infrastructure
## K8s
create_empty_dir "$BASE_DIR/infra/k8s"
create_empty_file "$BASE_DIR/infra/k8s/namespace.yaml"
create_empty_file "$BASE_DIR/infra/k8s/ingress.yaml"
create_empty_file "$BASE_DIR/infra/k8s/postgres-deployment.yaml"
create_empty_file "$BASE_DIR/infra/k8s/mongodb-statefulset.yaml"
create_empty_file "$BASE_DIR/infra/k8s/redis-deployment.yaml"
create_empty_file "$BASE_DIR/infra/k8s/kustomization.yaml"

## Docker
create_empty_dir "$BASE_DIR/infra/docker"
create_empty_file "$BASE_DIR/infra/docker/docker-compose.yml"

## Terraform
create_empty_dir "$BASE_DIR/infra/terraform"
create_empty_file "$BASE_DIR/infra/terraform/main.tf"
create_empty_file "$BASE_DIR/infra/terraform/variables.tf"
create_empty_file "$BASE_DIR/infra/terraform/eks-cluster.tf"

# Monitoring
create_empty_file "$BASE_DIR/monitoring/prometheus.yml"
create_empty_dir "$BASE_DIR/monitoring/grafana/dashboards"
create_empty_file "$BASE_DIR/monitoring/grafana/dashboards/buildbrain.json"
create_empty_dir "$BASE_DIR/monitoring/elasticsearch"
create_empty_file "$BASE_DIR/monitoring/elasticsearch/logstash.conf"
create_empty_file "$BASE_DIR/monitoring/sentry.config.js"

# Admin Dashboard
create_empty_dir "$BASE_DIR/admin-dashboard/src/pages"
create_empty_file "$BASE_DIR/admin-dashboard/src/pages/Users.tsx"
create_empty_file "$BASE_DIR/admin-dashboard/src/pages/Reports.tsx"
create_empty_file "$BASE_DIR/admin-dashboard/src/pages/Analytics.tsx"
create_empty_file "$BASE_DIR/admin-dashboard/src/pages/Settings.tsx"
create_empty_file "$BASE_DIR/admin-dashboard/src/services/adminApi.ts"
create_empty_dir "$BASE_DIR/admin-dashboard/src/layout"
create_empty_file "$BASE_DIR/admin-dashboard/Dockerfile"

# Tests
create_empty_dir "$BASE_DIR/tests/unit"
create_empty_file "$BASE_DIR/tests/unit/auth.test.ts"
create_empty_file "$BASE_DIR/tests/unit/project.test.ts"
create_empty_dir "$BASE_DIR/tests/integration"
create_empty_file "$BASE_DIR/tests/integration/match.integration.test.ts"
create_empty_dir "$BASE_DIR/tests/e2e"
create_empty_file "$BASE_DIR/tests/e2e/mobile.test.js"
create_empty_file "$BASE_DIR/tests/e2e/web.test.js"

# Scripts
create_empty_dir "$BASE_DIR/scripts"
create_empty_file "$BASE_DIR/scripts/deploy.sh"
create_empty_file "$BASE_DIR/scripts/migrate-db.js"
create_empty_file "$BASE_DIR/scripts/seed-ai-models.py"

echo "✅ BuildBrainOS repository structure created successfully!"
echo "Location: ./$BASE_DIR"
echo ""
echo "Total structure:"
tree -a "$BASE_DIR"